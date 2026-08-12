import { TierBadge } from "../components/Badges";
import { IconDownload, IconFileText } from "../components/Icons";
import { CLIENT_TIERS, isQuickWin, isStrategic } from "../utils/prioritization";
import { sentimentSummary } from "../utils/sentiment";
import { downloadJSON } from "../utils/csv";
import { exportReportPDF } from "../utils/pdf";

export default function Reports({ rankedFeatures }) {
  const totalClients = new Set(rankedFeatures.map((f) => f.clientName)).size;
  const inProgress = rankedFeatures.filter((f) => f.status === "In Progress").length;
  const planned = rankedFeatures.filter((f) => f.status === "Planned").length;
  const backlog = rankedFeatures.filter((f) => f.status === "Backlog").length;
  const done = rankedFeatures.filter((f) => f.status === "Done").length;

  const quadrants = {
    "Quick win, high impact": rankedFeatures.filter((f) => f.complexity <= 4 && f.impact >= 6).length,
    "Strategic, high impact": rankedFeatures.filter((f) => f.complexity > 4 && f.impact >= 6).length,
    "High effort, low impact": rankedFeatures.filter((f) => f.complexity > 4 && f.impact < 6).length,
    "Low effort, low impact": rankedFeatures.filter((f) => f.complexity <= 4 && f.impact < 6).length,
  };

  const tierBreakdown = CLIENT_TIERS.map((tier) => ({
    tier,
    count: rankedFeatures.filter((f) => f.clientTier === tier).length,
  }));

  const sentiment = sentimentSummary(rankedFeatures);

  const handleExportJSON = () => {
    downloadJSON(
      {
        generatedAt: new Date().toISOString(),
        summary: { total: rankedFeatures.length, inProgress, planned, backlog, done, totalClients },
        quadrants,
        tierBreakdown,
        sentiment,
        features: rankedFeatures,
      },
      `feature-roadmap-report-${new Date().toISOString().slice(0, 10)}.json`,
    );
  };

  const handleExportPDF = () => {
    exportReportPDF({ features: rankedFeatures, tierBreakdown, sentiment, quadrants });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-dark-gray">Reports</h2>
          <p className="text-sm text-medium-gray">Executive summary and exportable analysis</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 rounded-lg border border-border-gray px-4 py-2 text-sm font-semibold text-dark-gray hover:bg-light-gray"
          >
            <IconDownload /> Export JSON
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue-dark"
          >
            <IconFileText /> Export PDF
          </button>
        </div>
      </div>

      <div className="app-card app-card-accent border-l-brand-blue p-5">
        <h3 className="text-sm font-bold text-dark-gray">Executive Summary</h3>
        <p className="mt-2 text-sm leading-relaxed text-medium-gray">
          Tracking <strong className="text-dark-gray">{rankedFeatures.length} features</strong> across{" "}
          <strong className="text-dark-gray">{totalClients} clients</strong>. Currently{" "}
          <strong className="text-dark-gray">{inProgress} in progress</strong>,{" "}
          <strong className="text-dark-gray">{planned} planned</strong>,{" "}
          <strong className="text-dark-gray">{backlog} in backlog</strong>, and{" "}
          <strong className="text-dark-gray">{done} completed</strong>. Prioritization is calculated from client
          tier weight, feedback frequency, and business impact relative to implementation effort, giving Top Tier
          client requests 3x the weighting of standard accounts.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="app-card p-5">
          <h3 className="text-sm font-bold text-dark-gray">Quadrant Breakdown</h3>
          <p className="mb-4 text-xs text-medium-gray">Effort vs. impact distribution</p>
          <div className="space-y-3">
            {Object.entries(quadrants).map(([label, count]) => (
              <div key={label} className="flex items-center justify-between rounded-lg bg-light-gray px-3 py-2.5 text-sm">
                <span className="font-medium text-dark-gray">{label}</span>
                <span className="font-bold text-brand-blue">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="app-card p-5">
          <h3 className="text-sm font-bold text-dark-gray">Client Sentiment Analysis</h3>
          <p className="mb-4 text-xs text-medium-gray">Derived from feedback language</p>
          <div className="space-y-3">
            {Object.entries(sentiment).map(([label, count]) => {
              const color =
                label === "Urgent" ? "bg-status-error-bg text-status-error"
                : label === "Requested" ? "bg-brand-blue-light text-brand-blue"
                : "bg-light-gray text-medium-gray";
              return (
                <div key={label} className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm ${color}`}>
                  <span className="font-medium">{label}</span>
                  <span className="font-bold">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="app-card p-5">
        <h3 className="text-sm font-bold text-dark-gray">Client Tier Summary</h3>
        <p className="mb-4 text-xs text-medium-gray">
          Quick wins: {rankedFeatures.filter(isQuickWin).length} · Strategic bets: {rankedFeatures.filter(isStrategic).length}
        </p>
        <div className="overflow-x-auto">
          <table className="app-table w-full text-sm">
            <thead>
              <tr className="border-b border-border-gray">
                <th className="px-4 py-2 text-left">Tier</th>
                <th className="px-4 py-2 text-left">Features</th>
                <th className="px-4 py-2 text-left">Share</th>
              </tr>
            </thead>
            <tbody>
              {tierBreakdown.map((t) => (
                <tr key={t.tier}>
                  <td className="px-4 py-3"><TierBadge tier={t.tier} /></td>
                  <td className="px-4 py-3 font-semibold text-dark-gray">{t.count}</td>
                  <td className="px-4 py-3 text-medium-gray">
                    {rankedFeatures.length ? Math.round((t.count / rankedFeatures.length) * 100) : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
