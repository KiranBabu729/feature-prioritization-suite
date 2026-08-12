const URGENT_WORDS = ["blocking", "blocker", "critical", "required", "must", "contractual", "top priority"];
const POSITIVE_WORDS = ["would like", "want", "nice to have", "appreciate", "love"];

export function classifySentiment(feedbackText) {
  const text = feedbackText.toLowerCase();
  if (URGENT_WORDS.some((w) => text.includes(w))) return "Urgent";
  if (POSITIVE_WORDS.some((w) => text.includes(w))) return "Requested";
  return "Neutral";
}

export function sentimentSummary(features) {
  const counts = { Urgent: 0, Requested: 0, Neutral: 0 };
  features.forEach((f) => {
    counts[classifySentiment(f.feedbackText)] += 1;
  });
  return counts;
}
