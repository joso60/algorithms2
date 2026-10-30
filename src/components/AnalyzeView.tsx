import React, { useState } from 'react';
import type { AlgorithmMeta } from '../types/algorithm';
import { EXAM_LOOP_SUMMATION_PROBLEMS } from '../data/curriculumIndex';
import {
  Activity,
  Cpu,
  HardDrive,
  Scale,
  Sigma,
  Award,
  Eye,
  EyeOff,
  CheckCircle2,
  Table,
  FileText,
} from 'lucide-react';

interface AnalyzeViewProps {
  algorithm: AlgorithmMeta;
}

export const AnalyzeView: React.FC<AnalyzeViewProps> = ({ algorithm }) => {
  const { analysis } = algorithm;
  const [selectedExamProblemId, setSelectedExamProblemId] = useState<string>(
    EXAM_LOOP_SUMMATION_PROBLEMS[0].id
  );
  const [revealedStepsCount, setRevealedStepsCount] = useState<number>(
    EXAM_LOOP_SUMMATION_PROBLEMS[0].steps.length
  );

  const activeExamProblem =
    EXAM_LOOP_SUMMATION_PROBLEMS.find((p) => p.id === selectedExamProblemId) ||
    EXAM_LOOP_SUMMATION_PROBLEMS[0];

  const handleSelectExamProblem = (id: string) => {
    setSelectedExamProblemId(id);
    const found = EXAM_LOOP_SUMMATION_PROBLEMS.find((p) => p.id === id);
    if (found) {
      setRevealedStepsCount(found.steps.length);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Complexity Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-emerald-500/30 bg-slate-900/80 p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-mono uppercase tracking-wider">
            <span>Best-Case Time</span>
            <Activity className="w-4 h-4" />
          </div>
          <div className="text-lg font-mono font-bold text-white">{analysis.bestTime}</div>
          <div className="text-[11px] text-slate-400">Minimum basic operations</div>
        </div>

        <div className="rounded-xl border border-indigo-500/30 bg-slate-900/80 p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-indigo-400 font-mono uppercase tracking-wider">
            <span>Average-Case Time</span>
            <Cpu className="w-4 h-4" />
          </div>
          <div className="text-lg font-mono font-bold text-white">{analysis.avgTime}</div>
          <div className="text-[11px] text-slate-400">Expected runtime on typical input</div>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-slate-900/80 p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-amber-400 font-mono uppercase tracking-wider">
            <span>Worst-Case Time</span>
            <Activity className="w-4 h-4" />
          </div>
          <div className="text-lg font-mono font-bold text-white">{analysis.worstTime}</div>
          <div className="text-[11px] text-slate-400">Upper bound guarantee</div>
        </div>

        <div className="rounded-xl border border-violet-500/30 bg-slate-900/80 p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-violet-400 font-mono uppercase tracking-wider">
            <span>Extra Space</span>
            <HardDrive className="w-4 h-4" />
          </div>
          <div className="text-lg font-mono font-bold text-white">{analysis.extraSpace}</div>
          <div className="text-[11px] text-slate-400">Auxiliary table / index memory</div>
        </div>
      </div>

      {/* Space-for-Time Trade-Off Card */}
      <div className="rounded-xl border border-indigo-500/40 bg-indigo-950/20 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-slate-900 border border-indigo-500/40 text-indigo-300 shrink-0 mt-0.5">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Time ∝ 1 / Space Trade-Off Principle
              </span>
              <span className="text-xs font-mono text-slate-400">{algorithm.lectureFile}</span>
            </div>
            <h3 className="text-sm font-bold text-white mt-1.5">
              How Extra Memory Accelerates {algorithm.title}
            </h3>
            <p className="text-xs text-slate-200 mt-1 leading-relaxed">{analysis.tradeOffSummary}</p>
          </div>
        </div>
      </div>

      {/* Algorithm Basic Operation & Step-by-Step Summation Solver */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              Basic Operation &amp; Input Parameters
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Standard CPCS-324 exam setup before writing the summation
            </p>
          </div>

          <div className="space-y-3">
            <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-3.5">
              <div className="text-[11px] font-mono uppercase tracking-wider text-indigo-400">
                1. Input Size Parameter
              </div>
              <div className="text-xs font-mono text-white mt-1 font-semibold">
                {analysis.inputSizeParam}
              </div>
            </div>

            <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-3.5">
              <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400">
                2. Basic Operation (Innermost Loop)
              </div>
              <div className="text-xs font-mono text-white mt-1 font-semibold">
                {analysis.basicOperation}
              </div>
            </div>

            {analysis.examNote && (
              <div className="rounded-lg bg-amber-950/25 border border-amber-500/40 p-3.5">
                <div className="text-[11px] font-mono uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  Exam Tip &amp; Key Takeaway
                </div>
                <p className="text-xs text-amber-100/90 mt-1 leading-relaxed">{analysis.examNote}</p>
              </div>
            )}
          </div>
        </div>

        {/* Loop-to-Summation 3-4 Line Algebraic Solver */}
        <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sigma className="w-4 h-4 text-emerald-400" />
                Loop-to-Summation Step-by-Step Algebraic Derivation
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Converting nested <code className="font-mono">for</code>/<code className="font-mono">while</code> loops directly into summations (Σ) in 3–4 clean lines
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {analysis.summationSteps.map((step, idx) => (
              <div
                key={idx}
                className="rounded-lg bg-slate-950/90 border border-slate-800 p-3.5 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300">{step.label}</span>
                  <span className="text-[11px] font-mono text-slate-500">Line {idx + 1}</span>
                </div>
                <div className="px-3 py-2 rounded bg-slate-900 border border-slate-800 font-mono text-xs text-amber-200 overflow-x-auto">
                  {step.math}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{step.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Table (if present for this algorithm, e.g., B-Trees, Hashing, Knapsack MF vs Bottom-Up) */}
      {analysis.comparisonTable && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Table className="w-4 h-4 text-indigo-400" />
                Slide &amp; Exam Complexity Comparison Table
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Direct reference table from the lecture slides for quick exam comparison
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80">
                  {analysis.comparisonTable.headers.map((header, hIdx) => (
                    <th
                      key={hIdx}
                      className="py-2.5 px-3 font-mono font-bold text-indigo-300 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {analysis.comparisonTable.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-800/40">
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className={`py-2.5 px-3 font-mono ${
                          cIdx === 0 ? 'font-bold text-white' : 'text-slate-300'
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Past Midterm Loop-to-Summation Workbench (Fall 2020 Q4 / Fall 2025 Q5 Mystry(C,v,n) & Standard Nested Loops) */}
      <div className="rounded-xl border border-amber-500/30 bg-slate-900/90 p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Handwritten Past Exam Summation Solver
              </span>
              <span className="text-xs font-mono text-slate-400">
                Matches Fall 2020 Q4 &amp; Fall 2025 Q5 Solution Key
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-1.5">
              Interactive Exam Loop-to-Summation Workbench
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Practice converting exam pseudocode with <code className="font-mono">for</code> and <code className="font-mono">while</code> loops into closed-form Big-O / Theta expressions step by step.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {EXAM_LOOP_SUMMATION_PROBLEMS.map((prob) => (
              <button
                key={prob.id}
                onClick={() => handleSelectExamProblem(prob.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors cursor-pointer ${
                  selectedExamProblemId === prob.id
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {prob.id === 'fall2020-q4'
                  ? 'Exam Q: Mystry(C, v, n)'
                  : prob.id === 'comp-counting-sum'
                  ? 'Triangular Loop: Comparison Sort'
                  : 'Cubic Loop: MCM / OBST'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Exam Pseudocode & Setup */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-300">
                  {activeExamProblem.title}
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                {activeExamProblem.examSource}
              </div>

              <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-200 overflow-x-auto leading-relaxed">
                {activeExamProblem.pseudocode.join('\n')}
              </pre>

              <div className="grid grid-cols-1 gap-2 pt-1">
                <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800 text-xs">
                  <span className="text-slate-400 font-mono block text-[10px] uppercase">
                    Basic Operation:
                  </span>
                  <span className="text-white font-mono font-semibold">
                    {activeExamProblem.basicOp}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800 text-xs">
                  <span className="text-slate-400 font-mono block text-[10px] uppercase">
                    Input Parameter:
                  </span>
                  <span className="text-white font-mono font-semibold">
                    {activeExamProblem.inputParam}
                  </span>
                </div>
              </div>
            </div>

            {/* Step Reveal Controls */}
            <div className="flex items-center justify-between gap-2 bg-slate-950/80 border border-slate-800 rounded-lg p-3">
              <span className="text-xs font-mono text-slate-300">
                Revealed Steps: {revealedStepsCount} / {activeExamProblem.steps.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRevealedStepsCount(1)}
                  className="px-2.5 py-1 rounded text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer flex items-center gap-1"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  Step-by-Step
                </button>
                {revealedStepsCount < activeExamProblem.steps.length && (
                  <button
                    onClick={() =>
                      setRevealedStepsCount((prev) =>
                        Math.min(activeExamProblem.steps.length, prev + 1)
                      )
                    }
                    className="px-2.5 py-1 rounded text-xs font-mono bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                  >
                    Next Line (+1)
                  </button>
                )}
                <button
                  onClick={() => setRevealedStepsCount(activeExamProblem.steps.length)}
                  className="px-2.5 py-1 rounded text-xs font-mono bg-emerald-600/30 border border-emerald-500/40 hover:bg-emerald-600/40 text-emerald-200 cursor-pointer flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Show All
                </button>
              </div>
            </div>
          </div>

          {/* Right: Handwritten-style Step-by-Step Solution */}
          <div className="lg:col-span-7 space-y-3">
            {activeExamProblem.steps.slice(0, revealedStepsCount).map((step, sIdx) => (
              <div
                key={sIdx}
                className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300">{step.lineTitle}</span>
                  <span className="text-[11px] font-mono text-slate-500">
                    Step {sIdx + 1} of {activeExamProblem.steps.length}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-indigo-500/30 font-mono text-xs text-white overflow-x-auto">
                  {step.equation}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{step.explanation}</p>
              </div>
            ))}

            {revealedStepsCount === activeExamProblem.steps.length && (
              <div className="rounded-xl bg-emerald-950/30 border border-emerald-500/50 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-300">
                      Final Closed-Form Exam Answer
                    </div>
                    <div className="text-sm font-mono font-bold text-white mt-0.5">
                      {activeExamProblem.finalResult}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
