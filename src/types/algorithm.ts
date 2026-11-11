export type PillarMode = 'trace' | 'design' | 'analyze';

export type ModuleCategory =
  | 'input-enhancement'
  | 'pre-structuring'
  | 'dynamic-programming'
  | 'greedy'
  | 'iterative-improvement'
  | 'limitations-of-power';

export type AlgorithmId =
  | 'comparison-counting-sort'
  | 'distribution-counting-sort-v1'
  | 'distribution-counting-sort'
  | 'brute-force-sm'
  | 'horspool'
  | 'boyer-moore'
  | 'hashing'
  | 'b-trees'
  | 'assembly-line'
  | 'matrix-chain'
  | 'lcs'
  | 'coin-row'
  | 'change-making'
  | 'coin-collecting'
  | 'knapsack-01'
  | 'obst'
  | 'warshall'
  | 'floyd'
  | 'greedy-change-making'
  | 'prim'
  | 'kruskal'
  | 'dijkstra'
  | 'huffman'
  | 'simplex'
  | 'max-flow'
  | 'bipartite-matching'
  | 'stable-marriage'
  | 'backtracking'
  | 'branch-and-bound';

export type SyllabusStatus = 'required' | 'partial-exclusion' | 'excluded';

export interface SyllabusExclusionInfo {
  status: SyllabusStatus;
  badgeLabel?: string; // e.g., "EXCLUDED" or "SLIDES 95-128 EXCLUDED"
  excludedSlides?: string;
  requiredScope?: string;
  reason?: string;
  affectedExams?: string[];
}

export type CellState = 'default' | 'active' | 'compare' | 'match' | 'mismatch' | 'path' | 'computed' | 'unvisited';

export interface TableCellData {
  value: string | number;
  subText?: string; // e.g., arrow "↖", "↑", "←" or k-value or split index
  state?: CellState;
  tooltip?: string;
  editableKey?: string; // used in "Test Yourself" exam practice mode
  expectedValue?: string | number;
  mistakeExplanation?: string;
}

export interface VisualTable {
  id: string;
  title: string;
  subtitle?: string;
  rowHeaders?: (string | number)[];
  colHeaders?: (string | number)[];
  rows: TableCellData[][];
  indexBase?: string; // e.g., "0-based indexing" or "1-based indexing"
  highlightRow?: number;
  highlightCol?: number;
  badge?: string;
}

export interface StringAlignmentView {
  text: string;
  pattern: string;
  alignIndex: number; // 0-based start of pattern in text
  currentCompareTextIdx?: number;
  currentComparePatIdx?: number;
  matchedIndices?: number[]; // indices in pattern that matched in current trial
  mismatchedIndex?: number; // index in pattern that mismatched
  historyRows: {
    alignIndex: number;
    pattern: string;
    shiftApplied?: number;
    shiftFormula?: string;
    comparedIndices: { patIdx: number; match: boolean }[];
  }[];
}

export interface BTreeNodeView {
  id: string;
  keys: (string | number)[];
  children?: BTreeNodeView[];
  highlight?: 'active' | 'split' | 'merged' | 'borrowed' | 'found' | 'overflow';
  level?: number;
  activeKey?: string | number;
  medianKey?: string | number;
  badgeText?: string;
}

export interface GraphEdgeView {
  from: string;
  to: string;
  weight?: number;
  highlight?: boolean;
  state?: 'default' | 'tree' | 'candidate' | 'selected' | 'rejected' | 'relaxed';
  label?: string;
}

export interface HuffmanTreeNodeView {
  id: string;
  weight: number;
  weightLabel: string;
  symbol?: string; // present on leaf nodes
  code?: string; // binary codeword from root
  highlight?: 'active' | 'merged-child' | 'new-parent' | 'default';
  left?: HuffmanTreeNodeView | null;
  right?: HuffmanTreeNodeView | null;
}

export interface HuffmanStepView {
  phase: 'init' | 'sort' | 'merge' | 'codes' | 'encode-decode';
  forestQueue: HuffmanTreeNodeView[]; // ordered trees in the priority queue
  mergingPairIds?: [string, string];
  newMergedNodeId?: string;
  fixedLengthTree?: HuffmanTreeNodeView | null;
  codewords?: {
    symbol: string;
    weightLabel: string;
    probability: number;
    huffmanCode: string;
    huffmanBits: number;
    fixedCode: string;
    fixedBits: number;
  }[];
  avgBitsPerSymbol?: string;
  fixedBitsPerSymbol?: number;
  compressionRatio?: string;
  encodeDemo?: {
    plainText: string;
    segments: { symbol: string; code: string }[];
    encodedBits: string;
  };
  decodeDemo?: {
    bitStream: string;
    segments: { bits: string; symbol: string }[];
    decodedText: string;
  };
}

export interface OBSTTreeNodeView {
  keyIndex: number; // 1..n
  label: string; // e.g. 'A', 'B', 'C'...
  role: 'current' | 'left-child' | 'right-child' | 'placed';
  left?: OBSTTreeNodeView | null;
  right?: OBSTTreeNodeView | null;
}

export interface OBSTTreeConstructionView {
  n: number;
  keys: string[];
  rootMatrix: (number | null)[][]; // 1-based R[1..n][1..n]
  currentCell?: { i: number; j: number; k: number; label: string };
  leftChildCell?: { i: number; j: number; k: number; label: string } | null;
  rightChildCell?: { i: number; j: number; k: number; label: string } | null;
  treeRoot: OBSTTreeNodeView | null;
  stepCaption: string;
  treeStepIndex: number; // 1..totalTreeSteps
  totalTreeSteps: number;
  expectedCost: number;
}

export interface StateSpaceTreeNodeView {
  id: string;
  parentId?: string | null;
  edgeLabel?: string; // e.g., "w/ 2", "w/o 2", "a→1", "Q1 at col 2"
  mainLabel: string; // e.g., "0", "2", "w=3, v=11"
  subLabel?: string; // e.g., "ub = 16.34", "lb = 13", "6+7 > 10"
  title?: string;
  subtitle?: string;
  detail?: string;
  boundLabel?: string;
  nodeOrder?: number; // order of creation / visit
  status: 'active' | 'promising' | 'pruned' | 'solution' | 'visited';
  pruneReason?: string; // e.g., "X (w=6 > 5)", "X (6+7 > 10)"
  level: number; // 0..n
  xPercent: number; // 0..100 horizontal layout position
}

export interface StateSpaceTreeView {
  title: string;
  subtitle?: string;
  mode: 'backtracking' | 'branch-and-bound';
  problemType?: string;
  nodes: StateSpaceTreeNodeView[];
  liveNodesLabel?: string;
  bestSolutionLabel?: string;
  pruningRuleNote?: string;
  operationNote?: string;
}

export interface TraceStep {
  stepNumber: number;
  codeLine: number; // 1-based line in pseudocode
  title: string;
  explanation: string;
  formula?: string;
  variables?: Record<string, string | number>;
  tables: VisualTable[];
  stringView?: StringAlignmentView;
  obstTreeView?: OBSTTreeConstructionView;
  huffmanView?: HuffmanStepView;
  stateSpaceTreeView?: StateSpaceTreeView;
  bTreeView?: {
    order: number;
    minKeys: number;
    maxKeys: number;
    root: BTreeNodeView;
    operationNote: string;
  };
  graphView?: {
    nodes: string[];
    edges: GraphEdgeView[];
    directed: boolean;
    weighted: boolean;
    activeK?: string;
    activeI?: string;
    activeJ?: string;
    nodePositions?: Record<string, { x: number; y: number }>;
    nodeStates?: Record<string, 'default' | 'in-tree' | 'active' | 'fringe' | 'source'>;
    nodeBadges?: Record<string, string>;
    vtLabel?: string;
    etLabel?: string;
    queueLabel?: string;
    totalWeight?: number | string;
    caption?: string;
  };
  outputString?: string; // e.g. POP output or LCS output
}

export interface ExamPaperSimulationInfo {
  examPaper?: string; // e.g. "Fall 2025 Final Exam — Q6 (12 Marks)"
  examTitle?: string;
  examType?: 'Midterm' | 'Final';
  marks?: string;
  questionStatement?: string;
  questionText?: string;
  subQuestions?: string[];
  requiredStepsGuide?: string[];
}

export interface AlgorithmExample {
  id: string;
  name: string;
  badge: 'Slide Example' | 'Past Exam' | 'Edge Case' | 'Standard Case';
  description: string;
  inputSummary: string;
  customInputDefaults: Record<string, string>;
  examSimulation?: ExamPaperSimulationInfo;
}

export interface DesignStepInfo {
  stepNumber: number;
  title: string;
  subtitle: string;
  content: string[];
  formulaBox?: string;
  codeSnippet?: string;
}

export interface InteractiveDesignChallenge {
  scenarioTitle: string;
  problemStatement: string;
  questions: {
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface ComplexityAnalysisData {
  bestTime: string;
  avgTime: string;
  worstTime: string;
  extraSpace: string;
  tradeOffSummary: string;
  basicOperation: string;
  inputSizeParam: string;
  summationSteps: {
    label: string;
    math: string;
    note: string;
  }[];
  examNote?: string;
  comparisonTable?: {
    headers: string[];
    rows: string[][];
  };
}

export interface AlgorithmMeta {
  id: AlgorithmId;
  title: string;
  shortTitle: string;
  lectureFile: string;
  category: ModuleCategory;
  categoryLabel: string;
  indexingRule: string;
  midtermCount?: number;
  midtermPapers?: string[];
  finalCount?: number;
  finalPapers?: string[];
  syllabusInfo?: SyllabusExclusionInfo;
  summary: string;
  pseudocodeTitle: string;
  pseudocodeLines: string[];
  secondaryPseudocodeTitle?: string;
  secondaryPseudocodeLines?: string[];
  examples: AlgorithmExample[];
  customFields: {
    key: string;
    label: string;
    placeholder: string;
    helpText: string;
  }[];
  designParadigmName: string;
  designSteps: DesignStepInfo[];
  designChallenge: InteractiveDesignChallenge;
  analysis: ComplexityAnalysisData;
}
