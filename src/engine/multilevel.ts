import type { Process, ProcessResult, Slice } from './types';
import { computeMetrics } from './scheduler';

export interface MLQueueConfig {
  name: string;
  type: 'RR' | 'FCFS';
  quantum: number;
}

export interface MLProcess extends Process {
  /** Queue index the process is assigned to (MLQ) — ignored for MLFQ (everyone starts in Q0). */
  queue: number;
}

export interface MLOptions {
  queues: MLQueueConfig[];
  /** true = Multilevel Feedback Queue (demotion + aging), false = fixed Multilevel Queue. */
  feedback: boolean;
  /** MLFQ aging: promote a process one level after waiting this long (0 = disabled). */
  agingThreshold: number;
}

export interface MLSlice extends Slice {
  level: number | null;
}

export interface MLSnapshot {
  time: number;
  running: string | null;
  runningLevel: number | null;
  queues: string[][];
  events: string[];
}

export interface MLResult {
  slices: MLSlice[];
  snapshots: MLSnapshot[];
  results: ProcessResult[];
  avgTAT: number;
  avgWT: number;
  throughput: number;
  totalTime: number;
  lastCT: number;
  firstAT: number;
}

/**
 * Multilevel (Feedback) Queue simulation.
 * - Queues are served by fixed priority: Q0 > Q1 > ... ; a higher queue preempts a lower one.
 * - A process preempted by a higher-level arrival returns to the HEAD of its own queue.
 * - MLFQ: a process that uses its full quantum is demoted one level; aging promotes long waiters.
 */
export function scheduleMultilevel(processes: MLProcess[], opts: MLOptions): MLResult {
  const { queues: cfg, feedback, agingThreshold } = opts;
  const L = cfg.length;
  const n = processes.length;
  const rank = new Map(processes.map((p, i) => [p.pid, i]));
  const arrivals = [...processes].sort((a, b) => a.arrival - b.arrival || rank.get(a.pid)! - rank.get(b.pid)!);
  const remaining: Record<string, number> = Object.fromEntries(processes.map((p) => [p.pid, p.burst]));
  const completion: Record<string, number> = {};
  const firstStart: Record<string, number> = {};
  const waitSince: Record<string, number> = {};
  const qs: string[][] = cfg.map(() => []);
  const slices: MLSlice[] = [];
  const snapshots: MLSnapshot[] = [];
  let done = 0;
  let nextArr = 0;
  let running: string | null = null;
  let level = 0;
  let qUsed = 0;
  let t = 0;
  let pending: string[] = [];

  const enqueue = (pid: string, lv: number, head = false) => {
    if (head) qs[lv].unshift(pid);
    else qs[lv].push(pid);
    waitSince[pid] = t;
  };
  const push = (pid: string | null, lv: number | null, s: number, e: number) => {
    const last = slices[slices.length - 1];
    if (last && last.pid === pid && last.level === lv && last.end === s) last.end = e;
    else slices.push({ pid, level: lv, start: s, end: e });
  };
  const topLevel = () => qs.findIndex((q) => q.length > 0);

  while (done < n) {
    const events = pending;
    pending = [];

    while (nextArr < n && arrivals[nextArr].arrival <= t) {
      const p = arrivals[nextArr++];
      const lv = feedback ? 0 : Math.min(Math.max(0, p.queue), L - 1);
      enqueue(p.pid, lv);
      events.push(`${p.pid} arrives (B.T = ${p.burst}) and enters ${cfg[lv].name}.`);
    }

    if (feedback && agingThreshold > 0) {
      for (let lv = 1; lv < L; lv++) {
        for (const pid of [...qs[lv]]) {
          if (t - waitSince[pid] >= agingThreshold) {
            qs[lv].splice(qs[lv].indexOf(pid), 1);
            enqueue(pid, lv - 1);
            events.push(`Aging: ${pid} waited ${agingThreshold} units in ${cfg[lv].name} → promoted to ${cfg[lv - 1].name}.`);
          }
        }
      }
    }

    if (running) {
      const c = cfg[level];
      const top = topLevel();
      if (c.type === 'RR' && qUsed >= c.quantum) {
        const target = feedback ? Math.min(level + 1, L - 1) : level;
        events.push(
          `${running} used its full quantum (q = ${c.quantum}) in ${c.name}` +
            (target !== level ? ` → demoted to ${cfg[target].name}.` : ` → back to the tail of ${c.name}.`),
        );
        enqueue(running, target);
        running = null;
      } else if (top !== -1 && top < level) {
        events.push(`A process is waiting in higher-priority ${cfg[top].name} → ${running} (${c.name}) is preempted and returns to the head of ${c.name}.`);
        enqueue(running, level, true);
        running = null;
      }
    }

    if (!running) {
      const top = topLevel();
      if (top !== -1) {
        running = qs[top].shift()!;
        level = top;
        qUsed = 0;
        if (firstStart[running] === undefined) firstStart[running] = t;
        const c = cfg[top];
        events.push(`${running} is dispatched from ${c.name} (${c.type === 'RR' ? `RR, q = ${c.quantum}` : 'FCFS'}).`);
      }
    }

    if (events.length) {
      snapshots.push({ time: t, running, runningLevel: running ? level : null, queues: qs.map((q) => [...q]), events });
    }

    if (!running) {
      const na = arrivals[nextArr].arrival;
      push(null, null, t, na);
      pending.push(`CPU was IDLE from t = ${t} to t = ${na}.`);
      t = na;
      continue;
    }
    push(running, level, t, t + 1);
    remaining[running]--;
    qUsed++;
    t++;
    if (remaining[running] === 0) {
      completion[running] = t;
      done++;
      pending.push(`${running} completes at t = ${t}.`);
      running = null;
    }
  }
  if (pending.length) snapshots.push({ time: t, running: null, runningLevel: null, queues: qs.map(() => []), events: [...pending, 'All processes have completed.'] });

  const m = computeMetrics(processes, completion, firstStart);
  return { slices, snapshots, ...m };
}
