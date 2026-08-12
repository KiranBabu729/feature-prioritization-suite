const TABS = ["Data", "Matrix", "Prioritize"];

export default function TabNav({ active, onChange }) {
  return (
    <div className="border-b border-border-gray bg-white px-6">
      <div className="mx-auto flex max-w-6xl gap-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`app-tab ${active === tab ? "app-tab-active" : ""}`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
