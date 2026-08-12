import { useState } from "react";
import Modal from "./Modal";
import { TierBadge, StatusBadge } from "./Badges";
import { STATUSES, computePriorityScore, customFactorValue } from "../utils/prioritization";
import { IconTrash } from "./Icons";

export default function FeatureDetailModal({ feature, config, onClose, onUpdate, onDelete }) {
  const [status, setStatus] = useState(feature.status);
  const [manualOverride, setManualOverride] = useState(feature.manualOverride);
  const [manualScore, setManualScore] = useState(
    feature.manualScore ?? computePriorityScore(feature, config),
  );
  const [manualScores, setManualScores] = useState(feature.manualScores || {});

  const handleSave = () => {
    onUpdate(feature.id, {
      status,
      manualOverride,
      manualScore: manualOverride ? Number(manualScore) : null,
      manualScores,
    });
    onClose();
  };

  return (
    <Modal title={feature.name} onClose={onClose} width="max-w-xl">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <TierBadge tier={feature.clientTier} />
          <StatusBadge status={feature.status} />
          <span className="text-xs text-medium-gray">{feature.clientName}</span>
        </div>

        <div className="rounded-lg bg-light-gray p-3">
          <p className="text-xs font-semibold text-medium-gray">Feedback</p>
          <p className="mt-1 text-sm text-dark-gray">{feature.feedbackText}</p>
          {feature.aiRationale && (
            <p className="mt-2 text-xs italic text-medium-gray">AI rationale: {feature.aiRationale}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-xs font-semibold text-medium-gray">Effort</p>
            <p className="font-semibold text-dark-gray">{feature.complexity}w</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-medium-gray">Impact</p>
            <p className="font-semibold text-dark-gray">{feature.impact}/10</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-medium-gray">Feedback Freq.</p>
            <p className="font-semibold text-dark-gray">{feature.feedbackFrequency}</p>
          </div>
        </div>

        {config.customFactors.length > 0 && (
          <div className="rounded-lg border border-border-gray p-3">
            <p className="mb-2 text-xs font-semibold text-medium-gray">Matrix Factors</p>
            <div className="space-y-2">
              {config.customFactors.map((factor) => (
                <div key={factor.id} className="flex items-center justify-between gap-3">
                  <span className="text-xs text-dark-gray">
                    {factor.name} <span className="text-medium-gray">(w={factor.weight})</span>
                  </span>
                  {factor.source === "ai" ? (
                    <span className="w-16 rounded-lg border border-border-gray bg-light-gray px-2 py-1 text-right text-xs">
                      {customFactorValue(feature, factor)}
                    </span>
                  ) : (
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={manualScores[factor.id] ?? factor.manualDefault ?? 5}
                      onChange={(e) =>
                        setManualScores((prev) => ({ ...prev, [factor.id]: Number(e.target.value) }))
                      }
                      className="w-16 rounded-lg border border-border-gray px-2 py-1 text-right text-xs"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-medium-gray">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border-gray px-3 py-2 text-sm text-dark-gray focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="rounded-lg border border-border-gray p-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-dark-gray">
            <input
              type="checkbox"
              checked={manualOverride}
              onChange={(e) => setManualOverride(e.target.checked)}
            />
            PDL Manual Priority Override
          </label>
          <p className="mt-1 text-xs text-medium-gray">
            Auto score: {computePriorityScore({ ...feature, manualScores }, config)}. Override to manually
            pin this feature's priority.
          </p>
          {manualOverride && (
            <input
              type="number"
              step="0.1"
              value={manualScore}
              onChange={(e) => setManualScore(e.target.value)}
              className="mt-2 w-full rounded-lg border border-border-gray px-3 py-2 text-sm text-dark-gray focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
          )}
        </div>

        <div className="flex justify-between pt-2">
          <button
            onClick={() => { onDelete(feature.id); onClose(); }}
            className="flex items-center gap-1.5 rounded-lg border border-status-error px-3 py-2 text-xs font-semibold text-status-error hover:bg-status-error-bg"
          >
            <IconTrash /> Delete
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-border-gray px-4 py-2 text-sm font-semibold text-medium-gray hover:bg-light-gray"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue-dark"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
