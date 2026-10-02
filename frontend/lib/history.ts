export interface HistoryEntry {
  id: string;
  formula: string;
  language: string;
  timestamp: number;
}

const STORAGE_KEY = "mathwaves_history";
const MAX_ENTRIES = 20;

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addToHistory(
  formula: string,
  language: string
): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  const current = getHistory();

  // Deduplicate: remove any existing entry with same formula+language
  const filtered = current.filter(
    (e) => !(e.formula === formula && e.language === language)
  );

  const newEntry: HistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    formula,
    language,
    timestamp: Date.now(),
  };

  const updated = [newEntry, ...filtered].slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function removeFromHistory(id: string): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  const updated = getHistory().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function clearHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  localStorage.removeItem(STORAGE_KEY);
  return [];
}

export function formatTimestamp(ts: number): string {
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}