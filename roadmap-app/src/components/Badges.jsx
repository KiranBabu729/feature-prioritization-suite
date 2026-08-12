const STATUS_STYLES = {
  Backlog: "bg-light-gray text-medium-gray",
  Planned: "bg-brand-blue-light text-brand-blue-dark",
  "In Progress": "bg-status-warning-bg text-status-warning",
  Done: "bg-status-success-bg text-status-success",
};

export function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${
        STATUS_STYLES[status] || STATUS_STYLES.Backlog
      }`}
    >
      {status}
    </span>
  );
}

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

const PRIORITY_STYLES = {
  Critical: { dot: "bg-status-error", text: "text-status-error" },
  High: { dot: "bg-status-warning", text: "text-status-warning" },
  Medium: { dot: "bg-brand-blue", text: "text-brand-blue" },
  Low: { dot: "bg-medium-gray", text: "text-medium-gray" },
};

export function PriorityBadge({ level }) {
  const style = PRIORITY_STYLES[level] || PRIORITY_STYLES.Medium;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${style.text}`}>
      <span className={`h-2 w-2 rounded-full ${style.dot}`} />
      {level}
    </span>
  );
}

const IMPACT_STYLES = {
  Critical: "text-status-error",
  High: "text-status-warning",
  Medium: "text-brand-blue",
  Low: "text-medium-gray",
};

export function ImpactLabel({ level }) {
  return <span className={`text-xs font-semibold ${IMPACT_STYLES[level] || IMPACT_STYLES.Medium}`}>{level}</span>;
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
