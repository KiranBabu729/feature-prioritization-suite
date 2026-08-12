const STORAGE_KEY = "roadmap-features";

export function loadFeatures(fallback) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return fallback;
    return parsed;
  } catch {
    return fallback;
  }
}

export function saveFeatures(features) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(features));
  } catch {
    // storage unavailable or quota exceeded — fail silently
  }
}

export function resetFeatures() {
  localStorage.removeItem(STORAGE_KEY);
}
