import MetricCard from "../components/MetricCard";
import { StatusBadge, PriorityBadge, ImpactLabel } from "../components/Badges";
import { IconLayers, IconClock, IconList, IconArchive, IconMessage } from "../components/Icons";
import { priorityTier, clientImpactLabel } from "../utils/prioritization";

export default function Dashboard({ rankedFeatures, config, onSelectFeature }) {
  const total = rankedFeatures.length;
  const inProgress = rankedFeatures.filter((f) => f.status === "In Progress").length;
  const planned = rankedFeatures.filter((f) => f.status === "Planned").length;
  const backlog = rankedFeatures.filter((f) => f.status === "Backlog").length;

  const allScores = rankedFeatures.map((f) => f.priorityScore);
  const topFeatures = rankedFeatures.slice(0, 8);

  const recentFeedback = [...rankedFeatures]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total Features" value={total} icon={<IconLayers />} accent="blue" />
        <MetricCard label="In Progress" value={inProgress} icon={<IconClock />} accent="warning" />
        <MetricCard label="Planned" value={planned} icon={<IconList />} accent="success" />
        <MetricCard label="Backlog" value={backlog} icon={<IconArchive />} accent="gray" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="app-card lg:col-span-2">
          <div className="border-b border-border-gray px-5 py-4">
            <h3 className="text-sm font-bold text-dark-gray">Top Prioritized Features</h3>
            <p className="text-xs text-medium-gray">Ranked by weighted client impact score</p>
          </div>
          <div className="overflow-x-auto">
            <table className="app-table w-full text-sm">
              <thead>
                <tr className="border-b border-border-gray">
                  <th className="px-5 py-3 text-left">Feature</th>
                  <th className="px-5 py-3 text-left">Priority</th>
                  <th className="px-5 py-3 text-left">Client Impact</th>
                  <th className="px-5 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {topFeatures.map((f) => (
                  <tr
                    key={f.id}
                    onClick={() => onSelectFeature(f)}
                    className="cursor-pointer hover:bg-brand-blue-light/40"
                  >
                    <td className="px-5 py-3">
                      <p className="font-semibold text-dark-gray">{f.name}</p>
                      <p className="text-xs text-medium-gray">{f.clientName}</p>
                    </td>
                    <td className="px-5 py-3">
                      <PriorityBadge level={priorityTier(f.priorityScore, allScores)} />
                    </td>
                    <td className="px-5 py-3">
                      <ImpactLabel level={clientImpactLabel(f, config)} />
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={f.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="app-card">
          <div className="border-b border-border-gray px-5 py-4">
            <h3 className="text-sm font-bold text-dark-gray">Recent Client Feedback</h3>
            <p className="text-xs text-medium-gray">Latest submissions</p>
          </div>
          <div className="divide-y divide-border-gray">
            {recentFeedback.map((f) => (
              <div key={f.id} className="px-5 py-4">
                <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-medium-gray">
                  <IconMessage className="text-brand-blue" />
                  {f.clientName}
                  <span className="ml-auto text-[11px] text-medium-gray">{f.createdAt}</span>
                </div>
                <p className="text-sm font-semibold text-dark-gray">{f.name}</p>
                <p className="mt-1 line-clamp-3 text-xs text-medium-gray">{f.feedbackText}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
