const TIER_STYLES = {
  "Top Tier": "bg-brand-blue text-white",
  "Tier 2": "bg-dark-gray text-white",
  "Tier 3": "bg-light-gray text-dark-gray",
};

export function TierBadge({ tier }) {
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-bold whitespace-nowrap ${
        TIER_STYLES[tier] || TIER_STYLES["Tier 3"]
      }`}
    >
      {tier}
    </span>
  );
}

const SOURCE_STYLES = {
  ai: "bg-brand-blue-light text-brand-blue",
  manual: "bg-light-gray text-medium-gray",
};

export function SourceBadge({ source }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        SOURCE_STYLES[source] || SOURCE_STYLES.manual
      }`}
    >
      {source === "ai" ? "AI-scored" : "Manual"}
    </span>
  );
}
