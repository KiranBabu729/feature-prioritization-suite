const API_BASE = import.meta.env.VITE_SCORING_API_BASE || "";

// Calls the same scoring server PDL Prioritization Studio uses, so a
// matrix config exported from Studio can be run against Roadmap features
// without ever going back to Studio.
export async function scoreBatch(items, factors, concurrency = 4) {
  const res = await fetch(`${API_BASE}/api/score-batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items, factors, concurrency }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Scoring request failed (${res.status})`);
  }

  const { results } = await res.json();
  return results;
}
