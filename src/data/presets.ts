import type { Algorithm, PriorityMode, Process } from '../engine/types';

export interface Preset {
  id: string;
  title: string;
  algorithm: Algorithm;
  source: string;
  processes: Process[];
  quantum?: number;
  priorityMode?: PriorityMode;
  /** Exercise = slide gives no answer (good for quiz mode). */
  exercise?: boolean;
  note?: string;
}

const P = (pid: string, arrival: number, burst: number, priority = 0): Process => ({ pid, arrival, burst, priority });

const BASIC = [P('P1', 0, 24), P('P2', 0, 3), P('P3', 0, 3)];
const LATE = [P('P1', 0, 24), P('P2', 5, 3), P('P3', 8, 3)];
const IDLE = [P('P1', 5, 24), P('P2', 1, 3), P('P3', 8, 3)];
const FOUR = [P('P1', 0, 6), P('P2', 0, 8), P('P3', 0, 7), P('P4', 0, 3)];
const FIVE = [P('P0', 2, 2), P('P1', 1, 3), P('P2', 8, 14), P('P3', 4, 2), P('P4', 11, 5)];
/** "6PROC" student-exercise table (ties by HIGHEST priority number in that exercise). */
const SIX = [P('P0', 3, 7, 2), P('P1', 5, 10, 6), P('P2', 10, 2, 4), P('P3', 6, 9, 3), P('P4', 1, 5, 1), P('P5', 4, 6, 5)];
const PRIO5 = [P('P1', 1, 10, 3), P('P2', 1, 1, 1), P('P3', 1, 2, 4), P('P4', 1, 1, 5), P('P5', 1, 5, 2)];
/** Exam-style 5-process dataset (A0..A4) with arrival times >= 1 and priority tie-breaker. */
const EXAM_A5 = [
  P('A0', 3, 6, 4),
  P('A1', 1, 10, 5),
  P('A2', 5, 5, 1),
  P('A3', 8, 4, 2),
  P('A4', 2, 8, 3),
];
/** Exam-style 5-process dataset arriving at t = 0 with larger priority number = higher priority. */
const EXAM_ZERO5 = [
  P('P1', 0, 10, 3),
  P('P2', 0, 1, 1),
  P('P3', 0, 2, 3),
  P('P4', 0, 1, 4),
  P('P5', 0, 5, 2),
];
/** Exam-style 4-process dataset for SJF & RR (q = 4). */
const EXAM_FOUR_ARR = [
  P('P1', 0, 8, 2),
  P('P2', 1, 4, 1),
  P('P3', 2, 9, 3),
  P('P4', 3, 5, 4),
];

export const PRESETS: Preset[] = [
  // FCFS
  { id: 'fcfs1', title: 'FCFS Example 01', algorithm: 'FCFS', source: 'FCFS slides', processes: BASIC },
  { id: 'fcfs2', title: 'FCFS Example 02', algorithm: 'FCFS', source: 'FCFS slides', processes: [P('P2', 0, 3), P('P3', 0, 3), P('P1', 0, 24)], note: 'Arrival order P2, P3, P1 (all at t = 0).' },
  { id: 'fcfs3', title: 'FCFS Example 03', algorithm: 'FCFS', source: 'FCFS slides', processes: IDLE },
  { id: 'fcfs4', title: 'FCFS Example 04', algorithm: 'FCFS', source: 'FCFS slides', processes: FIVE },
  { id: 'fcfs5', title: 'FCFS Exercise 05 (6 processes)', algorithm: 'FCFS', source: 'Students Exercise', processes: SIX, exercise: true },
  { id: 'fcfs_exam_a5', title: 'Exam Table Drill: FCFS (A0–A4, A.T ≥ 1)', algorithm: 'FCFS', source: 'Midterm Exam Style', processes: EXAM_A5, exercise: true, note: 'CPU is idle from t = 0 to t = 1. First process to complete: A1 (at t = 11); Last: A3 (at t = 34).' },
  { id: 'fcfs_exam_z5', title: 'Exam Drill: FCFS at A.T = 0 (P1–P5)', algorithm: 'FCFS', source: 'Exam Style', processes: EXAM_ZERO5, exercise: true },
  // SJF
  { id: 'sjf1', title: 'SJF Example 01', algorithm: 'SJF', source: 'SJF slides', processes: BASIC },
  { id: 'sjf2', title: 'SJF Example 02', algorithm: 'SJF', source: 'SJF slides', processes: LATE },
  { id: 'sjf3', title: 'SJF Example 03', algorithm: 'SJF', source: 'SJF slides', processes: IDLE },
  { id: 'sjf4', title: 'SJF Example 04', algorithm: 'SJF', source: 'SJF slides', processes: FOUR },
  { id: 'sjf5', title: 'SJF Exercise 05 (6 processes)', algorithm: 'SJF', source: 'Students Exercise', processes: SIX, exercise: true },
  { id: 'sjf6', title: 'SJF Exercise 06 (5 processes)', algorithm: 'SJF', source: 'Students Exercise', processes: FIVE, exercise: true },
  { id: 'sjf_exam_z5', title: 'Exam Drill: Non-Preemptive SJF at A.T = 0 (P1–P5)', algorithm: 'SJF', source: 'Exam Style', processes: EXAM_ZERO5, exercise: true },
  { id: 'sjf_exam_arr4', title: 'Exam Drill: Non-Preemptive SJF with Arrival Times (P1–P4)', algorithm: 'SJF', source: 'Midterm Exam Style', processes: EXAM_FOUR_ARR, exercise: true },
  // SRTF
  { id: 'srtf1', title: 'SRTF Example 01', algorithm: 'SRTF', source: 'SRTF slides', processes: BASIC },
  { id: 'srtf2', title: 'SRTF Example 02', algorithm: 'SRTF', source: 'SRTF slides', processes: LATE },
  { id: 'srtf3', title: 'SRTF Example 03', algorithm: 'SRTF', source: 'SRTF slides', processes: IDLE },
  { id: 'srtf4', title: 'SRTF Example 04', algorithm: 'SRTF', source: 'SRTF slides', processes: FOUR },
  { id: 'srtf5', title: 'SRTF Exercise 05 (6 processes)', algorithm: 'SRTF', source: 'Students Exercise', processes: SIX, exercise: true },
  { id: 'srtf6', title: 'SRTF Exercise 06 (5 processes)', algorithm: 'SRTF', source: 'Students Exercise', processes: FIVE, exercise: true },
  { id: 'srtf_exam_a5', title: 'Exam Table Drill: SRTF Preemptive (A0–A4, A.T ≥ 1)', algorithm: 'SRTF', source: 'Midterm Exam Style', processes: EXAM_A5, exercise: true, note: 'Preemptions at t = 2 (A4 < A1) and t = 3 (A0 < A4). First to complete: A0 (at t = 9); Last: A1 (at t = 34).' },
  // Priority NP
  { id: 'pnp1', title: 'Priority (NP) Example 01', algorithm: 'PRIORITY_NP', source: 'Priority slides', processes: [P('P1', 0, 24, 3), P('P2', 0, 3, 1), P('P3', 0, 3, 2)] },
  { id: 'pnp2', title: 'Priority (NP) Example 02', algorithm: 'PRIORITY_NP', source: 'Priority slides', processes: [P('P1', 2, 24, 3), P('P2', 5, 3, 2), P('P3', 8, 3, 1)], note: 'This slide computes throughput as 3/32 (last C.T); the app uses n / (last C.T − first A.T) = 3/30.' },
  { id: 'pnp3', title: 'Priority (NP) Example 03', algorithm: 'PRIORITY_NP', source: 'Priority slides', processes: PRIO5 },
  { id: 'pnp4', title: 'Priority Exercise 04 (6 processes)', algorithm: 'PRIORITY_NP', source: 'Students Exercise (slide 158/159)', processes: SIX, exercise: true },
  { id: 'pnp_exam_high', title: 'Exam Drill: Priority (NP, Larger Number = Higher Priority)', algorithm: 'PRIORITY_NP', source: 'Exam Style', processes: EXAM_ZERO5, priorityMode: 'HIGH_IS_HIGH', exercise: true, note: 'Uses HIGH_IS_HIGH (Larger priority number = higher priority: P4(4) -> P1(3) -> P3(3) -> P5(2) -> P2(1)).' },
  // Priority P
  { id: 'pp1', title: 'Priority (P) Example 01', algorithm: 'PRIORITY_P', source: 'Priority slides', processes: [P('P1', 0, 24, 3), P('P2', 0, 3, 1), P('P3', 0, 3, 2)] },
  { id: 'pp2', title: 'Priority (P) Example 02', algorithm: 'PRIORITY_P', source: 'Priority slides', processes: [P('P1', 2, 24, 3), P('P2', 5, 3, 2), P('P3', 7, 3, 1)], note: 'This slide computes throughput as 3/32 (last C.T); the app uses n / (last C.T − first A.T) = 3/30.' },
  { id: 'pp3', title: 'Priority (P) Example 03', algorithm: 'PRIORITY_P', source: 'Priority slides', processes: PRIO5, note: 'The slide’s result table mixes A.T = 0 with A.T = 1 completion times; the correct answer equals the non-preemptive result.' },
  { id: 'pp4', title: 'Priority Exercise 04 (6 processes, preemptive)', algorithm: 'PRIORITY_P', source: 'Students Exercise (slide 158/159)', processes: SIX, exercise: true },
  { id: 'pp_exam_a5', title: 'Exam Table Drill: Preemptive Priority (A0–A4)', algorithm: 'PRIORITY_P', source: 'Midterm Exam Style', processes: EXAM_A5, exercise: true },
  // RR
  { id: 'rr1', title: 'RR Example 01 (q = 4)', algorithm: 'RR', source: 'RR slides', processes: BASIC, quantum: 4 },
  { id: 'rr2', title: 'RR Example 02 (q = 4)', algorithm: 'RR', source: 'RR slides', processes: [P('P1', 2, 24), P('P2', 15, 6), P('P3', 5, 3)], quantum: 4 },
  { id: 'rr3', title: 'RR Exercise 03 (q = 2, 6 processes)', algorithm: 'RR', source: 'Students Exercise (slide 75/76)', processes: SIX, quantum: 2, exercise: true },
  { id: 'rr4', title: 'RR Exercise 04 (q = 3, 5 processes)', algorithm: 'RR', source: 'Students Exercise', processes: FIVE, quantum: 3, exercise: true },
  { id: 'rr_exam_arr4', title: 'Exam Drill: Round Robin (q = 4, P1–P4)', algorithm: 'RR', source: 'Midterm Exam Style', processes: EXAM_FOUR_ARR, quantum: 4, exercise: true },
];
