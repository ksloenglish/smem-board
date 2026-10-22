export const MANUS_REFRESH_RECOVERY_AUDIENCE = "https://kslosmem.manus.space/github-pages-refresh-recovery";

export function shouldRequestManusRecovery({ eventName, attemptedRecovery, recoveryUrl, oidcRequestUrl, oidcRequestToken }) {
  return eventName === "schedule" && !attemptedRecovery && Boolean(recoveryUrl && oidcRequestUrl && oidcRequestToken);
}

function oidcUrlWithAudience(oidcRequestUrl) {
  const separator = oidcRequestUrl.includes("?") ? "&" : "?";
  return `${oidcRequestUrl}${separator}audience=${encodeURIComponent(MANUS_REFRESH_RECOVERY_AUDIENCE)}`;
}

/**
 * Exchanges no long-lived secret: GitHub emits a short-lived, claim-scoped ID
 * token for this one scheduled job, and Manus verifies it against GitHub JWKS.
 */
export async function requestManusRecovery({ recoveryUrl, oidcRequestUrl, oidcRequestToken, fetchImplementation = fetch }) {
  try {
    const identityResponse = await fetchImplementation(oidcUrlWithAudience(oidcRequestUrl), {
      headers: { authorization: `Bearer ${oidcRequestToken}` },
    });
    if (!identityResponse.ok) return "unavailable";
    const identity = await identityResponse.json();
    if (typeof identity?.value !== "string" || !identity.value) return "unavailable";

    const recoveryResponse = await fetchImplementation(recoveryUrl, {
      method: "POST",
      headers: {
        authorization: `Bearer ${identity.value}`,
        accept: "application/json",
      },
    });
    return recoveryResponse.ok ? "recovered" : "unavailable";
  } catch {
    return "unavailable";
  }
}
