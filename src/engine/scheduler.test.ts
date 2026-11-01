import { describe, it, expect } from 'vitest';
import { schedule } from './scheduler';
import { grade } from './grader';
import type { Process } from './types';

describe('CPU Scheduler - Slide Verification Tests', () => {
  // FCFS Example 01: P1(24), P2(3), P3(3) all AT = 0
  it('verifies FCFS Example 01', () => {
    const procs: Process[] = [
      { pid: 'P1', arrival: 0, burst: 24, priority: 0 },
      { pid: 'P2', arrival: 0, burst: 3, priority: 0 },
      { pid: 'P3', arrival: 0, burst: 3, priority: 0 },
    ];
    const res = schedule(procs, 'FCFS');
    expect(res.results.find((p) => p.pid === 'P1')?.completion).toBe(24);
    expect(res.results.find((p) => p.pid === 'P2')?.completion).toBe(27);
    expect(res.results.find((p) => p.pid === 'P3')?.completion).toBe(30);
    expect(res.avgTAT).toBe(27);
    expect(res.avgWT).toBe(17);
    expect(Math.trunc(res.throughput * 100) / 100).toBe(0.1);
  });

  // SJF Example 01: P1(24), P2(3), P3(3) all AT = 0 -> Order: P2, P3, P1
  it('verifies SJF Example 01', () => {
    const procs: Process[] = [
      { pid: 'P1', arrival: 0, burst: 24, priority: 0 },
      { pid: 'P2', arrival: 0, burst: 3, priority: 0 },
      { pid: 'P3', arrival: 0, burst: 3, priority: 0 },
    ];
    const res = schedule(procs, 'SJF');
    expect(res.results.find((p) => p.pid === 'P2')?.completion).toBe(3);
    expect(res.results.find((p) => p.pid === 'P3')?.completion).toBe(6);
    expect(res.results.find((p) => p.pid === 'P1')?.completion).toBe(30);
    expect(res.avgTAT).toBe(13);
    expect(res.avgWT).toBe(3);
  });

  // Round Robin Example 01: q = 4, P1(24), P2(3), P3(3)
  it('verifies RR Example 01', () => {
    const procs: Process[] = [
      { pid: 'P1', arrival: 0, burst: 24, priority: 0 },
      { pid: 'P2', arrival: 0, burst: 3, priority: 0 },
      { pid: 'P3', arrival: 0, burst: 3, priority: 0 },
    ];
    const res = schedule(procs, 'RR', { quantum: 4 });
    expect(res.results.find((p) => p.pid === 'P2')?.completion).toBe(7);
    expect(res.results.find((p) => p.pid === 'P3')?.completion).toBe(10);
    expect(res.results.find((p) => p.pid === 'P1')?.completion).toBe(30);
  });

  // Grader test
  it('correctly grades a perfect student answer', () => {
    const procs: Process[] = [
      { pid: 'P1', arrival: 0, burst: 24, priority: 0 },
      { pid: 'P2', arrival: 0, burst: 3, priority: 0 },
      { pid: 'P3', arrival: 0, burst: 3, priority: 0 },
    ];
    const sol = schedule(procs, 'FCFS');
    const report = grade(procs, 'FCFS', sol, {
      readyQueue: 'P1, P2, P3',
      gantt: [
        { pid: 'P1', start: '0', end: '24' },
        { pid: 'P2', start: '24', end: '27' },
        { pid: 'P3', start: '27', end: '30' },
      ],
      table: {
        P1: { ct: '24', tat: '24', wt: '0' },
        P2: { ct: '27', tat: '27', wt: '24' },
        P3: { ct: '30', tat: '30', wt: '27' },
      },
      avgTAT: '27',
      avgWT: '17',
      throughput: '0.10',
    });
    expect(report.percent).toBe(100);
    expect(report.readyQueueOk).toBe(true);
    expect(report.ganttOk).toBe(true);
  });

  // Problem generator random algorithm test
  it('generates random problem with randomized algorithm', async () => {
    const { generateProblem, ALL_ALGORITHMS } = await import('./grader');
    const prob = generateProblem(4, true, 'RANDOM');
    expect(prob.processes.length).toBe(4);
    expect(ALL_ALGORITHMS).toContain(prob.algorithm);
    if (prob.algorithm === 'RR') {
      expect(prob.quantum).toBeGreaterThanOrEqual(2);
    }
  });
});
