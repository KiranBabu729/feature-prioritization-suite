const CONFIG_KEY = "roadmap-matrix-config";

// Same shape as PDL Prioritization Studio's matrix config, so a config
// exported from Studio can be imported here verbatim.
export function defaultMatrixConfig() {
  return {
    tierWeights: { "Top Tier": 3, "Tier 2": 2, "Tier 3": 1 },
    baseFactors: {
      frequency: { label: "Feedback Frequency", weight: 1, enabled: true },
      impact: { label: "Business Impact", weight: 1, enabled: true },
    },
    effortWeight: 1,
    customFactors: [],
    importedAt: null,
  };
}

export function loadMatrixConfig() {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return defaultMatrixConfig();
    return { ...defaultMatrixConfig(), ...JSON.parse(raw) };
  } catch {
    return defaultMatrixConfig();
  }
}

export function saveMatrixConfig(config) {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch {
    // storage unavailable — fail silently
  }
}

export function parseMatrixConfig(jsonText) {
  const parsed = JSON.parse(jsonText);
  if (!parsed.tierWeights || !parsed.baseFactors) {
    throw new Error("Not a valid prioritization matrix config (missing tierWeights/baseFactors)");
  }
  return { ...defaultMatrixConfig(), ...parsed, importedAt: new Date().toISOString() };
}

export function aiFactors(config) {
  return config.customFactors.filter((f) => f.source === "ai");
}

export function manualFactors(config) {
  return config.customFactors.filter((f) => f.source === "manual");
}
