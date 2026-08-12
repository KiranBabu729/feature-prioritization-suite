import { useState } from "react";
import { IconPlus, IconTrash, IconSliders, IconDownload, IconUpload } from "../components/Icons";
import { SourceBadge } from "../components/Badges";
import { newFactorId } from "../utils/matrix";

const EMPTY_FACTOR = { name: "", description: "", weight: 1, source: "ai", manualDefault: 5 };

export default function MatrixTab({ config, onChange }) {
  const [draft, setDraft] = useState(EMPTY_FACTOR);

  const updateTierWeight = (tier, value) => {
    onChange({ ...config, tierWeights: { ...config.tierWeights, [tier]: Number(value) } });
  };

  const updateBaseFactor = (key, field, value) => {
    onChange({
      ...config,
      baseFactors: {
        ...config.baseFactors,
        [key]: { ...config.baseFactors[key], [field]: field === "enabled" ? value : Number(value) },
      },
    });
  };

  const addFactor = (e) => {
    e.preventDefault();
    if (!draft.name.trim()) return;
    onChange({
      ...config,
      customFactors: [
        ...config.customFactors,
        { id: newFactorId(), ...draft, weight: Number(draft.weight), manualDefault: Number(draft.manualDefault) },
      ],
    });
    setDraft(EMPTY_FACTOR);
  };

  const removeFactor = (id) => {
    onChange({ ...config, customFactors: config.customFactors.filter((f) => f.id !== id) });
  };

  const updateFactor = (id, field, value) => {
    onChange({
      ...config,
      customFactors: config.customFactors.map((f) =>
        f.id === id ? { ...f, [field]: field === "weight" || field === "manualDefault" ? Number(value) : value } : f,
      ),
    });
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

  const importConfig = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        onChange({ ...config, ...parsed });
      } catch {
        // ignore malformed file
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-dark-gray">Prioritization Matrix</h2>
          <p className="text-sm text-medium-gray">
            score = tierWeight × Σ(factorWeight × factorValue) / effort^effortWeight
          </p>
        </div>
        <div className="flex gap-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border-gray px-4 py-2 text-sm font-semibold text-dark-gray hover:bg-light-gray">
            <IconUpload /> Import Matrix
            <input type="file" accept=".json" className="hidden" onChange={importConfig} />
          </label>
          <button
            onClick={exportConfig}
            className="flex items-center gap-2 rounded-lg border border-border-gray px-4 py-2 text-sm font-semibold text-dark-gray hover:bg-light-gray"
          >
            <IconDownload /> Export Matrix
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="app-card p-5">
          <h3 className="mb-1 text-sm font-bold text-dark-gray">Client Tier Weights</h3>
          <p className="mb-4 text-xs text-medium-gray">Multiplier applied to the whole score</p>
          <div className="space-y-3">
            {Object.entries(config.tierWeights).map(([tier, weight]) => (
              <div key={tier} className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-dark-gray">{tier}</span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={weight}
                  onChange={(e) => updateTierWeight(tier, e.target.value)}
                  className="w-24 rounded-lg border border-border-gray px-3 py-1.5 text-sm text-right"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="app-card p-5">
          <h3 className="mb-1 text-sm font-bold text-dark-gray">Base Factors &amp; Effort</h3>
          <p className="mb-4 text-xs text-medium-gray">Built-in factors every feature carries</p>
          <div className="space-y-3">
            {Object.entries(config.baseFactors).map(([key, factor]) => (
              <div key={key} className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm font-medium text-dark-gray">
                  <input
                    type="checkbox"
                    checked={factor.enabled}
                    onChange={(e) => updateBaseFactor(key, "enabled", e.target.checked)}
                  />
                  {factor.label}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={factor.weight}
                  onChange={(e) => updateBaseFactor(key, "weight", e.target.value)}
                  className="w-24 rounded-lg border border-border-gray px-3 py-1.5 text-sm text-right"
                />
              </div>
            ))}
            <div className="flex items-center justify-between gap-3 border-t border-border-gray pt-3">
              <span className="text-sm font-medium text-dark-gray">Effort Exponent</span>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={config.effortWeight}
                onChange={(e) => onChange({ ...config, effortWeight: Number(e.target.value) })}
                className="w-24 rounded-lg border border-border-gray px-3 py-1.5 text-sm text-right"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="app-card">
        <div className="flex items-center gap-2 border-b border-border-gray px-5 py-4">
          <IconSliders className="text-brand-blue" />
          <h3 className="text-sm font-bold text-dark-gray">Custom Factors</h3>
          <span className="ml-auto text-xs text-medium-gray">{config.customFactors.length} defined</span>
        </div>

        <div className="divide-y divide-border-gray">
          {config.customFactors.map((factor) => (
            <div key={factor.id} className="grid grid-cols-12 items-center gap-3 px-5 py-3">
              <div className="col-span-3">
                <input
                  value={factor.name}
                  onChange={(e) => updateFactor(factor.id, "name", e.target.value)}
                  className="w-full rounded-lg border border-border-gray px-2 py-1.5 text-sm font-semibold"
                />
              </div>
              <div className="col-span-4">
                <input
                  value={factor.description}
                  onChange={(e) => updateFactor(factor.id, "description", e.target.value)}
                  className="w-full rounded-lg border border-border-gray px-2 py-1.5 text-xs text-medium-gray"
                />
              </div>
              <div className="col-span-1">
                <input
                  type="number"
                  step="0.1"
                  value={factor.weight}
                  onChange={(e) => updateFactor(factor.id, "weight", e.target.value)}
                  className="w-full rounded-lg border border-border-gray px-2 py-1.5 text-sm text-right"
                />
              </div>
              <div className="col-span-2">
                <select
                  value={factor.source}
                  onChange={(e) => updateFactor(factor.id, "source", e.target.value)}
                  className="w-full rounded-lg border border-border-gray px-2 py-1.5 text-xs"
                >
                  <option value="ai">AI-scored</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
              <div className="col-span-1 flex justify-center">
                <SourceBadge source={factor.source} />
              </div>
              <div className="col-span-1 flex justify-end">
                <button
                  onClick={() => removeFactor(factor.id)}
                  className="rounded-md p-1.5 text-medium-gray hover:bg-status-error-bg hover:text-status-error"
                >
                  <IconTrash />
                </button>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={addFactor} className="grid grid-cols-12 items-center gap-3 border-t border-border-gray px-5 py-4">
          <input
            placeholder="Factor name (e.g. Regulatory Urgency)"
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            className="col-span-3 rounded-lg border border-border-gray px-2 py-1.5 text-sm"
          />
          <input
            placeholder="Description shown to the AI scorer"
            value={draft.description}
            onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            className="col-span-4 rounded-lg border border-border-gray px-2 py-1.5 text-sm"
          />
          <input
            type="number"
            step="0.1"
            placeholder="Weight"
            value={draft.weight}
            onChange={(e) => setDraft((d) => ({ ...d, weight: e.target.value }))}
            className="col-span-1 rounded-lg border border-border-gray px-2 py-1.5 text-sm"
          />
          <select
            value={draft.source}
            onChange={(e) => setDraft((d) => ({ ...d, source: e.target.value }))}
            className="col-span-2 rounded-lg border border-border-gray px-2 py-1.5 text-xs"
          >
            <option value="ai">AI-scored</option>
            <option value="manual">Manual</option>
          </select>
          <button
            type="submit"
            className="col-span-2 flex items-center justify-center gap-1.5 rounded-lg bg-brand-blue px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-blue-dark"
          >
            <IconPlus /> Add Factor
          </button>
        </form>
      </div>
    </div>
  );
}
