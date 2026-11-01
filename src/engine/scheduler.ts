import type {
  Algorithm,
  Process,
  ProcessResult,
  ScheduleOptions,
  ScheduleResult,
  Slice,
  Snapshot,
} from './types';

/** Natural PID comparison so that P2 < P10 and P0 < P1. */
export function comparePid(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

export function pushSlice(slices: Slice[], pid: string | null, start: number, end: number) {
  if (end <= start) return;
  const last = slices[slices.length - 1];
  if (last && last.pid === pid && last.end === start) last.end = end;
  else slices.push({ pid, start, end });
}

/** Merge adjacent slices with identical pid (used for normalising / comparing charts). */
export function mergeSlices(slices: Slice[]): Slice[] {
  const out: Slice[] = [];
  for (const s of slices) pushSlice(out, s.pid, s.start, s.end);
  return out;
}

export function computeMetrics(processes: Process[], completion: Record<string, number>, firstStart: Record<string, number>) {
  const results: ProcessResult[] = processes.map((p) => {
    const c = completion[p.pid];
    const tat = c - p.arrival;
    return {
      ...p,
      completion: c,
      turnaround: tat,
      waiting: tat - p.burst,
      response: (firstStart[p.pid] ?? p.arrival) - p.arrival,
    };
  });
  const n = results.length || 1;
  const avgTAT = results.reduce((s, r) => s + r.turnaround, 0) / n;
  const avgWT = results.reduce((s, r) => s + r.waiting, 0) / n;
  // Throughput = n / (last completion − first arrival). This "schedule span" rule matches
  // the majority of the CPCS 361 slide examples (FCFS Ex04, SJF Ex04, RR Ex02, Priority Ex03...).
  const lastCT = Math.max(0, ...results.map((r) => r.completion));
  const firstAT = results.length ? Math.min(...results.map((r) => r.arrival)) : 0;
  const totalTime = lastCT - firstAT;
  const throughput = totalTime > 0 ? results.length / totalTime : 0;
  return { results, avgTAT, avgWT, totalTime, throughput, lastCT, firstAT };
}

/** Slide-style formatting: cut off (truncate) to 2 decimals, e.g. 4/24 → 0.16, 47/3 → 15.66. */
export function trunc2(x: number): string {
  const v = Math.trunc(x * 100 + 1e-9) / 100;
  return v.toFixed(2);
}

export function validateProcesses(processes: Process[]): string | null {
  if (processes.length === 0) return 'Add at least one process.';
  const seen = new Set<string>();
  for (const p of processes) {
    if (!p.pid.trim()) return 'Every process needs a Process ID.';
    if (seen.has(p.pid)) return `Duplicate Process ID "${p.pid}".`;
    seen.add(p.pid);
    if (!Number.isInteger(p.arrival) || p.arrival < 0) return `${p.pid}: Arrival Time must be a non-negative integer.`;
    if (!Number.isInteger(p.burst) || p.burst <= 0) return `${p.pid}: Burst Time must be a positive integer.`;
    if (!Number.isFinite(p.priority)) return `${p.pid}: Priority must be a number.`;
  }
  return null;
}

/**
 * Discrete-time simulation of the classic single-queue scheduling policies.
 * Tie-breaking: primary key (burst / remaining / priority) → earlier arrival → lower PID.
 * RR rule: a process arriving at the same instant a quantum expires enters the queue
 * BEFORE the preempted process.
 */
export function schedule(processes: Process[], algorithm: Algorithm, opts: ScheduleOptions = {}): ScheduleResult {
  const quantum = Math.max(1, Math.floor(opts.quantum ?? 2));
  const priorityMode = opts.priorityMode ?? 'LOW_IS_HIGH';
  const procs = processes.map((p) => ({ ...p }));
  const n = procs.length;
  const byPid = new Map(procs.map((p) => [p.pid, p]));
  // Tie-break rank = position in the process table (tables are normally listed in PID order).
  const rank = new Map(procs.map((p, i) => [p.pid, i]));
  const arrivals = [...procs].sort((a, b) => a.arrival - b.arrival || rank.get(a.pid)! - rank.get(b.pid)!);

  const remaining: Record<string, number> = Object.fromEntries(procs.map((p) => [p.pid, p.burst]));
  const completion: Record<string, number> = {};
  const firstStart: Record<string, number> = {};
  const queue: string[] = [];
  const readyQueueSequence: string[] = [];
  const slices: Slice[] = [];
  const snapshots: Snapshot[] = [];
  const completed: string[] = [];

  const prio = (pid: string) => (priorityMode === 'LOW_IS_HIGH' ? byPid.get(pid)!.priority : -byPid.get(pid)!.priority);
  const key = (pid: string): number => {
    switch (algorithm) {
      case 'SJF': return byPid.get(pid)!.burst;
      case 'SRTF': return remaining[pid];
      case 'PRIORITY_NP':
      case 'PRIORITY_P': return prio(pid);
      default: return 0;
    }
  };
  const cmp = (a: string, b: string) =>
    key(a) - key(b) || byPid.get(a)!.arrival - byPid.get(b)!.arrival || rank.get(a)! - rank.get(b)!;
  const best = (): string | undefined => {
    if (queue.length === 0) return undefined;
    if (algorithm === 'FCFS' || algorithm === 'RR') return queue[0];
    return [...queue].sort(cmp)[0];
  };
  const prioLabel = (pid: string) => `priority ${byPid.get(pid)!.priority}`;

  let nextArr = 0;
  let running: string | null = null;
  let qUsed = 0;
  let t = 0;
  let splitNext = false;

  // Initial empty snapshot if first arrival is at t >= 0
  snapshots.push({
    time: 0,
    running: null,
    cumulativeQueue: [],
    queue: [],
    remaining: { ...remaining },
    completed: [],
    events: ['Ready Queue initialized.'],
  });

  while (completed.length < n) {
    // 1) New arrivals join the tail of the ready queue ONE BY ONE (Step-by-step addition!)
    while (nextArr < n && arrivals[nextArr].arrival <= t) {
      const p = arrivals[nextArr++];
      queue.push(p.pid);
      readyQueueSequence.push(p.pid);
      snapshots.push({
        time: t,
        running,
        cumulativeQueue: [...readyQueueSequence],
        activeQueueIndex: readyQueueSequence.length - 1,
        queue: [...queue],
        remaining: { ...remaining },
        completed: [...completed],
        events: [
          `${p.pid} arrives (A.T = ${p.arrival}, B.T = ${p.burst}${
            algorithm.startsWith('PRIORITY') ? `, ${prioLabel(p.pid)}` : ''
          }) and enters the Ready Queue.`,
        ],
      });
    }

    // 2) Preemption checks
    if (running) {
      if (algorithm === 'RR' && qUsed >= quantum) {
        if (queue.length > 0) {
          queue.push(running);
          readyQueueSequence.push(running);
          snapshots.push({
            time: t,
            running: null,
            cumulativeQueue: [...readyQueueSequence],
            activeQueueIndex: readyQueueSequence.length - 1,
            queue: [...queue],
            remaining: { ...remaining },
            completed: [...completed],
            events: [
              `Time quantum (q = ${quantum}) expired for ${running} (remaining: ${remaining[running]}); appended back to Ready Queue.`,
            ],
          });
          running = null;
        } else {
          // As in lecture slides (e.g. RR Ex01 slides 18-24), when quantum expires,
          // the process is re-appended to the Ready Queue tape even if repeated consecutively!
          readyQueueSequence.push(running);
          qUsed = 0;
          splitNext = true;
          snapshots.push({
            time: t,
            running,
            cumulativeQueue: [...readyQueueSequence],
            activeQueueIndex: readyQueueSequence.length - 1,
            queue: [...queue],
            remaining: { ...remaining },
            completed: [...completed],
            events: [
              `Time quantum (q = ${quantum}) completed for ${running} (remaining: ${remaining[running]}); appended to Ready Queue for next quantum.`,
            ],
          });
        }
      } else if (algorithm === 'SRTF') {
        const b = best();
        if (b && remaining[b] < remaining[running]) {
          queue.push(running);
          readyQueueSequence.push(running);
          snapshots.push({
            time: t,
            running: null,
            cumulativeQueue: [...readyQueueSequence],
            activeQueueIndex: readyQueueSequence.length - 1,
            queue: [...queue],
            remaining: { ...remaining },
            completed: [...completed],
            events: [
              `${b} arrived with shorter remaining time (${remaining[b]} < ${remaining[running]}) → ${running} preempted back to Ready Queue.`,
            ],
          });
          running = null;
        }
      } else if (algorithm === 'PRIORITY_P') {
        const b = best();
        if (b && prio(b) < prio(running)) {
          queue.push(running);
          readyQueueSequence.push(running);
          snapshots.push({
            time: t,
            running: null,
            cumulativeQueue: [...readyQueueSequence],
            activeQueueIndex: readyQueueSequence.length - 1,
            queue: [...queue],
            remaining: { ...remaining },
            completed: [...completed],
            events: [
              `${b} (${prioLabel(b)}) has higher priority than ${running} (${prioLabel(running)}) → ${running} preempted back to Ready Queue.`,
            ],
          });
          running = null;
        }
      }
    }

    // 3) Dispatch
    if (!running && queue.length > 0) {
      const pick = best()!;
      queue.splice(queue.indexOf(pick), 1);
      running = pick;
      qUsed = 0;
      if (firstStart[pick] === undefined) firstStart[pick] = t;
      const reason: Record<Algorithm, string> = {
        FCFS: 'it is at the head of the FIFO ready queue',
        SJF: `it has the shortest burst time (${byPid.get(pick)!.burst}) among ready processes`,
        SRTF: `it has the shortest remaining time (${remaining[pick]}) among ready processes`,
        PRIORITY_NP: `it has the highest priority (${byPid.get(pick)!.priority}) among ready processes`,
        PRIORITY_P: `it has the highest priority (${byPid.get(pick)!.priority}) among ready processes`,
        RR: `it is at the head of the ready queue; it may run for up to q = ${quantum}`,
      };
      snapshots.push({
        time: t,
        running: pick,
        cumulativeQueue: [...readyQueueSequence],
        queue: [...queue],
        remaining: { ...remaining },
        completed: [...completed],
        events: [`${pick} is dispatched to the CPU because ${reason[algorithm]}.`],
      });
    }

    // 4) Execute
    if (!running) {
      const na = arrivals[nextArr].arrival;
      pushSlice(slices, null, t, na);
      snapshots.push({
        time: t,
        running: null,
        cumulativeQueue: [...readyQueueSequence],
        queue: [],
        remaining: { ...remaining },
        completed: [...completed],
        events: [`CPU is IDLE from t = ${t} to t = ${na}.`],
      });
      t = na;
      continue;
    }

    if (splitNext) {
      slices.push({ pid: running, start: t, end: t + 1 });
      splitNext = false;
    } else {
      pushSlice(slices, running, t, t + 1);
    }
    remaining[running]--;
    qUsed++;
    t++;

    if (remaining[running] === 0) {
      completion[running] = t;
      completed.push(running);
      snapshots.push({
        time: t,
        running: null,
        cumulativeQueue: [...readyQueueSequence],
        queue: [...queue],
        remaining: { ...remaining },
        completed: [...completed],
        events: [`${running} finished execution at t = ${t} (C.T = ${t}).`],
      });
      running = null;
    }
  }

  // Final completion snapshot
  snapshots.push({
    time: t,
    running: null,
    cumulativeQueue: [...readyQueueSequence],
    queue: [],
    remaining: { ...remaining },
    completed: [...completed],
    events: ['All processes have completed execution successfully.'],
  });

  const m = computeMetrics(procs, completion, firstStart);
  return {
    algorithm,
    options: { quantum, priorityMode },
    slices,
    snapshots,
    readyQueueSequence,
    ...m,
  };
}
