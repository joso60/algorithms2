import type { AlgorithmId, AlgorithmMeta, TraceStep } from '../types/algorithm';
import { ALGORITHMS_PART1 } from './curriculumPart1';
import { ALGORITHMS_PART2 } from './curriculumPart2';
import { ALGORITHMS_PART3 } from './curriculumPart3';
import { ALGORITHMS_PART4 } from './curriculumPart4';
import {
  generateComparisonCountingSteps,
  generateDistributionCountingV1Steps,
  generateDistributionCountingSteps,
  generateBruteForceSMSteps,
  generateHorspoolSteps,
  generateBoyerMooreSteps,
  generateHashingSteps,
  generateBTreeSteps,
} from './traceGeneratorsPart1';
import {
  generateAssemblyLineSteps,
  generateMatrixChainSteps,
  generateLCSSteps,
  generateCoinRowSteps,
  generateChangeMakingSteps,
  generateCoinCollectingSteps,
  generateKnapsackSteps,
  generateOBSTSteps,
  generateWarshallSteps,
  generateFloydSteps,
} from './traceGeneratorsPart2';
import {
  generateGreedyChangeMakingSteps,
  generatePrimSteps,
  generateKruskalSteps,
  generateDijkstraSteps,
  generateHuffmanSteps,
} from './traceGeneratorsPart3';
import {
  generateSimplexSteps,
  generateMaxFlowSteps,
  generateBipartiteMatchingSteps,
  generateStableMarriageSteps,
  generateBacktrackingSteps,
  generateBranchAndBoundSteps,
} from './traceGeneratorsPart4';

export const MIDTERM_EXAM_FREQUENCY: Record<
  AlgorithmId,
  { count: number; papers: string[] }
> = {
  'comparison-counting-sort': {
    count: 2,
    papers: ['Fall 2020 MidTerm Q3', 'Winter 2023 MidTerm Q1'],
  },
  'distribution-counting-sort-v1': {
    count: 1,
    papers: ['Winter 2023 MidTerm Q1 (1st Variant: A[1..15], C[0..9], B[1..15])'],
  },
  'distribution-counting-sort': {
    count: 3,
    papers: ['Fall 2020 MidTerm Q3 (Form B)', 'Spring 2021 MidTerm Q1', 'Fall 2025 MidTerm Q1'],
  },
  'brute-force-sm': {
    count: 1,
    papers: ['Winter 2023 MidTerm Q2'],
  },
  horspool: {
    count: 3,
    papers: [
      'Fall 2020 MidTerm Q2',
      'Winter 2023 MidTerm Q2',
      'Fall 2025 MidTerm Q2',
    ],
  },
  'boyer-moore': {
    count: 4,
    papers: [
      'Summer 2018 MidTerm Q2',
      'Spring 2021 MidTerm Q2',
      'Winter 2023 MidTerm Q2',
      'Fall 2025 MidTerm Q3',
    ],
  },
  hashing: {
    count: 1,
    papers: ['Winter 2023 MidTerm Q3'],
  },
  'b-trees': {
    count: 4,
    papers: [
      'Fall 2020 MidTerm Q5',
      'Spring 2021 MidTerm Q5',
      'Winter 2023 MidTerm Q3',
      'Fall 2025 MidTerm Q8',
    ],
  },
  'assembly-line': {
    count: 1,
    papers: ['Winter 2023 MidTerm Q4'],
  },
  'matrix-chain': {
    count: 1,
    papers: ['Winter 2023 MidTerm Q4'],
  },
  lcs: {
    count: 0,
    papers: [],
  },
  'coin-row': {
    count: 0,
    papers: [],
  },
  'change-making': {
    count: 0,
    papers: [],
  },
  'coin-collecting': {
    count: 0,
    papers: [],
  },
  'knapsack-01': {
    count: 2,
    papers: ['Spring 2021 MidTerm Q3', 'Fall 2025 MidTerm Q4'],
  },
  obst: {
    count: 4,
    papers: [
      'Summer 2018 MidTerm Q5',
      'Fall 2020 MidTerm Q3',
      'Fall 2020 MidTerm Q4 (Form B)',
      'Fall 2025 MidTerm Q6',
    ],
  },
  warshall: {
    count: 0,
    papers: [],
  },
  floyd: {
    count: 4,
    papers: [
      'Summer 2018 MidTerm Q4',
      'Fall 2020 MidTerm Q1',
      'Fall 2020 MidTerm Q1 (Form B)',
      'Fall 2025 MidTerm Q7',
    ],
  },
  'greedy-change-making': {
    count: 0,
    papers: [],
  },
  prim: {
    count: 0,
    papers: [],
  },
  kruskal: {
    count: 0,
    papers: [],
  },
  dijkstra: {
    count: 0,
    papers: [],
  },
  huffman: {
    count: 0,
    papers: [],
  },
  simplex: {
    count: 0,
    papers: [],
  },
  'max-flow': {
    count: 0,
    papers: [],
  },
  'bipartite-matching': {
    count: 0,
    papers: [],
  },
  'stable-marriage': {
    count: 0,
    papers: [],
  },
  backtracking: {
    count: 0,
    papers: [],
  },
  'branch-and-bound': {
    count: 0,
    papers: [],
  },
};

export const FINAL_EXAM_FREQUENCY: Record<
  AlgorithmId,
  { count: number; papers: string[] }
> = {
  'comparison-counting-sort': {
    count: 0,
    papers: [],
  },
  'distribution-counting-sort-v1': {
    count: 0,
    papers: [],
  },
  'distribution-counting-sort': {
    count: 2,
    papers: ['Winter 2023 Final Q1(a)', 'Fall 2025 CFE Final Q1(a)'],
  },
  'brute-force-sm': {
    count: 1,
    papers: ['Fall 2025 CFE Final Q6'],
  },
  horspool: {
    count: 4,
    papers: [
      'Summer 2018 Final Q1',
      'Winter 2023 Final Q1(a)',
      'Winter 2023 MakeUp Final Q1(a)',
      'Fall 2025 Final Q1(b)',
    ],
  },
  'boyer-moore': {
    count: 3,
    papers: [
      'Winter 2023 Final Q1(a)',
      'Winter 2023 MakeUp Final Q1(b)',
      'Fall 2025 Final Q1(a)',
    ],
  },
  hashing: {
    count: 1,
    papers: ['Winter 2023 Final Q1(b) (String Folding + Quadratic Probing & Chaining)'],
  },
  'b-trees': {
    count: 0,
    papers: [],
  },
  'assembly-line': {
    count: 0,
    papers: [],
  },
  'matrix-chain': {
    count: 0,
    papers: [],
  },
  lcs: {
    count: 0,
    papers: [],
  },
  'coin-row': {
    count: 2,
    papers: ['Fall 2025 Final Q2(a)', 'Fall 2025 CFE Final Q2(a)'],
  },
  'change-making': {
    count: 1,
    papers: ['Fall 2025 Final Q2(b)'],
  },
  'coin-collecting': {
    count: 3,
    papers: ['Summer 2018 Final Q4', 'Fall 2020 Final Q1', 'Spring 2021 Final Q1'],
  },
  'knapsack-01': {
    count: 3,
    papers: ['Summer 2018 Final Q2', 'Winter 2023 Final Q2', 'Winter 2023 MakeUp Final Q2'],
  },
  obst: {
    count: 0,
    papers: [],
  },
  warshall: {
    count: 0,
    papers: [],
  },
  floyd: {
    count: 1,
    papers: ['Fall 2025 CFE Final Q2(b)'],
  },
  'greedy-change-making': {
    count: 1,
    papers: ['Winter 2023 Final Q3(a)'],
  },
  prim: {
    count: 4,
    papers: [
      'Fall 2020 Final Q2 & Q3(a)',
      'Spring 2021 Final Q4(b)',
      'Winter 2023 MakeUp Final Q3(a)',
      'Fall 2025 CFE Final Q3(a)',
    ],
  },
  kruskal: {
    count: 3,
    papers: [
      'Fall 2020 Final Q2 & Q3(b)',
      'Spring 2021 Final Q4(a)',
      'Fall 2025 CFE Final Q3(b)',
    ],
  },
  dijkstra: {
    count: 5,
    papers: [
      'Fall 2020 Final Q7',
      'Spring 2021 Final Q2',
      'Winter 2023 Final Q3(b)',
      'Winter 2023 MakeUp Final Q3(b)',
      'Fall 2025 Final Q3',
    ],
  },
  huffman: {
    count: 1,
    papers: ['Summer 2018 Final Q3'],
  },
  simplex: {
    count: 3,
    papers: [
      'Winter 2023 Final Q4',
      'Winter 2023 MakeUp Final Q4(a,b)',
      'Fall 2025 Final Q4',
    ],
  },
  'max-flow': {
    count: 1,
    papers: ['Fall 2025 CFE Final Q4'],
  },
  'bipartite-matching': {
    count: 2,
    papers: ['Fall 2020 Final Q4', 'Spring 2021 Final Q5(a,b)'],
  },
  'stable-marriage': {
    count: 2,
    papers: ['Fall 2020 Final Q6', 'Spring 2021 Final Q6'],
  },
  backtracking: {
    count: 2,
    papers: ['Fall 2025 Final Q6', 'Fall 2025 CFE Final Q5(a)'],
  },
  'branch-and-bound': {
    count: 1,
    papers: ['Fall 2025 CFE Final Q5(b)'],
  },
};

export const ALGORITHM_CORE_PURPOSE: Record<AlgorithmId, string> = {
  'comparison-counting-sort': 'Sorts an array by counting elements strictly smaller than each key',
  'distribution-counting-sort-v1': 'Sorts integers using frequency counts and prefix sum offsets',
  'distribution-counting-sort': 'Sorts keys across a bounded range using distribution accumulation',
  'brute-force-sm': 'Finds a pattern in text by comparing characters left-to-right at each shift',
  horspool: 'Fast pattern matching scanning right-to-left using bad-symbol shift table t₁(c)',
  'boyer-moore': 'Optimal pattern matching using both bad-symbol t₁(c) and good-suffix d₂(k) shifts',
  hashing: 'Stores & retrieves keys in O(1) avg time via hash functions & collision probing',
  'b-trees': 'Self-balancing multiway search tree for fast disk-based indexing',
  'assembly-line': 'Finds the fastest route through two parallel factory assembly lines',
  'matrix-chain': 'Finds optimal parenthesization order minimizing scalar multiplications',
  lcs: 'Finds the longest common subsequence of characters shared between two strings',
  'coin-row': 'Selects non-adjacent coins to maximize total picked value',
  'change-making': 'Finds the minimum number of coins needed to make change for amount n',
  'coin-collecting': 'Finds the optimal path for a robot collecting maximum coins on a grid',
  'knapsack-01': 'Finds the most valuable item subset fitting within weight capacity W',
  obst: 'Constructs a binary search tree minimizing average search cost given key probabilities',
  warshall: 'Computes the transitive closure (reachability matrix) of a directed graph',
  floyd: 'Finds all-pairs shortest path distances between every vertex in a weighted graph',
  'greedy-change-making': 'Repeatedly picks the largest coin dᵢ ≤ remaining amount N (fast, locally optimal)',
  prim: 'Builds a Minimum Spanning Tree by expanding a single tree V_T via the lightest cut edge',
  kruskal: 'Builds a Minimum Spanning Tree by sorting edges and adding lightest acyclic edges',
  dijkstra: 'Finds single-source shortest paths by extracting min-distance u* and relaxing edges',
  huffman: 'Builds an optimal variable-length prefix-free binary code by merging smallest-weight trees',
  simplex: 'Optimizes a linear objective function over linear inequalities via extreme-point pivoting',
  'max-flow': 'Maximizes flow from source to sink using BFS shortest-augmenting-path labeling',
  'bipartite-matching': 'Finds maximum-cardinality matching in a bipartite graph via augmenting paths',
  'stable-marriage': 'Pairs n men and n women into a stable matching using Gale-Shapley proposals',
  backtracking: 'Explores state-space trees depth-first, pruning non-promising branches (Subset-Sum / N-Queens)',
  'branch-and-bound': 'Solves optimization problems via best-first state-space tree bounds (0-1 Knapsack & Assignment)',
};

export const ALL_ALGORITHMS: AlgorithmMeta[] = [
  ...ALGORITHMS_PART1,
  ...ALGORITHMS_PART2,
  ...ALGORITHMS_PART3,
  ...ALGORITHMS_PART4,
].map((alg) => ({
  ...alg,
  midtermCount: MIDTERM_EXAM_FREQUENCY[alg.id]?.count ?? 0,
  midtermPapers: MIDTERM_EXAM_FREQUENCY[alg.id]?.papers ?? [],
  finalCount: FINAL_EXAM_FREQUENCY[alg.id]?.count ?? 0,
  finalPapers: FINAL_EXAM_FREQUENCY[alg.id]?.papers ?? [],
}));

export function generateTraceForAlgorithm(
  id: AlgorithmId,
  inputs: Record<string, string>
): TraceStep[] {
  switch (id) {
    case 'comparison-counting-sort':
      return generateComparisonCountingSteps(inputs.array || '62, 31, 84, 96, 19, 47');
    case 'distribution-counting-sort-v1':
      return generateDistributionCountingV1Steps(
        inputs.array || '7, 3, 6, 7, 7, 3, 2, 5, 1, 5, 9, 3, 1, 4, 5'
      );
    case 'distribution-counting-sort':
      return generateDistributionCountingSteps(inputs.array || 'b, c, d, c, b, a, a, b');
    case 'brute-force-sm':
      return generateBruteForceSMSteps(
        inputs.text || 'NOBODY_NOTICED_HIM',
        inputs.pattern || 'NOT'
      );
    case 'horspool':
      return generateHorspoolSteps(
        inputs.text || 'GCATCGTAGAGAGTATACGCAGAG',
        inputs.pattern || 'GCAGAG'
      );
    case 'boyer-moore':
      return generateBoyerMooreSteps(
        inputs.text || 'BESS_KNEW_ABOUT_BAOBABS',
        inputs.pattern || 'BAOBAB'
      );
    case 'hashing':
      return generateHashingSteps(
        inputs.keys || '1837, 2209, 7777, 2100, 6897, 4012',
        inputs.tableSize || '10'
      );
    case 'b-trees':
      return generateBTreeSteps(inputs.keys || 'fall2025-q8', inputs.order || '4');
    case 'assembly-line':
      return generateAssemblyLineSteps(
        inputs.a1 || '7, 9, 3, 4, 8, 4',
        inputs.a2 || '8, 5, 6, 4, 5, 7',
        inputs.t1 || '2, 3, 1, 3, 4',
        inputs.t2 || '2, 1, 2, 2, 1',
        inputs.ex || '2, 4, 3, 2'
      );
    case 'matrix-chain':
      return generateMatrixChainSteps(inputs.p || '10, 20, 5, 15, 50, 10, 15');
    case 'lcs':
      return generateLCSSteps(inputs.X || 'ABCBDA', inputs.Y || 'BDCABA');
    case 'coin-row':
      return generateCoinRowSteps(inputs.coins || '5, 1, 2, 10, 6, 2');
    case 'change-making':
      return generateChangeMakingSteps(inputs.amount || '6', inputs.denoms || '1, 3, 4');
    case 'coin-collecting':
      return generateCoinCollectingSteps(
        inputs.grid || '0 0 0 0 1 0; 0 1 0 1 0 0; 0 0 0 1 0 1; 0 0 1 0 0 1; 1 0 0 0 1 0'
      );
    case 'knapsack-01':
      return generateKnapsackSteps(
        inputs.weights || '3, 2, 1, 4, 5',
        inputs.values || '25, 20, 15, 40, 50',
        inputs.capacity || '6'
      );
    case 'obst':
      return generateOBSTSteps(inputs.keys || 'A, B, C, D', inputs.probs || '0.2, 0.1, 0.4, 0.3');
    case 'warshall':
      return generateWarshallSteps(inputs.matrix || '0 1 0 0; 0 0 0 1; 0 0 0 0; 1 0 1 0');
    case 'floyd':
      return generateFloydSteps(
        inputs.matrix || '0 8 inf 1; inf 0 1 inf; 4 inf 0 inf; inf 2 9 0'
      );
    case 'greedy-change-making':
      return generateGreedyChangeMakingSteps(
        inputs.amount || '6',
        inputs.denoms || '1, 3, 4'
      );
    case 'prim':
      return generatePrimSteps(
        inputs.edges ||
          'a-b:3, a-f:5, a-e:6, b-c:1, b-f:4, c-f:4, c-d:6, f-d:5, f-e:2, e-d:8',
        inputs.startNode || 'a'
      );
    case 'kruskal':
      return generateKruskalSteps(
        inputs.edges ||
          'a-b:3, a-f:5, a-e:6, b-c:1, b-f:4, c-f:4, c-d:6, d-f:5, e-f:2, d-e:8'
      );
    case 'dijkstra':
      return generateDijkstraSteps(
        inputs.edges || 'a-b:3, a-d:7, b-c:4, b-d:2, c-d:5, c-e:6, d-e:4',
        inputs.source || 'a',
        inputs.directed || 'false'
      );
    case 'huffman':
      return generateHuffmanSteps(
        inputs.symbols || 'A:0.35, B:0.1, C:0.2, D:0.2, _:0.15',
        inputs.encodeText || 'DAD',
        inputs.decodeBits || '10011011011101'
      );
    case 'simplex':
      return generateSimplexSteps(
        inputs.mode || 'max',
        inputs.objective || '3, 5',
        inputs.constraints || '1, 1 <= 4; 1, 3 <= 6',
        inputs.varNames || 'x, y',
        inputs.slackNames || 'u, v'
      );
    case 'max-flow':
      return generateMaxFlowSteps(
        inputs.edges || '1-2:2, 1-4:3, 2-5:3, 2-3:5, 3-6:2, 4-3:1, 5-6:4',
        inputs.source || '1',
        inputs.sink || '6',
        inputs.preset
      );
    case 'bipartite-matching':
      return generateBipartiteMatchingSteps(
        inputs.v1 || '1, 2, 3',
        inputs.v2 || '4, 5, 6',
        inputs.edges || '1-5, 1-6, 2-5, 3-4, 3-5',
        inputs.initialM || inputs.initialMatching || '1-5'
      );
    case 'stable-marriage':
      return generateStableMarriageSteps(
        inputs.men || 'X, Y, Z',
        inputs.women || 'A, B, C',
        inputs.menPrefs || 'X: A, B, C; Y: C, B, A; Z: C, A, B',
        inputs.womenPrefs || 'A: Y, Z, X; B: Z, Y, X; C: X, Y, Z'
      );
    case 'backtracking':
      return generateBacktrackingSteps(
        inputs.problemType || inputs.mode || 'subset-sum',
        inputs.setS || inputs.set || '2, 4, 7, 9, 11',
        inputs.targetD || inputs.target || '13',
        inputs.stopAtFirst || 'false'
      );
    case 'branch-and-bound':
      return generateBranchAndBoundSteps(
        inputs.problemType || inputs.mode || 'knapsack',
        inputs.items || '1:4:40, 2:7:42, 3:5:25, 4:3:12',
        inputs.capacity || '10'
      );
  }
}

export interface ExamLoopAnalysisProblem {
  id: string;
  title: string;
  examSource: string;
  examType?: 'Midterm' | 'Final' | 'Slide';
  pseudocode: string[];
  basicOp: string;
  inputParam: string;
  steps: {
    lineTitle: string;
    equation: string;
    explanation: string;
  }[];
  finalResult: string;
}

export const EXAM_LOOP_SUMMATION_PROBLEMS: ExamLoopAnalysisProblem[] = [
  {
    id: 'fall2020-q4',
    title: 'Fall 2020 MidTerm Q4 & Fall 2025 MidTerm Q5: Algorithm Mystry(C, v, n)',
    examSource: 'Midterm Exam (Fall 2020 Q4 & Fall 2025 Q5 — 8 Marks)',
    examType: 'Midterm',
    pseudocode: [
      'Algorithm: Mystry(C, v, n)   (Here C is any constant number)',
      '    array m[1..n][0..C]',
      '    array v[1..n]',
      '    for i ← 0 to C do',
      '        m[n][i] ← i',
      '    for i ← n - 1 to 1 step -1 do',
      '        for j ← 0 to C do',
      '            if (v[i] > j || m[i+1][j] < 1 + m[i][j - v[i]]) then',
      '                m[i][j] ← m[i + 1][j]',
      '            else',
      '                m[i][j] ← 1 + m[i][j - v[i]]',
      '    return m',
    ],
    basicOp: 'Assignment & comparison inside the loops',
    inputParam: 'n (input size), C (given constant number)',
    steps: [
      {
        lineTitle: 'Step 1: Convert sequential & nested loops into summations (Slide 36)',
        equation: 'T(n) = ∑_{i=0}^{C} 1  +  ∑_{i=1}^{n-1} ∑_{j=0}^{C} 1',
        explanation:
          'First loop runs from i = 0 to C. Second part is a nested loop where outer loop runs from n-1 down to 1 (equivalent to i = 1 to n-1) and inner loop runs from j = 0 to C.',
      },
      {
        lineTitle: 'Step 2: Solve the first summation and inner summation (Slide 37)',
        equation: '= (C - 0 + 1) + ∑_{i=1}^{n-1} (C - 0 + 1)  =  (C + 1) + ∑_{i=1}^{n-1} (C + 1)',
        explanation: 'Apply standard upper - lower + 1 rule: ∑_{j=0}^{C} 1 = C - 0 + 1 = C + 1.',
      },
      {
        lineTitle: 'Step 3: Factor out constant (C + 1) and solve outer summation (Slides 38–39)',
        equation: '= (C + 1) + (C + 1) ∑_{i=1}^{n-1} 1  =  (C + 1) + (C + 1)(n - 1)',
        explanation: 'Since (C + 1) does not depend on i, factor it out and apply ∑_{i=1}^{n-1} 1 = n - 1.',
      },
      {
        lineTitle: 'Step 4: Expand and cancel terms (Slides 40–42)',
        equation: '= C + 1 + Cn - C + n - 1  =  (C + 1)n  ∈  O(n)  (or Θ(n) since C is constant)',
        explanation: '+C cancels with -C, and +1 cancels with -1, leaving (C + 1)n. Since C is a constant, running time is O(n)!',
      },
    ],
    finalResult: 'T(n) = (C + 1)n ∈ O(n)',
  },
  {
    id: 'cfe2025-q1b-matrixpuzzle',
    title: 'Fall 2025 CFE Final Exam Q1(b): Algorithm MatrixPuzzle(C, w, n)',
    examSource: 'Final Exam (Fall 2025 CFE Final Q1b — 4 Marks)',
    examType: 'Final',
    pseudocode: [
      'Algorithm: MatrixPuzzle(C, w, n)   (Here C is any constant number)',
      '    array T[1..n][0..C]',
      '    array w[1..n]',
      '    for j ← 0 to C do',
      '        T[1][j] ← j * 2',
      '    for i ← 2 to n do',
      '        for j ← 0 to C do',
      '            if (w[i] > j) then',
      '                T[i][j] ← T[i - 1][j]',
      '            else',
      '                T[i][j] ← min(T[i - 1][j], 1 + T[i - 1][j - w[i]])',
      '    return T',
    ],
    basicOp: 'Comparison & assignment inside the loops',
    inputParam: 'n (number of rows), C (constant column bound)',
    steps: [
      {
        lineTitle: 'Step 1: Set up summations for the initialization loop and the nested loops',
        equation: 'T(n) = ∑_{j=0}^{C} 1  +  ∑_{i=2}^{n} ∑_{j=0}^{C} 1',
        explanation:
          'The first for-loop runs j from 0 to C. The second block runs outer loop i from 2 to n and inner loop j from 0 to C.',
      },
      {
        lineTitle: 'Step 2: Evaluate the first summation and inner j-summation',
        equation: '= (C - 0 + 1) + ∑_{i=2}^{n} (C - 0 + 1)  =  (C + 1) + ∑_{i=2}^{n} (C + 1)',
        explanation: 'Using ∑_{j=a}^{b} 1 = b - a + 1, the inner sum from 0 to C equals C + 1.',
      },
      {
        lineTitle: 'Step 3: Factor out (C + 1) and evaluate outer i-summation (from 2 to n)',
        equation: '= (C + 1) + (C + 1)(n - 2 + 1)  =  (C + 1) + (C + 1)(n - 1)',
        explanation: 'The outer loop runs from i = 2 to n, which is (n - 2 + 1) = (n - 1) iterations.',
      },
      {
        lineTitle: 'Step 4: Simplify and state Big-Oh / Theta class',
        equation: '= (C + 1)[1 + n - 1]  =  (C + 1)n  ∈  O(n)  (since C is a constant)',
        explanation: 'Because C is a constant number independent of n, (C + 1)n is linear in n: O(n).',
      },
    ],
    finalResult: 'T(n) = (C + 1)n ∈ O(n)',
  },
  {
    id: 'winter2023-final-q5a',
    title: 'Winter 2023 Final Exam Q5(a): Logarithmic + Nested Linear Loop Analysis',
    examSource: 'Final Exam (Winter 2023 Final Q5a — 4 Marks)',
    examType: 'Final',
    pseudocode: [
      '// Analyze the time complexity of the following code fragment:',
      'i ← n',
      'while (i ≥ 1) do',
      '    x ← x + 1',
      '    i ← i / 2',
      'for j ← 1 to n do',
      '    for k ← 1 to n do',
      '        y ← y + 1',
    ],
    basicOp: 'Arithmetic additions (x ← x + 1 and y ← y + 1)',
    inputParam: 'n (input size)',
    steps: [
      {
        lineTitle: 'Step 1: Analyze the first while-loop (halving i ← i / 2)',
        equation: 'T₁(n) = ⌊log₂ n⌋ + 1  ∈  Θ(log n)',
        explanation: 'Since i starts at n and is divided by 2 on each iteration until i < 1, the while-loop executes Θ(log₂ n) times.',
      },
      {
        lineTitle: 'Step 2: Analyze the sequential nested for-loops (j = 1..n, k = 1..n)',
        equation: 'T₂(n) = ∑_{j=1}^{n} ∑_{k=1}^{n} 1  =  ∑_{j=1}^{n} n  =  n²  ∈  Θ(n²)',
        explanation: 'Both outer loop j and inner loop k run n times independently, giving n × n = n² iterations.',
      },
      {
        lineTitle: 'Step 3: Sum sequential blocks and take dominant term',
        equation: 'T(n) = T₁(n) + T₂(n)  =  (⌊log₂ n⌋ + 1) + n²  ∈  O(n²)',
        explanation: 'For sequential statements, total time is the sum of parts: Θ(log n) + Θ(n²) = Θ(n²).',
      },
    ],
    finalResult: 'T(n) = log₂(n) + n² ∈ O(n²)',
  },
  {
    id: 'winter2023-final-q5b',
    title: 'Winter 2023 Final Exam Q5(b): Dependent Triangular Loop Analysis',
    examSource: 'Final Exam (Winter 2023 Final Q5b — 4 Marks)',
    examType: 'Final',
    pseudocode: [
      '// Analyze the time complexity of the following nested loop:',
      'sum ← 0',
      'for i ← 1 to n do',
      '    for j ← 1 to i do',
      '        sum ← sum + 1',
    ],
    basicOp: 'Addition (sum ← sum + 1)',
    inputParam: 'n (input size)',
    steps: [
      {
        lineTitle: 'Step 1: Express nested loops as a double summation',
        equation: 'T(n) = ∑_{i=1}^{n} ∑_{j=1}^{i} 1',
        explanation: 'Outer loop runs i from 1 to n; inner loop runs j from 1 up to i.',
      },
      {
        lineTitle: 'Step 2: Evaluate inner summation',
        equation: '= ∑_{i=1}^{n} (i - 1 + 1)  =  ∑_{i=1}^{n} i',
        explanation: 'For a fixed i, the inner loop executes exactly i times.',
      },
      {
        lineTitle: 'Step 3: Apply Gauss’s arithmetic series formula',
        equation: '= 1 + 2 + 3 + ... + n  =  n(n + 1) / 2  =  ½n² + ½n  ∈  Θ(n²)',
        explanation: 'The sum of the first n positive integers is n(n + 1)/2, which is quadratic Θ(n²).',
      },
    ],
    finalResult: 'T(n) = n(n + 1)/2 ∈ O(n²)',
  },
  {
    id: 'spring2021-final-q3',
    title: 'Spring 2021 Final Exam Q3: Greedy Change-Making Loop Summation Analysis',
    examSource: 'Final Exam (Spring 2021 Final Q3 — 5 Marks)',
    examType: 'Final',
    pseudocode: [
      'GreedyChange(D[1..m], n)   // D sorted: d₁ > d₂ > ... > dₘ',
      '    for i ← 1 to m do',
      '        count[i] ← ⌊ n / D[i] ⌋',
      '        n ← n mod D[i]',
      '    return count',
    ],
    basicOp: 'Integer division and modulo inside the for-loop',
    inputParam: 'm (number of coin denominations), n (target amount)',
    steps: [
      {
        lineTitle: 'Step 1: Set up the summation for the single for-loop',
        equation: 'T(m) = ∑_{i=1}^{m} 1',
        explanation: 'Using integer division and modulo eliminates the inner while-loop, so the loop runs once per denomination i = 1..m.',
      },
      {
        lineTitle: 'Step 2: Evaluate the summation',
        equation: '= m - 1 + 1  =  m  ∈  Θ(m)',
        explanation: 'If the denominations are already sorted, the loop takes Θ(m) time (or O(m log m) if sorting is required first).',
      },
    ],
    finalResult: 'T(m) = m ∈ Θ(m) (or O(m log m) with sorting)',
  },
  {
    id: 'ccs-formal',
    title: 'Lecture 02 Slide 19–20: Comparison Counting Sort Formal Analysis',
    examSource: 'Midterm Exam (Winter 2023 MidTerm Q1 & Lecture 02 Slide 19)',
    examType: 'Midterm',
    pseudocode: [
      'for i ← 0 to n - 1 do Count[i] ← 0',
      'for i ← 0 to n - 2 do',
      '    for j ← i + 1 to n - 1 do',
      '        if A[i] < A[j] then Count[j]++ else Count[i]++',
      'for i ← 0 to n - 1 do S[Count[i]] ← A[i]',
    ],
    basicOp: 'Comparison & assignment across all loops',
    inputParam: 'n (number of elements)',
    steps: [
      {
        lineTitle: 'Step 1: Set up summations for all three loop blocks',
        equation: 'T(n) = ∑_{i=0}^{n-1} 1  +  ∑_{i=0}^{n-2} ∑_{j=i+1}^{n-1} 1  +  ∑_{i=0}^{n-1} 1',
        explanation: 'First initialization loop + nested comparison loops + final placement loop.',
      },
      {
        lineTitle: 'Step 2: Evaluate inner summation of the middle term',
        equation: '= n + ∑_{i=0}^{n-2} [ (n - 1) - (i + 1) + 1 ] + n  =  2n + ∑_{i=0}^{n-2} (n - 1 - i)',
        explanation: 'Simplify (n - 1) - i - 1 + 1 = n - 1 - i.',
      },
      {
        lineTitle: 'Step 3: Sum the arithmetic series from (n - 1) down to 1',
        equation: '= 2n + [ (n - 1) + (n - 2) + ... + 1 ]  =  2n + [ n(n - 1) ] / 2',
        explanation: 'Use arithmetic series identity ∑_{k=1}^{n-1} k = n(n - 1)/2.',
      },
      {
        lineTitle: 'Step 4: Combine over common denominator',
        equation: '= (n² + 3n) / 2  ∈  Θ(n²)',
        explanation: 'Matches Lecture 02 Slide 20 exact expression.',
      },
    ],
    finalResult: 'C(n) = n(n - 1)/2 ∈ Θ(n²)',
  },
  {
    id: 'horspool-worst',
    title: 'Lecture 04 Slide 64: Horspool’s Algorithm Worst-Case Summation',
    examSource: 'Lecture 04 Slide 64 Nested Loop Derivation',
    examType: 'Slide',
    pseudocode: [
      'i ← m - 1',
      'while i ≤ n - 1 do',
      '    k ← 0',
      '    while k ≤ m - 1 and P[m - 1 - k] = T[i - k] do',
      '        k ← k + 1',
      '    i ← i + Table[T[i]]   // Worst case: shift = 1 each time',
    ],
    basicOp: 'Character comparison P[m - 1 - k] = T[i - k]',
    inputParam: 'n (text length), m (pattern length)',
    steps: [
      {
        lineTitle: 'Step 1: Formulate nested summation when shift is 1 every time',
        equation: 'C_{worst}(n, m) = ∑_{i=m-1}^{n-1} ∑_{k=0}^{m-1} 1',
        explanation: 'Outer loop runs from i = m - 1 to n - 1; inner loop runs from k = 0 to m - 1.',
      },
      {
        lineTitle: 'Step 2: Solve inner summation',
        equation: '= ∑_{i=m-1}^{n-1} (m - 1 - 0 + 1)  =  ∑_{i=m-1}^{n-1} m',
        explanation: 'Inner loop executes m comparisons per alignment.',
      },
      {
        lineTitle: 'Step 3: Solve outer summation (Slide 64 exact algebra)',
        equation: '= m · [ (n - 1) - (m - 1) + 1 ]  =  m(n - 1 - m + 1 + 1)  =  m(n - m + 1)  ∈  Θ(nm)',
        explanation: 'Matches the exact line on Lecture 04 Slide 64!',
      },
    ],
    finalResult: 'C_worst(n, m) = m(n - m + 1) ∈ Θ(nm)',
  },
  {
    id: 'floyd-warshall-sum',
    title: 'Lecture 14 Slides 34 & 57: Warshall’s & Floyd’s Triple Nested Loops',
    examSource: 'Midterm & Final Exam (Fall 2025 CFE Final Q2c & Lecture 14)',
    examType: 'Final',
    pseudocode: [
      'for k ← 1 to n do',
      '    for i ← 1 to n do',
      '        for j ← 1 to n do',
      '            D[i, j] ← min(D[i, j], D[i, k] + D[k, j])',
    ],
    basicOp: 'Inner matrix update (min & addition or boolean OR/AND)',
    inputParam: 'n (number of vertices)',
    steps: [
      {
        lineTitle: 'Step 1: Convert triple nested for-loops into summations',
        equation: 'T(n) = ∑_{k=1}^{n} ∑_{i=1}^{n} ∑_{j=1}^{n} 1',
        explanation: 'All three indices k, i, j run from 1 to n.',
      },
      {
        lineTitle: 'Step 2: Solve innermost j-summation',
        equation: '= ∑_{k=1}^{n} ∑_{i=1}^{n} (n - 1 + 1)  =  ∑_{k=1}^{n} ∑_{i=1}^{n} n',
        explanation: 'Inner loop runs n times.',
      },
      {
        lineTitle: 'Step 3: Solve middle i-summation and outer k-summation',
        equation: '= ∑_{k=1}^{n} n²  =  n³  ∈  Θ(n³)',
        explanation: 'Cubic time complexity in Best, Average, and Worst cases.',
      },
    ],
    finalResult: 'T(n) = n³ ∈ Θ(n³)',
  },
];

// ============================================================================
// RANDOM EXAM-LEVEL QUESTION GENERATOR (Matches Fall 2020 & Fall 2025 Difficulty)
// ============================================================================
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateRandomExamInputForAlgorithm(id: AlgorithmId): {
  inputs: Record<string, string>;
  summaryLabel: string;
} {
  switch (id) {
    case 'comparison-counting-sort': {
      const used = new Set<number>();
      while (used.size < 6) {
        used.add(randInt(12, 95));
      }
      const arr = Array.from(used);
      return {
        inputs: { array: arr.join(', ') },
        summaryLabel: `Random Exam Array (n = 6): [${arr.join(', ')}]`,
      };
    }

    case 'distribution-counting-sort-v1': {
      const maxK = randInt(5, 9);
      const n = randInt(8, 10);
      const arr: number[] = [maxK, randInt(1, maxK - 1), randInt(1, maxK - 1)];
      while (arr.length < n) {
        arr.push(randInt(0, maxK));
      }
      for (let i = arr.length - 1; i > 0; i--) {
        const j = randInt(0, i);
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return {
        inputs: { array: arr.join(', ') },
        summaryLabel: `Random Exam V1 Array (A[1..${n}], C[0..${maxK}], B[1..${n}]): [${arr.join(', ')}]`,
      };
    }

    case 'distribution-counting-sort': {
      const useLetters = Math.random() < 0.6;
      if (useLetters) {
        const alphabet = ['a', 'b', 'c', 'd'];
        const chars: string[] = ['a', 'b', 'c', 'd'];
        while (chars.length < 8) {
          chars.push(pickRandom(alphabet));
        }
        // Shuffle
        for (let i = chars.length - 1; i > 0; i--) {
          const j = randInt(0, i);
          [chars[i], chars[j]] = [chars[j], chars[i]];
        }
        return {
          inputs: { array: chars.join(', ') },
          summaryLabel: `Random Exam Char Array (n = 8, range 'a'..'d'): [${chars.join(', ')}]`,
        };
      } else {
        const base = randInt(10, 30);
        const nums: number[] = [base, base + 1, base + 2];
        while (nums.length < 7) {
          nums.push(base + randInt(0, 2));
        }
        for (let i = nums.length - 1; i > 0; i--) {
          const j = randInt(0, i);
          [nums[i], nums[j]] = [nums[j], nums[i]];
        }
        return {
          inputs: { array: nums.join(', ') },
          summaryLabel: `Random Exam Int Array (n = 7, range ${base}..${base + 2}): [${nums.join(', ')}]`,
        };
      }
    }

    case 'brute-force-sm': {
      const alpha = ['A', 'B', 'C'];
      const patLen = 4;
      const patChars = Array.from({ length: patLen }, () => pickRandom(alpha));
      const pat = patChars.join('');
      const prefix = Array.from({ length: 9 }, () => pickRandom(alpha)).join('');
      const suffix = Array.from({ length: 4 }, () => pickRandom(alpha)).join('');
      const text = prefix.slice(0, 3) + pat.slice(0, 3) + prefix.slice(3, 7) + pat + suffix;
      return {
        inputs: { text, pattern: pat },
        summaryLabel: `Random Exam String Match: T = "${text}", P = "${pat}"`,
      };
    }

    case 'horspool': {
      // Dynamic alphabet: DNA, English letters, or Binary with repeated internal characters
      const archetype = pickRandom(['dna', 'letters', 'binary']);
      let pat = '';
      let alpha: string[] = [];

      if (archetype === 'dna') {
        const dnaPool = ['A', 'C', 'G', 'T'];
        const c1 = pickRandom(dnaPool);
        const c2 = pickRandom(dnaPool.filter((x) => x !== c1));
        const c3 = pickRandom(dnaPool.filter((x) => x !== c1 && x !== c2));
        alpha = [c1, c2, c3, pickRandom(dnaPool)];
        const templates = [
          `${c1}${c2}${c3}${c1}${c3}${c1}`,
          `${c2}${c1}${c2}${c3}${c1}${c2}`,
          `${c3}${c1}${c2}${c1}${c2}`,
          `${c1}${c3}${c2}${c3}${c1}`,
          `${c2}${c3}${c1}${c3}${c2}`,
          `${c1}${c2}${c3}${c2}${c1}${c3}`,
        ];
        pat = pickRandom(templates);
      } else if (archetype === 'binary') {
        alpha = ['0', '1'];
        const b1 = pickRandom(['0', '1']);
        const b2 = b1 === '0' ? '1' : '0';
        const templates = [
          `${b1}${b2}${b1}${b1}${b2}${b1}`,
          `${b2}${b1}${b2}${b2}${b1}`,
          `${b1}${b1}${b2}${b1}${b2}`,
          `${b2}${b2}${b1}${b2}${b1}${b1}`,
        ];
        pat = pickRandom(templates);
      } else {
        const letterSets = [
          ['A', 'B', 'C', 'D'],
          ['T', 'E', 'A', 'M'],
          ['L', 'E', 'A', 'D'],
          ['B', 'A', 'R', 'C'],
          ['X', 'Y', 'Z', 'W'],
        ];
        const chosen = pickRandom(letterSets);
        const [c1, c2, c3] = [chosen[0], chosen[1], chosen[2]];
        alpha = chosen;
        const templates = [
          `${c1}${c2}${c3}${c1}${c2}`,
          `${c3}${c1}${c2}${c3}${c1}`,
          `${c2}${c1}${c3}${c1}${c2}`,
          `${c1}${c3}${c2}${c1}${c3}${c2}`,
        ];
        pat = pickRandom(templates);
      }

      const randChar = () => pickRandom(alpha);
      const randStr = (len: number) => Array.from({ length: len }, randChar).join('');
      const lead = randStr(randInt(3, 5));
      const partial = pat.slice(Math.max(1, pat.length - 3));
      const mid = randStr(randInt(2, 4));
      const text = `${lead}${partial}${mid}${pat}${randStr(randInt(1, 3))}`;

      return {
        inputs: { text, pattern: pat },
        summaryLabel: `Random Exam Horspool Trace: P = "${pat}" (m = ${pat.length}), T = "${text}" (n = ${text.length})`,
      };
    }

    case 'boyer-moore': {
      // 4 Archetypes with unlimited dynamic combinations: Binary, DNA, Letters, and Classic Words
      const archetype = pickRandom(['binary', 'parametric-letters', 'dna', 'classic-words']);
      let pat = '';
      let alpha: string[] = [];

      if (archetype === 'binary') {
        alpha = ['0', '1'];
        const b1 = pickRandom(['0', '1']);
        const b2 = b1 === '0' ? '1' : '0';
        const templates = [
          `${b1}${b2}${b1}${b1}${b2}`,
          `${b2}${b1}${b2}${b2}${b1}`,
          `${b1}${b2}${b1}${b2}${b1}`,
          `${b1}${b1}${b2}${b1}${b1}`,
          `${b2}${b1}${b1}${b2}${b1}${b2}`,
          `${b1}${b2}${b2}${b1}${b2}${b1}`,
          `${b1}${b2}${b1}${b2}${b2}${b1}`,
          `${b2}${b2}${b1}${b2}${b1}${b2}`,
        ];
        pat = pickRandom(templates);
      } else if (archetype === 'dna') {
        const dnaPool = ['A', 'C', 'G', 'T'];
        const c1 = pickRandom(dnaPool);
        const c2 = pickRandom(dnaPool.filter((x) => x !== c1));
        const c3 = pickRandom(dnaPool.filter((x) => x !== c1 && x !== c2));
        alpha = [c1, c2, c3];
        const templates = [
          `${c1}${c2}${c3}${c1}${c2}`,
          `${c2}${c1}${c3}${c2}${c1}`,
          `${c1}${c3}${c2}${c1}${c3}`,
          `${c3}${c1}${c2}${c3}${c1}${c2}`,
          `${c1}${c2}${c1}${c3}${c1}${c2}`,
          `${c2}${c3}${c1}${c2}${c3}${c1}`,
          `${c1}${c1}${c2}${c3}${c1}${c1}`,
        ];
        pat = pickRandom(templates);
      } else if (archetype === 'parametric-letters') {
        const letterSets = [
          ['A', 'B', 'C'],
          ['X', 'Y', 'Z'],
          ['M', 'A', 'N'],
          ['B', 'A', 'R'],
          ['K', 'L', 'M'],
          ['P', 'Q', 'R'],
        ];
        const chosenSet = pickRandom(letterSets);
        const [c1, c2, c3] = [chosenSet[0], chosenSet[1], chosenSet[2]];
        alpha = chosenSet;
        const templates = [
          `${c1}${c2}${c3}${c1}${c2}`,
          `${c3}${c1}${c2}${c1}${c2}`,
          `${c2}${c1}${c2}${c3}${c1}${c2}`,
          `${c1}${c2}${c1}${c3}${c1}${c2}`,
          `${c1}${c3}${c2}${c3}${c1}`,
          `${c2}${c3}${c1}${c2}${c3}${c1}`,
          `${c1}${c2}${c3}${c2}${c1}`,
          `${c3}${c2}${c1}${c3}${c2}`,
        ];
        pat = pickRandom(templates);
      } else {
        // Classic word motifs with repeating suffixes & prefixes
        const classicWords = [
          { pat: 'BAOBAB', alpha: ['A', 'B', 'O'] },
          { pat: 'BANANA', alpha: ['A', 'B', 'N'] },
          { pat: 'ANPANMAN', alpha: ['A', 'M', 'N', 'P'] },
          { pat: 'PAPAYA', alpha: ['A', 'P', 'Y'] },
          { pat: 'COCOON', alpha: ['C', 'N', 'O'] },
          { pat: 'ALFALFA', alpha: ['A', 'F', 'L'] },
          { pat: 'BARBARA', alpha: ['A', 'B', 'R'] },
          { pat: 'TARTAR', alpha: ['A', 'R', 'T'] },
          { pat: 'CANCAN', alpha: ['A', 'C', 'N'] },
          { pat: 'MURMUR', alpha: ['M', 'R', 'U'] },
          { pat: 'ENTENTE', alpha: ['E', 'N', 'T'] },
          { pat: 'BOOBOO', alpha: ['B', 'O'] },
        ];
        const chosen = pickRandom(classicWords);
        pat = chosen.pat;
        alpha = chosen.alpha;
      }

      // Dynamically build text T of length 15–24:
      // Includes 1–2 partial suffix matches so both Bad-Symbol & Good-Suffix are triggered,
      // followed by a full match or near match!
      const randChar = () => pickRandom(alpha);
      const randStr = (len: number) => Array.from({ length: len }, randChar).join('');

      // Part 1: Initial noise of 3–5 chars
      const lead = randStr(randInt(3, 5));

      // Part 2: A partial match of the last 1 or 2 chars of pattern preceded by a mismatch char
      const kMatch = Math.min(2, Math.max(1, pat.length - 2));
      const suffPiece = pat.slice(pat.length - kMatch);
      const candidateMismatches = alpha.filter((x) => x !== pat[pat.length - kMatch - 1]);
      const mismatchChar = candidateMismatches.length > 0 ? pickRandom(candidateMismatches) : randChar();
      const partialBlock1 = randStr(randInt(1, 3)) + mismatchChar + suffPiece;

      // Part 3: Middle noise + full pattern match
      const midNoise = randStr(randInt(2, 4));
      const hasFullMatch = Math.random() < 0.75;
      const tail = hasFullMatch ? pat + randStr(randInt(1, 3)) : randStr(randInt(4, 7));

      const text = `${lead}${partialBlock1}${midNoise}${tail}`;

      return {
        inputs: { text, pattern: pat },
        summaryLabel: `Random Exam Boyer-Moore Trace: P = "${pat}" (m = ${pat.length}), T = "${text}" (n = ${text.length})`,
      };
    }

    case 'hashing': {
      const m = pickRandom([10, 11]);
      // Generate 6 keys with at least 2 collision groups mod m
      const r1 = randInt(1, m - 2);
      const r2 = (r1 + randInt(2, 4)) % m;
      const keys = [
        randInt(10, 80) * m + r1,
        randInt(10, 80) * m + r2,
        randInt(10, 80) * m + r1, // collides with r1
        randInt(10, 80) * m + ((r1 + 1) % m), // tests probing cluster
        randInt(10, 80) * m + r2, // collides with r2
        randInt(10, 80) * m + ((r2 + 2) % m),
      ];
      return {
        inputs: { keys: keys.join(', '), tableSize: String(m) },
        summaryLabel: `Random Exam Hashing (m = ${m}): Keys = [${keys.join(', ')}]`,
      };
    }

    case 'b-trees': {
      const order = pickRandom([4, 5]);
      const used = new Set<number>();
      while (used.size < 8) {
        used.add(randInt(11, 95));
      }
      const keys = Array.from(used);
      return {
        inputs: { keys: keys.join(', '), order: String(order) },
        summaryLabel: `Random Exam B-Tree (Order m = ${order}): Insert [${keys.join(', ')}]`,
      };
    }

    case 'assembly-line': {
      const n = 5;
      const a1 = Array.from({ length: n }, () => randInt(3, 9));
      const a2 = Array.from({ length: n }, () => randInt(3, 9));
      const t1 = Array.from({ length: n - 1 }, () => randInt(1, 4));
      const t2 = Array.from({ length: n - 1 }, () => randInt(1, 4));
      const ex = [randInt(2, 4), randInt(2, 4), randInt(2, 4), randInt(2, 4)];
      return {
        inputs: {
          a1: a1.join(', '),
          a2: a2.join(', '),
          t1: t1.join(', '),
          t2: t2.join(', '),
          ex: ex.join(', '),
        },
        summaryLabel: `Random Exam Assembly Line (n = ${n} stations): a₁=[${a1.join(',')}], a₂=[${a2.join(',')}]`,
      };
    }

    case 'matrix-chain': {
      // 4 matrices (5 dimensions) with clean numbers (5, 10, 15, 20, 25, 30, 40)
      const pool = [5, 10, 15, 20, 25, 30, 40];
      const p = Array.from({ length: 5 }, () => pickRandom(pool));
      return {
        inputs: { p: p.join(', ') },
        summaryLabel: `Random Exam Matrix Chain (n = 4 matrices): Dimensions p = [${p.join(', ')}]`,
      };
    }

    case 'lcs': {
      const alpha = ['A', 'B', 'C', 'D'];
      const X = Array.from({ length: 6 }, () => pickRandom(alpha)).join('');
      const Y = Array.from({ length: 5 }, () => pickRandom(alpha)).join('');
      return {
        inputs: { X, Y },
        summaryLabel: `Random Exam LCS: X = "${X}" (m = 6), Y = "${Y}" (n = 5)`,
      };
    }

    case 'coin-row': {
      const coins = Array.from({ length: 6 }, () => randInt(2, 14));
      return {
        inputs: { coins: coins.join(', ') },
        summaryLabel: `Random Exam Coin-Row (n = 6): Coins = [${coins.join(', ')}]`,
      };
    }

    case 'change-making': {
      const amount = randInt(6, 8);
      const d2 = randInt(2, 3);
      const d3 = randInt(4, 5);
      const denoms = `1, ${d2}, ${d3}`;
      return {
        inputs: { amount: String(amount), denoms },
        summaryLabel: `Random Exam Change-Making: Target n = ${amount}, Coins D = [${denoms}]`,
      };
    }

    case 'coin-collecting': {
      const rows = 4;
      const cols = 5;
      const gridRows: string[] = [];
      for (let r = 0; r < rows; r++) {
        const rowVals: number[] = [];
        for (let c = 0; c < cols; c++) {
          if (r === 0 && c === 0) rowVals.push(0);
          else rowVals.push(Math.random() < 0.38 ? 1 : 0);
        }
        gridRows.push(rowVals.join(' '));
      }
      return {
        inputs: { grid: gridRows.join('; ') },
        summaryLabel: `Random Exam Robot Coin Board (${rows}×${cols} Grid)`,
      };
    }

    case 'knapsack-01': {
      // 4 or 5 items, capacity W = 5 or 6 (exact Fall 2025 Midterm Q4 scale!)
      const n = 4;
      const W = randInt(5, 6);
      const weights = Array.from({ length: n }, () => randInt(1, 4));
      const values = Array.from({ length: n }, () => randInt(2, 9) * 5);
      return {
        inputs: {
          weights: weights.join(', '),
          values: values.join(', '),
          capacity: String(W),
        },
        summaryLabel: `Random Exam 0/1 Knapsack (n = ${n} items, W = ${W}): w=[${weights.join(',')}], v=[${values.join(',')}]`,
      };
    }

    case 'obst': {
      // 4 keys A, B, C, D with probabilities summing to 1.0 (e.g. multiples of 0.05 or 0.1)
      const raw = [randInt(1, 4), randInt(1, 4), randInt(1, 4), randInt(1, 4)];
      const sum = raw.reduce((a, b) => a + b, 0);
      const probs = raw.map((x) => Number((x / sum).toFixed(2)));
      const diff = Number((1 - probs.reduce((a, b) => a + b, 0)).toFixed(2));
      probs[probs.length - 1] = Number((probs[probs.length - 1] + diff).toFixed(2));
      return {
        inputs: {
          keys: 'A, B, C, D',
          probs: probs.join(', '),
        },
        summaryLabel: `Random Exam OBST (n = 4 keys): p = [${probs.join(', ')}]`,
      };
    }

    case 'warshall': {
      const n = 4;
      const mat: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
      // Guarantee a cycle or chain plus 1-2 extra edges
      const order = [0, 1, 2, 3];
      for (let i = order.length - 1; i > 0; i--) {
        const j = randInt(0, i);
        [order[i], order[j]] = [order[j], order[i]];
      }
      mat[order[0]][order[1]] = 1;
      mat[order[1]][order[2]] = 1;
      mat[order[2]][order[3]] = 1;
      mat[order[3]][order[0]] = Math.random() < 0.6 ? 1 : 0;
      const extraI = randInt(0, 3);
      const extraJ = (extraI + randInt(1, 3)) % 4;
      mat[extraI][extraJ] = 1;
      const str = mat.map((r) => r.join(' ')).join('; ');
      return {
        inputs: { matrix: str },
        summaryLabel: `Random Exam Warshall 4×4 Digraph Adjacency Matrix`,
      };
    }

    case 'floyd': {
      // 4x4 weighted digraph (exact Fall 2020 Q1 & Fall 2025 Q7 exam size!)
      const n = 4;
      const mat: string[][] = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (__, j) => (i === j ? '0' : 'inf'))
      );
      // Create a 4-cycle with moderate weights and 2-3 shortcut/cross edges
      for (let i = 0; i < n; i++) {
        mat[i][(i + 1) % n] = String(randInt(1, 5));
      }
      // Add 2 cross edges with larger weights so indirect paths improve them!
      mat[0][2] = String(randInt(7, 12));
      mat[1][3] = String(randInt(6, 11));
      if (Math.random() < 0.5) {
        mat[3][1] = String(randInt(2, 6));
      } else {
        mat[2][0] = String(randInt(3, 7));
      }
      const str = mat.map((r) => r.join(' ')).join('; ');
      return {
        inputs: { matrix: str },
        summaryLabel: `Random Exam Floyd 4×4 Weighted Digraph (with indirect path relaxations)`,
      };
    }

    case 'greedy-change-making': {
      const presets = [
        { amount: '6', denoms: '1, 3, 4' },
        { amount: '8', denoms: '1, 4, 6' },
        { amount: '10', denoms: '1, 5, 7' },
        { amount: '9', denoms: '1, 3, 5, 6' },
        { amount: '11', denoms: '1, 4, 7' },
        { amount: '12', denoms: '1, 5, 8' },
      ];
      const chosen = pickRandom(presets);
      return {
        inputs: chosen,
        summaryLabel: `Random Exam Greedy vs. DP Change-Making: N = ${chosen.amount}, Coins = [${chosen.denoms}]`,
      };
    }

    case 'prim': {
      // 6-vertex connected graph (a..f) with randomized weights on the Slide Ex 01 topology
      const pairs = [
        ['a', 'b'],
        ['a', 'f'],
        ['a', 'e'],
        ['b', 'c'],
        ['b', 'f'],
        ['c', 'f'],
        ['c', 'd'],
        ['f', 'd'],
        ['f', 'e'],
        ['e', 'd'],
      ];
      const edgesList = pairs.map(([u, v]) => `${u}-${v}:${randInt(1, 9)}`);
      return {
        inputs: {
          edges: edgesList.join(', '),
          startNode: 'a',
        },
        summaryLabel: `Random Exam Prim MST (6 Vertices a..f, 10 Weighted Edges, Start = a)`,
      };
    }

    case 'kruskal': {
      const pairs = [
        ['a', 'b'],
        ['a', 'f'],
        ['a', 'e'],
        ['b', 'c'],
        ['b', 'f'],
        ['c', 'f'],
        ['c', 'd'],
        ['d', 'f'],
        ['e', 'f'],
        ['d', 'e'],
      ];
      const edgesList = pairs.map(([u, v]) => `${u}-${v}:${randInt(1, 9)}`);
      return {
        inputs: {
          edges: edgesList.join(', '),
        },
        summaryLabel: `Random Exam Kruskal MST (6 Vertices a..f, 10 Weighted Edges)`,
      };
    }

    case 'dijkstra': {
      const useDirected = Math.random() < 0.5;
      if (!useDirected) {
        const pairs = [
          ['a', 'b'],
          ['a', 'd'],
          ['b', 'c'],
          ['b', 'd'],
          ['c', 'd'],
          ['c', 'e'],
          ['d', 'e'],
        ];
        const edgesList = pairs.map(([u, v]) => `${u}-${v}:${randInt(1, 8)}`);
        return {
          inputs: {
            edges: edgesList.join(', '),
            source: 'a',
            directed: 'false',
          },
          summaryLabel: `Random Exam Dijkstra (5 Vertices a..e, Undirected, Source = a)`,
        };
      } else {
        const pairs = [
          ['s', 't'],
          ['s', 'y'],
          ['t', 'x'],
          ['t', 'y'],
          ['y', 't'],
          ['y', 'x'],
          ['y', 'z'],
          ['x', 'z'],
          ['z', 'x'],
        ];
        const edgesList = pairs.map(([u, v]) => `${u}-${v}:${randInt(1, 9)}`);
        return {
          inputs: {
            edges: edgesList.join(', '),
            source: 's',
            directed: 'true',
          },
          summaryLabel: `Random Exam Dijkstra (5 Vertices s,t,x,y,z, Directed, Source = s)`,
        };
      }
    }

    case 'huffman': {
      const useCounts = Math.random() < 0.5;
      if (useCounts) {
        const syms = ['a', 'b', 'c', 'd', 'e', 'f'];
        const weights = syms.map(() => randInt(5, 45));
        const symbolsStr = syms.map((s, idx) => `${s}:${weights[idx]}`).join(', ');
        return {
          inputs: {
            symbols: symbolsStr,
            encodeText: 'badface',
            decodeBits: '10110011',
          },
          summaryLabel: `Random Exam Huffman Coding (6 Symbols a..f): [${symbolsStr}]`,
        };
      } else {
        const syms = ['A', 'B', 'C', 'D', '_'];
        const raw = syms.map(() => randInt(1, 5));
        const sum = raw.reduce((a, b) => a + b, 0);
        const probs = raw.map((x) => Number((x / sum).toFixed(2)));
        const diff = Number((1 - probs.reduce((a, b) => a + b, 0)).toFixed(2));
        probs[0] = Number((probs[0] + diff).toFixed(2));
        const symbolsStr = syms.map((s, idx) => `${s}:${probs[idx]}`).join(', ');
        return {
          inputs: {
            symbols: symbolsStr,
            encodeText: 'BAD_AD',
            decodeBits: '0110101',
          },
          summaryLabel: `Random Exam Huffman Coding (5 Symbols): [${symbolsStr}]`,
        };
      }
    }

    case 'simplex': {
      const c1 = randInt(2, 6);
      const c2 = randInt(3, 8);
      const b1 = randInt(4, 8);
      const b2 = randInt(6, 12);
      return {
        inputs: {
          objective: `${c1}, ${c2}`,
          constraints: `1, 1 <= ${b1}; 1, 2 <= ${b2}`,
          mode: 'max',
        },
        summaryLabel: `Random Exam Simplex LP: Maximize z = ${c1}x₁ + ${c2}x₂ subject to x₁+x₂ ≤ ${b1}, x₁+2x₂ ≤ ${b2}`,
      };
    }

    case 'max-flow': {
      const c12 = randInt(2, 5);
      const c14 = randInt(3, 6);
      const c25 = randInt(3, 5);
      const c23 = randInt(3, 6);
      const c36 = randInt(2, 5);
      const c43 = randInt(1, 3);
      const c56 = randInt(3, 6);
      const edges = `1-2:${c12}, 1-4:${c14}, 2-5:${c25}, 2-3:${c23}, 3-6:${c36}, 4-3:${c43}, 5-6:${c56}`;
      return {
        inputs: { edges, source: '1', sink: '6' },
        summaryLabel: `Random Exam Max-Flow Network (6 Vertices 1..6, Source = 1, Sink = 6)`,
      };
    }

    case 'bipartite-matching': {
      const presets = [
        {
          v1: '1, 2, 3',
          v2: '4, 5, 6',
          edges: '1-4, 1-5, 1-6, 2-5, 2-6, 3-5',
          initialMatching: '1-5',
        },
        {
          v1: '1, 2, 3, 4',
          v2: '5, 6, 7, 8',
          edges: '1-5, 1-6, 2-5, 2-7, 3-6, 3-8, 4-7, 4-8',
          initialMatching: '1-5, 3-6',
        },
      ];
      const chosen = pickRandom(presets);
      return {
        inputs: chosen,
        summaryLabel: `Random Exam Bipartite Matching: V₁={${chosen.v1}}, V₂={${chosen.v2}}, M₀={${chosen.initialMatching}}`,
      };
    }

    case 'stable-marriage': {
      const presets = [
        {
          men: 'X, Y, Z',
          women: 'A, B, C',
          menPrefs: 'X: A, B, C; Y: B, A, C; Z: A, B, C',
          womenPrefs: 'A: Y, X, Z; B: X, Y, Z; C: X, Y, Z',
        },
        {
          men: 'Bob, Jim, Tom',
          women: 'Ann, Lea, Sue',
          menPrefs: 'Bob: Lea, Ann, Sue; Jim: Lea, Sue, Ann; Tom: Sue, Lea, Ann',
          womenPrefs: 'Ann: Jim, Tom, Bob; Lea: Tom, Bob, Jim; Sue: Jim, Tom, Bob',
        },
      ];
      const chosen = pickRandom(presets);
      return {
        inputs: chosen,
        summaryLabel: `Random Exam Stable Marriage (3×3 Gale-Shapley Instance: Men={${chosen.men}}, Women={${chosen.women}})`,
      };
    }

    case 'backtracking': {
      const presets = [
        { problemType: 'subset-sum', setS: '2, 4, 7, 9, 11', targetD: '13', stopAtFirst: 'false' },
        { problemType: 'subset-sum', setS: '1, 5, 7, 9', targetD: '10', stopAtFirst: 'false' },
        { problemType: 'subset-sum', setS: '3, 5, 6, 7', targetD: '15', stopAtFirst: 'false' },
        { problemType: 'n-queens', setS: '4', targetD: '4', stopAtFirst: 'false' },
      ];
      const chosen = pickRandom(presets);
      return {
        inputs: chosen,
        summaryLabel:
          chosen.problemType === 'n-queens'
            ? `Random Exam Backtracking: 4-Queens State-Space Tree`
            : `Random Exam Subset-Sum Backtracking: S = {${chosen.setS}}, d = ${chosen.targetD}`,
      };
    }

    case 'branch-and-bound': {
      const presets = [
        {
          problemType: 'knapsack',
          items: '1:2:12, 2:1:10, 3:3:20, 4:2:15',
          capacity: '5',
        },
        {
          problemType: 'knapsack',
          items: '1:4:40, 2:7:42, 3:5:25, 4:3:12',
          capacity: '10',
        },
        {
          problemType: 'assignment',
          items: '9, 2, 7, 8; 6, 4, 3, 7; 5, 8, 1, 8; 7, 6, 9, 4',
          capacity: '4',
        },
      ];
      const chosen = pickRandom(presets);
      return {
        inputs: chosen,
        summaryLabel:
          chosen.problemType === 'assignment'
            ? `Random Exam Branch & Bound: 4×4 Assignment Problem`
            : `Random Exam Branch & Bound 0-1 Knapsack (W = ${chosen.capacity}, Items = [${chosen.items}])`,
      };
    }
  }
}
