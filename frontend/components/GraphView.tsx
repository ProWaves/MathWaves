"use client";
import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface Props {
  figure: { data: any[]; layout: any };
}

export default function GraphView({ figure }: Props) {
  if (!figure) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
      <h2 className="text-sm font-medium text-slate-500 mb-3 px-2">
        📊 Interactive Graph
      </h2>
      <Plot
        data={figure.data}
        layout={{
          ...figure.layout,
          autosize: true,
          margin: { l: 50, r: 30, t: 50, b: 50 },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
        }}
        style={{ width: "100%", height: "480px" }}
        useResizeHandler
        config={{ responsive: true, displaylogo: false }}
      />
    </div>
  );
}