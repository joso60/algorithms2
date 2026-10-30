import type { TraceStep, VisualTable, TableCellData, StringAlignmentView } from '../types/algorithm';

// ============================================================================
// 1. COMPARISON COUNTING SORT (0-based indexing: 0 to n-1)
// ============================================================================
export function generateComparisonCountingSteps(inputStr: string): TraceStep[] {
  const arr = inputStr
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (isNaN(Number(s)) ? s : Number(s)));

  const n = arr.length;
  if (n === 0) return [];

  const count = new Array<number>(n).fill(0);
  const sorted = new Array<string | number>(n).fill('');
  const countHistory: number[][] = [];
  const steps: TraceStep[] = [];

  const buildTables = (
    activeI?: number,
    activeJ?: number,
    incrementedIdx?: number,
    placedIdx?: number,
    phase: 'init' | 'compare' | 'place' = 'compare'
  ): VisualTable[] => {
    const indices = Array.from({ length: n }, (_, k) => k);

    const inputRow: TableCellData[] = arr.map((v, idx) => ({
      value: v,
      state:
        idx === activeI
          ? 'active'
          : idx === activeJ
            ? 'compare'
            : 'default',
      tooltip: `A[${idx}] = ${v}`,
    }));

    const countRow: TableCellData[] = count.map((c, idx) => ({
      value: c,
      state: idx === incrementedIdx ? 'match' : idx === activeI || idx === activeJ ? 'compare' : 'computed',
      editableKey: phase === 'place' ? `count-${idx}` : undefined,
      expectedValue: c,
      mistakeExplanation: `Count[${idx}] counts how many elements in A are strictly smaller than A[${idx}] (${arr[idx]}).`,
    }));

    const sortedRow: TableCellData[] = sorted.map((s, idx) => ({
      value: s === '' ? '—' : s,
      state: idx === placedIdx ? 'match' : s !== '' ? 'computed' : 'unvisited',
      editableKey: s !== '' ? `sorted-${idx}` : undefined,
      expectedValue: s,
      mistakeExplanation: `S[Count[i]] receives A[i] directly at its final sorted index ${idx}.`,
    }));

    const tables: VisualTable[] = [
      {
        id: 'ccs-main',
        title: 'Comparison Counting Arrays (A, Count, S)',
        subtitle: '0-based indexing: indices 0 to n - 1',
        colHeaders: indices,
        rowHeaders: ['Input A[0..n-1]', 'Count[0..n-1]', 'Sorted S[0..n-1]'],
        rows: [inputRow, countRow, sortedRow],
        indexBase: '0-based (0 .. n-1)',
      },
    ];

    if (countHistory.length > 0) {
      tables.push({
        id: 'ccs-history',
        title: 'Slide-Style Stepwise Count Matrix (After Each Outer Pass i)',
        subtitle: 'Matches Lecture 02 Slide 17 trace table',
        colHeaders: indices.map((k) => `Idx ${k} (${arr[k]})`),
        rowHeaders: countHistory.map((_, rIdx) => `After i = ${rIdx}`),
        rows: countHistory.map((rowSnap, rIdx) =>
          rowSnap.map((val, cIdx) => ({
            value: val,
            state: rIdx === countHistory.length - 1 ? 'active' : 'computed',
            editableKey: `hist-${rIdx}-${cIdx}`,
            expectedValue: val,
            mistakeExplanation: `After comparing A[${rIdx}] with all elements to its right (j = ${rIdx + 1}..${n - 1}), Count[${cIdx}] is ${val}.`,
          }))
        ),
      });
    }

    return tables;
  };

  steps.push({
    stepNumber: 1,
    codeLine: 2,
    title: 'Initialize Count Array to Zeros',
    explanation: `Initialize Count[0..${n - 1}] = 0. Each entry Count[i] will accumulate the total number of elements smaller than A[i].`,
    formula: `Count[i] ← 0 for i = 0 to ${n - 1}`,
    variables: { n },
    tables: buildTables(undefined, undefined, undefined, undefined, 'init'),
  });

  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const aI = arr[i];
      const aJ = arr[j];
      const isLess = aI < aJ;
      if (isLess) {
        count[j]++;
      } else {
        count[i]++;
      }
      steps.push({
        stepNumber: steps.length + 1,
        codeLine: isLess ? 6 : 7,
        title: `Compare A[${i}] (${aI}) vs A[${j}] (${aJ})`,
        explanation: isLess
          ? `Since A[${i}] = ${aI} < A[${j}] = ${aJ}, A[${j}] is larger, so we increment Count[${j}] to ${count[j]}.`
          : `Since A[${i}] = ${aI} ≥ A[${j}] = ${aJ}, we increment Count[${i}] to ${count[i]}.`,
        formula: isLess
          ? `${aI} < ${aJ} ⇒ Count[${j}] ← ${count[j] - 1} + 1 = ${count[j]}`
          : `${aI} ≥ ${aJ} ⇒ Count[${i}] ← ${count[i] - 1} + 1 = ${count[i]}`,
        variables: { i, j, 'A[i]': aI, 'A[j]': aJ },
        tables: buildTables(i, j, isLess ? j : i, undefined, 'compare'),
      });
    }
    countHistory.push([...count]);
  }

  for (let i = 0; i < n; i++) {
    const dest = count[i];
    sorted[dest] = arr[i];
    steps.push({
      stepNumber: steps.length + 1,
      codeLine: 9,
      title: `Place A[${i}] = ${arr[i]} into S[Count[${i}]] = S[${dest}]`,
      explanation: `Count[${i}] = ${dest} means there are ${dest} elements smaller than ${arr[i]}. Thus ${arr[i]} belongs directly at index ${dest} in sorted array S.`,
      formula: `S[Count[${i}]] = S[${dest}] ← A[${i}] (${arr[i]})`,
      variables: { i, 'A[i]': arr[i], 'Count[i]': dest },
      tables: buildTables(i, undefined, undefined, dest, 'place'),
    });
  }

  return steps;
}

// ============================================================================
// 2. DISTRIBUTION COUNTING SORT (2nd Variant - Levitin & Fall 2025 MidTerm Q1)
// ============================================================================
export function generateDistributionCountingSteps(inputStr: string): TraceStep[] {
  const raw = inputStr
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (raw.length === 0) return [];
  const isNumeric = raw.every((x) => !isNaN(Number(x)));
  const arr: (string | number)[] = isNumeric ? raw.map(Number) : raw;
  const n = arr.length;

  // Determine domain [l..u]
  let domain: (string | number)[] = [];
  if (isNumeric) {
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
  const dist = new Array<number>(m).fill(0);
  const sorted = new Array<string | number>(n).fill('');
  const placementHistory: { i: number; aVal: string | number; dSnap: number[]; sSnap: (string | number)[] }[] = [];
  const steps: TraceStep[] = [];

  const getDomainIndex = (val: string | number) => domain.indexOf(val);

  const buildTables = (
    activeInputIdx?: number,
    activeDomainIdx?: number,
    activeSortedIdx?: number
  ): VisualTable[] => {
    const tables: VisualTable[] = [
      {
        id: 'dcs-input',
        title: 'Input Array A[0..n-1] & Output Sorted Array S[0..n-1]',
        subtitle: 'Processed from Right to Left (i = n-1 down to 0) during placement for stability',
        colHeaders: Array.from({ length: n }, (_, idx) => idx),
        rowHeaders: ['Input A[i]', 'Sorted S[i]'],
        rows: [
          arr.map((v, idx) => ({
            value: v,
            state: idx === activeInputIdx ? 'active' : 'default',
          })),
          sorted.map((v, idx) => ({
            value: v === '' ? '—' : v,
            state: idx === activeSortedIdx ? 'match' : v !== '' ? 'computed' : 'unvisited',
            editableKey: v !== '' ? `s-final-${idx}` : undefined,
            expectedValue: v,
            mistakeExplanation: `Element at S[${idx}] should be ${v}. Remember we place A[i] at S[D[j] - 1] and decrement D[j].`,
          })),
        ],
        indexBase: '0-based (0 .. n-1)',
      },
      {
        id: 'dcs-freq-dist',
        title: 'Frequency & Distribution Arrays D[0..u-l]',
        subtitle: `Domain values l = ${domain[0]} to u = ${domain[m - 1]} (j = 0 to ${m - 1})`,
        colHeaders: domain.map((d, j) => `j=${j} ('${d}')`),
        rowHeaders: ['Frequency F[j]', 'Distribution D[j]'],
        rows: [
          freq.map((f, j) => ({
            value: f,
            state: j === activeDomainIdx ? 'active' : 'computed',
            editableKey: `freq-${j}`,
            expectedValue: f,
            mistakeExplanation: `Frequency of '${domain[j]}' in input A is ${f}.`,
          })),
          dist.map((d, j) => ({
            value: d,
            state: j === activeDomainIdx ? 'match' : 'computed',
            editableKey: `dist-${j}`,
            expectedValue: d,
            mistakeExplanation: `Distribution D[${j}] represents the cumulative count (or remaining position pointer) for '${domain[j]}'.`,
          })),
        ],
        indexBase: '0-based (j = 0 .. u-l)',
      },
    ];

    if (placementHistory.length > 0) {
      tables.push({
        id: 'dcs-exam-table',
        title: 'Fall 2025 MidTerm Q1 Exam Trace Table (D[0..u-l] & S[0..n-1] per Iteration)',
        subtitle: 'Shows exact state of Distribution D and Sorted array S after each right-to-left step i',
        colHeaders: [
          ...domain.map((d, j) => `D[${j}] (${d})`),
          ...Array.from({ length: n }, (_, k) => `S[${k}]`),
        ],
        rowHeaders: placementHistory.map((h) => `i = ${h.i} (A[${h.i}]=${h.aVal})`),
        rows: placementHistory.map((h, rIdx) => [
          ...h.dSnap.map((dVal, cIdx) => ({
            value: dVal,
            state: (rIdx === placementHistory.length - 1 && cIdx === getDomainIndex(h.aVal)
              ? 'match'
              : 'computed') as TableCellData['state'],
            editableKey: `exam-d-${rIdx}-${cIdx}`,
            expectedValue: dVal,
            mistakeExplanation: `At i=${h.i}, we processed '${h.aVal}' (j=${getDomainIndex(h.aVal)}), so D[${getDomainIndex(h.aVal)}] was decremented after placing into S.`,
          })),
          ...h.sSnap.map((sVal, cIdx) => ({
            value: sVal === '' ? '' : sVal,
            state: (sVal !== '' ? 'computed' : 'unvisited') as TableCellData['state'],
            editableKey: sVal !== '' ? `exam-s-${rIdx}-${cIdx}` : undefined,
            expectedValue: sVal,
            mistakeExplanation: `At i=${h.i}, S[${cIdx}] holds '${sVal}'.`,
          })),
        ]),
      });
    }

    return tables;
  };

  steps.push({
    stepNumber: 1,
    codeLine: 2,
    title: 'Initialize Frequency Array D[0..u-l] = 0',
    explanation: `Domain ranges from l = '${domain[0]}' to u = '${domain[m - 1]}' (${m} distinct buckets). Initialize all counts to 0.`,
    formula: `D[j] ← 0 for j = 0 to ${m - 1}`,
    variables: { n, l: domain[0], u: domain[m - 1] },
    tables: buildTables(),
  });

  // Compute frequencies
  for (let i = 0; i < n; i++) {
    const j = getDomainIndex(arr[i]);
    freq[j]++;
    dist[j] = freq[j];
  }
  steps.push({
    stepNumber: 2,
    codeLine: 4,
    title: 'Compute Frequencies of Each Key Value',
    explanation: `Scan A[0..${n - 1}] and count occurrences of each value: ${domain.map((d, j) => `'${d}': ${freq[j]}`).join(', ')}.`,
    formula: `D[A[i] - l] ← D[A[i] - l] + 1`,
    variables: { TotalElements: n },
    tables: buildTables(),
  });

  // Compute distribution (cumulative sum)
  for (let j = 1; j < m; j++) {
    dist[j] = dist[j - 1] + freq[j];
  }
  const initialDist = [...dist];
  steps.push({
    stepNumber: 3,
    codeLine: 6,
    title: 'Compute Cumulative Distribution Values D[j] = D[j-1] + D[j]',
    explanation: `Compute running sums in D[0..${m - 1}]: [${initialDist.join(', ')}]. Each D[j] now indicates the 1-based last position where key (l + j) should be placed.`,
    formula: `D[j] ← D[j - 1] + D[j] for j = 1 to ${m - 1}`,
    variables: { InitialD: `[${initialDist.join(', ')}]` },
    tables: buildTables(),
  });

  // Right-to-left placement
  for (let i = n - 1; i >= 0; i--) {
    const val = arr[i];
    const j = getDomainIndex(val);
    const pos = dist[j] - 1;
    sorted[pos] = val;
    dist[j] = dist[j] - 1;

    placementHistory.push({
      i,
      aVal: val,
      dSnap: [...dist],
      sSnap: [...sorted],
    });

    steps.push({
      stepNumber: steps.length + 1,
      codeLine: 9,
      title: `Iteration i = ${i}: Place A[${i}] = '${val}' at S[${pos}]`,
      explanation: `Look up j = '${val}' (domain index ${j}). Current D[${j}] was ${pos + 1}, so we place '${val}' at S[${pos + 1} - 1] = S[${pos}] and decrement D[${j}] to ${dist[j]}.`,
      formula: `j = '${val}' (idx ${j}) ⇒ S[${pos + 1} - 1] = S[${pos}] ← '${val}', then D[${j}] ← ${dist[j]}`,
      variables: { i, 'A[i]': val, j, 'S index': pos, 'New D[j]': dist[j] },
      tables: buildTables(i, j, pos),
    });
  }

  return steps;
}

// ============================================================================
// 3. BRUTE FORCE STRING MATCHING (0-based indexing)
// ============================================================================
export function generateBruteForceSMSteps(text: string, pattern: string): TraceStep[] {
  const T = text.trim();
  const P = pattern.trim();
  const n = T.length;
  const m = P.length;
  if (n === 0 || m === 0 || m > n) return [];

  const steps: TraceStep[] = [];
  const historyRows: StringAlignmentView['historyRows'] = [];

  for (let i = 0; i <= n - m; i++) {
    let j = 0;
    const currentComparisons: { patIdx: number; match: boolean }[] = [];

    while (j < m && P[j] === T[i + j]) {
      currentComparisons.push({ patIdx: j, match: true });
      steps.push({
        stepNumber: steps.length + 1,
        codeLine: 4,
        title: `Alignment i = ${i}, Compare j = ${j}: Match '${P[j]}' == '${T[i + j]}'`,
        explanation: `Compare P[${j}] ('${P[j]}') with T[${i} + ${j}] = T[${i + j}] ('${T[i + j]}'). Characters match! Increment j to ${j + 1}.`,
        formula: `P[${j}] ('${P[j]}') == T[${i + j}] ('${T[i + j]}') ⇒ j ← ${j + 1}`,
        variables: { i, j, 'T[i+j]': T[i + j], 'P[j]': P[j], 'Max i (n-m)': n - m },
        tables: [],
        stringView: {
          text: T,
          pattern: P,
          alignIndex: i,
          currentCompareTextIdx: i + j,
          currentComparePatIdx: j,
          matchedIndices: currentComparisons.filter((c) => c.match).map((c) => c.patIdx),
          historyRows: [...historyRows, { alignIndex: i, pattern: P, comparedIndices: [...currentComparisons] }],
        },
      });
      j++;
    }

    if (j === m) {
      historyRows.push({
        alignIndex: i,
        pattern: P,
        shiftApplied: 0,
        shiftFormula: `Full Match at index i = ${i}!`,
        comparedIndices: [...currentComparisons],
      });
      steps.push({
        stepNumber: steps.length + 1,
        codeLine: 6,
        title: `Pattern Found at Index i = ${i}!`,
        explanation: `All m = ${m} characters matched (j reached ${m}). Return starting index i = ${i}.`,
        formula: `j == m (${m}) ⇒ return i = ${i}`,
        variables: { i, j, MatchIndex: i },
        tables: [],
        stringView: {
          text: T,
          pattern: P,
          alignIndex: i,
          matchedIndices: Array.from({ length: m }, (_, k) => k),
          historyRows: [...historyRows],
        },
      });
      return steps;
    } else {
      currentComparisons.push({ patIdx: j, match: false });
      historyRows.push({
        alignIndex: i,
        pattern: P,
        shiftApplied: 1,
        shiftFormula: `Mismatch at P[${j}] ('${P[j]}') ≠ T[${i + j}] ('${T[i + j]}') → Shift by 1`,
        comparedIndices: [...currentComparisons],
      });
      steps.push({
        stepNumber: steps.length + 1,
        codeLine: 4,
        title: `Alignment i = ${i}, Mismatch at j = ${j}: '${P[j]}' ≠ '${T[i + j]}'`,
        explanation: `P[${j}] ('${P[j]}') does not match T[${i + j}] ('${T[i + j]}'). Brute Force shifts the pattern 1 position to the right (i ← ${i + 1}) and resets j = 0.`,
        formula: `P[${j}] ('${P[j]}') ≠ T[${i + j}] ('${T[i + j]}') ⇒ Shift by 1 (i ← ${i + 1})`,
        variables: { i, j, 'T[i+j]': T[i + j], 'P[j]': P[j], Next_i: i + 1 },
        tables: [],
        stringView: {
          text: T,
          pattern: P,
          alignIndex: i,
          currentCompareTextIdx: i + j,
          currentComparePatIdx: j,
          matchedIndices: currentComparisons.filter((c) => c.match).map((c) => c.patIdx),
          mismatchedIndex: j,
          historyRows: [...historyRows],
        },
      });
    }
  }

  return steps;
}

// ============================================================================
// 4. HORSPOOL'S ALGORITHM (Shift Table t(c) + Right-to-Left Search)
// ============================================================================
export function computeHorspoolShiftTable(pattern: string): Record<string, number> {
  const m = pattern.length;
  const table: Record<string, number> = {};
  for (let j = 0; j <= m - 2; j++) {
    table[pattern[j]] = m - 1 - j;
  }
  return table;
}

export function generateHorspoolSteps(text: string, pattern: string): TraceStep[] {
  const T = text.trim();
  const P = pattern.trim();
  const n = T.length;
  const m = P.length;
  if (n === 0 || m === 0 || m > n) return [];

  const shiftMap = computeHorspoolShiftTable(P);
  const uniqueChars = Array.from(new Set((P + T).split(''))).sort();
  const displayCols = [...uniqueChars, 'Other (*)'];

  const buildShiftVisualTable = (highlightChar?: string): VisualTable => ({
    id: 'horspool-shift-table',
    title: `Horspool Shift Table t(c) for Pattern "${P}" (m = ${m})`,
    subtitle: `Formula: t(c) = m (${m}) if c not in P[0..${m - 2}], else m - 1 - j where j is rightmost index in first m-1 chars`,
    colHeaders: displayCols,
    rowHeaders: ['Shift t(c)'],
    rows: [
      displayCols.map((ch) => {
        const val = ch === 'Other (*)' ? m : (shiftMap[ch] ?? m);
        const isHighlighted =
          highlightChar !== undefined &&
          (ch === highlightChar || (ch === 'Other (*)' && !(highlightChar in shiftMap)));
        return {
          value: val,
          state: isHighlighted ? 'match' : 'computed',
          editableKey: `horspool-t-${ch}`,
          expectedValue: val,
          mistakeExplanation:
            ch === 'Other (*)' || !(ch in shiftMap)
              ? `'${ch}' does not appear in the first m-1 (${m - 1}) characters of "${P}", so its shift is the full length m = ${m}.`
              : `The rightmost occurrence of '${ch}' in P[0..${m - 2}] ("${P.slice(0, m - 1)}") is at index j = ${P.slice(0, m - 1).lastIndexOf(ch)}, so t('${ch}') = ${m} - 1 - ${P.slice(0, m - 1).lastIndexOf(ch)} = ${val}.`,
        };
      }),
    ],
    indexBase: '0-based pattern P[0..m-1]',
  });

  const steps: TraceStep[] = [];
  const historyRows: StringAlignmentView['historyRows'] = [];

  steps.push({
    stepNumber: 1,
    codeLine: 1,
    title: `Step 1: Construct Horspool Shift Table t(c) for "${P}"`,
    explanation: `Initialize all alphabet entries to m = ${m}. Then for j = 0 to m - 2 (0 to ${m - 2}), set Table[P[j]] = ${m} - 1 - j. Note: the last character P[${m - 1}] = '${P[m - 1]}' is excluded unless it also appears earlier in P[0..${m - 2}].`,
    formula: `for j ← 0 to ${m - 2} do Table[P[j]] ← ${m - 1} - j`,
    variables: { m, n, 'P[0..m-2]': P.slice(0, m - 1) },
    tables: [buildShiftVisualTable()],
    stringView: {
      text: T,
      pattern: P,
      alignIndex: 0,
      historyRows: [],
    },
  });

  let i = m - 1;
  while (i <= n - 1) {
    let k = 0;
    const alignStart = i - (m - 1);
    const currentComparisons: { patIdx: number; match: boolean }[] = [];

    while (k <= m - 1 && P[m - 1 - k] === T[i - k]) {
      const patIdx = m - 1 - k;
      const txtIdx = i - k;
      currentComparisons.push({ patIdx, match: true });

      steps.push({
        stepNumber: steps.length + 1,
        codeLine: 6,
        title: `i = ${i}, k = ${k}: Right-to-Left Match P[${patIdx}] ('${P[patIdx]}') == T[${txtIdx}] ('${T[txtIdx]}')`,
        explanation: `Compare P[m - 1 - k] = P[${patIdx}] ('${P[patIdx]}') with T[i - k] = T[${txtIdx}] ('${T[txtIdx]}'). Match! Increment k ← ${k + 1}.`,
        formula: `P[${patIdx}] ('${P[patIdx]}') == T[${txtIdx}] ('${T[txtIdx]}') ⇒ k ← ${k + 1}`,
        variables: { i, k, 'T[i] (Aligned Last)': T[i], 'Compared T[i-k]': T[txtIdx] },
        tables: [buildShiftVisualTable()],
        stringView: {
          text: T,
          pattern: P,
          alignIndex: alignStart,
          currentCompareTextIdx: txtIdx,
          currentComparePatIdx: patIdx,
          matchedIndices: currentComparisons.filter((c) => c.match).map((c) => c.patIdx),
          historyRows: [...historyRows, { alignIndex: alignStart, pattern: P, comparedIndices: [...currentComparisons] }],
        },
      });
      k++;
    }

    if (k === m) {
      historyRows.push({
        alignIndex: alignStart,
        pattern: P,
        shiftApplied: 0,
        shiftFormula: `Match found at index i - m + 1 = ${i} - ${m} + 1 = ${alignStart}!`,
        comparedIndices: [...currentComparisons],
      });
      steps.push({
        stepNumber: steps.length + 1,
        codeLine: 8,
        title: `Pattern Found at Index ${alignStart}!`,
        explanation: `k = ${m} characters matched from right to left! Return i - m + 1 = ${i} - ${m} + 1 = ${alignStart}.`,
        formula: `k == m (${m}) ⇒ return i - m + 1 = ${alignStart}`,
        variables: { i, k, MatchStart: alignStart },
        tables: [buildShiftVisualTable()],
        stringView: {
          text: T,
          pattern: P,
          alignIndex: alignStart,
          matchedIndices: Array.from({ length: m }, (_, idx) => idx),
          historyRows: [...historyRows],
        },
      });
      return steps;
    } else {
      const patIdx = m - 1 - k;
      const txtIdx = i - k;
      const alignedChar = T[i]; // CRITICAL HORSPOOL RULE: always look up T[i], aligned with LAST char of P!
      const shiftVal = shiftMap[alignedChar] ?? m;
      currentComparisons.push({ patIdx, match: false });

      historyRows.push({
        alignIndex: alignStart,
        pattern: P,
        shiftApplied: shiftVal,
        shiftFormula: `t(T[${i}]) = t('${alignedChar}') = ${shiftVal} → i ← ${i} + ${shiftVal} = ${i + shiftVal}`,
        comparedIndices: [...currentComparisons],
      });

      steps.push({
        stepNumber: steps.length + 1,
        codeLine: 9,
        title: `Mismatch at k = ${k} ('${P[patIdx]}' ≠ '${T[txtIdx]}'): Shift by t(T[${i}]) = t('${alignedChar}') = ${shiftVal}`,
        explanation: `Mismatch between P[${patIdx}] ('${P[patIdx]}') and T[${txtIdx}] ('${T[txtIdx]}') after k = ${k} matches. In Horspool's algorithm, we ALWAYS look up T[i] = T[${i}] = '${alignedChar}' (the text character aligned with the LAST character of the pattern). Shift table gives t('${alignedChar}') = ${shiftVal}, so i ← ${i} + ${shiftVal} = ${i + shiftVal}.`,
        formula: `i ← i + Table[T[${i}]] = ${i} + t('${alignedChar}') = ${i} + ${shiftVal} = ${i + shiftVal}`,
        variables: { i, k, 'T[i]': alignedChar, 't(T[i])': shiftVal, 'Next i': i + shiftVal },
        tables: [buildShiftVisualTable(alignedChar)],
        stringView: {
          text: T,
          pattern: P,
          alignIndex: alignStart,
          currentCompareTextIdx: txtIdx,
          currentComparePatIdx: patIdx,
          matchedIndices: currentComparisons.filter((c) => c.match).map((c) => c.patIdx),
          mismatchedIndex: patIdx,
          historyRows: [...historyRows],
        },
      });

      i = i + shiftVal;
    }
  }

  return steps;
}

// ============================================================================
// 5. BOYER-MOORE ALGORITHM (t1 Bad-Symbol + d2 Good-Suffix + d = max(d1, d2))
// ============================================================================
export function computeGoodSuffixTable(pattern: string): { k: number; suffix: string; d2: number; reason: string }[] {
  const m = pattern.length;
  const rows: { k: number; suffix: string; d2: number; reason: string }[] = [];

  for (let k = 1; k < m; k++) {
    const suff = pattern.slice(m - k);
    const precedingChar = pattern[m - k - 1];

    // Case 1: Find rightmost occurrence of suff in pattern[0..m-2] not preceded by precedingChar
    let foundShift = -1;
    for (let start = m - k - 1; start >= 0; start--) {
      if (pattern.slice(start, start + k) === suff) {
        const charBefore = start > 0 ? pattern[start - 1] : null;
        if (charBefore !== precedingChar) {
          foundShift = m - k - start;
          break;
        }
      }
    }

    if (foundShift !== -1) {
      rows.push({
        k,
        suffix: suff,
        d2: foundShift,
        reason: `Case I: Rightmost occurrence of suffix "${suff}" not preceded by '${precedingChar}' is at distance ${foundShift}.`,
      });
    } else {
      // Case 3: Check longest prefix of pattern that matches a suffix of suff
      let bestPrefixLen = 0;
      for (let len = k - 1; len >= 1; len--) {
        const prefix = pattern.slice(0, len);
        const tailSuffix = pattern.slice(m - len);
        if (prefix === tailSuffix) {
          bestPrefixLen = len;
          break;
        }
      }
      if (bestPrefixLen > 0) {
        const shift = m - bestPrefixLen;
        rows.push({
          k,
          suffix: suff,
          d2: shift,
          reason: `Case III: No interior occurrence of "${suff}", but prefix "${pattern.slice(0, bestPrefixLen)}" matches tail suffix → d2 = ${m} - ${bestPrefixLen} = ${shift}.`,
        });
      } else {
        rows.push({
          k,
          suffix: suff,
          d2: m,
          reason: `Case II: No occurrence of "${suff}" and no matching prefix → shift by full pattern length m = ${m}.`,
        });
      }
    }
  }
  return rows;
}

export function generateBoyerMooreSteps(text: string, pattern: string): TraceStep[] {
  const T = text.trim();
  const P = pattern.trim();
  const n = T.length;
  const m = P.length;
  if (n === 0 || m === 0 || m > n) return [];

  const t1Map = computeHorspoolShiftTable(P);
  const d2Rows = computeGoodSuffixTable(P);
  const uniqueChars = Array.from(new Set((P + T).split(''))).sort();
  const displayCols = [...uniqueChars, 'Other (*)'];

  const buildBMPreTables = (highlightChar?: string, highlightK?: number): VisualTable[] => [
    {
      id: 'bm-bad-symbol',
      title: `Bad-Symbol Shift Table t₁(c) for "${P}"`,
      subtitle: `d₁ = max(t₁(c) - k, 1) where c = T[i - k] is the mismatched text character`,
      colHeaders: displayCols,
      rowHeaders: ['t₁(c)'],
      rows: [
        displayCols.map((ch) => {
          const val = ch === 'Other (*)' ? m : (t1Map[ch] ?? m);
          const isHi =
            highlightChar !== undefined &&
            (ch === highlightChar || (ch === 'Other (*)' && !(highlightChar in t1Map)));
          return {
            value: val,
            state: isHi ? 'match' : 'computed',
            editableKey: `bm-t1-${ch}`,
            expectedValue: val,
            mistakeExplanation: `Bad-symbol table t₁(c) uses the exact same formula as Horspool's shift table: ${val}.`,
          };
        }),
      ],
    },
    {
      id: 'bm-good-suffix',
      title: `Good-Suffix Table d₂(k) for Pattern "${P}" (k = 1..${m - 1})`,
      subtitle: 'Used when 0 < k < m characters match before a mismatch occurs',
      colHeaders: ['k (Matched Suffix Len)', 'Pattern & Suffix suff(k)', 'd₂(k)'],
      rows: d2Rows.map((r) => [
        { value: r.k, state: highlightK === r.k ? 'active' : 'default' },
        {
          value: `${P.slice(0, m - r.k)} [${r.suffix}]`,
          state: highlightK === r.k ? 'compare' : 'default',
          tooltip: r.reason,
        },
        {
          value: r.d2,
          state: highlightK === r.k ? 'match' : 'computed',
          editableKey: `bm-d2-${r.k}`,
          expectedValue: r.d2,
          mistakeExplanation: r.reason,
        },
      ]),
    },
  ];

  const steps: TraceStep[] = [];
  const historyRows: StringAlignmentView['historyRows'] = [];

  steps.push({
    stepNumber: 1,
    codeLine: 1,
    title: `Step 1: Construct Bad-Symbol Table t₁(c) and Good-Suffix Table d₂(k)`,
    explanation: `Preprocess pattern "${P}" (m = ${m}) into two tables: Bad-Symbol table t₁(c) and Good-Suffix table d₂(k) for k = 1 to ${m - 1}.`,
    formula: `d = d₁ if k = 0; else d = max(d₁, d₂) where d₁ = max(t₁(c) - k, 1)`,
    variables: { m, n },
    tables: buildBMPreTables(),
    stringView: {
      text: T,
      pattern: P,
      alignIndex: 0,
      historyRows: [],
    },
  });

  let i = m - 1;
  while (i <= n - 1) {
    let k = 0;
    const alignStart = i - (m - 1);
    const currentComparisons: { patIdx: number; match: boolean }[] = [];

    while (k <= m - 1 && P[m - 1 - k] === T[i - k]) {
      const patIdx = m - 1 - k;
      currentComparisons.push({ patIdx, match: true });
      k++;
    }

    if (k === m) {
      historyRows.push({
        alignIndex: alignStart,
        pattern: P,
        shiftApplied: 0,
        shiftFormula: `Full Match at index ${alignStart}!`,
        comparedIndices: [...currentComparisons],
      });
      steps.push({
        stepNumber: steps.length + 1,
        codeLine: 7,
        title: `Pattern Found at Index ${alignStart}!`,
        explanation: `All m = ${m} characters matched (k = ${m}). Pattern "${P}" is found at index ${alignStart}.`,
        formula: `k == m (${m}) ⇒ Match at index ${alignStart}`,
        variables: { i, k, MatchIndex: alignStart },
        tables: buildBMPreTables(),
        stringView: {
          text: T,
          pattern: P,
          alignIndex: alignStart,
          matchedIndices: Array.from({ length: m }, (_, idx) => idx),
          historyRows: [...historyRows],
        },
      });
      return steps;
    } else {
      const patIdx = m - 1 - k;
      const txtIdx = i - k;
      const mismatchedChar = T[txtIdx]; // In Boyer-Moore, c is the MISMATCHED character in T!
      currentComparisons.push({ patIdx, match: false });

      const t1Val = t1Map[mismatchedChar] ?? m;
      const d1 = Math.max(t1Val - k, 1);
      const d2 = k === 0 ? 0 : (d2Rows.find((r) => r.k === k)?.d2 ?? m);
      const d = k === 0 ? d1 : Math.max(d1, d2);

      const formulaStr =
        k === 0
          ? `k = 0: d = d₁ = t₁('${mismatchedChar}') = ${d1}`
          : `k = ${k}: d₁ = max(t₁('${mismatchedChar}') - ${k}, 1) = max(${t1Val} - ${k}, 1) = ${d1}, d₂(${k}) = ${d2} ⇒ d = max(${d1}, ${d2}) = ${d}`;

      historyRows.push({
        alignIndex: alignStart,
        pattern: P,
        shiftApplied: d,
        shiftFormula: formulaStr,
        comparedIndices: [...currentComparisons],
      });

      steps.push({
        stepNumber: steps.length + 1,
        codeLine: k === 0 ? 9 : 11,
        title: `Alignment i = ${i} (k = ${k} matched): Shift d = ${d}`,
        explanation:
          k === 0
            ? `First comparison failed at P[${patIdx}] ('${P[patIdx]}') ≠ T[${txtIdx}] ('${mismatchedChar}'). Since k = 0, only bad-symbol shift applies: d = d₁ = t₁('${mismatchedChar}') = ${d1}.`
            : `Matched k = ${k} suffix characters ("${P.slice(m - k)}") before mismatch at P[${patIdx}] ('${P[patIdx]}') ≠ T[${txtIdx}] ('${mismatchedChar}'). Bad-symbol shift d₁ = max(${t1Val} - ${k}, 1) = ${d1}; Good-suffix shift d₂(${k}) = ${d2}. Shift by d = max(${d1}, ${d2}) = ${d}.`,
        formula: formulaStr,
        variables: { i, k, 'Mismatched c': mismatchedChar, d1, d2: k === 0 ? 'N/A' : d2, 'Shift d': d },
        tables: buildBMPreTables(mismatchedChar, k > 0 ? k : undefined),
        stringView: {
          text: T,
          pattern: P,
          alignIndex: alignStart,
          currentCompareTextIdx: txtIdx,
          currentComparePatIdx: patIdx,
          matchedIndices: currentComparisons.filter((c) => c.match).map((c) => c.patIdx),
          mismatchedIndex: patIdx,
          historyRows: [...historyRows],
        },
      });

      i += d;
    }
  }

  return steps;
}

// ============================================================================
// 6. HASHING (Open Hashing / Separate Chaining & Closed Hashing / Probing)
// ============================================================================
export function generateHashingSteps(keysStr: string, sizeStr: string): TraceStep[] {
  const keys = keysStr
    .split(/[\s,]+/)
    .map((s) => Number(s.trim()))
    .filter((n) => !isNaN(n));
  const m = Math.max(3, Math.min(31, Number(sizeStr) || 10));

  const linearTable: (number | null)[] = new Array(m).fill(null);
  const quadTable: (number | null)[] = new Array(m).fill(null);
  const doubleTable: (number | null)[] = new Array(m).fill(null);
  const chainTable: number[][] = Array.from({ length: m }, () => []);

  const steps: TraceStep[] = [];

  const buildHashTables = (_activeKey?: number, activeLin?: number, activeQuad?: number, activeDbl?: number, activeChain?: number): VisualTable[] => {
    const indices = Array.from({ length: m }, (_, i) => i);
    return [
      {
        id: 'hash-comparison-table',
        title: `Hash Table States (Table Size m = ${m}, H₁(x) = x mod ${m})`,
        subtitle: `Compares Closed Hashing (Linear, Quadratic, Double Hashing) vs. Open Hashing (Separate Chaining)`,
        colHeaders: indices.map((idx) => `Index ${idx}`),
        rowHeaders: [
          'Linear Probing (h + i)',
          'Quadratic Probing (h + i²)',
          'Double Hashing (h + i·H₂)',
          'Separate Chaining (List)',
        ],
        rows: [
          linearTable.map((v, idx) => ({
            value: v === null ? 'Empty' : v,
            state: idx === activeLin ? 'match' : v !== null ? 'computed' : 'unvisited',
            editableKey: v !== null ? `lin-${idx}` : undefined,
            expectedValue: v ?? 'Empty',
            mistakeExplanation: `In Linear Probing, if H₁(x) is occupied, probe (H₁(x) + 1) mod ${m}, (H₁(x) + 2) mod ${m}, etc.`,
          })),
          quadTable.map((v, idx) => ({
            value: v === null ? 'Empty' : v,
            state: idx === activeQuad ? 'match' : v !== null ? 'computed' : 'unvisited',
            editableKey: v !== null ? `quad-${idx}` : undefined,
            expectedValue: v ?? 'Empty',
            mistakeExplanation: `In Quadratic Probing (Lecture 06 Slide 48), probe sequence checks (h + 1²) mod ${m}, (h + 2²) mod ${m}, (h + 3²) mod ${m}.`,
          })),
          doubleTable.map((v, idx) => ({
            value: v === null ? 'Empty' : v,
            state: idx === activeDbl ? 'match' : v !== null ? 'computed' : 'unvisited',
            editableKey: v !== null ? `dbl-${idx}` : undefined,
            expectedValue: v ?? 'Empty',
            mistakeExplanation: `In Double Hashing (Slide 49), step size is H₂(x) = ${m === 10 ? '4 - (x mod 2)' : '7 - (x mod 7)'}.`,
          })),
          chainTable.map((bucket, idx) => ({
            value: bucket.length === 0 ? 'NULL' : bucket.join(' → '),
            state: idx === activeChain ? 'match' : bucket.length > 0 ? 'computed' : 'unvisited',
            editableKey: bucket.length > 0 ? `chain-${idx}` : undefined,
            expectedValue: bucket.join(' → '),
            mistakeExplanation: `Separate Chaining appends colliding keys to the linked list at index H₁(x) = ${idx}.`,
          })),
        ],
        indexBase: `0-based indices 0 .. ${m - 1}`,
      },
    ];
  };

  steps.push({
    stepNumber: 1,
    codeLine: 1,
    title: `Initialize Hash Table of Size m = ${m}`,
    explanation: `Primary hash function H₁(x) = x mod ${m}. For Double Hashing, secondary hash function is ${m === 10 ? 'H₂(x) = 4 - (x mod 2) (from Lecture 06 Slide 47)' : 'H₂(x) = 7 - (x mod 7)'}.`,
    formula: `H₁(x) = x mod ${m}, Load Factor α = n / m = ${keys.length} / ${m} = ${(keys.length / m).toFixed(2)}`,
    variables: { m, n: keys.length, 'Load Factor α': (keys.length / m).toFixed(2) },
    tables: buildHashTables(),
  });

  keys.forEach((key, kIdx) => {
    const h1 = ((key % m) + m) % m;
    const h2 = m === 10 ? 4 - (key % 2) : 7 - (key % 7);

    // 1. Linear
    let linIdx = h1;
    let linProbes = 0;
    while (linearTable[linIdx] !== null && linProbes < m) {
      linProbes++;
      linIdx = (h1 + linProbes) % m;
    }
    linearTable[linIdx] = key;

    // 2. Quadratic
    let quadIdx = h1;
    let quadProbes = 0;
    while (quadTable[quadIdx] !== null && quadProbes < m) {
      quadProbes++;
      quadIdx = (h1 + quadProbes * quadProbes) % m;
    }
    quadTable[quadIdx] = key;

    // 3. Double Hashing
    let dblIdx = h1;
    let dblProbes = 0;
    while (doubleTable[dblIdx] !== null && dblProbes < m) {
      dblProbes++;
      dblIdx = (h1 + dblProbes * h2) % m;
    }
    doubleTable[dblIdx] = key;

    // 4. Separate Chaining
    chainTable[h1].push(key);

    steps.push({
      stepNumber: steps.length + 1,
      codeLine: linProbes > 0 ? 5 : 3,
      title: `Insert Key #${kIdx + 1}: x = ${key} (H₁(${key}) = ${h1})`,
      explanation:
        linProbes === 0
          ? `H₁(${key}) = ${key} mod ${m} = ${h1}. Cell ${h1} is empty! Placed directly at index ${h1} in all schemes.`
          : `Collision at H₁(${key}) = ${h1}! Linear Probing places at (${h1} + ${linProbes}) mod ${m} = ${linIdx}. Quadratic Probing places at (${h1} + ${quadProbes}²) mod ${m} = ${quadIdx}. Double Hashing uses H₂(${key}) = ${h2} to place at (${h1} + ${dblProbes}×${h2}) mod ${m} = ${dblIdx}. Separate Chaining links ${key} into bucket ${h1}.`,
      formula: `H₁(${key}) = ${h1}${linProbes > 0 ? ` | Quad: (${h1} + ${quadProbes}²) mod ${m} = ${quadIdx} | Double: (${h1} + ${dblProbes}·${h2}) mod ${m} = ${dblIdx}` : ''}`,
      variables: {
        Key: key,
        'H₁(x)': h1,
        'H₂(x)': h2,
        'Linear Idx': linIdx,
        'Quad Idx': quadIdx,
        'Double Idx': dblIdx,
      },
      tables: buildHashTables(key, linIdx, quadIdx, dblIdx, h1),
    });
  });

  return steps;
}

// ============================================================================
// 7. B-TREES (Order m, Node Splitting & Exam Deletion Scenarios)
// ============================================================================
export function generateBTreeSteps(exampleKey: string, orderStr: string): TraceStep[] {
  const m = Math.max(3, Math.min(7, Number(orderStr) || 4));
  const minKeys = Math.ceil(m / 2) - 1;
  const maxKeys = m - 1;
  const steps: TraceStep[] = [];

  if (exampleKey === 'fall2025-q8') {
    // Exact Fall 2025 MidTerm Q8: Initial B-Tree (m=4) + Insert 19, 56, 87, 42, 77
    const snapshots = [
      {
        title: 'Initial B-Tree (Order m = 4, Min Keys = 1, Max Keys = 3)',
        codeLine: 1,
        explanation: 'Initial B-Tree from Fall 2025 Midterm Q8: Root [47, 68] with 3 leaf children: [13, 24, 38], [59, 64], and [71, 82, 95].',
        formula: `Order m = 4 ⇒ Min Keys = ⌈4/2⌉ - 1 = 1, Max Keys = 4 - 1 = 3`,
        tree: {
          id: 'root',
          keys: [47, 68],
          children: [
            { id: 'c1', keys: [13, 24, 38] },
            { id: 'c2', keys: [59, 64] },
            { id: 'c3', keys: [71, 82, 95] },
          ],
        },
        tableRow: ['Initial', '[47, 68]', '[13, 24, 38] | [59, 64] | [71, 82, 95]', 'No split'],
      },
      {
        title: 'Insert 19 → Leaf [13, 24, 38] Overflows (4 Keys) → Split & Push Up 24',
        codeLine: 5,
        explanation: 'Search for 19 leads to leftmost leaf [13, 24, 38]. Inserting 19 gives [13, 19, 24, 38] which exceeds Max Keys (3). Split into [13, 19] and [38], and push median 24 up into root [24, 47, 68].',
        formula: `Leaf [13, 19, 24, 38] overflows → Push up 24 → Root becomes [24, 47, 68]`,
        tree: {
          id: 'root',
          keys: [24, 47, 68],
          highlight: 'active' as const,
          children: [
            { id: 'c1a', keys: [13, 19], highlight: 'split' as const },
            { id: 'c1b', keys: [38], highlight: 'split' as const },
            { id: 'c2', keys: [59, 64] },
            { id: 'c3', keys: [71, 82, 95] },
          ],
        },
        tableRow: ['Insert 19', '[24, 47, 68]', '[13, 19] | [38] | [59, 64] | [71, 82, 95]', 'Split leaf, push 24 up'],
      },
      {
        title: 'Insert 56 → Fits Directly in Leaf [59, 64] → [56, 59, 64]',
        codeLine: 3,
        explanation: '56 lies between 47 and 68. Target leaf [59, 64] has only 2 keys (< 3). Insert 56 in sorted order to get [56, 59, 64]. No split needed!',
        formula: `47 < 56 < 68 ⇒ Insert into leaf [56, 59, 64] (3 keys ≤ Max 3)`,
        tree: {
          id: 'root',
          keys: [24, 47, 68],
          children: [
            { id: 'c1a', keys: [13, 19] },
            { id: 'c1b', keys: [38] },
            { id: 'c2', keys: [56, 59, 64], highlight: 'found' as const },
            { id: 'c3', keys: [71, 82, 95] },
          ],
        },
        tableRow: ['Insert 56', '[24, 47, 68]', '[13, 19] | [38] | [56, 59, 64] | [71, 82, 95]', 'Direct leaf insert'],
      },
      {
        title: 'Insert 87 → Leaf [71, 82, 95] Overflows & Root [24, 47, 68] Also Splits!',
        codeLine: 6,
        explanation: '87 > 68 goes to [71, 82, 95] → [71, 82, 87, 95] (overflow!). Push median 82 up to root → [24, 47, 68, 82] which ALSO overflows! Root splits around 47, growing tree height by 1 level.',
        formula: `Push 82 up → Root [24, 47, 68, 82] overflows → New Root [47] with children [24] and [68, 82]`,
        tree: {
          id: 'root',
          keys: [47],
          highlight: 'split' as const,
          children: [
            {
              id: 'l1',
              keys: [24],
              highlight: 'split' as const,
              children: [
                { id: 'c1a', keys: [13, 19] },
                { id: 'c1b', keys: [38] },
              ],
            },
            {
              id: 'r1',
              keys: [68, 82],
              highlight: 'split' as const,
              children: [
                { id: 'c2', keys: [56, 59, 64] },
                { id: 'c3a', keys: [71] },
                { id: 'c3b', keys: [87, 95] },
              ],
            },
          ],
        },
        tableRow: ['Insert 87', '[47] → [24], [68, 82]', '[13, 19] | [38] | [56, 59, 64] | [71] | [87, 95]', 'Double split (Root grows)'],
      },
      {
        title: 'Insert 42 → Fits Directly in Leaf [38] → [38, 42]',
        codeLine: 3,
        explanation: '42 < 47 and 42 > 24, so we follow right child of [24] to leaf [38]. Insert 42 directly to form [38, 42].',
        formula: `24 < 42 < 47 ⇒ Leaf [38] becomes [38, 42]`,
        tree: {
          id: 'root',
          keys: [47],
          children: [
            {
              id: 'l1',
              keys: [24],
              children: [
                { id: 'c1a', keys: [13, 19] },
                { id: 'c1b', keys: [38, 42], highlight: 'found' as const },
              ],
            },
            {
              id: 'r1',
              keys: [68, 82],
              children: [
                { id: 'c2', keys: [56, 59, 64] },
                { id: 'c3a', keys: [71] },
                { id: 'c3b', keys: [87, 95] },
              ],
            },
          ],
        },
        tableRow: ['Insert 42', '[47] → [24], [68, 82]', '[13, 19] | [38, 42] | [56, 59, 64] | [71] | [87, 95]', 'Direct leaf insert'],
      },
      {
        title: 'Insert 77 → Fits Directly in Leaf [71] → [71, 77]',
        codeLine: 3,
        explanation: '77 > 47 and 68 < 77 < 82, so we follow the middle pointer of [68, 82] to leaf [71]. Insert 77 directly to get [71, 77].',
        formula: `68 < 77 < 82 ⇒ Leaf [71] becomes [71, 77]`,
        tree: {
          id: 'root',
          keys: [47],
          children: [
            {
              id: 'l1',
              keys: [24],
              children: [
                { id: 'c1a', keys: [13, 19] },
                { id: 'c1b', keys: [38, 42] },
              ],
            },
            {
              id: 'r1',
              keys: [68, 82],
              children: [
                { id: 'c2', keys: [56, 59, 64] },
                { id: 'c3a', keys: [71, 77], highlight: 'found' as const },
                { id: 'c3b', keys: [87, 95] },
              ],
            },
          ],
        },
        tableRow: ['Insert 77', '[47] → [24], [68, 82]', '[13, 19] | [38, 42] | [56, 59, 64] | [71, 77] | [87, 95]', 'Direct leaf insert'],
      },
    ];

    snapshots.forEach((snap, idx) => {
      steps.push({
        stepNumber: idx + 1,
        codeLine: snap.codeLine,
        title: snap.title,
        explanation: snap.explanation,
        formula: snap.formula,
        variables: { Order_m: 4, MinKeys: 1, MaxKeys: 3 },
        bTreeView: {
          order: 4,
          minKeys: 1,
          maxKeys: 3,
          root: snap.tree,
          operationNote: snap.title,
        },
        tables: [
          {
            id: 'btree-summary',
            title: 'Fall 2025 MidTerm Q8 Step-by-Step Insertion Log',
            colHeaders: ['Operation', 'Internal Nodes', 'Leaves (Left to Right)', 'Action Taken'],
            rows: snapshots.slice(0, idx + 1).map((s, rIdx) =>
              s.tableRow.map((cell, cIdx) => ({
                value: cell,
                state: rIdx === idx ? 'active' : 'computed',
                editableKey: cIdx === 1 || cIdx === 2 ? `bt-${rIdx}-${cIdx}` : undefined,
                expectedValue: cell,
                mistakeExplanation: s.explanation,
              }))
            ),
          },
        ],
      });
    });
    return steps;
  }

  if (exampleKey === 'fall2020-q5') {
    // Fall 2020 Midterm Q5: B-Tree of order m=5, Delete E, R, M
    const delSnaps = [
      {
        title: 'Initial B-Tree (Order m = 5, Min Keys = 2, Max Keys = 4)',
        codeLine: 1,
        explanation: 'Initial B-Tree from Fall 2020 Midterm Q5 (Slide 43): Root [J], internal nodes [C, F] and [M, R], leaves [A, B], [D, E], [G, H, I], [K, L], [N, P], [S, T, U, X].',
        formula: `m = 5 ⇒ Min Keys = ⌈5/2⌉ - 1 = 2, Max Keys = 4`,
        tree: {
          id: 'root',
          keys: ['J'],
          children: [
            {
              id: 'l1',
              keys: ['C', 'F'],
              children: [
                { id: 'lf1', keys: ['A', 'B'] },
                { id: 'lf2', keys: ['D', 'E'] },
                { id: 'lf3', keys: ['G', 'H', 'I'] },
              ],
            },
            {
              id: 'r1',
              keys: ['M', 'R'],
              children: [
                { id: 'lf4', keys: ['K', 'L'] },
                { id: 'lf5', keys: ['N', 'P'] },
                { id: 'lf6', keys: ['S', 'T', 'U', 'X'] },
              ],
            },
          ],
        },
        row: ['Initial Tree', '[C, F] | [M, R]', '[A,B] [D,E] [G,H,I] [K,L] [N,P] [S,T,U,X]', 'Valid m=5 B-Tree'],
      },
      {
        title: 'Delete E (Scenario III: Leaf Has Exactly 2 Keys → Borrow from Right Sibling [G, H, I])',
        codeLine: 8,
        explanation: 'Deleting E from [D, E] leaves [D] with 1 key (< Min Keys 2). Right sibling [G, H, I] has 3 keys (extra key!). Move parent F down to [D, F] and move smallest sibling key G up to parent → [C, G], leaving [H, I].',
        formula: `Delete E → Borrow from right sibling [G, H, I]: F moves down to [D, F], G moves up to [C, G]`,
        tree: {
          id: 'root',
          keys: ['J'],
          children: [
            {
              id: 'l1',
              keys: ['C', 'G'],
              highlight: 'borrowed' as const,
              children: [
                { id: 'lf1', keys: ['A', 'B'] },
                { id: 'lf2', keys: ['D', 'F'], highlight: 'borrowed' as const },
                { id: 'lf3', keys: ['H', 'I'] },
              ],
            },
            {
              id: 'r1',
              keys: ['M', 'R'],
              children: [
                { id: 'lf4', keys: ['K', 'L'] },
                { id: 'lf5', keys: ['N', 'P'] },
                { id: 'lf6', keys: ['S', 'T', 'U', 'X'] },
              ],
            },
          ],
        },
        row: ['Delete E', '[C, G] | [M, R]', '[A,B] [D,F] [H,I] [K,L] [N,P] [S,T,U,X]', 'Scenario III: Borrow from right sibling'],
      },
      {
        title: 'Delete R (Scenario II: Internal Node → Replace with Successor S)',
        codeLine: 7,
        explanation: 'R is in internal node [M, R]. Its inorder successor in leaf [S, T, U, X] is S. Move S up to replace R → internal node becomes [M, S] and leaf becomes [T, U, X] (3 keys ≥ 2).',
        formula: `Delete internal key R → Replace with inorder successor S from [S, T, U, X]`,
        tree: {
          id: 'root',
          keys: ['J'],
          children: [
            {
              id: 'l1',
              keys: ['C', 'G'],
              children: [
                { id: 'lf1', keys: ['A', 'B'] },
                { id: 'lf2', keys: ['D', 'F'] },
                { id: 'lf3', keys: ['H', 'I'] },
              ],
            },
            {
              id: 'r1',
              keys: ['M', 'S'],
              highlight: 'active' as const,
              children: [
                { id: 'lf4', keys: ['K', 'L'] },
                { id: 'lf5', keys: ['N', 'P'] },
                { id: 'lf6', keys: ['T', 'U', 'X'], highlight: 'borrowed' as const },
              ],
            },
          ],
        },
        row: ['Delete R', '[C, G] | [M, S]', '[A,B] [D,F] [H,I] [K,L] [N,P] [T,U,X]', 'Scenario II: Replace with successor S'],
      },
      {
        title: 'Delete M (Replace with N, Then Borrow T from Right Sibling)',
        codeLine: 9,
        explanation: 'M is internal: replace with successor N from [N, P], leaving [P] with 1 key (underflow). Right sibling [T, U, X] has 3 keys, so parent S moves down to [P, S] and T moves up to parent → [N, T], leaving [U, X].',
        formula: `Delete M → N moves up, then borrow from [T, U, X]: S moves down to [P, S], T moves up to [N, T]`,
        tree: {
          id: 'root',
          keys: ['J'],
          children: [
            {
              id: 'l1',
              keys: ['C', 'G'],
              children: [
                { id: 'lf1', keys: ['A', 'B'] },
                { id: 'lf2', keys: ['D', 'F'] },
                { id: 'lf3', keys: ['H', 'I'] },
              ],
            },
            {
              id: 'r1',
              keys: ['N', 'T'],
              highlight: 'borrowed' as const,
              children: [
                { id: 'lf4', keys: ['K', 'L'] },
                { id: 'lf5', keys: ['P', 'S'], highlight: 'borrowed' as const },
                { id: 'lf6', keys: ['U', 'X'] },
              ],
            },
          ],
        },
        row: ['Delete M', '[C, G] | [N, T]', '[A,B] [D,F] [H,I] [K,L] [P,S] [U,X]', 'Successor N + Borrow from right'],
      },
    ];

    delSnaps.forEach((snap, idx) => {
      steps.push({
        stepNumber: idx + 1,
        codeLine: snap.codeLine,
        title: snap.title,
        explanation: snap.explanation,
        formula: snap.formula,
        variables: { Order_m: 5, MinKeys: 2, MaxKeys: 4 },
        bTreeView: {
          order: 5,
          minKeys: 2,
          maxKeys: 4,
          root: snap.tree,
          operationNote: snap.title,
        },
        tables: [
          {
            id: 'btree-del-log',
            title: 'Fall 2020 MidTerm Q5 Deletion Trace (Order m = 5)',
            colHeaders: ['Step', 'Internal Level 1', 'Leaf Nodes', 'Deletion Scenario'],
            rows: delSnaps.slice(0, idx + 1).map((s, rIdx) =>
              s.row.map((cell, cIdx) => ({
                value: cell,
                state: rIdx === idx ? 'active' : 'computed',
                editableKey: cIdx === 1 || cIdx === 2 ? `btdel-${rIdx}-${cIdx}` : undefined,
                expectedValue: cell,
                mistakeExplanation: s.explanation,
              }))
            ),
          },
        ],
      });
    });
    return steps;
  }

  // Default custom key insertion into B-Tree of order m
  const items = exampleKey
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  let currentLeaves: (string | number)[][] = [[]];
  let parentKeys: (string | number)[] = [];

  items.forEach((item, idx) => {
    const val = isNaN(Number(item)) ? item : Number(item);
    // Find leaf
    let leafIdx = 0;
    while (leafIdx < parentKeys.length && val >= parentKeys[leafIdx]) {
      leafIdx++;
    }
    currentLeaves[leafIdx].push(val);
    currentLeaves[leafIdx].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

    let splitNote = `Inserted '${val}' into leaf #${leafIdx + 1}.`;
    if (currentLeaves[leafIdx].length > maxKeys) {
      const full = currentLeaves[leafIdx];
      const mid = Math.floor(full.length / 2);
      const promoted = full[mid];
      const leftHalf = full.slice(0, mid);
      const rightHalf = full.slice(mid + 1);
      currentLeaves.splice(leafIdx, 1, leftHalf, rightHalf);
      parentKeys.splice(leafIdx, 0, promoted);
      splitNote = `Leaf overflowed (${full.length} > ${maxKeys} keys)! Split into [${leftHalf.join(', ')}] and [${rightHalf.join(', ')}], pushing median '${promoted}' up to parent.`;
    }

    steps.push({
      stepNumber: idx + 1,
      codeLine: currentLeaves.length > 1 ? 5 : 3,
      title: `Insert '${val}' (Order m = ${m})`,
      explanation: splitNote,
      formula: `Min Keys = ${minKeys}, Max Keys = ${maxKeys}`,
      variables: { Inserted: val, Order_m: m, LeavesCount: currentLeaves.length },
      bTreeView: {
        order: m,
        minKeys,
        maxKeys,
        root:
          parentKeys.length === 0
            ? { id: 'root', keys: [...currentLeaves[0]], highlight: 'active' }
            : {
                id: 'root',
                keys: [...parentKeys],
                highlight: 'active',
                children: currentLeaves.map((lf, lIdx) => ({
                  id: `lf-${lIdx}`,
                  keys: [...lf],
                  highlight: lIdx === leafIdx ? 'found' : undefined,
                })),
              },
        operationNote: splitNote,
      },
      tables: [
        {
          id: 'btree-level-bounds',
          title: `B-Tree Level & Key Bounds Table (Order m = ${m}, ⌈m/2⌉ = ${Math.ceil(m / 2)})`,
          subtitle: 'Matches Lecture 07 Slides 131-133 Formal Analysis',
          colHeaders: ['Level i', 'Min Nodes at Level i', 'Min Keys at Level i', 'Formula for Min Keys'],
          rows: [0, 1, 2, 3].map((lvl) => {
            const c = Math.ceil(m / 2);
            const minNodes = lvl === 0 ? 1 : 2 * Math.pow(c, lvl - 1);
            const minK = lvl === 0 ? 1 : 2 * Math.pow(c, lvl - 1) * (c - 1);
            return [
              { value: `Level ${lvl}${lvl === 0 ? ' (Root)' : ''}` },
              { value: minNodes, state: 'computed' },
              {
                value: minK,
                state: 'match',
                editableKey: `bt-bound-${lvl}`,
                expectedValue: minK,
                mistakeExplanation: `At level ${lvl}, minimum nodes = ${minNodes} and each non-root node has at least ⌈${m}/2⌉ - 1 = ${c - 1} keys.`,
              },
              { value: lvl === 0 ? '1' : `2 · ⌈m/2⌉^(${lvl - 1}) · (⌈m/2⌉ - 1) = ${minK}` },
            ];
          }),
        },
      ],
    });
  });

  return steps;
}
