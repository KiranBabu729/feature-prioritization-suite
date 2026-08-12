export const CLIENT_TIERS = ["Top Tier", "Tier 2", "Tier 3"];

export const STATUSES = ["Backlog", "Planned", "In Progress", "Done"];

export const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];

// Effort is stored in weeks. Buckets used for quick-win / strategic classification.
export const QUICK_WIN_MAX_WEEKS = 2;
export const STRATEGIC_MIN_WEEKS = 12; // 3+ months

export function weeksToLabel(weeks) {
  if (weeks < 4) return `${weeks}w`;
  const months = Math.round((weeks / 4.33) * 10) / 10;
  return `${months}mo`;
}

export function customFactorValue(feature, factor) {
  if (factor.source === "ai") {
    return feature.aiScores?.[factor.id] ?? 0;
  }
  return feature.manualScores?.[factor.id] ?? factor.manualDefault ?? 5;
}

// score = tierWeight × Σ(factorWeight × factorValue) / effort^effortWeight
// Matches PDL Prioritization Studio's formula exactly, so a matrix config
// exported from Studio produces the same rankings here.
export function computePriorityScore(feature, config) {
  let weightedSum = 0;
  if (config.baseFactors.frequency.enabled) {
    weightedSum += config.baseFactors.frequency.weight * (Number(feature.feedbackFrequency) || 1);
  }
  if (config.baseFactors.impact.enabled) {
    weightedSum += config.baseFactors.impact.weight * (Number(feature.impact) || 5);
  }
  for (const factor of config.customFactors) {
    weightedSum += Number(factor.weight) * customFactorValue(feature, factor);
  }

  const tierWeight = config.tierWeights[feature.clientTier] ?? 1;
  const effort = Math.max(Number(feature.complexity) || 1, 0.5);
  const raw = (tierWeight * weightedSum) / Math.pow(effort, Number(config.effortWeight) || 1);
  return Math.round(raw * 100) / 100;
}

export function rankFeatures(features, config) {
  return [...features]
    .map((f) => ({
      ...f,
      priorityScore: f.manualOverride
        ? Number(f.manualScore ?? f.priorityScore ?? 0)
        : computePriorityScore(f, config),
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

export function priorityTier(score, allScores) {
  if (!allScores.length) return "Medium";
  const sorted = [...allScores].sort((a, b) => b - a);
  const idx = sorted.indexOf(score);
  const pct = idx / sorted.length;
  if (pct <= 0.2) return "Critical";
  if (pct <= 0.5) return "High";
  if (pct <= 0.8) return "Medium";
  return "Low";
}

export function isQuickWin(feature) {
  return Number(feature.complexity) <= QUICK_WIN_MAX_WEEKS;
}

export function isStrategic(feature) {
  return Number(feature.complexity) >= STRATEGIC_MIN_WEEKS;
}

export function clientImpactLabel(feature, config) {
  const tierWeight = config.tierWeights[feature.clientTier] ?? 1;
  const score = tierWeight * (Number(feature.feedbackFrequency) || 1);
  if (score >= 9) return "Critical";
  if (score >= 5) return "High";
  if (score >= 2) return "Medium";
  return "Low";
}
