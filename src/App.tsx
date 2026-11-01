import { useState, useEffect } from 'react';
import { ModeSimulator } from './components/ModeSimulator';
import { ModeQuiz } from './components/ModeQuiz';
import { ModeKnowledge } from './components/ModeKnowledge';
import { SyncModeSimulator } from './components/SyncModeSimulator';
import { SyncModeQuiz } from './components/SyncModeQuiz';
import { SyncModeKnowledge } from './components/SyncModeKnowledge';
import { Cpu, Award, BookOpen, Sun, Moon, Laptop, Lock } from 'lucide-react';

export function App() {
  const [activeModule, setActiveModule] = useState<'scheduling' | 'sync'>('scheduling');
  const [activeTab, setActiveTab] = useState<'simulator' | 'quiz' | 'knowledge'>('simulator');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Global Top Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/85 dark:bg-slate-900/85 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            {activeModule === 'scheduling' ? <Cpu className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                {activeModule === 'scheduling' ? 'CPU Scheduling Explorer' : 'Process Synchronization Explorer'}
              </h1>
              <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
                CPCS 361
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              FCIT Operating Systems Interactive Simulator & Self-Evaluation Lab
            </p>
          </div>
        </div>

        {/* Module Switcher, Tab Controls & Theme Toggle */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          {/* Module Toggle */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-semibold border border-slate-200/70 dark:border-slate-700/70">
            <button
              onClick={() => setActiveModule('scheduling')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeModule === 'scheduling'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>CPU Scheduling</span>
            </button>
            <button
              onClick={() => setActiveModule('sync')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeModule === 'sync'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Process Sync</span>
            </button>
          </div>

          <nav className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'simulator'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>Simulator</span>
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'quiz'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Award className="h-3.5 w-3.5" />
              <span>Practice & Quiz</span>
            </button>
            <button
              onClick={() => setActiveTab('knowledge')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'knowledge'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Theory & Traces</span>
            </button>
          </nav>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Toggle Theme"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {activeModule === 'scheduling' ? (
          <>
            {activeTab === 'simulator' && <ModeSimulator />}
            {activeTab === 'quiz' && <ModeQuiz />}
            {activeTab === 'knowledge' && <ModeKnowledge />}
          </>
        ) : (
          <>
            {activeTab === 'simulator' && <SyncModeSimulator />}
            {activeTab === 'quiz' && <SyncModeQuiz />}
            {activeTab === 'knowledge' && <SyncModeKnowledge />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-4 px-6 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-between max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-1.5">
          <Laptop className="h-3.5 w-3.5" />
          <span>Built for Academic Study &bull; Operating System - I</span>
        </div>
        <div className="flex items-center gap-3">
          <span>FCIT KAU Curriculum Compliant</span>
          <span>&bull;</span>
          <span>
            {activeModule === 'scheduling'
              ? 'FCFS, SJF, SRTF, Priority (P & NP), Round Robin, MLQ/MLFQ'
              : "Peterson's, Hardware Atomic Instructions, Mutex, Semaphores, Classic Sync Problems"}
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;

