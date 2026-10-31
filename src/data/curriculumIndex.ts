import type { AlgorithmId, AlgorithmMeta, TraceStep } from '../types/algorithm';
import { ALGORITHMS_PART1 } from './curriculumPart1';
import { ALGORITHMS_PART2 } from './curriculumPart2';
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

export const MIDTERM_EXAM_FREQUENCY: Record<
  AlgorithmId,
  { count: number; papers: string[] }
> = {
  'comparison-counting-sort': {
    count: 1,
    papers: ['Winter 2023 MidTerm Q1'],
  },
  'distribution-counting-sort-v1': {
    count: 1,
    papers: ['Winter 2023 MidTerm Q1 (1st Variant: A[1..15], C[0..9], B[1..15])'],
  },
  'distribution-counting-sort': {
    count: 2,
    papers: ['Spring 2021 MidTerm Q1', 'Fall 2025 MidTerm Q1'],
  },
  'brute-force-sm': {
    count: 1,
    papers: ['Winter 2023 MidTerm Q2'],
  },
  horspool: {
    count: 3,
    papers: ['Fall 2020 MidTerm Q2', 'Winter 2023 MidTerm Q2', 'Fall 2025 MidTerm Q2'],
  },
  'boyer-moore': {
    count: 3,
    papers: ['Spring 2021 MidTerm Q2', 'Winter 2023 MidTerm Q2', 'Fall 2025 MidTerm Q3'],
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
    count: 2,
    papers: ['Fall 2020 MidTerm Q3', 'Fall 2025 MidTerm Q6'],
  },
  warshall: {
    count: 0,
    papers: [],
  },
  floyd: {
    count: 2,
    papers: ['Fall 2020 MidTerm Q1', 'Fall 2025 MidTerm Q7'],
  },
};

export const ALL_ALGORITHMS: AlgorithmMeta[] = [...ALGORITHMS_PART1, ...ALGORITHMS_PART2].map(
  (alg) => ({
    ...alg,
    midtermCount: MIDTERM_EXAM_FREQUENCY[alg.id]?.count ?? 0,
    midtermPapers: MIDTERM_EXAM_FREQUENCY[alg.id]?.papers ?? [],
  })
);

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
  }
}

export interface ExamLoopAnalysisProblem {
  id: string;
  title: string;
  examSource: string;
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
    examSource: 'Exact 6-pt / 8-pt Question from Past Midterms (Slides 34–42)',
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
    id: 'ccs-formal',
    title: 'Lecture 02 Slide 19–20: Comparison Counting Sort Formal Analysis',
    examSource: 'Lecture 02 Formal Summation Derivation',
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
    examSource: 'Lecture 14 Formal Summation Analysis',
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
      // Exam-style DNA or 4-letter string with repeated letters inside pattern (like GCAGAG)
      const alphabet = ['A', 'C', 'G', 'T'];
      const c1 = pickRandom(alphabet);
      const c2 = pickRandom(alphabet.filter((x) => x !== c1));
      const c3 = pickRandom(alphabet.filter((x) => x !== c1 && x !== c2));
      const patterns = [
        `${c1}${c2}${c3}${c1}${c3}${c1}`,
        `${c2}${c1}${c2}${c3}${c1}${c2}`,
        `${c3}${c1}${c2}${c1}${c2}`,
        `${c1}${c3}${c2}${c3}${c1}`,
      ];
      const pat = pickRandom(patterns);
      // Build text with 2-3 partial suffix matches before full match at end
      const noise1 = `${c1}${c2}${c3}${pickRandom(alphabet)}`;
      const partial1 = pat.slice(2); // matches last m-2 chars!
      const noise2 = `${pickRandom(alphabet)}${c1}${c2}`;
      const partial2 = pat.slice(3);
      const text = `${noise1}${partial1}${noise2}${partial2}${c3}${pat}`;
      return {
        inputs: { text, pattern: pat },
        summaryLabel: `Random Exam Horspool Trace: P = "${pat}" (m = ${pat.length}), T = "${text}"`,
      };
    }

    case 'boyer-moore': {
      // Binary or 3-letter pattern with repeating suffixes (like 01010 or BAOBAB)
      const bmPresets = [
        { pat: '10101', alpha: ['0', '1'] },
        { pat: '01101', alpha: ['0', '1'] },
        { pat: '11010', alpha: ['0', '1'] },
        { pat: 'ABCBAB', alpha: ['A', 'B', 'C'] },
        { pat: 'CABAB', alpha: ['A', 'B', 'C'] },
        { pat: 'BCABAB', alpha: ['A', 'B', 'C'] },
      ];
      const chosen = pickRandom(bmPresets);
      const pat = chosen.pat;
      const randChunk = (len: number) =>
        Array.from({ length: len }, () => pickRandom(chosen.alpha)).join('');
      const text = `${randChunk(4)}${pat.slice(2)}${randChunk(4)}${pat.slice(1)}${randChunk(2)}${pat}`;
      return {
        inputs: { text, pattern: pat },
        summaryLabel: `Random Exam Boyer-Moore Trace: P = "${pat}", T = "${text}"`,
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
  }
}
