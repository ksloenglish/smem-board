import { readFile } from "node:fs/promises";
import { describe, expect, it, vi } from "vitest";
import {
  MANUS_REFRESH_RECOVERY_AUDIENCE,
  requestManusRecovery,
  shouldRequestManusRecovery,
} from "./public-snapshot-recovery.mjs";

describe("scheduled Pages stale-snapshot recovery", () => {
  const configured = {
    eventName: "schedule",
    attemptedRecovery: false,
    recoveryUrl: "https://example.invalid/api/github-pages/refresh-recovery",
    oidcRequestUrl: "https://token.actions.example?id=1",
    oidcRequestToken: "one-time-request-token",
  };

  it("only permits one configured recovery request from a scheduled workflow", () => {
    expect(shouldRequestManusRecovery(configured)).toBe(true);
    expect(shouldRequestManusRecovery({ ...configured, attemptedRecovery: true })).toBe(false);
    expect(shouldRequestManusRecovery({ ...configured, eventName: "workflow_dispatch" })).toBe(false);
    expect(shouldRequestManusRecovery({ ...configured, oidcRequestToken: "" })).toBe(false);
  });

  it("obtains a short-lived OIDC token for the fixed audience before the recovery POST", async () => {
    const fetchImplementation = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ value: "signed-oidc-token" }) })
      .mockResolvedValueOnce({ ok: true });
    await expect(requestManusRecovery({ ...configured, fetchImplementation })).resolves.toBe("recovered");
    expect(fetchImplementation).toHaveBeenNthCalledWith(1,
      `https://token.actions.example?id=1&audience=${encodeURIComponent(MANUS_REFRESH_RECOVERY_AUDIENCE)}`,
      expect.objectContaining({ headers: { authorization: "Bearer one-time-request-token" } })
    );
    expect(fetchImplementation).toHaveBeenNthCalledWith(2, configured.recoveryUrl, expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({ authorization: "Bearer signed-oidc-token" }),
    }));
  });

  it("uses the valid five-field UTC fallback schedule for 08:08 and 20:08 HKT", async () => {
    const workflow = await readFile(new URL("../.github/workflows/deploy.yml", import.meta.url), "utf8");
    expect(workflow).toMatch(/cron:\s*["']8 0,12 \* \* \*["']/);
    expect(workflow).not.toMatch(/cron:\s*["']0 8 0,12 \* \* \*["']/);
    expect(workflow).not.toContain("MANUS_REFRESH_RECOVERY_TOKEN");
  });
});
