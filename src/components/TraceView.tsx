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
} from '../types/algorithm';

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

  const safeStepIdx = Math.min(Math.max(0, currentStepIdx), Math.max(0, steps.length - 1));
  const currentStep = steps[safeStepIdx] || steps[0];

  // Reset playback and practice state when algorithm or example changes
  useEffect(() => {
    setIsPlaying(false);
    setUserAnswers({});
    setCheckedPractice(false);
    setActiveMistakeTooltip(null);
  }, [algorithm.id, selectedExampleId]);

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

  // Keyboard navigation: Left/Right arrow keys to step backward/forward through the trace
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
        setCurrentStepIdx((prev) => Math.min(Math.max(0, steps.length - 1), prev + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setIsPlaying(false);
        setCurrentStepIdx((prev) => Math.max(0, prev - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [steps.length, setCurrentStepIdx]);

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

  const renderVisualTable = (tbl: VisualTable) => (
    <div
      key={tbl.id}
      className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-sm"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold text-slate-100">{tbl.title}</h4>
          {tbl.subtitle && <p className="text-xs text-slate-400">{tbl.subtitle}</p>}
        </div>
        {tbl.indexBase && (
          <span className="rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 font-mono text-xs font-medium text-indigo-300">
            {tbl.indexBase}
          </span>
        )}
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
    </div>
  );

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
              title="Generate a brand-new random question at Midterm Exam difficulty"
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

        {/* Active Random Exam Question Banner */}
        {selectedExampleId === 'random-exam' && randomExamSummary && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-violet-500/40 bg-violet-950/30 px-3.5 py-2.5">
            <div className="flex items-center gap-2 text-xs">
              <span className="rounded bg-violet-500/30 border border-violet-400/40 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-violet-200">
                Generated Exam Question
              </span>
              <span className="font-mono text-violet-100 font-semibold">{randomExamSummary}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onGenerateRandomExam();
                  setUserAnswers({});
                  setCheckedPractice(false);
                }}
                className="flex items-center gap-1 rounded-md border border-violet-500/40 bg-violet-500/20 px-2.5 py-1 text-xs font-medium text-violet-200 hover:bg-violet-500/30 cursor-pointer"
              >
                <Shuffle className="h-3 w-3" />
                Generate Another
              </button>
              {!practiceMode && (
                <button
                  type="button"
                  onClick={handleTogglePracticeMode}
                  className="flex items-center gap-1 rounded-md border border-amber-500/40 bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-200 hover:bg-amber-500/30 cursor-pointer"
                >
                  <GraduationCap className="h-3.5 w-3.5" />
                  Practice Solving This Table
                </button>
              )}
            </div>
          </div>
        )}

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
                Type the computed values into the table cells below and click <strong>Validate Exam Answers</strong>. Click the <HelpCircle className="inline h-3.5 w-3.5 text-rose-400" /> icon on any red cell to view the exact step-by-step formula explanation!
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
              setCurrentStepIdx(0);
            }}
            title="Reset to Step 1"
            className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-200 hover:bg-slate-700 disabled:opacity-40"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={safeStepIdx === 0}
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIdx((p) => Math.max(0, p - 1));
            }}
            title="Previous Step"
            className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-200 hover:bg-slate-700 disabled:opacity-40"
          >
            <SkipBack className="h-4 w-4" />
          </button>
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
          <button
            type="button"
            disabled={safeStepIdx >= steps.length - 1}
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIdx((p) => Math.min(steps.length - 1, p + 1));
            }}
            title="Next Step (Right Arrow →)"
            className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-200 hover:bg-slate-700 disabled:opacity-40"
          >
            <SkipForward className="h-4 w-4" />
          </button>
          <span className="hidden sm:inline-flex items-center gap-1.5 ml-1 px-2.5 py-1 rounded-md border border-slate-700/80 bg-slate-950/80 font-mono text-[11px] text-slate-300">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700 font-bold">←</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700 font-bold">→</kbd>
            <span>Arrow Keys</span>
          </span>
        </div>

        {/* Step Scrubber */}
        <div className="flex flex-1 items-center gap-3 px-2">
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

            {/* Graph View (Warshall & Floyd) */}
            {currentStep.graphView && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-slate-100">
                    Directed Graph Topology ({currentStep.graphView.nodes.length} Vertices)
                  </h4>
                  {currentStep.graphView.activeK && (
                    <span className="rounded border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 font-mono text-xs font-semibold text-amber-300">
                      Active Intermediate Pivot Vertex k = '{currentStep.graphView.activeK}'
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {currentStep.graphView.edges.map((e, idx) => (
                    <span
                      key={idx}
                      className={`rounded-lg border px-2.5 py-1 font-mono text-xs ${
                        e.from === currentStep.graphView?.activeK || e.to === currentStep.graphView?.activeK
                          ? 'border-amber-500/50 bg-amber-500/15 text-amber-200 font-bold'
                          : 'border-slate-800 bg-slate-950 text-slate-300'
                      }`}
                    >
                      {e.from} ➔ {e.to}
                      {e.weight !== undefined ? ` (w=${e.weight})` : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}

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
    </div>
  );
};
