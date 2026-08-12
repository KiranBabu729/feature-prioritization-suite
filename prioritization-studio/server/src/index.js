import "dotenv/config";
import express from "express";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";
import { scoreFeedbackItem } from "./scoring.js";
import { runBatch } from "./batch.js";
import { getAccessToken } from "./auth.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, model: process.env.ANTHROPIC_MODEL || "claude-opus-5" });
});

app.post("/api/score-batch", async (req, res) => {
  const { items, factors, concurrency } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "items must be a non-empty array" });
  }
  if (!Array.isArray(factors)) {
    return res.status(400).json({ error: "factors must be an array" });
  }
  for (const item of items) {
    if (!item?.id || !item?.feedbackText) {
      return res.status(400).json({ error: "each item requires id and feedbackText" });
    }
  }

  const boundedConcurrency = Math.min(Math.max(Number(concurrency) || 4, 1), 8);

  let results;
  try {
    results = await runBatch(
      items,
      (item) => scoreFeedbackItem({ item, factors }),
      boundedConcurrency,
    );
  } catch (error) {
    console.error("Batch scoring failed unexpectedly:", error);
    return res.status(500).json({ error: "Batch scoring failed unexpectedly" });
  }

  const payload = results.map((result, i) => {
    if (result.status === "fulfilled") {
      return { id: items[i].id, ok: true, ...result.value };
    }

    const err = result.reason;
    const retryable =
      err instanceof Anthropic.RateLimitError ||
      err instanceof Anthropic.APIConnectionError ||
      err instanceof Anthropic.InternalServerError ||
      (typeof err?.status === "number" && err.status >= 500);

    return {
      id: items[i].id,
      ok: false,
      error: err?.message || "Unknown error",
      retryable,
      retryAfterSeconds: err?.headers?.["retry-after"]
        ? Number(err.headers["retry-after"])
        : undefined,
    };
  });

  res.json({ results: payload });
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, async () => {
  console.log(`PDL scoring server listening on http://localhost:${PORT}`);
  try {
    await getAccessToken();
    console.log("OAuth credentials found (ant auth login) — scoring requests are ready.");
  } catch (err) {
    console.warn(err.message);
  }
});
