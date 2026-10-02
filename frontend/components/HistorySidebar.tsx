"use client";
import { useEffect, useState } from "react";
import {
  HistoryEntry,
  getHistory,
  removeFromHistory,
  clearHistory,
  formatTimestamp,
} from "@/lib/history";

interface Props {
  onSelect: (formula: string, language: string) => void;
  refreshKey: number; // bump this to force a re-read after new entries
}

export default function HistorySidebar({ onSelect, refreshKey }: Props) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setEntries(getHistory());
  }, [refreshKey]);

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEntries(removeFromHistory(id));
  };

  const handleClear = () => {
    if (confirm("Clear all history?")) {
      setEntries(clearHistory());
    }
  };

  return (
    <>
      {/* Toggle button (fixed on right edge) */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-30 bg-indigo-600 text-white px-2 py-4 rounded-l-xl shadow-lg hover:bg-indigo-700 transition-colors"
        title={open ? "Close history" : "Open history"}
      >
        <span className="writing-mode-vertical text-xs font-medium">
          {open ? "✕" : `📜 (${entries.length})`}
        </span>
      </button>

      {/* Sidebar panel */}
      <aside
        className={`fixed right-0 top-0 h-full w-80 bg-white shadow-2xl border-l border-slate-200 z-20 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div>
            <h2 className="font-semibold text-slate-800">📜 History</h2>
            <p className="text-xs text-slate-500">
              Last {entries.length} formula{entries.length === 1 ? "" : "s"}
            </p>
          </div>
          {entries.length > 0 && (
            <button
              onClick={handleClear}
              className="text-xs text-red-600 hover:text-red-700 hover:underline"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="overflow-y-auto h-[calc(100%-73px)]">
          {entries.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              <div className="text-4xl mb-3">📭</div>
              <p>No history yet.</p>
              <p className="mt-1 text-xs">
                Formulas you translate will appear here.
              </p>
            </div>
          ) : (
           <ul className="divide-y divide-slate-100">
  {entries.map((entry) => (
    <li key={entry.id}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          onSelect(entry.formula, entry.language);
          setOpen(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(entry.formula, entry.language);
            setOpen(false);
          }
        }}
        className="w-full text-left px-5 py-3 hover:bg-slate-50 transition-colors group cursor-pointer focus:outline-none focus:bg-slate-50"
      >
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-mono text-xs text-slate-800 truncate">
              {entry.formula}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              {entry.language} · {formatTimestamp(entry.timestamp)}
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => handleRemove(entry.id, e)}
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-slate-400 hover:text-red-500 text-lg leading-none px-1 transition-opacity"
            title="Delete"
            aria-label={`Delete ${entry.formula}`}
          >
            ×
          </button>
        </div>
      </div>
    </li>
  ))}
</ul>
          )}
        </div>
      </aside>

      {/* Dark overlay when open (mobile-friendly) */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/20 z-10 md:hidden"
        />
      )}
    </>
  );
}