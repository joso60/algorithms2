import type {
  TraceStep,
  VisualTable,
  TableCellData,
  GraphEdgeView,
  HuffmanTreeNodeView,
} from '../types/algorithm';

// ============================================================================
// HELPER: GRAPH NODE COORDINATE PRESETS (MATCHING EXACT SLIDE DIAGRAMS!)
// ============================================================================
function getGraphNodePositions(
  nodes: string[],
  edges: { u: string; v: string; w: number }[] = []
): Record<string, { x: number; y: number }> {
  const key = nodes.join(',');
  const lowerKey = key.toLowerCase();

  // 1. Lecture 16 & 17 Slide Example 01: 6-vertex graph (a, b, c, d, e, f) with f in the center
  if (lowerKey === 'a,b,c,d,e,f') {
    const map: Record<string, { x: number; y: number }> = {
      a: { x: 14, y: 26 },
      b: { x: 50, y: 12 },
      c: { x: 86, y: 28 },
      d: { x: 76, y: 86 },
      e: { x: 22, y: 86 },
      f: { x: 50, y: 52 },
    };
    const res: Record<string, { x: number; y: number }> = {};
    nodes.forEach((v) => {
      res[v] = map[v.toLowerCase()] || { x: 50, y: 50 };
    });
    return res;
  }

  // 2. Lecture 16 & 17 Slide Example 02: 9-vertex CLRS graph (a, b, c, d, e, f, g, h, i)
  if (lowerKey === 'a,b,c,d,e,f,g,h,i') {
    const map: Record<string, { x: number; y: number }> = {
      a: { x: 8, y: 50 },
      b: { x: 26, y: 15 },
      c: { x: 52, y: 15 },
      d: { x: 76, y: 15 },
      e: { x: 93, y: 50 },
      f: { x: 76, y: 85 },
      g: { x: 52, y: 85 },
      h: { x: 26, y: 85 },
      i: { x: 39, y: 50 },
    };
    const res: Record<string, { x: number; y: number }> = {};
    nodes.forEach((v) => {
      res[v] = map[v.toLowerCase()] || { x: 50, y: 50 };
    });
    return res;
  }

  // 3. 5-vertex Graph (a, b, c, d, e):
  //    - If 'e' is connected to 'a' or has degree >= 3 (Fall 2025 CFE Final Q3a center-e square graph),
  //      place a,b,c,d at the 4 corners and e in the exact center (50, 50)!
  //    - Otherwise (Lecture 18 Dijkstra Slide Ex 01 / Winter 2023 MakeUp Q3a), use the slide layout.
  if (lowerKey === 'a,b,c,d,e') {
    const eDeg = edges.filter(
      (edge) => edge.u.toLowerCase() === 'e' || edge.v.toLowerCase() === 'e'
    ).length;
    const hasAE = edges.some(
      (edge) =>
        (edge.u.toLowerCase() === 'a' && edge.v.toLowerCase() === 'e') ||
        (edge.u.toLowerCase() === 'e' && edge.v.toLowerCase() === 'a')
    );

    const hasEdge = (u: string, w: string) =>
      edges.some(
        (edge) =>
          (edge.u.toLowerCase() === u && edge.v.toLowerCase() === w) ||
          (edge.v.toLowerCase() === u && edge.u.toLowerCase() === w)
      );

    let cPos = { x: 18, y: 82 };
    let dPos = { x: 82, y: 82 };
    if (hasEdge('b', 'c') || hasEdge('d', 'a')) {
      cPos = { x: 82, y: 82 }; // bottom-right (clockwise)
      dPos = { x: 18, y: 82 }; // bottom-left
    }

    const map: Record<string, { x: number; y: number }> =
      hasAE || eDeg >= 3
        ? {
            a: { x: 18, y: 18 },
            b: { x: 82, y: 18 },
            c: cPos,
            d: dPos,
            e: { x: 50, y: 50 },
          }
        : {
            a: { x: 12, y: 50 },
            b: { x: 46, y: 16 },
            c: { x: 84, y: 16 },
            d: { x: 46, y: 84 },
            e: { x: 84, y: 84 },
          };
    const res: Record<string, { x: number; y: number }> = {};
    nodes.forEach((v) => {
      res[v] = map[v.toLowerCase()] || { x: 50, y: 50 };
    });
    return res;
  }

  // 4. Lecture 18 Dijkstra Student Exercise & Fall 2025 Final Q3: 5-vertex graph (s, t, x, y, z)
  if (lowerKey === 's,t,x,y,z') {
    return {
      s: { x: 12, y: 50 },
      t: { x: 46, y: 16 },
      x: { x: 85, y: 16 },
      y: { x: 46, y: 84 },
      z: { x: 85, y: 84 },
    };
  }

  // 5. Lecture 15 Intro Graph: 4-vertex graph (A, B, C, D)
  if (lowerKey === 'a,b,c,d') {
    const map: Record<string, { x: number; y: number }> = {
      a: { x: 15, y: 50 },
      b: { x: 50, y: 18 },
      c: { x: 50, y: 82 },
      d: { x: 85, y: 50 },
    };
    const res: Record<string, { x: number; y: number }> = {};
    nodes.forEach((v) => {
      res[v] = map[v.toLowerCase()] || { x: 50, y: 50 };
    });
    return res;
  }

  // Fallback circular layout for custom vertex sets
  const positions: Record<string, { x: number; y: number }> = {};
  const n = Math.max(1, nodes.length);
  nodes.forEach((v, idx) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * idx) / n;
    positions[v] = {
      x: Math.round(50 + 38 * Math.cos(angle)),
      y: Math.round(50 + 36 * Math.sin(angle)),
    };
  });
  return positions;
}

export interface ParsedEdge {
  u: string;
  v: string;
  w: number;
}

export function parseEdgesInput(edgesStr: string): { nodes: string[]; edges: ParsedEdge[] } {
  const rawParts = edgesStr
    .split(/[,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const edges: ParsedEdge[] = [];
  const nodeSet = new Set<string>();

  for (const part of rawParts) {
    // Match u-v:w or u->v:w or u v w
    const m = part.match(/^([A-Za-z0-9_]+)\s*(?:->|-|\s)\s*([A-Za-z0-9_]+)\s*[:=]\s*(-?\d+(?:\.\d+)?)$/);
    if (m) {
      const u = m[1].trim();
      const v = m[2].trim();
      const w = Number(m[3]);
      if (u && v && !Number.isNaN(w)) {
        edges.push({ u, v, w });
        nodeSet.add(u);
        nodeSet.add(v);
      }
    }
  }

  if (edges.length === 0) {
    // Fallback to Lecture 16 Slide Example 01
    const fallback = [
      { u: 'a', v: 'b', w: 3 },
      { u: 'a', v: 'f', w: 5 },
      { u: 'a', v: 'e', w: 6 },
      { u: 'b', v: 'c', w: 1 },
      { u: 'b', v: 'f', w: 4 },
      { u: 'c', v: 'f', w: 4 },
      { u: 'c', v: 'd', w: 6 },
      { u: 'f', v: 'd', w: 5 },
      { u: 'f', v: 'e', w: 2 },
      { u: 'e', v: 'd', w: 8 },
    ];
    fallback.forEach((e) => {
      nodeSet.add(e.u);
      nodeSet.add(e.v);
    });
    return { nodes: Array.from(nodeSet).sort(), edges: fallback };
  }

  const nodes = Array.from(nodeSet);
  // Sort alphabetically unless it's s,t,x,y,z
  if (nodes.includes('s') && nodes.includes('t') && nodes.includes('x')) {
    const order = ['s', 't', 'x', 'y', 'z'];
    nodes.sort((a, b) => {
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      return a.localeCompare(b);
    });
  } else {
    nodes.sort((a, b) => a.localeCompare(b));
  }

  return { nodes, edges };
}

// ============================================================================
// 19. GREEDY CHANGE-MAKING VS. DYNAMIC PROGRAMMING (Lecture 15)
// ============================================================================
export function generateGreedyChangeMakingSteps(
  amountStr: string,
  denomsStr: string
): TraceStep[] {
  const N = Math.min(45, Math.max(1, parseInt(amountStr.trim(), 10) || 6));
  const rawDenoms = denomsStr
    .split(/[,;\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((v) => !Number.isNaN(v) && v > 0);

  const uniqueAsc = Array.from(new Set(rawDenoms.length > 0 ? rawDenoms : [1, 3, 4])).sort(
    (a, b) => a - b
  );
  if (!uniqueAsc.includes(1)) {
    uniqueAsc.unshift(1);
  }
  const sortedDesc = [...uniqueAsc].sort((a, b) => b - a); // d_1 > d_2 > ... > d_k
  const kCount = sortedDesc.length;

  // Compute Optimal DP 1D table F[0..N] and choices
  const dpF: number[] = new Array(N + 1).fill(Infinity);
  const dpChoice: number[] = new Array(N + 1).fill(1);
  dpF[0] = 0;
  for (let amt = 1; amt <= N; amt++) {
    for (const d of uniqueAsc) {
      if (amt >= d && dpF[amt - d] + 1 < dpF[amt]) {
        dpF[amt] = dpF[amt - d] + 1;
        dpChoice[amt] = d;
      }
    }
  }

  // Reconstruct Optimal DP coins for N
  const dpCoins: number[] = [];
  let rem = N;
  while (rem > 0) {
    const c = dpChoice[rem];
    dpCoins.push(c);
    rem -= c;
  }
  dpCoins.sort((a, b) => b - a);

  // Also compute 2D DP Matrix C[0..m-1][0..N] (matching Lecture 15 Slide 34!)
  const dp2D: number[][] = Array.from({ length: uniqueAsc.length }, () =>
    new Array(N + 1).fill(0)
  );
  for (let row = 0; row < uniqueAsc.length; row++) {
    const d = uniqueAsc[row];
    for (let col = 1; col <= N; col++) {
      const withoutCoin = row > 0 ? dp2D[row - 1][col] : Infinity;
      const withCoin = col >= d ? 1 + dp2D[row][col - d] : Infinity;
      dp2D[row][col] = Math.min(withoutCoin, withCoin);
    }
  }

  const buildDPReferenceTables = (highlightFinal: boolean): VisualTable[] => {
    const dp1DRow: TableCellData[] = [];
    for (let col = 0; col <= N; col++) {
      dp1DRow.push({
        value: dpF[col],
        subText: col > 0 ? `pick ${dpChoice[col]}` : 'base',
        state: highlightFinal && col === N ? 'match' : col === 0 ? 'computed' : 'default',
        tooltip:
          col === 0
            ? 'Base Case: F[0] = 0 coins'
            : `Optimal DP for amount ${col}: ${dpF[col]} coin(s) (last coin picked = ${dpChoice[col]})`,
      });
    }

    const tables: VisualTable[] = [
      {
        id: 'greedy-cm-dp-1d',
        title: `Dynamic Programming Optimal Table F[0..${N}] (Lecture 15 Slide 22 Reference)`,
        subtitle: `Optimal DP Solution for N = ${N}: F[${N}] = ${dpF[N]} coins → {${dpCoins.join(', ')}}`,
        colHeaders: Array.from({ length: N + 1 }, (_, idx) => `${idx}`),
        rowHeaders: ['F[i] (Min Coins)'],
        rows: [dp1DRow],
        indexBase: 'Optimal DP Reference',
      },
    ];

    if (N <= 16) {
      tables.push({
        id: 'greedy-cm-dp-2d',
        title: `2D Dynamic Programming Coin Table (Lecture 15 Slide 34 Format)`,
        subtitle: `Rows = Coin Denominations {${uniqueAsc.join(', ')}}, Columns = Amount 0..${N}`,
        colHeaders: Array.from({ length: N + 1 }, (_, idx) => `${idx}`),
        rowHeaders: uniqueAsc.map((d, idx) => `d_${idx + 1} = ${d}`),
        rows: dp2D.map((r, rIdx) =>
          r.map((val, cIdx) => ({
            value: val === Infinity ? '∞' : val,
            state:
              highlightFinal && rIdx === uniqueAsc.length - 1 && cIdx === N
                ? 'match'
                : cIdx === 0
                  ? 'computed'
                  : 'default',
          }))
        ),
        indexBase: '2D DP Table',
      });
    }

    return tables;
  };

  interface GreedyLogEntry {
    iter: number;
    changeBefore: number;
    i: number;
    di: number;
    sum: number;
    feasible: boolean;
    action: string;
    changeAfter: number;
    setAfter: string;
  }

  const logEntries: GreedyLogEntry[] = [];
  const steps: TraceStep[] = [];
  let stepNum = 1;

  // Step 1: Sort Coins & Show DP Optimal Baseline
  steps.push({
    stepNumber: stepNum++,
    codeLine: 2,
    title: `Step 1: Sort Coins in Decreasing Order (${sortedDesc.join(' > ')})`,
    explanation: `To make change for target amount N = ${N}, GreedyAlgorithm(${N}) first sorts the coin denominations in decreasing order: ${sortedDesc
      .map((d, idx) => `d_${idx + 1} = ${d}`)
      .join(', ')}. Below we also display the Dynamic Programming reference table showing that the true minimum number of coins for N = ${N} is ${dpF[N]} ({${dpCoins.join(', ')}}).`,
    formula: `Sorted Coins: ${sortedDesc.join(' > ')}   |   Target N = ${N}`,
    variables: {
      N,
      'Sorted Coins': `[${sortedDesc.join(', ')}]`,
      'DP Optimal Coins': `${dpF[N]} ({${dpCoins.join(', ')}})`,
    },
    tables: [
      {
        id: 'greedy-coins-bar',
        title: `Sorted Coin Denominations d₁ > d₂ > ... > d_${kCount} (Lecture 15 Slide 25)`,
        colHeaders: sortedDesc.map((_, idx) => `i = ${idx + 1} (d_${idx + 1})`),
        rowHeaders: ['Coin Value'],
        rows: [
          sortedDesc.map((d, idx) => ({
            value: d,
            state: idx === 0 ? 'active' : 'default',
            subText: idx === 0 ? 'Start i=1' : undefined,
          })),
        ],
      },
      ...buildDPReferenceTables(false),
    ],
  });

  // Step 2: Initialize S = ∅, Change = 0, i = 1
  steps.push({
    stepNumber: stepNum++,
    codeLine: 5,
    title: `Step 2: Initialize S ← ∅, Change ← 0, i ← 1 (d₁ = ${sortedDesc[0]})`,
    explanation: `Initialize the selected coin multiset S = ∅, current accumulated Change = 0, and coin pointer i = 1 (pointing to the largest coin d₁ = ${sortedDesc[0]}).`,
    formula: `S = ∅,  Change = 0,  i = 1 (d₁ = ${sortedDesc[0]})`,
    variables: {
      N,
      Change: 0,
      S: '∅',
      i: 1,
      'd_i': sortedDesc[0],
    },
    tables: [
      {
        id: 'greedy-coins-bar',
        title: `Sorted Coin Denominations (Active Pointer i = 1 → d₁ = ${sortedDesc[0]})`,
        colHeaders: sortedDesc.map((_, idx) => `i = ${idx + 1} (d_${idx + 1})`),
        rowHeaders: ['Coin Value'],
        rows: [
          sortedDesc.map((d, idx) => ({
            value: d,
            state: idx === 0 ? 'active' : 'default',
            subText: idx === 0 ? '▲ i = 1' : undefined,
          })),
        ],
      },
      ...buildDPReferenceTables(false),
    ],
  });

  // Simulate the exact while-loop from Lecture 15 Slides 25–32 & 36–39
  let change = 0;
  let iIdx = 0; // 0-based for sortedDesc (i = iIdx + 1)
  const S: number[] = [];
  let iter = 0;

  while (change !== N && iIdx < sortedDesc.length && iter < 60) {
    iter++;
    const i1Based = iIdx + 1;
    const di = sortedDesc[iIdx];
    const sum = change + di;
    const feasible = sum <= N;
    const changeBefore = change;

    if (feasible) {
      change += di;
      S.push(di);
    } else {
      iIdx++;
    }

    const setStr = S.length > 0 ? `{${S.join(', ')}}` : '∅';
    const actionText = feasible
      ? `Feasible (${changeBefore} + ${di} = ${sum} ≤ ${N}) → Add d_${i1Based}=${di} to S`
      : `Exceeds N (${changeBefore} + ${di} = ${sum} > ${N}) → Advance i ← ${i1Based + 1} (d_${i1Based + 1}=${sortedDesc[iIdx] ?? '-'})`;

    logEntries.push({
      iter,
      changeBefore,
      i: i1Based,
      di,
      sum,
      feasible,
      action: actionText,
      changeAfter: change,
      setAfter: setStr,
    });

    const snapshotLogs = [...logEntries];
    const activePointerAfter = Math.min(iIdx, sortedDesc.length - 1);

    steps.push({
      stepNumber: stepNum++,
      codeLine: feasible ? 9 : 11,
      title: feasible
        ? `Iteration ${iter}: Change + d_${i1Based} = ${changeBefore} + ${di} = ${sum} ≤ ${N} ✓ (Pick Coin ${di})`
        : `Iteration ${iter}: Change + d_${i1Based} = ${changeBefore} + ${di} = ${sum} > ${N} ✗ (Skip to i = ${i1Based + 1})`,
      explanation: feasible
        ? `Since Change + d_${i1Based} = ${changeBefore} + ${di} = ${sum} ≤ ${N}, picking coin ${di} is FEASIBLE and LOCALLY OPTIMAL. We update Change ← ${change} and S ← ${setStr}. Pointer i remains at ${i1Based} (d_${i1Based} = ${di}) in case coin ${di} fits again.`
        : `Testing coin d_${i1Based} = ${di}: Change + d_${i1Based} = ${changeBefore} + ${di} = ${sum} > ${N} (not feasible — exceeds target ${N}!). We leave Change = ${change} unchanged and increment i ← ${i1Based + 1} to try the next smaller denomination d_${i1Based + 1} = ${sortedDesc[activePointerAfter]}.`,
      formula: feasible
        ? `${changeBefore} + ${di} = ${sum} ≤ ${N}  ⇒  Change = ${change},  S = ${setStr},  i = ${i1Based}`
        : `${changeBefore} + ${di} = ${sum} > ${N}  ⇒  i ← ${i1Based} + 1 = ${i1Based + 1} (d_${i1Based + 1} = ${sortedDesc[activePointerAfter]})`,
      variables: {
        Iteration: iter,
        'Tested d_i': `d_${i1Based} = ${di}`,
        'Change + d_i': `${changeBefore} + ${di} = ${sum}`,
        Change: change,
        S: setStr,
        i: activePointerAfter + 1,
      },
      tables: [
        {
          id: 'greedy-coins-bar',
          title: `Sorted Coin Denominations (Current Pointer i = ${activePointerAfter + 1})`,
          colHeaders: sortedDesc.map((_, idx) => `i = ${idx + 1} (d_${idx + 1})`),
          rowHeaders: ['Coin Value'],
          rows: [
            sortedDesc.map((d, idx) => ({
              value: d,
              state:
                idx === i1Based - 1
                  ? feasible
                    ? 'match'
                    : 'mismatch'
                  : idx === activePointerAfter
                    ? 'active'
                    : 'default',
              subText:
                idx === i1Based - 1
                  ? feasible
                    ? '✓ Picked'
                    : '✗ > N'
                  : idx === activePointerAfter
                    ? `▲ Next i=${idx + 1}`
                    : undefined,
            })),
          ],
        },
        {
          id: 'greedy-step-log',
          title: `Step-by-Step Greedy Trace Table (Lecture 15 Slides 26–31 & 37–39)`,
          subtitle: `Tracks Change, i, Feasibility Test (Change + dᵢ ≤ ${N}), and Selected Set S`,
          colHeaders: [
            'Iter #',
            'Change (Before)',
            'Pointer i (Coin dᵢ)',
            'Check: Change + dᵢ ≤ N',
            'Greedy Decision',
            'Change (After)',
            'Solution Set S',
          ],
          rows: snapshotLogs.map((entry, idx) => {
            const isLast = idx === snapshotLogs.length - 1;
            return [
              { value: entry.iter, state: isLast ? 'active' : 'computed' },
              { value: entry.changeBefore, state: 'default' },
              { value: `i = ${entry.i} (d_${entry.i} = ${entry.di})`, state: isLast ? 'compare' : 'default' },
              {
                value: `${entry.changeBefore} + ${entry.di} = ${entry.sum} ${entry.feasible ? `≤ ${N}` : `> ${N}`}`,
                state: entry.feasible ? 'match' : 'mismatch',
              },
              {
                value: entry.action,
                state: entry.feasible ? 'match' : 'mismatch',
              },
              {
                value: entry.changeAfter,
                state: isLast ? (entry.feasible ? 'match' : 'compare') : 'computed',
                editableKey: isLast ? `greedy-cm-change-${entry.iter}` : undefined,
                expectedValue: entry.changeAfter,
                mistakeExplanation: entry.feasible
                  ? `Since ${entry.changeBefore} + ${entry.di} ≤ ${N}, Change increases to ${entry.changeAfter}.`
                  : `Since ${entry.changeBefore} + ${entry.di} > ${N}, coin ${entry.di} is rejected and Change stays ${entry.changeAfter}.`,
              },
              { value: entry.setAfter, state: isLast && entry.changeAfter === N ? 'path' : 'computed' },
            ];
          }),
        },
        ...buildDPReferenceTables(change === N),
      ],
    });
  }

  // Final Step: Comparison Verdict between Greedy and DP
  const isOptimal = S.length === dpF[N];
  const finalSetStr = `{${S.join(', ')}}`;
  const dpSetStr = `{${dpCoins.join(', ')}}`;

  steps.push({
    stepNumber: stepNum++,
    codeLine: 12,
    title: isOptimal
      ? `Final Comparison: Greedy (${S.length} coins) Matches Optimal DP (${dpF[N]} coins)!`
      : `Final Comparison: Greedy Gives ${S.length} Coins ${finalSetStr} vs. Optimal DP ${dpF[N]} Coins ${dpSetStr} (Suboptimal!)`,
    explanation: isOptimal
      ? `While-loop terminates because Change = ${N}. For N = ${N} with coins {${uniqueAsc.join(', ')}}, the Greedy algorithm selected S = ${finalSetStr} (${S.length} coins), which matches the optimal Dynamic Programming solution F[${N}] = ${dpF[N]} coins!`
      : `While-loop terminates because Change = ${N}. Notice the critical lesson from Lecture 15 Slide 32: Because Greedy irrevocably committed to the largest coin ${S[0]} first, it was forced into S = ${finalSetStr} (${S.length} coins), whereas Dynamic Programming found the globally optimal solution ${dpSetStr} (${dpF[N]} coins)!`,
    formula: `Greedy: S = ${finalSetStr} (${S.length} coins)   vs.   DP Optimal: ${dpSetStr} (${dpF[N]} coins)`,
    outputString: isOptimal
      ? `Verdict: Greedy Solution S = ${finalSetStr} (${S.length} coins) is OPTIMAL for N = ${N}.`
      : `Verdict: Greedy Solution S = ${finalSetStr} (${S.length} coins) is SUBOPTIMAL! True Optimum via DP = ${dpSetStr} (${dpF[N]} coins).`,
    variables: {
      N,
      'Greedy Set S': finalSetStr,
      'Greedy Coin Count': S.length,
      'DP Optimal Set': dpSetStr,
      'DP Min Coins': dpF[N],
      Optimality: isOptimal ? 'OPTIMAL ✓' : 'SUBOPTIMAL ✗',
    },
    tables: [
      {
        id: 'greedy-vs-dp-summary',
        title: `Greedy vs. Dynamic Programming Final Comparison (N = ${N}, Coins = {${uniqueAsc.join(', ')}})`,
        colHeaders: ['Approach', 'Selected Coins', 'Total Coins Used', 'Guarantees Global Optimum?', 'Space Complexity'],
        rows: [
          [
            { value: 'Greedy Algorithm', state: isOptimal ? 'match' : 'mismatch' },
            { value: finalSetStr, state: isOptimal ? 'match' : 'mismatch' },
            {
              value: S.length,
              state: isOptimal ? 'match' : 'mismatch',
              editableKey: 'final-greedy-count',
              expectedValue: S.length,
              mistakeExplanation: `Greedy selected ${finalSetStr}, which uses ${S.length} coins.`,
            },
            {
              value: isOptimal
                ? 'Yes for this input (Not guaranteed for general coins)'
                : `NO — Used ${S.length} coins instead of ${dpF[N]}!`,
              state: isOptimal ? 'compare' : 'mismatch',
            },
            { value: 'Θ(1)', state: 'computed' },
          ],
          [
            { value: 'Dynamic Programming', state: 'path' },
            { value: dpSetStr, state: 'path' },
            {
              value: dpF[N],
              state: 'path',
              editableKey: 'final-dp-count',
              expectedValue: dpF[N],
              mistakeExplanation: `DP table F[${N}] = ${dpF[N]} coins using ${dpSetStr}.`,
            },
            { value: 'YES — Always Optimal for any coin set', state: 'path' },
            { value: `Θ(N) = ${N + 1} cells`, state: 'computed' },
          ],
        ],
      },
      {
        id: 'greedy-step-log',
        title: `Complete Greedy Execution Log (${logEntries.length} Iterations)`,
        colHeaders: [
          'Iter #',
          'Change (Before)',
          'Pointer i (Coin dᵢ)',
          'Check: Change + dᵢ ≤ N',
          'Greedy Decision',
          'Change (After)',
          'Solution Set S',
        ],
        rows: logEntries.map((entry) => [
          { value: entry.iter, state: 'computed' },
          { value: entry.changeBefore, state: 'default' },
          { value: `i = ${entry.i} (d_${entry.i} = ${entry.di})`, state: 'default' },
          {
            value: `${entry.changeBefore} + ${entry.di} = ${entry.sum} ${entry.feasible ? `≤ ${N}` : `> ${N}`}`,
            state: entry.feasible ? 'match' : 'mismatch',
          },
          { value: entry.action, state: entry.feasible ? 'match' : 'mismatch' },
          { value: entry.changeAfter, state: 'computed' },
          { value: entry.setAfter, state: 'computed' },
        ]),
      },
      ...buildDPReferenceTables(true),
    ],
  });

  return steps;
}

// ============================================================================
// 20. PRIM'S ALGORITHM FOR MINIMUM SPANNING TREE (Lecture 16)
// ============================================================================
export function generatePrimSteps(edgesStr: string, startNodeStr: string): TraceStep[] {
  const { nodes, edges } = parseEdgesInput(edgesStr);
  const startNode = nodes.includes(startNodeStr.trim()) ? startNodeStr.trim() : nodes[0];
  const nodePositions = getGraphNodePositions(nodes, edges);
  const isSlideEx1 = nodes.join(',') === 'a,b,c,d,e,f' && startNode === 'a';
  const isSlideEx2 = nodes.join(',') === 'a,b,c,d,e,f,g,h,i' && startNode === 'a';

  const VT = new Set<string>([startNode]);
  const ET: { from: string; to: string; weight: number }[] = [];

  interface PrimIterationRecord {
    iter: number;
    vtBefore: string[];
    remainingBefore: string[];
    candidates: { from: string; to: string; weight: number }[];
    chosen: { from: string; to: string; weight: number };
    vtAfter: string[];
    etAfter: { from: string; to: string; weight: number }[];
    runningWeight: number;
  }

  const history: PrimIterationRecord[] = [];
  const steps: TraceStep[] = [];
  let stepNum = 1;

  const buildFringeTableForState = (
    currentVT: Set<string>,
    chosenEdge?: { from: string; to: string; weight: number }
  ): VisualTable => {
    const remaining = nodes.filter((n) => !currentVT.has(n));
    const rows: TableCellData[][] = remaining.map((u) => {
      // Find all edges connecting v in VT to u
      const connecting: { v: string; w: number }[] = [];
      for (const e of edges) {
        if (currentVT.has(e.u) && e.v === u) connecting.push({ v: e.u, w: e.w });
        else if (currentVT.has(e.v) && e.u === u) connecting.push({ v: e.v, w: e.w });
      }
      connecting.sort((a, b) => a.w - b.w || a.v.localeCompare(b.v));
      const best = connecting[0];
      const isChosen = chosenEdge && chosenEdge.to === u;

      return [
        {
          value: u,
          state: isChosen ? 'match' : best ? 'compare' : 'unvisited',
        },
        {
          value: best ? `${best.v} (weight = ${best.w})` : 'None (∞)',
          state: isChosen ? 'match' : best ? 'active' : 'unvisited',
          editableKey: isChosen ? `prim-fringe-min-${u}-${currentVT.size}` : undefined,
          expectedValue: best ? best.w : 'inf',
          mistakeExplanation: best
            ? `The minimum-weight edge connecting ${u} to V_T = {${Array.from(currentVT).join(', ')}} is (${best.v}, ${u}) with weight ${best.w}.`
            : `Vertex ${u} is not yet adjacent to any vertex in V_T.`,
        },
        {
          value:
            connecting.length > 0
              ? connecting.map((c) => `(${c.v},${u})=${c.w}`).join(', ')
              : 'Not yet adjacent to V_T',
          state: 'default',
        },
        {
          value: isChosen
            ? `★ Selected Minimum Edge (${chosenEdge.from}, ${chosenEdge.to}) = ${chosenEdge.weight}`
            : best
              ? `Candidate in Fringe (d_${u} = ${best.w})`
              : 'Waiting (d = ∞)',
          state: isChosen ? 'path' : best ? 'compare' : 'unvisited',
        },
      ];
    });

    return {
      id: 'prim-fringe-candidates',
      title: `Fringe / Cut Candidate Edges Crossing (V_T, V - V_T)`,
      subtitle: `For each vertex u ∈ V - V_T, shows all edges connecting u to V_T = {${Array.from(currentVT).join(', ')}}`,
      colHeaders: [
        'Fringe Vertex u ∈ V - V_T',
        'Nearest Tree Neighbor v ∈ V_T',
        'All Cut Edges Joining u to V_T',
        'Status in Current Iteration',
      ],
      rows:
        rows.length > 0
          ? rows
          : [
              [
                { value: '∅ (All vertices in V_T)', state: 'path' },
                { value: '-', state: 'path' },
                { value: '-', state: 'path' },
                { value: 'MST Complete!', state: 'path' },
              ],
            ],
    };
  };

  const buildGraphView = (
    currentVT: Set<string>,
    currentET: { from: string; to: string; weight: number }[],
    chosenEdge?: { from: string; to: string; weight: number },
    activeVertex?: string
  ) => {
    const nodeStates: Record<string, 'default' | 'in-tree' | 'active' | 'fringe' | 'source'> = {};
    const nodeBadges: Record<string, string> = {};

    nodes.forEach((n) => {
      if (n === activeVertex) {
        nodeStates[n] = 'active';
        nodeBadges[n] = 'Added u*';
      } else if (currentVT.has(n)) {
        nodeStates[n] = n === startNode && currentVT.size === 1 ? 'source' : 'in-tree';
        nodeBadges[n] = '∈ V_T';
      } else {
        // Check if adjacent to currentVT
        let minW = Infinity;
        let minV = '';
        for (const e of edges) {
          if (currentVT.has(e.u) && e.v === n && e.w < minW) {
            minW = e.w;
            minV = e.u;
          } else if (currentVT.has(e.v) && e.u === n && e.w < minW) {
            minW = e.w;
            minV = e.v;
          }
        }
        if (minW < Infinity) {
          nodeStates[n] = 'fringe';
          nodeBadges[n] = `(${minV}, ${minW})`;
        } else {
          nodeStates[n] = 'default';
          nodeBadges[n] = '(-, ∞)';
        }
      }
    });

    const graphEdges: GraphEdgeView[] = edges.map((e) => {
      const isChosen =
        chosenEdge &&
        ((chosenEdge.from === e.u && chosenEdge.to === e.v) ||
          (chosenEdge.from === e.v && chosenEdge.to === e.u));
      const inET = currentET.some(
        (te) => (te.from === e.u && te.to === e.v) || (te.from === e.v && te.to === e.u)
      );
      const isCutCandidate =
        (currentVT.has(e.u) && !currentVT.has(e.v)) ||
        (currentVT.has(e.v) && !currentVT.has(e.u));

      return {
        from: e.u,
        to: e.v,
        weight: e.w,
        highlight: Boolean(isChosen || inET),
        state: isChosen ? 'selected' : inET ? 'tree' : isCutCandidate ? 'candidate' : 'default',
      };
    });

    const totalW = currentET.reduce((acc, item) => acc + item.weight, 0);

    return {
      nodes,
      edges: graphEdges,
      directed: false,
      weighted: true,
      nodePositions,
      nodeStates,
      nodeBadges,
      vtLabel: `V_T = {${Array.from(currentVT).join(', ')}}`,
      etLabel:
        currentET.length > 0
          ? `E_T = {${currentET.map((x) => `(${x.from},${x.to}):${x.weight}`).join(', ')}}`
          : 'E_T = ∅',
      totalWeight: totalW,
      caption:
        'Green/Cyan Solid Edges = In MST (E_T) | Dashed Amber Edges = Candidate Cut Edges (v ∈ V_T, u ∈ V - V_T)',
    };
  };

  // Step 1: Initialization V_T = {startNode}, E_T = ∅
  steps.push({
    stepNumber: stepNum++,
    codeLine: 4,
    title: `Step 1: Initialize V_T ← {${startNode}} and E_T ← ∅`,
    explanation: `Start Prim's algorithm at vertex v₀ = '${startNode}'. Place '${startNode}' in the tree vertex set V_T = {${startNode}} and initialize the tree edge set E_T = ∅. The dashed amber edges on the graph show all candidate cut edges connecting '${startNode}' to V - V_T.`,
    formula: `V_T = {${startNode}},   E_T = ∅,   |V| - 1 = ${nodes.length - 1} edges needed`,
    variables: {
      'Start v₀': startNode,
      V_T: `{${startNode}}`,
      'V - V_T': `{${nodes.filter((x) => x !== startNode).join(', ')}}`,
      E_T: '∅',
      'MST Weight': 0,
    },
    graphView: buildGraphView(VT, ET),
    tables: [buildFringeTableForState(VT)],
  });

  // Main loop: |V| - 1 iterations
  for (let iter = 1; iter <= nodes.length - 1; iter++) {
    const vtBefore = Array.from(VT);
    const remainingBefore = nodes.filter((n) => !VT.has(n));

    // Collect all candidate cut edges (v in VT, u in V - VT)
    const candidates: { from: string; to: string; weight: number }[] = [];
    for (const e of edges) {
      if (VT.has(e.u) && !VT.has(e.v)) {
        candidates.push({ from: e.u, to: e.v, weight: e.w });
      } else if (VT.has(e.v) && !VT.has(e.u)) {
        candidates.push({ from: e.v, to: e.u, weight: e.w });
      }
    }

    // Sort candidates by weight; tie-break to match exact Lecture 16 slide choices!
    candidates.sort((x, y) => {
      if (x.weight !== y.weight) return x.weight - y.weight;
      // Slide Ex 01 Iter 3 tie-break: (b,f)=4 and (c,f)=4 -> Slide 37 picks (c,f)=4
      if (isSlideEx1 && iter === 3) {
        if (x.from === 'c' && x.to === 'f') return -1;
        if (y.from === 'c' && y.to === 'f') return 1;
      }
      // Slide Ex 02 Iter 2 tie-break: (a,h)=8 and (b,c)=8 -> Slide 53 picks (b,c)=8
      if (isSlideEx2 && iter === 2) {
        if (x.from === 'b' && x.to === 'c') return -1;
        if (y.from === 'b' && y.to === 'c') return 1;
      }
      return x.from.localeCompare(y.from) || x.to.localeCompare(y.to);
    });

    if (candidates.length === 0) break;
    const chosen = candidates[0];

    const fringeSnapshotTable = buildFringeTableForState(VT, chosen);

    VT.add(chosen.to);
    ET.push(chosen);
    const runningWeight = ET.reduce((acc, item) => acc + item.weight, 0);

    history.push({
      iter,
      vtBefore,
      remainingBefore,
      candidates,
      chosen,
      vtAfter: Array.from(VT),
      etAfter: [...ET],
      runningWeight,
    });

    const historySnapshot = [...history];

    // Special Slide 44 Note on Iter 5 of Slide Ex 01
    const slide44Note =
      isSlideEx1 && iter === 5
        ? ` (Note on Lecture 16 Slide 44: To connect the final vertex 'd' to V_T = {a, b, c, f, e}, the three candidate edges are (f,d)=5, (c,d)=6, and (e,d)=8. The true mathematical minimum is (f,d)=5 giving Total MST Weight = 15, which matches Kruskal Lecture 17 Slide 36! Slide 44's diagram accidentally highlighted (e,d)=8.)`
        : '';

    steps.push({
      stepNumber: stepNum++,
      codeLine: 9,
      title: `Iteration ${iter} of ${nodes.length - 1}: Pick Min Cut Edge e* = (${chosen.from}, ${chosen.to}) with Weight ${chosen.weight}`,
      explanation: `Among all candidate edges connecting V_T = {${vtBefore.join(', ')}} to V - V_T = {${remainingBefore.join(', ')}} — namely ${candidates
        .map((c) => `(${c.from},${c.to})=${c.weight}`)
        .join(', ')} — the minimum-weight edge is e* = (${chosen.from}, ${chosen.to}) with weight ${chosen.weight}. We add vertex u* = '${chosen.to}' to V_T and edge (${chosen.from}, ${chosen.to}) to E_T.${slide44Note}`,
      formula: `e* = min { ${candidates.map((c) => `(${c.from},${c.to}):${c.weight}`).join(', ')} } = (${chosen.from}, ${chosen.to}) [w = ${chosen.weight}]`,
      variables: {
        Iteration: `${iter} / ${nodes.length - 1}`,
        'Selected e*': `(${chosen.from}, ${chosen.to}) = ${chosen.weight}`,
        'Added Vertex u*': chosen.to,
        V_T: `{${Array.from(VT).join(', ')}}`,
        'Total Weight': runningWeight,
      },
      graphView: buildGraphView(VT, ET, chosen, chosen.to),
      tables: [
        {
          id: 'prim-execution-history',
          title: `Prim's Algorithm Execution Trace Table (Iterations 1..${iter})`,
          subtitle: `Tracks V_T, Cut Candidates (v ∈ V_T, u ∈ V - V_T), Chosen Minimum Edge e*, and Cumulative MST Weight`,
          colHeaders: [
            'Iter i',
            'Tree Vertices V_T (Before)',
            'Candidate Cut Edges (v ∈ V_T, u ∈ V - V_T)',
            'Selected Min Edge e* = (v*, u*)',
            'Edge Weight',
            'Updated V_T (After)',
            'Cumulative Weight',
          ],
          rows: historySnapshot.map((h, idx) => {
            const isCurr = idx === historySnapshot.length - 1;
            return [
              { value: h.iter, state: isCurr ? 'active' : 'computed' },
              { value: `{${h.vtBefore.join(', ')}}`, state: 'default' },
              {
                value: h.candidates.map((c) => `(${c.from},${c.to}):${c.weight}`).join(', '),
                state: isCurr ? 'compare' : 'default',
              },
              {
                value: `(${h.chosen.from}, ${h.chosen.to})`,
                state: isCurr ? 'path' : 'match',
                editableKey: `prim-edge-${h.iter}`,
                expectedValue: `${h.chosen.from},${h.chosen.to}`,
                mistakeExplanation: `At iteration ${h.iter}, the lightest edge crossing the cut from {${h.vtBefore.join(', ')}} is (${h.chosen.from}, ${h.chosen.to}) with weight ${h.chosen.weight}.`,
              },
              {
                value: h.chosen.weight,
                state: isCurr ? 'path' : 'match',
                editableKey: `prim-weight-${h.iter}`,
                expectedValue: h.chosen.weight,
                mistakeExplanation: `The minimum weight among [${h.candidates.map((c) => c.weight).join(', ')}] is ${h.chosen.weight}.`,
              },
              { value: `{${h.vtAfter.join(', ')}}`, state: isCurr ? 'active' : 'computed' },
              { value: h.runningWeight, state: isCurr ? 'path' : 'computed' },
            ];
          }),
        },
        fringeSnapshotTable,
      ],
    });
  }

  // Final Step: Complete MST Summary
  const finalTotalWeight = ET.reduce((acc, item) => acc + item.weight, 0);
  steps.push({
    stepNumber: stepNum++,
    codeLine: 11,
    title: `MST Complete: |V| - 1 = ${ET.length} Edges Selected (Total Minimum Weight = ${finalTotalWeight})`,
    explanation: `All ${nodes.length} vertices are now in V_T = {${Array.from(VT).join(', ')}}. Prim's algorithm returns E_T = {${ET.map((e) => `(${e.from},${e.to})`).join(', ')}} with Total Minimum Spanning Tree Weight = ${ET.map((e) => e.weight).join(' + ')} = ${finalTotalWeight}.`,
    formula: `Total MST Weight = ${ET.map((e) => `${e.weight}`).join(' + ')} = ${finalTotalWeight}`,
    outputString: `Minimum Spanning Tree E_T = { ${ET.map((e) => `(${e.from},${e.to}):${e.weight}`).join(', ')} }  |  Total Weight = ${finalTotalWeight}`,
    variables: {
      '|V|': nodes.length,
      '|E_T|': ET.length,
      'Total MST Weight': finalTotalWeight,
    },
    graphView: buildGraphView(VT, ET),
    tables: [
      {
        id: 'prim-execution-history',
        title: `Complete Prim's MST Trace Summary (Total Weight = ${finalTotalWeight})`,
        colHeaders: [
          'Iter i',
          'Tree Vertices V_T (Before)',
          'Candidate Cut Edges (v ∈ V_T, u ∈ V - V_T)',
          'Selected Min Edge e* = (v*, u*)',
          'Edge Weight',
          'Updated V_T (After)',
          'Cumulative Weight',
        ],
        rows: history.map((h) => [
          { value: h.iter, state: 'computed' },
          { value: `{${h.vtBefore.join(', ')}}`, state: 'default' },
          {
            value: h.candidates.map((c) => `(${c.from},${c.to}):${c.weight}`).join(', '),
            state: 'default',
          },
          {
            value: `(${h.chosen.from}, ${h.chosen.to})`,
            state: 'path',
            editableKey: `prim-edge-${h.iter}`,
            expectedValue: `${h.chosen.from},${h.chosen.to}`,
            mistakeExplanation: `Lightest cut edge at iteration ${h.iter} is (${h.chosen.from}, ${h.chosen.to}) with weight ${h.chosen.weight}.`,
          },
          {
            value: h.chosen.weight,
            state: 'path',
            editableKey: `prim-weight-${h.iter}`,
            expectedValue: h.chosen.weight,
            mistakeExplanation: `Weight of (${h.chosen.from}, ${h.chosen.to}) is ${h.chosen.weight}.`,
          },
          { value: `{${h.vtAfter.join(', ')}}`, state: 'computed' },
          { value: h.runningWeight, state: 'path' },
        ]),
      },
    ],
  });

  return steps;
}

// ============================================================================
// 21. KRUSKAL'S ALGORITHM FOR MINIMUM SPANNING TREE (Lecture 17)
// ============================================================================
export function generateKruskalSteps(edgesStr: string): TraceStep[] {
  const { nodes, edges } = parseEdgesInput(edgesStr);
  const nodePositions = getGraphNodePositions(nodes, edges);

  // Normalize each edge so u < v alphabetically (matching slide notation bc, ef, ab, bf, cf...)
  const normalizedEdges = edges.map((e, idx) => {
    const [u, v] = e.u <= e.v ? [e.u, e.v] : [e.v, e.u];
    return { u, v, w: e.w, origIdx: idx };
  });

  // Sort edges in nondecreasing order of weight, then alphabetically by (u, v)
  const sortedEdges = [...normalizedEdges].sort(
    (a, b) => a.w - b.w || a.u.localeCompare(b.u) || a.v.localeCompare(b.v)
  );

  // Disjoint-Set (Union-Find) with component sets tracking
  const parent: Record<string, string> = {};
  nodes.forEach((n) => {
    parent[n] = n;
  });

  const find = (x: string): string => {
    let curr = x;
    while (parent[curr] !== curr) {
      curr = parent[curr];
    }
    return curr;
  };

  const getComponentsList = (): string[][] => {
    const groups: Record<string, string[]> = {};
    nodes.forEach((n) => {
      const r = find(n);
      if (!groups[r]) groups[r] = [];
      groups[r].push(n);
    });
    return Object.values(groups).map((g) => g.sort());
  };

  const getComponentOf = (x: string): string[] => {
    const r = find(x);
    return nodes.filter((n) => find(n) === r).sort();
  };

  interface EdgeStatusRecord {
    k: number;
    u: string;
    v: string;
    w: number;
    status: 'accepted' | 'rejected' | 'pending';
    compU: string;
    compV: string;
    reason: string;
    ecounterAfter: number;
  }

  const edgeStatusList: EdgeStatusRecord[] = sortedEdges.map((e, idx) => ({
    k: idx + 1,
    u: e.u,
    v: e.v,
    w: e.w,
    status: 'pending',
    compU: '-',
    compV: '-',
    reason: 'Pending in sorted queue',
    ecounterAfter: 0,
  }));

  const buildGraphView = (
    activeEdgeIdx?: number,
    activeDecision?: 'accepted' | 'rejected'
  ) => {
    const compList = getComponentsList();
    const nodeStates: Record<string, 'default' | 'in-tree' | 'active' | 'fringe' | 'source'> = {};
    const nodeBadges: Record<string, string> = {};

    const acceptedVertices = new Set<string>();
    edgeStatusList.forEach((es) => {
      if (es.status === 'accepted') {
        acceptedVertices.add(es.u);
        acceptedVertices.add(es.v);
      }
    });

    nodes.forEach((n) => {
      const comp = compList.find((c) => c.includes(n)) || [n];
      nodeBadges[n] = `{${comp.join(',')}}`;
      if (
        activeEdgeIdx !== undefined &&
        (sortedEdges[activeEdgeIdx].u === n || sortedEdges[activeEdgeIdx].v === n)
      ) {
        nodeStates[n] = 'active';
      } else if (acceptedVertices.has(n)) {
        nodeStates[n] = 'in-tree';
      } else {
        nodeStates[n] = 'default';
      }
    });

    const graphEdges: GraphEdgeView[] = sortedEdges.map((e, idx) => {
      const st = edgeStatusList[idx].status;
      const isCurrent = idx === activeEdgeIdx;
      return {
        from: e.u,
        to: e.v,
        weight: e.w,
        highlight: st === 'accepted' || isCurrent,
        state: isCurrent
          ? activeDecision === 'rejected'
            ? 'rejected'
            : 'selected'
          : st === 'accepted'
            ? 'tree'
            : st === 'rejected'
              ? 'rejected'
              : 'default',
      };
    });

    const acceptedEdges = edgeStatusList.filter((x) => x.status === 'accepted');
    const totalW = acceptedEdges.reduce((acc, x) => acc + x.w, 0);

    return {
      nodes,
      edges: graphEdges,
      directed: false,
      weighted: true,
      nodePositions,
      nodeStates,
      nodeBadges,
      vtLabel: `Forest Components (${compList.length}): ${compList.map((c) => `{${c.join(',')}}`).join('  ')}`,
      etLabel:
        acceptedEdges.length > 0
          ? `E_T (${acceptedEdges.length}/${nodes.length - 1}) = {${acceptedEdges.map((x) => `(${x.u},${x.v}):${x.w}`).join(', ')}}`
          : 'E_T = ∅ (ecounter = 0)',
      totalWeight: totalW,
      caption:
        'Green/Cyan Solid Edges = Accepted into E_T | Red Dashed Edges = Rejected (Cycle Created!)',
    };
  };

  const buildSortedEdgesTable = (activeK?: number): VisualTable => ({
    id: 'kruskal-sorted-edges',
    title: `Sorted Edges Table & Acyclicity Checks (Lecture 17 Slides 17–42 & 46–81)`,
    subtitle: `Edges sorted in nondecreasing order of weight; stops as soon as ecounter reaches |V| - 1 = ${nodes.length - 1}`,
    colHeaders: [
      'Order k',
      'Edge (u, v)',
      'Weight w',
      'Component of u',
      'Component of v',
      'Acyclicity Decision (E_T ∪ {e} acyclic?)',
      'ecounter',
    ],
    rows: edgeStatusList.map((es) => {
      const isCurr = es.k === activeK;
      const rowState: TableCellData['state'] =
        es.status === 'accepted'
          ? isCurr
            ? 'path'
            : 'match'
          : es.status === 'rejected'
            ? 'mismatch'
            : 'unvisited';

      return [
        { value: es.k, state: isCurr ? 'active' : 'default' },
        { value: `(${es.u}, ${es.v})`, state: rowState },
        { value: es.w, state: rowState },
        { value: es.compU, state: 'default' },
        { value: es.compV, state: 'default' },
        {
          value: es.reason,
          state: rowState,
          editableKey: es.status !== 'pending' ? `kruskal-decision-${es.k}` : undefined,
          expectedValue: es.status === 'accepted' ? 'accept' : 'reject',
          mistakeExplanation:
            es.status === 'accepted'
              ? `Vertices ${es.u} ∈ ${es.compU} and ${es.v} ∈ ${es.compV} are in DIFFERENT components, so (${es.u}, ${es.v}) is acyclic (accept).`
              : `Vertices ${es.u} and ${es.v} are ALREADY in the same component ${es.compU}, so adding (${es.u}, ${es.v}) creates a cycle (reject).`,
        },
        {
          value: es.status === 'pending' ? '-' : es.ecounterAfter,
          state: isCurr ? 'active' : 'computed',
        },
      ];
    }),
  });

  const steps: TraceStep[] = [];
  let stepNum = 1;

  // Step 1: Sort all edges in nondecreasing order of weights
  steps.push({
    stepNumber: stepNum++,
    codeLine: 4,
    title: `Step 1: Sort All |E| = ${sortedEdges.length} Edges by Weight & Initialize Forest`,
    explanation: `Kruskal's algorithm first sorts all ${sortedEdges.length} edges in nondecreasing order of weight: ${sortedEdges
      .map((e) => `(${e.u},${e.v}):${e.w}`)
      .join(', ')}. Initialize E_T ← ∅, ecounter ← 0, k ← 0, and place each of the ${nodes.length} vertices in its own isolated component: ${nodes.map((n) => `{${n}}`).join(', ')}.`,
    formula: `Sorted E: ${sortedEdges.map((e) => `${e.u}${e.v}(${e.w})`).join(' ≤ ')}`,
    variables: {
      '|V|': nodes.length,
      '|E|': sortedEdges.length,
      ecounter: `0 / ${nodes.length - 1}`,
      Components: nodes.length,
    },
    graphView: buildGraphView(),
    tables: [buildSortedEdgesTable()],
  });

  // Step through sorted edges until ecounter == |V| - 1
  let ecounter = 0;
  for (let idx = 0; idx < sortedEdges.length; idx++) {
    if (ecounter >= nodes.length - 1) break;

    const e = sortedEdges[idx];
    const k = idx + 1;
    const compUArr = getComponentOf(e.u);
    const compVArr = getComponentOf(e.v);
    const compUStr = `{${compUArr.join(', ')}}`;
    const compVStr = `{${compVArr.join(', ')}}`;
    const rootU = find(e.u);
    const rootV = find(e.v);
    const isAcyclic = rootU !== rootV;

    if (isAcyclic) {
      parent[rootV] = rootU;
      ecounter++;
      edgeStatusList[idx] = {
        k,
        u: e.u,
        v: e.v,
        w: e.w,
        status: 'accepted',
        compU: compUStr,
        compV: compVStr,
        reason: `✓ Accepted — Merges ${compUStr} ∪ ${compVStr}`,
        ecounterAfter: ecounter,
      };
    } else {
      edgeStatusList[idx] = {
        k,
        u: e.u,
        v: e.v,
        w: e.w,
        status: 'rejected',
        compU: compUStr,
        compV: compVStr,
        reason: `✗ Cycle Created (Skipped) — Both ${e.u}, ${e.v} ∈ ${compUStr}`,
        ecounterAfter: ecounter,
      };
    }

    const updatedComps = getComponentsList();

    steps.push({
      stepNumber: stepNum++,
      codeLine: isAcyclic ? 10 : 9,
      title: isAcyclic
        ? `Edge k = ${k}: Test (${e.u}, ${e.v}) [w = ${e.w}] → Acyclic ✓ (Accept #${ecounter} of ${nodes.length - 1})`
        : `Edge k = ${k}: Test (${e.u}, ${e.v}) [w = ${e.w}] → Cycle Created ✗ (Skip Edge!)`,
      explanation: isAcyclic
        ? `Inspect edge #${k} (${e.u}, ${e.v}) with weight ${e.w}: Vertex '${e.u}' belongs to component ${compUStr} and vertex '${e.v}' belongs to component ${compVStr}. Since they are in different trees (Find(${e.u}) ≠ Find(${e.v})), adding (${e.u}, ${e.v}) does NOT create a cycle. We add (${e.u}, ${e.v}) to E_T, increment ecounter ← ${ecounter}, and merge their components into {${getComponentOf(e.u).join(', ')}}.`
        : `Inspect edge #${k} (${e.u}, ${e.v}) with weight ${e.w}: Both '${e.u}' and '${e.v}' ALREADY belong to the same connected component ${compUStr} (Find(${e.u}) == Find(${e.v})). Adding (${e.u}, ${e.v}) would form a cycle in E_T! Therefore, Kruskal skips (${e.u}, ${e.v}) and leaves ecounter = ${ecounter}.`,
      formula: isAcyclic
        ? `Find(${e.u}) = ${compUStr} ≠ Find(${e.v}) = ${compVStr}  ⇒  E_T ← E_T ∪ {(${e.u},${e.v})},  ecounter = ${ecounter}`
        : `Find(${e.u}) == Find(${e.v}) = ${compUStr}  ⇒  Cycle Created! Reject (${e.u},${e.v})`,
      variables: {
        k,
        'Tested Edge': `(${e.u}, ${e.v}) [w=${e.w}]`,
        Decision: isAcyclic ? 'ACCEPTED ✓' : 'CYCLE — SKIPPED ✗',
        ecounter: `${ecounter} / ${nodes.length - 1}`,
        'Forest Trees': updatedComps.length,
      },
      graphView: buildGraphView(idx, isAcyclic ? 'accepted' : 'rejected'),
      tables: [
        buildSortedEdgesTable(k),
        {
          id: 'kruskal-components-state',
          title: `Current Connected Components (Disjoint Sets in Forest)`,
          colHeaders: updatedComps.map((_, cIdx) => `Tree Component #${cIdx + 1}`),
          rows: [
            updatedComps.map((comp) => ({
              value: `{ ${comp.join(', ')} }`,
              state: comp.includes(e.u) ? (isAcyclic ? 'match' : 'mismatch') : 'computed',
            })),
          ],
        },
      ],
    });
  }

  // Final Step: Return E_T
  const accepted = edgeStatusList.filter((x) => x.status === 'accepted');
  const rejected = edgeStatusList.filter((x) => x.status === 'rejected');
  const totalWeight = accepted.reduce((acc, x) => acc + x.w, 0);

  steps.push({
    stepNumber: stepNum++,
    codeLine: 11,
    title: `MST Complete: ecounter = |V| - 1 = ${accepted.length} Edges Accepted (Total Weight = ${totalWeight})`,
    explanation: `Since ecounter has reached |V| - 1 = ${nodes.length - 1}, the while-loop terminates immediately without needing to inspect the remaining heavier edges. Kruskal's algorithm returns E_T = {${accepted
      .map((x) => `(${x.u},${x.v}):${x.w}`)
      .join(', ')}} with Total Minimum Spanning Tree Weight = ${accepted.map((x) => x.w).join(' + ')} = ${totalWeight}. (${rejected.length} edge(s) were skipped due to cycle creation: ${
      rejected.length > 0 ? rejected.map((x) => `(${x.u},${x.v}):${x.w}`).join(', ') : 'None'
    }).`,
    formula: `Total MST Weight = ${accepted.map((x) => x.w).join(' + ')} = ${totalWeight}`,
    outputString: `Minimum Spanning Tree E_T = { ${accepted.map((x) => `(${x.u},${x.v}):${x.w}`).join(', ')} }  |  Total Weight = ${totalWeight}`,
    variables: {
      '|V|': nodes.length,
      'Accepted |E_T|': accepted.length,
      'Skipped (Cycles)': rejected.length,
      'Total MST Weight': totalWeight,
    },
    graphView: buildGraphView(),
    tables: [buildSortedEdgesTable()],
  });

  return steps;
}

// ============================================================================
// 22. DIJKSTRA'S ALGORITHM FOR SINGLE-SOURCE SHORTEST PATHS (Lecture 18)
// ============================================================================
export function generateDijkstraSteps(
  edgesStr: string,
  sourceStr: string,
  directedStr: string
): TraceStep[] {
  const { nodes, edges } = parseEdgesInput(edgesStr);
  const source = nodes.includes(sourceStr.trim()) ? sourceStr.trim() : nodes[0];
  const isDirected = directedStr.trim().toLowerCase() === 'true';
  const nodePositions = getGraphNodePositions(nodes, edges);

  const dist: Record<string, number> = {};
  const parent: Record<string, string | null> = {};
  nodes.forEach((v) => {
    dist[v] = v === source ? 0 : Infinity;
    parent[v] = null;
  });

  const VT = new Set<string>();

  const formatLabel = (v: string, dMap = dist, pMap = parent): string => {
    const dStr = dMap[v] === Infinity ? '∞' : String(dMap[v]);
    const pStr = pMap[v] ?? '-';
    return `${v}(${pStr}, ${dStr})`;
  };

  const formatQueueString = (currentVT: Set<string>, dMap = dist, pMap = parent): string => {
    const rem = nodes.filter((v) => !currentVT.has(v));
    // Sort by distance then vertex name (or keep slide order)
    rem.sort((a, b) => dMap[a] - dMap[b] || a.localeCompare(b));
    if (rem.length === 0) return '∅ (Empty)';
    return `{ ${rem.map((v) => formatLabel(v, dMap, pMap)).join(', ')} }`;
  };

  interface DijkstraIterSnapshot {
    iterLabel: string;
    extractedU: string;
    vtList: string[];
    qStr: string;
    distSnapshot: Record<string, number>;
    parentSnapshot: Record<string, string | null>;
    relaxNotes: string[];
  }

  const snapshots: DijkstraIterSnapshot[] = [];
  const steps: TraceStep[] = [];
  let stepNum = 1;

  const buildGraphView = (
    currentVT: Set<string>,
    activeU?: string,
    relaxedNeighbors: string[] = []
  ) => {
    const nodeStates: Record<string, 'default' | 'in-tree' | 'active' | 'fringe' | 'source'> = {};
    const nodeBadges: Record<string, string> = {};

    nodes.forEach((v) => {
      const dStr = dist[v] === Infinity ? '∞' : String(dist[v]);
      const pStr = parent[v] ?? '-';
      nodeBadges[v] = `(${pStr}, ${dStr})`;

      if (v === activeU) {
        nodeStates[v] = 'active';
      } else if (currentVT.has(v)) {
        nodeStates[v] = v === source ? 'source' : 'in-tree';
      } else if (dist[v] < Infinity) {
        nodeStates[v] = 'fringe';
      } else {
        nodeStates[v] = 'default';
      }
    });

    const graphEdges: GraphEdgeView[] = edges.map((e) => {
      const isTreeEdge =
        (parent[e.v] === e.u && (currentVT.has(e.v) || dist[e.v] < Infinity)) ||
        (!isDirected && parent[e.u] === e.v && (currentVT.has(e.u) || dist[e.u] < Infinity));

      const isRelaxedNow =
        (activeU === e.u && relaxedNeighbors.includes(e.v)) ||
        (!isDirected && activeU === e.v && relaxedNeighbors.includes(e.u));

      return {
        from: e.u,
        to: e.v,
        weight: e.w,
        highlight: isTreeEdge || isRelaxedNow,
        state: isRelaxedNow ? 'selected' : isTreeEdge ? 'tree' : 'default',
      };
    });

    return {
      nodes,
      edges: graphEdges,
      directed: isDirected,
      weighted: true,
      nodePositions,
      nodeStates,
      nodeBadges,
      vtLabel: `V_T = {${Array.from(currentVT).join(', ')}}`,
      queueLabel: `Q = ${formatQueueString(currentVT)}`,
      caption:
        'Node Badge = (p_v, d_v) | Green/Cyan Edges = Current Shortest-Path Tree Edges (p_v → v)',
    };
  };

  const buildTraceTables = (currentSnapshots: DijkstraIterSnapshot[]): VisualTable[] => {
    return [
      {
        id: 'dijkstra-slide-queue-table',
        title: `Slide Priority Queue & V_T Trace Table (Lecture 18 Slides 15–35 Format)`,
        subtitle: `Shows Tree Vertices V_T, Extracted u* ← DeleteMin(Q), Relaxation Checks, and Priority Queue Q = { v(p_v, d_v) }`,
        colHeaders: [
          'Step / Iter',
          'Extracted u*',
          'Tree Vertices V_T',
          'Priority Queue Q = { v(parent, d_v) }',
          'Edge Relaxations Performed (d_{u*} + w(u*, u) < d_u)',
        ],
        rows: currentSnapshots.map((s, idx) => {
          const isCurr = idx === currentSnapshots.length - 1;
          return [
            { value: s.iterLabel, state: isCurr ? 'active' : 'computed' },
            { value: s.extractedU, state: isCurr ? 'path' : 'match' },
            { value: `{ ${s.vtList.join(', ')} }`, state: isCurr ? 'active' : 'computed' },
            { value: s.qStr, state: isCurr ? 'compare' : 'default' },
            {
              value: s.relaxNotes.length > 0 ? s.relaxNotes.join('  |  ') : 'None',
              state: isCurr ? 'match' : 'default',
            },
          ];
        }),
      },
      {
        id: 'dijkstra-matrix-table',
        title: `Vertex Distance & Predecessor Matrix (p_v, d_v) Across Iterations`,
        subtitle: `Each cell shows (parent p_v, distance d_v); ★ marks vertices finalized in V_T`,
        colHeaders: ['Iteration', 'V_T', ...nodes.map((v) => `Vertex ${v}`)],
        rows: currentSnapshots.map((s, rIdx) => {
          const isCurr = rIdx === currentSnapshots.length - 1;
          return [
            { value: s.iterLabel, state: isCurr ? 'active' : 'computed' },
            { value: `{${s.vtList.join(',')}}`, state: 'default' },
            ...nodes.map((v) => {
              const dVal = s.distSnapshot[v];
              const pVal = s.parentSnapshot[v] ?? '-';
              const inVT = s.vtList.includes(v);
              const dStr = dVal === Infinity ? '∞' : String(dVal);
              return {
                value: `(${pVal}, ${dStr})`,
                subText: inVT ? '∈ V_T ★' : undefined,
                state:
                  inVT
                    ? 'path'
                    : dVal < Infinity
                      ? isCurr
                        ? 'compare'
                        : 'computed'
                      : 'unvisited',
                editableKey:
                  rIdx === currentSnapshots.length - 1 && rIdx > 0
                    ? `dijkstra-dist-${rIdx}-${v}`
                    : undefined,
                expectedValue: dStr,
                mistakeExplanation: `For vertex ${v}, the shortest distance from ${source} at ${s.iterLabel} is d_${v} = ${dStr} via parent p_${v} = ${pVal}.`,
              } as TableCellData;
            }),
          ];
        }),
      },
    ];
  };

  // Step 0: Initialization
  snapshots.push({
    iterLabel: 'Init',
    extractedU: '-',
    vtList: [],
    qStr: formatQueueString(VT),
    distSnapshot: { ...dist },
    parentSnapshot: { ...parent },
    relaxNotes: [`Initialize d_${source} = 0, and d_v = ∞ for all v ≠ ${source}`],
  });

  steps.push({
    stepNumber: stepNum++,
    codeLine: 7,
    title: `Step 1: Initialize Priority Queue Q with d_${source} = 0 and d_v = ∞`,
    explanation: `Initialize V_T ← ∅. For source vertex '${source}', set distance d_${source} = 0 and parent p_${source} = -. For all other vertices v ≠ '${source}', set d_v = ∞ and p_v = -. Insert all vertices into Priority Queue Q = ${formatQueueString(VT)}.`,
    formula: `V_T = ∅,   Q = ${formatQueueString(VT)}`,
    variables: {
      Source: source,
      V_T: '∅',
      'Min in Q': `${source}(-, 0)`,
    },
    graphView: buildGraphView(VT),
    tables: buildTraceTables([...snapshots]),
  });

  // Main loop: |V| iterations
  for (let iter = 1; iter <= nodes.length; iter++) {
    // Pick u* in V - VT with minimum dist[u*]
    const remaining = nodes.filter((v) => !VT.has(v));
    remaining.sort((a, b) => dist[a] - dist[b] || a.localeCompare(b));
    const uStar = remaining[0];
    if (!uStar || dist[uStar] === Infinity) break;

    VT.add(uStar);
    const relaxNotes: string[] = [];
    const updatedNeighbors: string[] = [];

    // Find all neighbors u of uStar in V - VT
    const adj: { u: string; w: number }[] = [];
    for (const e of edges) {
      if (e.u === uStar && !VT.has(e.v)) {
        adj.push({ u: e.v, w: e.w });
      } else if (!isDirected && e.v === uStar && !VT.has(e.u)) {
        adj.push({ u: e.u, w: e.w });
      }
    }
    adj.sort((a, b) => a.u.localeCompare(b.u));

    for (const { u, w } of adj) {
      const oldD = dist[u];
      const oldDStr = oldD === Infinity ? '∞' : String(oldD);
      const newD = dist[uStar] + w;
      if (newD < oldD) {
        dist[u] = newD;
        parent[u] = uStar;
        updatedNeighbors.push(u);
        relaxNotes.push(
          `${u}: ${dist[uStar]} + ${w} = ${newD} < ${oldDStr} ✓ → ${u}(${uStar}, ${newD})`
        );
      } else {
        relaxNotes.push(
          `${u}: ${dist[uStar]} + ${w} = ${newD} ≥ ${oldDStr} ✗ (keep ${u}(${parent[u] ?? '-'}, ${oldDStr}))`
        );
      }
    }

    const extractedLabel = `${uStar}(${parent[uStar] ?? '-'}, ${dist[uStar]})`;
    snapshots.push({
      iterLabel: `Iter ${iter}`,
      extractedU: extractedLabel,
      vtList: Array.from(VT),
      qStr: formatQueueString(VT),
      distSnapshot: { ...dist },
      parentSnapshot: { ...parent },
      relaxNotes,
    });

    steps.push({
      stepNumber: stepNum++,
      codeLine: updatedNeighbors.length > 0 ? 15 : 11,
      title: `Iteration ${iter}: Extract u* = ${extractedLabel} ← DeleteMin(Q) & Relax Neighbors`,
      explanation: `DeleteMin(Q) extracts u* = '${uStar}' with minimum distance d_${uStar} = ${dist[uStar]} and adds it to V_T = {${Array.from(VT).join(', ')}}. ${
        adj.length > 0
          ? `We check all neighbors of '${uStar}' in V - V_T: ${relaxNotes.join('; ')}.`
          : `Vertex '${uStar}' has no remaining unvisited neighbors in V - V_T.`
      }`,
      formula:
        adj.length > 0
          ? relaxNotes.join('   |   ')
          : `u* = ${uStar} added to V_T;  Q = ${formatQueueString(VT)}`,
      variables: {
        Iteration: `${iter} / ${nodes.length}`,
        'u* (DeleteMin)': extractedLabel,
        V_T: `{${Array.from(VT).join(', ')}}`,
        'Updated in Q': updatedNeighbors.length > 0 ? updatedNeighbors.join(', ') : 'None',
      },
      graphView: buildGraphView(VT, uStar, updatedNeighbors),
      tables: buildTraceTables([...snapshots]),
    });
  }

  // Reconstruct full shortest paths from source to every vertex
  const getPathString = (target: string): string => {
    if (dist[target] === Infinity) return 'Unreachable';
    const chain: string[] = [];
    let curr: string | null = target;
    const guard = new Set<string>();
    while (curr && !guard.has(curr)) {
      guard.add(curr);
      chain.unshift(curr);
      curr = parent[curr];
    }
    return chain.join(' → ');
  };

  steps.push({
    stepNumber: stepNum++,
    codeLine: 16,
    title: `Dijkstra Complete: All Shortest Paths from Source '${source}' Finalized`,
    explanation: `Priority Queue Q is now empty and V_T = {${Array.from(VT).join(', ')}}. For every vertex v ∈ V, d_v gives the exact shortest path length from source '${source}' and p_v gives the penultimate vertex along that shortest path.`,
    formula: nodes.map((v) => `d(${source} → ${v}) = ${dist[v]}`).join('   |   '),
    outputString: `Shortest Distances from '${source}':  ${nodes
      .map((v) => `${v}: ${dist[v]} (${getPathString(v)})`)
      .join('   |   ')}`,
    variables: {
      Source: source,
      'Final V_T': `{${Array.from(VT).join(', ')}}`,
    },
    graphView: buildGraphView(VT),
    tables: [
      {
        id: 'dijkstra-final-paths',
        title: `Final Single-Source Shortest Paths from Source '${source}'`,
        subtitle: `Reconstructed by following penultimate pointers p_v backward from each destination v to '${source}'`,
        colHeaders: [
          'Destination Vertex v',
          `Shortest Distance d_v`,
          'Penultimate Vertex p_v',
          `Shortest Path from '${source}' to v`,
        ],
        rows: nodes.map((v) => [
          { value: v, state: v === source ? 'active' : 'path' },
          {
            value: dist[v] === Infinity ? '∞' : dist[v],
            state: 'path',
            editableKey: `dijkstra-final-d-${v}`,
            expectedValue: dist[v] === Infinity ? 'inf' : dist[v],
            mistakeExplanation: `Shortest path from ${source} to ${v} is ${getPathString(v)} with total weight ${dist[v]}.`,
          },
          { value: parent[v] ?? '-', state: 'computed' },
          { value: getPathString(v), state: 'match' },
        ]),
      },
      ...buildTraceTables(snapshots),
    ],
  });

  return steps;
}

// ============================================================================
// 23. HUFFMAN TREES AND CODES (Lecture 18 Slides 42–115)
// ============================================================================
export function generateHuffmanSteps(
  symbolsStr: string,
  encodeTextStr: string,
  decodeBitsStr: string
): TraceStep[] {
  // Parse symbol:weight pairs
  const rawPairs = symbolsStr
    .split(/[,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  interface SymbolEntry {
    symbol: string;
    weight: number;
    weightLabel: string;
  }

  const parsedSymbols: SymbolEntry[] = [];
  for (const part of rawPairs) {
    const m = part.match(/^([^\s:=]+)\s*[:=]\s*(\d+(?:\.\d+)?)$/);
    if (m) {
      const sym = m[1].trim();
      const w = Number(m[2]);
      if (sym && !Number.isNaN(w) && w > 0) {
        parsedSymbols.push({
          symbol: sym,
          weight: w,
          weightLabel: String(m[2].trim()),
        });
      }
    }
  }

  if (parsedSymbols.length < 2) {
    // Fallback to Lecture 18 Slide Example 01
    const fallback = [
      { symbol: 'A', weight: 0.35, weightLabel: '0.35' },
      { symbol: 'B', weight: 0.1, weightLabel: '0.1' },
      { symbol: 'C', weight: 0.2, weightLabel: '0.2' },
      { symbol: 'D', weight: 0.2, weightLabel: '0.2' },
      { symbol: '_', weight: 0.15, weightLabel: '0.15' },
    ];
    parsedSymbols.push(...fallback);
  }

  const n = parsedSymbols.length;
  const totalWeightSum = parsedSymbols.reduce((acc, s) => acc + s.weight, 0);
  const isDecimalProb = totalWeightSum <= 1.05;

  const formatWeight = (w: number): string => {
    if (isDecimalProb) {
      return Number(w.toFixed(4)).toString();
    }
    return Number(w.toFixed(2)).toString();
  };

  // Fixed-length code calculation (Lecture 18 Slides 60 & 76)
  const fixedBits = Math.max(1, Math.ceil(Math.log2(n)));
  const fixedCodesMap: Record<string, string> = {};
  parsedSymbols.forEach((s, idx) => {
    fixedCodesMap[s.symbol] = idx.toString(2).padStart(fixedBits, '0');
  });

  // Build Fixed-Length Binary Tree for visual comparison (Slides 60 & 76)
  const buildFixedLengthTree = (): HuffmanTreeNodeView => {
    const root: HuffmanTreeNodeView = {
      id: 'fixed-root',
      weight: totalWeightSum,
      weightLabel: formatWeight(totalWeightSum),
      highlight: 'default',
    };
    parsedSymbols.forEach((s) => {
      const code = fixedCodesMap[s.symbol];
      let curr = root;
      for (let i = 0; i < code.length; i++) {
        const bit = code[i];
        const isLeaf = i === code.length - 1;
        if (bit === '0') {
          if (!curr.left) {
            curr.left = {
              id: `fixed-${s.symbol}-${i}-L`,
              weight: isLeaf ? s.weight : 0,
              weightLabel: isLeaf ? s.weightLabel : '',
              symbol: isLeaf ? s.symbol : undefined,
              code: isLeaf ? code : undefined,
              highlight: 'default',
            };
          }
          curr = curr.left;
        } else {
          if (!curr.right) {
            curr.right = {
              id: `fixed-${s.symbol}-${i}-R`,
              weight: isLeaf ? s.weight : 0,
              weightLabel: isLeaf ? s.weightLabel : '',
              symbol: isLeaf ? s.symbol : undefined,
              code: isLeaf ? code : undefined,
              highlight: 'default',
            };
          }
          curr = curr.right;
        }
      }
    });
    return root;
  };

  const fixedTree = buildFixedLengthTree();

  // Deep clone helper for HuffmanTreeNodeView
  const cloneTree = (
    node: HuffmanTreeNodeView | null | undefined,
    highlightOverride?: HuffmanTreeNodeView['highlight']
  ): HuffmanTreeNodeView | null => {
    if (!node) return null;
    return {
      ...node,
      highlight: highlightOverride ?? 'default',
      left: cloneTree(node.left, 'default'),
      right: cloneTree(node.right, 'default'),
    };
  };

  // Initialize n one-node trees
  interface QueueTreeItem {
    node: HuffmanTreeNodeView;
    orderTieBreak: number;
  }

  const initialUnsortedQueue: HuffmanTreeNodeView[] = parsedSymbols.map((s, idx) => ({
    id: `leaf-${idx}-${s.symbol}`,
    weight: s.weight,
    weightLabel: s.weightLabel,
    symbol: s.symbol,
    highlight: 'default',
  }));

  let tieCounter = 1;
  let queue: QueueTreeItem[] = initialUnsortedQueue.map((node) => ({
    node: cloneTree(node)!,
    orderTieBreak: tieCounter++,
  }));

  const sortQueue = (q: QueueTreeItem[]) => {
    q.sort((a, b) => {
      const diff = Number((a.node.weight - b.node.weight).toFixed(6));
      if (diff !== 0) return diff;
      return a.orderTieBreak - b.orderTieBreak;
    });
  };

  const steps: TraceStep[] = [];
  let stepNum = 1;

  // Step 1: Fixed-Length Encoding Baseline & Unsorted Initial Trees
  steps.push({
    stepNumber: stepNum++,
    codeLine: 1,
    title: `Step 1: Fixed-Length Baseline (${fixedBits} Bits/Symbol) & Initialize ${n} One-Node Trees`,
    explanation: `Given ${n} alphabet symbols (${parsedSymbols.map((s) => `${s.symbol}:${s.weightLabel}`).join(', ')}), Fixed-Length Encoding requires ⌈log₂(${n})⌉ = ${fixedBits} bits per symbol (e.g., ${parsedSymbols
      .map((s) => `${s.symbol}=${fixedCodesMap[s.symbol]}`)
      .join(', ')}). To compress this using Huffman's Variable-Length Prefix Coding, we initialize ${n} one-node trees labeled with each symbol and its weight.`,
    formula: `L_fixed = ⌈log₂(${n})⌉ = ${fixedBits} bits/symbol   |   Initial Forest = ${n} one-node trees`,
    variables: {
      'Alphabet Size n': n,
      'Fixed-Length Bits': `${fixedBits} bits/symbol`,
      'Total Weight': formatWeight(totalWeightSum),
    },
    huffmanView: {
      phase: 'init',
      forestQueue: initialUnsortedQueue.map((nd) => cloneTree(nd)!),
      fixedLengthTree: fixedTree,
    },
    tables: [
      {
        id: 'huffman-init-table',
        title: `Input Alphabet Frequencies & Fixed-Length (${fixedBits}-Bit) Encoding Baseline`,
        colHeaders: parsedSymbols.map((s) => `Symbol '${s.symbol}'`),
        rowHeaders: ['Weight / Frequency', `Fixed-Length Code (${fixedBits} bits)`],
        rows: [
          parsedSymbols.map((s) => ({ value: s.weightLabel, state: 'active' })),
          parsedSymbols.map((s) => ({ value: fixedCodesMap[s.symbol], state: 'computed' })),
        ],
      },
    ],
  });

  // Step 2: Sort Priority Queue Q in nondecreasing order of weight
  sortQueue(queue);
  const sortedInitialSnap = queue.map((item, idx) =>
    cloneTree(item.node, idx < 2 ? 'active' : 'default')!
  );

  steps.push({
    stepNumber: stepNum++,
    codeLine: 3,
    title: `Step 2: Sort All ${n} Trees in Priority Queue Q by Weight (Nondecreasing)`,
    explanation: `Sort the ${n} one-node trees in nondecreasing order of weight: [ ${queue
      .map((item) => `${item.node.symbol ?? 'T'}(${item.node.weightLabel})`)
      .join(' ≤ ')} ]. The first two trees in Q — '${queue[0].node.symbol}' (${queue[0].node.weightLabel}) and '${queue[1].node.symbol}' (${queue[1].node.weightLabel}) — have the smallest weights and will be merged first.`,
    formula: `Q₀ = [ ${queue.map((item) => `${item.node.symbol}:${item.node.weightLabel}`).join(', ')} ]`,
    variables: {
      '|Q|': queue.length,
      'Smallest T_L': `${queue[0].node.symbol} (${queue[0].node.weightLabel})`,
      'Second Smallest T_R': `${queue[1].node.symbol} (${queue[1].node.weightLabel})`,
    },
    huffmanView: {
      phase: 'sort',
      forestQueue: sortedInitialSnap,
      mergingPairIds: [sortedInitialSnap[0].id, sortedInitialSnap[1].id],
    },
    tables: [
      {
        id: 'huffman-queue-table',
        title: `Sorted Priority Queue Q (${queue.length} Trees)`,
        colHeaders: queue.map((_, idx) => `Queue Pos #${idx + 1}`),
        rowHeaders: ['Symbol / Subtree', 'Tree Weight'],
        rows: [
          queue.map((item, idx) => ({
            value: item.node.symbol ? `'${item.node.symbol}'` : 'Subtree',
            state: idx < 2 ? 'compare' : 'default',
            subText: idx === 0 ? 'T_L (0)' : idx === 1 ? 'T_R (1)' : undefined,
          })),
          queue.map((item, idx) => ({
            value: item.node.weightLabel,
            state: idx < 2 ? 'compare' : 'default',
          })),
        ],
      },
    ],
  });

  // Helper to get leaf symbols inside a subtree
  const getSubtreeLeavesLabel = (nd: HuffmanTreeNodeView): string => {
    if (nd.symbol) return nd.symbol;
    const leftStr = nd.left ? getSubtreeLeavesLabel(nd.left) : '';
    const rightStr = nd.right ? getSubtreeLeavesLabel(nd.right) : '';
    return `(${leftStr},${rightStr})`;
  };

  interface MergeHistoryRow {
    mergeStep: number;
    leftLabel: string;
    rightLabel: string;
    combinedWeight: string;
    queueAfterStr: string;
  }

  const mergeHistory: MergeHistoryRow[] = [];

  // Perform n - 1 merges
  for (let mStep = 1; mStep <= n - 1; mStep++) {
    const leftItem = queue.shift()!;
    const rightItem = queue.shift()!;

    const combinedWeight = Number((leftItem.node.weight + rightItem.node.weight).toFixed(6));
    const combinedLabel = formatWeight(combinedWeight);
    const newId = `merge-${mStep}`;

    const newTreeNode: HuffmanTreeNodeView = {
      id: newId,
      weight: combinedWeight,
      weightLabel: combinedLabel,
      highlight: 'new-parent',
      left: cloneTree(leftItem.node, 'merged-child'),
      right: cloneTree(rightItem.node, 'merged-child'),
    };

    // In Lecture 18 Slide 69 (Example 01), when two trees tie in weight (e.g. (C,D)=0.4 after merging),
    // inserting with tie-break keeps existing items of equal weight ahead or places new combined node in sorted position.
    queue.push({
      node: newTreeNode,
      orderTieBreak: tieCounter++,
    });
    sortQueue(queue);

    const leftLeaves = getSubtreeLeavesLabel(leftItem.node);
    const rightLeaves = getSubtreeLeavesLabel(rightItem.node);
    const queueAfterStr = queue
      .map((item) => `${getSubtreeLeavesLabel(item.node)}:${item.node.weightLabel}`)
      .join(' ,  ');

    mergeHistory.push({
      mergeStep: mStep,
      leftLabel: `${leftLeaves} (${leftItem.node.weightLabel})`,
      rightLabel: `${rightLeaves} (${rightItem.node.weightLabel})`,
      combinedWeight: combinedLabel,
      queueAfterStr,
    });

    const queueVisualSnap = queue.map((item, idx) => {
      const cloned = cloneTree(
        item.node,
        item.node.id === newId ? 'new-parent' : idx < 2 && queue.length > 1 ? 'active' : 'default'
      )!;
      if (item.node.id === newId) {
        if (cloned.left) cloned.left.highlight = 'merged-child';
        if (cloned.right) cloned.right.highlight = 'merged-child';
      }
      return cloned;
    });

    const nextPairIds: [string, string] | undefined =
      queue.length >= 2 ? [queueVisualSnap[0].id, queueVisualSnap[1].id] : undefined;

    steps.push({
      stepNumber: stepNum++,
      codeLine: 8,
      title: `Merge ${mStep} of ${n - 1}: Combine ${leftLeaves}(${leftItem.node.weightLabel}) + ${rightLeaves}(${rightItem.node.weightLabel}) = ${combinedLabel}`,
      explanation: `Extract the two smallest-weight trees from Q: T_L = ${leftLeaves} (weight ${leftItem.node.weightLabel}, attached as Left child with edge 0) and T_R = ${rightLeaves} (weight ${rightItem.node.weightLabel}, attached as Right child with edge 1). Create a new parent root with combined weight ${leftItem.node.weightLabel} + ${rightItem.node.weightLabel} = ${combinedLabel} and re-insert it into sorted Priority Queue Q (${queue.length} tree${queue.length === 1 ? '' : 's'} remaining).`,
      formula: `weight(T_new) = ${leftItem.node.weightLabel} + ${rightItem.node.weightLabel} = ${combinedLabel}   |   Q = [ ${queueAfterStr} ]`,
      variables: {
        'Merge Step': `${mStep} / ${n - 1}`,
        'Left Child (0)': `${leftLeaves} (${leftItem.node.weightLabel})`,
        'Right Child (1)': `${rightLeaves} (${rightItem.node.weightLabel})`,
        'New Root Weight': combinedLabel,
        'Remaining |Q|': queue.length,
      },
      huffmanView: {
        phase: 'merge',
        forestQueue: queueVisualSnap,
        newMergedNodeId: newId,
        mergingPairIds: nextPairIds,
      },
      tables: [
        {
          id: 'huffman-merge-history',
          title: `Step-by-Step Huffman Tree Merge Log (Merges 1..${mStep})`,
          colHeaders: [
            'Merge #',
            'Left Child T_L (Edge 0)',
            'Right Child T_R (Edge 1)',
            'Combined Parent Weight',
            'Sorted Priority Queue Q After Re-Insertion',
          ],
          rows: mergeHistory.map((mh, idx) => {
            const isCurr = idx === mergeHistory.length - 1;
            return [
              { value: `Merge ${mh.mergeStep}`, state: isCurr ? 'active' : 'computed' },
              { value: mh.leftLabel, state: isCurr ? 'compare' : 'default' },
              { value: mh.rightLabel, state: isCurr ? 'compare' : 'default' },
              {
                value: mh.combinedWeight,
                state: isCurr ? 'path' : 'match',
                editableKey: `huffman-merge-w-${mh.mergeStep}`,
                expectedValue: mh.combinedWeight,
                mistakeExplanation: `Sum of the two smallest weights at Merge ${mh.mergeStep} is ${mh.combinedWeight}.`,
              },
              { value: mh.queueAfterStr, state: isCurr ? 'active' : 'default' },
            ];
          }),
        },
      ],
    });
  }

  // Extract final root tree and assign binary codewords (Left = 0, Right = 1)
  const finalRoot = cloneTree(queue[0].node, 'default')!;
  const huffmanCodesMap: Record<string, string> = {};

  const assignCodes = (node: HuffmanTreeNodeView | null | undefined, prefix: string) => {
    if (!node) return;
    if (node.symbol !== undefined) {
      const code = prefix || '0';
      node.code = code;
      huffmanCodesMap[node.symbol] = code;
    }
    assignCodes(node.left, prefix + '0');
    assignCodes(node.right, prefix + '1');
  };
  assignCodes(finalRoot, '');

  // Compute Expected / Average Bits per Symbol & Compression Ratio
  let avgBits = 0;
  const codewordDetails = parsedSymbols.map((s) => {
    const prob = s.weight / totalWeightSum;
    const hCode = huffmanCodesMap[s.symbol] || '0';
    const hLen = hCode.length;
    avgBits += prob * hLen;
    return {
      symbol: s.symbol,
      weightLabel: s.weightLabel,
      probability: Number(prob.toFixed(4)),
      huffmanCode: hCode,
      huffmanBits: hLen,
      fixedCode: fixedCodesMap[s.symbol],
      fixedBits,
    };
  });

  const avgBitsFormatted = Number(avgBits.toFixed(4)).toString();
  const compressionRatioVal = ((fixedBits - avgBits) / fixedBits) * 100;
  const compressionRatioFormatted = `${Number(compressionRatioVal.toFixed(2))}%`;

  const sumTermsStr = codewordDetails
    .map((c) => `${c.huffmanBits}×(${c.probability})`)
    .join(' + ');

  // Step n + 2: Codeword Extraction, Average Length & Compression Ratio
  steps.push({
    stepNumber: stepNum++,
    codeLine: 10,
    title: `Step ${n + 2}: Extract Prefix-Free Codewords & Compute Compression Ratio (${compressionRatioFormatted})`,
    explanation: `Label every left branch with 0 and every right branch with 1. Reading the root-to-leaf path for each symbol yields the optimal prefix-free Huffman codewords: ${codewordDetails
      .map((c) => `${c.symbol} = ${c.huffmanCode} (${c.huffmanBits} bits)`)
      .join(', ')}. The average codeword length is L_avg = ${sumTermsStr} = ${avgBitsFormatted} bits/symbol, compared to ${fixedBits} bits/symbol for fixed-length encoding — achieving a Compression Ratio of ((${fixedBits} - ${avgBitsFormatted}) / ${fixedBits}) × 100% = ${compressionRatioFormatted}!`,
    formula: `L_avg = ${sumTermsStr} = ${avgBitsFormatted} bits/symbol   |   Compression Ratio = ((${fixedBits} - ${avgBitsFormatted}) / ${fixedBits}) × 100% = ${compressionRatioFormatted}`,
    outputString: `Huffman Codes: ${codewordDetails.map((c) => `${c.symbol}=${c.huffmanCode}`).join(', ')}  |  L_avg = ${avgBitsFormatted} bits/symbol  |  Compression Ratio = ${compressionRatioFormatted}`,
    variables: {
      'L_avg (Huffman)': `${avgBitsFormatted} bits/symbol`,
      'L_fixed': `${fixedBits} bits/symbol`,
      'Compression Ratio': compressionRatioFormatted,
    },
    huffmanView: {
      phase: 'codes',
      forestQueue: [finalRoot],
      fixedLengthTree: fixedTree,
      codewords: codewordDetails,
      avgBitsPerSymbol: avgBitsFormatted,
      fixedBitsPerSymbol: fixedBits,
      compressionRatio: compressionRatioFormatted,
    },
    tables: [
      {
        id: 'huffman-codeword-table',
        title: `Huffman Variable-Length Codewords vs. Fixed-Length Encoding (Slides 75, 93, 103, 105)`,
        subtitle: `L_avg = ${avgBitsFormatted} bits/symbol vs. Fixed-Length = ${fixedBits} bits/symbol → Compression Ratio = ${compressionRatioFormatted}`,
        colHeaders: [
          'Symbol',
          'Frequency / Weight',
          'Probability pᵢ',
          `Fixed-Length Code (${fixedBits} bits)`,
          'Huffman Prefix Code',
          'Length lᵢ (bits)',
          'Weighted Length (lᵢ × pᵢ)',
        ],
        rows: codewordDetails.map((c) => [
          { value: `'${c.symbol}'`, state: 'active' },
          { value: c.weightLabel, state: 'default' },
          { value: c.probability, state: 'default' },
          { value: c.fixedCode, state: 'computed' },
          {
            value: c.huffmanCode,
            state: 'path',
            editableKey: `huffman-code-${c.symbol}`,
            expectedValue: c.huffmanCode,
            mistakeExplanation: `Follow the path from the root (0=Left, 1=Right) to leaf '${c.symbol}': codeword is ${c.huffmanCode}.`,
          },
          {
            value: c.huffmanBits,
            state: 'match',
            editableKey: `huffman-len-${c.symbol}`,
            expectedValue: c.huffmanBits,
            mistakeExplanation: `Codeword '${c.huffmanCode}' has length ${c.huffmanBits} bits.`,
          },
          {
            value: Number((c.huffmanBits * c.probability).toFixed(4)),
            state: 'computed',
          },
        ]),
      },
    ],
  });

  // Step n + 3: Encode & Decode Demonstration (Slides 84–92, 94–102, 114)
  const cleanEncodeText = encodeTextStr.trim();
  const cleanDecodeBits = decodeBitsStr.trim().replace(/\s+/g, '');

  // Lookup symbol case-insensitively if exact match not found
  const findSymbolCode = (ch: string): { symbol: string; code: string } | null => {
    if (huffmanCodesMap[ch] !== undefined) {
      return { symbol: ch, code: huffmanCodesMap[ch] };
    }
    const lower = ch.toLowerCase();
    const upper = ch.toUpperCase();
    if (huffmanCodesMap[lower] !== undefined) {
      return { symbol: lower, code: huffmanCodesMap[lower] };
    }
    if (huffmanCodesMap[upper] !== undefined) {
      return { symbol: upper, code: huffmanCodesMap[upper] };
    }
    return null;
  };

  const encodeSegments: { symbol: string; code: string }[] = [];
  for (const ch of cleanEncodeText.split('')) {
    const found = findSymbolCode(ch);
    if (found) {
      encodeSegments.push({ symbol: ch, code: found.code });
    }
  }
  const encodedBits = encodeSegments.map((s) => s.code).join('');

  // Decode bitstream by walking finalRoot from root to leaf
  const decodeSegments: { bits: string; symbol: string }[] = [];
  let currNode: HuffmanTreeNodeView | null | undefined = finalRoot;
  let currentBits = '';
  for (const bit of cleanDecodeBits.split('')) {
    if (bit !== '0' && bit !== '1') continue;
    currentBits += bit;
    currNode = bit === '0' ? currNode?.left : currNode?.right;
    if (currNode && currNode.symbol !== undefined) {
      decodeSegments.push({
        bits: currentBits,
        symbol: currNode.symbol,
      });
      currentBits = '';
      currNode = finalRoot;
    }
  }
  const decodedText = decodeSegments.map((s) => s.symbol).join('');

  if (encodeSegments.length > 0 || decodeSegments.length > 0) {
    const tables: VisualTable[] = [];

    if (encodeSegments.length > 0) {
      tables.push({
        id: 'huffman-encode-table',
        title: `Encoding Text "${cleanEncodeText}" → "${encodedBits}" (${encodedBits.length} bits vs. ${encodeSegments.length * fixedBits} fixed bits)`,
        subtitle: `Replaces each character with its variable-length Huffman codeword`,
        colHeaders: encodeSegments.map((s, idx) => `Char #${idx + 1}: '${s.symbol}'`),
        rowHeaders: ['Huffman Codeword', 'Bit Length'],
        rows: [
          encodeSegments.map((s, idx) => ({
            value: s.code,
            state: 'path',
            editableKey: `huffman-enc-${idx}`,
            expectedValue: s.code,
            mistakeExplanation: `Character '${s.symbol}' maps to Huffman codeword ${s.code}.`,
          })),
          encodeSegments.map((s) => ({
            value: `${s.code.length} bits`,
            state: 'computed',
          })),
        ],
      });
    }

    if (decodeSegments.length > 0) {
      tables.push({
        id: 'huffman-decode-table',
        title: `Prefix-Free Decoding of Bitstream "${cleanDecodeBits}" → "${decodedText}"`,
        subtitle: `Start at Root for each symbol: follow 0 (Left) and 1 (Right) until reaching a Leaf, output symbol, and reset to Root`,
        colHeaders: decodeSegments.map((_, idx) => `Decoded Symbol #${idx + 1}`),
        rowHeaders: ['Root-to-Leaf Bit Path', 'Reached Leaf Symbol'],
        rows: [
          decodeSegments.map((s) => ({
            value: s.bits,
            state: 'compare',
          })),
          decodeSegments.map((s, idx) => ({
            value: s.symbol,
            state: 'path',
            editableKey: `huffman-dec-${idx}`,
            expectedValue: s.symbol,
            mistakeExplanation: `Following bits '${s.bits}' from the root of the Huffman tree reaches leaf '${s.symbol}'.`,
          })),
        ],
      });
    }

    steps.push({
      stepNumber: stepNum++,
      codeLine: 10,
      title: `Step ${n + 3}: Live Text Encoding ("${cleanEncodeText}") & Prefix-Free Bitstream Decoding`,
      explanation: `Using the Huffman tree: (1) Encoding "${cleanEncodeText}" concatenates the codewords ${encodeSegments
        .map((s) => `${s.symbol}→${s.code}`)
        .join(', ')} into "${encodedBits}" (${encodedBits.length} bits total, saving ${
        encodeSegments.length * fixedBits - encodedBits.length
      } bits compared to ${encodeSegments.length * fixedBits} fixed-length bits). (2) Decoding "${cleanDecodeBits}" traverses from the root (0=Left, 1=Right) until hitting a leaf, uniquely partitioning the stream into ${decodeSegments
        .map((s) => `${s.bits}→'${s.symbol}'`)
        .join(', ')} = "${decodedText}"!`,
      formula: `Encode("${cleanEncodeText}") = ${encodedBits}   |   Decode("${cleanDecodeBits}") = "${decodedText}"`,
      outputString: `Encoded "${cleanEncodeText}" = ${encodedBits} (${encodedBits.length} bits)   |   Decoded "${cleanDecodeBits}" = "${decodedText}"`,
      variables: {
        'Encoded Bits': encodedBits || '-',
        'Decoded Text': decodedText || '-',
        'Compression Ratio': compressionRatioFormatted,
      },
      huffmanView: {
        phase: 'encode-decode',
        forestQueue: [finalRoot],
        codewords: codewordDetails,
        avgBitsPerSymbol: avgBitsFormatted,
        fixedBitsPerSymbol: fixedBits,
        compressionRatio: compressionRatioFormatted,
        encodeDemo:
          encodeSegments.length > 0
            ? {
                plainText: cleanEncodeText,
                segments: encodeSegments,
                encodedBits,
              }
            : undefined,
        decodeDemo:
          decodeSegments.length > 0
            ? {
                bitStream: cleanDecodeBits,
                segments: decodeSegments,
                decodedText,
              }
            : undefined,
      },
      tables,
    });
  }

  return steps;
}
