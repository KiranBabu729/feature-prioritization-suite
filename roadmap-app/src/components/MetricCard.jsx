const ACCENT_COLORS = {
  blue: "border-l-brand-blue",
  success: "border-l-status-success",
  warning: "border-l-status-warning",
  gray: "border-l-medium-gray",
};

const ICON_BG = {
  blue: "bg-brand-blue-light text-brand-blue",
  success: "bg-status-success-bg text-status-success",
  warning: "bg-status-warning-bg text-status-warning",
  gray: "bg-light-gray text-medium-gray",
};

export default function MetricCard({ label, value, icon, accent = "blue", sublabel }) {
  return (
    <div className={`app-card app-card-accent ${ACCENT_COLORS[accent]} p-5 flex items-start justify-between`}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-medium-gray">{label}</p>
        <p className="mt-2 text-3xl font-bold text-dark-gray">{value}</p>
        {sublabel && <p className="mt-1 text-xs text-medium-gray">{sublabel}</p>}
      </div>
      {icon && (
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${ICON_BG[accent]}`}>
          {icon}
        </div>
      )}
    </div>
  );
}
