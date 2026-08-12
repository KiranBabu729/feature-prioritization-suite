import { useRef, useState } from "react";
import { TierBadge, SourceBadge } from "../components/Badges";
import { IconUpload, IconDownload, IconRobot, IconCheck, IconAlert, IconTrash } from "../components/Icons";
import { parseMatrixConfig, aiFactors } from "../utils/matrixConfig";
import { scoreBatch } from "../utils/scoringApi";

export default function SetupTab({ config, onSetConfig, features, onUpdateFeature, onClearFeatures }) {
  const [importError, setImportError] = useState(null);
  const [running, setRunning] = useState(false);
  const [runSummary, setRunSummary] = useState(null);
  const inputRef = useRef(null);

  const factorsForAI = aiFactors(config);

  const handleImport = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        onSetConfig(parseMatrixConfig(e.target.result));
        setImportError(null);
      } catch (err) {
        setImportError(err.message);
      }
    };
    reader.readAsText(file);
  };

  const exportConfig = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prioritization-matrix.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const runAIPrioritization = async () => {
    if (factorsForAI.length === 0 || features.length === 0) return;
    setRunning(true);
    setRunSummary(null);
    try {
      const payloadItems = features.map((f) => ({
        id: f.id,
        name: f.name,
        clientName: f.clientName,
        clientTier: f.clientTier,
        feedbackText: f.feedbackText,
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
          onUpdateFeature(r.id, { aiScores: r.scores, aiRationale: r.rationale });
        } else {
          failed += 1;
        }
      }
      setRunSummary({ succeeded, failed });
    } catch (err) {
      setRunSummary({ succeeded: 0, failed: features.length, error: err.message });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-dark-gray">Prioritization Setup</h2>
          <p className="text-sm text-medium-gray">
            Import the matrix a PDL configured in Prioritization Studio, then apply it here —
            no need to go back to Studio for day-to-day work.
          </p>
        </div>
        <div className="flex gap-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border-gray px-4 py-2 text-sm font-semibold text-dark-gray hover:bg-light-gray">
            <IconUpload /> Import Matrix
            <input
              ref={inputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => handleImport(e.target.files?.[0])}
            />
          </label>
          <button
            onClick={exportConfig}
            className="flex items-center gap-2 rounded-lg border border-border-gray px-4 py-2 text-sm font-semibold text-dark-gray hover:bg-light-gray"
          >
            <IconDownload /> Export Matrix
          </button>
        </div>
      </div>

      {importError && (
        <div className="rounded-lg border border-status-error bg-status-error-bg px-4 py-2 text-xs font-semibold text-status-error">
          {importError}
        </div>
      )}

      <div className="app-card app-card-accent border-l-brand-blue p-5">
        <p className="text-xs font-semibold text-medium-gray">Active matrix</p>
        <p className="text-sm text-dark-gray">
          {config.importedAt
            ? `Imported from Studio on ${new Date(config.importedAt).toLocaleString()}`
            : "Using the default matrix — import one from Prioritization Studio to customize it."}
        </p>
      </div>

      <div className="app-card app-card-accent border-l-status-error p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-medium-gray">Workspace Data</p>
            <p className="text-sm text-dark-gray">
              {features.length} feature(s) currently loaded, including any bundled sample data.
            </p>
          </div>
          <button
            onClick={() => {
              if (window.confirm(`Delete all ${features.length} feature(s)? This can't be undone.`)) {
                onClearFeatures();
              }
            }}
            disabled={features.length === 0}
            className="flex items-center gap-2 rounded-lg border border-status-error px-4 py-2 text-sm font-semibold text-status-error hover:bg-status-error-bg disabled:opacity-40"
          >
            <IconTrash /> Clear All Features
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="app-card p-5">
          <h3 className="mb-3 text-sm font-bold text-dark-gray">Client Tier Weights</h3>
          <div className="space-y-2">
            {Object.entries(config.tierWeights).map(([tier, weight]) => (
              <div key={tier} className="flex items-center justify-between">
                <TierBadge tier={tier} />
                <span className="text-sm font-semibold text-dark-gray">×{weight}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="app-card p-5">
          <h3 className="mb-3 text-sm font-bold text-dark-gray">Base Factors &amp; Effort</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-dark-gray">
                {config.baseFactors.frequency.label}
                {!config.baseFactors.frequency.enabled && (
                  <span className="ml-1 text-xs text-medium-gray">(disabled)</span>
                )}
              </span>
              <span className="font-semibold text-dark-gray">w={config.baseFactors.frequency.weight}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-dark-gray">
                {config.baseFactors.impact.label}
                {!config.baseFactors.impact.enabled && (
                  <span className="ml-1 text-xs text-medium-gray">(disabled)</span>
                )}
              </span>
              <span className="font-semibold text-dark-gray">w={config.baseFactors.impact.weight}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border-gray pt-2">
              <span className="text-dark-gray">Effort exponent</span>
              <span className="font-semibold text-dark-gray">{config.effortWeight}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="app-card">
        <div className="border-b border-border-gray px-5 py-4">
          <h3 className="text-sm font-bold text-dark-gray">Custom Factors</h3>
          <p className="text-xs text-medium-gray">
            {config.customFactors.length} factor(s) — {factorsForAI.length} scored by AI, the rest entered
            manually per feature
          </p>
        </div>
        <div className="divide-y divide-border-gray">
          {config.customFactors.length === 0 && (
            <p className="px-5 py-4 text-sm text-medium-gray">
              No custom factors configured — the score uses tier weight, feedback frequency, and impact
              only.
            </p>
          )}
          {config.customFactors.map((factor) => (
            <div key={factor.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <div>
                <p className="text-sm font-semibold text-dark-gray">{factor.name}</p>
                <p className="text-xs text-medium-gray">{factor.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-medium-gray">w={factor.weight}</span>
                <SourceBadge source={factor.source} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="app-card app-card-accent border-l-brand-blue p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-dark-gray">
              <IconRobot className="text-brand-blue" /> AI Prioritization
            </h3>
            <p className="text-xs text-medium-gray">
              Scores all {features.length} feature(s) against {factorsForAI.length} AI-scored factor(s)
              using the scoring server.
            </p>
          </div>
          <button
            onClick={runAIPrioritization}
            disabled={running || factorsForAI.length === 0 || features.length === 0}
            className="flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue-dark disabled:opacity-40"
          >
            <IconRobot /> {running ? "Scoring..." : "Run AI Prioritization"}
          </button>
        </div>
        {factorsForAI.length === 0 && (
          <p className="mt-3 text-xs text-status-warning">
            No AI-scored factors in the active matrix — import one from Studio to enable this.
          </p>
        )}
        {runSummary && (
          <div className="mt-3 flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-status-success">
              <IconCheck /> {runSummary.succeeded} scored
            </span>
            {runSummary.failed > 0 && (
              <span className="flex items-center gap-1.5 font-semibold text-status-error">
                <IconAlert /> {runSummary.failed} failed{runSummary.error ? `: ${runSummary.error}` : ""}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
