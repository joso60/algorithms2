// Core types for the CPU scheduling engine (framework-agnostic, fully unit-testable)

export type Algorithm = 'FCFS' | 'SJF' | 'SRTF' | 'PRIORITY_NP' | 'PRIORITY_P' | 'RR';

export type PriorityMode = 'LOW_IS_HIGH' | 'HIGH_IS_HIGH';

export interface Process {
  pid: string;
  arrival: number;
  burst: number;
  priority: number;
}

/** A contiguous execution block in the Gantt chart. pid === null means CPU IDLE. */
export interface Slice {
  pid: string | null;
  start: number;
  end: number;
}

/** State of the system at a scheduling event (arrival, dispatch, preemption, completion). */
export interface Snapshot {
  time: number;
  running: string | null;
  /** Cumulative Ready Queue history as shown in lecture slides (items are NEVER removed). */
  cumulativeQueue: string[];
  /** Index in cumulativeQueue that was just added or is currently active. */
  activeQueueIndex?: number;
  /** Transient ready queue contents (currently waiting processes). */
  queue: string[];
  /** Remaining burst per pid at this instant. */
  remaining: Record<string, number>;
  completed: string[];
  events: string[];
}

export interface ProcessResult extends Process {
  completion: number;
  turnaround: number;
  waiting: number;
  response: number;
}

export interface ScheduleOptions {
  quantum?: number;
  priorityMode?: PriorityMode;
}

export interface ScheduleResult {
  algorithm: Algorithm;
  options: Required<ScheduleOptions>;
  slices: Slice[];
  snapshots: Snapshot[];
  results: ProcessResult[];
  /** Order in which processes enter the ready queue (including re-entries after preemption). */
  readyQueueSequence: string[];
  avgTAT: number;
  avgWT: number;
  throughput: number;
  /** Schedule span used for throughput: last completion − first arrival. */
  totalTime: number;
  lastCT: number;
  firstAT: number;
}

export const ALGORITHM_LABELS: Record<Algorithm, string> = {
  FCFS: 'First-Come, First-Served (FCFS)',
  SJF: 'Shortest Job First (SJF) — Non-Preemptive',
  SRTF: 'Shortest Remaining Time First (SRTF)',
  PRIORITY_NP: 'Priority — Non-Preemptive',
  PRIORITY_P: 'Priority — Preemptive',
  RR: 'Round Robin (RR)',
};

export const ALGORITHM_SHORT: Record<Algorithm, string> = {
  FCFS: 'FCFS',
  SJF: 'SJF',
  SRTF: 'SRTF',
  PRIORITY_NP: 'Priority (NP)',
  PRIORITY_P: 'Priority (P)',
  RR: 'Round Robin',
};

export const usesPriority = (a: Algorithm) => a === 'PRIORITY_NP' || a === 'PRIORITY_P';
