import { useRef, useState } from "react";
import { TierBadge } from "../components/Badges";
import { IconUpload, IconTrash, IconPlus } from "../components/Icons";
import { CLIENT_TIERS } from "../utils/matrix";
import { parseImportJSON } from "../utils/importItems";

const EMPTY_FORM = {
  name: "",
  clientName: "",
  clientTier: "Tier 2",
  feedbackText: "",
  complexity: 4,
  impact: 5,
  feedbackFrequency: 1,
};

export default function DataTab({ items, onSetItems, onDeleteItem }) {
  const [importError, setImportError] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsedItems = parseImportJSON(e.target.result);
        onSetItems((prev) => [...parsedItems, ...prev]);
        setImportError(null);
      } catch (err) {
        setImportError(err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.clientName.trim() || !form.feedbackText.trim()) return;
    onSetItems((prev) => [
      {
        id: `item-manual-${Date.now()}`,
        ...form,
        complexity: Number(form.complexity),
        impact: Number(form.impact),
        feedbackFrequency: Number(form.feedbackFrequency),
        aiScores: {},
        manualScores: {},
        aiRationale: null,
        manualScoreOverride: null,
      },
      ...prev,
    ]);
    setForm(EMPTY_FORM);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-6">
      <div className="app-card p-5">
        <h3 className="text-sm font-bold text-dark-gray">Import Feedback</h3>
        <p className="mb-3 text-xs text-medium-gray">
          Upload the Feature Prioritization app's exported JSON, or a plain JSON array of items
        </p>
        <div
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed border-border-gray px-4 py-6 hover:border-brand-blue"
        >
          <IconUpload className="text-brand-blue" />
          <span className="text-sm text-medium-gray">Click to select a .json file</span>
          <input
            ref={inputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
        {importError && (
          <p className="mt-2 text-xs font-semibold text-status-error">{importError}</p>
        )}
      </div>

      <div className="app-card p-5">
        <h3 className="mb-3 text-sm font-bold text-dark-gray">Add Feedback Item Manually</h3>
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Feature / feedback name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="rounded-lg border border-border-gray px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
            <input
              placeholder="Client name"
              value={form.clientName}
              onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
              className="rounded-lg border border-border-gray px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
          </div>
          <textarea
            placeholder="Feedback text"
            rows={2}
            value={form.feedbackText}
            onChange={(e) => setForm((f) => ({ ...f, feedbackText: e.target.value }))}
            className="w-full rounded-lg border border-border-gray px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          />
          <div className="grid grid-cols-4 gap-3">
            <select
              value={form.clientTier}
              onChange={(e) => setForm((f) => ({ ...f, clientTier: e.target.value }))}
              className="rounded-lg border border-border-gray px-3 py-2 text-sm"
            >
              {CLIENT_TIERS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <input
              type="number"
              min="0.5"
              step="0.5"
              placeholder="Effort (wk)"
              value={form.complexity}
              onChange={(e) => setForm((f) => ({ ...f, complexity: e.target.value }))}
              className="rounded-lg border border-border-gray px-3 py-2 text-sm"
            />
            <input
              type="number"
              min="1"
              max="10"
              placeholder="Impact"
              value={form.impact}
              onChange={(e) => setForm((f) => ({ ...f, impact: e.target.value }))}
              className="rounded-lg border border-border-gray px-3 py-2 text-sm"
            />
            <input
              type="number"
              min="1"
              placeholder="Frequency"
              value={form.feedbackFrequency}
              onChange={(e) => setForm((f) => ({ ...f, feedbackFrequency: e.target.value }))}
              className="rounded-lg border border-border-gray px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue-dark"
          >
            <IconPlus /> Add Item
          </button>
        </form>
      </div>

      <div className="app-card">
        <div className="border-b border-border-gray px-5 py-4">
          <h3 className="text-sm font-bold text-dark-gray">Feedback Items ({items.length})</h3>
        </div>
        <div className="divide-y divide-border-gray">
          {items.length === 0 && (
            <p className="px-5 py-6 text-sm text-medium-gray">
              No items yet — import a JSON file or add one manually above.
            </p>
          )}
          {items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-3 px-5 py-3">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <p className="text-sm font-semibold text-dark-gray">{item.name}</p>
                  <TierBadge tier={item.clientTier} />
                </div>
                <p className="text-xs text-medium-gray">{item.clientName}</p>
                <p className="mt-1 line-clamp-2 text-xs text-medium-gray">{item.feedbackText}</p>
              </div>
              <button
                onClick={() => onDeleteItem(item.id)}
                className="shrink-0 rounded-md p-1.5 text-medium-gray hover:bg-status-error-bg hover:text-status-error"
              >
                <IconTrash />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
