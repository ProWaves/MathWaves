"use client";

interface Props {
  step: "idle" | "translating" | "plotting" | "done";
}

const STEPS = [
  { id: "translating", label: "Parsing formula", icon: "📐" },
  { id: "translating", label: "Generating code", icon: "💻" },
  { id: "plotting", label: "Building graph", icon: "📊" },
];

export default function StepIndicator({ step }: Props) {
  if (step === "idle" || step === "done") return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-700">
            {step === "translating" && "Analyzing formula and generating code..."}
            {step === "plotting" && "Building interactive graph..."}
          </p>
          <div className="mt-3 flex gap-3 text-xs">
            {STEPS.map((s, i) => {
              const active =
                (s.id === "translating" && step === "translating") ||
                (s.id === "plotting" && step === "plotting") ||
                (s.id === "translating" && step === "plotting");
              const done =
                s.id === "translating" && step === "plotting";
              return (
                <div
                  key={i}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${
                    done
                      ? "bg-green-50 text-green-700"
                      : active
                      ? "bg-indigo-50 text-indigo-700 font-medium"
                      : "text-slate-400"
                  }`}
                >
                  <span>{done ? "✓" : s.icon}</span>
                  <span>{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}