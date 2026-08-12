import Papa from "papaparse";
import { CLIENT_TIERS } from "./prioritization";

const TIER_ALIASES = {
  "top tier": "Top Tier",
  "tier 1": "Top Tier",
  tier1: "Top Tier",
  "tier 2": "Tier 2",
  tier2: "Tier 2",
  "tier 3": "Tier 3",
  tier3: "Tier 3",
  standard: "Tier 3",
};

function normalizeTier(value) {
  if (!value) return null;
  const key = String(value).trim().toLowerCase();
  if (TIER_ALIASES[key]) return TIER_ALIASES[key];
  const match = CLIENT_TIERS.find((t) => t.toLowerCase() === key);
  return match || null;
}

function pick(row, ...keys) {
  for (const key of keys) {
    const found = Object.keys(row).find(
      (k) => k.trim().toLowerCase() === key.toLowerCase(),
    );
    if (found && row[found] !== undefined && row[found] !== "") return row[found];
  }
  return undefined;
}

function parseStandardFeaturesCSV(rows) {
  const features = [];
  const errors = [];

  rows.forEach((row, idx) => {
    const rowNum = idx + 2; // account for header row
    const name = pick(row, "Feature Name", "Name");
    const clientName = pick(row, "Client Name", "Client");
    const tierRaw = pick(row, "Client Tier", "Tier");
    const feedbackText = pick(row, "Feedback Text", "Feedback");
    const complexityRaw = pick(row, "Complexity", "Effort");
    const impactRaw = pick(row, "Impact");
    const frequencyRaw = pick(row, "Feedback Frequency", "Frequency");

    const rowErrors = [];
    if (!name) rowErrors.push("missing Feature Name");
    if (!clientName) rowErrors.push("missing Client Name");
    const clientTier = normalizeTier(tierRaw);
    if (!clientTier) rowErrors.push(`invalid Client Tier "${tierRaw ?? ""}"`);
    if (!feedbackText) rowErrors.push("missing Feedback Text");
    const complexity = Number(complexityRaw);
    if (!complexityRaw || Number.isNaN(complexity) || complexity <= 0) {
      rowErrors.push(`invalid Complexity "${complexityRaw ?? ""}"`);
    }

    if (rowErrors.length) {
      errors.push(`Row ${rowNum}: ${rowErrors.join(", ")}`);
      return;
    }

    features.push({
      id: `feat-csv-${Date.now()}-${idx}`,
      name: name.trim(),
      clientName: clientName.trim(),
      clientTier,
      feedbackText: feedbackText.trim(),
      feedbackFrequency: frequencyRaw ? Number(frequencyRaw) || 1 : 1,
      complexity,
      impact: impactRaw ? Math.min(10, Math.max(1, Number(impactRaw) || 5)) : 5,
      status: "Backlog",
      quarter: null,
      manualOverride: false,
      manualScore: null,
      aiScores: {},
      manualScores: {},
      aiRationale: null,
      dependencies: [],
      createdAt: new Date().toISOString().slice(0, 10),
    });
  });

  return { features, errors };
}

// Priority -> {Client Tier, Complexity weeks, Impact} for governance-style feedback
// exports that carry no client/effort/impact fields of their own.
const PRIORITY_DERIVED = {
  critical: { tier: "Top Tier", complexity: 2, impact: 9 },
  high: { tier: "Top Tier", complexity: 4, impact: 7 },
  medium: { tier: "Tier 2", complexity: 8, impact: 5 },
  low: { tier: "Tier 3", complexity: 12, impact: 3 },
};

const GOVERNANCE_STATUS_MAP = {
  pending: "Backlog",
  "in progress": "In Progress",
  resolved: "Done",
};

function isGovernanceFeedbackSchema(row) {
  const has = (key) => Object.keys(row).some((k) => k.trim().toLowerCase() === key);
  return has("text") && has("category") && !has("feature name") && !has("client tier");
}

function parseGovernanceFeedbackCSV(rows) {
  const features = [];
  const errors = [];

  rows.forEach((row, idx) => {
    const rowNum = idx + 2;
    const text = pick(row, "Text");
    const priorityRaw = pick(row, "Priority");
    const isAnonymous = String(pick(row, "IsAnonymous") ?? "").trim().toUpperCase() === "TRUE";
    const submitter = pick(row, "SubmitterName");
    const category = pick(row, "Category");
    const department = pick(row, "Department");
    const sentiment = pick(row, "Sentiment");
    const statusRaw = pick(row, "Status");
    const owner = pick(row, "Owner");
    const dueDate = pick(row, "DueDate");
    const createdAt = pick(row, "CreatedAt");
    const sourceId = pick(row, "ID");

    const rowErrors = [];
    if (!text) rowErrors.push("missing Text");
    const priorityKey = String(priorityRaw ?? "").trim().toLowerCase();
    const derived = PRIORITY_DERIVED[priorityKey];
    if (!derived) rowErrors.push(`invalid Priority "${priorityRaw ?? ""}"`);

    if (rowErrors.length) {
      errors.push(`Row ${rowNum}: ${rowErrors.join(", ")}`);
      return;
    }

    features.push({
      id: `feat-csv-${Date.now()}-${idx}`,
      name: text.trim(),
      clientName: !isAnonymous && submitter ? submitter.trim() : "Anonymous",
      clientTier: derived.tier,
      feedbackText: text.trim(),
      feedbackFrequency: 1,
      complexity: derived.complexity,
      impact: derived.impact,
      status: GOVERNANCE_STATUS_MAP[String(statusRaw ?? "").trim().toLowerCase()] || "Backlog",
      quarter: null,
      manualOverride: false,
      manualScore: null,
      aiScores: {},
      manualScores: {},
      aiRationale: null,
      dependencies: [],
      createdAt: createdAt ? createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
      sourceId: sourceId || undefined,
      category: category || undefined,
      department: department || undefined,
      sentiment: sentiment || undefined,
      owner: owner || undefined,
      dueDate: dueDate || undefined,
    });
  });

  return { features, errors };
}

export function parseFeaturesCSV(csvText) {
  const result = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  if (result.data.length > 0 && isGovernanceFeedbackSchema(result.data[0])) {
    return { ...parseGovernanceFeedbackCSV(result.data), schema: "governance" };
  }

  return { ...parseStandardFeaturesCSV(result.data), schema: "standard" };
}

export function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
