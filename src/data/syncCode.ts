// ============================================================================
// Slide-Authentic Code Listings for Dual/Single Code Panels
// ============================================================================

export interface CodeLineSpec {
  line: string;
  matchKeys: string[];
  isLoop?: boolean;
  /** Unique id used by micro-step traces (SlideTraceStep.lineRef) to highlight exactly this line */
  ref?: string;
}

export interface DualCodeSpec {
  leftTitle: string;
  leftSubtitle?: string;
  leftArrowColor: 'red' | 'green';
  leftLines: CodeLineSpec[];
  rightTitle: string;
  rightSubtitle?: string;
  rightArrowColor: 'red' | 'green';
  rightLines: CodeLineSpec[];
  helperBox?: { title: string; code: string };
}

export const DUAL_CODE_SPECS: Record<string, DualCodeSpec> = {
  preset_bounded_buffer_no_counter: {
    leftTitle: 'Consumer – Bounded Buffer',
    leftSubtitle: 'Consumes item from buffer[out]',
    leftArrowColor: 'red',
    leftLines: [
      { line: 'while (true) {', matchKeys: [] },
      { line: '    while (in == out)', matchKeys: ['while (in == out)'], isLoop: true, ref: 'c_while' },
      { line: '        ; /* do nothing */', matchKeys: ['while (in == out)'], isLoop: true, ref: 'c_spin' },
      { line: '    next_consumed = buffer[out];', matchKeys: ['next_consumed = buffer[out]'], ref: 'c_read' },
      { line: '    out = (out + 1) % BUFFER_SIZE;', matchKeys: ['out = (out + 1)'], ref: 'c_out' },
      { line: '    /* consume the item */', matchKeys: [], ref: 'c_consume' },
      { line: '}', matchKeys: [] },
    ],
    rightTitle: 'Producer – Bounded Buffer',
    rightSubtitle: 'Produces item into buffer[in]',
    rightArrowColor: 'red',
    rightLines: [
      { line: 'while (true) {', matchKeys: [] },
      { line: '    /* produce an item in next_produced */', matchKeys: [], ref: 'p_produce' },
      {
        line: '    while (((in + 1) % BUFFER_SIZE) == out)',
        matchKeys: ['while (((in + 1) % BUFFER_SIZE) == out)'],
        isLoop: true,
        ref: 'p_while',
      },
      { line: '        ; /* do nothing */', matchKeys: ['/* do nothing */'], isLoop: true, ref: 'p_spin' },
      { line: '    buffer[in] = next_produced;', matchKeys: ['buffer[in] = next_produced'], ref: 'p_write' },
      { line: '    in = (in + 1) % BUFFER_SIZE;', matchKeys: ['in = (in + 1)'], ref: 'p_in' },
      { line: '}', matchKeys: [] },
    ],
  },

  preset_race_condition_counter: {
    leftTitle: 'Consumer Process (counter--)',
    leftSubtitle: 'Decrements counter using CPU Reg 1',
    leftArrowColor: 'red',
    leftLines: [
      { line: 'while (true) {', matchKeys: [] },
      { line: '    while (counter == 0) ; /* do nothing */', matchKeys: ['while (counter == 0)'], isLoop: true, ref: 'c_while' },
      { line: '    next_consumed = buffer[out];', matchKeys: ['next_consumed = buffer[out]'], ref: 'c_read' },
      { line: '    out = (out + 1) % BUFFER_SIZE;', matchKeys: ['next_consumed = buffer[out]'], ref: 'c_out' },
      { line: '    counter--;', matchKeys: ['Reg 1'], ref: 'c_dec' },
      { line: '      ├─ Reg 1 = counter', matchKeys: ['Reg 1 = counter'], ref: 'c_reg1_load' },
      { line: '      ├─ Reg 1 = Reg 1 - 1', matchKeys: ['Reg 1 = Reg 1 - 1'], ref: 'c_reg1_sub' },
      { line: '      └─ counter = Reg 1', matchKeys: ['counter = Reg 1'], ref: 'c_reg1_store' },
      { line: '}', matchKeys: [] },
    ],
    rightTitle: 'Producer Process (counter++)',
    rightSubtitle: 'Increments counter using CPU Reg 2',
    rightArrowColor: 'green',
    rightLines: [
      { line: 'while (true) {', matchKeys: [] },
      {
        line: '    while (counter == BUFFER_SIZE) ;',
        matchKeys: ['while (counter == BUFFER_SIZE)'],
        isLoop: true,
        ref: 'p_while',
      },
      { line: '    buffer[in] = next_produced;', matchKeys: ['buffer[in] = next_produced'], ref: 'p_write' },
      { line: '    in = (in + 1) % BUFFER_SIZE;', matchKeys: ['buffer[in] = next_produced'], ref: 'p_in' },
      { line: '    counter++;', matchKeys: ['Reg 2'], ref: 'p_inc' },
      { line: '      ├─ Reg 2 = Counter', matchKeys: ['Reg 2 = Counter'], ref: 'p_reg2_load' },
      { line: '      ├─ Reg 2 = Reg 2 + 1', matchKeys: ['Reg 2 = Reg 2 + 1'], ref: 'p_reg2_add' },
      { line: '      └─ Counter = Reg 2', matchKeys: ['Counter = Reg 2'], ref: 'p_reg2_store' },
      { line: '}', matchKeys: [] },
    ],
  },

  preset_strict_alternation_turn: {
    leftTitle: 'process Pi (P0, i = 0)',
    leftSubtitle: 'Spins while (turn == 1)',
    leftArrowColor: 'red',
    leftLines: [
      { line: 'do {', matchKeys: [] },
      { line: '    while (turn == j);', matchKeys: ['while (turn == j)'], isLoop: true, ref: 'while' },
      { line: '        <critical section>', matchKeys: ['<critical section>'], ref: 'cs' },
      { line: '    turn = j;', matchKeys: ['turn = j'], ref: 'turn' },
      { line: '        <remainder section>', matchKeys: ['<remainder section>'], ref: 'rem' },
      { line: '} while (true);', matchKeys: [] },
    ],
    rightTitle: 'process Pj (P1, j = 1)',
    rightSubtitle: 'Spins while (turn == 0)',
    rightArrowColor: 'green',
    rightLines: [
      { line: 'do {', matchKeys: [] },
      { line: '    while (turn == i);', matchKeys: ['while (turn == i)'], isLoop: true, ref: 'while' },
      { line: '        <critical section>', matchKeys: ['turn = j'], ref: 'cs' },
      { line: '    turn = i;', matchKeys: ['turn = i'], ref: 'turn' },
      { line: '        <remainder section>', matchKeys: [], ref: 'rem' },
      { line: '} while (true);', matchKeys: [] },
    ],
  },

  preset_strict_alternation_buggy_exam: {
    leftTitle: 'process Pi (P0, i = 0) — Flawed Turn Variant',
    leftSubtitle: 'Initial: turn = 1, i = 0, j = 1',
    leftArrowColor: 'red',
    leftLines: [
      { line: 'do {', matchKeys: [] },
      { line: '    while (turn == i);', matchKeys: ['while (turn == i)'], isLoop: true, ref: 'while' },
      { line: '        <critical section>', matchKeys: ['<critical section>'], ref: 'cs' },
      { line: '    turn = j;', matchKeys: ['turn = j'], ref: 'turn' },
      { line: '        <remainder section>', matchKeys: ['<remainder section>'], ref: 'rem' },
      { line: '} while (true);', matchKeys: [] },
    ],
    rightTitle: 'process Pj (P1, j = 1) — Flawed Turn Variant',
    rightSubtitle: 'Spins while (turn == j) i.e. turn == 1',
    rightArrowColor: 'green',
    rightLines: [
      { line: 'do {', matchKeys: [] },
      { line: '    while (turn == j);', matchKeys: ['while (turn == j)'], isLoop: true, ref: 'while' },
      { line: '        <critical section>', matchKeys: ['<critical section>'], ref: 'cs' },
      { line: '    turn = i;', matchKeys: ['turn = i'], ref: 'turn' },
      { line: '        <remainder section>', matchKeys: ['<remainder section>'], ref: 'rem' },
      { line: '} while (true);', matchKeys: [] },
    ],
  },

  preset_petersons_sequential: {
    leftTitle: 'process Pi (P0, i = 0)',
    leftSubtitle: 'Sets flag[0] = true and yields turn = 1',
    leftArrowColor: 'red',
    leftLines: [
      { line: 'do {', matchKeys: [] },
      { line: '    flag[i] = true;', matchKeys: ['flag[i] = true'], ref: 'flag' },
      { line: '    turn = j;', matchKeys: ['turn = j'], ref: 'turn' },
      { line: '    while (flag[j] && turn == j);', matchKeys: ['while (flag[j] && turn == j)', 'flag[i] = true; turn = j'], isLoop: true, ref: 'while' },
      { line: '        critical section', matchKeys: ['flag[j] = false', 'while (flag[j] && turn == j)'], ref: 'cs' },
      { line: '    flag[i] = false;', matchKeys: ['flag[i] = false'], ref: 'exit' },
      { line: '        remainder section', matchKeys: [], ref: 'rem' },
      { line: '} while (true);', matchKeys: [] },
    ],
    rightTitle: 'process Pj (P1, j = 1)',
    rightSubtitle: 'Sets flag[1] = true and yields turn = 0',
    rightArrowColor: 'green',
    rightLines: [
      { line: 'do {', matchKeys: [] },
      { line: '    flag[j] = true;', matchKeys: ['flag[j] = true'], ref: 'flag' },
      { line: '    turn = i;', matchKeys: ['turn = i'], ref: 'turn' },
      { line: '    while (flag[i] && turn == i);', matchKeys: ['while (flag[i] && turn == i)'], isLoop: true, ref: 'while' },
      { line: '        critical section', matchKeys: ['critical section'], ref: 'cs' },
      { line: '    flag[j] = false;', matchKeys: ['flag[j] = false'], ref: 'exit' },
      { line: '        remainder section', matchKeys: ['flag[i] = false'], ref: 'rem' },
      { line: '} while (true);', matchKeys: [] },
    ],
  },

  preset_petersons_concurrent: {
    leftTitle: 'process Pi (P0, i = 0)',
    leftSubtitle: 'Sets flag[0] = true and yields turn = 1',
    leftArrowColor: 'red',
    leftLines: [
      { line: 'do {', matchKeys: [] },
      { line: '    flag[i] = true;', matchKeys: ['flag[i] = true'], ref: 'flag' },
      { line: '    turn = j;', matchKeys: ['turn = j'], ref: 'turn' },
      { line: '    while (flag[j] && turn == j);', matchKeys: ['while (flag[j] && turn == j)'], isLoop: true, ref: 'while' },
      { line: '        critical section', matchKeys: ['while (flag[j] && turn == j)'], ref: 'cs' },
      { line: '    flag[i] = false;', matchKeys: ['flag[i] = false'], ref: 'exit' },
      { line: '        remainder section', matchKeys: ['flag[j] = false'], ref: 'rem' },
      { line: '} while (true);', matchKeys: [] },
    ],
    rightTitle: 'process Pj (P1, j = 1)',
    rightSubtitle: 'Sets flag[1] = true and yields turn = 0',
    rightArrowColor: 'green',
    rightLines: [
      { line: 'do {', matchKeys: [] },
      { line: '    flag[j] = true;', matchKeys: ['flag[j] = true'], ref: 'flag' },
      { line: '    turn = i;', matchKeys: ['turn = i'], ref: 'turn' },
      { line: '    while (flag[i] && turn == i);', matchKeys: ['while (flag[i] && turn == i)'], isLoop: true, ref: 'while' },
      { line: '        critical section', matchKeys: ['flag[i] = false', 'flag[j] = true; turn = i'], ref: 'cs' },
      { line: '    flag[j] = false;', matchKeys: ['flag[j] = false'], ref: 'exit' },
      { line: '        remainder section', matchKeys: [], ref: 'rem' },
      { line: '} while (true);', matchKeys: [] },
    ],
  },

  preset_hardware_test_and_set: {
    leftTitle: 'process Pi (P0)',
    leftSubtitle: 'Pi target & rv',
    leftArrowColor: 'red',
    leftLines: [
      { line: 'do {', matchKeys: [] },
      { line: '    while (test_and_set(&lock));', matchKeys: ['while (test_and_set(&lock))'], isLoop: true, ref: 'tas' },
      { line: '        /* critical section */', matchKeys: ['while (test_and_set(&lock))'], ref: 'cs' },
      { line: '    lock = false;', matchKeys: ['lock = false'], ref: 'unlock' },
      { line: '        /* remainder section */', matchKeys: ['/* critical section */'], ref: 'rem' },
      { line: '} while (true);', matchKeys: [] },
    ],
    rightTitle: 'process Pj (P1)',
    rightSubtitle: 'Pj target & rv',
    rightArrowColor: 'green',
    rightLines: [
      { line: 'do {', matchKeys: [] },
      { line: '    while (test_and_set(&lock));', matchKeys: ['while (test_and_set(&lock))'], isLoop: true, ref: 'tas' },
      { line: '        /* critical section */', matchKeys: ['/* critical section */'], ref: 'cs' },
      { line: '    lock = false;', matchKeys: [], ref: 'unlock' },
      { line: '        /* remainder section */', matchKeys: [], ref: 'rem' },
      { line: '} while (true);', matchKeys: [] },
    ],
    helperBox: {
      title: 'Atomic Hardware Instruction: test_and_set (Executed Indivisibly)',
      code: `boolean test_and_set (boolean *target) {\n    boolean rv = *target;\n    *target = TRUE;\n    return rv;\n}`,
    },
  },

  preset_hardware_swap: {
    leftTitle: 'process Pi (P0)',
    leftSubtitle: 'Local key (Pi_key)',
    leftArrowColor: 'red',
    leftLines: [
      { line: 'do {', matchKeys: [] },
      { line: '    key = TRUE;', matchKeys: ['key = TRUE'], ref: 'key' },
      { line: '    while (key == TRUE)', matchKeys: ['Swap(&lock, &key)'], isLoop: true, ref: 'while' },
      { line: '        Swap(&lock, &key);', matchKeys: ['Swap(&lock, &key)'], isLoop: true, ref: 'swap' },
      { line: '    <critical section>', matchKeys: ['Swap(&lock, &key)'], ref: 'cs' },
      { line: '    lock = FALSE;', matchKeys: ['lock = FALSE'], ref: 'unlock' },
      { line: '    <remainder section>', matchKeys: [], ref: 'rem' },
      { line: '} while (TRUE);', matchKeys: [] },
    ],
    rightTitle: 'process Pj (P1)',
    rightSubtitle: 'Local key (Pj_key)',
    rightArrowColor: 'green',
    rightLines: [
      { line: 'do {', matchKeys: [] },
      { line: '    key = TRUE;', matchKeys: ['key = TRUE'], ref: 'key' },
      { line: '    while (key == TRUE)', matchKeys: ['Swap(&lock, &key)'], isLoop: true, ref: 'while' },
      { line: '        Swap(&lock, &key);', matchKeys: ['Swap(&lock, &key)'], isLoop: true, ref: 'swap' },
      { line: '    <critical section>', matchKeys: ['lock = FALSE'], ref: 'cs' },
      { line: '    lock = FALSE;', matchKeys: [], ref: 'unlock' },
      { line: '    <remainder section>', matchKeys: [], ref: 'rem' },
      { line: '} while (TRUE);', matchKeys: [] },
    ],
    helperBox: {
      title: 'Atomic Swap Hardware Instruction (Executed Indivisibly)',
      code: `void Swap (boolean *a, boolean *b) {\n    boolean temp = *a;\n    *a = *b;\n    *b = temp;\n}`,
    },
  },

  preset_producer_consumer_semaphores: {
    leftTitle: 'Producer Process',
    leftSubtitle: 'Calls wait(empty) then wait(mutex)',
    leftArrowColor: 'red',
    leftLines: [
      { line: 'do {', matchKeys: [] },
      { line: '    /* produce an item in next_produced */', matchKeys: [] },
      { line: '    wait(empty);', matchKeys: ['wait(empty)'], ref: 'p_wait_empty' },
      { line: '    wait(mutex);', matchKeys: ['wait(mutex)'], isLoop: true, ref: 'p_wait_mutex' },
      { line: '    /* add next produced to the buffer */', matchKeys: ['/* add next produced to the buffer */'], ref: 'p_add' },
      { line: '    signal(mutex);', matchKeys: ['signal(mutex); signal(full)'], ref: 'p_signal_mutex' },
      { line: '    signal(full);', matchKeys: ['signal(mutex); signal(full)'], ref: 'p_signal_full' },
      { line: '} while (true);', matchKeys: [] },
    ],
    rightTitle: 'Consumer Process',
    rightSubtitle: 'Calls wait(full) then wait(mutex)',
    rightArrowColor: 'green',
    rightLines: [
      { line: 'do {', matchKeys: [] },
      { line: '    wait(full);', matchKeys: ['wait(full)'], ref: 'c_wait_full' },
      { line: '    wait(mutex);', matchKeys: ['wait(mutex)'], ref: 'c_wait_mutex' },
      { line: '    /* remove an item from buffer */', matchKeys: ['/* remove an item from buffer */'], ref: 'c_remove' },
      { line: '    signal(mutex);', matchKeys: ['signal(mutex)'], ref: 'c_signal_mutex' },
      { line: '    signal(empty);', matchKeys: ['signal(empty)'], ref: 'c_signal_empty' },
      { line: '    /* consume the item */', matchKeys: [] },
      { line: '} while (true);', matchKeys: [] },
    ],
    helperBox: {
      title: 'Semaphore Implementation with Waiting Queue (No Busy Waiting)',
      code: `wait(semaphore *S) {\n    S->value--;\n    if (S->value < 0) {\n        add this process to S->list;\n        block();\n    }\n}\n\nsignal(semaphore *S) {\n    S->value++;\n    if (S->value <= 0) {\n        remove a process P from S->list;\n        wakeup(P);\n    }\n}`,
    },
  },

  preset_semaphore_reversed_deadlock: {
    leftTitle: 'Producer Process (REVERSED wait Order Bug!)',
    leftSubtitle: 'Calls wait(mutex) BEFORE wait(empty)',
    leftArrowColor: 'red',
    leftLines: [
      { line: 'do {', matchKeys: [] },
      { line: '    /* produce an item in next_produced */', matchKeys: [] },
      { line: '    wait(mutex);   /* BUG: locks mutex first! */', matchKeys: ['wait(mutex)'], ref: 'p_wait_mutex_bug' },
      { line: '    wait(empty);   /* blocks if buffer is full! */', matchKeys: ['wait(empty)'], isLoop: true, ref: 'p_wait_empty_bug' },
      { line: '    /* add next produced to the buffer */', matchKeys: [], ref: 'p_add' },
      { line: '    signal(mutex);', matchKeys: [], ref: 'p_signal_mutex' },
      { line: '    signal(full);', matchKeys: [], ref: 'p_signal_full' },
      { line: '} while (true);', matchKeys: [] },
    ],
    rightTitle: 'Consumer Process (Standard Protocol)',
    rightSubtitle: 'Calls wait(full) then wait(mutex)',
    rightArrowColor: 'green',
    rightLines: [
      { line: 'do {', matchKeys: [] },
      { line: '    wait(full);', matchKeys: ['wait(full)'], ref: 'c_wait_full' },
      { line: '    wait(mutex);', matchKeys: ['wait(mutex)'], isLoop: true, ref: 'c_wait_mutex' },
      { line: '    /* remove an item from buffer */', matchKeys: [], ref: 'c_remove' },
      { line: '    signal(mutex);', matchKeys: [], ref: 'c_signal_mutex' },
      { line: '    signal(empty);', matchKeys: [], ref: 'c_signal_empty' },
      { line: '    /* consume the item */', matchKeys: [] },
      { line: '} while (true);', matchKeys: [] },
    ],
    helperBox: {
      title: 'Why Reversing wait(mutex) and wait(empty) Causes Deadlock',
      code: `When buffer is FULL (empty = 0, full = 6, mutex = 1):\n1. Producer calls wait(mutex) -> mutex becomes 0 (Producer holds lock).\n2. Producer calls wait(empty) -> empty becomes -1 (< 0) -> Producer BLOCKS while holding mutex!\n3. Consumer calls wait(full)  -> full becomes 5.\n4. Consumer calls wait(mutex) -> mutex becomes -1 (< 0) -> Consumer BLOCKS waiting for Producer!\nResult: Producer waits for Consumer to signal(empty); Consumer waits for Producer to signal(mutex). DEADLOCK!`,
    },
  },

  preset_readers_writers_trace: {
    leftTitle: 'Reader Process (R1, R2)',
    leftSubtitle: '1st reader locks rw_mutex; last reader unlocks rw_mutex',
    leftArrowColor: 'red',
    leftLines: [
      { line: 'do {', matchKeys: [] },
      { line: '    wait(mutex);', matchKeys: ['wait(mutex); read_count++'], ref: 'r_wait_mutex1' },
      { line: '    read_count++;', matchKeys: ['read_count++'], ref: 'r_inc' },
      { line: '    if (read_count == 1)', matchKeys: ['if (read_count == 1)'], ref: 'r_if1' },
      { line: '        wait(rw_mutex);', matchKeys: ['if (read_count == 1) wait(rw_mutex)'], isLoop: true, ref: 'r_wait_rw' },
      { line: '    signal(mutex);', matchKeys: ['R1: signal(mutex)', 'signal(mutex)'], ref: 'r_signal_mutex1' },
      { line: '    /* reading is performed */', matchKeys: ['/* reading is performed */'], ref: 'r_read' },
      { line: '    wait(mutex);', matchKeys: ['read_count--'], ref: 'r_wait_mutex2' },
      { line: '    read_count--;', matchKeys: ['read_count--'], ref: 'r_dec' },
      { line: '    if (read_count == 0)', matchKeys: ['if (read_count == 0)'], ref: 'r_if0' },
      { line: '        signal(rw_mutex);', matchKeys: ['if (read_count == 0) signal(rw_mutex)'], ref: 'r_signal_rw' },
      { line: '    signal(mutex);', matchKeys: ['read_count--'], ref: 'r_signal_mutex2' },
      { line: '} while (true);', matchKeys: [] },
    ],
    rightTitle: 'Writer Process (W1, W2)',
    rightSubtitle: 'Requires exclusive access via wait(rw_mutex)',
    rightArrowColor: 'green',
    rightLines: [
      { line: 'do {', matchKeys: [] },
      { line: '    wait(rw_mutex);', matchKeys: ['wait(rw_mutex)'], isLoop: true, ref: 'w_wait' },
      { line: '    /* writing is performed */', matchKeys: ['/* writing is performed */'], ref: 'w_write' },
      { line: '    signal(rw_mutex);', matchKeys: ['signal(rw_mutex)'], ref: 'w_signal' },
      { line: '} while (true);', matchKeys: [] },
    ],
  },
};

// ============================================================================
// Shared pseudocode panels (used by the Quiz so the algorithm is always visible)
// ============================================================================

export interface PseudocodePanel {
  title: string;
  subtitle?: string;
  lines: CodeLineSpec[];
}

export interface PseudocodeBundle {
  panels: PseudocodePanel[];
  helper?: { title: string; code: string };
}

const EXTRA_PANELS: Record<string, PseudocodeBundle> = {
  preset_n_process_bounded_waiting: {
    panels: [
      {
        title: 'Process Pi (n = 6, bounded waiting)',
        subtitle: 'Shared: boolean waiting[n]; boolean lock; local: boolean key',
        lines: [
          { line: 'do {', matchKeys: [] },
          { line: '    waiting[i] = true;', matchKeys: ['waiting[i] = true'] },
          { line: '    key = true;', matchKeys: ['key = true'] },
          { line: '    while (waiting[i] && key)', matchKeys: ['while (waiting[i] && key)'], isLoop: true },
          { line: '        key = test_and_set(&lock);', matchKeys: ['key = test_and_set'] },
          { line: '    waiting[i] = false;', matchKeys: ['waiting[i] = false'] },
          { line: '        /* critical section */', matchKeys: ['/* critical section */', 'enters critical section', 'enters CS'] },
          { line: '    j = (i + 1) % n;', matchKeys: ['j = (i + 1) % n'] },
          { line: '    while ((j != i) && !waiting[j])', matchKeys: ['while ((j != i)'] },
          { line: '        j = (j + 1) % n;', matchKeys: ['j = (j + 1) % n'] },
          { line: '    if (j == i)', matchKeys: ['if (j == i)'] },
          { line: '        lock = false;', matchKeys: ['lock = false'] },
          { line: '    else', matchKeys: [] },
          { line: '        waiting[j] = false;', matchKeys: ['waiting[j] = false'] },
          { line: '        /* remainder section */', matchKeys: [] },
          { line: '} while (true);', matchKeys: [] },
        ],
      },
    ],
  },
  preset_dining_philosophers_deadlock: {
    panels: [
      {
        title: 'Philosopher i (5 philosophers)',
        subtitle: 'Shared: semaphore chopstick[5] = {1, 1, 1, 1, 1}',
        lines: [
          { line: 'do {', matchKeys: [] },
          { line: '    wait(chopstick[i]);', matchKeys: ['wait(chopstick[i])'] },
          { line: '    wait(chopstick[(i + 1) % 5]);', matchKeys: ['wait(chopstick[(i + 1) % 5])'] },
          { line: '        /* eat */', matchKeys: ['// eat', '/* eat */'] },
          { line: '    signal(chopstick[i]);', matchKeys: ['signal(chopstick[i])'] },
          { line: '    signal(chopstick[(i + 1) % 5]);', matchKeys: ['signal(chopstick[(i + 1) % 5])'] },
          { line: '        /* think */', matchKeys: ['// think', '/* think */'] },
          { line: '} while (true);', matchKeys: [] },
        ],
      },
    ],
  },
};

/** Returns the full pseudocode (one or more panels) for a preset. */
export function getPseudocodeBundle(presetId: string): PseudocodeBundle {
  const spec = DUAL_CODE_SPECS[presetId];
  if (spec) {
    return {
      panels: [
        { title: spec.leftTitle, subtitle: spec.leftSubtitle, lines: spec.leftLines },
        { title: spec.rightTitle, subtitle: spec.rightSubtitle, lines: spec.rightLines },
      ],
      helper: spec.helperBox,
    };
  }
  return EXTRA_PANELS[presetId] ?? { panels: [] };
}

/** Which code panel (left / right) the active process of a step is running. */
export function activeSides(presetId: string, activeProcess: string): { left: boolean; right: boolean } {
  const isSemProdCons =
    presetId === 'preset_producer_consumer_semaphores' || presetId === 'preset_semaphore_reversed_deadlock';
  const left =
    (!isSemProdCons && activeProcess.includes('Consumer')) ||
    activeProcess.includes('P0') ||
    activeProcess.includes('R1') ||
    activeProcess.includes('R2') ||
    (isSemProdCons && activeProcess.includes('Producer'));
  const right =
    (!isSemProdCons && activeProcess.includes('Producer')) ||
    (isSemProdCons && activeProcess.includes('Consumer')) ||
    activeProcess.includes('P1') ||
    activeProcess.includes('W1') ||
    activeProcess.includes('W2');
  return { left, right };
}

/** True when `spec` is the line being executed by the given step. */
export function isSpecLineActive(
  spec: CodeLineSpec,
  step: { codeLine: string; lineRef?: string; stepIndex: number },
): boolean {
  if (step.stepIndex === 0) return false;
  if (step.lineRef) return spec.ref === step.lineRef;
  return spec.matchKeys.some((k) => step.codeLine.includes(k));
}
