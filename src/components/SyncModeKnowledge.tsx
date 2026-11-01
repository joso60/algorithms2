import React, { useState } from 'react';
import {
  SYNC_ALGORITHMS_THEORY,
  SYNC_COMPARISON_MATRIX,
  type CriteriaStatus,
  type SyncAlgorithmTheory,
  type SyncTopicId,
} from '../data/syncData';
import {
  BookOpen,
  Check,
  X,
  GitCompare,
  Puzzle,
  ShieldCheck,
  AlertTriangle,
  MinusCircle,
  Sparkles,
  ArrowRight,
  Layers,
  Code2,
  Lightbulb,
  ChevronDown,
} from 'lucide-react';

type SubTab = 'mechanisms' | 'comparison' | 'classic' | 'exam_guide';

const ALL_THEORIES = Object.values(SYNC_ALGORITHMS_THEORY);
const MECHANISMS = ALL_THEORIES.filter((t) => t.category !== 'Classic Problem');
const CLASSIC_PROBLEMS = ALL_THEORIES.filter((t) => t.category === 'Classic Problem');

const STATUS_STYLE: Record<CriteriaStatus, string> = {
  SATISFIED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  VIOLATED: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  PARTIAL: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  NOT_APPLICABLE: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
};
const SLIDE_KEY_TAKEAWAYS: Record<
  SyncTopicId,
  {
    slideTag: string;
    quickTakeaway: string;
    howItWorks: string[];
    examTip: string;
  }
> = {
  race_condition: {
    slideTag: 'Slides 2.1–2.7 & 144–188 · Bounded Buffer & Race Condition',
    quickTakeaway:
      'A Race Condition occurs when two or more cooperating processes access and manipulate the same shared data (such as counter) concurrently, and the final outcome depends on the exact order of instruction interleaving.',
    howItWorks: [
      'Pointer-only circular buffer (using only in and out): Can fill at most BUFFER_SIZE - 1 (n - 1) slots because the full condition ((in + 1) % n == out) triggers while 1 slot is still empty.',
      'Adding a shared counter fixes the n - 1 limitation, but counter++ and counter-- compile into 3 non-atomic machine instructions each (Read -> Modify -> Write using Reg1 and Reg2).',
      'If a context switch interleaves Producer (Reg2 = counter; Reg2 = Reg2 + 1) and Consumer (Reg1 = counter; Reg1 = Reg1 - 1), one write overwrites the other (e.g., counter becomes 2 or 4 instead of 3).',
      'To prevent data corruption, updates to shared variables must be protected inside a Critical Section.',
    ],
    examTip:
      'Classic Exam Question: Why does the pointer-only bounded buffer hold at most n - 1 items? Because in == out means empty, so (in + 1) % n == out must stop one slot early to distinguish full from empty.',
  },
  critical_section_criteria: {
    slideTag: 'Slides 3–13 · The Critical-Section Problem & 3 Requirements',
    quickTakeaway:
      'A valid and complete solution to the Critical-Section Problem must simultaneously satisfy ALL three requirements: Mutual Exclusion, Progress, and Bounded Waiting.',
    howItWorks: [
      '1. Mutual Exclusion: If process Pi is executing in its critical section, then NO other process can be executing in its critical section at the same time.',
      '2. Progress: If no process is in its critical section and some processes wish to enter, only those processes NOT in their remainder section can participate in deciding who enters next, and this selection cannot be postponed indefinitely.',
      '3. Bounded Waiting: A strict upper bound must exist on the number of times other processes are allowed to enter their critical sections after a process has made a request to enter its critical section.',
    ],
    examTip:
      'Every synchronized process has 4 ordered sections: Entry Section (sets conditions & requests entry) -> Critical Section (modifies shared data) -> Exit Section (resets conditions) -> Remainder Section (independent code).',
  },
  strict_alternation: {
    slideTag: 'Slides 14–53 · Two-Process Software Solution Using turn',
    quickTakeaway:
      'Uses a single shared integer turn (initialized to 0 or 1). Process Pi enters only when turn == i and sets turn = j on exit. It satisfies Mutual Exclusion but VIOLATES Progress.',
    howItWorks: [
      'Entry Section: Process Pi spins in while (turn == j); until turn == i.',
      'Exit Section: Upon leaving the critical section, Pi hands the turn over to the other process: turn = j;',
      'Mutual Exclusion is satisfied because turn can only hold one value (0 or 1) at any instant.',
      'Progress is VIOLATED: If P0 exits CS (setting turn = 1), P1 enters and exits CS (setting turn = 0), and P0 stays in its Remainder Section while P1 wants to enter CS again, P1 is permanently blocked on while (turn == 0); even though CS is empty!',
    ],
    examTip:
      'Why does Strict Alternation fail Progress? Because it only tracks whose turn it is, without knowing whether a process actually WANTS to enter the Critical Section.',
  },
  petersons_algorithm: {
    slideTag: 'Slides 55–102 · Peterson’s Two-Process Software Solution',
    quickTakeaway:
      'Combines a boolean willingness array flag[2] (who wants to enter?) with a shared turn variable (tie-breaker under contention) to satisfy Mutual Exclusion, Progress, and Bounded Waiting for 2 processes.',
    howItWorks: [
      'Step 1 (Signal Intent): Process Pi sets flag[i] = true to declare that it is ready and willing to enter its critical section.',
      'Step 2 (Polite Tie-Breaker): Process Pi sets turn = j, graciously giving priority to the other process if both try to enter simultaneously.',
      'Step 3 (Wait Condition): Pi spins in while (flag[j] && turn == j); — it only waits if Pj ALSO wants to enter (flag[j] == T) AND it is Pj’s turn.',
      'Step 4 (Exit Section): Pi sets flag[i] = false on exit, immediately unblocking Pj if Pj was spinning.',
    ],
    examTip:
      'Slide 102 Drawbacks of Peterson’s Solution: (1) Restricted to 2 processes only, (2) Suffers from Busy Waiting (wastes CPU cycles), and (3) Not guaranteed to work on modern out-of-order hardware architectures.',
  },
  hardware_test_and_set: {
    slideTag: 'Slides 103–149 · Hardware Atomic test_and_set() Instruction',
    quickTakeaway:
      'Hardware provides an atomic (non-interruptible) test_and_set(&lock) instruction that reads the old value of target (returned as rv) and sets target = TRUE in a single indivisible machine cycle.',
    howItWorks: [
      'A global boolean variable lock is initialized to false (unlocked).',
      'Before entering CS, a process executes while (test_and_set(&lock));',
      'The first process to call test_and_set(&lock) when lock == F receives rv = F (breaking out of the while loop into CS) and atomically sets lock = T.',
      'Any subsequent process calling test_and_set(&lock) while lock == T receives rv = T and spins until the owner executes lock = false in its exit section.',
    ],
    examTip:
      'In the 2-process trace (Slides 111–148), both Mutual Exclusion and Progress hold. However, for N > 2 processes, basic test_and_set(&lock) does NOT guarantee Bounded Waiting because any spinning process could win the lock next.',
  },
  hardware_swap: {
    slideTag: 'Slides 150–187 · Hardware Atomic Swap(&lock, &key) Instruction',
    quickTakeaway:
      'Atomically exchanges the values of a global boolean lock (initialized to FALSE) and a local boolean key (set to TRUE before the loop) in one uninterruptible hardware operation.',
    howItWorks: [
      'Global lock starts as FALSE (available).',
      'In the entry section, Process Pi sets its local variable key = TRUE.',
      'Pi spins in while (key == TRUE) Swap(&lock, &key);',
      'The first process to execute Swap exchanges its key (T) with lock (F). Now lock == T (locked) and local key == F, so the process exits the while loop and enters CS!',
    ],
    examTip:
      'While a process is in CS (lock == T), any other process executing Swap(&lock, &key) simply swaps T with T, keeping both lock == T and its local key == T (continues spinning).',
  },
  hardware_compare_and_swap: {
    slideTag: 'Slides 232–234 · Hardware Atomic compare_and_swap (CAS)',
    quickTakeaway:
      'Compares the value at *value with expected; if and only if (*value == expected), it updates *value = new_value. In all cases, it returns the original value temp.',
    howItWorks: [
      'Shared lock is initialized to 0 (unlocked).',
      'Entry section executes while (compare_and_swap(&lock, 0, 1) != 0); /* do nothing */',
      'First process sees lock == 0 (matches expected == 0): CAS sets lock = 1 and returns old value 0. Since 0 != 0 is false, the process enters CS.',
      'Other processes see lock == 1 (does not match 0): CAS leaves lock = 1 and returns 1, so they spin until lock = 0; is executed on exit.',
    ],
    examTip:
      'Slide 234 Answer: Basic compare_and_swap satisfies Mutual Exclusion and Progress, but violates Bounded Waiting for N processes unless paired with a waiting[n] array.',
  },
  hardware_n_process_bounded: {
    slideTag: 'Slides 188–231 · Bounded-Waiting Mutual Exclusion with test_and_set (n Processes)',
    quickTakeaway:
      'Augments test_and_set(&lock) with a shared boolean waiting[n] array and a circular scanner j = (i + 1) % n in the exit section so every waiting process enters within at most n - 1 turns.',
    howItWorks: [
      'Entry Section: Process Pi sets waiting[i] = true and key = true, then spins in while (waiting[i] && key) key = test_and_set(&lock);',
      'A process breaks out of the loop and enters CS if EITHER it acquires the lock first (key becomes F) OR the exiting process hands the turn directly to it (setting waiting[i] = F).',
      'Exit Section Circular Scan: When Pi leaves CS, it scans j = (i + 1) % n, (j + 1) % n, ... looking for the first process with waiting[j] == true.',
      'Direct Handoff: If no process is waiting (j == i), Pi releases lock = false. Otherwise, Pi keeps lock = true and sets waiting[j] = false, passing CS entry directly to Pj!',
    ],
    examTip:
      'Why does this satisfy Bounded Waiting? Because the exit section scans processes in circular order (0 -> 1 -> ... -> n-1 -> 0), guaranteeing any waiting process waits at most n - 1 turns.',
  },
  mutex_locks: {
    slideTag: 'Semaphore Slides 2–9 · OS Mutex Locks (acquire & release Spinlocks)',
    quickTakeaway:
      'The simplest OS software synchronization tool: a Mutex Lock protects critical sections using atomic acquire() and release() calls backed by a boolean available variable.',
    howItWorks: [
      'A boolean variable available indicates whether the lock is free (initially true).',
      'acquire() spins in while (!available); /* busy wait */ and atomically sets available = false.',
      'release() resets available = true so another waiting process can acquire the lock.',
      'Calls to acquire() and release() must be executed atomically (implemented via hardware atomic instructions).',
    ],
    examTip:
      'Slide 5–6 Note: A Mutex Lock that uses busy waiting is called a Spinlock. Spinlocks waste CPU cycles on single-core CPUs, but on multiprocessor systems they avoid context-switch overhead when locks are held briefly.',
  },
  semaphores_concept: {
    slideTag: 'Semaphore Slides 10–33 · Semaphores (wait / signal, Binary vs Counting & Deadlock)',
    quickTakeaway:
      'A Semaphore S is an integer variable accessed only through two indivisible (atomic) operations: wait(S) (originally P, decrements S) and signal(S) (originally V, increments S).',
    howItWorks: [
      'Counting Semaphore: Integer value can range over an unrestricted domain (used to control access to a resource with multiple instances).',
      'Binary Semaphore: Integer value ranges only between 0 and 1 (behaves identically to a Mutex Lock).',
      'Usage 1 — Mutual Exclusion: Initialize Semaphore mutex = 1; call wait(mutex) before CS and signal(mutex) after CS.',
      'Usage 2 — Process Synchronization (Ordering): To force statement S1 in P1 to execute BEFORE S2 in P2, initialize synch = 0. P1 runs: S1; signal(synch); and P2 runs: wait(synch); S2;',
    ],
    examTip:
      'Slide 31–33 Pitfalls: Misusing two semaphores S and Q in reversed order (P0 calls wait(S) then wait(Q); P1 calls wait(Q) then wait(S)) causes a permanent Deadlock and Indefinite Blocking (Starvation)!',
  },
  semaphores_implementation: {
    slideTag: 'Semaphore Slides 24–30 · Semaphore Implementation with no Busy Waiting',
    quickTakeaway:
      'Eliminates busy waiting by associating each semaphore with a waiting queue (S->list) of PCB pointers and using two OS kernel operations: block() and wakeup(P).',
    howItWorks: [
      'wait(semaphore *S): First decrements S->value--; then if (S->value < 0), adds this process to S->list and calls block() to suspend the process.',
      'signal(semaphore *S): First increments S->value++; then if (S->value <= 0), removes a process P from S->list and calls wakeup(P) to move it to the Ready Queue.',
      'Meaning of Negative Semaphore Values: If S->value is negative (e.g., -2), its magnitude (2) is the exact number of processes currently blocked in S->list!',
      'Using a FIFO queue for S->list guarantees Bounded Waiting (processes wake up in the exact order they blocked).',
    ],
    examTip:
      'Crucial Boundary Conditions on Exams: wait(S) blocks when (S->value < 0) (strictly negative), whereas signal(S) wakes a process up when (S->value <= 0) (less than or equal to zero after incrementing)!',
  },
  producer_consumer_bounded: {
    slideTag: 'Classic Problems Slides 3–59 · Bounded-Buffer Problem with 3 Semaphores',
    quickTakeaway:
      'Coordinates Producer and Consumer processes sharing a buffer of size n using three semaphores: mutex = 1 (mutual exclusion), empty = n (empty slots), and full = 0 (filled slots).',
    howItWorks: [
      'Producer Protocol: Calls wait(empty) (decrements empty slot count) -> wait(mutex) (locks buffer) -> adds item -> signal(mutex) -> signal(full) (increments filled item count).',
      'Consumer Protocol: Calls wait(full) (waits for available item) -> wait(mutex) (locks buffer) -> removes item -> signal(mutex) -> signal(empty) (increments empty slot count).',
      'If Producer calls wait(mutex) while Consumer is already inside CS (mutex == 0), mutex.value becomes -1 and Producer is placed in mutex.queue.',
      'When Consumer calls signal(mutex), mutex.value increments from -1 to 0 (<= 0), waking Producer from mutex.queue!',
    ],
    examTip:
      'Never reverse wait(empty)/wait(full) and wait(mutex)! If Producer calls wait(mutex) first when the buffer is full (empty == 0), Producer blocks on wait(empty) while holding mutex, causing a total Deadlock with Consumer.',
  },
  readers_writers: {
    slideTag: 'Classic Problems Slides 60–103 · First Readers-Writers Problem',
    quickTakeaway:
      'Allows multiple Readers to read shared data simultaneously, while guaranteeing that any Writer gets 100% exclusive access to the shared data.',
    howItWorks: [
      'Shared Data Structures: Semaphore rw_mutex = 1 (shared by readers & writers), Semaphore mutex = 1 (protects read_count updates), and int read_count = 0 (number of active readers).',
      'Writer Process: Simply executes wait(rw_mutex) -> performs write -> signal(rw_mutex).',
      'Reader Entry: Locks wait(mutex), increments read_count++, and ONLY IF (read_count == 1) (the very first reader) calls wait(rw_mutex) to lock out writers! Then calls signal(mutex) and reads concurrently.',
      'Reader Exit: Locks wait(mutex), decrements read_count--, and ONLY IF (read_count == 0) (the very last reader leaving) calls signal(rw_mutex) to wake up any waiting writer!',
    ],
    examTip:
      'In the trace (Slides 66–101), when R1 is reading (read_count == 1, rw_mutex == 0) and W1 calls wait(rw_mutex), rw_mutex becomes -1 (W1 blocks). When R2 arrives next, read_count becomes 2 (!= 1), so R2 skips wait(rw_mutex) and reads simultaneously with R1!',
  },
  dining_philosophers: {
    slideTag: 'Classic Problems Slides 104–181 · Dining-Philosophers Problem & 3 Deadlock Solutions',
    quickTakeaway:
      'Five philosophers sit around a circular table with 5 chopsticks (chopstick[0..4] = 1). A philosopher needs BOTH left (chopstick[i]) and right (chopstick[(i+1)%5]) chopsticks to eat.',
    howItWorks: [
      'Basic Protocol: Philosopher Pi executes wait(chopstick[i]) (left) followed by wait(chopstick[(i + 1) % 5]) (right), eats, and signals both chopsticks.',
      'Non-Neighbor Concurrency (Slides 109–158): Non-adjacent philosophers (such as P1 & P3, or P1 & P4) can eat simultaneously while neighbors trying to share a chopstick block in that chopstick’s queue (value = -1).',
      'Deadlock Scenario (Slides 164–173): If all 5 philosophers become hungry simultaneously and each picks up their left chopstick, all chopstick[0..4] become 0. When each then requests their right chopstick, all chopstick[0..4] become -1 and all 5 philosophers deadlock forever!',
      'Slide Solutions (Slides 175–181): (1) Allow at most 4 philosophers at the table, (2) Pick up both chopsticks inside a mutex critical section, or (3) Asymmetric odd/even pickup order.',
    ],
    examTip:
      'Memorize all 3 Deadlock Prevention Solutions from Slides 175–181 (see the dedicated visual cards below) — this is one of the most frequently tested questions in CPCS 361!',
  },
};


const StatusIcon: React.FC<{ status: CriteriaStatus }> = ({ status }) => {
  if (status === 'SATISFIED') return <ShieldCheck className="h-4 w-4" />;
  if (status === 'VIOLATED') return <X className="h-4 w-4" />;
  if (status === 'PARTIAL') return <AlertTriangle className="h-4 w-4" />;
  return <MinusCircle className="h-4 w-4" />;
};

const BoolCell: React.FC<{ value: boolean }> = ({ value }) => (
  <span
    className={`inline-flex items-center justify-center h-5 w-5 rounded-full border ${
      value
        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
    }`}
  >
    {value ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
  </span>
);

const CODE_BLOCK =
  'rounded-lg bg-slate-950 text-slate-200 p-3 font-mono text-[12px] leading-relaxed border border-slate-700 overflow-x-auto';

const TABLE_WRAP =
  'overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700';
const TABLE_HEAD =
  'bg-slate-100 dark:bg-slate-800/40 font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700';
const TABLE_BODY = 'divide-y divide-slate-200 dark:divide-slate-700/70';

/** Collapsible accordion section used to keep theory pages short and scannable. */
const Accordion: React.FC<{
  title: string;
  icon?: React.ReactNode;
  badge?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ title, icon, badge, defaultOpen = false, children }) => {
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
          {badge && (
            <span className="ml-1 rounded-full border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {badge}
            </span>
          )}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-3">{children}</div>
      )}
    </div>
  );
};

/** Visual diagram of the 4 sections of a synchronized process (Slides 3-7) */
const ProcessStructureVisual: React.FC = () => (
  <div className="space-y-3">
    <p className="text-xs font-mono text-slate-500 dark:text-slate-400">do &#123; ... &#125; while (true);</p>
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
      {[
        ['1. Entry Section', 'Request Permission', 'Sets synchronization conditions and requests permission to enter the Critical Section.'],
        ['2. Critical Section', 'Access Shared Data', 'Modifies common variables, updates tables, or writes files. Strictly one process at a time.'],
        ['3. Exit Section', 'Release Permission', 'Resets conditions and releases locks/semaphores so waiting processes can enter.'],
        ['4. Remainder Section', 'Independent Code', 'All other non-shared, independent computation happens in this section.'],
      ].map(([t, s, d]) => (
        <div
          key={t}
          className="rounded-lg border border-slate-200 dark:border-slate-700/70 bg-slate-50 dark:bg-slate-800/30 p-3 space-y-1"
        >
          <div className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{t}</div>
          <div className="font-semibold text-slate-800 dark:text-slate-100">{s}</div>
          <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">{d}</p>
        </div>
      ))}
    </div>
  </div>
);

/** Semaphore Usage (Mutual Exclusion vs Process Ordering vs Deadlock Trap, Slides 20-33) */
const SemaphoreUsageShowcase: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
    <div className="rounded-lg border border-slate-200 dark:border-slate-700/70 bg-slate-50 dark:bg-slate-800/30 p-3 space-y-2">
      <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">1. Mutual Exclusion (Slide 20)</div>
      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
        Initialize <code className="font-mono font-semibold">Semaphore mutex = 1;</code> so only one process can enter
        the critical section at a time:
      </p>
      <pre className={CODE_BLOCK}>
{`Semaphore mutex = 1;

do {
   wait(mutex);
      // Critical Section
   signal(mutex);
      // Remainder Section
} while (TRUE);`}
      </pre>
    </div>

    <div className="rounded-lg border border-slate-200 dark:border-slate-700/70 bg-slate-50 dark:bg-slate-800/30 p-3 space-y-2">
      <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">
        2. Process Ordering S1 &rarr; S2 (Slides 21–22)
      </div>
      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
        Force <code className="font-mono font-semibold">P1</code> to execute{' '}
        <code className="font-mono font-semibold">S1</code> before <code className="font-mono font-semibold">P2</code>{' '}
        executes <code className="font-mono font-semibold">S2</code> using{' '}
        <code className="font-mono font-semibold">synch = 0</code>:
      </p>
      <pre className={CODE_BLOCK}>
{`Semaphore synch = 0;

// Process P1:
S1;
signal(synch);

// Process P2:
wait(synch);
S2;`}
      </pre>
    </div>

    <div className="rounded-lg border border-slate-200 dark:border-slate-700/70 bg-slate-50 dark:bg-slate-800/30 p-3 space-y-2">
      <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">3. Deadlock Trap (Slide 31)</div>
      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
        With <code className="font-mono font-semibold">S = 1, Q = 1</code>, reversing the{' '}
        <code className="font-mono font-semibold">wait()</code> order causes permanent deadlock:
      </p>
      <pre className={CODE_BLOCK}>
{`P0                P1
-----------       -----------
wait(S);          wait(Q);
wait(Q);          wait(S);
   ...               ...
signal(S);        signal(Q);
signal(Q);        signal(S);`}
      </pre>
    </div>
  </div>
);

/** Bounded Buffer -> Unbounded Buffer Line-by-Line Code Transformation */
const BoundedToUnboundedShowcase: React.FC = () => (
  <div className="space-y-4 text-xs">
    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
      In a <strong>Bounded Buffer</strong> of fixed size <code className="font-mono">BUFFER_SIZE</code>, the array wraps
      around circularly using modulo arithmetic (<code className="font-mono">% BUFFER_SIZE</code>), and the Producer
      must wait when the buffer is full. In an <strong>Unbounded Buffer</strong> (infinite capacity), two fundamental
      changes occur:
    </p>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-1.5">
        <div className="font-semibold text-sm text-emerald-700 dark:text-emerald-400">
          1. Producer Modification (Never Full!)
        </div>
        <ul className="space-y-1 text-slate-700 dark:text-slate-300 leading-relaxed list-disc pl-4">
          <li>
            <strong>Remove the full-check loop:</strong> Since an unbounded buffer has infinite space, it can{' '}
            <strong>never become full</strong>. Delete{' '}
            <code className="font-mono">while (((in + 1) % BUFFER_SIZE) == out) ;</code>.
          </li>
          <li>
            <strong>Remove modulo wrap-around:</strong> Replace{' '}
            <code className="font-mono">in = (in + 1) % BUFFER_SIZE;</code> with linear increment{' '}
            <code className="font-mono">in = in + 1;</code> (or <code className="font-mono">in++;</code>).
          </li>
        </ul>
      </div>

      <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3 space-y-1.5">
        <div className="font-semibold text-sm text-indigo-700 dark:text-indigo-400">
          2. Consumer Modification (Can Still Be Empty!)
        </div>
        <ul className="space-y-1 text-slate-700 dark:text-slate-300 leading-relaxed list-disc pl-4">
          <li>
            <strong>Keep the empty-check loop:</strong> Even an unbounded buffer is empty when the Producer has not
            produced items yet (<code className="font-mono">in == out</code>). Therefore,{' '}
            <code className="font-mono">while (in == out) ; /* do nothing */</code> <strong>must remain</strong>.
          </li>
          <li>
            <strong>Remove modulo wrap-around:</strong> Replace{' '}
            <code className="font-mono">out = (out + 1) % BUFFER_SIZE;</code> with linear increment{' '}
            <code className="font-mono">out = out + 1;</code> (or <code className="font-mono">out++;</code>).
          </li>
        </ul>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-800 dark:text-slate-100">
            A. Consumer Process (Bounded &rarr; Unbounded)
          </span>
          <span className="rounded-full border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[10px] font-mono text-slate-500">
            Keep while (in == out)
          </span>
        </div>
        <pre className={CODE_BLOCK}>
{`// --- BOUNDED BUFFER (Original) ---
item next_consumed;
while (true) {
    while (in == out)
        ; /* do nothing */
    next_consumed = buffer[out];
    out = (out + 1) % BUFFER_SIZE;
    /* consume the item in next_consumed */
}

// --- UN-BOUNDED BUFFER (Modified Solution) ---
item next_consumed;
while (true) {
    while (in == out)
        ; /* do nothing (STILL NEEDED: buffer can be empty!) */
    next_consumed = buffer[out];
    out = out + 1;   /* MODIFIED: removed % BUFFER_SIZE */
    /* consume the item in next_consumed */
}`}
        </pre>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-800 dark:text-slate-100">
            B. Producer Process (Bounded &rarr; Unbounded)
          </span>
          <span className="rounded-full border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[10px] font-mono text-slate-500">
            Remove while-full loop
          </span>
        </div>
        <pre className={CODE_BLOCK}>
{`// --- BOUNDED BUFFER (Original) ---
item next_produced;
while (true) {
    /* produce an item in next_produced */
    while (((in + 1) % BUFFER_SIZE) == out)
        ; /* do nothing */
    buffer[in] = next_produced;
    in = (in + 1) % BUFFER_SIZE;
}

// --- UN-BOUNDED BUFFER (Modified Solution) ---
item next_produced;
while (true) {
    /* produce an item in next_produced */
    /* REMOVED while (((in + 1) % BUFFER_SIZE) == out)
       because an unbounded buffer is NEVER full! */
    buffer[in] = next_produced;
    in = in + 1;     /* MODIFIED: removed % BUFFER_SIZE */
}`}
        </pre>
      </div>
    </div>
  </div>
);

/** 4-Case Sequential Proof Method for Strict Alternation & Flawed Turn Variants */
const StrictAlternationExamProofShowcase: React.FC = () => (
  <div className="space-y-4 text-xs">
    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
      On exams, you may be given either the standard Strict Alternation code or a modified variant where the{' '}
      <code className="font-mono">while</code> condition or the exit assignment <code className="font-mono">turn = ...</code>{' '}
      is flipped. To justify whether <strong>Mutual Exclusion</strong>, <strong>Progress</strong>, and{' '}
      <strong>Bounded Waiting</strong> hold for sequential execution (<code className="font-mono">i = 0, j = 1</code>),
      trace the <strong>4 execution cases</strong> (<code className="font-mono">P0P1 &amp; turn=0</code>,{' '}
      <code className="font-mono">P1P0 &amp; turn=0</code>, <code className="font-mono">P0P1 &amp; turn=1</code>,{' '}
      <code className="font-mono">P1P0 &amp; turn=1</code>):
    </p>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 p-3 space-y-2">
        <div className="font-semibold text-slate-800 dark:text-slate-100">
          Variant 1: Standard Strict Alternation
        </div>
        <pre className={CODE_BLOCK}>
{`// Pi (P0, i=0)          // Pj (P1, j=1)
while (turn == j);       while (turn == i);
  <critical section>       <critical section>
turn = j;                turn = i;`}
        </pre>
        <ul className="space-y-1 text-slate-600 dark:text-slate-300">
          <li>
            <strong className="text-emerald-600 dark:text-emerald-400">Mutual Exclusion: SATISFIED</strong> (
            <code className="font-mono">turn</code> cannot be both 0 and 1).
          </li>
          <li>
            <strong className="text-rose-600 dark:text-rose-400">Progress: VIOLATED</strong> (if <code className="font-mono">turn == 0</code> and P0 stays in remainder section, P1 spins forever on <code className="font-mono">while (turn == 0)</code> even though CS is empty).
          </li>
          <li>
            <strong className="text-emerald-600 dark:text-emerald-400">Bounded Waiting: SATISFIED</strong> (when P0 exits CS it sets <code className="font-mono">turn = 1</code>, so P1 waits at most 1 turn).
          </li>
        </ul>
      </div>

      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 p-3 space-y-2">
        <div className="font-semibold text-slate-800 dark:text-slate-100">
          Variant 2: Self-Turn Exit Bug (turn = i on exit)
        </div>
        <pre className={CODE_BLOCK}>
{`// Pi (P0, i=0)          // Pj (P1, j=1)
while (turn == j);       while (turn == i);
  <critical section>       <critical section>
turn = i; /* BUG! */     turn = j; /* BUG! */`}
        </pre>
        <ul className="space-y-1 text-slate-600 dark:text-slate-300">
          <li>
            <strong className="text-emerald-600 dark:text-emerald-400">Mutual Exclusion: SATISFIED</strong> (at <code className="font-mono">turn = 0</code>, P0 enters CS and P1 is stuck in <code className="font-mono">while (turn == 0)</code>).
          </li>
          <li>
            <strong className="text-rose-600 dark:text-rose-400">Progress: VIOLATED</strong> (after using CS, P0 sets <code className="font-mono">turn = 0</code> instead of <code className="font-mono">1</code>, so P1 remains stuck in its while loop!).
          </li>
          <li>
            <strong className="text-rose-600 dark:text-rose-400">Bounded Waiting: VIOLATED</strong> (because <code className="font-mono">turn</code> stays <code className="font-mono">0</code>, P0 can re-enter CS again and again before P1 ever enters!).
          </li>
        </ul>
      </div>

      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 p-3 space-y-2">
        <div className="font-semibold text-slate-800 dark:text-slate-100">
          Variant 3: Inverted while(turn == i) Condition
        </div>
        <pre className={CODE_BLOCK}>
{`// Pi (P0, i=0)          // Pj (P1, j=1)
while (turn == i);       while (turn == j);
  <critical section>       <critical section>
turn = j;                turn = i;`}
        </pre>
        <ul className="space-y-1 text-slate-600 dark:text-slate-300">
          <li>
            <strong className="text-emerald-600 dark:text-emerald-400">Mutual Exclusion: SATISFIED</strong> (when <code className="font-mono">turn = 1</code>, P0 sees <code className="font-mono">1 == 0</code> False and enters CS; P1 sees <code className="font-mono">1 == 1</code> True and spins).
          </li>
          <li>
            <strong className="text-rose-600 dark:text-rose-400">Progress: VIOLATED</strong> (on exit, P0 sets <code className="font-mono">turn = j = 1</code>, which is the exact value that keeps P1 stuck spinning in <code className="font-mono">while (turn == j)</code>!).
          </li>
          <li>
            <strong className="text-rose-600 dark:text-rose-400">Bounded Waiting: VIOLATED</strong> (since <code className="font-mono">turn</code> remains <code className="font-mono">1</code>, P0 can use CS repeatedly while P1 remains permanently stuck!).
          </li>
        </ul>
      </div>
    </div>

    {/* 4-Case Proof Table */}
    <div className={TABLE_WRAP}>
      <table className="w-full text-left text-xs">
        <thead className={TABLE_HEAD}>
          <tr>
            <th className="px-3 py-2">Criterion</th>
            <th className="px-3 py-2">Case: P0 &rarr; P1 &amp; turn = 0 (or turn = 1)</th>
            <th className="px-3 py-2">Case: P1 &rarr; P0 &amp; turn = 0 (or turn = 1)</th>
            <th className="px-3 py-2">Verdict (Variants 2 &amp; 3)</th>
          </tr>
        </thead>
        <tbody className={TABLE_BODY}>
          <tr>
            <td className="px-3 py-2 font-semibold text-slate-800 dark:text-slate-100">1. Mutual Exclusion</td>
            <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
              For the favored process, the <code className="font-mono">while</code> condition is <strong>false</strong>{' '}
              (enters <code className="font-mono">&lt;c.s&gt;</code>). For the other process, the{' '}
              <code className="font-mono">while</code> condition is <strong>true</strong> (stuck in while loop).
            </td>
            <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
              Even if the other process runs first, its <code className="font-mono">while</code> condition is{' '}
              <strong>true</strong> (stuck in while loop), and only the favored process enters{' '}
              <code className="font-mono">&lt;c.s&gt;</code>.
            </td>
            <td className="px-3 py-2 font-semibold text-emerald-600 dark:text-emerald-400">
              Mutual Exclusion Satisfied
            </td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-semibold text-slate-800 dark:text-slate-100">2. Progress</td>
            <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
              After using <code className="font-mono">&lt;c.s&gt;</code>, the exiting process sets{' '}
              <code className="font-mono">turn</code> back to the value that keeps the other process’s{' '}
              <code className="font-mono">while</code> condition <strong>true</strong>.
            </td>
            <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
              The waiting process remains stuck in its <code className="font-mono">while</code> loop even though{' '}
              <code className="font-mono">&lt;c.s&gt;</code> is now completely empty.
            </td>
            <td className="px-3 py-2 font-semibold text-rose-600 dark:text-rose-400">Progress Not Satisfied</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-semibold text-slate-800 dark:text-slate-100">3. Bounded Waiting</td>
            <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
              While the waiting process remains stuck in the <code className="font-mono">while</code> loop, the first
              process’s <code className="font-mono">while</code> condition is still <strong>false</strong>.
            </td>
            <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
              The first process can loop around and use <code className="font-mono">&lt;c.s&gt;</code> again and again
              before the waiting process ever enters once.
            </td>
            <td className="px-3 py-2 font-semibold text-rose-600 dark:text-rose-400">Bounded Wait Not Satisfied</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

/** Semaphore Ordering & Reversed wait() Deadlock Breakdown */
const SemaphoreOrderingDeadlockShowcase: React.FC = () => (
  <div className="space-y-4 text-xs">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-2">
        <div className="font-semibold text-sm text-emerald-700 dark:text-emerald-400">
          Correct Order: Check Resource Count BEFORE Locking Mutex
        </div>
        <pre className={CODE_BLOCK}>
{`// Producer                  // Consumer
wait(empty);                 wait(full);
wait(mutex);                 wait(mutex);
  /* add item to buffer */     /* remove item from buffer */
signal(mutex);               signal(mutex);
signal(full);                signal(empty);`}
        </pre>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          <strong>Why this works:</strong> If the buffer is full (<code className="font-mono">empty == 0</code>),
          Producer blocks on <code className="font-mono">wait(empty)</code> <strong>before</strong> acquiring{' '}
          <code className="font-mono">mutex</code>. This leaves <code className="font-mono">mutex == 1</code> free so
          Consumer can enter CS, remove an item, and call <code className="font-mono">signal(empty)</code> to wake
          Producer.
        </p>
      </div>

      <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 space-y-2">
        <div className="font-semibold text-sm text-rose-700 dark:text-rose-400">
          Reversed Order Trap: Calling wait(mutex) Before wait(empty)
        </div>
        <pre className={CODE_BLOCK}>
{`// Producer (REVERSED ORDER — CAUSES DEADLOCK!)
wait(mutex);   // 1. Locks mutex first (mutex: 1 -> 0)
wait(empty);   // 2. If buffer is full (empty == 0), Producer BLOCKS
               //    here while STILL holding mutex == 0!
  /* add item to buffer */
signal(mutex);
signal(full);`}
        </pre>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          <strong>Why it fails:</strong> When the buffer is full (<code className="font-mono">empty = 0</code>),
          Producer locks <code className="font-mono">mutex</code> (<code className="font-mono">0</code>) and then blocks
          on <code className="font-mono">wait(empty)</code> (<code className="font-mono">-1</code>). When Consumer tries
          to consume an item, it passes <code className="font-mono">wait(full)</code> but blocks forever on{' '}
          <code className="font-mono">wait(mutex)</code> (<code className="font-mono">-1</code>).{' '}
          <strong>Permanent Deadlock!</strong>
        </p>
      </div>
    </div>

    {/* Quick Reference: Deduce System State from Semaphore Values */}
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 p-3 space-y-2">
      <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">
        Exam Deduction Guide: Reading Semaphore Values (buffer size n = 5)
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 p-2.5 space-y-1">
          <div className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
            Role of Each Semaphore
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            &bull; <code className="font-mono">mutex</code> (init <code className="font-mono">1</code>): Mutual exclusion
            on buffer access.
            <br />
            &bull; <code className="font-mono">empty</code> (init <code className="font-mono">n</code>): Counts empty
            slots; blocks Producer when <code className="font-mono">0</code>.
            <br />
            &bull; <code className="font-mono">full</code> (init <code className="font-mono">0</code>): Counts filled
            slots; blocks Consumer when <code className="font-mono">0</code>.
          </p>
        </div>
        <div className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 p-2.5 space-y-1">
          <div className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
            Example: full = 5, empty = 0, mutex = 1
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            All 5 slots are full (<code className="font-mono">empty = 0</code>), so <strong>Producer is blocked</strong>{' '}
            if it attempts <code className="font-mono">wait(empty)</code>. Because <code className="font-mono">full = 5</code>{' '}
            and <code className="font-mono">mutex = 1</code>, <strong>only the Consumer</strong> can enter the Critical
            Section next!
          </p>
        </div>
        <div className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 p-2.5 space-y-1">
          <div className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
            Deadlock vs. Starvation
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            &bull; <strong>Deadlock:</strong> Every process in a set holds a resource and waits forever for a resource
            held by another process in the same set.
            <br />
            &bull; <strong>Starvation:</strong> A process waits an indefinite amount of time while other processes
            continue making progress.
          </p>
        </div>
      </div>
    </div>
  </div>
);

/** Common Hardware, Flag, and Semaphore Output Tracing Traps */
const HardwareAndFlagTrapsShowcase: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 p-3 space-y-2">
      <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">
        Trap 1: Spin-Before-Set Flag Array Bug
      </div>
      <pre className={CODE_BLOCK}>
{`shared boolean flag[2] = {false, false};
proc(int i) {
  while (true) {
    while (flag[(i+1) % 2] == true);
    flag[i] = true;
    /* critical section */
    flag[i] = false;
  }
}`}
      </pre>
      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
        <strong className="text-rose-600 dark:text-rose-400">Does NOT solve CS problem (False)!</strong> Because{' '}
        <code className="font-mono">while (flag[(i+1)%2] == true);</code> is checked <strong>before</strong> setting{' '}
        <code className="font-mono">flag[i] = true;</code>, both P0 and P1 can read <code className="font-mono">false</code>{' '}
        simultaneously, pass the loop, set their flags to <code className="font-mono">true</code>, and enter the
        Critical Section together (<strong>Mutual Exclusion Violated</strong>).
      </p>
    </div>

    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 p-3 space-y-2">
      <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">
        Trap 2: TestAndSet Exit &amp; Pass-by-Value Bug
      </div>
      <pre className={CODE_BLOCK}>
{`function TestAndSet(boolean lock) {
  boolean initial = lock;
  lock = true;
  return initial;
}
// Process(int N):
repeat
  while (TestAndSet(lock)) no-op;
  /* critical section */
  lock = TRUE;  /* BUG! */
  /* remainder section */
until FALSE;`}
      </pre>
      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
        <strong className="text-rose-600 dark:text-rose-400">Does NOT solve CS problem (False)!</strong> Three flaws:
        (1) the exit section sets <code className="font-mono">lock = TRUE;</code> instead of{' '}
        <code className="font-mono">lock = FALSE;</code>, permanently locking out all processes after the first entry;
        (2) <code className="font-mono">lock</code> must be passed by pointer/reference (<code className="font-mono">*target</code>);
        and (3) basic <code className="font-mono">TestAndSet</code> does not satisfy Bounded Waiting for <code className="font-mono">N</code> processes.
      </p>
    </div>

    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 p-3 space-y-2">
      <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">
        Trap 3: Tracing Concurrent Print Outputs
      </div>
      <pre className={CODE_BLOCK}>
{`int x = 0, y = 0; // or semaphores s1=0, s2=0
// Process A:            // Process B:
while (x == 0);          printf("b");
printf("a");             x = 1;
y = 1;                   while (y == 0);
printf("d");             printf("c");`}
      </pre>
      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
        <strong>How to trace valid outputs:</strong> Process A cannot pass <code className="font-mono">while (x == 0)</code>{' '}
        until Process B prints <code className="font-mono">&quot;b&quot;</code> and sets <code className="font-mono">x = 1</code>.
        Thus <code className="font-mono">&quot;b&quot;</code> <strong>must print first</strong>, followed by{' '}
        <code className="font-mono">&quot;a&quot;</code>. Once A sets <code className="font-mono">y = 1</code>, A’s{' '}
        <code className="font-mono">printf(&quot;d&quot;)</code> and B’s <code className="font-mono">printf(&quot;c&quot;)</code>{' '}
        can run in either order &rarr; valid outputs are <code className="font-mono font-bold text-emerald-600 dark:text-emerald-400">badc</code>{' '}
        and <code className="font-mono font-bold text-emerald-600 dark:text-emerald-400">bacd</code>!
      </p>
    </div>
  </div>
);
/** Dining Philosophers 3 Deadlock Prevention Solutions (Slides 175-181) */
const DiningSolutionsShowcase: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
    <div className="rounded-lg border border-slate-200 dark:border-slate-700/70 bg-slate-50 dark:bg-slate-800/30 p-3 space-y-2">
      <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">
        Solution 1 — Capacity Limit (Slides 175–176)
      </div>
      <p className="font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
        Allow at most 4 philosophers to sit simultaneously at the table.
      </p>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
        With 5 chopsticks and at most 4 philosophers seated, by the pigeonhole principle at least one philosopher is
        guaranteed to acquire both chopsticks and finish eating.
      </p>
    </div>

    <div className="rounded-lg border border-slate-200 dark:border-slate-700/70 bg-slate-50 dark:bg-slate-800/30 p-3 space-y-2">
      <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">
        Solution 2 — Critical Section Pickup (Slides 177–178)
      </div>
      <p className="font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
        Pick up chopsticks only if BOTH are available (inside a mutex critical section).
      </p>
      <pre className={CODE_BLOCK}>
{`do {
  wait(mutex);
    wait(chopstick[i]);
    wait(chopstick[(i+1)%5]);
  signal(mutex);
  // eat
  signal(chopstick[i]);
  signal(chopstick[(i+1)%5]);
  // think
} while (TRUE);`}
      </pre>
    </div>

    <div className="rounded-lg border border-slate-200 dark:border-slate-700/70 bg-slate-50 dark:bg-slate-800/30 p-3 space-y-2">
      <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">
        Solution 3 — Asymmetric Order (Slides 179–181)
      </div>
      <p className="font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
        Odd philosophers pick up LEFT then RIGHT; even philosophers pick up RIGHT then LEFT.
      </p>
      <div className="rounded-lg bg-white dark:bg-slate-900/60 p-2.5 border border-slate-200 dark:border-slate-700/70 font-mono text-[11px] space-y-1 text-slate-700 dark:text-slate-300">
        <div className="font-semibold text-indigo-600 dark:text-indigo-400">&bull; P0, P2, P4 (even):</div>
        <div>Pick right first, then left</div>
        <div className="font-semibold text-emerald-600 dark:text-emerald-400 pt-1">&bull; P1, P3 (odd):</div>
        <div>Pick left first, then right</div>
      </div>
    </div>
  </div>
);

/** Shared detail view used by both the Mechanism and Classic Problems tabs. */
const TheoryDetail: React.FC<{ algo: SyncAlgorithmTheory }> = ({ algo }) => {
  const takeaway = SLIDE_KEY_TAKEAWAYS[algo.id];

  return (
    <div className="md:col-span-3 space-y-4">
      {/* Summary card (always visible) */}
      <div className="card space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{algo.title}</h3>
            {takeaway && (
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{takeaway.slideTag}</div>
            )}
          </div>
          <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
            {algo.category}
          </span>
        </div>

        {takeaway && (
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-7 border-l-2 border-indigo-500/50 pl-3">
            {takeaway.quickTakeaway}
          </p>
        )}

        <div className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400 leading-7">
          <p>{algo.concept}</p>
          <p>
            <strong className="text-slate-700 dark:text-slate-200">Problem solved: </strong>
            {algo.problemSolved}
          </p>
        </div>
      </div>

      {takeaway && (
        <Accordion
          title="How it works, step by step"
          icon={<Sparkles className="h-4 w-4 text-indigo-500" />}
          defaultOpen
        >
          <ol className="space-y-2 text-sm text-slate-700 dark:text-slate-300 leading-7 list-decimal pl-5 marker:text-slate-400">
            {takeaway.howItWorks.map((item, i) => (
              <li key={i}>{item.replace(/^\d+\.\s*/, '')}</li>
            ))}
          </ol>
          <div className="rounded-lg bg-indigo-500/5 border border-indigo-500/15 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2 leading-relaxed">
            <Lightbulb className="h-4 w-4 text-indigo-500 shrink-0 mt-1" />
            <span>
              <strong className="text-slate-800 dark:text-slate-100">Exam tip: </strong>
              {takeaway.examTip}
            </span>
          </div>
        </Accordion>
      )}

      {(algo.id === 'race_condition' || algo.id === 'critical_section_criteria') && (
        <Accordion
          title="Structure of a synchronized process"
          icon={<Layers className="h-4 w-4 text-indigo-500" />}
          badge="Slides 3–7"
        >
          <ProcessStructureVisual />
        </Accordion>
      )}

      {algo.id === 'race_condition' && (
        <Accordion
          title="Modifying Bounded Buffer to Unbounded Buffer (Code Transformation)"
          icon={<Code2 className="h-4 w-4 text-indigo-500" />}
          badge="Exam Core Concept"
          defaultOpen
        >
          <BoundedToUnboundedShowcase />
        </Accordion>
      )}

      {algo.id === 'strict_alternation' && (
        <Accordion
          title="Tracing Turn-Variable Variants & The 4-Case Proof Method"
          icon={<ShieldCheck className="h-4 w-4 text-indigo-500" />}
          badge="Exam Core Concept"
          defaultOpen
        >
          <StrictAlternationExamProofShowcase />
        </Accordion>
      )}

      {(algo.id === 'semaphores_concept' || algo.id === 'semaphores_implementation') && (
        <Accordion
          title="Semaphore usage patterns & the deadlock trap"
          icon={<Layers className="h-4 w-4 text-indigo-500" />}
          badge="Slides 20–33"
        >
          <SemaphoreUsageShowcase />
        </Accordion>
      )}

      {(algo.id === 'producer_consumer_bounded' || algo.id === 'semaphores_concept') && (
        <Accordion
          title="Semaphore Ordering: Why Reversing wait(mutex) & wait(empty) Causes Deadlock"
          icon={<AlertTriangle className="h-4 w-4 text-indigo-500" />}
          badge="Exam Core Concept"
          defaultOpen
        >
          <SemaphoreOrderingDeadlockShowcase />
        </Accordion>
      )}

      {algo.id === 'dining_philosophers' && (
        <Accordion
          title="Three solutions that prevent deadlock"
          icon={<Layers className="h-4 w-4 text-indigo-500" />}
          badge="Slides 175–181"
        >
          <DiningSolutionsShowcase />
        </Accordion>
      )}

      {/* Code */}
      <Accordion
        title="Code & protocol implementation"
        icon={<Code2 className="h-4 w-4 text-indigo-500" />}
        badge={`${algo.codeSnippets.length} listing${algo.codeSnippets.length === 1 ? '' : 's'}`}
        defaultOpen
      >
        <div className={`grid grid-cols-1 ${algo.codeSnippets.length >= 2 ? 'lg:grid-cols-2' : ''} gap-4`}>
          {algo.codeSnippets.map((snip, i) => (
            <div key={i} className="space-y-2 flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h5 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{snip.title}</h5>
                {snip.process && (
                  <span className="rounded-full border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    {snip.process}
                  </span>
                )}
              </div>
              <pre className={`${CODE_BLOCK} text-xs p-4`}>{snip.code}</pre>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-7">{snip.explanation}</p>
            </div>
          ))}
        </div>
      </Accordion>

      {/* Variables */}
      {algo.variables.length > 0 && (
        <Accordion title="Shared & local variables" badge={`${algo.variables.length}`}>
          <div className={TABLE_WRAP}>
            <table className="w-full text-left text-xs">
              <thead className={TABLE_HEAD}>
                <tr>
                  <th className="px-3 py-2">Variable</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Scope</th>
                  <th className="px-3 py-2">Initial value</th>
                  <th className="px-3 py-2">Role</th>
                </tr>
              </thead>
              <tbody className={TABLE_BODY}>
                {algo.variables.map((v) => (
                  <tr key={v.name}>
                    <td className="px-3 py-2 font-mono font-semibold text-indigo-600 dark:text-indigo-400">{v.name}</td>
                    <td className="px-3 py-2 font-mono text-slate-600 dark:text-slate-300">{v.type}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                          v.scope === 'global'
                            ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
                            : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
                        }`}
                      >
                        {v.scope === 'global' ? 'Global (shared)' : 'Local (per process)'}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-slate-700 dark:text-slate-300">{String(v.initialValue)}</td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-300 leading-relaxed">{v.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Accordion>
      )}

      {/* Evaluation */}
      <Accordion title="Evaluation against the 3 critical-section requirements" icon={<ShieldCheck className="h-4 w-4 text-indigo-500" />}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(
            [
              ['1. Mutual Exclusion', 'Only 1 process in CS at a time', algo.evaluation.mutualExclusion],
              ['2. Progress', 'No indefinite delay if CS is free', algo.evaluation.progress],
              ['3. Bounded Waiting', 'Upper bound on waiting turns', algo.evaluation.boundedWaiting],
            ] as const
          ).map(([label, sub, c]) => (
            <div key={label} className="rounded-lg border border-slate-200 dark:border-slate-700/70 bg-slate-50 dark:bg-slate-800/30 p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">{label}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{sub}</div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${STATUS_STYLE[c.status]}`}
                >
                  <StatusIcon status={c.status} />
                  {c.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-7">{c.justification}</p>
            </div>
          ))}
        </div>
      </Accordion>

      {/* Pros & cons */}
      <Accordion title="Advantages & limitations">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/70 p-3 space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
              <Check className="h-4 w-4" />
              <span>Advantages</span>
            </div>
            <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {algo.advantages.map((adv, i) => (
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
              <span>Limitations</span>
            </div>
            <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {algo.disadvantages.map((dis, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-rose-500">&bull;</span>
                  <span>{dis}</span>
                </li>
              ))}
            </ul>
            {algo.slideSolution && (
              <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700/70 text-sm flex items-start gap-1.5">
                <ArrowRight className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-1" />
                <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  <strong className="text-slate-800 dark:text-slate-100">Slide solution: </strong>
                  {algo.slideSolution}
                </div>
              </div>
            )}
          </div>
        </div>
      </Accordion>
    </div>
  );
};

/** Sidebar + detail layout for a list of theory entries. */
const SidebarLayout: React.FC<{
  title: string;
  items: SyncAlgorithmTheory[];
  selectedId: SyncTopicId;
  onSelect: (id: SyncTopicId) => void;
}> = ({ title, items, selectedId, onSelect }) => {
  const current = items.find((a) => a.id === selectedId) ?? items[0];
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="space-y-1.5 md:border-r border-slate-200 dark:border-slate-700/70 pr-2 self-start">
        <span className="text-xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">
          {title}
        </span>
        {items.map((a, idx) => {
          const takeaway = SLIDE_KEY_TAKEAWAYS[a.id];
          const selected = current.id === a.id;
          return (
            <button
              key={a.id}
              onClick={() => onSelect(a.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                selected
                  ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 font-semibold'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate">
                  {idx + 1}. {a.title.split(' (')[0]}
                </span>
              </div>
              {takeaway && (
                <div className="truncate text-[10px] mt-0.5 text-slate-400 dark:text-slate-500">
                  {takeaway.slideTag.split(' · ')[0]}
                </div>
              )}
            </button>
          );
        })}
      </div>
      <TheoryDetail algo={current} />
    </div>
  );
};

export const SyncModeKnowledge: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('mechanisms');
  const [selectedMechanism, setSelectedMechanism] = useState<SyncTopicId>(MECHANISMS[0].id);
  const [selectedClassic, setSelectedClassic] = useState<SyncTopicId>(CLASSIC_PROBLEMS[0].id);

  const tabClass = (tab: SubTab) =>
    `flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all cursor-pointer ${
      activeSubTab === tab
        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
        : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
    }`;

  return (
    <div className="space-y-6">
      {/* Subtab Navigation */}
      <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-700/70">
        <button onClick={() => setActiveSubTab('mechanisms')} className={tabClass('mechanisms')}>
          <BookOpen className="h-4 w-4" /> Mechanisms (Software, Hardware &amp; Semaphores)
        </button>
        <button onClick={() => setActiveSubTab('classic')} className={tabClass('classic')}>
          <Puzzle className="h-4 w-4" /> Classic Problems
        </button>
        <button onClick={() => setActiveSubTab('exam_guide')} className={tabClass('exam_guide')}>
          <Lightbulb className="h-4 w-4" /> Exam Mastery &amp; Code Analysis Guide
        </button>
        <button onClick={() => setActiveSubTab('comparison')} className={tabClass('comparison')}>
          <GitCompare className="h-4 w-4" /> Requirements &amp; Comparison
        </button>
      </div>

      {activeSubTab === 'exam_guide' && (
        <div className="space-y-4">
          <div className="card space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                Synchronization Exam Analysis &amp; Code-Modification Guide
              </h3>
              <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                Trace &bull; Prove &bull; Fix Flawed Code
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              This section breaks down the core analytical patterns tested on written Operating Systems exams: proving or
              disproving the 3 Critical-Section requirements step by step, modifying Bounded Buffer code into an
              Unbounded Buffer, analyzing semaphore lock ordering, and spotting subtle bugs in software/hardware locks.
            </p>
          </div>

          <Accordion
            title="1. Proving or Disproving the 3 Requirements on Turn-Variable Variations"
            icon={<ShieldCheck className="h-4 w-4 text-indigo-500" />}
            badge="4-Case Sequential Proof"
            defaultOpen
          >
            <StrictAlternationExamProofShowcase />
          </Accordion>

          <Accordion
            title="2. Modifying Producer–Consumer from Bounded Buffer to Unbounded Buffer"
            icon={<Code2 className="h-4 w-4 text-indigo-500" />}
            badge="Code Modification"
            defaultOpen
          >
            <BoundedToUnboundedShowcase />
          </Accordion>

          <Accordion
            title="3. Semaphore Ordering: Why Reversing wait(mutex) and wait(empty) Leads to Deadlock"
            icon={<AlertTriangle className="h-4 w-4 text-indigo-500" />}
            badge="Semaphore Logic & Deadlock"
            defaultOpen
          >
            <SemaphoreOrderingDeadlockShowcase />
          </Accordion>

          <Accordion
            title="4. Buggy Code Traps (Flag Order Bug, TestAndSet Exit Bug & Output Tracing)"
            icon={<Sparkles className="h-4 w-4 text-indigo-500" />}
            badge="Code Debugging & Output Trace"
            defaultOpen
          >
            <HardwareAndFlagTrapsShowcase />
          </Accordion>
        </div>
      )}

      {activeSubTab === 'mechanisms' && (
        <SidebarLayout
          title="Synchronization Mechanisms"
          items={MECHANISMS}
          selectedId={selectedMechanism}
          onSelect={setSelectedMechanism}
        />
      )}

      {activeSubTab === 'classic' && (
        <SidebarLayout
          title="Classic Case Studies"
          items={CLASSIC_PROBLEMS}
          selectedId={selectedClassic}
          onSelect={setSelectedClassic}
        />
      )}

      {activeSubTab === 'comparison' && (
        <div className="space-y-4">
          <Accordion
            title="Critical-section requirements per mechanism"
            badge="Mutual Exclusion · Progress · Bounded Waiting"
            defaultOpen
          >
            <div className={TABLE_WRAP}>
              <table className="w-full text-left text-xs">
                <thead className={`${TABLE_HEAD} uppercase`}>
                  <tr>
                    <th className="px-3.5 py-2.5">Mechanism</th>
                    <th className="px-3.5 py-2.5">Category</th>
                    <th className="px-3.5 py-2.5">Mutual Exclusion</th>
                    <th className="px-3.5 py-2.5">Progress</th>
                    <th className="px-3.5 py-2.5">Bounded Waiting</th>
                  </tr>
                </thead>
                <tbody className={TABLE_BODY}>
                  {ALL_THEORIES.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="px-3.5 py-2 font-semibold text-slate-800 dark:text-slate-100">
                        {t.title.split(' (')[0]}
                        <span className="block text-[10px] font-normal text-slate-500 dark:text-slate-400">
                          {SLIDE_KEY_TAKEAWAYS[t.id]?.slideTag.split(' · ')[0]}
                        </span>
                      </td>
                      <td className="px-3.5 py-2 text-slate-500 dark:text-slate-400">{t.category}</td>
                      {(['mutualExclusion', 'progress', 'boundedWaiting'] as const).map((k) => (
                        <td key={k} className="px-3.5 py-2">
                          <span
                            title={t.evaluation[k].justification}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${STATUS_STYLE[t.evaluation[k].status]}`}
                          >
                            <StatusIcon status={t.evaluation[k].status} />
                            {t.evaluation[k].status.replace('_', ' ')}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Accordion>

          <Accordion title="Cross-mechanism comparison matrix" badge="Academic overview">
            <div className={TABLE_WRAP}>
              <table className="w-full text-left text-xs">
                <thead className={`${TABLE_HEAD} uppercase`}>
                  <tr>
                    <th className="px-3.5 py-2.5">Mechanism</th>
                    <th className="px-3.5 py-2.5">Processes</th>
                    <th className="px-3.5 py-2.5">ME</th>
                    <th className="px-3.5 py-2.5">Progress</th>
                    <th className="px-3.5 py-2.5">BW</th>
                    <th className="px-3.5 py-2.5">Waiting</th>
                    <th className="px-3.5 py-2.5">HW Support</th>
                    <th className="px-3.5 py-2.5">Deadlock</th>
                    <th className="px-3.5 py-2.5">Starvation</th>
                    <th className="px-3.5 py-2.5">Complexity</th>
                    <th className="px-3.5 py-2.5">Recommended Use</th>
                  </tr>
                </thead>
                <tbody className={TABLE_BODY}>
                  {SYNC_COMPARISON_MATRIX.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="px-3.5 py-2 font-semibold text-slate-800 dark:text-slate-100">
                        {row.name}
                        <span className="block text-[10px] font-normal text-slate-500 dark:text-slate-400">
                          {row.category}
                        </span>
                      </td>
                      <td className="px-3.5 py-2">{row.supportedProcesses}</td>
                      <td className="px-3.5 py-2">
                        <BoolCell value={row.mutualExclusion} />
                      </td>
                      <td className="px-3.5 py-2">
                        <BoolCell value={row.progress} />
                      </td>
                      <td className="px-3.5 py-2">
                        <BoolCell value={row.boundedWaiting} />
                      </td>
                      <td className="px-3.5 py-2">
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[11px] font-medium whitespace-nowrap ${
                            row.waitingMechanism.startsWith('Busy')
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                              : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                          }`}
                        >
                          {row.waitingMechanism}
                        </span>
                      </td>
                      <td className="px-3.5 py-2">
                        <BoolCell value={row.hardwareSupportRequired} />
                      </td>
                      <td className="px-3.5 py-2">{row.deadlockRisk}</td>
                      <td className="px-3.5 py-2">
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[11px] font-medium ${
                            row.starvationRisk === 'None'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                          }`}
                        >
                          {row.starvationRisk}
                        </span>
                      </td>
                      <td className="px-3.5 py-2">{row.complexity}</td>
                      <td className="px-3.5 py-2 text-slate-500 dark:text-slate-400">{row.recommendedUse}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Accordion>
        </div>
      )}
    </div>
  );
};

export default SyncModeKnowledge;
