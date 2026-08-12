import { useEffect, useState } from "react";
import TabNav from "./components/TabNav";
import DataTab from "./tabs/DataTab";
import MatrixTab from "./tabs/MatrixTab";
import PrioritizeTab from "./tabs/PrioritizeTab";
import { loadConfig, saveConfig, loadItems, saveItems } from "./utils/storage";

export default function App() {
  const [activeTab, setActiveTab] = useState("Data");
  const [config, setConfig] = useState(loadConfig);
  const [items, setItems] = useState(loadItems);

  useEffect(() => saveConfig(config), [config]);
  useEffect(() => saveItems(items), [items]);

  const handleUpdateItem = (id, updates) =>
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));

  const handleDeleteItem = (id) => setItems((prev) => prev.filter((item) => item.id !== id));

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <header className="border-b border-border-gray bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-blue text-sm font-extrabold text-white">
              N
            </div>
            <div>
              <h1 className="text-base font-extrabold text-dark-gray">PDL Prioritization Studio</h1>
              <p className="text-xs text-medium-gray">
                Configurable prioritization matrix + AI-assisted scoring
              </p>
            </div>
          </div>
        </div>
      </header>

      <TabNav active={activeTab} onChange={setActiveTab} />

      {activeTab === "Data" && (
        <DataTab items={items} onSetItems={setItems} onDeleteItem={handleDeleteItem} />
      )}
      {activeTab === "Matrix" && <MatrixTab config={config} onChange={setConfig} />}
      {activeTab === "Prioritize" && (
        <PrioritizeTab items={items} config={config} onUpdateItem={handleUpdateItem} />
      )}
    </div>
  );
}
