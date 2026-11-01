import React, { useState, useMemo } from 'react';
import type { Algorithm, PriorityMode, Process } from '../engine/types';
import { ALGORITHM_LABELS, usesPriority } from '../engine/types';
import { schedule } from '../engine/scheduler';
import { grade, generateProblem, type StudentAnswer, type GradeReport, type CellState } from '../engine/grader';
import { PRESETS } from '../data/presets';
import { GanttChart } from './GanttChart';
import { CheckCircle2, Award, Sparkles, RefreshCw, Eye, EyeOff, Plus, Trash2, Dices } from 'lucide-react';

export const ModeQuiz: React.FC = () => {
  const [selectedAlgoMode, setSelectedAlgoMode] = useState<Algorithm | 'RANDOM'>('RANDOM');
  const [algorithm, setAlgorithm] = useState<Algorithm>('FCFS');
  const [withArrival, setWithArrival] = useState<boolean>(true);
  const [numProcesses, setNumProcesses] = useState<number>(3);
  const [quantum, setQuantum] = useState<number>(3);
  const [priorityMode, setPriorityMode] = useState<PriorityMode>('LOW_IS_HIGH');
  const [firstCompletedAns, setFirstCompletedAns] = useState<string>('');
  const [lastCompletedAns, setLastCompletedAns] = useState<string>('');

  // Problem processes
  const [problemProcesses, setProblemProcesses] = useState<Process[]>([
    { pid: 'P1', arrival: 0, burst: 6, priority: 2 },
    { pid: 'P2', arrival: 2, burst: 4, priority: 1 },
    { pid: 'P3', arrival: 4, burst: 2, priority: 3 },
  ]);

  // Student answer state
  const [studentAns, setStudentAns] = useState<StudentAnswer>({
    readyQueue: '',
    gantt: [
      { pid: '', start: '0', end: '' },
      { pid: '', start: '', end: '' },
      { pid: '', start: '', end: '' },
    ],
    table: {},
    avgTAT: '',
    avgWT: '',
    throughput: '',
  });

  const [gradeReport, setGradeReport] = useState<GradeReport | null>(null);
  const [showSolution, setShowSolution] = useState<boolean>(false);

  // Exact solution calculated in background
  const groundTruth = useMemo(() => {
    return schedule(problemProcesses, algorithm, { quantum, priorityMode });
  }, [problemProcesses, algorithm, quantum, priorityMode]);

  const { expectedFirstPid, expectedLastPid } = useMemo(() => {
    const sorted = [...groundTruth.results].sort((a, b) => a.completion - b.completion);
    return {
      expectedFirstPid: sorted[0]?.pid ?? '',
      expectedLastPid: sorted[sorted.length - 1]?.pid ?? '',
    };
  }, [groundTruth]);

  const firstPidState: CellState | undefined = useMemo(() => {
    if (!gradeReport) return undefined;
    if (!firstCompletedAns.trim()) return 'empty';
    return firstCompletedAns.trim().toUpperCase() === expectedFirstPid.toUpperCase() ? 'correct' : 'wrong';
  }, [gradeReport, firstCompletedAns, expectedFirstPid]);

  const lastPidState: CellState | undefined = useMemo(() => {
    if (!gradeReport) return undefined;
    if (!lastCompletedAns.trim()) return 'empty';
    return lastCompletedAns.trim().toUpperCase() === expectedLastPid.toUpperCase() ? 'correct' : 'wrong';
  }, [gradeReport, lastCompletedAns, expectedLastPid]);

  // Generate new random problem
  const handleGenerateNew = (overrideMode?: Algorithm | 'RANDOM') => {
    const mode = overrideMode ?? selectedAlgoMode;
    const prob = generateProblem(numProcesses, withArrival, mode);
    setAlgorithm(prob.algorithm);
    setProblemProcesses(prob.processes);
    setQuantum(prob.quantum);
    setGradeReport(null);
    setShowSolution(false);
    setFirstCompletedAns('');
    setLastCompletedAns('');

    // Reset student answers
    setStudentAns({
      readyQueue: '',
      gantt: Array.from({ length: prob.processes.length + 1 }, (_, i) => ({
        pid: '',
        start: i === 0 ? '0' : '',
        end: '',
      })),
      table: {},
      avgTAT: '',
      avgWT: '',
      throughput: '',
    });
  };

  // Load a practice exercise from slides
  const handleLoadExercise = (presetId: string) => {
    const p = PRESETS.find((x) => x.id === presetId);
    if (!p) return;
    setSelectedAlgoMode(p.algorithm);
    setAlgorithm(p.algorithm);
    setProblemProcesses(p.processes.map((proc) => ({ ...proc })));
    if (p.quantum) setQuantum(p.quantum);
    setPriorityMode(p.priorityMode ?? 'LOW_IS_HIGH');
    setGradeReport(null);
    setShowSolution(false);
    setFirstCompletedAns('');
    setLastCompletedAns('');

    setStudentAns({
      readyQueue: '',
      gantt: Array.from({ length: p.processes.length + 1 }, (_, i) => ({
        pid: '',
        start: i === 0 ? '0' : '',
        end: '',
      })),
      table: {},
      avgTAT: '',
      avgWT: '',
      throughput: '',
    });
  };

  const handleGrade = () => {
    const rep = grade(problemProcesses, algorithm, groundTruth, studentAns);
    setGradeReport(rep);
  };

  const handleTableChange = (pid: string, field: 'ct' | 'tat' | 'wt', val: string) => {
    setStudentAns((prev) => ({
      ...prev,
      table: {
        ...prev.table,
        [pid]: {
          ...(prev.table[pid] || { ct: '', tat: '', wt: '' }),
          [field]: val,
        },
      },
    }));
  };

  const handleGanttChange = (idx: number, field: 'pid' | 'start' | 'end', val: string) => {
    setStudentAns((prev) => {
      const g = [...prev.gantt];
      g[idx] = { ...g[idx], [field]: val };
      return { ...prev, gantt: g };
    });
  };

  const addGanttRow = () => {
    const last = studentAns.gantt[studentAns.gantt.length - 1];
    const nextStart = last ? last.end : '';
    setStudentAns((prev) => ({
      ...prev,
      gantt: [...prev.gantt, { pid: '', start: nextStart, end: '' }],
    }));
  };

  const removeGanttRow = (idx: number) => {
    if (studentAns.gantt.length <= 1) return;
    setStudentAns((prev) => ({
      ...prev,
      gantt: prev.gantt.filter((_, i) => i !== idx),
    }));
  };

  const getCellBorder = (st?: CellState) => {
    if (!st || st === 'empty') return 'border-slate-300 dark:border-slate-700';
    if (st === 'correct') return 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
    return 'border-rose-500/50 bg-rose-500/10 text-rose-700 dark:text-rose-400';
  };

  return (
    <div className="space-y-6">
      {/* Exercise Generation & Configuration Card */}
      <div className="card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-semibold text-slate-800 dark:text-white">
              Practice & Exam Evaluation Engine
            </h3>
          </div>

          {/* Slide exercises selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Slide Exercises:
            </span>
            <select
              onChange={(e) => handleLoadExercise(e.target.value)}
              defaultValue=""
              className="input text-xs w-auto py-1 pr-6 cursor-pointer bg-slate-50 dark:bg-slate-800"
            >
              <option value="" disabled>
                Select Exam / Exercise...
              </option>
              {PRESETS.filter((p) => p.exercise).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.algorithm})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Configuration row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="label">Target Algorithm</label>
            <select
              value={selectedAlgoMode}
              onChange={(e) => {
                const val = e.target.value as Algorithm | 'RANDOM';
                setSelectedAlgoMode(val);
                if (val === 'RANDOM') {
                  handleGenerateNew('RANDOM');
                } else {
                  setAlgorithm(val);
                }
              }}
              className="input font-semibold text-xs"
            >
              <option value="RANDOM">🎲 Any Algorithm (Random Each Time)</option>
              {(Object.keys(ALGORITHM_LABELS) as Algorithm[]).map((alg) => (
                <option key={alg} value={alg}>
                  {ALGORITHM_LABELS[alg]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="label">Arrival Times Mode</label>
            <div className="flex items-center gap-2 pt-1.5">
              <label className="inline-flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={withArrival}
                  onChange={(e) => setWithArrival(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                Include Arrival Times ($A.T \ge 0$)
              </label>
            </div>
          </div>

          <div className="space-y-1">
            <label className="label">Number of Processes</label>
            <select
              value={numProcesses}
              onChange={(e) => setNumProcesses(Number(e.target.value))}
              className="input text-xs"
            >
              <option value={3}>3 Processes</option>
              <option value={4}>4 Processes</option>
              <option value={5}>5 Processes</option>
              <option value={6}>6 Processes</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => handleGenerateNew()}
              className="btn-primary w-full py-2 text-xs cursor-pointer shadow-sm"
              title="Generate a new question (picks a random algorithm if set to Random)"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>
                {selectedAlgoMode === 'RANDOM'
                  ? 'Generate (Random Algorithm)'
                  : 'Generate Random Question'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Given Problem Question Statement */}
      <div className="card space-y-3 bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-600 dark:text-indigo-400">
              Current Problem: {ALGORITHM_LABELS[algorithm]}
            </span>
            {selectedAlgoMode === 'RANDOM' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <Dices className="h-3 w-3" />
                Randomly Selected Algorithm
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {usesPriority(algorithm) && (
              <select
                value={priorityMode}
                onChange={(e) => setPriorityMode(e.target.value as PriorityMode)}
                className="input text-xs py-1 px-2.5 w-auto font-semibold"
              >
                <option value="LOW_IS_HIGH">Priority: Lowest # = Highest Priority</option>
                <option value="HIGH_IS_HIGH">Priority: Largest # = Highest Priority</option>
              </select>
            )}
            {algorithm === 'RR' && (
              <span className="text-xs font-mono font-bold bg-indigo-500/10 px-2.5 py-0.5 rounded-full text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
                Time Quantum q = {quantum}
              </span>
            )}
            {selectedAlgoMode === 'RANDOM' && (
              <button
                type="button"
                onClick={() => handleGenerateNew('RANDOM')}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                title="Roll another random algorithm"
              >
                <Dices className="h-3 w-3" />
                Change Algorithm
              </button>
            )}
          </div>
        </div>

        {/* Display given process table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300">
              <tr>
                <th className="px-3 py-2">Process</th>
                <th className="px-3 py-2">Arrival Time (A.T)</th>
                <th className="px-3 py-2">Priority (P)</th>
                <th className="px-3 py-2">Burst Time (B.T)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {problemProcesses.map((p) => (
                <tr key={p.pid} className="font-mono">
                  <td className="px-3 py-1.5 font-bold text-slate-800 dark:text-slate-100">{p.pid}</td>
                  <td className="px-3 py-1.5">{p.arrival}</td>
                  <td className="px-3 py-1.5 text-slate-500">{p.priority}</td>
                  <td className="px-3 py-1.5 font-semibold text-indigo-600 dark:text-indigo-400">{p.burst}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Interactive Answering Area */}
      <div className="card space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="card-title mb-0">Student Answer Worksheet</h3>
          <span className="text-xs text-slate-400">Fill in the fields and click "Submit & Grade" below</span>
        </div>

        {/* 1. Ready Queue sequence input */}
        <div className="space-y-1.5">
          <label className="label">1. Ready Queue Sequence (In order of entry/re-entry)</label>
          <input
            type="text"
            placeholder="e.g. P1, P2, P3, P1 (Separate with commas or spaces)"
            value={studentAns.readyQueue}
            onChange={(e) => setStudentAns({ ...studentAns, readyQueue: e.target.value })}
            className={`input font-mono ${
              gradeReport
                ? gradeReport.readyQueueOk
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                  : 'border-rose-500/50 bg-rose-500/10 text-rose-700 dark:text-rose-400'
                : ''
            }`}
          />
          <p className="text-[11px] text-slate-400">
            Tip: Write processes as they enter or return to the ready queue (e.g., <code>P1, P2, P3</code>).
          </p>
        </div>

        {/* 2. Predicted Gantt Chart Slices */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="label">2. Predicted Gantt Chart Intervals</label>
            <button
              type="button"
              onClick={addGanttRow}
              className="btn-ghost text-xs px-2 py-0.5"
            >
              <Plus className="h-3 w-3" /> Add Slice
            </button>
          </div>

          <div className="space-y-2">
            {studentAns.gantt.map((row, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="PID / IDLE"
                  value={row.pid}
                  onChange={(e) => handleGanttChange(idx, 'pid', e.target.value)}
                  className={`input w-28 text-center font-bold font-mono text-xs ${
                    gradeReport && gradeReport.ganttRowState[idx]
                      ? getCellBorder(gradeReport.ganttRowState[idx])
                      : ''
                  }`}
                />
                <span className="text-xs text-slate-400">from t =</span>
                <input
                  type="number"
                  placeholder="Start"
                  value={row.start}
                  onChange={(e) => handleGanttChange(idx, 'start', e.target.value)}
                  className="input w-20 text-center font-mono text-xs"
                />
                <span className="text-xs text-slate-400">to t =</span>
                <input
                  type="number"
                  placeholder="End"
                  value={row.end}
                  onChange={(e) => handleGanttChange(idx, 'end', e.target.value)}
                  className="input w-20 text-center font-mono text-xs font-bold"
                />
                <button
                  type="button"
                  onClick={() => removeGanttRow(idx)}
                  disabled={studentAns.gantt.length <= 1}
                  className="p-1 text-slate-400 hover:text-rose-500 disabled:opacity-20 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Table blanks: C.T, W.T, T.A.T */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="label mb-0">3. Fill Process Results Table (C.T, W.T, T.A.T)</label>
            <span className="text-[11px] font-mono text-slate-400">
              Formulas: T.A.T = C.T − A.T &nbsp;|&nbsp; W.T = T.A.T − B.T
            </span>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="px-3 py-2">Process</th>
                  <th className="px-3 py-2">A.T</th>
                  <th className="px-3 py-2">Priority</th>
                  <th className="px-3 py-2">B.T</th>
                  <th className="px-3 py-2">Completion Time (C.T)</th>
                  <th className="px-3 py-2">Waiting Time (W.T)</th>
                  <th className="px-3 py-2">Turnaround (T.A.T)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {problemProcesses.map((p) => {
                  const state = gradeReport?.tableState[p.pid];
                  const vals = studentAns.table[p.pid] || { ct: '', tat: '', wt: '' };

                  return (
                    <tr key={p.pid} className="font-mono">
                      <td className="px-3 py-2 font-bold">{p.pid}</td>
                      <td className="px-3 py-2 text-slate-500">{p.arrival}</td>
                      <td className="px-3 py-2 text-slate-500">{p.priority}</td>
                      <td className="px-3 py-2 text-slate-500">{p.burst}</td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          placeholder="C.T"
                          value={vals.ct}
                          onChange={(e) => handleTableChange(p.pid, 'ct', e.target.value)}
                          className={`input w-24 text-center text-xs ${getCellBorder(state?.ct)}`}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          placeholder="W.T"
                          value={vals.wt}
                          onChange={(e) => handleTableChange(p.pid, 'wt', e.target.value)}
                          className={`input w-24 text-center text-xs ${getCellBorder(state?.wt)}`}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          placeholder="T.A.T"
                          value={vals.tat}
                          onChange={(e) => handleTableChange(p.pid, 'tat', e.target.value)}
                          className={`input w-24 text-center text-xs ${getCellBorder(state?.tat)}`}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Statistics & Completion Order Blanks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="space-y-1">
            <label className="label">First Process to Complete</label>
            <input
              type="text"
              placeholder="e.g. A0 or P1"
              value={firstCompletedAns}
              onChange={(e) => setFirstCompletedAns(e.target.value)}
              className={`input font-mono text-xs ${getCellBorder(firstPidState)}`}
            />
            {gradeReport && firstPidState === 'wrong' && (
              <p className="text-[11px] font-mono text-rose-500">Expected: {expectedFirstPid}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="label">Last Process to Complete</label>
            <input
              type="text"
              placeholder="e.g. A1 or P3"
              value={lastCompletedAns}
              onChange={(e) => setLastCompletedAns(e.target.value)}
              className={`input font-mono text-xs ${getCellBorder(lastPidState)}`}
            />
            {gradeReport && lastPidState === 'wrong' && (
              <p className="text-[11px] font-mono text-rose-500">Expected: {expectedLastPid}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="label">Avg. Turnaround Time</label>
            <input
              type="text"
              placeholder="e.g. 16 or 15.6"
              value={studentAns.avgTAT}
              onChange={(e) => setStudentAns({ ...studentAns, avgTAT: e.target.value })}
              className={`input font-mono text-xs ${getCellBorder(gradeReport?.statsState.avgTAT)}`}
            />
          </div>
          <div className="space-y-1">
            <label className="label">Avg. Waiting Time</label>
            <input
              type="text"
              placeholder="e.g. 9.4 or 5.6"
              value={studentAns.avgWT}
              onChange={(e) => setStudentAns({ ...studentAns, avgWT: e.target.value })}
              className={`input font-mono text-xs ${getCellBorder(gradeReport?.statsState.avgWT)}`}
            />
          </div>
          <div className="space-y-1">
            <label className="label">Throughput (e.g. 0.15)</label>
            <input
              type="text"
              placeholder="e.g. 0.15 or 0.19"
              value={studentAns.throughput}
              onChange={(e) => setStudentAns({ ...studentAns, throughput: e.target.value })}
              className={`input font-mono text-xs ${getCellBorder(gradeReport?.statsState.throughput)}`}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleGrade}
            className="btn-primary px-6 py-2.5 text-sm font-semibold shadow-md"
          >
            Submit & Evaluate My Answers
          </button>

          <button
            type="button"
            onClick={() => setShowSolution(!showSolution)}
            className="btn-ghost text-xs text-slate-600 dark:text-slate-300"
          >
            {showSolution ? (
              <>
                <EyeOff className="h-4 w-4" /> Hide Full Solution
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 text-indigo-500" /> Reveal Complete Solution
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grade Report & Diagnostic Explanations */}
      {gradeReport && (
        <div className="card space-y-4 animate-in fade-in duration-200 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Evaluation Score: {gradeReport.percent}%
              </h3>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                gradeReport.percent >= 85
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                  : gradeReport.percent >= 60
                  ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20'
                  : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
              }`}
            >
              {gradeReport.percent >= 85 ? 'Excellent Work!' : gradeReport.percent >= 60 ? 'Good Effort — Review Mistakes' : 'Needs Practice'}
            </span>
          </div>

          {/* Section Score Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {gradeReport.sections.map((sec) => (
              <div key={sec.label} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                <span className="text-slate-500 dark:text-slate-400">{sec.label}</span>
                <p className="text-sm font-bold mt-1 text-slate-800 dark:text-slate-100">
                  {sec.earned.toFixed(1)} / {sec.max}
                </p>
              </div>
            ))}
          </div>

          {/* Step-by-Step Diagnostic Error Explanations */}
          {gradeReport.diagnostics.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
                Detailed Feedback & Corrections
              </span>
              <div className="space-y-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-3.5">
                {gradeReport.diagnostics.map((diag, i) => (
                  <p key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                    <span className="text-indigo-500 font-bold">&bull;</span>
                    <span>{diag}</span>
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Solution Reveal View */}
      {showSolution && groundTruth && (
        <div className="card space-y-4 animate-in fade-in duration-200 bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h4 className="font-bold text-slate-800 dark:text-white text-sm">
              Ground Truth Correct Solution
            </h4>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500">Expected Ready Queue Order:</span>
            <div className="flex flex-wrap gap-1.5 font-mono text-xs">
              {groundTruth.readyQueueSequence.map((q, i) => (
                <span key={i} className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 font-bold">
                  {q}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500">Expected Gantt Chart:</span>
            <GanttChart slices={groundTruth.slices} totalTime={groundTruth.lastCT} />
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="px-3 py-1.5">Process</th>
                  <th className="px-3 py-1.5">C.T</th>
                  <th className="px-3 py-1.5">W.T</th>
                  <th className="px-3 py-1.5">T.A.T</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {groundTruth.results.map((r) => (
                  <tr key={r.pid}>
                    <td className="px-3 py-1.5 font-bold">{r.pid}</td>
                    <td className="px-3 py-1.5 font-bold text-indigo-600 dark:text-indigo-400">{r.completion}</td>
                    <td className="px-3 py-1.5">{r.waiting}</td>
                    <td className="px-3 py-1.5">{r.turnaround}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono pt-1">
            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">First Completed</span>
              <strong className="text-emerald-600 dark:text-emerald-400">{expectedFirstPid}</strong>
            </div>
            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">Last Completed</span>
              <strong className="text-indigo-600 dark:text-indigo-400">{expectedLastPid}</strong>
            </div>
            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">Avg. T.A.T</span>
              <strong>{groundTruth.avgTAT.toFixed(2)}</strong>
            </div>
            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">Avg. W.T</span>
              <strong>{groundTruth.avgWT.toFixed(2)}</strong>
            </div>
            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">Throughput</span>
              <strong>{groundTruth.throughput.toFixed(3)}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
