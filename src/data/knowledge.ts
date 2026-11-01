export interface AlgoInfo {
  id: string;
  name: string;
  short: string;
  type: 'Non-Preemptive' | 'Preemptive' | 'Both';
  concept: string;
  steps: string[];
  advantages: string[];
  disadvantages: string[];
  solution?: string;
  /** Pseudocode / execution recipe */
  pseudo: string;
}

export const KNOWLEDGE: AlgoInfo[] = [
  {
    id: 'FCFS',
    name: 'First Come, First Served',
    short: 'FCFS',
    type: 'Non-Preemptive',
    concept:
      'The process that requests the CPU first is allocated the CPU first. The ready queue is a FIFO queue: a newly arrived process is linked to the tail, and the CPU is given to the process at the head. Once a process gets the CPU it keeps it until it finishes its CPU burst.',
    steps: [
      'Sort processes by Arrival Time (ties → lower PID).',
      'Dispatch the process at the head of the ready queue.',
      'Let it run to completion; if the queue is empty, the CPU is IDLE until the next arrival.',
      'Repeat until all processes complete, then compute C.T, T.A.T = C.T − A.T, W.T = T.A.T − B.T.',
    ],
    advantages: ['Easy and straightforward to implement.', 'No starvation — every process eventually runs.'],
    disadvantages: [
      'Processes with a short burst time may wait a long time behind long processes.',
      'Convoy Effect: many short processes are stuck behind one long CPU-bound process, giving a high average waiting time.',
    ],
    solution: 'Shortest Job First (SJF).',
    pseudo: `queue ← FIFO()
t ← 0
while processes remain:
    add every process with A.T ≤ t to tail(queue)
    if queue empty: t ← next arrival   // IDLE
    else:
        p ← pop head(queue)
        run p for B.T(p);  t ← t + B.T(p)
        C.T(p) ← t`,
  },
  {
    id: 'SJF',
    name: 'Shortest Job First',
    short: 'SJF',
    type: 'Non-Preemptive',
    concept:
      'Associates with each process the length of its next CPU burst and gives the CPU to the ready process with the smallest burst. Non-preemptive: once dispatched, the process runs until it finishes, even if a shorter job arrives.',
    steps: [
      'At every decision point (t = 0 or when the CPU becomes free), look at all ready processes.',
      'Select the one with the smallest Burst Time (ties → earlier arrival → lower PID).',
      'Run it to completion, then repeat.',
    ],
    advantages: ['Eliminates the Convoy Effect.', 'Provably optimal: gives the minimum average waiting time for a given set of processes.'],
    disadvantages: ['The length of the next CPU request is difficult (practically impossible) to know in advance — it must be estimated/predicted.'],
    solution: 'Shortest Remaining Time First (SRTF) — the preemptive version.',
    pseudo: `while processes remain:
    ready ← { p : A.T(p) ≤ t and not done }
    if ready empty: t ← next arrival      // IDLE
    else:
        p ← argmin B.T(ready)
        run p to completion; t ← t + B.T(p); C.T(p) ← t`,
  },
  {
    id: 'SRTF',
    name: 'Shortest Remaining Time First',
    short: 'SRTF',
    type: 'Preemptive',
    concept:
      'Preemptive SJF. Whenever a new process arrives, its burst is compared with the REMAINING time of the running process. If the newcomer is strictly shorter, the running process is preempted and returns to the ready queue.',
    steps: [
      'At every arrival and every completion, re-evaluate the ready processes.',
      'If a ready process has remaining time strictly less than the running process, preempt.',
      'Always run the process with the smallest remaining time.',
    ],
    advantages: ['Very quick turnaround for short processes.', 'Smaller jobs never face the Convoy Effect.'],
    disadvantages: [
      'Long jobs may face starvation if short jobs keep arriving.',
      'A more important (higher-priority) job with a larger burst cannot preempt.',
      'Higher overhead because of frequent context switches.',
    ],
    solution: 'Priority Scheduling.',
    pseudo: `for each time unit t:
    add arrivals at t to ready
    if running and ∃ q ∈ ready : rem(q) < rem(running):
        preempt running → ready
    if CPU free: running ← argmin rem(ready)
    execute 1 unit; rem(running) −= 1
    if rem(running) = 0: C.T ← t+1`,
  },
  {
    id: 'PRIORITY',
    name: 'Priority Scheduling',
    short: 'Priority',
    type: 'Both',
    concept:
      'A priority number is associated with each process and the CPU is allocated to the process with the highest priority (in the course convention, the SMALLEST integer = HIGHEST priority). SJF is a special case where priority is the predicted next burst. It can be non-preemptive (wait for the CPU to be released) or preemptive (a higher-priority arrival preempts the running process).',
    steps: [
      'Decide the convention: lower number = higher priority (default) or the reverse.',
      'At each decision point choose the ready process with the highest priority (ties → arrival → PID).',
      'Preemptive variant: on every arrival, preempt if the newcomer has a strictly higher priority.',
    ],
    advantages: ['Lets important / interactive / system tasks run first.', 'Flexible: priorities can be internal (memory, time limits) or external (importance, payment).'],
    disadvantages: ['Indefinite blocking (starvation): low-priority processes may never execute.'],
    solution: 'Aging — gradually increase the priority of processes that wait in the system for a long time.',
    pseudo: `while processes remain:
    ready ← arrived and not done
    p ← process in ready with best priority
    if preemptive: run 1 unit, re-check on each arrival
    else:          run p to completion`,
  },
  {
    id: 'RR',
    name: 'Round Robin',
    short: 'RR',
    type: 'Preemptive',
    concept:
      'Designed for time-sharing systems. Each process gets a small unit of CPU time, the time quantum q. When q expires, the process is preempted and added to the TAIL of the ready queue. With n processes, no process waits more than (n − 1)·q time units.',
    steps: [
      'Ready queue is FIFO.',
      'Dispatch the head; run for min(q, remaining).',
      'If it finishes, record C.T. Otherwise first add any processes that arrived meanwhile, then put the preempted process at the tail.',
      'Repeat.',
    ],
    advantages: ['No starvation: every process gets the CPU regularly.', 'Fair and responsive — good response time for interactive users.'],
    disadvantages: [
      'Performance depends heavily on q.',
      'q too large → RR degenerates into FCFS (FIFO).',
      'q too small → too many context switches (overhead).',
      'Rule of thumb: about 80% of CPU bursts should be shorter than q.',
      'Usually higher average turnaround than SJF.',
    ],
    pseudo: `queue ← FIFO()
loop:
    add arrivals to tail(queue)
    p ← pop head(queue)
    run p for min(q, rem(p))
    add arrivals that occurred during the slice to tail(queue)
    if rem(p) > 0: push p to tail(queue)
    else: C.T(p) ← t`,
  },
  {
    id: 'MLQ',
    name: 'Multilevel Queue',
    short: 'MLQ',
    type: 'Both',
    concept:
      'The ready queue is partitioned into separate queues (e.g. foreground/interactive and background/batch). Each process is permanently assigned to one queue, and each queue has its own algorithm (e.g. foreground RR, background FCFS). Scheduling among the queues is usually fixed-priority preemptive, or time-slice (e.g. 80% foreground, 20% background).',
    steps: [
      'Assign each process to a queue based on its type (system, interactive, batch...).',
      'Always serve the highest-priority non-empty queue.',
      'Inside a queue, apply that queue’s own algorithm.',
      'A process arriving in a higher queue preempts a running process from a lower queue.',
    ],
    advantages: ['Structured: different process classes get the policy that suits them.', 'Low scheduling overhead (processes never move).'],
    disadvantages: ['Inflexible — processes cannot change queue.', 'Lower-priority queues may starve.'],
    solution: 'Multilevel Feedback Queue.',
    pseudo: `loop:
    k ← highest-priority non-empty queue
    schedule head of Qk with Qk's policy
    if a process arrives in Qj, j < k: preempt`,
  },
  {
    id: 'MLFQ',
    name: 'Multilevel Feedback Queue',
    short: 'MLFQ',
    type: 'Preemptive',
    concept:
      'Allows processes to move between queues. A process that uses too much CPU time is moved to a lower-priority queue; a process that waits too long in a lower queue can be moved up (aging). Defined by: number of queues, algorithm of each queue, when to upgrade, when to demote, and which queue a new process enters.',
    steps: [
      'Example: Q0 — RR q = 8 ms, Q1 — RR q = 16 ms, Q2 — FCFS.',
      'A new job enters Q0. If it does not finish within 8 ms, it is moved to the tail of Q1.',
      'In Q1 it receives 16 more ms; if still not finished, it is preempted and moved to Q2.',
      'Q2 runs FCFS only when Q0 and Q1 are empty. Arrivals in a higher queue preempt lower queues.',
      'Aging can promote processes that wait too long, preventing starvation.',
    ],
    advantages: ['Most general and flexible scheme.', 'Favors short / interactive (I/O-bound) jobs automatically.', 'Aging prevents starvation.'],
    disadvantages: ['Most complex scheduler to design and tune (many parameters).', 'Long CPU-bound jobs sink to the bottom and can starve without aging.'],
    pseudo: `new process → Q0
loop:
    k ← highest non-empty queue; p ← head(Qk)
    run p for up to quantum(Qk)
    if p used full quantum: move p to Q(k+1)
    if p waited > threshold in Qk: move p to Q(k−1)  // aging`,
  },
];

export const COMPARISON = [
  { algo: 'FCFS', preemptive: 'No', starvation: 'No', convoy: 'Yes', overhead: 'Very low', complexity: 'Very low', use: 'Batch systems, simple queues' },
  { algo: 'SJF', preemptive: 'No', starvation: 'Yes (long jobs)', convoy: 'No', overhead: 'Low', complexity: 'Medium (burst prediction)', use: 'Batch jobs with known run times' },
  { algo: 'SRTF', preemptive: 'Yes', starvation: 'Yes (long jobs)', convoy: 'No', overhead: 'High', complexity: 'Medium', use: 'Minimizing average waiting time' },
  { algo: 'Priority (NP)', preemptive: 'No', starvation: 'Yes (low priority)', convoy: 'Possible', overhead: 'Low', complexity: 'Low', use: 'Systems with task importance' },
  { algo: 'Priority (P)', preemptive: 'Yes', starvation: 'Yes (low priority)', convoy: 'No', overhead: 'Medium', complexity: 'Medium', use: 'Real-time / critical tasks' },
  { algo: 'Round Robin', preemptive: 'Yes', starvation: 'No', convoy: 'No', overhead: 'Depends on q', complexity: 'Low', use: 'Time-sharing, interactive systems' },
  { algo: 'MLQ', preemptive: 'Yes (between queues)', starvation: 'Yes (lower queues)', convoy: 'Per queue', overhead: 'Medium', complexity: 'High', use: 'Mixed foreground / background workloads' },
  { algo: 'MLFQ', preemptive: 'Yes', starvation: 'No (with aging)', convoy: 'No', overhead: 'Medium–High', complexity: 'Very high', use: 'General-purpose OS (UNIX, Windows)' },
];
