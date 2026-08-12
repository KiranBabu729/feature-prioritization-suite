import { Fragment, useMemo, useState } from "react";
import { TierBadge } from "../components/Badges";
import { IconRobot, IconCheck, IconAlert } from "../components/Icons";
import { rankItems, aiFactors, customFactorValue } from "../utils/matrix";
import { scoreBatch } from "../utils/api";

export default function PrioritizeTab({ items, config, onUpdateItem }) {
  const [running, setRunning] = useState(false);
  const [runSummary, setRunSummary] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const ranked = useMemo(() => rankItems(items, config), [items, config]);
  const factorsForAI = useMemo(() => aiFactors(config), [config]);

  const runAIScoring = async () => {
    if (factorsForAI.length === 0 || items.length === 0) return;
    setRunning(true);
    setRunSummary(null);
    try {
      const payloadItems = items.map((i) => ({
        id: i.id,
        name: i.name,
        clientName: i.clientName,
        clientTier: i.clientTier,
        feedbackText: i.feedbackText,
      }));
      const results = await scoreBatch(
        payloadItems,
        factorsForAI.map(({ id, name, description }) => ({ id, name, description })),
        4,
      );

      let succeeded = 0;
      let failed = 0;
      for (const r of results) {
        if (r.ok) {
          succeeded += 1;
          onUpdateItem(r.id, { aiScores: r.scores, aiRationale: r.rationale });
        } else {
          failed += 1;
        }
      }
      setRunSummary({ succeeded, failed, errors: results.filter((r) => !r.ok) });
    } catch (err) {
      setRunSummary({ succeeded: 0, failed: items.length, errors: [{ error: err.message }] });
    } finally {
      setRunning(false);
    }
  };

  const setManualFactorValue = (item, factorId, value) => {
    onUpdateItem(item.id, {
      manualScores: { ...item.manualScores, [factorId]: Number(value) },
    });
  };

  const setManualOverride = (item, enabled, value) => {
    onUpdateItem(item.id, { manualScoreOverride: enabled ? Number(value ?? item.score) : null });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-6">
      <div className="app-card app-card-accent border-l-brand-blue p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-dark-gray">
              <IconRobot className="text-brand-blue" /> AI Prioritization
            </h3>
            <p className="text-xs text-medium-gray">
              Scores {items.length} item(s) against {factorsForAI.length} AI-scored factor(s) via the
              scoring server. Manual factors are edited directly in the table below.
            </p>
          </div>
          <button
            onClick={runAIScoring}
            disabled={running || factorsForAI.length === 0 || items.length === 0}
            className="flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue-dark disabled:opacity-40"
          >
            <IconRobot /> {running ? "Scoring..." : "Run AI Scoring"}
          </button>
        </div>
        {factorsForAI.length === 0 && (
          <p className="mt-3 text-xs text-status-warning">
            No AI-scored factors are configured yet — add one in the Matrix tab.
          </p>
        )}
        {runSummary && (
          <div className="mt-3 flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-status-success">
              <IconCheck /> {runSummary.succeeded} scored
            </span>
            {runSummary.failed > 0 && (
              <span className="flex items-center gap-1.5 font-semibold text-status-error">
                <IconAlert /> {runSummary.failed} failed
              </span>
            )}
          </div>
        )}
      </div>

      <div className="app-card">
        <div className="border-b border-border-gray px-5 py-4">
          <h3 className="text-sm font-bold text-dark-gray">Ranked Features</h3>
          <p className="text-xs text-medium-gray">Sorted by computed priority score</p>
        </div>
        <div className="overflow-x-auto">
          <table className="app-table w-full text-sm">
            <thead>
              <tr className="border-b border-border-gray">
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Feature</th>
                <th className="px-4 py-3 text-left">Client</th>
                <th className="px-4 py-3 text-right">Score</th>
                <th className="px-4 py-3 text-left">Override</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((item, idx) => (
                <Fragment key={item.id}>
                  <tr
                    key={item.id}
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    className="cursor-pointer hover:bg-brand-blue-light/40"
                  >
                    <td className="px-4 py-3 font-semibold text-medium-gray">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-dark-gray">{item.name}</p>
                      {item.aiRationale && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-medium-gray">{item.aiRationale}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <TierBadge tier={item.clientTier} />
                        <span className="text-xs text-medium-gray">{item.clientName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-brand-blue">{item.score}</td>
                    <td className="px-4 py-3 text-xs text-medium-gray">
                      {item.manualScoreOverride != null ? "PDL override active" : "—"}
                    </td>
                  </tr>
                  {expandedId === item.id && (
                    <tr key={`${item.id}-detail`} className="bg-light-gray">
                      <td colSpan={5} className="px-4 py-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <p className="mb-2 text-xs font-semibold text-medium-gray">Feedback</p>
                            <p className="text-sm text-dark-gray">{item.feedbackText}</p>
                            {item.aiRationale && (
                              <p className="mt-2 text-xs italic text-medium-gray">
                                AI rationale: {item.aiRationale}
                              </p>
                            )}
                          </div>
                          <div className="space-y-3">
                            <p className="text-xs font-semibold text-medium-gray">Factor breakdown</p>
                            {config.customFactors.map((factor) => (
                              <div key={factor.id} className="flex items-center justify-between gap-3">
                                <span className="text-xs text-dark-gray">
                                  {factor.name}{" "}
                                  <span className="text-medium-gray">(w={factor.weight})</span>
                                </span>
                                {factor.source === "ai" ? (
                                  <span className="w-16 rounded-lg border border-border-gray bg-white px-2 py-1 text-right text-xs">
                                    {customFactorValue(item, factor)}
                                  </span>
                                ) : (
                                  <input
                                    type="number"
                                    min="0"
                                    max="10"
                                    value={customFactorValue(item, factor)}
                                    onChange={(e) => setManualFactorValue(item, factor.id, e.target.value)}
                                    className="w-16 rounded-lg border border-border-gray px-2 py-1 text-right text-xs"
                                  />
                                )}
                              </div>
                            ))}

                            <div className="flex items-center justify-between gap-3 border-t border-border-gray pt-3">
                              <label className="flex items-center gap-2 text-xs font-semibold text-dark-gray">
                                <input
                                  type="checkbox"
                                  checked={item.manualScoreOverride != null}
                                  onChange={(e) => setManualOverride(item, e.target.checked, item.score)}
                                />
                                PDL manual priority override
                              </label>
                              {item.manualScoreOverride != null && (
                                <input
                                  type="number"
                                  step="0.1"
                                  value={item.manualScoreOverride}
                                  onChange={(e) => setManualOverride(item, true, e.target.value)}
                                  className="w-24 rounded-lg border border-border-gray px-2 py-1 text-right text-xs"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {ranked.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-medium-gray">
                    No items yet — add feedback in the Data tab.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
