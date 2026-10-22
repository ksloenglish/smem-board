import { pathToFileURL } from "node:url";
import { requestManusRecovery } from "./public-snapshot-recovery.mjs";
import { snapshotIsCurrent } from "./public-freshness.mjs";

const SNAPSHOT_URL = "https://kslosmem.manus.space/api/public/static-site-snapshot.json";
const PAGES_DISPATCH_URL = "https://api.github.com/repos/ksloenglish/smem-board/actions/workflows/deploy.yml/dispatches";
const RECOVERY_WAIT_ATTEMPTS = 18;
const RECOVERY_WAIT_MS = 10_000;

export async function readPublicSnapshot(fetchImplementation = fetch) {
  const response = await fetchImplementation(SNAPSHOT_URL, {
    headers: { "cache-control": "no-cache" },
  });
  if (!response.ok) return null;
  return response.json();
}

export async function dispatchPagesBuild(githubToken, fetchImplementation = fetch) {
  const response = await fetchImplementation(PAGES_DISPATCH_URL, {
    method: "POST",
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${githubToken}`,
      "content-type": "application/json",
      "x-github-api-version": "2026-03-10",
    },
    body: JSON.stringify({ ref: "main" }),
  });
  return response.ok;
}

export async function recoverAndDispatch({
  fetchImplementation = fetch,
  now = () => Date.now(),
  sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)),
  recoveryUrl = process.env.MANUS_REFRESH_RECOVERY_URL ?? "",
  oidcRequestUrl = process.env.ACTIONS_ID_TOKEN_REQUEST_URL ?? "",
  oidcRequestToken = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN ?? "",
  githubToken = process.env.GITHUB_TOKEN ?? "",
} = {}) {
  const initial = await readPublicSnapshot(fetchImplementation);
  if (initial && snapshotIsCurrent(initial, now())) return "already-current";

  const recovery = await requestManusRecovery({
    recoveryUrl,
    oidcRequestUrl,
    oidcRequestToken,
    fetchImplementation,
  });
  if (recovery !== "recovered") return "recovery-unavailable";

  for (let attempt = 0; attempt < RECOVERY_WAIT_ATTEMPTS; attempt += 1) {
    await sleep(RECOVERY_WAIT_MS);
    const snapshot = await readPublicSnapshot(fetchImplementation);
    if (snapshot && snapshotIsCurrent(snapshot, now())) {
      return githubToken && await dispatchPagesBuild(githubToken, fetchImplementation)
        ? "dispatched"
        : "dispatch-unavailable";
    }
  }
  return "snapshot-still-stale";
}

async function main() {
  const result = await recoverAndDispatch();
  if (result === "already-current") {
    console.log("Public snapshot is already current; no recovery is needed.");
    return;
  }
  if (result === "dispatched") {
    console.log("Recovered a stale public snapshot and started the normal Pages deployment.");
    return;
  }
  console.error(`Public snapshot recovery did not complete: ${result}.`);
  process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main();
}
