import React, { useState } from 'react';
import { KNOWLEDGE, COMPARISON } from '../data/knowledge';
import { scheduleMultilevel, type MLProcess } from '../engine/multilevel';
import { BookOpen, Check, X, Layers, GitCompare, ChevronDown, ListOrdered, Code2, Calculator, Lightbulb } from 'lucide-react';

/** Collapsible accordion section used to keep theory pages short and scannable. */
const Accordion: React.FC<{
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ title, icon, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700/70 bg-white dark:bg-slate-900/60 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
          {icon}
          {title}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-3">{children}</div>}
    </div>
  );
};

const TABLE_WRAP = 'overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700';
const TABLE_HEAD =
  'bg-slate-100 dark:bg-slate-800/40 font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700';
const TABLE_BODY = 'divide-y divide-slate-200 dark:divide-slate-700/70';

export const ModeKnowledge: React.FC = () => {
  const [selectedAlgoId, setSelectedAlgoId] = useState<string>('FCFS');
  const [activeSubTab, setActiveSubTab] = useState<'theory' | 'exam_math' | 'comparison' | 'mlfq'>('theory');

  // MLFQ interactive mini-demo state
  const [mlfqFeedback, setMlfqFeedback] = useState<boolean>(true);
  const [mlfqAging, setMlfqAging] = useState<number>(10);
  const [mlfqProcs] = useState<MLProcess[]>([
    { pid: 'P1', arrival: 0, burst: 18, priority: 1, queue: 0 },
    { pid: 'P2', arrival: 4, burst: 5, priority: 1, queue: 0 },
    { pid: 'P3', arrival: 10, burst: 25, priority: 1, queue: 0 },
  ]);

  const mlfqResult = React.useMemo(() => {
    return scheduleMultilevel(mlfqProcs, {
      queues: [
        { name: 'Queue 0 (RR)', type: 'RR', quantum: 4 },
        { name: 'Queue 1 (RR)', type: 'RR', quantum: 8 },
        { name: 'Queue 2 (FCFS)', type: 'FCFS', quantum: 0 },
      ],
      feedback: mlfqFeedback,
      agingThreshold: mlfqAging,
    });
  }, [mlfqProcs, mlfqFeedback, mlfqAging]);

  const currentAlgo = KNOWLEDGE.find((a) => a.id === selectedAlgoId) || KNOWLEDGE[0];

  const tabClass = (tab: 'theory' | 'exam_math' | 'comparison' | 'mlfq') =>
    `flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all cursor-pointer ${
      activeSubTab === tab
        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
        : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
    }`;

  return (
    <div className="space-y-6">
      {/* Subtab Navigation */}
      <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-700/70">
        <button onClick={() => setActiveSubTab('theory')} className={tabClass('theory')}>
          <BookOpen className="h-4 w-4" /> Algorithm Deep Dive
        </button>
        <button onClick={() => setActiveSubTab('exam_math')} className={tabClass('exam_math')}>
          <Calculator className="h-4 w-4" /> Step-by-Step Table Math &amp; Exam Guide
        </button>
        <button onClick={() => setActiveSubTab('comparison')} className={tabClass('comparison')}>
          <GitCompare className="h-4 w-4" /> Comparison Matrix
        </button>
        <button onClick={() => setActiveSubTab('mlfq')} className={tabClass('mlfq')}>
          <Layers className="h-4 w-4" /> Multilevel Queue (MLQ / MLFQ)
        </button>
      </div>

      {/* SubTab 1: Algorithm Deep Dive */}
      {activeSubTab === 'theory' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Algorithm sidebar selector */}
          <div className="space-y-1.5 md:border-r border-slate-200 dark:border-slate-700/70 pr-2 self-start">
            <span className="text-xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">
              Algorithms
            </span>
            {KNOWLEDGE.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedAlgoId(a.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                  selectedAlgoId === a.id
                    ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 font-semibold'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span>{a.name}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">{a.type}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Details area */}
          <div className="md:col-span-3 space-y-4">
            {/* Header info (always visible) */}
            <div className="card space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                  {currentAlgo.name} ({currentAlgo.short})
                </h3>
                <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                  Type: {currentAlgo.type}
                </span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-7">{currentAlgo.concept}</p>
            </div>

            {/* Execution Steps */}
            <Accordion
              title="Execution mechanism & rules"
              icon={<ListOrdered className="h-4 w-4 text-indigo-500" />}
              defaultOpen
            >
              <ol className="space-y-2 text-sm text-slate-700 dark:text-slate-300 list-decimal pl-5 marker:text-slate-400 leading-7">
                {currentAlgo.steps.map((st, i) => (
                  <li key={i}>{st}</li>
                ))}
              </ol>
            </Accordion>

            {/* Advantages and Disadvantages */}
            <Accordion title="Advantages & trade-offs" defaultOpen>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/70 p-3 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                    <Check className="h-4 w-4" />
                    <span>Advantages</span>
                  </div>
                  <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {currentAlgo.advantages.map((adv, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-500">&bull;</span>
                        <span>{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/70 p-3 space-y-2">
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold text-sm">
                    <X className="h-4 w-4" />
                    <span>Disadvantages</span>
                  </div>
                  <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {currentAlgo.disadvantages.map((dis, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-500">&bull;</span>
                        <span>{dis}</span>
                      </li>
                    ))}
                  </ul>
                  {currentAlgo.solution && (
                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700/70 text-sm leading-relaxed">
                      <strong className="text-slate-800 dark:text-slate-100">Proposed solution: </strong>
                      <span className="text-slate-700 dark:text-slate-300">{currentAlgo.solution}</span>
                    </div>
                  )}
                </div>
              </div>
            </Accordion>

            {/* Pseudocode / Logic Trace (always dark, like an IDE) */}
            <Accordion title="Algorithm pseudocode" icon={<Code2 className="h-4 w-4 text-indigo-500" />}>
              <pre className="rounded-lg bg-slate-950 text-slate-200 p-4 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-700">
                {currentAlgo.pseudo}
              </pre>
            </Accordion>
          </div>
        </div>
      )}

      {/* SubTab: Step-by-Step Table Math & Exam Guide */}
      {activeSubTab === 'exam_math' && (
        <div className="space-y-4">
          <div className="card space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                Manual Table Calculation &amp; Exam Solving Guide
              </h3>
              <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                C.T &bull; T.A.T &bull; W.T &bull; Averages
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              On written exams, you are given a process table (<code className="font-mono">Process | A.T | Priority | B.T</code>)
              and asked to construct the <strong>Ready Queue</strong>, draw the <strong>Gantt Chart</strong>, fill in{' '}
              <code className="font-mono">C.T</code>, <code className="font-mono">W.T</code>, and{' '}
              <code className="font-mono">T.A.T</code> for every process, and compute the exact averages.
            </p>
          </div>

          <Accordion
            title="1. The 5 Core Formulas (Memorize for Every Scheduling Table)"
            icon={<Calculator className="h-4 w-4 text-indigo-500" />}
            defaultOpen
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 p-3 space-y-1.5">
                <div className="font-semibold text-sm text-indigo-600 dark:text-indigo-400">
                  1. Completion Time (C.T)
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Read directly from the <strong>rightmost edge</strong> of the process’s <strong>FINAL slice</strong> in
                  the Gantt Chart. If a process is preempted multiple times (e.g., in SRTF or RR), only the timestamp
                  where it finishes completely is its <code className="font-mono">C.T</code>.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 p-3 space-y-1.5">
                <div className="font-semibold text-sm text-blue-600 dark:text-blue-400">
                  2. Turnaround Time (T.A.T = C.T &minus; A.T)
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Total time elapsed from the moment the process arrives (<code className="font-mono">A.T</code>) until it
                  completes execution (<code className="font-mono">C.T</code>). Note: If all processes arrive at{' '}
                  <code className="font-mono">A.T = 0</code>, then <code className="font-mono">T.A.T = C.T</code>.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 p-3 space-y-1.5">
                <div className="font-semibold text-sm text-emerald-600 dark:text-emerald-400">
                  3. Waiting Time (W.T = T.A.T &minus; B.T)
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Total time spent waiting in the Ready Queue:{' '}
                  <code className="font-mono">W.T = T.A.T - B.T = (C.T - A.T) - B.T</code>. Always verify that{' '}
                  <code className="font-mono">W.T &ge; 0</code> and utilize the original total{' '}
                  <code className="font-mono">B.T</code>.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 p-3 space-y-1.5">
                <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                  4. Averages, Response Time &amp; Throughput
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  &bull; <code className="font-mono">Avg. T.A.T = (&Sigma; T.A.T) / n</code> &nbsp;|&nbsp;{' '}
                  <code className="font-mono">Avg. W.T = (&Sigma; W.T) / n</code>
                  <br />
                  &bull; <code className="font-mono">Response Time (R.T) = First CPU Start Time - A.T</code>
                  <br />
                  &bull; <code className="font-mono">Throughput = n / (Last C.T - First A.T)</code>
                </p>
              </div>
            </div>
          </Accordion>

          <Accordion
            title="2. Worked Step-by-Step Table Walkthrough (SRTF vs. FCFS with Arrival Times)"
            icon={<ListOrdered className="h-4 w-4 text-indigo-500" />}
            defaultOpen
          >
            <div className="space-y-4 text-xs">
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                Consider 5 processes where <strong>lowest priority number = highest priority</strong>, and priority breaks
                ties when two processes have equal remaining burst time:
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* SRTF Worked Table */}
                <div className="space-y-2">
                  <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                    Case A: SRTF (Preemptive Shortest Remaining Time First)
                  </div>
                  <div className="rounded-lg bg-slate-950 text-slate-200 p-3 font-mono text-[11px] border border-slate-700 space-y-1">
                    <div className="text-indigo-400 font-semibold">
                      Gantt Chart (starts at t = 1 because earliest A.T = 1):
                    </div>
                    <div>[1 &rarr; 2: A1] [2 &rarr; 3: A4] [3 &rarr; 5: A0] [5 &rarr; 9: A0] [9 &rarr; 13: A3] [13 &rarr; 18: A2] [18 &rarr; 25: A4] [25 &rarr; 34: A1]</div>
                    <div className="text-slate-400">
                      Ready Queue Tape: A3, A2, A4, A0, A1, A4, A1
                    </div>
                  </div>
                  <div className={TABLE_WRAP}>
                    <table className="w-full text-left text-xs font-mono">
                      <thead className={TABLE_HEAD}>
                        <tr>
                          <th className="px-2.5 py-2">Process</th>
                          <th className="px-2.5 py-2">A.T</th>
                          <th className="px-2.5 py-2">Priority</th>
                          <th className="px-2.5 py-2">B.T</th>
                          <th className="px-2.5 py-2 text-indigo-600 dark:text-indigo-400">C.T</th>
                          <th className="px-2.5 py-2 text-emerald-600 dark:text-emerald-400">W.T</th>
                          <th className="px-2.5 py-2 text-blue-600 dark:text-blue-400">T.A.T</th>
                        </tr>
                      </thead>
                      <tbody className={TABLE_BODY}>
                        <tr>
                          <td className="px-2.5 py-1.5 font-bold">A0</td>
                          <td className="px-2.5 py-1.5">3</td>
                          <td className="px-2.5 py-1.5">3</td>
                          <td className="px-2.5 py-1.5">6</td>
                          <td className="px-2.5 py-1.5 font-bold text-indigo-600 dark:text-indigo-400">9</td>
                          <td className="px-2.5 py-1.5 font-bold text-emerald-600 dark:text-emerald-400">0 (6-6)</td>
                          <td className="px-2.5 py-1.5 font-bold text-blue-600 dark:text-blue-400">6 (9-3)</td>
                        </tr>
                        <tr>
                          <td className="px-2.5 py-1.5 font-bold">A1</td>
                          <td className="px-2.5 py-1.5">1</td>
                          <td className="px-2.5 py-1.5">4</td>
                          <td className="px-2.5 py-1.5">10</td>
                          <td className="px-2.5 py-1.5 font-bold text-indigo-600 dark:text-indigo-400">34</td>
                          <td className="px-2.5 py-1.5 font-bold text-emerald-600 dark:text-emerald-400">23 (33-10)</td>
                          <td className="px-2.5 py-1.5 font-bold text-blue-600 dark:text-blue-400">33 (34-1)</td>
                        </tr>
                        <tr>
                          <td className="px-2.5 py-1.5 font-bold">A2</td>
                          <td className="px-2.5 py-1.5">5</td>
                          <td className="px-2.5 py-1.5">2</td>
                          <td className="px-2.5 py-1.5">5</td>
                          <td className="px-2.5 py-1.5 font-bold text-indigo-600 dark:text-indigo-400">18</td>
                          <td className="px-2.5 py-1.5 font-bold text-emerald-600 dark:text-emerald-400">8 (13-5)</td>
                          <td className="px-2.5 py-1.5 font-bold text-blue-600 dark:text-blue-400">13 (18-5)</td>
                        </tr>
                        <tr>
                          <td className="px-2.5 py-1.5 font-bold">A3</td>
                          <td className="px-2.5 py-1.5">8</td>
                          <td className="px-2.5 py-1.5">1</td>
                          <td className="px-2.5 py-1.5">4</td>
                          <td className="px-2.5 py-1.5 font-bold text-indigo-600 dark:text-indigo-400">13</td>
                          <td className="px-2.5 py-1.5 font-bold text-emerald-600 dark:text-emerald-400">1 (5-4)</td>
                          <td className="px-2.5 py-1.5 font-bold text-blue-600 dark:text-blue-400">5 (13-8)</td>
                        </tr>
                        <tr>
                          <td className="px-2.5 py-1.5 font-bold">A4</td>
                          <td className="px-2.5 py-1.5">2</td>
                          <td className="px-2.5 py-1.5">3</td>
                          <td className="px-2.5 py-1.5">8</td>
                          <td className="px-2.5 py-1.5 font-bold text-indigo-600 dark:text-indigo-400">25</td>
                          <td className="px-2.5 py-1.5 font-bold text-emerald-600 dark:text-emerald-400">15 (23-8)</td>
                          <td className="px-2.5 py-1.5 font-bold text-blue-600 dark:text-blue-400">23 (25-2)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 p-2.5 font-mono text-[11px] space-y-0.5">
                    <div>&bull; First to complete: <strong>A0</strong> (at t = 9) | Last to complete: <strong>A1</strong> (at t = 34)</div>
                    <div>&bull; Avg. T.A.T = (6 + 33 + 13 + 5 + 23) / 5 = 80 / 5 = <strong>16.0</strong></div>
                    <div>&bull; Avg. W.T = (0 + 23 + 8 + 1 + 15) / 5 = 47 / 5 = <strong>9.4</strong></div>
                  </div>
                </div>

                {/* FCFS Worked Table */}
                <div className="space-y-2">
                  <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                    Case B: FCFS (Non-Preemptive First-Come, First-Served)
                  </div>
                  <div className="rounded-lg bg-slate-950 text-slate-200 p-3 font-mono text-[11px] border border-slate-700 space-y-1">
                    <div className="text-indigo-400 font-semibold">
                      Gantt Chart (strictly ordered by Arrival Time A.T):
                    </div>
                    <div>[1 &rarr; 11: A1] [11 &rarr; 19: A4] [19 &rarr; 25: A0] [25 &rarr; 30: A2] [30 &rarr; 34: A3]</div>
                    <div className="text-slate-400">
                      Arrival Order: A1 (t=1) &rarr; A4 (t=2) &rarr; A0 (t=3) &rarr; A2 (t=5) &rarr; A3 (t=8)
                    </div>
                  </div>
                  <div className={TABLE_WRAP}>
                    <table className="w-full text-left text-xs font-mono">
                      <thead className={TABLE_HEAD}>
                        <tr>
                          <th className="px-2.5 py-2">Process</th>
                          <th className="px-2.5 py-2">A.T</th>
                          <th className="px-2.5 py-2">Priority</th>
                          <th className="px-2.5 py-2">B.T</th>
                          <th className="px-2.5 py-2 text-indigo-600 dark:text-indigo-400">C.T</th>
                          <th className="px-2.5 py-2 text-emerald-600 dark:text-emerald-400">W.T</th>
                          <th className="px-2.5 py-2 text-blue-600 dark:text-blue-400">T.A.T</th>
                        </tr>
                      </thead>
                      <tbody className={TABLE_BODY}>
                        <tr>
                          <td className="px-2.5 py-1.5 font-bold">A0</td>
                          <td className="px-2.5 py-1.5">3</td>
                          <td className="px-2.5 py-1.5">3</td>
                          <td className="px-2.5 py-1.5">6</td>
                          <td className="px-2.5 py-1.5 font-bold text-indigo-600 dark:text-indigo-400">25</td>
                          <td className="px-2.5 py-1.5 font-bold text-emerald-600 dark:text-emerald-400">16 (22-6)</td>
                          <td className="px-2.5 py-1.5 font-bold text-blue-600 dark:text-blue-400">22 (25-3)</td>
                        </tr>
                        <tr>
                          <td className="px-2.5 py-1.5 font-bold">A1</td>
                          <td className="px-2.5 py-1.5">1</td>
                          <td className="px-2.5 py-1.5">4</td>
                          <td className="px-2.5 py-1.5">10</td>
                          <td className="px-2.5 py-1.5 font-bold text-indigo-600 dark:text-indigo-400">11</td>
                          <td className="px-2.5 py-1.5 font-bold text-emerald-600 dark:text-emerald-400">0 (10-10)</td>
                          <td className="px-2.5 py-1.5 font-bold text-blue-600 dark:text-blue-400">10 (11-1)</td>
                        </tr>
                        <tr>
                          <td className="px-2.5 py-1.5 font-bold">A2</td>
                          <td className="px-2.5 py-1.5">5</td>
                          <td className="px-2.5 py-1.5">2</td>
                          <td className="px-2.5 py-1.5">5</td>
                          <td className="px-2.5 py-1.5 font-bold text-indigo-600 dark:text-indigo-400">30</td>
                          <td className="px-2.5 py-1.5 font-bold text-emerald-600 dark:text-emerald-400">20 (25-5)</td>
                          <td className="px-2.5 py-1.5 font-bold text-blue-600 dark:text-blue-400">25 (30-5)</td>
                        </tr>
                        <tr>
                          <td className="px-2.5 py-1.5 font-bold">A3</td>
                          <td className="px-2.5 py-1.5">8</td>
                          <td className="px-2.5 py-1.5">1</td>
                          <td className="px-2.5 py-1.5">4</td>
                          <td className="px-2.5 py-1.5 font-bold text-indigo-600 dark:text-indigo-400">34</td>
                          <td className="px-2.5 py-1.5 font-bold text-emerald-600 dark:text-emerald-400">22 (26-4)</td>
                          <td className="px-2.5 py-1.5 font-bold text-blue-600 dark:text-blue-400">26 (34-8)</td>
                        </tr>
                        <tr>
                          <td className="px-2.5 py-1.5 font-bold">A4</td>
                          <td className="px-2.5 py-1.5">2</td>
                          <td className="px-2.5 py-1.5">3</td>
                          <td className="px-2.5 py-1.5">8</td>
                          <td className="px-2.5 py-1.5 font-bold text-indigo-600 dark:text-indigo-400">19</td>
                          <td className="px-2.5 py-1.5 font-bold text-emerald-600 dark:text-emerald-400">9 (17-8)</td>
                          <td className="px-2.5 py-1.5 font-bold text-blue-600 dark:text-blue-400">17 (19-2)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 p-2.5 font-mono text-[11px] space-y-0.5">
                    <div>&bull; First to complete: <strong>A1</strong> (at t = 11) | Last to complete: <strong>A3</strong> (at t = 34)</div>
                    <div>&bull; Avg. T.A.T = (22 + 10 + 25 + 26 + 17) / 5 = 100 / 5 = <strong>20.0</strong></div>
                    <div>&bull; Avg. W.T = (16 + 0 + 20 + 22 + 9) / 5 = 67 / 5 = <strong>13.4</strong></div>
                  </div>
                </div>
              </div>
            </div>
          </Accordion>

          <Accordion
            title="3. Critical Exam Rules: Priority Direction, Tie-Breaking & Quantum Selection"
            icon={<Lightbulb className="h-4 w-4 text-indigo-500" />}
            defaultOpen
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 p-3 space-y-1.5">
                <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                  1. Check Priority Direction First!
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Some problems specify <strong>&ldquo;lowest number = highest priority&rdquo;</strong> (e.g., Priority 1
                  runs before Priority 4), while others specify <strong>&ldquo;a larger priority number implies a higher
                  priority&rdquo;</strong> (e.g., Priority 4 runs before Priority 1). Always read the prompt before
                  drawing the Gantt chart!
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 p-3 space-y-1.5">
                <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                  2. Round Robin Time Quantum (q) Effect
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  &bull; <strong>If q is too short:</strong> Causes excessive context switches, high OS overhead, and
                  slower overall execution. Smaller time slices do <strong>not</strong> always improve average turnaround
                  time!
                  <br />
                  &bull; <strong>If q is too long:</strong> Round Robin degenerates into <strong>FCFS</strong> (First-Come,
                  First-Served).
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 p-3 space-y-1.5">
                <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                  3. Starvation &amp; Aging
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  In Priority Scheduling and SJF/SRTF, low-priority (or long-burst) processes can suffer from{' '}
                  <strong>Starvation</strong> (indefinite blocking). The solution is <strong>Aging</strong>: gradually
                  increasing the priority of a process that waits in the ready queue for a long time.
                </p>
              </div>
            </div>
          </Accordion>
        </div>
      )}

      {/* SubTab 2: Side-by-Side Comparison */}
      {activeSubTab === 'comparison' && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="card-title mb-0">Cross-Algorithm Comparison Matrix</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">Academic overview &amp; criteria comparison</span>
          </div>

          <div className={TABLE_WRAP}>
            <table className="w-full text-left text-xs">
              <thead className={`${TABLE_HEAD} uppercase`}>
                <tr>
                  <th className="px-3.5 py-2.5">Algorithm</th>
                  <th className="px-3.5 py-2.5">Preemptive</th>
                  <th className="px-3.5 py-2.5">Starvation Risk</th>
                  <th className="px-3.5 py-2.5">Convoy Effect</th>
                  <th className="px-3.5 py-2.5">Overhead</th>
                  <th className="px-3.5 py-2.5">Complexity</th>
                  <th className="px-3.5 py-2.5">Ideal Environment</th>
                </tr>
              </thead>
              <tbody className={TABLE_BODY}>
                {COMPARISON.map((row) => (
                  <tr key={row.algo} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-3.5 py-2 font-semibold text-slate-800 dark:text-slate-100">{row.algo}</td>
                    <td className="px-3.5 py-2">
                      <span
                        className={`px-2 py-0.5 rounded-full border text-[11px] font-medium ${
                          row.preemptive.includes('Yes')
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                            : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
                        }`}
                      >
                        {row.preemptive}
                      </span>
                    </td>
                    <td className="px-3.5 py-2">
                      <span
                        className={`px-2 py-0.5 rounded-full border text-[11px] font-medium ${
                          row.starvation.includes('Yes')
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        }`}
                      >
                        {row.starvation}
                      </span>
                    </td>
                    <td className="px-3.5 py-2">{row.convoy}</td>
                    <td className="px-3.5 py-2">{row.overhead}</td>
                    <td className="px-3.5 py-2">{row.complexity}</td>
                    <td className="px-3.5 py-2 text-slate-500 dark:text-slate-400">{row.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 3: MLQ & MLFQ Interactive Simulator */}
      {activeSubTab === 'mlfq' && (
        <div className="space-y-6">
          <div className="card space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700/70 pb-3">
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-base">
                  Multilevel Feedback Queue (MLFQ) Architecture
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Slide model: Q0 (RR q=4) &rarr; Q1 (RR q=8) &rarr; Q2 (FCFS). Demonstrates process demotion and aging.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-700 dark:text-slate-300">
                <label className="inline-flex items-center gap-1.5 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mlfqFeedback}
                    onChange={(e) => setMlfqFeedback(e.target.checked)}
                    className="rounded accent-indigo-500 h-4 w-4"
                  />
                  <span>Enable feedback demotion (MLFQ)</span>
                </label>

                {mlfqFeedback && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Aging threshold:</span>
                    <input
                      type="number"
                      min={0}
                      value={mlfqAging}
                      onChange={(e) => setMlfqAging(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="input w-16 text-center text-xs font-mono"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Visual Gantt Chart for MLFQ */}
            <div className="space-y-2">
              <span className="text-xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">
                Execution Schedule
              </span>
              <div className="flex h-14 w-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
                {mlfqResult.slices.map((slice, idx) => {
                  const duration = slice.end - slice.start;
                  const widthPct = (duration / mlfqResult.lastCT) * 100;
                  const queueColors = ['bg-indigo-500/80', 'bg-blue-500/70', 'bg-slate-500/70'];
                  const color = slice.level !== null ? queueColors[slice.level] || 'bg-slate-500/70' : 'bg-slate-400/40';

                  return (
                    <div
                      key={idx}
                      style={{ width: `${widthPct}%` }}
                      className={`relative flex flex-col items-center justify-center border-r border-slate-900/20 last:border-r-0 text-white font-mono text-xs font-semibold ${color}`}
                      title={`${slice.pid ?? 'IDLE'} [${slice.start} → ${slice.end}] (Level: Q${slice.level})`}
                    >
                      <span>{slice.pid ?? 'IDLE'}</span>
                      <span className="text-[9px] opacity-80">{slice.level !== null ? `Q${slice.level}` : ''}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Results Table for MLFQ */}
            <div className={TABLE_WRAP}>
              <table className="w-full text-left text-xs">
                <thead className={TABLE_HEAD}>
                  <tr>
                    <th className="px-3 py-2">Process</th>
                    <th className="px-3 py-2">Arrival (A.T)</th>
                    <th className="px-3 py-2">Burst (B.T)</th>
                    <th className="px-3 py-2">Completion (C.T)</th>
                    <th className="px-3 py-2">Turnaround (T.A.T)</th>
                    <th className="px-3 py-2">Waiting (W.T)</th>
                  </tr>
                </thead>
                <tbody className={`${TABLE_BODY} font-mono`}>
                  {mlfqResult.results.map((r) => (
                    <tr key={r.pid}>
                      <td className="px-3 py-1.5 font-semibold">{r.pid}</td>
                      <td className="px-3 py-1.5">{r.arrival}</td>
                      <td className="px-3 py-1.5">{r.burst}</td>
                      <td className="px-3 py-1.5 font-semibold text-indigo-600 dark:text-indigo-400">{r.completion}</td>
                      <td className="px-3 py-1.5">{r.turnaround}</td>
                      <td className="px-3 py-1.5">{r.waiting}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
