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
} from 'lucide-react';

export const App: React.FC = () => {
  const [selectedAlgId, setSelectedAlgId] = useState<AlgorithmId>('distribution-counting-sort');
  const [activePillar, setActivePillar] = useState<PillarMode>('trace');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

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

          {/* Right: Prev / Next Algorithm Switcher */}
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
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/70 border border-transparent'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="truncate">{alg.shortTitle}</div>
                            <div className="text-[10px] font-mono text-slate-500 truncate mt-0.5">
                              {alg.lectureFile.split('(')[0]}
                            </div>
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
            {/* Algorithm Header Card (shown in Trace & Analyze modes; Design mode focuses on the 3 Core Paradigms) */}
            {activePillar !== 'design' && (
              <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900/95 via-slate-900/90 to-indigo-950/30 p-5 shadow-lg">
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
