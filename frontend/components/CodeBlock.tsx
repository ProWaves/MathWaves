"use client";
import { useEffect, useRef, useState } from "react";
import hljs from "highlight.js";

interface Props {
  code: string;
  language: string;
}

const EXT: Record<string, string> = {
  Python: "py",
  "C++": "cpp",
  Java: "java",
  MATLAB: "m",
  R: "R",
  Julia: "jl",
};

export default function CodeBlock({ code, language }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (ref.current) {
      ref.current.removeAttribute("data-highlighted");
      hljs.highlightElement(ref.current);
    }
  }, [code]);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mathwaves.${EXT[language] || "txt"}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex justify-between items-center px-5 py-3 border-b border-slate-200 bg-slate-50">
        <span className="text-sm font-medium text-slate-700">
          💻 {language} Code
        </span>
        <div className="flex gap-2">
          <button
            onClick={copy}
            className="text-xs px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            {copied ? "✅ Copied" : "📋 Copy"}
          </button>
          <button
            onClick={download}
            className="text-xs px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            ⬇️ Download
          </button>
        </div>
      </div>
      <pre className="code-scroll p-5 text-sm overflow-auto max-h-[480px]">
        <code ref={ref} className={`language-${language.toLowerCase()}`}>
          {code}
        </code>
      </pre>
    </div>
  );
}