export const CLIENT_TIERS = ["Top Tier", "Tier 2", "Tier 3"];

export function defaultConfig() {
  return {
    tierWeights: { "Top Tier": 3, "Tier 2": 2, "Tier 3": 1 },
    baseFactors: {
      frequency: { label: "Feedback Frequency", weight: 1, enabled: true },
      impact: { label: "Business Impact", weight: 1, enabled: true },
    },
    effortWeight: 1,
    customFactors: [],
  };
}

let idCounter = 1;
export function newFactorId() {
  return `factor-${Date.now()}-${idCounter++}`;
}

export function customFactorValue(item, factor) {
  if (factor.source === "ai") {
    return item.aiScores?.[factor.id] ?? 0;
  }
  return item.manualScores?.[factor.id] ?? factor.manualDefault ?? 5;
}

export function computeScore(item, config) {
  if (item.manualScoreOverride != null) return Number(item.manualScoreOverride);

  let weightedSum = 0;
  if (config.baseFactors.frequency.enabled) {
    weightedSum += config.baseFactors.frequency.weight * (Number(item.feedbackFrequency) || 1);
  }
  if (config.baseFactors.impact.enabled) {
    weightedSum += config.baseFactors.impact.weight * (Number(item.impact) || 5);
  }
  for (const factor of config.customFactors) {
    weightedSum += Number(factor.weight) * customFactorValue(item, factor);
  }

  const tierWeight = config.tierWeights[item.clientTier] ?? 1;
  const effort = Math.max(Number(item.complexity) || 1, 0.5);
  const raw = (tierWeight * weightedSum) / Math.pow(effort, Number(config.effortWeight) || 1);
  return Math.round(raw * 100) / 100;
}

export function rankItems(items, config) {
  return [...items]
    .map((item) => ({ ...item, score: computeScore(item, config) }))
    .sort((a, b) => b.score - a.score);
}

export function aiFactors(config) {
  return config.customFactors.filter((f) => f.source === "ai");
}
