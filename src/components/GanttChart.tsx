import React from 'react';
import type { Slice } from '../engine/types';

interface GanttChartProps {
  slices: Slice[];
  totalTime: number;
  currentTime?: number;
  isSynchronized?: boolean;
  highlightPid?: string | null;
  onSliceHover?: (pid: string | null) => void;
}

// Color palette for processes
const PROCESS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  P0: { bg: 'bg-blue-500/15 dark:bg-blue-500/20', border: 'border-blue-500/50', text: 'text-blue-700 dark:text-blue-300' },
  P1: { bg: 'bg-emerald-500/15 dark:bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-700 dark:text-emerald-300' },
  P2: { bg: 'bg-indigo-500/15 dark:bg-indigo-500/20', border: 'border-indigo-500/50', text: 'text-indigo-700 dark:text-indigo-300' },
  P3: { bg: 'bg-amber-500/15 dark:bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-700 dark:text-amber-300' },
  P4: { bg: 'bg-rose-500/15 dark:bg-rose-500/20', border: 'border-rose-500/50', text: 'text-rose-700 dark:text-rose-300' },
  P5: { bg: 'bg-teal-500/15 dark:bg-teal-500/20', border: 'border-teal-500/50', text: 'text-teal-700 dark:text-teal-300' },
  P6: { bg: 'bg-slate-500/15 dark:bg-slate-500/20', border: 'border-slate-500/50', text: 'text-slate-700 dark:text-slate-300' },
};

export const getColor = (pid: string | null) => {
  if (!pid) {
    // Idle time is shown as a neutral, dimmed block
    return {
      bg: 'bg-slate-500/10 dark:bg-slate-500/10',
      border: 'border-slate-500/40',
      text: 'text-slate-500 dark:text-slate-400 font-medium',
    };
  }
  return (
    PROCESS_COLORS[pid] || {
      bg: 'bg-blue-500/15 dark:bg-blue-500/20',
      border: 'border-blue-500/50',
      text: 'text-blue-700 dark:text-blue-300',
    }
  );
};

export const GanttChart: React.FC<GanttChartProps> = ({
  slices,
  totalTime,
  currentTime,
  isSynchronized = false,
  highlightPid,
  onSliceHover,
}) => {
  if (!slices.length || totalTime <= 0) {
    return (
      <div className="py-8 text-center text-sm text-slate-400">
        No execution slices available to render Gantt Chart.
      </div>
    );
  }

  // Calculate visible slices when synchronized with Ready Queue playback
  const effectiveTime =
    isSynchronized && currentTime !== undefined
      ? Math.min(totalTime, Math.max(0, currentTime))
      : totalTime;

  const visibleSlices: Array<Slice & { isCurrentRunning?: boolean }> = [];

  for (const s of slices) {
    if (s.start >= effectiveTime) {
      break;
    }
    const end = Math.min(s.end, effectiveTime);
    if (end > s.start) {
      visibleSlices.push({
        pid: s.pid,
        start: s.start,
        end: end,
        isCurrentRunning: end === effectiveTime && s.end > s.start,
      });
    }
  }

  const executedTime = effectiveTime;
  const remainingTime = Math.max(0, totalTime - executedTime);
  const remainingWidthPct = (remainingTime / totalTime) * 100;
  const cursorPct = (executedTime / totalTime) * 100;

  return (
    <div className="w-full space-y-3">
      <div className="overflow-x-auto pb-4 pt-1">
        <div className="min-w-[680px] space-y-1">
          {/* Slices Bar with synchronous reveal and playhead indicator */}
          <div className="relative flex h-16 w-full rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-inner bg-slate-100/70 dark:bg-slate-900/70">
            {/* Executed Slices up to current step */}
            {visibleSlices.map((slice, idx) => {
              const duration = slice.end - slice.start;
              const widthPct = (duration / totalTime) * 100;
              const color = getColor(slice.pid);
              const isHighlighted = highlightPid === slice.pid;

              return (
                <div
                  key={idx}
                  onMouseEnter={() => onSliceHover?.(slice.pid)}
                  onMouseLeave={() => onSliceHover?.(null)}
                  style={{ width: `${widthPct}%` }}
                  className={`group relative flex flex-col items-center justify-center border-r last:border-r-0 transition-all duration-150 cursor-pointer ${
                    color.bg
                  } ${color.border} ${
                    isHighlighted ? 'ring-2 ring-indigo-500 z-10 brightness-110' : ''
                  } ${
                    slice.isCurrentRunning
                      ? 'after:absolute after:inset-0 after:bg-white/10 after:animate-pulse'
                      : ''
                  }`}
                  title={`${slice.pid ?? 'IDLE'}: [${slice.start} → ${slice.end}] (Duration: ${duration})`}
                >
                  <span className={`text-sm font-black tracking-tight ${color.text}`}>
                    {slice.pid ? slice.pid : 'IDLE'}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-medium">
                    Δ {duration}
                  </span>
                </div>
              );
            })}

            {/* Unreached Future Time Segment (when synchronized) */}
            {remainingWidthPct > 0 && (
              <div
                style={{ width: `${remainingWidthPct}%` }}
                className="flex items-center justify-center bg-slate-200/40 dark:bg-slate-800/40 border-l border-dashed border-indigo-400/70 select-none text-slate-400 dark:text-slate-500 text-xs font-mono italic"
              >
                <span className="hidden sm:inline">
                  &larr; Pending (t = {executedTime} &rarr; {totalTime})
                </span>
              </div>
            )}

            {/* Synchronous Playhead Needle Indicator */}
            {isSynchronized && (
              <div
                style={{ left: `${cursorPct}%` }}
                className="absolute top-0 bottom-0 w-0.5 bg-indigo-600 dark:bg-indigo-400 z-20 pointer-events-none transition-all duration-150 -translate-x-1/2 shadow-sm"
              >
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-indigo-600 rounded-full ring-2 ring-white dark:ring-slate-900 shadow-md" />
              </div>
            )}
          </div>

          {/* Time markers bar below Gantt chart */}
          <div className="relative h-6 w-full text-xs font-mono text-slate-600 dark:text-slate-400">
            {/* Start timestamp (0) */}
            <div className="absolute left-0 top-1 -translate-x-1/2 text-left font-bold pl-2">
              0
            </div>

            {/* Completed Slice Endpoints */}
            {visibleSlices.map((slice, idx) => {
              const posPct = (slice.end / totalTime) * 100;
              return (
                <div
                  key={idx}
                  style={{ left: `${posPct}%` }}
                  className="absolute top-1 -translate-x-1/2 flex flex-col items-center"
                >
                  <div className="h-1.5 w-0.5 bg-slate-400 dark:bg-slate-600 mb-0.5" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {slice.end}
                  </span>
                </div>
              );
            })}

            {/* Schedule End Target (if not reached yet) */}
            {remainingWidthPct > 0 && (
              <div className="absolute right-0 top-1 translate-x-1/2 text-right font-bold pr-2 text-slate-400">
                <div className="h-1.5 w-0.5 bg-slate-300 dark:bg-slate-700 mx-auto mb-0.5" />
                <span>{totalTime}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend & Execution Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-medium text-slate-500 dark:text-slate-400">Legend:</span>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-slate-500/30 bg-slate-500/10 text-slate-600 dark:text-slate-400 font-medium">
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            <span>IDLE (CPU Waiting)</span>
          </div>
          {Array.from(new Set(slices.map((s) => s.pid).filter(Boolean) as string[])).map((pid) => {
            const col = getColor(pid);
            return (
              <div
                key={pid}
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border ${col.border} ${col.bg} ${col.text}`}
              >
                <span className="font-bold">{pid}</span>
              </div>
            );
          })}
        </div>

        {isSynchronized && (
          <div className="flex items-center gap-2 font-mono text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-900">
            <span className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-ping" />
            <span>
              Connected at <strong>t = {effectiveTime}</strong> of {totalTime}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
