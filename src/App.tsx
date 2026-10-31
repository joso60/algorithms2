import React, { useState, useMemo, useEffect } from 'react';
import type { AlgorithmId, PillarMode } from './types/algorithm';
import {
  ALL_ALGORITHMS,
  generateTraceForAlgorithm,
  generateRandomExamInputForAlgorithm,
} from './data/curriculumIndex';
import { TraceView } from './components/TraceView';
import { DesignView } from './components/DesignView';
import { AnalyzeView } from './components/AnalyzeView';
import {
  PlayCircle,
  Compass,
  Sigma,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  BookOpen,
  Layers,
  Database,
  GitBranch,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  Ban,
  X,
} from 'lucide-react';

export const App: React.FC = () => {
  const [selectedAlgId, setSelectedAlgId] = useState<AlgorithmId>('obst');
  const [activePillar, setActivePillar] = useState<PillarMode>('trace');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showExclusionsGuide, setShowExclusionsGuide] = useState<boolean>(false);

  const currentAlgorithm = useMemo(
    () => ALL_ALGORITHMS.find((a) => a.id === selectedAlgId) || ALL_ALGORITHMS[0],
    [selectedAlgId]
  );

  // Trace state for current algorithm
  const [selectedExampleId, setSelectedExampleId] = useState<string>(
    currentAlgorithm.examples[0]?.id || ''
  );
  const [customInputs, setCustomInputs] = useState<Record<string, string>>(
    currentAlgorithm.examples[0]?.customInputDefaults || {}
  );
  const [appliedInputs, setAppliedInputs] = useState<Record<string, string>>(
    currentAlgorithm.examples[0]?.customInputDefaults || {}
  );
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [randomExamSummary, setRandomExamSummary] = useState<string | null>(null);

  // Reset example and inputs when algorithm changes
  useEffect(() => {
    const firstEx = currentAlgorithm.examples[0];
    if (firstEx) {
      setSelectedExampleId(firstEx.id);
      setCustomInputs({ ...firstEx.customInputDefaults });
      setAppliedInputs({ ...firstEx.customInputDefaults });
      setCurrentStepIdx(0);
      setRandomExamSummary(null);
    }
  }, [currentAlgorithm]);

  const handleSelectExample = (exampleId: string) => {
    const found = currentAlgorithm.examples.find((ex) => ex.id === exampleId);
    if (found) {
      setSelectedExampleId(found.id);
      setCustomInputs({ ...found.customInputDefaults });
      setAppliedInputs({ ...found.customInputDefaults });
      setCurrentStepIdx(0);
      setRandomExamSummary(null);
    }
  };

  const handleCustomInputChange = (key: string, val: string) => {
    setCustomInputs((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleApplyCustomInputs = () => {
    setSelectedExampleId('custom');
    setAppliedInputs({ ...customInputs });
    setCurrentStepIdx(0);
    setRandomExamSummary(null);
  };

  const handleGenerateRandomExam = () => {
    const generated = generateRandomExamInputForAlgorithm(currentAlgorithm.id);
    setSelectedExampleId('random-exam');
    setCustomInputs({ ...generated.inputs });
    setAppliedInputs({ ...generated.inputs });
    setRandomExamSummary(generated.summaryLabel);
    setCurrentStepIdx(0);
  };

  const traceSteps = useMemo(
    () => generateTraceForAlgorithm(currentAlgorithm.id, appliedInputs),
    [currentAlgorithm.id, appliedInputs]
  );

  const currentIndex = useMemo(
    () => ALL_ALGORITHMS.findIndex((a) => a.id === selectedAlgId),
    [selectedAlgId]
  );

  const filteredAlgorithms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return ALL_ALGORITHMS;
    return ALL_ALGORITHMS.filter(
      (alg) =>
        alg.title.toLowerCase().includes(q) ||
        alg.shortTitle.toLowerCase().includes(q) ||
        alg.categoryLabel.toLowerCase().includes(q) ||
        alg.lectureFile.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const moduleGroups = useMemo(
    () => [
      {
        id: 'input-enhancement',
        title: 'Module 1: Input Enhancement',
        subtitle: 'Space-for-Time Preprocessing',
        icon: <Layers className="w-3.5 h-3.5 text-indigo-400" />,
        algorithms: filteredAlgorithms.filter((a) => a.category === 'input-enhancement'),
      },
      {
        id: 'pre-structuring',
        title: 'Module 2: Pre-Structuring',
        subtitle: 'Hashing & B-Tree Indexing',
        icon: <Database className="w-3.5 h-3.5 text-emerald-400" />,
        algorithms: filteredAlgorithms.filter((a) => a.category === 'pre-structuring'),
      },
      {
        id: 'dynamic-programming',
        title: 'Module 3: Dynamic Programming',
        subtitle: 'Optimization & Memory Functions',
        icon: <GitBranch className="w-3.5 h-3.5 text-violet-400" />,
        algorithms: filteredAlgorithms.filter((a) => a.category === 'dynamic-programming'),
      },
    ],
    [filteredAlgorithms]
  );

  const goPrevAlg = () => {
    if (currentIndex > 0) {
      setSelectedAlgId(ALL_ALGORITHMS[currentIndex - 1].id);
    }
  };

  const goNextAlg = () => {
    if (currentIndex < ALL_ALGORITHMS.length - 1) {
      setSelectedAlgId(ALL_ALGORITHMS[currentIndex + 1].id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Sticky Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-800/90 bg-slate-950/90 backdrop-blur-md">
        <div className="px-4 h-16 flex items-center justify-between gap-4">
          {/* Left: Sidebar Toggle & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
              title={sidebarOpen ? 'Collapse Algorithm Sidebar' : 'Expand Algorithm Sidebar'}
            >
              {sidebarOpen ? (
                <PanelLeftClose className="w-4 h-4" />
              ) : (
                <PanelLeftOpen className="w-4 h-4" />
              )}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/30 to-emerald-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shadow-inner">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm tracking-tight text-white">
                    CPCS-324 Interactive Studio
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Lectures 1–14 + Past Exams
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden md:block">
                  Algorithms &amp; Data Structures II (Levitin) — Space-for-Time Trade-Offs &amp; Dynamic Programming
                </p>
              </div>
            </div>
          </div>

          {/* Center: 3 Core Pillar Mode Tabs */}
          <nav className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActivePillar('trace')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activePillar === 'trace'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>1. TRACE MODE</span>
              <span className="hidden lg:inline text-[10px] font-mono opacity-80">
                (Visualizer &amp; Exam Practice)
              </span>
            </button>

            <button
              onClick={() => setActivePillar('design')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activePillar === 'design'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>2. DESIGN MODE</span>
              <span className="hidden lg:inline text-[10px] font-mono opacity-80">
                (4-Step Blueprints)
              </span>
            </button>

            <button
              onClick={() => setActivePillar('analyze')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activePillar === 'analyze'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sigma className="w-3.5 h-3.5" />
              <span>3. ANALYZE MODE</span>
              <span className="hidden lg:inline text-[10px] font-mono opacity-80">
                (Complexity &amp; Summations)
              </span>
            </button>
          </nav>

          {/* Right: Syllabus Exclusions Button & Prev / Next Algorithm Switcher */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowExclusionsGuide((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                showExclusionsGuide
                  ? 'bg-rose-600 text-white border-rose-400 shadow-sm'
                  : 'bg-rose-950/50 hover:bg-rose-900/60 text-rose-200 border-rose-500/40'
              }`}
              title="View Official Syllabus Exclusions (Files 06, 07, 08, 10, 11, 12) & Past Exam Compliance"
            >
              <Ban className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Syllabus Exclusions &amp; Exam Rules</span>
              <span className="sm:hidden">Exclusions</span>
            </button>

            <div className="hidden xl:flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">
                Topic {currentIndex + 1}/{ALL_ALGORITHMS.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={goPrevAlg}
                  disabled={currentIndex <= 0}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 border border-slate-800 cursor-pointer"
                  title="Previous Algorithm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={goNextAlg}
                  disabled={currentIndex >= ALL_ALGORITHMS.length - 1}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 border border-slate-800 cursor-pointer"
                  title="Next Algorithm"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Collapsible Curriculum Sidebar */}
        {sidebarOpen && (
          <aside className="w-72 shrink-0 border-r border-slate-800/90 bg-slate-950/70 flex flex-col h-[calc(100vh-4rem)] sticky top-16">
            {/* Search Box */}
            <div className="p-3 border-b border-slate-800/80">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter 18 algorithms or lectures..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Module Tree List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-5">
              {moduleGroups.map((group) => (
                <div key={group.id} className="space-y-1.5">
                  <div className="px-2 py-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                      {group.icon}
                      <span>{group.title}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 pl-5">
                      {group.subtitle}
                    </div>
                  </div>

                  <div className="space-y-1">
                    {group.algorithms.map((alg) => {
                      const isSelected = alg.id === selectedAlgId;
                      const examCount = alg.midtermCount ?? 0;
                      const examPapers = alg.midtermPapers ?? [];
                      const sylStatus = alg.syllabusInfo?.status ?? 'required';

                      const badgeStyle =
                        examCount >= 3
                          ? 'bg-rose-500/20 text-rose-200 border-rose-500/40 font-bold'
                          : examCount === 2
                          ? 'bg-amber-500/20 text-amber-200 border-amber-500/40 font-bold'
                          : examCount === 1
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 font-semibold'
                          : 'bg-slate-800/70 text-slate-500 border-slate-700/60';

                      const tooltipText =
                        examCount > 0
                          ? `Appeared ${examCount} time(s) in Midterms: ${examPapers.join(', ')}`
                          : '0 appearances in the 4 Past Midterm Papers (Fall 2020, Spring 2021, Winter 2023, Fall 2025)';

                      return (
                        <button
                          key={alg.id}
                          onClick={() => setSelectedAlgId(alg.id)}
                          className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all flex items-start justify-between gap-2 cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600/20 text-white border border-indigo-500/50 font-semibold shadow-sm'
                              : sylStatus === 'excluded'
                              ? 'text-slate-500 hover:text-slate-300 hover:bg-rose-950/25 border border-rose-500/20 bg-rose-950/10'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/70 border border-transparent'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`truncate ${
                                  sylStatus === 'excluded' ? 'line-through decoration-rose-500/70' : ''
                                }`}
                              >
                                {alg.shortTitle}
                              </span>
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 truncate mt-0.5">
                              {alg.lectureFile.split('(')[0]}
                            </div>
                            {sylStatus === 'excluded' && (
                              <div
                                className="mt-1 inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                title={`${alg.syllabusInfo?.excludedSlides} — ${alg.syllabusInfo?.reason}`}
                              >
                                <Ban className="w-2.5 h-2.5" />
                                <span>{alg.syllabusInfo?.badgeLabel || 'EXCLUDED'}</span>
                              </div>
                            )}
                            {sylStatus === 'partial-exclusion' && (
                              <div
                                className="mt-1 inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                title={`Excluded: ${alg.syllabusInfo?.excludedSlides} | Required: ${alg.syllabusInfo?.requiredScope}`}
                              >
                                <AlertTriangle className="w-2.5 h-2.5" />
                                <span>{alg.syllabusInfo?.badgeLabel || 'PARTIAL DEL'}</span>
                              </div>
                            )}
                          </div>
                          <span
                            className={`shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded border ${badgeStyle}`}
                            title={tooltipText}
                          >
                            {examCount}x Exam
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar Footer Scope Guarantee */}
            <div className="p-3 border-t border-slate-800/80 bg-slate-900/50 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Scope: Files 01–14 Complete</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-snug">
                Covers Space-for-Time Trade-Offs &amp; Dynamic Programming (Greedy Algorithms strictly excluded).
              </p>
            </div>
          </aside>
        )}

        {/* Right Main Workspace */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
            {/* Collapsible Syllabus Exclusions & Past Exam Compliance Guide */}
            {showExclusionsGuide && (
              <div className="rounded-2xl border-2 border-rose-500/40 bg-slate-900/95 p-5 shadow-2xl space-y-5">
                <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-3.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <Ban className="w-5 h-5 text-rose-400" />
                      <h2 className="text-base sm:text-lg font-bold text-white">
                        Official Syllabus Exclusions &amp; Past Exam Compliance Guide
                      </h2>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-200 border border-rose-500/40">
                        Instructor Rules &amp; Blacklist
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      Complete reference of removed slide ranges (Instructor Blacklist &amp; Red Syllabus Strikethroughs) and which past exam papers violate the <strong className="text-white">No-MCQ</strong> or <strong className="text-white">Excluded Topic</strong> rules.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowExclusionsGuide(false)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                    title="Close Exclusions Guide"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Part 1: Lecture Files Containing Exclusions */}
                <div className="space-y-2.5">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-rose-300 font-bold">
                    1. Lecture Files with Excluded Topics (Exact Slide Ranges)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div
                      onClick={() => setSelectedAlgId('hashing')}
                      className="p-3 rounded-xl bg-slate-950/90 border border-amber-500/30 hover:border-amber-400/60 transition-all cursor-pointer space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white">File 06: Hashing</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Slides 3–14 Excluded
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        <strong className="text-rose-300">Excluded:</strong> Dictionary ADT theoretical intro (Slides 3–14, crossed out in red).
                      </p>
                      <p className="text-[11px] text-emerald-300 font-mono">
                        ✓ Required: Slide 15 to End (Hash Table).
                      </p>
                    </div>

                    <div
                      onClick={() => setSelectedAlgId('b-trees')}
                      className="p-3 rounded-xl bg-slate-950/90 border border-amber-500/30 hover:border-amber-400/60 transition-all cursor-pointer space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white">File 07: B-Trees</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Slides 95–128 Excluded
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        <strong className="text-rose-300">Excluded:</strong> B-Tree Deletion, Balanced B-Trees, Balancing &amp; Combining (Slides 95–128).
                      </p>
                      <p className="text-[11px] text-emerald-300 font-mono">
                        ✓ Required: Slides 1–94 (Search, Creation &amp; Insertion).
                      </p>
                    </div>

                    <div
                      onClick={() => setSelectedAlgId('assembly-line')}
                      className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/40 hover:border-rose-400 transition-all cursor-pointer space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white">File 08: Assembly Line</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/25 text-rose-200 border border-rose-500/50">
                          🚫 Slides 9–102 Excluded
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        <strong className="text-rose-300">Excluded:</strong> Assembly Line Scheduling Problem (Slides 9–102, most of File 08).
                      </p>
                      <p className="text-[11px] text-emerald-300 font-mono">
                        ✓ Required: Slides 1–8 ONLY (General DP Intro).
                      </p>
                    </div>

                    <div
                      onClick={() => setSelectedAlgId('lcs')}
                      className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/40 hover:border-rose-400 transition-all cursor-pointer space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white">File 10: LCS</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/25 text-rose-200 border border-rose-500/50">
                          🚫 Entire File Excluded
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        <strong className="text-rose-300">Excluded:</strong> Longest Common Subsequence (File 10 is completely removed from first to last slide).
                      </p>
                      <p className="text-[11px] text-rose-300 font-mono">
                        ✗ Required: None (Entire File 10 excluded).
                      </p>
                    </div>

                    <div
                      onClick={() => setSelectedAlgId('coin-collecting')}
                      className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/40 hover:border-rose-400 transition-all cursor-pointer space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white">File 11: Coin Collecting</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/25 text-rose-200 border border-rose-500/50">
                          🚫 Slides 117–141 Excluded
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        <strong className="text-rose-300">Excluded:</strong> Last section on Robot Coin Collecting (Slides 117–141).
                      </p>
                      <p className="text-[11px] text-emerald-300 font-mono">
                        ✓ Required: Slides 1–116 (Coin-Row &amp; Change-Making).
                      </p>
                    </div>

                    <div
                      onClick={() => setSelectedAlgId('knapsack-01')}
                      className="p-3 rounded-xl bg-slate-950/90 border border-amber-500/30 hover:border-amber-400/60 transition-all cursor-pointer space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white">File 12: 0/1 Knapsack</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Slides 123–177 Excluded
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        <strong className="text-rose-300">Excluded:</strong> Memory Function Top-Down Algorithm (Slides 123–177, crossed out in red).
                      </p>
                      <p className="text-[11px] text-emerald-300 font-mono">
                        ✓ Required: Slides 1–122 (Standard Bottom-Up Knapsack).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Part 2: Past Exam Compliance vs Instructor Rules */}
                <div className="space-y-2.5 pt-2 border-t border-slate-800">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold">
                    2. Past Exam Papers Compliance vs. Instructor Rules (No MCQs &amp; Excluded Topics)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-emerald-950/25 border border-emerald-500/40 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-300">
                          ✅ MidTerm Exam — Fall 2025 (Model Compliant Exam)
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-500/40">
                          100% COMPLIANT
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px]">
                        The ONLY past midterm that is 100% compliant with instructor guidelines: contains <strong className="text-white">zero MCQs</strong> (8 written tracing/analysis questions) and every single question falls strictly within the required syllabus (Distribution Counting V2, Horspool, Boyer-Moore, Bottom-Up 0/1 Knapsack, Mystry Loop Analysis, OBST, Floyd, B-Tree Insertion).
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/90 border border-rose-500/30 space-y-1.5 text-[11px]">
                      <div className="font-bold text-rose-300">
                        ⚠️ Past Exams with Excluded Questions or MCQs:
                      </div>
                      <ul className="space-y-1 text-slate-300 list-disc list-inside">
                        <li>
                          <strong className="text-white">MidTerm — Winter 2023:</strong> Contains MCQs in Q1 &amp; Q4 (violates No-MCQ rule) and Q4 tests <span className="text-rose-300 font-semibold">Assembly Line Scheduling (Excluded)</span>.
                        </li>
                        <li>
                          <strong className="text-white">MidTerm — Fall 2020:</strong> Question 05 asks to delete key <code>M</code> from a B-Tree (<span className="text-rose-300 font-semibold">B-Tree Deletion is Excluded</span>).
                        </li>
                        <li>
                          <strong className="text-white">MidTerm — Spring 2021:</strong> Question 05 asks to delete keys <code>2, 8, 22</code> from a B-Tree (<span className="text-rose-300 font-semibold">B-Tree Deletion is Excluded</span>).
                        </li>
                        <li>
                          <strong className="text-white">Final Exams — Fall 2021 &amp; Spring 2021:</strong> Question 01 asks about <span className="text-rose-300 font-semibold">Robot Coin-Collection (Excluded section of File 11)</span>.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Algorithm Header Card (shown in Trace & Analyze modes; Design mode focuses on the 3 Core Paradigms) */}
            {activePillar !== 'design' && (
              <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900/95 via-slate-900/90 to-indigo-950/30 p-5 shadow-lg space-y-4">
                {/* Per-Algorithm Syllabus Exclusion / Partial Exclusion Banner */}
                {currentAlgorithm.syllabusInfo &&
                  currentAlgorithm.syllabusInfo.status !== 'required' && (
                    <div
                      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        currentAlgorithm.syllabusInfo.status === 'excluded'
                          ? 'bg-rose-950/40 border-rose-500/50 text-rose-100'
                          : 'bg-amber-950/35 border-amber-500/40 text-amber-100'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                              currentAlgorithm.syllabusInfo.status === 'excluded'
                                ? 'bg-rose-500/30 text-rose-200 border-rose-400/50'
                                : 'bg-amber-500/25 text-amber-200 border-amber-400/50'
                            }`}
                          >
                            {currentAlgorithm.syllabusInfo.status === 'excluded' ? (
                              <Ban className="w-3.5 h-3.5" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5" />
                            )}
                            <span>
                              {currentAlgorithm.syllabusInfo.status === 'excluded'
                                ? 'EXCLUDED FROM SYLLABUS'
                                : 'PARTIAL SYLLABUS EXCLUSION'}
                            </span>
                          </span>
                          <span className="text-xs font-semibold">
                            {currentAlgorithm.syllabusInfo.reason}
                          </span>
                        </div>
                        <div className="text-xs space-y-0.5 font-mono">
                          <div>
                            <span className="text-rose-300 font-bold">✗ Excluded Slides: </span>
                            <span className="text-slate-200">
                              {currentAlgorithm.syllabusInfo.excludedSlides}
                            </span>
                          </div>
                          <div>
                            <span className="text-emerald-300 font-bold">✓ Required Scope: </span>
                            <span className="text-slate-200">
                              {currentAlgorithm.syllabusInfo.requiredScope}
                            </span>
                          </div>
                          {currentAlgorithm.syllabusInfo.affectedExams &&
                            currentAlgorithm.syllabusInfo.affectedExams.length > 0 && (
                              <div>
                                <span className="text-amber-300 font-bold">
                                  ⚠️ Affected Past Exam Questions:{' '}
                                </span>
                                <span className="text-slate-300">
                                  {currentAlgorithm.syllabusInfo.affectedExams.join(' • ')}
                                </span>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  )}

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                        {currentAlgorithm.categoryLabel}
                      </span>
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                        {currentAlgorithm.lectureFile}
                      </span>
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        Indexing: {currentAlgorithm.indexingRule}
                      </span>
                      <span
                        className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-md border ${
                          (currentAlgorithm.midtermCount ?? 0) >= 3
                            ? 'bg-rose-500/20 text-rose-200 border-rose-500/40'
                            : (currentAlgorithm.midtermCount ?? 0) >= 1
                            ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {currentAlgorithm.midtermCount ?? 0}x Exam
                        {currentAlgorithm.midtermPapers && currentAlgorithm.midtermPapers.length > 0
                          ? ` (${currentAlgorithm.midtermPapers.join(' • ')})`
                          : ' (No Midterm Appearances)'}
                      </span>
                    </div>

                    <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {currentAlgorithm.title}
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
                      {currentAlgorithm.summary}
                    </p>
                  </div>

                  {/* Quick Complexity Pill Summary */}
                  <div className="shrink-0 flex flex-wrap sm:flex-nowrap items-center gap-2.5 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <div className="px-2.5 py-1 border-r border-slate-800">
                      <div className="text-[10px] font-mono uppercase text-slate-400">Time (Avg/Worst)</div>
                      <div className="text-xs font-mono font-bold text-emerald-300 mt-0.5">
                        {currentAlgorithm.analysis.worstTime}
                      </div>
                    </div>
                    <div className="px-2.5 py-1">
                      <div className="text-[10px] font-mono uppercase text-slate-400">Extra Space</div>
                      <div className="text-xs font-mono font-bold text-indigo-300 mt-0.5">
                        {currentAlgorithm.analysis.extraSpace}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Active Pillar View */}
            {activePillar === 'trace' && (
              <TraceView
                algorithm={currentAlgorithm}
                steps={traceSteps}
                currentStepIdx={currentStepIdx}
                setCurrentStepIdx={setCurrentStepIdx}
                selectedExampleId={selectedExampleId}
                onSelectExample={handleSelectExample}
                customInputs={customInputs}
                onCustomInputChange={handleCustomInputChange}
                onApplyCustomInputs={handleApplyCustomInputs}
                onGenerateRandomExam={handleGenerateRandomExam}
                randomExamSummary={randomExamSummary}
              />
            )}
            {activePillar === 'design' && <DesignView algorithm={currentAlgorithm} />}
            {activePillar === 'analyze' && <AnalyzeView algorithm={currentAlgorithm} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
