const API_BASE = import.meta.env.VITE_API_BASE || "";

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

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
