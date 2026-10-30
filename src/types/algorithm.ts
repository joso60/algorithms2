export type PillarMode = 'trace' | 'design' | 'analyze';

export type ModuleCategory =
  | 'input-enhancement'
  | 'pre-structuring'
  | 'dynamic-programming';

export type AlgorithmId =
  | 'comparison-counting-sort'
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
  | 'binomial-coeff'
  | 'obst'
  | 'warshall'
  | 'floyd';

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
  highlight?: 'active' | 'split' | 'merged' | 'borrowed' | 'found';
  level?: number;
}

export interface GraphEdgeView {
  from: string;
  to: string;
  weight?: number;
  highlight?: boolean;
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
  };
  outputString?: string; // e.g. POP output or LCS output
}

export interface AlgorithmExample {
  id: string;
  name: string;
  badge: 'Slide Example' | 'Past Exam' | 'Edge Case' | 'Standard Case';
  description: string;
  inputSummary: string;
  customInputDefaults: Record<string, string>;
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
