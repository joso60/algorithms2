import React, { useEffect, useMemo, useState } from 'react';
import { SYNC_SLIDE_PRESETS, type ProcessState } from '../data/syncData';
import { simulateSyncScenario, type SyncSimulationStep } from '../engine/syncEngine';
import { DUAL_CODE_SPECS, activeSides, isSpecLineActive, type CodeLineSpec } from '../data/syncCode';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  AlertTriangle,
  Lock,
  Unlock,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Sparkles,
  BookOpen,
  ArrowRight,
  Zap,
} from 'lucide-react';

/** CPU register card shown directly under a process's code (Race Condition preset). */
const RegisterCard: React.FC<{
  tone: 'rose' | 'emerald';
  regName: string;
  value: string | number | boolean | undefined;
  pointer?: string;
  rows: { ref: string; text: string }[];
}> = ({ tone, regName, value, pointer, rows }) => {
  const order = rows.map((r) => r.ref);
  const done = pointer ? order.indexOf(pointer) : -1;
  const pill =
    tone === 'rose'
      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  return (
    <div className="mt-2 rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs space-y-1">
      <div className="flex items-center justify-between border-b border-slate-800 pb-1">
        <span className="font-sans font-semibold text-slate-300">CPU Register</span>
        <span className={`px-2 py-0.5 rounded-full border font-bold ${pill}`}>
          {regName} = {value !== undefined ? String(value) : '—'}
        </span>
      </div>
      {rows.map((r, i) => (
        <div
          key={r.ref}
          className={`flex items-center justify-between ${
            i === done ? 'text-slate-100 font-bold' : i < done ? 'text-slate-400' : 'text-slate-600'
          }`}
        >
          <span>
            {i + 1}. {r.text};
          </span>
          {i <= done && <CheckCircle2 className="h-3 w-3 text-slate-400" />}
        </div>
      ))}
    </div>
  );
};

const SPEEDS = [
  { label: '0.5x', ms: 2600 },
  { label: '1x', ms: 1500 },
  { label: '2x', ms: 800 },
  { label: '4x', ms: 400 },
];

const STATE_BADGE: Record<ProcessState, { label: string; cls: string }> = {
  ENTRY: {
    label: 'ENTRY SECTION',
    cls: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  CRITICAL: {
    label: 'IN CRITICAL SECTION',
    cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  EXIT: {
    label: 'EXIT SECTION',
    cls: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  },
  REMAINDER: {
    label: 'REMAINDER SECTION',
    cls: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  },
  BLOCKED: {
    label: 'BLOCKED (IN QUEUE)',
    cls: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  },
  WAITING: {
    label: 'BUSY WAIT (SPINNING)',
    cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
};


// ============================================================================
// Slide-Specific Visual Sub-Components
// ============================================================================

/** Renders the variable boxes for Peterson's and Strict Alternation as a clean debugger watch panel */
const PetersonAndTurnBoard: React.FC<{ step: SyncSimulationStep }> = ({ step }) => {
  const vars = step.sharedVariables;
  const hasFlags = 'flag[0]' in vars || 'flag[1]' in vars;
  const f0 = vars['flag[0]'] === true || vars['flag[0]'] === 'true' || vars['flag[0]'] === 'T';
  const f1 = vars['flag[1]'] === true || vars['flag[1]'] === 'true' || vars['flag[1]'] === 'T';
  const turn = vars.turn ?? 0;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/80 overflow-hidden font-mono text-xs">
      <div className="px-3.5 py-2 bg-slate-100/80 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <span className="font-sans font-bold uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400">
          Debugger Watch — Shared Memory Variables
        </span>
        <span className="text-[11px] text-slate-400">i = 0 (P0), j = 1 (P1)</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-700">
        {hasFlags && (
          <div className="p-3 flex items-center justify-between">
            <div>
              <div className="text-slate-500 dark:text-slate-400 text-[11px]">boolean flag[0] (P0)</div>
              <div className="text-[10px] font-sans text-slate-400">P0 willingness to enter CS</div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                f0
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20'
              }`}
            >
              {f0 ? 'true (T)' : 'false (F)'}
            </span>
          </div>
        )}
        {hasFlags && (
          <div className="p-3 flex items-center justify-between">
            <div>
              <div className="text-slate-500 dark:text-slate-400 text-[11px]">boolean flag[1] (P1)</div>
              <div className="text-[10px] font-sans text-slate-400">P1 willingness to enter CS</div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                f1
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20'
              }`}
            >
              {f1 ? 'true (T)' : 'false (F)'}
            </span>
          </div>
        )}
        <div className="p-3 flex items-center justify-between">
          <div>
            <div className="text-slate-500 dark:text-slate-400 text-[11px]">int turn</div>
            <div className="text-[10px] font-sans text-slate-400">Favored process index</div>
          </div>
          <span className="px-3 py-1 rounded-full text-sm font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            {String(turn)} ({Number(turn) === 0 ? 'P0' : 'P1'})
          </span>
        </div>
      </div>
    </div>
  );
};

/** Renders the Hardware test_and_set / Swap tables from Slides 111-185 */
const Hardware2ProcessBoard: React.FC<{ step: SyncSimulationStep }> = ({ step }) => {
  const vars = step.sharedVariables;
  const lock = vars.lock === true || vars.lock === 'true' || vars.lock === 'T';
  const isSwap = step.presetId === 'preset_hardware_swap';

  const piTarget = vars.Pi_target === true || vars.Pi_target === 'T';
  const piRv = vars.Pi_rv === true || vars.Pi_rv === 'T';
  const pjTarget = vars.Pj_target === true || vars.Pj_target === 'T';
  const pjRv = vars.Pj_rv === true || vars.Pj_rv === 'T';

  const piKey = vars.Pi_key === true || vars.Pi_key === 'T';
  const pjKey = vars.Pj_key === true || vars.Pj_key === 'T';

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 py-1 font-mono">
      {/* Global lock */}
      <div className="w-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs text-center">
        <div className="bg-slate-100 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300 py-1 text-xs font-semibold border-b border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1">
          {lock ? <Lock className="h-3 w-3 text-rose-400" /> : <Unlock className="h-3 w-3 text-emerald-400" />}
          <span>lock</span>
        </div>
        <div
          className={`py-1.5 text-xl font-black ${
            lock ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {lock ? 'T' : 'F'}
        </div>
      </div>

      {!isSwap ? (
        <>
          {/* Pi target | rv */}
          <div className="w-38 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs text-center">
            <div className="grid grid-cols-2 bg-slate-100 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300 text-xs font-semibold border-b border-slate-200 dark:border-slate-700">
              <div className="py-1 border-r border-slate-200 dark:border-slate-700">Pi target</div>
              <div className="py-1">Pi rv</div>
            </div>
            <div className="grid grid-cols-2 py-1.5 text-xl font-black">
              <div className={`border-r border-slate-200 dark:border-slate-700 ${piTarget ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'}`}>
                {piTarget ? 'T' : 'F'}
              </div>
              <div className={piRv ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                {piRv ? 'T' : 'F'}
              </div>
            </div>
          </div>

          {/* Pj target | rv */}
          <div className="w-38 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs text-center">
            <div className="grid grid-cols-2 bg-slate-100 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300 text-xs font-semibold border-b border-slate-200 dark:border-slate-700">
              <div className="py-1 border-r border-slate-200 dark:border-slate-700">Pj target</div>
              <div className="py-1">Pj rv</div>
            </div>
            <div className="grid grid-cols-2 py-1.5 text-xl font-black">
              <div className={`border-r border-slate-200 dark:border-slate-700 ${pjTarget ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'}`}>
                {pjTarget ? 'T' : 'F'}
              </div>
              <div className={pjRv ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                {pjRv ? 'T' : 'F'}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Swap Pi key */}
          <div className="w-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs text-center">
            <div className="bg-slate-100 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300 py-1 text-xs font-semibold border-b border-slate-200 dark:border-slate-700">
              key (Pi / P0)
            </div>
            <div
              className={`py-1.5 text-xl font-black ${
                piKey ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {piKey ? 'T' : 'F'}
            </div>
          </div>

          {/* Swap Pj key */}
          <div className="w-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs text-center">
            <div className="bg-slate-100 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300 py-1 text-xs font-semibold border-b border-slate-200 dark:border-slate-700">
              key (Pj / P1)
            </div>
            <div
              className={`py-1.5 text-xl font-black ${
                pjKey ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {pjKey ? 'T' : 'F'}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/** Renders the N-Processes (n=6) [P | W | K] table + j + lock from Slides 190-231 */
const NProcessBoundedBoard: React.FC<{ step: SyncSimulationStep }> = ({ step }) => {
  const vars = step.sharedVariables;
  const lock = vars.lock === true || vars.lock === 'true';
  const jVal = vars.j ?? '-';

  const codeLines = [
    { line: 'do {', badges: [] as string[], spin: false },
    {
      line: '    waiting[i] = true; key = true;',
      badges: step.stepIndex === 1 ? ['P1', 'P3', 'P4'] : [],
      spin: false,
    },
    {
      line: '    while (waiting[i] && key)',
      badges:
        step.stepIndex === 2
          ? ['P1', 'P3', 'P4']
          : step.stepIndex >= 3 && step.stepIndex <= 5
            ? ['P1', 'P3']
            : step.stepIndex === 6
              ? ['P3']
              : [],
      spin: step.stepIndex >= 2 && step.stepIndex <= 6,
    },
    {
      line: '        key = test_and_set(&lock);',
      badges: [],
      spin: false,
    },
    {
      line: '    waiting[i] = false;',
      badges: [],
      spin: false,
    },
    {
      line: '    /* critical section */',
      badges:
        step.stepIndex === 3
          ? ['P4']
          : step.stepIndex === 6
            ? ['P1']
            : step.stepIndex === 7
              ? ['P3']
              : [],
      spin: false,
    },
    {
      line: '    j = (i + 1) % n;',
      badges: step.stepIndex === 4 ? ['P4'] : [],
      spin: false,
    },
    {
      line: '    while ((j != i) && !waiting[j])',
      badges: step.stepIndex === 5 ? ['P4'] : [],
      spin: false,
    },
    {
      line: '        j = (j + 1) % n;',
      badges: step.stepIndex === 5 ? ['P4'] : [],
      spin: false,
    },
    {
      line: '    if (j == i) lock = false;',
      badges: [],
      spin: false,
    },
    {
      line: '    else waiting[j] = false;',
      badges: step.stepIndex === 6 ? ['P4'] : step.stepIndex === 7 ? ['P1'] : [],
      spin: false,
    },
    {
      line: '    /* remainder section */',
      badges: [],
      spin: false,
    },
    { line: '} while (true);', badges: [], spin: false },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left: Unified N-process code with live P1, P3, P4 badges */}
      <div className="lg:col-span-7 rounded-xl bg-slate-950 border border-slate-700 p-4 font-mono text-xs text-slate-100 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
          <span className="font-bold text-indigo-400">n-Processes Bounded-Waiting Algorithm (n = 6)</span>
          <span className="text-[11px] text-slate-400">Live Process Pointers (P1, P3, P4)</span>
        </div>
        <div className="space-y-0.5">
          {codeLines.map((row, idx) => {
            const active = row.badges.length > 0;
            return (
              <div
                key={idx}
                className={`flex items-center gap-2 px-2 py-0.5 rounded transition-all leading-tight text-[12.5px] sm:text-[13px] ${
                  active ? 'bg-indigo-500/20 border-l-2 border-l-indigo-400 text-slate-100 font-bold' : 'text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1 min-w-[70px] justify-end">
                  {row.badges.map((b) => (
                    <span
                      key={b}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        b === 'P4'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : b === 'P1'
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {b}
                    </span>
                  ))}
                </div>
                <span className="whitespace-pre">{row.line}</span>
                {row.spin && (
                  <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    <RefreshCw className="h-3 w-3 animate-spin text-indigo-400" /> Spinning
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Slide 190-231 [j], [lock], and [P | W | K] table */}
      <div className="lg:col-span-5 flex flex-wrap items-start justify-center gap-4 font-mono">
        <div className="space-y-4">
          <div className="w-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs text-center">
            <div className="bg-slate-100 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300 py-1.5 text-xs font-semibold border-b border-slate-200 dark:border-slate-700">
              j (Scanner)
            </div>
            <div className="py-3 text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {String(jVal)}
            </div>
          </div>

          <div className="w-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs text-center">
            <div className="bg-slate-100 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300 py-1.5 text-xs font-semibold border-b border-slate-200 dark:border-slate-700">
              lock (n=6)
            </div>
            <div
              className={`py-3 text-2xl font-black ${
                lock ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {lock ? 'T' : 'F'}
            </div>
          </div>
        </div>

        {/* [P | W | K] Table */}
        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs text-center">
          <table className="text-sm font-mono">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300 font-semibold">
                <th className="px-3.5 py-2 border-r border-b border-slate-200 dark:border-slate-700">P</th>
                <th className="px-3.5 py-2 border-r border-b border-slate-200 dark:border-slate-700" title="waiting[i]">
                  W
                </th>
                <th className="px-3.5 py-2 border-b border-slate-200 dark:border-slate-700" title="key[i]">
                  K
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {[0, 1, 2, 3, 4, 5].map((idx) => {
                const w = vars[`waiting[${idx}]`] === true;
                const k = vars[`key[${idx}]`] === true;
                const pid = `P${idx}`;
                const inCS = step.processStates[pid] === 'CRITICAL';
                const isScanned = Number(jVal) === idx;
                return (
                  <tr
                    key={idx}
                    className={`${
                      inCS
                        ? 'bg-emerald-500/10'
                        : isScanned
                          ? 'bg-indigo-500/10'
                          : 'bg-white dark:bg-slate-900'
                    }`}
                  >
                    <td className="px-3.5 py-1.5 font-bold bg-slate-50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                      {idx} {inCS ? '★' : ''}
                    </td>
                    <td
                      className={`px-4 py-1.5 font-black text-base border-r border-slate-200 dark:border-slate-700 ${
                        w ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {w ? 'T' : 'F'}
                    </td>
                    <td
                      className={`px-4 py-1.5 font-black text-base ${
                        k ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {k ? 'T' : 'F'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/** Renders the Semaphore [Value | Queue] table + [0..5] Buffer + [in | out | count] */
const ProducerConsumerAndRWSemaphoreBoard: React.FC<{ step: SyncSimulationStep }> = ({ step }) => {
  const vars = step.sharedVariables;
  const isRW = step.presetId === 'preset_readers_writers_trace';
  const isSemProdCons =
    step.presetId === 'preset_producer_consumer_semaphores' ||
    step.presetId === 'preset_semaphore_reversed_deadlock';
  const isRace = step.presetId === 'preset_race_condition_counter';

  return (
    <div className="space-y-4">
      {/* Semaphore Table (for Producer-Consumer Semaphores & Readers-Writers) */}
      {(isSemProdCons || isRW) && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[280px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs font-mono text-xs">
            <table className="w-full text-center">
              <thead className="bg-slate-100 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-3 py-2 border-r border-slate-200 dark:border-slate-700">Semaphore</th>
                  <th className="px-3 py-2 border-r border-slate-200 dark:border-slate-700">Value</th>
                  <th className="px-3 py-2">Waiting Queue (S-&gt;list)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {isSemProdCons ? (
                  <>
                    <tr>
                      <td className="px-3 py-2 font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700">
                        mutex
                      </td>
                      <td
                        className={`px-3 py-2 text-base font-black border-r border-slate-200 dark:border-slate-700 ${
                          Number(vars['mutex.value']) < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-indigo-600 dark:text-indigo-400'
                        }`}
                      >
                        {String(vars['mutex.value'])}
                      </td>
                      <td className="px-3 py-2 font-bold">
                        {vars['mutex.queue'] && vars['mutex.queue'] !== 'Empty' ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            {String(vars['mutex.queue']) === 'C'
                              ? 'C (Consumer Blocked)'
                              : `${String(vars['mutex.queue'])} (Producer Blocked)`}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 italic">Empty</span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700">
                        full
                      </td>
                      <td className="px-3 py-2 text-base font-black text-indigo-600 dark:text-indigo-400 border-r border-slate-200 dark:border-slate-700">
                        {String(vars['full.value'])}
                      </td>
                      <td className="px-3 py-2 text-slate-400 dark:text-slate-500 italic">Empty</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700">
                        empty
                      </td>
                      <td
                        className={`px-3 py-2 text-base font-black border-r border-slate-200 dark:border-slate-700 ${
                          Number(vars['empty.value']) < 0
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-indigo-600 dark:text-indigo-400'
                        }`}
                      >
                        {String(vars['empty.value'])}
                      </td>
                      <td className="px-3 py-2 font-bold">
                        {Number(vars['empty.value']) < 0 ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            P (Producer Blocked)
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 italic font-normal">Empty</span>
                        )}
                      </td>
                    </tr>
                  </>
                ) : (
                  <>
                    <tr>
                      <td className="px-3 py-2 font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700">
                        rw_mutex
                      </td>
                      <td
                        className={`px-3 py-2 text-base font-black border-r border-slate-200 dark:border-slate-700 ${
                          Number(vars['rw_mutex.value']) <= 0 ? 'text-rose-600 dark:text-rose-400' : 'text-indigo-600 dark:text-indigo-400'
                        }`}
                      >
                        {String(vars['rw_mutex.value'])}
                      </td>
                      <td className="px-3 py-2 font-bold">
                        {vars['rw_mutex.queue'] && vars['rw_mutex.queue'] !== 'Empty' ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            {String(vars['rw_mutex.queue'])}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 italic">Empty</span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700">
                        mutex
                      </td>
                      <td
                        className={`px-3 py-2 text-base font-black border-r border-slate-200 dark:border-slate-700 ${
                          Number(vars['mutex.value']) <= 0 ? 'text-rose-600 dark:text-rose-400' : 'text-indigo-600 dark:text-indigo-400'
                        }`}
                      >
                        {String(vars['mutex.value'])}
                      </td>
                      <td className="px-3 py-2 text-slate-400 dark:text-slate-500 italic">Empty</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          {isRW && (
            <div className="w-40 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs text-center font-mono">
              <div className="bg-slate-100 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300 py-2 text-xs font-semibold border-b border-slate-200 dark:border-slate-700">
                read_count
              </div>
              <div className="py-3 text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {String(vars.read_count ?? 0)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bounded Buffer [0..5] + [in | out | count] (for Producer-Consumer presets) */}
      {step.bufferState && (
        <div className={`flex flex-wrap items-center gap-4 pt-1 ${isRace ? 'justify-center' : 'justify-between'}`}>
          {/* 6-slot Buffer */}
          <div className="flex-1 min-w-[280px]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Shared Circular Buffer: item buffer[6]
            </div>
            <div className="grid grid-cols-6 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs text-center font-mono">
              {step.bufferState.slots.map((slot, idx) => {
                const isIn = step.bufferState!.inIndex % step.bufferState!.size === idx;
                const isOut = step.bufferState!.outIndex % step.bufferState!.size === idx;
                return (
                  <div key={idx} className="border-r last:border-r-0 border-slate-200 dark:border-slate-700">
                    <div className="bg-slate-100 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300 py-1 text-xs font-semibold border-b border-slate-200 dark:border-slate-700">
                      {idx}
                    </div>
                    <div className="h-9 flex items-center justify-center text-xl font-black text-emerald-600 dark:text-emerald-400">
                      {slot ? '*' : ''}
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-700 py-0.5 text-[10px] font-bold h-5 flex items-center justify-center gap-1">
                      {isIn && (
                        <span className="px-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                          in
                        </span>
                      )}
                      {isOut && (
                        <span className="px-1.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          out
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* [in | out | count/Counter] box */}
          <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs text-center font-mono">
            <div className="grid grid-cols-3 bg-slate-100 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300 text-xs font-semibold border-b border-slate-200 dark:border-slate-700">
              <div className="px-3 py-1 border-r border-slate-200 dark:border-slate-700">in</div>
              <div className="px-3 py-1 border-r border-slate-200 dark:border-slate-700">out</div>
              <div className="px-3 py-1">{isRace ? 'Counter' : 'count'}</div>
            </div>
            <div className="grid grid-cols-3 py-2 text-lg font-black">
              <div className="px-3 border-r border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400">
                {step.bufferState.inIndex}
              </div>
              <div className="px-3 border-r border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400">
                {step.bufferState.outIndex}
              </div>
              <div
                className={`px-3 ${
                  step.isViolation ? 'text-rose-600 dark:text-rose-400 animate-pulse' : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {String(vars.counter ?? vars.count ?? step.bufferState.count)}
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

/** Renders the Dining Philosophers Table + 5-Chopstick Semaphore Table from Slides 106-173 */
const DiningPhilosophersBoard: React.FC<{ step: SyncSimulationStep }> = ({ step }) => {
  const vars = step.sharedVariables;

  const codeRows = [
    { line: 'do {', badges: [] as string[] },
    {
      line: '    wait(chopstick[i]);',
      badges:
        step.stepIndex === 2
          ? ['P2', 'P4']
          : step.stepIndex === 6
            ? ['P0', 'P1', 'P2', 'P3', 'P4']
            : [],
    },
    {
      line: '    wait(chopstick[(i + 1) % 5]);',
      badges:
        step.stepIndex === 2
          ? ['P0']
          : step.stepIndex === 3
            ? ['P0', 'P2', 'P4']
            : step.stepIndex === 4
              ? ['P0', 'P2']
              : step.stepIndex === 7
                ? ['P0', 'P1', 'P2', 'P3', 'P4']
                : [],
    },
    {
      line: '        // eat',
      badges:
        step.stepIndex >= 1 && step.stepIndex <= 3
          ? ['P1', 'P3']
          : step.stepIndex === 4
            ? ['P1', 'P4']
            : [],
    },
    {
      line: '    signal(chopstick[i]);',
      badges: [],
    },
    {
      line: '    signal(chopstick[(i + 1) % 5]);',
      badges: [],
    },
    {
      line: '        // think',
      badges:
        step.stepIndex === 4
          ? ['P3']
          : step.stepIndex === 5
            ? ['P0', 'P1', 'P2', 'P3', 'P4']
            : [],
    },
    { line: '} while (TRUE);', badges: [] },
  ];

  // Angles for 5 philosophers around circular table
  const seats = [
    { pid: 'P0', x: 145, y: 38, cx: 118, cy: 55, idx: 0 },
    { pid: 'P1', x: 172, y: 125, cx: 142, cy: 90, idx: 1 },
    { pid: 'P2', x: 100, y: 175, cx: 125, cy: 138, idx: 2 },
    { pid: 'P3', x: 28, y: 125, cx: 75, cy: 138, idx: 3 },
    { pid: 'P4', x: 55, y: 38, cx: 62, cy: 85, idx: 4 },
  ];

  return (
    <div className="space-y-5">
      {/* 5-Chopstick Semaphore Table [0 | 1 | 2 | 3 | 4] (Slide 106-173 Top Table) */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          Chopstick Semaphores Array: chopstick[0..4] &amp; Blocked Queues
        </div>
        <div className="grid grid-cols-5 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs text-center font-mono">
          {[0, 1, 2, 3, 4].map((idx) => {
            const val = Number(vars[`chopstick[${idx}]`] ?? 1);
            const q = String(vars[`queue[${idx}]`] ?? '');
            return (
              <div key={idx} className="border-r last:border-r-0 border-slate-200 dark:border-slate-700">
                <div className="bg-slate-100 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300 py-1.5 text-xs font-semibold border-b border-slate-200 dark:border-slate-700">
                  chopstick[{idx}]
                </div>
                <div
                  className={`py-2.5 text-xl font-black border-b border-slate-200 dark:border-slate-700 ${
                    val < 0
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      : val === 0
                        ? 'text-slate-500 dark:text-slate-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {val}
                </div>
                <div className="py-1.5 text-xs font-bold bg-slate-50 dark:bg-slate-800/20 h-8 flex items-center justify-center">
                  {q ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[11px]">
                      {q} (Blocked)
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[10px]">—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom: Code + Interactive Round Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-7 rounded-xl bg-slate-950 border border-slate-700 p-3 font-mono text-[13px] text-slate-100">
          <div className="text-indigo-400 font-bold border-b border-slate-800 pb-1 mb-1.5 text-xs sm:text-[13px]">
            Philosopher i Code (Slide 106–173)
          </div>
          <div className="space-y-0.5">
            {codeRows.map((r, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-2 py-0.5 rounded transition-all leading-tight ${
                  r.badges.length > 0 ? 'bg-indigo-500/20 border-l-2 border-l-indigo-400 text-slate-100 font-bold' : 'text-slate-400'
                }`}
              >
                <span className="whitespace-pre">{r.line}</span>
                <div className="flex flex-wrap gap-1">
                  {r.badges.map((b) => (
                    <span
                      key={b}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        step.isViolation
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Round Dining Table SVG */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <svg viewBox="0 0 200 200" className="w-60 h-60">
            {/* Outer table */}
            <circle
              cx="100"
              cy="105"
              r="52"
              className="fill-slate-100 dark:fill-slate-800/80 stroke-slate-300 dark:stroke-slate-700"
              strokeWidth="2"
            />
            {/* Rice bowl */}
            <circle
              cx="100"
              cy="105"
              r="18"
              className="fill-slate-200 dark:fill-slate-900 stroke-indigo-500/50"
              strokeWidth="1.5"
            />
            <text
              x="100"
              y="108"
              textAnchor="middle"
              className="fill-slate-700 dark:fill-slate-300 font-mono text-[9px] font-bold"
            >
              RICE
            </text>

            {/* Chopstick numbers 0..4 */}
            {seats.map((s) => {
              const val = Number(vars[`chopstick[${s.idx}]`] ?? 1);
              return (
                <g key={`c-${s.idx}`}>
                  <circle
                    cx={s.cx}
                    cy={s.cy}
                    r="8"
                    className={
                      val < 0
                        ? 'fill-rose-500/80'
                        : val === 0
                          ? 'fill-slate-600'
                          : 'fill-emerald-500/80'
                    }
                  />
                  <text
                    x={s.cx}
                    y={s.cy + 3}
                    textAnchor="middle"
                    className="fill-white font-mono text-[8px] font-bold"
                  >
                    {s.idx}
                  </text>
                </g>
              );
            })}

            {/* 5 Philosophers P0..P4 */}
            {seats.map((s) => {
              const st = step.processStates[s.pid] ?? 'REMAINDER';
              const fill =
                st === 'CRITICAL'
                  ? 'fill-emerald-600 stroke-emerald-400'
                  : st === 'BLOCKED'
                    ? 'fill-rose-600 stroke-rose-400'
                    : st === 'ENTRY'
                      ? 'fill-indigo-600 stroke-indigo-400'
                      : 'fill-slate-700 stroke-slate-600';
              return (
                <g key={s.pid}>
                  <circle cx={s.x} cy={s.y} r="16" className={`${fill}`} strokeWidth="1.5" />
                  <text
                    x={s.x}
                    y={s.y + 4}
                    textAnchor="middle"
                    className="fill-white font-mono text-[10px] font-bold"
                  >
                    {s.pid}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Eating (CS)
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Blocked
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-600" /> Thinking
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Main Component: SyncModeSimulator
// ============================================================================

export const SyncModeSimulator: React.FC = () => {
  const [presetId, setPresetId] = useState<string>(SYNC_SLIDE_PRESETS[0].id);
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);

  const preset = SYNC_SLIDE_PRESETS.find((p) => p.id === presetId) ?? SYNC_SLIDE_PRESETS[0];
  const steps = useMemo(() => simulateSyncScenario(preset.id), [preset.id]);
  const lastIdx = steps.length - 1;
  const step = steps[Math.min(cursor, lastIdx)];

  // Auto-play loop
  useEffect(() => {
    if (!playing) return;
    if (cursor >= lastIdx) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => setCursor((c) => Math.min(lastIdx, c + 1)), SPEEDS[speedIdx].ms);
    return () => clearTimeout(timer);
  }, [playing, cursor, lastIdx, speedIdx]);

  // Keyboard navigation: Right arrow = next step, Left arrow = previous step
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) {
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setPlaying(false);
        setCursor((c) => Math.min(lastIdx, c + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setPlaying(false);
        setCursor((c) => Math.max(0, c - 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lastIdx]);

  const selectPreset = (id: string) => {
    setPresetId(id);
    setCursor(0);
    setPlaying(false);
  };

  const dualSpec = DUAL_CODE_SPECS[preset.id];
  const isRaceStage = preset.id === 'preset_race_condition_counter';

  // Determine which side of dual code is active
  const { left: isLeftActive, right: isRightActive } = activeSides(preset.id, step.activeProcess);

  const isLineHighlighted = (spec: CodeLineSpec, sideActive: boolean) => sideActive && isSpecLineActive(spec, step);

  return (
    <div className="space-y-6">
      {/* 1. Scenario Selector Bar */}
      <div className="card bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-indigo-500 dark:text-indigo-400 block">
              CPCS 361 Slide-by-Slide Interactive Execution Traces
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {preset.title.replace(/^\d+\.\s*/, '')}
            </h3>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            {preset.slideReference}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {SYNC_SLIDE_PRESETS.map((p, idx) => {
            const selected = p.id === presetId;
            return (
              <button
                key={p.id}
                onClick={() => selectPreset(p.id)}
                className={`text-left px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer border ${
                  selected
                    ? 'bg-indigo-500 text-white border-indigo-500 shadow-xs font-bold'
                    : 'bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="truncate font-bold">
                  {idx + 1}. {p.title.replace(/^\d+\.\s*/, '').split(' (Slide')[0]}
                </div>
                <div
                  className={`truncate text-[11px] mt-0.5 font-mono ${
                    selected ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {p.slideReference}
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <strong className="text-indigo-600 dark:text-indigo-400">Scenario Overview: </strong>
          {preset.description}
        </div>
      </div>

      {/* 2. Playback & Stepper Bar */}
      <div className="card bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700/80 space-y-3 sticky top-2 z-30 shadow-md backdrop-blur">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setPlaying(false);
              setCursor(0);
            }}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>

          <button
            onClick={() => {
              setPlaying(false);
              setCursor((c) => Math.max(0, c - 1));
            }}
            disabled={cursor === 0}
            className="inline-flex items-center gap-1 h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
          >
            <SkipBack className="h-4 w-4" /> Prev Step
          </button>

          <button
            onClick={() => {
              if (!playing && cursor >= lastIdx) setCursor(0);
              setPlaying((p) => !p);
            }}
            className="inline-flex items-center gap-2 h-9 px-5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {playing ? 'Pause' : cursor >= lastIdx ? 'Replay Trace' : 'Auto Play'}
          </button>

          <button
            onClick={() => {
              setPlaying(false);
              setCursor((c) => Math.min(lastIdx, c + 1));
            }}
            disabled={cursor >= lastIdx}
            className="inline-flex items-center gap-1 h-9 px-3.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold disabled:opacity-40 cursor-pointer"
          >
            Next Step <SkipForward className="h-4 w-4" />
          </button>

          {/* Step pills */}
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            {steps.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPlaying(false);
                  setCursor(idx);
                }}
                className={`h-7 min-w-[28px] px-2.5 rounded-full font-mono text-xs font-semibold transition-all cursor-pointer border ${
                  idx === cursor
                    ? 'bg-indigo-500 text-white border-indigo-500 shadow-xs'
                    : s.isViolation
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                      : idx < cursor
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                {idx === 0 ? 'Start' : idx}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <span className="hidden md:inline text-[11px] text-slate-400 mr-2">Tip: use &larr; / &rarr; keys to step</span><span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Speed:</span>
            {SPEEDS.map((s, i) => (
              <button
                key={s.label}
                onClick={() => setSpeedIdx(i)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer border ${
                  i === speedIdx
                    ? 'bg-indigo-500 text-white border-indigo-500'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Step Explanation + Math Condition Evaluation + Slide Verdict Banner */}
      <div
        className={`card bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 border-l-4 space-y-3 ${
          step.isViolation
            ? 'border-l-rose-500'
            : step.slideMilestone
              ? 'border-l-emerald-500'
              : 'border-l-indigo-500'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-mono text-xs font-bold">
              {step.stepIndex === 0 ? 'Initial State' : `Step ${step.stepIndex} / ${step.totalSteps}`}
            </span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Active Process:{' '}
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 font-mono font-bold">
                {step.activeProcess}
              </span>
            </span>
            {step.stepIndex > 0 && (
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-slate-700 font-mono text-xs">
                {step.codeLine}
              </span>
            )}
          </div>

          {/* Slide Milestone Smiley 😊 or Violation ☹️ */}
          {step.slideMilestone && !step.isViolation && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
              <CheckCircle2 className="h-4 w-4" />
              <span>😊 {step.slideMilestone}</span>
            </div>
          )}
          {step.isViolation && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold animate-pulse">
              <XCircle className="h-4 w-4" />
              <span>☹️ Synchronization Violation / Deadlock!</span>
            </div>
          )}
        </div>

        {/* Slide Math / Condition Evaluation Box */}
        {step.mathEval && (
          <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-2 font-mono text-xs font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
            <span>Slide Condition Evaluation: {step.mathEval}</span>
          </div>
        )}

        {/* Prominent English Step Explanation */}
        <div className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-start gap-2.5">
          <BookOpen className="h-4 w-4 text-indigo-500 dark:text-indigo-400 shrink-0 mt-1" />
          <div>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold mr-1.5">
              Step Walkthrough:
            </span>
            <span>{step.explanation}</span>
          </div>
        </div>

        {step.isViolation && step.violationMessage && (
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs font-bold text-rose-700 dark:text-rose-300 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
            <span>{step.violationMessage}</span>
          </div>
        )}
      </div>

      {/* 4. Slide-Exact Visual Stage: Dual Code Panels Side-by-Side + Live Trace Tables Underneath */}
      <div className="card bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3 p-3.5 sm:p-4">
        {/* Process State Summary Pills at top of stage */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 dark:border-slate-700/70 pb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
            Process States:
          </span>
          {Object.entries(step.processStates).map(([pid, st]) => {
            const meta = STATE_BADGE[st];
            return (
              <div
                key={pid}
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${meta.cls}`}
              >
                <span className="font-mono font-bold">{pid}:</span>
                <span>{meta.label}</span>
              </div>
            );
          })}
        </div>

        {/* Concurrency indicator (Race Condition preset) */}
        {isRaceStage && (
          <div
            className={`flex flex-wrap items-center justify-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
              step.isConcurrentInterleaving
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
            }`}
          >
            <Zap className={`h-3.5 w-3.5 ${step.isConcurrentInterleaving ? 'animate-pulse' : ''}`} />
            {step.isConcurrentInterleaving
              ? 'Interleaving: both processes are mid-update on counter at the same time (red = Consumer, green = Producer)'
              : 'Arrows show where each process currently is (red = Consumer, green = Producer)'}
          </div>
        )}

        {/* Dual Code Panels Side-by-Side (2 columns on md and up) */}
        {dualSpec && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
            {/* Left Process Code Panel */}
            <div
              className={`rounded-xl bg-slate-950 border p-2.5 sm:p-3 font-mono text-[13px] sm:text-[13.5px] transition-all flex flex-col justify-start ${
                isLeftActive
                  ? 'border-indigo-500/60 shadow-xs'
                  : 'border-slate-700 opacity-85'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-rose-400 text-xs sm:text-[13px]">
                    {dualSpec.leftTitle}
                  </span>
                  {dualSpec.leftSubtitle && (
                    <span className="hidden sm:inline text-[10.5px] text-slate-400 font-sans">
                      ({dualSpec.leftSubtitle})
                    </span>
                  )}
                </div>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-semibold">
                  {isLeftActive ? 'Active ➔' : 'Idle'}
                </span>
              </div>
              <div className="space-y-0.5">
                {dualSpec.leftLines.map((spec, idx) => {
                  const active = isLineHighlighted(spec, isLeftActive);
                  const spinning =
                    spec.isLoop &&
                    step.spinningProcesses?.some(
                      (p) => p === 'Consumer' || p === 'P0' || p === 'R1'
                    );
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-all leading-tight ${
                        active
                          ? 'bg-indigo-500/20 text-slate-100 font-bold border-l-2 border-l-indigo-400'
                          : spinning
                            ? 'bg-slate-800 text-slate-200 border-l-2 border-l-rose-400'
                            : isRaceStage && spec.ref && spec.ref === step.processPointers?.Consumer
                              ? 'bg-slate-800/70 text-slate-100 border-l-2 border-l-rose-400/70'
                              : 'text-slate-400 hover:text-slate-200'
                      } ${
                        isRaceStage && step.isConcurrentInterleaving && spec.ref && spec.ref === step.processPointers?.Consumer
                          ? 'ring-1 ring-rose-400/60'
                          : ''
                      }`}
                    >
                      <span className="w-5 flex justify-center shrink-0">
                        {isRaceStage ? (
                          spec.ref && spec.ref === step.processPointers?.Consumer ? (
                            <ArrowRight
                              className={`h-4 w-4 text-rose-400 ${step.isConcurrentInterleaving ? 'animate-pulse' : ''}`}
                              strokeWidth={3}
                            />
                          ) : null
                        ) : active || spinning ? (
                          <span className="text-indigo-400 font-black text-sm">➔</span>
                        ) : (
                          ''
                        )}
                      </span>
                      <span className="whitespace-pre overflow-x-auto">{spec.line}</span>
                      {spinning && (
                        <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[9px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                          <RefreshCw className="h-2.5 w-2.5 animate-spin" /> Spin
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              {isRaceStage && (
                <RegisterCard
                  tone="rose"
                  regName="Reg 1"
                  value={step.sharedVariables.Reg1}
                  pointer={step.processPointers?.Consumer}
                  rows={[
                    { ref: 'c_reg1_load', text: 'Reg 1 = counter' },
                    { ref: 'c_reg1_sub', text: 'Reg 1 = Reg 1 - 1' },
                    { ref: 'c_reg1_store', text: 'counter = Reg 1' },
                  ]}
                />
              )}
            </div>

            {/* Right Process Code Panel */}
            <div
              className={`rounded-xl bg-slate-950 border p-2.5 sm:p-3 font-mono text-[13px] sm:text-[13.5px] transition-all flex flex-col justify-start ${
                isRightActive
                  ? 'border-indigo-500/60 shadow-xs'
                  : 'border-slate-700 opacity-85'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-emerald-400 text-xs sm:text-[13px]">
                    {dualSpec.rightTitle}
                  </span>
                  {dualSpec.rightSubtitle && (
                    <span className="hidden sm:inline text-[10.5px] text-slate-400 font-sans">
                      ({dualSpec.rightSubtitle})
                    </span>
                  )}
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                  {isRightActive ? 'Active ➔' : 'Idle'}
                </span>
              </div>
              <div className="space-y-0.5">
                {dualSpec.rightLines.map((spec, idx) => {
                  const active = isLineHighlighted(spec, isRightActive);
                  const spinning =
                    spec.isLoop &&
                    step.spinningProcesses?.some(
                      (p) => p === 'Producer' || p === 'P1' || p === 'W1' || p === 'W2'
                    );
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-all leading-tight ${
                        active
                          ? 'bg-indigo-500/20 text-slate-100 font-bold border-l-2 border-l-indigo-400'
                          : spinning
                            ? 'bg-slate-800 text-slate-200 border-l-2 border-l-emerald-400'
                            : isRaceStage && spec.ref && spec.ref === step.processPointers?.Producer
                              ? 'bg-slate-800/70 text-slate-100 border-l-2 border-l-emerald-400/70'
                              : 'text-slate-400 hover:text-slate-200'
                      } ${
                        isRaceStage && step.isConcurrentInterleaving && spec.ref && spec.ref === step.processPointers?.Producer
                          ? 'ring-1 ring-emerald-400/60'
                          : ''
                      }`}
                    >
                      <span className="w-5 flex justify-center shrink-0">
                        {isRaceStage ? (
                          spec.ref && spec.ref === step.processPointers?.Producer ? (
                            <ArrowRight
                              className={`h-4 w-4 text-emerald-400 ${step.isConcurrentInterleaving ? 'animate-pulse' : ''}`}
                              strokeWidth={3}
                            />
                          ) : null
                        ) : active || spinning ? (
                          <span className="text-indigo-400 font-black text-sm">➔</span>
                        ) : (
                          ''
                        )}
                      </span>
                      <span className="whitespace-pre overflow-x-auto">{spec.line}</span>
                      {spinning && (
                        <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[9px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                          <RefreshCw className="h-2.5 w-2.5 animate-spin" /> Spin
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              {isRaceStage && (
                <RegisterCard
                  tone="emerald"
                  regName="Reg 2"
                  value={step.sharedVariables.Reg2}
                  pointer={step.processPointers?.Producer}
                  rows={[
                    { ref: 'p_reg2_load', text: 'Reg 2 = counter' },
                    { ref: 'p_reg2_add', text: 'Reg 2 = Reg 2 + 1' },
                    { ref: 'p_reg2_store', text: 'counter = Reg 2' },
                  ]}
                />
              )}
            </div>
          </div>
        )}

        {/* Slide-Authentic Tables per Topic (Directly Underneath both Algorithms) */}
        <div className="w-full pt-1">
          {(preset.id === 'preset_strict_alternation_turn' ||
            preset.id === 'preset_strict_alternation_buggy_exam' ||
            preset.id === 'preset_petersons_sequential' ||
            preset.id === 'preset_petersons_concurrent') && <PetersonAndTurnBoard step={step} />}

          {(preset.id === 'preset_hardware_test_and_set' ||
            preset.id === 'preset_hardware_swap') && <Hardware2ProcessBoard step={step} />}

          {preset.id === 'preset_n_process_bounded_waiting' && <NProcessBoundedBoard step={step} />}

          {(preset.id === 'preset_bounded_buffer_no_counter' ||
            preset.id === 'preset_race_condition_counter' ||
            preset.id === 'preset_producer_consumer_semaphores' ||
            preset.id === 'preset_semaphore_reversed_deadlock' ||
            preset.id === 'preset_readers_writers_trace') && (
            <ProducerConsumerAndRWSemaphoreBoard step={step} />
          )}

          {preset.id === 'preset_dining_philosophers_deadlock' && (
            <DiningPhilosophersBoard step={step} />
          )}
        </div>

        {/* Optional Atomic Hardware / Semaphore Helper Definition Box */}
        {dualSpec?.helperBox && (
          <div className="rounded-xl bg-slate-950 border border-slate-700 p-2.5 font-mono text-xs">
            <div className="font-sans font-semibold text-indigo-400 mb-1">
              {dualSpec.helperBox.title}
            </div>
            <pre className="text-slate-300 overflow-x-auto leading-relaxed">
              {dualSpec.helperBox.code}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default SyncModeSimulator;