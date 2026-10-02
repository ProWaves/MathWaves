"use client";
import { useState } from "react";
import VoiceInput from "./VoiceInput";
import ImageUpload from "./ImageUpload";

interface Props {
  onSubmit: (formula: string, language: string) => void;
  loading: boolean;
}

const LANGUAGES = ["Python", "C++", "Java", "MATLAB", "R", "Julia"];

const EXAMPLES = [
  { label: "Parabola", value: "y = x^2 + 3*x - 2" },
  { label: "Sinc", value: "\\frac{\\sin x}{x}" },
  { label: "3D Bowl", value: "x^2 + y^2" },
  { label: "Cardioid", value: "1 + cos(theta)" },
  { label: "Gaussian", value: "e^(-x^2)" },
];

export default function FormulaInput({ onSubmit, loading }: Props) {
  const [formula, setFormula] = useState("y = x^2 + 3*x - 2");
  const [language, setLanguage] = useState("Python");

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
      <div>
  <label className="block text-sm font-medium text-slate-700 mb-2">
    📐 Enter your formula (LaTeX or plain math)
  </label>
  <div className="flex gap-2">
    <input
      value={formula}
      onChange={(e) => setFormula(e.target.value)}
      placeholder="e.g. y = x^2 + 3*x - 2 — or click 🎤 and speak"
      className="flex-1 border border-slate-300 rounded-xl p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      onKeyDown={(e) => {
        if (e.key === "Enter" && !loading && formula.trim()) {
          onSubmit(formula, language);
        }
      }}
    />
    <VoiceInput onTranscript={(text) => setFormula(text)} />
    <ImageUpload onExtract={(latex) => setFormula(latex)} />
  </div>
</div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-slate-500 font-medium">Try:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex.label}
            onClick={() => setFormula(ex.value)}
            className="text-xs px-3 py-1 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 rounded-full transition-colors"
          >
            {ex.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {LANGUAGES.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>

        <button
          onClick={() => onSubmit(formula, language)}
          disabled={loading || !formula.trim()}
          className="flex-1 min-w-[200px] bg-gradient-to-r from-indigo-600 to-cyan-500 text-white px-6 py-2.5 rounded-xl font-medium hover:from-indigo-700 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
        >
          {loading ? "⏳ Generating..." : "🚀 Translate & Plot"}
        </button>
      </div>
    </div>
  );
}