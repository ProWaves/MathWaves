"use client";
import { BlockMath } from "react-katex";

interface Props {
  title: string;
  latex: string;
}

export default function ResultCard({ title, latex }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
      <h3 className="text-xs font-medium text-slate-500 mb-2">{title}</h3>
      <div className="overflow-x-auto">
        <BlockMath math={latex} />
      </div>
    </div>
  );
}