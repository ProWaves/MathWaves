"use client";
import { useState } from "react";
import FormulaInput from "@/components/FormulaInput";
import LatexView from "@/components/LatexView";
import CodeBlock from "@/components/CodeBlock";
import GraphView from "@/components/GraphView";
import GraphControls from "@/components/GraphControls";
import ResultCard from "@/components/ResultCard";
import HistorySidebar from "@/components/HistorySidebar";
import StepIndicator from "@/components/StepIndicator";
import { translateFormula, plotFormula, explainFormula } from "@/lib/api";
import { addToHistory } from "@/lib/history";
import { friendlyError } from "@/lib/errors";
import type { TranslateResponse, PlotResponse } from "@/lib/types";

export default function Home() {
  const [result, setResult] = useState<TranslateResponse | null>(null);
  const [figure, setFigure] = useState<PlotResponse | null>(null);
  const [explanation, setExplanation] = useState("");
  const [step, setStep] = useState<"idle" | "translating" | "plotting" | "done">("idle");
  const [plotLoading, setPlotLoading] = useState(false);
  const [error, setError] = useState("");
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [lastFormula, setLastFormula] = useState("");
  const [lastLanguage, setLastLanguage] = useState("Python");

  // Graph controls
  const [plotKind, setPlotKind] = useState("auto");
  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [plotError, setPlotError] = useState("");

  async function fetchPlot(formula: string) {
    setPlotLoading(true);
    setPlotError("");
    try {
      const p = await plotFormula({
        formula,
        kind: plotKind,
        x_min: xMin,
        x_max: xMax,
      });
      setFigure(p);
    } catch (plotErr: any) {
      const detail = plotErr?.response?.data?.detail || "Could not build plot";
      setPlotError(detail);
      setFigure(null);
    } finally {
      setPlotLoading(false);
    }
  }

  async function handleSubmit(formula: string, language: string) {
    setError("");
    setResult(null);
    setFigure(null);
    setExplanation("");
    setLastFormula(formula);
    setLastLanguage(language);
    setStep("translating");

    try {
      const t = await translateFormula({ formula, language, mode: "numerical" });
      setResult(t);

      addToHistory(formula, language);
      setHistoryRefreshKey((k) => k + 1);

      setStep("plotting");
      await fetchPlot(formula);

      setStep("done");
    } catch (e: any) {
      setError(friendlyError(e));
      setStep("idle");
    }
  }

  async function handleReplot() {
    if (!lastFormula) return;
    await fetchPlot(lastFormula);
  }

  async function handleRetry() {
    if (!lastFormula) return;
    await handleSubmit(lastFormula, lastLanguage);
  }

  async function handleExplain() {
    if (!result) return;
    try {
      const res = await explainFormula(result.latex);
      setExplanation(res.explanation);
    } catch {
      setExplanation("Could not fetch explanation.");
    }
  }

  function handleHistorySelect(formula: string, language: string) {
    handleSubmit(formula, language);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <HistorySidebar
        onSelect={handleHistorySelect}
        refreshKey={historyRefreshKey}
      />

      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="wave-animate text-3xl">🌊</div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                MathWaves
              </h1>
              <p className="text-xs text-slate-500">AI Math → Code + Graph</p>
            </div>
          </div>
          <a
            href="http://127.0.0.1:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-600 hover:text-indigo-600 transition-colors"
          >
            API Docs →
          </a>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6 pr-12">
        <FormulaInput onSubmit={handleSubmit} loading={step !== "idle" && step !== "done"} />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div className="flex-1">
              <p className="font-medium">Something went wrong</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={handleRetry}
              className="text-sm px-3 py-1.5 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors whitespace-nowrap"
            >
              🔄 Retry
            </button>
          </div>
        )}

        <StepIndicator step={step} />

        {result && (
          <>
            <LatexView latex={result.latex} />
            <CodeBlock code={result.code} language={result.language} />

            <GraphControls
              plotKind={plotKind}
              setPlotKind={setPlotKind}
              xMin={xMin}
              xMax={xMax}
              setXMin={setXMin}
              setXMax={setXMax}
              onChange={handleReplot}
            />

            {plotLoading ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              </div>
            ) : figure ? (
              <GraphView figure={figure.figure_json} />
            ) : (
  <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl text-sm space-y-2">
    <p className="font-medium">📊 Graph not available</p>
    <p>{plotError || "This formula can't be plotted with the current settings."}</p>
    <p className="text-xs text-amber-700">
      💡 Try switching <strong>Graph type</strong> to <strong>Auto</strong>, or use a 1-variable formula like <code className="bg-amber-100 px-1 rounded">y = x^2</code>.
    </p>
  </div>
)}

            {(result.derivative || result.integral) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.derivative && (
                  <ResultCard title="d/dx — Derivative" latex={result.derivative} />
                )}
                {result.integral && (
                  <ResultCard title="∫ — Integral" latex={result.integral} />
                )}
              </div>
            )}

            <div className="text-center">
              <button
                onClick={handleExplain}
                className="text-sm px-5 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                📖 Explain this formula
              </button>
              {explanation && (
                <div className="mt-4 p-5 bg-white rounded-2xl border border-slate-200 text-left text-sm whitespace-pre-wrap text-slate-700">
                  {explanation}
                </div>
              )}
            </div>
          </>
        )}

        {!result && step === "idle" && !error && (
          <div className="text-center py-16 text-slate-400">
            <div className="text-6xl mb-4">🌊</div>
            <p className="text-lg">Enter a formula above to get started</p>
            <p className="text-sm mt-2">
              Powered by FastAPI + Groq + SymPy + Plotly
            </p>
          </div>
        )}
      </div>

      <footer className="text-center text-xs text-slate-400 py-8">
        Built with ❤️ using FastAPI, Next.js, Groq &amp; Plotly
      </footer>
    </main>
  );
}