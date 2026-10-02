"use client";

interface Props {
  plotKind: string;
  setPlotKind: (v: string) => void;
  xMin: number;
  xMax: number;
  setXMin: (v: number) => void;
  setXMax: (v: number) => void;
  onChange: () => void; // triggers re-plot
}

export default function GraphControls({
  plotKind,
  setPlotKind,
  xMin,
  xMax,
  setXMin,
  setXMax,
  onChange,
}: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-wrap items-end gap-4">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">
          Graph type
        </label>
        <select
          value={plotKind}
          onChange={(e) => {
            setPlotKind(e.target.value);
            setTimeout(onChange, 0);
          }}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="auto">Auto-detect</option>
          <option value="2d">2D Line</option>
          <option value="3d">3D Surface</option>
          <option value="polar">Polar</option>
        </select>
      </div>

      {plotKind !== "3d" && plotKind !== "polar" && (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              X range: [{xMin}, {xMax}]
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={xMin}
                onChange={(e) => setXMin(Number(e.target.value))}
                onBlur={onChange}
                className="w-24 border border-slate-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-slate-400 text-sm">to</span>
              <input
                type="number"
                value={xMax}
                onChange={(e) => setXMax(Number(e.target.value))}
                onBlur={onChange}
                className="w-24 border border-slate-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            onClick={onChange}
            className="text-xs px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            🔄 Re-plot
          </button>
        </>
      )}
    </div>
  );
}