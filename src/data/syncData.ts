/**
 * Process Synchronization Data & Knowledge Base for CPCS 361 (Operating Systems - I)
 * Faculty of Computing & Information Technology (FCIT), King Abdulaziz University (KAU)
 * Slide-aligned data based on lectures by Dr. Asaad Ahmed & Dr. Muhammad Umair Ramzan.
 */

// ============================================================================
// 1. TypeScript Interfaces & Types
// ============================================================================

import {
  PRODUCER_CONSUMER_SEMAPHORE_STEPS,
  READERS_WRITERS_STEPS,
  PETERSON_CONCURRENT_STEPS,
  BOUNDED_BUFFER_NO_COUNTER_STEPS,
  RACE_CONDITION_COUNTER_STEPS,
  STRICT_ALTERNATION_STEPS,
  PETERSON_SEQUENTIAL_STEPS,
  HARDWARE_TEST_AND_SET_STEPS,
  HARDWARE_SWAP_STEPS,
  STRICT_ALTERNATION_BUGGY_EXAM_STEPS,
  SEMAPHORE_REVERSED_DEADLOCK_STEPS,
} from './syncMicroSteps';

export type SyncTopicId =
  | 'race_condition'
  | 'critical_section_criteria'
  | 'strict_alternation'
  | 'petersons_algorithm'
  | 'hardware_test_and_set'
  | 'hardware_swap'
  | 'hardware_compare_and_swap'
  | 'hardware_n_process_bounded'
  | 'mutex_locks'
  | 'semaphores_concept'
  | 'semaphores_implementation'
  | 'producer_consumer_bounded'
  | 'readers_writers'
  | 'dining_philosophers';

export type ProcessState =
  | 'ENTRY'
  | 'CRITICAL'
  | 'EXIT'
  | 'REMAINDER'
  | 'BLOCKED'
  | 'WAITING';

export type CriteriaStatus = 'SATISFIED' | 'VIOLATED' | 'NOT_APPLICABLE' | 'PARTIAL';

export interface SyncVariable {
  name: string;
  type: string;
  scope: 'global' | 'local';
  initialValue: string | number | boolean;
  description: string;
}

export interface SyncCodeSection {
  title: string;
  process?: string;
  code: string;
  explanation: string;
}

export interface CriteriaEvaluation {
  mutualExclusion: {
    status: CriteriaStatus;
    justification: string;
  };
  progress: {
    status: CriteriaStatus;
    justification: string;
  };
  boundedWaiting: {
    status: CriteriaStatus;
    justification: string;
  };
}

export interface SyncAlgorithmTheory {
  id: SyncTopicId;
  title: string;
  category: 'Fundamentals' | 'Software Solution' | 'Hardware Solution' | 'OS Tool' | 'Classic Problem';
  concept: string;
  problemSolved: string;
  variables: SyncVariable[];
  codeSnippets: SyncCodeSection[];
  executionRules: string[];
  evaluation: CriteriaEvaluation;
  advantages: string[];
  disadvantages: string[];
  slideSolution?: string;
}

export interface SyncComparisonRow {
  id: string;
  name: string;
  category: 'Software' | 'Hardware' | 'OS Primitive' | 'Classic Paradigm';
  supportedProcesses: '2 Processes' | 'N Processes' | 'Multi-threaded';
  mutualExclusion: boolean;
  progress: boolean;
  boundedWaiting: boolean;
  waitingMechanism: 'Busy Waiting (Spinlock)' | 'Block & Wakeup (Queue)' | 'Both / Configurable';
  hardwareSupportRequired: boolean;
  deadlockRisk: 'None' | 'Low' | 'High (if misused)';
  starvationRisk: 'None' | 'Possible' | 'High';
  complexity: 'Low' | 'Medium' | 'High';
  recommendedUse: string;
}

export interface SlideTraceStep {
  stepIndex: number;
  timeInstant?: number;
  activeProcess: string;
  codeLine: string;
  /** Optional reference to a code-panel line (used by micro-step traces) */
  lineRef?: string;
  processStates: Record<string, ProcessState>;
  sharedVariables: Record<string, string | number | boolean>;
  registers?: Record<string, number | string>;
  waitingQueue?: string[];
  bufferState?: {
    slots: (string | null)[];
    inIndex: number;
    outIndex: number;
    count: number;
    size: number;
  };
  explanation: string;
  mathEval?: string;
  slideMilestone?: string;
  spinningProcesses?: string[];
  isViolation?: boolean;
  violationMessage?: string;
}

export interface SyncSlidePreset {
  id: string;
  title: string;
  topicId: SyncTopicId;
  description: string;
  slideReference: string;
  initialProcesses: string[];
  initialVariables: Record<string, string | number | boolean>;
  steps: SlideTraceStep[];
}

// ============================================================================
// 2. Comprehensive Theory & Knowledge Base (SYNC_ALGORITHMS_THEORY)
// ============================================================================

export const SYNC_ALGORITHMS_THEORY: Record<SyncTopicId, SyncAlgorithmTheory> = {
  race_condition: {
    id: 'race_condition',
    title: 'Race Condition & The Critical Section Problem',
    category: 'Fundamentals',
    concept:
      'Cooperating processes share system resources such as memory, files, or variables. A Race Condition occurs when multiple processes access and manipulate the exact same shared data concurrently, and the final outcome depends unpredictably on the order in which execution steps interleave.',
    problemSolved:
      'Identifies the fundamental concurrency hazard where unsynchronized read-modify-write sequences corrupt shared state (such as the producer-consumer counter).',
    variables: [
      {
        name: 'counter',
        type: 'integer',
        scope: 'global',
        initialValue: 3,
        description: 'Shared variable tracking the count of occupied buffer items.',
      },
      {
        name: 'register1',
        type: 'CPU register',
        scope: 'local',
        initialValue: 0,
        description: 'Local CPU register used by Producer to compute counter + 1.',
      },
      {
        name: 'register2',
        type: 'CPU register',
        scope: 'local',
        initialValue: 0,
        description: 'Local CPU register used by Consumer to compute counter - 1.',
      },
    ],
    codeSnippets: [
      {
        title: 'Producer Increment Assembly Translation',
        process: 'Producer',
        code: `// C code: counter++;
register1 = counter;
register1 = register1 + 1;
counter = register1;`,
        explanation: 'The high-level C statement counter++ decomposes into 3 non-atomic CPU instructions.',
      },
      {
        title: 'Consumer Decrement Assembly Translation',
        process: 'Consumer',
        code: `// C code: counter--;
register2 = counter;
register2 = register2 - 1;
counter = register2;`,
        explanation: 'The high-level C statement counter-- also decomposes into 3 non-atomic CPU instructions.',
      },
      {
        title: 'General Structure of Process P_i',
        process: 'P_i',
        code: `do {
    // [Entry Section] - Sets conditions and acquires permission
    
    /* Critical Section */ - Modifies shared variables/files/tables
    
    // [Exit Section] - Resets conditions and releases access
    
    /* Remainder Section */ - Non-shared, independent execution
} while (true);`,
        explanation: 'Every synchronized process is split into 4 canonical sections (Slide 3-4).',
      },
    ],
    executionRules: [
      'Each process has a critical section segment of code where common variables, tables, or files are updated.',
      'Only one process may execute inside its Critical Section at any given instant.',
      'When context-switch preempts a process midway through register operations, the final write overwrites the other process’s work.',
    ],
    evaluation: {
      mutualExclusion: {
        status: 'VIOLATED',
        justification:
          'Uncontrolled concurrent execution permits both producer and consumer to interleave writes to counter, corrupting value (e.g. counter becomes 4 or 2 instead of 3).',
      },
      progress: {
        status: 'NOT_APPLICABLE',
        justification: 'Without synchronization primitives, there is no coordination mechanism for entrance decisions.',
      },
      boundedWaiting: {
        status: 'NOT_APPLICABLE',
        justification: 'Processes do not queue or request permission; they race uncontrolled.',
      },
    },
    advantages: [
      'High theoretical concurrency when operations do not overlap.',
      'No locking overhead if data is truly independent.',
    ],
    disadvantages: [
      'Data inconsistency and silent corruption.',
      'Non-deterministic bugs that are extremely hard to reproduce and debug.',
    ],
    slideSolution:
      'Mutual exclusion mechanisms ensuring that when one process is in its critical section, no other process may enter.',
  },

  critical_section_criteria: {
    id: 'critical_section_criteria',
    title: 'The 3 Requirements for a Complete Solution',
    category: 'Fundamentals',
    concept:
      'According to OS principles (CPCS 361 Slides 5-7), any complete and correct solution to the Critical Section problem must satisfy three mandatory conditions simultaneously: Mutual Exclusion, Progress, and Bounded Waiting.',
    problemSolved: 'Establishes the criteria against which all synchronization algorithms are judged.',
    variables: [],
    codeSnippets: [
      {
        title: 'The Three Formal Criteria',
        code: `1. Mutual Exclusion:
   If process P_i is executing in its critical section, then no other processes
   can be executing in their critical sections.

2. Progress:
   If no process is executing in its critical section and there exist some
   processes that wish to enter their critical section, then the selection of
   the processes that will enter the critical section next cannot be postponed
   indefinitely, and only those processes that are NOT executing in their
   remainder section can participate in the decision.

3. Bounded Waiting:
   A bound must exist on the number of times that other processes are allowed
   to enter their critical sections after a process has made a request to enter
   its critical section and before that request is granted.`,
        explanation: 'All three conditions must be strictly satisfied for a valid algorithm (Slide 7).',
      },
    ],
    executionRules: [
      'Mutual Exclusion: strictly 1 process in CS at a time.',
      'Progress: decisions must be made without deadlock, and processes outside CS cannot block aspiring processes.',
      'Bounded Waiting: prevents starvation; guarantees eventual entry.',
    ],
    evaluation: {
      mutualExclusion: {
        status: 'SATISFIED',
        justification: 'Required by definition for any valid solution.',
      },
      progress: {
        status: 'SATISFIED',
        justification: 'Required to prevent deadlock and livelock in entering the critical section.',
      },
      boundedWaiting: {
        status: 'SATISFIED',
        justification: 'Required to eliminate indefinite blocking (starvation).',
      },
    },
    advantages: ['Guarantees mathematical correctness and safety of concurrent execution.'],
    disadvantages: ['Enforcing all 3 conditions simultaneously adds runtime coordination overhead.'],
  },

  strict_alternation: {
    id: 'strict_alternation',
    title: 'Strict Alternation (turn variable - 2 Processes)',
    category: 'Software Solution',
    concept:
      'A simple 2-process software attempt using a single shared integer variable `turn`. If `turn == 0`, P0 enters; if `turn == 1`, P1 enters. Upon exit, P0 sets `turn = 1` and P1 sets `turn = 0`.',
    problemSolved: 'Enforces Mutual Exclusion through strict turn-taking.',
    variables: [
      {
        name: 'turn',
        type: 'integer',
        scope: 'global',
        initialValue: 0,
        description: 'Indicates which process has the right to enter the critical section (0 for P_i, 1 for P_j).',
      },
      {
        name: 'i',
        type: 'integer',
        scope: 'local',
        initialValue: 0,
        description: 'Process identifier (0).',
      },
      {
        name: 'j',
        type: 'integer',
        scope: 'local',
        initialValue: 1,
        description: 'Other process identifier (1 - i).',
      },
    ],
    codeSnippets: [
      {
        title: 'Process P_i Protocol',
        process: 'P_i',
        code: `do {
    while (turn == j)
        ; /* busy wait / do nothing */
    
    <critical section>
    
    turn = j;
    
    <remainder section>
} while (true);`,
        explanation: 'P_i waits while turn is j, executes CS, then gives turn to j.',
      },
      {
        title: 'Process P_j Protocol',
        process: 'P_j',
        code: `do {
    while (turn == i)
        ; /* busy wait / do nothing */
    
    <critical section>
    
    turn = i;
    
    <remainder section>
} while (true);`,
        explanation: 'P_j waits while turn is i, executes CS, then gives turn to i.',
      },
    ],
    executionRules: [
      'Processes must strictly alternate turns: P0, P1, P0, P1...',
      'If P0 finishes its CS and enters its remainder section, turn becomes 1.',
      'If P0 needs to re-enter CS while P1 is busy in its remainder section, P0 is blocked indefinitely even though the CS is empty!',
    ],
    evaluation: {
      mutualExclusion: {
        status: 'SATISFIED',
        justification:
          'turn cannot simultaneously equal 0 and 1; thus both processes cannot be in CS together (Slide 14-34 proves ME holds).',
      },
      progress: {
        status: 'VIOLATED',
        justification:
          'Fails Progress! A process executing in its remainder section (e.g. P1) prevents the other process (P0) from entering CS because turn is not handed back (Slide 36-39). Selection is postponed indefinitely.',
      },
      boundedWaiting: {
        status: 'SATISFIED',
        justification: 'When alternating, each process waits at most 1 turn of the other process.',
      },
    },
    advantages: ['Very simple to implement in software.', 'Guarantees Mutual Exclusion.'],
    disadvantages: [
      'Violates Progress: requires strict rigid alternation.',
      'If one process is slower or terminates in its remainder section, the other is permanently locked out.',
      'Employs busy waiting (wasteful CPU spinning).',
    ],
    slideSolution: 'Peterson’s Solution, which incorporates process willingness via flag[].',
  },

  petersons_algorithm: {
    id: 'petersons_algorithm',
    title: 'Peterson’s Solution (2 Processes)',
    category: 'Software Solution',
    concept:
      'Classic software-based solution for two processes (P_i and P_j) proposed by G. L. Peterson in 1981. It combines a shared `turn` variable (who has the turn) with a shared boolean array `flag[2]` (who is willing / ready to enter).',
    problemSolved:
      'Completely solves the Critical Section problem for 2 processes by satisfying Mutual Exclusion, Progress, and Bounded Waiting without requiring strict alternation.',
    variables: [
      {
        name: 'flag',
        type: 'boolean[2]',
        scope: 'global',
        initialValue: '[false, false]',
        description: 'flag[i] = true indicates process P_i is willing to enter its critical section.',
      },
      {
        name: 'turn',
        type: 'integer',
        scope: 'global',
        initialValue: 0,
        description: 'Determines whose turn it is when both processes want to enter simultaneously.',
      },
      {
        name: 'i, j',
        type: 'integer',
        scope: 'local',
        initialValue: 'i=0, j=1',
        description: 'Process index i and complementary peer index j = 1 - i.',
      },
    ],
    codeSnippets: [
      {
        title: 'Peterson’s Algorithm for Process P_i',
        process: 'P_i',
        code: `do {
    flag[i] = true;
    turn = j;
    while (flag[j] && turn == j)
        ; /* busy wait / spin */
        
    /* critical section */
    
    flag[i] = false;
    
    /* remainder section */
} while (true);`,
        explanation:
          'Process raises its willingness flag, generously sets turn to the other process, and waits only if peer is also willing AND turn is peer (Slide 49-63).',
      },
      {
        title: 'Peterson’s Algorithm for Process P_j',
        process: 'P_j',
        code: `do {
    flag[j] = true;
    turn = i;
    while (flag[i] && turn == i)
        ; /* busy wait / spin */
        
    /* critical section */
    
    flag[j] = false;
    
    /* remainder section */
} while (true);`,
        explanation: 'P_j executes the symmetric protocol with indices flipped.',
      },
    ],
    executionRules: [
      'P_i declares intent by setting flag[i] = true.',
      'P_i gives precedence to peer by setting turn = j.',
      'If both processes set flag=true at the same instant, the final value of turn is decisive: only one assignment to turn survives.',
      'A process exiting resets flag[i] = false, immediately unblocking the waiting peer.',
    ],
    evaluation: {
      mutualExclusion: {
        status: 'SATISFIED',
        justification:
          'To enter CS, P_i needs (flag[j] == false || turn == i). Since turn cannot be both i and j at the same time, simultaneous entry is impossible (Slide 49-63 & 79-86 prove ME holds in both sequential and concurrent cases).',
      },
      progress: {
        status: 'SATISFIED',
        justification:
          'If P_j is in its remainder section, flag[j] == false, so P_i enters CS immediately without waiting. Selection cannot be postponed indefinitely (Slide 69-78 & 92-101).',
      },
      boundedWaiting: {
        status: 'SATISFIED',
        justification:
          'When P_i waits, P_j can enter at most ONCE before resetting flag[j]=false. If P_j tries to re-enter, it sets turn=i, allowing P_i to enter next. Bound = 1 (Slide 64-68 & 87-91).',
      },
    },
    advantages: [
      'Complete, mathematically proven software solution for Critical Section problem.',
      'Can be implemented within OS user routines without special OS system calls.',
      'Works even on simple hardware lacking atomic synchronization instructions.',
    ],
    disadvantages: [
      'Valid for two processes only; does not directly scale to n processes.',
      'Employs busy waiting (spinlock): burns CPU cycles while spinning in the while loop.',
      'Modern out-of-order CPUs and optimizing compilers may reorder load/store operations, breaking Peterson’s solution unless memory barriers are used.',
      'Does not guarantee fairness if CPU reordering occurs.',
    ],
    slideSolution: 'Hardware synchronization instructions (test_and_set, swap, compare_and_swap).',
  },

  hardware_test_and_set: {
    id: 'hardware_test_and_set',
    title: 'Hardware Atomic Instruction: test_and_set (2 Processes)',
    category: 'Hardware Solution',
    concept:
      'Special atomic instruction executed by hardware with interrupts disabled at CPU cycle level. It returns the original value of the boolean target while setting the target to TRUE in a single, non-interruptible step.',
    problemSolved:
      'Eliminates race conditions during lock acquisition by guaranteeing hardware atomicity across CPU cores.',
    variables: [
      {
        name: 'lock',
        type: 'boolean',
        scope: 'global',
        initialValue: false,
        description: 'Global lock variable; false = unlocked/available, true = locked.',
      },
      {
        name: 'target',
        type: 'boolean*',
        scope: 'local',
        initialValue: false,
        description: 'Memory pointer to lock passed into test_and_set.',
      },
      {
        name: 'rv',
        type: 'boolean',
        scope: 'local',
        initialValue: false,
        description: 'Return value containing previous state of target before setting.',
      },
    ],
    codeSnippets: [
      {
        title: 'Definition of test_and_set (Executed Atomically by Hardware)',
        code: `boolean test_and_set (boolean *target) {
    boolean rv = *target;
    *target = TRUE;
    return rv;
}`,
        explanation: 'Executed atomically: non-interruptible, never executes simultaneously on multi-cores (Slide 109-110).',
      },
      {
        title: 'Mutual Exclusion with test_and_set',
        process: 'P_i',
        code: `do {
    while (test_and_set(&lock))
        ; /* busy wait / spin */
        
    /* critical section */
    
    lock = false;
    
    /* remainder section */
} while (true);`,
        explanation:
          'First process gets rv=false and exits loop (lock becomes true). Second process gets rv=true and spins (Slide 111-121).',
      },
    ],
    executionRules: [
      'If lock is false: test_and_set(&lock) sets lock=true and returns false (loop exits, process enters CS).',
      'If lock is already true: test_and_set(&lock) keeps lock=true and returns true (process spins).',
      'Exiting process resets lock = false.',
    ],
    evaluation: {
      mutualExclusion: {
        status: 'SATISFIED',
        justification:
          'Only one process can receive false from test_and_set at a time; subsequent callers receive true until lock is released (Slide 111-121).',
      },
      progress: {
        status: 'SATISFIED',
        justification:
          'When lock is false, the next caller immediately acquires it. No process in remainder section can block aspiring processes (Slide 130-138).',
      },
      boundedWaiting: {
        status: 'VIOLATED',
        justification:
          'The simple 2-process loop does NOT guarantee bounded waiting if extended to multiple processes; arbitrary spinning can starve a waiting process.',
      },
    },
    advantages: [
      'Simple, robust hardware-supported mutual exclusion.',
      'Works seamlessly on multiprocessor architectures.',
    ],
    disadvantages: [
      'Busy waiting consumes processor power.',
      'Does not satisfy bounded waiting in its simple form.',
    ],
    slideSolution:
      'Use the n-process bounded-waiting algorithm with waiting[] array and cyclic search.',
  },

  hardware_swap: {
    id: 'hardware_swap',
    title: 'Hardware Atomic Instruction: Swap (2 Processes)',
    category: 'Hardware Solution',
    concept:
      'An atomic hardware instruction that interchanges the contents of two memory words in a single indivisible operation. Used with a global `lock` and a process-local `key` to implement mutual exclusion.',
    problemSolved: 'Provides atomic locking via variable exchange instead of test-and-set.',
    variables: [
      {
        name: 'lock',
        type: 'boolean',
        scope: 'global',
        initialValue: false,
        description: 'Global lock variable; false = free, true = acquired.',
      },
      {
        name: 'key',
        type: 'boolean',
        scope: 'local',
        initialValue: true,
        description: 'Process-local key variable; initialized to true before acquiring lock.',
      },
    ],
    codeSnippets: [
      {
        title: 'Definition of Swap Instruction',
        code: `void Swap (boolean *a, boolean *b) {
    boolean temp = *a;
    *a = *b;
    *b = temp;
}`,
        explanation: 'Executed atomically by CPU hardware (Slide 151-152).',
      },
      {
        title: 'Mutual Exclusion with Swap',
        process: 'P_i',
        code: `do {
    key = TRUE;
    while (key == TRUE)
        Swap(&lock, &key);
        
    /* critical section */
    
    lock = FALSE;
    
    /* remainder section */
} while (TRUE);`,
        explanation:
          'When lock is false, Swap exchanges key=true with lock=false, so key becomes false (loop terminates) and lock becomes true (Slide 153-165).',
      },
    ],
    executionRules: [
      'Process sets local key = true.',
      'Repeatedly swaps global lock and local key until key becomes false (meaning it obtained lock=false).',
      'Upon exit, resets global lock = false.',
    ],
    evaluation: {
      mutualExclusion: {
        status: 'SATISFIED',
        justification:
          'Only one process can extract the false value from lock; the other process keeps swapping key=true with lock=true (Slide 165 proves ME holds).',
      },
      progress: {
        status: 'SATISFIED',
        justification:
          'When lock is false, the very next Swap call will immediately capture it and allow entry (Slide 172-185).',
      },
      boundedWaiting: {
        status: 'VIOLATED',
        justification:
          'Process scheduling between competing processes is non-deterministic; a process may continually lose the race to swap, causing starvation.',
      },
    },
    advantages: ['Simple exchange mechanism; easy to implement in microcode.'],
    disadvantages: ['Busy waiting / spinlock; does not guarantee bounded waiting.'],
    slideSolution: 'N-process bounded waiting algorithm.',
  },

  hardware_compare_and_swap: {
    id: 'hardware_compare_and_swap',
    title: 'Hardware Atomic Instruction: compare_and_swap',
    category: 'Hardware Solution',
    concept:
      'Hardware atomic instruction that compares the memory word `*value` to an `expected` value. If they are equal, it updates `*value` to `new_value`. In all cases, it returns the original value of `*value`.',
    problemSolved: 'Atomic conditional update used extensively in modern lock-free data structures.',
    variables: [
      {
        name: 'lock',
        type: 'integer',
        scope: 'global',
        initialValue: 0,
        description: 'Global lock variable; 0 = unlocked, 1 = locked.',
      },
    ],
    codeSnippets: [
      {
        title: 'Definition of compare_and_swap',
        code: `int compare_and_swap(int *value, int expected, int new_value) {
    int temp = *value;
    if (*value == expected)
        *value = new_value;
    return temp;
}`,
        explanation: 'Executed atomically by CPU (Slide 233).',
      },
      {
        title: 'Mutual Exclusion with compare_and_swap',
        code: `do {
    while (compare_and_swap(&lock, 0, 1) != 0)
        ; /* do nothing / busy wait */
        
    /* critical section */
    
    lock = 0;
    
    /* remainder section */
} while (true);`,
        explanation:
          'If lock is 0 (expected), it is atomically changed to 1 and returns 0 (loop ends). If lock is 1, return value is 1 != 0, so caller spins.',
      },
    ],
    executionRules: [
      'compare_and_swap(&lock, 0, 1) succeeds only when lock is 0.',
      'Process releases the lock with lock = 0 in exit section.',
    ],
    evaluation: {
      mutualExclusion: {
        status: 'SATISFIED',
        justification: 'Only one process can observe lock == 0 and atomically set it to 1.',
      },
      progress: {
        status: 'SATISFIED',
        justification: 'When lock is reset to 0, an aspiring process will immediately succeed.',
      },
      boundedWaiting: {
        status: 'VIOLATED',
        justification:
          'As noted in Slide 234 question: Does not ensure bounded waiting because an unlucky process might starve while others repeatedly grab the lock.',
      },
    },
    advantages: ['Foundation for atomic operations and lock-free algorithms in modern kernels.'],
    disadvantages: ['Busy waiting; lacks fairness / bounded waiting without queuing structures.'],
  },

  hardware_n_process_bounded: {
    id: 'hardware_n_process_bounded',
    title: 'N-Processes Bounded-Waiting Hardware Solution',
    category: 'Hardware Solution',
    concept:
      'Sophisticated algorithm for n processes ($P_0 \dots P_{n-1}$) using `test_and_set`. It maintains a global boolean array `waiting[n]` and uses a cyclic round-robin scan `j = (i + 1) % n` upon exit to grant direct entry to the next waiting process.',
    problemSolved:
      'Solves the starvation problem of basic hardware instructions, guaranteeing all 3 requirements: Mutual Exclusion, Progress, AND Bounded Waiting for n processes.',
    variables: [
      {
        name: 'lock',
        type: 'boolean',
        scope: 'global',
        initialValue: false,
        description: 'Global lock variable; initially false.',
      },
      {
        name: 'waiting',
        type: 'boolean[n]',
        scope: 'global',
        initialValue: 'all false',
        description: 'waiting[i] = true indicates process P_i is waiting to enter CS.',
      },
      {
        name: 'key',
        type: 'boolean',
        scope: 'local',
        initialValue: true,
        description: 'Local boolean key variable per process.',
      },
      {
        name: 'j',
        type: 'integer',
        scope: 'local',
        initialValue: 0,
        description: 'Local integer used to cyclically scan for waiting processes.',
      },
    ],
    codeSnippets: [
      {
        title: 'N-Processes Bounded-Waiting Algorithm',
        code: `do {
    waiting[i] = true;
    key = true;
    while (waiting[i] && key)
        key = test_and_set(&lock);
    waiting[i] = false;
    
    /* critical section */
    
    j = (i + 1) % n;
    while ((j != i) && !waiting[j])
        j = (j + 1) % n;
        
    if (j == i)
        lock = false;
    else
        waiting[j] = false;
        
    /* remainder section */
} while (true);`,
        explanation:
          'If another process is waiting (waiting[j]==true), the exiting process directly clears waiting[j]=false, letting P_j enter without opening the lock to competitors! (Slide 188-231).',
      },
    ],
    executionRules: [
      'P_i announces intent: waiting[i] = true and key = true.',
      'Only the process that gets key=false (or whose waiting[i] is cleared by predecessor) enters CS.',
      'Upon exit, P_i scans circularly: j = (i+1)%n, (i+2)%n... up to i.',
      'If another waiting process P_j is found, P_i sets waiting[j] = false (direct handoff, lock stays true).',
      'If no process is waiting (j == i), P_i sets lock = false.',
    ],
    evaluation: {
      mutualExclusion: {
        status: 'SATISFIED',
        justification:
          'A process can enter CS only if waiting[i]==false or key==false. test_and_set provides mutual exclusion initially, and direct handoff preserves it (Slide 191-203 proves ME holds).',
      },
      progress: {
        status: 'SATISFIED',
        justification:
          'If no one is waiting, lock is set to false, allowing immediate entry for new arrivals. Remainder processes never block active processes (Slide 219-231).',
      },
      boundedWaiting: {
        status: 'SATISFIED',
        justification:
          'Cyclic scan guarantees that any waiting process will be visited within at most n - 1 turns of other processes. Starvation is impossible (Slide 204-218).',
      },
    },
    advantages: [
      'Satisfies ALL THREE conditions (Mutual Exclusion, Progress, Bounded Waiting) for N processes.',
      'Direct handoff avoids thundering-herd lock contention.',
    ],
    disadvantages: [
      'Still employs busy waiting while in the entry while-loop.',
      'Requires maintaining a fixed-size array waiting[n].',
    ],
  },

  mutex_locks: {
    id: 'mutex_locks',
    title: 'Mutex Locks & Spinlocks',
    category: 'OS Tool',
    concept:
      'Previous hardware and software solutions are complicated and inaccessible to application programmers. OS designers provide higher-level software tools; the simplest is the Mutex Lock. It protects a critical section by first `acquire()` a lock then `release()` the lock.',
    problemSolved: 'Provides a clean, standardized programming abstraction for mutual exclusion.',
    variables: [
      {
        name: 'available',
        type: 'boolean',
        scope: 'global',
        initialValue: true,
        description: 'Indicates if lock is available (true) or occupied (false).',
      },
    ],
    codeSnippets: [
      {
        title: 'acquire() and release() Operations',
        code: `acquire() {
    while (!available)
        ; /* busy wait / spin */
    available = false;
}

release() {
    available = true;
}`,
        explanation: 'Calls to acquire() and release() must be atomic (Slide 11-12).',
      },
      {
        title: 'Process P Protecting Critical Section',
        code: `do {
    acquire lock
        critical section
    release lock
        remainder section
} while (true);`,
        explanation: 'Standardized mutex protocol pattern (Slide 12).',
      },
      {
        title: 'POSIX Pthreads Mutex in C (Slide 13)',
        code: `#include <stdio.h>
#include <pthread.h>

int counter = 0;
pthread_mutex_t mutex = PTHREAD_MUTEX_INITIALIZER;

void* increment_counter(void* arg) {
    for (int i = 0; i < 100000; ++i) {
        pthread_mutex_lock(&mutex);   // acquire
        counter++;
        pthread_mutex_unlock(&mutex); // release
    }
    return NULL;
}`,
        explanation: 'Real C implementation preventing race condition on counter (Slide 13).',
      },
    ],
    executionRules: [
      'A process must call acquire() before entering its critical section.',
      'If lock is unavailable, process loops in busy waiting (Spinlock).',
      'The process must call release() immediately after finishing its critical section.',
    ],
    evaluation: {
      mutualExclusion: {
        status: 'SATISFIED',
        justification: 'The available boolean is atomically toggled so only 1 caller holds it.',
      },
      progress: {
        status: 'SATISFIED',
        justification: 'When released, available=true immediately allows an aspiring thread to enter.',
      },
      boundedWaiting: {
        status: 'PARTIAL',
        justification: 'Depends on underlying OS scheduler; standard spinlocks do not strictly order waiters.',
      },
    },
    advantages: [
      'Simple, clean API for application programmers.',
      'Spinlocks are fast when critical sections are very short (avoids context switch overhead).',
    ],
    disadvantages: [
      'Busy waiting (spinlock) wastes CPU cycles on uniprocessors.',
      'Potential priority inversion if low-priority thread holds lock.',
    ],
    slideSolution: 'Semaphores with blocking waiting queues.',
  },

  semaphores_concept: {
    id: 'semaphores_concept',
    title: 'Semaphores (Counting vs. Binary & Usage)',
    category: 'OS Tool',
    concept:
      'A semaphore S is an integer variable that, apart from initialization, is accessed only through two standard atomic operations: wait() and signal() [originally called P() from Dutch proberen "to test" and V() from verhogen "to increment"].',
    problemSolved:
      'More sophisticated synchronization tool than mutex locks, supporting both mutual exclusion and generalized ordering/coordination.',
    variables: [
      {
        name: 'S',
        type: 'integer',
        scope: 'global',
        initialValue: 1,
        description: 'Semaphore integer variable.',
      },
    ],
    codeSnippets: [
      {
        title: 'Classical Busy-Waiting Definition of wait() and signal()',
        code: `wait(S) {
    while (S <= 0)
        ; // busy wait
    S--;
}

signal(S) {
    S++;
}`,
        explanation: 'All modifications to S must be executed atomically and indivisibly (Slide 14-16).',
      },
      {
        title: 'Semaphore Usage 1: Synchronization (S1 before S2)',
        code: `// Create semaphore "synch" initialized to 0
// We require statement S1 in P1 to happen BEFORE statement S2 in P2

P1:
    S1;
    signal(synch);

P2:
    wait(synch);
    S2;`,
        explanation: 'P2 cannot proceed past wait(synch) until P1 executes S1 and signals synch (Slide 21-26).',
      },
      {
        title: 'Semaphore Usage 2: Mutual Exclusion (mutex = 1)',
        code: `// Semaphore mutex initialized to 1
do {
    wait(mutex);
        <Critical Section>
    signal(mutex);
        <Remainder Section>
} while (TRUE);`,
        explanation: 'Binary semaphore acting as a mutual exclusion lock (Slide 27-30).',
      },
    ],
    executionRules: [
      'Counting Semaphore: integer value can range over an unrestricted domain (used for resource allocation).',
      'Binary Semaphore: integer value can range only between 0 and 1 (acts as a mutex lock).',
      'Can implement a counting semaphore using binary semaphores (Slide 20).',
    ],
    evaluation: {
      mutualExclusion: {
        status: 'SATISFIED',
        justification: 'When initialized to 1, provides mutual exclusion for critical sections.',
      },
      progress: {
        status: 'SATISFIED',
        justification: 'signal() increments semaphore, permitting waiting processes to progress.',
      },
      boundedWaiting: {
        status: 'PARTIAL',
        justification: 'Busy-waiting semaphores do not guarantee bounded waiting without a FIFO queue.',
      },
    },
    advantages: [
      'Versatile: supports synchronization, counting multiple resource instances, and mutual exclusion.',
    ],
    disadvantages: [
      'Busy waiting in classical definition wastes CPU (Slide 33).',
      'Deadlock risk if semaphores acquired in reverse order (e.g. P0: wait(S); wait(Q); vs P1: wait(Q); wait(S); Slide 31).',
      'Starvation (indefinite blocking): process may never be removed from wait (Slide 32).',
    ],
    slideSolution: 'Semaphore implementation with a waiting queue and block()/wakeup() operations.',
  },

  semaphores_implementation: {
    id: 'semaphores_implementation',
    title: 'Semaphore Implementation with Waiting Queue (No Busy Waiting)',
    category: 'OS Tool',
    concept:
      'To overcome busy waiting, the OS associates a Waiting Queue with each semaphore. Instead of looping, a process that finds S <= 0 blocks itself and sleeps on the queue. When another process signals the semaphore, a waiting process is awakened and placed in the Ready Queue.',
    problemSolved: 'Eliminates CPU-wasting busy waiting (spinlocks) in semaphore operations.',
    variables: [
      {
        name: 'value',
        type: 'integer',
        scope: 'global',
        initialValue: 1,
        description: 'Semaphore integer value. If negative, |value| equals number of waiting processes on the list.',
      },
      {
        name: 'list',
        type: 'process*',
        scope: 'global',
        initialValue: 'null',
        description: 'Linked list / FIFO queue of blocked processes waiting for this semaphore.',
      },
    ],
    codeSnippets: [
      {
        title: 'Semaphore Data Structure & Block/Wakeup Operations (Slide 42-44)',
        code: `typedef struct {
    int value;
    struct process *list;
} semaphore;

wait(semaphore *S) {
    S->value--;
    if (S->value < 0) {
        add this process to S->list;
        block();
    }
}

signal(semaphore *S) {
    S->value++;
    if (S->value <= 0) {
        remove a process P from S->list;
        wakeup(P);
    }
}`,
        explanation:
          'block() suspends the calling process and places it on the waiting queue; wakeup(P) moves P to the ready queue (Slide 39-44).',
      },
    ],
    executionRules: [
      'S->value is decremented FIRST in wait(): if value < 0, process is added to S->list and blocked.',
      'S->value is incremented FIRST in signal(): if value <= 0 (meaning someone was waiting), a process is removed from S->list and awakened.',
      'If S->value is -3, exactly 3 processes are currently suspended in S->list.',
    ],
    evaluation: {
      mutualExclusion: {
        status: 'SATISFIED',
        justification: 'Atomicity of wait and signal is protected by OS scheduler/interrupt masking.',
      },
      progress: {
        status: 'SATISFIED',
        justification: 'A signaling process directly reactivates waiting processes.',
      },
      boundedWaiting: {
        status: 'SATISFIED',
        justification: 'If the waiting queue list is managed in FIFO order, bounded waiting is guaranteed.',
      },
    },
    advantages: [
      'NO BUSY WAITING: blocked processes sleep and yield the CPU to ready threads.',
      'Negative value directly reveals the exact number of blocked processes waiting on the semaphore.',
    ],
    disadvantages: [
      'Overhead of process context switching and maintaining queue structures.',
    ],
  },

  producer_consumer_bounded: {
    id: 'producer_consumer_bounded',
    title: 'Classic Problem: Bounded-Buffer Producer-Consumer',
    category: 'Classic Problem',
    concept:
      'A producer process produces information placed into a bounded buffer of size n. A consumer process consumes information from the buffer. Both may execute concurrently. Three semaphores coordinate access: `mutex` (mutual exclusion), `empty` (counts empty buffer slots), and `full` (counts filled buffer slots).',
    problemSolved:
      'Solves the race condition on shared buffer and ensures producer stops when buffer is full and consumer stops when buffer is empty.',
    variables: [
      {
        name: 'mutex',
        type: 'semaphore',
        scope: 'global',
        initialValue: 1,
        description: 'Binary semaphore providing mutual exclusion for buffer insertion/removal.',
      },
      {
        name: 'empty',
        type: 'semaphore',
        scope: 'global',
        initialValue: 'n',
        description: 'Counting semaphore tracking available empty slots (initialized to n).',
      },
      {
        name: 'full',
        type: 'semaphore',
        scope: 'global',
        initialValue: 0,
        description: 'Counting semaphore tracking occupied filled slots (initialized to 0).',
      },
      {
        name: 'in, out',
        type: 'integer',
        scope: 'global',
        initialValue: 0,
        description: 'Circular buffer pointers: in for next write, out for next read.',
      },
    ],
    codeSnippets: [
      {
        title: 'Producer Code (Slide 49)',
        process: 'Producer',
        code: `do {
    ...
    /* produce an item in next_produced */
    ...
    wait(empty);
    wait(mutex);
    ...
    /* add next_produced to the buffer */
    ...
    signal(mutex);
    signal(full);
} while (true);`,
        explanation: 'Waits for an empty slot, locks buffer, inserts item, unlocks buffer, and signals full slot.',
      },
      {
        title: 'Consumer Code (Slide 50)',
        process: 'Consumer',
        code: `do {
    wait(full);
    wait(mutex);
    ...
    /* remove an item from buffer */
    ...
    signal(mutex);
    signal(empty);
    ...
    /* consume the item */
    ...
} while (true);`,
        explanation: 'Waits for a full slot, locks buffer, removes item, unlocks buffer, and signals empty slot.',
      },
    ],
    executionRules: [
      'If buffer is full (empty == 0), Producer blocks on wait(empty).',
      'If buffer is empty (full == 0), Consumer blocks on wait(full).',
      'The lock order MUST be wait(empty/full) then wait(mutex); reversing causes deadlock!',
    ],
    evaluation: {
      mutualExclusion: {
        status: 'SATISFIED',
        justification: 'The mutex semaphore ensures only 1 process touches the buffer at any instant (Slide 53-77).',
      },
      progress: {
        status: 'SATISFIED',
        justification: 'Buffer slots are immediately available for consumption or production.',
      },
      boundedWaiting: {
        status: 'SATISFIED',
        justification: 'FIFO semaphore queue prevents either process from being starved.',
      },
    },
    advantages: [
      'Allows all n buffer slots to be used (unlike circular array in/out without semaphores which only held n - 1).',
      'Producer and consumer run at independent speeds, synchronized safely.',
    ],
    disadvantages: [
      'Reversing wait(mutex) and wait(empty) causes permanent deadlock when buffer is full.',
    ],
  },

  readers_writers: {
    id: 'readers_writers',
    title: 'Classic Problem: Readers-Writers Problem',
    category: 'Classic Problem',
    concept:
      'A dataset is shared among concurrent processes. Readers only read and never update data; Writers can both read and write. Multiple readers may read simultaneously, but only ONE writer may access the shared data exclusively. If a writer is active, no reader may read; if a reader is active, no writer may write.',
    problemSolved:
      'Coordinates shared database access prioritizing concurrent reads while guaranteeing exclusive writes.',
    variables: [
      {
        name: 'rw_mutex',
        type: 'semaphore',
        scope: 'global',
        initialValue: 1,
        description: 'Semaphore common to both reader and writer; provides mutual exclusion for writers.',
      },
      {
        name: 'mutex',
        type: 'semaphore',
        scope: 'global',
        initialValue: 1,
        description: 'Mutex semaphore protecting updates to read_count.',
      },
      {
        name: 'read_count',
        type: 'integer',
        scope: 'global',
        initialValue: 0,
        description: 'Counts how many readers are currently reading the dataset.',
      },
    ],
    codeSnippets: [
      {
        title: 'Writer Process (Slide 17)',
        process: 'Writer',
        code: `do {
    wait(rw_mutex);
    ...
    /* writing is performed */
    ...
    signal(rw_mutex);
} while (true);`,
        explanation: 'Writer simply requests exclusive lock via rw_mutex.',
      },
      {
        title: 'Reader Process (Slide 18)',
        process: 'Reader',
        code: `do {
    wait(mutex);
    read_count++;
    if (read_count == 1)
        wait(rw_mutex);
    signal(mutex);
    ...
    /* reading is performed */
    ...
    wait(mutex);
    read_count--;
    if (read_count == 0)
        signal(rw_mutex);
    signal(mutex);
} while (true);`,
        explanation:
          'First reader to arrive locks rw_mutex on behalf of all readers; last reader to leave releases rw_mutex.',
      },
    ],
    executionRules: [
      'If a writer has rw_mutex, all subsequent readers wait on rw_mutex (Slide 21-48).',
      'If at least one reader is active, subsequent readers enter immediately by incrementing read_count.',
      'First Variation: no reader kept waiting unless writer has permission. Problem: Writers may face starvation!',
      'Second Variation: once writer is ready, it writes ASAP. Problem: Readers may face starvation! (Slide 19).',
    ],
    evaluation: {
      mutualExclusion: {
        status: 'SATISFIED',
        justification: 'Writers have exclusive access; readers never read while writing occurs.',
      },
      progress: {
        status: 'SATISFIED',
        justification: 'When dataset is free, arriving reader or writer can enter.',
      },
      boundedWaiting: {
        status: 'VIOLATED',
        justification: 'In First Variation, a continuous stream of readers starves waiting writers indefinitely.',
      },
    },
    advantages: ['Maximizes concurrency by allowing multiple readers simultaneously.'],
    disadvantages: ['Starvation of writers (Variation 1) or starvation of readers (Variation 2).'],
    slideSolution: 'Operating systems kernel reader-writer locks (Slide 19).',
  },

  dining_philosophers: {
    id: 'dining_philosophers',
    title: 'Classic Problem: Dining-Philosophers Problem',
    category: 'Classic Problem',
    concept:
      '5 philosophers sit around a round table with 1 bowl of rice and 5 chopsticks (Slide 92-101). Each philosopher alternately thinks and eats. A philosopher needs 2 chopsticks (left and right) to eat. Philosophers do not interact with neighbors and cannot speak.',
    problemSolved:
      'Classic model for allocating multiple shared resources among multiple competing processes without deadlock.',
    variables: [
      {
        name: 'chopstick',
        type: 'semaphore[5]',
        scope: 'global',
        initialValue: 'all 1',
        description: 'Array of 5 binary semaphores representing the 5 chopsticks.',
      },
    ],
    codeSnippets: [
      {
        title: 'Philosopher i Algorithm (Deadlock-Prone Naive Solution, Slide 104)',
        process: 'Philosopher i',
        code: `do {
    wait(chopstick[i]);
    wait(chopstick[(i + 1) % 5]);
    
    // eat
    
    signal(chopstick[i]);
    signal(chopstick[(i + 1) % 5]);
    
    // think
} while (TRUE);`,
        explanation: 'P_i grabs left chopstick i, then right chopstick (i+1)%5.',
      },
    ],
    executionRules: [
      'Deadlock Scenario (Slide 106-173): If all 5 philosophers become hungry at the same instant and each grabs their left chopstick[i], all chopstick values become 0. When they try to grab the right chopstick[(i+1)%5], all 5 block indefinitely!',
      'Slide Solutions to Prevent Deadlock (Slide 174-181):',
      '1. Solution 1 (Slide 175-176): Allow at most 4 philosophers to sit simultaneously at the table.',
      '2. Solution 2 (Slide 177-178): Allow a philosopher to pick up chopsticks only if BOTH are available (pickup must be inside a critical section protected by a mutex).',
      '3. Solution 3 (Slide 179-181): Asymmetric solution: An odd-numbered philosopher picks left then right; an even-numbered philosopher picks right then left.',
    ],
    evaluation: {
      mutualExclusion: {
        status: 'SATISFIED',
        justification: 'No two neighboring philosophers can eat simultaneously since they share a chopstick.',
      },
      progress: {
        status: 'VIOLATED',
        justification: 'In the naive algorithm, circular waiting causes total deadlock (0 progress).',
      },
      boundedWaiting: {
        status: 'VIOLATED',
        justification: 'Philosophers can starve if neighbors collude or in deadlock state.',
      },
    },
    advantages: ['Simple, intuitive benchmark for testing deadlock-free resource allocation protocols.'],
    disadvantages: ['High susceptibility to deadlock and starvation without asymmetric or quorum rules.'],
  },
};

// ============================================================================
// 3. Comparison Matrix Across All Mechanisms (SYNC_COMPARISON_MATRIX)
// ============================================================================

export const SYNC_COMPARISON_MATRIX: SyncComparisonRow[] = [
  {
    id: 'strict_alternation',
    name: 'Strict Alternation (turn)',
    category: 'Software',
    supportedProcesses: '2 Processes',
    mutualExclusion: true,
    progress: false,
    boundedWaiting: true,
    waitingMechanism: 'Busy Waiting (Spinlock)',
    hardwareSupportRequired: false,
    deadlockRisk: 'Low',
    starvationRisk: 'High',
    complexity: 'Low',
    recommendedUse: 'Educational counter-example showing why Progress fails.',
  },
  {
    id: 'petersons_solution',
    name: "Peterson's Algorithm",
    category: 'Software',
    supportedProcesses: '2 Processes',
    mutualExclusion: true,
    progress: true,
    boundedWaiting: true,
    waitingMechanism: 'Busy Waiting (Spinlock)',
    hardwareSupportRequired: false,
    deadlockRisk: 'None',
    starvationRisk: 'None',
    complexity: 'Medium',
    recommendedUse: 'Pure software synchronization between 2 processes on in-order architectures.',
  },
  {
    id: 'test_and_set_basic',
    name: 'Hardware test_and_set (Basic)',
    category: 'Hardware',
    supportedProcesses: '2 Processes',
    mutualExclusion: true,
    progress: true,
    boundedWaiting: false,
    waitingMechanism: 'Busy Waiting (Spinlock)',
    hardwareSupportRequired: true,
    deadlockRisk: 'Low',
    starvationRisk: 'Possible',
    complexity: 'Low',
    recommendedUse: 'Low-level kernel spinlocks for very short critical sections.',
  },
  {
    id: 'swap_basic',
    name: 'Hardware Swap Instruction',
    category: 'Hardware',
    supportedProcesses: '2 Processes',
    mutualExclusion: true,
    progress: true,
    boundedWaiting: false,
    waitingMechanism: 'Busy Waiting (Spinlock)',
    hardwareSupportRequired: true,
    deadlockRisk: 'Low',
    starvationRisk: 'Possible',
    complexity: 'Low',
    recommendedUse: 'Architectures supporting atomic exchange operations.',
  },
  {
    id: 'compare_and_swap',
    name: 'compare_and_swap (CAS)',
    category: 'Hardware',
    supportedProcesses: 'N Processes',
    mutualExclusion: true,
    progress: true,
    boundedWaiting: false,
    waitingMechanism: 'Busy Waiting (Spinlock)',
    hardwareSupportRequired: true,
    deadlockRisk: 'Low',
    starvationRisk: 'Possible',
    complexity: 'Low',
    recommendedUse: 'Building block for lock-free data structures and kernel primitives.',
  },
  {
    id: 'test_and_set_n_process',
    name: 'N-Process Bounded test_and_set',
    category: 'Hardware',
    supportedProcesses: 'N Processes',
    mutualExclusion: true,
    progress: true,
    boundedWaiting: true,
    waitingMechanism: 'Busy Waiting (Spinlock)',
    hardwareSupportRequired: true,
    deadlockRisk: 'None',
    starvationRisk: 'None',
    complexity: 'High',
    recommendedUse: 'Guaranteed starvation-free hardware locking for N processes.',
  },
  {
    id: 'mutex_locks',
    name: 'Mutex Locks (Spinlocks)',
    category: 'OS Primitive',
    supportedProcesses: 'Multi-threaded',
    mutualExclusion: true,
    progress: true,
    boundedWaiting: true,
    waitingMechanism: 'Busy Waiting (Spinlock)',
    hardwareSupportRequired: true,
    deadlockRisk: 'Low',
    starvationRisk: 'None',
    complexity: 'Low',
    recommendedUse: 'Application-level mutual exclusion for critical sections.',
  },
  {
    id: 'counting_semaphore_blocking',
    name: 'Semaphores with Waiting Queue',
    category: 'OS Primitive',
    supportedProcesses: 'N Processes',
    mutualExclusion: true,
    progress: true,
    boundedWaiting: true,
    waitingMechanism: 'Block & Wakeup (Queue)',
    hardwareSupportRequired: true,
    deadlockRisk: 'High (if misused)',
    starvationRisk: 'None',
    complexity: 'Medium',
    recommendedUse: 'General resource counting and thread synchronization without CPU waste.',
  },
  {
    id: 'bounded_buffer_prod_cons',
    name: 'Producer-Consumer (Bounded Buffer)',
    category: 'Classic Paradigm',
    supportedProcesses: 'N Processes',
    mutualExclusion: true,
    progress: true,
    boundedWaiting: true,
    waitingMechanism: 'Block & Wakeup (Queue)',
    hardwareSupportRequired: true,
    deadlockRisk: 'High (if misused)',
    starvationRisk: 'None',
    complexity: 'Medium',
    recommendedUse: 'Inter-process communication pipes, print spoolers, and message queues.',
  },
  {
    id: 'readers_writers_rwlock',
    name: 'Reader-Writer Lock',
    category: 'Classic Paradigm',
    supportedProcesses: 'N Processes',
    mutualExclusion: true,
    progress: true,
    boundedWaiting: false,
    waitingMechanism: 'Block & Wakeup (Queue)',
    hardwareSupportRequired: true,
    deadlockRisk: 'Low',
    starvationRisk: 'High',
    complexity: 'Medium',
    recommendedUse: 'Databases and in-memory caches where reads vastly outnumber writes.',
  },
  {
    id: 'dining_philosophers_monitors',
    name: 'Dining Philosophers Solutions',
    category: 'Classic Paradigm',
    supportedProcesses: 'N Processes',
    mutualExclusion: true,
    progress: true,
    boundedWaiting: true,
    waitingMechanism: 'Block & Wakeup (Queue)',
    hardwareSupportRequired: true,
    deadlockRisk: 'High (if misused)',
    starvationRisk: 'Possible',
    complexity: 'High',
    recommendedUse: 'Multi-resource deadlock avoidance models.',
  },
];

// ============================================================================
// 4. Slide-Extracted Presets (SYNC_SLIDE_PRESETS)
// ============================================================================

export const SYNC_SLIDE_PRESETS: SyncSlidePreset[] = [
  // --------------------------------------------------------------------------
  // Preset 1: Bounded Buffer without Counter (n-1 issue) (Slide 37-110)
  // --------------------------------------------------------------------------
  {
    id: 'preset_bounded_buffer_no_counter',
    title: '1. Bounded Buffer (in/out only — Max n-1 Items) (Slide 37-110)',
    topicId: 'race_condition',
    slideReference: 'Process Synchronization Part 1 — Slides 37-110',
    description:
      'Traces Consumer & Producer using only in and out pointers (BUFFER_SIZE = 6). Shows why at most n-1 (5) slots can be filled because (in + 1) % 6 == out forces Producer to stop with 1 empty slot!',
    initialProcesses: ['Consumer', 'Producer'],
    initialVariables: { in: 0, out: 0, count: 0, buffer_size: 6 },
    steps: [
      {
        stepIndex: 1,
        activeProcess: 'Consumer',
        codeLine: 'while (in == out) ; /* do nothing */',
        processStates: { Consumer: 'WAITING', Producer: 'REMAINDER' },
        sharedVariables: { in: 0, out: 0, count: 0 },
        mathEval: 'in == out  ➜  0 == 0 (TRUE — Buffer Empty!)',
        spinningProcesses: ['Consumer'],
        explanation:
          'Consumer checks while (in == out): 0 == 0 is TRUE! Buffer is empty, so Consumer spins in busy wait (; /* do nothing */). [Slide 38-42]',
      },
      {
        stepIndex: 2,
        activeProcess: 'Producer',
        codeLine: 'while (((in + 1) % BUFFER_SIZE) == out)',
        processStates: { Consumer: 'WAITING', Producer: 'ENTRY' },
        sharedVariables: { in: 0, out: 0, count: 0 },
        mathEval: '(0 + 1) % 6 ≠ 0  ➜  1 ≠ 0 (FALSE — Slot Available!)',
        explanation:
          'Producer produces an item and checks if buffer is full: (0 + 1) % 6 = 1 ≠ 0. Condition is false, so Producer proceeds! [Slide 44-48]',
      },
      {
        stepIndex: 3,
        activeProcess: 'Producer',
        codeLine: 'buffer[in] = next_produced; in = (in + 1) % 6;',
        processStates: { Consumer: 'WAITING', Producer: 'CRITICAL' },
        sharedVariables: { in: 1, out: 0, count: 1 },
        mathEval: 'buffer[0] = *  |  in = (0 + 1) % 6 = 1',
        slideMilestone: 'Item 1 Produced at buffer[0]',
        explanation:
          'Producer places item (*) at buffer[0] and updates in = (0 + 1) % 6 = 1. [Slide 49-53]',
      },
      {
        stepIndex: 4,
        activeProcess: 'Producer',
        codeLine: 'buffer[in] = next_produced; in = (in + 1) % 6;',
        processStates: { Consumer: 'WAITING', Producer: 'CRITICAL' },
        sharedVariables: { in: 2, out: 0, count: 2 },
        mathEval: '(1 + 1) % 6 = 2 ≠ 0  ➜  buffer[1] = *  |  in = 2',
        explanation:
          'Producer loops again: (1 + 1) % 6 = 2 ≠ 0. Places second item (*) at buffer[1] and updates in = 2. [Slide 54-63]',
      },
      {
        stepIndex: 5,
        activeProcess: 'Consumer',
        codeLine: 'next_consumed = buffer[out]; out = (out + 1) % 6;',
        processStates: { Consumer: 'CRITICAL', Producer: 'REMAINDER' },
        sharedVariables: { in: 2, out: 1, count: 1 },
        mathEval: 'in == out (2 ≠ 0)  ➜  Consume buffer[0]  |  out = (0 + 1) % 6 = 1',
        slideMilestone: 'Consumer Consumes buffer[0]',
        explanation:
          'Consumer checks while (in == out): 2 ≠ 0! Consumer exits loop, consumes item at buffer[0], and updates out = (0 + 1) % 6 = 1. [Slide 64-73]',
      },
      {
        stepIndex: 6,
        activeProcess: 'Consumer',
        codeLine: 'next_consumed = buffer[out]; out = (out + 1) % 6;',
        processStates: { Consumer: 'WAITING', Producer: 'REMAINDER' },
        sharedVariables: { in: 2, out: 2, count: 0 },
        mathEval: 'out = (1 + 1) % 6 = 2  ➜  Next loop: in == out (2 == 2)',
        spinningProcesses: ['Consumer'],
        explanation:
          'Consumer consumes buffer[1] and sets out = 2. On next iteration, in == out (2 == 2), so Consumer spins again because buffer is empty! [Slide 74-89]',
      },
      {
        stepIndex: 7,
        activeProcess: 'Producer',
        codeLine: 'buffer[in] = next_produced; in = (in + 1) % 6;',
        processStates: { Consumer: 'WAITING', Producer: 'CRITICAL' },
        sharedVariables: { in: 5, out: 0, count: 5 },
        mathEval: 'Slots 0, 1, 2, 3, 4 filled (5 items)  |  in = 5, out = 0',
        explanation:
          'Now suppose 4 items are in slots 0..3 (in=4, out=0). Producer adds a 5th item at buffer[4] and sets in = (4 + 1) % 6 = 5. [Slide 90-102]',
      },
      {
        stepIndex: 8,
        activeProcess: 'Producer',
        codeLine: 'while (((in + 1) % BUFFER_SIZE) == out) ; /* do nothing */',
        processStates: { Consumer: 'WAITING', Producer: 'BLOCKED' },
        sharedVariables: { in: 5, out: 0, count: 5 },
        mathEval: '(5 + 1) % 6 == 0  ➜  0 == 0 (TRUE — Producer Blocked at 5 items!)',
        spinningProcesses: ['Producer'],
        isViolation: true,
        violationMessage:
          'Underutilization Issue (Slide 110-111): Only n-1 = 5 slots can be filled! Slot 5 is empty, yet ((5+1)%6 == 0) is TRUE so Producer spins forever! Solution: add a counter variable.',
        explanation:
          'Producer tries to fill slot 5, but ((5 + 1) % 6) == 0 equals out (0)! Producer is forced to spin even though buffer[5] is empty! At most n-1 buffers can ever be filled! [Slide 103-111]',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // Preset 2: Race Condition on counter = 3 (Slide 166-186)
  // --------------------------------------------------------------------------
  {
    id: 'preset_race_condition_counter',
    title: '2. Producer-Consumer Race Condition on counter (Slide 166-186)',
    topicId: 'race_condition',
    slideReference: 'Process Synchronization Part 1 — Slides 166-186',
    description:
      'Step-by-step trace starting at counter = 3 (slots 0, 1, 2 filled). Both Consumer and Producer execute concurrently, and register interleaving corrupts counter to 2 (or 4) instead of 3!',
    initialProcesses: ['Consumer', 'Producer'],
    initialVariables: { counter: 3, in: 3, out: 0, count: 3, buffer_size: 6 },
    steps: [
      {
        stepIndex: 1,
        activeProcess: 'Consumer & Producer',
        codeLine: 'while (counter == 0)  |  while (counter == BUFFER_SIZE)',
        processStates: { Consumer: 'ENTRY', Producer: 'ENTRY' },
        sharedVariables: { counter: 3, in: 3, out: 0, count: 3 },
        registers: { Reg1: 0, Reg2: 0 },
        mathEval: 'Consumer: 3 ≠ 0 (Proceed)  |  Producer: 3 ≠ 6 (Proceed)',
        explanation:
          'Initially counter = 3, in = 3, out = 0 (slots 0, 1, 2 hold *). Consumer checks 3 ≠ 0 and Producer checks 3 ≠ 6. Both pass their while loops simultaneously! [Slide 166-169]',
      },
      {
        stepIndex: 2,
        activeProcess: 'Consumer & Producer',
        codeLine: 'next_consumed = buffer[out];  |  buffer[in] = next_produced;',
        processStates: { Consumer: 'CRITICAL', Producer: 'CRITICAL' },
        sharedVariables: { counter: 3, in: 4, out: 1, count: 3 },
        registers: { Reg1: 0, Reg2: 0 },
        mathEval: 'Consumer removes slot[0], out = (0+1)%6 = 1  |  Producer fills slot[3], in = (3+1)%6 = 4',
        explanation:
          'Consumer removes item from buffer[0] and sets out = 1. Concurrently, Producer inserts item into buffer[3] and sets in = 4. Now 3 items remain in buffer (slots 1, 2, 3). [Slide 170-175]',
      },
      {
        stepIndex: 3,
        activeProcess: 'Consumer',
        codeLine: 'Reg 1 = counter;',
        processStates: { Consumer: 'CRITICAL', Producer: 'CRITICAL' },
        sharedVariables: { counter: 3, in: 4, out: 1, count: 3 },
        registers: { Reg1: 3, Reg2: 0 },
        mathEval: 'counter-- decomposes into 3 instructions  ➜  Reg 1 = 3',
        explanation:
          'Both reach counter-- and counter++. Consumer starts assembly execution: Reg 1 = counter (Reg 1 reads 3). [Slide 176-179]',
      },
      {
        stepIndex: 4,
        activeProcess: 'Producer',
        codeLine: 'Reg 2 = Counter;',
        processStates: { Consumer: 'CRITICAL', Producer: 'CRITICAL' },
        sharedVariables: { counter: 3, in: 4, out: 1, count: 3 },
        registers: { Reg1: 3, Reg2: 3 },
        mathEval: 'counter++ decomposes into 3 instructions  ➜  Reg 2 = 3',
        explanation:
          'Before Consumer finishes, Producer also reads counter into its register: Reg 2 = Counter (Reg 2 reads 3). [Slide 179]',
      },
      {
        stepIndex: 5,
        activeProcess: 'Consumer & Producer',
        codeLine: 'Reg 1 = Reg 1 - 1;  |  Reg 2 = Reg 2 + 1;',
        processStates: { Consumer: 'CRITICAL', Producer: 'CRITICAL' },
        sharedVariables: { counter: 3, in: 4, out: 1, count: 3 },
        registers: { Reg1: 2, Reg2: 4 },
        mathEval: 'Reg 1 = 3 - 1 = 2  |  Reg 2 = 3 + 1 = 4',
        explanation:
          'Consumer decrements Reg 1 to 2, while Producer increments Reg 2 to 4. [Slide 180]',
      },
      {
        stepIndex: 6,
        activeProcess: 'Producer',
        codeLine: 'Counter = Reg 2;',
        processStates: { Consumer: 'CRITICAL', Producer: 'REMAINDER' },
        sharedVariables: { counter: 4, in: 4, out: 1, count: 3 },
        registers: { Reg1: 2, Reg2: 4 },
        mathEval: 'Counter = 4 (if Producer writes first)',
        explanation:
          'Case 1 (Slide 181): Producer writes first: Counter = Reg 2, so Counter becomes 4! [Slide 181]',
      },
      {
        stepIndex: 7,
        activeProcess: 'Consumer',
        codeLine: 'counter = Reg 1;',
        processStates: { Consumer: 'REMAINDER', Producer: 'REMAINDER' },
        sharedVariables: { counter: 2, in: 4, out: 1, count: 3 },
        registers: { Reg1: 2, Reg2: 4 },
        mathEval: 'Counter overwritten with 2! (Or 4 if Consumer wrote first — Slide 185)',
        isViolation: true,
        violationMessage:
          'Race Condition (Slide 183 & 186): Actual items in buffer = 3, but counter is corrupted to 2 (or 4 if reversed)! Solution: Critical Section Mutual Exclusion.',
        explanation:
          'Consumer writes last: counter = Reg 1, overwriting counter with 2! (And if Consumer wrote first and Producer wrote last, counter becomes 4 as in Slide 185-186). Data is corrupted! [Slide 182-187]',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // Preset 3: Strict Alternation (turn variable) (Slide 13-39)
  // --------------------------------------------------------------------------
  {
    id: 'preset_strict_alternation_turn',
    title: '3. Strict Alternation (turn Variable — Progress Issue) (Slide 13-39)',
    topicId: 'strict_alternation',
    slideReference: 'Critical Section Problem Part 1 — Slides 13-39',
    description:
      'Traces the 2-process turn algorithm (Slides 13-34) showing Mutual Exclusion holding, followed by the fatal Progress violation (Slides 36-39) when Pj tries to enter while turn == 0 and Pi is not ready.',
    initialProcesses: ['P0', 'P1'],
    initialVariables: { turn: 0, i: 0, j: 1 },
    steps: [
      {
        stepIndex: 1,
        activeProcess: 'P0 & P1',
        codeLine: 'while (turn == j);  |  while (turn == i);',
        processStates: { P0: 'ENTRY', P1: 'WAITING' },
        sharedVariables: { turn: 0, i: 0, j: 1 },
        mathEval: 'P0: turn == 1 (0 == 1 False ➜ Enter!)  |  P1: turn == 0 (0 == 0 True ➜ Spin!)',
        spinningProcesses: ['P1'],
        explanation:
          'Initially turn = 0, i = 0, j = 1. Both P0 (Pi) and P1 (Pj) check their while conditions. Since turn == 0, P0 exits its while loop while P1 spins in while (turn == i)! [Slide 14-16]',
      },
      {
        stepIndex: 2,
        activeProcess: 'P0',
        codeLine: '<critical section>',
        processStates: { P0: 'CRITICAL', P1: 'WAITING' },
        sharedVariables: { turn: 0, i: 0, j: 1 },
        spinningProcesses: ['P1'],
        slideMilestone: 'Mutual Exclusion holds (P0 in CS, P1 spinning)',
        explanation:
          'P0 executes safely inside its <critical section> while P1 is kept waiting. Mutual Exclusion holds! [Slide 16]',
      },
      {
        stepIndex: 3,
        activeProcess: 'P0',
        codeLine: 'turn = j;',
        processStates: { P0: 'EXIT', P1: 'CRITICAL' },
        sharedVariables: { turn: 1, i: 0, j: 1 },
        mathEval: 'turn = 1  ➜  P1 while (turn == 0) becomes FALSE!',
        explanation:
          'P0 exits its critical section and sets turn = j (turn = 1). Immediately, P1 exits its while loop and enters its <critical section>! [Slide 17-19]',
      },
      {
        stepIndex: 4,
        activeProcess: 'P0',
        codeLine: 'while (turn == j);',
        processStates: { P0: 'WAITING', P1: 'CRITICAL' },
        sharedVariables: { turn: 1, i: 0, j: 1 },
        mathEval: 'P0 loops around: turn == 1 is TRUE ➜ P0 Spins!',
        spinningProcesses: ['P0'],
        explanation:
          'P0 finishes its <remainder section>, loops back to do { while (turn == j); }, and spins because turn == 1 while P1 is still in CS. [Slide 20-23]',
      },
      {
        stepIndex: 5,
        activeProcess: 'P1',
        codeLine: 'turn = i;',
        processStates: { P0: 'CRITICAL', P1: 'REMAINDER' },
        sharedVariables: { turn: 0, i: 0, j: 1 },
        mathEval: 'P1 sets turn = 0  ➜  P0 enters <critical section>!',
        slideMilestone: 'Mutual Exclusion holds (Slide 34)',
        explanation:
          'P1 finishes CS, sets turn = i (turn = 0), and enters its remainder section. P0 enters <critical section>, then sets turn = 1 and finishes. Mutual Exclusion held! [Slide 24-34]',
      },
      {
        stepIndex: 6,
        activeProcess: 'P1',
        codeLine: 'while (turn == i);',
        processStates: { P0: 'REMAINDER', P1: 'BLOCKED' },
        sharedVariables: { turn: 0, i: 0, j: 1 },
        mathEval: 'Issue (Slide 36-39): turn = 0, P0 is NOT in CS, yet P1 spins forever!',
        spinningProcesses: ['P1'],
        isViolation: true,
        violationMessage:
          'Progress Violated (Slide 36-40): Critical Section is EMPTY (P0 does not want to enter), but turn == 0 prevents P1 from entering indefinitely!',
        explanation:
          'ISSUE (Slides 36-39): Suppose turn = 0 and P0 is in its remainder section (not wishing to enter CS). P1 wants to enter CS, but while (turn == 0) is TRUE! P1 is blocked forever even though the CS is completely empty! Progress FAILS!',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // Preset 3B: Flawed Turn Algorithm Trace (while(turn == i) / turn = j)
  // --------------------------------------------------------------------------
  {
    id: 'preset_strict_alternation_buggy_exam',
    title: '3B. Flawed Turn Algorithm Trace (while(turn == i) — Fails Progress & Bounded Wait)',
    topicId: 'strict_alternation',
    slideReference: 'Exam Concept Trace — Inverted Turn Condition Analysis',
    description:
      'Step-by-step trace of the flawed 2-process turn algorithm (Pi: while (turn == i); <cs> turn = j; | Pj: while (turn == j); <cs> turn = i; with turn = 1, i = 0, j = 1). Demonstrates why Mutual Exclusion holds, while BOTH Progress and Bounded Waiting fail!',
    initialProcesses: ['P0', 'P1'],
    initialVariables: { turn: 1, i: 0, j: 1 },
    steps: STRICT_ALTERNATION_BUGGY_EXAM_STEPS,
  },

  // --------------------------------------------------------------------------
  // Preset 4: Peterson's Algorithm — Sequential Trace (Slide 49-78)
  // --------------------------------------------------------------------------
  {
    id: 'preset_petersons_sequential',
    title: '4. Peterson’s Solution — Sequential Execution Trace (Slide 49-78)',
    topicId: 'petersons_algorithm',
    slideReference: 'Critical Section Problem Part 1 — Slides 49-78',
    description:
      'Exact trace of Slides 49-78: P1 (Pj) enters first while P0 (Pi) is idle, then P0 requests entry, proving Mutual Exclusion (Slide 63), Bounded Waiting (Slide 68), and Progress (Slide 78).',
    initialProcesses: ['P0', 'P1'],
    initialVariables: { 'flag[0]': false, 'flag[1]': false, turn: 0, i: 0, j: 1 },
    steps: [
      {
        stepIndex: 1,
        activeProcess: 'P1',
        codeLine: 'flag[j] = true;',
        processStates: { P0: 'REMAINDER', P1: 'ENTRY' },
        sharedVariables: { 'flag[0]': false, 'flag[1]': true, turn: 0 },
        mathEval: 'flag[1] = T  |  flag[0] = F, turn = 0',
        explanation:
          'Initially flag = [F, F], turn = 0. Process P1 (Pj) wants to enter first and sets flag[1] = true (T). [Slide 49-51]',
      },
      {
        stepIndex: 2,
        activeProcess: 'P1',
        codeLine: 'turn = i;',
        processStates: { P0: 'REMAINDER', P1: 'ENTRY' },
        sharedVariables: { 'flag[0]': false, 'flag[1]': true, turn: 0 },
        mathEval: 'turn = i (0)  ➜  while (flag[0] && turn == 0) is FALSE because flag[0] == F!',
        explanation:
          'P1 sets turn = i (0) and checks while (flag[0] && turn == 0). Since flag[0] is FALSE, the condition fails immediately! [Slide 52-54]',
      },
      {
        stepIndex: 3,
        activeProcess: 'P1',
        codeLine: 'critical section',
        processStates: { P0: 'REMAINDER', P1: 'CRITICAL' },
        sharedVariables: { 'flag[0]': false, 'flag[1]': true, turn: 0 },
        slideMilestone: 'P1 enters Critical Section (Slide 56)',
        explanation:
          'P1 enters its critical section! Now while P1 is inside CS, P0 (Pi) arrives and wants to enter. [Slide 55-56]',
      },
      {
        stepIndex: 4,
        activeProcess: 'P0',
        codeLine: 'flag[i] = true; turn = j;',
        processStates: { P0: 'WAITING', P1: 'CRITICAL' },
        sharedVariables: { 'flag[0]': true, 'flag[1]': true, turn: 1 },
        mathEval: 'flag[0] = T, turn = 1  ➜  while (flag[1] && turn == 1) is TRUE! P0 Spins!',
        spinningProcesses: ['P0'],
        slideMilestone: 'Mutual Exclusion holds (Slide 63)',
        explanation:
          'P0 sets flag[0] = T and turn = 1. P0 checks while (flag[1] && turn == 1): both are TRUE! P0 spins in busy wait while P1 is in CS. Mutual Exclusion holds! [Slide 57-63]',
      },
      {
        stepIndex: 5,
        activeProcess: 'P1',
        codeLine: 'flag[j] = false;',
        processStates: { P0: 'CRITICAL', P1: 'REMAINDER' },
        sharedVariables: { 'flag[0]': true, 'flag[1]': false, turn: 1 },
        mathEval: 'flag[1] = F  ➜  P0 exits while loop & enters Critical Section!',
        slideMilestone: 'Bounded Wait holds (Slide 68)',
        explanation:
          'P1 finishes CS and resets flag[1] = false (F) before entering remainder section. Immediately, P0’s while condition becomes FALSE and P0 enters its critical section! Bounded Wait holds! [Slide 64-68]',
      },
      {
        stepIndex: 6,
        activeProcess: 'P0',
        codeLine: 'flag[i] = false;',
        processStates: { P0: 'REMAINDER', P1: 'REMAINDER' },
        sharedVariables: { 'flag[0]': false, 'flag[1]': false, turn: 1 },
        mathEval: 'flag[0] = F  |  Both P0 and P1 in Remainder Section',
        explanation:
          'P0 finishes CS, sets flag[0] = false (F), and enters remainder section. Now suppose P1 stays in its remainder section and P0 wants to enter CS again! [Slide 69-73]',
      },
      {
        stepIndex: 7,
        activeProcess: 'P0',
        codeLine: 'flag[i] = true; turn = j; while (flag[j] && turn == j);',
        processStates: { P0: 'CRITICAL', P1: 'REMAINDER' },
        sharedVariables: { 'flag[0]': true, 'flag[1]': false, turn: 1 },
        mathEval: 'flag[1] == F  ➜  while (F && turn == 1) is FALSE! P0 Enters Immediately!',
        slideMilestone: 'Progress Satisfied (Slide 78)',
        explanation:
          'P0 sets flag[0] = T and turn = 1. Even though turn == 1, flag[1] is FALSE! So P0 does NOT wait for P1 and enters CS immediately! Progress is satisfied! [Slide 74-78]',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // Preset 5: Peterson’s Algorithm Concurrent Trace (Slide 79-101)
  // --------------------------------------------------------------------------
  {
    id: 'preset_petersons_concurrent',
    title: '5. Peterson’s Solution — Concurrent Execution Trace (Slide 79-101)',
    topicId: 'petersons_algorithm',
    slideReference: 'Critical Section Problem Part 1 — Slides 79-101',
    description:
      'Step-by-step trace showing P0 and P1 requesting entry simultaneously (Slides 79-101), proving Mutual Exclusion, Bounded Waiting, and Progress.',
    initialProcesses: ['P0', 'P1'],
    initialVariables: { 'flag[0]': false, 'flag[1]': false, turn: 0, i: 0, j: 1 },
    steps: [
      {
        stepIndex: 1,
        activeProcess: 'P0 & P1',
        codeLine: 'flag[i] = true;  |  flag[j] = true;',
        processStates: { P0: 'ENTRY', P1: 'ENTRY' },
        sharedVariables: { 'flag[0]': true, 'flag[1]': true, turn: 0 },
        mathEval: 'flag[0] = T  &  flag[1] = T (Both processes want to enter!)',
        explanation:
          'Both P0 (Pi) and P1 (Pj) concurrently declare their willingness to enter by setting flag[0] = T and flag[1] = T. [Slide 80-81]',
      },
      {
        stepIndex: 2,
        activeProcess: 'P0 & P1',
        codeLine: 'turn = j;  |  turn = i;',
        processStates: { P0: 'ENTRY', P1: 'ENTRY' },
        sharedVariables: { 'flag[0]': true, 'flag[1]': true, turn: 0 },
        mathEval: 'P0 sets turn = 1, P1 sets turn = 0  ➜  Final turn = 0',
        explanation:
          'Both execute turn assignment concurrently: P0 sets turn = 1 and P1 sets turn = 0 (last write wins, so turn becomes 0). [Slide 82-83]',
      },
      {
        stepIndex: 3,
        activeProcess: 'P0 & P1',
        codeLine: 'while (flag[j] && turn == j);  |  while (flag[i] && turn == i);',
        processStates: { P0: 'CRITICAL', P1: 'WAITING' },
        sharedVariables: { 'flag[0]': true, 'flag[1]': true, turn: 0 },
        mathEval: 'P0: (T && 0 == 1) is FALSE ➜ Enter CS!  |  P1: (T && 0 == 0) is TRUE ➜ Spin!',
        spinningProcesses: ['P1'],
        slideMilestone: 'Mutual Exclusion holds (Slide 86)',
        explanation:
          'Both evaluate their while loops: For P0, turn == 1 is FALSE (since turn is 0), so P0 enters Critical Section! For P1, flag[0] == T && turn == 0 is TRUE, so P1 spins! Mutual Exclusion holds! [Slide 84-86]',
      },
      {
        stepIndex: 4,
        activeProcess: 'P0',
        codeLine: 'flag[i] = false;',
        processStates: { P0: 'REMAINDER', P1: 'CRITICAL' },
        sharedVariables: { 'flag[0]': false, 'flag[1]': true, turn: 0 },
        mathEval: 'P0 sets flag[0] = F  ➜  P1 exits while loop & enters Critical Section!',
        slideMilestone: 'Bounded Wait holds (Slide 91)',
        explanation:
          'P0 finishes CS and resets flag[0] = F. Immediately, P1’s while (flag[0] && turn == 0) breaks and P1 enters its critical section! Bounded Waiting holds! [Slide 87-91]',
      },
      {
        stepIndex: 5,
        activeProcess: 'P1',
        codeLine: 'flag[j] = false;',
        processStates: { P0: 'REMAINDER', P1: 'REMAINDER' },
        sharedVariables: { 'flag[0]': false, 'flag[1]': false, turn: 0 },
        mathEval: 'flag[1] = F  ➜  Both in Remainder Section',
        explanation:
          'P1 finishes CS, resets flag[1] = F, and enters remainder section. [Slide 92-96]',
      },
      {
        stepIndex: 6,
        activeProcess: 'P1',
        codeLine: 'flag[j] = true; turn = i; while (flag[i] && turn == i);',
        processStates: { P0: 'REMAINDER', P1: 'CRITICAL' },
        sharedVariables: { 'flag[0]': false, 'flag[1]': true, turn: 0 },
        mathEval: 'flag[0] == F  ➜  P1 enters Critical Section immediately!',
        slideMilestone: 'Progress Satisfied (Slide 101)',
        explanation:
          'P1 loops around and wants to enter CS again while P0 stays in remainder section. P1 sets flag[1] = T, turn = 0. Since flag[0] == F, P1 enters CS without delay! Progress Satisfied! [Slide 97-101]',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // Preset 6: Hardware test_and_set Execution (Slide 111-148)
  // --------------------------------------------------------------------------
  {
    id: 'preset_hardware_test_and_set',
    title: '6. Hardware test_and_set Instruction Trace (Slide 111-148)',
    topicId: 'hardware_test_and_set',
    slideReference: 'Critical Section Problem Part 1 — Slides 111-148',
    description:
      'Step-by-step trace of atomic test_and_set(&lock) showing how lock, target, and rv change for P0 (Pi) and P1 (Pj) across Mutual Exclusion, Bounded Wait, and Progress.',
    initialProcesses: ['P0', 'P1'],
    initialVariables: { lock: false, Pi_target: false, Pi_rv: false, Pj_target: false, Pj_rv: false },
    steps: [
      {
        stepIndex: 1,
        activeProcess: 'P0',
        codeLine: 'while (test_and_set(&lock));',
        processStates: { P0: 'CRITICAL', P1: 'REMAINDER' },
        sharedVariables: { lock: true, Pi_target: true, Pi_rv: false, Pj_target: false, Pj_rv: false },
        registers: { Pi_target: 'T', Pi_rv: 'F', Pj_target: 'F', Pj_rv: 'F' },
        mathEval: 'rv = *target (F)  ➜  *target = TRUE (lock = T)  ➜  return F (Exit while!)',
        explanation:
          'Initially lock = F. P0 calls test_and_set(&lock): atomically saves rv = F, sets *target (lock) = T, and returns rv = F. Since while(F) is false, P0 enters /* critical section */! [Slide 111-116]',
      },
      {
        stepIndex: 2,
        activeProcess: 'P1',
        codeLine: 'while (test_and_set(&lock));',
        processStates: { P0: 'CRITICAL', P1: 'WAITING' },
        sharedVariables: { lock: true, Pi_target: true, Pi_rv: false, Pj_target: true, Pj_rv: true },
        registers: { Pi_target: 'T', Pi_rv: 'F', Pj_target: 'T', Pj_rv: 'T' },
        mathEval: 'lock is already T  ➜  Pj gets rv = T, keeps lock = T  ➜  while(T) Spins!',
        spinningProcesses: ['P1'],
        slideMilestone: 'Mutual Exclusion holds (Slide 121)',
        explanation:
          'While P0 is in CS, P1 calls test_and_set(&lock). Since lock is already T, P1 gets rv = T and lock remains T. P1 spins in while(test_and_set(&lock))! Mutual Exclusion holds! [Slide 117-121]',
      },
      {
        stepIndex: 3,
        activeProcess: 'P0',
        codeLine: 'lock = false;',
        processStates: { P0: 'EXIT', P1: 'WAITING' },
        sharedVariables: { lock: false, Pi_target: true, Pi_rv: false, Pj_target: false, Pj_rv: false },
        registers: { Pi_target: 'T', Pi_rv: 'F', Pj_target: 'F', Pj_rv: 'F' },
        mathEval: 'P0 resets lock = F',
        explanation:
          'P0 finishes its critical section and executes lock = false (lock becomes F). [Slide 123-126]',
      },
      {
        stepIndex: 4,
        activeProcess: 'P1',
        codeLine: '/* critical section */',
        processStates: { P0: 'REMAINDER', P1: 'CRITICAL' },
        sharedVariables: { lock: true, Pi_target: true, Pi_rv: false, Pj_target: true, Pj_rv: false },
        registers: { Pi_target: 'T', Pi_rv: 'F', Pj_target: 'T', Pj_rv: 'F' },
        mathEval: 'Next P1 spin: rv = F, lock = T  ➜  P1 enters Critical Section!',
        slideMilestone: 'Bounded Wait & Progress hold for 2-process trace (Slide 129 & 138)',
        explanation:
          'On P1’s next test_and_set(&lock) call, it reads lock == F, sets rv = F and lock = T, exits the while loop, and enters /* critical section */ while P0 is in remainder section! [Slide 127-138]',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // Preset 7: Hardware Swap Instruction Trace (Slide 153-185)
  // --------------------------------------------------------------------------
  {
    id: 'preset_hardware_swap',
    title: '7. Hardware Swap Instruction Concurrent Trace (Slide 153-185)',
    topicId: 'hardware_swap',
    slideReference: 'Critical Section Problem Part 1 — Slides 153-185',
    description:
      'Step-by-step trace of Swap(&lock, &key) where P0 and P1 both set key = TRUE and compete to swap their local key with the global lock.',
    initialProcesses: ['P0', 'P1'],
    initialVariables: { lock: false, Pi_key: false, Pj_key: false },
    steps: [
      {
        stepIndex: 1,
        activeProcess: 'P0 & P1',
        codeLine: 'key = TRUE;',
        processStates: { P0: 'ENTRY', P1: 'ENTRY' },
        sharedVariables: { lock: false, Pi_key: true, Pj_key: true },
        mathEval: 'lock = F  |  Pi_key = T, Pj_key = T',
        explanation:
          'Initially lock = F. Both P0 (Pi) and P1 (Pj) enter their loops and set their local key = TRUE. [Slide 153-156]',
      },
      {
        stepIndex: 2,
        activeProcess: 'P0',
        codeLine: 'Swap(&lock, &key);',
        processStates: { P0: 'ENTRY', P1: 'ENTRY' },
        sharedVariables: { lock: true, Pi_key: false, Pj_key: true },
        mathEval: 'Atomic Swap(lock=F, Pi_key=T)  ➜  lock becomes T, Pi_key becomes F!',
        explanation:
          'Both check while (key == TRUE). P0 executes Swap(&lock, &key) first! Hardware atomically swaps lock (F) and Pi_key (T): lock becomes T and Pi_key becomes F! [Slide 157-160]',
      },
      {
        stepIndex: 3,
        activeProcess: 'P1',
        codeLine: 'Swap(&lock, &key);',
        processStates: { P0: 'CRITICAL', P1: 'WAITING' },
        sharedVariables: { lock: true, Pi_key: false, Pj_key: true },
        mathEval: 'P0: Pi_key == F (Enter CS!)  |  P1: Swap(lock=T, Pj_key=T) ➜ stays T (Spin!)',
        spinningProcesses: ['P1'],
        slideMilestone: 'Mutual Exclusion holds (Slide 165)',
        explanation:
          'P1 executes Swap(&lock, &key), swapping lock=T with Pj_key=T (both remain T, so P1 keeps spinning). Meanwhile P0 re-evaluates while (key == TRUE), sees Pi_key == F, and enters <critical section>! Mutual Exclusion holds! [Slide 161-165]',
      },
      {
        stepIndex: 4,
        activeProcess: 'P0',
        codeLine: 'lock = FALSE;',
        processStates: { P0: 'REMAINDER', P1: 'CRITICAL' },
        sharedVariables: { lock: true, Pi_key: false, Pj_key: false },
        mathEval: 'P0 sets lock = F  ➜  P1 Swaps (lock=T, Pj_key=F) & enters CS!',
        slideMilestone: 'Bounded Wait & Progress hold (Slide 172 & 185)',
        explanation:
          'P0 exits CS and sets lock = FALSE (F). On P1’s next Swap(&lock, &key), P1 swaps lock (F) with Pj_key (T): lock becomes T and Pj_key becomes F! P1 exits the while loop and enters <critical section>! [Slide 167-185]',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // Preset 8: N-Process Bounded-Waiting test_and_set (Slide 190-231)
  // --------------------------------------------------------------------------
  {
    id: 'preset_n_process_bounded_waiting',
    title: '8. N-Processes (n=6) Bounded-Waiting test_and_set (Slide 190-231)',
    topicId: 'hardware_n_process_bounded',
    slideReference: 'Critical Section Problem Part 1 — Slides 190-231',
    description:
      'Complete slide trace for n = 6 processes: P1, P3, and P4 compete; P4 wins test_and_set and enters CS, then cyclically scans j = 5 → 0 → 1 to hand off directly to P1, which then scans j = 2 → 3 to hand off to P3!',
    initialProcesses: ['P0', 'P1', 'P2', 'P3', 'P4', 'P5'],
    initialVariables: {
      lock: false,
      n: 6,
      j: '-',
      'waiting[0]': false,
      'waiting[1]': false,
      'waiting[2]': false,
      'waiting[3]': false,
      'waiting[4]': false,
      'waiting[5]': false,
      'key[0]': false,
      'key[1]': false,
      'key[2]': false,
      'key[3]': false,
      'key[4]': false,
      'key[5]': false,
    },
    steps: [
      {
        stepIndex: 1,
        activeProcess: 'P1, P3, P4',
        codeLine: 'waiting[i] = true; key = true;',
        processStates: {
          P0: 'REMAINDER',
          P1: 'ENTRY',
          P2: 'REMAINDER',
          P3: 'ENTRY',
          P4: 'ENTRY',
          P5: 'REMAINDER',
        },
        sharedVariables: {
          lock: false,
          'waiting[1]': true,
          'waiting[3]': true,
          'waiting[4]': true,
          'key[1]': true,
          'key[3]': true,
          'key[4]': true,
        },
        mathEval: 'P1, P3, P4 set W = T and K = T  |  lock = F',
        explanation:
          'Processes P1, P3, and P4 wish to enter their critical sections. Each sets waiting[i] = true (W = T) and key = true (K = T). [Slide 192-196]',
      },
      {
        stepIndex: 2,
        activeProcess: 'P4',
        codeLine: 'key = test_and_set(&lock);',
        processStates: {
          P0: 'REMAINDER',
          P1: 'WAITING',
          P2: 'REMAINDER',
          P3: 'WAITING',
          P4: 'ENTRY',
          P5: 'REMAINDER',
        },
        sharedVariables: {
          lock: true,
          'key[4]': false,
          'key[1]': true,
          'key[3]': true,
        },
        mathEval: 'P4 executes test_and_set(&lock) first  ➜  lock = T, key[4] = F!',
        spinningProcesses: ['P1', 'P3'],
        explanation:
          'All three reach key = test_and_set(&lock). P4 executes it first! Since lock was F, P4 gets key[4] = F and lock becomes T. P1 and P3 get key = T and keep spinning in while(waiting[i] && key)! [Slide 197-200]',
      },
      {
        stepIndex: 3,
        activeProcess: 'P4',
        codeLine: 'waiting[i] = false; /* critical section */',
        processStates: {
          P0: 'REMAINDER',
          P1: 'WAITING',
          P2: 'REMAINDER',
          P3: 'WAITING',
          P4: 'CRITICAL',
          P5: 'REMAINDER',
        },
        sharedVariables: {
          lock: true,
          'waiting[4]': false,
          'key[4]': false,
        },
        mathEval: 'P4 exits while (since key[4]==F), sets waiting[4] = F, enters CS!',
        spinningProcesses: ['P1', 'P3'],
        slideMilestone: 'Mutual Exclusion holds (Slide 203)',
        explanation:
          'Because key[4] is F, P4 exits the while loop, resets waiting[4] = F, and enters /* critical section */ while P1 and P3 spin. Mutual Exclusion holds! [Slide 201-203]',
      },
      {
        stepIndex: 4,
        activeProcess: 'P4',
        codeLine: 'j = (i + 1) % n;',
        processStates: {
          P0: 'REMAINDER',
          P1: 'WAITING',
          P2: 'REMAINDER',
          P3: 'WAITING',
          P4: 'EXIT',
          P5: 'REMAINDER',
        },
        sharedVariables: { j: 5, lock: true },
        mathEval: 'i = 4, n = 6  ➜  j = (4 + 1) % 6 = 5',
        spinningProcesses: ['P1', 'P3'],
        explanation:
          'P4 finishes CS and starts the cyclic scan to find the next waiting process: j = (4 + 1) % 6 = 5. [Slide 205-206]',
      },
      {
        stepIndex: 5,
        activeProcess: 'P4',
        codeLine: 'while ((j != i) && !waiting[j]) j = (j + 1) % n;',
        processStates: {
          P0: 'REMAINDER',
          P1: 'WAITING',
          P2: 'REMAINDER',
          P3: 'WAITING',
          P4: 'EXIT',
          P5: 'REMAINDER',
        },
        sharedVariables: { j: 1, lock: true },
        mathEval: 'waiting[5]==F ➜ j=0; waiting[0]==F ➜ j=1; waiting[1]==T (Stop scan at j=1!)',
        spinningProcesses: ['P1', 'P3'],
        explanation:
          'P4 checks j=5 (waiting[5]=F) → advances to j=0 (waiting[0]=F) → advances to j=1. Since waiting[1] is TRUE, the while loop terminates with j = 1! [Slide 207-212]',
      },
      {
        stepIndex: 6,
        activeProcess: 'P4 & P1',
        codeLine: 'waiting[j] = false; /* P1 enters critical section */',
        processStates: {
          P0: 'REMAINDER',
          P1: 'CRITICAL',
          P2: 'REMAINDER',
          P3: 'WAITING',
          P4: 'REMAINDER',
          P5: 'REMAINDER',
        },
        sharedVariables: { j: 1, 'waiting[1]': false, lock: true },
        mathEval: 'j != i (1 != 4)  ➜  else: waiting[1] = F  ➜  P1 exits while & enters CS!',
        spinningProcesses: ['P3'],
        slideMilestone: 'Bounded Wait holds (Slide 218)',
        explanation:
          'Since j != i (1 != 4), P4 executes the else branch: waiting[1] = false! Immediately, P1’s while (waiting[1] && key) becomes FALSE, so P1 enters /* critical section */ while P4 exits! Bounded Wait holds! [Slide 213-218]',
      },
      {
        stepIndex: 7,
        activeProcess: 'P1 & P3',
        codeLine: 'j = (i + 1) % n; ... waiting[j] = false; /* P3 enters CS */',
        processStates: {
          P0: 'REMAINDER',
          P1: 'REMAINDER',
          P2: 'REMAINDER',
          P3: 'CRITICAL',
          P4: 'REMAINDER',
          P5: 'REMAINDER',
        },
        sharedVariables: { j: 3, 'waiting[3]': false, lock: true },
        mathEval: 'P1 scans j = (1+1)%6 = 2 (W[2]=F) ➜ j = 3 (W[3]=T) ➜ sets waiting[3] = F!',
        slideMilestone: 'Progress holds (Slide 231)',
        explanation:
          'When P1 finishes CS, it scans j = (1+1)%6 = 2 (waiting[2]=F), advances to j = 3 (waiting[3]=T), and sets waiting[3] = false! P3 immediately enters /* critical section */! All 3 requirements hold for N processes! [Slide 219-231]',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // Preset 9: Producer-Consumer with Semaphores (Slide 53-77)
  // --------------------------------------------------------------------------
  {
    id: 'preset_producer_consumer_semaphores',
    title: '9. Producer-Consumer with Semaphores Trace (Slide 53-77)',
    topicId: 'producer_consumer_bounded',
    slideReference: 'Semaphore Part 2 — Slides 53-77',
    description:
      'Exact trace of buffer[6], mutex=1, full=3, empty=3 where Producer and Consumer concurrently execute wait() and signal() with semaphore waiting queues.',
    initialProcesses: ['Producer', 'Consumer'],
    initialVariables: {
      'mutex.value': 1,
      'full.value': 3,
      'empty.value': 3,
      'mutex.queue': 'Empty',
      in: 3,
      out: 0,
      count: 3,
      buffer_size: 6,
    },
    steps: [
      {
        stepIndex: 1,
        activeProcess: 'Producer & Consumer',
        codeLine: 'wait(empty);  |  wait(full);',
        processStates: { Producer: 'ENTRY', Consumer: 'ENTRY' },
        sharedVariables: {
          'mutex.value': 1,
          'full.value': 2,
          'empty.value': 2,
          'mutex.queue': 'Empty',
          in: 3,
          out: 0,
          count: 3,
        },
        mathEval: 'Producer: empty (3 ➜ 2)  |  Consumer: full (3 ➜ 2)',
        explanation:
          'Initially mutex=1, full=3, empty=3 (slots 0, 1, 2 filled). Producer produces an item and calls wait(empty) (empty becomes 2). Concurrently, Consumer calls wait(full) (full becomes 2). [Slide 54-58]',
      },
      {
        stepIndex: 2,
        activeProcess: 'Consumer',
        codeLine: 'wait(mutex);',
        processStates: { Producer: 'ENTRY', Consumer: 'CRITICAL' },
        sharedVariables: {
          'mutex.value': 0,
          'full.value': 2,
          'empty.value': 2,
          'mutex.queue': 'Empty',
          in: 3,
          out: 0,
          count: 3,
        },
        mathEval: 'Consumer executes wait(mutex) first  ➜  mutex.value = 1 - 1 = 0',
        explanation:
          'Both reach wait(mutex). Consumer executes wait(mutex) first: mutex.value decrements from 1 to 0 (not < 0), so Consumer enters its critical section to access the buffer! [Slide 59-61]',
      },
      {
        stepIndex: 3,
        activeProcess: 'Producer',
        codeLine: 'wait(mutex);',
        processStates: { Producer: 'BLOCKED', Consumer: 'CRITICAL' },
        sharedVariables: {
          'mutex.value': -1,
          'full.value': 2,
          'empty.value': 2,
          'mutex.queue': 'P',
          in: 3,
          out: 0,
          count: 3,
        },
        waitingQueue: ['Producer'],
        mathEval: 'Producer wait(mutex): mutex.value = 0 - 1 = -1 (< 0)  ➜  block() Producer in Queue [P]!',
        slideMilestone: 'Mutual Exclusion holds (Slide 63)',
        explanation:
          'Producer calls wait(mutex): mutex.value decrements from 0 to -1 (< 0)! Producer is placed in mutex Waiting Queue [P] and blocked! Mutual Exclusion holds! [Slide 62-63]',
      },
      {
        stepIndex: 4,
        activeProcess: 'Consumer',
        codeLine: '/* remove an item from buffer */',
        processStates: { Producer: 'BLOCKED', Consumer: 'CRITICAL' },
        sharedVariables: {
          'mutex.value': -1,
          'full.value': 2,
          'empty.value': 2,
          'mutex.queue': 'P',
          in: 3,
          out: 1,
          count: 2,
        },
        waitingQueue: ['Producer'],
        mathEval: 'Remove buffer[0]  ➜  out = 1, count = 2',
        explanation:
          'Consumer safely removes the item at buffer[0]. Pointer out becomes 1 and count becomes 2. [Slide 64-65]',
      },
      {
        stepIndex: 5,
        activeProcess: 'Consumer',
        codeLine: 'signal(mutex);',
        processStates: { Producer: 'CRITICAL', Consumer: 'EXIT' },
        sharedVariables: {
          'mutex.value': 0,
          'full.value': 2,
          'empty.value': 2,
          'mutex.queue': 'Empty',
          in: 3,
          out: 1,
          count: 2,
        },
        waitingQueue: [],
        mathEval: 'mutex.value = -1 + 1 = 0 (<= 0)  ➜  wakeup(P) from Queue!',
        explanation:
          'Consumer calls signal(mutex): mutex.value increments from -1 to 0. Since 0 <= 0, Producer (P) is removed from mutex.queue and awakened! [Slide 66-68]',
      },
      {
        stepIndex: 6,
        activeProcess: 'Producer',
        codeLine: '/* add next produced to the buffer */',
        processStates: { Producer: 'CRITICAL', Consumer: 'EXIT' },
        sharedVariables: {
          'mutex.value': 0,
          'full.value': 2,
          'empty.value': 2,
          'mutex.queue': 'Empty',
          in: 4,
          out: 1,
          count: 3,
        },
        waitingQueue: [],
        mathEval: 'Insert at buffer[3]  ➜  in = 4, count = 3',
        explanation:
          'Awakened Producer inserts its item into buffer[3], increments in to 4, and updates count to 3! [Slide 68-71]',
      },
      {
        stepIndex: 7,
        activeProcess: 'Producer & Consumer',
        codeLine: 'signal(mutex); signal(full);  |  signal(empty);',
        processStates: { Producer: 'REMAINDER', Consumer: 'REMAINDER' },
        sharedVariables: {
          'mutex.value': 1,
          'full.value': 3,
          'empty.value': 3,
          'mutex.queue': 'Empty',
          in: 4,
          out: 1,
          count: 3,
        },
        waitingQueue: [],
        mathEval: 'mutex = 1, empty = 3, full = 3, count = 3 (100% Consistent!)',
        slideMilestone: 'Complete Synchronized Cycle (Slide 77)',
        explanation:
          'Consumer calls signal(empty) (empty becomes 3), and Producer calls signal(mutex) (mutex becomes 1) and signal(full) (full becomes 3). Both finish with count = 3 and zero race conditions! [Slide 72-77]',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // Preset 9B: Producer-Consumer Reversed wait(mutex) Deadlock Trace
  // --------------------------------------------------------------------------
  {
    id: 'preset_semaphore_reversed_deadlock',
    title: '9B. Reversed Semaphore Order Deadlock (wait(mutex) before wait(empty))',
    topicId: 'producer_consumer_bounded',
    slideReference: 'Exam Concept Trace — Semaphore Ordering & Deadlock Analysis',
    description:
      'Traces what happens when Producer reverses wait(empty) and wait(mutex) while the buffer is full (empty = 0, full = 6, mutex = 1). Producer acquires mutex = 0 then blocks on empty = -1, causing Consumer to block on mutex = -1 (Total Deadlock!).',
    initialProcesses: ['Producer', 'Consumer'],
    initialVariables: {
      'mutex.value': 1,
      'full.value': 6,
      'empty.value': 0,
      'mutex.queue': 'Empty',
      in: 0,
      out: 0,
      count: 6,
      buffer_size: 6,
    },
    steps: SEMAPHORE_REVERSED_DEADLOCK_STEPS,
  },

  // --------------------------------------------------------------------------
  // Preset 10: Readers-Writers Complete Slide Trace (Slide 21-88)
  // --------------------------------------------------------------------------
  {
    id: 'preset_readers_writers_trace',
    title: '10. Readers-Writers Full Concurrency Trace (Slide 21-88)',
    topicId: 'readers_writers',
    slideReference: 'Semaphore Case Studies Part 3 — Slides 21-88',
    description:
      'Complete 10-step trace from Slides 21-88: W1 writes, W2 blocks, W1 wakes W2, R1 blocks on rw_mutex while W2 writes, W2 wakes R1, W1 blocks while R1 reads, R2 joins R1 concurrently (read_count=2), R1 leaves, R2 leaves and wakes W1!',
    initialProcesses: ['W1', 'W2', 'R1', 'R2'],
    initialVariables: {
      'rw_mutex.value': 1,
      'rw_mutex.queue': 'Empty',
      'mutex.value': 1,
      read_count: 0,
    },
    steps: [
      {
        stepIndex: 1,
        activeProcess: 'W1',
        codeLine: 'wait(rw_mutex); /* writing is performed */',
        processStates: { W1: 'CRITICAL', W2: 'REMAINDER', R1: 'REMAINDER', R2: 'REMAINDER' },
        sharedVariables: { 'rw_mutex.value': 0, 'rw_mutex.queue': 'Empty', 'mutex.value': 1, read_count: 0 },
        mathEval: 'rw_mutex: 1 ➜ 0  |  W1 enters CS (Writing)',
        explanation:
          'Writer W1 arrives and calls wait(rw_mutex). rw_mutex decrements from 1 to 0, and W1 begins /* writing is performed */. [Slide 21-24]',
      },
      {
        stepIndex: 2,
        activeProcess: 'W2',
        codeLine: 'wait(rw_mutex);',
        processStates: { W1: 'CRITICAL', W2: 'BLOCKED', R1: 'REMAINDER', R2: 'REMAINDER' },
        sharedVariables: { 'rw_mutex.value': -1, 'rw_mutex.queue': 'W2', 'mutex.value': 1, read_count: 0 },
        waitingQueue: ['W2'],
        mathEval: 'rw_mutex: 0 ➜ -1 (< 0)  |  W2 blocked in rw_mutex Queue [W2]',
        explanation:
          'Writer W2 arrives and calls wait(rw_mutex). rw_mutex becomes -1 (< 0), so W2 is placed in rw_mutex Queue [W2] and blocked! [Slide 25-27]',
      },
      {
        stepIndex: 3,
        activeProcess: 'W1',
        codeLine: 'signal(rw_mutex);',
        processStates: { W1: 'REMAINDER', W2: 'CRITICAL', R1: 'REMAINDER', R2: 'REMAINDER' },
        sharedVariables: { 'rw_mutex.value': 0, 'rw_mutex.queue': 'Empty', 'mutex.value': 1, read_count: 0 },
        waitingQueue: [],
        mathEval: 'rw_mutex: -1 ➜ 0 (<= 0)  |  wakeup(W2) ➜ W2 starts writing!',
        slideMilestone: 'W1 finishes & W2 enters CS (Slide 33)',
        explanation:
          'W1 finishes writing and calls signal(rw_mutex). rw_mutex increments to 0 (<= 0), waking up W2 from the queue! W2 enters /* writing is performed */ and W1 exits. [Slide 28-33]',
      },
      {
        stepIndex: 4,
        activeProcess: 'R1',
        codeLine: 'wait(mutex); read_count++; if (read_count == 1) wait(rw_mutex);',
        processStates: { W1: 'REMAINDER', W2: 'CRITICAL', R1: 'BLOCKED', R2: 'REMAINDER' },
        sharedVariables: { 'rw_mutex.value': -1, 'rw_mutex.queue': 'R1', 'mutex.value': 0, read_count: 1 },
        waitingQueue: ['R1'],
        mathEval: 'mutex: 1 ➜ 0, read_count: 0 ➜ 1 (== 1) ➜ R1 calls wait(rw_mutex): 0 ➜ -1 (Blocked!)',
        explanation:
          'Reader R1 arrives while W2 is writing! R1 calls wait(mutex) (mutex=0), increments read_count to 1, sees read_count == 1, and calls wait(rw_mutex). rw_mutex becomes -1 and R1 is blocked in rw_mutex Queue [R1]! [Slide 34-42]',
      },
      {
        stepIndex: 5,
        activeProcess: 'W2 & R1',
        codeLine: 'W2: signal(rw_mutex);  |  R1: signal(mutex); /* reading is performed */',
        processStates: { W1: 'REMAINDER', W2: 'REMAINDER', R1: 'CRITICAL', R2: 'REMAINDER' },
        sharedVariables: { 'rw_mutex.value': 0, 'rw_mutex.queue': 'Empty', 'mutex.value': 1, read_count: 1 },
        waitingQueue: [],
        mathEval: 'W2 signals rw_mutex (-1 ➜ 0), wakes R1 ➜ R1 calls signal(mutex) (0 ➜ 1) & reads!',
        slideMilestone: 'R1 Reading Dataset (Slide 48)',
        explanation:
          'W2 finishes writing and calls signal(rw_mutex) (rw_mutex=0), waking R1! R1 completes signal(mutex) (mutex becomes 1) and enters /* reading is performed */! [Slide 43-48]',
      },
      {
        stepIndex: 6,
        activeProcess: 'W1',
        codeLine: 'wait(rw_mutex);',
        processStates: { W1: 'BLOCKED', W2: 'REMAINDER', R1: 'CRITICAL', R2: 'REMAINDER' },
        sharedVariables: { 'rw_mutex.value': -1, 'rw_mutex.queue': 'W1', 'mutex.value': 1, read_count: 1 },
        waitingQueue: ['W1'],
        mathEval: 'W1 calls wait(rw_mutex) while R1 reads  ➜  rw_mutex: 0 ➜ -1, Queue = [W1]',
        explanation:
          'Writer W1 wants to write while R1 is reading! W1 calls wait(rw_mutex): rw_mutex becomes -1 and W1 is blocked in rw_mutex Queue [W1]. [Slide 49-52]',
      },
      {
        stepIndex: 7,
        activeProcess: 'R2',
        codeLine: 'wait(mutex); read_count++; if (read_count == 1) ... signal(mutex);',
        processStates: { W1: 'BLOCKED', W2: 'REMAINDER', R1: 'CRITICAL', R2: 'CRITICAL' },
        sharedVariables: { 'rw_mutex.value': -1, 'rw_mutex.queue': 'W1', 'mutex.value': 1, read_count: 2 },
        waitingQueue: ['W1'],
        mathEval: 'read_count: 1 ➜ 2 (2 != 1, so R2 skips wait(rw_mutex)!) ➜ R1 & R2 read together!',
        slideMilestone: 'Multiple Readers Reading Simultaneously! (Slide 61)',
        explanation:
          'Reader R2 arrives! R2 calls wait(mutex), increments read_count from 1 to 2. Since read_count == 1 is FALSE, R2 skips wait(rw_mutex), calls signal(mutex), and joins R1 in /* reading is performed */ simultaneously! [Slide 53-61]',
      },
      {
        stepIndex: 8,
        activeProcess: 'R1',
        codeLine: 'wait(mutex); read_count--; if (read_count == 0) ... signal(mutex);',
        processStates: { W1: 'BLOCKED', W2: 'REMAINDER', R1: 'REMAINDER', R2: 'CRITICAL' },
        sharedVariables: { 'rw_mutex.value': -1, 'rw_mutex.queue': 'W1', 'mutex.value': 1, read_count: 1 },
        waitingQueue: ['W1'],
        mathEval: 'R1 leaves: read_count: 2 ➜ 1 (1 != 0, so rw_mutex stays locked for R2!)',
        explanation:
          'R1 finishes reading: calls wait(mutex), decrements read_count from 2 to 1. Since read_count != 0 (R2 is still reading!), R1 does NOT signal rw_mutex, calls signal(mutex), and leaves. [Slide 62-70]',
      },
      {
        stepIndex: 9,
        activeProcess: 'R2',
        codeLine: 'wait(mutex); read_count--; if (read_count == 0) signal(rw_mutex); signal(mutex);',
        processStates: { W1: 'CRITICAL', W2: 'REMAINDER', R1: 'REMAINDER', R2: 'REMAINDER' },
        sharedVariables: { 'rw_mutex.value': 0, 'rw_mutex.queue': 'Empty', 'mutex.value': 1, read_count: 0 },
        waitingQueue: [],
        mathEval: 'Last Reader R2 leaves: read_count: 1 ➜ 0 (== 0!) ➜ signal(rw_mutex) wakes W1!',
        slideMilestone: 'Last Reader Wakes Waiting Writer W1 (Slide 83)',
        explanation:
          'R2 finishes reading: decrements read_count from 1 to 0! Since read_count == 0 (last reader!), R2 calls signal(rw_mutex) (rw_mutex becomes 0, waking W1 to start writing!) and signal(mutex). [Slide 71-83]',
      },
      {
        stepIndex: 10,
        activeProcess: 'W1',
        codeLine: 'signal(rw_mutex);',
        processStates: { W1: 'REMAINDER', W2: 'REMAINDER', R1: 'REMAINDER', R2: 'REMAINDER' },
        sharedVariables: { 'rw_mutex.value': 1, 'rw_mutex.queue': 'Empty', 'mutex.value': 1, read_count: 0 },
        waitingQueue: [],
        mathEval: 'W1 finishes writing: signal(rw_mutex) ➜ rw_mutex = 1 (All idle)',
        slideMilestone: 'Trace Complete (Slide 88)',
        explanation:
          'W1 finishes writing and calls signal(rw_mutex). rw_mutex increments from 0 to 1, and all processes have completed cleanly! [Slide 84-88]',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // Preset 11: Dining Philosophers Full Trace (Normal + Deadlock) (Slide 106-173)
  // --------------------------------------------------------------------------
  {
    id: 'preset_dining_philosophers_deadlock',
    title: '11. Dining Philosophers Full Trace & Deadlock (Slide 106-173)',
    topicId: 'dining_philosophers',
    slideReference: 'Semaphore Case Studies Part 3 — Slides 106-173',
    description:
      'Complete trace from Slides 106-173: First shows P1 & P3 eating while P0, P2, P4 block and then eat in turn (Slides 106-162); then shows all 5 philosophers grabbing their left chopstick simultaneously causing total Deadlock & Starvation (Slides 164-173).',
    initialProcesses: ['P0', 'P1', 'P2', 'P3', 'P4'],
    initialVariables: {
      'chopstick[0]': 1,
      'chopstick[1]': 1,
      'chopstick[2]': 1,
      'chopstick[3]': 1,
      'chopstick[4]': 1,
      'queue[0]': '',
      'queue[1]': '',
      'queue[2]': '',
      'queue[3]': '',
      'queue[4]': '',
    },
    steps: [
      {
        stepIndex: 1,
        activeProcess: 'P1 & P3',
        codeLine: 'wait(chopstick[i]); wait(chopstick[(i + 1) % 5]); // eat',
        processStates: { P0: 'REMAINDER', P1: 'CRITICAL', P2: 'REMAINDER', P3: 'CRITICAL', P4: 'REMAINDER' },
        sharedVariables: {
          'chopstick[0]': 1,
          'chopstick[1]': 0,
          'chopstick[2]': 0,
          'chopstick[3]': 0,
          'chopstick[4]': 0,
          'queue[0]': '',
          'queue[1]': '',
          'queue[2]': '',
          'queue[3]': '',
          'queue[4]': '',
        },
        mathEval: 'P1 grabs chopsticks 1 & 2  |  P3 grabs chopsticks 3 & 4  ➜  P1 & P3 Eat!',
        explanation:
          'Non-neighbors P1 and P3 get hungry first: P1 locks chopstick[1] & chopstick[2] (both become 0), and P3 locks chopstick[3] & chopstick[4] (both become 0). Both P1 and P3 eat concurrently! [Slide 106-113]',
      },
      {
        stepIndex: 2,
        activeProcess: 'P0, P2, P4',
        codeLine: 'P0: wait(chopstick[0]); wait(chopstick[1]); | P2: wait(2); | P4: wait(4);',
        processStates: { P0: 'BLOCKED', P1: 'CRITICAL', P2: 'BLOCKED', P3: 'CRITICAL', P4: 'BLOCKED' },
        sharedVariables: {
          'chopstick[0]': 0,
          'chopstick[1]': -1,
          'chopstick[2]': -1,
          'chopstick[3]': 0,
          'chopstick[4]': -1,
          'queue[0]': '',
          'queue[1]': 'P0',
          'queue[2]': 'P2',
          'queue[3]': '',
          'queue[4]': 'P4',
        },
        waitingQueue: ['P0', 'P2', 'P4'],
        mathEval: 'P0 takes chopstick[0]=0, blocks on chopstick[1]=-1  |  P2 blocks on [2]=-1  |  P4 blocks on [4]=-1',
        explanation:
          'P0 grabs chopstick[0] (becomes 0) then tries wait(chopstick[1]) → becomes -1, so P0 blocks in queue[1]! P2 tries wait(chopstick[2]) → becomes -1, blocks in queue[2]! P4 tries wait(chopstick[4]) → becomes -1, blocks in queue[4]! [Slide 114-124]',
      },
      {
        stepIndex: 3,
        activeProcess: 'P3 & P4',
        codeLine: 'P3: signal(chopstick[3]); signal(chopstick[4]);  |  P4: wait(chopstick[0]);',
        processStates: { P0: 'BLOCKED', P1: 'CRITICAL', P2: 'BLOCKED', P3: 'REMAINDER', P4: 'BLOCKED' },
        sharedVariables: {
          'chopstick[0]': -1,
          'chopstick[1]': -1,
          'chopstick[2]': -1,
          'chopstick[3]': 1,
          'chopstick[4]': 0,
          'queue[0]': 'P4',
          'queue[1]': 'P0',
          'queue[2]': 'P2',
          'queue[3]': '',
          'queue[4]': '',
        },
        waitingQueue: ['P4', 'P0', 'P2'],
        mathEval: 'P3 releases 3 & 4 (waking P4)  ➜  P4 tries wait(chopstick[0]) which P0 holds! P4 blocks on [0]!',
        explanation:
          'P3 finishes eating: signals chopstick[3]=1 and chopstick[4]=0 (waking P4!). P4 now has chopstick[4], so it calls wait(chopstick[0]). Since P0 holds chopstick[0], chopstick[0] becomes -1 and P4 blocks in queue[0]! [Slide 125-133]',
      },
      {
        stepIndex: 4,
        activeProcess: 'P1, P0, P2',
        codeLine: 'P1: signal(1); signal(2);  ➜  P0 & P2 eat!',
        processStates: { P0: 'CRITICAL', P1: 'REMAINDER', P2: 'CRITICAL', P3: 'REMAINDER', P4: 'BLOCKED' },
        sharedVariables: {
          'chopstick[0]': -1,
          'chopstick[1]': 0,
          'chopstick[2]': 0,
          'chopstick[3]': 0,
          'chopstick[4]': 0,
          'queue[0]': 'P4',
          'queue[1]': '',
          'queue[2]': '',
          'queue[3]': '',
          'queue[4]': '',
        },
        waitingQueue: ['P4'],
        mathEval: 'P1 signals chopstick[1]=0 (wakes P0 to eat!) and chopstick[2]=0 (wakes P2, who grabs [3]=0 & eats!)',
        explanation:
          'P1 finishes eating and signals chopstick[1] (waking P0 to eat!) and chopstick[2] (waking P2, who grabs chopstick[3] and eats alongside P0!). P1 and P3 are now thinking. [Slide 134-144]',
      },
      {
        stepIndex: 5,
        activeProcess: 'P2, P0, P4',
        codeLine: 'P2 & P0 finish eating and signal  ➜  P4 wakes up, eats, and finishes!',
        processStates: { P0: 'REMAINDER', P1: 'REMAINDER', P2: 'REMAINDER', P3: 'REMAINDER', P4: 'REMAINDER' },
        sharedVariables: {
          'chopstick[0]': 1,
          'chopstick[1]': 1,
          'chopstick[2]': 1,
          'chopstick[3]': 1,
          'chopstick[4]': 1,
          'queue[0]': '',
          'queue[1]': '',
          'queue[2]': '',
          'queue[3]': '',
          'queue[4]': '',
        },
        waitingQueue: [],
        mathEval: 'P2 signals 2 & 3 ➜ P0 signals 0 (wakes P4!) & 1 ➜ P4 eats & signals 4 & 0 ➜ All chopsticks = 1!',
        slideMilestone: 'All 5 Philosophers Ate & Returned to Thinking (Slide 162)',
        explanation:
          'P2 finishes and signals chopstick[2]=1 & chopstick[3]=1. Then P0 finishes and signals chopstick[0]=0 (waking P4 to eat!) & chopstick[1]=1. Finally P4 finishes and signals chopstick[4]=1 & chopstick[0]=1. All 5 are thinking! [Slide 145-162]',
      },
      {
        stepIndex: 6,
        activeProcess: 'All 5 (P0, P1, P2, P3, P4)',
        codeLine: 'wait(chopstick[i]); // All 5 grab their LEFT chopstick simultaneously!',
        processStates: { P0: 'ENTRY', P1: 'ENTRY', P2: 'ENTRY', P3: 'ENTRY', P4: 'ENTRY' },
        sharedVariables: {
          'chopstick[0]': 0,
          'chopstick[1]': 0,
          'chopstick[2]': 0,
          'chopstick[3]': 0,
          'chopstick[4]': 0,
          'queue[0]': '',
          'queue[1]': '',
          'queue[2]': '',
          'queue[3]': '',
          'queue[4]': '',
        },
        waitingQueue: [],
        mathEval: 'All 5 execute wait(chopstick[i]) at once  ➜  chopstick[0..4] = [0, 0, 0, 0, 0]!',
        explanation:
          'DEADLOCK SCENARIO BEGINS (Slide 164-165): All 5 philosophers become hungry at the exact same instant! Each philosopher P_i executes wait(chopstick[i]) and picks up their left chopstick. All 5 semaphores become 0! [Slide 164-165]',
      },
      {
        stepIndex: 7,
        activeProcess: 'All 5 (P0, P1, P2, P3, P4)',
        codeLine: 'wait(chopstick[(i + 1) % 5]); // All 5 request RIGHT chopstick & BLOCK!',
        processStates: { P0: 'BLOCKED', P1: 'BLOCKED', P2: 'BLOCKED', P3: 'BLOCKED', P4: 'BLOCKED' },
        sharedVariables: {
          'chopstick[0]': -1,
          'chopstick[1]': -1,
          'chopstick[2]': -1,
          'chopstick[3]': -1,
          'chopstick[4]': -1,
          'queue[0]': 'P4',
          'queue[1]': 'P0',
          'queue[2]': 'P1',
          'queue[3]': 'P2',
          'queue[4]': 'P3',
        },
        waitingQueue: ['P4', 'P0', 'P1', 'P2', 'P3'],
        mathEval: 'chopstick[0..4] = [-1, -1, -1, -1, -1]  |  Blocked: [P4, P0, P1, P2, P3]',
        isViolation: true,
        violationMessage:
          'DEADLOCK & STARVATION (Slide 170-173): Every chopstick is -1! P0 waits for P1, P1 waits for P2, P2 waits for P3, P3 waits for P4, and P4 waits for P0!',
        explanation:
          'Now each philosopher tries wait(chopstick[(i + 1) % 5]): P0 blocks on chopstick[1], P1 blocks on chopstick[2], P2 blocks on chopstick[3], P3 blocks on chopstick[4], and P4 blocks on chopstick[0]! All semaphores are -1! Total Deadlock & Starvation! [Slide 166-173]',
      },
    ],
  },
];

// ============================================================================
// Micro-step overrides: one instruction per step for the most intricate traces
// ============================================================================

const MICRO_STEP_OVERRIDES: Record<string, { steps: SlideTraceStep[]; description: string }> = {
  preset_bounded_buffer_no_counter: {
    steps: BOUNDED_BUFFER_NO_COUNTER_STEPS,
    description:
      'Instruction-by-instruction trace of Consumer and Producer using only in and out pointers (BUFFER_SIZE = 6), showing why at most n - 1 (5) slots can be filled.',
  },
  preset_race_condition_counter: {
    steps: RACE_CONDITION_COUNTER_STEPS,
    description:
      'Instruction-by-instruction trace starting at counter = 3. Consumer and Producer interleave their machine-level register instructions, corrupting counter to 2.',
  },
  preset_strict_alternation_turn: {
    steps: STRICT_ALTERNATION_STEPS,
    description:
      'Instruction-by-instruction trace of the 2-process turn algorithm showing Mutual Exclusion holding, followed by the Progress violation when P0 stays in its remainder section.',
  },
  preset_petersons_sequential: {
    steps: PETERSON_SEQUENTIAL_STEPS,
    description:
      'Instruction-by-instruction trace of Slides 49-78: P1 enters first while P0 is idle, then P0 requests entry, proving Mutual Exclusion, Bounded Waiting, and Progress.',
  },
  preset_petersons_concurrent: {
    steps: PETERSON_CONCURRENT_STEPS,
    description:
      'Instruction-level trace where P0 and P1 request entry at the same time, showing Mutual Exclusion, Bounded Waiting and Progress.',
  },
  preset_hardware_test_and_set: {
    steps: HARDWARE_TEST_AND_SET_STEPS,
    description:
      'Instruction-by-instruction trace of atomic test_and_set(&lock) showing how lock, target, and rv change for P0 (Pi) and P1 (Pj).',
  },
  preset_hardware_swap: {
    steps: HARDWARE_SWAP_STEPS,
    description:
      'Instruction-by-instruction trace of Swap(&lock, &key) where P0 and P1 set key = TRUE and compete to swap their local key with the global lock.',
  },
  preset_producer_consumer_semaphores: {
    steps: PRODUCER_CONSUMER_SEMAPHORE_STEPS,
    description:
      'Trace of buffer[6] with mutex = 1, full = 3, empty = 3. Producer and Consumer execute wait() and signal() one call at a time, including the semaphore waiting queue.',
  },
  preset_readers_writers_trace: {
    steps: READERS_WRITERS_STEPS,
    description:
      'Instruction-level trace: W1 writes, W2 and R1 block on rw_mutex, R1 and R2 read together (read_count = 2), and the last reader wakes the waiting writer.',
  },
};

for (const preset of SYNC_SLIDE_PRESETS) {
  const override = MICRO_STEP_OVERRIDES[preset.id];
  if (override) {
    preset.steps = override.steps;
    preset.description = override.description;
  }
}
