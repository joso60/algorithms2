/**
 * Process Synchronization Simulation Engine for CPCS 361 (Operating Systems - I)
 * Pure TypeScript step-by-step state machine and trace simulator based on syncData.ts.
 */

import {
  SYNC_ALGORITHMS_THEORY,
  SYNC_SLIDE_PRESETS,
  type CriteriaEvaluation,
  type CriteriaStatus,
  type ProcessState,
  type SlideTraceStep,
  type SyncSlidePreset,
  type SyncTopicId,
} from '../data/syncData';

// ============================================================================
// 1. TypeScript Interfaces for Synchronization Simulation
// ============================================================================

export type SyncPresetId =
  | 'preset_bounded_buffer_no_counter'
  | 'preset_race_condition_counter'
  | 'preset_strict_alternation_turn'
  | 'preset_strict_alternation_buggy_exam'
  | 'preset_petersons_sequential'
  | 'preset_petersons_concurrent'
  | 'preset_hardware_test_and_set'
  | 'preset_hardware_swap'
  | 'preset_n_process_bounded_waiting'
  | 'preset_producer_consumer_semaphores'
  | 'preset_semaphore_reversed_deadlock'
  | 'preset_readers_writers_trace'
  | 'preset_dining_philosophers_deadlock';

export interface BufferSimulationState {
  slots: (string | null)[];
  inIndex: number;
  outIndex: number;
  count: number;
  size: number;
}

export interface SyncSimulationStep {
  /** 0-indexed step number (0 represents initial state before step 1, or 1..N for trace steps) */
  stepIndex: number;
  /** Total steps in the scenario */
  totalSteps: number;
  /** Preset identifier */
  presetId: string;
  /** Underlying synchronization topic ID */
  topicId: SyncTopicId;
  /** Scenario title */
  scenarioTitle: string;
  /** Slide reference from CPCS 361 lectures */
  slideReference: string;
  /** Currently executing process (or processes) at this step */
  activeProcess: string;
  /** Code line / instruction highlighted in this step */
  codeLine: string;
  /** Optional reference to the exact code-panel line executed (micro-step traces) */
  lineRef?: string;  /** Complete mapping of every process in the scenario to its current state (ENTRY, CRITICAL, BLOCKED, EXIT, REMAINDER, WAITING) */
  processStates: Record<string, ProcessState>;
  /** Complete snapshot of all shared variables at this step (merged cumulatively from initialVariables) */
  sharedVariables: Record<string, string | number | boolean>;
  /** Local CPU registers snapshot (if applicable to the scenario) */
  registers: Record<string, number | string>;
  /**
   * Program-counter style pointer per process: the `lineRef` of the last instruction each
   * process executed up to (and including) this step. Drives the persistent per-process arrows.
   */
  processPointers: Record<string, string>;
  /**
   * True when both processes are simultaneously "in flight" inside an interleaved
   * read-modify-write (Race Condition preset) - both arrows must be highlighted together.
   */
  isConcurrentInterleaving: boolean;
  /** FIFO queue of blocked/waiting processes (derived or explicit) */
  waitingQueue: string[];
  /** Optional bounded-buffer state for Producer-Consumer visualization */
  bufferState?: BufferSimulationState;
  /** Pedagogical explanation aligned with lecture slides */
  explanation: string;
  /** Slide mathematical / boolean condition evaluation string */
  mathEval?: string;
  /** Slide milestone verdict (e.g. 'Mutual Exclusion holds', 'Bounded Wait holds') */
  slideMilestone?: string;
  /** Processes currently spinning in a busy-wait while loop */
  spinningProcesses?: string[];
  /** Whether a synchronization violation (race condition / deadlock) occurred on this step */
  isViolation: boolean;
  /** Detailed violation message if isViolation is true */
  violationMessage?: string;
  /** List of processes currently inside the Critical Section */
  processesInCritical: string[];
  /** Formal 3-criteria evaluation for the current algorithm */
  criteriaEvaluation: CriteriaEvaluation;
}

export interface SimulateSyncOptions {
  /** Include Step 0 (Initial State snapshot prior to first instruction). Defaults to true. */
  includeInitialStep?: boolean;
  /** Optional custom initial variable overrides */
  customInitialVariables?: Record<string, string | number | boolean>;
}

// ============================================================================
// 2. Helper Functions for State Normalization & Buffer Reconstruction
// ============================================================================

/**
 * Resolves a preset by either its exact preset ID (e.g., 'preset_petersons_concurrent')
 * or its topicId (e.g., 'petersons_algorithm').
 */
export function resolveSyncPreset(identifier: string): SyncSlidePreset {
  const byId = SYNC_SLIDE_PRESETS.find((preset) => preset.id === identifier);
  if (byId) {
    return byId;
  }

  const byTopic = SYNC_SLIDE_PRESETS.find((preset) => preset.topicId === identifier);
  if (byTopic) {
    return byTopic;
  }

  throw new Error(
    `Unknown synchronization scenario identifier: "${identifier}". Valid preset IDs: ${SYNC_SLIDE_PRESETS.map((p) => p.id).join(', ')}`
  );
}

/**
 * Builds a complete process state map ensuring every process in `initialProcesses`
 * has a valid ProcessState at every step.
 */
function normalizeProcessStates(
  initialProcesses: string[],
  previousStates: Record<string, ProcessState>,
  stepStates?: Record<string, ProcessState>
): Record<string, ProcessState> {
  const normalized: Record<string, ProcessState> = {};

  for (const proc of initialProcesses) {
    if (stepStates && stepStates[proc] !== undefined) {
      normalized[proc] = stepStates[proc];
    } else if (previousStates[proc] !== undefined) {
      normalized[proc] = previousStates[proc];
    } else {
      normalized[proc] = 'REMAINDER';
    }
  }

  // Include any extra dynamic process keys present in stepStates
  if (stepStates) {
    for (const [proc, state] of Object.entries(stepStates)) {
      if (!(proc in normalized)) {
        normalized[proc] = state;
      }
    }
  }

  return normalized;
}

/**
 * Derives the waiting queue from explicit `step.waitingQueue` or from processes
 * in `BLOCKED` / `WAITING` state when an explicit queue is not provided.
 */
function resolveWaitingQueue(
  step: SlideTraceStep,
  processStates: Record<string, ProcessState>
): string[] {
  if (Array.isArray(step.waitingQueue)) {
    return [...step.waitingQueue];
  }

  return Object.entries(processStates)
    .filter(([, state]) => state === 'BLOCKED' || state === 'WAITING')
    .map(([proc]) => proc);
}

/**
 * Reconstructs bounded buffer slot state for Producer-Consumer presets
 * when `buffer_size`, `in`, `out`, and `count` (or `counter`) are tracked.
 */
function computeBufferState(
  presetId: string,
  sharedVariables: Record<string, string | number | boolean>,
  explicitBuffer?: SlideTraceStep['bufferState']
): BufferSimulationState | undefined {
  if (explicitBuffer) {
    return {
      slots: [...explicitBuffer.slots],
      inIndex: explicitBuffer.inIndex,
      outIndex: explicitBuffer.outIndex,
      count: explicitBuffer.count,
      size: explicitBuffer.size,
    };
  }

  if (
    presetId !== 'preset_bounded_buffer_no_counter' &&
    presetId !== 'preset_race_condition_counter' &&
    presetId !== 'preset_producer_consumer_semaphores' &&
    presetId !== 'preset_semaphore_reversed_deadlock'
  ) {
    return undefined;
  }

  const size =
    typeof sharedVariables.buffer_size === 'number' ? sharedVariables.buffer_size : 6;
  const inIndex = typeof sharedVariables.in === 'number' ? sharedVariables.in : 0;
  const outIndex = typeof sharedVariables.out === 'number' ? sharedVariables.out : 0;
  const count =
    typeof sharedVariables.count === 'number'
      ? sharedVariables.count
      : typeof sharedVariables.counter === 'number'
        ? sharedVariables.counter
        : 0;

  const slots: (string | null)[] = Array.from({ length: size }, () => null);
  const clampedCount = Math.max(0, Math.min(size, count));

  for (let k = 0; k < clampedCount; k++) {
    const slotIdx = (outIndex + k) % size;
    slots[slotIdx] = '*';
  }

  return {
    slots,
    inIndex,
    outIndex,
    count,
    size,
  };
}

// ============================================================================
// 3. Core Simulation Engine: simulateSyncScenario
// ============================================================================

/**
 * Simulates one of the CPCS 361 synchronization presets defined in `syncData.ts`
 * and returns a complete, self-contained array of step-by-step state objects.
 *
 * @param presetOrTopicId - Preset ID (e.g. `'preset_petersons_concurrent'`) or Topic ID (e.g. `'petersons_algorithm'`)
 * @param options - Optional simulation configuration (`includeInitialStep`, `customInitialVariables`)
 * @returns Array of `SyncSimulationStep` objects representing the full execution trace
 */
function resolvePresetCriteria(preset: SyncSlidePreset): CriteriaEvaluation {
  if (preset.id === 'preset_strict_alternation_buggy_exam') {
    return {
      mutualExclusion: {
        status: 'SATISFIED',
        justification:
          'Shared variable turn can only be 0 or 1 at any instant, so Pi and Pj can never pass their while loops simultaneously.',
      },
      progress: {
        status: 'VIOLATED',
        justification:
          'When P0 exits its critical section, it sets turn = j (1), keeping P1 trapped in while (turn == j) even when the critical section is empty.',
      },
      boundedWaiting: {
        status: 'VIOLATED',
        justification:
          'Because turn remains 1 after P0 exits, P0 can re-enter its critical section an unlimited number of times while P1 starves indefinitely.',
      },
    };
  }
  if (preset.id === 'preset_semaphore_reversed_deadlock') {
    return {
      mutualExclusion: {
        status: 'SATISFIED',
        justification: 'Only one process can hold mutex (initialized to 1) at a time.',
      },
      progress: {
        status: 'VIOLATED',
        justification:
          'When the buffer is full (empty = 0), Producer locks mutex first and blocks on wait(empty), preventing Consumer from acquiring mutex to free a slot (Deadlock!).',
      },
      boundedWaiting: {
        status: 'VIOLATED',
        justification: 'Both Producer and Consumer are blocked indefinitely in circular deadlock.',
      },
    };
  }
  return SYNC_ALGORITHMS_THEORY[preset.topicId].evaluation;
}

export function simulateSyncScenario(
  presetOrTopicId: SyncPresetId | SyncTopicId | string,
  options: SimulateSyncOptions = {}
): SyncSimulationStep[] {
  const { includeInitialStep = true, customInitialVariables } = options;

  const preset = resolveSyncPreset(presetOrTopicId);
  const criteriaEvaluation: CriteriaEvaluation = resolvePresetCriteria(preset);

  // Initialize cumulative state trackers
  let cumulativeVariables: Record<string, string | number | boolean> = {
    ...preset.initialVariables,
    ...(customInitialVariables ?? {}),
  };

  let cumulativeRegisters: Record<string, number | string> = {};

  // Race Condition preset: expose CPU registers as shared variables from the very first step
  const isRacePreset = preset.id === 'preset_race_condition_counter';
  if (isRacePreset) {
    cumulativeVariables = { Reg1: 0, Reg2: 0, ...cumulativeVariables };
    cumulativeRegisters = { Reg1: 0, Reg2: 0 };
  }

  let pointers: Record<string, string> = {};
  const inRegisterBlock = (ptrs: Record<string, string>): boolean => {
    const c = ptrs.Consumer;
    const p = ptrs.Producer;
    const cIn = !!c && c.startsWith('c_reg1') && c !== 'c_reg1_store';
    const pIn = !!p && p.startsWith('p_reg2') && p !== 'p_reg2_store';
    return cIn && pIn;
  };

  let currentProcessStates: Record<string, ProcessState> = {};
  for (const proc of preset.initialProcesses) {
    currentProcessStates[proc] = 'REMAINDER';
  }

  const totalTraceSteps = preset.steps.length;
  const simulatedSteps: SyncSimulationStep[] = [];

  // Optional Step 0: Initial state before step 1 executes
  if (includeInitialStep) {
    const initialBuffer = computeBufferState(preset.id, cumulativeVariables);

    simulatedSteps.push({
      stepIndex: 0,
      totalSteps: totalTraceSteps,
      presetId: preset.id,
      topicId: preset.topicId,
      scenarioTitle: preset.title,
      slideReference: preset.slideReference,
      activeProcess: 'NONE',
      codeLine: '// Initial State (Ready to begin trace)',
      processStates: { ...currentProcessStates },
      sharedVariables: { ...cumulativeVariables },
      registers: { ...cumulativeRegisters },
      processPointers: {},
      isConcurrentInterleaving: false,
      waitingQueue: [],
      bufferState: initialBuffer,
      explanation: `Initial configuration for "${preset.title}" (${preset.slideReference}). Processes [${preset.initialProcesses.join(', ')}] are initialized. Click Next Step or Auto Play to trace line-by-line.`,
      isViolation: false,
      processesInCritical: [],
      criteriaEvaluation,
    });
  }

  // Step-by-step execution trace
  for (const rawStep of preset.steps) {
    // Merge shared variables cumulatively so no initialized variable disappears mid-trace
    cumulativeVariables = {
      ...cumulativeVariables,
      ...rawStep.sharedVariables,
    };

    // Merge CPU registers cumulatively if present
    if (rawStep.registers) {
      cumulativeRegisters = {
        ...cumulativeRegisters,
        ...rawStep.registers,
      };
      if (isRacePreset) {
        cumulativeVariables = { ...cumulativeVariables, ...rawStep.registers };
      }
    }

    // Track the last executed instruction of every process (persistent per-process arrows)
    const pointersBefore = pointers;
    if (rawStep.lineRef) {
      const ptrs = { ...pointers };
      for (const proc of rawStep.activeProcess.split('&').map((s) => s.trim())) {
        if (proc) ptrs[proc] = rawStep.lineRef;
      }
      pointers = ptrs;
    }
    const isConcurrentInterleaving =
      isRacePreset &&
      (inRegisterBlock(pointersBefore) || inRegisterBlock(pointers) || Boolean(rawStep.isViolation));

    // Normalize process states across all processes in the scenario
    currentProcessStates = normalizeProcessStates(
      preset.initialProcesses,
      currentProcessStates,
      rawStep.processStates
    );

    // Determine waiting queue and critical section occupants
    const waitingQueue = resolveWaitingQueue(rawStep, currentProcessStates);
    const processesInCritical = Object.entries(currentProcessStates)
      .filter(([, state]) => state === 'CRITICAL')
      .map(([proc]) => proc);

    const bufferState = computeBufferState(
      preset.id,
      cumulativeVariables,
      rawStep.bufferState
    );

    simulatedSteps.push({
      stepIndex: rawStep.stepIndex,
      totalSteps: totalTraceSteps,
      presetId: preset.id,
      topicId: preset.topicId,
      scenarioTitle: preset.title,
      slideReference: preset.slideReference,
      activeProcess: rawStep.activeProcess,
      codeLine: rawStep.codeLine,
      lineRef: rawStep.lineRef,
      processStates: { ...currentProcessStates },
      sharedVariables: { ...cumulativeVariables },
      registers: { ...cumulativeRegisters },
      processPointers: { ...pointers },
      isConcurrentInterleaving,
      waitingQueue,
      bufferState,
      explanation: rawStep.explanation,
      mathEval: rawStep.mathEval,
      slideMilestone: rawStep.slideMilestone,
      spinningProcesses: rawStep.spinningProcesses,
      isViolation: Boolean(rawStep.isViolation),
      violationMessage: rawStep.violationMessage,
      processesInCritical,
      criteriaEvaluation,
    });
  }

  return simulatedSteps;
}

// ============================================================================
// 4. Quiz Interfaces & Types (Step 2)
// ============================================================================

export type SyncCellState = 'correct' | 'wrong' | 'empty';

export interface SyncQuizQuestion {
  id: string;
  category: 'process_state' | 'shared_variable' | 'waiting_queue' | 'criteria' | 'violation';
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
}

export interface SyncCriteriaSubmission {
  mutualExclusion?: CriteriaStatus | string;
  progress?: CriteriaStatus | string;
  boundedWaiting?: CriteriaStatus | string;
}

export interface SyncQuizSubmission {
  /** Student's predicted state for each process at the target step */
  processStates?: Record<string, ProcessState | string>;
  /** Student's predicted values for shared variables at the target step */
  sharedVariables?: Record<string, string | number | boolean>;
  /** Student's predicted waiting queue (array of PIDs or comma/space-separated string) */
  waitingQueue?: string[] | string;
  /** Student's evaluation of the 3 Critical Section criteria for this algorithm */
  criteria?: SyncCriteriaSubmission;
  /** Whether a synchronization violation (race condition / deadlock) occurred */
  isViolation?: boolean | string;
  /** Optional answers keyed by question ID if answering the structured multiple-choice questions */
  questionAnswers?: Record<string, string>;
}

export interface SyncQuizChallenge {
  quizId: string;
  presetId: string;
  topicId: SyncTopicId;
  title: string;
  slideReference: string;
  description: string;
  processes: string[];
  initialVariables: Record<string, string | number | boolean>;
  /** Index of the step in the trace that the student is asked to solve */
  targetStepIndex: number;
  /** Steps leading up to (and including) the target step from simulateSyncScenario */
  steps: SyncSimulationStep[];
  /** Preceding steps before the target step (for displaying prior execution context) */
  contextSteps: SyncSimulationStep[];
  /** The target simulation step whose state the student must predict */
  targetStep: SyncSimulationStep;
  /** Ground-truth solution for the target step & algorithm criteria */
  expectedSubmission: Required<Omit<SyncQuizSubmission, 'questionAnswers'>> & {
    waitingQueue: string[];
    isViolation: boolean;
  };
  /** Auto-generated structured quiz questions derived from the simulation trace & theory */
  questions: SyncQuizQuestion[];
}

export interface SyncQuizSectionScore {
  label: string;
  earned: number;
  max: number;
}

export interface SyncQuizEvaluationReport {
  /** Earned score */
  score: number;
  /** Maximum possible score */
  maxScore: number;
  /** Overall percentage (0 - 100) */
  percent: number;
  /** True if percent >= 70 */
  passed: boolean;
  /** Breakdown by grading section */
  sections: SyncQuizSectionScore[];
  /** Per-process grading status */
  processStatesState: Record<string, SyncCellState>;
  /** Per-variable grading status */
  sharedVariablesState: Record<string, SyncCellState>;
  /** Whether the waiting queue matches the expected queue */
  waitingQueueOk: boolean;
  /** Per-criterion grading status */
  criteriaState: {
    mutualExclusion: SyncCellState;
    progress: SyncCellState;
    boundedWaiting: SyncCellState;
  };
  /** Per-question grading status (when questionAnswers are submitted) */
  questionStates: Record<string, SyncCellState>;
  /** Detailed pedagogical diagnostic messages referencing lecture slides */
  diagnostics: string[];
  /** Concise summary message of the student's performance */
  feedbackSummary: string;
}

export interface GenerateSyncQuizOptions {
  /** Specific step index (1-based) to test; defaults to the final step or a key milestone step */
  targetStepIndex?: number;
}

export const SYNC_QUIZ_WEIGHTS = {
  processStates: 30,
  sharedVariables: 30,
  waitingQueue: 15,
  criteria: 25,
} as const;

// ============================================================================
// 5. Quiz Generation & Evaluation Functions
// ============================================================================

const ALL_PROCESS_STATES: ProcessState[] = [
  'ENTRY',
  'CRITICAL',
  'BLOCKED',
  'WAITING',
  'EXIT',
  'REMAINDER',
];

const ALL_CRITERIA_STATUSES: CriteriaStatus[] = [
  'SATISFIED',
  'VIOLATED',
  'PARTIAL',
  'NOT_APPLICABLE',
];

/**
 * Normalizes a waiting queue input (either string like "P0, P2" or string[])
 * into an uppercase array of process identifiers.
 */
function normalizeQueueInput(raw: string[] | string | undefined): string[] {
  if (raw === undefined) {
    return [];
  }
  if (Array.isArray(raw)) {
    return raw.map((item) => String(item).trim().toUpperCase()).filter(Boolean);
  }
  const trimmed = raw.trim();
  if (!trimmed || trimmed.toUpperCase() === 'NONE' || trimmed.toUpperCase() === 'EMPTY' || trimmed === '-') {
    return [];
  }
  return trimmed
    .split(/[\s,;>→|\-[\]]+/)
    .map((token) => token.trim().toUpperCase())
    .filter(Boolean);
}

/**
 * Compares a student's variable input with the expected variable value
 * (handling booleans, numbers, and case-insensitive strings).
 */
function evaluateVariableCell(
  rawStudentVal: string | number | boolean | undefined,
  expectedVal: string | number | boolean
): SyncCellState {
  if (rawStudentVal === undefined || String(rawStudentVal).trim() === '') {
    return 'empty';
  }

  const normalizedStudent = String(rawStudentVal).trim().toLowerCase();
  const normalizedExpected = String(expectedVal).trim().toLowerCase();

  if (typeof expectedVal === 'boolean') {
    const truthy = normalizedStudent === 'true' || normalizedStudent === 't' || normalizedStudent === '1';
    const falsy = normalizedStudent === 'false' || normalizedStudent === 'f' || normalizedStudent === '0';
    if (expectedVal && truthy) return 'correct';
    if (!expectedVal && falsy) return 'correct';
    return 'wrong';
  }

  if (typeof expectedVal === 'number') {
    const parsed = Number(normalizedStudent);
    if (Number.isNaN(parsed)) return 'wrong';
    return Math.abs(parsed - expectedVal) < 1e-9 ? 'correct' : 'wrong';
  }

  // Strings (queues like "[P0, P2]" or "P0, P2"): ignore brackets, commas and spaces
  const squash = (s: string) => s.replace(/[^a-z0-9]/g, '');
  return squash(normalizedStudent) === squash(normalizedExpected) ? 'correct' : 'wrong';
}

/**
 * Generates a synchronization quiz challenge from one of the 7 presets in `syncData.ts`
 * (or a randomly selected preset if none is provided) using `simulateSyncScenario`.
 *
 * @param presetOrTopicId - Optional preset ID, topic ID, or `'RANDOM'`
 * @param options - Optional configuration (such as `targetStepIndex`)
 * @returns `SyncQuizChallenge` containing simulation trace, target step, expected solution, and structured questions
 */
export function generateSyncQuiz(
  presetOrTopicId?: SyncPresetId | SyncTopicId | 'RANDOM' | string,
  options: GenerateSyncQuizOptions = {}
): SyncQuizChallenge {
  const chosenPreset =
    !presetOrTopicId || presetOrTopicId === 'RANDOM'
      ? SYNC_SLIDE_PRESETS[Math.floor(Math.random() * SYNC_SLIDE_PRESETS.length)]
      : resolveSyncPreset(presetOrTopicId);

  const traceSteps = simulateSyncScenario(chosenPreset.id, { includeInitialStep: false });
  const theory = SYNC_ALGORITHMS_THEORY[chosenPreset.topicId];
  const presetCriteria = resolvePresetCriteria(chosenPreset);

  const desiredIndex =
    options.targetStepIndex !== undefined
      ? Math.max(1, Math.min(traceSteps.length, options.targetStepIndex))
      : traceSteps.length;

  const targetStep = traceSteps[desiredIndex - 1];
  const contextSteps = traceSteps.slice(0, desiredIndex - 1);

  const expectedSubmission: SyncQuizChallenge['expectedSubmission'] = {
    processStates: { ...targetStep.processStates },
    sharedVariables: { ...targetStep.sharedVariables },
    waitingQueue: [...targetStep.waitingQueue],
    criteria: {
      mutualExclusion: presetCriteria.mutualExclusion.status,
      progress: presetCriteria.progress.status,
      boundedWaiting: presetCriteria.boundedWaiting.status,
    },
    isViolation: targetStep.isViolation,
  };

  // Build structured questions from the simulated target step & theory
  const questions: SyncQuizQuestion[] = [];

  // 1. Active Process State Question
  const primaryProc =
    chosenPreset.initialProcesses.find((p) => targetStep.activeProcess.includes(p)) ??
    chosenPreset.initialProcesses[0];
  const expectedProcState = targetStep.processStates[primaryProc];

  questions.push({
    id: 'q_process_state',
    category: 'process_state',
    prompt: `At Step ${targetStep.stepIndex} (after executing \`${targetStep.codeLine}\`), what is the state of process ${primaryProc}?`,
    options: ALL_PROCESS_STATES,
    correctAnswer: expectedProcState,
    explanation: `${targetStep.explanation} Process ${primaryProc} is in the ${expectedProcState} state.`,
    points: 20,
  });

  // 2. Shared Variable Value Question
  const variableEntries = Object.entries(targetStep.sharedVariables);
  if (variableEntries.length > 0) {
    const [varName, varVal] = variableEntries[0];
    const distractorOptions =
      typeof varVal === 'boolean'
        ? ['true', 'false']
        : typeof varVal === 'number'
          ? Array.from(new Set([String(varVal), String(varVal - 1), String(varVal + 1), '0']))
          : Array.from(new Set([String(varVal), '0', '1', 'false']));

    questions.push({
      id: 'q_shared_variable',
      category: 'shared_variable',
      prompt: `At Step ${targetStep.stepIndex}, what is the value of shared variable \`${varName}\` after \`${targetStep.codeLine}\`?`,
      options: distractorOptions,
      correctAnswer: String(varVal),
      explanation: `After ${targetStep.activeProcess} executes \`${targetStep.codeLine}\`, \`${varName}\` equals ${String(varVal)}. ${targetStep.explanation}`,
      points: 20,
    });
  }

  // 3. Waiting Queue / Blocked Processes Question
  const expectedQueueStr =
    targetStep.waitingQueue.length > 0 ? targetStep.waitingQueue.join(', ') : 'Empty';
  const queueOptions = Array.from(
    new Set([
      expectedQueueStr,
      'Empty',
      chosenPreset.initialProcesses[0],
      chosenPreset.initialProcesses.slice(0, 2).join(', '),
      chosenPreset.initialProcesses.join(', '),
    ])
  );

  questions.push({
    id: 'q_waiting_queue',
    category: 'waiting_queue',
    prompt: `Which process(es) are waiting/blocked at Step ${targetStep.stepIndex}?`,
    options: queueOptions,
    correctAnswer: expectedQueueStr,
    explanation:
      targetStep.waitingQueue.length > 0
        ? `Currently waiting/blocked: [${expectedQueueStr}]. ${targetStep.explanation}`
        : `No processes are currently in the waiting queue. ${targetStep.explanation}`,
    points: 20,
  });

  // 4. Mutual Exclusion Criterion Question
  questions.push({
    id: 'q_criteria_me',
    category: 'criteria',
    prompt: `Does "${theory.title}" satisfy the Mutual Exclusion requirement?`,
    options: ALL_CRITERIA_STATUSES,
    correctAnswer: theory.evaluation.mutualExclusion.status,
    explanation: theory.evaluation.mutualExclusion.justification,
    points: 20,
  });

  // 5. Progress / Bounded Waiting Criterion Question
  const testBounded =
    theory.evaluation.boundedWaiting.status === 'VIOLATED' ||
    chosenPreset.topicId === 'hardware_n_process_bounded';
  const targetCriterion = testBounded
    ? theory.evaluation.boundedWaiting
    : theory.evaluation.progress;
  const criterionName = testBounded ? 'Bounded Waiting' : 'Progress';

  questions.push({
    id: 'q_criteria_secondary',
    category: 'criteria',
    prompt: `Does "${theory.title}" satisfy the ${criterionName} requirement?`,
    options: ALL_CRITERIA_STATUSES,
    correctAnswer: targetCriterion.status,
    explanation: targetCriterion.justification,
    points: 20,
  });

  return {
    quizId: `quiz_${chosenPreset.id}_step_${targetStep.stepIndex}`,
    presetId: chosenPreset.id,
    topicId: chosenPreset.topicId,
    title: chosenPreset.title,
    slideReference: chosenPreset.slideReference,
    description: chosenPreset.description,
    processes: [...chosenPreset.initialProcesses],
    initialVariables: { ...chosenPreset.initialVariables },
    targetStepIndex: targetStep.stepIndex,
    steps: traceSteps,
    contextSteps,
    targetStep,
    expectedSubmission,
    questions,
  };
}

/**
 * Evaluates a student's synchronization quiz submission against a `SyncQuizChallenge`
 * (or a preset/topic identifier) and returns the numerical score, section breakdown,
 * cell-level validation states, and slide-aligned diagnostic feedback.
 *
 * @param quizOrPresetId - The `SyncQuizChallenge` returned by `generateSyncQuiz` (or preset ID string)
 * @param submission - The student's submitted answers (`SyncQuizSubmission`)
 * @returns `SyncQuizEvaluationReport` with score, percent, cell states, and diagnostic explanations
 */
export function evaluateSyncQuiz(
  quizOrPresetId: SyncQuizChallenge | SyncPresetId | SyncTopicId | string,
  submission: SyncQuizSubmission
): SyncQuizEvaluationReport {
  const quiz =
    typeof quizOrPresetId === 'string'
      ? generateSyncQuiz(quizOrPresetId)
      : quizOrPresetId;

  const { targetStep, expectedSubmission } = quiz;

  const diagnostics: string[] = [];
  const sections: SyncQuizSectionScore[] = [];
  const processStatesState: Record<string, SyncCellState> = {};
  const sharedVariablesState: Record<string, SyncCellState> = {};
  const questionStates: Record<string, SyncCellState> = {};

  // Check if the caller submitted structured questionAnswers ONLY
  const hasStateSubmission =
    submission.processStates !== undefined ||
    submission.sharedVariables !== undefined ||
    submission.waitingQueue !== undefined ||
    submission.criteria !== undefined;

  const hasQuestionAnswers =
    submission.questionAnswers !== undefined &&
    Object.keys(submission.questionAnswers).length > 0;

  // ---- 1. Process States Evaluation (Weight: 30)
  const expectedProcesses = Object.keys(expectedSubmission.processStates);
  let correctProcs = 0;

  for (const proc of expectedProcesses) {
    const expectedState = expectedSubmission.processStates[proc];
    const rawAns = submission.processStates?.[proc];

    if (rawAns === undefined || String(rawAns).trim() === '') {
      processStatesState[proc] = 'empty';
      if (hasStateSubmission || !hasQuestionAnswers) {
        diagnostics.push(
          `Process ${proc}: no state entered (expected ${expectedState} at Step ${targetStep.stepIndex}).`
        );
      }
    } else if (String(rawAns).trim().toUpperCase() === expectedState) {
      processStatesState[proc] = 'correct';
      correctProcs++;
    } else {
      processStatesState[proc] = 'wrong';
      diagnostics.push(
        `Process ${proc} State: expected ${expectedState}, but you entered ${String(rawAns).trim().toUpperCase()}. At Step ${targetStep.stepIndex} (\`${targetStep.codeLine}\`): ${targetStep.explanation}`
      );
    }
  }

  const procEarned =
    expectedProcesses.length > 0
      ? (SYNC_QUIZ_WEIGHTS.processStates * correctProcs) / expectedProcesses.length
      : SYNC_QUIZ_WEIGHTS.processStates;

  // ---- 2. Shared Variables Evaluation (Weight: 30)
  // Variables whose expected value is an empty string (e.g. empty semaphore queues) are not graded
  const expectedVarKeys = Object.keys(expectedSubmission.sharedVariables).filter(
    (k) => String(expectedSubmission.sharedVariables[k]).trim() !== ''
  );
  let correctVars = 0;

  for (const varName of expectedVarKeys) {
    const expectedVal = expectedSubmission.sharedVariables[varName];
    const studentVal = submission.sharedVariables?.[varName];
    const cellState = evaluateVariableCell(studentVal, expectedVal);
    sharedVariablesState[varName] = cellState;

    if (cellState === 'correct') {
      correctVars++;
    } else if (cellState === 'wrong') {
      diagnostics.push(
        `Shared Variable \`${varName}\`: expected ${String(expectedVal)}, but you entered ${String(studentVal)}. Reason: ${targetStep.explanation}`
      );
    } else if (hasStateSubmission || !hasQuestionAnswers) {
      diagnostics.push(
        `Shared Variable \`${varName}\`: value was left blank (expected ${String(expectedVal)}).`
      );
    }
  }

  const varEarned =
    expectedVarKeys.length > 0
      ? (SYNC_QUIZ_WEIGHTS.sharedVariables * correctVars) / expectedVarKeys.length
      : SYNC_QUIZ_WEIGHTS.sharedVariables;

  // ---- 3. Waiting Queue Evaluation (Weight: 15)
  const expQueue = expectedSubmission.waitingQueue.map((p) => p.toUpperCase());
  const gotQueue = normalizeQueueInput(submission.waitingQueue);

  const waitingQueueOk =
    submission.waitingQueue !== undefined &&
    expQueue.length === gotQueue.length &&
    expQueue.every((p, idx) => gotQueue[idx] === p);

  let queueMatchCount = 0;
  for (let i = 0; i < Math.min(expQueue.length, gotQueue.length); i++) {
    if (expQueue[i] === gotQueue[i]) {
      queueMatchCount++;
    }
  }

  const queueEarned =
    submission.waitingQueue === undefined
      ? 0
      : expQueue.length === 0 && gotQueue.length === 0
        ? SYNC_QUIZ_WEIGHTS.waitingQueue
        : (SYNC_QUIZ_WEIGHTS.waitingQueue * queueMatchCount) /
          Math.max(expQueue.length, gotQueue.length, 1);

  if (!waitingQueueOk && (hasStateSubmission || !hasQuestionAnswers)) {
    const expDisplay = expQueue.length > 0 ? `[${expQueue.join(', ')}]` : 'Empty ([])';
    const gotDisplay =
      submission.waitingQueue === undefined
        ? '(not provided)'
        : gotQueue.length > 0
          ? `[${gotQueue.join(', ')}]`
          : 'Empty ([])';
    diagnostics.push(
      `Waiting Queue: expected ${expDisplay}, but got ${gotDisplay}. ${targetStep.explanation}`
    );
  }

  // ---- 4. Critical Section Criteria Evaluation (Weight: 25)
  const evalCriterion = (
    raw: CriteriaStatus | string | undefined,
    expected: CriteriaStatus,
    label: string,
    justification: string
  ): SyncCellState => {
    if (raw === undefined || String(raw).trim() === '') {
      if (hasStateSubmission || !hasQuestionAnswers) {
        diagnostics.push(`${label} Criterion: not answered (expected ${expected}).`);
      }
      return 'empty';
    }
    if (String(raw).trim().toUpperCase() === expected) {
      return 'correct';
    }
    diagnostics.push(
      `${label} Criterion: expected ${expected}, but you selected ${String(raw).trim().toUpperCase()}. ${justification}`
    );
    return 'wrong';
  };

  const crit = targetStep.criteriaEvaluation;
  const meState = evalCriterion(
    submission.criteria?.mutualExclusion,
    crit.mutualExclusion.status,
    'Mutual Exclusion',
    crit.mutualExclusion.justification
  );
  const progState = evalCriterion(
    submission.criteria?.progress,
    crit.progress.status,
    'Progress',
    crit.progress.justification
  );
  const bwState = evalCriterion(
    submission.criteria?.boundedWaiting,
    crit.boundedWaiting.status,
    'Bounded Waiting',
    crit.boundedWaiting.justification
  );

  const criteriaCorrectCount = [meState, progState, bwState].filter(
    (s) => s === 'correct'
  ).length;
  const criteriaEarned = (SYNC_QUIZ_WEIGHTS.criteria * criteriaCorrectCount) / 3;

  // ---- 5. Question Answers Evaluation (if questionAnswers are provided)
  let questionsEarned = 0;
  let questionsMax = 0;

  for (const q of quiz.questions) {
    questionsMax += q.points;
    const rawAns = submission.questionAnswers?.[q.id];
    if (rawAns === undefined || String(rawAns).trim() === '') {
      questionStates[q.id] = 'empty';
      if (hasQuestionAnswers) {
        diagnostics.push(`Question "${q.prompt}": no answer selected.`);
      }
    } else if (
      String(rawAns).trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
    ) {
      questionStates[q.id] = 'correct';
      questionsEarned += q.points;
    } else {
      questionStates[q.id] = 'wrong';
      if (hasQuestionAnswers) {
        diagnostics.push(
          `Question "${q.prompt}": expected "${q.correctAnswer}", but you answered "${rawAns}". ${q.explanation}`
        );
      }
    }
  }

  // Build final sections & score based on submission mode
  let totalEarned = 0;
  let totalMax = 100;

  if (hasQuestionAnswers && !hasStateSubmission) {
    totalEarned = questionsEarned;
    totalMax = questionsMax || 100;
    sections.push({
      label: 'Quiz Questions',
      earned: Math.round(questionsEarned * 100) / 100,
      max: totalMax,
    });
  } else {
    sections.push(
      {
        label: 'Process States',
        earned: Math.round(procEarned * 100) / 100,
        max: SYNC_QUIZ_WEIGHTS.processStates,
      },
      {
        label: 'Shared Variables',
        earned: Math.round(varEarned * 100) / 100,
        max: SYNC_QUIZ_WEIGHTS.sharedVariables,
      },
      {
        label: 'Waiting Queue',
        earned: Math.round(queueEarned * 100) / 100,
        max: SYNC_QUIZ_WEIGHTS.waitingQueue,
      },
      {
        label: 'CS Criteria (ME, Progress, Bounded Waiting)',
        earned: Math.round(criteriaEarned * 100) / 100,
        max: SYNC_QUIZ_WEIGHTS.criteria,
      }
    );
    totalEarned = procEarned + varEarned + queueEarned + criteriaEarned;
    totalMax =
      SYNC_QUIZ_WEIGHTS.processStates +
      SYNC_QUIZ_WEIGHTS.sharedVariables +
      SYNC_QUIZ_WEIGHTS.waitingQueue +
      SYNC_QUIZ_WEIGHTS.criteria;
  }

  const score = Math.round(totalEarned * 100) / 100;
  const percent = Math.round((totalEarned / (totalMax || 1)) * 100);
  const passed = percent >= 70;

  if (percent === 100) {
    diagnostics.unshift(
      `Perfect score (100%)! Every process state, shared variable, queue entry, and synchronization criterion matches ${quiz.slideReference}.`
    );
  }

  const feedbackSummary =
    percent === 100
      ? `Excellent mastery of ${quiz.title}! You accurately traced Step ${targetStep.stepIndex} and evaluated all Critical Section criteria.`
      : passed
        ? `Good job (${percent}%)! You passed the ${quiz.title} assessment. Review the diagnostic notes below to refine the remaining edge cases.`
        : `Score: ${percent}%. Review the step-by-step execution trace for ${quiz.title} (${quiz.slideReference}) and check the diagnostic feedback below.`;

  return {
    score,
    maxScore: totalMax,
    percent,
    passed,
    sections,
    processStatesState,
    sharedVariablesState,
    waitingQueueOk,
    criteriaState: {
      mutualExclusion: meState,
      progress: progState,
      boundedWaiting: bwState,
    },
    questionStates,
    diagnostics,
    feedbackSummary,
  };
}

