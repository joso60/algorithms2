import React from 'react';
import type { ProcessResult } from '../engine/types';
import { trunc2 } from '../engine/scheduler';
import { getColor } from './GanttChart';

interface ResultsTableProps {
  results: ProcessResult[];
  showPriority: boolean;
  avgTAT: number;
  avgWT: number;
  throughput: number;
  totalTime: number;
  lastCT: number;
  firstAT: number;
  highlightPid?: string | null;
  onHoverPid?: (pid: string | null) => void;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({
  results,
  showPriority,
  avgTAT,
  avgWT,
  throughput,
  totalTime,
  lastCT,
  firstAT,
  highlightPid,
  onHoverPid,
}) => {
  const n = results.length || 1;
  const sumTAT = results.reduce((acc, r) => acc + r.turnaround, 0);
  const sumWT = results.reduce((acc, r) => acc + r.waiting, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Calculation & Metrics Table
        </h4>
        <span className="text-xs text-slate-400 italic">
          Formulas: T.A.T = C.T - A.T | W.T = T.A.T - B.T
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100/90 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-700 text-xs uppercase font-semibold text-slate-600 dark:text-slate-300">
            <tr>
              <th className="px-3.5 py-2.5">Process</th>
              <th className="px-3.5 py-2.5">Burst Time (B.T)</th>
              <th className="px-3.5 py-2.5">Arrival Time (A.T)</th>
              {showPriority && <th className="px-3.5 py-2.5">Priority (P)</th>}
              <th className="px-3.5 py-2.5 font-bold text-indigo-600 dark:text-indigo-400">
                Completion (C.T)
              </th>
              <th className="px-3.5 py-2.5 font-bold text-blue-600 dark:text-blue-400">
                Turnaround (T.A.T)
              </th>
              <th className="px-3.5 py-2.5 font-bold text-emerald-600 dark:text-emerald-400">
                Waiting (W.T)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
            {results.map((r) => {
              const color = getColor(r.pid);
              const isHighlighted = highlightPid === r.pid;

              return (
                <tr
                  key={r.pid}
                  onMouseEnter={() => onHoverPid?.(r.pid)}
                  onMouseLeave={() => onHoverPid?.(null)}
                  className={`transition-colors cursor-pointer ${
                    isHighlighted
                      ? 'bg-indigo-500/10 dark:bg-indigo-500/20'
                      : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <td className="px-3.5 py-2.5 font-bold">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs border ${color.border} ${color.bg} ${color.text}`}>
                      {r.pid}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5 font-mono text-slate-600 dark:text-slate-300">
                    {r.burst}
                  </td>
                  <td className="px-3.5 py-2.5 font-mono text-slate-600 dark:text-slate-300">
                    {r.arrival}
                  </td>
                  {showPriority && (
                    <td className="px-3.5 py-2.5 font-mono text-slate-600 dark:text-slate-300">
                      {r.priority}
                    </td>
                  )}
                  <td className="px-3.5 py-2.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {r.completion}
                  </td>
                  <td className="px-3.5 py-2.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {r.turnaround}
                    <span className="text-[10px] text-slate-400 font-normal ml-1">
                      ({r.completion} - {r.arrival})
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {r.waiting}
                    <span className="text-[10px] text-slate-400 font-normal ml-1">
                      ({r.turnaround} - {r.burst})
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Academic Totals & Averages Footer */}
          <tfoot className="bg-slate-50 dark:bg-slate-800/40 font-semibold border-t border-slate-200 dark:border-slate-700 text-xs">
            <tr>
              <td colSpan={showPriority ? 4 : 3} className="px-3.5 py-2.5 text-right uppercase text-slate-500">
                Sum / Total:
              </td>
              <td className="px-3.5 py-2.5 font-mono text-slate-400">—</td>
              <td className="px-3.5 py-2.5 font-mono text-blue-700 dark:text-blue-400">
                {sumTAT}
              </td>
              <td className="px-3.5 py-2.5 font-mono text-emerald-700 dark:text-emerald-400">
                {sumWT}
              </td>
            </tr>
            <tr className="bg-indigo-500/5 dark:bg-indigo-500/10 text-slate-900 dark:text-white">
              <td colSpan={showPriority ? 4 : 3} className="px-3.5 py-2.5 text-right uppercase font-bold text-indigo-700 dark:text-indigo-300">
                Average (Avg. = Total / {n}):
              </td>
              <td className="px-3.5 py-2.5 font-mono text-slate-400">—</td>
              <td className="px-3.5 py-2.5 font-mono font-bold text-base text-blue-600 dark:text-blue-400">
                {trunc2(avgTAT)}
              </td>
              <td className="px-3.5 py-2.5 font-mono font-bold text-base text-emerald-600 dark:text-emerald-400">
                {trunc2(avgWT)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="card p-3.5 border-l-4 border-l-blue-500 flex flex-col justify-between">
          <span className="text-xs uppercase font-medium text-slate-500 dark:text-slate-400">
            Average Turnaround Time (Avg. T.A.T)
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
              {trunc2(avgTAT)}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {sumTAT} / {n}
            </span>
          </div>
        </div>

        <div className="card p-3.5 border-l-4 border-l-emerald-500 flex flex-col justify-between">
          <span className="text-xs uppercase font-medium text-slate-500 dark:text-slate-400">
            Average Waiting Time (Avg. W.T)
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {trunc2(avgWT)}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {sumWT} / {n}
            </span>
          </div>
        </div>

        <div className="card p-3.5 border-l-4 border-l-indigo-500 flex flex-col justify-between">
          <span className="text-xs uppercase font-medium text-slate-500 dark:text-slate-400">
            Throughput (Completed / Span)
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
              {trunc2(throughput)}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {n} / ({lastCT} - {firstAT}) = {n}/{totalTime}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
