import type { Algorithm, Process, ScheduleResult, Slice } from './types';
import { mergeSlices } from './scheduler';

export interface GanttRow {
  pid: string;
  start: string;
  end: string;
}

export interface StudentAnswer {
  readyQueue: string;
  gantt: GanttRow[];
  table: Record<string, { ct: string; tat: string; wt: string }>;
  avgTAT: string;
  avgWT: string;
  throughput: string;
}

export type CellState = 'correct' | 'wrong' | 'empty';

export interface SectionScore {
  label: string;
  earned: number;
  max: number;
}

export interface GradeReport {
  percent: number;
  sections: SectionScore[];
  readyQueueOk: boolean;
  ganttOk: boolean;
  ganttRowState: CellState[];
  tableState: Record<string, { ct: CellState; tat: CellState; wt: CellState }>;
  statsState: { avgTAT: CellState; avgWT: CellState; throughput: CellState };
  diagnostics: string[];
}

export const WEIGHTS = { readyQueue: 15, gantt: 30, table: 40, stats: 15 };

/** Parse numbers like "5", "5.33", "16/3". Returns NaN for blanks/garbage. */
export function parseNum(raw: string | undefined): number {
  if (raw === undefined) return NaN;
  const s = raw.trim();
  if (!s) return NaN;
  if (s.includes('/')) {
    const [a, b] = s.split('/').map((x) => Number(x.trim()));
    return b ? a / b : NaN;
  }
  return Number(s);
}

/**
 * Accepts the exact value, or the value rounded / truncated to 1 or 2 decimals
 * (the slides use both styles, e.g. 15.67 → 15.6, 22.67 → 22.7, 0.1667 → 0.16).
 */
const close = (a: number, b: number) => {
  if (Math.abs(a - b) <= 0.01 + 1e-9) return true;
  const r1 = Math.round(b * 10) / 10;
  const t1 = Math.trunc(b * 10 + 1e-9) / 10;
  return Math.abs(a - r1) < 1e-9 || Math.abs(a - t1) < 1e-9;
};

function cell(raw: string | undefined, expected: number): CellState {
  const v = parseNum(raw);
  if (Number.isNaN(v)) return 'empty';
  return close(v, expected) ? 'correct' : 'wrong';
}

export function tokenizeQueue(s: string): string[] {
  return s
    .split(/[\s,;>→|-]+/)
    .map((x) => x.trim().toUpperCase())
    .filter(Boolean);
}

const normPid = (p: string): string | null => {
  const s = p.trim().toUpperCase();
  return !s || s === 'IDLE' || s === '-' ? null : s;
};

function timeline(slices: Slice[], end: number): (string | null)[] {
  const arr: (string | null)[] = Array(end).fill(null);
  for (const s of slices) for (let t = Math.max(0, s.start); t < Math.min(end, s.end); t++) arr[t] = s.pid ? s.pid.toUpperCase() : null;
  return arr;
}

function explainAt(sol: ScheduleResult, t: number): string {
  const snap = [...sol.snapshots].reverse().find((s) => s.time <= t);
  if (!snap) return '';
  return ` Engine trace at t = ${snap.time}: ${snap.events.join(' ')}`;
}

export function grade(processes: Process[], algorithm: Algorithm, sol: ScheduleResult, ans: StudentAnswer): GradeReport {
  const diagnostics: string[] = [];
  const sections: SectionScore[] = [];

  // ---- Ready queue sequence
  const expQ = sol.readyQueueSequence.map((x) => x.toUpperCase());
  const gotQ = tokenizeQueue(ans.readyQueue);
  let qMatch = 0;
  for (let i = 0; i < Math.min(expQ.length, gotQ.length); i++) if (expQ[i] === gotQ[i]) qMatch++;
  const readyQueueOk = gotQ.length === expQ.length && qMatch === expQ.length;
  sections.push({ label: 'Ready Queue', earned: (WEIGHTS.readyQueue * qMatch) / Math.max(expQ.length, gotQ.length, 1), max: WEIGHTS.readyQueue });
  if (!readyQueueOk) {
    const idx = expQ.findIndex((p, i) => gotQ[i] !== p);
    if (gotQ.length === 0) diagnostics.push('Ready Queue: you did not enter a ready queue sequence.');
    else if (idx >= 0)
      diagnostics.push(
        `Ready Queue: entry #${idx + 1} should be ${expQ[idx]} but you wrote ${gotQ[idx] ?? '(nothing)'}. ` +
          (algorithm === 'RR' || algorithm === 'SRTF' || algorithm === 'PRIORITY_P'
            ? 'Remember that preempted processes re-enter the queue, and new arrivals at the same instant enter before the preempted process.'
            : 'Processes enter the ready queue in order of arrival (ties → lower PID).'),
      );
    else diagnostics.push(`Ready Queue: your sequence has extra entries (expected ${expQ.length}, got ${gotQ.length}).`);
  }

  // ---- Gantt chart
  const expSlices = mergeSlices(sol.slices);
  const rows = ans.gantt.filter((r) => r.pid.trim() || r.start.trim() || r.end.trim());
  const stuSlices: Slice[] = [];
  const ganttRowState: CellState[] = ans.gantt.map(() => 'empty');
  ans.gantt.forEach((r, i) => {
    const s = parseNum(r.start);
    const e = parseNum(r.end);
    if (Number.isNaN(s) || Number.isNaN(e)) return;
    const pid = normPid(r.pid);
    stuSlices.push({ pid, start: s, end: e });
    ganttRowState[i] = expSlices.some((x) => (x.pid?.toUpperCase() ?? null) === pid && x.start === s && x.end === e) ? 'correct' : 'wrong';
  });
  const end = sol.lastCT;
  const expT = timeline(expSlices, end);
  const stuMerged = mergeSlices([...stuSlices].sort((a, b) => a.start - b.start));
  const gotT = timeline(stuMerged, end);
  let gMatch = 0;
  for (let t = 0; t < end; t++) if (expT[t] === gotT[t]) gMatch++;
  const stuEnd = Math.max(0, ...stuMerged.map((s) => s.end));
  const ganttOk = gMatch === end && stuEnd === end && rows.length > 0;
  sections.push({ label: 'Gantt Chart', earned: rows.length ? (WEIGHTS.gantt * gMatch) / Math.max(end, stuEnd, 1) : 0, max: WEIGHTS.gantt });
  if (!rows.length) diagnostics.push('Gantt Chart: no slices were entered.');
  else if (!ganttOk) {
    const t = expT.findIndex((p, i) => gotT[i] !== p);
    if (t >= 0) {
      const should = expT[t] ?? 'IDLE';
      const got = gotT[t] ?? 'IDLE / nothing';
      diagnostics.push(`Gantt Chart: at t = ${t} the CPU should be running ${should}, but your chart shows ${got}.${explainAt(sol, t)}`);
    } else diagnostics.push(`Gantt Chart: your chart ends at t = ${stuEnd}, but the schedule ends at t = ${end}.`);
  }

  // ---- Table
  const tableState: GradeReport['tableState'] = {};
  let cellsOk = 0;
  for (const r of sol.results) {
    const a = ans.table[r.pid] ?? { ct: '', tat: '', wt: '' };
    const st = { ct: cell(a.ct, r.completion), tat: cell(a.tat, r.turnaround), wt: cell(a.wt, r.waiting) };
    tableState[r.pid] = st;
    cellsOk += [st.ct, st.tat, st.wt].filter((x) => x === 'correct').length;
    const ct = parseNum(a.ct), tat = parseNum(a.tat), wt = parseNum(a.wt);
    if (st.ct === 'wrong') diagnostics.push(`${r.pid}: C.T should be ${r.completion} — the end time of ${r.pid}'s LAST slice in the Gantt chart.`);
    if (st.tat === 'wrong') {
      if (!Number.isNaN(ct) && close(tat, ct - r.arrival)) diagnostics.push(`${r.pid}: your T.A.T is consistent with your C.T (T.A.T = C.T − A.T), so the error comes from C.T.`);
      else diagnostics.push(`${r.pid}: T.A.T = C.T − A.T = ${r.completion} − ${r.arrival} = ${r.turnaround}.`);
    }
    if (st.wt === 'wrong') {
      if (!Number.isNaN(tat) && close(wt, tat - r.burst)) diagnostics.push(`${r.pid}: your W.T follows from your T.A.T (W.T = T.A.T − B.T); fix T.A.T first.`);
      else diagnostics.push(`${r.pid}: W.T = T.A.T − B.T = ${r.turnaround} − ${r.burst} = ${r.waiting}.`);
    }
  }
  sections.push({ label: 'Process Table', earned: (WEIGHTS.table * cellsOk) / (sol.results.length * 3 || 1), max: WEIGHTS.table });

  // ---- Stats
  const statsState = {
    avgTAT: cell(ans.avgTAT, sol.avgTAT),
    avgWT: cell(ans.avgWT, sol.avgWT),
    throughput: cell(ans.throughput, sol.throughput),
  };
  const n = processes.length;
  if (statsState.avgTAT === 'wrong') diagnostics.push(`Avg T.A.T = ΣT.A.T / n = ${sol.results.reduce((s, r) => s + r.turnaround, 0)} / ${n} = ${sol.avgTAT.toFixed(2)}.`);
  if (statsState.avgWT === 'wrong') diagnostics.push(`Avg W.T = ΣW.T / n = ${sol.results.reduce((s, r) => s + r.waiting, 0)} / ${n} = ${sol.avgWT.toFixed(2)}.`);
  if (statsState.throughput === 'wrong') diagnostics.push(`Throughput = n / (last C.T − first A.T) = ${n} / (${sol.lastCT} − ${sol.firstAT}) = ${n} / ${sol.totalTime} ≈ ${sol.throughput.toFixed(3)}.`);
  const statsOk = Object.values(statsState).filter((x) => x === 'correct').length;
  sections.push({ label: 'Final Statistics', earned: (WEIGHTS.stats * statsOk) / 3, max: WEIGHTS.stats });

  const percent = Math.round(sections.reduce((s, x) => s + x.earned, 0));
  if (percent === 100) diagnostics.unshift('Perfect! Every part of your solution matches the scheduler.');
  return { percent, sections, readyQueueOk, ganttOk, ganttRowState, tableState, statsState, diagnostics };
}

export const ALL_ALGORITHMS: Algorithm[] = ['FCFS', 'SJF', 'SRTF', 'PRIORITY_NP', 'PRIORITY_P', 'RR'];

/** Random practice problem generator. Supports randomizing algorithm as well. */
export function generateProblem(
  count: number,
  withArrival: boolean,
  algorithm?: Algorithm | 'RANDOM'
): { processes: Process[]; quantum: number; algorithm: Algorithm } {
  const rnd = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
  const chosenAlgo: Algorithm =
    !algorithm || algorithm === 'RANDOM'
      ? ALL_ALGORITHMS[Math.floor(Math.random() * ALL_ALGORITHMS.length)]
      : algorithm;

  const processes: Process[] = Array.from({ length: count }, (_, i) => ({
    pid: `P${i + 1}`,
    arrival: withArrival ? (i === 0 ? 0 : rnd(0, 8)) : 0,
    burst: rnd(1, 10),
    priority: rnd(1, 5),
  }));
  const quantum = chosenAlgo === 'RR' ? rnd(2, 4) : 2;
  return { processes, quantum, algorithm: chosenAlgo };
}

