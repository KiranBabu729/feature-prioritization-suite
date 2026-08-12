import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { anthropic } from "./anthropicClient.js";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { getAccessToken, invalidateAccessToken, OAUTH_BETA_HEADER } from "./auth.js";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5";

function buildScoreSchema(factors) {
  const scoreFields = {};
  for (const factor of factors) {
    scoreFields[factor.id] = z
      .number()
      .min(0)
      .max(10)
      .describe(`Score for "${factor.name}": ${factor.description}`);
  }
  return z.object({
    scores: z.object(scoreFields),
    rationale: z.string().max(400).describe("One or two sentences justifying the scores"),
  });
}

async function callModel(params) {
  const accessToken = await getAccessToken();
  return anthropic.beta.messages.parse(params, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "anthropic-beta": OAUTH_BETA_HEADER,
    },
  });
}

// Scores one feedback item against the PDL's currently defined weighted
// factors. Only factors with source "ai" should be passed in — manual
// factors are scored by the PDL directly in the UI, not the model.
export async function scoreFeedbackItem({ item, factors }) {
  if (factors.length === 0) {
    return { scores: {}, rationale: "No AI-scored factors configured." };
  }

  const schema = buildScoreSchema(factors);
  const factorList = factors
    .map((f) => `- ${f.id} ("${f.name}"): ${f.description}`)
    .join("\n");

  const params = {
    model: MODEL,
    max_tokens: 1024,
    thinking: { type: "disabled" },
    output_format: betaZodOutputFormat(schema),
    system:
      "You are a product delivery lead's scoring assistant. Score customer feedback " +
      "against the given factors on a 0-10 scale (0 = not at all relevant/urgent, " +
      "10 = extremely relevant/urgent). Base scores only on the feedback text and " +
      "client context provided below — do not invent facts not present in the input.",
    messages: [
      {
        role: "user",
        content:
          `Client: ${item.clientName} (${item.clientTier})\n` +
          `Feature/feedback: "${item.name}"\n` +
          `Feedback text: "${item.feedbackText}"\n\n` +
          `Score this feedback against each factor:\n${factorList}`,
      },
    ],
  };

  let response;
  try {
    response = await callModel(params);
  } catch (err) {
    // Cached token may have expired mid-session — fetch a fresh one and
    // retry exactly once before giving up.
    if (err instanceof Anthropic.AuthenticationError) {
      invalidateAccessToken();
      response = await callModel(params);
    } else {
      throw err;
    }
  }

  if (response.parsed_output == null) {
    throw new Error(
      `Model did not return parseable output (stop_reason: ${response.stop_reason})`,
    );
  }
  return response.parsed_output;
}
