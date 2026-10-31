import type {
  TraceStep,
  VisualTable,
  TableCellData,
  StringAlignmentView,
  BTreeNodeView,
} from '../types/algorithm';

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
// 1B. DISTRIBUTION COUNTING SORT (1st Variant - CLRS & Winter 2023 MidTerm Q1)
//     Uses 1-based A[1..n] & B[1..n], and 0-based C[0..k] (from 0 to max key k)
// ============================================================================
export function generateDistributionCountingV1Steps(inputStr: string): TraceStep[] {
  const raw = inputStr
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (raw.length === 0) return [];
  const nums = raw.map((x) => {
    const parsed = Number(x);
    return isNaN(parsed) ? Math.max(0, x.toLowerCase().charCodeAt(0) - 97) : Math.max(0, Math.floor(parsed));
  });

  const n = nums.length;
  const maxKey = Math.min(25, Math.max(...nums, 0));
  const k = maxKey;

  const initC = new Array<number>(k + 1).fill(0);
  const freqC = new Array<number>(k + 1).fill(0);
  const cumC = new Array<number>(k + 1).fill(0);
  const workC = new Array<number>(k + 1).fill(0);
  const B = new Array<string | number>(n).fill('');

  const placementHistory: {
    j: number; // 1-based index in A
    aVal: number;
    bIdx: number; // 1-based index in B
    cSnap: number[];
    bSnap: (string | number)[];
  }[] = [];

  const steps: TraceStep[] = [];

  const buildTables = (
    phase: 'init' | 'freq' | 'cum' | 'place',
    activeJ1Based?: number,
    activeCIdx?: number,
    activeB1Based?: number
  ): VisualTable[] => {
    const oneBasedHeaders = Array.from({ length: n }, (_, idx) => idx + 1);
    const cHeaders = Array.from({ length: k + 1 }, (_, idx) => idx);

    const cRows: TableCellData[][] = [
      initC.map((v, idx) => ({
        value: v,
        state: phase === 'init' ? 'active' : 'computed',
      })),
    ];
    const cRowHeaders: string[] = ['1. Initial C[0..k] = 0'];

    if (phase === 'freq' || phase === 'cum' || phase === 'place') {
      cRowHeaders.push('2. Frequency C[A[j]]');
      cRows.push(
        freqC.map((v, idx) => ({
          value: v,
          state: phase === 'freq' ? 'active' : 'computed',
          editableKey: `v1-freq-${idx}`,
          expectedValue: v,
          mistakeExplanation: `C[${idx}] counts how many times key ${idx} appears in A[1..${n}] (${v} times).`,
        }))
      );
    }

    if (phase === 'cum' || phase === 'place') {
      cRowHeaders.push('3. Cumulative C[i] = C[i] + C[i-1]');
      cRows.push(
        cumC.map((v, idx) => ({
          value: v,
          state: phase === 'cum' ? 'match' : 'computed',
          editableKey: `v1-cum-${idx}`,
          expectedValue: v,
          mistakeExplanation: `Cumulative C[${idx}] = total elements in A less than or equal to ${idx} (${v}).`,
        }))
      );
    }

    if (phase === 'place') {
      cRowHeaders.push('4. Current C[0..k] (Decremented)');
      cRows.push(
        workC.map((v, idx) => ({
          value: v,
          state: idx === activeCIdx ? 'match' : 'computed',
          editableKey: `v1-work-${idx}`,
          expectedValue: v,
          mistakeExplanation: `After placing ${idx} into B, C[${idx}] is decremented to ${v}.`,
        }))
      );
    }

    const tables: VisualTable[] = [
      {
        id: 'dcs-v1-ab',
        title: '1-Based Input Array A[1..n] & Output Sorted Array B[1..n]',
        subtitle: 'CLRS / 1st Variant: Indices run from 1 to n (no -1 offset needed when indexing B[C[A[j]]])',
        colHeaders: oneBasedHeaders,
        rowHeaders: ['Input A[1..n]', 'Output B[1..n]'],
        rows: [
          nums.map((v, idx) => ({
            value: v,
            state: idx + 1 === activeJ1Based ? 'active' : 'default',
            tooltip: `A[${idx + 1}] = ${v}`,
          })),
          B.map((v, idx) => ({
            value: v === '' ? '—' : v,
            state: idx + 1 === activeB1Based ? 'match' : v !== '' ? 'computed' : 'unvisited',
            editableKey: v !== '' ? `v1-b-${idx + 1}` : undefined,
            expectedValue: v,
            mistakeExplanation: `1-based position B[${idx + 1}] receives ${v} directly via B[C[A[j]]] ← A[j].`,
          })),
        ],
        indexBase: '1-based (1 .. n)',
      },
      {
        id: 'dcs-v1-c',
        title: `0-Based Counter & Distribution Array C[0..${k}]`,
        subtitle: `Always indexed from 0 up to max key k = ${k} (even if some keys have frequency 0) — Matches Slide 25–26 & Winter 2023 Q1`,
        colHeaders: cHeaders.map((idx) => `C[${idx}]`),
        rowHeaders: cRowHeaders,
        rows: cRows,
        indexBase: `0-based (0 .. ${k})`,
      },
    ];

    if (placementHistory.length > 0) {
      tables.push({
        id: 'dcs-v1-history',
        title: 'Winter 2023 MidTerm Q1 & Slide 25 Stepwise Placement Trace (j = n downto 1)',
        subtitle: 'Each row shows B[C[A[j]]] ← A[j] followed by C[A[j]] ← C[A[j]] - 1',
        colHeaders: [
          'Key A[j]',
          'Placed at B[pos]',
          ...cHeaders.map((idx) => `C[${idx}]`),
        ],
        rowHeaders: placementHistory.map((h) => `j = ${h.j}`),
        rows: placementHistory.map((h, rIdx) => [
          {
            value: `A[${h.j}] = ${h.aVal}`,
            state: rIdx === placementHistory.length - 1 ? 'active' : 'computed',
          },
          {
            value: `B[${h.bIdx}] ← ${h.aVal}`,
            state: rIdx === placementHistory.length - 1 ? 'match' : 'computed',
          },
          ...h.cSnap.map((cVal, cIdx) => ({
            value: cVal,
            state: (
              rIdx === placementHistory.length - 1 && cIdx === h.aVal ? 'match' : 'computed'
            ) as TableCellData['state'],
          })),
        ]),
      });
    }

    return tables;
  };

  // Step 1: Initialize C[0..k] = 0
  steps.push({
    stepNumber: 1,
    codeLine: 2,
    title: `Initialize Counter Array C[0..${k}] = 0`,
    explanation: `In the 1st Variant (CLRS, Slide 24), C is allocated from index 0 up to the maximum key value k = ${k}. All ${k + 1} entries are initialized to 0.`,
    formula: `for i ← 0 to ${k} do C[i] ← 0`,
    variables: { 'A.length (n)': n, 'Max Key (k)': k },
    tables: buildTables('init'),
  });

  // Step 2: Count frequencies
  for (let idx = 0; idx < n; idx++) {
    const val = nums[idx];
    freqC[val]++;
    cumC[val] = freqC[val];
  }
  steps.push({
    stepNumber: 2,
    codeLine: 5,
    title: `Count Key Frequencies in C[0..${k}]`,
    explanation: `Loop j from 1 to ${n} and increment C[A[j]]. Each C[i] now contains the number of elements equal to i: [${freqC.join(', ')}].`,
    formula: `for j ← 1 to ${n} do C[A[j]] ← C[A[j]] + 1`,
    variables: { 'Frequencies C[0..k]': `[${freqC.join(', ')}]` },
    tables: buildTables('freq'),
  });

  // Step 3: Cumulative sum
  for (let i = 1; i <= k; i++) {
    cumC[i] = cumC[i] + cumC[i - 1];
  }
  for (let i = 0; i <= k; i++) {
    workC[i] = cumC[i];
  }
  steps.push({
    stepNumber: 3,
    codeLine: 8,
    title: `Compute Cumulative Positions C[i] = C[i] + C[i - 1]`,
    explanation: `Loop i from 1 to ${k} and add C[i - 1] to C[i]. Now C[i] holds the number of elements ≤ i, which is the exact 1-based destination index in B[1..${n}]: [${cumC.join(', ')}].`,
    formula: `for i ← 1 to ${k} do C[i] ← C[i] + C[i - 1]`,
    variables: { 'Cumulative C[0..k]': `[${cumC.join(', ')}]` },
    tables: buildTables('cum'),
  });

  // Step 4+: Right-to-left placement (j = n downto 1)
  for (let j = n; j >= 1; j--) {
    const aVal = nums[j - 1];
    const destB = workC[aVal]; // 1-based index in B
    B[destB - 1] = aVal;
    workC[aVal] = workC[aVal] - 1;

    placementHistory.push({
      j,
      aVal,
      bIdx: destB,
      cSnap: [...workC],
      bSnap: [...B],
    });

    steps.push({
      stepNumber: steps.length + 1,
      codeLine: 11,
      title: `j = ${j}: Place A[${j}] = ${aVal} into B[C[${aVal}]] = B[${destB}]`,
      explanation: `Read A[${j}] = ${aVal}. Look up C[${aVal}] = ${destB}. Since B is 1-based, place ${aVal} directly into B[${destB}] (no -1 offset!), then decrement C[${aVal}] from ${destB} to ${workC[aVal]}.`,
      formula: `B[C[A[${j}]]] = B[C[${aVal}]] = B[${destB}] ← ${aVal};   C[${aVal}] ← ${workC[aVal]}`,
      variables: {
        j,
        'A[j]': aVal,
        'Target B[C[A[j]]]': `B[${destB}]`,
        'Updated C[A[j]]': workC[aVal],
      },
      tables: buildTables('place', j, aVal, destB),
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
// 7. B-TREES (Order m, Recursive Percolate-Up Splitting & Exam Deletion Scenarios)
// ============================================================================
export function generateBTreeSteps(exampleKey: string, orderStr: string): TraceStep[] {
  const m = Math.max(3, Math.min(7, Number(orderStr) || 5));
  const minKeys = Math.ceil(m / 2) - 1;
  const maxKeys = m - 1;
  const steps: TraceStep[] = [];

  const buildBoundsTable = (orderM: number): VisualTable => {
    const c = Math.ceil(orderM / 2);
    return {
      id: 'btree-level-bounds',
      title: `B-Tree Level & Key Bounds Table (Order m = ${orderM}, ⌈m/2⌉ = ${c})`,
      subtitle: 'Matches Lecture 07 Slides 131–133 Formal Analysis',
      colHeaders: ['Level i', 'Min Nodes at Level i', 'Min Keys at Level i', 'Formula for Min Keys'],
      rows: [0, 1, 2, 3].map((lvl) => {
        const minNodes = lvl === 0 ? 1 : 2 * Math.pow(c, lvl - 1);
        const minK = lvl === 0 ? 1 : 2 * Math.pow(c, lvl - 1) * (c - 1);
        return [
          { value: `Level ${lvl}${lvl === 0 ? ' (Root)' : ''}` },
          { value: minNodes, state: 'computed' as const },
          {
            value: minK,
            state: 'match' as const,
            editableKey: `bt-bound-${lvl}`,
            expectedValue: minK,
            mistakeExplanation: `At level ${lvl}, minimum nodes = ${minNodes} and each non-root node has at least ⌈${orderM}/2⌉ - 1 = ${c - 1} keys.`,
          },
          { value: lvl === 0 ? '1' : `2 · ⌈m/2⌉^(${lvl - 1}) · (⌈m/2⌉ - 1) = ${minK}` },
        ];
      }),
    };
  };

  if (exampleKey === 'fall2025-q8') {
    // Exact Fall 2025 MidTerm Q8: Initial B-Tree (m=4) + Insert 19, 56, 87, 42, 77
    // With explicit intermediate Overflow sub-steps!
    const snapshots: {
      title: string;
      codeLine: number;
      explanation: string;
      formula: string;
      tree: BTreeNodeView;
      tableRow: string[];
    }[] = [
      {
        title: 'Initial B-Tree (Order m = 4, Min Keys = 1, Max Keys = 3)',
        codeLine: 1,
        explanation:
          'Initial B-Tree from Fall 2025 Midterm Q8: Root [47, 68] with 3 leaf children: [13, 24, 38], [59, 64], and [71, 82, 95].',
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
        tableRow: ['Initial', '[47, 68]', '[13, 24, 38] | [59, 64] | [71, 82, 95]', 'Initial State'],
      },
      {
        title: 'Insert 19 (Sub-Step A): Temporary Insert in Leaf [13, 19, 24, 38] → OVERFLOW!',
        codeLine: 4,
        explanation:
          'Search for 19 (< 47) leads to leftmost leaf [13, 24, 38]. Inserting 19 in sorted order gives [13, 19, 24, 38], which has 4 keys (> Max Keys 3) → OVERFLOW! Median key 24 will be pushed up.',
        formula: `Leaf [13, 19, 24, 38] has 4 keys > Max Keys (3) ⇒ Overflow! Median = 24`,
        tree: {
          id: 'root',
          keys: [47, 68],
          children: [
            {
              id: 'c1',
              keys: [13, 19, 24, 38],
              highlight: 'overflow',
              activeKey: 19,
              medianKey: 24,
              badgeText: 'OVERFLOW (4 > 3) • Median = 24',
            },
            { id: 'c2', keys: [59, 64] },
            { id: 'c3', keys: [71, 82, 95] },
          ],
        },
        tableRow: ['Insert 19 (Overflow)', '[47, 68]', '[13, 19, 24, 38]* | [59, 64] | [71, 82, 95]', 'Leaf Overflows (4 > 3)'],
      },
      {
        title: 'Insert 19 (Sub-Step B): Split Leaf Around 24 & Push 24 Up to Root',
        codeLine: 6,
        explanation:
          'Split [13, 19, 24, 38] into left leaf [13, 19] and right leaf [38], and push median 24 up into the parent root node → Root becomes [24, 47, 68] (3 keys ≤ Max 3).',
        formula: `Split [13, 19, 24, 38] → [13, 19] & [38]; Push 24 up → Root [24, 47, 68]`,
        tree: {
          id: 'root',
          keys: [24, 47, 68],
          highlight: 'active',
          activeKey: 24,
          badgeText: 'Promoted 24 ↑',
          children: [
            { id: 'c1a', keys: [13, 19], highlight: 'split' },
            { id: 'c1b', keys: [38], highlight: 'split' },
            { id: 'c2', keys: [59, 64] },
            { id: 'c3', keys: [71, 82, 95] },
          ],
        },
        tableRow: ['Insert 19 (Split)', '[24, 47, 68]', '[13, 19] | [38] | [59, 64] | [71, 82, 95]', 'Split leaf, push 24 up'],
      },
      {
        title: 'Insert 56: Fits Directly in Leaf [59, 64] → [56, 59, 64]',
        codeLine: 3,
        explanation:
          '56 lies between 47 and 68. Target leaf [59, 64] has only 2 keys (< 3). Insert 56 in sorted order to get [56, 59, 64] (3 keys ≤ Max 3). No split needed!',
        formula: `47 < 56 < 68 ⇒ Insert into leaf [56, 59, 64] (3 keys ≤ Max 3)`,
        tree: {
          id: 'root',
          keys: [24, 47, 68],
          children: [
            { id: 'c1a', keys: [13, 19] },
            { id: 'c1b', keys: [38] },
            { id: 'c2', keys: [56, 59, 64], highlight: 'found', activeKey: 56 },
            { id: 'c3', keys: [71, 82, 95] },
          ],
        },
        tableRow: ['Insert 56', '[24, 47, 68]', '[13, 19] | [38] | [56, 59, 64] | [71, 82, 95]', 'Direct leaf insert'],
      },
      {
        title: 'Insert 87 (Sub-Step A): Temporary Insert in Leaf [71, 82, 87, 95] → OVERFLOW!',
        codeLine: 4,
        explanation:
          '87 > 68 goes to rightmost leaf [71, 82, 95]. Inserting 87 gives [71, 82, 87, 95] (4 keys > Max 3) → OVERFLOW! Median 82 will be pushed up to the root.',
        formula: `Leaf [71, 82, 87, 95] has 4 keys > Max Keys (3) ⇒ Overflow! Median = 82`,
        tree: {
          id: 'root',
          keys: [24, 47, 68],
          children: [
            { id: 'c1a', keys: [13, 19] },
            { id: 'c1b', keys: [38] },
            { id: 'c2', keys: [56, 59, 64] },
            {
              id: 'c3',
              keys: [71, 82, 87, 95],
              highlight: 'overflow',
              activeKey: 87,
              medianKey: 82,
              badgeText: 'OVERFLOW (4 > 3) • Median = 82',
            },
          ],
        },
        tableRow: ['Insert 87 (Leaf Overflow)', '[24, 47, 68]', '[13, 19] | [38] | [56, 59, 64] | [71, 82, 87, 95]*', 'Leaf Overflows (4 > 3)'],
      },
      {
        title: 'Insert 87 (Sub-Step B): Push 82 Up → Root [24, 47, 68, 82] OVERFLOWS!',
        codeLine: 6,
        explanation:
          'Leaf splits into [71] and [87, 95], pushing 82 up into the root. The root now has 4 keys [24, 47, 68, 82] (> Max Keys 3) → PARENT/ROOT OVERFLOW! Percolate up by splitting the root around median 47.',
        formula: `Root [24, 47, 68, 82] has 4 keys > Max Keys (3) ⇒ Root Overflows! Median = 47`,
        tree: {
          id: 'root',
          keys: [24, 47, 68, 82],
          highlight: 'overflow',
          activeKey: 82,
          medianKey: 47,
          badgeText: 'ROOT OVERFLOW (4 > 3) • Median = 47',
          children: [
            { id: 'c1a', keys: [13, 19] },
            { id: 'c1b', keys: [38] },
            { id: 'c2', keys: [56, 59, 64] },
            { id: 'c3a', keys: [71], highlight: 'split' },
            { id: 'c3b', keys: [87, 95], highlight: 'split' },
          ],
        },
        tableRow: ['Insert 87 (Root Overflow)', '[24, 47, 68, 82]*', '[13, 19] | [38] | [56, 59, 64] | [71] | [87, 95]', 'Root Overflows (4 > 3)'],
      },
      {
        title: 'Insert 87 (Sub-Step C): Root Splits Around 47 → Tree Grows to 3 Levels!',
        codeLine: 6,
        explanation:
          'Root [24, 47, 68, 82] splits around median 47: 47 becomes the new Root [47], with left internal node [24] (pointing to [13, 19] and [38]) and right internal node [68, 82] (pointing to [56, 59, 64], [71], and [87, 95]).',
        formula: `New Root [47] → Left Internal [24] & Right Internal [68, 82] (Height grows to 3 levels)`,
        tree: {
          id: 'root',
          keys: [47],
          highlight: 'active',
          activeKey: 47,
          badgeText: 'New Root ↑ (3 Levels)',
          children: [
            {
              id: 'l1',
              keys: [24],
              highlight: 'split',
              children: [
                { id: 'c1a', keys: [13, 19] },
                { id: 'c1b', keys: [38] },
              ],
            },
            {
              id: 'r1',
              keys: [68, 82],
              highlight: 'split',
              children: [
                { id: 'c2', keys: [56, 59, 64] },
                { id: 'c3a', keys: [71] },
                { id: 'c3b', keys: [87, 95] },
              ],
            },
          ],
        },
        tableRow: ['Insert 87 (Root Split)', '[47] → [24], [68, 82]', '[13, 19] | [38] | [56, 59, 64] | [71] | [87, 95]', 'Cascading Root Split (3 Levels)'],
      },
      {
        title: 'Insert 42: Fits Directly in Leaf [38] → [38, 42]',
        codeLine: 3,
        explanation:
          '42 < 47 (go left to [24]), and 42 > 24 (follow second pointer of [24] to leaf [38]). Insert 42 directly to form [38, 42].',
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
                { id: 'c1b', keys: [38, 42], highlight: 'found', activeKey: 42 },
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
        title: 'Insert 77: Fits Directly in Leaf [71] → [71, 77]',
        codeLine: 3,
        explanation:
          '77 > 47 (go right to [68, 82]), and 68 < 77 < 82 (follow middle pointer of [68, 82] to leaf [71]). Insert 77 directly to get [71, 77].',
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
                { id: 'c3a', keys: [71, 77], highlight: 'found', activeKey: 77 },
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
          buildBoundsTable(4),
        ],
      });
    });
    return steps;
  }

  if (exampleKey === 'fall2020-q5') {
    // Fall 2020 Midterm Q5: B-Tree of order m=5, Delete E, R, M
    const delSnaps: {
      title: string;
      codeLine: number;
      explanation: string;
      formula: string;
      tree: BTreeNodeView;
      row: string[];
    }[] = [
      {
        title: 'Initial B-Tree (Order m = 5, Min Keys = 2, Max Keys = 4)',
        codeLine: 1,
        explanation:
          'Initial B-Tree from Fall 2020 Midterm Q5: Root [J], internal nodes [C, F] and [M, R], leaves [A, B], [D, E], [G, H, I], [K, L], [N, P], [S, T, U, X].',
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
        title: 'Delete E (Scenario III: Underflow at [D] → Borrow via Parent F from Right Sibling [G, H, I])',
        codeLine: 10,
        explanation:
          'Deleting E from leaf [D, E] leaves [D] with only 1 key (< Min Keys 2 → Underflow). Right sibling [G, H, I] has 3 keys (> 2). Move parent key F down into [D, F] and move smallest sibling key G up into parent → [C, G], leaving [H, I].',
        formula: `Delete E → Borrow from right sibling [G, H, I]: Parent F ↓ to [D, F], Sibling G ↑ to [C, G]`,
        tree: {
          id: 'root',
          keys: ['J'],
          children: [
            {
              id: 'l1',
              keys: ['C', 'G'],
              highlight: 'borrowed',
              activeKey: 'G',
              badgeText: 'Borrowed G ↑',
              children: [
                { id: 'lf1', keys: ['A', 'B'] },
                { id: 'lf2', keys: ['D', 'F'], highlight: 'borrowed', activeKey: 'F', badgeText: 'Parent F ↓' },
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
        title: 'Delete R (Scenario II: Internal Node → Replace with Inorder Successor S)',
        codeLine: 9,
        explanation:
          'R is in internal node [M, R]. Its inorder successor (smallest key in the subtree to the right of R) is S in leaf [S, T, U, X]. Move S up to replace R → internal node becomes [M, S] and leaf becomes [T, U, X] (3 keys ≥ 2).',
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
              highlight: 'active',
              activeKey: 'S',
              badgeText: 'Successor S ↑',
              children: [
                { id: 'lf4', keys: ['K', 'L'] },
                { id: 'lf5', keys: ['N', 'P'] },
                { id: 'lf6', keys: ['T', 'U', 'X'], highlight: 'borrowed' },
              ],
            },
          ],
        },
        row: ['Delete R', '[C, G] | [M, S]', '[A,B] [D,F] [H,I] [K,L] [N,P] [T,U,X]', 'Scenario II: Replace with successor S'],
      },
      {
        title: 'Delete M (Replace with Successor N, Then Borrow T from Right Sibling)',
        codeLine: 10,
        explanation:
          'M is internal: replace M with its inorder successor N from [N, P], leaving [P] with 1 key (< 2 → Underflow). Right sibling [T, U, X] has 3 keys, so parent S moves down to [P, S] and T moves up to parent → [N, T], leaving [U, X].',
        formula: `Delete M → N moves up, then borrow from [T, U, X]: S ↓ to [P, S], T ↑ to [N, T]`,
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
              highlight: 'borrowed',
              activeKey: 'T',
              badgeText: 'Successor N + Borrowed T ↑',
              children: [
                { id: 'lf4', keys: ['K', 'L'] },
                { id: 'lf5', keys: ['P', 'S'], highlight: 'borrowed', activeKey: 'S' },
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
          buildBoundsTable(5),
        ],
      });
    });
    return steps;
  }

  if (exampleKey === 'slide-del-htre') {
    // Lecture 07 Slides 95–108: All 4 Deletion Scenarios on the 20-letter B-Tree (Delete H, T, R, E)
    const slideDelSnaps: {
      title: string;
      codeLine: number;
      explanation: string;
      formula: string;
      tree: BTreeNodeView;
      row: string[];
    }[] = [
      {
        title: 'Initial 20-Letter B-Tree (Slides 71 & 95, Order m = 5, Min Keys = 2, Max Keys = 4)',
        codeLine: 1,
        explanation:
          'Starting 3-level B-Tree after inserting C, N, G, A, H, E, K, Q, M, F, W, L, T, Z, D, P, R, X, Y, S: Root [M], internal nodes [D, G] and [Q, T], and 6 leaves.',
        formula: `Order m = 5 ⇒ Min Keys = 2, Max Keys = 4`,
        tree: {
          id: 'root',
          keys: ['M'],
          children: [
            {
              id: 'l1',
              keys: ['D', 'G'],
              children: [
                { id: 'lf1', keys: ['A', 'C'] },
                { id: 'lf2', keys: ['E', 'F'] },
                { id: 'lf3', keys: ['H', 'K', 'L'] },
              ],
            },
            {
              id: 'r1',
              keys: ['Q', 'T'],
              children: [
                { id: 'lf4', keys: ['N', 'P'] },
                { id: 'lf5', keys: ['R', 'S'] },
                { id: 'lf6', keys: ['W', 'X', 'Y', 'Z'] },
              ],
            },
          ],
        },
        row: ['Initial Tree', '[M] → [D, G] | [Q, T]', '[A,C] [E,F] [H,K,L] [N,P] [R,S] [W,X,Y,Z]', '3-Level m=5 B-Tree'],
      },
      {
        title: 'Scenario I (Slides 95–97): Delete "H" from Leaf [H, K, L]',
        codeLine: 8,
        explanation:
          '"H" is in leaf [H, K, L] which has 3 keys (> Min Keys 2). Simply remove "H" → leaf becomes [K, L] (2 keys ≥ Min 2).',
        formula: `Scenario I: Leaf [H, K, L] has 3 > 2 keys ⇒ Directly remove "H" → [K, L]`,
        tree: {
          id: 'root',
          keys: ['M'],
          children: [
            {
              id: 'l1',
              keys: ['D', 'G'],
              children: [
                { id: 'lf1', keys: ['A', 'C'] },
                { id: 'lf2', keys: ['E', 'F'] },
                { id: 'lf3', keys: ['K', 'L'], highlight: 'found', badgeText: 'Removed H' },
              ],
            },
            {
              id: 'r1',
              keys: ['Q', 'T'],
              children: [
                { id: 'lf4', keys: ['N', 'P'] },
                { id: 'lf5', keys: ['R', 'S'] },
                { id: 'lf6', keys: ['W', 'X', 'Y', 'Z'] },
              ],
            },
          ],
        },
        row: ['Delete H (Scenario I)', '[M] → [D, G] | [Q, T]', '[A,C] [E,F] [K,L] [N,P] [R,S] [W,X,Y,Z]', 'Simple leaf removal'],
      },
      {
        title: 'Scenario II (Slides 98–100): Delete "T" from Internal Node [Q, T]',
        codeLine: 9,
        explanation:
          '"T" is in internal node [Q, T]. Find its inorder successor (next item in ascending order), which is "W" in leaf [W, X, Y, Z]. Move "W" up to replace "T" → internal node becomes [Q, W] and leaf becomes [X, Y, Z].',
        formula: `Scenario II: Replace internal key "T" with inorder successor "W" from [W, X, Y, Z]`,
        tree: {
          id: 'root',
          keys: ['M'],
          children: [
            {
              id: 'l1',
              keys: ['D', 'G'],
              children: [
                { id: 'lf1', keys: ['A', 'C'] },
                { id: 'lf2', keys: ['E', 'F'] },
                { id: 'lf3', keys: ['K', 'L'] },
              ],
            },
            {
              id: 'r1',
              keys: ['Q', 'W'],
              highlight: 'active',
              activeKey: 'W',
              badgeText: 'Successor W ↑',
              children: [
                { id: 'lf4', keys: ['N', 'P'] },
                { id: 'lf5', keys: ['R', 'S'] },
                { id: 'lf6', keys: ['X', 'Y', 'Z'], highlight: 'borrowed' },
              ],
            },
          ],
        },
        row: ['Delete T (Scenario II)', '[M] → [D, G] | [Q, W]', '[A,C] [E,F] [K,L] [N,P] [R,S] [X,Y,Z]', 'Replace T with successor W'],
      },
      {
        title: 'Scenario III (Slides 101–103): Delete "R" from Leaf [R, S] → Borrow from Right Sibling [X, Y, Z]',
        codeLine: 10,
        explanation:
          'Deleting "R" from [R, S] leaves [S] with 1 key (< Min 2). Right sibling [X, Y, Z] has 3 keys (extra key!). Borrow via common parent "W": move "W" down to form [S, W], and move smallest key "X" up from right sibling to parent → [Q, X], leaving [Y, Z].',
        formula: `Scenario III: Parent "W" ↓ to [S, W], Right Sibling "X" ↑ to [Q, X]`,
        tree: {
          id: 'root',
          keys: ['M'],
          children: [
            {
              id: 'l1',
              keys: ['D', 'G'],
              children: [
                { id: 'lf1', keys: ['A', 'C'] },
                { id: 'lf2', keys: ['E', 'F'] },
                { id: 'lf3', keys: ['K', 'L'] },
              ],
            },
            {
              id: 'r1',
              keys: ['Q', 'X'],
              highlight: 'borrowed',
              activeKey: 'X',
              badgeText: 'Borrowed X ↑',
              children: [
                { id: 'lf4', keys: ['N', 'P'] },
                { id: 'lf5', keys: ['S', 'W'], highlight: 'borrowed', activeKey: 'W', badgeText: 'Parent W ↓' },
                { id: 'lf6', keys: ['Y', 'Z'] },
              ],
            },
          ],
        },
        row: ['Delete R (Scenario III)', '[M] → [D, G] | [Q, X]', '[A,C] [E,F] [K,L] [N,P] [S,W] [Y,Z]', 'Borrow from right sibling via W'],
      },
      {
        title: 'Scenario IV Sub-Step A (Slides 104–107): Delete "E" → Combine Leaf [F] with [A, C] & Pull Down "D"',
        codeLine: 11,
        explanation:
          'Deleting "E" from [E, F] leaves [F] with 1 key, and neither sibling [A, C] nor [K, L] has > 2 keys! Combine [A, C] and [F] with common parent key "D" → [A, C, D, F]. Now internal node [G] has only 1 key (< Min 2 → Parent Underflow!).',
        formula: `Combine [A, C] + Parent "D" + [F] → [A, C, D, F]; Parent [G] now has 1 < 2 keys (Underflow!)`,
        tree: {
          id: 'root',
          keys: ['M'],
          children: [
            {
              id: 'l1',
              keys: ['G'],
              highlight: 'overflow',
              badgeText: 'UNDERFLOW (1 < Min 2)',
              children: [
                { id: 'lf1', keys: ['A', 'C', 'D', 'F'], highlight: 'merged', activeKey: 'D', badgeText: 'Merged [A,C,D,F]' },
                { id: 'lf3', keys: ['K', 'L'] },
              ],
            },
            {
              id: 'r1',
              keys: ['Q', 'X'],
              children: [
                { id: 'lf4', keys: ['N', 'P'] },
                { id: 'lf5', keys: ['S', 'W'] },
                { id: 'lf6', keys: ['Y', 'Z'] },
              ],
            },
          ],
        },
        row: ['Delete E (Sub-Step A)', '[M] → [G]* | [Q, X]', '[A,C,D,F] [K,L] [N,P] [S,W] [Y,Z]', 'Leaf merge causes parent underflow'],
      },
      {
        title: 'Scenario IV Sub-Step B (Slide 108): Combine Internal [G] with Sibling [Q, X] & Root "M" → Tree Shrinks to 2 Levels!',
        codeLine: 11,
        explanation:
          'Internal node [G] has 1 key (< 2) and sibling [Q, X] has only 2 keys (no extra key to borrow). Combine [G], Root "M", and [Q, X] into a single new Root [G, M, Q, X] with 5 leaf children! Tree height decreases by 1 level.',
        formula: `Combine [G] + Root "M" + [Q, X] ⇒ New Root [G, M, Q, X] (2 Levels)`,
        tree: {
          id: 'root',
          keys: ['G', 'M', 'Q', 'X'],
          highlight: 'merged',
          activeKey: 'M',
          badgeText: 'Combined Root [G, M, Q, X]',
          children: [
            { id: 'lf1', keys: ['A', 'C', 'D', 'F'] },
            { id: 'lf3', keys: ['K', 'L'] },
            { id: 'lf4', keys: ['N', 'P'] },
            { id: 'lf5', keys: ['S', 'W'] },
            { id: 'lf6', keys: ['Y', 'Z'] },
          ],
        },
        row: ['Delete E (Sub-Step B)', 'Root [G, M, Q, X]', '[A,C,D,F] [K,L] [N,P] [S,W] [Y,Z]', 'Internal merge with root (2 Levels)'],
      },
    ];

    slideDelSnaps.forEach((snap, idx) => {
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
            id: 'btree-slide-del-log',
            title: 'Lecture 07 Slides 95–108 Deletion Scenarios I–IV Trace',
            colHeaders: ['Operation', 'Internal Nodes', 'Leaf Nodes (Left to Right)', 'Action Taken'],
            rows: slideDelSnaps.slice(0, idx + 1).map((s, rIdx) =>
              s.row.map((cell, cIdx) => ({
                value: cell,
                state: rIdx === idx ? 'active' : 'computed',
                editableKey: cIdx === 1 || cIdx === 2 ? `btsdel-${rIdx}-${cIdx}` : undefined,
                expectedValue: cell,
                mistakeExplanation: s.explanation,
              }))
            ),
          },
          buildBoundsTable(5),
        ],
      });
    });
    return steps;
  }

  // ==========================================================================
  // GENERAL RECURSIVE MULTI-LEVEL B-TREE CREATION ENGINE (WITH PERCOLATE-UP!)
  // ==========================================================================
  interface SimNode {
    id: string;
    keys: (string | number)[];
    children: SimNode[];
    highlight?: 'active' | 'split' | 'merged' | 'borrowed' | 'found' | 'overflow';
    activeKey?: string | number;
    medianKey?: string | number;
    badgeText?: string;
  }

  let nodeIdCounter = 1;
  const nextId = (prefix = 'n') => `${prefix}-${nodeIdCounter++}`;

  const cloneTree = (node: SimNode, clearHighlights = false): SimNode => ({
    id: node.id,
    keys: [...node.keys],
    highlight: clearHighlights ? undefined : node.highlight,
    activeKey: clearHighlights ? undefined : node.activeKey,
    medianKey: clearHighlights ? undefined : node.medianKey,
    badgeText: clearHighlights ? undefined : node.badgeText,
    children: node.children.map((ch) => cloneTree(ch, clearHighlights)),
  });

  const compareKeys = (a: string | number, b: string | number): number => {
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    return String(a).localeCompare(String(b));
  };

  const countTreeLevels = (node: SimNode): number => {
    if (node.children.length === 0) return 1;
    return 1 + countTreeLevels(node.children[0]);
  };

  const summarizeTreeLevels = (root: SimNode): { internalSummary: string; leavesSummary: string } => {
    const internalByLevel: string[][] = [];
    const leaves: string[] = [];

    const dfs = (n: SimNode, depth: number) => {
      const label = `[${n.keys.join(', ')}]`;
      if (n.children.length === 0) {
        leaves.push(label);
      } else {
        if (!internalByLevel[depth]) internalByLevel[depth] = [];
        internalByLevel[depth].push(label);
        n.children.forEach((c) => dfs(c, depth + 1));
      }
    };
    dfs(root, 0);

    const internalSummary =
      internalByLevel.length === 0
        ? '(Root is Leaf)'
        : internalByLevel.map((lvlNodes, idx) => `L${idx}: ${lvlNodes.join(' ')}`).join(' → ');

    return {
      internalSummary,
      leavesSummary: leaves.join(' | '),
    };
  };

  const items = exampleKey
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  let root: SimNode = {
    id: nextId('root'),
    keys: [],
    children: [],
  };

  const historyLogRows: { op: string; internal: string; leaves: string; note: string }[] = [];

  const pushSnapshot = (
    title: string,
    codeLine: number,
    explanation: string,
    formula: string,
    insertedVal: string | number,
    opLabel: string,
    actionShort: string
  ) => {
    const snapRoot = cloneTree(root, false);
    const { internalSummary, leavesSummary } = summarizeTreeLevels(snapRoot);
    const height = countTreeLevels(snapRoot);
    historyLogRows.push({
      op: opLabel,
      internal: internalSummary,
      leaves: leavesSummary,
      note: actionShort,
    });

    const recentRows = historyLogRows.slice(Math.max(0, historyLogRows.length - 12));

    steps.push({
      stepNumber: steps.length + 1,
      codeLine,
      title,
      explanation,
      formula,
      variables: {
        Key: insertedVal,
        Order_m: m,
        MinKeys: minKeys,
        MaxKeys: maxKeys,
        TreeHeight: `${height} Level(s)`,
      },
      bTreeView: {
        order: m,
        minKeys,
        maxKeys,
        root: snapRoot,
        operationNote: explanation,
      },
      tables: [
        {
          id: 'btree-live-trace-log',
          title: `Step-by-Step B-Tree Insertion & Split Log (Order m = ${m}, Max Keys = ${maxKeys})`,
          subtitle: 'Shows every insertion, overflow detection, and upward median promotion',
          colHeaders: ['Step / Key', 'Internal Index Nodes', 'Leaf Nodes (Left → Right)', 'Action / Split'],
          rows: recentRows.map((r, rIdx) => {
            const isLast = rIdx === recentRows.length - 1;
            return [
              { value: r.op, state: isLast ? ('active' as const) : ('computed' as const) },
              { value: r.internal, state: isLast ? ('active' as const) : ('computed' as const) },
              {
                value: r.leaves,
                state: isLast ? ('match' as const) : ('computed' as const),
                editableKey: isLast ? `bt-custom-leaves-${steps.length}` : undefined,
                expectedValue: r.leaves,
                mistakeExplanation: explanation,
              },
              { value: r.note, state: isLast ? ('compare' as const) : ('default' as const) },
            ];
          }),
        },
        buildBoundsTable(m),
      ],
    });
  };

  items.forEach((item, keyIdx) => {
    const val: string | number = isNaN(Number(item)) ? item : Number(item);
    root = cloneTree(root, true);

    // 1. Find path from root down to target leaf
    // Rule from Slide 6: All keys in subtree T_1 are >= k_1
    const path: { node: SimNode; childIndex: number }[] = [];
    let curr = root;
    while (curr.children.length > 0) {
      let cIdx = 0;
      while (cIdx < curr.keys.length && compareKeys(val, curr.keys[cIdx]) >= 0) {
        cIdx++;
      }
      path.push({ node: curr, childIndex: cIdx });
      curr = curr.children[cIdx];
    }

    // Insert key into target leaf in sorted order
    curr.keys.push(val);
    curr.keys.sort(compareKeys);

    if (curr.keys.length <= maxKeys) {
      // Fits without overflow!
      curr.highlight = 'found';
      curr.activeKey = val;
      curr.badgeText = `Inserted '${val}'`;
      pushSnapshot(
        `Key #${keyIdx + 1}: Insert '${val}' — Fits Directly in Leaf [${curr.keys.join(', ')}]`,
        3,
        `Search down from the root leads to leaf [${curr.keys.join(', ')}]. Since the leaf now has ${curr.keys.length} key(s) ≤ Max Keys (${maxKeys}), '${val}' is inserted in sorted order with no split required.`,
        `Leaf Keys = ${curr.keys.length} ≤ Max Keys (${maxKeys}) ⇒ Direct Insert`,
        val,
        `#${keyIdx + 1}: Insert ${val}`,
        `Direct leaf insert (${curr.keys.length}/${maxKeys} keys)`
      );
      return;
    }

    // 2. OVERFLOW occurred at leaf `curr`!
    // Sub-step A: Show temporary overflow in leaf before splitting
    const leafMidIdx = Math.floor((curr.keys.length - 1) / 2);
    const leafMedianKey = curr.keys[leafMidIdx];
    curr.highlight = 'overflow';
    curr.activeKey = val;
    curr.medianKey = leafMedianKey;
    curr.badgeText = `OVERFLOW (${curr.keys.length} > ${maxKeys}) • Median '${leafMedianKey}'`;

    pushSnapshot(
      `Key #${keyIdx + 1} (Sub-Step A): Insert '${val}' → Leaf [${curr.keys.join(', ')}] OVERFLOWS!`,
      4,
      `Inserting '${val}' into target leaf produces [${curr.keys.join(', ')}], which has ${curr.keys.length} keys > Max Keys (${maxKeys})! This triggers a node split around the median key '${leafMedianKey}'.`,
      `Overflow: ${curr.keys.length} keys > Max Keys (${maxKeys}) ⇒ Split at Median '${leafMedianKey}'`,
      val,
      `#${keyIdx + 1}a: ${val} (Overflow)`,
      `Leaf [${curr.keys.join(',')}] overflows! Median = ${leafMedianKey}`
    );

    // 3. Percolate up recursively from `curr` up through `path`
    let overflowingNode: SimNode | null = curr;
    let levelStepCharCode = 66; // 'B', 'C', 'D'...

    while (overflowingNode && overflowingNode.keys.length > maxKeys) {
      const subStepLetter = String.fromCharCode(levelStepCharCode++);
      root = cloneTree(root, true);

      // Re-locate the current overflowing node inside the freshly cloned `root`
      let targetInRoot = root;
      for (let p = 0; p < path.length; p++) {
        targetInRoot = targetInRoot.children[path[p].childIndex];
      }

      const fullKeys = [...targetInRoot.keys];
      const fullChildren = [...targetInRoot.children];
      const midIdx = Math.floor((fullKeys.length - 1) / 2);
      const promotedKey = fullKeys[midIdx];
      const leftKeys = fullKeys.slice(0, midIdx);
      const rightKeys = fullKeys.slice(midIdx + 1);

      const leftNode: SimNode = {
        id: nextId('L'),
        keys: leftKeys,
        children: fullChildren.length > 0 ? fullChildren.slice(0, midIdx + 1) : [],
        highlight: 'split',
        badgeText: `Left Split [${leftKeys.join(', ')}]`,
      };
      const rightNode: SimNode = {
        id: nextId('R'),
        keys: rightKeys,
        children: fullChildren.length > 0 ? fullChildren.slice(midIdx + 1) : [],
        highlight: 'split',
        badgeText: `Right Split [${rightKeys.join(', ')}]`,
      };

      if (path.length === 0) {
        // Splitting the ROOT itself! Tree grows 1 level taller!
        root = {
          id: nextId('root'),
          keys: [promotedKey],
          children: [leftNode, rightNode],
          highlight: 'active',
          activeKey: promotedKey,
          badgeText: `New Root '${promotedKey}' ↑ (Height +1)`,
        };

        const newHeight = countTreeLevels(root);
        pushSnapshot(
          `Key #${keyIdx + 1} (Sub-Step ${subStepLetter}): Split [${fullKeys.join(', ')}] & Promote '${promotedKey}' to New Root (${newHeight} Levels)`,
          6,
          `Node [${fullKeys.join(', ')}] splits into [${leftKeys.join(', ')}] and [${rightKeys.join(', ')}]. Median key '${promotedKey}' is pushed up to form a new Root [${promotedKey}], increasing the B-Tree height to ${newHeight} levels!`,
          `Split [${fullKeys.join(', ')}] → [${leftKeys.join(', ')}] & [${rightKeys.join(', ')}]; New Root = [${promotedKey}]`,
          val,
          `#${keyIdx + 1}${subStepLetter.toLowerCase()}: Promote ${promotedKey}`,
          `New Root [${promotedKey}] created (${newHeight} Levels)`
        );
        overflowingNode = null;
      } else {
        // Pop parent from path and insert `promotedKey` + replace child with `leftNode, rightNode`
        const parentEntry = path.pop()!;
        // Find parent in cloned `root`
        let parentNode = root;
        for (let p = 0; p < path.length; p++) {
          parentNode = parentNode.children[path[p].childIndex];
        }

        const cIdx = parentEntry.childIndex;
        parentNode.keys.splice(cIdx, 0, promotedKey);
        parentNode.children.splice(cIdx, 1, leftNode, rightNode);

        if (parentNode.keys.length <= maxKeys) {
          parentNode.highlight = 'active';
          parentNode.activeKey = promotedKey;
          parentNode.badgeText = `Promoted '${promotedKey}' ↑`;

          pushSnapshot(
            `Key #${keyIdx + 1} (Sub-Step ${subStepLetter}): Split [${fullKeys.join(', ')}] & Push Median '${promotedKey}' Up to Parent [${parentNode.keys.join(', ')}]`,
            6,
            `Node [${fullKeys.join(', ')}] splits into [${leftKeys.join(', ')}] and [${rightKeys.join(', ')}]. Median '${promotedKey}' is pushed up into parent [${parentNode.keys.join(', ')}] (${parentNode.keys.length} ≤ ${maxKeys} keys).`,
            `Promote '${promotedKey}' ↑ → Parent becomes [${parentNode.keys.join(', ')}] (${parentNode.keys.length}/${maxKeys} keys)`,
            val,
            `#${keyIdx + 1}${subStepLetter.toLowerCase()}: Push ${promotedKey} ↑`,
            `Split leaf, push '${promotedKey}' to [${parentNode.keys.join(',')}]`
          );
          overflowingNode = null;
        } else {
          // Parent ITSELF now overflows! Show the parent overflow sub-step before continuing loop!
          const parentMidIdx = Math.floor((parentNode.keys.length - 1) / 2);
          const parentMedian = parentNode.keys[parentMidIdx];
          parentNode.highlight = 'overflow';
          parentNode.activeKey = promotedKey;
          parentNode.medianKey = parentMedian;
          parentNode.badgeText = `PARENT OVERFLOW (${parentNode.keys.length} > ${maxKeys}) • Median '${parentMedian}'`;

          pushSnapshot(
            `Key #${keyIdx + 1} (Sub-Step ${subStepLetter}): Push '${promotedKey}' Up → Parent [${parentNode.keys.join(', ')}] OVERFLOWS!`,
            6,
            `Pushing median '${promotedKey}' up into the parent node gives [${parentNode.keys.join(', ')}], which now has ${parentNode.keys.length} keys > Max Keys (${maxKeys})! The split must percolate up by splitting this parent around median '${parentMedian}'.`,
            `Parent [${parentNode.keys.join(', ')}] has ${parentNode.keys.length} > ${maxKeys} keys ⇒ Percolate Up! Median = '${parentMedian}'`,
            val,
            `#${keyIdx + 1}${subStepLetter.toLowerCase()}: Parent Overflow`,
            `Parent [${parentNode.keys.join(',')}] overflows! Median = ${parentMedian}`
          );

          overflowingNode = parentNode;
        }
      }
    }
  });

  return steps;
}
