import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { TierBadge, StatusBadge } from "../components/Badges";
import { IconLink } from "../components/Icons";
import { QUARTERS, weeksToLabel } from "../utils/prioritization";

const TEAM_CAPACITY_WEEKS = 40;

const CAPACITY_COLOR = (pct) => {
  if (pct > 100) return "bg-status-error";
  if (pct > 80) return "bg-status-warning";
  return "bg-status-success";
};

export default function Roadmap({ rankedFeatures, onMoveFeature }) {
  const columns = [
    { id: "unscheduled", label: "Unscheduled", quarter: null },
    ...QUARTERS.map((q) => ({ id: q, label: q, quarter: q })),
  ];

  const featuresByColumn = (colId) =>
    rankedFeatures.filter((f) => (colId === "unscheduled" ? !f.quarter : f.quarter === colId));

  const allDependencies = [...new Set(rankedFeatures.flatMap((f) => f.dependencies || []))];

  const handleDragEnd = (result) => {
    const { destination, draggableId } = result;
    if (!destination) return;
    const newQuarter = destination.droppableId === "unscheduled" ? null : destination.droppableId;
    onMoveFeature(draggableId, newQuarter);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-6">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          {columns.map((col) => {
            const features = featuresByColumn(col.id);
            const usedWeeks = features.reduce((sum, f) => sum + Number(f.complexity), 0);
            const pct = col.quarter ? Math.round((usedWeeks / TEAM_CAPACITY_WEEKS) * 100) : null;

            return (
              <div key={col.id} className="app-card flex flex-col">
                <div className="border-b border-border-gray px-4 py-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-dark-gray">{col.label}</h3>
                    <span className="text-xs font-semibold text-medium-gray">{features.length}</span>
                  </div>
                  {col.quarter && (
                    <div className="mt-2">
                      <div className="mb-1 flex items-center justify-between text-[11px] text-medium-gray">
                        <span>Team capacity</span>
                        <span>{usedWeeks}w / {TEAM_CAPACITY_WEEKS}w</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-light-gray">
                        <div
                          className={`h-full rounded-full ${CAPACITY_COLOR(pct)}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 space-y-2 p-3 min-h-[120px] transition-colors ${
                        snapshot.isDraggingOver ? "bg-brand-blue-light" : ""
                      }`}
                    >
                      {features.map((f, index) => (
                        <Draggable key={f.id} draggableId={f.id} index={index}>
                          {(dragProvided, dragSnapshot) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              className={`rounded-lg border border-border-gray bg-white p-3 shadow-sm ${
                                dragSnapshot.isDragging ? "ring-2 ring-brand-blue" : ""
                              }`}
                            >
                              <div className="mb-1.5 flex items-start justify-between gap-2">
                                <p className="text-xs font-bold leading-tight text-dark-gray">{f.name}</p>
                                <TierBadge tier={f.clientTier} />
                              </div>
                              <p className="text-[11px] text-medium-gray">{f.clientName}</p>
                              <div className="mt-2 flex items-center justify-between">
                                <StatusBadge status={f.status} />
                                <span className="text-[11px] font-semibold text-medium-gray">
                                  {weeksToLabel(f.complexity)}
                                </span>
                              </div>
                              {f.dependencies?.length > 0 && (
                                <div className="mt-2 flex items-center gap-1 text-[11px] text-status-warning">
                                  <IconLink />
                                  {f.dependencies.length} dependenc{f.dependencies.length > 1 ? "ies" : "y"}
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="app-card p-5">
          <h3 className="text-sm font-bold text-dark-gray">Dependencies</h3>
          <p className="mb-3 text-xs text-medium-gray">Cross-feature blockers to sequence around</p>
          {allDependencies.length === 0 ? (
            <p className="text-sm text-medium-gray">No dependencies recorded.</p>
          ) : (
            <ul className="space-y-2">
              {allDependencies.map((dep) => {
                const blockers = rankedFeatures.filter((f) => f.dependencies?.includes(dep));
                return (
                  <li key={dep} className="flex items-start gap-2 rounded-lg bg-light-gray px-3 py-2 text-xs">
                    <IconLink className="mt-0.5 shrink-0 text-brand-blue" />
                    <div>
                      <span className="font-semibold text-dark-gray">{dep}</span>
                      <span className="text-medium-gray"> — blocks {blockers.map((b) => b.name).join(", ")}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="app-card p-5">
          <h3 className="text-sm font-bold text-dark-gray">Status Legend</h3>
          <p className="mb-3 text-xs text-medium-gray">Drag feature cards between quarters to update the roadmap</p>
          <div className="grid grid-cols-2 gap-3">
            {["Backlog", "Planned", "In Progress", "Done"].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <StatusBadge status={s} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
