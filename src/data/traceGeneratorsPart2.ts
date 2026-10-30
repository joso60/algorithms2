import type { TraceStep, VisualTable, BTreeNodeView } from '../types/algorithm';

// ============================================================================
// 8. ASSEMBLY LINE SCHEDULING (Tables f1, f2 and l1, l2 + Optimal Path)
// ============================================================================
export function generateAssemblyLineSteps(
  a1Str: string,
  a2Str: string,
  t1Str: string,
  t2Str: string,
  exStr: string
): TraceStep[] {
  const parseNums = (s: string) =>
    s
      .split(/[\s,]+/)
      .map((x) => Number(x.trim()))
      .filter((x) => !isNaN(x));

  const a1 = parseNums(a1Str);
  const a2 = parseNums(a2Str);
  const t1 = parseNums(t1Str);
  const t2 = parseNums(t2Str);
  const ex = parseNums(exStr);
  const n = Math.min(a1.length, a2.length);
  if (n < 2) return [];

  const e1 = ex[0] ?? 2;
  const e2 = ex[1] ?? 4;
  const x1 = ex[2] ?? 3;
  const x2 = ex[3] ?? 2;

  const f1: (number | null)[] = new Array(n).fill(null);
  const f2: (number | null)[] = new Array(n).fill(null);
  const l1: (number | null)[] = new Array(n).fill(null);
  const l2: (number | null)[] = new Array(n).fill(null);
  let fStar: number | null = null;
  let lStar: number | null = null;
  const optimalLinePerStation: (number | null)[] = new Array(n).fill(null);

  const steps: TraceStep[] = [];

  const buildALSTables = (activeStation?: number, activeLine?: 1 | 2, showPath = false): VisualTable[] => {
    const stations = Array.from({ length: n }, (_, j) => `j = ${j + 1}`);
    const lStations = Array.from({ length: n - 1 }, (_, j) => `j = ${j + 2}`);

    return [
      {
        id: 'als-params',
        title: `Factory Parameters (e₁=${e1}, e₂=${e2}, x₁=${x1}, x₂=${x2})`,
        subtitle: '1-based station indexing j = 1 .. n (Matches Lecture 08 Slide 60)',
        colHeaders: stations,
        rowHeaders: ['Station Cost a₁,j', 'Station Cost a₂,j', 'Transfer t₁,j (1→2)', 'Transfer t₂,j (2→1)'],
        rows: [
          a1.slice(0, n).map((v, j) => ({
            value: v,
            state: activeStation === j && activeLine === 1 ? 'active' : showPath && optimalLinePerStation[j] === 1 ? 'path' : 'default',
          })),
          a2.slice(0, n).map((v, j) => ({
            value: v,
            state: activeStation === j && activeLine === 2 ? 'active' : showPath && optimalLinePerStation[j] === 2 ? 'path' : 'default',
          })),
          Array.from({ length: n }, (_, j) => ({
            value: j < n - 1 ? (t1[j] ?? 1) : '—',
            state: activeStation === j + 1 && activeLine === 2 ? 'compare' : 'default',
          })),
          Array.from({ length: n }, (_, j) => ({
            value: j < n - 1 ? (t2[j] ?? 1) : '—',
            state: activeStation === j + 1 && activeLine === 1 ? 'compare' : 'default',
          })),
        ],
        indexBase: '1-based (j = 1 .. n)',
      },
      {
        id: 'als-f-table',
        title: `Fastest Time Table f[i, j] ${fStar !== null ? `| Optimal Total f* = ${fStar} (Exit Line l* = ${lStar})` : ''}`,
        subtitle: 'f₁[j] and f₂[j] store minimum time to complete station j on Line 1 and Line 2',
        colHeaders: stations,
        rowHeaders: ['f₁[j] (Line 1)', 'f₂[j] (Line 2)'],
        rows: [
          f1.map((v, j) => ({
            value: v === null ? '—' : v,
            state:
              showPath && optimalLinePerStation[j] === 1
                ? 'path'
                : activeStation === j && activeLine === 1
                  ? 'match'
                  : v !== null
                    ? 'computed'
                    : 'unvisited',
            editableKey: v !== null ? `als-f1-${j}` : undefined,
            expectedValue: v ?? '',
            mistakeExplanation:
              j === 0
                ? `Base case: f₁[1] = e₁ + a₁,₁ = ${e1} + ${a1[0]} = ${v}.`
                : `f₁[${j + 1}] = min(f₁[${j}] + a₁,${j + 1}, f₂[${j}] + t₂,${j} + a₁,${j + 1}) = ${v}.`,
          })),
          f2.map((v, j) => ({
            value: v === null ? '—' : v,
            state:
              showPath && optimalLinePerStation[j] === 2
                ? 'path'
                : activeStation === j && activeLine === 2
                  ? 'match'
                  : v !== null
                    ? 'computed'
                    : 'unvisited',
            editableKey: v !== null ? `als-f2-${j}` : undefined,
            expectedValue: v ?? '',
            mistakeExplanation:
              j === 0
                ? `Base case: f₂[1] = e₂ + a₂,₁ = ${e2} + ${a2[0]} = ${v}.`
                : `f₂[${j + 1}] = min(f₂[${j}] + a₂,${j + 1}, f₁[${j}] + t₁,${j} + a₂,${j + 1}) = ${v}.`,
          })),
        ],
      },
      {
        id: 'als-l-table',
        title: 'Line Selection Table l[i, j] (for j = 2 .. n)',
        subtitle: 'Records which line (1 or 2) at station j - 1 yielded the fastest path into station j',
        colHeaders: lStations,
        rowHeaders: ['l₁[j]', 'l₂[j]'],
        rows: [
          l1.slice(1).map((v, idx) => ({
            value: v === null ? '—' : v,
            state: activeStation === idx + 1 && activeLine === 1 ? 'match' : v !== null ? 'computed' : 'unvisited',
            editableKey: v !== null ? `als-l1-${idx + 2}` : undefined,
            expectedValue: v ?? '',
            mistakeExplanation: `l₁[${idx + 2}] is 1 if staying on Line 1 was faster/equal, or 2 if transferring from Line 2 was faster.`,
          })),
          l2.slice(1).map((v, idx) => ({
            value: v === null ? '—' : v,
            state: activeStation === idx + 1 && activeLine === 2 ? 'match' : v !== null ? 'computed' : 'unvisited',
            editableKey: v !== null ? `als-l2-${idx + 2}` : undefined,
            expectedValue: v ?? '',
            mistakeExplanation: `l₂[${idx + 2}] is 2 if staying on Line 2 was faster/equal, or 1 if transferring from Line 1 was faster.`,
          })),
        ],
      },
    ];
  };

  // Base cases j = 1
  f1[0] = e1 + a1[0];
  f2[0] = e2 + a2[0];
  steps.push({
    stepNumber: 1,
    codeLine: 2,
    title: `Base Case (Station j = 1): Compute f₁[1] = ${f1[0]} and f₂[1] = ${f2[0]}`,
    explanation: `Add entry times to Station 1 processing costs: f₁[1] = e₁ + a₁,₁ = ${e1} + ${a1[0]} = ${f1[0]}, and f₂[1] = e₂ + a₂,₁ = ${e2} + ${a2[0]} = ${f2[0]}.`,
    formula: `f₁[1] = ${e1} + ${a1[0]} = ${f1[0]} | f₂[1] = ${e2} + ${a2[0]} = ${f2[0]}`,
    variables: { j: 1, 'f₁[1]': f1[0], 'f₂[1]': f2[0] },
    tables: buildALSTables(0, 1),
  });

  for (let j = 1; j < n; j++) {
    const stay1 = (f1[j - 1] as number) + a1[j];
    const transfer2to1 = (f2[j - 1] as number) + (t2[j - 1] ?? 1) + a1[j];
    if (stay1 <= transfer2to1) {
      f1[j] = stay1;
      l1[j] = 1;
    } else {
      f1[j] = transfer2to1;
      l1[j] = 2;
    }

    steps.push({
      stepNumber: steps.length + 1,
      codeLine: stay1 <= transfer2to1 ? 5 : 7,
      title: `Station j = ${j + 1} (Line 1): f₁[${j + 1}] = ${f1[j]}, l₁[${j + 1}] = ${l1[j]}`,
      explanation: `Compare staying on Line 1 (${f1[j - 1]} + ${a1[j]} = ${stay1}) vs transferring from Line 2 (${f2[j - 1]} + ${t2[j - 1]} + ${a1[j]} = ${transfer2to1}). Minimum is ${f1[j]} via Line ${l1[j]}.`,
      formula: `f₁[${j + 1}] = min(${stay1}, ${transfer2to1}) = ${f1[j]} ⇒ l₁[${j + 1}] = ${l1[j]}`,
      variables: { j: j + 1, StayLine1: stay1, TransferFrom2: transfer2to1, 'f₁[j]': f1[j]!, 'l₁[j]': l1[j]! },
      tables: buildALSTables(j, 1),
    });

    const stay2 = (f2[j - 1] as number) + a2[j];
    const transfer1to2 = (f1[j - 1] as number) + (t1[j - 1] ?? 1) + a2[j];
    if (stay2 <= transfer1to2) {
      f2[j] = stay2;
      l2[j] = 2;
    } else {
      f2[j] = transfer1to2;
      l2[j] = 1;
    }

    steps.push({
      stepNumber: steps.length + 1,
      codeLine: stay2 <= transfer1to2 ? 9 : 11,
      title: `Station j = ${j + 1} (Line 2): f₂[${j + 1}] = ${f2[j]}, l₂[${j + 1}] = ${l2[j]}`,
      explanation: `Compare staying on Line 2 (${f2[j - 1]} + ${a2[j]} = ${stay2}) vs transferring from Line 1 (${f1[j - 1]} + ${t1[j - 1]} + ${a2[j]} = ${transfer1to2}). Minimum is ${f2[j]} via Line ${l2[j]}.`,
      formula: `f₂[${j + 1}] = min(${stay2}, ${transfer1to2}) = ${f2[j]} ⇒ l₂[${j + 1}] = ${l2[j]}`,
      variables: { j: j + 1, StayLine2: stay2, TransferFrom1: transfer1to2, 'f₂[j]': f2[j]!, 'l₂[j]': l2[j]! },
      tables: buildALSTables(j, 2),
    });
  }

  // Exit comparison + Backtracking
  const exit1 = (f1[n - 1] as number) + x1;
  const exit2 = (f2[n - 1] as number) + x2;
  if (exit1 <= exit2) {
    fStar = exit1;
    lStar = 1;
  } else {
    fStar = exit2;
    lStar = 2;
  }

  let currLine = lStar;
  const pathLog: string[] = [];
  for (let j = n - 1; j >= 0; j--) {
    optimalLinePerStation[j] = currLine;
    pathLog.push(`Station ${j + 1} → Line ${currLine}`);
    if (j > 0) {
      currLine = currLine === 1 ? (l1[j] as number) : (l2[j] as number);
    }
  }

  steps.push({
    stepNumber: steps.length + 1,
    codeLine: 14,
    title: `Optimal Exit & Backtrack Fastest Way (PRINT-STATIONS): f* = ${fStar}, l* = ${lStar}`,
    explanation: `Compare exiting from Line 1 (${f1[n - 1]} + ${x1} = ${exit1}) vs Line 2 (${f2[n - 1]} + ${x2} = ${exit2}). Optimal total time is f* = ${fStar} exiting from Line l* = ${lStar}. Backtracking l[i,j] from j = ${n} down to 2 yields the optimal path highlighted in green!`,
    formula: `f* = min(${exit1}, ${exit2}) = ${fStar}, l* = ${lStar}`,
    variables: { 'Exit 1': exit1, 'Exit 2': exit2, 'f*': fStar, 'l*': lStar },
    outputString: pathLog.reverse().join('  ➔  '),
    tables: buildALSTables(undefined, undefined, true),
  });

  return steps;
}

// ============================================================================
// 9. MATRIX CHAIN MULTIPLICATION (MCM: m[i,j], s[i,j], Diagonal Fill & POP)
// ============================================================================
export function generateMatrixChainSteps(pStr: string): TraceStep[] {
  const p = pStr
    .split(/[\s,]+/)
    .map((s) => Number(s.trim()))
    .filter((x) => !isNaN(x));

  const n = p.length - 1;
  if (n < 2) return [];

  const m: (number | null)[][] = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(null));
  const s: (number | null)[][] = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(null));

  for (let i = 1; i <= n; i++) m[i][i] = 0;

  const steps: TraceStep[] = [];

  const buildMCMTables = (activeI?: number, activeJ?: number, activeK?: number): VisualTable[] => {
    const headers = Array.from({ length: n }, (_, idx) => `j = ${idx + 1}`);
    const rowHeads = Array.from({ length: n }, (_, idx) => `i = ${idx + 1}`);

    return [
      {
        id: 'mcm-dims',
        title: `Matrix Chain Dimensions (n = ${n} Matrices, p₀..p_${n} = [${p.join(', ')}])`,
        colHeaders: Array.from({ length: n }, (_, i) => `A_${i + 1} (p_${i} × p_${i + 1})`),
        rows: [
          Array.from({ length: n }, (_, i) => ({
            value: `${p[i]} × ${p[i + 1]}`,
            state: activeI !== undefined && activeJ !== undefined && i + 1 >= activeI && i + 1 <= activeJ ? 'active' : 'default',
          })),
        ],
        indexBase: '1-based matrices A₁ .. Aₙ, dimensions p₀ .. pₙ',
      },
      {
        id: 'mcm-m-table',
        title: 'Cost Table m[i, j] (Minimum Scalar Multiplications)',
        subtitle: 'Filled diagonally by chain length l = 2 to n (1-based indexing)',
        colHeaders: headers,
        rowHeaders: rowHeads,
        rows: Array.from({ length: n }, (_, rIdx) => {
          const i = rIdx + 1;
          return Array.from({ length: n }, (__, cIdx) => {
            const j = cIdx + 1;
            if (j < i) return { value: '—', state: 'unvisited' as const };
            const val = m[i][j];
            const isTarget = i === activeI && j === activeJ;
            const isSub =
              activeI !== undefined &&
              activeJ !== undefined &&
              activeK !== undefined &&
              ((i === activeI && j === activeK) || (i === activeK + 1 && j === activeJ));
            return {
              value: val === null ? '' : val,
              subText: s[i][j] !== null ? `k=${s[i][j]}` : undefined,
              state: isTarget ? 'match' : isSub ? 'compare' : val !== null ? 'computed' : 'unvisited',
              editableKey: j > i && val !== null ? `mcm-m-${i}-${j}` : undefined,
              expectedValue: val ?? '',
              mistakeExplanation: `m[${i},${j}] = min_{${i}≤k<${j}} { m[${i},k] + m[k+1,${j}] + p_${i - 1}·p_k·p_${j} } = ${val} (split at k = ${s[i][j]}).`,
            };
          });
        }),
      },
      {
        id: 'mcm-s-table',
        title: 'Split Table s[i, j] (Optimal Split Index k)',
        subtitle: 'Used by POP(s, i, j) in Step 4 to construct optimal parenthesization',
        colHeaders: headers.slice(1),
        rowHeaders: rowHeads.slice(0, n - 1),
        rows: Array.from({ length: n - 1 }, (_, rIdx) => {
          const i = rIdx + 1;
          return Array.from({ length: n - 1 }, (__, cIdx) => {
            const j = cIdx + 2;
            if (j <= i) return { value: '—', state: 'unvisited' as const };
            const val = s[i][j];
            return {
              value: val === null ? '' : val,
              state: i === activeI && j === activeJ ? 'match' : val !== null ? 'computed' : 'unvisited',
              editableKey: val !== null ? `mcm-s-${i}-${j}` : undefined,
              expectedValue: val ?? '',
              mistakeExplanation: `s[${i},${j}] stores the value of k (${i} ≤ k < ${j}) that minimized m[${i},${j}], which is k = ${val}.`,
            };
          });
        }),
      },
    ];
  };

  steps.push({
    stepNumber: 1,
    codeLine: 3,
    title: `Step 1: Initialize Main Diagonal m[i, i] = 0 for i = 1..${n}`,
    explanation: `A single matrix A_i requires 0 scalar multiplications, so m[1,1] = m[2,2] = ... = m[${n},${n}] = 0.`,
    formula: `m[i, i] ← 0 for i = 1 to ${n}`,
    variables: { n, 'p[0..n]': `[${p.join(', ')}]` },
    tables: buildMCMTables(),
  });

  for (let l = 2; l <= n; l++) {
    for (let i = 1; i <= n - l + 1; i++) {
      const j = i + l - 1;
      let bestCost = Infinity;
      let bestK = i;
      const kEvaluations: string[] = [];

      for (let k = i; k <= j - 1; k++) {
        const q = (m[i][k] as number) + (m[k + 1][j] as number) + p[i - 1] * p[k] * p[j];
        kEvaluations.push(
          `k=${k}: m[${i},${k}](${m[i][k]}) + m[${k + 1},${j}](${m[k + 1][j]}) + ${p[i - 1]}×${p[k]}×${p[j]}(${p[i - 1] * p[k] * p[j]}) = ${q}`
        );
        if (q < bestCost) {
          bestCost = q;
          bestK = k;
        }
      }

      m[i][j] = bestCost;
      s[i][j] = bestK;

      steps.push({
        stepNumber: steps.length + 1,
        codeLine: 11,
        title: `Chain Length l = ${l}: Compute m[${i}, ${j}] = ${bestCost} (Split s[${i}, ${j}] = ${bestK})`,
        explanation: `Evaluate all split points k from ${i} to ${j - 1}: ${kEvaluations.join(' | ')}. Minimum cost is ${bestCost} at k = ${bestK}.`,
        formula: `m[${i}, ${j}] = ${bestCost}, s[${i}, ${j}] = ${bestK}`,
        variables: { l, i, j, 'Best k': bestK, 'm[i,j]': bestCost },
        tables: buildMCMTables(i, j, bestK),
      });
    }
  }

  // Construct POP parenthesization
  const buildPOP = (i: number, j: number): string => {
    if (i === j) return `A${i}`;
    const k = s[i][j] as number;
    return `(${buildPOP(i, k)}${buildPOP(k + 1, j)})`;
  };
  const popResult = buildPOP(1, n);

  steps.push({
    stepNumber: steps.length + 1,
    codeLine: 13,
    title: `Step 4: Construct Optimal Parenthesization via POP(s, 1, ${n})`,
    explanation: `Minimum scalar multiplications = m[1, ${n}] = ${m[1][n]}. Calling POP(s, 1, ${n}) recursively splits at s[1, ${n}] = ${s[1][n]} to produce: ${popResult}.`,
    formula: `POP(s, 1, ${n}) ➔ ${popResult}`,
    variables: { 'Min Cost m[1,n]': m[1][n]!, 'Root Split s[1,n]': s[1][n]! },
    outputString: `Optimal Parenthesization: ${popResult}  (Cost: ${m[1][n]} multiplications)`,
    tables: buildMCMTables(1, n, s[1][n] ?? 1),
  });

  return steps;
}

// ============================================================================
// 10. LONGEST COMMON SUBSEQUENCE (LCS: c[i,j], b[i,j] arrows & PRINT-LCS)
// ============================================================================
export function generateLCSSteps(xStr: string, yStr: string): TraceStep[] {
  const X = xStr.replace(/[\s,]+/g, '').trim();
  const Y = yStr.replace(/[\s,]+/g, '').trim();
  const m = X.length;
  const n = Y.length;
  if (m === 0 || n === 0) return [];

  const c: (number | null)[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(null));
  const b: string[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(''));
  const onOptimalPath: boolean[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(false));

  for (let i = 0; i <= m; i++) c[i][0] = 0;
  for (let j = 0; j <= n; j++) c[0][j] = 0;

  const steps: TraceStep[] = [];

  const buildLCSTable = (activeI?: number, activeJ?: number, showPath = false): VisualTable[] => [
    {
      id: 'lcs-main-table',
      title: `LCS Length & Direction Table c[0..${m}, 0..${n}] and b[1..${m}, 1..${n}]`,
      subtitle: `X = <${X.split('').join(', ')}> (m=${m}), Y = <${Y.split('').join(', ')}> (n=${n}). Arrows: ↖ (match), ↑ (top ≥ left), ← (left > top)`,
      colHeaders: ['j=0 (∅)', ...Y.split('').map((ch, idx) => `j=${idx + 1} (${ch})`)],
      rowHeaders: ['i=0 (∅)', ...X.split('').map((ch, idx) => `i=${idx + 1} (${ch})`)],
      rows: Array.from({ length: m + 1 }, (_, i) =>
        Array.from({ length: n + 1 }, (__, j) => {
          const val = c[i][j];
          const arrow = b[i][j];
          const isTarget = i === activeI && j === activeJ;
          const isPath = showPath && onOptimalPath[i][j];
          return {
            value: val === null ? '' : val,
            subText: arrow || undefined,
            state: isPath ? 'path' : isTarget ? 'match' : val !== null ? 'computed' : 'unvisited',
            editableKey: i > 0 && j > 0 && val !== null ? `lcs-${i}-${j}` : undefined,
            expectedValue: val ?? '',
            mistakeExplanation:
              i > 0 && j > 0
                ? X[i - 1] === Y[j - 1]
                  ? `Since x_${i} ('${X[i - 1]}') == y_${j} ('${Y[j - 1]}'), c[${i},${j}] = c[${i - 1},${j - 1}] + 1 = ${val} (↖).`
                  : `Since x_${i} ('${X[i - 1]}') ≠ y_${j} ('${Y[j - 1]}'), c[${i},${j}] = max(c[${i - 1},${j}], c[${i},${j - 1}]) = ${val} (${arrow}).`
                : 'Base case row/column is 0.',
          };
        })
      ),
      indexBase: '1-based sequences X[1..m], Y[1..n] with 0-row/col base cases',
    },
  ];

  steps.push({
    stepNumber: 1,
    codeLine: 4,
    title: `Step 1: Initialize Base Cases c[i, 0] = 0 and c[0, j] = 0`,
    explanation: `An empty prefix X₀ or Y₀ has LCS length 0 with any sequence.`,
    formula: `c[i, 0] ← 0 (0 ≤ i ≤ ${m}), c[0, j] ← 0 (0 ≤ j ≤ ${n})`,
    variables: { m, n },
    tables: buildLCSTable(),
  });

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const xi = X[i - 1];
      const yj = Y[j - 1];
      if (xi === yj) {
        c[i][j] = (c[i - 1][j - 1] as number) + 1;
        b[i][j] = '↖';
      } else if ((c[i - 1][j] as number) >= (c[i][j - 1] as number)) {
        c[i][j] = c[i - 1][j];
        b[i][j] = '↑';
      } else {
        c[i][j] = c[i][j - 1];
        b[i][j] = '←';
      }

      steps.push({
        stepNumber: steps.length + 1,
        codeLine: xi === yj ? 9 : (c[i - 1][j] as number) >= (c[i][j - 1] as number) ? 12 : 15,
        title: `Cell (i=${i}, j=${j}): Compare x_${i}='${xi}' vs y_${j}='${yj}' ➔ c[${i},${j}] = ${c[i][j]} (${b[i][j]})`,
        explanation:
          xi === yj
            ? `Characters match ('${xi}' == '${yj}')! Take diagonal c[${i - 1}, ${j - 1}] + 1 = ${c[i - 1][j - 1]} + 1 = ${c[i][j]} and set arrow b[${i},${j}] = '↖'.`
            : `Mismatch ('${xi}' ≠ '${yj}'). Compare top c[${i - 1}, ${j}] (${c[i - 1][j]}) vs left c[${i}, ${j - 1}] (${c[i][j - 1]}). Set c[${i},${j}] = ${c[i][j]} and arrow b[${i},${j}] = '${b[i][j]}'.`,
        formula:
          xi === yj
            ? `x_${i} == y_${j} ⇒ c[${i},${j}] = c[${i - 1},${j - 1}] + 1 = ${c[i][j]} (↖)`
            : `x_${i} ≠ y_${j} ⇒ c[${i},${j}] = max(${c[i - 1][j]}, ${c[i][j - 1]}) = ${c[i][j]} (${b[i][j]})`,
        variables: { i, j, 'x_i': xi, 'y_j': yj, 'c[i,j]': c[i][j]!, 'b[i,j]': b[i][j] },
        tables: buildLCSTable(i, j),
      });
    }
  }

  // Backtrack PRINT-LCS
  let r = m;
  let col = n;
  const lcsChars: string[] = [];
  while (r > 0 && col > 0) {
    onOptimalPath[r][col] = true;
    if (b[r][col] === '↖') {
      lcsChars.push(X[r - 1]);
      r--;
      col--;
    } else if (b[r][col] === '↑') {
      r--;
    } else {
      col--;
    }
  }
  const lcsResult = lcsChars.reverse().join('');

  steps.push({
    stepNumber: steps.length + 1,
    codeLine: 18,
    title: `Step 4: Construct LCS via PRINT-LCS(b, X, ${m}, ${n}) ➔ "${lcsResult}"`,
    explanation: `Starting at (m=${m}, n=${n}), follow arrows b[i,j]. Whenever we encounter a diagonal '↖' arrow, that character belongs to the LCS! Result: <${lcsResult.split('').join(', ')}> (Length = ${c[m][n]}).`,
    formula: `PRINT-LCS(b, X, ${m}, ${n}) = "${lcsResult}" (Length ${c[m][n]})`,
    variables: { LCS_Length: c[m][n]!, LCS_String: lcsResult || '∅' },
    outputString: `LCS = <${lcsResult.split('').join(', ')}> (Length: ${c[m][n]})`,
    tables: buildLCSTable(undefined, undefined, true),
  });

  return steps;
}

// ============================================================================
// 11. COIN ROW PROBLEM (1-based: F[0..n], F[i] = max(c_i + F[i-2], F[i-1]))
// ============================================================================
export function generateCoinRowSteps(coinsStr: string): TraceStep[] {
  const coins = coinsStr
    .split(/[\s,]+/)
    .map((s) => Number(s.trim()))
    .filter((x) => !isNaN(x));
  const n = coins.length;
  if (n === 0) return [];

  const F: (number | null)[] = new Array(n + 1).fill(null);
  F[0] = 0;
  F[1] = coins[0];

  const chosenIndices = new Set<number>();
  const steps: TraceStep[] = [];

  const buildCoinRowTable = (activeI?: number, showChosen = false): VisualTable[] => [
    {
      id: 'coin-row-table',
      title: `Coin Row DP Table F[0..${n}]`,
      subtitle: 'Recurrence: F[i] = max(cᵢ + F[i - 2], F[i - 1]) for i = 2..n (1-based coin indexing)',
      colHeaders: Array.from({ length: n + 1 }, (_, i) => `i = ${i}`),
      rowHeaders: ['Coin Value cᵢ', 'Max Amount F[i]'],
      rows: [
        Array.from({ length: n + 1 }, (_, i) => ({
          value: i === 0 ? '0 (∅)' : coins[i - 1],
          state: showChosen && chosenIndices.has(i) ? 'path' : i === activeI ? 'active' : 'default',
        })),
        F.map((val, i) => ({
          value: val === null ? '' : val,
          state:
            i === activeI
              ? 'match'
              : activeI !== undefined && (i === activeI - 1 || i === activeI - 2)
                ? 'compare'
                : val !== null
                  ? 'computed'
                  : 'unvisited',
          editableKey: i >= 2 && val !== null ? `cr-f-${i}` : undefined,
          expectedValue: val ?? '',
          mistakeExplanation: `F[${i}] = max(c_${i} + F[${i - 2}], F[${i - 1}]) = max(${coins[i - 1]} + ${F[i - 2]}, ${F[i - 1]}) = ${val}.`,
        })),
      ],
      indexBase: '1-based coins c₁..cₙ, DP array F[0..n]',
    },
  ];

  steps.push({
    stepNumber: 1,
    codeLine: 2,
    title: `Initialize Base Cases: F[0] = 0, F[1] = c₁ = ${coins[0]}`,
    explanation: `With 0 coins, maximum value is F[0] = 0. With 1 coin, maximum value is F[1] = c₁ = ${coins[0]}.`,
    formula: `F[0] ← 0, F[1] ← ${coins[0]}`,
    variables: { 'F[0]': 0, 'F[1]': coins[0] },
    tables: buildCoinRowTable(1),
  });

  for (let i = 2; i <= n; i++) {
    const take = coins[i - 1] + (F[i - 2] as number);
    const skip = F[i - 1] as number;
    F[i] = Math.max(take, skip);

    steps.push({
      stepNumber: steps.length + 1,
      codeLine: 4,
      title: `i = ${i} (c_${i} = ${coins[i - 1]}): F[${i}] = max(${coins[i - 1]} + ${F[i - 2]}, ${skip}) = ${F[i]}`,
      explanation: `Option 1 (Pick coin c_${i} = ${coins[i - 1]}): ${coins[i - 1]} + F[${i - 2}] = ${coins[i - 1]} + ${F[i - 2]} = ${take}. Option 2 (Skip coin c_${i}): F[${i - 1}] = ${skip}. Maximum is ${F[i]}.`,
      formula: `F[${i}] = max(c_${i} + F[${i - 2}], F[${i - 1}]) = max(${take}, ${skip}) = ${F[i]}`,
      variables: { i, 'c_i': coins[i - 1], 'Pick (c_i+F[i-2])': take, 'Skip (F[i-1])': skip, 'F[i]': F[i]! },
      tables: buildCoinRowTable(i),
    });
  }

  // Backtrack optimal coins
  let idx = n;
  const pickedList: string[] = [];
  while (idx >= 1) {
    if (idx === 1) {
      chosenIndices.add(1);
      pickedList.push(`c₁ (${coins[0]})`);
      break;
    }
    if (coins[idx - 1] + (F[idx - 2] as number) >= (F[idx - 1] as number)) {
      chosenIndices.add(idx);
      pickedList.push(`c_${idx} (${coins[idx - 1]})`);
      idx -= 2;
    } else {
      idx -= 1;
    }
  }

  steps.push({
    stepNumber: steps.length + 1,
    codeLine: 5,
    title: `Optimal Solution Constructed: Max Amount F[${n}] = ${F[n]}`,
    explanation: `Backtracking shows we pick non-adjacent coins: ${pickedList.reverse().join(' + ')} = ${F[n]}.`,
    formula: `Selected Coins: ${pickedList.join(', ')} ➔ Total = ${F[n]}`,
    variables: { MaxAmount: F[n]! },
    outputString: `Picked Coins: ${pickedList.join(' + ')} = ${F[n]}`,
    tables: buildCoinRowTable(undefined, true),
  });

  return steps;
}

// ============================================================================
// 12. CHANGE MAKING PROBLEM (F[0..n], denominations d[1..m])
// ============================================================================
export function generateChangeMakingSteps(amountStr: string, denomsStr: string): TraceStep[] {
  const n = Math.max(1, Math.min(30, Number(amountStr) || 6));
  const d = denomsStr
    .split(/[\s,]+/)
    .map((s) => Number(s.trim()))
    .filter((x) => !isNaN(x) && x > 0)
    .sort((a, b) => a - b);

  if (d.length === 0) return [];
  const F: (number | null)[] = new Array(n + 1).fill(null);
  const coinUsed: (number | null)[] = new Array(n + 1).fill(null);
  F[0] = 0;

  const steps: TraceStep[] = [];

  const buildCMTable = (activeI?: number): VisualTable[] => [
    {
      id: 'cm-table',
      title: `Change-Making Minimum Coins Table F[0..${n}] (Denominations D = [${d.join(', ')}])`,
      subtitle: 'Recurrence: F[i] = min_{j: i ≥ d_j} { F[i - d_j] } + 1 for i = 1..n (Matches Lecture 11 Slide 74)',
      colHeaders: Array.from({ length: n + 1 }, (_, i) => `i = ${i}`),
      rowHeaders: ['Min Coins F[i]', 'Last Coin Used'],
      rows: [
        F.map((val, i) => ({
          value: val === null ? '' : val === Infinity ? '∞' : val,
          state: i === activeI ? 'match' : val !== null ? 'computed' : 'unvisited',
          editableKey: i >= 1 && val !== null ? `cm-f-${i}` : undefined,
          expectedValue: val === Infinity ? '∞' : (val ?? ''),
          mistakeExplanation: `For amount i = ${i}, check all denominations d_j ≤ ${i} and take min(F[${i} - d_j]) + 1 = ${val}.`,
        })),
        coinUsed.map((c, i) => ({
          value: i === 0 ? '—' : c === null ? '' : c,
          state: i === activeI ? 'active' : 'default',
        })),
      ],
      indexBase: '0-based amount F[0..n], 1-based denominations D[1..m]',
    },
  ];

  steps.push({
    stepNumber: 1,
    codeLine: 2,
    title: `Initialize Base Case: F[0] = 0`,
    explanation: `0 coins are required to make change for amount 0. Denominations available: D = [${d.join(', ')}].`,
    formula: `F[0] ← 0`,
    variables: { Amount_n: n, Denominations: `[${d.join(', ')}]` },
    tables: buildCMTable(0),
  });

  for (let i = 1; i <= n; i++) {
    let temp = Infinity;
    let bestCoin: number | null = null;
    const candidates: string[] = [];

    for (let j = 0; j < d.length && i >= d[j]; j++) {
      const prev = F[i - d[j]] as number;
      candidates.push(`d_${j + 1}=${d[j]}: F[${i - d[j]}](${prev === Infinity ? '∞' : prev})` );
      if (prev < temp) {
        temp = prev;
        bestCoin = d[j];
      }
    }

    F[i] = temp === Infinity ? Infinity : temp + 1;
    coinUsed[i] = bestCoin;

    steps.push({
      stepNumber: steps.length + 1,
      codeLine: 8,
      title: `Amount i = ${i}: F[${i}] = ${F[i] === Infinity ? '∞' : F[i]}`,
      explanation: `Check denominations d_j ≤ ${i}: [${candidates.join(', ')}]. Minimum previous value is temp = ${temp === Infinity ? '∞' : temp}, so F[${i}] = temp + 1 = ${F[i]}.`,
      formula: `F[${i}] = min(${candidates.join(', ')}) + 1 = ${F[i]}`,
      variables: { i, temp: temp === Infinity ? '∞' : temp, 'F[i]': F[i]!, ChosenDenom: bestCoin ?? 'None' },
      tables: buildCMTable(i),
    });
  }

  return steps;
}

// ============================================================================
// 13. ROBOT COIN COLLECTING PROBLEM (n x m grid C[1..n, 1..m] & F[1..n, 1..m])
// ============================================================================
export function generateCoinCollectingSteps(gridStr: string): TraceStep[] {
  const rowsRaw = gridStr
    .split(';')
    .map((r) =>
      r
        .trim()
        .split(/[\s,]+/)
        .map(Number)
        .filter((x) => !isNaN(x))
    )
    .filter((r) => r.length > 0);

  const n = rowsRaw.length;
  const m = rowsRaw[0]?.length || 0;
  if (n === 0 || m === 0) return [];

  const F: (number | null)[][] = Array.from({ length: n }, () => new Array(m).fill(null));
  const onPath: boolean[][] = Array.from({ length: n }, () => new Array(m).fill(false));
  const steps: TraceStep[] = [];

  const buildCCTables = (activeI?: number, activeJ?: number, showPath = false): VisualTable[] => [
    {
      id: 'cc-board',
      title: `Coin Board C[1..${n}, 1..${m}] & Cumulative DP Table F[1..${n}, 1..${m}]`,
      subtitle: 'Recurrence: F[i, j] = max(F[i - 1, j], F[i, j - 1]) + C[i, j] (1-based indexing)',
      colHeaders: Array.from({ length: m }, (_, j) => `Col j=${j + 1}`),
      rowHeaders: Array.from({ length: n }, (_, i) => `Row i=${i + 1}`),
      rows: Array.from({ length: n }, (_, i) =>
        Array.from({ length: m }, (__, j) => {
          const val = F[i][j];
          const hasCoin = rowsRaw[i][j] === 1;
          const isTarget = i === activeI && j === activeJ;
          const isPathCell = showPath && onPath[i][j];
          return {
            value: val === null ? (hasCoin ? '🪙 (1)' : '0') : val,
            subText: `C=${rowsRaw[i][j]}`,
            state: isPathCell ? 'path' : isTarget ? 'match' : val !== null ? 'computed' : 'unvisited',
            editableKey: val !== null ? `cc-${i + 1}-${j + 1}` : undefined,
            expectedValue: val ?? '',
            mistakeExplanation: `F[${i + 1},${j + 1}] = max(top, left) + C[${i + 1},${j + 1}] (${rowsRaw[i][j]}) = ${val}.`,
          };
        })
      ),
      indexBase: '1-based board C[1..n, 1..m]',
    },
  ];

  // Base cases
  F[0][0] = rowsRaw[0][0];
  for (let j = 1; j < m; j++) F[0][j] = (F[0][j - 1] as number) + rowsRaw[0][j];
  steps.push({
    stepNumber: 1,
    codeLine: 4,
    title: `Step 1: Initialize First Row F[1, j] = F[1, j-1] + C[1, j]`,
    explanation: `Cells in Row 1 can only be reached by moving right from (1, 1).`,
    formula: `F[1, j] ← F[1, j - 1] + C[1, j] for j = 2 to ${m}`,
    variables: { Row: 1 },
    tables: buildCCTables(0, m - 1),
  });

  for (let i = 1; i < n; i++) {
    F[i][0] = (F[i - 1][0] as number) + rowsRaw[i][0];
    for (let j = 1; j < m; j++) {
      const top = F[i - 1][j] as number;
      const left = F[i][j - 1] as number;
      F[i][j] = Math.max(top, left) + rowsRaw[i][j];

      steps.push({
        stepNumber: steps.length + 1,
        codeLine: 8,
        title: `Cell (${i + 1}, ${j + 1}): F[${i + 1}, ${j + 1}] = max(${top}, ${left}) + ${rowsRaw[i][j]} = ${F[i][j]}`,
        explanation: `Compare arriving from above F[${i}, ${j + 1}] = ${top} vs from left F[${i + 1}, ${j}] = ${left}. Add C[${i + 1}, ${j + 1}] = ${rowsRaw[i][j]} to get ${F[i][j]}.`,
        formula: `F[${i + 1}, ${j + 1}] = max(${top}, ${left}) + ${rowsRaw[i][j]} = ${F[i][j]}`,
        variables: { i: i + 1, j: j + 1, Top: top, Left: left, Coin: rowsRaw[i][j], 'F[i,j]': F[i][j]! },
        tables: buildCCTables(i, j),
      });
    }
  }

  // Backtrack optimal robot path
  let r = n - 1;
  let c = m - 1;
  const pathSteps: string[] = [];
  while (r >= 0 && c >= 0) {
    onPath[r][c] = true;
    pathSteps.push(`(${r + 1},${c + 1})`);
    if (r === 0 && c === 0) break;
    if (r === 0) c--;
    else if (c === 0) r--;
    else if ((F[r - 1][c] as number) >= (F[r][c - 1] as number)) r--;
    else c--;
  }

  steps.push({
    stepNumber: steps.length + 1,
    codeLine: 9,
    title: `Optimal Robot Path Constructed: Max Coins = ${F[n - 1][m - 1]}`,
    explanation: `Robot collects a maximum of F[${n}, ${m}] = ${F[n - 1][m - 1]} coins along path: ${pathSteps.reverse().join(' ➔ ')}.`,
    formula: `Max Coins = F[${n}, ${m}] = ${F[n - 1][m - 1]}`,
    variables: { MaxCoins: F[n - 1][m - 1]! },
    outputString: `Optimal Robot Path: ${pathSteps.join(' ➔ ')}`,
    tables: buildCCTables(undefined, undefined, true),
  });

  return steps;
}

// ============================================================================
// 14. 0/1 KNAPSACK PROBLEM (Bottom-Up Table + Top-Down Memory Function MFK)
// ============================================================================
export function generateKnapsackSteps(weightsStr: string, valuesStr: string, capStr: string): TraceStep[] {
  const weights = weightsStr
    .split(/[\s,]+/)
    .map((s) => Number(s.trim()))
    .filter((x) => !isNaN(x));
  const values = valuesStr
    .split(/[\s,]+/)
    .map((s) => Number(s.trim()))
    .filter((x) => !isNaN(x));
  const W = Math.max(1, Math.min(20, Number(capStr) || 5));
  const n = Math.min(weights.length, values.length);
  if (n === 0) return [];

  // Bottom-up table
  const F: (number | null)[][] = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(null));
  for (let i = 0; i <= n; i++) F[i][0] = 0;
  for (let j = 0; j <= W; j++) F[0][j] = 0;

  // Also precompute Top-Down Memory Function table (-1 for unvisited)
  const MFK: number[][] = Array.from({ length: n + 1 }, (_, i) =>
    Array.from({ length: W + 1 }, (__, j) => (i === 0 || j === 0 ? 0 : -1))
  );
  const mfkCallOrder: string[] = [];
  const solveMFK = (i: number, j: number): number => {
    if (MFK[i][j] < 0) {
      mfkCallOrder.push(`MFK(${i},${j})`);
      const wi = weights[i - 1];
      const vi = values[i - 1];
      const val =
        j < wi
          ? solveMFK(i - 1, j)
          : Math.max(solveMFK(i - 1, j), vi + solveMFK(i - 1, j - wi));
      MFK[i][j] = val;
    }
    return MFK[i][j];
  };
  solveMFK(n, W);

  const steps: TraceStep[] = [];

  const buildKnapsackTables = (activeI?: number, activeJ?: number, showMFK = false): VisualTable[] => {
    const capCols = Array.from({ length: W + 1 }, (_, j) => `j = ${j}`);
    const itemRows = [
      'i = 0 (∅)',
      ...Array.from({ length: n }, (_, idx) => `i = ${idx + 1} (w=${weights[idx]}, v=$${values[idx]})`),
    ];

    const tables: VisualTable[] = [
      {
        id: 'knapsack-bottom-up',
        title: `Bottom-Up 0/1 Knapsack Table F[0..${n}, 0..${W}]`,
        subtitle: 'F[i, j] = F[i-1, j] if wᵢ > j; else max(F[i-1, j], vᵢ + F[i-1, j - wᵢ])',
        colHeaders: capCols,
        rowHeaders: itemRows,
        rows: Array.from({ length: n + 1 }, (_, i) =>
          Array.from({ length: W + 1 }, (__, j) => {
            const val = F[i][j];
            const isTarget = i === activeI && j === activeJ;
            const isDep =
              activeI !== undefined &&
              activeJ !== undefined &&
              i === activeI - 1 &&
              (j === activeJ || (weights[activeI - 1] <= activeJ && j === activeJ - weights[activeI - 1]));
            return {
              value: val === null ? '' : val,
              state: isTarget ? 'match' : isDep ? 'compare' : val !== null ? 'computed' : 'unvisited',
              editableKey: i > 0 && j > 0 && val !== null ? `ks-${i}-${j}` : undefined,
              expectedValue: val ?? '',
              mistakeExplanation:
                i > 0
                  ? j < weights[i - 1]
                    ? `Since w_${i} (${weights[i - 1]}) > capacity j (${j}), item ${i} cannot fit: F[${i},${j}] = F[${i - 1},${j}] = ${val}.`
                    : `Since w_${i} (${weights[i - 1]}) ≤ ${j}, F[${i},${j}] = max(F[${i - 1},${j}], v_${i} + F[${i - 1},${j - weights[i - 1]}]) = ${val}.`
                  : 'Base row/col is 0.',
            };
          })
        ),
        indexBase: '1-based items 1..n, 0-based capacity 0..W',
      },
    ];

    if (showMFK) {
      tables.push({
        id: 'knapsack-mfk-table',
        title: `Top-Down Memory Function Table MFKnapsack(${n}, ${W})`,
        subtitle: 'Initialized to -1 (for i,j ≥ 1). Only solves necessary subproblems! Unneeded cells remain -1 (Matches Lecture 12 Slide 196)',
        colHeaders: capCols,
        rowHeaders: itemRows,
        rows: Array.from({ length: n + 1 }, (_, i) =>
          Array.from({ length: W + 1 }, (__, j) => {
            const val = MFK[i][j];
            return {
              value: val,
              state: i === n && j === W ? 'match' : val === -1 ? 'unvisited' : i === 0 || j === 0 ? 'default' : 'path',
              editableKey: i > 0 && j > 0 ? `mfk-${i}-${j}` : undefined,
              expectedValue: val,
              mistakeExplanation:
                val === -1
                  ? `Cell (${i},${j}) is never requested by top-down recursion from MFK(${n},${W}), so it stays -1!`
                  : `Cell (${i},${j}) was computed on demand by MFK(${i},${j}) = ${val}.`,
            };
          })
        ),
      });
    }

    return tables;
  };

  steps.push({
    stepNumber: 1,
    codeLine: 2,
    title: `Step 1: Initialize Base Cases F[i, 0] = 0 and F[0, j] = 0`,
    explanation: `0 items or 0 capacity yields $0 value.`,
    formula: `F[i, 0] ← 0, F[0, j] ← 0`,
    variables: { Items_n: n, Capacity_W: W },
    tables: buildKnapsackTables(),
  });

  for (let i = 1; i <= n; i++) {
    const wi = weights[i - 1];
    const vi = values[i - 1];
    for (let j = 1; j <= W; j++) {
      if (j - wi < 0) {
        F[i][j] = F[i - 1][j];
        steps.push({
          stepNumber: steps.length + 1,
          codeLine: 6,
          title: `Cell (${i}, ${j}): w_${i} (${wi}) > j (${j}) ➔ F[${i}, ${j}] = F[${i - 1}, ${j}] = ${F[i][j]}`,
          explanation: `Since w_${i} = ${wi} > capacity j = ${j}, item ${i} does not fit. Copy value from above: F[${i}, ${j}] = F[${i - 1}, ${j}] = ${F[i][j]}.`,
          formula: `Since w_${i} (${wi}) > ${j}: F[${i}, ${j}] = F[${i - 1}, ${j}] = ${F[i][j]}`,
          variables: { i, j, 'w_i': wi, 'v_i': vi, 'F[i,j]': F[i][j]! },
          tables: buildKnapsackTables(i, j),
        });
      } else {
        const exclude = F[i - 1][j] as number;
        const include = vi + (F[i - 1][j - wi] as number);
        F[i][j] = Math.max(exclude, include);
        steps.push({
          stepNumber: steps.length + 1,
          codeLine: 8,
          title: `Cell (${i}, ${j}): w_${i} (${wi}) ≤ ${j} ➔ F[${i}, ${j}] = max(${exclude}, ${vi} + ${F[i - 1][j - wi]}) = ${F[i][j]}`,
          explanation: `Since w_${i} = ${wi} ≤ ${j}, compare excluding item ${i} (F[${i - 1}, ${j}] = ${exclude}) vs including item ${i} (v_${i} + F[${i - 1}, ${j - wi}] = ${vi} + ${F[i - 1][j - wi]} = ${include}). Max is ${F[i][j]}.`,
          formula: `F[${i}, ${j}] = max(F[${i - 1}, ${j}], v_${i} + F[${i - 1}, ${j - wi}]) = max(${exclude}, ${include}) = ${F[i][j]}`,
          variables: { i, j, Exclude: exclude, Include: include, 'F[i,j]': F[i][j]! },
          tables: buildKnapsackTables(i, j),
        });
      }
    }
  }

  steps.push({
    stepNumber: steps.length + 1,
    codeLine: 12,
    title: `Compare Bottom-Up vs. Memory Function MFKnapsack(${n}, ${W}) = ${F[n][W]}`,
    explanation: `Bottom-Up computed all ${n * W} cells. Top-Down Memory Function MFKnapsack(${n}, ${W}) initialized cells to -1 and only computed ${mfkCallOrder.length} necessary subproblems (${mfkCallOrder.join(' → ')}), leaving the rest as -1!`,
    formula: `Optimal Value F[${n}, ${W}] = ${F[n][W]} (MFK computed only ${mfkCallOrder.length} / ${n * W} cells)`,
    variables: { OptimalValue: F[n][W]!, 'MFK Calls': mfkCallOrder.length, 'Total Cells': n * W },
    outputString: `MFK Call Sequence: ${mfkCallOrder.join(' → ')}`,
    tables: buildKnapsackTables(n, W, true),
  });

  return steps;
}

// ============================================================================
// 15. BINOMIAL COEFFICIENT (Pascal's Triangle C[0..n, 0..k])
// ============================================================================
export function generateBinomialSteps(nStr: string, kStr: string): TraceStep[] {
  const n = Math.max(1, Math.min(10, Number(nStr) || 5));
  const k = Math.max(0, Math.min(n, Number(kStr) || 3));

  const C: (number | null)[][] = Array.from({ length: n + 1 }, () => new Array(k + 1).fill(null));
  const steps: TraceStep[] = [];

  const buildBinomTable = (activeI?: number, activeJ?: number): VisualTable[] => [
    {
      id: 'binom-table',
      title: `Binomial Coefficient Table C[0..${n}, 0..${k}] for C(${n}, ${k})`,
      subtitle: 'Recurrence: C[i, j] = 1 if j == 0 or j == i; else C[i - 1, j - 1] + C[i - 1, j]',
      colHeaders: Array.from({ length: k + 1 }, (_, j) => `j = ${j}`),
      rowHeaders: Array.from({ length: n + 1 }, (_, i) => `i = ${i}`),
      rows: Array.from({ length: n + 1 }, (_, i) =>
        Array.from({ length: k + 1 }, (__, j) => {
          if (j > i) return { value: '—', state: 'unvisited' as const };
          const val = C[i][j];
          const isTarget = i === activeI && j === activeJ;
          const isDep = activeI !== undefined && activeJ !== undefined && i === activeI - 1 && (j === activeJ - 1 || j === activeJ);
          return {
            value: val === null ? '' : val,
            state: isTarget ? 'match' : isDep ? 'compare' : val !== null ? 'computed' : 'unvisited',
            editableKey: val !== null && j > 0 && j < i ? `binom-${i}-${j}` : undefined,
            expectedValue: val ?? '',
            mistakeExplanation: `C[${i},${j}] = C[${i - 1},${j - 1}] + C[${i - 1},${j}] = ${val}.`,
          };
        })
      ),
      indexBase: '0-based C[0..n, 0..k]',
    },
  ];

  for (let i = 0; i <= n; i++) {
    const upperJ = Math.min(i, k);
    for (let j = 0; j <= upperJ; j++) {
      if (j === 0 || j === i) {
        C[i][j] = 1;
      } else {
        C[i][j] = (C[i - 1][j - 1] as number) + (C[i - 1][j] as number);
      }

      if (i === 0 || (j > 0 && j < i) || (i === n && j === k)) {
        steps.push({
          stepNumber: steps.length + 1,
          codeLine: j === 0 || j === i ? 5 : 6,
          title: `Compute C[${i}, ${j}] = ${C[i][j]}`,
          explanation:
            j === 0 || j === i
              ? `Base case (j = 0 or j = i): C[${i}, ${j}] = 1.`
              : `Add top-left C[${i - 1}, ${j - 1}] (${C[i - 1][j - 1]}) + top C[${i - 1}, ${j}] (${C[i - 1][j]}) = ${C[i][j]}.`,
          formula:
            j === 0 || j === i
              ? `C[${i}, ${j}] = 1`
              : `C[${i}, ${j}] = C[${i - 1}, ${j - 1}] + C[${i - 1}, ${j}] = ${C[i - 1][j - 1]} + ${C[i - 1][j]} = ${C[i][j]}`,
          variables: { i, j, 'C[i,j]': C[i][j]! },
          tables: buildBinomTable(i, j),
        });
      }
    }
  }

  return steps;
}

// ============================================================================
// 16. OPTIMAL BINARY SEARCH TREE (OBST: C[1..n+1, 0..n] & R[1..n+1, 0..n])
// ============================================================================
export function generateOBSTSteps(keysStr: string, probsStr: string): TraceStep[] {
  const keys = keysStr
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const p = probsStr
    .split(/[\s,]+/)
    .map((s) => Number(s.trim()))
    .filter((x) => !isNaN(x));

  const n = Math.min(keys.length, p.length);
  if (n === 0) return [];

  // 1-based rows i = 1..n+1, cols j = 0..n (Exact Levitin & Exam layout!)
  const C: (number | null)[][] = Array.from({ length: n + 2 }, () => new Array(n + 1).fill(null));
  const R: (number | null)[][] = Array.from({ length: n + 2 }, () => new Array(n + 1).fill(null));

  for (let i = 1; i <= n; i++) {
    C[i][i - 1] = 0;
    C[i][i] = p[i - 1];
    R[i][i] = i;
  }
  C[n + 1][n] = 0;

  const round2 = (num: number) => Math.round(num * 100) / 100;
  const steps: TraceStep[] = [];

  const buildOBSTTables = (activeI?: number, activeJ?: number, activeK?: number): VisualTable[] => {
    const colHeaders = Array.from({ length: n + 1 }, (_, j) => `j = ${j}`);
    const rowHeaders = Array.from({ length: n + 1 }, (_, idx) => `i = ${idx + 1}`);

    return [
      {
        id: 'obst-c-table',
        title: `Main Table C[1..${n + 1}, 0..${n}] (Minimum Expected Search Cost)`,
        subtitle: `Keys: ${keys.map((k, idx) => `${k} (p_${idx + 1}=${p[idx]})`).join(', ')} | Filled diagonally by d = j - i`,
        colHeaders,
        rowHeaders,
        rows: Array.from({ length: n + 1 }, (_, rIdx) => {
          const i = rIdx + 1;
          return Array.from({ length: n + 1 }, (__, j) => {
            if (j < i - 1) return { value: '—', state: 'unvisited' as const };
            const val = C[i][j];
            const isTarget = i === activeI && j === activeJ;
            const isSub =
              activeI !== undefined &&
              activeJ !== undefined &&
              activeK !== undefined &&
              ((i === activeI && j === activeK - 1) || (i === activeK + 1 && j === activeJ));
            return {
              value: val === null ? '' : val,
              state: isTarget ? 'match' : isSub ? 'compare' : val !== null ? 'computed' : 'unvisited',
              editableKey: j > i && val !== null ? `obst-c-${i}-${j}` : undefined,
              expectedValue: val ?? '',
              mistakeExplanation: `C[${i},${j}] = min_{${i}≤k≤${j}} { C[${i},k-1] + C[k+1,${j}] } + sum(p_${i}..p_${j}) = ${val} (for k = ${R[i][j]}).`,
            };
          });
        }),
        indexBase: 'Rows i = 1 .. n+1, Columns j = 0 .. n (Exact Exam Layout)',
      },
      {
        id: 'obst-r-table',
        title: `Root Table R[1..${n + 1}, 0..${n}] (Optimal Root Index k)`,
        subtitle: 'Stores root k (1..n) of optimal subtree for keys aᵢ..aⱼ',
        colHeaders,
        rowHeaders,
        rows: Array.from({ length: n + 1 }, (_, rIdx) => {
          const i = rIdx + 1;
          return Array.from({ length: n + 1 }, (__, j) => {
            if (j < i) return { value: '', state: 'unvisited' as const };
            const val = R[i][j];
            return {
              value: val === null ? '' : val,
              subText: val !== null ? `(${keys[val - 1]})` : undefined,
              state: i === activeI && j === activeJ ? 'match' : val !== null ? 'computed' : 'unvisited',
              editableKey: j > i && val !== null ? `obst-r-${i}-${j}` : undefined,
              expectedValue: val ?? '',
              mistakeExplanation: `Root table R[${i},${j}] stores k = ${val} (${keys[(val ?? 1) - 1]}) which achieved minimum cost C[${i},${j}].`,
            };
          });
        }),
      },
    ];
  };

  steps.push({
    stepNumber: 1,
    codeLine: 5,
    title: `Step 1: Initialize Diagonals C[i, i-1] = 0, C[i, i] = pᵢ, and R[i, i] = i`,
    explanation: `Empty subtrees C[i, i-1] have cost 0. Single-key subtrees C[i, i] have cost pᵢ and root R[i, i] = i.`,
    formula: `C[i, i-1] ← 0, C[i, i] ← pᵢ, R[i, i] ← i`,
    variables: { KeysCount: n },
    tables: buildOBSTTables(),
  });

  for (let d = 1; d <= n - 1; d++) {
    for (let i = 1; i <= n - d; i++) {
      const j = i + d;
      let minVal = Infinity;
      let kMin = i;
      let sumP = 0;
      for (let s = i; s <= j; s++) sumP += p[s - 1];
      sumP = round2(sumP);

      const kDetails: string[] = [];
      for (let k = i; k <= j; k++) {
        const leftC = C[i][k - 1] as number;
        const rightC = C[k + 1][j] as number;
        const sumC = round2(leftC + rightC);
        kDetails.push(`k=${k} (${keys[k - 1]}): C[${i},${k - 1}]+C[${k + 1},${j}] = ${leftC}+${rightC} = ${sumC}`);
        if (sumC < minVal) {
          minVal = sumC;
          kMin = k;
        }
      }

      const finalC = round2(minVal + sumP);
      C[i][j] = finalC;
      R[i][j] = kMin;

      steps.push({
        stepNumber: steps.length + 1,
        codeLine: 15,
        title: `Diagonal d = ${d}: Compute C[${i}, ${j}] = ${finalC} and R[${i}, ${j}] = ${kMin} (${keys[kMin - 1]})`,
        explanation: `Evaluate k from ${i} to ${j}: [${kDetails.join(' | ')}]. Minimum is ${minVal} at k = ${kMin}. Add Σp_s (s=${i}..${j}) = ${sumP} ➔ C[${i}, ${j}] = ${minVal} + ${sumP} = ${finalC}.`,
        formula: `C[${i}, ${j}] = min(${kDetails.map((x) => x.split('= ').pop()).join(', ')}) + ${sumP} = ${minVal} + ${sumP} = ${finalC} (for k = ${kMin})`,
        variables: { d, i, j, 'Σp': sumP, 'Min C[i,k-1]+C[k+1,j]': minVal, 'C[i,j]': finalC, 'R[i,j]': kMin },
        tables: buildOBSTTables(i, j, kMin),
      });
    }
  }

  // Construct Optimal BST recursively from R[1..n]
  const buildBSTView = (i: number, j: number): BTreeNodeView | null => {
    if (i > j) return null;
    const k = R[i][j] as number;
    const leftChild = buildBSTView(i, k - 1);
    const rightChild = buildBSTView(k + 1, j);
    const children: BTreeNodeView[] = [];
    if (leftChild) children.push({ ...leftChild, keys: [`L: ${leftChild.keys[0]}`] });
    if (rightChild) children.push({ ...rightChild, keys: [`R: ${rightChild.keys[0]}`] });
    return {
      id: `obst-${i}-${j}`,
      keys: [`${keys[k - 1]} (k=${k})`],
      highlight: i === 1 && j === n ? 'active' : 'found',
      children: children.length > 0 ? children : undefined,
    };
  };

  const obstRoot = buildBSTView(1, n);

  steps.push({
    stepNumber: steps.length + 1,
    codeLine: 16,
    title: `Step 4: Construct Optimal Binary Search Tree from Root Table R`,
    explanation: `Minimum expected search cost is C[1, ${n}] = ${C[1][n]}. Root of the entire tree is R[1, ${n}] = ${R[1][n]} (Key '${keys[(R[1][n] as number) - 1]}'). Left subtree comes from C[1, ${(R[1][n] as number) - 1}] and right subtree from C[${(R[1][n] as number) + 1}, ${n}].`,
    formula: `Min Expected Cost = C[1, ${n}] = ${C[1][n]}, Root = R[1, ${n}] = ${R[1][n]} (${keys[(R[1][n] as number) - 1]})`,
    variables: { 'Min Cost C[1,n]': C[1][n]!, 'Root Key': keys[(R[1][n] as number) - 1] },
    bTreeView: obstRoot
      ? {
          order: 2,
          minKeys: 1,
          maxKeys: 1,
          root: obstRoot,
          operationNote: `Constructed Optimal BST (Root = ${keys[(R[1][n] as number) - 1]}, Expected Cost = ${C[1][n]})`,
        }
      : undefined,
    tables: buildOBSTTables(1, n, R[1][n] ?? 1),
  });

  return steps;
}

// ============================================================================
// 17. WARSHALL'S ALGORITHM (Transitive Closure R^(0) .. R^(n))
// ============================================================================
export function generateWarshallSteps(matrixStr: string): TraceStep[] {
  const rowsRaw = matrixStr
    .split(';')
    .map((r) =>
      r
        .trim()
        .split(/[\s,]+/)
        .map((x) => (Number(x.trim()) > 0 ? 1 : 0))
    )
    .filter((r) => r.length > 0);

  const n = rowsRaw.length;
  if (n === 0) return [];
  const labels = Array.from({ length: n }, (_, i) => String.fromCharCode(97 + i)); // a, b, c, d...
  const R = rowsRaw.map((r) => [...r]);

  const edges = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (rowsRaw[i][j] === 1) {
        edges.push({ from: labels[i], to: labels[j] });
      }
    }
  }

  const steps: TraceStep[] = [];

  const buildWarshallTable = (kStep: number, _prevR: number[][], changedCells: Set<string>): VisualTable[] => [
    {
      id: `warshall-r-${kStep}`,
      title: `Matrix R^(${kStep}) ${kStep === 0 ? '(Initial Adjacency Matrix)' : `(Intermediate Vertices ≤ ${labels[kStep - 1]}, Pivot Row/Col k = ${kStep})`}`,
      subtitle: 'Rule: R^(k)[i, j] = R^(k-1)[i, j] OR (R^(k-1)[i, k] AND R^(k-1)[k, j])',
      colHeaders: labels,
      rowHeaders: labels,
      rows: R.map((row, i) =>
        row.map((val, j) => {
          const isPivot = kStep > 0 && (i === kStep - 1 || j === kStep - 1);
          const isNewlyOne = changedCells.has(`${i}-${j}`);
          return {
            value: val,
            state: isNewlyOne ? 'match' : isPivot ? 'compare' : val === 1 ? 'computed' : 'default',
            editableKey: kStep > 0 ? `warshall-${kStep}-${i}-${j}` : undefined,
            expectedValue: val,
            mistakeExplanation:
              isNewlyOne
                ? `R^(${kStep - 1})[${labels[i]},${labels[j]}] was 0, but both R^(${kStep - 1})[${labels[i]},${labels[kStep - 1]}] = 1 and R^(${kStep - 1})[${labels[kStep - 1]},${labels[j]}] = 1, so R^(${kStep})[${labels[i]},${labels[j]}] becomes 1!`
                : `R^(${kStep})[${labels[i]},${labels[j]}] = ${val}.`,
          };
        })
      ),
      indexBase: '1-based vertices 1..n (a..d)',
    },
  ];

  steps.push({
    stepNumber: 1,
    codeLine: 2,
    title: `Step 0: Initialize R^(0) = Adjacency Matrix A`,
    explanation: `R^(0) records direct edges with no intermediate vertices allowed.`,
    formula: `R^(0) ← A`,
    variables: { k: 0, Vertices: labels.join(', ') },
    graphView: { nodes: labels, edges, directed: true, weighted: false },
    tables: buildWarshallTable(0, R, new Set()),
  });

  for (let k = 1; k <= n; k++) {
    const prevR = R.map((r) => [...r]);
    const changed = new Set<string>();
    const newPaths: string[] = [];

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const nextVal = prevR[i][j] === 1 || (prevR[i][k - 1] === 1 && prevR[k - 1][j] === 1) ? 1 : 0;
        if (prevR[i][j] === 0 && nextVal === 1) {
          changed.add(`${i}-${j}`);
          newPaths.push(`${labels[i]}→${labels[k - 1]}→${labels[j]}`);
        }
        R[i][j] = nextVal;
      }
    }

    steps.push({
      stepNumber: steps.length + 1,
      codeLine: 6,
      title: `Step k = ${k} (Via Vertex '${labels[k - 1]}'): Compute R^(${k})`,
      explanation:
        newPaths.length > 0
          ? `Using vertex '${labels[k - 1]}' (row/col ${k}) as intermediate pivot, new transitive paths discovered: ${newPaths.join(', ')} (highlighted in green).`
          : `Using vertex '${labels[k - 1]}' (row/col ${k}) as intermediate pivot adds no new 1s in R^(${k}).`,
      formula: `R^(${k})[i, j] = R^(${k - 1})[i, j] ∨ (R^(${k - 1})[i, ${k}] ∧ R^(${k - 1})[${k}, j])`,
      variables: { k, PivotVertex: labels[k - 1], NewOnesAdded: newPaths.length },
      graphView: { nodes: labels, edges, directed: true, weighted: false, activeK: labels[k - 1] },
      tables: buildWarshallTable(k, prevR, changed),
    });
  }

  return steps;
}

// ============================================================================
// 18. FLOYD'S ALGORITHM (All-Pairs Shortest Paths D^(0) .. D^(n))
// ============================================================================
export function generateFloydSteps(matrixStr: string): TraceStep[] {
  const INF = 999999;
  const rowsRaw = matrixStr
    .split(';')
    .map((r) =>
      r
        .trim()
        .split(/[\s,]+/)
        .map((tok) => {
          const t = tok.trim().toLowerCase();
          if (t === 'inf' || t === '∞' || t === '-') return INF;
          const v = Number(t);
          return isNaN(v) ? INF : v;
        })
    )
    .filter((r) => r.length > 0);

  const n = rowsRaw.length;
  if (n === 0) return [];
  const labels = Array.from({ length: n }, (_, i) => String.fromCharCode(97 + i)); // a, b, c, d...
  const D = rowsRaw.map((r) => [...r]);

  const edges = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j && rowsRaw[i][j] < INF) {
        edges.push({ from: labels[i], to: labels[j], weight: rowsRaw[i][j] });
      }
    }
  }

  const steps: TraceStep[] = [];
  const historySnaps: { k: number; mat: number[][]; improved: Set<string> }[] = [];

  const formatDist = (v: number) => (v >= INF ? '∞' : v);

  const buildFloydTables = (kStep: number, improvedCells: Set<string>, explanationsMap: Record<string, string>): VisualTable[] => [
    {
      id: `floyd-d-${kStep}`,
      title: `Distance Matrix D^(${kStep}) ${kStep === 0 ? '(Initial Weight Matrix W)' : `(Pivot Vertex k = ${kStep} '${labels[kStep - 1]}')`}`,
      subtitle: 'Recurrence: D[i, j] ← min(D[i, j], D[i, k] + D[k, j])',
      colHeaders: labels,
      rowHeaders: labels,
      rows: D.map((row, i) =>
        row.map((val, j) => {
          const isPivot = kStep > 0 && (i === kStep - 1 || j === kStep - 1);
          const isImproved = improvedCells.has(`${i}-${j}`);
          return {
            value: formatDist(val),
            state: isImproved ? 'match' : isPivot ? 'compare' : val < INF ? 'computed' : 'default',
            editableKey: kStep > 0 && i !== j ? `floyd-${kStep}-${i}-${j}` : undefined,
            expectedValue: formatDist(val),
            mistakeExplanation:
              explanationsMap[`${i}-${j}`] ||
              `D^(${kStep})[${labels[i]},${labels[j]}] = ${formatDist(val)}.`,
          };
        })
      ),
      indexBase: '1-based vertices 1..n (a..d)',
    },
  ];

  historySnaps.push({ k: 0, mat: D.map((r) => [...r]), improved: new Set() });
  steps.push({
    stepNumber: 1,
    codeLine: 2,
    title: `Step 0: Initialize D^(0) = Weight Matrix W`,
    explanation: `Initialize D^(0) with direct edge weights (0 on main diagonal, ∞ where no direct edge exists).`,
    formula: `D^(0) ← W`,
    variables: { k: 0, Vertices: labels.join(', ') },
    graphView: { nodes: labels, edges, directed: true, weighted: true },
    tables: buildFloydTables(0, new Set(), {}),
  });

  for (let k = 1; k <= n; k++) {
    const prevD = D.map((r) => [...r]);
    const improved = new Set<string>();
    const cellExplanations: Record<string, string> = {};
    const updatesLog: string[] = [];

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const direct = prevD[i][j];
        const viaK = prevD[i][k - 1] >= INF || prevD[k - 1][j] >= INF ? INF : prevD[i][k - 1] + prevD[k - 1][j];
        const nextVal = Math.min(direct, viaK);

        cellExplanations[`${i}-${j}`] = `D^(${k})[${labels[i]},${labels[j]}] = min(D^(${k - 1})[${labels[i]},${labels[j]}](${formatDist(direct)}), D^(${k - 1})[${labels[i]},${labels[k - 1]}](${formatDist(prevD[i][k - 1])}) + D^(${k - 1})[${labels[k - 1]},${labels[j]}](${formatDist(prevD[k - 1][j])})) = ${formatDist(nextVal)}.`;

        if (nextVal < direct) {
          improved.add(`${i}-${j}`);
          updatesLog.push(
            `D[${labels[i]},${labels[j]}]: min(${formatDist(direct)}, ${ prevD[i][k - 1]}+${prevD[k - 1][j]}) = ${nextVal}`
          );
        }
        D[i][j] = nextVal;
      }
    }

    historySnaps.push({ k, mat: D.map((r) => [...r]), improved });

    steps.push({
      stepNumber: steps.length + 1,
      codeLine: 6,
      title: `Step k = ${k} (Via Intermediate Vertex '${labels[k - 1]}'): Compute D^(${k})`,
      explanation:
        updatesLog.length > 0
          ? `Using '${labels[k - 1]}' (row/col ${k}) as intermediate vertex shortens ${updatesLog.length} path(s): ${updatesLog.join(' | ')}.`
          : `Using '${labels[k - 1]}' (row/col ${k}) as intermediate vertex yields no shorter paths in D^(${k}).`,
      formula: `D^(${k})[i, j] = min(D^(${k - 1})[i, j], D^(${k - 1})[i, ${k}] + D^(${k - 1})[${k}, j])`,
      variables: { k, PivotVertex: labels[k - 1], UpdatedCells: updatesLog.length },
      graphView: { nodes: labels, edges, directed: true, weighted: true, activeK: labels[k - 1] },
      tables: buildFloydTables(k, improved, cellExplanations),
    });
  }

  return steps;
}
