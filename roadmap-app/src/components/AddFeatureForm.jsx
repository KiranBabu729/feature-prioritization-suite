import { useState } from "react";
import Modal from "./Modal";
import { CLIENT_TIERS, STATUSES } from "../utils/prioritization";

const EMPTY = {
  name: "",
  clientName: "",
  clientTier: "Tier 2",
  feedbackText: "",
  feedbackFrequency: 1,
  complexity: "",
  impact: 5,
  status: "Backlog",
};

export default function AddFeatureForm({ onClose, onAdd }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Feature name is required";
    if (!form.clientName.trim()) errs.clientName = "Client name is required";
    if (!form.feedbackText.trim()) errs.feedbackText = "Feedback text is required";
    const complexity = Number(form.complexity);
    if (!form.complexity || Number.isNaN(complexity) || complexity <= 0) {
      errs.complexity = "Enter effort in weeks (positive number)";
    }
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    onAdd({
      id: `feat-manual-${Date.now()}`,
      name: form.name.trim(),
      clientName: form.clientName.trim(),
      clientTier: form.clientTier,
      feedbackText: form.feedbackText.trim(),
      feedbackFrequency: Number(form.feedbackFrequency) || 1,
      complexity: Number(form.complexity),
      impact: Number(form.impact),
      status: form.status,
      quarter: null,
      manualOverride: false,
      manualScore: null,
      aiScores: {},
      manualScores: {},
      aiRationale: null,
      dependencies: [],
      createdAt: new Date().toISOString().slice(0, 10),
    });
    onClose();
  };

  const inputClass = (field) =>
    `mt-1 w-full rounded-lg border px-3 py-2 text-sm text-dark-gray focus:outline-none focus:ring-2 focus:ring-brand-blue/30 ${
      errors[field] ? "border-status-error" : "border-border-gray"
    }`;

  return (
    <Modal title="Add New Feature" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-medium-gray">Feature Name</label>
          <input className={inputClass("name")} value={form.name} onChange={update("name")} />
          {errors.name && <p className="mt-1 text-xs text-status-error">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-medium-gray">Client Name</label>
            <input className={inputClass("clientName")} value={form.clientName} onChange={update("clientName")} />
            {errors.clientName && <p className="mt-1 text-xs text-status-error">{errors.clientName}</p>}
          </div>
          <div>
            <label className="text-xs font-semibold text-medium-gray">Client Tier</label>
            <select className={inputClass("clientTier")} value={form.clientTier} onChange={update("clientTier")}>
              {CLIENT_TIERS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-medium-gray">Feedback Text</label>
          <textarea
            rows={3}
            className={inputClass("feedbackText")}
            value={form.feedbackText}
            onChange={update("feedbackText")}
          />
          {errors.feedbackText && <p className="mt-1 text-xs text-status-error">{errors.feedbackText}</p>}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-medium-gray">Effort (weeks)</label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              className={inputClass("complexity")}
              value={form.complexity}
              onChange={update("complexity")}
            />
            {errors.complexity && <p className="mt-1 text-xs text-status-error">{errors.complexity}</p>}
          </div>
          <div>
            <label className="text-xs font-semibold text-medium-gray">Impact (1-10)</label>
            <input
              type="number"
              min="1"
              max="10"
              className={inputClass("impact")}
              value={form.impact}
              onChange={update("impact")}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-medium-gray">Feedback Freq.</label>
            <input
              type="number"
              min="1"
              className={inputClass("feedbackFrequency")}
              value={form.feedbackFrequency}
              onChange={update("feedbackFrequency")}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-medium-gray">Status</label>
          <select className={inputClass("status")} value={form.status} onChange={update("status")}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border-gray px-4 py-2 text-sm font-semibold text-medium-gray hover:bg-light-gray"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue-dark"
          >
            Add Feature
          </button>
        </div>
      </form>
    </Modal>
  );
}
