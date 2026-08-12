import { CLIENT_TIERS } from "./matrix";

function normalizeTier(tier) {
  return CLIENT_TIERS.includes(tier) ? tier : "Tier 2";
}

function normalizeOne(raw, idx) {
  return {
    id: raw.id || `item-${Date.now()}-${idx}`,
    name: raw.name || raw.featureName || "Untitled feedback item",
    clientName: raw.clientName || "Unknown Client",
    clientTier: normalizeTier(raw.clientTier),
    feedbackText: raw.feedbackText || raw.text || "",
    complexity: Number(raw.complexity) || 4,
    impact: Number(raw.impact) || 5,
    feedbackFrequency: Number(raw.feedbackFrequency) || 1,
    aiScores: {},
    manualScores: {},
    aiRationale: null,
    manualScoreOverride: null,
  };
}

// Accepts either the Feature Prioritization app's Export JSON
// ({ features: [...] }) or a bare array of feedback/feature objects.
export function parseImportJSON(text) {
  const parsed = JSON.parse(text);
  const rawItems = Array.isArray(parsed) ? parsed : parsed.features;
  if (!Array.isArray(rawItems)) {
    throw new Error("Expected a JSON array, or an object with a 'features' array");
  }
  return rawItems.map(normalizeOne);
}
