import { writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { snapshotIsCurrent } from "./public-freshness.mjs";

const destination=new URL("../src/generated/public-data.json",import.meta.url);
const source="https://kslosmem.manus.space/api/public/static-site-snapshot.json";
const timeoutMs=15*60_000;
const startedAt=Date.now();
let attempt=0;

while (Date.now()-startedAt<timeoutMs) {
  attempt++;
  const now=Date.now();
  try {
    // Force a fresh export after the Manus refresh, not a pre-refresh CDN hit.
    // curl is the transport proven to reach this Manus export from GitHub Actions.
    const raw=execFileSync("curl",[
      "--fail","--silent","--show-error","--connect-timeout","15","--max-time","45",
      "--header","Cache-Control: no-cache",`${source}?build=${now}-${attempt}`,
    ],{encoding:"utf8",timeout:50_000,stdio:["ignore","pipe","pipe"]});
    const data=JSON.parse(raw);
    if (snapshotIsCurrent(data,now) && typeof data.generatedAt==="number" &&
        Math.abs(data.generatedAt-now)<120_000) {
      await writeFile(destination,JSON.stringify(data),{mode:0o600});
      console.log(`Current HKT refresh-window snapshot confirmed after ${attempt} attempt(s).`);
      process.exit(0);
    }
    console.log(`Waiting for current HKT refresh-window snapshot (attempt ${attempt}).`);
  } catch {
    // Never print a private source URL, response body or student data.
    console.log(`Public snapshot fetch unavailable (attempt ${attempt}); retrying.`);
  }
  await new Promise(resolve=>setTimeout(resolve,20_000));
}
console.error("No complete current HKT refresh-window snapshot after 15 minutes; keeping the previous public Pages deployment.");
process.exit(1);
