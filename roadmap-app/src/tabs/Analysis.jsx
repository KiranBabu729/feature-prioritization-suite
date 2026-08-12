import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { TierBadge, StatusBadge } from "../components/Badges";
import { IconZap, IconTarget } from "../components/Icons";
import {
  isQuickWin, isStrategic, weeksToLabel, CLIENT_TIERS,
} from "../utils/prioritization";

const QUADRANT_COLOR = (f) => {
  if (f.complexity <= 4 && f.impact >= 6) return "#10B981"; // quick win, high impact
  if (f.complexity > 4 && f.impact >= 6) return "#0092BC"; // strategic, high impact
  if (f.complexity <= 4 && f.impact < 6) return "#6B7280"; // low effort low impact
  return "#F59E0B"; // high effort low impact
};

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const f = payload[0].payload;
  return (
    <div className="rounded-lg border border-border-gray bg-white px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-dark-gray">{f.name}</p>
      <p className="text-medium-gray">{f.clientName} · {f.clientTier}</p>
      <p className="mt-1 text-dark-gray">Effort: {weeksToLabel(f.complexity)} · Impact: {f.impact}/10</p>
    </div>
  );
}

export default function Analysis({ rankedFeatures, config }) {
  const quickWins = rankedFeatures.filter(isQuickWin).sort((a, b) => b.priorityScore - a.priorityScore);
  const strategic = rankedFeatures.filter(isStrategic).sort((a, b) => b.priorityScore - a.priorityScore);

  const tierBreakdown = CLIENT_TIERS.map((tier) => ({
    tier,
    count: rankedFeatures.filter((f) => f.clientTier === tier).length,
    weight: config.tierWeights[tier],
  }));
  const maxTierCount = Math.max(...tierBreakdown.map((t) => t.count), 1);

  const effortBuckets = [
    { label: "≤ 2 weeks", test: (w) => w <= 2 },
    { label: "3-6 weeks", test: (w) => w > 2 && w <= 6 },
    { label: "7-12 weeks", test: (w) => w > 6 && w <= 12 },
    { label: "3+ months", test: (w) => w > 12 },
  ].map((b) => ({
    ...b,
    count: rankedFeatures.filter((f) => b.test(f.complexity)).length,
  }));
  const maxEffortCount = Math.max(...effortBuckets.map((b) => b.count), 1);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-6">
      <div className="app-card p-5">
        <h3 className="text-sm font-bold text-dark-gray">Effort vs. Impact Quadrant</h3>
        <p className="mb-4 text-xs text-medium-gray">
          Bubble size reflects client tier weight. Bottom-left = quick wins, top-right = strategic bets.
        </p>
        <ResponsiveContainer width="100%" height={360}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
            <CartesianGrid stroke="#E5E7EB" />
            <XAxis
              type="number"
              dataKey="complexity"
              name="Effort"
              unit="w"
              tick={{ fontSize: 11, fill: "#6B7280" }}
              label={{ value: "Effort (weeks)", position: "insideBottom", offset: -5, fontSize: 12, fill: "#6B7280" }}
            />
            <YAxis
              type="number"
              dataKey="impact"
              name="Impact"
              domain={[0, 10]}
              tick={{ fontSize: 11, fill: "#6B7280" }}
              label={{ value: "Impact", angle: -90, position: "insideLeft", fontSize: 12, fill: "#6B7280" }}
            />
            <ZAxis type="number" dataKey="bubbleSize" range={[80, 400]} />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3" }} />
            <Scatter
              data={rankedFeatures.map((f) => ({ ...f, bubbleSize: config.tierWeights[f.clientTier] * 60 }))}
              fill="#0092BC"
            >
              {rankedFeatures.map((f) => (
                <Cell key={f.id} fill={QUADRANT_COLOR(f)} fillOpacity={0.75} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <div className="mt-2 flex flex-wrap gap-4 text-xs text-medium-gray">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-status-success" />Quick win, high impact</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-brand-blue" />Strategic, high impact</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-status-warning" />High effort, low impact</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-medium-gray" />Low effort, low impact</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="app-card app-card-accent border-l-status-success">
          <div className="flex items-center gap-2 border-b border-border-gray px-5 py-4">
            <IconZap className="text-status-success" />
            <h3 className="text-sm font-bold text-dark-gray">Quick Wins</h3>
            <span className="ml-auto rounded-full bg-status-success-bg px-2 py-0.5 text-xs font-bold text-status-success">
              {quickWins.length}
            </span>
          </div>
          <p className="px-5 pt-3 text-xs text-medium-gray">Features estimated at 2 weeks of effort or less.</p>
          <div className="divide-y divide-border-gray">
            {quickWins.map((f) => (
              <div key={f.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-semibold text-dark-gray">{f.name}</p>
                  <p className="text-xs text-medium-gray">{f.clientName} · {weeksToLabel(f.complexity)}</p>
                </div>
                <StatusBadge status={f.status} />
              </div>
            ))}
            {quickWins.length === 0 && (
              <p className="px-5 py-4 text-sm text-medium-gray">No quick wins identified.</p>
            )}
          </div>
        </div>

        <div className="app-card app-card-accent border-l-brand-blue">
          <div className="flex items-center gap-2 border-b border-border-gray px-5 py-4">
            <IconTarget className="text-brand-blue" />
            <h3 className="text-sm font-bold text-dark-gray">Strategic Initiatives</h3>
            <span className="ml-auto rounded-full bg-brand-blue-light px-2 py-0.5 text-xs font-bold text-brand-blue">
              {strategic.length}
            </span>
          </div>
          <p className="px-5 pt-3 text-xs text-medium-gray">Features estimated at 3+ months of effort.</p>
          <div className="divide-y divide-border-gray">
            {strategic.map((f) => (
              <div key={f.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-semibold text-dark-gray">{f.name}</p>
                  <p className="text-xs text-medium-gray">{f.clientName} · {weeksToLabel(f.complexity)}</p>
                </div>
                <StatusBadge status={f.status} />
              </div>
            ))}
            {strategic.length === 0 && (
              <p className="px-5 py-4 text-sm text-medium-gray">No strategic initiatives identified.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="app-card p-5">
          <h3 className="text-sm font-bold text-dark-gray">Client Tier Breakdown</h3>
          <p className="mb-4 text-xs text-medium-gray">Feature requests by client tier weight</p>
          <div className="space-y-3">
            {tierBreakdown.map((t) => (
              <div key={t.tier}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <TierBadge tier={t.tier} />
                  <span className="font-semibold text-dark-gray">{t.count} features</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-light-gray">
                  <div
                    className="h-full rounded-full bg-brand-blue"
                    style={{ width: `${(t.count / maxTierCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="app-card p-5">
          <h3 className="text-sm font-bold text-dark-gray">Effort Distribution</h3>
          <p className="mb-4 text-xs text-medium-gray">Feature count by effort bucket</p>
          <div className="space-y-3">
            {effortBuckets.map((b) => (
              <div key={b.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-semibold text-dark-gray">{b.label}</span>
                  <span className="text-medium-gray">{b.count} features</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-light-gray">
                  <div
                    className="h-full rounded-full bg-status-warning"
                    style={{ width: `${(b.count / maxEffortCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
