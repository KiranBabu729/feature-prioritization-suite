import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

// Short-lived — `ant auth print-credentials` mints/refreshes the underlying
// token itself, so re-fetching this often is cheap and keeps us well ahead
// of expiry without needing our own refresh scheduler.
const TOKEN_TTL_MS = 4 * 60 * 1000;

let cachedToken = null;
let cachedAt = 0;

export async function getAccessToken() {
  const now = Date.now();
  if (cachedToken && now - cachedAt < TOKEN_TTL_MS) {
    return cachedToken;
  }

  let stdout;
  try {
    ({ stdout } = await execFileAsync("ant", ["auth", "print-credentials", "--access-token"]));
  } catch (err) {
    throw new Error(
      "Could not get an OAuth access token from the `ant` CLI. Run `ant auth login` first. " +
        `(${err.message})`,
    );
  }

  const token = stdout.trim();
  if (!token) {
    throw new Error("`ant auth print-credentials` returned an empty token. Run `ant auth login`.");
  }

  cachedToken = token;
  cachedAt = now;
  return token;
}

export function invalidateAccessToken() {
  cachedToken = null;
  cachedAt = 0;
}

// Required alongside an OAuth Authorization header — some endpoints
// (including /v1/messages) reject Bearer auth without it.
export const OAUTH_BETA_HEADER = "oauth-2025-04-20";
