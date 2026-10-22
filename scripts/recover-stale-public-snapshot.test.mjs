import { readFile } from "node:fs/promises";
import { describe, expect, it, vi } from "vitest";
import { recoverAndDispatch } from "./recover-stale-public-snapshot.mjs";

const now = Date.parse("2026-10-01T12:30:00Z");
const snapshot = fetchedAt => ({
  leaderboard: {
    meta: { s6Visible: true },
    boards: [1, 2, 3, 4, 5, 6].map(form => ({ boardKey: `monthly-${form}`, fetchedAt }))
      .concat([{ boardKey: "annual", fetchedAt }, { boardKey: "wordsmith", fetchedAt }]),
  },
});
const response = data => ({ ok: true, json: async () => data });

describe("independent GitHub scheduled snapshot recovery", () => {
  const oidc = {
    recoveryUrl: "https://example.invalid/api/github-pages/refresh-recovery",
    oidcRequestUrl: "https://token.actions.example?id=1",
    oidcRequestToken: "oidc-request-token",
    githubToken: "github-job-token",
  };

  it("does nothing when the public snapshot is already current", async () => {
    const fetchImplementation = vi.fn().mockResolvedValue(response(snapshot(now)));
    await expect(recoverAndDispatch({ ...oidc, fetchImplementation, now: () => now })).resolves.toBe("already-current");
    expect(fetchImplementation).toHaveBeenCalledTimes(1);
  });

  it("uses short-lived OIDC recovery once, waits for freshness, then dispatches Pages", async () => {
    const fetchImplementation = vi.fn()
      .mockResolvedValueOnce(response(snapshot(now - 12 * 60 * 60 * 1000)))
      .mockResolvedValueOnce(response({ value: "signed-oidc-token" }))
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce(response(snapshot(now)))
      .mockResolvedValueOnce({ ok: true });
    await expect(recoverAndDispatch({
      ...oidc,
      fetchImplementation,
      now: () => now,
      sleep: vi.fn().mockResolvedValue(undefined),
    })).resolves.toBe("dispatched");
    expect(fetchImplementation).toHaveBeenCalledTimes(5);
    expect(fetchImplementation.mock.calls[2][1]).toEqual(expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({ authorization: "Bearer signed-oidc-token" }),
    }));
    expect(fetchImplementation.mock.calls[4][1]).toEqual(expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({ authorization: "Bearer github-job-token" }),
    }));
  });

  it("does not dispatch Pages when recovery cannot authenticate or complete", async () => {
    const fetchImplementation = vi.fn()
      .mockResolvedValueOnce(response(snapshot(now - 12 * 60 * 60 * 1000)))
      .mockResolvedValueOnce({ ok: false });
    await expect(recoverAndDispatch({ ...oidc, fetchImplementation, now: () => now })).resolves.toBe("recovery-unavailable");
    expect(fetchImplementation).toHaveBeenCalledTimes(2);
  });

  it("schedules bounded HKT recovery checks and uses only the job token plus OIDC", async () => {
    const workflow = await readFile(new URL("../.github/workflows/refresh-recovery.yml", import.meta.url), "utf8");
    expect(workflow).toMatch(/cron:\s*["']20,35,50 0,12 \* \* \*["']/);
    expect(workflow).toContain("actions: write");
    expect(workflow).toContain("id-token: write");
    expect(workflow).toContain("secrets.GITHUB_TOKEN");
    expect(workflow).not.toContain("MANUS_REFRESH_RECOVERY_TOKEN");
  });
});
