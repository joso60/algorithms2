import React, { useState } from 'react';
import type { AlgorithmMeta } from '../types/algorithm';
import {
  Activity,
  Cpu,
  Sigma,
  CheckCircle2,
  FileText,
} from 'lucide-react';

interface AnalyzeViewProps {
  algorithm: AlgorithmMeta;
}

interface SimpleSolvedExample {
  id: string;
  category: 'Summation Formula' | 'Loop Analysis (Exam)';
  title: string;
  source: string;
  problemStatement: string;
  codeOrMath: string[];
  basicOp?: string;
  steps: {
    stepTitle: string;
    formula: string;
    explanation: string;
  }[];
  finalAnswer: string;
}

const SIMPLE_SOLVED_EXAMPLES: SimpleSolvedExample[] = [
  {
    id: 'slide-123-const',
    category: 'Summation Formula',
    title: 'Example 1: Constant Summation from k = 0 to n',
    source: 'File 01 — Slide 123 Review Question #51',
    problemStatement: 'Find the closed-form value of the summation Σ (from k = 0 to n) of 3:',
    codeOrMath: ['∑_{k = 0}^{n} 3 = ?'],
    steps: [
      {
        stepTitle: 'Step 1: Factor out the constant 3',
        formula: '∑_{k = 0}^{n} 3 = 3 × ∑_{k = 0}^{n} 1',
        explanation: 'A constant inside a summation can be moved outside the Σ sign.',
      },
      {
        stepTitle: 'Step 2: Apply the Upper − Lower + 1 rule',
        formula: '∑_{k = 0}^{n} 1 = (n − 0 + 1) = n + 1',
        explanation: 'Be careful: starting from k = 0 up to n has (n + 1) terms, not n!',
      },
      {
        stepTitle: 'Step 3: Multiply by 3',
        formula: '3 × (n + 1) = 3n + 3',
        explanation: 'Distribute 3 across (n + 1) to get the final answer.',
      },
    ],
    finalAnswer: '3n + 3',
  },
  {
    id: 'slide-124-linear',
    category: 'Summation Formula',
    title: 'Example 2: Linear Summation Σ (k − 1)',
    source: 'File 01 — Slide 124 Review Question #52',
    problemStatement: 'Find the expansion of the summation Σ (from k = 0 to n) of (k − 1):',
    codeOrMath: ['∑_{k = 0}^{n} (k − 1) = ?'],
    steps: [
      {
        stepTitle: 'Step 1: Split the summation into two parts',
        formula: '∑_{k = 0}^{n} (k − 1) = ∑_{k = 0}^{n} k − ∑_{k = 0}^{n} 1',
        explanation: 'Separate the linear term k and the constant term 1.',
      },
      {
        stepTitle: 'Step 2: Substitute the Arithmetic Series formula for Σ k',
        formula: '∑_{k = 0}^{n} k = n(n + 1) / 2 = (n² + n) / 2',
        explanation: 'Adding k = 0 does not change the sum 1 + 2 + ... + n = n(n + 1) / 2.',
      },
      {
        stepTitle: 'Step 3: Combine over a common denominator 2',
        formula: 'Slide shortcut: (n² + n)/2 − 1 = (n² + n − 2) / 2   |   Exact math: (n² + n)/2 − (n + 1) = (n² − n − 2) / 2',
        explanation:
          'Note: In Slide 124 Review Q52, the slide treats "- 1" outside the sum as (n² + n)/2 − 1 = (n² + n − 2)/2.',
      },
    ],
    finalAnswer: '(n² + n − 2) / 2  (Slide Q52 Key)',
  },
  {
    id: 'slide-125-cancel',
    category: 'Summation Formula',
    title: 'Example 3: Canceling Two Summations',
    source: 'File 01 — Slide 125 Review Question #53',
    problemStatement: 'Simplify the difference between the two summations:',
    codeOrMath: ['∑_{k = 0}^{n − 2} k  −  ∑_{k = 2}^{n − 1} k = ?'],
    steps: [
      {
        stepTitle: 'Step 1: Write out the terms of the first summation (k = 0 to n − 2)',
        formula: '∑_{k = 0}^{n − 2} k = 0 + 1 + [2 + 3 + ... + (n − 2)]',
        explanation: 'Separate the first two terms (0 + 1) from the shared middle range [2 ... n − 2].',
      },
      {
        stepTitle: 'Step 2: Write out the terms of the second summation (k = 2 to n − 1)',
        formula: '∑_{k = 2}^{n − 1} k = [2 + 3 + ... + (n − 2)] + (n − 1)',
        explanation: 'Separate the shared middle range [2 ... n − 2] from the last term (n − 1).',
      },
      {
        stepTitle: 'Step 3: Subtract and cancel the identical middle terms [2 ... n − 2]',
        formula: '(0 + 1) − (n − 1) = 1 − n + 1 = 2 − n',
        explanation: 'All terms from k = 2 to n − 2 cancel out, leaving only 1 − (n − 1) = 2 − n.',
      },
    ],
    finalAnswer: '2 − n',
  },
  {
    id: 'simple-single-loop',
    category: 'Loop Analysis (Exam)',
    title: 'Example 4: Simple Single Loop Analysis',
    source: 'File 02 — Sequential Search / Array Sum',
    problemStatement: 'Find the time complexity C(n) for counting the basic operation in a single loop:',
    codeOrMath: [
      's ← 0',
      'for i ← 0 to n − 1 do',
      '    s ← s + A[i]    // Basic Operation: Addition',
    ],
    basicOp: 'Addition (s + A[i]) inside the loop',
    steps: [
      {
        stepTitle: 'Step 1: Set up the summation for the loop bounds',
        formula: 'C(n) = ∑_{i = 0}^{n − 1} 1',
        explanation: 'The loop runs from lower bound l = 0 to upper bound u = n − 1, executing 1 addition each time.',
      },
      {
        stepTitle: 'Step 2: Apply the rule (Upper − Lower + 1)',
        formula: 'C(n) = (n − 1) − 0 + 1 = n',
        explanation: 'Simplify the expression to get the exact count of basic operations.',
      },
    ],
    finalAnswer: 'C(n) = n ∈ Θ(n)',
  },
  {
    id: 'simple-nested-loop',
    category: 'Loop Analysis (Exam)',
    title: 'Example 5: Simple Nested Loop (Triangular Loop)',
    source: 'File 02 & File 03 — Selection / Comparison Counting Sort',
    problemStatement: 'Set up and solve the summation for a nested loop where j starts at i + 1:',
    codeOrMath: [
      'for i ← 0 to n − 2 do',
      '    for j ← i + 1 to n − 1 do',
      '        if A[i] < A[j] then ...   // Basic Operation: Comparison',
    ],
    basicOp: 'Key Comparison (A[i] < A[j]) in the inner loop',
    steps: [
      {
        stepTitle: 'Step 1: Write the double summation (outer loop i, inner loop j)',
        formula: 'C(n) = ∑_{i = 0}^{n − 2} ∑_{j = i + 1}^{n − 1} 1',
        explanation: 'Each iteration of the inner loop performs 1 comparison.',
      },
      {
        stepTitle: 'Step 2: Evaluate the inner summation using (Upper − Lower + 1)',
        formula: 'C(n) = ∑_{i = 0}^{n − 2} [ (n − 1) − (i + 1) + 1 ] = ∑_{i = 0}^{n − 2} (n − 1 − i)',
        explanation: 'For i = 0, inner loop runs (n − 1) times; for i = 1, (n − 2) times; down to 1.',
      },
      {
        stepTitle: 'Step 3: Apply the Arithmetic Series formula Σ k = n(n − 1) / 2',
        formula: 'C(n) = (n − 1) + (n − 2) + ... + 1 = n(n − 1) / 2 ≈ ½ n²',
        explanation: 'The sum of integers from 1 to n − 1 is n(n − 1) / 2.',
      },
    ],
    finalAnswer: 'C(n) = n(n − 1) / 2 ∈ Θ(n²)',
  },
  {
    id: 'exam-mystry-loop',
    category: 'Loop Analysis (Exam)',
    title: 'Example 6: Past Exam Question — Algorithm Mystry(C, v, n)',
    source: 'Fall 2020 MidTerm Q4 & Fall 2025 MidTerm Q5',
    problemStatement: 'Find the Worst-Case and Best-Case time complexity of Algorithm Mystry(C, v, n):',
    codeOrMath: [
      'Algorithm Mystry(C, v, n)',
      'for i ← 1 to n do',
      '    x ← C[i];  j ← i − 1',
      '    while j ≥ 0 and C[j] > v do',
      '        C[j + 1] ← C[j]',
      '        j ← j − 1',
      '    C[j + 1] ← x',
    ],
    basicOp: 'Comparison C[j] > v in the while loop',
    steps: [
      {
        stepTitle: 'Step 1: Worst-Case Setup (when C[j] > v is always true)',
        formula: 'C_worst(n) = ∑_{i = 1}^{n} ∑_{j = 0}^{i − 1} 1',
        explanation: 'In the worst case, j starts at i − 1 and decrements all the way down to 0 (so the inner loop runs i times).',
      },
      {
        stepTitle: 'Step 2: Solve the Worst-Case Summation',
        formula: 'C_worst(n) = ∑_{i = 1}^{n} (i − 1 − 0 + 1) = ∑_{i = 1}^{n} i = n(n + 1) / 2 ∈ Θ(n²)',
        explanation: 'Using the arithmetic series formula Σ i = n(n + 1) / 2.',
      },
      {
        stepTitle: 'Step 3: Solve the Best-Case Summation (when C[j] ≤ v immediately)',
        formula: 'C_best(n) = ∑_{i = 1}^{n} 1 = n ∈ Θ(n)',
        explanation: 'In the best case, the condition C[j] > v is false on the very first check for each i, doing only 1 comparison per outer loop.',
      },
    ],
    finalAnswer: 'Worst Case: n(n + 1)/2 ∈ Θ(n²)  |  Best Case: n ∈ Θ(n)',
  },
  {
    id: 'matrix-multiplication-loop',
    category: 'Loop Analysis (Exam)',
    title: 'Example 7: Matrix Multiplication (Triple Nested Loop)',
    source: 'File 01 Slide 56 & Levitin Section 2.3',
    problemStatement: 'Find the time complexity M(n) for counting the multiplications in multiplying two n × n matrices:',
    codeOrMath: [
      'Algorithm MatrixMultiplication(A, B, n)',
      'for i ← 0 to n − 1 do',
      '    for j ← 0 to n − 1 do',
      '        C[i, j] ← 0.0',
      '        for k ← 0 to n − 1 do',
      '            C[i, j] ← C[i, j] + A[i, k] ∗ B[k, j]',
    ],
    basicOp: 'Multiplication (A[i, k] ∗ B[k, j]) in the innermost loop',
    steps: [
      {
        stepTitle: 'Step 1: Set up the triple summation for loops i, j, and k',
        formula: 'M(n) = ∑_{i = 0}^{n − 1} ∑_{j = 0}^{n − 1} ∑_{k = 0}^{n − 1} 1',
        explanation: 'All three loops run independently from lower bound 0 to upper bound n − 1.',
      },
      {
        stepTitle: 'Step 2: Solve the innermost summation over k',
        formula: '∑_{k = 0}^{n − 1} 1 = (n − 1) − 0 + 1 = n',
        explanation: 'The innermost loop executes n multiplications for each combination of i and j.',
      },
      {
        stepTitle: 'Step 3: Solve the middle and outermost summations',
        formula: 'M(n) = ∑_{i = 0}^{n − 1} ∑_{j = 0}^{n − 1} n = ∑_{i = 0}^{n − 1} n² = n × n² = n³',
        explanation: 'Summing n over j gives n × n = n². Summing n² over i gives n × n² = n³.',
      },
    ],
    finalAnswer: 'M(n) = n³ ∈ Θ(n³)',
  },
  {
    id: 'logarithmic-while-loop',
    category: 'Loop Analysis (Exam)',
    title: 'Example 8: While Loop with Halving (Binary Count)',
    source: 'File 01 Slide 69 & Levitin Section 2.3',
    problemStatement: 'Find the time complexity C(n) of an algorithm that repeatedly divides the input size by 2:',
    codeOrMath: [
      'Algorithm CountBits(n)',
      'count ← 1',
      'while n > 1 do',
      '    count ← count + 1',
      '    n ← ⌊n / 2⌋    // Basic Operation: Integer Division',
      'return count',
    ],
    basicOp: 'Integer Division (⌊n / 2⌋) and while condition check',
    steps: [
      {
        stepTitle: 'Step 1: Trace the value of n after each iteration',
        formula: 'Pass 1: n/2   |   Pass 2: n/2²   |   Pass 3: n/2³   ...   Pass i: n/2ⁱ',
        explanation: 'In each iteration, n is halved. After i iterations, the remaining value of n is approximately n / 2ⁱ.',
      },
      {
        stepTitle: 'Step 2: Determine when the while loop terminates',
        formula: 'n / 2ⁱ ≤ 1   ⇒   2ⁱ ≥ n   ⇒   i = ⌊log₂ n⌋ = ⌊lg n⌋',
        explanation: 'The loop stops as soon as n becomes 1 or 0. Taking the base-2 logarithm of both sides gives i = ⌊log₂ n⌋.',
      },
      {
        stepTitle: 'Step 3: Account for the initial count and final check',
        formula: 'C(n) = ⌊log₂ n⌋ + 1 = ⌊lg n⌋ + 1 ∈ Θ(log n)',
        explanation: 'Whenever a loop divides the problem size by a constant ratio (> 1) per step, its complexity is logarithmic Θ(log n).',
      },
    ],
    finalAnswer: 'C(n) = ⌊log₂ n⌋ + 1 ∈ Θ(log n)',
  },
];

/**
 * Renders a stacked, hand-written style summation sign:
 *      upper
 *        Σ
 *      lower
 * Supports the notations `∑_{lower}^{upper}` and `∑_(lower to upper)` inside plain text.
 */
const SIGMA_PATTERN = /∑_(?:\{([^}]*)\}\^\{([^}]*)\}|\(([^)]*?) to ([^)]*)\))/g;

const StackedSigma: React.FC<{ lower: string; upper: string }> = ({ lower, upper }) => (
  <span className="mx-1.5 inline-flex flex-col items-center align-middle leading-none">
    <span className="text-[10px] text-amber-300">{upper}</span>
    <span className="text-3xl font-light leading-[1.1] text-white">∑</span>
    <span className="text-[10px] text-amber-300">{lower}</span>
  </span>
);

const MathLine: React.FC<{ text: string }> = ({ text }) => {
  const parts: React.ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const match of text.matchAll(SIGMA_PATTERN)) {
    const idx = match.index ?? 0;
    if (idx > last) parts.push(<span key={key++}>{text.slice(last, idx)}</span>);
    const lower = match[1] ?? match[3] ?? '';
    const upper = match[2] ?? match[4] ?? '';
    parts.push(<StackedSigma key={key++} lower={lower} upper={upper} />);
    last = idx + match[0].length;
  }
  if (last < text.length) parts.push(<span key={key++}>{text.slice(last)}</span>);
  return <span className="whitespace-pre-wrap">{parts}</span>;
};

/** Interactive "how a human reads and expands a Σ" mini-lab */
const SigmaReadingLab: React.FC = () => {
  const [lo, setLo] = useState(1);
  const [hi, setHi] = useState(5);
  const [expr, setExpr] = useState<'1' | 'k' | 'k²'>('k');

  const safeHi = Math.max(lo, hi);
  const ks: number[] = [];
  for (let k = lo; k <= safeHi && ks.length < 50; k++) ks.push(k);
  const term = (k: number) => (expr === '1' ? 1 : expr === 'k' ? k : k * k);
  const total = ks.reduce((s, k) => s + term(k), 0);
  const count = safeHi - lo + 1;

  const shown = ks.length > 7 ? [...ks.slice(0, 3), null, ...ks.slice(-2)] : ks;

  return (
    <div className="rounded-xl border border-amber-500/30 bg-slate-950/90 p-4 space-y-4">
      <div>
        <div className="text-xs font-mono font-bold uppercase text-amber-300">
          Read a Σ the way you would on paper
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Σ is just a <strong className="text-white">for-loop that adds</strong>. The bottom says where the
          counter starts, the top says where it stops, and the expression on the right is what you add each time.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900 p-3">
          <div className="flex flex-wrap items-center justify-center gap-2 py-2 font-mono text-lg text-white">
            <StackedSigma lower={`k = ${lo}`} upper={String(safeHi)} />
            <span className="text-amber-200">{expr}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <label className="flex items-center gap-1.5">
              start
              <input
                type="number"
                value={lo}
                min={0}
                max={20}
                onChange={(e) => setLo(Math.min(20, Math.max(0, Number(e.target.value) || 0)))}
                className="w-14 rounded border border-slate-700 bg-slate-950 px-1.5 py-1 text-white"
              />
            </label>
            <label className="flex items-center gap-1.5">
              stop
              <input
                type="number"
                value={hi}
                min={0}
                max={30}
                onChange={(e) => setHi(Math.min(30, Math.max(0, Number(e.target.value) || 0)))}
                className="w-14 rounded border border-slate-700 bg-slate-950 px-1.5 py-1 text-white"
              />
            </label>
            <div className="flex gap-1">
              {(['1', 'k', 'k²'] as const).map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setExpr(e)}
                  className={`rounded border px-2 py-1 font-mono cursor-pointer ${
                    expr === e
                      ? 'border-amber-400 bg-amber-500/20 text-white'
                      : 'border-slate-700 bg-slate-950 text-slate-400'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <pre className="overflow-x-auto rounded bg-slate-950 p-2.5 font-mono text-[11px] leading-relaxed text-emerald-200">
{`total ← 0
for k ← ${lo} to ${safeHi} do
    total ← total + ${expr}`}
          </pre>
        </div>

        <div className="space-y-2.5 rounded-lg border border-slate-800 bg-slate-900 p-3 text-xs">
          <div className="font-bold text-indigo-300">1. Write the terms out, one per value of k</div>
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-sm text-white">
            {shown.map((k, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-slate-500">+</span>}
                {k === null ? (
                  <span className="text-slate-400">…</span>
                ) : (
                  <span className="rounded border border-slate-700 bg-slate-950 px-2 py-0.5">
                    {expr === '1' ? '1' : expr === 'k' ? k : `${k}²`}
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="font-bold text-indigo-300">2. Count the terms: upper − lower + 1</div>
          <div className="rounded border border-slate-800 bg-slate-950 px-2.5 py-1.5 font-mono text-white">
            {safeHi} − {lo} + 1 = <span className="font-bold text-emerald-300">{count}</span> terms
          </div>
          <div className="font-bold text-indigo-300">3. Add them up</div>
          <div className="rounded border border-emerald-500/40 bg-emerald-950/30 px-2.5 py-1.5 font-mono font-bold text-white">
            Total = {total}
            {expr === 'k' && lo === 1 && (
              <span className="ml-2 font-normal text-emerald-300">
                check: n(n+1)/2 = {safeHi}·{safeHi + 1}/2 = {(safeHi * (safeHi + 1)) / 2}
              </span>
            )}
            {expr === '1' && (
              <span className="ml-2 font-normal text-emerald-300">(every term is 1, so total = count)</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const AnalyzeView: React.FC<AnalyzeViewProps> = () => {
  const [selectedExampleId, setSelectedExampleId] = useState<string>(SIMPLE_SOLVED_EXAMPLES[0].id);

  const activeExample =
    SIMPLE_SOLVED_EXAMPLES.find((ex) => ex.id === selectedExampleId) || SIMPLE_SOLVED_EXAMPLES[0];

  return (
    <div className="space-y-6">
      {/* SECTION 1: Quick Summary of Analysis Rules & Summation Laws (From Lecture Slides 01 & 02) */}
      <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/90 p-5 sm:p-6 space-y-5 shadow-lg">
        <div className="border-b border-slate-800 pb-3.5 flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-indigo-500/20 border border-indigo-500/40 px-2.5 py-0.5 font-mono text-xs font-bold text-indigo-300">
                CPCS-324 Cheat Sheet
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Summary of Algorithm Analysis Laws &amp; Summation Rules
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              All core formulas from Lecture File 01 (Slides 50–129) &amp; File 02 needed for exams — concise and direct.
            </p>
          </div>
        </div>

        {/* Row 1: Core Running Time Law, Trade-off, Classifications, Log Bases */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Running Time & Trade-off */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-4 space-y-2">
            <div className="text-xs font-mono font-bold uppercase text-indigo-300 flex items-center gap-1.5">
              <Cpu className="w-4 h-4" />
              1. Running Time &amp; Trade-Off Law
            </div>
            <div className="rounded-lg bg-slate-900 border border-slate-800 p-2.5 font-mono text-xs text-white space-y-1">
              <div className="text-amber-300 font-bold">T(n) ≈ c_op × C(n)</div>
              <div className="text-[11px] text-slate-300">• T(n): Running time of algorithm</div>
              <div className="text-[11px] text-slate-300">• c_op: Execution time of 1 basic operation</div>
              <div className="text-[11px] text-slate-300">• C(n): Number of times basic op is executed</div>
            </div>
            <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/30 px-3 py-1.5 font-mono text-xs text-indigo-200">
              <strong>Speed vs. Memory:</strong> Speed ∝ 1 / Memory (Inversely proportional)
            </div>
          </div>

          {/* Card 2: Best / Worst / Average & Logarithms */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-4 space-y-2">
            <div className="text-xs font-mono font-bold uppercase text-emerald-300 flex items-center gap-1.5">
              <Activity className="w-4 h-4" />
              2. Analysis Cases &amp; Log Bases
            </div>
            <div className="space-y-1 text-xs text-slate-300">
              <div>
                • <strong className="text-emerald-300">Best Case:</strong> Minimum time / space required
              </div>
              <div>
                • <strong className="text-indigo-300">Average Case:</strong> Average time / space required
              </div>
              <div>
                • <strong className="text-amber-300">Worst Case:</strong> Maximum time / space required
              </div>
            </div>
            <div className="rounded-lg bg-slate-900 border border-slate-800 p-2.5 font-mono text-xs space-y-1 mt-2">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Slide 69 Logarithm Notation:</div>
              <div className="text-white">• <code>log n</code> = base 10 (log₁₀ n)</div>
              <div className="text-white">• <code>lg n</code>  = base 2 (log₂ n)</div>
              <div className="text-white">• <code>ln n</code>  = base e ≈ 2.71828 (logₑ n)</div>
            </div>
          </div>

          {/* Card 3: Standard Basic Operations Table (Slide 56) */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-4 space-y-2">
            <div className="text-xs font-mono font-bold uppercase text-amber-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              3. Basic Operation by Problem (Slide 56)
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="rounded bg-slate-900 border border-slate-800 px-2.5 py-1.5">
                <strong className="text-white">Searching in a list of n items:</strong>
                <div className="text-slate-400 text-[11px]">Input: n items → Basic Op: <strong className="text-emerald-300">Key comparison</strong></div>
              </div>
              <div className="rounded bg-slate-900 border border-slate-800 px-2.5 py-1.5">
                <strong className="text-white">Matrix Multiplication:</strong>
                <div className="text-slate-400 text-[11px]">Basic Op: <strong className="text-emerald-300">Multiplication of two numbers</strong></div>
              </div>
              <div className="rounded bg-slate-900 border border-slate-800 px-2.5 py-1.5">
                <strong className="text-white">Checking Primality of integer n:</strong>
                <div className="text-slate-400 text-[11px]">Basic Op: <strong className="text-emerald-300">Division</strong></div>
              </div>
              <div className="rounded bg-slate-900 border border-slate-800 px-2.5 py-1.5">
                <strong className="text-white">Typical Graph Problem:</strong>
                <div className="text-slate-400 text-[11px]">Basic Op: <strong className="text-emerald-300">Visiting a vertex or traversing an edge</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Essential Summation Formulas Table (Slides 64–68) */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
            <Sigma className="w-4 h-4" />
            4. Essential Summation &amp; Series Formulas (Slides 64–68)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-left">
                  <th className="py-2.5 px-3 text-indigo-300">Rule / Series Name</th>
                  <th className="py-2.5 px-3 text-indigo-300">Summation Formula (Σ)</th>
                  <th className="py-2.5 px-3 text-indigo-300">Closed-Form Expansion</th>
                  <th className="py-2.5 px-3 text-indigo-300">Order of Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-950/60">
                <tr>
                  <td className="py-2.5 px-3 font-sans font-semibold text-white">
                    Constant Series (Count of Terms)
                  </td>
                  <td className="py-2.5 px-3 text-amber-200"><MathLine text="∑_(i = l to u) 1" /></td>
                  <td className="py-2.5 px-3 text-emerald-300 font-bold">u − l + 1  (Upper − Lower + 1)</td>
                  <td className="py-2.5 px-3 text-slate-300">Θ(n) when u = n</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans font-semibold text-white">
                    Arithmetic Series (Sum of k)
                  </td>
                  <td className="py-2.5 px-3 text-amber-200"><MathLine text="∑_(k = 1 to n) k = 1 + 2 + ... + n" /></td>
                  <td className="py-2.5 px-3 text-emerald-300 font-bold">n(n + 1) / 2</td>
                  <td className="py-2.5 px-3 text-slate-300">≈ ½ n² ∈ Θ(n²)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans font-semibold text-white">
                    Sum of Squares (k²)
                  </td>
                  <td className="py-2.5 px-3 text-amber-200"><MathLine text="∑_(k = 0 to n) k² = 1² + 2² + ... + n²" /></td>
                  <td className="py-2.5 px-3 text-emerald-300 font-bold">n(n + 1)(2n + 1) / 6</td>
                  <td className="py-2.5 px-3 text-slate-300">≈ ⅓ n³ ∈ Θ(n³)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans font-semibold text-white">
                    Sum of Cubes (k³)
                  </td>
                  <td className="py-2.5 px-3 text-amber-200"><MathLine text="∑_(k = 0 to n) k³ = 1³ + 2³ + ... + n³" /></td>
                  <td className="py-2.5 px-3 text-emerald-300 font-bold">n²(n + 1)² / 4</td>
                  <td className="py-2.5 px-3 text-slate-300">≈ ¼ n⁴ ∈ Θ(n⁴)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans font-semibold text-white">
                    Finite Geometric Series (x ≠ 1)
                  </td>
                  <td className="py-2.5 px-3 text-amber-200"><MathLine text="∑_(k = 0 to n) x^k = 1 + x + x² + ... + x^n" /></td>
                  <td className="py-2.5 px-3 text-emerald-300 font-bold">(x^(n+1) − 1) / (x − 1)</td>
                  <td className="py-2.5 px-3 text-slate-300">For x = 2: 2^(n+1) − 1 ∈ Θ(2^n)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans font-semibold text-white">
                    Infinite Geometric Series (|x| &lt; 1)
                  </td>
                  <td className="py-2.5 px-3 text-amber-200"><MathLine text="∑_(k = 0 to ∞) x^k   (for |x| < 1)" /></td>
                  <td className="py-2.5 px-3 text-emerald-300 font-bold">1 / (1 − x)</td>
                  <td className="py-2.5 px-3 text-slate-300">Θ(1) Constant</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans font-semibold text-white">
                    Harmonic Series
                  </td>
                  <td className="py-2.5 px-3 text-amber-200"><MathLine text="∑_(k = 1 to n) (1 / k) = 1 + ½ + ⅓ + ... + 1/n" /></td>
                  <td className="py-2.5 px-3 text-emerald-300 font-bold">ln n + O(1)</td>
                  <td className="py-2.5 px-3 text-slate-300">Θ(log n)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 2: Simple Solved Examples (Matching Slide Review Questions & Past Exams) */}
      <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/90 p-5 sm:p-6 space-y-5 shadow-lg">
        <div className="border-b border-slate-800 pb-3.5 flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-300">
                Step-by-Step Solved Examples
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Simple Exam &amp; Slide Solved Examples
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Click any example below to view its direct 2–3 step solution (from File 01 Review Questions &amp; Past Midterm Exams).
            </p>
          </div>
        </div>

        <SigmaReadingLab />

        {/* Example Selector Buttons */}
        <div className="flex flex-wrap gap-2">
          {SIMPLE_SOLVED_EXAMPLES.map((ex) => {
            const isSelected = ex.id === activeExample.id;
            return (
              <button
                key={ex.id}
                type="button"
                onClick={() => setSelectedExampleId(ex.id)}
                className={`rounded-xl border px-3.5 py-2 text-left text-xs transition cursor-pointer ${
                  isSelected
                    ? 'border-emerald-400 bg-emerald-500/20 text-white font-bold shadow-sm'
                    : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                <div className="text-[10px] font-mono uppercase text-emerald-300">{ex.category}</div>
                <div className="mt-0.5">{ex.title}</div>
              </button>
            );
          })}
        </div>

        {/* Active Solved Example Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left 5 Cols: Problem Box */}
          <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-emerald-300 font-mono">{activeExample.title}</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">{activeExample.source}</div>
            <p className="text-xs text-slate-200 leading-relaxed">{activeExample.problemStatement}</p>

            <pre className="rounded-lg border border-slate-800 bg-slate-900 p-3 font-mono text-xs text-amber-200 overflow-x-auto leading-relaxed">
              <MathLine text={activeExample.codeOrMath.join('\n')} />
            </pre>

            {activeExample.basicOp && (
              <div className="rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs font-mono">
                <span className="text-slate-400 uppercase text-[10px] block">Basic Operation:</span>
                <span className="text-white font-semibold">{activeExample.basicOp}</span>
              </div>
            )}
          </div>

          {/* Right 7 Cols: Simple 2-3 Step Solution */}
          <div className="lg:col-span-7 space-y-3">
            {activeExample.steps.map((st, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1.5"
              >
                <div className="text-xs font-bold text-indigo-300">{st.stepTitle}</div>
                <div className="rounded-lg border border-indigo-500/30 bg-slate-900 px-3 py-2 font-mono text-xs text-white overflow-x-auto">
                  <MathLine text={st.formula} />
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{st.explanation}</p>
              </div>
            ))}

            <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/30 p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-300">
                  Final Answer
                </div>
                <div className="text-sm font-mono font-bold text-white mt-0.5">
                  <MathLine text={activeExample.finalAnswer} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
