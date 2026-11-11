import type {
  TraceStep,
  VisualTable,
  TableCellData,
  GraphEdgeView,
  StateSpaceTreeNodeView,
} from '../types/algorithm';

function cell(
  value: string | number,
  state: TableCellData['state'] = 'default',
  subText?: string,
  tooltip?: string,
  editableKey?: string,
  expectedValue?: string | number,
  mistakeExplanation?: string
): TableCellData {
  return {
    value,
    state,
    subText,
    tooltip,
    editableKey,
    expectedValue,
    mistakeExplanation,
  };
}

function fmtNum(val: number): string {
  if (Math.abs(val) < 1e-9) return '0';
  if (Math.abs(val - Math.round(val)) < 1e-7) return String(Math.round(val));
  // Check common fractions (thirds, halves, quarters, fifths, sixths)
  for (const den of [2, 3, 4, 5, 6, 8, 10]) {
    const num = Math.round(val * den);
    if (Math.abs(val - num / den) < 1e-6) {
      return `${num}/${den} (${val.toFixed(2)})`;
    }
  }
  return Number(val.toFixed(4)).toString();
}

// ============================================================================
// 1. THE SIMPLEX METHOD TRACE GENERATOR (Lectures 19–21 & Winter 2023 Final Q4)
// ============================================================================
export function generateSimplexSteps(
  modeStr: string,
  objectiveStr: string,
  constraintsStr: string,
  varNamesStr: string,
  slackNamesStr: string
): TraceStep[] {
  const mode = (modeStr || 'max').trim().toLowerCase();

  // Special Past Exam Mode: Winter 2023 Final Q4 (Standard Form Conversion & 5 Steps)
  if (mode === 'exam-winter2023-q4') {
    const steps: TraceStep[] = [];

    steps.push({
      stepNumber: 1,
      codeLine: 1,
      title: 'Step 0 (Exam Part A — 15 pts): The 5 Steps of the Simplex Method',
      explanation:
        'Winter 2023 Final Q4(a) asks to write down the 5 steps (Step 0 to Step 4) with brief descriptions for the Simplex Method. Review the official solution table below before converting the LP in Part B.',
      formula: 'Step 0: Init → Step 1: Optimality Test → Step 2: Entering Var → Step 3: Departing Var (θ-ratio) → Step 4: Gauss-Jordan Pivot',
      variables: { ExamPart: 'Part A (15 pts)', TotalSteps: 5 },
      tables: [
        {
          id: 'simplex-5-steps-table',
          title: 'Official Solution: The 5 Steps of the Simplex Method (15 Marks)',
          colHeaders: ['Step #', 'Step Name', 'Official Exam Description & Rule'],
          rows: [
            [
              cell('Step 0', 'active'),
              cell('Initialization', 'computed'),
              cell('Present a given linear programming problem in standard form and set up an initial tableau with slack variables as basic variables.', 'default'),
            ],
            [
              cell('Step 1', 'active'),
              cell('Optimality Test', 'computed'),
              cell('If all entries in the objective row (except possibly the rightmost RHS column) are non-negative (≥ 0) — STOP: current basic feasible solution is optimal!', 'default'),
            ],
            [
              cell('Step 2', 'active'),
              cell('Entering Variable', 'computed'),
              cell('Select the most negative entry (largest absolute value) among the first n columns of the objective row. Mark its column as the Entering Variable and Pivot Column.', 'default'),
            ],
            [
              cell('Step 3', 'active'),
              cell('Departing Variable', 'computed'),
              cell('For each positive entry (> 0) in the pivot column, compute θ-ratio = RHS / PivotColEntry. (If all entries ≤ 0, stop: Unbounded!). Select the row with the smallest θ-ratio as Departing Variable & Pivot Row.', 'default'),
            ],
            [
              cell('Step 4', 'active'),
              cell('Forming Next Tableau', 'computed'),
              cell('Divide pivot row by the pivot element. Subtract from each other row (including objective row) [RowEntryInPivotCol × NewPivotRow]. Replace pivot row label with Entering Variable name and return to Step 1.', 'default'),
            ],
          ],
        },
      ],
    });

    steps.push({
      stepNumber: 2,
      codeLine: 1,
      title: 'Part B Step 1: Convert Minimization Objective to Maximization',
      explanation:
        'Given LP: Minimize 3x + 5y subject to x + y ≤ -4, x + 3y ≥ 6 (with x, y unrestricted in sign). Requirement 1 of Standard Form is that the objective must be a MAXIMIZATION problem. Multiply the objective by -1: Minimize (3x + 5y) ⇔ Maximize (-3x - 5y).',
      formula: 'Minimize 3x + 5y   ⇒   Maximize z = -3x - 5y',
      variables: { GivenObjective: 'Minimize 3x + 5y', ConvertedObjective: 'Maximize -3x - 5y' },
      tables: [
        {
          id: 'w2023-step1',
          title: 'Standard Form Transformation Tracker (Step 1 of 4)',
          colHeaders: ['Requirement', 'Original Given Form', 'Transformed Form'],
          rows: [
            [
              cell('1. Maximization Objective', 'active'),
              cell('Minimize 3x + 5y', 'compare'),
              cell('Maximize -3x - 5y', 'match', 'Multiply by -1', 'Negate objective coefficients', 'w23-obj', 'Maximize -3x - 5y'),
            ],
            [cell('2. Equality Constraints', 'default'), cell('x + y ≤ -4 ;  x + 3y ≥ 6', 'unvisited'), cell('Pending...', 'unvisited')],
            [cell('3. Non-Negative RHS (bᵢ ≥ 0)', 'default'), cell('RHS₁ = -4 < 0 ;  RHS₂ = 6 ≥ 0', 'unvisited'), cell('Pending...', 'unvisited')],
            [cell('4. Non-Negative Variables', 'default'), cell('x, y unrestricted in sign', 'unvisited'), cell('Pending...', 'unvisited')],
          ],
        },
      ],
    });

    steps.push({
      stepNumber: 3,
      codeLine: 1,
      title: 'Part B Step 2 & 3: Convert Inequalities to Equations & Make RHS Non-Negative',
      explanation:
        'Add slack variable +s (s ≥ 0) to the first ≤ constraint: x + y + s = -4. Subtract surplus variable -t (t ≥ 0) from the second ≥ constraint: x + 3y - t = 6. Since RHS₁ = -4 is negative, multiply the first equation by -1 so the right-hand side becomes +4 ≥ 0: -x - y - s = 4.',
      formula: 'x + y + s = -4  ×(-1)  ⇒  -x - y - s = 4   |   x + 3y - t = 6',
      variables: { Eq1: '-x - y - s = 4', Eq2: 'x + 3y - t = 6' },
      tables: [
        {
          id: 'w2023-step23',
          title: 'Standard Form Transformation Tracker (Steps 2 & 3 of 4)',
          colHeaders: ['Requirement', 'Intermediate Equation', 'RHS-Corrected Equation (bᵢ ≥ 0)'],
          rows: [
            [cell('1. Maximization Objective', 'computed'), cell('Maximize -3x - 5y', 'computed'), cell('Maximize -3x - 5y', 'computed')],
            [
              cell('2. Constraint 1 (≤ -4)', 'active'),
              cell('x + y + s = -4  (Add slack s ≥ 0)', 'compare'),
              cell('-x - y - s = 4  (Multiply by -1 so RHS = +4)', 'match', 'RHS = 4 ≥ 0', 'Multiply equation by -1', 'w23-eq1', '-x - y - s = 4'),
            ],
            [
              cell('3. Constraint 2 (≥ 6)', 'active'),
              cell('x + 3y - t = 6  (Subtract surplus t ≥ 0)', 'compare'),
              cell('x + 3y - t = 6  (RHS = 6 ≥ 0 already)', 'match'),
            ],
          ],
        },
      ],
    });

    steps.push({
      stepNumber: 4,
      codeLine: 1,
      title: 'Part B Step 4 (Final Exam Answer): Substitute Unrestricted Variables x = x\' - x\'\', y = y\' - y\'\'',
      explanation:
        'Finally, since x and y are unrestricted in sign, replace x = x\' - x\'\' (with x\', x\'\' ≥ 0) and y = y\' - y\'\' (with y\', y\'\' ≥ 0) everywhere in the objective and constraints. This completes the 10-point Standard Form conversion!',
      formula: 'x = x\' - x\'\',  y = y\' - y\'\'   where x\', x\'\', y\', y\'\', s, t ≥ 0',
      variables: { FinalVariables: "x', x'', y', y'', s, t ≥ 0", Marks: '10 / 10 pts' },
      tables: [
        {
          id: 'w2023-final',
          title: 'Complete Official Solution — Winter 2023 Final Exam Q4(b) (10 Marks)',
          colHeaders: ['Component', 'Final Simplex-Compatible Standard Form'],
          rows: [
            [
              cell('Objective Function', 'path'),
              cell("Maximize  -3x' + 3x'' - 5y' + 5y'' + 0s + 0t", 'path', 'Substituted x=x\'-x\'\', y=y\'-y\'\''),
            ],
            [
              cell('Constraint Equation 1', 'path'),
              cell("-x' + x'' - y' + y'' - s + 0t = 4", 'path', 'RHS = 4 ≥ 0'),
            ],
            [
              cell('Constraint Equation 2', 'path'),
              cell("x' - x'' + 3y' - 3y'' + 0s - t = 6", 'path', 'RHS = 6 ≥ 0'),
            ],
            [
              cell('Non-Negativity Constraints', 'path'),
              cell("x', x'', y', y'', s, t ≥ 0", 'path', 'All 6 variables ≥ 0'),
            ],
          ],
        },
      ],
      outputString: "Maximize -3x' + 3x'' - 5y' + 5y'' + 0s + 0t  s.t.  -x'+x''-y'+y''-s = 4,  x'-x''+3y'-3y''-t = 6,  x',x'',y',y'',s,t ≥ 0",
    });

    return steps;
  }

  // Parse Objective & Constraints for Max or Min-Dual
  const origObj = objectiveStr
    .split(',')
    .map((s) => parseFloat(s.trim()))
    .filter((n) => !Number.isNaN(n));
  const rawConstraints = constraintsStr
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);

  const parsedRows: { coeffs: number[]; rhs: number }[] = [];
  for (const rc of rawConstraints) {
    const parts = rc.split(/<=|>=|=/);
    const coeffs = parts[0]
      .split(',')
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !Number.isNaN(n));
    const rhs = parseFloat((parts[1] || '0').trim()) || 0;
    parsedRows.push({ coeffs, rhs });
  }

  const steps: TraceStep[] = [];
  const isMinDual = mode === 'min-dual';

  let decisionVars: string[] = [];
  let slackVars: string[] = [];
  let matrixA: number[][] = [];
  let vectorB: number[] = [];
  let vectorC: number[] = [];
  const primalVarNames = varNamesStr
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (isMinDual) {
    // Step A: Show Primal Minimization Matrix and its Transpose (Dual Maximization)
    const numPrimalVars = origObj.length;
    const numPrimalCons = parsedRows.length;
    const dualVarNames = ['u', 'v', 'w', 'p', 'q'].slice(0, numPrimalCons);
    const dualSlackNames = slackNamesStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    while (dualSlackNames.length < numPrimalVars) {
      dualSlackNames.push(`s${dualSlackNames.length + 1}`);
    }

    // Build Primal Matrix (numPrimalCons + 1) x (numPrimalVars + 1)
    const primalMatrixRows: TableCellData[][] = parsedRows.map((r) => [
      ...r.coeffs.map((c) => cell(fmtNum(c), 'default')),
      cell(fmtNum(r.rhs), 'active'),
    ]);
    primalMatrixRows.push([
      ...origObj.map((c) => cell(fmtNum(c), 'compare')),
      cell('Z (Min)', 'path'),
    ]);

    // Transpose Matrix: (numPrimalVars + 1) x (numPrimalCons + 1)
    // Dual has numPrimalVars constraints and numPrimalCons decision variables (u, v, w...)
    decisionVars = dualVarNames;
    slackVars = dualSlackNames.slice(0, numPrimalVars);
    vectorC = parsedRows.map((r) => r.rhs); // Dual objective is primal RHS!
    vectorB = [...origObj]; // Dual RHS is primal objective!
    matrixA = [];
    for (let j = 0; j < numPrimalVars; j++) {
      const row: number[] = [];
      for (let i = 0; i < numPrimalCons; i++) {
        row.push(parsedRows[i].coeffs[j] ?? 0);
      }
      matrixA.push(row);
    }

    const transposeRows: TableCellData[][] = matrixA.map((r, j) => [
      ...r.map((val) => cell(fmtNum(val), 'computed')),
      cell(fmtNum(vectorB[j]), 'active'),
    ]);
    transposeRows.push([
      ...vectorC.map((val) => cell(fmtNum(val), 'match')),
      cell('z (Max Dual)', 'path'),
    ]);

    steps.push({
      stepNumber: 1,
      codeLine: 1,
      title: 'Step 0A (Minimization via Dual Transpose): Form Matrix & Transpose (Lecture 21 Slides 95–107)',
      explanation: `To solve the Minimization LP (Minimize ${origObj.map((c, idx) => `${c}${primalVarNames[idx] || `x${idx + 1}`}`).join(' + ')}) using the Simplex Method, we write the augmented coefficient matrix with the objective in the bottom row and take its TRANSPOSE. This converts the problem into an equivalent Dual Maximization LP: Maximize ${vectorC.map((c, idx) => `${c}${decisionVars[idx]}`).join(' + ')}!`,
      formula: 'Primal Minimization (m × n)  —[Transpose Aᵀ]→  Dual Maximization (n × m)',
      variables: {
        PrimalObjective: `Minimize ${origObj.map((c, idx) => `${c}${primalVarNames[idx] || `x${idx + 1}`}`).join(' + ')}`,
        DualObjective: `Maximize ${vectorC.map((c, idx) => `${c}${decisionVars[idx]}`).join(' + ')}`,
      },
      tables: [
        {
          id: 'primal-matrix',
          title: '1. Original Minimization Matrix (Constraints + Objective Row)',
          colHeaders: [...primalVarNames.slice(0, numPrimalVars), 'RHS'],
          rowHeaders: [...parsedRows.map((_, i) => `Constraint ${i + 1}`), 'Objective'],
          rows: primalMatrixRows,
        },
        {
          id: 'transposed-dual-matrix',
          title: '2. Transposed Matrix → Dual Maximization Problem',
          colHeaders: [...decisionVars, 'Dual RHS (Primal cⱼ)'],
          rowHeaders: [...primalVarNames.slice(0, numPrimalVars).map((v) => `Dual Eq (${v})`), 'Dual Obj'],
          rows: transposeRows,
        },
      ],
    });
  } else {
    decisionVars = varNamesStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    while (decisionVars.length < origObj.length) {
      decisionVars.push(`x${decisionVars.length + 1}`);
    }
    slackVars = slackNamesStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    while (slackVars.length < parsedRows.length) {
      slackVars.push(`s${slackVars.length + 1}`);
    }
    matrixA = parsedRows.map((r) => r.coeffs);
    vectorB = parsedRows.map((r) => r.rhs);
    vectorC = [...origObj];
  }

  const m = matrixA.length; // number of constraints
  const d = decisionVars.length; // number of decision vars
  const allVars = [...decisionVars, ...slackVars];
  const totalCols = d + m; // decision + slack

  // Build Tableau: (m + 1) rows x (totalCols + 1) cols
  // Last column (index totalCols) is RHS
  const tab: number[][] = [];
  for (let i = 0; i < m; i++) {
    const row = new Array(totalCols + 1).fill(0);
    for (let j = 0; j < d; j++) row[j] = matrixA[i][j] ?? 0;
    row[d + i] = 1; // slack identity
    row[totalCols] = vectorB[i];
    tab.push(row);
  }
  const objRow = new Array(totalCols + 1).fill(0);
  for (let j = 0; j < d; j++) objRow[j] = -vectorC[j];
  tab.push(objRow);

  const basicVars = [...slackVars];

  const getBfsSummary = () => {
    const vals = allVars.map((v) => {
      const bIdx = basicVars.indexOf(v);
      return `${v}=${bIdx >= 0 ? fmtNum(tab[bIdx][totalCols]) : '0'}`;
    });
    return `(${vals.join(', ')})  ⇒  z = ${fmtNum(tab[m][totalCols])}`;
  };

  const buildTableauVisual = (
    id: string,
    title: string,
    subtitle: string,
    pivotRowIdx?: number,
    pivotColIdx?: number,
    thetas?: (number | null)[],
    markOptimal?: boolean
  ): VisualTable => {
    const colHeaders = [...allVars, 'RHS (bᵢ)', ...(thetas ? ['θ-Ratio (RHS / PivotCol)'] : [])];
    const rowHeaders = [...basicVars.map((bv) => `${bv} (Basic)`), 'Obj (z)'];

    const rows: TableCellData[][] = tab.map((r, rIdx) => {
      const isObj = rIdx === m;
      const isPivotRow = rIdx === pivotRowIdx;
      const rowCells: TableCellData[] = r.map((val, cIdx) => {
        const isRHS = cIdx === totalCols;
        const isPivotCol = cIdx === pivotColIdx;
        const isPivotCell = isPivotRow && isPivotCol;

        let st: TableCellData['state'] = 'default';
        if (isPivotCell) st = 'match';
        else if (isPivotRow || isPivotCol) st = 'compare';
        else if (isObj && isRHS) st = markOptimal ? 'path' : 'active';
        else if (isObj && val < -1e-9) st = 'mismatch';
        else if (isObj && markOptimal) st = 'computed';

        const sub = isPivotCell
          ? 'Pivot Element p'
          : isObj && isPivotCol
          ? 'Entering ↓'
          : isObj && isRHS
          ? 'Current z'
          : undefined;

        const editKey = isObj && isRHS && markOptimal ? `simplex-final-z` : undefined;
        return cell(
          fmtNum(val),
          st,
          sub,
          `Row ${rowHeaders[rIdx]}, Col ${colHeaders[cIdx]}`,
          editKey,
          editKey ? fmtNum(val) : undefined
        );
      });

      if (thetas) {
        if (isObj) {
          rowCells.push(cell('—', 'default'));
        } else {
          const th = thetas[rIdx];
          rowCells.push(
            cell(
              th !== null && th !== undefined ? `${fmtNum(r[totalCols])} / ${fmtNum(r[pivotColIdx!])} = ${fmtNum(th)}` : '≤ 0 (Skip)',
              isPivotRow ? 'match' : 'default',
              isPivotRow ? 'Min θ → Departing!' : undefined
            )
          );
        }
      }
      return rowCells;
    });

    return {
      id,
      title,
      subtitle,
      rowHeaders,
      colHeaders,
      rows,
    };
  };

  // Step 0: Initial Tableau
  steps.push({
    stepNumber: steps.length + 1,
    codeLine: 1,
    title: 'Step 0 [Initialization]: Construct Initial Simplex Tableau in Standard Form',
    explanation: `Add slack variables (${slackVars.join(', ')}) to convert each inequality into an equation. The slack variables form an ${m}×${m} identity matrix and serve as the initial Basic Variables. The bottom Objective Row stores the negated objective coefficients (${vectorC.map((c, i) => `-${c}${decisionVars[i]}`).join(', ')}), starting at initial Basic Feasible Solution ${getBfsSummary()}.`,
    formula: `Initial BFS: ${getBfsSummary()}`,
    variables: {
      BasicVars: basicVars.join(', '),
      NonBasicVars: decisionVars.join(', '),
      ObjectiveZ: fmtNum(tab[m][totalCols]),
    },
    tables: [
      buildTableauVisual(
        'simplex-init',
        'Initial Simplex Tableau (Iteration 0)',
        `Basic Feasible Solution: ${getBfsSummary()}`
      ),
    ],
  });

  // Iterate Simplex Pivots (max 8 iterations safety)
  for (let iter = 1; iter <= 8; iter++) {
    // Step 1: Optimality Test & Step 2: Entering Variable
    let minVal = -1e-9;
    let pivotCol = -1;
    for (let j = 0; j < totalCols; j++) {
      if (tab[m][j] < minVal) {
        minVal = tab[m][j];
        pivotCol = j;
      }
    }

    if (pivotCol === -1) {
      // Optimal reached!
      let finalExplanation = `All entries in the bottom Objective Row (${allVars.map((v, j) => `${v}:${fmtNum(tab[m][j])}`).join(', ')}) are non-negative (≥ 0)! By the Optimality Test (Step 1), the current Basic Feasible Solution is GLOBALLY OPTIMAL with maximum objective value z = ${fmtNum(tab[m][totalCols])}.`;
      let finalOut = `Optimal Solution: ${getBfsSummary()}`;

      if (isMinDual) {
        const primalSol = primalVarNames.slice(0, m).map((pv, idx) => {
          const slackCol = d + idx;
          return `${pv} = ${fmtNum(tab[m][slackCol])}`;
        });
        finalExplanation += ` Because this was solved via the Dual Transpose method (Lecture 21 Slide 130), the optimal values of the original Minimization variables (${primalVarNames.slice(0, m).join(', ')}) are read directly from the bottom Objective Row under the slack columns (${slackVars.join(', ')}): ${primalSol.join(', ')}, with Minimum Z = ${fmtNum(tab[m][totalCols])}!`;
        finalOut = `Optimal Minimization Solution: ${primalSol.join(', ')}  |  Minimum Objective Z = ${fmtNum(tab[m][totalCols])}`;
      }

      steps.push({
        stepNumber: steps.length + 1,
        codeLine: 2,
        title: `Step 1 [Optimality Test Passed!]: All Objective Row Entries ≥ 0 (Optimal z = ${fmtNum(tab[m][totalCols])})`,
        explanation: finalExplanation,
        formula: finalOut,
        variables: {
          Status: 'OPTIMAL SOLUTION FOUND',
          OptimalZ: fmtNum(tab[m][totalCols]),
        },
        tables: [
          buildTableauVisual(
            `simplex-opt-${iter}`,
            `Final Optimal Simplex Tableau`,
            finalOut,
            undefined,
            undefined,
            undefined,
            true
          ),
        ],
        outputString: finalOut,
      });
      break;
    }

    // Step 2 & 3: Compute Theta Ratios and find Departing Variable
    const enteringVar = allVars[pivotCol];
    const thetas: (number | null)[] = [];
    let minTheta = Infinity;
    let pivotRow = -1;

    for (let i = 0; i < m; i++) {
      const a_ij = tab[i][pivotCol];
      if (a_ij > 1e-9) {
        const th = tab[i][totalCols] / a_ij;
        thetas.push(th);
        if (th < minTheta - 1e-9) {
          minTheta = th;
          pivotRow = i;
        }
      } else {
        thetas.push(null);
      }
    }

    if (pivotRow === -1) {
      steps.push({
        stepNumber: steps.length + 1,
        codeLine: 5,
        title: `Step 3 [Unbounded LP]: All Pivot Column Entries ≤ 0`,
        explanation: `Entering variable ${enteringVar} has no positive entries in its column, meaning it can be increased indefinitely without violating any constraint. The problem is UNBOUNDED.`,
        tables: [buildTableauVisual(`simplex-unb-${iter}`, 'Unbounded Tableau', 'All pivot column entries ≤ 0')],
      });
      break;
    }

    const departingVar = basicVars[pivotRow];
    const pivotElem = tab[pivotRow][pivotCol];

    steps.push({
      stepNumber: steps.length + 1,
      codeLine: 4,
      title: `Iteration ${iter} — Steps 2 & 3: Entering Variable = ${enteringVar}, Departing Variable = ${departingVar}`,
      explanation: `1. Entering Variable (Step 2): Most negative entry in the objective row is ${fmtNum(tab[m][pivotCol])} in column "${enteringVar}" (Pivot Column).\n2. Departing Variable (Step 3): Compute θ-ratios = RHS / PivotCol for positive entries: ${thetas
        .map((th, idx) => (th !== null ? `θ(${basicVars[idx]}) = ${fmtNum(tab[idx][totalCols])}/${fmtNum(tab[idx][pivotCol])} = ${fmtNum(th)}` : `${basicVars[idx]}: skip (≤0)`))
        .join(' • ')}. Smallest positive θ-ratio is ${fmtNum(minTheta)} in row "${departingVar}" (Pivot Row). Pivot element is p = ${fmtNum(pivotElem)}.`,
      formula: `Entering: ${enteringVar} (most negative ${fmtNum(tab[m][pivotCol])})  |  Departing: ${departingVar} (min θ = ${fmtNum(minTheta)})  |  Pivot p = ${fmtNum(pivotElem)}`,
      variables: {
        Iteration: iter,
        EnteringVar: enteringVar,
        DepartingVar: departingVar,
        MinTheta: fmtNum(minTheta),
        PivotElement: fmtNum(pivotElem),
      },
      tables: [
        buildTableauVisual(
          `simplex-select-${iter}`,
          `Iteration ${iter}: Pivot Selection (Entering ${enteringVar}, Departing ${departingVar})`,
          `Pivot Element p = ${fmtNum(pivotElem)} at Row "${departingVar}", Col "${enteringVar}"`,
          pivotRow,
          pivotCol,
          thetas
        ),
      ],
    });

    // Step 4: Gauss-Jordan Pivot
    for (let j = 0; j <= totalCols; j++) {
      tab[pivotRow][j] /= pivotElem;
    }
    const rowOpNotes: string[] = [`New Row(${enteringVar}) ← Old Row(${departingVar}) / (${fmtNum(pivotElem)})`];

    for (let i = 0; i <= m; i++) {
      if (i === pivotRow) continue;
      const factor = tab[i][pivotCol];
      if (Math.abs(factor) > 1e-9) {
        const rName = i === m ? 'ObjRow' : `Row(${basicVars[i]})`;
        rowOpNotes.push(`${rName} ← ${rName} − (${fmtNum(factor)}) × New Row(${enteringVar})`);
        for (let j = 0; j <= totalCols; j++) {
          tab[i][j] -= factor * tab[pivotRow][j];
        }
      }
    }
    basicVars[pivotRow] = enteringVar;

    steps.push({
      stepNumber: steps.length + 1,
      codeLine: 7,
      title: `Iteration ${iter} — Step 4 [Gauss-Jordan Pivot]: Replace ${departingVar} with ${enteringVar} → New z = ${fmtNum(tab[m][totalCols])}`,
      explanation: `Divide pivot row by p = ${fmtNum(pivotElem)} and eliminate all other entries in column "${enteringVar}". Basic variable "${departingVar}" is replaced by "${enteringVar}". The new Basic Feasible Solution is ${getBfsSummary()}.`,
      formula: rowOpNotes.join('   |   '),
      variables: {
        Iteration: iter,
        NewBasis: basicVars.join(', '),
        NewObjectiveZ: fmtNum(tab[m][totalCols]),
      },
      tables: [
        buildTableauVisual(
          `simplex-after-${iter}`,
          `Tableau After Iteration ${iter} Pivot`,
          `New Basic Feasible Solution: ${getBfsSummary()}`,
          pivotRow,
          pivotCol
        ),
      ],
    });
  }

  return steps;
}

// ============================================================================
// 2. MAXIMUM FLOW (SHORTEST-AUGMENTING-PATH) TRACE GENERATOR (Lecture 22 & Fall 2025 CFE Q4)
// ============================================================================
export function generateMaxFlowSteps(
  edgesStr: string,
  sourceStr: string,
  sinkStr: string,
  presetStr?: string
): TraceStep[] {
  const source = (sourceStr || '1').trim();
  const sink = (sinkStr || '6').trim();

  interface FlowEdge {
    u: string;
    v: string;
    cap: number;
    flow: number;
  }

  const edges: FlowEdge[] = [];
  const nodeSet = new Set<string>();
  edgesStr
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((tok) => {
      const [uv, wStr] = tok.split(':');
      if (!uv) return;
      const [u, v] = uv.split('-').map((x) => x.trim());
      const cap = parseFloat(wStr) || 1;
      if (u && v) {
        edges.push({ u, v, cap, flow: 0 });
        nodeSet.add(u);
        nodeSet.add(v);
      }
    });

  const nodes = Array.from(nodeSet).sort((a, b) => {
    const na = Number(a);
    const nb = Number(b);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
    return a.localeCompare(b);
  });

  // Layout positions in 0..100 percentage coordinates matching the 6-vertex exam & slide diagrams
  const isExam2025 =
    presetStr === 'fall2025-q4' ||
    edges.some((e) => e.u === '1' && e.v === '2' && e.cap === 5);

  const nodePositions: Record<string, { x: number; y: number }> = isExam2025
    ? {
        '1': { x: 14, y: 20 },
        '2': { x: 50, y: 20 },
        '5': { x: 86, y: 20 },
        '3': { x: 14, y: 82 },
        '4': { x: 50, y: 82 },
        '6': { x: 86, y: 82 },
      }
    : {
        '1': { x: 10, y: 50 },
        '2': { x: 38, y: 18 },
        '3': { x: 64, y: 18 },
        '4': { x: 38, y: 82 },
        '5': { x: 64, y: 82 },
        '6': { x: 90, y: 50 },
      };

  const getTotalFlow = () =>
    edges
      .filter((e) => e.u === source)
      .reduce((sum, e) => sum + e.flow, 0) -
    edges
      .filter((e) => e.v === source)
      .reduce((sum, e) => sum + e.flow, 0);

  const buildGraphSnapshot = (
    labels: Record<string, { l: number | string; from: string; sign: '+' | '-' | '' }>,
    queue: string[],
    pathEdges: Set<string>,
    activeNode?: string,
    caption?: string
  ): TraceStep['graphView'] => {
    const gEdges: GraphEdgeView[] = edges.map((e) => {
      const key = `${e.u}->${e.v}`;
      const onPath = pathEdges.has(key);
      return {
        from: e.u,
        to: e.v,
        label: `${e.flow}/${e.cap}`,
        highlight: onPath,
        state: onPath ? 'selected' : e.flow > 0 ? 'tree' : 'default',
      };
    });

    const nodeStates: Record<string, 'default' | 'in-tree' | 'active' | 'fringe' | 'source'> = {};
    const nodeBadges: Record<string, string> = {};
    for (const v of nodes) {
      if (v === activeNode) nodeStates[v] = 'active';
      else if (v === source) nodeStates[v] = 'source';
      else if (labels[v]) nodeStates[v] = 'in-tree';
      else nodeStates[v] = 'default';

      if (labels[v]) {
        const lb = labels[v];
        nodeBadges[v] = `${lb.l}, ${lb.from}${lb.sign}`;
      }
    }

    return {
      nodes,
      edges: gEdges,
      directed: true,
      weighted: true,
      nodePositions,
      nodeStates,
      nodeBadges,
      queueLabel: `Q = { ${queue.join(', ')} }`,
      totalWeight: getTotalFlow(),
      caption,
    };
  };

  const buildEdgeFlowTable = (
    id: string,
    title: string,
    labels: Record<string, { l: number | string; from: string; sign: '+' | '-' | '' }>,
    pathEdges: Set<string>
  ): VisualTable => {
    return {
      id,
      title,
      colHeaders: ['Directed Edge (i → j)', 'Current Flow x_{ij}', 'Capacity u_{ij}', 'Residual r_{ij} = u_{ij} − x_{ij}', 'Flow / Cap Notation'],
      rows: edges.map((e) => {
        const r = e.cap - e.flow;
        const onPath = pathEdges.has(`${e.u}->${e.v}`);
        return [
          cell(`${e.u} → ${e.v}`, onPath ? 'match' : 'default'),
          cell(e.flow, onPath ? 'match' : e.flow > 0 ? 'computed' : 'default'),
          cell(e.cap, 'default'),
          cell(r, r === 0 ? 'mismatch' : 'default', r === 0 ? 'Saturated (0)' : undefined),
          cell(`${e.flow}/${e.cap}`, onPath ? 'path' : 'active', undefined, undefined, `mf-${id}-${e.u}-${e.v}`, `${e.flow}/${e.cap}`),
        ];
      }).concat([
        [
          cell('Vertex Labels (l_j, i±)', 'active'),
          ...nodes.slice(0, 4).map((v) =>
            cell(
              labels[v] ? `${v}: (${labels[v].l}, ${labels[v].from}${labels[v].sign})` : `${v}: unlabeled`,
              labels[v] ? 'computed' : 'unvisited'
            )
          ),
        ],
      ]),
    };
  };

  const steps: TraceStep[] = [];
  let loopCounter = 0;

  // Step 0: Initialization
  const initLabels: Record<string, { l: number | string; from: string; sign: '+' | '-' | '' }> = {
    [source]: { l: '∞', from: '−', sign: '' },
  };
  steps.push({
    stepNumber: 1,
    codeLine: 2,
    title: 'Step 1 [Initialization]: Set x_{ij} = 0 on All Edges, Label Source 1 with (∞, −), Q = { 1 }',
    explanation:
      'Initialize flow x_{ij} = 0 on every edge (written as 0/u_{ij}). Label the source vertex 1 with (∞, −) and initialize FIFO Queue Q = { 1 }.',
    formula: 'x_{ij} = 0 ∀(i, j) ∈ E   |   Label(1) = (∞, −)   |   Q = { 1 }',
    variables: { Source: source, Sink: sink, Queue: '{ 1 }', CurrentFlow: 0 },
    tables: [buildEdgeFlowTable('init', 'Step 1: Initial Flow Network (x_{ij} = 0)', initLabels, new Set())],
    graphView: buildGraphSnapshot(initLabels, [source], new Set(), source, 'Initialization: Q = { 1 }, Source labeled (∞, −)'),
  });

  // Run Edmonds-Karp BFS Augmenting Path waves
  for (let wave = 1; wave <= 10; wave++) {
    const labels: Record<string, { l: number; from: string; sign: '+' | '-' }> = {};
    const displayLabels: Record<string, { l: number | string; from: string; sign: '+' | '-' | '' }> = {
      [source]: { l: '∞', from: '−', sign: '' },
    };
    labels[source] = { l: Infinity, from: '-', sign: '+' };

    const queue: string[] = [source];
    const waveQueueHistory: string[] = [`Start of Wave ${wave}: Q = { ${source} }`];
    const waveStartLoop = loopCounter + 1;

    while (queue.length > 0 && !labels[sink]) {
      const i = queue.shift()!;
      loopCounter++;
      const l_i = labels[i].l;

      // 1. Forward edges from i to j
      const forwardNeighbors = edges
        .filter((e) => e.u === i)
        .sort((a, b) => Number(a.v) - Number(b.v));
      for (const e of forwardNeighbors) {
        const j = e.v;
        if (!labels[j]) {
          const r_ij = e.cap - e.flow;
          if (r_ij > 0) {
            const l_j = Math.min(l_i, r_ij);
            labels[j] = { l: l_j, from: i, sign: '+' };
            displayLabels[j] = { l: l_j, from: i, sign: '+' };
            queue.push(j);
          }
        }
      }

      // 2. Backward edges from j to i (edges e where e.v === i and e.u === j with e.flow > 0)
      const backwardNeighbors = edges
        .filter((e) => e.v === i)
        .sort((a, b) => Number(a.u) - Number(b.u));
      for (const e of backwardNeighbors) {
        const j = e.u;
        if (!labels[j] && e.flow > 0) {
          const l_j = Math.min(l_i, e.flow);
          labels[j] = { l: l_j, from: i, sign: '-' };
          displayLabels[j] = { l: l_j, from: i, sign: '-' };
          queue.push(j);
        }
      }

      waveQueueHistory.push(`After Loop ${loopCounter} (Dequeue ${i}): Q = { ${queue.join(', ')} }`);
    }

    if (!labels[sink]) {
      // Termination step!
      steps.push({
        stepNumber: steps.length + 1,
        codeLine: 19,
        title: `Loops ${waveStartLoop}–${loopCounter} [Termination]: Queue Q = { } Empty & Sink ${sink} Unlabeled → Max Flow = ${getTotalFlow()}`,
        explanation: `BFS Queue Q became empty without labeling sink ${sink}:\n${waveQueueHistory.join('  →  ')}.\nReached vertices from source: V_L = { ${Object.keys(displayLabels).join(', ')} }. No augmenting path exists! The algorithm stops with Maximum Flow = ${getTotalFlow()}.`,
        formula: `Q = { } (Stop!)   |   Maximum Flow Value = ${getTotalFlow()}`,
        variables: {
          Wave: wave,
          Queue: '{ } (Empty)',
          LabeledSet: `{ ${Object.keys(displayLabels).join(', ')} }`,
          MaxFlow: getTotalFlow(),
        },
        tables: [
          buildEdgeFlowTable(`term-${wave}`, `Final Termination State (Max Flow = ${getTotalFlow()})`, displayLabels, new Set()),
        ],
        graphView: buildGraphSnapshot(
          displayLabels,
          [],
          new Set(),
          undefined,
          `Termination: Q = { }, Sink ${sink} cannot be reached. Maximum Flow = ${getTotalFlow()}`
        ),
        outputString: `Maximum Flow Value = ${getTotalFlow()}`,
      });
      break;
    }

    // Sink was labeled! Reconstruct augmenting path
    const bottleneck = labels[sink].l;
    const pathNodes: string[] = [sink];
    const pathEdges = new Set<string>();
    const pathStepsDesc: string[] = [];
    let curr = sink;
    while (curr !== source) {
      const info = labels[curr];
      const prev = info.from;
      if (info.sign === '+') {
        pathEdges.add(`${prev}->${curr}`);
        pathStepsDesc.unshift(`${prev} → ${curr} (+${bottleneck})`);
      } else {
        pathEdges.add(`${curr}->${prev}`);
        pathStepsDesc.unshift(`${prev} ← ${curr} (−${bottleneck} backward edge!)`);
      }
      pathNodes.unshift(prev);
      curr = prev;
    }

    // Step A: Show BFS Labeling Wave (Loops waveStartLoop .. loopCounter)
    steps.push({
      stepNumber: steps.length + 1,
      codeLine: 9,
      title: `Wave ${wave} Labeling (Loops ${waveStartLoop}–${loopCounter}): Sink ${sink} Labeled with (${bottleneck}, ${labels[sink].from}${labels[sink].sign})`,
      explanation: `BFS Labeling progression:\n• ${waveQueueHistory.join('\n• ')}\nVertex labels assigned: ${nodes
        .filter((v) => displayLabels[v])
        .map((v) => `${v}:(${displayLabels[v].l}, ${displayLabels[v].from}${displayLabels[v].sign})`)
        .join(', ')}. Sink ${sink} is labeled with bottleneck l_${sink} = ${bottleneck}!`,
      formula: `Augmenting Path: ${pathNodes.join(' → ')}   |   Bottleneck l_${sink} = ${bottleneck}`,
      variables: {
        Loops: `${waveStartLoop} to ${loopCounter}`,
        SinkLabel: `(${bottleneck}, ${labels[sink].from}${labels[sink].sign})`,
        QueueAtHit: `{ ${queue.join(', ')} }`,
      },
      tables: [
        buildEdgeFlowTable(
          `label-${wave}`,
          `Wave ${wave}: BFS Vertex Labels (Loops ${waveStartLoop}–${loopCounter})`,
          displayLabels,
          pathEdges
        ),
      ],
      graphView: buildGraphSnapshot(
        displayLabels,
        queue,
        pathEdges,
        sink,
        `Loops ${waveStartLoop}–${loopCounter}: Path ${pathNodes.join('→')} found with bottleneck = ${bottleneck}`
      ),
    });

    // Step B: Augment flow along the path and reset labels
    curr = sink;
    while (curr !== source) {
      const info = labels[curr];
      const prev = info.from;
      if (info.sign === '+') {
        const edge = edges.find((e) => e.u === prev && e.v === curr);
        if (edge) edge.flow += bottleneck;
      } else {
        const backEdge = edges.find((e) => e.u === curr && e.v === prev);
        if (backEdge) backEdge.flow -= bottleneck;
      }
      curr = prev;
    }

    const resetLabels: Record<string, { l: number | string; from: string; sign: '+' | '-' | '' }> = {
      [source]: { l: '∞', from: '−', sign: '' },
    };

    steps.push({
      stepNumber: steps.length + 1,
      codeLine: 16,
      title: `Wave ${wave} Augmentation: Augment Path ${pathNodes.join(' → ')} by +${bottleneck} (Total Flow = ${getTotalFlow()})`,
      explanation: `Update flows along ${pathStepsDesc.join(' , ')}. Then erase all vertex labels except source ${source}:(∞, −) and reinitialize Q = { ${source} }. Total flow is now ${getTotalFlow()}.`,
      formula: `${pathStepsDesc.join('  |  ')}   ⇒   Total Flow = ${getTotalFlow()}`,
      variables: {
        AugmentedPath: pathNodes.join(' → '),
        FlowAdded: `+${bottleneck}`,
        TotalFlowNow: getTotalFlow(),
        ResetQueue: `{ ${source} }`,
      },
      tables: [
        buildEdgeFlowTable(
          `aug-${wave}`,
          `After Wave ${wave} Augmentation (Total Flow = ${getTotalFlow()})`,
          resetLabels,
          pathEdges
        ),
      ],
      graphView: buildGraphSnapshot(
        resetLabels,
        [source],
        pathEdges,
        source,
        `After augmenting ${pathNodes.join('→')} by +${bottleneck}: Total Flow = ${getTotalFlow()}, Q reset to {${source}}`
      ),
    });
  }

  return steps;
}

// ============================================================================
// 3. MAXIMUM BIPARTITE MATCHING TRACE GENERATOR (Lecture 23 & Fall 2020 Q4 / Spring 2021 Q5b)
// ============================================================================
export function generateBipartiteMatchingSteps(
  v1Str: string,
  v2Str: string,
  edgesStr: string,
  initialMStr: string
): TraceStep[] {
  const V1 = v1Str
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const V2 = v2Str
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const allNodes = [...V1, ...V2];

  const edges: { u: string; v: string }[] = [];
  edgesStr
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((tok) => {
      const [a, b] = tok.split('-').map((x) => x.trim());
      if (a && b) {
        const u = V1.includes(a) ? a : b;
        const v = V1.includes(a) ? b : a;
        edges.push({ u, v });
      }
    });

  const matched = new Set<string>();
  initialMStr
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((tok) => {
      const [a, b] = tok.split('-').map((x) => x.trim());
      if (a && b) {
        const u = V1.includes(a) ? a : b;
        const v = V1.includes(a) ? b : a;
        matched.add(`${u}-${v}`);
      }
    });

  // Node positions in 0..100 percentage coordinates: V1 on top row, V2 on bottom row (matches Lecture 23 & Exam diagrams!)
  const nodePositions: Record<string, { x: number; y: number }> = {};
  V1.forEach((u, idx) => {
    const spacing = 76 / Math.max(1, V1.length);
    nodePositions[u] = { x: 12 + idx * spacing + spacing / 2, y: 20 };
  });
  V2.forEach((v, idx) => {
    const spacing = 76 / Math.max(1, V2.length);
    nodePositions[v] = { x: 12 + idx * spacing + spacing / 2, y: 82 };
  });

  const getMate = (node: string): string | null => {
    for (const mKey of matched) {
      const [u, v] = mKey.split('-');
      if (u === node) return v;
      if (v === node) return u;
    }
    return null;
  };

  const getFreeV1 = () => V1.filter((u) => !getMate(u));
  const getFreeV2 = () => V2.filter((v) => !getMate(v));
  const getMatchingList = () => Array.from(matched).map((k) => `(${k.replace('-', ',')})`);

  const buildMatchingGraph = (
    labels: Record<string, string>,
    queue: string[],
    augPathEdges: Set<string>,
    caption: string
  ): TraceStep['graphView'] => {
    const gEdges: GraphEdgeView[] = edges.map((e) => {
      const key = `${e.u}-${e.v}`;
      const isM = matched.has(key);
      const isAug = augPathEdges.has(key);
      return {
        from: e.u,
        to: e.v,
        highlight: isM || isAug,
        state: isAug ? 'selected' : isM ? 'tree' : 'default',
        label: isM ? '∈ M' : isAug ? 'AugPath' : undefined,
      };
    });

    const nodeStates: Record<string, 'default' | 'in-tree' | 'active' | 'fringe' | 'source'> = {};
    const nodeBadges: Record<string, string> = {};
    for (const w of allNodes) {
      const mate = getMate(w);
      nodeStates[w] = mate ? 'in-tree' : 'fringe';
      if (labels[w]) {
        nodeBadges[w] = `lbl: ${labels[w]}`;
      } else {
        nodeBadges[w] = mate ? 'Matched' : 'FREE';
      }
    }

    return {
      nodes: allNodes,
      edges: gEdges,
      directed: false,
      weighted: false,
      nodePositions,
      nodeStates,
      nodeBadges,
      vtLabel: `M = { ${getMatchingList().join(', ')} }`,
      queueLabel: `Q = [ ${queue.join(', ')} ]`,
      totalWeight: `${matched.size} edge(s)`,
      caption,
    };
  };

  const buildMatchingTable = (
    id: string,
    title: string,
    labels: Record<string, string>,
    augPathStr?: string
  ): VisualTable => {
    return {
      id,
      title,
      colHeaders: ['Vertex', 'Partition', 'Status (Matched / Free)', 'Current Mate in M', 'BFS Parent Label'],
      rows: allNodes.map((w) => {
        const mate = getMate(w);
        const isV1 = V1.includes(w);
        return [
          cell(w, mate ? 'computed' : 'active'),
          cell(isV1 ? 'V₁ (Top)' : 'V₂ (Bottom)', 'default'),
          cell(mate ? 'Matched' : 'FREE', mate ? 'match' : 'compare'),
          cell(mate ? `(${w}, ${mate})` : '—', mate ? 'path' : 'default', augPathStr, undefined, `bm-${id}-${w}`, mate || '—'),
          cell(labels[w] || '—', labels[w] ? 'active' : 'default'),
        ];
      }),
    };
  };

  const steps: TraceStep[] = [];

  // Step 1: Initial Matching M1
  const initFreeV1 = getFreeV1();
  steps.push({
    stepNumber: 1,
    codeLine: 2,
    title: `Step 1 [Initialization]: Initial Matching M₁ = { ${getMatchingList().join(', ')} }, Queue Q = [ ${initFreeV1.join(', ')} ]`,
    explanation: `Start with initial matching M₁ = { ${getMatchingList().join(', ')} } of size |M₁| = ${matched.size}. Free vertices in V₁ are { ${initFreeV1.join(', ')} } and free vertices in V₂ are { ${getFreeV2().join(', ')} }. Initialize BFS Queue Q = [ ${initFreeV1.join(', ')} ].`,
    formula: `M₁ = { ${getMatchingList().join(', ')} }   |   Free(V₁) = { ${initFreeV1.join(', ')} }   |   Free(V₂) = { ${getFreeV2().join(', ')} }`,
    variables: {
      MatchingSize: matched.size,
      CurrentMatching: `{ ${getMatchingList().join(', ')} }`,
      QueueQ: `[ ${initFreeV1.join(', ')} ]`,
    },
    tables: [buildMatchingTable('m-init', `Initial Matching M₁ (|M₁| = ${matched.size})`, {})],
    graphView: buildMatchingGraph(
      {},
      initFreeV1,
      new Set(),
      `Initial Matching M₁ = { ${getMatchingList().join(', ')} } | Free V₁ = { ${initFreeV1.join(', ')} }`
    ),
  });

  // Iteratively find augmenting paths
  for (let phase = 1; phase <= 6; phase++) {
    const freeV1 = getFreeV1();
    if (freeV1.length === 0) {
      steps.push({
        stepNumber: steps.length + 1,
        codeLine: 20,
        title: `Termination: Queue Q = [ ] Empty — Perfect & Maximum Matching M_${phase} = { ${getMatchingList().join(', ')} }`,
        explanation: `No free vertices remain in V₁ (Queue Q is empty). The current matching M_${phase} = { ${getMatchingList().join(', ')} } has size |M| = ${matched.size} and matches every single vertex — it is both a Maximum Matching and a Perfect Matching!`,
        formula: `Final Maximum Matching M = { ${getMatchingList().join(', ')} }  (|M| = ${matched.size})`,
        variables: { Status: 'PERFECT & MAXIMUM MATCHING', Size: matched.size },
        tables: [buildMatchingTable(`m-final`, `Final Maximum Matching M (|M| = ${matched.size})`, {})],
        graphView: buildMatchingGraph({}, [], new Set(), `Final Maximum Matching M = { ${getMatchingList().join(', ')} }`),
        outputString: `Maximum Matching M = { ${getMatchingList().join(', ')} } (|M| = ${matched.size})`,
      });
      break;
    }

    // Note: In Fall 2020 Q4 / Spring 2021 Q5b, M1={(1,5)}, free V1={2,3}, and the exam solution picks 3 first (path 3-5-1-6) then 2 (path 1-5-3-4 / 2-5-3-4).
    // Let's order freeV1 so if 3 and 2 are both free and (1,5) is matched, 3 is explored or standard BFS finds the exact augmenting path!
    const queue = [...freeV1];
    if (queue.includes('3') && queue.includes('2') && matched.has('1-5') && matched.size === 1) {
      queue.sort((a, b) => b.localeCompare(a)); // ['3', '2'] so 3-5-1-6 is found first, matching the exam solution key!
    }

    const labels: Record<string, string> = {};
    let foundFreeU: string | null = null;
    let foundFromW: string | null = null;

    while (queue.length > 0 && !foundFreeU) {
      const w = queue.shift()!;
      if (V1.includes(w)) {
        // w in V1: explore adjacent u in V2
        const neighbors = edges.filter((e) => e.u === w).map((e) => e.v);
        for (const u of neighbors) {
          if (!getMate(u)) {
            // u is FREE! Augmenting path found!
            labels[u] = w;
            foundFreeU = u;
            foundFromW = w;
            break;
          } else if (!matched.has(`${w}-${u}`) && !labels[u]) {
            labels[u] = w;
            queue.push(u);
          }
        }
      } else {
        // w in V2 (matched): label its mate v in V1
        const v = getMate(w);
        if (v && !labels[v]) {
          labels[v] = w;
          queue.push(v);
        }
      }
    }

    if (!foundFreeU || !foundFromW) {
      steps.push({
        stepNumber: steps.length + 1,
        codeLine: 20,
        title: `Termination: No Augmenting Path Found — Maximum Matching M = { ${getMatchingList().join(', ')} }`,
        explanation: `BFS Queue became empty without reaching any free vertex in V₂. By Berge's Theorem, current matching M = { ${getMatchingList().join(', ')} } of size ${matched.size} is Maximum!`,
        formula: `Maximum Matching M = { ${getMatchingList().join(', ')} }`,
        tables: [buildMatchingTable(`m-end-${phase}`, `Final Maximum Matching M`, labels)],
        graphView: buildMatchingGraph(labels, [], new Set(), `Maximum Matching M = { ${getMatchingList().join(', ')} }`),
        outputString: `Maximum Matching M = { ${getMatchingList().join(', ')} }`,
      });
      break;
    }

    // Reconstruct the augmenting path from foundFreeU back to free vertex in V1
    const pathNodes: string[] = [foundFreeU];
    let curr = foundFreeU;
    while (labels[curr]) {
      curr = labels[curr];
      pathNodes.unshift(curr);
    }

    const augEdgesSet = new Set<string>();
    const addedEdges: string[] = [];
    const removedEdges: string[] = [];

    for (let k = 0; k < pathNodes.length - 1; k++) {
      const a = pathNodes[k];
      const b = pathNodes[k + 1];
      const u = V1.includes(a) ? a : b;
      const v = V1.includes(a) ? b : a;
      const key = `${u}-${v}`;
      augEdgesSet.add(key);
      if (k % 2 === 0) {
        addedEdges.push(`(${u},${v})`);
      } else {
        removedEdges.push(`(${u},${v})`);
      }
    }

    // Show Augmenting Path Discovery Step
    steps.push({
      stepNumber: steps.length + 1,
      codeLine: 8,
      title: `Phase ${phase}A [Augmenting Path Found]: ${pathNodes.join(' → ')} (Reaches Free Vertex ${foundFreeU} ∈ V₂)`,
      explanation: `Starting from free vertex ${pathNodes[0]} ∈ V₁, BFS alternates between unmatched edges (V₁→V₂) and matched edges (V₂→V₁) to discover the augmenting path: ${pathNodes.join(' - ')} ending at free vertex ${foundFreeU} ∈ V₂.`,
      formula: `Augmenting Path P_${phase}:  ${pathNodes.join(' — ')}`,
      variables: {
        Phase: phase,
        AugmentingPath: pathNodes.join(' - '),
        EdgesToAdd: addedEdges.join(', '),
        EdgesToRemove: removedEdges.join(', ') || 'None',
      },
      tables: [
        buildMatchingTable(
          `m-path-${phase}`,
          `Phase ${phase}: Augmenting Path ${pathNodes.join(' - ')}`,
          labels,
          pathNodes.join('-')
        ),
      ],
      graphView: buildMatchingGraph(
        labels,
        queue,
        augEdgesSet,
        `Augmenting Path P_${phase}: ${pathNodes.join(' → ')}`
      ),
    });

    // Apply symmetric difference flip along the augmenting path
    for (let k = 0; k < pathNodes.length - 1; k++) {
      const a = pathNodes[k];
      const b = pathNodes[k + 1];
      const u = V1.includes(a) ? a : b;
      const v = V1.includes(a) ? b : a;
      const key = `${u}-${v}`;
      if (k % 2 === 0) {
        matched.add(key);
      } else {
        matched.delete(key);
      }
    }

    steps.push({
      stepNumber: steps.length + 1,
      codeLine: 13,
      title: `Phase ${phase}B [Flip Edges / Augment Matching]: M_${phase + 1} = { ${getMatchingList().join(', ')} } (|M| = ${matched.size})`,
      explanation: `Along augmenting path ${pathNodes.join('-')}, remove matched edge(s) ${removedEdges.join(', ') || '∅'} and add unmatched edge(s) ${addedEdges.join(', ')}. This produces the improved matching M_${phase + 1} = { ${getMatchingList().join(', ')} } of size ${matched.size}. Erase all labels and reinitialize Q with remaining free vertices in V₁: [ ${getFreeV1().join(', ')} ].`,
      formula: `M_${phase + 1} = (M_${phase} − {${removedEdges.join(', ')}}) ∪ {${addedEdges.join(', ')}} = { ${getMatchingList().join(', ')} }`,
      variables: {
        RemovedEdges: removedEdges.join(', ') || 'None',
        AddedEdges: addedEdges.join(', '),
        NewMatching: `{ ${getMatchingList().join(', ')} }`,
        NewSize: matched.size,
      },
      tables: [
        buildMatchingTable(`m-after-${phase}`, `Updated Matching M_${phase + 1} (|M_${phase + 1}| = ${matched.size})`, {}),
      ],
      graphView: buildMatchingGraph(
        {},
        getFreeV1(),
        new Set(),
        `Updated Matching M_${phase + 1} = { ${getMatchingList().join(', ')} }`
      ),
    });
  }

  return steps;
}

// ============================================================================
// 4. STABLE MARRIAGE (GALE-SHAPLEY) TRACE GENERATOR (Lecture 24 & Fall 2020 Q6 / Spring 2021 Q6)
// ============================================================================
export function generateStableMarriageSteps(
  menStr: string,
  womenStr: string,
  menPrefsStr: string,
  womenPrefsStr: string
): TraceStep[] {
  const men = menStr
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const women = womenStr
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const menPrefs: Record<string, string[]> = {};
  menPrefsStr
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((seg) => {
      const [m, listStr] = seg.split(':').map((x) => x.trim());
      if (m && listStr) {
        menPrefs[m] = listStr.split(',').map((x) => x.trim()).filter(Boolean);
      }
    });

  const womenPrefs: Record<string, string[]> = {};
  womenPrefsStr
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((seg) => {
      const [w, listStr] = seg.split(':').map((x) => x.trim());
      if (w && listStr) {
        womenPrefs[w] = listStr.split(',').map((x) => x.trim()).filter(Boolean);
      }
    });

  // Ensure every man and woman has a preference list
  for (const m of men) {
    if (!menPrefs[m]) menPrefs[m] = [...women];
  }
  for (const w of women) {
    if (!womenPrefs[w]) womenPrefs[w] = [...men];
  }

  const getManRankOfWoman = (m: string, w: string) => menPrefs[m].indexOf(w) + 1;
  const getWomanRankOfMan = (w: string, m: string) => womenPrefs[w].indexOf(m) + 1;

  const currentHusbandOfWoman: Record<string, string | null> = {};
  const currentWifeOfMan: Record<string, string | null> = {};
  const nextProposalIdx: Record<string, number> = {};
  const rejectedPairs = new Set<string>();

  for (const m of men) {
    currentWifeOfMan[m] = null;
    nextProposalIdx[m] = 0;
  }
  for (const w of women) {
    currentHusbandOfWoman[w] = null;
  }

  const getFreeMen = () => men.filter((m) => !currentWifeOfMan[m]);

  const buildRankingMatrixTable = (
    id: string,
    title: string,
    subtitle: string,
    activeM?: string,
    activeW?: string
  ): VisualTable => {
    return {
      id,
      title,
      subtitle,
      rowHeaders: men.map((m) => `${m} (${currentWifeOfMan[m] ? `→ ${currentWifeOfMan[m]}` : 'FREE'})`),
      colHeaders: women.map((w) => `${w} (${currentHusbandOfWoman[w] ? `← ${currentHusbandOfWoman[w]}` : 'FREE'})`),
      rows: men.map((m) =>
        women.map((w) => {
          const rM = getManRankOfWoman(m, w);
          const rW = getWomanRankOfMan(w, m);
          const isMatched = currentWifeOfMan[m] === w;
          const isRej = rejectedPairs.has(`${m}-${w}`);
          const isAct = m === activeM && w === activeW;

          let st: TableCellData['state'] = 'default';
          let sub = `m:#${rM}, w:#${rW}`;
          if (isMatched) {
            st = 'match';
            sub = '✓ Accepted [Boxed]';
          } else if (isAct) {
            st = 'compare';
            sub = 'Proposing...';
          } else if (isRej) {
            st = 'mismatch';
            sub = '✗ Rejected';
          }

          return cell(
            `${rM}, ${rW}`,
            st,
            sub,
            `${m} ranks ${w} #${rM}; ${w} ranks ${m} #${rW}`,
            `sm-${id}-${m}-${w}`,
            `${rM}, ${rW}`
          );
        })
      ),
    };
  };

  const steps: TraceStep[] = [];
  const proposalLogRows: TableCellData[][] = [];

  // Step 0: Initial Ranking Matrix & Preference Lists
  steps.push({
    stepNumber: 1,
    codeLine: 2,
    title: `Step 0 [Initialization]: All Men { ${men.join(', ')} } and Women { ${women.join(', ')} } Start FREE`,
    explanation: `In each cell (r_m, r_w) of the Ranking Matrix, the first number r_m is the man's preference rank for that woman, and the second number r_w is the woman's preference rank for that man. Initially all men are Free: { ${men.join(', ')} }.`,
    formula: `Free Men = { ${men.join(', ')} }   |   Matched Pairs = ∅`,
    variables: {
      FreeMen: men.join(', '),
      MatchedPairs: 'None',
    },
    tables: [
      buildRankingMatrixTable(
        'sm-init',
        'Initial Ranking Matrix (r_man, r_woman)',
        `All men are free: { ${men.join(', ')} }`
      ),
    ],
  });

  let iter = 0;
  while (getFreeMen().length > 0 && iter < 30) {
    iter++;
    const freeMenBefore = getFreeMen();
    const m = freeMenBefore[0];
    const w = menPrefs[m][nextProposalIdx[m]];
    nextProposalIdx[m]++;

    const mRankOfW = getManRankOfWoman(m, w);
    const wRankOfM = getWomanRankOfMan(w, m);
    const currMate = currentHusbandOfWoman[w];

    let actionDesc = '';
    let outcomeShort = '';

    if (!currMate) {
      // w is free -> accepts!
      currentHusbandOfWoman[w] = m;
      currentWifeOfMan[m] = w;
      actionDesc = `${m} proposes to his #${mRankOfW} choice ${w}. Since ${w} is currently FREE, ${w} accepts ${m}'s proposal! Pair (${m}, ${w}) is matched.`;
      outcomeShort = `${w} accepts (was free)`;
    } else {
      const wRankOfCurr = getWomanRankOfMan(w, currMate);
      if (wRankOfM < wRankOfCurr) {
        // w prefers m over currMate -> accepts m and dumps currMate!
        rejectedPairs.add(`${currMate}-${w}`);
        currentWifeOfMan[currMate] = null;
        currentHusbandOfWoman[w] = m;
        currentWifeOfMan[m] = w;
        actionDesc = `${m} proposes to his #${mRankOfW} choice ${w}. ${w} compares her current partner ${currMate} (rank #${wRankOfCurr}) with proposer ${m} (rank #${wRankOfM}): since #${wRankOfM} < #${wRankOfCurr}, ${w} prefers ${m}! ${w} accepts ${m} and dumps ${currMate} (making ${currMate} FREE again).`;
        outcomeShort = `${w} accepts ${m} (#${wRankOfM}) & dumps ${currMate} (#${wRankOfCurr})`;
      } else {
        // w rejects m
        rejectedPairs.add(`${m}-${w}`);
        actionDesc = `${m} proposes to his #${mRankOfW} choice ${w}. ${w} compares her current partner ${currMate} (rank #${wRankOfCurr}) with proposer ${m} (rank #${wRankOfM}): since #${wRankOfCurr} < #${wRankOfM}, ${w} prefers ${currMate} and REJECTS ${m}'s proposal! ${m} remains FREE.`;
        outcomeShort = `${w} rejects ${m} (prefers ${currMate} #${wRankOfCurr} over ${m} #${wRankOfM})`;
      }
    }

    const currentMatches = men
      .filter((x) => currentWifeOfMan[x])
      .map((x) => `(${x}, ${currentWifeOfMan[x]})`);

    proposalLogRows.push([
      cell(`Iteration ${iter}`, 'active'),
      cell(freeMenBefore.join(', '), 'default'),
      cell(`${m} → ${w} (m's #${mRankOfW})`, 'compare'),
      cell(outcomeShort, outcomeShort.includes('rejects') ? 'mismatch' : 'match'),
      cell(`{ ${currentMatches.join(', ')} }`, 'path'),
    ]);

    steps.push({
      stepNumber: steps.length + 1,
      codeLine: 6,
      title: `Iteration ${iter}: Free Man ${m} Proposes to ${w} → ${outcomeShort}`,
      explanation: actionDesc,
      formula: `Free Men (before): { ${freeMenBefore.join(', ')} }  |  Proposal: ${m} → ${w}  |  Active Matches: { ${currentMatches.join(', ')} }`,
      variables: {
        Iteration: iter,
        FreeMenBefore: freeMenBefore.join(', '),
        Proposer: m,
        Woman: w,
        FreeMenAfter: getFreeMen().join(', ') || 'None (All Matched!)',
      },
      tables: [
        buildRankingMatrixTable(
          `sm-iter-${iter}`,
          `Iteration ${iter} Ranking Matrix — Free Men: { ${freeMenBefore.join(', ')} }`,
          `${m} proposed to ${w}: ${outcomeShort}`,
          m,
          w
        ),
        {
          id: `sm-log-${iter}`,
          title: 'Iterative Proposal & Acceptance Log (Exam Trace Table)',
          colHeaders: ['Iteration', 'Free Men Set', 'Proposal (m → w)', 'Woman’s Decision', 'Matched Pairs So Far'],
          rows: [...proposalLogRows],
        },
      ],
      outputString:
        getFreeMen().length === 0
          ? `Final Stable Marriage Solution Set: { ${currentMatches.join(', ')} }`
          : undefined,
    });
  }

  return steps;
}

// ============================================================================
// 5. BACKTRACKING TRACE GENERATOR (Subset-Sum, 4-Queens, Hamiltonian Circuit)
// ============================================================================
export function generateBacktrackingSteps(
  problemTypeStr: string,
  setSStr: string,
  targetDStr: string,
  stopAtFirstStr: string
): TraceStep[] {
  const problemType = (problemTypeStr || 'subset-sum').trim().toLowerCase();

  // Case A: 4-Queens Problem (Lecture 25 Slides 19–55)
  if (problemType === 'n-queens') {
    const steps: TraceStep[] = [];
    const nodes: StateSpaceTreeNodeView[] = [
      { id: '0', mainLabel: 'Root (0)', subLabel: 'Empty Board', nodeOrder: 0, status: 'visited', level: 0, xPercent: 50 },
      { id: '1', parentId: '0', edgeLabel: 'Q1→c1', mainLabel: '[1, _, _, _]', subLabel: 'Node 1', nodeOrder: 1, status: 'visited', level: 1, xPercent: 25 },
      { id: '2', parentId: '1', edgeLabel: 'Q2→c1', mainLabel: '[1, 1]', subLabel: 'Col 1 attack', nodeOrder: 2, status: 'pruned', pruneReason: '× Same Col 1', level: 2, xPercent: 8 },
      { id: '3', parentId: '1', edgeLabel: 'Q2→c2', mainLabel: '[1, 2]', subLabel: 'Diag attack', nodeOrder: 3, status: 'pruned', pruneReason: '× Diag with Q1', level: 2, xPercent: 18 },
      { id: '4', parentId: '1', edgeLabel: 'Q2→c3', mainLabel: '[1, 3, _, _]', subLabel: 'Node 4', nodeOrder: 4, status: 'visited', level: 2, xPercent: 30 },
      { id: '5', parentId: '4', edgeLabel: 'Q3→all', mainLabel: 'Row 3 Dead End', subLabel: 'c1,c2,c3,c4 all attacked!', nodeOrder: 5, status: 'pruned', pruneReason: '× All 4 cols attacked', level: 3, xPercent: 30 },
      { id: '9', parentId: '1', edgeLabel: 'Q2→c4', mainLabel: '[1, 4, _, _]', subLabel: 'Node 9', nodeOrder: 9, status: 'visited', level: 2, xPercent: 44 },
      { id: '11', parentId: '9', edgeLabel: 'Q3→c2', mainLabel: '[1, 4, 2, _]', subLabel: 'Node 11', nodeOrder: 11, status: 'visited', level: 3, xPercent: 44 },
      { id: '12', parentId: '11', edgeLabel: 'Q4→all', mainLabel: 'Row 4 Dead End', subLabel: 'No safe col in Row 4', nodeOrder: 12, status: 'pruned', pruneReason: '× Dead End', level: 4, xPercent: 44 },
      { id: '16', parentId: '0', edgeLabel: 'Q1→c2', mainLabel: '[2, _, _, _]', subLabel: 'Node 16', nodeOrder: 16, status: 'promising', level: 1, xPercent: 68 },
      { id: '20', parentId: '16', edgeLabel: 'Q2→c4', mainLabel: '[2, 4, _, _]', subLabel: 'Safe!', nodeOrder: 20, status: 'promising', level: 2, xPercent: 68 },
      { id: '21', parentId: '20', edgeLabel: 'Q3→c1', mainLabel: '[2, 4, 1, _]', subLabel: 'Safe!', nodeOrder: 21, status: 'promising', level: 3, xPercent: 68 },
      { id: '24', parentId: '21', edgeLabel: 'Q4→c3', mainLabel: '[2, 4, 1, 3]', subLabel: 'SOLUTION #1!', nodeOrder: 24, status: 'solution', level: 4, xPercent: 68 },
      { id: '25', parentId: '0', edgeLabel: 'Q1→c3', mainLabel: '[3, 1, 4, 2]', subLabel: 'SOLUTION #2 (Mirror)', nodeOrder: 25, status: 'solution', level: 1, xPercent: 90 },
    ];

    steps.push({
      stepNumber: 1,
      codeLine: 1,
      title: 'Step 1 [Branch Q1 at Col 1]: Explore [1, 3, ...] and [1, 4, 2, ...] → Both Hit Dead Ends (×)',
      explanation:
        'Start at Root (0). Try Queen 1 in Column 1 (Node 1): In Row 2, Col 1 (same col) and Col 2 (diagonal) are immediately pruned (×). Trying Q2 at Col 3 (Node 4) leaves zero safe columns in Row 3 (all 4 columns are attacked!). Backtrack and try Q2 at Col 4 (Node 9) → Q3 at Col 2 (Node 11), which leaves zero safe columns in Row 4! Thus Q1 at Col 1 has no solution, so we backtrack all the way to the Root.',
      formula: 'Conflict Check:  col[i] == col[k]   OR   |col[i] − col[k]| == |i − k|',
      variables: { BoardSize: '4 × 4', Q1Col: 1, Status: 'Backtracking to Root' },
      tables: [
        {
          id: '4q-step1',
          title: '4-Queens State-Space Tree Log (Subtree Q1 = Col 1)',
          colHeaders: ['Node', 'Partial Placement (Row 1..4)', 'Feasibility / Pruning Check', 'Action'],
          rows: [
            [cell('Node 1', 'active'), cell('[1, _, _, _]', 'default'), cell('Valid', 'computed'), cell('Expand Row 2', 'default')],
            [cell('Node 2, 3', 'mismatch'), cell('[1, 1] & [1, 2]', 'mismatch'), cell('Col 1 / Diag conflict with Q1', 'mismatch'), cell('Prune (×)', 'mismatch')],
            [cell('Node 4', 'active'), cell('[1, 3, _, _]', 'default'), cell('Row 3 cols 1,2,3,4 all attacked', 'mismatch'), cell('Prune (×) & Backtrack', 'mismatch')],
            [cell('Node 9 → 11', 'active'), cell('[1, 4, 2, _]', 'default'), cell('Row 4 cols 1,2,3,4 all attacked', 'mismatch'), cell('Prune (×) & Backtrack to Root', 'mismatch')],
          ],
        },
      ],
      stateSpaceTreeView: {
        title: '4-Queens Problem State-Space Tree (Lecture 25 Slides 19–55)',
        subtitle: 'Depth-First Search placing Queens row by row (4×4 Board)',
        mode: 'backtracking',
        nodes: nodes.slice(0, 9),
        pruningRuleNote: 'No two queens can share the same row, column, or diagonal (|c_i - c_k| == |i - k|).',
      },
    });

    steps.push({
      stepNumber: 2,
      codeLine: 2,
      title: 'Step 2 [Branch Q1 at Col 2 & Col 3]: Discover Solutions [2, 4, 1, 3] and [3, 1, 4, 2]!',
      explanation:
        'Back at the Root, place Queen 1 in Column 2 (Node 16). In Row 2, Cols 1, 2, 3 are attacked, leaving only Q2 at Col 4 (Node 20). In Row 3, Q3 is placed at Col 1 (Node 21). Finally, in Row 4, Q4 is placed at Col 3 (Node 24) → Complete Valid 4-Queens Solution #1: [2, 4, 1, 3]! By symmetry, Q1 at Col 3 yields Solution #2: [3, 1, 4, 2].',
      formula: 'Solution #1: [Col 2, Col 4, Col 1, Col 3]   |   Solution #2: [Col 3, Col 1, Col 4, Col 2]',
      variables: { Solution1: '[2, 4, 1, 3]', Solution2: '[3, 1, 4, 2]' },
      tables: [
        {
          id: '4q-board',
          title: '4×4 Chessboard — Solution #1: [Col 2, Col 4, Col 1, Col 3]',
          rowHeaders: ['Row 1', 'Row 2', 'Row 3', 'Row 4'],
          colHeaders: ['Col 1', 'Col 2', 'Col 3', 'Col 4'],
          rows: [
            [cell('·', 'default'), cell('♛ Q1', 'match'), cell('·', 'default'), cell('·', 'default')],
            [cell('·', 'default'), cell('·', 'default'), cell('·', 'default'), cell('♛ Q2', 'match')],
            [cell('♛ Q3', 'match'), cell('·', 'default'), cell('·', 'default'), cell('·', 'default')],
            [cell('·', 'default'), cell('·', 'default'), cell('♛ Q4', 'match'), cell('·', 'default')],
          ],
        },
      ],
      stateSpaceTreeView: {
        title: '4-Queens Complete State-Space Tree — Solutions [2, 4, 1, 3] & [3, 1, 4, 2]',
        subtitle: 'Green nodes highlight complete valid 4-Queens placements',
        mode: 'backtracking',
        nodes,
        bestSolutionLabel: 'Solutions: [2, 4, 1, 3] and [3, 1, 4, 2]',
        pruningRuleNote: 'Pruned nodes (×) violate column or diagonal attack constraints.',
      },
      outputString: '4-Queens Solutions: [2, 4, 1, 3] and [3, 1, 4, 2]',
    });

    return steps;
  }

  // Case B: Hamiltonian Circuit Problem (Lecture 25 Slides 56–65)
  if (problemType === 'hamiltonian') {
    const treeNodes: StateSpaceTreeNodeView[] = [
      { id: 'a', mainLabel: 'a', subLabel: 'Start Root (0)', status: 'visited', level: 0, xPercent: 50 },
      { id: 'ab', parentId: 'a', edgeLabel: 'a→b', mainLabel: 'b', subLabel: 'Node 1', status: 'promising', level: 1, xPercent: 50 },
      { id: 'abc', parentId: 'ab', edgeLabel: 'b→c', mainLabel: 'c', subLabel: 'Node 2', status: 'visited', level: 2, xPercent: 28 },
      { id: 'abcd', parentId: 'abc', edgeLabel: 'c→d', mainLabel: 'd', subLabel: 'Node 3', status: 'visited', level: 3, xPercent: 18 },
      { id: 'abcde', parentId: 'abcd', edgeLabel: 'd→e', mainLabel: 'e', subLabel: 'Node 4', status: 'visited', level: 4, xPercent: 18 },
      { id: 'abcdef', parentId: 'abcde', edgeLabel: 'e→f', mainLabel: 'f (×)', subLabel: 'No edge f→a', status: 'pruned', pruneReason: '× Dead End (f∉adj(a))', level: 5, xPercent: 18 },
      { id: 'abcf', parentId: 'abc', edgeLabel: 'c→f', mainLabel: 'f', subLabel: 'Node 6', status: 'visited', level: 3, xPercent: 40 },
      { id: 'abcfe', parentId: 'abcf', edgeLabel: 'f→e', mainLabel: 'e', subLabel: 'Node 7', status: 'visited', level: 4, xPercent: 40 },
      { id: 'abcfed', parentId: 'abcfe', edgeLabel: 'e→d', mainLabel: 'd (×)', subLabel: 'Wait: d→a valid or dead end', status: 'pruned', pruneReason: '× Dead End', level: 5, xPercent: 40 },
      { id: 'abf', parentId: 'ab', edgeLabel: 'b→f', mainLabel: 'f', subLabel: 'Node 8', status: 'promising', level: 2, xPercent: 72 },
      { id: 'abfe', parentId: 'abf', edgeLabel: 'f→e', mainLabel: 'e', subLabel: 'Node 9', status: 'promising', level: 3, xPercent: 72 },
      { id: 'abfec', parentId: 'abfe', edgeLabel: 'e→c', mainLabel: 'c', subLabel: 'Node 10', status: 'promising', level: 4, xPercent: 72 },
      { id: 'abfecd', parentId: 'abfec', edgeLabel: 'c→d', mainLabel: 'd → a', subLabel: 'SOLUTION!', status: 'solution', level: 5, xPercent: 72 },
    ];

    return [
      {
        stepNumber: 1,
        codeLine: 1,
        title: 'Hamiltonian Circuit Backtracking Trace (Lecture 25 Slides 56–65): Graph {a, b, c, d, e, f}',
        explanation:
          'Starting at vertex a (level 0): First path a → b → c → d → e → f visits all 6 vertices, but f has no edge back to a → Dead End (×)! Backtrack to c and try a → b → c → f → e (cannot reach d & a) → Dead End (×). Backtrack to b and take a → b → f → e → c → d → a, which visits every vertex exactly once and returns to a!',
        formula: 'Hamiltonian Circuit Found:  a → b → f → e → c → d → a',
        variables: { StartVertex: 'a', SolutionCircuit: 'a → b → f → e → c → d → a' },
        tables: [
          {
            id: 'ham-table',
            title: 'Hamiltonian Circuit DFS Path Exploration & Backtracking Log',
            colHeaders: ['Branch #', 'DFS Path Explored', 'Outcome / Constraint Check'],
            rows: [
              [cell('Path 1', 'compare'), cell('a → b → c → d → e → f', 'mismatch'), cell('× Dead End: f is not adjacent to start vertex a', 'mismatch')],
              [cell('Path 2', 'compare'), cell('a → b → c → f → e', 'mismatch'), cell('× Dead End: cannot complete circuit through d to a', 'mismatch')],
              [cell('Path 3', 'match'), cell('a → b → f → e → c → d → a', 'path'), cell('✓ Valid Hamiltonian Circuit!', 'match')],
            ],
          },
        ],
        stateSpaceTreeView: {
          title: 'Hamiltonian Circuit State-Space Tree (Lecture 25 Slides 58–65)',
          subtitle: 'DFS exploration from vertex a with dead-end backtracking',
          mode: 'backtracking',
          nodes: treeNodes,
          bestSolutionLabel: 'Hamiltonian Circuit: a → b → f → e → c → d → a',
        },
        outputString: 'Hamiltonian Circuit: a → b → f → e → c → d → a',
      },
    ];
  }

  // Case C: Subset-Sum Problem (Lecture 25 & Fall 2025 Final Q6 + Fall 2025 CFE Q5a)
  const S = setSStr
    .split(',')
    .map((s) => parseFloat(s.trim()))
    .filter((n) => !Number.isNaN(n))
    .sort((a, b) => a - b);
  const d = parseFloat(targetDStr) || 13;
  const stopAtFirst = stopAtFirstStr.trim().toLowerCase() === 'true';
  const n = S.length;

  const suffixSums = new Array(n + 1).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    suffixSums[i] = suffixSums[i + 1] + S[i];
  }

  const allTreeNodes: StateSpaceTreeNodeView[] = [];
  const foundSubsets: number[][] = [];
  const steps: TraceStep[] = [];
  let nodeCounter = 0;
  let halted = false;

  function dfs(
    level: number,
    currentSum: number,
    chosen: number[],
    parentId: string | undefined,
    edgeLabel: string | undefined,
    xMin: number,
    xMax: number
  ) {
    if (halted) return;
    const myId = `n${nodeCounter++}`;
    const xPercent = (xMin + xMax) / 2;
    const remSum = suffixSums[level];
    const nextElem = level < n ? S[level] : Infinity;

    let status: StateSpaceTreeNodeView['status'] = 'promising';
    let pruneReason: string | undefined;
    let subLabel = `rem=${remSum}`;

    if (currentSum === d) {
      status = 'solution';
      subLabel = `✓ Sum = ${d}`;
      foundSubsets.push([...chosen]);
    } else if (currentSum > d) {
      status = 'pruned';
      pruneReason = `× (${currentSum} > ${d})`;
      subLabel = pruneReason;
    } else if (level === n) {
      status = 'pruned';
      pruneReason = `× (${currentSum} ≠ ${d})`;
      subLabel = pruneReason;
    } else if (currentSum + nextElem > d) {
      status = 'pruned';
      pruneReason = `× (${currentSum}+${nextElem} > ${d})`;
      subLabel = pruneReason;
    } else if (currentSum + remSum < d) {
      status = 'pruned';
      pruneReason = `× (${currentSum}+${remSum} < ${d})`;
      subLabel = pruneReason;
    }

    const nodeObj: StateSpaceTreeNodeView = {
      id: myId,
      parentId,
      edgeLabel,
      mainLabel: String(currentSum),
      subLabel,
      nodeOrder: nodeCounter,
      status,
      pruneReason,
      level,
      xPercent,
    };
    allTreeNodes.push(nodeObj);

    // Record step for major milestones or every node when tree is small
    const shouldSnapshot =
      n <= 4 ||
      stopAtFirst ||
      status === 'solution' ||
      status === 'pruned' ||
      level <= 1;

    if (shouldSnapshot) {
      const snapshotNodes = allTreeNodes.map((nd) => ({
        ...nd,
        status: nd.id === myId && nd.status === 'promising' ? 'active' : nd.status,
      }));

      const titleAction =
        status === 'solution'
          ? `SOLUTION FOUND! Subset { ${chosen.join(', ')} } Sums to d = ${d}`
          : status === 'pruned'
          ? `Prune Node (s' = ${currentSum}) at Level ${level}: ${pruneReason} → Backtrack!`
          : `Level ${level} (${edgeLabel || 'Root'}): Partial Sum s' = ${currentSum} (Promising)`;

      const expl =
        status === 'solution'
          ? `Partial sum s' = ${currentSum} equals target d = ${d}! Record valid subset { ${chosen.join(', ')} }.${
              stopAtFirst ? ' Since "Stop at First Solution" is enabled, halt immediately!' : ' Backtrack to search for additional subsets.'
            }`
          : status === 'pruned'
          ? `At level ${level} with partial subset { ${chosen.join(', ') || '∅'} } and sum s' = ${currentSum}, check backtracking pruning inequalities: ${pruneReason}. Mark node as Non-Promising (×) and backtrack to parent!`
          : `At level ${level} with subset { ${chosen.join(', ') || '∅'} }, current sum is s' = ${currentSum}. Next element is s_${level + 1} = ${nextElem} (${currentSum}+${nextElem} = ${currentSum + nextElem} ≤ ${d}) and max possible sum is ${currentSum}+${remSum} = ${currentSum + remSum} ≥ ${d}. Node is PROMISING → branch Left (With ${nextElem}) and Right (Without ${nextElem}).`;

      steps.push({
        stepNumber: steps.length + 1,
        codeLine: status === 'solution' ? 3 : status === 'pruned' ? 7 : 8,
        title: titleAction,
        explanation: expl,
        formula: `s' = ${currentSum}  |  Subset = { ${chosen.join(', ') || '∅'} }  |  ${
          pruneReason || (status === 'solution' ? `s' == ${d} ✓` : `s' + s_${level + 1} = ${currentSum + nextElem} ≤ ${d} & s' + rem = ${currentSum + remSum} ≥ ${d}`)
        }`,
        variables: {
          Level: level,
          CurrentSum: currentSum,
          CurrentSubset: `{ ${chosen.join(', ') || '∅'} }`,
          Status: status.toUpperCase(),
          SolutionsSoFar: foundSubsets.map((sub) => `{${sub.join(',')}}`).join(', ') || 'None yet',
        },
        tables: [
          {
            id: `bt-sub-table-${steps.length}`,
            title: `Subset-Sum Backtracking State Table (S = {${S.join(', ')}}, d = ${d})`,
            colHeaders: ['Current Level i', 'Current Subset', 'Partial Sum s\'', 'Next s_{i+1} Check (s\'+s_{i+1} > d)', 'Remaining Sum Check (s\'+∑s_j < d)', 'Node Decision'],
            rows: [
              [
                cell(`Level ${level}`, 'active'),
                cell(`{ ${chosen.join(', ') || '∅'} }`, 'computed'),
                cell(currentSum, status === 'solution' ? 'match' : status === 'pruned' ? 'mismatch' : 'active', undefined, undefined, `bt-sum-${steps.length}`, currentSum),
                cell(
                  level < n ? `${currentSum} + ${nextElem} = ${currentSum + nextElem} ${currentSum + nextElem > d ? `> ${d} (FAIL)` : `≤ ${d} (OK)`}` : '—',
                  level < n && currentSum + nextElem > d ? 'mismatch' : 'default'
                ),
                cell(
                  `${currentSum} + ${remSum} = ${currentSum + remSum} ${currentSum + remSum < d ? `< ${d} (FAIL)` : `≥ ${d} (OK)`}`,
                  currentSum + remSum < d ? 'mismatch' : 'default'
                ),
                cell(
                  status === 'solution' ? `✓ SOLUTION {${chosen.join(', ')}}` : status === 'pruned' ? `✗ PRUNE ${pruneReason}` : '✓ PROMISING (Expand)',
                  status === 'solution' ? 'path' : status === 'pruned' ? 'mismatch' : 'match'
                ),
              ],
            ],
          },
        ],
        stateSpaceTreeView: {
          title: `Subset-Sum State-Space Tree — S = { ${S.join(', ')} }, d = ${d}`,
          subtitle: `Nodes generated: ${snapshotNodes.length} | Valid Subsets Found: ${
            foundSubsets.map((sub) => `{${sub.join(', ')}}`).join(', ') || 'Searching...'
          }`,
          mode: 'backtracking',
          nodes: snapshotNodes,
          bestSolutionLabel:
            foundSubsets.length > 0
              ? `Valid Subset(s) Summing to ${d}: ${foundSubsets.map((sub) => `{ ${sub.join(', ')} }`).join(', ')}`
              : undefined,
          pruningRuleNote: `Prune (×) when: (1) s' + s_{i+1} > ${d}   OR   (2) s' + ∑_{j=i+1..n} s_j < ${d}`,
        },
        outputString:
          foundSubsets.length > 0
            ? `Subsets with sum d = ${d}: ${foundSubsets.map((sub) => `{ ${sub.join(', ')} }`).join(', ')}`
            : undefined,
      });
    }

    if (status === 'solution' && stopAtFirst) {
      halted = true;
      return;
    }

    if (status === 'promising' && level < n) {
      const mid = (xMin + xMax) / 2;
      // Left branch: Include S[level] ("w/ S[level]")
      dfs(level + 1, currentSum + S[level], [...chosen, S[level]], myId, `w/ ${S[level]}`, xMin, mid);
      // Right branch: Exclude S[level] ("w/o S[level]")
      dfs(level + 1, currentSum, chosen, myId, `w/o ${S[level]}`, mid, xMax);
    }
  }

  dfs(0, 0, [], undefined, undefined, 4, 96);

  // Final Summary Step if not stopAtFirst
  if (!stopAtFirst) {
    steps.push({
      stepNumber: steps.length + 1,
      codeLine: 9,
      title: `Complete State-Space Tree Summary: Found ${foundSubsets.length} Subset(s) Summing to d = ${d}`,
      explanation: `Backtracking search complete! Across the entire state-space tree (${allTreeNodes.length} nodes explored), the subsets of S = { ${S.join(', ')} } that sum to d = ${d} are: ${
        foundSubsets.map((sub) => `{ ${sub.join(', ')} }`).join(', ') || 'None'
      }.`,
      formula: `Valid Subsets:  ${foundSubsets.map((sub) => `{ ${sub.join(', ')} }`).join(', ') || '∅'}`,
      variables: {
        TotalNodesGenerated: allTreeNodes.length,
        SolutionCount: foundSubsets.length,
        FinalSubsets: foundSubsets.map((sub) => `{${sub.join(', ')}}`).join(', '),
      },
      tables: [
        {
          id: 'bt-final-summary',
          title: `Final Solution Subsets for S = { ${S.join(', ')} }, d = ${d}`,
          colHeaders: ['Solution #', 'Selected Subset', 'Verification Sum'],
          rows:
            foundSubsets.length > 0
              ? foundSubsets.map((sub, i) => [
                  cell(`Subset #${i + 1}`, 'active'),
                  cell(`{ ${sub.join(', ')} }`, 'path', undefined, undefined, `bt-sol-${i}`, `{ ${sub.join(', ')} }`),
                  cell(`${sub.join(' + ')} = ${d} ✓`, 'match'),
                ])
              : [[cell('—', 'default'), cell('No subset sums to d', 'mismatch'), cell('—', 'default')]],
        },
      ],
      stateSpaceTreeView: {
        title: `Complete Subset-Sum State-Space Tree — S = { ${S.join(', ')} }, d = ${d}`,
        subtitle: `All ${foundSubsets.length} solution leaf node(s) highlighted in green`,
        mode: 'backtracking',
        nodes: allTreeNodes,
        bestSolutionLabel: `Solutions: ${foundSubsets.map((sub) => `{ ${sub.join(', ')} }`).join(', ')}`,
        pruningRuleNote: `Pruned (×) nodes failed s' + s_{i+1} ≤ ${d} or s' + remaining ≥ ${d}.`,
      },
      outputString: `Subsets: ${foundSubsets.map((sub) => `{ ${sub.join(', ')} }`).join(', ')}`,
    });
  }

  return steps;
}

// ============================================================================
// 6. BRANCH AND BOUND TRACE GENERATOR (0-1 Knapsack & Assignment Problem — Lecture 26 & Fall 2025 CFE Q5b)
// ============================================================================
export function generateBranchAndBoundSteps(
  problemTypeStr: string,
  itemsStr: string,
  capacityStr: string
): TraceStep[] {
  const problemType = (problemTypeStr || 'knapsack').trim().toLowerCase();

  // Case A: Assignment Problem Branch and Bound (Lecture 26 Slides 20–59)
  if (problemType === 'assignment') {
    const costMatrix = itemsStr
      .split(';')
      .map((r) =>
        r
          .trim()
          .split(/[\s,]+/)
          .map(Number)
          .filter((x) => !Number.isNaN(x))
      )
      .filter((r) => r.length > 0);

    const n = costMatrix.length;
    const rowMins = costMatrix.map((r) => Math.min(...r));
    const rootLb = rowMins.reduce((a, b) => a + b, 0);

    const nodes: StateSpaceTreeNodeView[] = [
      { id: '0', mainLabel: `Root (0)`, subLabel: `lb = ${rowMins.join('+')} = ${rootLb}`, nodeOrder: 0, status: 'visited', level: 0, xPercent: 50 },
      { id: '1', parentId: '0', edgeLabel: 'a→1', mainLabel: 'a→1 (Node 1)', subLabel: 'lb = 9+3+1+4 = 17', nodeOrder: 1, status: 'pruned', pruneReason: 'lb=17 > 13', level: 1, xPercent: 15 },
      { id: '2', parentId: '0', edgeLabel: 'a→2', mainLabel: 'a→2 (Node 2)', subLabel: 'lb = 2+3+1+4 = 10? No, col 2 taken → 2+3+1+6 = 12 ★', nodeOrder: 2, status: 'promising', level: 1, xPercent: 40 },
      { id: '3', parentId: '0', edgeLabel: 'a→3', mainLabel: 'a→3 (Node 3)', subLabel: 'lb = 7+4+5+4 = 20', nodeOrder: 3, status: 'pruned', pruneReason: 'lb=20 > 13', level: 1, xPercent: 65 },
      { id: '4', parentId: '0', edgeLabel: 'a→4', mainLabel: 'a→4 (Node 4)', subLabel: 'lb = 8+3+1+6 = 18', nodeOrder: 4, status: 'pruned', pruneReason: 'lb=18 > 13', level: 1, xPercent: 88 },
      { id: '5', parentId: '2', edgeLabel: 'b→1', mainLabel: 'a→2, b→1 (Node 5)', subLabel: 'lb = 2+6+1+4 = 13 ★', nodeOrder: 5, status: 'promising', level: 2, xPercent: 22 },
      { id: '6', parentId: '2', edgeLabel: 'b→3', mainLabel: 'a→2, b→3 (Node 6)', subLabel: 'lb = 2+3+5+4 = 14', nodeOrder: 6, status: 'pruned', pruneReason: 'lb=14 > 13', level: 2, xPercent: 45 },
      { id: '7', parentId: '2', edgeLabel: 'b→4', mainLabel: 'a→2, b→4 (Node 7)', subLabel: 'lb = 2+7+1+7 = 17', nodeOrder: 7, status: 'pruned', pruneReason: 'lb=17 > 13', level: 2, xPercent: 68 },
      { id: '8', parentId: '5', edgeLabel: 'c→3, d→4', mainLabel: 'c→3, d→4 (Node 8)', subLabel: 'cost = 2+6+1+4 = 13 (OPTIMAL!)', nodeOrder: 8, status: 'solution', level: 3, xPercent: 18 },
      { id: '9', parentId: '5', edgeLabel: 'c→4, d→3', mainLabel: 'c→4, d→3 (Node 9)', subLabel: 'cost = 2+6+8+9 = 25', nodeOrder: 9, status: 'pruned', pruneReason: 'cost=25 > 13', level: 3, xPercent: 42 },
    ];

    const steps: TraceStep[] = [
      {
        stepNumber: 1,
        codeLine: 1,
        title: `Step 1 [Root Lower Bound & Level 1 Branching]: Root lb = ${rootLb}; Expand Best Node a→2 (lb = 12)`,
        explanation:
          'At Root (Node 0), sum the minimum of each row: 2 + 3 + 1 + 4 = 10. Branch for Person a (Row 1): a→1 gives lb = 9+3+1+4 = 17; a→2 gives lb = 2+3+1+6 = 12 (since col 2 is taken, Row 4 min from {1,3,4} is 6); a→3 gives lb = 7+4+5+4 = 20; a→4 gives lb = 8+3+1+6 = 18. Best-First B&B selects Node 2 (a→2, smallest lb = 12)!',
        formula: 'lb = (cost of assigned rows) + ∑ (min available cost in each unassigned row)',
        variables: { RootLB: rootLb, BestLevel1Node: 'Node 2 (a→2, lb = 12)' },
        tables: [
          {
            id: 'assign-matrix',
            title: 'Assignment Problem Cost Matrix C (4 Persons × 4 Jobs)',
            rowHeaders: ['Person a', 'Person b', 'Person c', 'Person d'],
            colHeaders: ['Job 1', 'Job 2', 'Job 3', 'Job 4', 'Row Min'],
            rows: costMatrix.map((r, i) => [
              ...r.map((val, j) => cell(val, (i === 0 && j === 1) || (i === 1 && j === 0) || (i === 2 && j === 2) || (i === 3 && j === 3) ? 'match' : 'default')),
              cell(rowMins[i], 'computed'),
            ]),
          },
        ],
        stateSpaceTreeView: {
          title: 'Assignment Problem Best-First Branch & Bound Tree (Lecture 26 Slides 20–45)',
          subtitle: 'Level 0 and Level 1 nodes (selecting minimum lb = 12 at Node 2)',
          mode: 'branch-and-bound',
          nodes: nodes.slice(0, 5),
          liveNodesLabel: 'Live Nodes: Node 1 (lb=17), Node 2 (lb=12 ★), Node 3 (lb=20), Node 4 (lb=18)',
        },
      },
      {
        stepNumber: 2,
        codeLine: 3,
        title: 'Step 2 [Level 2 & Level 3 Expansion]: Expand Node 2 (a→2) → Node 5 (b→1, lb = 13) → Optimal Leaf Node 8 (Cost = 13)!',
        explanation:
          'From Node 2 (a→2), assign Person b to remaining jobs {1, 3, 4}: b→1 (Node 5) has lb = 2+6+1+4 = 13; b→3 (Node 6) has lb = 2+3+5+4 = 14; b→4 (Node 7) has lb = 2+7+1+7 = 17. Expand best live node Node 5 (lb = 13): leaf Node 8 (c→3, d→4) has exact cost 2+6+1+4 = 13, while Node 9 (c→4, d→3) has cost 25. Since all other live nodes have lb ≥ 14 > 13, Node 8 is GLOBALLY OPTIMAL!',
        formula: 'Optimal Assignment: a → Job 2 (2), b → Job 1 (6), c → Job 3 (1), d → Job 4 (4)  ⇒  Min Cost = 13',
        variables: { OptimalAssignment: 'a→2, b→1, c→3, d→4', MinTotalCost: 13 },
        tables: [
          {
            id: 'assign-summary',
            title: 'Branch and Bound Node Evaluation Summary',
            colHeaders: ['Node', 'Partial / Complete Assignment', 'Lower Bound lb / Cost', 'Status'],
            rows: [
              [cell('Node 0 (Root)', 'default'), cell('None', 'default'), cell('lb = 2+3+1+4 = 10', 'computed'), cell('Expanded', 'default')],
              [cell('Node 2', 'active'), cell('a → 2', 'computed'), cell('lb = 2+3+1+6 = 12', 'match'), cell('Best Level 1 → Expanded', 'match')],
              [cell('Node 5', 'active'), cell('a → 2, b → 1', 'computed'), cell('lb = 2+6+1+4 = 13', 'match'), cell('Best Level 2 → Expanded', 'match')],
              [cell('Node 8 (Leaf)', 'path'), cell('a → 2, b → 1, c → 3, d → 4', 'path'), cell('Cost = 13', 'path', undefined, undefined, 'bb-assign-opt', 13), cell('✓ OPTIMAL SOLUTION!', 'path')],
              [cell('Nodes 1,3,4,6,7', 'mismatch'), cell('Other branches', 'default'), cell('lb ∈ {14, 17, 18, 20} > 13', 'mismatch'), cell('Pruned (Inferior lb)', 'mismatch')],
            ],
          },
        ],
        stateSpaceTreeView: {
          title: 'Complete Assignment Problem Branch-and-Bound Tree (Min Cost = 13)',
          subtitle: 'Node 8 achieves cost = 13, pruning all remaining live nodes (lb ≥ 14)',
          mode: 'branch-and-bound',
          nodes,
          liveNodesLabel: 'Remaining Live Nodes: lb = 14, 17, 17, 18, 20 (All > 13 → Pruned!)',
          bestSolutionLabel: 'Optimal Assignment: a→2, b→1, c→3, d→4 (Total Cost = 13)',
        },
        outputString: 'Optimal Assignment: a→Job 2, b→Job 1, c→Job 3, d→Job 4 (Minimum Cost = 13)',
      },
    ];

    return steps;
  }

  // Case B: 0-1 Knapsack Branch and Bound (Lecture 26 Slides 66–98 & Fall 2025 CFE Q5b)
  const W = parseFloat(capacityStr) || 5;
  interface KnapItem {
    origId: string;
    w: number;
    v: number;
    ratio: number;
  }

  const rawItems: KnapItem[] = [];
  itemsStr
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((tok, idx) => {
      const parts = tok.split(':').map((x) => x.trim());
      if (parts.length >= 3) {
        const w = parseFloat(parts[1]) || 1;
        const v = parseFloat(parts[2]) || 0;
        rawItems.push({ origId: parts[0], w, v, ratio: v / w });
      } else if (parts.length === 2) {
        const w = parseFloat(parts[0]) || 1;
        const v = parseFloat(parts[1]) || 0;
        rawItems.push({ origId: String(idx + 1), w, v, ratio: v / w });
      }
    });

  // Sort items in decreasing order of v_i / w_i ratio
  const sortedItems = [...rawItems].sort((a, b) => b.ratio - a.ratio);
  const n = sortedItems.length;

  const fmtRatio = (r: number) => (Math.abs(r - Math.round(r * 100) / 100) < 1e-6 ? Number(r.toFixed(2)).toString() : r.toFixed(2));

  const calcUB = (level: number, w: number, v: number): { ub: number; formula: string } => {
    const nextRatio = level < n ? Number(sortedItems[level].ratio.toFixed(2)) : 0;
    const ubVal = Number((v + (W - w) * nextRatio).toFixed(2));
    return {
      ub: ubVal,
      formula: level < n ? `${v} + (${W} − ${w}) × ${fmtRatio(nextRatio)} = ${ubVal}` : `${v} + 0 = ${v}`,
    };
  };

  const steps: TraceStep[] = [];

  // Step 1: Sort Items by v_i / w_i Ratio
  steps.push({
    stepNumber: 1,
    codeLine: 1,
    title: `Step 1 [Preprocessing]: Sort All ${n} Items in Decreasing Order of Value-to-Weight Ratio (vᵢ / wᵢ)`,
    explanation: `Before constructing the Branch-and-Bound state-space tree, compute each item's unit payoff ratio rᵢ = vᵢ / wᵢ and sort in descending order: ${sortedItems
      .map((it) => `Item ${it.origId} (w=${it.w}, v=$${it.v}, r=${fmtRatio(it.ratio)})`)
      .join(' ≥ ')}.`,
    formula: 'Sort Order:  v₁/w₁ ≥ v₂/w₂ ≥ ... ≥ vₙ/wₙ   |   ub = v + (W − w) × (v_{i+1} / w_{i+1})',
    variables: {
      CapacityW: W,
      SortedOrder: sortedItems.map((it) => `Item ${it.origId} (r=${fmtRatio(it.ratio)})`).join(' → '),
    },
    tables: [
      {
        id: 'bb-sorted-items',
        title: `Sorted Items Table by Payoff Ratio vᵢ / wᵢ (Capacity W = ${W})`,
        colHeaders: ['Sorted Rank', 'Item ID', 'Weight wᵢ', 'Value vᵢ ($)', 'Ratio vᵢ / wᵢ (Payoff per Unit)'],
        rows: sortedItems.map((it, idx) => [
          cell(`#${idx + 1}`, 'active'),
          cell(`Item ${it.origId}`, 'match'),
          cell(it.w, 'default'),
          cell(`$${it.v}`, 'computed'),
          cell(
            fmtRatio(it.ratio),
            'path',
            `v/w = ${it.v}/${it.w}`,
            undefined,
            `bb-ratio-${it.origId}`,
            fmtRatio(it.ratio)
          ),
        ]),
      },
    ],
  });

  // Build B&B State-Space Tree
  interface BBNode {
    id: string;
    parentId?: string;
    edgeLabel?: string;
    level: number;
    w: number;
    v: number;
    ub: number;
    ubFormula: string;
    chosenIds: string[];
    feasible: boolean;
    expanded: boolean;
    isSolution: boolean;
    xPercent: number;
  }

  const rootUB = calcUB(0, 0, 0);
  const bbNodes: BBNode[] = [
    {
      id: '0',
      level: 0,
      w: 0,
      v: 0,
      ub: rootUB.ub,
      ubFormula: rootUB.formula,
      chosenIds: [],
      feasible: true,
      expanded: false,
      isSolution: false,
      xPercent: 50,
    },
  ];

  let bestValue = 0;
  let bestSubset: string[] = [];

  const toTreeNodesView = (activeId?: string, finalMark?: boolean): StateSpaceTreeNodeView[] =>
    bbNodes.map((nd, idx) => {
      let status: StateSpaceTreeNodeView['status'] = 'promising';
      let pruneReason: string | undefined;

      if (!nd.feasible) {
        status = 'pruned';
        pruneReason = `X (w=${nd.w} > ${W})`;
      } else if (finalMark && nd.v === bestValue && nd.w <= W && (nd.level === n || nd.ub === bestValue)) {
        status = 'solution';
      } else if (finalMark && !nd.expanded && nd.ub <= bestValue) {
        status = 'pruned';
        pruneReason = `ub=${nd.ub} ≤ ${bestValue}`;
      } else if (nd.id === activeId) {
        status = 'active';
      } else if (nd.expanded) {
        status = 'visited';
      }

      return {
        id: nd.id,
        parentId: nd.parentId,
        edgeLabel: nd.edgeLabel,
        mainLabel: nd.feasible ? `w=${nd.w}, v=${nd.v}` : `w=${nd.w} (X)`,
        subLabel: nd.feasible ? `ub = ${nd.ub}` : `Not Feasible (> ${W})`,
        nodeOrder: idx,
        status,
        pruneReason,
        level: nd.level,
        xPercent: nd.xPercent,
      };
    });

  // Step 2: Root Node
  steps.push({
    stepNumber: 2,
    codeLine: 2,
    title: `Step 2 [Root Node 0]: Initialize w = 0, v = 0, and Upper Bound ub = ${rootUB.ub}`,
    explanation: `At the Root (Level 0, before considering Item ${sortedItems[0]?.origId}), weight w = 0 and value v = 0. Using the highest ratio r₁ = ${fmtRatio(sortedItems[0]?.ratio || 0)}, the upper bound is ub = ${rootUB.formula}.`,
    formula: `Root (Node 0):  w = 0,  v = 0,  ub = ${rootUB.formula}`,
    variables: { Node: 'Root (0)', w: 0, v: 0, ub: rootUB.ub },
    tables: [
      {
        id: 'bb-root-table',
        title: 'Branch and Bound Node Calculation Table',
        colHeaders: ['Node', 'Decision Branch', 'Selected Items', 'Weight w', 'Value v', 'Upper Bound Formula ub = v + (W−w)·r_{i+1}'],
        rows: [
          [
            cell('Node 0', 'active'),
            cell('Root (Level 0)', 'default'),
            cell('{ }', 'default'),
            cell(0, 'default'),
            cell(0, 'default'),
            cell(rootUB.formula, 'match', undefined, undefined, 'bb-ub-0', rootUB.ub),
          ],
        ],
      },
    ],
    stateSpaceTreeView: {
      title: `0-1 Knapsack Branch-and-Bound Tree (W = ${W})`,
      subtitle: `Root initialized with ub = ${rootUB.ub}`,
      mode: 'branch-and-bound',
      nodes: toTreeNodesView('0'),
      liveNodesLabel: `Live Nodes: Node 0 (ub = ${rootUB.ub})`,
    },
  });

  // Expand B&B tree
  // Note: In Fall 2025 CFE Q5b (W=5), the exam diagram expands Root -> (With 2 [ub=18], Without 2 [ub=17.5]),
  // AND expands BOTH Level 1 nodes on Item 4, then continues down the left branch (With 2, With 4 [ub=16.34]) -> Without 3 [ub=16] -> With 1 [ub=16]!
  const isExamW5 = W === 5 && n === 4 && sortedItems[0].origId === '2' && sortedItems[1].origId === '4';

  for (let stepIter = 1; stepIter <= 8; stepIter++) {
    // Pick best unexpanded feasible live node with level < n and ub > bestValue
    const candidates = bbNodes.filter((nd) => nd.feasible && !nd.expanded && nd.level < n && nd.ub > bestValue);
    if (candidates.length === 0) break;

    candidates.sort((a, b) => b.ub - a.ub);
    let chosen = candidates[0];

    // If Exam W=5 and we just expanded "With 2" (so "Without 2" with ub=17.5 is top candidate), let's also expand "Without 2" on Item 4 just like the exam sheet!
    chosen.expanded = true;
    const item = sortedItems[chosen.level];
    const spread = 24 / Math.pow(1.65, chosen.level);

    // Left Child: With item
    const wL = chosen.w + item.w;
    const vL = chosen.v + item.v;
    const feasibleL = wL <= W;
    const ubL = feasibleL ? calcUB(chosen.level + 1, wL, vL) : { ub: -1, formula: `w = ${wL} > ${W} (Not Feasible X)` };
    const leftId = String(bbNodes.length);
    const leftChosen = [...chosen.chosenIds, item.origId];
    if (feasibleL && vL > bestValue) {
      bestValue = vL;
      bestSubset = leftChosen;
    }
    bbNodes.push({
      id: leftId,
      parentId: chosen.id,
      edgeLabel: `With ${item.origId}`,
      level: chosen.level + 1,
      w: wL,
      v: vL,
      ub: ubL.ub,
      ubFormula: ubL.formula,
      chosenIds: leftChosen,
      feasible: feasibleL,
      expanded: false,
      isSolution: false,
      xPercent: Math.max(6, Math.min(94, chosen.xPercent - spread)),
    });

    // Right Child: Without item
    const wR = chosen.w;
    const vR = chosen.v;
    const ubR = calcUB(chosen.level + 1, wR, vR);
    const rightId = String(bbNodes.length);
    bbNodes.push({
      id: rightId,
      parentId: chosen.id,
      edgeLabel: `Without ${item.origId}`,
      level: chosen.level + 1,
      w: wR,
      v: vR,
      ub: ubR.ub,
      ubFormula: ubR.formula,
      chosenIds: [...chosen.chosenIds],
      feasible: true,
      expanded: false,
      isSolution: false,
      xPercent: Math.max(6, Math.min(94, chosen.xPercent + spread)),
    });

    // In the Fall 2025 CFE Q5b diagram, if we just expanded "Without 2" (ub=17.5), its children are (w=2,v=7,ub=15.01) and (w=0,v=0,ub=13.35), which won't be expanded further.
    if (isExamW5 && chosen.edgeLabel === 'Without 2') {
      bbNodes[bbNodes.length - 2].expanded = true;
      bbNodes[bbNodes.length - 1].expanded = true;
    }

    const liveAfter = bbNodes.filter((nd) => nd.feasible && !nd.expanded && nd.level < n && nd.ub > bestValue);

    steps.push({
      stepNumber: steps.length + 1,
      codeLine: 6,
      title: `Branch from Node ${chosen.id} (${chosen.edgeLabel || 'Root'}, ub=${chosen.ub}) on Item ${item.origId} (w=${item.w}, v=$${item.v})`,
      explanation: `Expand Node ${chosen.id} (w=${chosen.w}, v=${chosen.v}, ub=${chosen.ub}) on sorted item #${chosen.level + 1} (Item ${item.origId}: w=${item.w}, v=$${item.v}):\n• Left Child (Node ${leftId}, "With ${item.origId}"): ${
        feasibleL ? `w = ${wL}, v = ${vL}, ub = ${ubL.formula}` : `w = ${chosen.w} + ${item.w} = ${wL} > ${W} → Not Feasible (X)!`
      }\n• Right Child (Node ${rightId}, "Without ${item.origId}"): w = ${wR}, v = ${vR}, ub = ${ubR.formula}.`,
      formula: `With ${item.origId}: ${ubL.formula}   |   Without ${item.origId}: ${ubR.formula}`,
      variables: {
        ExpandedNode: `Node ${chosen.id} (${chosen.edgeLabel || 'Root'})`,
        LeftChild: feasibleL ? `w=${wL}, v=${vL}, ub=${ubL.ub}` : `w=${wL} > ${W} (X)`,
        RightChild: `w=${wR}, v=${vR}, ub=${ubR.ub}`,
        BestValueSoFar: `$${bestValue} ({${bestSubset.join(', ')}})`,
      },
      tables: [
        {
          id: `bb-table-${stepIter}`,
          title: `Branch-and-Bound State-Space Tree Nodes (After Expanding Node ${chosen.id})`,
          colHeaders: ['Node', 'Branch', 'Subset', 'Weight w', 'Value v', 'Upper Bound ub Formula', 'Status'],
          rows: bbNodes.map((nd) => [
            cell(`Node ${nd.id}`, nd.id === leftId || nd.id === rightId ? 'active' : 'default'),
            cell(nd.edgeLabel || 'Root', 'default'),
            cell(`{ ${nd.chosenIds.join(', ')} }`, 'default'),
            cell(nd.w, nd.feasible ? 'default' : 'mismatch'),
            cell(nd.feasible ? `$${nd.v}` : '—', nd.v === bestValue && nd.feasible ? 'match' : 'default'),
            cell(
              nd.ubFormula,
              nd.feasible ? 'computed' : 'mismatch',
              undefined,
              undefined,
              `bb-node-ub-${nd.id}`,
              nd.feasible ? nd.ub : 'X'
            ),
            cell(
              !nd.feasible ? '✗ Not Feasible (X)' : nd.expanded ? 'Expanded' : `Live (ub=${nd.ub})`,
              !nd.feasible ? 'mismatch' : nd.expanded ? 'default' : 'match'
            ),
          ]),
        },
      ],
      stateSpaceTreeView: {
        title: `0-1 Knapsack Branch-and-Bound Tree (W = ${W})`,
        subtitle: `Expanded Node ${chosen.id} on Item ${item.origId} → Best Value So Far = $${bestValue}`,
        mode: 'branch-and-bound',
        nodes: toTreeNodesView(leftId),
        liveNodesLabel: `Live Nodes: ${liveAfter.map((l) => `Node ${l.id} (ub=${l.ub})`).join(', ') || 'None > BestValue'}`,
        bestSolutionLabel: `Best Feasible Solution So Far: Subset { ${bestSubset.join(', ')} } → Value = $${bestValue}`,
      },
    });
  }

  // Final Optimality Step
  const remainingLive = bbNodes.filter((nd) => nd.feasible && !nd.expanded);
  steps.push({
    stepNumber: steps.length + 1,
    codeLine: 11,
    title: `Optimal Solution Reached! Subset = { ${bestSubset.join(', ')} }, Optimal Value = $${bestValue}`,
    explanation: `All remaining unexpanded live nodes (${
      remainingLive.map((l) => `Node ${l.id} [ub=${l.ub}]`).join(', ') || 'none'
    }) have upper bounds ub ≤ $${bestValue}. Therefore, no unexpanded branch can yield a value higher than $${bestValue}! The globally optimal 0-1 Knapsack solution is Subset = { ${bestSubset.join(', ')} } with total value $${bestValue}.`,
    formula: `Optimal Solution:  Subset = { ${bestSubset.join(', ')} }   |   Maximum Value = $${bestValue}`,
    variables: {
      OptimalSubset: `{ ${bestSubset.join(', ')} }`,
      OptimalValue: `$${bestValue}`,
      TotalNodesGenerated: bbNodes.length,
    },
    tables: [
      {
        id: 'bb-final-table',
        title: `Final Branch-and-Bound Summary — Optimal Subset { ${bestSubset.join(', ')} } ($${bestValue})`,
        colHeaders: ['Node', 'Branch', 'Subset', 'Weight w', 'Value v', 'Upper Bound ub', 'Final Status'],
        rows: bbNodes.map((nd) => {
          const isOpt = nd.feasible && nd.v === bestValue && nd.chosenIds.join(',') === bestSubset.join(',');
          return [
            cell(`Node ${nd.id}`, isOpt ? 'path' : 'default'),
            cell(nd.edgeLabel || 'Root', isOpt ? 'path' : 'default'),
            cell(`{ ${nd.chosenIds.join(', ')} }`, isOpt ? 'path' : 'default', undefined, undefined, isOpt ? 'bb-final-subset' : undefined, `{ ${bestSubset.join(', ')} }`),
            cell(nd.w, isOpt ? 'match' : !nd.feasible ? 'mismatch' : 'default'),
            cell(nd.feasible ? `$${nd.v}` : '—', isOpt ? 'path' : 'default'),
            cell(nd.feasible ? nd.ub : 'X', isOpt ? 'match' : !nd.feasible ? 'mismatch' : 'default'),
            cell(
              isOpt ? '★ OPTIMAL SOLUTION' : !nd.feasible ? '✗ Not Feasible (X)' : nd.expanded ? 'Expanded' : `Pruned (ub=${nd.ub} ≤ ${bestValue})`,
              isOpt ? 'path' : !nd.feasible ? 'mismatch' : 'default'
            ),
          ];
        }),
      },
    ],
    stateSpaceTreeView: {
      title: `Complete 0-1 Knapsack Branch-and-Bound Tree — Optimal Subset { ${bestSubset.join(', ')} }`,
      subtitle: `Optimal Value = $${bestValue} (All other live nodes have ub ≤ ${bestValue})`,
      mode: 'branch-and-bound',
      nodes: toTreeNodesView(undefined, true),
      liveNodesLabel: `Remaining Live Nodes: ${remainingLive.map((l) => `Node ${l.id} (ub=${l.ub})`).join(', ')}`,
      bestSolutionLabel: `Optimal Solution: Subset { ${bestSubset.join(', ')} } with Value = $${bestValue}`,
      pruningRuleNote: `ub = v + (W − w) × (v_{i+1} / w_{i+1})`,
    },
    outputString: `Optimal Solution (Subset) = { ${bestSubset.join(', ')} }  |  Optimal Value = $${bestValue}`,
  });

  return steps;
}
