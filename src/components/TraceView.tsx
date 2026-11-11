import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Terminal,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sliders,
  BookOpen,
  Eye,
  GraduationCap,
  Shuffle,
} from 'lucide-react';
import type {
  AlgorithmMeta,
  TraceStep,
  VisualTable,
  StringAlignmentView,
  BTreeNodeView,
  OBSTTreeConstructionView,
  OBSTTreeNodeView,
  HuffmanStepView,
  HuffmanTreeNodeView,
  StateSpaceTreeView,
  StateSpaceTreeNodeView,
} from '../types/algorithm';
import { parseEdgesInput } from '../data/traceGeneratorsPart3';

interface TraceViewProps {
  algorithm: AlgorithmMeta;
  steps: TraceStep[];
  currentStepIdx: number;
  setCurrentStepIdx: React.Dispatch<React.SetStateAction<number>>;
  selectedExampleId: string;
  onSelectExample: (exampleId: string) => void;
  customInputs: Record<string, string>;
  onCustomInputChange: (key: string, val: string) => void;
  onApplyCustomInputs: () => void;
  onGenerateRandomExam: () => void;
  randomExamSummary: string | null;
}

export const TraceView: React.FC<TraceViewProps> = ({
  algorithm,
  steps,
  currentStepIdx,
  setCurrentStepIdx,
  selectedExampleId,
  onSelectExample,
  customInputs,
  onCustomInputChange,
  onApplyCustomInputs,
  onGenerateRandomExam,
  randomExamSummary,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(900);
  const [practiceMode, setPracticeMode] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [checkedPractice, setCheckedPractice] = useState(false);
  const [activeMistakeTooltip, setActiveMistakeTooltip] = useState<string | null>(null);
  const [showCustomSandbox, setShowCustomSandbox] = useState(false);

  // Separate optional step-by-step sub-traces for Bad-Symbol t1(c) and Good-Suffix d2(k)
  const [showBadSymbolTrace, setShowBadSymbolTrace] = useState(false);
  const [badSymbolStepIdx, setBadSymbolStepIdx] = useState(0);
  const [showGoodSuffixTrace, setShowGoodSuffixTrace] = useState(false);
  const [goodSuffixK, setGoodSuffixK] = useState(1);
  const [showAllExamSteps, setShowAllExamSteps] = useState(false);
  const [examPaperViewMode, setExamPaperViewMode] = useState(true);
  const [examSheetTheme, setExamSheetTheme] = useState<'paper' | 'dark'>('paper');
  const isDarkSheet = examSheetTheme === 'dark';

  const safeStepIdx = Math.min(Math.max(0, currentStepIdx), Math.max(0, steps.length - 1));
  const currentStep = steps[safeStepIdx] || steps[0];

  // Determine if a Bad-Symbol or Good-Suffix sub-trace is currently open so arrow keys & controls target it
  const activeSubTracePattern = (
    currentStep?.stringView?.pattern ||
    (currentStep?.tables?.find(
      (t) => t.id === 'bm-bad-symbol' || t.id === 'horspool-shift-table' || t.id === 'bm-good-suffix'
    )?.title.match(/"([^"]+)"/)?.[1] ?? '')
  ).trim();
  const subTraceM = activeSubTracePattern.length;
  const isBadSymbolTraceActive =
    showBadSymbolTrace &&
    (algorithm.id === 'boyer-moore' || algorithm.id === 'horspool') &&
    subTraceM > 0;
  const isGoodSuffixTraceActive =
    showGoodSuffixTrace &&
    algorithm.id === 'boyer-moore' &&
    subTraceM > 1;

  // Reset playback and practice state when algorithm or example changes
  useEffect(() => {
    setIsPlaying(false);
    setUserAnswers({});
    setCheckedPractice(false);
    setActiveMistakeTooltip(null);
    setShowBadSymbolTrace(false);
    setBadSymbolStepIdx(0);
    setShowGoodSuffixTrace(false);
    setGoodSuffixK(1);
    setShowAllExamSteps(false);
    setExamPaperViewMode(true);
  }, [algorithm.id, selectedExampleId, randomExamSummary]);

  useEffect(() => {
    if (!isPlaying) return;
    if (safeStepIdx >= steps.length - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => {
      setCurrentStepIdx((prev) => Math.min(prev + 1, steps.length - 1));
    }, speedMs);
    return () => clearTimeout(timer);
  }, [isPlaying, safeStepIdx, steps.length, speedMs, setCurrentStepIdx]);

  // Keyboard navigation: Left/Right arrow keys control the open sub-trace if active, otherwise the main algorithm trace
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setIsPlaying(false);
        if (isBadSymbolTraceActive) {
          setBadSymbolStepIdx((prev) => Math.min(subTraceM, prev + 1));
        } else if (isGoodSuffixTraceActive) {
          setGoodSuffixK((prev) => Math.min(subTraceM - 1, prev + 1));
        } else {
          setCurrentStepIdx((prev) => Math.min(Math.max(0, steps.length - 1), prev + 1));
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setIsPlaying(false);
        if (isBadSymbolTraceActive) {
          setBadSymbolStepIdx((prev) => Math.max(0, prev - 1));
        } else if (isGoodSuffixTraceActive) {
          setGoodSuffixK((prev) => Math.max(1, prev - 1));
        } else {
          setCurrentStepIdx((prev) => Math.max(0, prev - 1));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    steps.length,
    setCurrentStepIdx,
    isBadSymbolTraceActive,
    isGoodSuffixTraceActive,
    subTraceM,
  ]);

  // In "Test Yourself" practice mode, jump to last step that has editable tables
  const handleTogglePracticeMode = () => {
    const nextMode = !practiceMode;
    setPracticeMode(nextMode);
    setIsPlaying(false);
    if (nextMode) {
      let targetIdx = steps.length - 1;
      for (let idx = steps.length - 1; idx >= 0; idx--) {
        if (steps[idx].tables && steps[idx].tables.length > 0) {
          targetIdx = idx;
          break;
        }
      }
      setCurrentStepIdx(targetIdx);
      setUserAnswers({});
      setCheckedPractice(false);
    }
  };

  const handleFillSampleAnswers = () => {
    if (!currentStep) return;
    const filled: Record<string, string> = {};
    currentStep.tables.forEach((tbl) => {
      tbl.rows.forEach((row) => {
        row.forEach((cell) => {
          if (cell.editableKey && cell.expectedValue !== undefined) {
            filled[cell.editableKey] = String(cell.expectedValue);
          }
        });
      });
    });
    setUserAnswers(filled);
    setCheckedPractice(true);
  };

  // Compute score in Practice Mode
  let totalEditable = 0;
  let correctEditable = 0;
  if (practiceMode && currentStep) {
    currentStep.tables.forEach((tbl) => {
      tbl.rows.forEach((row) => {
        row.forEach((cell) => {
          if (cell.editableKey && cell.expectedValue !== undefined) {
            totalEditable++;
            const uVal = (userAnswers[cell.editableKey] ?? '').trim().toLowerCase();
            const eVal = String(cell.expectedValue).trim().toLowerCase();
            if (uVal !== '' && uVal === eVal) {
              correctEditable++;
            }
          }
        });
      });
    });
  }

  const getCellColorClasses = (state?: string) => {
    switch (state) {
      case 'active':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/60 ring-1 ring-indigo-500/40 font-semibold';
      case 'compare':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/60 ring-1 ring-amber-500/40 font-semibold';
      case 'match':
        return 'bg-emerald-500/25 text-emerald-200 border-emerald-500/70 ring-1 ring-emerald-500/50 font-bold';
      case 'mismatch':
        return 'bg-rose-500/25 text-rose-200 border-rose-500/70 ring-1 ring-rose-500/50 font-bold';
      case 'path':
        return 'bg-emerald-600/30 text-emerald-100 border-emerald-400 ring-2 ring-emerald-400/50 font-bold';
      case 'computed':
        return 'bg-slate-800/90 text-slate-100 border-slate-700';
      case 'unvisited':
        return 'bg-slate-900/40 text-slate-500 border-slate-800/60';
      default:
        return 'bg-slate-900/80 text-slate-200 border-slate-800';
    }
  };

  const renderBTreeDiagram = (root: BTreeNodeView, order: number): React.ReactNode => {
    const KEY_CELL_W = 42;
    const KEY_ROW_H = 34;
    const PTR_ROW_H = 18;
    const NODE_H = KEY_ROW_H + PTR_ROW_H;
    const H_GAP = 26;
    const LEVEL_GAP = 122;
    const TOP_PAD = 34;
    const SIDE_PAD = 28;

    interface LayoutNode {
      node: BTreeNodeView;
      nodeW: number;
      subtreeW: number;
      centerX: number;
      topY: number;
      depth: number;
      children: LayoutNode[];
    }

    interface ArrowEdge {
      id: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      highlight?: string;
    }

    let maxDepth = 0;

    const buildLayout = (n: BTreeNodeView, depth: number): LayoutNode => {
      if (depth > maxDepth) maxDepth = depth;
      const kCount = Math.max(1, n.keys.length);
      const nodeW = Math.max(52, kCount * KEY_CELL_W);
      const childLayouts = (n.children || []).map((ch) => buildLayout(ch, depth + 1));

      const childrenTotalW =
        childLayouts.length > 0
          ? childLayouts.reduce((acc, c) => acc + c.subtreeW, 0) +
            (childLayouts.length - 1) * H_GAP
          : 0;

      const minBadgeW = n.badgeText ? Math.max(nodeW, n.badgeText.length * 6.5 + 16) : nodeW;
      const subtreeW = Math.max(nodeW, childrenTotalW, minBadgeW);

      return {
        node: n,
        nodeW,
        subtreeW,
        centerX: 0,
        topY: TOP_PAD + depth * LEVEL_GAP,
        depth,
        children: childLayouts,
      };
    };

    const rootLayout = buildLayout(root, 0);
    const allNodes: LayoutNode[] = [];
    const allArrows: ArrowEdge[] = [];

    const assignPositions = (ln: LayoutNode, leftX: number) => {
      ln.centerX = leftX + ln.subtreeW / 2;
      allNodes.push(ln);

      if (ln.children.length > 0) {
        const childrenSpan =
          ln.children.reduce((acc, c) => acc + c.subtreeW, 0) +
          (ln.children.length - 1) * H_GAP;
        let cursorX = ln.centerX - childrenSpan / 2;

        const numSlots = Math.max(ln.node.keys.length + 1, ln.children.length);
        const slotW = ln.nodeW / numSlots;
        const nodeLeft = ln.centerX - ln.nodeW / 2;

        ln.children.forEach((childLn, idx) => {
          assignPositions(childLn, cursorX);
          const startX = nodeLeft + (idx + 0.5) * slotW;
          const startY = ln.topY + KEY_ROW_H + PTR_ROW_H / 2;
          const endX = childLn.centerX;
          const endY = childLn.topY - 2;

          allArrows.push({
            id: `${ln.node.id}->${childLn.node.id}-${idx}`,
            x1: startX,
            y1: startY,
            x2: endX,
            y2: endY,
            highlight: childLn.node.highlight,
          });

          cursorX += childLn.subtreeW + H_GAP;
        });
      }
    };

    assignPositions(rootLayout, SIDE_PAD);

    const canvasW = Math.max(520, rootLayout.subtreeW + SIDE_PAD * 2);
    const canvasH = TOP_PAD + (maxDepth + 1) * NODE_H + maxDepth * (LEVEL_GAP - NODE_H) + 28;

    return (
      <div className="w-full overflow-x-auto pb-2">
        <div
          className="relative mx-auto select-none"
          style={{ width: `${canvasW}px`, height: `${canvasH}px` }}
        >
          {/* SVG Layer for Pointer Dots & Directed Arrows */}
          <svg
            width={canvasW}
            height={canvasH}
            className="pointer-events-none absolute inset-0 z-10"
          >
            <defs>
              <marker
                id="btree-arrow-normal"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="#94a3b8" />
              </marker>
              <marker
                id="btree-arrow-active"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6.5"
                markerHeight="6.5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="#fbbf24" />
              </marker>
              <marker
                id="btree-arrow-overflow"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6.5"
                markerHeight="6.5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="#fb7185" />
              </marker>
            </defs>

            {allArrows.map((edge) => {
              const isOverflow = edge.highlight === 'overflow';
              const isHighlighted =
                edge.highlight === 'split' ||
                edge.highlight === 'active' ||
                edge.highlight === 'found' ||
                edge.highlight === 'borrowed';

              const strokeColor = isOverflow
                ? '#fb7185'
                : isHighlighted
                  ? '#fbbf24'
                  : '#94a3b8';

              const markerUrl = isOverflow
                ? 'url(#btree-arrow-overflow)'
                : isHighlighted
                  ? 'url(#btree-arrow-active)'
                  : 'url(#btree-arrow-normal)';

              return (
                <g key={edge.id}>
                  {/* Origin dot inside the parent's bottom pointer slot */}
                  <circle cx={edge.x1} cy={edge.y1} r={2.5} fill={strokeColor} />
                  {/* Directed arrow line to child node top-center */}
                  <line
                    x1={edge.x1}
                    y1={edge.y1}
                    x2={edge.x2}
                    y2={edge.y2}
                    stroke={strokeColor}
                    strokeWidth={isOverflow || isHighlighted ? 2 : 1.6}
                    markerEnd={markerUrl}
                  />
                </g>
              );
            })}
          </svg>

          {/* HTML Node Boxes (Two-Row Slide Structure: Keys Row + Child Pointer Slots Row) */}
          {allNodes.map((ln) => {
            const { node, nodeW, centerX, topY } = ln;
            const left = centerX - nodeW / 2;
            const isInternal = node.children && node.children.length > 0;
            const numPtrSlots = Math.max(
              node.keys.length + 1,
              node.children ? node.children.length : 0
            );

            let boxBorder = 'border-slate-500 bg-slate-900/95 text-slate-100';
            let badgeStyle = 'border-slate-700 bg-slate-800 text-slate-200';

            if (node.highlight === 'overflow') {
              boxBorder =
                'border-rose-500 bg-rose-950/60 text-rose-100 ring-2 ring-rose-500/40 shadow-lg shadow-rose-500/20';
              badgeStyle = 'border-rose-400/70 bg-rose-600 text-white font-bold shadow';
            } else if (node.highlight === 'split') {
              boxBorder =
                'border-amber-400 bg-amber-950/40 text-amber-100 ring-1 ring-amber-400/40 shadow-md shadow-amber-500/10';
              badgeStyle = 'border-amber-400/60 bg-amber-500/25 text-amber-200 font-semibold';
            } else if (node.highlight === 'borrowed' || node.highlight === 'merged') {
              boxBorder =
                'border-indigo-400 bg-indigo-950/50 text-indigo-100 ring-1 ring-indigo-400/40 shadow-md';
              badgeStyle = 'border-indigo-400/60 bg-indigo-500/25 text-indigo-200 font-semibold';
            } else if (node.highlight === 'found' || node.highlight === 'active') {
              boxBorder =
                'border-emerald-400 bg-emerald-950/40 text-emerald-100 ring-1 ring-emerald-400/40 shadow-md shadow-emerald-500/10';
              badgeStyle = 'border-emerald-400/60 bg-emerald-500/25 text-emerald-200 font-semibold';
            }

            return (
              <div
                key={node.id}
                style={{
                  left: `${left}px`,
                  top: `${topY}px`,
                  width: `${nodeW}px`,
                  height: `${NODE_H}px`,
                }}
                className="absolute z-0"
              >
                {/* Floating Badge above node (Overflow / Split / Promoted Key) */}
                {node.badgeText && (
                  <div
                    className={`pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded border px-2 py-0.5 font-mono text-[10px] ${badgeStyle}`}
                  >
                    {node.badgeText}
                  </div>
                )}

                {/* Two-Row Node Box */}
                <div
                  className={`flex h-full w-full flex-col overflow-hidden rounded-md border-2 font-mono transition-all ${boxBorder}`}
                >
                  {/* Top Row: Ordered Keys k_1 .. k_j */}
                  <div
                    className="grid divide-x divide-slate-600/80"
                    style={{
                      height: `${KEY_ROW_H}px`,
                      gridTemplateColumns: `repeat(${Math.max(1, node.keys.length)}, minmax(0, 1fr))`,
                    }}
                  >
                    {node.keys.map((k, kIdx) => {
                      const isMedian =
                        node.medianKey !== undefined && String(node.medianKey) === String(k);
                      const isActiveKey =
                        !isMedian &&
                        node.activeKey !== undefined &&
                        String(node.activeKey) === String(k);

                      return (
                        <div
                          key={kIdx}
                          title={
                            isMedian
                              ? `Median Key '${k}' (will be pushed up to parent)`
                              : isActiveKey
                                ? `Active / Newly Inserted Key '${k}'`
                                : `Key ${k}`
                          }
                          className={`flex items-center justify-center text-xs font-bold ${
                            isMedian
                              ? 'bg-cyan-500/35 text-cyan-200 ring-1 ring-inset ring-cyan-300 font-extrabold'
                              : isActiveKey
                                ? 'bg-emerald-500/30 text-emerald-200 font-extrabold'
                                : ''
                          }`}
                        >
                          {k}
                        </div>
                      );
                    })}
                  </div>

                  {/* Bottom Row: k + 1 Child Pointer Slots (p_0 .. p_k) matching Slide Diagrams */}
                  <div
                    className="grid divide-x divide-slate-600/80 border-t border-slate-600/90"
                    style={{
                      height: `${PTR_ROW_H}px`,
                      gridTemplateColumns: `repeat(${numPtrSlots}, minmax(0, 1fr))`,
                    }}
                  >
                    {Array.from({ length: numPtrSlots }).map((_, pIdx) => (
                      <div
                        key={pIdx}
                        title={
                          isInternal
                            ? `Pointer slot p_${pIdx} → Child #${pIdx + 1}`
                            : `Null leaf pointer p_${pIdx}`
                        }
                        className={`flex items-center justify-center ${
                          isInternal ? 'bg-rose-500/15' : 'bg-slate-950/75'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Visual Legend for Slide Two-Row Node Structure */}
        {order > 2 && (
          <div className="mt-2 flex flex-wrap items-center justify-center gap-4 border-t border-slate-800/80 pt-3 text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-4 rounded-xs border border-slate-500 bg-slate-900" />
              Top Row: Keys (k₁..kⱼ)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-4 rounded-xs border border-slate-600 bg-rose-500/20" />
              Bottom Row: Child Pointer Slots (p₀..pⱼ)
            </span>
            <span className="flex items-center gap-1.5 text-cyan-300">
              <span className="inline-block h-3 w-3 rounded-xs border border-cyan-300 bg-cyan-500/35" />
              Median Key (Pushed Up on Split)
            </span>
            <span className="flex items-center gap-1.5 text-rose-300">
              <span className="inline-block h-3 w-3 rounded-xs border border-rose-500 bg-rose-950" />
              Overflow Node (&gt; Max Keys {order - 1})
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderStringAlignment = (sv: StringAlignmentView) => {
    const textChars = sv.text.split('');
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-semibold text-slate-100">
              String Alignment & Character Comparison Grid (0-Based Indexing)
            </h4>
            <p className="text-xs text-slate-400">
              Text Length n = {sv.text.length}, Pattern Length m = {sv.pattern.length} | Current Alignment Start = Index {sv.alignIndex}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-300">
              <span className="h-2.5 w-2.5 rounded-xs bg-emerald-500" /> Match
            </span>
            <span className="flex items-center gap-1.5 text-rose-300">
              <span className="h-2.5 w-2.5 rounded-xs bg-rose-500" /> Mismatch
            </span>
            <span className="flex items-center gap-1.5 text-amber-300">
              <span className="h-2.5 w-2.5 rounded-xs bg-amber-500" /> Active Compare
            </span>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <table className="border-collapse font-mono text-xs">
            <thead>
              <tr>
                <th className="border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-left text-slate-400">
                  Index
                </th>
                {textChars.map((_, idx) => (
                  <th
                    key={idx}
                    className={`min-w-[32px] border border-slate-800 px-2 py-1 text-center ${
                      idx === sv.currentCompareTextIdx
                        ? 'bg-amber-500/20 text-amber-300 font-bold'
                        : 'bg-slate-950 text-slate-400'
                    }`}
                  >
                    {idx}
                  </th>
                ))}
                <th className="border border-slate-800 bg-slate-950 px-3 py-1.5 text-left text-slate-400">
                  Shift Calculation
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Text Row */}
              <tr>
                <td className="border border-slate-800 bg-slate-950 px-2.5 py-2 font-semibold text-indigo-300">
                  Text T
                </td>
                {textChars.map((ch, idx) => (
                  <td
                    key={idx}
                    className={`border border-slate-800 px-2 py-2 text-center text-sm font-bold ${
                      idx === sv.currentCompareTextIdx
                        ? 'bg-amber-500/25 text-amber-200 ring-1 ring-amber-400'
                        : 'bg-slate-900 text-slate-100'
                    }`}
                  >
                    {ch}
                  </td>
                ))}
                <td className="border border-slate-800 bg-slate-950 px-3 py-2 text-slate-400">
                  n = {sv.text.length}
                </td>
              </tr>

              {/* History of pattern trials (Exact Exam Grid Style!) */}
              {sv.historyRows.map((hRow, rIdx) => (
                <tr key={rIdx}>
                  <td className="border border-slate-800 bg-slate-950/70 px-2.5 py-1.5 text-slate-400">
                    Trial #{rIdx + 1}
                  </td>
                  {textChars.map((_, cIdx) => {
                    const patOffset = cIdx - hRow.alignIndex;
                    const inPattern = patOffset >= 0 && patOffset < hRow.pattern.length;
                    if (!inPattern) {
                      return (
                        <td
                          key={cIdx}
                          className="border border-slate-800/60 bg-slate-950/30 px-2 py-1.5"
                        />
                      );
                    }
                    const ch = hRow.pattern[patOffset];
                    const comp = hRow.comparedIndices.find((c) => c.patIdx === patOffset);
                    const cellClass = comp
                      ? comp.match
                        ? 'bg-emerald-500/25 text-emerald-200 border-emerald-500/60 font-bold'
                        : 'bg-rose-500/30 text-rose-200 border-rose-500/70 font-bold'
                      : 'bg-slate-800/70 text-slate-300 border-slate-700';

                    return (
                      <td
                        key={cIdx}
                        className={`border px-2 py-1.5 text-center text-sm ${cellClass}`}
                      >
                        {ch}
                      </td>
                    );
                  })}
                  <td className="whitespace-nowrap border border-slate-800 bg-slate-950/60 px-3 py-1.5 text-xs text-indigo-300">
                    {hRow.shiftFormula || `Aligned at i = ${hRow.alignIndex}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderOBSTTreeConstructionView = (view: OBSTTreeConstructionView) => {
    const {
      n,
      keys,
      rootMatrix,
      currentCell,
      leftChildCell,
      rightChildCell,
      treeRoot,
      stepCaption,
      treeStepIndex,
      totalTreeSteps,
      expectedCost,
    } = view;

    // Compute 2D layout for the binary tree SVG
    interface PositionedOBSTNode {
      keyIndex: number;
      label: string;
      role: OBSTTreeNodeView['role'];
      x: number;
      y: number;
      parentX?: number;
      parentY?: number;
    }

    const positionedNodes: PositionedOBSTNode[] = [];
    const getMaxDepth = (node: OBSTTreeNodeView | null | undefined): number => {
      if (!node) return 0;
      return 1 + Math.max(getMaxDepth(node.left), getMaxDepth(node.right));
    };

    const maxDepth = Math.max(1, getMaxDepth(treeRoot));
    const svgWidth = Math.max(360, n * 62);
    const levelGapY = 68;
    const svgHeight = Math.max(230, maxDepth * levelGapY + 40);

    const assignCoords = (
      node: OBSTTreeNodeView | null | undefined,
      depth: number,
      xMin: number,
      xMax: number,
      parentX?: number,
      parentY?: number
    ) => {
      if (!node) return;
      const x = (xMin + xMax) / 2;
      const y = 36 + depth * levelGapY;
      positionedNodes.push({
        keyIndex: node.keyIndex,
        label: node.label,
        role: node.role,
        x,
        y,
        parentX,
        parentY,
      });
      const spread = (xMax - xMin) / 2;
      if (node.left) {
        assignCoords(node.left, depth + 1, xMin, x, x, y);
      }
      if (node.right) {
        assignCoords(node.right, depth + 1, x, x + spread, x, y);
      }
    };

    if (treeRoot) {
      assignCoords(treeRoot, 0, 24, svgWidth - 24);
    }

    // Find the first tree construction step index so we can step within tree phase or back to tables
    const firstTreeStepGlobalIdx = steps.findIndex((s) => Boolean(s.obstTreeView));

    return (
      <div className="rounded-2xl border border-slate-800 bg-[#111318] p-5 sm:p-6 shadow-2xl space-y-6">
        {/* Top Header Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/90 pb-3.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#7c6df2]/20 border border-[#7c6df2]/50 px-2.5 py-0.5 font-mono text-xs font-bold text-[#c4b5fd]">
                Tree Step {treeStepIndex} of {totalTreeSteps}
              </span>
              <h4 className="text-sm sm:text-base font-bold text-white">
                Step-by-Step Optimal BST Construction from Root Table R[1..{n}, 1..{n}]
              </h4>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Cost Table C is hidden so we can focus on extracting the Optimal Binary Search Tree from R (Min Expected Cost = <strong className="text-emerald-300 font-mono">{expectedCost}</strong>).
            </p>
          </div>

          {firstTreeStepGlobalIdx > 0 && (
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setCurrentStepIdx(firstTreeStepGlobalIdx - 1);
              }}
              className="rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-300 transition cursor-pointer"
            >
              ↖ View Completed C &amp; R Tables
            </button>
          )}
        </div>

        {/* Main Side-by-Side Layout: Left = Root Matrix R[1..n, 1..n], Right = Binary Search Tree */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: Clean Root Matrix R[1..n, 1..n] */}
          <div className="lg:col-span-6 overflow-x-auto flex justify-center">
            <table className="border-separate border-spacing-1.5 font-mono text-sm">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-slate-500 font-normal text-xs" />
                  {Array.from({ length: n }, (_, idx) => {
                    const j = idx + 1;
                    return (
                      <th
                        key={j}
                        className="px-2.5 py-1 text-center font-normal text-xs text-slate-400"
                      >
                        j={j}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: n }, (_, rIdx) => {
                  const i = rIdx + 1;
                  return (
                    <tr key={i}>
                      <td className="px-2.5 py-1.5 text-right text-xs text-slate-400 whitespace-nowrap">
                        i={i}
                      </td>
                      {Array.from({ length: n }, (__, cIdx) => {
                        const j = cIdx + 1;
                        if (j < i) {
                          return <td key={j} className="w-11 h-11" />;
                        }

                        const val = rootMatrix[i]?.[j];
                        const isCurrent =
                          currentCell !== undefined &&
                          currentCell.i === i &&
                          currentCell.j === j;
                        const isLeftChild =
                          leftChildCell !== null &&
                          leftChildCell !== undefined &&
                          leftChildCell.i === i &&
                          leftChildCell.j === j;
                        const isRightChild =
                          rightChildCell !== null &&
                          rightChildCell !== undefined &&
                          rightChildCell.i === i &&
                          rightChildCell.j === j;

                        // Horizontal trail along same row i between leftChildCell.j and currentCell.j
                        const isLeftTrail =
                          currentCell !== undefined &&
                          leftChildCell !== null &&
                          leftChildCell !== undefined &&
                          i === currentCell.i &&
                          j > leftChildCell.j &&
                          j < currentCell.j;

                        // Vertical trail along same column j between currentCell.i and rightChildCell.i
                        const isRightTrail =
                          currentCell !== undefined &&
                          rightChildCell !== null &&
                          rightChildCell !== undefined &&
                          j === currentCell.j &&
                          i > currentCell.i &&
                          i < rightChildCell.i;

                        let cellStyle =
                          'text-slate-200 bg-transparent hover:bg-slate-800/50';
                        if (isCurrent) {
                          cellStyle =
                            'bg-[#7c6df2] text-white font-bold shadow-md ring-2 ring-[#a78bfa]/60';
                        } else if (isLeftChild) {
                          cellStyle =
                            'bg-[#16a36a] text-white font-bold shadow-md ring-2 ring-[#34d399]/60';
                        } else if (isRightChild) {
                          cellStyle =
                            'bg-[#d95f2a] text-white font-bold shadow-md ring-2 ring-[#fb923c]/60';
                        } else if (isLeftTrail) {
                          cellStyle =
                            'bg-[#dcfce7] text-[#065f46] font-bold';
                        } else if (isRightTrail) {
                          cellStyle =
                            'bg-[#ffedd5] text-[#7c2d12] font-bold';
                        }

                        const keyLabel = val !== null && val !== undefined ? keys[val - 1] : '';

                        return (
                          <td
                            key={j}
                            title={
                              val
                                ? `R[${i}, ${j}] = ${val} (${keyLabel})`
                                : undefined
                            }
                            className={`w-11 h-11 rounded-md text-center align-middle transition-all duration-200 select-none ${cellStyle}`}
                          >
                            <div className="flex flex-col items-center justify-center leading-tight">
                              <span className="text-sm">{val ?? ''}</span>
                              {keyLabel && (
                                <span
                                  className={`text-[9px] ${
                                    isLeftTrail
                                      ? 'text-[#065f46]/80'
                                      : isRightTrail
                                      ? 'text-[#7c2d12]/80'
                                      : isCurrent || isLeftChild || isRightChild
                                      ? 'text-white/90'
                                      : 'text-slate-500'
                                  }`}
                                >
                                  {keyLabel}
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Right: Binary Search Tree SVG Diagram */}
          <div className="lg:col-span-6 flex justify-center items-center overflow-x-auto">
            <svg
              width={svgWidth}
              height={svgHeight}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="overflow-visible"
            >
              {/* Connecting Edges */}
              {positionedNodes.map((node) => {
                if (node.parentX === undefined || node.parentY === undefined) return null;
                return (
                  <line
                    key={`edge-${node.keyIndex}`}
                    x1={node.parentX}
                    y1={node.parentY}
                    x2={node.x}
                    y2={node.y}
                    stroke="#64748b"
                    strokeWidth={2}
                  />
                );
              })}

              {/* Circular Tree Nodes */}
              {positionedNodes.map((node) => {
                let fill = '#18181b';
                let stroke = '#3f3f46';
                if (node.role === 'current') {
                  fill = '#7c6df2';
                  stroke = '#a78bfa';
                } else if (node.role === 'left-child') {
                  fill = '#16a36a';
                  stroke = '#34d399';
                } else if (node.role === 'right-child') {
                  fill = '#d95f2a';
                  stroke = '#fb923c';
                }

                return (
                  <g key={`node-${node.keyIndex}`} transform={`translate(${node.x}, ${node.y})`}>
                    <circle
                      r={22}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={2}
                      className="transition-all duration-300"
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#ffffff"
                      className="font-sans text-sm font-bold select-none"
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Integrated Diagram Color Legend (Part of the Visual Diagram) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-[#7c6df2] inline-block shrink-0 ring-1 ring-white/20" />
            <span>
              <strong className="text-white">Purple:</strong> Current cell <code>R[i, j] = k</code> (parent node)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-[#16a36a] inline-block shrink-0 ring-1 ring-white/20" />
            <span>
              <strong className="text-white">Dark Green:</strong> Left child cell <code>R[i, k−1]</code> (same row <code>i</code>, col <code>k−1</code>)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-[#d95f2a] inline-block shrink-0 ring-1 ring-white/20" />
            <span>
              <strong className="text-white">Dark Orange:</strong> Right child cell <code>R[k+1, j]</code> (row <code>k+1</code>, same col <code>j</code>)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-[#dcfce7] border border-emerald-500/50 inline-block shrink-0" />
            <span>
              <strong className="text-emerald-200">Pale Mint (Light Green):</strong> Visual path moving <strong>left</strong> along row <code>i</code> to reach <code>R[i, k−1]</code> (skipped cells, not chosen)
            </span>
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <span className="w-4 h-4 rounded bg-[#ffedd5] border border-orange-500/50 inline-block shrink-0" />
            <span>
              <strong className="text-orange-200">Pale Peach (Light Orange):</strong> Visual path moving <strong>down</strong> along column <code>j</code> to reach <code>R[k+1, j]</code> (skipped cells, not chosen)
            </span>
          </div>
        </div>

        {/* Step Caption, Navigation Controls & Optional Detailed Step Breakdown Below */}
        <div className="space-y-4 pt-3 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm sm:text-base text-slate-100 font-semibold tracking-tight">
              {stepCaption}
            </div>

            {/* Step Navigation Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                disabled={safeStepIdx <= 0}
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStepIdx((p) => Math.max(0, p - 1));
                }}
                className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-xs font-semibold text-slate-100 transition cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="button"
                disabled={safeStepIdx >= steps.length - 1}
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStepIdx((p) => Math.min(steps.length - 1, p + 1));
                }}
                className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-xs font-semibold text-slate-100 transition cursor-pointer"
              >
                Next →
              </button>
              <span className="text-xs font-mono text-slate-400 ml-1">
                Tree Step {treeStepIndex} of {totalTreeSteps}
              </span>
            </div>
          </div>

          {/* Optional Detailed Step Breakdown (At the Bottom for Students Who Want Full Formula Details) */}
          {currentCell && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-3.5 space-y-2 font-mono text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                <span className="font-bold uppercase tracking-wider text-indigo-300">
                  📐 Detailed Step Formula Breakdown — OBST Tree Lookup Rule (Given R[i, j] = k):
                </span>
                <span className="text-slate-400">
                  Stop condition: if row &gt; column (i &gt; j), the child is empty (∅)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
                {/* 1. Current Cell k */}
                <div className="rounded-lg border border-[#7c6df2]/40 bg-[#7c6df2]/10 p-2.5">
                  <div className="text-[10px] uppercase text-[#c4b5fd] font-bold">
                    1. Current Cell (Parent Node)
                  </div>
                  <div className="mt-1 text-white font-bold">
                    i = {currentCell.i}, j = {currentCell.j}  ⇒  k = R[{currentCell.i}, {currentCell.j}] = {currentCell.k} ({currentCell.label})
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-300 font-sans">
                    <code>k = {currentCell.k}</code> is the value stored inside cell <code>R[{currentCell.i}, {currentCell.j}]</code>.
                  </div>
                </div>

                {/* 2. Left Child Formula: R[i, k - 1] */}
                <div className="rounded-lg border border-[#16a36a]/40 bg-[#16a36a]/10 p-2.5">
                  <div className="text-[10px] uppercase text-emerald-300 font-bold">
                    2. Left Child Formula: R[i, k − 1]
                  </div>
                  <div className="mt-1 text-white font-bold">
                    R[{currentCell.i}, {currentCell.k} − 1] = R[{currentCell.i}, {currentCell.k - 1}]{' '}
                    {leftChildCell
                      ? `= ${leftChildCell.k} (${leftChildCell.label})`
                      : '→ ∅ (Empty)'}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-300 font-sans">
                    Stay on <strong>same row i = {currentCell.i}</strong>, move left to <strong>column k − 1 = {currentCell.k - 1}</strong>
                    {!leftChildCell && ` (since row ${currentCell.i} > col ${currentCell.k - 1}, no left child)`}.
                  </div>
                </div>

                {/* 3. Right Child Formula: R[k + 1, j] */}
                <div className="rounded-lg border border-[#d95f2a]/40 bg-[#d95f2a]/10 p-2.5">
                  <div className="text-[10px] uppercase text-orange-300 font-bold">
                    3. Right Child Formula: R[k + 1, j]
                  </div>
                  <div className="mt-1 text-white font-bold">
                    R[{currentCell.k} + 1, {currentCell.j}] = R[{currentCell.k + 1}, {currentCell.j}]{' '}
                    {rightChildCell
                      ? `= ${rightChildCell.k} (${rightChildCell.label})`
                      : '→ ∅ (Empty)'}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-300 font-sans">
                    Move down to <strong>row k + 1 = {currentCell.k + 1}</strong>, stay on <strong>same column j = {currentCell.j}</strong>
                    {!rightChildCell && ` (since row ${currentCell.k + 1} > col ${currentCell.j}, no right child)`}.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ==========================================================================
  // INTERACTIVE GRAPH VISUALIZER (Prim, Kruskal, Dijkstra, Warshall, Floyd, Max-Flow, Bipartite)
  // ==========================================================================
  const renderGraphVisualizer = (
    gv: NonNullable<TraceStep['graphView']>,
    paperMode = false
  ) => {
    const svgW = 720;
    const svgH = 390;
    const nodeRadius = 22;

    // Compute pixel coordinates for each vertex
    const coords: Record<string, { x: number; y: number }> = {};
    const n = Math.max(1, gv.nodes.length);

    // Check if any nodePositions look like raw pixels (> 100) vs 0..100 percentages
    let maxPosX = 0;
    let maxPosY = 0;
    if (gv.nodePositions) {
      Object.values(gv.nodePositions).forEach((pos) => {
        if (pos.x > maxPosX) maxPosX = pos.x;
        if (pos.y > maxPosY) maxPosY = pos.y;
      });
    }
    const isRawPixels = maxPosX > 105 || maxPosY > 105;

    gv.nodes.forEach((v, idx) => {
      if (gv.nodePositions && gv.nodePositions[v]) {
        const raw = gv.nodePositions[v];
        const normX = isRawPixels ? (raw.x / Math.max(500, maxPosX + 60)) * 100 : raw.x;
        const normY = isRawPixels ? (raw.y / Math.max(280, maxPosY + 50)) * 100 : raw.y;
        coords[v] = {
          x: 56 + (normX / 100) * (svgW - 112),
          y: 46 + (normY / 100) * (svgH - 92),
        };
      } else if (n === 4) {
        // Clean 4-corner square layout for 4-vertex graphs (Warshall & Floyd Slides)
        const corners = [
          { x: 24, y: 20 },
          { x: 76, y: 20 },
          { x: 76, y: 80 },
          { x: 24, y: 80 },
        ];
        const c = corners[idx % 4];
        coords[v] = {
          x: 56 + (c.x / 100) * (svgW - 112),
          y: 46 + (c.y / 100) * (svgH - 92),
        };
      } else if (n === 5) {
        // Dynamic layout for 5-vertex graphs: detect center hub vertex
        const lowerNodes = gv.nodes.map((nodeName) => nodeName.toLowerCase());
        const degrees: Record<string, number> = {};
        gv.nodes.forEach((nodeName) => {
          degrees[nodeName.toLowerCase()] = 0;
        });
        gv.edges.forEach((e) => {
          if (degrees[e.from.toLowerCase()] !== undefined) degrees[e.from.toLowerCase()]++;
          if (degrees[e.to.toLowerCase()] !== undefined) degrees[e.to.toLowerCase()]++;
        });

        // Find candidate hub: 'e' or node with highest degree >= 3
        let hub = lowerNodes.includes('e') ? 'e' : '';
        if (!hub) {
          const sortedByDeg = [...lowerNodes].sort((a, b) => (degrees[b] || 0) - (degrees[a] || 0));
          if ((degrees[sortedByDeg[0]] || 0) >= 3) {
            hub = sortedByDeg[0];
          }
        }

        if (hub && degrees[hub] >= 3) {
          const outerNodes = lowerNodes.filter((x) => x !== hub);
          const hasEdge = (u: string, w: string) =>
            gv.edges.some(
              (e) =>
                (e.from.toLowerCase() === u && e.to.toLowerCase() === w) ||
                (e.to.toLowerCase() === u && e.from.toLowerCase() === w)
            );

          // Prevent edges between outer vertices from crossing the center hub
          let cPos = { x: 18, y: 82 }; // bottom-left
          let dPos = { x: 82, y: 82 }; // bottom-right
          if (hasEdge('b', 'c') || hasEdge('d', 'a')) {
            cPos = { x: 82, y: 82 }; // bottom-right (clockwise square layout)
            dPos = { x: 18, y: 82 }; // bottom-left
          }

          const centerMap5: Record<string, { x: number; y: number }> = {
            [outerNodes[0] || 'a']: { x: 18, y: 18 },
            [outerNodes[1] || 'b']: { x: 82, y: 18 },
            [outerNodes[2] || 'c']: cPos,
            [outerNodes[3] || 'd']: dPos,
            [hub]: { x: 50, y: 50 },
          };
          const c = centerMap5[v.toLowerCase()] || { x: 50, y: 50 };
          coords[v] = {
            x: 56 + (c.x / 100) * (svgW - 112),
            y: 46 + (c.y / 100) * (svgH - 92),
          };
        } else {
          const angle = -Math.PI / 2 + (2 * Math.PI * idx) / n;
          coords[v] = {
            x: svgW / 2 + 215 * Math.cos(angle),
            y: svgH / 2 + 135 * Math.sin(angle),
          };
        }
      } else if (n === 6 && (gv.nodes.map(nodeName => nodeName.toLowerCase()).includes('f'))) {
        // Fallback for 6-vertex graphs with 'f' at center (Lecture 16/17 slide example)
        const centerMap6: Record<string, { x: number; y: number }> = {
          a: { x: 14, y: 26 },
          b: { x: 50, y: 12 },
          c: { x: 86, y: 28 },
          d: { x: 76, y: 86 },
          e: { x: 22, y: 86 },
          f: { x: 50, y: 52 },
        };
        const c = centerMap6[v.toLowerCase()] || { x: 50, y: 50 };
        coords[v] = {
          x: 56 + (c.x / 100) * (svgW - 112),
          y: 46 + (c.y / 100) * (svgH - 92),
        };
      } else {
        const angle = -Math.PI / 2 + (2 * Math.PI * idx) / n;
        coords[v] = {
          x: svgW / 2 + 215 * Math.cos(angle),
          y: svgH / 2 + 135 * Math.sin(angle),
        };
      }
    });

    // Detect antiparallel directed edges (u->v and v->u) so we curve/offset them cleanly
    const edgePairSet = new Set(gv.edges.map((e) => `${e.from}->${e.to}`));

    // Helper: check if two line segments (A-B) and (C-D) strictly intersect in their interiors
    const segmentsIntersect = (
      ax: number,
      ay: number,
      bx: number,
      by: number,
      cx: number,
      cy: number,
      dx: number,
      dy: number
    ) => {
      const ccw = (p1x: number, p1y: number, p2x: number, p2y: number, p3x: number, p3y: number) =>
        (p3y - p1y) * (p2x - p1x) > (p2y - p1y) * (p3x - p1x);
      return (
        ccw(ax, ay, cx, cy, dx, dy) !== ccw(bx, by, cx, cy, dx, dy) &&
        ccw(ax, ay, bx, by, cx, cy) !== ccw(ax, ay, bx, by, dx, dy)
      );
    };

    // Precompute edge geometry & collision-free label placements
    interface ComputedEdgeGeom {
      edge: (typeof gv.edges)[number];
      idx: number;
      pathD: string;
      labelX: number;
      labelY: number;
      labelStr?: string;
      stroke: string;
      strokeWidth: number;
      dashArray?: string;
      labelBg: string;
      labelText: string;
      labelBorder: string;
      markerEnd?: string;
    }

    const computedEdges: ComputedEdgeGeom[] = [];
    const placedLabels: { x: number; y: number }[] = [];

    gv.edges.forEach((e, idx) => {
      const p1 = coords[e.from];
      const p2 = coords[e.to];
      if (!p1 || !p2) return;

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.max(1, Math.hypot(dx, dy));
      const ux = dx / dist;
      const uy = dy / dist;
      // Normal vector pointing "left" of u->v
      const nx = -uy;
      const ny = ux;

      const hasReverse = Boolean(gv.directed && edgePairSet.has(`${e.to}->${e.from}`));

      // Check if any third vertex w lies close to the straight segment p1 -> p2
      let curveBow = 0;
      if (hasReverse) {
        curveBow = 26;
      } else {
        for (const w of gv.nodes) {
          if (w === e.from || w === e.to) continue;
          const pw = coords[w];
          if (!pw) continue;
          const vx = pw.x - p1.x;
          const vy = pw.y - p1.y;
          const proj = (vx * ux + vy * uy) / dist;
          if (proj > 0.12 && proj < 0.88) {
            const perpDist = vx * nx + vy * ny; // signed distance to normal
            if (Math.abs(perpDist) < 48) {
              // Bow away from vertex w (prefer bowing towards the outside of the canvas if near zero)
              const sign =
                Math.abs(perpDist) < 4
                  ? (p1.y + p2.y) / 2 >= svgH / 2
                    ? 1
                    : -1
                  : perpDist > 0
                    ? -1
                    : 1;
              curveBow = sign * 52;
              break;
            }
          }
        }
      }

      // Compute quadratic Bezier control point (cx, cy) in full node-to-node coordinates
      const midCenterX = (p1.x + p2.x) / 2;
      const midCenterY = (p1.y + p2.y) / 2;
      const cx = midCenterX + nx * curveBow;
      const cy = midCenterY + ny * curveBow;

      // Start & end points clipped to node boundary along tangent to control point
      const startDx = cx - p1.x;
      const startDy = cy - p1.y;
      const startLen = Math.max(1, Math.hypot(startDx, startDy));
      const x1 = p1.x + (startDx / startLen) * nodeRadius;
      const y1 = p1.y + (startDy / startLen) * nodeRadius;

      const endDx = p2.x - cx;
      const endDy = p2.y - cy;
      const endLen = Math.max(1, Math.hypot(endDx, endDy));
      const endPad = nodeRadius + (gv.directed ? 5 : 0);
      const x2 = p2.x - (endDx / endLen) * endPad;
      const y2 = p2.y - (endDy / endLen) * endPad;

      const pathD =
        Math.abs(curveBow) > 0.5
          ? `M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`
          : `M ${x1.toFixed(1)} ${y1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)}`;

      // Determine if this edge crosses any other non-incident edge
      let crossesOther = false;
      let firstCrossingIdx = -1;
      gv.edges.forEach((other, oIdx) => {
        if (oIdx === idx) return;
        if (
          other.from === e.from ||
          other.from === e.to ||
          other.to === e.from ||
          other.to === e.to
        ) {
          return;
        }
        const q1 = coords[other.from];
        const q2 = coords[other.to];
        if (!q1 || !q2) return;
        if (segmentsIntersect(p1.x, p1.y, p2.x, p2.y, q1.x, q1.y, q2.x, q2.y)) {
          crossesOther = true;
          if (firstCrossingIdx === -1) firstCrossingIdx = oIdx;
        }
      });

      // Evaluate point on quadratic Bezier at parameter t in (0, 1)
      const evalBezier = (t: number) => {
        const mt = 1 - t;
        return {
          x: mt * mt * x1 + 2 * mt * t * cx + t * t * x2,
          y: mt * mt * y1 + 2 * mt * t * cy + t * t * y2,
        };
      };

      // Check if either endpoint is a center hub vertex so spoke labels sit closer to the outer ring
      const p1IsCenter = Math.abs(p1.x - svgW / 2) < 95 && Math.abs(p1.y - svgH / 2) < 75;
      const p2IsCenter = Math.abs(p2.x - svgW / 2) < 95 && Math.abs(p2.y - svgH / 2) < 75;

      // Candidate t values along edge: offset from 0.5 when edges cross, have reverse arcs, or radiate from a center hub
      const candidateTs = hasReverse
        ? e.from < e.to
          ? [0.42, 0.5, 0.34, 0.64]
          : [0.58, 0.5, 0.66, 0.36]
        : crossesOther
          ? idx < firstCrossingIdx
            ? [0.32, 0.68, 0.26, 0.74, 0.5]
            : [0.68, 0.32, 0.74, 0.26, 0.5]
          : p1IsCenter && !p2IsCenter
            ? [0.62, 0.56, 0.68, 0.5]
            : p2IsCenter && !p1IsCenter
              ? [0.38, 0.44, 0.32, 0.5]
              : [0.5, 0.38, 0.62, 0.3, 0.7];

      let bestPt = evalBezier(candidateTs[0]);
      let bestScore = -Infinity;

      for (const tVal of candidateTs) {
        const pt = evalBezier(tVal);
        let minClearance = Infinity;

        // Clearance from already placed edge labels
        for (const pl of placedLabels) {
          const d = Math.hypot(pt.x - pl.x, pt.y - pl.y);
          if (d < minClearance) minClearance = d;
        }
        // Clearance from all vertex centers (extra clearance from center hub vertices!)
        for (const vName of gv.nodes) {
          const vp = coords[vName];
          if (!vp) continue;
          const isHub = Math.abs(vp.x - svgW / 2) < 95 && Math.abs(vp.y - svgH / 2) < 75;
          const d = Math.hypot(pt.x - vp.x, pt.y - vp.y) - (isHub ? 22 : 10);
          if (d < minClearance) minClearance = d;
        }

        if (minClearance > bestScore) {
          bestScore = minClearance;
          bestPt = pt;
        }
        if (minClearance >= 36) {
          bestPt = pt;
          break;
        }
      }

      const labelStr =
        e.label !== undefined
          ? String(e.label)
          : e.weight !== undefined
            ? String(e.weight)
            : undefined;

      if (labelStr !== undefined) {
        placedLabels.push(bestPt);
      }

      let stroke = paperMode ? '#334155' : '#475569';
      let strokeWidth = 2.1;
      let dashArray: string | undefined;
      let labelBg = paperMode ? '#ffffff' : '#0f172a';
      let labelText = paperMode ? '#0f172a' : '#cbd5e1';
      let labelBorder = paperMode ? '#64748b' : '#334155';
      let markerEnd = gv.directed
        ? paperMode
          ? 'url(#graph-arrow-paper-default)'
          : 'url(#graph-arrow-default)'
        : undefined;

      if (e.state === 'selected') {
        stroke = paperMode ? '#dc2626' : '#22d3ee';
        strokeWidth = 4;
        labelBg = paperMode ? '#fef2f2' : '#083344';
        labelText = paperMode ? '#dc2626' : '#67e8f9';
        labelBorder = paperMode ? '#dc2626' : '#22d3ee';
        markerEnd = gv.directed
          ? paperMode
            ? 'url(#graph-arrow-paper-red)'
            : 'url(#graph-arrow-selected)'
          : undefined;
      } else if (e.state === 'tree' || e.highlight) {
        stroke = paperMode ? '#dc2626' : '#10b981';
        strokeWidth = 3.5;
        labelBg = paperMode ? '#fef2f2' : '#064e3b';
        labelText = paperMode ? '#dc2626' : '#6ee7b7';
        labelBorder = paperMode ? '#dc2626' : '#10b981';
        markerEnd = gv.directed
          ? paperMode
            ? 'url(#graph-arrow-paper-red)'
            : 'url(#graph-arrow-tree)'
          : undefined;
      } else if (e.state === 'candidate') {
        stroke = paperMode ? '#d97706' : '#f59e0b';
        strokeWidth = 2.4;
        dashArray = '6,4';
        labelBg = paperMode ? '#fffbeb' : '#451a03';
        labelText = paperMode ? '#b45309' : '#fcd34d';
        labelBorder = paperMode ? '#d97706' : '#f59e0b';
      } else if (e.state === 'rejected') {
        stroke = paperMode ? '#94a3b8' : '#f43f5e';
        strokeWidth = 2.0;
        dashArray = '4,4';
        labelBg = paperMode ? '#f8fafc' : '#4c0519';
        labelText = paperMode ? '#64748b' : '#fda4af';
        labelBorder = paperMode ? '#94a3b8' : '#f43f5e';
      } else if (gv.activeK && (e.from === gv.activeK || e.to === gv.activeK)) {
        stroke = paperMode ? '#dc2626' : '#f59e0b';
        strokeWidth = 2.6;
        labelBg = paperMode ? '#fef2f2' : '#451a03';
        labelText = paperMode ? '#dc2626' : '#fcd34d';
        labelBorder = paperMode ? '#dc2626' : '#f59e0b';
      }

      computedEdges.push({
        edge: e,
        idx,
        pathD,
        labelX: bestPt.x,
        labelY: bestPt.y,
        labelStr,
        stroke,
        strokeWidth,
        dashArray,
        labelBg,
        labelText,
        labelBorder,
        markerEnd,
      });
    });

    return (
      <div
        className={
          paperMode
            ? 'rounded-lg border-2 border-black bg-white p-3 space-y-2'
            : 'rounded-xl border border-slate-800 bg-slate-900/95 p-4 shadow-lg space-y-3'
        }
      >
        {/* Header & Live Set / Queue Status Badges */}
        {!paperMode && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/90 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-100">
                {gv.directed ? 'Directed' : 'Undirected'} Weighted Graph Visualizer ({gv.nodes.length} Vertices, {gv.edges.length} Edges)
              </h4>
              {gv.caption && <p className="text-xs text-slate-400 mt-0.5">{gv.caption}</p>}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {gv.activeK && (
                <span className="rounded-md border border-amber-500/40 bg-amber-500/15 px-2.5 py-1 font-mono text-xs font-semibold text-amber-300">
                  Pivot k = '{gv.activeK}'
                </span>
              )}
              {gv.totalWeight !== undefined && (
                <span className="rounded-md border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1 font-mono text-xs font-bold text-emerald-300">
                  Total Weight / Flow = {gv.totalWeight}
                </span>
              )}
            </div>
          </div>
        )}

        {/* V_T, E_T, and Priority Queue Q Live Banner */}
        {!paperMode && (gv.vtLabel || gv.etLabel || gv.queueLabel) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-xs">
            {gv.vtLabel && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/25 px-3 py-1.5 text-emerald-200">
                {gv.vtLabel}
              </div>
            )}
            {gv.etLabel && (
              <div className="rounded-lg border border-cyan-500/30 bg-cyan-950/25 px-3 py-1.5 text-cyan-200">
                {gv.etLabel}
              </div>
            )}
            {gv.queueLabel && (
              <div className="md:col-span-2 rounded-lg border border-amber-500/30 bg-amber-950/25 px-3 py-1.5 text-amber-200">
                {gv.queueLabel}
              </div>
            )}
          </div>
        )}

        {/* Interactive SVG Graph Canvas */}
        <div
          className={
            paperMode
              ? 'w-full overflow-x-auto bg-white py-1'
              : 'w-full overflow-x-auto rounded-xl border border-slate-800/90 bg-slate-950/90 py-2'
          }
        >
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="mx-auto w-full max-w-[720px] select-none"
            style={{ minWidth: '460px', height: paperMode ? '320px' : '360px' }}
          >
            <defs>
              <marker
                id="graph-arrow-default"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="#64748b" />
              </marker>
              <marker
                id="graph-arrow-tree"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6.5"
                markerHeight="6.5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="#10b981" />
              </marker>
              <marker
                id="graph-arrow-selected"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6.5"
                markerHeight="6.5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="#22d3ee" />
              </marker>
              <marker
                id="graph-arrow-paper-default"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="#334155" />
              </marker>
              <marker
                id="graph-arrow-paper-red"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6.5"
                markerHeight="6.5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="#dc2626" />
              </marker>
            </defs>

            {/* Layer 1: Edge Curves / Lines */}
            {computedEdges.map((ce) => (
              <path
                key={`line-${ce.edge.from}-${ce.edge.to}-${ce.idx}`}
                d={ce.pathD}
                fill="none"
                stroke={ce.stroke}
                strokeWidth={ce.strokeWidth}
                strokeDasharray={ce.dashArray}
                markerEnd={ce.markerEnd}
              />
            ))}

            {/* Layer 2: Edge Weight / Flow Labels (Collision-Resolved) */}
            {computedEdges.map((ce) => {
              if (ce.labelStr === undefined) return null;
              const pillW = Math.max(26, ce.labelStr.length * 7.2 + 12);
              return (
                <g
                  key={`lbl-${ce.edge.from}-${ce.edge.to}-${ce.idx}`}
                  transform={`translate(${ce.labelX}, ${ce.labelY})`}
                >
                  <rect
                    x={-pillW / 2}
                    y={-10}
                    width={pillW}
                    height={20}
                    rx={5}
                    fill={ce.labelBg}
                    stroke={ce.labelBorder}
                    strokeWidth={1.3}
                  />
                  <text
                    x={0}
                    y={0}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={ce.labelText}
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {ce.labelStr}
                  </text>
                </g>
              );
            })}

            {/* Layer 3: Nodes & Smart Angular-Placed Badges */}
            {gv.nodes.map((v) => {
              const p = coords[v];
              if (!p) return null;
              const nState = gv.nodeStates?.[v] ?? (gv.activeK === v ? 'active' : 'default');
              const badge = gv.nodeBadges?.[v];

              let fill = paperMode ? '#ffffff' : '#1e293b';
              let stroke = paperMode ? '#0f172a' : '#64748b';
              let textColor = paperMode ? '#0f172a' : '#f8fafc';
              let badgeFill = paperMode ? '#ffffff' : '#0f172a';
              let badgeStroke = paperMode ? '#64748b' : '#475569';
              let badgeText = paperMode ? '#334155' : '#cbd5e1';

              if (nState === 'active') {
                fill = paperMode ? '#fef2f2' : '#083344';
                stroke = paperMode ? '#dc2626' : '#22d3ee';
                textColor = paperMode ? '#dc2626' : '#67e8f9';
                badgeFill = paperMode ? '#fef2f2' : '#083344';
                badgeStroke = paperMode ? '#dc2626' : '#22d3ee';
                badgeText = paperMode ? '#dc2626' : '#a5f3fc';
              } else if (nState === 'in-tree' || nState === 'source') {
                fill = paperMode ? '#fef2f2' : '#064e3b';
                stroke = paperMode ? '#dc2626' : '#10b981';
                textColor = paperMode ? '#dc2626' : '#a7f3d0';
                badgeFill = paperMode ? '#ffffff' : '#064e3b';
                badgeStroke = paperMode ? '#dc2626' : '#10b981';
                badgeText = paperMode ? '#dc2626' : '#6ee7b7';
              } else if (nState === 'fringe') {
                fill = paperMode ? '#fffbeb' : '#451a03';
                stroke = paperMode ? '#d97706' : '#f59e0b';
                textColor = paperMode ? '#b45309' : '#fde68a';
                badgeFill = paperMode ? '#fffbeb' : '#451a03';
                badgeStroke = paperMode ? '#d97706' : '#f59e0b';
                badgeText = paperMode ? '#dc2626' : '#fcd34d';
              }

              // Compute incident edge angles (in radians) from vertex v so badge avoids edges!
              const incidentAngles: number[] = [];
              gv.edges.forEach((e) => {
                if (e.from === v && coords[e.to]) {
                  incidentAngles.push(Math.atan2(coords[e.to].y - p.y, coords[e.to].x - p.x));
                } else if (e.to === v && coords[e.from]) {
                  incidentAngles.push(Math.atan2(coords[e.from].y - p.y, coords[e.from].x - p.x));
                }
              });

              const badgeW = badge ? Math.max(48, badge.length * 6.8 + 12) : 0;
              const candidateDirs =
                p.y < svgH * 0.38
                  ? [
                      -Math.PI / 2,
                      Math.PI,
                      0,
                      -Math.PI * 0.75,
                      -Math.PI * 0.25,
                      Math.PI / 2,
                      Math.PI * 0.75,
                      Math.PI * 0.25,
                    ]
                  : p.y > svgH * 0.62
                    ? [
                        Math.PI / 2,
                        Math.PI,
                        0,
                        Math.PI * 0.75,
                        Math.PI * 0.25,
                        -Math.PI / 2,
                        -Math.PI * 0.75,
                        -Math.PI * 0.25,
                      ]
                    : [
                        -Math.PI / 2,
                        Math.PI / 2,
                        Math.PI,
                        0,
                        -Math.PI * 0.75,
                        -Math.PI * 0.25,
                        Math.PI * 0.75,
                        Math.PI * 0.25,
                      ];

              let bestBadgeX = p.x;
              let bestBadgeY = p.y <= svgH / 2 ? p.y - nodeRadius - 14 : p.y + nodeRadius + 15;
              let bestAngularClearance = -999;

              for (const candAngle of candidateDirs) {
                const distFromNode =
                  Math.abs(Math.cos(candAngle)) > 0.65
                    ? nodeRadius + badgeW / 2 + 8
                    : nodeRadius + 16;
                const bx = p.x + Math.cos(candAngle) * distFromNode;
                const by = p.y + Math.sin(candAngle) * (nodeRadius + 16);

                // Must stay comfortably inside SVG bounds
                if (
                  bx - badgeW / 2 < 6 ||
                  bx + badgeW / 2 > svgW - 6 ||
                  by - 11 < 4 ||
                  by + 11 > svgH - 4
                ) {
                  continue;
                }

                let minAngleDiff = Math.PI;
                for (const incA of incidentAngles) {
                  let diff = Math.abs(candAngle - incA) % (2 * Math.PI);
                  if (diff > Math.PI) diff = 2 * Math.PI - diff;
                  if (diff < minAngleDiff) minAngleDiff = diff;
                }

                // Also check distance from placed edge weight pills so center node badges never cover spoke weights!
                let labelPenalty = 0;
                for (const pl of placedLabels) {
                  const dxLbl = Math.abs(bx - pl.x);
                  const dyLbl = Math.abs(by - pl.y);
                  if (dxLbl < badgeW / 2 + 16 && dyLbl < 22) {
                    labelPenalty += 2.5;
                  }
                }

                // Slight preference bonus for straight above/below when already clear (> 42 deg)
                const cardinalBonus =
                  Math.abs(Math.abs(candAngle) - Math.PI / 2) < 0.05 && minAngleDiff > 0.72
                    ? 0.35
                    : 0;
                const score = minAngleDiff + cardinalBonus - labelPenalty;
                if (score > bestAngularClearance) {
                  bestAngularClearance = score;
                  bestBadgeX = bx;
                  bestBadgeY = by;
                }
              }

              return (
                <g key={v}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={nodeRadius}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={3}
                  />
                  <text
                    x={p.x}
                    y={p.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={textColor}
                    fontSize="14"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {v}
                  </text>
                  {badge && (
                    <g transform={`translate(${bestBadgeX}, ${bestBadgeY})`}>
                      <rect
                        x={-badgeW / 2}
                        y={-9}
                        width={badgeW}
                        height={18}
                        rx={4}
                        fill={badgeFill}
                        stroke={badgeStroke}
                        strokeWidth={1.2}
                      />
                      <text
                        x={0}
                        y={0}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill={badgeText}
                        fontSize="10"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {badge}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Visual Color Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-1 text-[11px] font-mono text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full border-2 border-emerald-400 bg-emerald-950" />
            In Tree Set (V_T)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full border-2 border-cyan-400 bg-cyan-950" />
            Active / Newly Added (u*)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full border-2 border-amber-400 bg-amber-950" />
            Fringe Candidate (∈ Q)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1 w-5 bg-emerald-400" />
            Tree Edge (∈ E_T)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-5 border-t-2 border-dashed border-amber-400" />
            Cut Candidate Edge
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-5 border-t-2 border-dashed border-rose-400" />
            Rejected Edge (Cycle)
          </span>
        </div>
      </div>
    );
  };

  // ==========================================================================
  // INTERACTIVE HUFFMAN FOREST & TREE VISUALIZER (Lecture 18 Slides 60–115)
  // ==========================================================================
  const renderSingleHuffmanTreeSVG = (
    root: HuffmanTreeNodeView,
    titleLabel: string,
    subtitleLabel?: string
  ) => {
    interface PositionedHNode {
      node: HuffmanTreeNodeView;
      x: number;
      y: number;
      parentX?: number;
      parentY?: number;
      edgeBit?: '0' | '1';
    }

    const getDepth = (nd: HuffmanTreeNodeView | null | undefined): number => {
      if (!nd) return 0;
      return 1 + Math.max(getDepth(nd.left), getDepth(nd.right));
    };

    const countLeaves = (nd: HuffmanTreeNodeView | null | undefined): number => {
      if (!nd) return 0;
      if (!nd.left && !nd.right) return 1;
      return countLeaves(nd.left) + countLeaves(nd.right);
    };

    const maxDepth = Math.max(1, getDepth(root));
    const leaves = Math.max(2, countLeaves(root));
    const svgW = Math.max(460, leaves * 96);
    const levelGap = 72;
    const svgH = Math.max(210, maxDepth * levelGap + 48);

    const positioned: PositionedHNode[] = [];
    const layoutTree = (
      nd: HuffmanTreeNodeView | null | undefined,
      depth: number,
      xMin: number,
      xMax: number,
      parentX?: number,
      parentY?: number,
      edgeBit?: '0' | '1'
    ) => {
      if (!nd) return;
      const x = (xMin + xMax) / 2;
      const y = 38 + depth * levelGap;
      positioned.push({ node: nd, x, y, parentX, parentY, edgeBit });
      if (nd.left) {
        layoutTree(nd.left, depth + 1, xMin, x, x, y, '0');
      }
      if (nd.right) {
        layoutTree(nd.right, depth + 1, x, xMax, x, y, '1');
      }
    };

    layoutTree(root, 0, 24, svgW - 24);

    return (
      <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-3.5">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-xs font-bold text-indigo-300">{titleLabel}</span>
          {subtitleLabel && <span className="font-mono text-[11px] text-slate-400">{subtitleLabel}</span>}
        </div>
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="mx-auto select-none"
            style={{ width: `${svgW}px`, height: `${svgH}px` }}
          >
            {/* Edges with 0 (Left) / 1 (Right) Labels */}
            {positioned.map((p) => {
              if (p.parentX === undefined || p.parentY === undefined) return null;
              const midX = (p.parentX + p.x) / 2;
              const midY = (p.parentY + p.y) / 2;
              const isLeft = p.edgeBit === '0';
              return (
                <g key={`edge-${p.node.id}`}>
                  <line
                    x1={p.parentX}
                    y1={p.parentY + 16}
                    x2={p.x}
                    y2={p.y - 18}
                    stroke={isLeft ? '#22d3ee' : '#f59e0b'}
                    strokeWidth={2.2}
                  />
                  {p.edgeBit && (
                    <g transform={`translate(${midX + (isLeft ? -10 : 10)}, ${midY})`}>
                      <rect
                        x={-9}
                        y={-9}
                        width={18}
                        height={18}
                        rx={4}
                        fill={isLeft ? '#083344' : '#451a03'}
                        stroke={isLeft ? '#22d3ee' : '#f59e0b'}
                        strokeWidth={1.2}
                      />
                      <text
                        x={0}
                        y={4}
                        textAnchor="middle"
                        fill={isLeft ? '#67e8f9' : '#fcd34d'}
                        fontSize="11"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {p.edgeBit}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Nodes: Internal Weight Circles vs. Two-Row Leaf Symbol+Weight Boxes (Exact Slide Style!) */}
            {positioned.map((p) => {
              const { node, x, y } = p;
              const isLeaf = node.symbol !== undefined;

              if (!isLeaf) {
                const isNewParent = node.highlight === 'new-parent';
                const isActive = node.highlight === 'active';
                return (
                  <g key={node.id}>
                    <circle
                      cx={x}
                      cy={y}
                      r={20}
                      fill={isNewParent ? '#064e3b' : isActive ? '#312e81' : '#1e293b'}
                      stroke={isNewParent ? '#10b981' : isActive ? '#818cf8' : '#94a3b8'}
                      strokeWidth={2.5}
                    />
                    <text
                      x={x}
                      y={y + 4}
                      textAnchor="middle"
                      fill="#f8fafc"
                      fontSize="11"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {node.weightLabel}
                    </text>
                  </g>
                );
              }

              // Leaf Node: Two stacked boxes (Weight + Symbol) + Codeword pill below
              const boxW = 48;
              const boxH = 38;
              return (
                <g key={node.id} transform={`translate(${x}, ${y})`}>
                  <rect
                    x={-boxW / 2}
                    y={-boxH / 2}
                    width={boxW}
                    height={boxH}
                    rx={5}
                    fill="#0f172a"
                    stroke="#38bdf8"
                    strokeWidth={2}
                  />
                  <line
                    x1={-boxW / 2}
                    y1={0}
                    x2={boxW / 2}
                    y2={0}
                    stroke="#334155"
                    strokeWidth={1.2}
                  />
                  {/* Top Half: Weight */}
                  <text
                    x={0}
                    y={-5}
                    textAnchor="middle"
                    fill="#bae6fd"
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {node.weightLabel}
                  </text>
                  {/* Bottom Half: Symbol */}
                  <text
                    x={0}
                    y={13}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="12"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {node.symbol}
                  </text>
                  {/* Codeword Pill underneath leaf */}
                  {node.code && (
                    <g transform="translate(0, 30)">
                      <rect
                        x={-22}
                        y={-8}
                        width={44}
                        height={16}
                        rx={4}
                        fill="#064e3b"
                        stroke="#10b981"
                        strokeWidth={1}
                      />
                      <text
                        x={0}
                        y={3.5}
                        textAnchor="middle"
                        fill="#6ee7b7"
                        fontSize="10"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {node.code}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  const renderHuffmanVisualizer = (hv: HuffmanStepView) => {
    const getLeavesString = (nd: HuffmanTreeNodeView): string => {
      if (nd.symbol !== undefined) return nd.symbol;
      const l = nd.left ? getLeavesString(nd.left) : '';
      const r = nd.right ? getLeavesString(nd.right) : '';
      return `${l},${r}`;
    };

    // Find the largest/most recently merged tree to render in full 2D SVG
    const mainTreeToRender =
      hv.forestQueue.find((t) => t.id === hv.newMergedNodeId) ||
      hv.forestQueue.reduce(
        (best, curr) =>
          curr.left || curr.right
            ? !best || curr.weight >= best.weight
              ? curr
              : best
            : best,
        null as HuffmanTreeNodeView | null
      );

    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/95 p-4 shadow-lg space-y-4">
        {/* Top Priority Queue / Forest of Trees Bar (Slides 61–72 & 77–82) */}
        <div>
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-slate-100">
                Huffman Priority Queue Q — Forest of Trees ({hv.forestQueue.length}{' '}
                {hv.forestQueue.length === 1 ? 'Complete Tree' : 'Trees in Sorted Order'})
              </h4>
              <p className="text-xs text-slate-400">
                At each step, the two smallest-weight trees at the front of Q (T_L and T_R) are merged into a new parent tree with weight(T_L) + weight(T_R).
              </p>
            </div>
            {hv.compressionRatio && (
              <span className="rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 font-mono text-xs font-bold text-emerald-300">
                Avg = {hv.avgBitsPerSymbol} bits vs. Fixed = {hv.fixedBitsPerSymbol} bits → Compression = {hv.compressionRatio}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-950/80 p-3">
            {hv.forestQueue.map((tree, idx) => {
              const isMergingCandidate =
                hv.mergingPairIds &&
                (hv.mergingPairIds[0] === tree.id || hv.mergingPairIds[1] === tree.id);
              const isNewMerged = hv.newMergedNodeId === tree.id;
              const isLeftCandidate = hv.mergingPairIds?.[0] === tree.id;

              return (
                <div
                  key={tree.id}
                  className={`flex flex-col items-center rounded-lg border px-3 py-2 font-mono transition ${
                    isNewMerged
                      ? 'border-emerald-400 bg-emerald-950/40 text-emerald-100 ring-2 ring-emerald-400/40'
                      : isMergingCandidate
                        ? 'border-amber-400 bg-amber-950/40 text-amber-100 ring-1 ring-amber-400/40'
                        : 'border-slate-700 bg-slate-900 text-slate-200'
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">
                    {isNewMerged
                      ? '★ Newly Merged'
                      : isMergingCandidate
                        ? isLeftCandidate
                          ? 'Next T_L (Edge 0)'
                          : 'Next T_R (Edge 1)'
                        : `Queue #${idx + 1}`}
                  </span>
                  <span className="mt-0.5 text-sm font-extrabold text-white">
                    Weight = {tree.weightLabel}
                  </span>
                  <span className="mt-0.5 text-xs text-cyan-300">
                    {tree.symbol ? `Leaf '${tree.symbol}'` : `Subtree {${getLeavesString(tree)}}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Render Active Merged Subtree or Final Complete Huffman Tree */}
        {mainTreeToRender &&
          renderSingleHuffmanTreeSVG(
            mainTreeToRender,
            hv.forestQueue.length === 1
              ? 'Complete Variable-Length Huffman Tree (Left Branch = 0, Right Branch = 1)'
              : `Latest Merged Subtree (Root Weight = ${mainTreeToRender.weightLabel}, Leaves = {${getLeavesString(mainTreeToRender)}})`,
            'All symbols are strictly at Leaf Nodes (Prefix-Free Property)'
          )}

        {/* Render Fixed-Length Tree on Init Step for Direct Visual Comparison (Slides 60 & 76) */}
        {hv.phase === 'init' &&
          hv.fixedLengthTree &&
          renderSingleHuffmanTreeSVG(
            hv.fixedLengthTree,
            'Fixed-Length Encoding Binary Tree Baseline (Lecture 18 Slides 60 & 76)',
            'Every symbol is at the exact same depth ⌈log₂ n⌉'
          )}

        {/* Live Visual Encode / Decode Segmented Bitstream Breakdown */}
        {(hv.encodeDemo || hv.decodeDemo) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pt-1">
            {hv.encodeDemo && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold uppercase text-emerald-300">
                    1. Encoding "{hv.encodeDemo.plainText}" ({hv.encodeDemo.encodedBits.length} bits)
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {hv.encodeDemo.segments.map((seg, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded border border-emerald-500/40 bg-slate-950 px-2 py-1 font-mono text-xs"
                    >
                      <strong className="text-white">'{seg.symbol}'</strong>
                      <span className="text-slate-400">→</span>
                      <span className="font-bold text-emerald-300">{seg.code}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {hv.decodeDemo && (
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold uppercase text-cyan-300">
                    2. Decoding Bitstream → "{hv.decodeDemo.decodedText}"
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {hv.decodeDemo.segments.map((seg, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded border border-cyan-500/40 bg-slate-950 px-2 py-1 font-mono text-xs"
                    >
                      <span className="font-bold text-amber-300">{seg.bits}</span>
                      <span className="text-slate-400">→</span>
                      <strong className="text-cyan-200">'{seg.symbol}'</strong>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderBadSymbolSubTrace = (pattern: string, displayCols: (string | number)[]) => {
    const P = pattern.trim();
    const m = P.length;
    if (m === 0) return null;

    // Total steps:
    // step 0: Initialization (all = m)
    // step 1 .. m-1: Loop j = 0 .. m-2 (setting t1(P[j]) = m - 1 - j)
    // step m: Final summary (why last character j = m-1 is excluded)
    const totalSubSteps = m + 1;
    const safeSubStep = Math.min(Math.max(0, badSymbolStepIdx), totalSubSteps - 1);
    const activeJ = safeSubStep >= 1 && safeSubStep <= m - 1 ? safeSubStep - 1 : null;

    // Compute table state up to safeSubStep
    const currentMap: Record<string, number> = {};
    const prevValueAtActiveJ: { hadPrev: boolean; oldVal: number } = { hadPrev: false, oldVal: m };

    const maxJProcessed = safeSubStep === 0 ? -1 : Math.min(safeSubStep - 1, m - 2);
    for (let j = 0; j <= maxJProcessed; j++) {
      const ch = P[j];
      const dist = m - 1 - j;
      if (j === activeJ) {
        if (ch in currentMap) {
          prevValueAtActiveJ.hadPrev = true;
          prevValueAtActiveJ.oldVal = currentMap[ch];
        } else {
          prevValueAtActiveJ.hadPrev = false;
          prevValueAtActiveJ.oldVal = m;
        }
      }
      currentMap[ch] = dist;
    }

    return (
      <div className="mt-4 rounded-xl border border-indigo-500/40 bg-slate-950/95 p-4 space-y-4">
        {/* Sub-Trace Header & Step Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-indigo-500/20 border border-indigo-500/40 px-2 py-0.5 font-mono text-[11px] font-bold text-indigo-300">
                Bad-Symbol Trace: Step {safeSubStep} of {totalSubSteps - 1}
              </span>
              <h5 className="text-xs sm:text-sm font-bold text-white">
                How Bad-Symbol Shift Table t₁(c) is Computed for &quot;{P}&quot; (m = {m})
              </h5>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Rule: Initialize all characters to <code>m = {m}</code>. Then scan <code>j = 0</code> to <code>m − 2 ({m - 2})</code> from left to right and set <code>t₁(P[j]) = m − 1 − j</code> (the last character at <code>j = {m - 1}</code> is excluded!).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 rounded border border-indigo-500/40 bg-indigo-950/70 px-2 py-0.5 font-mono text-[10px] text-indigo-300">
              ⌨️ ← → Active Here
            </span>
            <button
              type="button"
              disabled={safeSubStep <= 0}
              onClick={() => setBadSymbolStepIdx((p) => Math.max(0, p - 1))}
              className="rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 px-3 py-1 text-xs font-semibold text-slate-200 transition cursor-pointer"
            >
              ← Prev
            </button>
            <button
              type="button"
              disabled={safeSubStep >= totalSubSteps - 1}
              onClick={() => setBadSymbolStepIdx((p) => Math.min(totalSubSteps - 1, p + 1))}
              className="rounded-lg border border-indigo-500/50 bg-indigo-600/20 hover:bg-indigo-600/30 disabled:opacity-40 px-3 py-1 text-xs font-semibold text-indigo-200 transition cursor-pointer"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Step Pills */}
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setBadSymbolStepIdx(0)}
            className={`rounded-md px-2.5 py-1 font-mono text-[11px] transition cursor-pointer border ${
              safeSubStep === 0
                ? 'border-indigo-400 bg-indigo-500/25 text-white font-bold'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            0. Init All = {m}
          </button>
          {Array.from({ length: Math.max(0, m - 1) }, (_, j) => {
            const stepNum = j + 1;
            const isCurr = safeSubStep === stepNum;
            return (
              <button
                key={j}
                type="button"
                onClick={() => setBadSymbolStepIdx(stepNum)}
                className={`rounded-md px-2.5 py-1 font-mono text-[11px] transition cursor-pointer border ${
                  isCurr
                    ? 'border-[#7c6df2] bg-[#7c6df2] text-white font-bold shadow-sm'
                    : safeSubStep > stepNum
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                j={j} (&apos;{P[j]}&apos; → {m - 1 - j})
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setBadSymbolStepIdx(m)}
            className={`rounded-md px-2.5 py-1 font-mono text-[11px] transition cursor-pointer border ${
              safeSubStep === m
                ? 'border-amber-400 bg-amber-500/25 text-amber-200 font-bold'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            Why Last j={m - 1} (&apos;{P[m - 1]}&apos;) is Ignored
          </button>
        </div>

        {/* Visual Pattern Ruler: Indices j, Characters P[j], and Distances (m - 1 - j) */}
        <div className="overflow-x-auto">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            1. Pattern Character Positions &amp; Distance to Last Index (m − 1 = {m - 1}):
          </div>
          <table className="w-full border-collapse font-mono text-xs">
            <thead>
              <tr>
                <th className="border border-slate-800 bg-slate-900 px-3 py-1.5 text-left text-slate-400">
                  Index j
                </th>
                {P.split('').map((_, j) => {
                  const isLast = j === m - 1;
                  const isCurrentJ = activeJ === j;
                  return (
                    <th
                      key={j}
                      className={`border border-slate-800 px-3 py-1.5 text-center ${
                        isCurrentJ
                          ? 'bg-[#7c6df2]/30 text-white font-bold'
                          : isLast
                          ? 'bg-rose-950/40 text-rose-300'
                          : 'bg-slate-900 text-slate-300'
                      }`}
                    >
                      j = {j} {isLast ? '(Last - Excluded)' : ''}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-800 bg-slate-900 px-3 py-2 font-semibold text-slate-300">
                  Pattern P[j]
                </td>
                {P.split('').map((ch, j) => {
                  const isLast = j === m - 1;
                  const isCurrentJ = activeJ === j;
                  const isDone = j <= maxJProcessed;
                  return (
                    <td
                      key={j}
                      className={`border px-3 py-2 text-center text-sm font-bold transition-all ${
                        isCurrentJ
                          ? 'border-[#a78bfa] bg-[#7c6df2] text-white ring-2 ring-[#a78bfa]/50'
                          : isLast
                          ? safeSubStep === m
                            ? 'border-amber-500 bg-amber-500/20 text-amber-200'
                            : 'border-slate-800 bg-rose-950/25 text-slate-400 line-through'
                          : isDone
                          ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200'
                          : 'border-slate-800 bg-slate-950 text-slate-400'
                      }`}
                    >
                      {ch}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="border border-slate-800 bg-slate-900 px-3 py-1.5 font-semibold text-slate-400">
                  Distance: (m − 1) − j = {m - 1} − j
                </td>
                {P.split('').map((_, j) => {
                  const isLast = j === m - 1;
                  const isCurrentJ = activeJ === j;
                  const dist = m - 1 - j;
                  return (
                    <td
                      key={j}
                      className={`border border-slate-800 px-3 py-1.5 text-center ${
                        isCurrentJ
                          ? 'bg-[#7c6df2]/20 text-[#c4b5fd] font-bold'
                          : isLast
                          ? 'bg-rose-950/20 text-rose-400 italic'
                          : 'bg-slate-950 text-slate-300'
                      }`}
                    >
                      {isLast ? '0 (Skipped)' : `${m - 1} − ${j} = ${dist}`}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Step Explanation Box */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/90 p-3 font-mono text-xs space-y-1">
          {safeSubStep === 0 && (
            <>
              <div className="font-bold text-indigo-300">
                Step 0 (Initialization): Set t₁(c) = m = {m} for all alphabet characters
              </div>
              <div className="font-sans text-slate-300">
                Any character that does <strong>not</strong> appear among the first <code>m − 1 = {m - 1}</code> characters of the pattern gets the full pattern length shift <code>m = {m}</code>.
              </div>
            </>
          )}
          {activeJ !== null && (
            <>
              <div className="font-bold text-[#c4b5fd]">
                Step {safeSubStep} (j = {activeJ}): Process P[{activeJ}] = &apos;{P[activeJ]}&apos;  ⇒  t₁(&apos;{P[activeJ]}&apos;) = {m - 1} − {activeJ} = {m - 1 - activeJ}
              </div>
              <div className="font-sans text-slate-300">
                Distance from index <code>j = {activeJ}</code> to the last index <code>m − 1 = {m - 1}</code> is <code>{m - 1} − {activeJ} = {m - 1 - activeJ}</code>.{' '}
                {prevValueAtActiveJ.hadPrev ? (
                  <span className="text-amber-300 font-semibold">
                    Notice: &apos;{P[activeJ]}&apos; had an earlier shift of {prevValueAtActiveJ.oldVal}, which is now overwritten with {m - 1 - activeJ} because index j = {activeJ} is further to the right!
                  </span>
                ) : (
                  <span>
                    We update <code>t₁(&apos;{P[activeJ]}&apos;)</code> from default <code>{m}</code> to <code>{m - 1 - activeJ}</code>.
                  </span>
                )}
              </div>
            </>
          )}
          {safeSubStep === m && (
            <>
              <div className="font-bold text-amber-300">
                Final Check (j = {m - 1}): Why Last Character P[{m - 1}] = &apos;{P[m - 1]}&apos; is Excluded from Loop
              </div>
              <div className="font-sans text-slate-300">
                The loop only runs for <code>j = 0</code> to <code>m − 2 ({m - 2})</code>. If we included <code>j = {m - 1}</code>, its distance would be <code>{m - 1} − {m - 1} = 0</code> (a shift of 0 would cause an infinite loop!).{' '}
                {P.slice(0, m - 1).includes(P[m - 1]) ? (
                  <span className="text-emerald-300 font-semibold">
                    Since &apos;{P[m - 1]}&apos; already appeared earlier in P[0..{m - 2}] (rightmost at j = {P.slice(0, m - 1).lastIndexOf(P[m - 1])}), its final shift is t₁(&apos;{P[m - 1]}&apos;) = {currentMap[P[m - 1]]}.
                  </span>
                ) : (
                  <span className="text-emerald-300 font-semibold">
                    Since &apos;{P[m - 1]}&apos; did NOT appear anywhere in P[0..{m - 2}], its final shift remains the full length m = {m}.
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Live Evolving Shift Table at Current Sub-Step */}
        <div className="overflow-x-auto">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            2. Shift Table State After Step {safeSubStep}:
          </div>
          <table className="w-full border-collapse font-mono text-xs">
            <thead>
              <tr>
                <th className="border border-slate-800 bg-slate-900 px-3 py-1.5 text-left text-slate-400">
                  Character c
                </th>
                {displayCols.map((col, idx) => (
                  <th
                    key={idx}
                    className="border border-slate-800 bg-slate-900 px-3 py-1.5 text-center text-slate-300"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-800 bg-slate-900 px-3 py-2 font-semibold text-slate-300">
                  t₁(c)
                </td>
                {displayCols.map((col, idx) => {
                  const chStr = String(col);
                  const val = chStr === 'Other (*)' ? m : (currentMap[chStr] ?? m);
                  const isJustUpdated = activeJ !== null && P[activeJ] === chStr;
                  const isUpdatedEarlier = chStr !== 'Other (*)' && chStr in currentMap && !isJustUpdated;
                  return (
                    <td
                      key={idx}
                      className={`border px-3 py-2 text-center font-bold transition-all ${
                        isJustUpdated
                          ? 'border-[#a78bfa] bg-[#7c6df2] text-white ring-2 ring-[#a78bfa]/50'
                          : isUpdatedEarlier
                          ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200'
                          : 'border-slate-800 bg-slate-950 text-slate-400'
                      }`}
                    >
                      {val}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderGoodSuffixSubTrace = (pattern: string) => {
    const P = pattern.trim();
    const m = P.length;
    if (m <= 1) return null;

    const safeK = Math.min(Math.max(1, goodSuffixK), m - 1);
    const suff = P.slice(m - safeK);
    const suffixStartIdx = m - safeK;
    const precedingIdx = m - safeK - 1;
    const precedingChar = P[precedingIdx];

    // Rule 1: Scan from right to left for another occurrence of `suff` inside P[0 .. m - 2]
    // that is NOT preceded by `precedingChar`
    const interiorOccurrences: {
      start: number;
      end: number;
      shift: number;
      charBefore: string | null;
      valid: boolean;
    }[] = [];

    let case1WinnerShift: number | null = null;
    let case1WinnerStart: number | null = null;
    for (let start = m - safeK - 1; start >= 0; start--) {
      if (P.slice(start, start + safeK) === suff) {
        const charBefore = start > 0 ? P[start - 1] : null;
        const valid = charBefore !== precedingChar;
        const shift = suffixStartIdx - start;
        interiorOccurrences.push({
          start,
          end: start + safeK - 1,
          shift,
          charBefore,
          valid,
        });
        if (valid && case1WinnerShift === null) {
          case1WinnerShift = shift;
          case1WinnerStart = start;
        }
      }
    }

    // Rule 2: If Rule 1 found no valid match, check longest prefix of P[0..l-1]
    // that matches the ending (tail suffix) P[m-l..m-1] of `suff` (for 1 <= l < k)
    const prefixChecks: {
      len: number;
      prefixStr: string;
      tailSuffixStr: string;
      matches: boolean;
      shift: number;
    }[] = [];

    let case2WinnerLen = 0;
    for (let len = safeK - 1; len >= 1; len--) {
      const prefixStr = P.slice(0, len);
      const tailSuffixStr = P.slice(m - len);
      const matches = prefixStr === tailSuffixStr;
      prefixChecks.push({
        len,
        prefixStr,
        tailSuffixStr,
        matches,
        shift: m - len,
      });
      if (matches && case2WinnerLen === 0) {
        case2WinnerLen = len;
      }
    }

    const finalD2 =
      case1WinnerShift !== null
        ? case1WinnerShift
        : case2WinnerLen > 0
        ? m - case2WinnerLen
        : m;

    return (
      <div className="mt-4 rounded-xl border border-emerald-500/40 bg-slate-950/95 p-4 space-y-4">
        {/* Top Bar: k Selector & Prev/Next Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-300">
                k = {safeK} of {m - 1}
              </span>
              <h5 className="text-sm font-bold text-white">
                Finding Good-Suffix Shift <span className="font-mono text-emerald-300">d₂({safeK}) = {finalD2}</span> for Matched Suffix <span className="font-mono text-emerald-300">&quot;{suff}&quot;</span>
              </h5>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Choose how many characters matched from the right (<code>k</code>) to see how <code>d₂(k)</code> is found in 2 simple steps.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 rounded border border-emerald-500/40 bg-emerald-950/70 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
              ⌨️ ← → Active Here
            </span>
            <button
              type="button"
              disabled={safeK <= 1}
              onClick={() => {
                setGoodSuffixK((k) => Math.max(1, k - 1));
              }}
              className="rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 px-3 py-1 text-xs font-semibold text-slate-200 transition cursor-pointer"
            >
              ← Prev k
            </button>
            <button
              type="button"
              disabled={safeK >= m - 1}
              onClick={() => {
                setGoodSuffixK((k) => Math.min(m - 1, k + 1));
              }}
              className="rounded-lg border border-emerald-500/50 bg-emerald-600/20 hover:bg-emerald-600/30 disabled:opacity-40 px-3 py-1 text-xs font-semibold text-emerald-200 transition cursor-pointer"
            >
              Next k →
            </button>
          </div>
        </div>

        {/* k Selection Buttons */}
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: m - 1 }, (_, idx) => {
            const kVal = idx + 1;
            const kSuff = P.slice(m - kVal);
            const isSelected = safeK === kVal;
            return (
              <button
                key={kVal}
                type="button"
                onClick={() => {
                  setGoodSuffixK(kVal);
                }}
                className={`rounded-md px-3 py-1.5 font-mono text-xs transition cursor-pointer border ${
                  isSelected
                    ? 'border-emerald-400 bg-emerald-500/25 text-white font-bold shadow-sm'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                k = {kVal} (&quot;{kSuff}&quot;)
              </button>
            );
          })}
        </div>

        {/* Visual Box 1: Pattern Situation for k */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3.5">
          <div className="text-xs font-semibold text-slate-300 mb-2.5">
            What <code className="text-emerald-300">k = {safeK}</code> means on Pattern <code className="text-white">&quot;{P}&quot;</code>:
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="inline-flex items-center gap-1 font-mono">
              {P.split('').map((ch, idx) => {
                const isMatchedSuffix = idx >= suffixStartIdx;
                const isMismatchedChar = idx === precedingIdx;
                return (
                  <div key={idx} className="flex flex-col items-center">
                    <span className="text-[10px] text-slate-500 mb-0.5">{idx}</span>
                    <div
                      className={`w-10 h-10 flex items-center justify-center rounded-lg border text-sm font-bold ${
                        isMatchedSuffix
                          ? 'border-emerald-400 bg-emerald-500/25 text-emerald-100'
                          : isMismatchedChar
                          ? 'border-rose-400 bg-rose-500/25 text-rose-100'
                          : 'border-slate-700 bg-slate-950 text-slate-300'
                      }`}
                    >
                      {ch}
                    </div>
                    <span className="text-[10px] mt-1 font-semibold">
                      {isMatchedSuffix ? (
                        <span className="text-emerald-400">✓ Match</span>
                      ) : isMismatchedChar ? (
                        <span className="text-rose-400">✗ Fail</span>
                      ) : (
                        <span className="text-transparent">.</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex-1 min-w-[220px] space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-emerald-200">
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-400" />
                <span>
                  Last <strong>{safeK}</strong> letter{safeK > 1 ? 's' : ''} matched:{' '}
                  <code className="font-bold text-white bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    &quot;{suff}&quot;
                  </code>
                </span>
              </div>
              <div className="flex items-center gap-2 text-rose-200">
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-rose-400" />
                <span>
                  Letter right before <code className="text-white">&quot;{suff}&quot;</code> is{' '}
                  <code className="font-bold text-white bg-rose-500/20 px-1.5 py-0.5 rounded border border-rose-500/30">
                    &apos;{precedingChar}&apos;
                  </code>{' '}
                  (it mismatched, so if we find another <code className="text-white">&quot;{suff}&quot;</code>, it must <strong>NOT</strong> have <code className="text-white">&apos;{precedingChar}&apos;</code> before it).
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Simple 2-Step Check */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Step 1: Full Suffix Match Inside Pattern */}
          <div
            className={`rounded-xl border p-3.5 space-y-2.5 ${
              case1WinnerShift !== null
                ? 'border-emerald-500/60 bg-emerald-500/10'
                : 'border-slate-800 bg-slate-900/60'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-white">
                Step 1: Is <span className="font-mono text-emerald-300">&quot;{suff}&quot;</span> found earlier in <span className="font-mono">&quot;{P}&quot;</span>?
              </span>
              <span
                className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-bold ${
                  case1WinnerShift !== null
                    ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {case1WinnerShift !== null ? `✓ Yes! d₂(${safeK}) = ${case1WinnerShift}` : '✗ No → Go to Step 2'}
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Search left of <code className="text-emerald-300">&quot;{suff}&quot;</code> for another copy of <code className="text-emerald-300">&quot;{suff}&quot;</code> whose preceding letter is <strong>not</strong> <code className="text-rose-300">&apos;{precedingChar}&apos;</code>:
            </p>

            {interiorOccurrences.length === 0 ? (
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-400">
                <code className="text-slate-200">&quot;{suff}&quot;</code> does not appear anywhere else inside <code className="text-slate-200">&quot;{P}&quot;</code>.
              </div>
            ) : (
              <div className="space-y-1.5 font-mono text-xs">
                {interiorOccurrences.map((occ, idx) => (
                  <div
                    key={idx}
                    className={`rounded-lg border p-2.5 ${
                      occ.valid
                        ? 'border-emerald-500/40 bg-emerald-950/50 text-emerald-200'
                        : 'border-rose-500/40 bg-rose-950/40 text-rose-200'
                    }`}
                  >
                    <div className="font-sans">
                      Found <code>&quot;{suff}&quot;</code> at index <code>{occ.start}</code> (letter before it is{' '}
                      <code>{occ.charBefore !== null ? `'${occ.charBefore}'` : 'None (Start of Pattern)'}</code>):
                    </div>
                    <div className="mt-1 font-bold">
                      {occ.valid ? (
                        <span className="text-emerald-300">
                          ✓ Valid ({occ.charBefore !== null ? `'${occ.charBefore}'` : 'Start'} ≠ &apos;{precedingChar}&apos;) → Shift = {suffixStartIdx} − {occ.start} = {occ.shift}
                        </span>
                      ) : (
                        <span className="text-rose-300">
                          ✗ Skip (also preceded by &apos;{precedingChar}&apos;, which would fail again)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Partial Overlap at the Beginning of Pattern */}
          <div
            className={`rounded-xl border p-3.5 space-y-2.5 ${
              case1WinnerShift === null
                ? 'border-indigo-500/60 bg-indigo-500/10'
                : 'border-slate-800 bg-slate-900/40 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-white">
                Step 2: Does the START of <span className="font-mono">&quot;{P}&quot;</span> match the END of <span className="font-mono text-emerald-300">&quot;{suff}&quot;</span>?
              </span>
              <span
                className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-bold ${
                  case1WinnerShift !== null
                    ? 'bg-slate-800 text-slate-400'
                    : case2WinnerLen > 0
                    ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-500/40'
                    : 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
                }`}
              >
                {case1WinnerShift !== null
                  ? 'Skipped (Step 1 Worked)'
                  : case2WinnerLen > 0
                  ? `✓ Overlap = ${case2WinnerLen} → d₂(${safeK}) = ${m - case2WinnerLen}`
                  : `✗ None → d₂(${safeK}) = ${m}`}
              </span>
            </div>

            {case1WinnerShift !== null ? (
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-400">
                We only use Step 2 when Step 1 finds no valid match. Since Step 1 already gave <code className="text-emerald-300">d₂({safeK}) = {case1WinnerShift}</code>, we are done!
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-300">
                  Since <code className="text-emerald-300">&quot;{suff}&quot;</code> wasn&apos;t found in Step 1, check if a shorter ending of <code className="text-emerald-300">&quot;{suff}&quot;</code> matches the <strong>start (prefix)</strong> of <code className="text-white">&quot;{P}&quot;</code>:
                </p>

                {prefixChecks.length === 0 ? (
                  <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-300">
                    For <code>k = 1</code>, there is no shorter piece smaller than 1 letter, so we shift the whole pattern: <strong className="text-amber-300">d₂(1) = m = {m}</strong>.
                  </div>
                ) : (
                  <div className="space-y-1.5 font-mono text-xs">
                    {prefixChecks.map((chk) => (
                      <div
                        key={chk.len}
                        className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border p-2 ${
                          chk.matches
                            ? 'border-emerald-500/50 bg-emerald-950/50 text-emerald-200'
                            : 'border-slate-800 bg-slate-950 text-slate-400'
                        }`}
                      >
                        <div>
                          Start <code className="text-indigo-300">&quot;{chk.prefixStr}&quot;</code> vs End <code className="text-emerald-300">&quot;{chk.tailSuffixStr}&quot;</code>
                        </div>
                        <div className="font-bold">
                          {chk.matches ? (
                            <span className="text-emerald-300">
                              ✓ Match ({chk.len} letter{chk.len > 1 ? 's' : ''}) → {m} − {chk.len} = {chk.shift}
                            </span>
                          ) : (
                            <span>✗ Different</span>
                          )}
                        </div>
                      </div>
                    ))}
                    {case2WinnerLen === 0 && (
                      <div className="rounded-lg border border-amber-500/40 bg-amber-950/30 p-2 text-amber-200 font-sans">
                        No overlap at the start of <code>&quot;{P}&quot;</code> → Shift full pattern length: <strong>d₂({safeK}) = m = {m}</strong>.
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Clean Visual Alignment Showing Why Shift = finalD2 */}
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-3.5 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-bold text-emerald-200">
              Visual Result: Sliding <code className="text-white">&quot;{P}&quot;</code> Right by <code className="text-emerald-300">+{finalD2}</code> Step{finalD2 > 1 ? 's' : ''}
            </div>
            <div className="font-mono text-xs font-bold text-white bg-emerald-600/30 border border-emerald-500/50 px-2.5 py-0.5 rounded-md">
              d₂({safeK}) = {finalD2}
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="inline-flex flex-col gap-1.5 font-mono text-xs min-w-max">
              {/* Row 1: Before Shift */}
              <div className="flex items-center gap-1">
                <span className="w-36 text-slate-400 font-sans text-xs">Before Shift:</span>
                {Array.from({ length: m + finalD2 }, (_, col) => {
                  if (col >= m) {
                    return <div key={col} className="w-8 h-8 rounded border border-transparent" />;
                  }
                  const isMatchedSuffix = col >= suffixStartIdx;
                  const isMismatchedChar = col === precedingIdx;
                  return (
                    <div
                      key={col}
                      className={`w-8 h-8 flex items-center justify-center rounded border font-bold ${
                        isMatchedSuffix
                          ? 'border-emerald-400 bg-emerald-500/25 text-emerald-100'
                          : isMismatchedChar
                          ? 'border-rose-400/60 bg-rose-500/20 text-rose-200'
                          : 'border-slate-700 bg-slate-900 text-slate-300'
                      }`}
                    >
                      {P[col]}
                    </div>
                  );
                })}
              </div>

              {/* Row 2: After Shift by +finalD2 */}
              <div className="flex items-center gap-1">
                <span className="w-36 text-emerald-300 font-sans text-xs font-semibold">
                  Shifted +{finalD2} Right:
                </span>
                {Array.from({ length: m + finalD2 }, (_, col) => {
                  const patIdx = col - finalD2;
                  if (patIdx < 0 || patIdx >= m) {
                    return (
                      <div
                        key={col}
                        className="w-8 h-8 flex items-center justify-center rounded border border-dashed border-slate-800 text-[10px] text-slate-600"
                      >
                        →
                      </div>
                    );
                  }
                  const alignsWithSuffix = col >= suffixStartIdx && col < m;
                  return (
                    <div
                      key={col}
                      className={`w-8 h-8 flex items-center justify-center rounded border font-bold ${
                        alignsWithSuffix
                          ? 'border-emerald-400 bg-emerald-500/35 text-white ring-1 ring-emerald-400'
                          : 'border-indigo-500/40 bg-indigo-950/60 text-indigo-200'
                      }`}
                    >
                      {P[patIdx]}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-300">
            {case1WinnerShift !== null && case1WinnerStart !== null ? (
              <>
                Sliding right by <strong>+{finalD2}</strong> moves the earlier <code className="text-emerald-300">&quot;{suff}&quot;</code> (at index {case1WinnerStart}) directly under the matched <code className="text-emerald-300">&quot;{suff}&quot;</code>!
              </>
            ) : case2WinnerLen > 0 ? (
              <>
                Sliding right by <strong>+{finalD2}</strong> lines up the start <code className="text-emerald-300">&quot;{P.slice(0, case2WinnerLen)}&quot;</code> of the shifted pattern with the end <code className="text-emerald-300">&quot;{P.slice(m - case2WinnerLen)}&quot;</code> of the matched suffix!
              </>
            ) : (
              <>
                No internal match and no prefix overlap exist, so the pattern slides completely past all <strong>{m}</strong> positions (<strong>+{m}</strong>).
              </>
            )}
          </p>
        </div>
      </div>
    );
  };

  const renderVisualTable = (tbl: VisualTable) => {
    const isBadSymbolTable = tbl.id === 'bm-bad-symbol' || tbl.id === 'horspool-shift-table';
    const isGoodSuffixTable = tbl.id === 'bm-good-suffix';
    const patternForSubTrace =
      currentStep.stringView?.pattern ||
      (tbl.title.match(/"([^"]+)"/)?.[1] ?? '');

    return (
    <div
      key={tbl.id}
      className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-sm"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold text-slate-100">{tbl.title}</h4>
          {tbl.subtitle && <p className="text-xs text-slate-400">{tbl.subtitle}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isBadSymbolTable && patternForSubTrace && (
            <button
              type="button"
              onClick={() =>
                setShowBadSymbolTrace((prev) => {
                  const next = !prev;
                  if (next) {
                    setShowGoodSuffixTrace(false);
                    setIsPlaying(false);
                  }
                  return next;
                })
              }
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                showBadSymbolTrace
                  ? 'border-indigo-400 bg-indigo-600 text-white shadow-sm'
                  : 'border-indigo-500/40 bg-indigo-500/15 text-indigo-200 hover:bg-indigo-500/25'
              }`}
            >
              {showBadSymbolTrace
                ? '✕ Hide Bad-Symbol Step-by-Step Trace'
                : '🔍 Trace How Bad-Symbol Table is Built'}
            </button>
          )}
          {isGoodSuffixTable && patternForSubTrace && (
            <button
              type="button"
              onClick={() =>
                setShowGoodSuffixTrace((prev) => {
                  const next = !prev;
                  if (next) {
                    setShowBadSymbolTrace(false);
                    setIsPlaying(false);
                  }
                  return next;
                })
              }
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                showGoodSuffixTrace
                  ? 'border-emerald-400 bg-emerald-600 text-white shadow-sm'
                  : 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25'
              }`}
            >
              {showGoodSuffixTrace
                ? '✕ Hide Good-Suffix Step-by-Step Trace'
                : '🔍 Trace How Good-Suffix d₂(k) is Found'}
            </button>
          )}
          {tbl.indexBase && (
            <span className="rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 font-mono text-xs font-medium text-indigo-300">
              {tbl.indexBase}
            </span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse font-mono text-xs">
          {tbl.colHeaders && (
            <thead>
              <tr>
                {tbl.rowHeaders && (
                  <th className="border border-slate-800 bg-slate-950 px-3 py-2 text-left text-slate-400">
                    Index / Row
                  </th>
                )}
                {tbl.colHeaders.map((ch, cIdx) => (
                  <th
                    key={cIdx}
                    className="border border-slate-800 bg-slate-950 px-3 py-2 text-center font-semibold text-slate-300"
                  >
                    {ch}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {tbl.rows.map((row, rIdx) => (
              <tr key={rIdx}>
                {tbl.rowHeaders && tbl.rowHeaders[rIdx] !== undefined && (
                  <td className="whitespace-nowrap border border-slate-800 bg-slate-950/80 px-3 py-2 font-semibold text-slate-300">
                    {tbl.rowHeaders[rIdx]}
                  </td>
                )}
                {row.map((cell, cIdx) => {
                  const isEditable = practiceMode && cell.editableKey !== undefined;
                  if (isEditable) {
                    const key = cell.editableKey!;
                    const userVal = userAnswers[key] ?? '';
                    const expectedStr = String(cell.expectedValue ?? '').trim().toLowerCase();
                    const isCorrect =
                      checkedPractice &&
                      userVal.trim().toLowerCase() === expectedStr &&
                      userVal.trim() !== '';
                    const isWrong =
                      checkedPractice &&
                      userVal.trim().toLowerCase() !== expectedStr;

                    return (
                      <td
                        key={cIdx}
                        className={`relative border p-1.5 text-center ${
                          isCorrect
                            ? 'border-emerald-500 bg-emerald-500/15'
                            : isWrong
                              ? 'border-rose-500 bg-rose-500/15'
                              : 'border-indigo-500/40 bg-slate-950'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="text"
                            value={userVal}
                            placeholder="?"
                            onChange={(e) => {
                              setUserAnswers((prev) => ({
                                ...prev,
                                [key]: e.target.value,
                              }));
                            }}
                            className={`w-16 rounded border px-1.5 py-1 text-center font-mono text-xs font-bold outline-none transition ${
                              isCorrect
                                ? 'border-emerald-400 bg-emerald-950/70 text-emerald-200'
                                : isWrong
                                  ? 'border-rose-400 bg-rose-950/70 text-rose-200'
                                  : 'border-slate-700 bg-slate-900 text-slate-100 focus:border-indigo-400'
                            }`}
                          />
                          {isWrong && cell.mistakeExplanation && (
                            <button
                              type="button"
                              onClick={() =>
                                setActiveMistakeTooltip(
                                  activeMistakeTooltip === key ? null : key
                                )
                              }
                              title="Explain Mistake"
                              className="rounded p-0.5 text-rose-400 hover:bg-rose-500/20 hover:text-rose-200"
                            >
                              <HelpCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        {activeMistakeTooltip === key && cell.mistakeExplanation && (
                          <div className="mt-1.5 rounded border border-rose-500/50 bg-slate-950 p-2 text-left font-sans text-[11px] leading-relaxed text-rose-200 shadow-xl">
                            <div className="font-semibold text-rose-300">
                              Expected: {cell.expectedValue}
                            </div>
                            {cell.mistakeExplanation}
                          </div>
                        )}
                      </td>
                    );
                  }

                  return (
                    <td
                      key={cIdx}
                      title={cell.tooltip}
                      className={`border px-3 py-2 text-center transition-colors ${getCellColorClasses(
                        cell.state
                      )}`}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-sm">{cell.value}</span>
                        {cell.subText && (
                          <span className="mt-0.5 text-[11px] font-semibold text-indigo-300">
                            {cell.subText}
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Optional Expandable Step-by-Step Sub-Trace for Bad-Symbol Table */}
      {isBadSymbolTable && showBadSymbolTrace && patternForSubTrace && (
        renderBadSymbolSubTrace(patternForSubTrace, tbl.colHeaders ?? [])
      )}

      {/* Optional Expandable Step-by-Step Sub-Trace for Good-Suffix Table */}
      {isGoodSuffixTable && showGoodSuffixTrace && patternForSubTrace && (
        renderGoodSuffixSubTrace(patternForSubTrace)
      )}
    </div>
    );
  };

  const renderStateSpaceTreeVisualizer = (view: StateSpaceTreeView) => {
    const { nodes, problemType, bestSolutionLabel, operationNote } = view;
    if (!nodes || nodes.length === 0) return null;

    const NODE_W = 148;
    const NODE_H = 88;
    const H_GAP = 22;
    const LEVEL_GAP = 128;
    const TOP_PAD = 36;
    const SIDE_PAD = 32;

    interface TreeLayoutNode {
      data: StateSpaceTreeNodeView;
      children: TreeLayoutNode[];
      subtreeW: number;
      centerX: number;
      topY: number;
    }

    const childrenByParent = new Map<string, StateSpaceTreeNodeView[]>();
    const roots: StateSpaceTreeNodeView[] = [];
    const nodeIds = new Set(nodes.map((n) => n.id));

    nodes.forEach((n) => {
      if (!n.parentId || !nodeIds.has(n.parentId)) {
        roots.push(n);
      } else {
        const list = childrenByParent.get(n.parentId) || [];
        list.push(n);
        childrenByParent.set(n.parentId, list);
      }
    });

    let maxTreeDepth = 0;

    const buildSubtree = (node: StateSpaceTreeNodeView, depth: number): TreeLayoutNode => {
      if (depth > maxTreeDepth) maxTreeDepth = depth;
      const rawChildren = childrenByParent.get(node.id) || [];
      const childLayouts = rawChildren.map((ch) => buildSubtree(ch, depth + 1));
      const childrenSpan =
        childLayouts.length > 0
          ? childLayouts.reduce((s, c) => s + c.subtreeW, 0) +
            (childLayouts.length - 1) * H_GAP
          : 0;
      const subtreeW = Math.max(NODE_W, childrenSpan);
      return {
        data: node,
        children: childLayouts,
        subtreeW,
        centerX: 0,
        topY: TOP_PAD + depth * LEVEL_GAP,
      };
    };

    const rootLayouts = roots.map((r) => buildSubtree(r, 0));
    const positionedNodes: TreeLayoutNode[] = [];
    const edges: {
      id: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      label?: string;
      status: StateSpaceTreeNodeView['status'];
    }[] = [];

    const assignCoords = (ln: TreeLayoutNode, leftX: number) => {
      ln.centerX = leftX + ln.subtreeW / 2;
      positionedNodes.push(ln);
      if (ln.children.length > 0) {
        const totalSpan =
          ln.children.reduce((s, c) => s + c.subtreeW, 0) +
          (ln.children.length - 1) * H_GAP;
        let curX = ln.centerX - totalSpan / 2;
        ln.children.forEach((ch) => {
          assignCoords(ch, curX);
          edges.push({
            id: `${ln.data.id}->${ch.data.id}`,
            x1: ln.centerX,
            y1: ln.topY + NODE_H,
            x2: ch.centerX,
            y2: ch.topY,
            label: ch.data.edgeLabel,
            status: ch.data.status,
          });
          curX += ch.subtreeW + H_GAP;
        });
      }
    };

    let currentRootLeft = SIDE_PAD;
    rootLayouts.forEach((rl) => {
      assignCoords(rl, currentRootLeft);
      currentRootLeft += rl.subtreeW + H_GAP * 2;
    });

    const canvasW = Math.max(580, currentRootLeft + SIDE_PAD);
    const canvasH = TOP_PAD + (maxTreeDepth + 1) * NODE_H + maxTreeDepth * (LEVEL_GAP - NODE_H) + 52;

    const problemBadge =
      view.title ||
      (problemType === 'knapsack-bb'
        ? 'Branch & Bound: 0-1 Knapsack State-Space Tree'
        : problemType === 'assignment-bb'
          ? 'Branch & Bound: Assignment Problem State-Space Tree'
          : problemType === 'subset-sum'
            ? 'Backtracking: Subset-Sum State-Space Tree'
            : problemType === 'n-queens'
              ? 'Backtracking: n-Queens State-Space Tree'
              : 'State-Space Tree Visualizer');

    const subCaption = operationNote || view.subtitle || view.pruningRuleNote;

    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/95 p-5 shadow-md">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded border border-indigo-500/40 bg-indigo-500/15 px-2.5 py-0.5 font-mono text-xs font-bold text-indigo-300">
                {problemBadge}
              </span>
            </div>
            {subCaption && (
              <p className="mt-1.5 text-xs text-slate-300">{subCaption}</p>
            )}
          </div>
          {bestSolutionLabel && (
            <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 font-mono text-xs font-bold text-emerald-200">
              {bestSolutionLabel}
            </div>
          )}
        </div>

        <div className="w-full overflow-x-auto pb-2">
          <div
            className="relative mx-auto select-none"
            style={{ width: `${canvasW}px`, height: `${canvasH}px` }}
          >
            <svg
              width={canvasW}
              height={canvasH}
              className="pointer-events-none absolute inset-0 z-0"
            >
              {edges.map((e) => {
                const stroke =
                  e.status === 'solution'
                    ? '#10b981'
                    : e.status === 'active'
                      ? '#f59e0b'
                      : e.status === 'pruned'
                        ? '#f43f5e'
                        : '#64748b';
                const midX = (e.x1 + e.x2) / 2;
                const midY = (e.y1 + e.y2) / 2;
                return (
                  <g key={e.id}>
                    <line
                      x1={e.x1}
                      y1={e.y1}
                      x2={e.x2}
                      y2={e.y2}
                      stroke={stroke}
                      strokeWidth={e.status === 'solution' || e.status === 'active' ? 2.4 : 1.6}
                      strokeDasharray={e.status === 'pruned' ? '4 3' : undefined}
                    />
                    {e.label && (
                      <g transform={`translate(${midX}, ${midY})`}>
                        <rect
                          x={-36}
                          y={-10}
                          width={72}
                          height={18}
                          rx={4}
                          fill="#0f172a"
                          stroke={stroke}
                          strokeWidth={1}
                        />
                        <text
                          x={0}
                          y={3}
                          textAnchor="middle"
                          className="fill-slate-200 font-mono text-[10px] font-semibold"
                        >
                          {e.label}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {positionedNodes.map((ln) => {
              const { data, centerX, topY } = ln;
              const left = centerX - NODE_W / 2;

              let cardClasses = 'border-slate-700 bg-slate-900/95 text-slate-200';
              let badgeText = '';
              let badgeClasses = '';

              if (data.status === 'active') {
                cardClasses =
                  'border-amber-400 bg-amber-950/60 text-amber-100 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/20';
                badgeText = 'ACTIVE';
                badgeClasses = 'bg-amber-500 text-slate-950 font-extrabold';
              } else if (data.status === 'solution') {
                cardClasses =
                  'border-emerald-400 bg-emerald-950/70 text-emerald-100 ring-2 ring-emerald-400/60 shadow-lg shadow-emerald-500/20';
                badgeText = '✓ SOLUTION';
                badgeClasses = 'bg-emerald-500 text-slate-950 font-extrabold';
              } else if (data.status === 'pruned') {
                cardClasses =
                  'border-rose-500/80 bg-rose-950/50 text-rose-200 ring-1 ring-rose-500/40';
                badgeText = '× PRUNED';
                badgeClasses = 'bg-rose-600 text-white font-bold';
              } else if (data.status === 'promising') {
                cardClasses =
                  'border-indigo-400/70 bg-indigo-950/40 text-indigo-100';
                badgeText = 'PROMISING';
                badgeClasses = 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/40';
              }

              return (
                <div
                  key={data.id}
                  style={{
                    left: `${left}px`,
                    top: `${topY}px`,
                    width: `${NODE_W}px`,
                    minHeight: `${NODE_H}px`,
                  }}
                  className={`absolute z-10 flex flex-col justify-between rounded-lg border-2 p-2 font-mono text-xs transition-all ${cardClasses}`}
                >
                  <div className="flex items-center justify-between gap-1 border-b border-slate-700/70 pb-1">
                    <span className="truncate font-bold text-[11px]">
                      {data.title || data.mainLabel}
                    </span>
                    {badgeText && (
                      <span className={`rounded px-1.5 py-0.5 text-[9px] ${badgeClasses}`}>
                        {badgeText}
                      </span>
                    )}
                  </div>

                  {(data.subtitle || data.subLabel) && (
                    <div className="mt-1 text-[11px] text-slate-300 font-semibold">
                      {data.subtitle || data.subLabel}
                    </div>
                  )}

                  {data.detail && (
                    <div className="mt-0.5 truncate text-[10px] text-slate-400" title={data.detail}>
                      {data.detail}
                    </div>
                  )}

                  {data.boundLabel && (
                    <div className="mt-1 rounded bg-cyan-500/15 border border-cyan-500/30 px-1.5 py-0.5 text-center text-[10px] font-bold text-cyan-300">
                      {data.boundLabel}
                    </div>
                  )}

                  {data.pruneReason && (
                    <div
                      className="mt-1 rounded bg-rose-500/20 border border-rose-500/40 px-1.5 py-0.5 text-center text-[9.5px] font-semibold text-rose-200"
                      title={data.pruneReason}
                    >
                      {data.pruneReason}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-4 border-t border-slate-800 pt-3 font-mono text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-amber-300">
            <span className="h-3 w-3 rounded-xs border border-amber-400 bg-amber-500/40" />
            Active Node (Currently Expanding)
          </span>
          <span className="flex items-center gap-1.5 text-indigo-300">
            <span className="h-3 w-3 rounded-xs border border-indigo-400 bg-indigo-500/30" />
            Promising Node (Expanded / Feasible)
          </span>
          <span className="flex items-center gap-1.5 text-emerald-300">
            <span className="h-3 w-3 rounded-xs border border-emerald-400 bg-emerald-500/40" />
            ✓ Optimal / Valid Solution Found
          </span>
          <span className="flex items-center gap-1.5 text-rose-300">
            <span className="h-3 w-3 rounded-xs border border-rose-500 bg-rose-500/40" />
            × Pruned / Non-Promising Leaf (Backtracked)
          </span>
        </div>
      </div>
    );
  };

  const activeExample = algorithm.examples.find((ex) => ex.id === selectedExampleId);

  // Build Official Exam Paper Question & Live Step-by-Step Answer Sheet for BOTH Past Exams & Random Exam Questions
  const isRandomExam = selectedExampleId === 'random-exam';
  const isPastExam = Boolean(
    !showCustomSandbox &&
      activeExample &&
      (activeExample.badge === 'Past Exam' || activeExample.examSimulation)
  );
  const showExamPaperWorksheet = !showCustomSandbox && (isPastExam || isRandomExam);

  // Build Given Input Data rows as printed on the exam paper
  const givenInputSource = isRandomExam
    ? customInputs
    : activeExample?.customInputDefaults || customInputs;

  const isGraphAlgorithm = [
    'prim',
    'kruskal',
    'dijkstra',
    'warshall',
    'floyd',
    'max-flow',
    'bipartite-matching',
  ].includes(algorithm.id);

  const givenExamParameters = algorithm.customFields
    .map((field) => {
      const cleanLabel = field.label.replace(/\s*\([^)]*\)/g, '').trim();
      return {
        key: field.key,
        label: cleanLabel,
        value: (givenInputSource[field.key] ?? customInputs[field.key] ?? '').trim(),
      };
    })
    .filter((item) => {
      if (!item.value) return false;
      if (
        isGraphAlgorithm &&
        (item.key === 'edges' ||
          item.key === 'isDirected' ||
          item.key === 'directed' ||
          item.label.toLowerCase().includes('edge') ||
          item.label.toLowerCase().includes('directed'))
      ) {
        return false;
      }
      return true;
    });

  // Build clean, spoiler-free exam requirements (a), (b), (c) based on algorithm type
  const getAlgorithmExamRequirements = (): string[] => {
    switch (algorithm.id) {
      case 'comparison-counting-sort':
        return [
          '(a) Initialize the Count[0..n-1] array to all zeros.',
          '(b) Compare each pair (A[i], A[j]) for i < j and increment the Count of the larger element at each step.',
          '(c) Place each element A[i] into its final sorted position S[Count[i]] in the output array S.',
        ];
      case 'distribution-counting-sort-v1':
      case 'distribution-counting-sort':
        return [
          '(a) Compute the Frequency array F / C by counting occurrences of each distinct key value.',
          '(b) Compute the Cumulative Distribution array D[j] = D[j-1] + F[j] (running prefix sums).',
          '(c) Scan the input array from right to left (i = n-1 down to 0) and place each element into its sorted slot in S.',
        ];
      case 'brute-force-sm':
        return [
          '(a) Align pattern P[0..m-1] beneath text T[0..n-1] starting at shift index i = 0.',
          '(b) Compare characters left-to-right (j = 0..m-1) at each alignment and shift by +1 upon mismatch.',
          '(c) State every alignment trial, total character comparisons, and the index where P matches T.',
        ];
      case 'horspool':
        return [
          '(a) Construct the Bad-Symbol Shift Table t₁(c) for pattern P (initializing all entries to m, then setting t₁(P[j]) = m − 1 − j for j = 0..m−2).',
          '(b) Align pattern P against text T and compare characters from right to left (starting at P[m−1]).',
          '(c) On each mismatch, shift P right by t₁(T[i]) (the text character aligned with P[m−1]) until P is found.',
        ];
      case 'boyer-moore':
        return [
          '(a) Construct both the Bad-Symbol Shift Table t₁(c) and the Good-Suffix Shift Table d₂(k) (for k = 1..m−1).',
          '(b) Trace each right-to-left comparison trial between pattern P and text T, recording the number of matched suffix characters k.',
          '(c) Compute d₁ = max(t₁(c) − k, 1) and shift by d = max(d₁, d₂(k)) when k > 0 (or d = d₁ when k = 0) until match.',
        ];
      case 'hashing':
        return [
          '(a) Compute the initial hash address h(K) = K mod m (or string folding sum mod m) for each key K.',
          '(b) Resolve any collisions step-by-step using the specified collision resolution scheme (Separate Chaining, Linear Probing, Quadratic Probing, or Double Hashing).',
          '(c) Draw the final hash table state and count the number of probes for each inserted key.',
        ];
      case 'b-trees':
        return [
          '(a) State the B-Tree order m, minimum keys ⌈m/2⌉ − 1, and maximum keys m − 1 per node.',
          '(b) Insert each key into the appropriate leaf node in sorted order.',
          '(c) Whenever a node overflows (reaches m keys), split it around the median key and promote the median key to the parent node.',
        ];
      case 'assembly-line':
        return [
          '(a) Initialize base station times f₁[1] = e₁ + a₁,₁ and f₂[1] = e₂ + a₂,₁.',
          '(b) Fill DP tables f₁[j], f₂[j] and line decision pointers l₁[j], l₂[j] for stations j = 2..n.',
          '(c) Compute optimal total time f* = min(f₁[n] + x₁, f₂[n] + x₂) and backtrack l* to list the optimal station sequence.',
        ];
      case 'matrix-chain':
        return [
          '(a) Initialize main diagonal m[i, i] = 0 for all i = 1..n.',
          '(b) Compute minimum scalar multiplications m[i, j] and split points s[i, j] diagonal-by-diagonal for chain lengths L = 2..n.',
          '(c) State the minimum cost m[1, n] and use split table s[i, j] to write the optimal parenthesization.',
        ];
      case 'lcs':
        return [
          '(a) Initialize row 0 and column 0 of DP table c[0..m, 0..n] to 0.',
          '(b) Fill c[i, j] and directional arrows b[i, j] (↖ match, ↑ top, ← left) row-by-row.',
          '(c) Trace the ↖ arrows backward from c[m, n] to reconstruct the Longest Common Subsequence.',
        ];
      case 'coin-row':
        return [
          '(a) Initialize base cases F[0] = 0 and F[1] = c₁.',
          '(b) Apply recurrence F[i] = max(cᵢ + F[i − 2], F[i − 1]) for i = 2..n to fill table F[0..n].',
          '(c) Backtrack from F[n] to identify which non-adjacent coins are selected and state the maximum total value.',
        ];
      case 'change-making':
        return [
          '(a) Initialize base case F[0] = 0 for amount 0.',
          '(b) For each amount i = 1..n, evaluate F[i] = min_{j: dⱼ ≤ i} { F[i − dⱼ] } + 1 and record the chosen coin.',
          '(c) State the minimum number of coins F[n] and list the exact coin denominations used.',
        ];
      case 'coin-collecting':
        return [
          '(a) Initialize first row F[1, j] and first column F[i, 1] using cumulative coin sums.',
          '(b) Fill the DP table using F[i, j] = max(F[i − 1, j], F[i, j − 1]) + C[i, j] for all remaining cells.',
          '(c) State the maximum coins collected F[n, m] and trace the optimal robot path from (1, 1) to (n, m).',
        ];
      case 'knapsack-01':
        return [
          '(a) Initialize base row F[0, j] = 0 and base column F[i, 0] = 0.',
          '(b) Fill DP table F[i, j] using F[i−1, j] if j < wᵢ, else max(F[i−1, j], vᵢ + F[i−1, j − wᵢ]).',
          '(c) State the maximum knapsack value F[n, W] and backtrack to list the optimal subset of items.',
        ];
      case 'obst':
        return [
          '(a) Initialize base diagonals C[i, i−1] = 0, C[i, i] = pᵢ, and R[i, i] = i.',
          '(b) Compute Cost Table C[i, j] and Root Table R[i, j] diagonal-by-diagonal for d = 1..n−1.',
          '(c) Use Root Table R[i, j] starting at R[1, n] to draw the Optimal Binary Search Tree and state minimum cost C[1, n].',
        ];
      case 'warshall':
        return [
          '(a) Write the initial adjacency matrix R^(0) of the directed graph.',
          '(b) Compute intermediate matrices R^(1), R^(2), ..., R^(n) using R^(k)[i, j] = R^(k−1)[i, j] ∨ (R^(k−1)[i, k] ∧ R^(k−1)[k, j]).',
          '(c) Highlight newly discovered transitive paths (0 → 1) at each pivot step k.',
        ];
      case 'floyd':
        return [
          '(a) Write the initial weight matrix D^(0) (with 0 on the diagonal and ∞ where no direct edge exists).',
          '(b) Compute distance matrices D^(1), D^(2), ..., D^(n) using D^(k)[i, j] = min(D^(k−1)[i, j], D^(k−1)[i, k] + D^(k−1)[k, j]).',
          '(c) Identify every distance cell shortened at each pivot vertex k = 1..n.',
        ];
      case 'greedy-change-making':
        return [
          '(a) Sort the coin denominations in decreasing order d₁ > d₂ > ... > dₖ.',
          '(b) Greedily select the largest feasible coin dᵢ such that Change + dᵢ ≤ N at each step.',
          '(c) State the greedy coin set S and compare with the globally optimal Dynamic Programming solution.',
        ];
      case 'prim':
        return [
          '(a) Initialize Tree Vertices V_T = {v₀} and show initial fringe labels u(p_u, d_u) in Priority Queue Q.',
          '(b) In each of the |V| − 1 iterations, extract the minimum-weight fringe vertex u* from Q, add (p_{u*}, u*) to E_T, and update adjacent fringe labels.',
          '(c) List the selected MST edges in exact order and compute the Total Minimum Spanning Tree Weight.',
        ];
      case 'kruskal':
        return [
          '(a) Sort all edges of G in nondecreasing order of weight w(e₁) ≤ w(e₂) ≤ ... ≤ w(e_{|E|}).',
          '(b) Initialize |V| disjoint single-vertex sets and test each sorted edge (u, v) for acyclicity (Find(u) ≠ Find(v)).',
          '(c) Accept |V| − 1 acyclic edges (merging sets via Union) and state the Total MST Weight.',
        ];
      case 'dijkstra':
        return [
          '(a) Initialize source distance s(−, 0) and all other vertices v(−, ∞) in Priority Queue Q.',
          '(b) In each iteration, extract vertex u* with minimum distance d_{u*}, move u* to V_T, and relax all outgoing edges (if d_{u*} + w(u*, u) < d_u).',
          '(c) Write the final shortest path and total distance from source s to every other vertex.',
        ];
      case 'huffman':
        return [
          '(a) Initialize a priority queue Q of single-node trees ordered by symbol frequency/probability.',
          '(b) Repeatedly extract the two smallest-weight trees (T_L, T_R) and insert a new parent tree with weight = w(T_L) + w(T_R).',
          '(c) Label left branches 0 and right branches 1, list the prefix-free codeword for each symbol, and compute the average bits per symbol.',
        ];
      case 'simplex':
        return [
          '(a) Convert the linear program into Standard Form (introduce slack variables ≥ 0) and set up the Initial Simplex Tableau.',
          '(b) Perform the Optimality Test; if negative entries exist in the objective row, identify the Entering Variable (Pivot Column) and Departing Variable via minimum θ-ratio (Pivot Row).',
          '(c) Apply Gauss-Jordan row operations to form the next tableau until all objective row entries are ≥ 0, then state the optimal solution and maximum z.',
        ];
      case 'max-flow':
        return [
          '(a) Initialize flow x_{ij} = 0 on all edges, label source with (∞, −), and set FIFO Queue Q = {source}.',
          '(b) Perform BFS vertex labeling (l_j, i±) along forward edges (r_{ij} > 0) and backward edges (x_{ji} > 0) until sink is labeled.',
          '(c) Augment flow by bottleneck l_{sink} along the discovered path, reset labels, and repeat until Q empties to find Maximum Flow and Min-Cut.',
        ];
      case 'bipartite-matching':
        return [
          '(a) Place all free vertices of V₁ into Queue Q and start BFS labeling alternating between unmatched and matched edges.',
          '(b) When a free vertex w ∈ V₂ is labeled, trace back the augmenting path P and flip matched/unmatched status (M ← M ⊕ P).',
          '(c) Repeat until no augmenting path exists and list the final Maximum Cardinality Matching M.',
        ];
      case 'stable-marriage':
        return [
          '(a) Construct the n × n Ranking Matrix (r_man, r_woman) from the men’s and women’s preference lists; initialize all men and women as Free.',
          '(b) In each iteration, have a free man m propose to the next woman w on his preference list; w accepts if she is free or prefers m over her current partner.',
          '(c) Trace all proposals/rejections until no free man remains and state the final Stable Marriage matching set.',
        ];
      case 'backtracking':
        return [
          '(a) Formulate the state-space tree and state the feasibility / pruning inequalities.',
          '(b) Expand nodes in Depth-First Search (DFS) order, marking non-promising nodes as pruned (×) and backtracking immediately.',
          '(c) Highlight all valid solution leaves discovered in the state-space tree.',
        ];
      case 'branch-and-bound':
        return [
          '(a) Preprocess the input (e.g., sort items by decreasing vᵢ / wᵢ ratio) and compute the initial bound at Root Node 0.',
          '(b) In each Best-First Branch-and-Bound step, expand the live node with the best bound (highest ub for maximization or lowest lb for minimization).',
          '(c) Prune any node that exceeds capacity or whose bound is inferior to the best feasible solution found, and state the globally optimal solution.',
        ];
    }
  };

  // Build dynamic question prompt for Random Exam Questions (or fallback)
  const buildRandomExamQuestionPrompt = (): string => {
    const paramSummary = givenExamParameters.map((p) => `${p.label}: ${p.value}`).join('  |  ');
    return `Apply ${algorithm.title} step-by-step on the given exam instance below (${paramSummary || randomExamSummary || 'see Given Data below'}). Show all intermediate tables/structures at each step and clearly state the final answer on your exam sheet.`;
  };

  const examPaperTitle = isRandomExam
    ? `CPCS-324 Generated Exam Paper — ${algorithm.shortTitle}`
    : activeExample?.examSimulation?.examTitle ||
      activeExample?.examSimulation?.examPaper ||
      activeExample?.name ||
      `${algorithm.shortTitle} Exam Question`;

  const examPaperMarks = isRandomExam
    ? '10 Marks'
    : activeExample?.examSimulation?.marks || '8 Marks';

  const rawPrompt = isRandomExam
    ? buildRandomExamQuestionPrompt()
    : activeExample?.examSimulation?.questionText ||
      activeExample?.examSimulation?.questionStatement ||
      activeExample?.description ||
      buildRandomExamQuestionPrompt();

  // Strip any inline answer spoilers like "to reach Total MST Weight = 13" or "→ d = [...]" from prompt
  const cleanExamPrompt = rawPrompt
    .replace(/\s*→\s*[^.]+/g, '')
    .replace(/\s*to reach Total MST Weight\s*=\s*\d+/gi, '')
    .replace(/\s*to obtain Total MST Weight\s*=\s*\d+/gi, '')
    .replace(/\s*with edges:.*?(?=\.\s*Show|\.\s*Trace|\.\s*$|$)/gi, '')
    .replace(/\s*Show Tree Vertices V_T, Remaining Vertices Q, and all shortest paths\.?/gi, '')
    .trim();

  const cleanSubQuestions = (): string[] => {
    if (activeExample?.examSimulation) {
      const rawSubQuestions = activeExample.examSimulation.subQuestions;
      if (!rawSubQuestions || rawSubQuestions.length === 0) {
        return [];
      }
      return rawSubQuestions.filter((sq) =>
        !/→\s*[a-zA-Z0-9(]|Total (?:MST )?Weight\s*=\s*\d+|Cost:\s*\d+|\bS\s*=\s*\[|\bd\s*=\s*\[|\bFrequencies\s*=\s*\[|\bCount\[0\.\.\d+\]\s*=\s*\[/i.test(
          sq
        )
      );
    }
    if (isRandomExam) {
      return examPaperRequirements;
    }
    return [];
  };

  const examPaperRequirements = getAlgorithmExamRequirements();
  const finalStepObj = steps[steps.length - 1];
  const finalExamAnswerSummary =
    finalStepObj?.outputString ||
    finalStepObj?.formula ||
    finalStepObj?.title ||
    'Complete all trace steps to view the final answer.';

  // ==========================================================================
  // OFFICIAL KAU EXAM PAPER REFERENCE BOX (Official Formula / Pseudocode Box)
  // ==========================================================================
  const getExamReferenceBoxData = (): {
    header: string;
    inputOutput?: string[];
    lines: string[];
  } => {
    switch (algorithm.id) {
      case 'coin-row':
        return {
          header: 'ALGORITHM CoinRow(C[1..n])',
          inputOutput: [
            '//Input: An array C[1..n] of positive integers indicating the coin values',
            '//Output: The maximum amount of money that can be picked up',
          ],
          lines: [
            'F[0] ← 0;  F[1] ← C[1]',
            'for i ← 2 to n do',
            '    F[i] ← max(C[i] + F[i - 2], F[i - 1])',
            'return F[n]',
          ],
        };
      case 'change-making':
        return {
          header: 'ALGORITHM ChangeMaking(D[1..m], n)',
          inputOutput: [
            '//Input: Array D[1..m] of coin denominations (D[1] < ... < D[m]) and target amount n',
            '//Output: Minimum number of coins F[n] needed to make change for n',
          ],
          lines: [
            'F[0] ← 0',
            'for i ← 1 to n do',
            '    temp ← ∞;  j ← 1',
            '    while j ≤ m and i ≥ D[j] do',
            '        temp ← min(F[i - D[j]], temp)',
            '        j ← j + 1',
            '    F[i] ← temp + 1',
            'return F[n]',
          ],
        };
      case 'coin-collecting':
        return {
          header: 'ALGORITHM RobotCoinCollection(C[1..n, 1..m])',
          lines: [
            'F[1, 1] ← C[1, 1]',
            'for j ← 2 to m do F[1, j] ← F[1, j - 1] + C[1, j]',
            'for i ← 2 to n do',
            '    F[i, 1] ← F[i - 1, 1] + C[i, 1]',
            '    for j ← 2 to m do',
            '        F[i, j] ← max(F[i - 1, j], F[i, j - 1]) + C[i, j]',
            'return F[n, m]',
          ],
        };
      case 'knapsack-01':
        return {
          header: '0/1 Knapsack DP Recurrence Formula (Given on Exam Paper)',
          lines: [
            'F[0, j] = 0  for 0 ≤ j ≤ W;    F[i, 0] = 0  for 0 ≤ i ≤ n',
            'F[i, j] = F[i - 1, j]                                if j - w_i < 0',
            'F[i, j] = max(F[i - 1, j],  v_i + F[i - 1, j - w_i]) if j - w_i ≥ 0',
          ],
        };
      case 'obst':
        return {
          header: 'Optimal Binary Search Tree (OBST) Formula (Given on Exam Paper)',
          lines: [
            'C(i, i - 1) = 0,    C(i, i) = p_i,    R(i, i) = i',
            'C(i, j) = min_{i ≤ k ≤ j} { C(i, k - 1) + C(k + 1, j) } + ∑_{s=i}^{j} p_s   (1 ≤ i < j ≤ n)',
          ],
        };
      case 'floyd':
        return {
          header: 'ALGORITHM Floyd(W[1..n, 1..n])',
          lines: [
            'D^(0) ← W',
            'for k ← 1 to n do',
            '    for i ← 1 to n do',
            '        for j ← 1 to n do',
            '            D^(k)[i, j] ← min(D^(k-1)[i, j],  D^(k-1)[i, k] + D^(k-1)[k, j])',
            'return D^(n)',
          ],
        };
      case 'warshall':
        return {
          header: 'ALGORITHM Warshall(A[1..n, 1..n])',
          lines: [
            'R^(0) ← A',
            'for k ← 1 to n do',
            '    for i ← 1 to n do',
            '        for j ← 1 to n do',
            '            R^(k)[i, j] ← R^(k-1)[i, j]  or  (R^(k-1)[i, k] and R^(k-1)[k, j])',
            'return R^(n)',
          ],
        };
      case 'prim':
        return {
          header: 'ALGORITHM Prim(G)',
          inputOutput: [
            '//Input: A weighted connected undirected graph G = ⟨V, E⟩',
            '//Output: E_T, the set of edges composing a minimum spanning tree of G',
          ],
          lines: [
            'V_T ← {v_0};   E_T ← ∅',
            'for i ← 1 to |V| - 1 do',
            '    find a minimum-weight edge e* = (v*, u*) among all the edges (v, u)',
            '        such that v is in V_T and u is in V - V_T',
            '    V_T ← V_T ∪ {u*};   E_T ← E_T ∪ {e*}',
            'return E_T',
          ],
        };
      case 'kruskal':
        return {
          header: 'ALGORITHM Kruskal(G)',
          lines: [
            'sort E in nondecreasing order of the edge weights w(e_{i_1}) ≤ ... ≤ w(e_{i_|E|})',
            'E_T ← ∅;   ecounter ← 0;   k ← 0',
            'while ecounter < |V| - 1 do',
            '    k ← k + 1',
            '    if E_T ∪ {e_{i_k}} is acyclic then',
            '        E_T ← E_T ∪ {e_{i_k}};   ecounter ← ecounter + 1',
            'return E_T',
          ],
        };
      case 'dijkstra':
        return {
          header: 'ALGORITHM Dijkstra(G, s)',
          inputOutput: [
            '//Input: A weighted connected graph G = ⟨V, E⟩ with nonnegative weights and source s',
            '//Output: Shortest path length d_v from s to v and penultimate vertex p_v',
          ],
          lines: [
            'Initialize(Q)',
            'for every vertex v in V do  d_v ← ∞;  p_v ← null;  Insert(Q, v, d_v)',
            'd_s ← 0;  Decrease(Q, s, d_s);  V_T ← ∅',
            'for i ← 0 to |V| - 1 do',
            '    u* ← DeleteMin(Q);   V_T ← V_T ∪ {u*}',
            '    for every vertex u in V - V_T adjacent to u* do',
            '        if d_{u*} + w(u*, u) < d_u then',
            '            d_u ← d_{u*} + w(u*, u);  p_u ← u*;  Decrease(Q, u, d_u)',
          ],
        };
      case 'distribution-counting-sort':
      case 'distribution-counting-sort-v1':
        return {
          header: 'ALGORITHM DistributionCounting(A[0..n - 1], l, u)',
          lines: [
            'for j ← 0 to u - l do D[j] ← 0',
            'for i ← 0 to n - 1 do D[A[i] - l] ← D[A[i] - l] + 1',
            'for j ← 1 to u - l do D[j] ← D[j - 1] + D[j]',
            'for i ← n - 1 downto 0 do',
            '    j ← A[i] - l;   S[D[j] - 1] ← A[i];   D[j] ← D[j] - 1',
            'return S',
          ],
        };
      case 'comparison-counting-sort':
        return {
          header: 'ALGORITHM ComparisonCountingSort(A[0..n - 1])',
          lines: [
            'for i ← 0 to n - 1 do Count[i] ← 0',
            'for i ← 0 to n - 2 do',
            '    for j ← i + 1 to n - 1 do',
            '        if A[i] < A[j] then Count[j] ← Count[j] + 1',
            '        else Count[i] ← Count[i] + 1',
            'for i ← 0 to n - 1 do S[Count[i]] ← A[i]',
            'return S',
          ],
        };
      case 'horspool':
        return {
          header: "ALGORITHM ShiftTable(P[0..m - 1]) & HorspoolMatching",
          lines: [
            't(c) = m          if c is not among the first m - 1 characters of P',
            't(c) = m - 1 - j  otherwise (j = rightmost index of c in P[0..m - 2])',
            'Compare right-to-left; on mismatch at text char c aligned with P[m - 1], shift by t(c).',
          ],
        };
      case 'boyer-moore':
        return {
          header: 'Boyer-Moore Shift Rules (Given on Exam Paper)',
          lines: [
            'd_1 = max(t_1(c) - k, 1)    where k = number of matched characters from right',
            'd_2 = d_2(k)                from Good-Suffix Table (for 1 ≤ k < m)',
            'Shift d = d_1  (if k = 0),    d = max(d_1, d_2)  (if 0 < k < m)',
          ],
        };
      case 'max-flow':
        return {
          header: 'ALGORITHM ShortestAugmentingPath(G)',
          lines: [
            'Label source with (∞, -),  Q ← {source}',
            'Forward edge (i, j): if r_{ij} = u_{ij} - x_{ij} > 0 → label j with (min(l_i, r_{ij}), i⁺)',
            'Backward edge (j, i): if x_{ji} > 0 → label j with (min(l_i, x_{ji}), i⁻)',
            'When sink t is labeled, augment flow by l_t along the path and repeat.',
          ],
        };
      case 'bipartite-matching':
        return {
          header: 'ALGORITHM MaximumBipartiteMatching(G = (V, U, E))',
          lines: [
            'Initialize Queue Q with all free vertices in V',
            'Case 1 (v ∈ V): scan unmatched edges (v, u); if u free → Augment! else label u with v',
            'Case 2 (u ∈ U): follow matched edge (u, v); label v with u and Enqueue(Q, v)',
          ],
        };
      case 'stable-marriage':
        return {
          header: 'ALGORITHM GaleShapley(Men, Women)',
          lines: [
            'Start with all men and women free',
            'while there is a free man m do',
            '    m proposes to next woman w on his preference list',
            '    if w is free or prefers m over current fiancé m\' then w accepts m',
            '    else w rejects m',
          ],
        };
      case 'backtracking':
        return {
          header: 'Backtracking State-Space Tree Pruning Formula',
          lines: [
            'Left Branch (include w_{i+1}): feasible iff  s + w_{i+1} ≤ d',
            'Right Branch (exclude w_{i+1}): promising iff  s + ∑_{j=i+2}^{n} w_j ≥ d',
          ],
        };
      case 'branch-and-bound':
        return {
          header: 'Hint (Upper / Lower Bound Formula Printed on Exam Paper)',
          lines: [
            '0-1 Knapsack Upper Bound:   ub = v + (W - w) × (v_{i+1} / w_{i+1})',
            'Assignment Lower Bound:     lb = cost so far + ∑ min remaining entry in each row',
          ],
        };
      default:
        return {
          header: algorithm.pseudocodeTitle,
          lines: algorithm.pseudocodeLines.slice(0, 8),
        };
    }
  };

  const renderExamReferenceBox = (isDark = isDarkSheet) => {
    const refData = getExamReferenceBoxData();
    return (
      <div className={`border-2 ${isDark ? 'border-slate-700 bg-slate-950 text-slate-100 shadow-md' : 'border-slate-700 bg-[#f8fafc] text-black shadow-xs'}`}>
        <div className={`${isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-[#cbd5e1] border-slate-600 text-black'} border-b px-3 py-1.5 font-serif text-xs sm:text-sm font-bold`}>
          {refData.header}
        </div>
        <div className={`p-3 font-serif text-xs sm:text-[13px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-900'} space-y-1`}>
          {refData.inputOutput && (
            <div className={`text-[11px] sm:text-xs ${isDark ? 'text-slate-400 border-slate-800' : 'text-slate-700 border-slate-300'} italic pb-1 border-b mb-1`}>
              {refData.inputOutput.map((ln, idx) => (
                <div key={idx}>{ln}</div>
              ))}
            </div>
          )}
          <div className={`font-mono text-xs sm:text-[12.5px] whitespace-pre-wrap leading-relaxed ${isDark ? 'text-slate-100' : 'text-black'}`}>
            {refData.lines.join('\n')}
          </div>
        </div>
      </div>
    );
  };

  // ==========================================================================
  // WHITE / DARK EXAM PAPER TABLE RENDERER (Solid Header | Bold Red Solved Values)
  // ==========================================================================
  const renderExamPaperTable = (
    tbl: VisualTable,
    compact = false,
    isDark = isDarkSheet,
    cornerHeader?: string
  ) => {
    return (
      <div key={tbl.id} className="space-y-1.5">
        {tbl.title && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className={`font-serif text-xs sm:text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>
              {tbl.title}
              {tbl.subtitle && (
                <span className={`ml-2 font-normal text-xs ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>({tbl.subtitle})</span>
              )}
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className={`border-collapse border-2 ${isDark ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-black bg-white text-black'} font-sans text-xs sm:text-sm`}>
            {tbl.colHeaders && (
              <thead>
                <tr className={isDark ? 'bg-slate-950 text-slate-200 border-b border-slate-700' : 'bg-black text-white'}>
                  {tbl.rowHeaders && (
                    <th className={`border ${isDark ? 'border-slate-700' : 'border-slate-400 bg-black'} px-3 py-1.5 text-center font-bold text-white`}>
                      {cornerHeader || 'Ind'}
                    </th>
                  )}
                  {tbl.colHeaders.map((ch, cIdx) => (
                    <th
                      key={cIdx}
                      className={`border ${isDark ? 'border-slate-700' : 'border-slate-400 bg-black'} ${
                        compact ? 'px-2.5 py-1 min-w-[34px]' : 'px-3.5 py-1.5 min-w-[44px]'
                      } text-center font-bold text-white`}
                    >
                      {ch}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {tbl.rows.map((row, rIdx) => (
                <tr key={rIdx} className={isDark ? 'bg-slate-900' : 'bg-white'}>
                  {tbl.rowHeaders && tbl.rowHeaders[rIdx] !== undefined && (
                    <td className={`whitespace-nowrap border ${isDark ? 'border-slate-700 bg-slate-950/70 text-slate-200' : 'border-black bg-white text-black'} px-3 py-1.5 text-center font-bold`}>
                      {tbl.rowHeaders[rIdx]}
                    </td>
                  )}
                  {row.map((cell, cIdx) => {
                    const isEditable = practiceMode && cell.editableKey !== undefined;
                    if (isEditable) {
                      const key = cell.editableKey!;
                      const userVal = userAnswers[key] ?? '';
                      const expectedStr = String(cell.expectedValue ?? '').trim().toLowerCase();
                      const isCorrect =
                        checkedPractice &&
                        userVal.trim().toLowerCase() === expectedStr &&
                        userVal.trim() !== '';
                      const isWrong =
                        checkedPractice && userVal.trim().toLowerCase() !== expectedStr;

                      return (
                        <td
                          key={cIdx}
                          className={`border ${isDark ? 'border-slate-700' : 'border-black'} p-1 text-center ${
                            isCorrect
                              ? isDark ? 'bg-emerald-950/60' : 'bg-emerald-50'
                              : isWrong
                                ? isDark ? 'bg-rose-950/60' : 'bg-red-50'
                                : isDark ? 'bg-amber-950/30' : 'bg-amber-50/40'
                          }`}
                        >
                          <input
                            type="text"
                            value={userVal}
                            placeholder="?"
                            onChange={(e) => {
                              setUserAnswers((prev) => ({
                                ...prev,
                                [key]: e.target.value,
                              }));
                            }}
                            className={`w-14 rounded border px-1 py-0.5 text-center font-mono text-xs font-extrabold outline-none ${
                              isCorrect
                                ? 'border-emerald-600 bg-white text-emerald-700'
                                : isWrong
                                  ? 'border-red-600 bg-white text-red-600'
                                  : isDark
                                  ? 'border-slate-600 bg-slate-800 text-rose-400 focus:border-rose-400'
                                  : 'border-slate-500 bg-white text-[#dc2626] focus:border-black'
                            }`}
                          />
                        </td>
                      );
                    }

                    // Determine if this cell represents a solved/computed value (render in bold RED #dc2626 or text-rose-400) vs given input (bold black or slate-100)
                    const firstHeader = tbl.rowHeaders ? String(tbl.rowHeaders[0] ?? '') : '';
                    const isRowGiven =
                      tbl.rowHeaders &&
                      rIdx === 0 &&
                      tbl.rows.length > 1 &&
                      (firstHeader.startsWith('C') ||
                        firstHeader.toLowerCase().includes('coin') ||
                        firstHeader.toLowerCase().includes('key') ||
                        firstHeader.toLowerCase().includes('input'));

                    const isUnvisited = cell.state === 'unvisited' || cell.value === '';
                    const isActiveNow =
                      cell.state === 'active' ||
                      cell.state === 'match' ||
                      cell.state === 'path';
                    const isRedSolved =
                      !isRowGiven &&
                      !isUnvisited &&
                      tbl.id !== 'bm-good-suffix' &&
                      (cell.state === 'computed' ||
                        cell.state === 'active' ||
                        cell.state === 'match' ||
                        cell.state === 'path' ||
                        cell.state === 'compare' ||
                        cell.editableKey !== undefined ||
                        rIdx > 0 ||
                        tbl.rows.length === 1);

                    return (
                      <td
                        key={cIdx}
                        title={cell.tooltip}
                        className={`border ${isDark ? 'border-slate-700' : 'border-black'} ${
                          compact ? 'px-2.5 py-1.5' : 'px-3.5 py-2'
                        } text-center ${
                          isActiveNow
                            ? isDark
                              ? 'bg-rose-950/60 ring-1 ring-inset ring-rose-500'
                              : 'bg-red-50/90 ring-1 ring-inset ring-red-400'
                            : isDark
                            ? 'bg-slate-900'
                            : 'bg-white'
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center">
                          <span
                            className={`font-bold ${
                              isRedSolved
                                ? isDark
                                  ? 'text-rose-400 font-extrabold'
                                  : 'text-[#dc2626] font-extrabold'
                                : isUnvisited
                                  ? isDark
                                    ? 'text-slate-600'
                                    : 'text-slate-400'
                                  : isDark
                                  ? 'text-slate-200'
                                  : 'text-black'
                            }`}
                          >
                            {cell.value}
                          </span>
                          {cell.subText && (
                            <span className={`text-[10px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              {cell.subText}
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ==========================================================================
  // SPECIALIZED OFFICIAL EXAM SOLUTION RENDERERS (Exact Match to KAU PDFs!)
  // ==========================================================================
  const renderCoinRowExamPaperSolution = () => {
    const rawCoinsStr = givenInputSource.coins || customInputs.coins || '4, 9, 3, 8, 5, 7';
    const coins = rawCoinsStr
      .split(/[,;\s]+/)
      .map((s) => parseFloat(s.trim()))
      .filter((v) => !Number.isNaN(v));
    const n = coins.length;
    const F: number[] = new Array(n + 1).fill(0);
    if (n >= 1) F[1] = coins[0];
    for (let i = 2; i <= n; i++) {
      F[i] = Math.max(coins[i - 1] + F[i - 2], F[i - 1]);
    }

    // Backtrack selected coins
    const selectedCoins: number[] = [];
    const selectedIndices: number[] = [];
    let idx = n;
    while (idx >= 1) {
      if (idx === 1 || coins[idx - 1] + F[idx - 2] >= F[idx - 1]) {
        selectedCoins.push(coins[idx - 1]);
        selectedIndices.push(idx);
        idx -= 2;
      } else {
        idx -= 1;
      }
    }
    selectedCoins.reverse();
    selectedIndices.reverse();

    // Map safeStepIdx (0 .. steps.length - 1) to how many F-table steps are revealed:
    // Step 0 -> k = 1 (F[0]=0, F[1]=C[1])
    // Step 1 -> k = 2 (F[0..2])
    // ...
    // Step n-1 -> k = n (F[0..n])
    const maxK = showAllExamSteps
      ? n
      : Math.min(n, Math.max(1, safeStepIdx + 1));

    const stepIndices = Array.from({ length: maxK }, (_, idxK) => idxK + 1);

    return (
      <div className="space-y-6">
        <div className={`font-serif text-sm sm:text-base font-bold italic ${isDarkSheet ? 'text-white' : 'text-black'}`}>
          a)
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 Columns: Exact Stacked Exam Tables (Ind / C / F) from Fall 2025 Final Q2(a) */}
          <div className="lg:col-span-7 space-y-4">
            {stepIndices.map((kVal) => {
              const isLatestStep = kVal === maxK && !showAllExamSteps;
              const calcFormula =
                kVal === 1
                  ? `Base Cases: F[0] = 0,  F[1] = C[1] = ${coins[0]}`
                  : `F[${kVal}] = max(C[${kVal}] + F[${kVal - 2}], F[${kVal - 1}]) = max(${coins[kVal - 1]} + ${F[kVal - 2]}, ${F[kVal - 1]}) = max(${coins[kVal - 1] + F[kVal - 2]}, ${F[kVal - 1]}) = ${F[kVal]}`;

              return (
                <div
                  key={kVal}
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStepIdx(Math.min(steps.length - 1, kVal - 1));
                  }}
                  className={`space-y-1.5 rounded-lg p-2 transition cursor-pointer ${
                    isLatestStep
                      ? isDarkSheet
                        ? 'bg-rose-950/40 ring-2 ring-rose-500'
                        : 'bg-red-50/50 ring-2 ring-red-400'
                      : isDarkSheet
                      ? 'hover:bg-slate-800'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                    <span className={`font-bold ${isDarkSheet ? 'text-slate-300' : 'text-slate-700'}`}>
                      {kVal === 1 ? 'Step 1 (Initialization i = 0, 1):' : `Step ${kVal} (i = ${kVal}):`}
                    </span>
                    <span className={`font-bold ${isDarkSheet ? 'text-rose-400' : 'text-[#dc2626]'}`}>{calcFormula}</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className={`border-collapse border-2 ${isDarkSheet ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-black bg-white text-black'} text-center font-sans text-xs sm:text-sm`}>
                      <thead>
                        <tr className={isDarkSheet ? 'bg-slate-950 text-slate-200 border-b border-slate-700' : 'bg-black text-white'}>
                          <th className="border border-slate-500 px-3.5 py-1.5 font-bold">
                            Ind
                          </th>
                          {Array.from({ length: n + 1 }, (_, col) => (
                            <th
                              key={col}
                              className="min-w-[44px] border border-slate-500 px-3.5 py-1.5 font-bold"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {/* Row C: Ind 0 is blank, Ind 1..n has coins[0..n-1] in bold black */}
                        <tr className={isDarkSheet ? 'bg-slate-900' : 'bg-white'}>
                          <td className={`border ${isDarkSheet ? 'border-slate-700' : 'border-black'} px-3.5 py-1.5 font-bold`}>
                            C
                          </td>
                          <td className={`border ${isDarkSheet ? 'border-slate-700' : 'border-black'} px-3.5 py-1.5 font-bold`}>
                            {''}
                          </td>
                          {coins.map((cVal, cIdx) => (
                            <td
                              key={cIdx}
                              className={`border ${isDarkSheet ? 'border-slate-700 text-slate-100' : 'border-black text-black'} px-3.5 py-1.5 font-bold`}
                            >
                              {cVal}
                            </td>
                          ))}
                        </tr>
                        {/* Row F: Filled in bold RED up to column kVal, blank after kVal */}
                        <tr className={isDarkSheet ? 'bg-slate-900' : 'bg-white'}>
                          <td className={`border ${isDarkSheet ? 'border-slate-700' : 'border-black'} px-3.5 py-1.5 font-bold`}>
                            F
                          </td>
                          {Array.from({ length: n + 1 }, (_, col) => {
                            const isFilled = col <= kVal;
                            const isJustComputed = col === kVal || (kVal === 1 && col === 0);
                            return (
                              <td
                                key={col}
                                className={`border ${isDarkSheet ? 'border-slate-700' : 'border-black'} px-3.5 py-1.5 font-extrabold ${
                                  isFilled
                                    ? isDarkSheet
                                      ? 'text-rose-400'
                                      : 'text-[#dc2626]'
                                    : 'text-transparent'
                                } ${
                                  isJustComputed && isLatestStep
                                    ? isDarkSheet
                                      ? 'bg-rose-950/60'
                                      : 'bg-red-100/80'
                                    : ''
                                }`}
                              >
                                {isFilled ? F[col] : ''}
                              </td>
                            );
                          })}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right 5 Columns: ONLY the Reference Algorithm Box + CFE 5-Column Summary Table */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-5">
            {renderExamReferenceBox(isDarkSheet)}

            {/* Also show the CFE Final Q2(a) 5-column vertical table format */}
            <div className="space-y-1.5">
              <div className={`font-serif text-xs font-bold ${isDarkSheet ? 'text-slate-300' : 'text-slate-800'}`}>
                Detailed Recurrence Evaluation Table (Fall 2025 CFE Q2a Format):
              </div>
              <div className="overflow-x-auto">
                <table className={`w-full border-collapse border-2 ${isDarkSheet ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-black bg-white text-black'} text-center font-sans text-xs`}>
                  <thead>
                    <tr className={isDarkSheet ? 'bg-slate-950 text-slate-200' : 'bg-black text-white'}>
                      <th className="border border-slate-500 px-2.5 py-1.5">i</th>
                      <th className="border border-slate-500 px-2.5 py-1.5">C[i]</th>
                      <th className="border border-slate-500 px-2.5 py-1.5">F[i]</th>
                      <th className="border border-slate-500 px-2.5 py-1.5">C[i] + F[i-2]</th>
                      <th className="border border-slate-500 px-2.5 py-1.5">F[i-1]</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: maxK + 1 }, (_, i) => (
                      <tr key={i} className={i === maxK ? (isDarkSheet ? 'bg-rose-950/40' : 'bg-red-50/70') : ''}>
                        <td className={`border ${isDarkSheet ? 'border-slate-700 text-slate-200' : 'border-black text-black'} px-2.5 py-1 font-bold`}>
                          {i}
                        </td>
                        <td className={`border ${isDarkSheet ? 'border-slate-700 text-slate-200' : 'border-black text-black'} px-2.5 py-1 font-bold`}>
                          {i === 0 ? '—' : coins[i - 1]}
                        </td>
                        <td className={`border ${isDarkSheet ? 'border-slate-700 text-rose-400' : 'border-black text-[#dc2626]'} px-2.5 py-1 font-extrabold`}>
                          {F[i]}
                        </td>
                        <td className={`border ${isDarkSheet ? 'border-slate-700 text-rose-400' : 'border-black text-[#dc2626]'} px-2.5 py-1 font-bold`}>
                          {i < 2
                            ? '—'
                            : `${coins[i - 1]} + ${F[i - 2]} = ${coins[i - 1] + F[i - 2]}`}
                        </td>
                        <td className={`border ${isDarkSheet ? 'border-slate-700 text-rose-400' : 'border-black text-[#dc2626]'} px-2.5 py-1 font-bold`}>
                          {i < 2 ? '—' : F[i - 1]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Part b) Optimal Value & Selected Coins (Exact Match to Fall 2025 Final Q2a) */}
        {(maxK >= n || safeStepIdx >= steps.length - 1 || showAllExamSteps) && (
          <div className={`border-t-2 ${isDarkSheet ? 'border-slate-800 text-slate-100' : 'border-slate-300 text-black'} pt-4 space-y-2 font-serif text-sm sm:text-base`}>
            <div className="font-bold italic">b)</div>
            <div className="pl-4 space-y-1.5">
              <div>
                <span className="font-bold">Maximum Value: </span>
                <span className={`font-extrabold ${isDarkSheet ? 'text-rose-400' : 'text-[#dc2626]'} text-base sm:text-lg`}>
                  {F[n]}
                </span>
              </div>
              <div>
                <span className="font-bold">Selected Coins: </span>
                <span className={`font-extrabold ${isDarkSheet ? 'text-rose-400' : 'text-[#dc2626]'} text-base sm:text-lg`}>
                  {selectedCoins.join(', ')}
                </span>
                <span className={`ml-2 font-mono text-xs ${isDarkSheet ? 'text-slate-400' : 'text-slate-700'}`}>
                  (Positions: {selectedIndices.map((idxPos) => `C_${idxPos}=${coins[idxPos - 1]}`).join(' + ')} = {F[n]})
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderChangeMakingExamPaperSolution = () => {
    const amountN = Math.min(
      30,
      Math.max(1, parseInt(givenInputSource.amount || customInputs.amount || '9', 10) || 9)
    );
    const rawDenoms = (givenInputSource.denoms || customInputs.denoms || '1, 4, 5, 7')
      .split(/[,;\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((v) => !Number.isNaN(v) && v > 0);
    const denoms = Array.from(new Set(rawDenoms.length > 0 ? rawDenoms : [1, 4, 5, 7])).sort(
      (a, b) => a - b
    );

    const F: number[] = new Array(amountN + 1).fill(Infinity);
    const usedCoin: number[] = new Array(amountN + 1).fill(0);
    F[0] = 0;
    for (let i = 1; i <= amountN; i++) {
      for (const d of denoms) {
        if (i >= d && F[i - d] + 1 < F[i]) {
          F[i] = F[i - d] + 1;
          usedCoin[i] = d;
        }
      }
    }

    const chosenCoins: number[] = [];
    let rem = amountN;
    let safety = 0;
    while (rem > 0 && usedCoin[rem] > 0 && safety < 100) {
      chosenCoins.push(usedCoin[rem]);
      rem -= usedCoin[rem];
      safety++;
    }

    const maxK = showAllExamSteps
      ? amountN
      : Math.min(amountN, Math.max(0, safeStepIdx));

    const stepAmounts = Array.from({ length: maxK + 1 }, (_, idx) => idx);

    return (
      <div className="space-y-6">
        {/* Centered Reference Algorithm Box (Exact Match to Fall 2025 Final Q2b Page 6) */}
        <div className="mx-auto max-w-xl">{renderExamReferenceBox(isDarkSheet)}</div>

        {/* Stacked Step-by-Step Tables (Exact Match to Fall 2025 Final Q2b Pages 6–7) */}
        <div className="space-y-3">
          {stepAmounts.map((kVal) => {
            const isLatestStep = kVal === maxK && !showAllExamSteps;
            const validDenoms = denoms.filter((d) => kVal >= d);
            const formulaText =
              kVal === 0
                ? 'Base Case: F[0] = 0'
                : validDenoms.length > 0
                  ? `F[${kVal}] = min(${validDenoms
                      .map((d) => `F[${kVal}-${d}]=${F[kVal - d] === Infinity ? '∞' : F[kVal - d]}`)
                      .join(', ')}) + 1 = ${F[kVal] === Infinity ? '∞' : F[kVal]}`
                  : `F[${kVal}] = ∞`;

            return (
              <div
                key={kVal}
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStepIdx(Math.min(steps.length - 1, kVal));
                }}
                className={`space-y-1 rounded-lg p-2 transition cursor-pointer ${
                  isLatestStep
                    ? isDarkSheet
                      ? 'bg-rose-950/40 ring-2 ring-rose-500'
                      : 'bg-red-50/50 ring-2 ring-red-400'
                    : isDarkSheet
                    ? 'hover:bg-slate-800'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <span className={`font-bold ${isDarkSheet ? 'text-slate-300' : 'text-slate-700'}`}>
                    {kVal === 0 ? 'Initialization (i = 0):' : `Step i = ${kVal}:`}
                  </span>
                  <span className={`font-bold ${isDarkSheet ? 'text-rose-400' : 'text-[#dc2626]'}`}>{formulaText}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className={`mx-auto border-collapse border-2 ${isDarkSheet ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-black bg-white text-black'} text-center font-sans text-xs sm:text-sm`}>
                    <thead>
                      <tr className={isDarkSheet ? 'bg-slate-950 text-slate-200 border-b border-slate-700' : 'bg-black text-white'}>
                        <th className="min-w-[42px] border border-slate-500 px-3 py-1 font-bold italic">
                          i
                        </th>
                        {Array.from({ length: amountN + 1 }, (_, col) => (
                          <th
                            key={col}
                            className="min-w-[42px] border border-slate-500 px-3 py-1 font-bold"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className={isDarkSheet ? 'bg-slate-900' : 'bg-white'}>
                        <td className={`border ${isDarkSheet ? 'border-slate-700 text-slate-200' : 'border-black text-black'} px-3 py-1.5 font-bold italic`}>
                          F
                        </td>
                        {Array.from({ length: amountN + 1 }, (_, col) => {
                          const isFilled = col <= kVal;
                          const isJustComputed = col === kVal;
                          return (
                            <td
                              key={col}
                              className={`border ${isDarkSheet ? 'border-slate-700' : 'border-black'} px-3 py-1.5 font-extrabold ${
                                isFilled
                                  ? isDarkSheet
                                    ? 'text-rose-400'
                                    : 'text-[#dc2626]'
                                  : 'text-transparent'
                              } ${
                                isJustComputed && isLatestStep
                                  ? isDarkSheet
                                    ? 'bg-rose-950/60'
                                    : 'bg-red-100/80'
                                  : ''
                              }`}
                            >
                              {isFilled ? (F[col] === Infinity ? '∞' : F[col]) : ''}
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>

        {(maxK >= amountN || safeStepIdx >= steps.length - 1 || showAllExamSteps) && (
          <div className={`border-t-2 ${isDarkSheet ? 'border-slate-800 text-slate-100' : 'border-slate-300 text-black'} pt-4 space-y-1.5 font-serif text-sm sm:text-base`}>
            <div>
              <span className="font-bold">Minimum Number of Coins F[{amountN}]: </span>
              <span className={`font-extrabold ${isDarkSheet ? 'text-rose-400' : 'text-[#dc2626]'} text-lg`}>
                {F[amountN] === Infinity ? '∞ (Impossible)' : F[amountN]}
              </span>
            </div>
            {chosenCoins.length > 0 && (
              <div>
                <span className="font-bold">Optimal Coins Selected: </span>
                <span className={`font-extrabold ${isDarkSheet ? 'text-rose-400' : 'text-[#dc2626]'} text-base`}>
                  {chosenCoins.join(' + ')} = {amountN}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderStringMatchingExamPaperSolution = () => {
    const rawShiftTbl = steps[0]?.tables?.find(
      (t) => t.id === 'horspool-shift-table' || t.id === 'bm-bad-symbol'
    );
    const rawGoodSuffixTbl = steps[0]?.tables?.find((t) => t.id === 'bm-good-suffix');

    const activeStringView =
      (showAllExamSteps
        ? steps[steps.length - 1]?.stringView
        : currentStep?.stringView) ||
      steps.find((s) => s.stringView)?.stringView;
    const historyRows = activeStringView?.historyRows || [];

    const textStr =
      activeStringView?.text ||
      givenInputSource.text ||
      customInputs.text ||
      '';
    const textChars = textStr.split('');

    // Step 0 Solution Concealment:
    // Shift table is what the student must compute.
    // At Step 0, its shift row must be BLANK!
    // When safeStepIdx >= 1 or showAllExamSteps, solved values appear in bold red.
    const isShiftSolved = safeStepIdx >= 1 || showAllExamSteps;

    const isBinaryBMExam =
      activeExample?.id === 'bm-exam-winter2023' ||
      Boolean(
        rawShiftTbl?.colHeaders &&
          rawShiftTbl.colHeaders.includes('0') &&
          rawShiftTbl.colHeaders.includes('1') &&
          algorithm.id === 'boyer-moore'
      );

    const cleanShiftTbl = rawShiftTbl
      ? {
          ...rawShiftTbl,
          title: isBinaryBMExam ? 'Bad Symbol Table' : rawShiftTbl.title,
          subtitle: isBinaryBMExam ? undefined : rawShiftTbl.subtitle,
          colHeaders: isBinaryBMExam
            ? ['0', '1']
            : rawShiftTbl.colHeaders,
          rowHeaders: isBinaryBMExam ? ['Shift t(c)'] : rawShiftTbl.rowHeaders,
          rows: rawShiftTbl.rows.map((row) => {
            const cols = isBinaryBMExam && rawShiftTbl.colHeaders
              ? row.filter((_, idx) => rawShiftTbl.colHeaders![idx] === '0' || rawShiftTbl.colHeaders![idx] === '1')
              : row;
            return cols.map((cell) => ({
              ...cell,
              value: isShiftSolved ? cell.value : '',
              state: isShiftSolved ? 'computed' : 'unvisited',
            }));
          }),
        }
      : undefined;

    const cleanGoodSuffixTbl = rawGoodSuffixTbl
      ? {
          ...rawGoodSuffixTbl,
          title: isBinaryBMExam ? 'Good Suffix Table' : rawGoodSuffixTbl.title,
          subtitle: isBinaryBMExam ? undefined : rawGoodSuffixTbl.subtitle,
          colHeaders: isBinaryBMExam ? ['K', 'Pattern', 'd₂'] : rawGoodSuffixTbl.colHeaders,
          rows: rawGoodSuffixTbl.rows.map((row) =>
            row.map((cell) => ({
              ...cell,
              state: 'default' as const, // black text, pre-given to student
            }))
          ),
        }
      : undefined;

    return (
      <div className="space-y-8">
        {/* ================================================================ */}
        {/* PAGE 1: ALGORITHM REFERENCE + SHIFT TABLES                       */}
        {/* ================================================================ */}
        <div className="space-y-6">
          <div className={`flex items-center justify-between border-b-2 ${isDarkSheet ? 'border-slate-800' : 'border-slate-300'} pb-2`}>
            <span className={`font-serif text-xs font-bold uppercase tracking-wider ${isDarkSheet ? 'text-slate-400' : 'text-slate-600'}`}>
              📄 Examination Sheet — Page 1 of 2
            </span>
            <span className={`font-serif text-xs font-semibold ${isDarkSheet ? 'text-slate-500' : 'text-slate-500'}`}>
              Section 1: Shift Table Precomputations
            </span>
          </div>

          {/* Reference Formula Box (Full Width, Centered) */}
          <div className="mx-auto max-w-2xl">{renderExamReferenceBox(isDarkSheet)}</div>

          {/* Side-by-Side Shift Tables (Exact Replica of Dr. Umair's Exam Sheet) */}
          <div className={`grid grid-cols-1 ${cleanGoodSuffixTbl ? 'md:grid-cols-2' : ''} gap-8 items-start`}>
            {cleanShiftTbl && (
              <div className="space-y-1.5">
                <div className={`font-serif text-sm font-bold ${isDarkSheet ? 'text-slate-100' : 'text-black'}`}>
                  {isBinaryBMExam ? 'Bad Symbol Table:' : cleanShiftTbl.title}
                </div>
                {renderExamPaperTable(
                  { ...cleanShiftTbl, title: '' },
                  true,
                  isDarkSheet,
                  isBinaryBMExam ? 'Character c' : undefined
                )}
                {isShiftSolved && isBinaryBMExam && (
                  <div className="text-center font-serif text-xs font-bold text-red-600 dark:text-rose-400 mt-1">
                    0.5 Marks
                  </div>
                )}
              </div>
            )}
            {cleanGoodSuffixTbl && (
              <div className="space-y-1.5">
                <div className={`font-serif text-sm font-bold ${isDarkSheet ? 'text-slate-100' : 'text-black'}`}>
                  Good Suffix Table
                </div>
                {renderExamPaperTable(
                  { ...cleanGoodSuffixTbl, title: '' },
                  true,
                  isDarkSheet
                )}
              </div>
            )}
          </div>
        </div>

        {/* ================================================================ */}
        {/* REALISTIC EXAM SHEET PAGE DIVIDER                                */}
        {/* ================================================================ */}
        <div className="relative my-8 text-center">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className={`w-full border-t-2 border-dashed ${isDarkSheet ? 'border-slate-700' : 'border-slate-400'}`} />
          </div>
          <div className="relative flex justify-center">
            <span className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs sm:text-sm font-serif font-bold uppercase tracking-wider shadow-sm ${
              isDarkSheet
                ? 'bg-slate-800 text-rose-400 border border-slate-700'
                : 'bg-white text-slate-800 border-2 border-slate-400'
            }`}>
              📄 Examination Sheet — Page 2 of 2 (Searching &amp; Alignments)
            </span>
          </div>
        </div>

        {/* ================================================================ */}
        {/* PAGE 2: SEARCHING PROCESS & PATTERN ALIGNMENTS                   */}
        {/* ================================================================ */}
        {textChars.length > 0 && (
          <div className="space-y-6">
            <div className={`flex items-center justify-between border-b-2 ${isDarkSheet ? 'border-slate-800' : 'border-slate-300'} pb-2`}>
              <span className={`font-serif text-xs font-bold uppercase tracking-wider ${isDarkSheet ? 'text-slate-400' : 'text-slate-600'}`}>
                📄 Examination Sheet — Page 2 of 2
              </span>
              <span className={`font-serif text-xs font-semibold ${isDarkSheet ? 'text-slate-500' : 'text-slate-500'}`}>
                Section 2: Pattern Alignments &amp; Shifts under Text T
              </span>
            </div>

            <div className="space-y-2">
              <div className={`font-serif text-sm font-bold italic ${isDarkSheet ? 'text-slate-100' : 'text-black'}`}>
                Searching Process (Pattern Alignments Step-by-Step):
              </div>

              <div className="overflow-x-auto">
                <table className={`w-full border-collapse border-2 ${isDarkSheet ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-black bg-white text-black'} text-center font-mono text-xs sm:text-sm`}>
                  <thead>
                    {/* Small 0-based index row */}
                    <tr className={isDarkSheet ? 'bg-slate-950 text-[10px] text-slate-400' : 'bg-slate-100 text-[10px] text-slate-600'}>
                      {textChars.map((_, cIdx) => (
                        <th key={cIdx} className={`border ${isDarkSheet ? 'border-slate-800' : 'border-slate-300'} px-2 py-0.5`}>
                          {cIdx}
                        </th>
                      ))}
                      <th className={`border ${isDarkSheet ? 'border-slate-800' : 'border-slate-300'} px-3 py-0.5 text-left`}>
                        Shift / Comparison Details
                      </th>
                    </tr>
                    {/* Solid Black Header Row with Text Characters */}
                    <tr className={isDarkSheet ? 'bg-slate-950 text-slate-100 border-b border-slate-700' : 'bg-black text-white'}>
                      {textChars.map((ch, cIdx) => (
                        <th
                          key={cIdx}
                          className={`min-w-[30px] border ${isDarkSheet ? 'border-slate-700 bg-slate-950 text-slate-100' : 'border-slate-400 bg-black text-white'} px-2 py-1.5 font-bold`}
                        >
                          {ch === ' ' ? '␣' : ch}
                        </th>
                      ))}
                      <th className={`border ${isDarkSheet ? 'border-slate-700 bg-slate-950 text-slate-100' : 'border-slate-400 bg-black text-white'} px-3 py-1.5 text-left font-sans text-xs font-bold`}>
                        Text T (n = {textChars.length})
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={textChars.length + 1}
                          className={`border ${isDarkSheet ? 'border-slate-700 text-slate-400' : 'border-black text-slate-600'} px-4 py-6 text-center font-sans text-xs italic`}
                        >
                          Step 1 constructs the Shift Table on Page 1. Click <strong>Next Step ▶</strong> to begin searching!
                        </td>
                      </tr>
                    ) : (
                      historyRows.map((hRow, rIdx) => {
                        const patChars = hRow.pattern.split('');
                        const isLatestTrial = rIdx === historyRows.length - 1 && !showAllExamSteps;
                        return (
                          <tr
                            key={rIdx}
                            className={`transition ${
                              isLatestTrial
                                ? isDarkSheet ? 'bg-rose-950/40' : 'bg-red-50/70'
                                : isDarkSheet ? 'bg-slate-900 hover:bg-slate-800/80' : 'bg-white hover:bg-slate-50'
                            }`}
                          >
                            {textChars.map((_, colIdx) => {
                              const patOffset = colIdx - hRow.alignIndex;
                              const inPattern = patOffset >= 0 && patOffset < patChars.length;
                              const ch = inPattern ? patChars[patOffset] : '';
                              const comp = inPattern
                                ? hRow.comparedIndices.find((c) => c.patIdx === patOffset)
                                : undefined;

                              return (
                                <td
                                  key={colIdx}
                                  className={`border ${isDarkSheet ? 'border-slate-800' : 'border-black'} px-2 py-1.5 font-extrabold ${isDarkSheet ? 'text-rose-400' : 'text-[#dc2626]'} ${
                                    comp
                                      ? !comp.match
                                        ? isDarkSheet ? 'bg-rose-950/70 underline decoration-2' : 'bg-red-100 underline decoration-2'
                                        : isDarkSheet ? 'bg-emerald-950/60 underline' : 'bg-emerald-50/70 underline'
                                      : ''
                                  }`}
                                >
                                  {inPattern ? (
                                    <span className={comp ? 'font-extrabold' : 'opacity-85'}>
                                      {ch}
                                    </span>
                                  ) : (
                                    ''
                                  )}
                                </td>
                              );
                            })}
                            <td className={`whitespace-nowrap border ${isDarkSheet ? 'border-slate-800 text-rose-400 font-bold' : 'border-black text-[#dc2626] font-bold'} px-3 py-1.5 text-left font-mono text-xs`}>
                              {hRow.shiftFormula || `Aligned at i = ${hRow.alignIndex}`}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFloydWarshallExamPaperSolution = () => {
    const maxStep = showAllExamSteps ? steps.length - 1 : safeStepIdx;
    const revealedSteps = steps.slice(0, maxStep + 1);

    return (
      <div className="space-y-6">
        {/* Top Row: Graph + Reference Formula Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {currentStep?.graphView && (
            <div className="lg:col-span-7">
              {renderGraphVisualizer(currentStep.graphView, !isDarkSheet)}
            </div>
          )}
          <div className={currentStep?.graphView ? 'lg:col-span-5' : 'lg:col-span-12'}>
            {renderExamReferenceBox(isDarkSheet)}
          </div>
        </div>

        {/* 2-Column Exam Solution Table (Exact Match to Fall 2025 CFE Final Q2b Page 4!) */}
        <div className={`border-2 ${isDarkSheet ? 'border-slate-700 bg-slate-900 divide-y-2 divide-slate-800' : 'border-black bg-white divide-y-2 divide-black'}`}>
          {revealedSteps.map((st, sIdx) => {
            const isLatest = sIdx === revealedSteps.length - 1 && !showAllExamSteps;
            const mainMatrix = st.tables[0];
            return (
              <div
                key={sIdx}
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStepIdx(sIdx);
                }}
                className={`grid grid-cols-1 md:grid-cols-12 cursor-pointer transition ${
                  isLatest
                    ? isDarkSheet ? 'bg-rose-950/40' : 'bg-red-50/40'
                    : isDarkSheet ? 'bg-slate-900 hover:bg-slate-800/80' : 'bg-white hover:bg-slate-50'
                }`}
              >
                {/* Left Column: Step Header & Changed Cells Calculation in Red */}
                <div className={`md:col-span-5 border-b md:border-b-0 md:border-r-2 ${isDarkSheet ? 'border-slate-800' : 'border-black'} p-4 space-y-2`}>
                  <div className={`font-serif text-sm sm:text-base font-bold ${isDarkSheet ? 'text-slate-100' : 'text-black'}`}>
                    {st.title}
                  </div>
                  <p className={`font-serif text-xs sm:text-sm ${isDarkSheet ? 'text-slate-300' : 'text-slate-800'} leading-relaxed`}>
                    {st.explanation}
                  </p>
                  {st.formula && (
                    <div className={`pt-1 font-mono text-xs sm:text-sm font-extrabold ${isDarkSheet ? 'text-rose-400' : 'text-[#dc2626]'}`}>
                      {st.formula}
                    </div>
                  )}
                </div>

                {/* Right Column: Distance / Reachability Matrix */}
                <div className="md:col-span-7 p-4 flex items-center justify-center">
                  {mainMatrix && renderExamPaperTable(mainMatrix, false, isDarkSheet)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ==========================================================================
  // PRIM'S ALGORITHM OFFICIAL EXAM SOLUTION RENDERER (Winter 2023 Makeup & Fall 2025 CFE Format + Doctor's Step Cards)
  // ==========================================================================
  const renderPrimExamPaperSolution = () => {
    const rawEdgesStr =
      givenInputSource.edges ||
      customInputs.edges ||
      'a-b:5, a-c:7, b-d:6, c-d:4, a-e:2, b-e:3, c-e:4, d-e:5';
    const rawStartStr = givenInputSource.startNode || customInputs.startNode || 'a';
    const { nodes, edges } = parseEdgesInput(rawEdgesStr);
    const startNode = nodes.includes(rawStartStr.trim()) ? rawStartStr.trim() : nodes[0];

    interface PrimRow {
      treeVertex: string;
      queueText: string;
      mstEdge?: string;
      edgeWeight?: number;
    }

    interface PrimStepCard {
      title: string;
      isInit: boolean;
      uStar?: string;
      pStar?: string;
      wStar?: number;
      vtString: string;
      etString: string;
      cutEdges: string[];
      relaxLines: string[];
      currentWeight: number;
      queueText: string;
    }

    const primRows: PrimRow[] = [];
    const primCards: PrimStepCard[] = [];
    const VT = new Set<string>();
    const ET: { from: string; to: string; weight: number }[] = [];
    const parent: Record<string, string | null> = {};
    const key: Record<string, number> = {};

    nodes.forEach((v) => {
      key[v] = Infinity;
      parent[v] = null;
    });

    VT.add(startNode);
    for (const e of edges) {
      if (e.u === startNode) {
        key[e.v] = e.w;
        parent[e.v] = startNode;
      } else if (e.v === startNode) {
        key[e.u] = e.w;
        parent[e.u] = startNode;
      }
    }

    const formatQueue = () => {
      const remaining = nodes.filter((v) => !VT.has(v));
      if (remaining.length === 0) return '(empty)';
      return remaining
        .map((v) => {
          const p = parent[v] ?? '-';
          const d = key[v] === Infinity ? '∞' : key[v];
          return `${v}(${p}, ${d})`;
        })
        .join(', ');
    };

    primRows.push({
      treeVertex: `${startNode}(-, -)`,
      queueText: formatQueue(),
    });

    // Card 0: Initialization
    const initialCut = edges
      .filter((e) => e.u === startNode || e.v === startNode)
      .map((e) => `• (${e.u}, ${e.v}) (w = ${e.w})`);

    primCards.push({
      title: 'Initialization',
      isInit: true,
      vtString: `{ ${startNode} }`,
      etString: '∅',
      cutEdges: initialCut,
      relaxLines: [],
      currentWeight: 0,
      queueText: formatQueue(),
    });

    let iterCount = 1;
    let runningWeight = 0;

    while (VT.size < nodes.length) {
      const remaining = nodes.filter((v) => !VT.has(v));
      remaining.sort((a, b) => key[a] - key[b] || a.localeCompare(b));
      const uStar = remaining[0];
      if (!uStar || key[uStar] === Infinity) break;

      const pStar = parent[uStar] ?? '-';
      const wStar = key[uStar];

      // Cut edges crossing VT to (V - VT) before adding uStar
      const availableCutEdges = edges
        .filter((e) => (VT.has(e.u) && !VT.has(e.v)) || (VT.has(e.v) && !VT.has(e.u)))
        .map((e) => `• (${e.u}, ${e.v}) (w = ${e.w})`);

      VT.add(uStar);
      if (pStar !== '-') {
        ET.push({ from: pStar, to: uStar, weight: wStar });
        runningWeight += wStar;
      }

      const relaxLines: string[] = [];
      for (const e of edges) {
        let neighbor = '';
        if (e.u === uStar && !VT.has(e.v)) neighbor = e.v;
        else if (e.v === uStar && !VT.has(e.u)) neighbor = e.u;

        if (neighbor) {
          const oldK = key[neighbor];
          const oldKStr = oldK === Infinity ? '∞' : String(oldK);
          if (e.w < oldK) {
            key[neighbor] = e.w;
            parent[neighbor] = uStar;
            relaxLines.push(
              `• key(${neighbor}) = min(${oldKStr}, ${e.w}) = ${e.w}, parent(${neighbor}) = ${uStar}`
            );
          } else {
            relaxLines.push(
              `• key(${neighbor}) = min(${oldKStr}, ${e.w}) = ${oldKStr} (no change)`
            );
          }
        }
      }

      if (relaxLines.length === 0) {
        relaxLines.push(`• No adjacent fringe vertices to update.`);
      }

      primCards.push({
        title: `Iteration ${iterCount < 10 ? '0' + iterCount : iterCount}`,
        isInit: false,
        uStar,
        pStar,
        wStar,
        vtString: `{ ${Array.from(VT).join(', ')} }`,
        etString: ET.length > 0 ? `{ ${ET.map((e) => e.from + e.to).join(', ')} }` : '∅',
        cutEdges: availableCutEdges,
        relaxLines,
        currentWeight: runningWeight,
        queueText: formatQueue(),
      });

      iterCount++;

      primRows.push({
        treeVertex: `${uStar}(${pStar}, ${wStar})`,
        queueText: formatQueue(),
        mstEdge: `${pStar}${uStar}`,
        edgeWeight: wStar,
      });
    }

    const totalWeight = ET.reduce((acc, e) => acc + e.weight, 0);

    const maxCardIdx = showAllExamSteps
      ? primCards.length
      : Math.min(primCards.length, Math.max(1, safeStepIdx + 1));

    const maxK = showAllExamSteps
      ? primRows.length
      : Math.min(primRows.length, Math.max(1, safeStepIdx + 1));

    return (
      <div className="space-y-6">
        {/* Top: Graph Visualizer + Reference Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {currentStep?.graphView && (
            <div className="lg:col-span-7">
              {renderGraphVisualizer(currentStep.graphView, !isDarkSheet)}
            </div>
          )}
          <div className={currentStep?.graphView ? 'lg:col-span-5' : 'lg:col-span-12'}>
            {renderExamReferenceBox(isDarkSheet)}
          </div>
        </div>

        {/* Doctor's Step-by-Step Iteration Cards (Red-Bordered Exam Format) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className={`font-serif text-sm sm:text-base font-bold italic ${isDarkSheet ? 'text-white' : 'text-black'}`}>
              Prim's Step-by-Step Iteration Cards (Doctor's Exam Trace Format):
            </div>
            <div className={`text-xs font-mono font-medium ${isDarkSheet ? 'text-slate-400' : 'text-slate-600'}`}>
              Showing {maxCardIdx} of {primCards.length} Cards
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {primCards.slice(0, maxCardIdx).map((card, cIdx) => {
              const isLatest = cIdx === maxCardIdx - 1 && !showAllExamSteps;
              return (
                <div
                  key={cIdx}
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStepIdx(Math.min(steps.length - 1, cIdx));
                  }}
                  className={`cursor-pointer rounded-lg border-2 border-red-600 ${
                    isDarkSheet ? 'bg-slate-900/90 text-slate-100' : 'bg-white text-black'
                  } p-4 font-mono text-xs sm:text-sm shadow-sm transition hover:shadow-md ${
                    isLatest
                      ? isDarkSheet
                        ? 'ring-2 ring-red-500 ring-offset-2 ring-offset-slate-950'
                        : 'ring-2 ring-red-500 ring-offset-2 ring-offset-white'
                      : ''
                  }`}
                >
                  {/* Card Header */}
                  <div className={`border-b ${isDarkSheet ? 'border-red-900/60' : 'border-red-200'} pb-1.5 mb-2.5 flex items-center justify-between`}>
                    <span className={`font-bold font-sans tracking-wide text-sm sm:text-base ${isDarkSheet ? 'text-rose-400' : 'text-[#dc2626]'}`}>
                      {card.title}
                    </span>
                    {isLatest && !showAllExamSteps && (
                      <span className={`${isDarkSheet ? 'bg-red-950/90 text-rose-300 border border-rose-800/60' : 'bg-red-100 text-red-800 border border-red-300'} px-2 py-0.5 rounded text-[11px] font-bold`}>
                        Active Step
                      </span>
                    )}
                  </div>

                  {/* Card Body */}
                  {card.isInit ? (
                    <div className="space-y-1.5 leading-relaxed">
                      <div>
                        <span className={`font-bold ${isDarkSheet ? 'text-slate-200' : 'text-slate-900'}`}>Initial Tree Vertex: </span>
                        <span className={`font-extrabold ${isDarkSheet ? 'text-rose-400' : 'text-[#dc2626]'}`}>{startNode} (key({startNode}) = 0)</span>
                      </div>
                      <div>
                        <span className={`font-bold ${isDarkSheet ? 'text-slate-200' : 'text-slate-900'}`}>Tree Vertices: </span>
                        <span className={`font-bold ${isDarkSheet ? 'text-slate-100' : 'text-slate-950'}`}>V_T = {card.vtString}</span>
                      </div>
                      <div>
                        <span className={`font-bold ${isDarkSheet ? 'text-slate-200' : 'text-slate-900'}`}>Tree Edges: </span>
                        <span className={`font-bold ${isDarkSheet ? 'text-slate-100' : 'text-slate-950'}`}>E_T = {card.etString}</span>
                      </div>
                      <div>
                        <span className={`font-bold ${isDarkSheet ? 'text-slate-200' : 'text-slate-900'}`}>Initial Incident Fringe Edges:</span>
                        <div className="pl-3 sm:pl-4 space-y-0.5 mt-0.5">
                          {card.cutEdges.map((cEdge, ceIdx) => (
                            <div key={ceIdx} className={isDarkSheet ? 'text-slate-200 font-medium' : 'text-slate-900 font-semibold'}>
                              {cEdge}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="pt-1">
                        <span className={`font-bold ${isDarkSheet ? 'text-slate-200' : 'text-slate-900'}`}>Priority Queue: </span>
                        <span className={`font-semibold ${isDarkSheet ? 'text-rose-400' : 'text-[#dc2626]'}`}>{card.queueText}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5 leading-relaxed">
                      <div>
                        <span className={`font-bold ${isDarkSheet ? 'text-slate-200' : 'text-slate-900'}`}>Candidate Cut Edges Crossing V_T to (V - V_T):</span>
                        <div className={`pl-3 sm:pl-4 space-y-0.5 mt-0.5 text-xs ${isDarkSheet ? 'text-slate-300 font-medium' : 'text-slate-800 font-semibold'}`}>
                          {card.cutEdges.map((cEdge, ceIdx) => (
                            <div key={ceIdx}>{cEdge}</div>
                          ))}
                        </div>
                      </div>
                      <div className="pt-1">
                        <span className={`font-bold ${isDarkSheet ? 'text-slate-200' : 'text-slate-900'}`}>Select minimum-weight cut edge: </span>
                        <span className={`font-extrabold ${isDarkSheet ? 'text-rose-400' : 'text-[#dc2626]'}`}>
                          e* = ({card.pStar}, {card.uStar}) (w* = {card.wStar})
                        </span>
                      </div>
                      <div>
                        <span className={`font-bold ${isDarkSheet ? 'text-slate-200' : 'text-slate-900'}`}>Update Tree Vertices: </span>
                        <span className={`font-bold ${isDarkSheet ? 'text-slate-100' : 'text-slate-950'}`}>V_T = {card.vtString}</span>
                      </div>
                      <div>
                        <span className={`font-bold ${isDarkSheet ? 'text-slate-200' : 'text-slate-900'}`}>Update Tree Edges: </span>
                        <span className={`font-extrabold ${isDarkSheet ? 'text-rose-400' : 'text-[#dc2626]'}`}>E_T = {card.etString}</span>
                      </div>
                      <div>
                        <span className={`font-bold ${isDarkSheet ? 'text-slate-200' : 'text-slate-900'}`}>Relax / Update priority queue for fringe vertices:</span>
                        <div className="pl-3 sm:pl-4 space-y-0.5 mt-0.5">
                          {card.relaxLines.map((rLine, rIdx) => (
                            <div key={rIdx} className={isDarkSheet ? 'text-slate-200 font-medium' : 'text-slate-900 font-semibold'}>
                              {rLine}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className={`pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-dashed ${isDarkSheet ? 'border-red-900/40' : 'border-red-200'} pt-1.5`}>
                        <div>
                          <span className={`font-bold ${isDarkSheet ? 'text-slate-200' : 'text-slate-900'}`}>Priority Queue: </span>
                          <span className={isDarkSheet ? 'text-slate-100 font-bold' : 'text-slate-950 font-bold'}>{card.queueText}</span>
                        </div>
                        <div>
                          <span className={`font-bold ${isDarkSheet ? 'text-slate-200' : 'text-slate-900'}`}>Current MST Weight: </span>
                          <span className={`font-extrabold ${isDarkSheet ? 'text-rose-400' : 'text-[#dc2626]'}`}>{card.currentWeight}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Doctor's 2-Column Prim Table (Tree Vertices | Priority Queue of Remaining Vertices) */}
        <div className="space-y-2">
          <div className={`font-serif text-sm sm:text-base font-bold italic ${isDarkSheet ? 'text-white' : 'text-black'}`}>
            Prim's Algorithm Execution Table (Official KAU Exam Solution Format):
          </div>

          <div className="overflow-x-auto">
            <table className={`w-full border-collapse border-2 ${isDarkSheet ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-black bg-white text-black'} font-sans text-xs sm:text-sm`}>
              <thead>
                <tr className={isDarkSheet ? 'bg-slate-950 text-slate-200 border-b border-slate-700' : 'bg-black text-white'}>
                  <th className="border border-slate-500 px-4 py-2 text-left font-bold w-1/3">
                    Tree Vertices
                  </th>
                  <th className="border border-slate-500 px-4 py-2 text-left font-bold w-2/3">
                    Priority Queue of Remaining Vertices
                  </th>
                </tr>
              </thead>
              <tbody>
                {primRows.slice(0, maxK).map((row, rIdx) => {
                  const isLatest = rIdx === maxK - 1 && !showAllExamSteps;
                  return (
                    <tr
                      key={rIdx}
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentStepIdx(Math.min(steps.length - 1, rIdx));
                      }}
                      className={`cursor-pointer transition ${
                        isLatest
                          ? isDarkSheet
                            ? 'bg-rose-950/40 ring-1 ring-inset ring-rose-500'
                            : 'bg-red-50/80 ring-1 ring-inset ring-red-400'
                          : isDarkSheet
                          ? 'hover:bg-slate-800'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className={`border ${isDarkSheet ? 'border-slate-700 text-rose-400' : 'border-black text-[#dc2626]'} px-4 py-2 font-mono font-bold whitespace-nowrap`}>
                        {row.treeVertex}
                      </td>
                      <td className={`border ${isDarkSheet ? 'border-slate-700 text-slate-200' : 'border-black text-black'} px-4 py-2 font-mono text-xs sm:text-sm`}>
                        {row.queueText}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Part (b) MST Edges & Total Weight */}
        {(maxK >= primRows.length || safeStepIdx >= steps.length - 1 || showAllExamSteps) && (
          <div className={`border-t-2 ${isDarkSheet ? 'border-slate-700 text-slate-100' : 'border-slate-300 text-black'} pt-4 space-y-2 font-serif text-sm sm:text-base`}>
            <div>
              <span className="font-bold">Minimum Spanning Tree Edges: </span>
              <span className={`font-mono font-extrabold ${isDarkSheet ? 'text-rose-400' : 'text-[#dc2626]'} text-base`}>
                {ET.map((e) => `${e.from}${e.to}`).join(', ')}
              </span>
            </div>
            <div>
              <span className="font-bold">Total Minimum Spanning Tree Weight: </span>
              <span className={`font-mono font-extrabold ${isDarkSheet ? 'text-rose-400' : 'text-[#dc2626]'} text-lg`}>
                {ET.length > 0 ? `${ET.map((e) => e.weight).join(' + ')} = ` : ''}{totalWeight}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==========================================================================
  // DIJKSTRA OFFICIAL EXAM SOLUTION RENDERER (Winter 2023 & Spring 2021 Final Format + Doctor's Step Cards)
  // ==========================================================================
  const renderDijkstraExamPaperSolution = () => {
    const rawEdgesStr =
      givenInputSource.edges ||
      customInputs.edges ||
      's-t:10, s-y:5, t-y:2, t-x:1, y-x:9, y-z:2, z-x:6, z-s:7';
    const rawSourceStr = givenInputSource.source || customInputs.source || 's';
    const isDirected =
      (givenInputSource.directed || customInputs.directed || 'false').trim().toLowerCase() ===
      'true';
    const { nodes, edges } = parseEdgesInput(rawEdgesStr);
    const source = nodes.includes(rawSourceStr.trim()) ? rawSourceStr.trim() : nodes[0];

    interface DijkstraRow {
      vtText: string;
      queueText: string;
    }

    interface DijkstraStepCard {
      title: string;
      isInit: boolean;
      uStar?: string;
      distUStar?: number;
      vtString: string;
      relaxLines: string[];
      currentDistancesString: string;
      predecessorsString?: string;
      tentativeDistancesString?: string;
    }

    const dijkstraRows: DijkstraRow[] = [];
    const stepCards: DijkstraStepCard[] = [];
    const VT = new Set<string>();
    const dist: Record<string, number> = {};
    const parent: Record<string, string | null> = {};

    nodes.forEach((v) => {
      dist[v] = Infinity;
      parent[v] = null;
    });

    const formatQueue = () => {
      const rem = nodes.filter((v) => !VT.has(v));
      if (rem.length === 0) return 'Empty';
      return rem
        .map((v) => {
          const p = parent[v] ?? '-';
          const d = dist[v] === Infinity ? '∞' : dist[v];
          return `${v}(${p}, ${d})`;
        })
        .join(', ');
    };

    const formatCurrentDistances = () => {
      const sorted = [...nodes].sort((a, b) => {
        const da = dist[a];
        const db = dist[b];
        if (da !== db) return da - db;
        return a.localeCompare(b);
      });
      return sorted
        .map((v) => `d(${v}) = ${dist[v] === Infinity ? '∞' : dist[v]}`)
        .join(', ');
    };

    // Table Initial Row
    dijkstraRows.push({
      vtText: '—',
      queueText: formatQueue(),
    });

    dist[source] = 0;

    // Doctor's Card: Initialization (Image 1 Exact Match)
    const initNodeOrder = [source, ...nodes.filter((v) => v !== source)];
    stepCards.push({
      title: 'Initialization',
      isInit: true,
      vtString: '∅',
      tentativeDistancesString: initNodeOrder
        .map((v) => `d(${v}) = ${dist[v] === Infinity ? '∞' : dist[v]}`)
        .join(', '),
      predecessorsString: initNodeOrder.map((v) => `p(${v}) = -`).join(', '),
      relaxLines: [],
      currentDistancesString: formatCurrentDistances(),
    });

    dijkstraRows.push({
      vtText: '{ }',
      queueText: formatQueue(),
    });

    let iterCount = 1;
    while (VT.size < nodes.length) {
      const remaining = nodes.filter((v) => !VT.has(v));
      remaining.sort((a, b) => dist[a] - dist[b] || a.localeCompare(b));
      const uStar = remaining[0];
      if (!uStar || dist[uStar] === Infinity) break;

      VT.add(uStar);

      const relaxLines: string[] = [];

      // Find outgoing edges from uStar
      const outgoingEdges = edges.filter((e) =>
        isDirected ? e.u === uStar : e.u === uStar || e.v === uStar
      );
      outgoingEdges.sort((e1, e2) => {
        const t1 = e1.u === uStar ? e1.v : e1.u;
        const t2 = e2.u === uStar ? e2.v : e2.u;
        return t1.localeCompare(t2);
      });

      for (const e of outgoingEdges) {
        const neighbor = e.u === uStar ? e.v : e.u;
        const oldDist = dist[neighbor];
        const oldDistStr = oldDist === Infinity ? '∞' : String(oldDist);
        const candidateDist = dist[uStar] + e.w;

        if (candidateDist < oldDist) {
          dist[neighbor] = candidateDist;
          parent[neighbor] = uStar;
          relaxLines.push(
            `• ${uStar} → ${neighbor}(${e.w}): d(${neighbor}) = min(${oldDistStr}, ${dist[uStar]} + ${e.w}) = ${candidateDist}, p(${neighbor}) = ${uStar}`
          );
        } else {
          relaxLines.push(
            `• ${uStar} → ${neighbor}(${e.w}): d(${neighbor}) = min(${oldDistStr}, ${dist[uStar]} + ${e.w}) = ${oldDistStr} (no change)`
          );
        }
      }

      if (relaxLines.length === 0) {
        relaxLines.push(`• No outgoing edges from ${uStar} to relax.`);
      }

      stepCards.push({
        title: `Iteration ${iterCount < 10 ? '0' + iterCount : iterCount}`,
        isInit: false,
        uStar,
        distUStar: dist[uStar],
        vtString: `{ ${Array.from(VT).join(', ')} }`,
        relaxLines,
        currentDistancesString: formatCurrentDistances(),
      });

      iterCount++;

      dijkstraRows.push({
        vtText: `{ ${Array.from(VT).join(', ')} }`,
        queueText: formatQueue(),
      });
    }

    const paths: { dest: string; path: string; distance: number }[] = [];
    nodes
      .filter((v) => v !== source)
      .forEach((dest) => {
        if (dist[dest] < Infinity) {
          const seq: string[] = [];
          let curr: string | null = dest;
          while (curr) {
            seq.push(curr);
            curr = parent[curr];
          }
          seq.reverse();
          paths.push({
            dest,
            path: seq.join(' → '),
            distance: dist[dest],
          });
        }
      });

    const maxCardIdx = showAllExamSteps
      ? stepCards.length
      : Math.min(stepCards.length, Math.max(1, safeStepIdx + 1));

    const maxK = showAllExamSteps
      ? dijkstraRows.length
      : Math.min(dijkstraRows.length, Math.max(1, safeStepIdx + 1));

    return (
      <div className="space-y-6">
        {/* Top: Graph Visualizer + ALGORITHM Dijkstra(G, s) Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {currentStep?.graphView && (
            <div className="lg:col-span-7">
              {renderGraphVisualizer(currentStep.graphView, !isDarkSheet)}
            </div>
          )}
          <div className={currentStep?.graphView ? 'lg:col-span-5' : 'lg:col-span-12'}>
            {renderExamReferenceBox(isDarkSheet)}
          </div>
        </div>

        {/* Doctor's Step-by-Step Iteration Cards (Image 1 Exact KAU Format) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className={`font-serif text-sm sm:text-base font-bold italic ${isDarkSheet ? 'text-white' : 'text-black'}`}>
              Dijkstra's Step-by-Step Iteration Cards (Official Doctor's Solution Format):
            </div>
            <div className={`text-xs font-mono font-medium ${isDarkSheet ? 'text-slate-400' : 'text-slate-600'}`}>
              Showing {maxCardIdx} of {stepCards.length} Cards
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {stepCards.slice(0, maxCardIdx).map((card, cIdx) => {
              const isLatest = cIdx === maxCardIdx - 1 && !showAllExamSteps;
              return (
                <div
                  key={cIdx}
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStepIdx(Math.min(steps.length - 1, cIdx));
                  }}
                  className={`cursor-pointer rounded-lg border-2 border-red-600 ${
                    isDarkSheet ? 'bg-slate-900/90 text-slate-100' : 'bg-white text-black'
                  } p-4 font-mono text-xs sm:text-sm shadow-sm transition hover:shadow-md ${
                    isLatest
                      ? isDarkSheet
                        ? 'ring-2 ring-red-500 ring-offset-2 ring-offset-slate-950'
                        : 'ring-2 ring-red-500 ring-offset-2 ring-offset-white'
                      : ''
                  }`}
                >
                  {/* Card Header */}
                  <div className={`border-b ${isDarkSheet ? 'border-red-900/60' : 'border-red-200'} pb-1.5 mb-2.5 flex items-center justify-between`}>
                    <span className={`font-bold font-sans tracking-wide text-sm sm:text-base ${isDarkSheet ? 'text-rose-400' : 'text-[#dc2626]'}`}>
                      {card.title}
                    </span>
                    {isLatest && !showAllExamSteps && (
                      <span className={`${isDarkSheet ? 'bg-red-950/90 text-rose-300 border border-rose-800/60' : 'bg-red-100 text-red-800 border border-red-300'} px-2 py-0.5 rounded text-[11px] font-bold`}>
                        Active Step
                      </span>
                    )}
                  </div>

                  {/* Card Body */}
                  {card.isInit ? (
                    <div className="space-y-1.5 leading-relaxed">
                      <div>
                        <span className={`font-bold ${isDarkSheet ? 'text-slate-200' : 'text-slate-900'}`}>Set tentative distances: </span>
                        <span className={`font-extrabold ${isDarkSheet ? 'text-rose-400' : 'text-[#dc2626]'}`}>{card.tentativeDistancesString}</span>
                      </div>
                      <div>
                        <span className={`font-bold ${isDarkSheet ? 'text-slate-200' : 'text-slate-900'}`}>Predecessors: </span>
                        <span className={isDarkSheet ? 'text-slate-100 font-medium' : 'text-slate-950 font-semibold'}>{card.predecessorsString}</span>
                      </div>
                      <div>
                        <span className={`font-bold ${isDarkSheet ? 'text-slate-200' : 'text-slate-900'}`}>Visited set (permanently labeled): </span>
                        <span className={`font-bold ${isDarkSheet ? 'text-slate-100' : 'text-slate-950'}`}>{card.vtString}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5 leading-relaxed">
                      <div>
                        <span className={`font-bold ${isDarkSheet ? 'text-slate-200' : 'text-slate-900'}`}>Select unvisited vertex with minimum tentative distance: </span>
                        <span className={`font-extrabold ${isDarkSheet ? 'text-rose-400' : 'text-[#dc2626]'}`}>
                          {card.uStar} (d({card.uStar}) = {card.distUStar}).
                        </span>
                      </div>
                      <div>
                        <span className={`font-bold ${isDarkSheet ? 'text-slate-200' : 'text-slate-900'}`}>Update </span>
                        <span className={`font-bold ${isDarkSheet ? 'text-slate-100' : 'text-slate-950'}`}>V_T = {card.vtString}.</span>
                      </div>
                      <div>
                        <span className={`font-bold ${isDarkSheet ? 'text-slate-200' : 'text-slate-900'}`}>Relax outgoing edges from {card.uStar}:</span>
                        <div className="pl-3 sm:pl-4 space-y-0.5 mt-0.5">
                          {card.relaxLines.map((rLine, rIdx) => (
                            <div key={rIdx} className={isDarkSheet ? 'text-slate-200 font-medium' : 'text-slate-900 font-semibold'}>
                              {rLine}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="pt-1">
                        <span className={`font-bold ${isDarkSheet ? 'text-slate-200' : 'text-slate-900'}`}>Current distances: </span>
                        <span className={`font-extrabold ${isDarkSheet ? 'text-rose-400' : 'text-[#dc2626]'}`}>{card.currentDistancesString}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Doctor's 2-Column Dijkstra Table (VT | Q) */}
        <div className="space-y-2">
          <div className={`font-serif text-sm sm:text-base font-bold italic ${isDarkSheet ? 'text-white' : 'text-black'}`}>
            Dijkstra's Algorithm Priority Queue Trace (Winter 2023 &amp; Spring 2021 Exam Format):
          </div>

          <div className="overflow-x-auto">
            <table className={`w-full border-collapse border-2 ${isDarkSheet ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-black bg-white text-black'} font-sans text-xs sm:text-sm`}>
              <thead>
                <tr className={isDarkSheet ? 'bg-slate-950 text-slate-200 border-b border-slate-700' : 'bg-black text-white'}>
                  <th className="border border-slate-500 px-4 py-2 text-left font-bold w-1/3">
                    VT
                  </th>
                  <th className="border border-slate-500 px-4 py-2 text-left font-bold w-2/3">
                    Q
                  </th>
                </tr>
              </thead>
              <tbody>
                {dijkstraRows.slice(0, maxK).map((row, rIdx) => {
                  const isLatest = rIdx === maxK - 1 && !showAllExamSteps;
                  return (
                    <tr
                      key={rIdx}
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentStepIdx(Math.min(steps.length - 1, rIdx));
                      }}
                      className={`cursor-pointer transition ${
                        isLatest
                          ? isDarkSheet
                            ? 'bg-rose-950/40 ring-1 ring-inset ring-rose-500'
                            : 'bg-red-50/80 ring-1 ring-inset ring-red-400'
                          : isDarkSheet
                          ? 'hover:bg-slate-800'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className={`border ${isDarkSheet ? 'border-slate-700 text-rose-400' : 'border-black text-[#dc2626]'} px-4 py-2 font-mono font-bold whitespace-nowrap`}>
                        {row.vtText}
                      </td>
                      <td className={`border ${isDarkSheet ? 'border-slate-700 text-slate-200' : 'border-black text-black'} px-4 py-2 font-mono text-xs sm:text-sm`}>
                        {row.queueText}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Part (b) Final Shortest Paths Table (Exact Match to Winter 2023 Q3) */}
        {(maxK >= dijkstraRows.length || safeStepIdx >= steps.length - 1 || showAllExamSteps) && (
          <div className={`border-t-2 ${isDarkSheet ? 'border-slate-700 text-slate-100' : 'border-slate-300 text-black'} pt-4 space-y-2 font-serif text-sm sm:text-base`}>
            <div className="font-bold italic">Shortest Paths and Distances from Source '{source}':</div>
            <div className="overflow-x-auto">
              <table className={`border-collapse border-2 ${isDarkSheet ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-black bg-white text-black'} font-sans text-xs sm:text-sm`}>
                <thead>
                  <tr className={isDarkSheet ? 'bg-slate-950 text-slate-200' : 'bg-black text-white'}>
                    <th className="border border-slate-500 px-4 py-1.5 font-bold">Destination</th>
                    <th className="border border-slate-500 px-5 py-1.5 font-bold">Path</th>
                    <th className="border border-slate-500 px-4 py-1.5 font-bold">Distance</th>
                  </tr>
                </thead>
                <tbody>
                  {paths.map((p, idx) => (
                    <tr key={idx}>
                      <td className={`border ${isDarkSheet ? 'border-slate-700' : 'border-black'} px-4 py-1.5 font-bold text-center`}>
                        {p.dest}
                      </td>
                      <td className={`border ${isDarkSheet ? 'border-slate-700 text-rose-400' : 'border-black text-[#dc2626]'} px-5 py-1.5 font-mono font-extrabold`}>
                        {p.path}
                      </td>
                      <td className={`border ${isDarkSheet ? 'border-slate-700 text-rose-400' : 'border-black text-[#dc2626]'} px-4 py-1.5 font-mono font-extrabold text-center`}>
                        {p.distance}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==========================================================================
  // 0/1 KNAPSACK OFFICIAL EXAM SOLUTION RENDERER (Winter 2023 Final Q2 & Makeup Format)
  // ==========================================================================
  const renderKnapsackExamPaperSolution = () => {
    const rawCapacity = parseInt(givenInputSource.capacity || customInputs.capacity || '5', 10) || 5;
    const rawWeights = (givenInputSource.weights || customInputs.weights || '3, 2, 1, 4')
      .split(/[,;\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((v) => !Number.isNaN(v) && v > 0);
    const rawValues = (givenInputSource.values || customInputs.values || '25, 20, 15, 40')
      .split(/[,;\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((v) => !Number.isNaN(v));

    const n = Math.min(rawWeights.length, rawValues.length);
    const W = Math.min(30, Math.max(1, rawCapacity));
    const weights = rawWeights.slice(0, n);
    const values = rawValues.slice(0, n);

    const F: number[][] = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));
    const Keep: number[][] = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));

    for (let i = 1; i <= n; i++) {
      const w_i = weights[i - 1];
      const v_i = values[i - 1];
      for (let j = 1; j <= W; j++) {
        if (j < w_i) {
          F[i][j] = F[i - 1][j];
          Keep[i][j] = 0;
        } else {
          const withItem = v_i + F[i - 1][j - w_i];
          const withoutItem = F[i - 1][j];
          if (withItem > withoutItem) {
            F[i][j] = withItem;
            Keep[i][j] = 1;
          } else {
            F[i][j] = withoutItem;
            Keep[i][j] = 0;
          }
        }
      }
    }

    const selectedItems: { index: number; weight: number; value: number }[] = [];
    let remCap = W;
    for (let i = n; i >= 1; i--) {
      if (Keep[i][remCap] === 1) {
        selectedItems.push({ index: i, weight: weights[i - 1], value: values[i - 1] });
        remCap -= weights[i - 1];
      }
    }
    selectedItems.reverse();
    const totalVal = F[n][W];

    const maxI = showAllExamSteps ? n : Math.min(n, Math.max(0, safeStepIdx));

    return (
      <div className="space-y-6">
        {/* Top: Given Items Table + DP Recurrence Formula ONLY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-6 space-y-3">
            <div className={`font-serif text-xs font-bold ${isDarkSheet ? 'text-slate-300' : 'text-slate-700'}`}>
              Given Items (Values &amp; Weights): Capacity W = {W}
            </div>
            <table className={`w-full border-collapse border-2 ${isDarkSheet ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-black bg-white text-black'} font-sans text-xs text-center`}>
              <thead>
                <tr className={isDarkSheet ? 'bg-slate-950 text-slate-200' : 'bg-black text-white'}>
                  <th className="border border-slate-500 px-3 py-1 font-bold">i</th>
                  {Array.from({ length: n }, (_, idx) => (
                    <th key={idx} className="border border-slate-500 px-3 py-1 font-bold">
                      {idx + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={`border ${isDarkSheet ? 'border-slate-700' : 'border-black'} px-3 py-1 font-bold`}>
                    vᵢ
                  </td>
                  {values.map((v, idx) => (
                    <td key={idx} className={`border ${isDarkSheet ? 'border-slate-700' : 'border-black'} px-3 py-1 font-mono font-bold`}>
                      {v}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className={`border ${isDarkSheet ? 'border-slate-700' : 'border-black'} px-3 py-1 font-bold`}>
                    wᵢ
                  </td>
                  {weights.map((w, idx) => (
                    <td key={idx} className={`border ${isDarkSheet ? 'border-slate-700' : 'border-black'} px-3 py-1 font-mono font-bold`}>
                      {w}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="lg:col-span-6">
            {renderExamReferenceBox(isDarkSheet)}
          </div>
        </div>

        {/* Table F (Exact Fall 2025 / Winter 2023 Format: Item/Weight 0..W) */}
        <div className="space-y-2">
          <div className={`font-serif text-sm sm:text-base font-bold italic ${isDarkSheet ? 'text-white' : 'text-black'}`}>
            F (DP Table Filled Step-by-Step):
          </div>

          <div className="overflow-x-auto">
            <table className={`mx-auto border-collapse border-2 ${isDarkSheet ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-black bg-white text-black'} font-sans text-xs sm:text-sm text-center`}>
              <thead>
                <tr className={isDarkSheet ? 'bg-slate-950 text-slate-200' : 'bg-black text-white'}>
                  <th className="border border-slate-500 px-3.5 py-1.5 font-bold whitespace-nowrap">
                    Item / Weight
                  </th>
                  {Array.from({ length: W + 1 }, (_, col) => (
                    <th key={col} className="min-w-[40px] border border-slate-500 px-3 py-1.5 font-bold">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: n + 1 }, (_, rIdx) => {
                  const isRevealed = rIdx <= maxI;
                  const isLatestRow = rIdx === maxI && !showAllExamSteps;
                  return (
                    <tr
                      key={rIdx}
                      className={
                        isLatestRow
                          ? isDarkSheet
                            ? 'bg-rose-950/40 ring-1 ring-inset ring-rose-500'
                            : 'bg-red-50/80 ring-1 ring-inset ring-red-400'
                          : ''
                      }
                    >
                      <td className={`border ${isDarkSheet ? 'border-slate-700' : 'border-black'} px-3.5 py-1.5 font-bold`}>
                        {rIdx}
                      </td>
                      {Array.from({ length: W + 1 }, (_, cIdx) => (
                        <td
                          key={cIdx}
                          className={`border ${isDarkSheet ? 'border-slate-700' : 'border-black'} px-3 py-1.5 font-extrabold ${
                            isRevealed
                              ? rIdx > 0
                                ? isDarkSheet
                                  ? 'text-rose-400'
                                  : 'text-[#dc2626]'
                                : isDarkSheet
                                ? 'text-slate-300'
                                : 'text-black'
                              : 'text-transparent'
                          }`}
                        >
                          {isRevealed ? F[rIdx][cIdx] : ''}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Keep Table (Exact Winter 2023 Final Q2 & MakeUp Q2 Format!) */}
        <div className="space-y-2">
          <div className={`font-serif text-sm sm:text-base font-bold italic ${isDarkSheet ? 'text-white' : 'text-black'}`}>
            Keep (Backtracking Decisions 1..W):
          </div>

          <div className="overflow-x-auto">
            <table className={`mx-auto border-collapse border-2 ${isDarkSheet ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-black bg-white text-black'} font-sans text-xs sm:text-sm text-center`}>
              <thead>
                <tr className={isDarkSheet ? 'bg-slate-950 text-slate-200' : 'bg-black text-white'}>
                  <th className="border border-slate-500 px-3.5 py-1.5 font-bold">i</th>
                  {Array.from({ length: W }, (_, col) => (
                    <th key={col} className="min-w-[40px] border border-slate-500 px-3 py-1.5 font-bold">
                      {col + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: n }, (_, rIdx) => {
                  const itemNum = rIdx + 1;
                  const isRevealed = itemNum <= maxI;
                  return (
                    <tr key={itemNum}>
                      <td className={`border ${isDarkSheet ? 'border-slate-700' : 'border-black'} px-3.5 py-1.5 font-bold`}>
                        {itemNum}
                      </td>
                      {Array.from({ length: W }, (_, cIdx) => {
                        const capVal = cIdx + 1;
                        const isChosen = Keep[itemNum][capVal] === 1;
                        return (
                          <td
                            key={capVal}
                            className={`border ${isDarkSheet ? 'border-slate-700' : 'border-black'} px-3 py-1.5 font-extrabold ${
                              isRevealed
                                ? isChosen
                                  ? isDarkSheet
                                    ? 'text-rose-400 bg-rose-950/30'
                                    : 'text-[#dc2626] bg-red-100/60'
                                  : isDarkSheet
                                  ? 'text-slate-400'
                                  : 'text-slate-600'
                                : 'text-transparent'
                            }`}
                          >
                            {isRevealed ? Keep[itemNum][capVal] : ''}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Part (b) Maximum Value & Selected Items */}
        {(maxI >= n || safeStepIdx >= steps.length - 1 || showAllExamSteps) && (
          <div className={`border-t-2 ${isDarkSheet ? 'border-slate-700 text-slate-100' : 'border-slate-300 text-black'} pt-4 space-y-2 font-serif text-sm sm:text-base`}>
            <div>
              <span className="font-bold">Maximum Knapsack Value F[{n}, {W}]: </span>
              <span className={`font-mono font-extrabold ${isDarkSheet ? 'text-rose-400' : 'text-[#dc2626]'} text-lg`}>
                {totalVal}
              </span>
            </div>
            <div>
              <span className="font-bold">Selected Items: </span>
              <span className={`font-mono font-extrabold ${isDarkSheet ? 'text-rose-400' : 'text-[#dc2626]'} text-base`}>
                {selectedItems.map((it) => `Item ${it.index} (w = ${it.weight}, v = ${it.value})`).join(' + ')}
              </span>
              <span className="ml-2 font-mono text-xs opacity-80">
                (Total Weight: {selectedItems.reduce((acc, it) => acc + it.weight, 0)} ≤ {W})
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==========================================================================
  // DISTRIBUTION COUNTING SORT OFFICIAL EXAM SOLUTION
  // Dual Variant: Version 1 CLRS (Winter 2023 Q1) & Version 2 Levitin (Fall 2025 Q1)
  // Two-Page Real Exam Paper Layout (Full Width Tables, No Side-by-Side Squeezing)
  // ==========================================================================
  const renderDistributionCountingExamPaperSolution = () => {
    const isV1 = algorithm.id === 'distribution-counting-sort-v1';
    const rawArrStr =
      givenInputSource.array ||
      customInputs.array ||
      (isV1
        ? '7, 3, 6, 7, 7, 3, 2, 5, 1, 5, 9, 3, 1, 4, 5'
        : 'b, c, d, c, b, a, a, b');
    const rawTokens = rawArrStr.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
    const isNum = rawTokens.every((x) => !isNaN(Number(x)));
    const arr: (string | number)[] = isNum ? rawTokens.map(Number) : rawTokens;
    const n = arr.length;

    if (isV1) {
      // ----------------------------------------------------------------------
      // VERSION 1: CLRS / Winter 2023 MidTerm Q1 & Slide 25-26
      // Exact Match to Dr. Muhammad Umair's 3-Table Stacked 2-Page Exam Solution
      // ----------------------------------------------------------------------
      const nums = arr.map((x) => (typeof x === 'number' ? x : parseInt(String(x), 10) || 0));
      const k = Math.max(...nums, 0);
      const domain = Array.from({ length: k + 1 }, (_, idx) => idx);

      const freqC = new Array<number>(k + 1).fill(0);
      nums.forEach((val) => {
        if (val >= 0 && val <= k) freqC[val]++;
      });

      const cumC = new Array<number>(k + 1).fill(0);
      cumC[0] = freqC[0];
      for (let idx = 1; idx <= k; idx++) {
        cumC[idx] = cumC[idx - 1] + freqC[idx];
      }

      interface V1StepItem {
        stepNum: number;
        j: number; // 1-based index in A
        val: number;
        targetB: number; // 1-based index in B
        newCVal: number;
        cWorkSnapshot: number[];
        bCumulativeSnapshot: (number | string)[];
      }

      const v1Steps: V1StepItem[] = [];
      const cWork = [...cumC];
      const bCumulative = new Array<number | string>(n).fill('');

      for (let j = n; j >= 1; j--) {
        const val = nums[j - 1];
        const targetB = cWork[val]; // 1-based destination in B
        cWork[val]--;
        const newCVal = cWork[val];
        bCumulative[targetB - 1] = val;

        v1Steps.push({
          stepNum: n - j + 1,
          j,
          val,
          targetB,
          newCVal,
          cWorkSnapshot: [...cWork],
          bCumulativeSnapshot: [...bCumulative],
        });
      }

      // Step indexing:
      // safeStepIdx === 0: Initial C[0..k] = 0
      // safeStepIdx === 1: Frequency C (Counts)
      // safeStepIdx === 2: Cumulative C (C[i] = C[i] + C[i-1])
      // safeStepIdx >= 3: Placement steps (1 to n)
      const revealedPlacements = showAllExamSteps
        ? n
        : safeStepIdx >= 3
          ? Math.min(n, safeStepIdx - 2)
          : 0;

      return (
        <div className="space-y-8">
          {/* ================================================================ */}
          {/* PAGE 1: ALGORITHM REFERENCE + TABLE A + TABLE C                  */}
          {/* ================================================================ */}
          <div className="space-y-6">
            <div className={`flex items-center justify-between border-b-2 ${isDarkSheet ? 'border-slate-800' : 'border-slate-300'} pb-2`}>
              <span className={`font-serif text-xs font-bold uppercase tracking-wider ${isDarkSheet ? 'text-slate-400' : 'text-slate-600'}`}>
                📄 Examination Sheet — Page 1 of 2
              </span>
              <span className={`font-serif text-xs font-semibold ${isDarkSheet ? 'text-slate-500' : 'text-slate-500'}`}>
                Section 1: Frequency &amp; Cumulative Array C
              </span>
            </div>

            {/* Algorithm Reference Pseudocode (Full Width, Centered) */}
            <div className="mx-auto max-w-2xl">{renderExamReferenceBox(isDarkSheet)}</div>

            {/* Table A (Given Input Array A[1..n]) */}
            <div className="space-y-1.5">
              <div className={`font-serif text-sm font-bold italic ${isDarkSheet ? 'text-slate-100' : 'text-black'}`}>
                A
              </div>
              <div className="overflow-x-auto">
                <table className={`w-full border-collapse border-2 ${isDarkSheet ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-black bg-white text-black'} font-mono text-xs sm:text-sm text-center`}>
                  <thead>
                    <tr className={isDarkSheet ? 'bg-slate-950 text-slate-300' : 'bg-slate-100 text-slate-700'}>
                      <th className={`border ${isDarkSheet ? 'border-slate-700' : 'border-black'} px-3 py-1 font-bold text-left`}>
                        Index
                      </th>
                      {nums.map((_, idx) => (
                        <th key={idx} className={`min-w-[34px] border ${isDarkSheet ? 'border-slate-700' : 'border-black'} px-2.5 py-1 font-bold`}>
                          {idx + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className={`border ${isDarkSheet ? 'border-slate-700' : 'border-black'} px-3 py-1.5 font-bold text-left`}>
                        Values
                      </td>
                      {nums.map((v, idx) => (
                        <td key={idx} className={`border ${isDarkSheet ? 'border-slate-700' : 'border-black'} px-2.5 py-1.5 font-extrabold ${isDarkSheet ? 'text-amber-300' : 'text-slate-900'}`}>
                          {v}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table C (Exact 18-Row Structure from Dr. Muhammad Umair's Winter 2023 MidTerm Q1) */}
            <div className="space-y-1.5">
              <div className={`font-serif text-sm font-bold italic ${isDarkSheet ? 'text-slate-100' : 'text-black'}`}>
                C
              </div>
              <div className="overflow-x-auto">
                <table className={`w-full border-collapse border-2 ${isDarkSheet ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-black bg-white text-black'} font-mono text-xs sm:text-sm text-center`}>
                  <thead>
                    <tr className={isDarkSheet ? 'bg-slate-950 text-slate-200 border-b border-slate-700' : 'bg-black text-white'}>
                      <th className="border border-slate-500 px-3 py-1.5 text-left font-sans font-bold w-64">
                        Phase / Step Description
                      </th>
                      {domain.map((d) => (
                        <th key={d} className="min-w-[36px] border border-slate-500 px-2.5 py-1.5 font-bold">
                          {d}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Row 0: Initial zeros */}
                    <tr className={safeStepIdx === 0 && !showAllExamSteps ? (isDarkSheet ? 'bg-rose-950/40 ring-1 ring-rose-500' : 'bg-red-50/70 ring-1 ring-red-400') : ''}>
                      <td className={`border ${isDarkSheet ? 'border-slate-800 text-slate-300' : 'border-black text-slate-700'} px-3 py-1 text-left font-sans text-xs font-semibold`}>
                        1. Initial C[0..{k}] = 0
                      </td>
                      {domain.map((d) => (
                        <td key={d} className={`border ${isDarkSheet ? 'border-slate-800 text-slate-300' : 'border-black text-black'} px-2 py-1 font-bold`}>
                          0
                        </td>
                      ))}
                    </tr>

                    {/* Row 1: Frequency counts (visible if step >= 1 or showAll) */}
                    {(safeStepIdx >= 1 || showAllExamSteps) && (
                      <tr className={safeStepIdx === 1 && !showAllExamSteps ? (isDarkSheet ? 'bg-rose-950/40 ring-1 ring-rose-500' : 'bg-red-50/70 ring-1 ring-red-400') : ''}>
                        <td className={`border ${isDarkSheet ? 'border-slate-800 text-slate-300' : 'border-black text-slate-700'} px-3 py-1 text-left font-sans text-xs font-semibold`}>
                          2. Frequency C (Counts)
                        </td>
                        {domain.map((d) => (
                          <td key={d} className={`border ${isDarkSheet ? 'border-slate-800 text-rose-400' : 'border-black text-[#dc2626]'} px-2 py-1 font-extrabold`}>
                            {freqC[d]}
                          </td>
                        ))}
                      </tr>
                    )}

                    {/* Row 2: Cumulative counts (visible if step >= 2 or showAll) */}
                    {(safeStepIdx >= 2 || showAllExamSteps) && (
                      <tr className={safeStepIdx === 2 && !showAllExamSteps ? (isDarkSheet ? 'bg-rose-950/40 ring-1 ring-rose-500' : 'bg-red-50/70 ring-1 ring-red-400') : ''}>
                        <td className={`border ${isDarkSheet ? 'border-slate-800 text-slate-300' : 'border-black text-slate-700'} px-3 py-1 text-left font-sans text-xs font-semibold`}>
                          3. Cumulative C[i] = C[i] + C[i-1]
                        </td>
                        {domain.map((d) => (
                          <td key={d} className={`border ${isDarkSheet ? 'border-slate-800 text-rose-400' : 'border-black text-[#dc2626]'} px-2 py-1 font-extrabold`}>
                            {cumC[d]}
                          </td>
                        ))}
                      </tr>
                    )}

                    {/* Rows 4 to 18: Step-by-step decrements for j = n downto 1 */}
                    {v1Steps.slice(0, revealedPlacements).map((st, idx) => {
                      const isLatest = idx === revealedPlacements - 1 && !showAllExamSteps;
                      return (
                        <tr
                          key={idx}
                          onClick={() => {
                            setIsPlaying(false);
                            setCurrentStepIdx(3 + idx);
                          }}
                          className={`cursor-pointer transition ${
                            isLatest
                              ? isDarkSheet
                                ? 'bg-rose-950/40 ring-1 ring-rose-500'
                                : 'bg-red-50/70 ring-1 ring-red-400'
                              : isDarkSheet
                              ? 'hover:bg-slate-800'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className={`border ${isDarkSheet ? 'border-slate-800 text-slate-300' : 'border-black text-slate-700'} px-3 py-1 text-left font-sans text-xs`}>
                            <span className="font-bold">Step {st.stepNum}</span> (j = {st.j}, A[{st.j}] = {st.val}): C[{st.val}] ← {st.newCVal}
                          </td>
                          {domain.map((d) => {
                            const isUpdated = d === st.val;
                            return (
                              <td
                                key={d}
                                className={`border ${isDarkSheet ? 'border-slate-800' : 'border-black'} px-2 py-1 ${
                                  isUpdated
                                    ? isDarkSheet
                                      ? 'bg-rose-950/50 text-rose-300 font-extrabold'
                                      : 'bg-red-100/70 text-[#dc2626] font-extrabold'
                                    : 'text-transparent'
                                }`}
                              >
                                {isUpdated ? st.newCVal : ''}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* REALISTIC EXAM SHEET PAGE DIVIDER                                */}
          {/* ================================================================ */}
          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className={`w-full border-t-2 border-dashed ${isDarkSheet ? 'border-slate-700' : 'border-slate-400'}`} />
            </div>
            <div className="relative flex justify-center">
              <span className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs sm:text-sm font-serif font-bold uppercase tracking-wider shadow-sm ${
                isDarkSheet
                  ? 'bg-slate-800 text-rose-400 border border-slate-700'
                  : 'bg-white text-slate-800 border-2 border-slate-400'
              }`}>
                📄 Examination Sheet — Page 2 of 2 (Output Array B)
              </span>
            </div>
          </div>

          {/* ================================================================ */}
          {/* PAGE 2: TABLE B + FINAL SORTED ARRAY                             */}
          {/* ================================================================ */}
          <div className="space-y-6">
            <div className={`flex items-center justify-between border-b-2 ${isDarkSheet ? 'border-slate-800' : 'border-slate-300'} pb-2`}>
              <span className={`font-serif text-xs font-bold uppercase tracking-wider ${isDarkSheet ? 'text-slate-400' : 'text-slate-600'}`}>
                📄 Examination Sheet — Page 2 of 2
              </span>
              <span className={`font-serif text-xs font-semibold ${isDarkSheet ? 'text-slate-500' : 'text-slate-500'}`}>
                Section 2: Right-to-Left Element Placement into B[1..{n}]
              </span>
            </div>

            {/* Table B (Exact Structure from Dr. Muhammad Umair's Winter 2023 MidTerm Q1) */}
            <div className="space-y-1.5">
              <div className={`font-serif text-sm font-bold italic ${isDarkSheet ? 'text-slate-100' : 'text-black'}`}>
                B
              </div>
              <div className="overflow-x-auto">
                <table className={`w-full border-collapse border-2 ${isDarkSheet ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-black bg-white text-black'} font-mono text-xs sm:text-sm text-center`}>
                  <thead>
                    <tr className={isDarkSheet ? 'bg-slate-950 text-slate-200 border-b border-slate-700' : 'bg-black text-white'}>
                      <th className="border border-slate-500 px-3 py-1.5 text-left font-sans font-bold w-64">
                        Step / Placement Details
                      </th>
                      {Array.from({ length: n }, (_, idx) => (
                        <th key={idx} className="min-w-[34px] border border-slate-500 px-2.5 py-1.5 font-bold">
                          {idx + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {revealedPlacements === 0 && !showAllExamSteps ? (
                      <tr>
                        <td
                          colSpan={n + 1}
                          className={`border ${isDarkSheet ? 'border-slate-800 text-slate-400' : 'border-black text-slate-600'} px-4 py-6 text-center font-sans text-xs italic`}
                        >
                          Step 1 to 3 compute arrays on Page 1. Click <strong>Next Step ▶</strong> to begin placing elements into B[1..{n}] from right to left!
                        </td>
                      </tr>
                    ) : (
                      v1Steps.slice(0, revealedPlacements).map((st, idx) => {
                        const isLatest = idx === revealedPlacements - 1 && !showAllExamSteps;
                        return (
                          <tr
                            key={idx}
                            onClick={() => {
                              setIsPlaying(false);
                              setCurrentStepIdx(3 + idx);
                            }}
                            className={`cursor-pointer transition ${
                              isLatest
                                ? isDarkSheet
                                  ? 'bg-rose-950/40 ring-1 ring-rose-500'
                                  : 'bg-red-50/70 ring-1 ring-red-400'
                                : isDarkSheet
                                ? 'hover:bg-slate-800'
                                : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className={`border ${isDarkSheet ? 'border-slate-800 text-slate-300' : 'border-black text-slate-700'} px-3 py-1 text-left font-sans text-xs`}>
                              <span className="font-bold">Step {st.stepNum}</span> (j = {st.j}): B[C[{st.val}]] = B[{st.targetB}] ← {st.val}
                            </td>
                            {Array.from({ length: n }, (_, bIdx) => {
                              const bCol = bIdx + 1;
                              const isTarget = bCol === st.targetB;
                              return (
                                <td
                                  key={bIdx}
                                  className={`border ${isDarkSheet ? 'border-slate-800' : 'border-black'} px-2 py-1 ${
                                    isTarget
                                      ? isDarkSheet
                                        ? 'bg-rose-950/50 text-rose-300 font-extrabold underline'
                                        : 'bg-red-100/70 text-[#dc2626] font-extrabold underline'
                                      : 'text-transparent'
                                  }`}
                                >
                                  {isTarget ? st.val : ''}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })
                    )}

                    {/* Final Row: Completed Sorted Array B[1..n] */}
                    {(revealedPlacements >= n || safeStepIdx >= steps.length - 1 || showAllExamSteps) && (
                      <tr className={isDarkSheet ? 'bg-rose-950/30 border-t-2 border-rose-500 font-extrabold' : 'bg-red-50/80 border-t-2 border-black font-extrabold'}>
                        <td className={`border ${isDarkSheet ? 'border-slate-700 text-rose-300' : 'border-black text-[#dc2626]'} px-3 py-2 text-left font-sans text-xs font-extrabold`}>
                          Final Sorted B[1..{n}]
                        </td>
                        {v1Steps[v1Steps.length - 1]?.bCumulativeSnapshot.map((v, bIdx) => (
                          <td
                            key={bIdx}
                            className={`border ${isDarkSheet ? 'border-slate-700 text-rose-300' : 'border-black text-[#dc2626]'} px-2 py-2 font-extrabold text-sm`}
                          >
                            {v}
                          </td>
                        ))}
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Boxed Exam Summary on Page 2 */}
            {(revealedPlacements >= n || safeStepIdx >= steps.length - 1 || showAllExamSteps) && (
              <div className={`rounded-lg border-2 ${isDarkSheet ? 'border-rose-600/70 bg-rose-950/25 text-slate-100' : 'border-black bg-slate-50 text-black'} p-4 space-y-1.5 font-serif`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-bold text-sm sm:text-base">
                    Final Answer written on Exam Sheet:
                  </div>
                  <span className={`rounded border px-2.5 py-0.5 text-xs font-extrabold ${isDarkSheet ? 'border-rose-500 text-rose-300 bg-slate-900' : 'border-[#dc2626] text-[#dc2626] bg-white'}`}>
                    ✓ Full Credit (10/10 pts)
                  </span>
                </div>
                <div className={`font-mono text-base sm:text-lg font-extrabold ${isDarkSheet ? 'text-rose-400' : 'text-[#dc2626]'}`}>
                  B[1..{n}] = [{v1Steps[v1Steps.length - 1]?.bCumulativeSnapshot.join(', ')}]
                </div>
                <div className={`font-sans text-xs ${isDarkSheet ? 'text-slate-400' : 'text-slate-600'}`}>
                  Stable sorting guaranteed: equal keys preserve their original relative input order from array A.
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // ------------------------------------------------------------------------
    // VERSION 2: LEVITIN / Fall 2025 MidTerm Q1 & Spring 2021
    // Full Width 2-Page Exam Paper Format (No Side-by-Side Squishing!)
    // ------------------------------------------------------------------------
    let domain: (string | number)[] = [];
    if (isNum) {
      const nums = arr as number[];
      const minV = Math.min(...nums);
      const maxV = Math.max(...nums);
      for (let v = minV; v <= maxV; v++) domain.push(v);
    } else {
      const chars = Array.from(new Set(arr as string[])).sort();
      const firstCode = chars[0].charCodeAt(0);
      const lastCode = chars[chars.length - 1].charCodeAt(0);
      if (lastCode - firstCode <= 12) {
        for (let c = firstCode; c <= lastCode; c++) domain.push(String.fromCharCode(c));
      } else {
        domain = chars;
      }
    }
    const m = domain.length;

    const freq = new Array<number>(m).fill(0);
    arr.forEach((val) => {
      const idx = domain.indexOf(val);
      if (idx !== -1) freq[idx]++;
    });

    const dist = new Array<number>(m).fill(0);
    dist[0] = freq[0];
    for (let j = 1; j < m; j++) {
      dist[j] = dist[j - 1] + freq[j];
    }

    interface DCSStep {
      stepNum: number;
      i: number;
      val: string | number;
      j: number;
      pos: number;
      dSnap: number[];
      sSnap: (string | number)[];
    }
    const history: DCSStep[] = [];
    const dWork = [...dist];
    const sWork = new Array<string | number>(n).fill('');

    for (let i = n - 1; i >= 0; i--) {
      const val = arr[i];
      const j = domain.indexOf(val);
      const pos = dWork[j] - 1;
      sWork[pos] = val;
      dWork[j]--;
      history.push({
        stepNum: n - i,
        i,
        val,
        j,
        pos,
        dSnap: [...dWork],
        sSnap: [...sWork],
      });
    }

    const maxK = showAllExamSteps
      ? history.length
      : Math.min(history.length, Math.max(1, safeStepIdx + 1));

    return (
      <div className="space-y-8">
        {/* ================================================================ */}
        {/* PAGE 1: ALGORITHM REFERENCE + TABLE A + TABLE D (8)              */}
        {/* ================================================================ */}
        <div className="space-y-6">
          <div className={`flex items-center justify-between border-b-2 ${isDarkSheet ? 'border-slate-800' : 'border-slate-300'} pb-2`}>
            <span className={`font-serif text-xs font-bold uppercase tracking-wider ${isDarkSheet ? 'text-slate-400' : 'text-slate-600'}`}>
              📄 Examination Sheet — Page 1 of 2
            </span>
            <span className={`font-serif text-xs font-semibold ${isDarkSheet ? 'text-slate-500' : 'text-slate-500'}`}>
              Section 1: Frequency &amp; Distribution Array D
            </span>
          </div>

          {/* Reference Algorithm Box (Full Width, Centered) */}
          <div className="mx-auto max-w-2xl">{renderExamReferenceBox(isDarkSheet)}</div>

          {/* Given Input Array A[0..n-1] */}
          <div className="space-y-1.5">
            <div className={`font-serif text-sm font-bold italic ${isDarkSheet ? 'text-slate-100' : 'text-black'}`}>
              Given Input Array A[0..{n - 1}]:
            </div>
            <div className="overflow-x-auto">
              <table className={`w-full border-collapse border-2 ${isDarkSheet ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-black bg-white text-black'} font-mono text-xs sm:text-sm text-center`}>
                <thead>
                  <tr className={isDarkSheet ? 'bg-slate-950 text-slate-300' : 'bg-slate-100 text-slate-700'}>
                    <th className={`border ${isDarkSheet ? 'border-slate-700' : 'border-black'} px-3 py-1 font-bold text-left`}>
                      Index i
                    </th>
                    {arr.map((_, idx) => (
                      <th key={idx} className={`min-w-[34px] border ${isDarkSheet ? 'border-slate-700' : 'border-black'} px-3 py-1 font-bold`}>
                        {idx}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={`border ${isDarkSheet ? 'border-slate-700' : 'border-black'} px-3 py-1.5 font-bold text-left`}>
                      A[i]
                    </td>
                    {arr.map((v, idx) => (
                      <td key={idx} className={`border ${isDarkSheet ? 'border-slate-700' : 'border-black'} px-3 py-1.5 font-extrabold ${isDarkSheet ? 'text-amber-300' : 'text-slate-900'}`}>
                        {v}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Stacked Full-Width Frequency & Distribution Tables */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className={`font-serif text-xs sm:text-sm font-bold italic ${isDarkSheet ? 'text-slate-100' : 'text-black'}`}>
                Frequency Array D[0..{m - 1}] (Counts):
              </div>
              <div className="overflow-x-auto">
                <table className={`w-full border-collapse border-2 ${isDarkSheet ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-black bg-white text-black'} font-mono text-xs sm:text-sm text-center`}>
                  <thead>
                    <tr className={isDarkSheet ? 'bg-slate-950 text-slate-300' : 'bg-black text-white'}>
                      <th className="border border-slate-500 px-3 py-1 font-bold text-left">Values</th>
                      {domain.map((d, j) => (
                        <th key={j} className="border border-slate-500 px-3 py-1 font-bold">
                          {d}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className={`border ${isDarkSheet ? 'border-slate-700' : 'border-black'} px-3 py-1.5 font-bold text-left`}>
                        Counts
                      </td>
                      {freq.map((f, j) => (
                        <td key={j} className={`border ${isDarkSheet ? 'border-slate-700 text-rose-400' : 'border-black text-[#dc2626]'} px-3 py-1.5 font-extrabold`}>
                          {(safeStepIdx >= 1 || showAllExamSteps) ? f : ''}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className={`font-serif text-xs sm:text-sm font-bold italic ${isDarkSheet ? 'text-slate-100' : 'text-black'}`}>
                Distribution Array D[0..{m - 1}] (Cumulative Distribution):
              </div>
              <div className="overflow-x-auto">
                <table className={`w-full border-collapse border-2 ${isDarkSheet ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-black bg-white text-black'} font-mono text-xs sm:text-sm text-center`}>
                  <thead>
                    <tr className={isDarkSheet ? 'bg-slate-950 text-slate-300' : 'bg-black text-white'}>
                      <th className="border border-slate-500 px-3 py-1 font-bold text-left">Values</th>
                      {domain.map((d, j) => (
                        <th key={j} className="border border-slate-500 px-3 py-1 font-bold">
                          {d}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className={`border ${isDarkSheet ? 'border-slate-700' : 'border-black'} px-3 py-1.5 font-bold text-left`}>
                        Cumulative
                      </td>
                      {dist.map((dVal, j) => (
                        <td key={j} className={`border ${isDarkSheet ? 'border-slate-700 text-rose-400' : 'border-black text-[#dc2626]'} px-3 py-1.5 font-extrabold`}>
                          {(safeStepIdx >= 2 || showAllExamSteps) ? dVal : ''}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* REALISTIC EXAM SHEET PAGE DIVIDER                                */}
        {/* ================================================================ */}
        <div className="relative my-8 text-center">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className={`w-full border-t-2 border-dashed ${isDarkSheet ? 'border-slate-700' : 'border-slate-400'}`} />
          </div>
          <div className="relative flex justify-center">
            <span className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs sm:text-sm font-serif font-bold uppercase tracking-wider shadow-sm ${
              isDarkSheet
                ? 'bg-slate-800 text-rose-400 border border-slate-700'
                : 'bg-white text-slate-800 border-2 border-slate-400'
            }`}>
              📄 Examination Sheet — Page 2 of 2 (Table 9: Execution Trace)
            </span>
          </div>
        </div>

        {/* ================================================================ */}
        {/* PAGE 2: TABLE 9 EXECUTION TRACE & OUTPUT ARRAY S                 */}
        {/* ================================================================ */}
        <div className="space-y-6">
          <div className={`flex items-center justify-between border-b-2 ${isDarkSheet ? 'border-slate-800' : 'border-slate-300'} pb-2`}>
            <span className={`font-serif text-xs font-bold uppercase tracking-wider ${isDarkSheet ? 'text-slate-400' : 'text-slate-600'}`}>
              📄 Examination Sheet — Page 2 of 2
            </span>
            <span className={`font-serif text-xs font-semibold ${isDarkSheet ? 'text-slate-500' : 'text-slate-500'}`}>
              Section 2: Table 9 Execution Trace (Right-to-Left i = {n - 1} downto 0)
            </span>
          </div>

          {/* Table 9 Execution Trace */}
          <div className="space-y-2">
            <div className={`font-serif text-sm sm:text-base font-bold italic ${isDarkSheet ? 'text-white' : 'text-black'}`}>
              Table 9 — Distribution Counting Sort Execution Trace:
            </div>

            <div className="overflow-x-auto">
              <table className={`w-full border-collapse border-2 ${isDarkSheet ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-black bg-white text-black'} font-mono text-xs sm:text-sm text-center`}>
                <thead>
                  <tr className={isDarkSheet ? 'bg-slate-950 text-slate-200 border-b border-slate-700' : 'bg-black text-white'}>
                    <th className="border border-slate-500 px-2 py-1.5 font-bold">Step</th>
                    <th className="border border-slate-500 px-2.5 py-1.5 font-bold">i (A[i])</th>
                    {domain.map((d, j) => (
                      <th key={`d-${j}`} className="border border-slate-500 px-2 py-1.5 font-bold whitespace-nowrap">
                        D[{d}]
                      </th>
                    ))}
                    {Array.from({ length: n }, (_, k) => (
                      <th key={`s-${k}`} className="border border-slate-500 px-2 py-1.5 font-bold">
                        S[{k}]
                      </th>
                    ))}
                    <th className="border border-slate-500 px-3 py-1.5 text-left font-sans font-bold">
                      Calculation &amp; Placement
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, maxK).map((h, rIdx) => {
                    const isLatest = rIdx === maxK - 1 && !showAllExamSteps;
                    return (
                      <tr
                        key={rIdx}
                        onClick={() => {
                          setIsPlaying(false);
                          setCurrentStepIdx(Math.min(steps.length - 1, rIdx + 2));
                        }}
                        className={`cursor-pointer transition ${
                          isLatest
                            ? isDarkSheet
                              ? 'bg-rose-950/40 ring-1 ring-rose-500'
                              : 'bg-red-50/70 ring-1 ring-red-400'
                            : isDarkSheet
                            ? 'hover:bg-slate-800'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className={`border ${isDarkSheet ? 'border-slate-800' : 'border-black'} px-2 py-1 font-bold`}>
                          {h.stepNum}
                        </td>
                        <td className={`border ${isDarkSheet ? 'border-slate-800' : 'border-black'} px-2.5 py-1 font-bold ${isDarkSheet ? 'text-amber-300' : 'text-slate-900'}`}>
                          i={h.i} ('{h.val}')
                        </td>
                        {h.dSnap.map((dVal, dIdx) => (
                          <td
                            key={dIdx}
                            className={`border ${isDarkSheet ? 'border-slate-800' : 'border-black'} px-2 py-1 font-bold ${
                              dIdx === h.j
                                ? isDarkSheet
                                  ? 'text-rose-400 font-extrabold bg-rose-950/30'
                                  : 'text-[#dc2626] font-extrabold bg-red-100/50'
                                : isDarkSheet
                                ? 'text-slate-300'
                                : 'text-slate-700'
                            }`}
                          >
                            {dVal}
                          </td>
                        ))}
                        {h.sSnap.map((sVal, sIdx) => (
                          <td
                            key={sIdx}
                            className={`border ${isDarkSheet ? 'border-slate-800' : 'border-black'} px-2 py-1 font-extrabold ${
                              sIdx === h.pos
                                ? isDarkSheet
                                  ? 'text-rose-400 bg-rose-950/40 underline'
                                  : 'text-[#dc2626] bg-red-100/70 underline'
                                : sVal !== ''
                                ? isDarkSheet
                                  ? 'text-slate-200'
                                  : 'text-black'
                                : 'text-transparent'
                            }`}
                          >
                            {sVal || '·'}
                          </td>
                        ))}
                        <td className={`border ${isDarkSheet ? 'border-slate-800' : 'border-black'} px-3 py-1 text-left font-mono text-xs ${isDarkSheet ? 'text-rose-400 font-bold' : 'text-[#dc2626] font-bold'}`}>
                          j={h.j} → S[{h.pos}] ← '{h.val}'; D[{h.val}] ← {h.dSnap[h.j]}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Part (d) Final Output Array S on Page 2 */}
          {(maxK >= n || safeStepIdx >= steps.length - 1 || showAllExamSteps) && (
            <div className={`rounded-lg border-2 ${isDarkSheet ? 'border-rose-600/70 bg-rose-950/25 text-slate-100' : 'border-black bg-slate-50 text-black'} p-4 space-y-1.5 font-serif`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-bold text-sm sm:text-base">
                  Final Answer written on Exam Sheet:
                </div>
                <span className={`rounded border px-2.5 py-0.5 text-xs font-extrabold ${isDarkSheet ? 'border-rose-500 text-rose-300 bg-slate-900' : 'border-[#dc2626] text-[#dc2626] bg-white'}`}>
                  ✓ Full Credit (10/10 pts)
                </span>
              </div>
              <div className={`font-mono text-base sm:text-lg font-extrabold ${isDarkSheet ? 'text-rose-400' : 'text-[#dc2626]'}`}>
                Final Sorted Array S[0..{n - 1}]: [{history[history.length - 1]?.sSnap.join(', ')}]
              </div>
              <div className={`font-sans text-xs ${isDarkSheet ? 'text-slate-400' : 'text-slate-600'}`}>
                Stable sorting preserved: elements with identical keys maintain their original relative order from input array A.
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ==========================================================================
  // OPTIMAL BINARY SEARCH TREE (OBST) EXAM SOLUTION (Fall 2025 Midterm Q6)
  // ==========================================================================
  const renderOBSTExamPaperSolution = () => {
    const rawKeysStr = givenInputSource.keys || customInputs.keys || 'A, B, C, D';
    const rawProbsStr = givenInputSource.probs || customInputs.probs || '0.2, 0.1, 0.4, 0.3';
    const keys = rawKeysStr.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
    const probs = rawProbsStr.split(/[\s,]+/).map(Number).filter((x) => !isNaN(x));
    const n = Math.min(keys.length, probs.length);

    const C: (number | null)[][] = Array.from({ length: n + 2 }, () => new Array(n + 1).fill(null));
    const R: (number | null)[][] = Array.from({ length: n + 2 }, () => new Array(n + 1).fill(null));
    interface OBSTCalc {
      i: number;
      j: number;
      d: number;
      formulaStr: string;
      chosenK: number;
      chosenKey: string;
      cost: number;
    }
    const calcsByDiagonal: Record<number, OBSTCalc[]> = {};

    for (let i = 1; i <= n; i++) {
      C[i][i - 1] = 0;
      C[i][i] = probs[i - 1];
      R[i][i] = i;
    }
    C[n + 1][n] = 0;

    const round2 = (num: number) => Math.round(num * 100) / 100;

    for (let d = 1; d <= n - 1; d++) {
      calcsByDiagonal[d] = [];
      for (let i = 1; i <= n - d; i++) {
        const j = i + d;
        let minVal = Infinity;
        let bestK = i;
        const candParts: string[] = [];

        let sumP = 0;
        for (let s = i; s <= j; s++) sumP += probs[s - 1];
        sumP = round2(sumP);

        for (let k = i; k <= j; k++) {
          const cLeft = C[i][k - 1] ?? 0;
          const cRight = C[k + 1][j] ?? 0;
          const totalK = round2(cLeft + cRight);
          candParts.push(`k=${k}: ${cLeft}+${cRight}=${totalK}`);
          if (totalK < minVal) {
            minVal = totalK;
            bestK = k;
          }
        }
        const finalCost = round2(minVal + sumP);
        C[i][j] = finalCost;
        R[i][j] = bestK;

        calcsByDiagonal[d].push({
          i,
          j,
          d,
          formulaStr: `C[${i}, ${j}] = min(${candParts.join(', ')}) + ${sumP} = ${minVal} + ${sumP} = ${finalCost}`,
          chosenK: bestK,
          chosenKey: keys[bestK - 1] ?? `K${bestK}`,
          cost: finalCost,
        });
      }
    }

    const maxD = showAllExamSteps
      ? n - 1
      : Math.min(n - 1, Math.max(0, safeStepIdx));

    return (
      <div className="space-y-6">
        {/* Top: Given Keys + Reference Recurrence Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="space-y-1.5">
              <div className={`font-serif text-sm font-bold italic ${isDarkSheet ? 'text-slate-100' : 'text-black'}`}>
                Given Keys &amp; Search Probabilities:
              </div>
              <div className="overflow-x-auto">
                <table className={`border-collapse border-2 ${isDarkSheet ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-black bg-white text-black'} font-sans text-xs sm:text-sm text-center`}>
                  <thead>
                    <tr className={isDarkSheet ? 'bg-slate-950 text-slate-300' : 'bg-black text-white'}>
                      <th className="border border-slate-500 px-3.5 py-1 font-bold">Key Index i</th>
                      {keys.map((_, idx) => (
                        <th key={idx} className="min-w-[48px] border border-slate-500 px-3 py-1 font-bold">
                          {idx + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className={`border ${isDarkSheet ? 'border-slate-700' : 'border-black'} px-3.5 py-1.5 font-bold`}>
                        Key Label
                      </td>
                      {keys.map((k, idx) => (
                        <td key={idx} className={`border ${isDarkSheet ? 'border-slate-700' : 'border-black'} px-3 py-1.5 font-bold ${isDarkSheet ? 'text-amber-300' : 'text-slate-900'}`}>
                          {k}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className={`border ${isDarkSheet ? 'border-slate-700' : 'border-black'} px-3.5 py-1.5 font-bold`}>
                        Probability p_i
                      </td>
                      {probs.map((p, idx) => (
                        <td key={idx} className={`border ${isDarkSheet ? 'border-slate-700' : 'border-black'} px-3 py-1.5 font-extrabold ${isDarkSheet ? 'text-rose-400' : 'text-[#dc2626]'}`}>
                          {p}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">{renderExamReferenceBox(isDarkSheet)}</div>
        </div>

        {/* Doctor's Dual Triangular Tables (Side-by-Side: Table C & Table R) */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
          {/* Main Cost Table C[1..n+1, 0..n] */}
          <div className="space-y-2">
            <div className={`font-serif text-sm font-bold italic ${isDarkSheet ? 'text-white' : 'text-black'}`}>
              Main Table C[1..{n + 1}, 0..{n}] (Minimum Expected Search Cost):
            </div>
            <div className="overflow-x-auto">
              <table className={`w-full border-collapse border-2 ${isDarkSheet ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-black bg-white text-black'} font-sans text-xs sm:text-sm text-center`}>
                <thead>
                  <tr className={isDarkSheet ? 'bg-slate-950 text-slate-200 border-b border-slate-700' : 'bg-black text-white'}>
                    <th className="border border-slate-500 px-3 py-1.5 font-bold">i \ j</th>
                    {Array.from({ length: n + 1 }, (_, col) => (
                      <th key={col} className="min-w-[42px] border border-slate-500 px-2 py-1.5 font-bold">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: n + 1 }, (_, rIdx) => {
                    const rowI = rIdx + 1;
                    return (
                      <tr key={rowI}>
                        <td className={`border ${isDarkSheet ? 'border-slate-700 bg-slate-950 text-slate-300' : 'border-black bg-slate-100 text-black'} px-3 py-1.5 font-bold`}>
                          {rowI}
                        </td>
                        {Array.from({ length: n + 1 }, (_, colJ) => {
                          if (colJ < rowI - 1) {
                            return (
                              <td key={colJ} className={`border ${isDarkSheet ? 'border-slate-800 text-slate-600' : 'border-slate-200 text-slate-300'} px-2 py-1.5`}>
                                —
                              </td>
                            );
                          }
                          const val = C[rowI][colJ];
                          const diagDist = colJ - rowI;
                          const isRevealed = diagDist <= maxD;
                          const isComputedDiag = diagDist > 0;
                          return (
                            <td
                              key={colJ}
                              className={`border ${isDarkSheet ? 'border-slate-700' : 'border-black'} px-2 py-1.5 font-bold ${
                                isRevealed
                                  ? isComputedDiag
                                    ? isDarkSheet
                                      ? 'text-rose-400 font-extrabold bg-rose-950/20'
                                      : 'text-[#dc2626] font-extrabold bg-red-50/50'
                                    : isDarkSheet
                                    ? 'text-slate-200'
                                    : 'text-black'
                                  : 'text-transparent'
                              }`}
                            >
                              {isRevealed && val !== null ? val : ''}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Root Table R[1..n, 1..n] */}
          <div className="space-y-2">
            <div className={`font-serif text-sm font-bold italic ${isDarkSheet ? 'text-white' : 'text-black'}`}>
              Root Table R[1..{n}, 1..{n}] (Optimal Root Index k):
            </div>
            <div className="overflow-x-auto">
              <table className={`w-full border-collapse border-2 ${isDarkSheet ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-black bg-white text-black'} font-sans text-xs sm:text-sm text-center`}>
                <thead>
                  <tr className={isDarkSheet ? 'bg-slate-950 text-slate-200 border-b border-slate-700' : 'bg-black text-white'}>
                    <th className="border border-slate-500 px-3 py-1.5 font-bold">i \ j</th>
                    {Array.from({ length: n }, (_, col) => (
                      <th key={col + 1} className="min-w-[42px] border border-slate-500 px-2 py-1.5 font-bold">
                        {col + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: n }, (_, rIdx) => {
                    const rowI = rIdx + 1;
                    return (
                      <tr key={rowI}>
                        <td className={`border ${isDarkSheet ? 'border-slate-700 bg-slate-950 text-slate-300' : 'border-black bg-slate-100 text-black'} px-3 py-1.5 font-bold`}>
                          {rowI}
                        </td>
                        {Array.from({ length: n }, (_, colIdx) => {
                          const colJ = colIdx + 1;
                          if (colJ < rowI) {
                            return (
                              <td key={colJ} className={`border ${isDarkSheet ? 'border-slate-800 text-slate-600' : 'border-slate-200 text-slate-300'} px-2 py-1.5`}>
                                —
                              </td>
                            );
                          }
                          const rootK = R[rowI][colJ];
                          const diagDist = colJ - rowI;
                          const isRevealed = diagDist <= maxD;
                          return (
                            <td
                              key={colJ}
                              className={`border ${isDarkSheet ? 'border-slate-700' : 'border-black'} px-2 py-1.5 font-bold ${
                                isRevealed
                                  ? isDarkSheet
                                    ? 'text-rose-400 font-extrabold'
                                    : 'text-[#dc2626] font-extrabold'
                                  : 'text-transparent'
                              }`}
                            >
                              {isRevealed && rootK !== null ? `${rootK} (${keys[rootK - 1]})` : ''}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Part (b) Detailed Calculations by Diagonal (Exam Required: "Show all calculations in detail") */}
        <div className={`space-y-3 border-t-2 ${isDarkSheet ? 'border-slate-700' : 'border-slate-300'} pt-4`}>
          <div className={`font-serif text-sm font-bold italic ${isDarkSheet ? 'text-white' : 'text-black'}`}>
            Detailed Recurrence Evaluations by Diagonal d = j - i:
          </div>

          <div className="space-y-2">
            {Array.from({ length: Math.min(n - 1, maxD) }, (_, dIdx) => {
              const diagNum = dIdx + 1;
              const diagCalcs = calcsByDiagonal[diagNum] || [];
              return (
                <div
                  key={diagNum}
                  className={`rounded border ${isDarkSheet ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'} p-3 space-y-1.5 font-mono text-xs`}
                >
                  <div className={`font-bold ${isDarkSheet ? 'text-amber-300' : 'text-slate-900'}`}>
                    Diagonal d = {diagNum} (Subtree lengths = {diagNum + 1}):
                  </div>
                  {diagCalcs.map((c, cIdx) => (
                    <div key={cIdx} className="pl-3 space-y-0.5">
                      <div className={isDarkSheet ? 'text-slate-300' : 'text-slate-800'}>
                        {c.formulaStr}
                      </div>
                      <div className={`font-bold ${isDarkSheet ? 'text-rose-400' : 'text-[#dc2626]'}`}>
                        → Optimal Root R[{c.i}, {c.j}] = {c.chosenK} (Key '{c.chosenKey}'), Cost C[{c.i}, {c.j}] = {c.cost}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tree Diagram Visualizer */}
        {currentStep?.obstTreeView && (
          <div className="space-y-2 pt-2">
            <div className={`font-serif text-sm font-bold italic ${isDarkSheet ? 'text-white' : 'text-black'}`}>
              Constructed Optimal Binary Search Tree:
            </div>
            {renderOBSTTreeConstructionView(currentStep.obstTreeView)}
          </div>
        )}

        {/* Part (c) Final Answer: Minimum Expected Cost */}
        {(maxD >= n - 1 || safeStepIdx >= steps.length - 1 || showAllExamSteps) && (
          <div className={`border-t-2 ${isDarkSheet ? 'border-slate-700 text-slate-100' : 'border-slate-300 text-black'} pt-4 space-y-1.5 font-serif text-sm sm:text-base`}>
            <div>
              <span className="font-bold">Minimum Expected Cost of Searching C[1, {n}]: </span>
              <span className={`font-mono font-extrabold ${isDarkSheet ? 'text-rose-400' : 'text-[#dc2626]'} text-lg`}>
                {C[1][n]}
              </span>
            </div>
            <div>
              <span className="font-bold">Optimal Root of the Entire Tree: </span>
              <span className={`font-mono font-extrabold ${isDarkSheet ? 'text-rose-400' : 'text-[#dc2626]'} text-base`}>
                Key '{keys[(R[1][n] ?? 1) - 1]}' (Index k = {R[1][n]})
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==========================================================================
  // ROBOT COIN COLLECTION OFFICIAL EXAM SOLUTION (Spring 2021 & Fall 2020 Final Q1)
  // ==========================================================================
  const renderCoinCollectingExamPaperSolution = () => {
    const rawBoardStr =
      givenInputSource.board ||
      customInputs.board ||
      '0 0 0 0 1 0; 0 1 0 1 0 0; 0 0 0 1 0 1; 0 0 1 0 0 1; 1 0 0 0 1 0';
    const C = rawBoardStr
      .split(';')
      .map((r) =>
        r
          .trim()
          .split(/[\s,]+/)
          .map(Number)
          .filter((x) => !isNaN(x))
      )
      .filter((r) => r.length > 0);

    const n = C.length;
    const m = C[0]?.length || 0;
    const F: number[][] = Array.from({ length: n }, () => new Array(m).fill(0));
    interface CCCellCalc {
      i: number;
      j: number;
      formula: string;
      val: number;
    }
    const calcs: CCCellCalc[] = [];

    F[0][0] = C[0][0];
    calcs.push({
      i: 1,
      j: 1,
      formula: `Base Case: F[1, 1] = C[1, 1] = ${C[0][0]}`,
      val: F[0][0],
    });

    for (let j = 1; j < m; j++) {
      F[0][j] = F[0][j - 1] + C[0][j];
      calcs.push({
        i: 1,
        j: j + 1,
        formula: `F[1, ${j + 1}] = F[1, ${j}] + C[1, ${j + 1}] = ${F[0][j - 1]} + ${C[0][j]} = ${F[0][j]}`,
        val: F[0][j],
      });
    }

    for (let i = 1; i < n; i++) {
      F[i][0] = F[i - 1][0] + C[i][0];
      calcs.push({
        i: i + 1,
        j: 1,
        formula: `F[${i + 1}, 1] = F[${i}, 1] + C[${i + 1}, 1] = ${F[i - 1][0]} + ${C[i][0]} = ${F[i][0]}`,
        val: F[i][0],
      });
      for (let j = 1; j < m; j++) {
        const top = F[i - 1][j];
        const left = F[i][j - 1];
        F[i][j] = Math.max(top, left) + C[i][j];
        calcs.push({
          i: i + 1,
          j: j + 1,
          formula: `F[${i + 1}, ${j + 1}] = max(F[${i}, ${j + 1}], F[${i + 1}, ${j}]) + C[${i + 1}, ${j + 1}] = max(${top}, ${left}) + ${C[i][j]} = ${Math.max(top, left)} + ${C[i][j]} = ${F[i][j]}`,
          val: F[i][j],
        });
      }
    }

    // Backtrack path
    const path: { r: number; c: number }[] = [];
    let currR = n - 1;
    let currC = m - 1;
    path.push({ r: currR, c: currC });
    while (currR > 0 || currC > 0) {
      if (currR === 0) {
        currC--;
      } else if (currC === 0) {
        currR--;
      } else if (F[currR][currC - 1] >= F[currR - 1][currC]) {
        currC--;
      } else {
        currR--;
      }
      path.push({ r: currR, c: currC });
    }
    path.reverse();
    const isPathCell = (r: number, c: number) => path.some((p) => p.r === r && p.c === c);

    const maxCells = showAllExamSteps
      ? calcs.length
      : Math.min(calcs.length, Math.max(1, safeStepIdx + 1));

    return (
      <div className="space-y-6">
        {/* Top: Given Coin Setup Board C[1..n, 1..m] + Reference Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="space-y-1.5">
              <div className={`font-serif text-sm font-bold italic ${isDarkSheet ? 'text-slate-100' : 'text-black'}`}>
                a) Coin Setup Board C[1..{n}, 1..{m}] (1 = 🪙 Coin, 0 = Empty):
              </div>
              <div className="overflow-x-auto">
                <table className={`mx-auto border-collapse border-2 ${isDarkSheet ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-black bg-white text-black'} font-mono text-xs sm:text-sm text-center`}>
                  <thead>
                    <tr className={isDarkSheet ? 'bg-slate-950 text-slate-300' : 'bg-black text-white'}>
                      <th className="border border-slate-500 px-3 py-1 font-bold">Row \ Col</th>
                      {Array.from({ length: m }, (_, c) => (
                        <th key={c + 1} className="min-w-[40px] border border-slate-500 px-3 py-1 font-bold">
                          {c + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {C.map((row, rIdx) => (
                      <tr key={rIdx + 1}>
                        <td className={`border ${isDarkSheet ? 'border-slate-700 bg-slate-950 text-slate-300' : 'border-black bg-slate-100 text-black'} px-3 py-1 font-bold`}>
                          {rIdx + 1}
                        </td>
                        {row.map((val, cIdx) => (
                          <td
                            key={cIdx + 1}
                            className={`border ${isDarkSheet ? 'border-slate-700' : 'border-black'} px-3 py-1 font-bold ${
                              val === 1
                                ? isDarkSheet
                                  ? 'text-amber-300 font-extrabold bg-amber-950/30'
                                  : 'text-amber-700 font-extrabold bg-amber-50'
                                : isDarkSheet
                                ? 'text-slate-500'
                                : 'text-slate-400'
                            }`}
                          >
                            {val === 1 ? '🪙 (1)' : '0'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">{renderExamReferenceBox(isDarkSheet)}</div>
        </div>

        {/* Part (b) DP Table F[1..n, 1..m] (Matching Spring 2021 Final Table 4) */}
        <div className="space-y-2">
          <div className={`font-serif text-sm sm:text-base font-bold italic ${isDarkSheet ? 'text-white' : 'text-black'}`}>
            b) Dynamic Programming Table F[1..{n}, 1..{m}] (Filled Step-by-Step):
          </div>

          <div className="overflow-x-auto">
            <table className={`mx-auto border-collapse border-2 ${isDarkSheet ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-black bg-white text-black'} font-mono text-xs sm:text-sm text-center`}>
              <thead>
                <tr className={isDarkSheet ? 'bg-slate-950 text-slate-200 border-b border-slate-700' : 'bg-black text-white'}>
                  <th className="border border-slate-500 px-3.5 py-1.5 font-bold">Row \ Col</th>
                  {Array.from({ length: m }, (_, c) => (
                    <th key={c + 1} className="min-w-[44px] border border-slate-500 px-3 py-1.5 font-bold">
                      {c + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {F.map((row, rIdx) => {
                  const rowNum = rIdx + 1;
                  return (
                    <tr key={rowNum}>
                      <td className={`border ${isDarkSheet ? 'border-slate-700 bg-slate-950 text-slate-300' : 'border-black bg-slate-100 text-black'} px-3.5 py-1.5 font-bold`}>
                        {rowNum}
                      </td>
                      {row.map((val, cIdx) => {
                        const colNum = cIdx + 1;
                        const cellOrder = calcs.findIndex((c) => c.i === rowNum && c.j === colNum);
                        const isRevealed = cellOrder !== -1 && cellOrder < maxCells;
                        const onOptimalPath = isPathCell(rIdx, cIdx);
                        return (
                          <td
                            key={colNum}
                            className={`border ${isDarkSheet ? 'border-slate-700' : 'border-black'} px-3 py-1.5 font-extrabold ${
                              isRevealed
                                ? onOptimalPath && (maxCells >= calcs.length || showAllExamSteps)
                                  ? isDarkSheet
                                    ? 'text-emerald-400 bg-emerald-950/40 ring-1 ring-emerald-500'
                                    : 'text-emerald-700 bg-emerald-100/80 ring-1 ring-emerald-500'
                                  : isDarkSheet
                                  ? 'text-rose-400 bg-rose-950/20'
                                  : 'text-[#dc2626] bg-red-50/50'
                                : 'text-transparent'
                            }`}
                          >
                            {isRevealed ? val : ''}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Part (c) Cell-by-Cell Calculations (Required in Exams: "Without calculations, you will get 0 marks") */}
        <div className={`space-y-2 border-t-2 ${isDarkSheet ? 'border-slate-700' : 'border-slate-300'} pt-4`}>
          <div className={`font-serif text-sm font-bold italic ${isDarkSheet ? 'text-white' : 'text-black'}`}>
            c) Detailed Calculations for Each Cell (Exam Requirement):
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-xs max-h-64 overflow-y-auto">
            {calcs.slice(0, maxCells).map((c, idx) => (
              <div
                key={idx}
                className={`rounded border px-3 py-1.5 ${
                  isDarkSheet
                    ? 'border-slate-800 bg-slate-950 text-slate-300'
                    : 'border-slate-200 bg-slate-50 text-slate-800'
                }`}
              >
                <span className={`font-bold mr-1 ${isDarkSheet ? 'text-rose-400' : 'text-[#dc2626]'}`}>
                  F[{c.i}, {c.j}]:
                </span>
                <span>{c.formula}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Part (d) Final Answer: Maximum Coins Collected & Optimal Robot Path */}
        {(maxCells >= calcs.length || safeStepIdx >= steps.length - 1 || showAllExamSteps) && (
          <div className={`border-t-2 ${isDarkSheet ? 'border-slate-700 text-slate-100' : 'border-slate-300 text-black'} pt-4 space-y-1.5 font-serif text-sm sm:text-base`}>
            <div>
              <span className="font-bold">Maximum Coins Collected F[{n}, {m}]: </span>
              <span className={`font-mono font-extrabold ${isDarkSheet ? 'text-rose-400' : 'text-[#dc2626]'} text-lg`}>
                {F[n - 1][m - 1]} Coins
              </span>
            </div>
            <div>
              <span className="font-bold">Optimal Path of Robot: </span>
              <span className={`font-mono font-extrabold ${isDarkSheet ? 'text-emerald-400' : 'text-emerald-700'} text-sm`}>
                {path.map((p) => `(${p.r + 1}, ${p.c + 1})`).join(' → ')}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==========================================================================
  // KRUSKAL'S ALGORITHM OFFICIAL EXAM SOLUTION (Fall 2025 CFE Final Q3a Format)
  // ==========================================================================
  const renderKruskalExamPaperSolution = () => {
    const rawEdgesStr =
      givenInputSource.edges ||
      customInputs.edges ||
      'a-b:5, a-c:7, b-d:6, c-d:4, a-e:2, b-e:3, c-e:4, d-e:5';
    const { nodes, edges } = parseEdgesInput(rawEdgesStr);

    const normEdges = edges.map((e) => {
      const [u, v] = e.u <= e.v ? [e.u, e.v] : [e.v, e.u];
      return { u, v, w: e.w };
    });
    const sortedEdges = [...normEdges].sort(
      (a, b) => a.w - b.w || a.u.localeCompare(b.u) || a.v.localeCompare(b.v)
    );

    const parent: Record<string, string> = {};
    nodes.forEach((v) => (parent[v] = v));
    const findRoot = (i: string): string => {
      if (parent[i] === i) return i;
      parent[i] = findRoot(parent[i]);
      return parent[i];
    };
    const unionSets = (i: string, j: string) => {
      const rootI = findRoot(i);
      const rootJ = findRoot(j);
      if (rootI !== rootJ) parent[rootI] = rootJ;
    };
    const getComp = (v: string): string => {
      const root = findRoot(v);
      const members = nodes.filter((x) => findRoot(x) === root);
      return `{${members.join(', ')}}`;
    };

    interface KruskalRow {
      k: number;
      edgeStr: string;
      weight: number;
      compU: string;
      compV: string;
      decision: string;
      isAccepted: boolean;
      runningWeight: number;
    }
    const kruskalRows: KruskalRow[] = [];
    const ET: { u: string; v: string; w: number }[] = [];
    let runningW = 0;

    for (let k = 0; k < sortedEdges.length; k++) {
      const e = sortedEdges[k];
      const compU = getComp(e.u);
      const compV = getComp(e.v);
      const rootU = findRoot(e.u);
      const rootV = findRoot(e.v);

      if (rootU !== rootV) {
        unionSets(e.u, e.v);
        ET.push(e);
        runningW += e.w;
        kruskalRows.push({
          k: k + 1,
          edgeStr: `(${e.u}, ${e.v})`,
          weight: e.w,
          compU,
          compV,
          decision: `ADDED to E_T (Merges ${compU} and ${compV})`,
          isAccepted: true,
          runningWeight: runningW,
        });
      } else {
        kruskalRows.push({
          k: k + 1,
          edgeStr: `(${e.u}, ${e.v})`,
          weight: e.w,
          compU,
          compV,
          decision: `REJECTED (Forms cycle in ${compU})`,
          isAccepted: false,
          runningWeight: runningW,
        });
      }

      if (ET.length === nodes.length - 1) break;
    }

    const totalWeight = ET.reduce((acc, e) => acc + e.w, 0);
    const maxK = showAllExamSteps
      ? kruskalRows.length
      : Math.min(kruskalRows.length, Math.max(1, safeStepIdx + 1));

    return (
      <div className="space-y-6">
        {/* Top: Graph Visualizer + Reference Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {currentStep?.graphView && (
            <div className="lg:col-span-7">
              {renderGraphVisualizer(currentStep.graphView, !isDarkSheet)}
            </div>
          )}
          <div className={currentStep?.graphView ? 'lg:col-span-5' : 'lg:col-span-12'}>
            {renderExamReferenceBox(isDarkSheet)}
          </div>
        </div>

        {/* Doctor's Kruskal Execution Table (Sorted Edges + Decision) */}
        <div className="space-y-2">
          <div className={`font-serif text-sm sm:text-base font-bold italic ${isDarkSheet ? 'text-white' : 'text-black'}`}>
            Kruskal's Algorithm Sorted Edges Table (Official KAU Exam Solution Format):
          </div>

          <div className="overflow-x-auto">
            <table className={`w-full border-collapse border-2 ${isDarkSheet ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-black bg-white text-black'} font-mono text-xs sm:text-sm text-center`}>
              <thead>
                <tr className={isDarkSheet ? 'bg-slate-950 text-slate-200 border-b border-slate-700' : 'bg-black text-white'}>
                  <th className="border border-slate-500 px-3 py-1.5 font-bold">k</th>
                  <th className="border border-slate-500 px-3 py-1.5 font-bold">Edge e</th>
                  <th className="border border-slate-500 px-3 py-1.5 font-bold">Weight w</th>
                  <th className="border border-slate-500 px-4 py-1.5 font-bold text-left">Comp(u)</th>
                  <th className="border border-slate-500 px-4 py-1.5 font-bold text-left">Comp(v)</th>
                  <th className="border border-slate-500 px-4 py-1.5 font-bold text-left font-sans">Action / Decision</th>
                  <th className="border border-slate-500 px-3 py-1.5 font-bold">Running MST Weight</th>
                </tr>
              </thead>
              <tbody>
                {kruskalRows.slice(0, maxK).map((row, rIdx) => {
                  const isLatest = rIdx === maxK - 1 && !showAllExamSteps;
                  return (
                    <tr
                      key={rIdx}
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentStepIdx(Math.min(steps.length - 1, rIdx + 1));
                      }}
                      className={`cursor-pointer transition ${
                        isLatest
                          ? isDarkSheet
                            ? 'bg-rose-950/40 ring-1 ring-rose-500'
                            : 'bg-red-50/70 ring-1 ring-red-400'
                          : isDarkSheet
                          ? 'hover:bg-slate-800'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className={`border ${isDarkSheet ? 'border-slate-800' : 'border-black'} px-3 py-1.5 font-bold`}>
                        {row.k}
                      </td>
                      <td className={`border ${isDarkSheet ? 'border-slate-800' : 'border-black'} px-3 py-1.5 font-extrabold ${row.isAccepted ? (isDarkSheet ? 'text-rose-400' : 'text-[#dc2626]') : isDarkSheet ? 'text-slate-400' : 'text-slate-600'}`}>
                        {row.edgeStr}
                      </td>
                      <td className={`border ${isDarkSheet ? 'border-slate-800' : 'border-black'} px-3 py-1.5 font-bold`}>
                        {row.weight}
                      </td>
                      <td className={`border ${isDarkSheet ? 'border-slate-800 text-left' : 'border-black text-left'} px-4 py-1.5 font-bold ${isDarkSheet ? 'text-slate-300' : 'text-slate-700'}`}>
                        {row.compU}
                      </td>
                      <td className={`border ${isDarkSheet ? 'border-slate-800 text-left' : 'border-black text-left'} px-4 py-1.5 font-bold ${isDarkSheet ? 'text-slate-300' : 'text-slate-700'}`}>
                        {row.compV}
                      </td>
                      <td className={`border ${isDarkSheet ? 'border-slate-800 text-left font-sans' : 'border-black text-left font-sans'} px-4 py-1.5 font-bold ${row.isAccepted ? (isDarkSheet ? 'text-rose-400' : 'text-[#dc2626]') : isDarkSheet ? 'text-slate-500 line-through' : 'text-slate-400 line-through'}`}>
                        {row.decision}
                      </td>
                      <td className={`border ${isDarkSheet ? 'border-slate-800' : 'border-black'} px-3 py-1.5 font-extrabold ${isDarkSheet ? 'text-amber-300' : 'text-slate-900'}`}>
                        {row.runningWeight}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Part (b) MST Edges & Total Weight */}
        {(maxK >= kruskalRows.length || safeStepIdx >= steps.length - 1 || showAllExamSteps) && (
          <div className={`border-t-2 ${isDarkSheet ? 'border-slate-700 text-slate-100' : 'border-slate-300 text-black'} pt-4 space-y-2 font-serif text-sm sm:text-base`}>
            <div>
              <span className="font-bold">Minimum Spanning Tree Edges E_T: </span>
              <span className={`font-mono font-extrabold ${isDarkSheet ? 'text-rose-400' : 'text-[#dc2626]'} text-base`}>
                {`{ ${ET.map((e) => `(${e.u}, ${e.v})`).join(', ')} }`}
              </span>
            </div>
            <div>
              <span className="font-bold">Total MST Weight: </span>
              <span className={`font-mono font-extrabold ${isDarkSheet ? 'text-rose-400' : 'text-[#dc2626]'} text-lg`}>
                {ET.map((e) => e.w).join(' + ')} = {totalWeight}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==========================================================================
  // COMPARISON COUNTING SORT OFFICIAL EXAM SOLUTION (Fall 2020 Midterm Q1)
  // ==========================================================================
  const renderComparisonCountingExamPaperSolution = () => {
    const rawArrStr =
      givenInputSource.array || customInputs.array || '60, 35, 81, 98, 14, 47';
    const arr = rawArrStr
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);
    const n = arr.length;
    const Count = new Array<number>(n).fill(0);
    interface CCSComp {
      i: number;
      j: number;
      winner: string;
      cSnap: number[];
    }
    const comps: CCSComp[] = [];

    for (let i = 0; i < n - 1; i++) {
      for (let j = i + 1; j < n; j++) {
        if (arr[i] < arr[j]) {
          Count[j]++;
          comps.push({ i, j, winner: `A[${i}] < A[${j}] (${arr[i]} < ${arr[j]}) → Count[${j}]++`, cSnap: [...Count] });
        } else {
          Count[i]++;
          comps.push({ i, j, winner: `A[${i}] ≥ A[${j}] (${arr[i]} ≥ ${arr[j]}) → Count[${i}]++`, cSnap: [...Count] });
        }
      }
    }

    const S = new Array<number>(n);
    for (let i = 0; i < n; i++) {
      S[Count[i]] = arr[i];
    }

    const maxC = showAllExamSteps
      ? comps.length
      : Math.min(comps.length, Math.max(1, safeStepIdx + 1));

    return (
      <div className="space-y-8">
        {/* ================================================================ */}
        {/* PAGE 1: ALGORITHM REFERENCE + ARRAY A + PAIRWISE COMPARISONS     */}
        {/* ================================================================ */}
        <div className="space-y-6">
          <div className={`flex items-center justify-between border-b-2 ${isDarkSheet ? 'border-slate-800' : 'border-slate-300'} pb-2`}>
            <span className={`font-serif text-xs font-bold uppercase tracking-wider ${isDarkSheet ? 'text-slate-400' : 'text-slate-600'}`}>
              📄 Examination Sheet — Page 1 of 2
            </span>
            <span className={`font-serif text-xs font-semibold ${isDarkSheet ? 'text-slate-500' : 'text-slate-500'}`}>
              Section 1: Pairwise Comparisons &amp; Count Increments
            </span>
          </div>

          {/* Reference Box (Full Width, Centered) */}
          <div className="mx-auto max-w-2xl">{renderExamReferenceBox(isDarkSheet)}</div>

          {/* Given Array A */}
          <div className="space-y-1.5">
            <div className={`font-serif text-sm font-bold italic ${isDarkSheet ? 'text-slate-100' : 'text-black'}`}>
              Given Input Array A[0..{n - 1}]:
            </div>
            <div className="overflow-x-auto">
              <table className={`w-full border-collapse border-2 ${isDarkSheet ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-black bg-white text-black'} font-mono text-xs sm:text-sm text-center`}>
                <thead>
                  <tr className={isDarkSheet ? 'bg-slate-950 text-slate-300' : 'bg-slate-100 text-slate-700'}>
                    <th className={`border ${isDarkSheet ? 'border-slate-700' : 'border-black'} px-3 py-1 font-bold text-left`}>
                      Index i
                    </th>
                    {arr.map((_, idx) => (
                      <th key={idx} className={`min-w-[42px] border ${isDarkSheet ? 'border-slate-700' : 'border-black'} px-3 py-1 font-bold`}>
                        {idx}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={`border ${isDarkSheet ? 'border-slate-700' : 'border-black'} px-3 py-1.5 font-bold text-left`}>
                      A[i]
                    </td>
                    {arr.map((v, idx) => (
                      <td key={idx} className={`border ${isDarkSheet ? 'border-slate-700' : 'border-black'} px-3 py-1.5 font-bold ${isDarkSheet ? 'text-amber-300' : 'text-slate-900'}`}>
                        {v}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Doctor's Pairwise Comparisons & Count Tracking */}
          <div className="space-y-2">
            <div className={`font-serif text-sm sm:text-base font-bold italic ${isDarkSheet ? 'text-white' : 'text-black'}`}>
              Pairwise Element Comparisons (i = 0 to {n - 2}, j = i + 1 to {n - 1}):
            </div>

            <div className="overflow-x-auto">
              <table className={`w-full border-collapse border-2 ${isDarkSheet ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-black bg-white text-black'} font-mono text-xs sm:text-sm text-center`}>
                <thead>
                  <tr className={isDarkSheet ? 'bg-slate-950 text-slate-200 border-b border-slate-700' : 'bg-black text-white'}>
                    <th className="border border-slate-500 px-3 py-1.5 font-bold">Step</th>
                    <th className="border border-slate-500 px-3 py-1.5 font-bold">Comparison</th>
                    <th className="border border-slate-500 px-4 py-1.5 text-left font-sans font-bold">Outcome</th>
                    {arr.map((v, k) => (
                      <th key={k} className="border border-slate-500 px-2 py-1.5 font-bold">
                        Count[{k}] ({v})
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comps.slice(0, maxC).map((c, idx) => (
                    <tr
                      key={idx}
                      className={`transition ${
                        idx === maxC - 1 && !showAllExamSteps
                          ? isDarkSheet
                            ? 'bg-rose-950/40 ring-1 ring-rose-500'
                            : 'bg-red-50/70 ring-1 ring-red-400'
                          : isDarkSheet
                          ? 'hover:bg-slate-800'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className={`border ${isDarkSheet ? 'border-slate-800' : 'border-black'} px-3 py-1 font-bold`}>
                        {idx + 1}
                      </td>
                      <td className={`border ${isDarkSheet ? 'border-slate-800' : 'border-black'} px-3 py-1 font-bold ${isDarkSheet ? 'text-amber-300' : 'text-slate-900'}`}>
                        A[{c.i}] vs A[{c.j}]
                      </td>
                      <td className={`border ${isDarkSheet ? 'border-slate-800 text-left font-sans' : 'border-black text-left font-sans'} px-4 py-1 font-bold ${isDarkSheet ? 'text-rose-400' : 'text-[#dc2626]'}`}>
                        {c.winner}
                      </td>
                      {c.cSnap.map((cnt, k) => (
                        <td key={k} className={`border ${isDarkSheet ? 'border-slate-800' : 'border-black'} px-2 py-1 font-extrabold ${isDarkSheet ? 'text-slate-200' : 'text-black'}`}>
                          {cnt}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* REALISTIC EXAM SHEET PAGE DIVIDER                                */}
        {/* ================================================================ */}
        <div className="relative my-8 text-center">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className={`w-full border-t-2 border-dashed ${isDarkSheet ? 'border-slate-700' : 'border-slate-400'}`} />
          </div>
          <div className="relative flex justify-center">
            <span className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs sm:text-sm font-serif font-bold uppercase tracking-wider shadow-sm ${
              isDarkSheet
                ? 'bg-slate-800 text-rose-400 border border-slate-700'
                : 'bg-white text-slate-800 border-2 border-slate-400'
            }`}>
              📄 Examination Sheet — Page 2 of 2 (Sorted Array S[0..{n - 1}])
            </span>
          </div>
        </div>

        {/* ================================================================ */}
        {/* PAGE 2: FINAL COUNTS + SORTED ARRAY S                            */}
        {/* ================================================================ */}
        <div className="space-y-6">
          <div className={`flex items-center justify-between border-b-2 ${isDarkSheet ? 'border-slate-800' : 'border-slate-300'} pb-2`}>
            <span className={`font-serif text-xs font-bold uppercase tracking-wider ${isDarkSheet ? 'text-slate-400' : 'text-slate-600'}`}>
              📄 Examination Sheet — Page 2 of 2
            </span>
            <span className={`font-serif text-xs font-semibold ${isDarkSheet ? 'text-slate-500' : 'text-slate-500'}`}>
              Section 2: Placement S[Count[i]] ← A[i] &amp; Final Result
            </span>
          </div>

          {(maxC >= comps.length || safeStepIdx >= steps.length - 1 || showAllExamSteps) ? (
            <div className={`rounded-lg border-2 ${isDarkSheet ? 'border-rose-600/70 bg-rose-950/25 text-slate-100' : 'border-black bg-slate-50 text-black'} p-5 space-y-3 font-serif`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-sm sm:text-base">
                  Final Output written on Exam Sheet:
                </span>
                <span className={`rounded border px-2.5 py-0.5 text-xs font-extrabold ${isDarkSheet ? 'border-rose-500 text-rose-300 bg-slate-900' : 'border-[#dc2626] text-[#dc2626] bg-white'}`}>
                  ✓ Full Credit (10/10 pts)
                </span>
              </div>
              <div className="space-y-1">
                <div>
                  <span className="font-bold">Final Count Array: </span>
                  <span className={`font-mono font-extrabold ${isDarkSheet ? 'text-amber-300' : 'text-slate-900'} text-base`}>
                    [{Count.join(', ')}]
                  </span>
                </div>
                <div>
                  <span className="font-bold">Sorted Array S[0..{n - 1}] (S[Count[i]] ← A[i]): </span>
                  <span className={`font-mono font-extrabold ${isDarkSheet ? 'text-rose-400' : 'text-[#dc2626]'} text-lg`}>
                    [{S.join(', ')}]
                  </span>
                </div>
              </div>
              <div className={`font-sans text-xs ${isDarkSheet ? 'text-slate-400' : 'text-slate-600'}`}>
                Zero swaps required: each record moved exactly once directly to its final sorted index.
              </div>
            </div>
          ) : (
            <div className={`border-2 border-dashed ${isDarkSheet ? 'border-slate-800 text-slate-400' : 'border-slate-300 text-slate-600'} rounded-lg p-6 text-center font-sans text-xs italic`}>
              Complete comparisons on Page 1 to reveal the final placement array S[0..{n - 1}]. Click <strong>Next Step ▶</strong> or <strong>Show Full Solved Paper</strong>!
            </div>
          )}
        </div>
      </div>
    );
  };

  // ==========================================================================
  // MASTER KAU EXAM PAPER & SIMULATOR COMPONENT (Paper & Dark Studio Themes)
  // ==========================================================================
  const renderOfficialWhiteExamPaper = () => {
    const isSpecialCoinRow = algorithm.id === 'coin-row';
    const isSpecialChangeMaking = algorithm.id === 'change-making';
    const isSpecialStringMatching =
      algorithm.id === 'horspool' ||
      algorithm.id === 'boyer-moore' ||
      algorithm.id === 'brute-force-sm';
    const isSpecialFloydWarshall = algorithm.id === 'floyd' || algorithm.id === 'warshall';
    const isSpecialPrim = algorithm.id === 'prim';
    const isSpecialDijkstra = algorithm.id === 'dijkstra';
    const isSpecialKnapsack = algorithm.id === 'knapsack-01';
    const isSpecialDistributionCounting =
      algorithm.id === 'distribution-counting-sort' ||
      algorithm.id === 'distribution-counting-sort-v1';
    const isSpecialOBST = algorithm.id === 'obst';
    const isSpecialCoinCollecting = algorithm.id === 'coin-collecting';
    const isSpecialKruskal = algorithm.id === 'kruskal';
    const isSpecialComparisonCounting = algorithm.id === 'comparison-counting-sort';

    const maxStep = showAllExamSteps ? steps.length - 1 : safeStepIdx;

    return (
      <div className={`rounded-2xl border-2 ${isDarkSheet ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-slate-400 bg-white text-black'} shadow-2xl overflow-hidden`}>
        {/* Top Exam Sheet Control Ribbon */}
        <div className={`flex flex-wrap items-center justify-end gap-2 border-b-2 ${isDarkSheet ? 'border-slate-800 bg-slate-950 text-slate-300' : 'border-slate-300 bg-slate-100 text-slate-800'} px-4 sm:px-6 py-2.5 text-xs`}>
          <div className="flex flex-wrap items-center gap-2">
            {/* Theme Toggle: White Paper vs Dark Studio */}
            <div className={`flex items-center rounded border ${isDarkSheet ? 'border-slate-700 bg-slate-900' : 'border-slate-400 bg-white'} p-0.5 font-mono text-xs`}>
              <button
                type="button"
                onClick={() => setExamSheetTheme('paper')}
                className={`rounded px-2.5 py-0.5 font-bold transition cursor-pointer ${
                  !isDarkSheet
                    ? 'bg-black text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="View as Printed White Exam Paper"
              >
                📄 White Paper
              </button>
              <button
                type="button"
                onClick={() => setExamSheetTheme('dark')}
                className={`rounded px-2.5 py-0.5 font-bold transition cursor-pointer ${
                  isDarkSheet
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-black'
                }`}
                title="View in Dark Studio Theme (Matches App)"
              >
                🌙 Dark Studio
              </button>
            </div>

            {isRandomExam && (
              <button
                type="button"
                onClick={() => {
                  onGenerateRandomExam();
                  setUserAnswers({});
                  setCheckedPractice(false);
                }}
                className="flex items-center gap-1 rounded border border-violet-600 bg-violet-600 px-2.5 py-1 font-mono text-xs font-bold text-white hover:bg-violet-500 transition cursor-pointer"
              >
                <Shuffle className="h-3.5 w-3.5" />
                New Random Question
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowAllExamSteps((prev) => !prev)}
              className={`rounded border px-2.5 py-1 font-mono text-xs font-bold transition cursor-pointer ${
                isDarkSheet
                  ? 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
                  : 'border-slate-400 bg-white text-slate-800 hover:bg-slate-200'
              }`}
            >
              {showAllExamSteps ? 'Step-by-Step Table Mode' : `Show Full Solved Paper (${steps.length} Steps)`}
            </button>
            <button
              type="button"
              onClick={() => setExamPaperViewMode(false)}
              className="rounded border border-slate-700 bg-slate-800 px-2.5 py-1 font-mono text-xs font-semibold text-white hover:bg-slate-700 transition cursor-pointer"
            >
              Switch to Dark Slide View
            </button>
          </div>
        </div>

        {/* Main Exam Sheet Body */}
        <div className="p-5 sm:p-8 space-y-6">
          {/* 1. Official KAU Question Header & Problem Statement */}
          <div className={`space-y-3 border-b-2 ${isDarkSheet ? 'border-slate-800' : 'border-slate-300'} pb-5`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className={`font-serif text-lg sm:text-xl font-bold ${isDarkSheet ? 'text-white' : 'text-black'}`}>
                {examPaperTitle.includes('Question') || examPaperTitle.includes('Q')
                  ? examPaperTitle
                  : `Question: ${examPaperTitle}`}
              </h2>
              <span className="font-serif text-base sm:text-lg font-bold text-[#3b82f6]">
                ({examPaperMarks.replace(/Marks/i, 'pts')})
              </span>
            </div>

            <p className={`font-serif text-sm sm:text-base leading-relaxed ${isDarkSheet ? 'text-slate-200' : 'text-black'}`}>
              {cleanExamPrompt}
            </p>

            {/* Compact Given Data on Exam Sheet (Only for generated random exams) */}
            {isRandomExam && givenExamParameters.length > 0 && (
              <div className={`flex flex-wrap items-center gap-x-6 gap-y-1.5 rounded border ${isDarkSheet ? 'border-slate-700 bg-slate-950 text-slate-200' : 'border-slate-300 bg-slate-50 text-black'} px-3.5 py-2 font-serif text-xs sm:text-sm`}>
                {givenExamParameters.map((param, pIdx) => (
                  <div key={pIdx}>
                    <span className="font-bold">{param.label}: </span>
                    <span className={`font-mono font-bold ${isDarkSheet ? 'text-amber-300' : 'text-slate-900'}`}>{param.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Sub-questions (a), (b) printed in italic bold only if authentic subquestions exist */}
            {cleanSubQuestions().length > 0 && (
              <div className={`space-y-1 pl-2 font-serif text-xs sm:text-sm font-bold italic ${isDarkSheet ? 'text-slate-300' : 'text-slate-900'}`}>
                {cleanSubQuestions().map((sq, idx) => (
                  <div key={idx}>{sq}</div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Red Centered "SOLUTION" Header + Step Indicator Bar */}
          <div className="space-y-3">
            <div className={`text-center font-serif text-base sm:text-lg font-extrabold tracking-wider ${isDarkSheet ? 'text-rose-400' : 'text-[#dc2626]'} underline`}>
              SOLUTION
            </div>

            {/* Active Step Bar on Paper */}
            <div className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border ${isDarkSheet ? 'border-rose-900/60 bg-rose-950/20 text-slate-200' : 'border-red-200 bg-red-50/60 text-black'} px-4 py-2.5`}>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-[#dc2626] px-2 py-0.5 font-mono text-xs font-extrabold text-white">
                    STEP {safeStepIdx + 1} / {steps.length}
                  </span>
                  <span className={`font-serif text-sm sm:text-base font-bold ${isDarkSheet ? 'text-white' : 'text-black'}`}>
                    {currentStep?.title}
                  </span>
                </div>
                {currentStep?.formula && (
                  <div className={`font-mono text-xs sm:text-sm font-extrabold ${isDarkSheet ? 'text-rose-400' : 'text-[#dc2626]'}`}>
                    {currentStep.formula}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={safeStepIdx <= 0}
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStepIdx((p) => Math.max(0, p - 1));
                  }}
                  className={`rounded border px-3 py-1 font-mono text-xs font-bold transition disabled:opacity-40 cursor-pointer ${
                    isDarkSheet
                      ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                      : 'border-slate-400 bg-white text-black hover:bg-slate-100'
                  }`}
                >
                  ◀ Prev Step
                </button>
                <button
                  type="button"
                  disabled={safeStepIdx >= steps.length - 1}
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStepIdx((p) => Math.min(steps.length - 1, p + 1));
                  }}
                  className="rounded bg-[#dc2626] px-3.5 py-1 font-mono text-xs font-bold text-white hover:bg-red-700 disabled:opacity-40 cursor-pointer"
                >
                  Next Step ▶
                </button>
              </div>
            </div>
          </div>

          {/* 3. Algorithm-Specific Exact Exam Paper Solution Body */}
          {isSpecialCoinRow ? (
            renderCoinRowExamPaperSolution()
          ) : isSpecialChangeMaking ? (
            renderChangeMakingExamPaperSolution()
          ) : isSpecialStringMatching ? (
            renderStringMatchingExamPaperSolution()
          ) : isSpecialFloydWarshall ? (
            renderFloydWarshallExamPaperSolution()
          ) : isSpecialPrim ? (
            renderPrimExamPaperSolution()
          ) : isSpecialDijkstra ? (
            renderDijkstraExamPaperSolution()
          ) : isSpecialKnapsack ? (
            renderKnapsackExamPaperSolution()
          ) : isSpecialDistributionCounting ? (
            renderDistributionCountingExamPaperSolution()
          ) : isSpecialOBST ? (
            renderOBSTExamPaperSolution()
          ) : isSpecialCoinCollecting ? (
            renderCoinCollectingExamPaperSolution()
          ) : isSpecialKruskal ? (
            renderKruskalExamPaperSolution()
          ) : isSpecialComparisonCounting ? (
            renderComparisonCountingExamPaperSolution()
          ) : (
            <div className="space-y-6">
              {/* Top Row: Visual Diagram (if any) + Reference Formula/Algorithm Box ONLY */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {currentStep?.graphView ? (
                  <>
                    <div className="lg:col-span-7">
                      {renderGraphVisualizer(currentStep.graphView, !isDarkSheet)}
                    </div>
                    <div className="lg:col-span-5">{renderExamReferenceBox(isDarkSheet)}</div>
                  </>
                ) : (
                  <div className="lg:col-span-12 max-w-2xl mx-auto w-full">
                    {renderExamReferenceBox(isDarkSheet)}
                  </div>
                )}
              </div>

              {/* Tree / State-Space Diagrams (if present) */}
              {currentStep?.obstTreeView && renderOBSTTreeConstructionView(currentStep.obstTreeView)}
              {currentStep?.bTreeView && (
                <div className="rounded-xl border-2 border-black bg-slate-900 p-4">
                  <div className="flex justify-center overflow-x-auto py-2">
                    {renderBTreeDiagram(currentStep.bTreeView.root, currentStep.bTreeView.order)}
                  </div>
                </div>
              )}
              {currentStep?.huffmanView && renderHuffmanVisualizer(currentStep.huffmanView)}
              {currentStep?.stateSpaceTreeView &&
                renderStateSpaceTreeVisualizer(currentStep.stateSpaceTreeView)}

              {/* Exam Tables (Solid Header | Cells | Bold Red Solved Entries) */}
              {currentStep?.tables && currentStep.tables.length > 0 && (
                <div className="space-y-5">
                  {currentStep.tables.map((tbl) => renderExamPaperTable(tbl, false, isDarkSheet))}
                </div>
              )}

              {/* Progressive Step-by-Step Calculations Written on the Exam Paper */}
              <div className={`border-t-2 ${isDarkSheet ? 'border-slate-800' : 'border-slate-300'} pt-4 space-y-2`}>
                <div className={`font-serif text-sm font-bold underline ${isDarkSheet ? 'text-white' : 'text-black'}`}>
                  Calculations &amp; Step-by-Step Trace (Steps 1 to {maxStep + 1}):
                </div>
                <div className="space-y-1.5 font-mono text-xs sm:text-sm">
                  {steps.slice(0, maxStep + 1).map((st, idx) => {
                    const isCurr = idx === safeStepIdx && !showAllExamSteps;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setIsPlaying(false);
                          setCurrentStepIdx(idx);
                        }}
                        className={`rounded border px-3 py-1.5 cursor-pointer transition ${
                          isCurr
                            ? isDarkSheet
                              ? 'border-rose-500 bg-rose-950/40 font-bold'
                              : 'border-red-500 bg-red-50/80 font-bold'
                            : isDarkSheet
                            ? 'border-slate-800 bg-slate-950 hover:bg-slate-800'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <span className={`font-bold mr-2 ${isDarkSheet ? 'text-slate-200' : 'text-black'}`}>
                          Step {idx + 1} ({st.title}):
                        </span>
                        <span className={`font-extrabold ${isDarkSheet ? 'text-rose-400' : 'text-[#dc2626]'}`}>
                          {st.formula || st.outputString || st.explanation}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Final Boxed Exam Answer at the Bottom of the Sheet */}
          {(safeStepIdx === steps.length - 1 || showAllExamSteps) && (
            <div className={`mt-4 rounded-lg border-2 ${isDarkSheet ? 'border-rose-600/70 bg-rose-950/25' : 'border-[#dc2626] bg-red-50/60'} p-4 flex flex-wrap items-center justify-between gap-3`}>
              <div className="space-y-0.5">
                <div className={`font-serif text-xs font-bold uppercase tracking-wider ${isDarkSheet ? 'text-slate-200' : 'text-black'}`}>
                  Final Answer on Exam Sheet:
                </div>
                <div className={`font-mono text-sm sm:text-base font-extrabold ${isDarkSheet ? 'text-rose-400' : 'text-[#dc2626]'}`}>
                  {finalExamAnswerSummary}
                </div>
              </div>
              <span className={`rounded border ${isDarkSheet ? 'border-rose-600 bg-slate-900 text-rose-300' : 'border-[#dc2626] bg-white text-[#dc2626]'} px-3 py-1 font-serif text-xs font-extrabold`}>
                ✓ Full Credit ({examPaperMarks})
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Top Bar: Examples Library + Custom Sandbox + Exam Practice Toggle */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Curated Examples Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
              Examples Library:
            </span>
            {algorithm.examples.map((ex) => {
              const isSelected = selectedExampleId === ex.id && !showCustomSandbox;
              const badgeColor =
                ex.badge === 'Past Exam'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : ex.badge === 'Slide Example'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                    : ex.badge === 'Edge Case'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

              return (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => {
                    setShowCustomSandbox(false);
                    onSelectExample(ex.id);
                  }}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-500/20 text-white shadow-xs'
                      : 'border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <span className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${badgeColor}`}>
                    {ex.badge}
                  </span>
                  <span>{ex.name}</span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => {
                onGenerateRandomExam();
                setUserAnswers({});
                setCheckedPractice(false);
                if (practiceMode) {
                  setTimeout(() => setCurrentStepIdx(9999), 0);
                }
              }}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                selectedExampleId === 'random-exam'
                  ? 'border-violet-400 bg-violet-500/25 text-violet-100 shadow-sm ring-1 ring-violet-400/50'
                  : 'border-violet-500/40 bg-violet-500/15 text-violet-200 hover:bg-violet-500/25'
              }`}
              title="Generate a brand-new random question in Official KAU Exam Paper format"
            >
              <Shuffle className="h-3.5 w-3.5 text-violet-300" />
              Random Exam Question
            </button>

            <button
              type="button"
              onClick={() => setShowCustomSandbox((prev) => !prev)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                showCustomSandbox
                  ? 'border-emerald-500 bg-emerald-500/20 text-emerald-200'
                  : 'border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-700'
              }`}
            >
              <Sliders className="h-3.5 w-3.5 text-emerald-400" />
              Custom Sandbox
            </button>
          </div>

          {/* Interactive Exam Practice ("Test Yourself") Toggle */}
          <button
            type="button"
            onClick={handleTogglePracticeMode}
            className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition ${
              practiceMode
                ? 'border-amber-400 bg-amber-500/20 text-amber-200 shadow-sm'
                : 'border-indigo-500/40 bg-indigo-500/10 text-indigo-200 hover:bg-indigo-500/20'
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            {practiceMode ? 'Exit "Test Yourself" Exam Simulator' : 'Test Yourself (Exam Table Practice)'}
          </button>
        </div>

        {/* Custom Sandbox Drawer */}
        {showCustomSandbox && (
          <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Custom Input Sandbox — Enter Your Own Arrays, Strings, or Matrices
              </h5>
              <span className="font-mono text-xs text-slate-400">{algorithm.indexingRule}</span>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {algorithm.customFields.map((field) => (
                <div key={field.key}>
                  <label className="mb-1 block text-xs font-medium text-slate-300">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={customInputs[field.key] ?? ''}
                    placeholder={field.placeholder}
                    onChange={(e) => onCustomInputChange(field.key, e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-xs text-slate-100 outline-none focus:border-emerald-500"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">{field.helpText}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={onApplyCustomInputs}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Run Dynamic Trace on Custom Input
              </button>
            </div>
          </div>
        )}

        {/* Exam Practice Banner */}
        {practiceMode && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3">
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wide text-amber-300">
                Interactive Exam Simulator ("Test Yourself" Mode Active)
              </h5>
              <p className="text-xs text-slate-300">
                Type the computed values into the table cells below and click <strong>Validate Exam Answers</strong>.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {checkedPractice && (
                <span className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-xs font-bold text-slate-100">
                  Score: {correctEditable} / {totalEditable}
                </span>
              )}
              <button
                type="button"
                onClick={() => setCheckedPractice(true)}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Validate Exam Answers
              </button>
              <button
                type="button"
                onClick={handleFillSampleAnswers}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
              >
                <Eye className="h-3.5 w-3.5" />
                Reveal Solution
              </button>
              <button
                type="button"
                onClick={() => {
                  setUserAnswers({});
                  setCheckedPractice(false);
                }}
                className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
              >
                <XCircle className="h-3.5 w-3.5" />
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Playback Controls & Step Progress Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              if (isBadSymbolTraceActive) {
                setBadSymbolStepIdx(0);
              } else if (isGoodSuffixTraceActive) {
                setGoodSuffixK(1);
              } else {
                setCurrentStepIdx(0);
              }
            }}
            title="Reset to First Step"
            className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-200 hover:bg-slate-700 disabled:opacity-40"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={
              isBadSymbolTraceActive
                ? badSymbolStepIdx <= 0
                : isGoodSuffixTraceActive
                ? goodSuffixK <= 1
                : safeStepIdx === 0
            }
            onClick={() => {
              setIsPlaying(false);
              if (isBadSymbolTraceActive) {
                setBadSymbolStepIdx((p) => Math.max(0, p - 1));
              } else if (isGoodSuffixTraceActive) {
                setGoodSuffixK((p) => Math.max(1, p - 1));
              } else {
                setCurrentStepIdx((p) => Math.max(0, p - 1));
              }
            }}
            title="Previous Step (Left Arrow ←)"
            className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-200 hover:bg-slate-700 disabled:opacity-40"
          >
            <SkipBack className="h-4 w-4" />
          </button>
          {!isBadSymbolTraceActive && !isGoodSuffixTraceActive && (
            <button
              type="button"
              onClick={() => {
                if (safeStepIdx >= steps.length - 1) {
                  setCurrentStepIdx(0);
                  setIsPlaying(true);
                } else {
                  setIsPlaying((p) => !p);
                }
              }}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? 'Pause' : 'Play Trace'}
            </button>
          )}
          <button
            type="button"
            disabled={
              isBadSymbolTraceActive
                ? badSymbolStepIdx >= subTraceM
                : isGoodSuffixTraceActive
                ? goodSuffixK >= subTraceM - 1
                : safeStepIdx >= steps.length - 1
            }
            onClick={() => {
              setIsPlaying(false);
              if (isBadSymbolTraceActive) {
                setBadSymbolStepIdx((p) => Math.min(subTraceM, p + 1));
              } else if (isGoodSuffixTraceActive) {
                setGoodSuffixK((p) => Math.min(subTraceM - 1, p + 1));
              } else {
                setCurrentStepIdx((p) => Math.min(steps.length - 1, p + 1));
              }
            }}
            title="Next Step (Right Arrow →)"
            className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-200 hover:bg-slate-700 disabled:opacity-40"
          >
            <SkipForward className="h-4 w-4" />
          </button>
          <span className="hidden sm:inline-flex items-center gap-1.5 ml-1 px-2.5 py-1 rounded-md border border-slate-700/80 bg-slate-950/80 font-mono text-[11px] text-slate-300">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700 font-bold">←</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700 font-bold">→</kbd>
            <span>
              {isBadSymbolTraceActive
                ? 'Controlling Bad-Symbol Trace'
                : isGoodSuffixTraceActive
                ? 'Controlling Good-Suffix Trace'
                : 'Arrow Keys'}
            </span>
          </span>
        </div>

        {/* Step Scrubber */}
        <div className="flex flex-1 items-center gap-3 px-2">
          {isBadSymbolTraceActive ? (
            <>
              <span className="whitespace-nowrap font-mono text-xs font-semibold text-indigo-300">
                Bad-Symbol Step {badSymbolStepIdx} / {subTraceM}
              </span>
              <input
                type="range"
                min={0}
                max={Math.max(0, subTraceM)}
                value={Math.min(badSymbolStepIdx, subTraceM)}
                onChange={(e) => setBadSymbolStepIdx(Number(e.target.value))}
                className="h-1.5 flex-1 cursor-pointer accent-indigo-500"
              />
            </>
          ) : isGoodSuffixTraceActive ? (
            <>
              <span className="whitespace-nowrap font-mono text-xs font-semibold text-emerald-300">
                Good-Suffix k = {goodSuffixK} / {subTraceM - 1}
              </span>
              <input
                type="range"
                min={1}
                max={Math.max(1, subTraceM - 1)}
                value={Math.min(Math.max(1, goodSuffixK), subTraceM - 1)}
                onChange={(e) => {
                  setGoodSuffixK(Number(e.target.value));
                }}
                className="h-1.5 flex-1 cursor-pointer accent-emerald-500"
              />
            </>
          ) : (
            <>
              <span className="whitespace-nowrap font-mono text-xs font-semibold text-indigo-300">
                Step {safeStepIdx + 1} / {steps.length}
              </span>
              <input
                type="range"
                min={0}
                max={Math.max(0, steps.length - 1)}
                value={safeStepIdx}
                onChange={(e) => {
                  setIsPlaying(false);
                  setCurrentStepIdx(Number(e.target.value));
                }}
                className="h-1.5 flex-1 cursor-pointer accent-indigo-500"
              />
            </>
          )}
        </div>

        {/* Speed Control */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Speed:</span>
          {[
            { label: '0.5×', ms: 1500 },
            { label: '1×', ms: 900 },
            { label: '2×', ms: 420 },
          ].map((sp) => (
            <button
              key={sp.label}
              type="button"
              onClick={() => setSpeedMs(sp.ms)}
              className={`rounded px-2 py-1 font-mono text-xs font-medium ${
                speedMs === sp.ms
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {sp.label}
            </button>
          ))}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TRUE WHITE KAU EXAM PAPER VIEW (Active by Default for Exam Questions) */}
      {/* ==================================================================== */}
      {showExamPaperWorksheet && examPaperViewMode ? (
        renderOfficialWhiteExamPaper()
      ) : (
        <>
          {showExamPaperWorksheet && !examPaperViewMode && (
            <div className="flex items-center justify-between rounded-xl border border-amber-500/40 bg-amber-950/30 px-4 py-2.5">
              <span className="text-xs font-semibold text-amber-200">
                Currently viewing in Dark Slide Mode. Want to return to the authentic White KAU Exam Paper &amp; Exam Table format?
              </span>
              <button
                type="button"
                onClick={() => setExamPaperViewMode(true)}
                className="rounded-lg bg-white px-3.5 py-1.5 font-mono text-xs font-extrabold text-black shadow hover:bg-slate-100 transition cursor-pointer"
              >
                📄 Return to Official White Exam Paper View
              </button>
            </div>
          )}

          {/* Main Split View: Left = Live Explanation + Data Structures, Right = Synchronized Slide Pseudocode */}
          {currentStep && (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
              {/* Left 8 Columns: Narration + Tables/Visuals */}
              <div className="space-y-5 xl:col-span-8">
                {/* OBST Step-by-Step Tree Construction View (Root Matrix + Binary Tree + Integrated Color Legend FIRST at the top) */}
                {currentStep.obstTreeView && renderOBSTTreeConstructionView(currentStep.obstTreeView)}

                {/* Live Step Explanation Card (Rendered below the OBST tree diagram during tree construction, or at top for regular table steps) */}
                <div className="rounded-xl border border-indigo-500/30 bg-slate-900/95 p-4 shadow-md">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-indigo-600 px-2.5 py-0.5 font-mono text-xs font-bold text-white">
                        STEP {currentStep.stepNumber}
                      </span>
                      <h3 className="text-base font-bold text-white">{currentStep.title}</h3>
                    </div>
                    {currentStep.variables && (
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(currentStep.variables).map(([k, v]) => (
                          <span
                            key={k}
                            className="rounded border border-slate-700 bg-slate-950 px-2 py-0.5 font-mono text-xs text-slate-300"
                          >
                            <strong className="text-indigo-300">{k}:</strong> {v}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <p className="text-sm leading-relaxed text-slate-200">
                    {currentStep.explanation}
                  </p>

                  {currentStep.formula && (
                    <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 font-mono text-xs text-emerald-300">
                      <span className="mr-2 font-semibold uppercase text-slate-400">Formula Evaluation:</span>
                      {currentStep.formula}
                    </div>
                  )}

                  {currentStep.outputString && (
                    <div className="mt-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2 font-mono text-xs font-bold text-emerald-200">
                      {currentStep.outputString}
                    </div>
                  )}
                </div>

                {/* String Alignment View (Brute Force, Horspool, Boyer-Moore) */}
                {currentStep.stringView && renderStringAlignment(currentStep.stringView)}

                {/* OBST Quick Jump to Tree Construction Phase */}
                {algorithm.id === 'obst' && !currentStep.obstTreeView && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#7c6df2]/40 bg-[#7c6df2]/10 px-4 py-3">
                    <div className="text-xs text-slate-200">
                      <strong className="text-[#c4b5fd]">Phase 1 (Diagonal Table Filling):</strong> Fill Cost Table <code>C</code> and Root Table <code>R</code>, or jump directly to <strong>Phase 2 (Step-by-Step Tree Construction from Root Table R)</strong>.
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const firstTreeIdx = steps.findIndex((s) => Boolean(s.obstTreeView));
                        if (firstTreeIdx >= 0) {
                          setIsPlaying(false);
                          setCurrentStepIdx(firstTreeIdx);
                        }
                      }}
                      className="rounded-lg bg-[#7c6df2] hover:bg-[#6d5ce7] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition cursor-pointer"
                    >
                      Skip to Tree Construction (Step 1 of Tree) →
                    </button>
                  </div>
                )}

                {/* B-Tree / OBST Tree View */}
                {currentStep.bTreeView && (
                  <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-100">
                          Tree Structure Visualizer
                        </h4>
                        <p className="text-xs text-slate-400">{currentStep.bTreeView.operationNote}</p>
                      </div>
                      {currentStep.bTreeView.order > 2 && (
                        <span className="rounded border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 font-mono text-xs text-indigo-300">
                          Order m = {currentStep.bTreeView.order} | Min Keys = {currentStep.bTreeView.minKeys} | Max Keys = {currentStep.bTreeView.maxKeys}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-center overflow-x-auto py-2">
                      {renderBTreeDiagram(currentStep.bTreeView.root, currentStep.bTreeView.order)}
                    </div>
                  </div>
                )}

                {/* Huffman Forest Queue & Binary Tree View */}
                {currentStep.huffmanView && renderHuffmanVisualizer(currentStep.huffmanView)}

                {/* Graph View (Prim, Kruskal, Dijkstra, Warshall & Floyd) */}
                {currentStep.graphView && renderGraphVisualizer(currentStep.graphView)}

                {/* State-Space Tree View (Backtracking & Branch-and-Bound) */}
                {currentStep.stateSpaceTreeView &&
                  renderStateSpaceTreeVisualizer(currentStep.stateSpaceTreeView)}

                {/* Data Structure Tables */}
                {currentStep.tables.map((tbl) => renderVisualTable(tbl))}
              </div>

              {/* Right 4 Columns: Synchronized Slide Pseudocode */}
              <div className="space-y-4 xl:col-span-4">
                <div className="sticky top-20 space-y-4">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/95 p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2 border-b border-slate-800 pb-2.5">
                      <Terminal className="h-4 w-4 text-indigo-400" />
                      <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
                        {algorithm.pseudocodeTitle}
                      </h4>
                    </div>
                    <div className="space-y-1 font-mono text-xs">
                      {algorithm.pseudocodeLines.map((line, idx) => {
                        const lineNum = idx + 1;
                        const isActive = currentStep.codeLine === lineNum;
                        return (
                          <div
                            key={lineNum}
                            className={`flex items-start gap-3 rounded-md px-2.5 py-1.5 transition-colors ${
                              isActive
                                ? 'border-l-4 border-indigo-400 bg-indigo-500/20 font-bold text-indigo-100'
                                : 'text-slate-400 hover:bg-slate-800/50'
                            }`}
                          >
                            <span className="w-5 select-none text-right text-[11px] text-slate-500">
                              {lineNum}
                            </span>
                            <span className="whitespace-pre-wrap">{line}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {algorithm.secondaryPseudocodeTitle && algorithm.secondaryPseudocodeLines && (
                    <div className="rounded-xl border border-slate-800 bg-slate-900/95 p-4 shadow-sm">
                      <div className="mb-3 flex items-center gap-2 border-b border-slate-800 pb-2.5">
                        <Terminal className="h-4 w-4 text-emerald-400" />
                        <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
                          {algorithm.secondaryPseudocodeTitle}
                        </h4>
                      </div>
                      <div className="space-y-1 font-mono text-xs">
                        {algorithm.secondaryPseudocodeLines.map((line, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3 rounded-md px-2.5 py-1 text-slate-300"
                          >
                            <span className="w-5 select-none text-right text-[11px] text-slate-500">
                              {idx + 1}
                            </span>
                            <span className="whitespace-pre-wrap">{line}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
