"use client";
import { BlockMath } from "react-katex";

interface Props {
  latex: string;
}

export default function LatexView({ latex }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-sm font-medium text-slate-500 mb-3">
        📐 Parsed Formula
      </h2>
      <div className="text-center text-xl py-4 overflow-x-auto">
        <BlockMath math={latex} />
      </div>
    </div>
  );
}