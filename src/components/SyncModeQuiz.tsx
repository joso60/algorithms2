import React, { useMemo, useState } from 'react';
import {
  SYNC_ALGORITHMS_THEORY,
  SYNC_SLIDE_PRESETS,
  type CriteriaStatus,
  type ProcessState,
} from '../data/syncData';
import { getPseudocodeBundle, activeSides, isSpecLineActive } from '../data/syncCode';
import {
  generateSyncQuiz,
  evaluateSyncQuiz,
  type SyncCellState,
  type SyncQuizChallenge,
  type SyncQuizEvaluationReport,
} from '../engine/syncEngine';
import {
  Shuffle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Send,
  Trophy,
  Lightbulb,
  Cpu,
  Variable,
  Users,
  ShieldCheck,
  Code2,
  History,
  HelpCircle,
  Wrench,
} from 'lucide-react';

type QuizWorkbenchMode = 'trace' | 'codemod';
type SourceMode = 'random' | 'topic' | 'preset';

interface CodeModBlank {
  id: string;
  label: string;
  acceptedNormalized: string[];
  displayAnswer: string;
  explanation: string;
}

interface CodeModChallenge {
  id: string;
  title: string;
  tag: string;
  prompt: string;
  givenCodeTitle: string;
  givenCodeSubtitle: string;
  givenCode: string;
  blanks: CodeModBlank[];
  takeaway: string;
}

const normalizeCodeAns = (raw: string): string =>
  raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/;+$/, '');

const CODE_MOD_CHALLENGES: CodeModChallenge[] = [
  {
    id: 'bounded_to_unbounded',
    title: '1. Bounded Buffer → Unbounded Buffer Code Modification',
    tag: 'Code Modification',
    prompt:
      'Given the standard Bounded-Buffer Consumer and Producer algorithms on the left, write the modified statements required to convert both algorithms to an UNBOUNDED (infinite-capacity) buffer.',
    givenCodeTitle: 'Given: Bounded-Buffer Producer & Consumer',
    givenCodeSubtitle: 'Circular array buffer[0 .. BUFFER_SIZE - 1], in = 0, out = 0',
    givenCode: `// --- CONSUMER (Bounded Buffer) ---
while (true) {
  while (in == out) ;                  // Line C1: Wait if empty
  w = buffer[out];                     // Line C2: Read item
  out = (out + 1) % BUFFER_SIZE;       // Line C3: Circular advance
  // consume item w
}

// --- PRODUCER (Bounded Buffer) ---
while (true) {
  // produce item v
  while (((in + 1) % BUFFER_SIZE) == out) ; // Line P1: Wait if full
  buffer[in] = v;                           // Line P2: Write item
  in = (in + 1) % BUFFER_SIZE;              // Line P3: Circular advance
}`,
    blanks: [
      {
        id: 'c1',
        label: 'Consumer Line C1 (Empty-buffer check in Unbounded Buffer)',
        acceptedNormalized: ['while(in==out)', 'while(out==in)'],
        displayAnswer: 'while (in == out);',
        explanation: 'Even with an infinite buffer, the Consumer CANNOT read from an empty buffer, so while (in == out); must remain unchanged.',
      },
      {
        id: 'c3',
        label: 'Consumer Line C3 (Advance out index without wrap-around)',
        acceptedNormalized: ['out=out+1', 'out++', '++out', 'out+=1'],
        displayAnswer: 'out = out + 1;',
        explanation: 'Because the buffer is unbounded, out advances linearly without % BUFFER_SIZE.',
      },
      {
        id: 'p1',
        label: 'Producer Line P1 (What replaces the full-buffer while loop? Type NONE if removed)',
        acceptedNormalized: ['none', 'removed', '//removed', 'nothing', 'delete', 'remove', ''],
        displayAnswer: 'NONE (Removed — an unbounded buffer is never full)',
        explanation: 'An unbounded buffer never becomes full, so the Producer never busy-waits before inserting an item.',
      },
      {
        id: 'p3',
        label: 'Producer Line P3 (Advance in index without wrap-around)',
        acceptedNormalized: ['in=in+1', 'in++', '++in', 'in+=1'],
        displayAnswer: 'in = in + 1;',
        explanation: 'Without a fixed BUFFER_SIZE wrap-around, the Producer increments in linearly: in = in + 1;.',
      },
    ],
    takeaway:
      'In an Unbounded Buffer: (1) Producer removes its full-check while loop and uses in = in + 1; (2) Consumer keeps while (in == out); and uses out = out + 1;.',
  },
  {
    id: 'semaphore_order_deadlock',
    title: '2. Reversed Semaphore Order (wait(mutex) before wait(empty)) — Deadlock Trace & Fix',
    tag: 'Deadlock & Code Fix',
    prompt:
      'Suppose a programmer reverses the two wait() calls in the Producer so that wait(mutex) is called BEFORE wait(empty). Assume the buffer is currently FULL (empty = 0, full = n, mutex = 1). Trace what happens and write the corrected Producer entry/exit calls.',
    givenCodeTitle: 'Given: Buggy Producer with Reversed wait() Calls',
    givenCodeSubtitle: 'Initial state when buffer is FULL: mutex = 1, empty = 0, full = n',
    givenCode: `// --- BUGGY PRODUCER ---
do {
  // produce an item
  wait(mutex);     // <-- Reversed! Acquires mutex first
  wait(empty);     // <-- Blocks here if empty == 0 while holding mutex!
  // add item to buffer
  signal(mutex);
  signal(full);
} while (true);

// --- CONSUMER ---
do {
  wait(full);
  wait(mutex);     // <-- Consumer needs mutex to remove an item!
  // remove item from buffer
  signal(mutex);
  signal(empty);
} while (true);`,
    blanks: [
      {
        id: 'mutex_val',
        label: '1. Value of mutex immediately after Producer executes wait(mutex)',
        acceptedNormalized: ['0'],
        displayAnswer: '0',
        explanation: 'wait(mutex) decrements mutex from 1 to 0, so the Producer now holds the exclusive lock.',
      },
      {
        id: 'prod_state',
        label: '2. State of Producer when it executes wait(empty) while empty == 0 (BLOCKED or CRITICAL)',
        acceptedNormalized: ['blocked', 'waiting', 'sleep'],
        displayAnswer: 'BLOCKED',
        explanation: 'Because empty == 0, wait(empty) blocks the Producer in empty.queue while it still holds mutex = 0.',
      },
      {
        id: 'cons_state',
        label: '3. State of Consumer when it executes wait(mutex) to free a slot (BLOCKED or CRITICAL)',
        acceptedNormalized: ['blocked', 'waiting', 'deadlock', 'deadlocked'],
        displayAnswer: 'BLOCKED (Permanent Deadlock)',
        explanation: 'Consumer passes wait(full), but blocks at wait(mutex) because mutex == 0 is held by the sleeping Producer.',
      },
      {
        id: 'fix_w1',
        label: '4. Correct Producer Entry — 1st wait() statement',
        acceptedNormalized: ['wait(empty)', 'p(empty)'],
        displayAnswer: 'wait(empty);',
        explanation: 'Always wait on the capacity counting semaphore (empty) BEFORE acquiring the binary lock (mutex).',
      },
      {
        id: 'fix_w2',
        label: '5. Correct Producer Entry — 2nd wait() statement',
        acceptedNormalized: ['wait(mutex)', 'p(mutex)'],
        displayAnswer: 'wait(mutex);',
        explanation: 'Only acquire mutex after confirming at least one empty slot exists.',
      },
    ],
    takeaway:
      'wait(mutex) and wait(empty) CANNOT be reversed: acquiring mutex when empty == 0 puts the Producer to sleep holding the lock, deadlocking the Consumer.',
  },
  {
    id: 'flawed_turn_trace_fix',
    title: '3. Flawed Turn Algorithm (while (turn == i)) — 3 Criteria Proof & Code Fix',
    tag: 'Criteria Proof & Fix',
    prompt:
      'Analyze the two-process algorithm on the left where Pi spins while (turn == i) and sets turn = j on exit. Evaluate the 3 Critical Section criteria, trace the sequential execution, and fix the entry condition.',
    givenCodeTitle: 'Given: Flawed Turn Algorithm (Pi and Pj)',
    givenCodeSubtitle: 'Shared variable: int turn; (0 or 1)',
    givenCode: `// Process Pi (e.g. P0, where i = 0, j = 1)
do {
  while (turn == i) ;   // Entry Section (spins when turn == i!)
  /* Critical Section */
  turn = j;             // Exit Section
  /* Remainder Section */
} while (true);

// Process Pj (e.g. P1, where j = 1, i = 0)
do {
  while (turn == j) ;   // Entry Section (spins when turn == j!)
  /* Critical Section */
  turn = i;             // Exit Section
  /* Remainder Section */
} while (true);`,
    blanks: [
      {
        id: 'me',
        label: '1. Mutual Exclusion (SATISFIED or VIOLATED)',
        acceptedNormalized: ['satisfied', 'true', 'yes'],
        displayAnswer: 'SATISFIED',
        explanation: 'turn is a single integer (0 or 1); it cannot be both != 0 and != 1 simultaneously, so both processes can never be in CS together.',
      },
      {
        id: 'prog',
        label: '2. Progress (SATISFIED or VIOLATED)',
        acceptedNormalized: ['violated', 'false', 'no'],
        displayAnswer: 'VIOLATED',
        explanation: 'If turn == 0 and P1 is in its Remainder Section, P0 wants to enter CS but is stuck in while (turn == 0); even though CS is empty.',
      },
      {
        id: 'bw',
        label: '3. Bounded Waiting (SATISFIED or VIOLATED)',
        acceptedNormalized: ['violated', 'false', 'no'],
        displayAnswer: 'VIOLATED',
        explanation: 'Under the variant where exit sets turn = i (or when one process halts in Remainder), a waiting process can be bypassed or blocked indefinitely.',
      },
      {
        id: 'case_trace',
        label: '4. Trace Case (P0 then P1, initial turn = 0): Which process enters CS first? (P0 or P1)',
        acceptedNormalized: ['p1'],
        displayAnswer: 'P1',
        explanation: 'At turn = 0, P0 evaluates while (turn == 0) -> TRUE and spins. P1 evaluates while (turn == 1) -> FALSE and enters CS!',
      },
      {
        id: 'fix_entry',
        label: '5. Fix Pi Entry Loop so Pi waits when it is Pj’s turn (turn == j or turn != i)',
        acceptedNormalized: ['while(turn!=i)', 'while(turn==j)'],
        displayAnswer: 'while (turn != i);  /* or while (turn == j); */',
        explanation: 'Pi should spin while (turn != i); (i.e. while it is Pj’s turn) and enter CS when turn == i.',
      },
    ],
    takeaway:
      'Both while (turn == i); and while (turn != i); satisfy Mutual Exclusion ONLY and fail Progress because entrance depends strictly on turn rather than whether the other process actually wants the CS.',
  },
  {
    id: 'flag_and_tas_bugs',
    title: '4. Spin-Before-Set Flag Bug & TestAndSet Hardware Lock Fix',
    tag: 'Bug Identification & Fix',
    prompt:
      'Inspect the two flawed synchronization snippets on the left: Snippet A checks while (flag[(i+1)%2]); BEFORE setting flag[i] = true, and Snippet B sets lock = true in the TestAndSet exit section. Diagnose and fix both bugs.',
    givenCodeTitle: 'Given: Snippet A (Broken Flag Order) & Snippet B (Broken TestAndSet Exit)',
    givenCodeSubtitle: 'boolean flag[2] = {false, false}; boolean lock = false;',
    givenCode: `// --- SNIPPET A: Broken Flag Protocol ---
while (true) {
  while (flag[(i + 1) % 2]) ;  // Bug: checks other flag BEFORE setting own flag!
  flag[i] = true;
  /* Critical Section */
  flag[i] = false;
}

// --- SNIPPET B: Broken TestAndSet Lock ---
while (true) {
  while (TestAndSet(&lock)) ;  // Atomically sets lock = true and returns old value
  /* Critical Section */
  lock = true;                 // Bug: Exit section!
}`,
    blanks: [
      {
        id: 'snip_a_me',
        label: '1. Does Snippet A satisfy Mutual Exclusion? (SATISFIED or VIOLATED)',
        acceptedNormalized: ['violated', 'false', 'no'],
        displayAnswer: 'VIOLATED',
        explanation: 'If P0 and P1 both execute while (flag[(i+1)%2]); while both flags are false, both pass the loop and enter CS simultaneously!',
      },
      {
        id: 'snip_a_line1',
        label: '2. Fix Snippet A: What statement MUST execute FIRST in the entry section?',
        acceptedNormalized: ['flag[i]=true'],
        displayAnswer: 'flag[i] = true;',
        explanation: 'A process must announce its intent (flag[i] = true;) BEFORE reading the other process’s flag.',
      },
      {
        id: 'snip_b_exit',
        label: '3. Fix Snippet B: Write the correct Exit Section statement to release the TestAndSet lock',
        acceptedNormalized: ['lock=false', 'lock=0'],
        displayAnswer: 'lock = false;',
        explanation: 'TestAndSet(&lock) sets lock = true to acquire the CS; the exit section must reset lock = false so waiting processes can enter.',
      },
      {
        id: 'snip_b_bw',
        label: '4. Even after fixing lock = false, does basic TestAndSet satisfy Bounded Waiting? (SATISFIED or VIOLATED)',
        acceptedNormalized: ['violated', 'false', 'no'],
        displayAnswer: 'VIOLATED',
        explanation: 'Basic TestAndSet without a waiting[] array allows an arbitrary winning process to re-enter CS repeatedly while others starve.',
      },
    ],
    takeaway:
      'In software solutions, setting flag[i] = true must precede testing the other process; in hardware TestAndSet, the exit section must set lock = false (which satisfies Mutual Exclusion and Progress, but still violates Bounded Waiting without waiting[]).',
  },
  {
    id: 'coke_machine_semaphores',
    title: '5. Bounded-Buffer Semaphore Synthesis (10-Slot Machine)',
    tag: 'Write Semaphore Code',
    prompt:
      'A delivery person (Producer) places cokes into a 10-slot vending machine using put_1_coke_in_machine(), and a student (Consumer) removes cokes using take_1_coke_from_machine(). Initialize the 3 semaphores and fill in the exact wait() and signal() calls.',
    givenCodeTitle: 'Given: 10-Slot Machine Skeleton',
    givenCodeSubtitle: 'Semaphores: mutex, emptyBuffer, fullBuffer',
    givenCode: `// --- INITIALIZATION ---
semaphore mutex       = [Blank 1];
semaphore emptyBuffer = [Blank 2]; // Capacity = 10 cokes
semaphore fullBuffer  = [Blank 3];

// --- DELIVERY PERSON (Producer) ---
  [Blank 4]
  [Blank 5]
  put_1_coke_in_machine();
  [Blank 6]
  [Blank 7]

// --- STUDENT (Consumer) ---
  wait(fullBuffer);
  wait(mutex);
  take_1_coke_from_machine();
  signal(mutex);
  signal(emptyBuffer);`,
    blanks: [
      {
        id: 'init_mutex',
        label: 'Blank 1: Initial value of mutex',
        acceptedNormalized: ['1'],
        displayAnswer: '1',
        explanation: 'mutex is a binary semaphore guarding the buffer and starts unlocked at 1.',
      },
      {
        id: 'init_empty',
        label: 'Blank 2: Initial value of emptyBuffer (10-slot machine starts empty)',
        acceptedNormalized: ['10'],
        displayAnswer: '10',
        explanation: 'All 10 slots are initially empty, so emptyBuffer starts at 10.',
      },
      {
        id: 'init_full',
        label: 'Blank 3: Initial value of fullBuffer',
        acceptedNormalized: ['0'],
        displayAnswer: '0',
        explanation: 'Initially 0 cokes are in the machine, so fullBuffer starts at 0.',
      },
      {
        id: 'prod_b4',
        label: 'Blank 4: Producer 1st statement before put_1_coke_in_machine()',
        acceptedNormalized: ['wait(emptybuffer)', 'wait(empty)'],
        displayAnswer: 'wait(emptyBuffer);',
        explanation: 'Producer must first decrement/wait on emptyBuffer to ensure a free slot exists.',
      },
      {
        id: 'prod_b5',
        label: 'Blank 5: Producer 2nd statement before put_1_coke_in_machine()',
        acceptedNormalized: ['wait(mutex)'],
        displayAnswer: 'wait(mutex);',
        explanation: 'Producer acquires exclusive access to the machine after reserving an empty slot.',
      },
      {
        id: 'prod_b6',
        label: 'Blank 6: Producer 1st statement after put_1_coke_in_machine()',
        acceptedNormalized: ['signal(mutex)'],
        displayAnswer: 'signal(mutex);',
        explanation: 'Release mutex immediately after placing the item in the buffer.',
      },
      {
        id: 'prod_b7',
        label: 'Blank 7: Producer 2nd statement after put_1_coke_in_machine()',
        acceptedNormalized: ['signal(fullbuffer)', 'signal(full)'],
        displayAnswer: 'signal(fullBuffer);',
        explanation: 'Increment fullBuffer to wake up any waiting Consumer.',
      },
    ],
    takeaway:
      'Initial values: mutex = 1, emptyBuffer = N (10), fullBuffer = 0. Entry always waits on the resource count (emptyBuffer or fullBuffer) BEFORE wait(mutex).',
  },
];

const PROCESS_STATES: ProcessState[] = ['ENTRY', 'CRITICAL', 'BLOCKED', 'WAITING', 'EXIT', 'REMAINDER'];
const CRITERIA_OPTIONS: CriteriaStatus[] = ['SATISFIED', 'VIOLATED', 'PARTIAL', 'NOT_APPLICABLE'];

const PRESET_TOPICS = SYNC_SLIDE_PRESETS.map((p) => ({
  topicId: p.topicId,
  title: SYNC_ALGORITHMS_THEORY[p.topicId].title,
}));

const STATE_BADGE: Record<ProcessState, string> = {
  ENTRY: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  CRITICAL: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  EXIT: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  REMAINDER: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  BLOCKED: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  WAITING: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
};

const cellBorder = (s?: SyncCellState): string => {
  if (s === 'correct') return 'border-emerald-500/50 bg-emerald-500/10';
  if (s === 'wrong') return 'border-rose-500/50 bg-rose-500/10';
  if (s === 'empty') return 'border-amber-500/40 bg-amber-500/10';
  return 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60';
};

const CellIcon: React.FC<{ state?: SyncCellState }> = ({ state }) => {
  if (state === 'correct') return <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />;
  if (state === 'wrong') return <XCircle className="h-4 w-4 text-rose-500 shrink-0" />;
  return null;
};

const fieldClass =
  'w-full rounded-lg border px-2 py-1.5 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-80';

const pill = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium';

interface Answers {
  processStates: Record<string, string>;
  sharedVariables: Record<string, string>;
  waitingQueue: string;
  criteria: { mutualExclusion: string; progress: string; boundedWaiting: string };
}

const emptyAnswers = (): Answers => ({
  processStates: {},
  sharedVariables: {},
  waitingQueue: '',
  criteria: { mutualExclusion: '', progress: '', boundedWaiting: '' },
});

/** Permanent, IDE-style (always dark) algorithm listing shown next to every question. */
const AlgorithmPanel: React.FC<{
  presetId: string;
  step: { codeLine: string; lineRef?: string; stepIndex: number; activeProcess: string };
}> = ({ presetId, step }) => {
  const sides = activeSides(presetId, step.activeProcess);
  const bundle = useMemo(() => getPseudocodeBundle(presetId), [presetId]);
  if (!bundle.panels.length) return null;

  return (
    <div className="space-y-3">
      {bundle.panels.map((panel, panelIdx) => (
        <div
          key={panel.title}
          className="rounded-xl bg-slate-950 border border-slate-700 font-mono text-[13px] text-slate-200 overflow-hidden"
        >
          <div className="px-3 py-2 border-b border-slate-800 bg-slate-900">
            <div className="text-xs font-semibold text-slate-100">{panel.title}</div>
            {panel.subtitle && <div className="text-[11px] text-slate-400 font-sans mt-0.5">{panel.subtitle}</div>}
          </div>
          <div className="py-1.5">
            {panel.lines.map((spec, idx) => {
              const sideOk = bundle.panels.length < 2 || (panelIdx === 0 ? sides.left : sides.right);
              const active = sideOk && isSpecLineActive(spec, step);
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 px-3 py-0.5 leading-snug ${
                    active ? 'bg-indigo-500/20 border-l-2 border-l-indigo-400 text-slate-50' : 'border-l-2 border-l-transparent text-slate-400'
                  }`}
                >
                  <span className="w-5 shrink-0 text-right text-[11px] text-slate-600 select-none">{idx + 1}</span>
                  <span className="whitespace-pre overflow-x-auto">{spec.line}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {bundle.helper && (
        <div className="rounded-xl bg-slate-950 border border-slate-700 font-mono text-xs overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-800 bg-slate-900 font-sans text-xs font-semibold text-slate-100">
            {bundle.helper.title}
          </div>
          <pre className="px-3 py-2 text-slate-300 overflow-x-auto leading-relaxed">{bundle.helper.code}</pre>
        </div>
      )}

      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
        The highlighted line is the instruction executed by <strong>{step.activeProcess}</strong> in the step being asked about.
      </p>
    </div>
  );
};

/** Generic, non-leaking placeholder derived from the kind of answer expected. */
const genericPlaceholder = (b: CodeModBlank): string => {
  const accepted = b.acceptedNormalized;
  if (accepted.includes('satisfied')) return 'Enter SATISFIED or VIOLATED';
  if (accepted.includes('violated')) return 'Enter SATISFIED or VIOLATED';
  if (accepted.includes('blocked')) return 'Enter BLOCKED or CRITICAL';
  if (accepted.length === 1 && accepted[0] === 'no') return 'Enter YES or NO';
  if (accepted.some((a) => /^\d+$/.test(a))) return 'Enter the numeric value...';
  if (accepted.includes('p1') || accepted.includes('p0')) return 'Enter the process name...';
  return 'Type the correct code statement here...';
};

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const VV = ['violated', 'false', 'no'];

interface BugTemplate {
  algo: string;
  title: string;
  subtitle: string;
  code: string;
  bugLabel: string;
  verdictLabel: string;
  verdictAnswers: string[];
  verdictDisplay: string;
  verdictExplanation: string;
  fixLabel: string;
  fixAnswers: string[];
  fixDisplay: string;
  fixExplanation: string;
  takeaway: string;
}

const BUG_TEMPLATES: BugTemplate[] = [
  {
    algo: "Peterson's Solution",
    title: "Peterson's Solution — Wrong Flag Order",
    subtitle: 'boolean flag[2] = {false, false}; int turn;',
    code: `// Process Pi (j = 1 - i)
do {
  while (flag[j] && turn == j) ;   // Entry: test first...
  flag[i] = true;                  // ...announce intent afterwards
  turn = j;
  /* Critical Section */
  flag[i] = false;
  /* Remainder Section */
} while (true);`,
    bugLabel: 'Wrong flag order',
    verdictLabel: '1. Does this code satisfy Mutual Exclusion? (SATISFIED or VIOLATED)',
    verdictAnswers: VV,
    verdictDisplay: 'VIOLATED',
    verdictExplanation: 'Both processes can pass the while test while both flags are still false, then both enter the CS.',
    fixLabel: '2. Which statement must be the FIRST line of the entry section?',
    fixAnswers: ['flag[i]=true'],
    fixDisplay: 'flag[i] = true;',
    fixExplanation: 'A process must announce its intent before it looks at the other process.',
    takeaway: "In Peterson's algorithm the order is: flag[i] = true; turn = j; while (flag[j] && turn == j);",
  },
  {
    algo: "Peterson's Solution",
    title: "Peterson's Solution — Wrong Turn Assignment",
    subtitle: 'boolean flag[2] = {false, false}; int turn;',
    code: `// Process Pi (j = 1 - i)
do {
  flag[i] = true;
  turn = i;                        // <-- suspicious
  while (flag[j] && turn == j) ;
  /* Critical Section */
  flag[i] = false;
  /* Remainder Section */
} while (true);`,
    bugLabel: 'Wrong turn assignment',
    verdictLabel: '1. With turn = i, can Pi ever be stopped by the while loop? (Enter YES or NO)',
    verdictAnswers: ['no'],
    verdictDisplay: 'NO',
    verdictExplanation: 'Pi sets turn = i, so turn == j is never true for Pi and it never waits; both processes can enter the CS (Mutual Exclusion VIOLATED).',
    fixLabel: '2. Rewrite the line that assigns turn so that Pi yields to the other process',
    fixAnswers: ['turn=j'],
    fixDisplay: 'turn = j;',
    fixExplanation: 'Pi must politely give the turn to Pj: turn = j;',
    takeaway: 'Each process sets turn to the OTHER process, giving it priority.',
  },
  {
    algo: 'TestAndSet Lock',
    title: 'TestAndSet — Broken Release',
    subtitle: 'boolean lock = false;',
    code: `while (true) {
  while (TestAndSet(&lock)) ;   // entry section
  /* Critical Section */
  lock = true;                  // exit section
  /* Remainder Section */
}`,
    bugLabel: 'Wrong exit statement',
    verdictLabel: '1. After the first process leaves the CS, can any waiting process ever enter? (Enter YES or NO)',
    verdictAnswers: ['no'],
    verdictDisplay: 'NO',
    verdictExplanation: 'The lock stays true forever, so every waiting process spins indefinitely (Progress VIOLATED).',
    fixLabel: '2. Write the correct exit-section statement',
    fixAnswers: ['lock=false', 'lock=0'],
    fixDisplay: 'lock = false;',
    fixExplanation: 'Releasing the lock requires lock = false;',
    takeaway: 'TestAndSet acquires by setting lock = true; the exit section must reset it to false.',
  },
  {
    algo: 'Strict Alternation',
    title: 'Strict Alternation — Wrong Exit Assignment',
    subtitle: 'int turn = 0;',
    code: `// Process Pi (j = 1 - i)
do {
  while (turn != i) ;     // Entry section
  /* Critical Section */
  turn = i;               // Exit section
  /* Remainder Section */
} while (true);`,
    bugLabel: 'Wrong exit assignment',
    verdictLabel: '1. Does Pj ever get a chance to enter the CS after Pi exits? (Enter YES or NO)',
    verdictAnswers: ['no'],
    verdictDisplay: 'NO',
    verdictExplanation: 'turn stays equal to i, so Pj spins forever while Pi re-enters repeatedly (Bounded Waiting VIOLATED).',
    fixLabel: '2. Write the correct exit-section statement',
    fixAnswers: ['turn=j'],
    fixDisplay: 'turn = j;',
    fixExplanation: 'The exit section must hand the turn over to the other process: turn = j;',
    takeaway: 'In Strict Alternation each process hands the turn to the other on exit.',
  },
  {
    algo: 'Producer / Consumer',
    title: 'Bounded Buffer — Missing signal',
    subtitle: 'semaphore mutex = 1, empty = N, full = 0;',
    code: `// PRODUCER
do {
  wait(empty);
  wait(mutex);
  // add item to buffer
  signal(mutex);
  // (missing statement)
} while (true);

// CONSUMER
do {
  wait(full);
  wait(mutex);
  // remove item from buffer
  signal(mutex);
  signal(empty);
} while (true);`,
    bugLabel: 'Missing signal',
    verdictLabel: '1. What happens to the Consumer after the Producer adds items? (Enter BLOCKED or CRITICAL)',
    verdictAnswers: ['blocked', 'waiting'],
    verdictDisplay: 'BLOCKED',
    verdictExplanation: 'full is never incremented, so wait(full) blocks the Consumer forever even though the buffer holds items.',
    fixLabel: '2. Write the missing Producer statement',
    fixAnswers: ['signal(full)'],
    fixDisplay: 'signal(full);',
    fixExplanation: 'The Producer must announce a new filled slot with signal(full);',
    takeaway: 'Every produced item must be announced with signal(full).',
  },
  {
    algo: 'Producer / Consumer',
    title: 'Bounded Buffer — Reversed Semaphore Order',
    subtitle: 'semaphore mutex = 1, empty = N, full = 0;',
    code: `// PRODUCER
do {
  wait(mutex);      // <-- acquired first
  wait(empty);      // <-- may block while holding mutex
  // add item to buffer
  signal(mutex);
  signal(full);
} while (true);`,
    bugLabel: 'Reversed semaphore order',
    verdictLabel: '2. When the buffer is full, can the Consumer ever make progress? (Enter YES or NO)',
    verdictAnswers: ['no'],
    verdictDisplay: 'NO (Deadlock)',
    verdictExplanation: 'The Producer sleeps in wait(empty) holding mutex = 0, so the Consumer blocks on wait(mutex): deadlock.',
    fixLabel: '1. Write the statement that must come FIRST in the Producer',
    fixAnswers: ['wait(empty)'],
    fixDisplay: 'wait(empty);',
    fixExplanation: 'Always wait on the counting semaphore before the mutex.',
    takeaway: 'Wait on the resource-count semaphore first, then on the mutex.',
  },
  {
    algo: 'Producer / Consumer',
    title: 'Bounded Buffer — Missing signal(mutex)',
    subtitle: 'semaphore mutex = 1, empty = N, full = 0;',
    code: `// CONSUMER
do {
  wait(full);
  wait(mutex);
  // remove item from buffer
  // (missing statement)
  signal(empty);
} while (true);`,
    bugLabel: 'Missing signal(mutex)',
    verdictLabel: '1. After the Consumer finishes once, can the Producer ever enter its CS? (Enter YES or NO)',
    verdictAnswers: ['no'],
    verdictDisplay: 'NO',
    verdictExplanation: 'mutex remains 0 forever, so every other process blocks on wait(mutex).',
    fixLabel: '2. Write the missing Consumer statement',
    fixAnswers: ['signal(mutex)'],
    fixDisplay: 'signal(mutex);',
    fixExplanation: 'The lock must be released after leaving the CS.',
    takeaway: 'Every wait(mutex) must be paired with a signal(mutex).',
  },
];

/** Randomly picks a synchronization algorithm and injects one of its known bugs. */
const generateRandomBugChallenge = (): CodeModChallenge => {
  const algo = pick(Array.from(new Set(BUG_TEMPLATES.map((t) => t.algo))));
  const t = pick(BUG_TEMPLATES.filter((x) => x.algo === algo));
  const verdictFirst = t.verdictLabel.startsWith('1.');
  const verdictBlank: CodeModBlank = {
    id: 'rb_verdict',
    label: t.verdictLabel,
    acceptedNormalized: t.verdictAnswers,
    displayAnswer: t.verdictDisplay,
    explanation: t.verdictExplanation,
  };
  const fixBlank: CodeModBlank = {
    id: 'rb_fix',
    label: t.fixLabel,
    acceptedNormalized: t.fixAnswers,
    displayAnswer: t.fixDisplay,
    explanation: t.fixExplanation,
  };
  return {
    id: `random_bug_${t.title}`,
    title: `Random Bug Generation — ${t.title}`,
    tag: 'Random Bug',
    prompt: `The ${t.algo} implementation on the left contains an injected bug (${t.bugLabel}). Diagnose the behavior and fix it.`,
    givenCodeTitle: `Given: ${t.title}`,
    givenCodeSubtitle: t.subtitle,
    givenCode: t.code,
    blanks: verdictFirst ? [verdictBlank, fixBlank] : [fixBlank, verdictBlank],
    takeaway: t.takeaway,
  };
};

const stripNumber = (s: string): string => s.replace(/^\d+\.\s*/, '');

const CodeModWorkbench: React.FC = () => {
  const [shuffled, setShuffled] = useState<CodeModChallenge[]>(() => shuffle(CODE_MOD_CHALLENGES));
  const [randomBug, setRandomBug] = useState<CodeModChallenge>(() => generateRandomBugChallenge());
  const [challengeIdx, setChallengeIdx] = useState<number>(0);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [graded, setGraded] = useState<boolean>(false);
  const [revealed, setRevealed] = useState<boolean>(false);

  const allChallenges = useMemo(() => [...shuffled, randomBug], [shuffled, randomBug]);
  const challenge = allChallenges[challengeIdx];

  const selectChallenge = (idx: number) => {
    setChallengeIdx(idx);
    setInputs({});
    setGraded(false);
    setRevealed(false);
  };

  const newQuestion = () => {
    setShuffled(shuffle(CODE_MOD_CHALLENGES));
    setRandomBug(generateRandomBugChallenge());
    selectChallenge(0);
  };

  const results = useMemo(() => {
    const map: Record<string, SyncCellState> = {};
    let correctCount = 0;
    for (const b of challenge.blanks) {
      const raw = inputs[b.id] ?? '';
      const norm = normalizeCodeAns(raw);
      const isOk = b.acceptedNormalized.includes(norm);
      if (isOk) {
        map[b.id] = 'correct';
        correctCount++;
      } else if (!raw.trim()) {
        map[b.id] = 'empty';
      } else {
        map[b.id] = 'wrong';
      }
    }
    return {
      map,
      correctCount,
      total: challenge.blanks.length,
      percent: Math.round((correctCount / challenge.blanks.length) * 100),
    };
  }, [challenge, inputs]);

  const showAns = graded || revealed;

  return (
    <div className="space-y-6">
      {/* Challenge selector bar */}
      <div className="card space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">
            Written Exam Code Modification & Bug-Fix Challenges (Zero MCQs)
          </span>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400">
              Challenge {challengeIdx + 1} of {allChallenges.length}
            </span>
            <button
              onClick={newQuestion}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Shuffle className="h-3.5 w-3.5" /> New Question
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {allChallenges.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => selectChallenge(idx)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer text-left ${
                challengeIdx === idx
                  ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 bg-transparent border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              {idx + 1}. {stripNumber(c.title)}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-column layout: Dark IDE Given Code on left, Code-Writing & Trace Worksheet on right */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        <div className="lg:col-span-2 lg:sticky lg:top-3 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
              <Code2 className="h-4 w-4 text-indigo-500 dark:text-indigo-400" /> Given Algorithm / Code
            </h4>
            <span className={`${pill} bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20`}>
              {challenge.tag}
            </span>
          </div>

          <div className="rounded-xl bg-slate-950 border border-slate-700 font-mono text-[13px] text-slate-200 overflow-hidden">
            <div className="px-3.5 py-2.5 border-b border-slate-800 bg-slate-900">
              <div className="text-xs font-semibold text-slate-100">{challenge.givenCodeTitle}</div>
              <div className="text-[11px] text-slate-400 font-sans mt-0.5">{challenge.givenCodeSubtitle}</div>
            </div>
            <pre className="p-3.5 text-xs text-slate-200 overflow-x-auto leading-relaxed">{challenge.givenCode}</pre>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-5">
          {/* Prompt card */}
          <div className="card border-l-4 border-l-indigo-500 space-y-2">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{challengeIdx + 1}. {stripNumber(challenge.title)}</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{challenge.prompt}</p>
          </div>

          {/* Score banner when graded */}
          {graded && (
            <div
              className={`card border-l-4 flex flex-wrap items-center justify-between gap-4 ${
                results.percent >= 80 ? 'border-l-emerald-500' : 'border-l-rose-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <Trophy
                  className={`h-6 w-6 ${
                    results.percent >= 80 ? 'text-emerald-500' : 'text-rose-500'
                  }`}
                />
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Score: {results.correctCount} / {results.total} ({results.percent}%)
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {results.percent === 100
                      ? 'Perfect! Every code modification and trace answer is exact.'
                      : 'Review the highlighted fields and explanations below.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setGraded(false);
                  setRevealed(false);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Edit Answers
              </button>
            </div>
          )}

          {/* Code-writing & trace blanks */}
          <div className="card space-y-4">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
              <Wrench className="h-4 w-4 text-indigo-500 dark:text-indigo-400" /> Write Your Code Modifications & Trace Answers
            </h4>

            <div className="space-y-4">
              {challenge.blanks.map((b) => {
                const st = graded ? results.map[b.id] : undefined;
                return (
                  <div key={b.id} className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {b.label}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        disabled={graded}
                        value={inputs[b.id] ?? ''}
                        onChange={(e) => setInputs((prev) => ({ ...prev, [b.id]: e.target.value }))}
                        placeholder={genericPlaceholder(b)}
                        className={`${fieldClass} ${cellBorder(st)}`}
                      />
                      <CellIcon state={st} />
                    </div>
                    {showAns && (
                      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2.5 text-xs space-y-1">
                        <div>
                          <span className="text-slate-500">Expected: </span>
                          <code className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                            {b.displayAnswer}
                          </code>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{b.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              {!graded ? (
                <button
                  onClick={() => setGraded(true)}
                  className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  <Send className="h-4 w-4" /> Check My Code & Trace
                </button>
              ) : (
                <button
                  onClick={() => {
                    setGraded(false);
                    setRevealed(false);
                  }}
                  className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4" /> Try Again
                </button>
              )}

              <button
                onClick={() => setRevealed((r) => !r)}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-all cursor-pointer"
              >
                {showAns ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showAns ? 'Hide Model Solution' : 'Reveal Model Solution'}
              </button>
            </div>
          </div>

          {showAns && (
            <div className="card border-l-4 border-l-emerald-500 space-y-1.5">
              <div className="text-xs uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
                Core Exam Takeaway
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{challenge.takeaway}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const SyncModeQuiz: React.FC = () => {
  const [workbenchMode, setWorkbenchMode] = useState<QuizWorkbenchMode>('trace');
  const [sourceMode, setSourceMode] = useState<SourceMode>('random');
  const [topicId, setTopicId] = useState<string>(PRESET_TOPICS[0].topicId);
  const [presetId, setPresetId] = useState<string>(SYNC_SLIDE_PRESETS[0].id);
  const [randomStep, setRandomStep] = useState(true);

  const [quiz, setQuiz] = useState<SyncQuizChallenge>(() => generateSyncQuiz('RANDOM'));
  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [report, setReport] = useState<SyncQuizEvaluationReport | null>(null);
  const [revealed, setRevealed] = useState(false);

  const locked = report !== null;

  const generate = () => {
    let id: string | undefined;
    if (sourceMode === 'topic') id = topicId;
    else if (sourceMode === 'preset') id = presetId;
    else id = SYNC_SLIDE_PRESETS[Math.floor(Math.random() * SYNC_SLIDE_PRESETS.length)].id;

    const preset = SYNC_SLIDE_PRESETS.find((p) => p.id === id || p.topicId === id) ?? SYNC_SLIDE_PRESETS[0];
    const targetStepIndex = randomStep ? 1 + Math.floor(Math.random() * preset.steps.length) : undefined;

    setQuiz(generateSyncQuiz(preset.id, { targetStepIndex }));
    setAnswers(emptyAnswers());
    setReport(null);
    setRevealed(false);
  };

  const submit = () => {
    const sharedVariables: Record<string, string> = {};
    for (const [k, v] of Object.entries(answers.sharedVariables)) if (v.trim() !== '') sharedVariables[k] = v;
    const processStates: Record<string, string> = {};
    for (const [k, v] of Object.entries(answers.processStates)) if (v) processStates[k] = v;

    setReport(
      evaluateSyncQuiz(quiz, {
        processStates,
        sharedVariables,
        waitingQueue: answers.waitingQueue,
        criteria: answers.criteria,
      }),
    );
  };

  const tryAgain = () => {
    setReport(null);
    setRevealed(false);
  };

  const exp = quiz.expectedSubmission;
  const showSolution = revealed || locked;
  const answeredCount =
    Object.values(answers.processStates).filter(Boolean).length +
    Object.values(answers.sharedVariables).filter((v) => v.trim() !== '').length;

  // The variable that actually changed in the target step -> used to build a precise question.
  const changedVar = useMemo(() => {
    const prev =
      quiz.contextSteps.length > 0
        ? quiz.contextSteps[quiz.contextSteps.length - 1].sharedVariables
        : quiz.initialVariables;
    const entries = Object.entries(quiz.targetStep.sharedVariables).filter(([, v]) => String(v).trim() !== '');
    const hit = entries.find(([k, v]) => String(prev[k] ?? '') !== String(v));
    return hit ? hit[0] : entries[0]?.[0];
  }, [quiz]);

  const questionText = (
    <>
      Based on the algorithm shown on the left, trace <strong>Step {quiz.targetStepIndex}</strong>.{' '}
      <code className="font-mono text-indigo-600 dark:text-indigo-400">{quiz.targetStep.activeProcess}</code> has just
      executed{' '}
      <code className="font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100">
        {quiz.targetStep.codeLine}
      </code>
      .
      {changedVar && (
        <>
          {' '}
          For example: what is the value of <code className="font-mono text-indigo-600 dark:text-indigo-400">{changedVar}</code>{' '}
          after this instruction completes?
        </>
      )}{' '}
      Then fill in the full system state <strong>immediately after</strong> this instruction.
    </>
  );

  const tabBtn = (mode: SourceMode, label: string) => (
    <button
      onClick={() => setSourceMode(mode)}
      className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer ${
        sourceMode === mode
          ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
          : 'text-slate-600 dark:text-slate-400 bg-transparent border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/60'
      }`}
    >
      {label}
    </button>
  );

  const selectCls =
    'rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs text-slate-800 dark:text-slate-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/40';

  const primaryBtn =
    'inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold transition-all cursor-pointer';
  const ghostBtn =
    'inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-all cursor-pointer';

  return (
    <div className="space-y-6">
      {/* Top-level Exam Practice Mode Switcher */}
      <div className="card flex flex-wrap items-center justify-between gap-3 py-3">
        <div className="space-y-0.5">
          <div className="text-xs uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
            Synchronization Exam Practice Lab (No MCQs)
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Practice step-by-step code tracing, 3-criteria proofs, or written code modification & bug fixing.
          </p>
        </div>
        <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-900 p-1 gap-1">
          <button
            type="button"
            onClick={() => setWorkbenchMode('trace')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              workbenchMode === 'trace'
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            1. Step-by-Step Code Trace & Criteria
          </button>
          <button
            type="button"
            onClick={() => setWorkbenchMode('codemod')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              workbenchMode === 'codemod'
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            2. Code Modification & Bug-Fix Workbench
          </button>
        </div>
      </div>

      {workbenchMode === 'codemod' ? (
        <CodeModWorkbench />
      ) : (
        <>
          {/* Generator */}
          <div className="card space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">
            Practice Problem Generator
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">{quiz.slideReference}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {tabBtn('random', 'Random')}
          {tabBtn('topic', 'By Topic')}
          {tabBtn('preset', 'Slide Preset')}

          {sourceMode === 'topic' && (
            <select value={topicId} onChange={(e) => setTopicId(e.target.value)} className={selectCls}>
              {PRESET_TOPICS.map((t) => (
                <option key={t.topicId} value={t.topicId}>
                  {t.title}
                </option>
              ))}
            </select>
          )}
          {sourceMode === 'preset' && (
            <select value={presetId} onChange={(e) => setPresetId(e.target.value)} className={selectCls}>
              {SYNC_SLIDE_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          )}

          <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer ml-2">
            <input
              type="checkbox"
              checked={randomStep}
              onChange={(e) => setRandomStep(e.target.checked)}
              className="rounded accent-indigo-500 h-4 w-4"
            />
            <span>Random target step (otherwise final step)</span>
          </label>

          <button onClick={generate} className={`${primaryBtn} ml-auto`}>
            {sourceMode === 'random' ? <Shuffle className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
            Generate Problem
          </button>
        </div>
      </div>

      {/* Scenario */}
      <div className="card space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {quiz.title.replace(/^\d+\.\s*/, '')}
          </h3>
          <span className={`${pill} bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20`}>
            Predict Step {quiz.targetStepIndex} of {quiz.targetStep.totalSteps}
          </span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{quiz.description}</p>

        <div className="space-y-1.5">
          <span className="text-[11px] uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Variable className="h-3 w-3" /> Initial Shared Variables
          </span>
          <div className="flex flex-wrap gap-2">
            {Object.entries(quiz.initialVariables)
              .filter(([, v]) => String(v).trim() !== '')
              .map(([k, v]) => (
                <span
                  key={k}
                  className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 font-mono text-xs text-slate-700 dark:text-slate-300"
                >
                  {k} = <strong className="text-slate-900 dark:text-slate-100">{String(v)}</strong>
                </span>
              ))}
          </div>
        </div>
      </div>

      {/* Question + permanent algorithm panel */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        <div className="lg:col-span-2 lg:sticky lg:top-3 space-y-2">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
            <Code2 className="h-4 w-4 text-indigo-500 dark:text-indigo-400" /> Algorithm (given)
          </h4>
          <AlgorithmPanel presetId={quiz.presetId} step={quiz.targetStep} />
        </div>

        <div className="lg:col-span-3 space-y-6">
          {/* Question */}
          <div className="card border-l-4 border-l-indigo-500 space-y-2">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
              <HelpCircle className="h-4 w-4 text-indigo-500 dark:text-indigo-400" /> Question
            </h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{questionText}</p>
          </div>

          {/* Previous trace */}
          {quiz.contextSteps.length > 0 && (
            <details className="card group" open>
              <summary className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-800 dark:text-slate-100 select-none">
                <History className="h-4 w-4 text-slate-500" /> Execution So Far ({quiz.contextSteps.length} steps)
              </summary>
              <div className="space-y-2 mt-3">
                {quiz.contextSteps.map((s) => (
                  <div
                    key={s.stepIndex}
                    className="rounded-xl border border-slate-200 dark:border-slate-700/70 bg-slate-50 dark:bg-slate-900/40 p-3 space-y-2 text-xs"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-semibold text-slate-500">#{s.stepIndex}</span>
                      <span className={`${pill} bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20 font-mono`}>
                        {s.activeProcess}
                      </span>
                      <code className="font-mono text-slate-800 dark:text-slate-200 break-all">{s.codeLine}</code>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(s.processStates).map(([pid, st]) => (
                        <span key={pid} className={`${pill} ${STATE_BADGE[st]}`}>
                          {pid}: {st}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {Object.entries(s.sharedVariables)
                        .filter(([, v]) => String(v).trim() !== '')
                        .map(([k, v]) => {
                          const prev = quiz.contextSteps[s.stepIndex - 2]?.sharedVariables[k] ?? quiz.initialVariables[k];
                          const changed = String(prev ?? '') !== String(v);
                          return (
                            <span
                              key={k}
                              className={`px-1.5 py-0.5 rounded ${
                                changed
                                  ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold'
                                  : 'bg-slate-100 dark:bg-slate-800/60'
                              }`}
                            >
                              {k}={String(v)}
                            </span>
                          );
                        })}
                      {s.waitingQueue.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold">
                          blocked=[{s.waitingQueue.join(', ')}]
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{s.explanation}</p>
                  </div>
                ))}
              </div>
            </details>
          )}

          {/* Score banner */}
          {report && (
            <div
              className={`card border-l-4 space-y-4 ${
                report.passed ? 'border-l-emerald-500' : 'border-l-rose-500'
              }`}
            >
              <div className="flex flex-wrap items-center gap-4">
                <div
                  className={`flex items-center justify-center h-20 w-20 rounded-full border-4 font-semibold text-2xl ${
                    report.passed
                      ? 'border-emerald-500/60 text-emerald-600 dark:text-emerald-400'
                      : 'border-rose-500/60 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {report.percent}%
                </div>
                <div className="space-y-1 flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                    <Trophy className="h-4 w-4" />
                    Score: {report.score} / {report.maxScore}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{report.feedbackSummary}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {report.sections.map((s) => {
                  const pct = s.max ? (s.earned / s.max) * 100 : 0;
                  return (
                    <div key={s.label} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{s.label}</span>
                        <span className="font-mono text-slate-500">
                          {s.earned} / {s.max}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            pct >= 99.9 ? 'bg-emerald-500' : pct >= 50 ? 'bg-indigo-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Answer form */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="space-y-6">
              {/* Process states */}
              <div className="card space-y-3">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  <Cpu className="h-4 w-4 text-slate-500" /> Process States
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {quiz.processes.map((pid) => {
                    const st = report?.processStatesState[pid];
                    return (
                      <div key={pid} className="space-y-1">
                        <label className="text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-300">{pid}</label>
                        <div className="flex items-center gap-1.5">
                          <select
                            disabled={locked}
                            value={answers.processStates[pid] ?? ''}
                            onChange={(e) =>
                              setAnswers((a) => ({ ...a, processStates: { ...a.processStates, [pid]: e.target.value } }))
                            }
                            className={`${fieldClass} ${cellBorder(st)}`}
                          >
                            <option value="">— select —</option>
                            {PROCESS_STATES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          <CellIcon state={st} />
                        </div>
                        {showSolution && st !== 'correct' && (
                          <div className="text-[11px] text-slate-500">
                            Answer:{' '}
                            <span className={`${pill} ${STATE_BADGE[exp.processStates[pid] as ProcessState]}`}>
                              {exp.processStates[pid]}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Waiting queue */}
              <div className="card space-y-3">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  <Users className="h-4 w-4 text-slate-500" /> Blocked / Waiting Queue
                </h4>
                <div className="flex items-center gap-1.5">
                  <input
                    disabled={locked}
                    value={answers.waitingQueue}
                    onChange={(e) => setAnswers((a) => ({ ...a, waitingQueue: e.target.value }))}
                    placeholder="e.g. P0, P2 (blank if empty)"
                    className={`${fieldClass} ${cellBorder(report ? (report.waitingQueueOk ? 'correct' : 'wrong') : undefined)}`}
                  />
                  <CellIcon state={report ? (report.waitingQueueOk ? 'correct' : 'wrong') : undefined} />
                </div>
                {showSolution && !report?.waitingQueueOk && (
                  <div className="text-[11px] text-slate-500">
                    Answer:{' '}
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
                      {exp.waitingQueue.length ? exp.waitingQueue.join(', ') : '(empty)'}
                    </span>
                  </div>
                )}
              </div>

              {/* Criteria */}
              <div className="card space-y-3">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  <ShieldCheck className="h-4 w-4 text-slate-500" /> Critical Section Requirements
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Does <strong>{SYNC_ALGORITHMS_THEORY[quiz.topicId].title}</strong> satisfy each requirement?
                </p>
                <div className="space-y-3">
                  {(
                    [
                      ['mutualExclusion', 'Mutual Exclusion'],
                      ['progress', 'Progress'],
                      ['boundedWaiting', 'Bounded Waiting'],
                    ] as const
                  ).map(([key, label]) => {
                    const st = report?.criteriaState[key];
                    return (
                      <div key={key} className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{label}</label>
                        <div className="flex items-center gap-1.5">
                          <select
                            disabled={locked}
                            value={answers.criteria[key]}
                            onChange={(e) =>
                              setAnswers((a) => ({ ...a, criteria: { ...a.criteria, [key]: e.target.value } }))
                            }
                            className={`${fieldClass} ${cellBorder(st)}`}
                          >
                            <option value="">— select —</option>
                            {CRITERIA_OPTIONS.map((c) => (
                              <option key={c} value={c}>
                                {c.replace('_', ' ')}
                              </option>
                            ))}
                          </select>
                          <CellIcon state={st} />
                        </div>
                        {showSolution && st !== 'correct' && (
                          <div className="text-[11px] text-slate-500">
                            Answer:{' '}
                            <span className="font-semibold text-slate-700 dark:text-slate-200">
                              {String(exp.criteria[key]).replace('_', ' ')}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Shared variables */}
            <div className="card space-y-3 self-start">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                <Variable className="h-4 w-4 text-slate-500" /> Shared Variables
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.keys(exp.sharedVariables)
                  .filter((n) => String(exp.sharedVariables[n]).trim() !== '')
                  .map((name) => {
                    const st = report?.sharedVariablesState[name];
                    const expected = exp.sharedVariables[name];
                    return (
                      <div key={name} className="space-y-1">
                        <label className="text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-300 break-all">
                          {name}
                        </label>
                        <div className="flex items-center gap-1.5">
                          {typeof expected === 'boolean' ? (
                            <select
                              disabled={locked}
                              value={answers.sharedVariables[name] ?? ''}
                              onChange={(e) =>
                                setAnswers((a) => ({ ...a, sharedVariables: { ...a.sharedVariables, [name]: e.target.value } }))
                              }
                              className={`${fieldClass} ${cellBorder(st)}`}
                            >
                              <option value="">— select —</option>
                              <option value="true">true</option>
                              <option value="false">false</option>
                            </select>
                          ) : (
                            <input
                              disabled={locked}
                              value={answers.sharedVariables[name] ?? ''}
                              onChange={(e) =>
                                setAnswers((a) => ({ ...a, sharedVariables: { ...a.sharedVariables, [name]: e.target.value } }))
                              }
                              placeholder="value"
                              className={`${fieldClass} ${cellBorder(st)}`}
                            />
                          )}
                          <CellIcon state={st} />
                        </div>
                        {showSolution && st !== 'correct' && (
                          <div className="text-[11px] text-slate-500">
                            Answer:{' '}
                            <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
                              {String(expected)}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {!locked ? (
              <button onClick={submit} className={primaryBtn}>
                <Send className="h-4 w-4" /> Submit for Grading
              </button>
            ) : (
              <button onClick={tryAgain} className={primaryBtn}>
                <RefreshCw className="h-4 w-4" /> Try Again
              </button>
            )}
            <button
              onClick={() => setRevealed((r) => !r)}
              disabled={locked}
              className={`${ghostBtn} disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {revealed || locked ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {revealed ? 'Hide Solution' : 'Reveal Solution'}
            </button>
            <button onClick={generate} className={ghostBtn}>
              <Shuffle className="h-4 w-4" /> New Problem
            </button>
            {!locked && (
              <span className="text-xs text-slate-500 dark:text-slate-400 ml-auto">{answeredCount} fields answered</span>
            )}
          </div>

          {/* Diagnostics */}
          {report && report.diagnostics.length > 0 && (
            <div className="card border-l-4 border-l-amber-500/70 space-y-3">
              <div className="flex items-center gap-2 font-semibold text-sm text-slate-800 dark:text-slate-100">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <span>Diagnostic Feedback</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {report.diagnostics.map((d, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-slate-400 font-bold">&bull;</span>
                    <span className="leading-relaxed">{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Solution explanation */}
          {showSolution && (
            <div className="card border-l-4 border-l-emerald-500 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm text-slate-800 dark:text-slate-100">
                <Eye className="h-4 w-4 text-emerald-500" />
                <span>Solution Explanation (Step {quiz.targetStepIndex})</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{quiz.targetStep.explanation}</p>
              {quiz.targetStep.isViolation && quiz.targetStep.violationMessage && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{quiz.targetStep.violationMessage}</p>
              )}
            </div>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default SyncModeQuiz;
