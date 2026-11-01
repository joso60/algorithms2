import React, { useState, useEffect, useMemo } from 'react';
import type { Algorithm, PriorityMode, Process } from '../engine/types';
import { ALGORITHM_LABELS, usesPriority } from '../engine/types';
import { schedule, validateProcesses } from '../engine/scheduler';
import { PRESETS } from '../data/presets';
import { ProcessTable } from './ProcessTable';
import { GanttChart } from './GanttChart';
import { ReadyQueueTimeline } from './ReadyQueueTimeline';
import { ResultsTable } from './ResultsTable';
import { Settings, Sparkles, AlertCircle } from 'lucide-react';

export const ModeSimulator: React.FC = () => {
  const [algorithm, setAlgorithm] = useState<Algorithm>('FCFS');
  const [quantum, setQuantum] = useState<number>(4);
  const [priorityMode, setPriorityMode] = useState<PriorityMode>('LOW_IS_HIGH');
  const [processes, setProcesses] = useState<Process[]>([
    { pid: 'P1', arrival: 0, burst: 24, priority: 3 },
    { pid: 'P2', arrival: 0, burst: 3, priority: 1 },
    { pid: 'P3', arrival: 0, burst: 3, priority: 2 },
  ]);

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hoveredPid, setHoveredPid] = useState<string | null>(null);
  const [isGanttSynced, setIsGanttSynced] = useState<boolean>(true);

  // Validate processes
  const validationError = useMemo(() => validateProcesses(processes), [processes]);

  // Run the schedule calculation
  const result = useMemo(() => {
    if (validationError) return null;
    return schedule(processes, algorithm, { quantum, priorityMode });
  }, [processes, algorithm, quantum, priorityMode, validationError]);

  // Reset or adjust current step when snapshots change
  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, [algorithm, processes, quantum, priorityMode]);

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying || !result) return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= result.snapshots.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [isPlaying, result]);

  // Keyboard navigation: Right arrow = next step, Left arrow = previous step
  useEffect(() => {
    if (!result || !result.snapshots.length) return;
    const maxStep = result.snapshots.length - 1;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) {
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setIsPlaying(false);
        setCurrentStep((prev) => Math.min(maxStep, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setIsPlaying(false);
        setCurrentStep((prev) => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [result]);

  const handleLoadPreset = (presetId: string) => {
    const p = PRESETS.find((x) => x.id === presetId);
    if (!p) return;
    setAlgorithm(p.algorithm);
    setProcesses(p.processes.map((proc) => ({ ...proc })));
    if (p.quantum) setQuantum(p.quantum);
    if (p.priorityMode) setPriorityMode(p.priorityMode);
  };

  const handleSetAllZeroArrival = () => {
    setProcesses((prev) => prev.map((p) => ({ ...p, arrival: 0 })));
  };

  return (
    <div className="space-y-6">
      {/* Controls & Preset Selection */}
      <div className="card bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700/70 pb-3">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">
              Algorithm & Simulation Controls
            </h3>
          </div>

          {/* Quick Course Slide Presets */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> Slides Presets:
            </span>
            <select
              onChange={(e) => handleLoadPreset(e.target.value)}
              defaultValue=""
              className="input text-xs w-auto py-1 pr-6 cursor-pointer bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
            >
              <option value="" disabled>
                Select Course Example...
              </option>
              {PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.algorithm})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Algorithm options & settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {/* Algorithm selector */}
          <div className="space-y-1">
            <label className="label text-slate-600 dark:text-slate-400">Scheduling Algorithm</label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as Algorithm)}
              className="input font-semibold bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
            >
              {(Object.keys(ALGORITHM_LABELS) as Algorithm[]).map((alg) => (
                <option key={alg} value={alg}>
                  {ALGORITHM_LABELS[alg]}
                </option>
              ))}
            </select>
          </div>

          {/* Round Robin Time Quantum */}
          {algorithm === 'RR' && (
            <div className="space-y-1 animate-in fade-in duration-200">
              <label className="label text-slate-600 dark:text-slate-400">Time Quantum (q)</label>
              <input
                type="number"
                min={1}
                value={quantum}
                onChange={(e) => setQuantum(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="input font-mono font-bold bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
              />
            </div>
          )}

          {/* Priority Mode Convention */}
          {usesPriority(algorithm) && (
            <div className="space-y-1 animate-in fade-in duration-200">
              <label className="label text-slate-600 dark:text-slate-400">Priority Convention</label>
              <select
                value={priorityMode}
                onChange={(e) => setPriorityMode(e.target.value as PriorityMode)}
                className="input text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
              >
                <option value="LOW_IS_HIGH">Smallest integer = Highest (Standard)</option>
                <option value="HIGH_IS_HIGH">Largest integer = Highest (Exercise Variant)</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Process Table Input */}
      <div className="card bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80">
        <ProcessTable
          processes={processes}
          onChange={setProcesses}
          showPriority={usesPriority(algorithm)}
          onSetAllZeroArrival={handleSetAllZeroArrival}
        />
      </div>

      {validationError && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Simulation Results */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-250">
          {/* Synchronized Ready Queue Tape Section (Placed on top like lecture slides) */}
          <div className="card bg-white dark:bg-slate-800/50 space-y-3 border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/70 pb-2">
              <h3 className="card-title mb-0 text-slate-800 dark:text-slate-100">1. Ready Queue Step-by-Step State</h3>
              <span className="rounded-full px-2.5 py-0.5 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                Step-by-step cumulative arrivals (Items never removed)
              </span>
            </div>
            <ReadyQueueTimeline
              snapshots={result.snapshots}
              currentStep={currentStep}
              onStepChange={setCurrentStep}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onReset={() => {
                setIsPlaying(false);
                setCurrentStep(0);
              }}
            />
          </div>

          {/* Connected Gantt Chart Section (Directly below Ready Queue, connected in real-time!) */}
          <div className="card bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-slate-700/70 pb-2 gap-2">
              <div className="flex items-center gap-2">
                <h3 className="card-title mb-0 text-slate-800 dark:text-slate-100">2. Execution Gantt Chart</h3>
                {isGanttSynced && (
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    Connected to Ready Queue Playback
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 hidden sm:inline">
                  Span: 0 &rarr; {result.lastCT} (Total Duration: {result.totalTime})
                </span>
                <button
                  type="button"
                  onClick={() => setIsGanttSynced(!isGanttSynced)}
                  className="btn-ghost text-xs px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/80 cursor-pointer"
                >
                  {isGanttSynced ? 'Show Full Gantt Chart' : 'Sync With Playback'}
                </button>
              </div>
            </div>

            <GanttChart
              slices={result.slices}
              totalTime={result.lastCT}
              currentTime={result.snapshots[currentStep]?.time ?? 0}
              isSynchronized={isGanttSynced}
              highlightPid={hoveredPid}
              onSliceHover={setHoveredPid}
            />
          </div>

          {/* Process Metrics & Calculation Table */}
          <div className="card bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80">
            <h3 className="card-title text-slate-800 dark:text-slate-100">3. Process Completion & Wait Metrics</h3>
            <ResultsTable
              results={result.results}
              showPriority={usesPriority(algorithm)}
              avgTAT={result.avgTAT}
              avgWT={result.avgWT}
              throughput={result.throughput}
              totalTime={result.totalTime}
              lastCT={result.lastCT}
              firstAT={result.firstAT}
              highlightPid={hoveredPid}
              onHoverPid={setHoveredPid}
            />
          </div>
        </div>
      )}
    </div>
  );
};
