import Anthropic from "@anthropic-ai/sdk";

// Auth is personal, via `ant auth login` — see auth.js, which fetches a
// fresh OAuth bearer token per request. apiKey/authToken are explicitly
// nulled here so a leftover blank ANTHROPIC_API_KEY in .env can never
// silently shadow the OAuth token (an empty string is falsy but not
// null, so the SDK's own env-var default would otherwise pick it up).
export const anthropic = new Anthropic({ apiKey: null, authToken: null });
