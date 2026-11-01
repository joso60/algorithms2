import React from 'react';
import type { Process } from '../engine/types';
import { Plus, Trash2, Zap } from 'lucide-react';

interface ProcessTableProps {
  processes: Process[];
  onChange: (processes: Process[]) => void;
  showPriority: boolean;
  onSetAllZeroArrival: () => void;
}

export const ProcessTable: React.FC<ProcessTableProps> = ({
  processes,
  onChange,
  showPriority,
  onSetAllZeroArrival,
}) => {
  const handleAddProcess = () => {
    const nextIdx = processes.length;
    const newProc: Process = {
      pid: `P${nextIdx}`,
      arrival: 0,
      burst: 4,
      priority: 1,
    };
    onChange([...processes, newProc]);
  };

  const handleRemoveProcess = (index: number) => {
    if (processes.length <= 1) return;
    const next = processes.filter((_, i) => i !== index);
    onChange(next);
  };

  const handleChange = (index: number, field: keyof Process, value: string | number) => {
    const next = [...processes];
    const item = { ...next[index] };
    if (field === 'pid') {
      item.pid = String(value);
    } else {
      const num = parseInt(String(value), 10);
      item[field] = isNaN(num) ? 0 : Math.max(0, num);
    }
    next[index] = item;
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Process Inputs Table
        </h4>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSetAllZeroArrival}
            className="btn-ghost text-xs px-2.5 py-1 text-slate-600 dark:text-slate-300"
            title="Set all arrival times to 0 (Slide Default)"
          >
            <Zap className="h-3.5 w-3.5 text-amber-500" /> All A.T = 0
          </button>
          <button
            type="button"
            onClick={handleAddProcess}
            className="btn-primary text-xs px-2.5 py-1"
          >
            <Plus className="h-3.5 w-3.5" /> Add Process
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100/75 dark:bg-slate-800/75 text-xs uppercase font-semibold text-slate-600 dark:text-slate-300">
            <tr>
              <th className="px-3 py-2.5">Process</th>
              <th className="px-3 py-2.5">Arrival Time (A.T)</th>
              <th className="px-3 py-2.5">Burst Time (B.T)</th>
              {showPriority && <th className="px-3 py-2.5">Priority (P)</th>}
              <th className="px-3 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
            {processes.map((p, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={p.pid}
                    onChange={(e) => handleChange(idx, 'pid', e.target.value)}
                    className="input w-20 font-bold font-mono text-center"
                    placeholder="PID"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    value={p.arrival}
                    onChange={(e) => handleChange(idx, 'arrival', e.target.value)}
                    className="input w-28 font-mono text-center"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={1}
                    value={p.burst}
                    onChange={(e) => handleChange(idx, 'burst', e.target.value)}
                    className="input w-28 font-mono text-center font-semibold"
                  />
                </td>
                {showPriority && (
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={p.priority}
                      onChange={(e) => handleChange(idx, 'priority', e.target.value)}
                      className="input w-28 font-mono text-center"
                    />
                  </td>
                )}
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => handleRemoveProcess(idx)}
                    disabled={processes.length <= 1}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-30 transition-colors cursor-pointer"
                    title="Remove Process"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
