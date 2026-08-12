import { useEffect, useMemo, useState } from "react";
import TabNav from "./components/TabNav";
import AddFeatureForm from "./components/AddFeatureForm";
import CSVUpload from "./components/CSVUpload";
import FeatureDetailModal from "./components/FeatureDetailModal";
import { IconPlus, IconUpload } from "./components/Icons";
import Dashboard from "./tabs/Dashboard";
import Analysis from "./tabs/Analysis";
import Roadmap from "./tabs/Roadmap";
import Reports from "./tabs/Reports";
import SetupTab from "./tabs/SetupTab";
import { sampleFeatures } from "./data/sampleData";
import { loadFeatures, saveFeatures } from "./utils/storage";
import { loadMatrixConfig, saveMatrixConfig } from "./utils/matrixConfig";
import { rankFeatures } from "./utils/prioritization";

export default function App() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [features, setFeatures] = useState(() => loadFeatures(sampleFeatures));
  const [config, setConfig] = useState(loadMatrixConfig);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);

  useEffect(() => {
    saveFeatures(features);
  }, [features]);

  useEffect(() => {
    saveMatrixConfig(config);
  }, [config]);

  const rankedFeatures = useMemo(() => rankFeatures(features, config), [features, config]);

  const handleAddFeature = (feature) => setFeatures((prev) => [feature, ...prev]);
  const handleImportFeatures = (imported) => setFeatures((prev) => [...imported, ...prev]);
  const handleMoveFeature = (id, quarter) =>
    setFeatures((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, quarter, status: quarter && f.status === "Backlog" ? "Planned" : f.status } : f,
      ),
    );
  const handleUpdateFeature = (id, updates) =>
    setFeatures((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  const handleDeleteFeature = (id) => setFeatures((prev) => prev.filter((f) => f.id !== id));
  const handleClearFeatures = () => setFeatures([]);

  const selected = selectedFeature
    ? rankedFeatures.find((f) => f.id === selectedFeature.id) || selectedFeature
    : null;

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <header className="border-b border-border-gray bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-blue text-sm font-extrabold text-white">
              N
            </div>
            <div>
              <h1 className="text-base font-extrabold text-dark-gray">Feature Prioritization &amp; Roadmap</h1>
              <p className="text-xs text-medium-gray">Product Delivery Lead workspace</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCSVUpload(true)}
              className="flex items-center gap-2 rounded-lg border border-border-gray px-4 py-2 text-sm font-semibold text-dark-gray hover:bg-light-gray"
            >
              <IconUpload /> Upload CSV
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue-dark"
            >
              <IconPlus /> Add Feature
            </button>
          </div>
        </div>
      </header>

      <TabNav active={activeTab} onChange={setActiveTab} />

      {activeTab === "Dashboard" && (
        <Dashboard rankedFeatures={rankedFeatures} config={config} onSelectFeature={setSelectedFeature} />
      )}
      {activeTab === "Analysis" && <Analysis rankedFeatures={rankedFeatures} config={config} />}
      {activeTab === "Roadmap" && (
        <Roadmap rankedFeatures={rankedFeatures} onMoveFeature={handleMoveFeature} />
      )}
      {activeTab === "Reports" && <Reports rankedFeatures={rankedFeatures} />}
      {activeTab === "Setup" && (
        <SetupTab
          config={config}
          onSetConfig={setConfig}
          features={features}
          onUpdateFeature={handleUpdateFeature}
          onClearFeatures={handleClearFeatures}
        />
      )}

      {showAddForm && (
        <AddFeatureForm onClose={() => setShowAddForm(false)} onAdd={handleAddFeature} />
      )}
      {showCSVUpload && (
        <CSVUpload onClose={() => setShowCSVUpload(false)} onImport={handleImportFeatures} />
      )}
      {selected && (
        <FeatureDetailModal
          feature={selected}
          config={config}
          onClose={() => setSelectedFeature(null)}
          onUpdate={handleUpdateFeature}
          onDelete={handleDeleteFeature}
        />
      )}
    </div>
  );
}
