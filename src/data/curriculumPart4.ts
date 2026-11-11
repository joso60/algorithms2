import type { AlgorithmMeta } from '../types/algorithm';

export const ALGORITHMS_PART4: AlgorithmMeta[] = [
  // ============================================================================
  // 24. THE SIMPLEX METHOD & LINEAR PROGRAMMING (Lectures 19–21)
  // ============================================================================
  {
    id: 'simplex',
    title: 'The Simplex Method & Linear Programming',
    shortTitle: 'Simplex Method (LP)',
    lectureFile: 'Lectures 19–21: Iterative Improvement — Simplex Method',
    category: 'iterative-improvement',
    categoryLabel: 'Module 5: Iterative Improvement',
    indexingRule: 'm × n Tableau + Objective Row (Row m+1) & RHS Column',
    summary:
      'Solves Linear Programming (LP) optimization problems by converting constraints into Standard Form (using slack/surplus variables), initializing a Basic Feasible Solution (BFS) at an extreme point of the feasible region, and iteratively moving to an adjacent extreme point with a better objective value via Gauss-Jordan pivoting (Entering Variable = most negative in objective row; Departing Variable = smallest positive θ-ratio). Also solves Minimization LP problems via Matrix Transpose (Dual Problem).',
    pseudocodeTitle: 'Simplex Method (5-Step Iterative Improvement — Lecture 20 Slide 50)',
    pseudocodeLines: [
      'Step 0 [Initialization]: Convert LP to Standard Form; set up initial Simplex Tableau with slack variables as Basic Variables',
      'Step 1 [Optimality Test]: If all entries in the objective row (except RHS) are ≥ 0 then STOP (Optimal BFS reached!)',
      'Step 2 [Entering Variable]: Select the most negative entry in the first n columns of the objective row → marks Pivot Column j*',
      'Step 3 [Departing Variable]: For each positive entry a_{i,j*} > 0 in Pivot Column, compute θ_i = RHS_i / a_{i,j*}; pick smallest θ_i → Pivot Row i*',
      '        (If all entries in Pivot Column are ≤ 0 then STOP: LP is Unbounded!)',
      'Step 4 [Form Next Tableau (Gauss-Jordan Pivot)]:',
      '        Divide Pivot Row i* by pivot element p = a_{i*,j*}:  NewPivotRow ← Row_{i*} / p',
      '        For every other row r (including objective row):     Row_r ← Row_r − (entry in Pivot Col of Row_r) × NewPivotRow',
      '        Replace row label of Pivot Row i* with Entering Variable name and repeat from Step 1',
    ],
    secondaryPseudocodeTitle: 'Minimization by Simplex Method (Dual Transpose — Lecture 21 Slides 92–113)',
    secondaryPseudocodeLines: [
      'Step 1: Set up the given Minimization problem in standard minimization form (objective Minimize c₁x₁ + ... + cₙxₙ subject to A x ≥ b, x ≥ 0)',
      'Step 2: Form an (m + 1) × (n + 1) matrix with objective coefficients in the bottom row',
      'Step 3: Take the TRANSPOSE of the matrix to obtain the Dual Maximization problem (variables u, v, w...)',
      'Step 4: Introduce slack variables s, t... to convert Dual constraints into equations and construct the initial Simplex Tableau',
      'Step 5: Apply the standard Maximization Simplex Method until all objective row entries are ≥ 0',
      'Step 6: Read the optimal primal solution (x, y...) directly from the bottom Objective Row under the slack variable columns!',
    ],
    examples: [
      {
        id: 'simplex-slide-ex1',
        name: 'Lecture 20 Slide Example 01: Maximize z = 3x + 5y (2 Constraints)',
        badge: 'Slide Example',
        description:
          'Complete 3-tableau trace of Lecture 20 Slides 10–138: Maximize z = 3x + 5y subject to x + y ≤ 4 and x + 3y ≤ 6 (x, y ≥ 0). Moves through extreme points (0,0) [z=0] → (0,2) [z=10] → (3,1) [z=14].',
        inputSummary: 'Max z = 3x + 5y | s.t. x + y ≤ 4, x + 3y ≤ 6',
        customInputDefaults: {
          mode: 'max',
          objective: '3, 5',
          constraints: '1, 1 <= 4; 1, 3 <= 6',
          varNames: 'x, y',
          slackNames: 'u, v',
        },
      },
      {
        id: 'simplex-slide-ex2',
        name: 'Lecture 21 Slide Example 02: Maximize z = 5x₁ + 4x₂ (4 Constraints)',
        badge: 'Slide Example',
        description:
          'Full trace of Lecture 21 Slides 10–91: Maximize z = 5x₁ + 4x₂ subject to 6x₁ + 4x₂ ≤ 24, x₁ + 2x₂ ≤ 6, -x₁ + x₂ ≤ 1, x₂ ≤ 2. Enters x₁ (departs t, θ=4) → z=20; then enters x₂ (departs u, θ=3/2) → Optimal (x₁=3, x₂=3/2) with z=21.',
        inputSummary: 'Max z = 5x₁ + 4x₂ | 4 constraints (Reddy Mikks Paint Problem)',
        customInputDefaults: {
          mode: 'max',
          objective: '5, 4',
          constraints: '6, 4 <= 24; 1, 2 <= 6; -1, 1 <= 1; 0, 1 <= 2',
          varNames: 'x1, x2',
          slackNames: 't, u, v, s',
        },
      },
      {
        id: 'simplex-slide-min-ex3',
        name: 'Lecture 21 Slide Example 03: Minimization via Transpose (Minimize 0.12x + 0.15y)',
        badge: 'Slide Example',
        description:
          'Full trace of Lecture 21 Slides 92–130: Minimize z = 0.12x + 0.15y subject to 60x + 60y ≥ 300, 12x + 6y ≥ 36, 10x + 30y ≥ 90. Transposes into Dual Maximization (300u + 36v + 90w), pivots u then w, and reads optimal primal solution x = 3, y = 2, z = 0.66 from the slack columns!',
        inputSummary: 'Min z = 0.12x + 0.15y | s.t. 60x+60y≥300, 12x+6y≥36, 10x+30y≥90',
        customInputDefaults: {
          mode: 'min-dual',
          objective: '0.12, 0.15',
          constraints: '60, 60 >= 300; 12, 6 >= 36; 10, 30 >= 90',
          varNames: 'x, y',
          slackNames: 's, t',
        },
      },
      {
        id: 'simplex-student-ex1',
        name: 'Lecture 21 Slide 132 Student Exercise 01: Maximize P = 2x + 3y',
        badge: 'Slide Example',
        description:
          'Student Exercise 01 from Lecture 21 Slide 132: Maximize P = 2x + 3y subject to 2x + y ≤ 4, x + 2y ≤ 5, x, y ≥ 0. Optimal solution: x = 1, y = 2, P = 8.',
        inputSummary: 'Max P = 2x + 3y | s.t. 2x + y ≤ 4, x + 2y ≤ 5',
        customInputDefaults: {
          mode: 'max',
          objective: '2, 3',
          constraints: '2, 1 <= 4; 1, 2 <= 5',
          varNames: 'x, y',
          slackNames: 'u, v',
        },
      },
      {
        id: 'simplex-student-ex2',
        name: 'Lecture 21 Slide 133 Student Exercise 02: Minimize Z = 3x + 2y (Dual Transpose)',
        badge: 'Slide Example',
        description:
          'Student Exercise 02 from Lecture 21 Slide 133: Minimize Z = 3x + 2y subject to 2x + y ≥ 6, x + y ≥ 4, x, y ≥ 0. Solved via Dual Transpose to find Z = 10 at x = 2, y = 2.',
        inputSummary: 'Min Z = 3x + 2y | s.t. 2x + y ≥ 6, x + y ≥ 4 (Answer: Z=10 at x=2, y=2)',
        customInputDefaults: {
          mode: 'min-dual',
          objective: '3, 2',
          constraints: '2, 1 >= 6; 1, 1 >= 4',
          varNames: 'x, y',
          slackNames: 's, t',
        },
      },
      {
        id: 'simplex-winter2023-final-q4',
        name: 'Winter 2023 Final Exam Q4 (25 Marks): Simplex Standard Form Conversion & Steps',
        badge: 'Past Exam',
        description:
          'Exact 25-point question from Winter 2023 Final Exam Q4: (a) Write down the 5 steps (Step 0 to Step 4) of the Simplex Method (15 pts), and (b) Convert the given LP problem into Standard Form compatible with the Simplex Method (10 pts): minimize 3x + 5y subject to x + y ≤ -4, x + 3y ≥ 6 (with unrestricted variables x, y).',
        inputSummary: 'Winter 2023 Final Q4: Convert Min 3x + 5y (s.t. x+y ≤ -4, x+3y ≥ 6, x,y unrestricted) to Standard Form',
        customInputDefaults: {
          mode: 'exam-winter2023-q4',
          objective: '3, 5',
          constraints: '1, 1 <= -4; 1, 3 >= 6',
          varNames: 'x, y',
          slackNames: 's, t',
        },
        examSimulation: {
          examPaper: 'Winter 2023 Final Exam — Question 04 (25 Marks)',
          examType: 'Final',
          marks: '25 Marks (15 pts Part A + 10 pts Part B)',
          questionStatement:
            'Q4(a) [15 pts]: Write down the steps (Step 0 to Step 4) with brief description for the "Simplex Method".\nQ4(b) [10 pts]: Convert the given Linear Programming problem into a "Simplex Method" compatible problem (Standard Form):\n   Minimize  3x + 5y\n   subject to:\n     x + y ≤ -4\n     x + 3y ≥ 6\n     (where x and y are unrestricted in sign)',
          subQuestions: [
            '1. Convert Minimization to Maximization: multiply objective by -1 → Maximize -3x - 5y.',
            '2. Convert inequalities into Linear Equations using slack (+s) and surplus (-t): x + y + s = -4 and x + 3y - t = 6.',
            '3. Enforce Non-Negative RHS: multiply first equation by -1 → -x - y - s = 4.',
            '4. Enforce Non-Negative Variables: substitute unrestricted x = x\' - x\'\' and y = y\' - y\'\' (with x\', x\'\', y\', y\'\', s, t ≥ 0).',
          ],
          requiredStepsGuide: [
            'Step 1 (Objective): Negate coefficients → Maximize -3x - 5y',
            'Step 2 (Constraints → Equations): Add slack s ≥ 0 to ≤ constraint; subtract surplus t ≥ 0 from ≥ constraint',
            'Step 3 (RHS ≥ 0): Multiply any equation with negative RHS (-4) by -1 → -x - y - s = 4',
            'Step 4 (Unrestricted Variables): Replace x = x\' - x\'\' and y = y\' - y\'\' in both objective and constraints',
          ],
        },
      },
    ],
    customFields: [
      {
        key: 'mode',
        label: 'LP Mode (max | min-dual | exam-winter2023-q4)',
        placeholder: 'max',
        helpText: 'Use "max" for Standard Maximization, "min-dual" for Minimization via Matrix Transpose, or "exam-winter2023-q4".',
      },
      {
        key: 'objective',
        label: 'Objective Coefficients (c₁, c₂, ...)',
        placeholder: '3, 5',
        helpText: 'Comma-separated objective function coefficients.',
      },
      {
        key: 'constraints',
        label: 'Linear Constraints (semicolon-separated)',
        placeholder: '1, 1 <= 4; 1, 3 <= 6',
        helpText: 'Format each constraint as: a₁, a₂ <= b (or >= b for min-dual).',
      },
      {
        key: 'varNames',
        label: 'Decision Variable Names',
        placeholder: 'x, y',
        helpText: 'Names of the primal decision variables.',
      },
      {
        key: 'slackNames',
        label: 'Slack Variable Names',
        placeholder: 'u, v',
        helpText: 'Names of the slack variables added for standard form.',
      },
    ],
    designParadigmName: 'Iterative Improvement (Adjacent Extreme Point Search)',
    designSteps: [
      {
        stepNumber: 1,
        title: 'Step 1: Convert LP to Standard Form',
        subtitle: 'Ensure Maximization, Equality Constraints (= bᵢ ≥ 0), and Non-Negative Variables',
        content: [
          '1. Objective must be Maximization (if Minimization, either negate cⱼ or solve the Dual Maximization via Matrix Transpose).',
          '2. Every constraint must be a linear equation with non-negative RHS bᵢ ≥ 0 (add slack variable +uᵢ ≥ 0 for ≤ constraints; subtract surplus -vᵢ ≥ 0 for ≥ constraints).',
          '3. All variables must be non-negative (xⱼ ≥ 0). If a variable x is unrestricted in sign, substitute x = x\' - x\'\' with x\', x\'\' ≥ 0.',
        ],
        formulaBox:
          'Maximize  ∑ cⱼ xⱼ\nsubject to ∑ aᵢⱼ xⱼ + uᵢ = bᵢ  (bᵢ ≥ 0)\nxⱼ ≥ 0, uᵢ ≥ 0',
      },
      {
        stepNumber: 2,
        title: 'Step 2: Initialize Simplex Tableau at Origin BFS',
        subtitle: 'Set non-basic variables to 0 and slack variables as initial basic variables',
        content: [
          'Construct an (m + 1) × (n + 1) Simplex Tableau.',
          'The first m rows represent the constraint equations, with the m slack variables forming an m × m identity matrix.',
          'The bottom row (Row m + 1) is the Objective Row, initialized with negated objective coefficients -cⱼ and current objective value z = 0 in the rightmost cell.',
        ],
        formulaBox:
          'Initial Basic Feasible Solution (BFS): (0, 0, ..., b₁, b₂, ..., bₘ) with z = 0',
      },
      {
        stepNumber: 3,
        title: 'Step 3: Select Entering & Departing Variables (Pivot Selection)',
        subtitle: 'Move along an edge of the feasible polytope to an adjacent extreme point',
        content: [
          'Optimality Test: If all entries in the objective row (excluding RHS) are ≥ 0, the current BFS is globally optimal!',
          'Entering Variable (Pivot Column j*): Choose the column with the most negative coefficient in the objective row (steepest rate of increase per unit).',
          'Departing Variable (Pivot Row i*): For every positive entry a_{i,j*} > 0 in the pivot column, compute θᵢ = bᵢ / a_{i,j*}. The smallest positive θ-ratio determines how far we can increase the entering variable before violating a constraint.',
        ],
        formulaBox:
          'Entering Col j* = argmin_{cⱼ < 0} (ObjRow[j])\nDeparting Row i* = argmin_{a_{i,j*} > 0} ( θᵢ = RHS[i] / a_{i,j*} )',
      },
      {
        stepNumber: 4,
        title: 'Step 4: Gauss-Jordan Row Operations (Form Next Tableau)',
        subtitle: 'Update the basis and recompute objective value z',
        content: [
          '1. Divide the Pivot Row i* by the pivot element p = a_{i*,j*} so the pivot entry becomes 1.',
          '2. For every other row r (including the bottom Objective Row), subtract (Row_r[j*] × NewPivotRow) so all other entries in Column j* become 0.',
          '3. Relabel Row i* with the Entering Variable name and repeat from the Optimality Test.',
        ],
        formulaBox:
          'NewPivotRow = PivotRow / p\nNewRow_r    = OldRow_r − (OldRow_r[j*] × NewPivotRow)',
      },
    ],
    designChallenge: {
      scenarioTitle: 'Simplex Method Exam Mastery Quiz',
      problemStatement:
        'Test your understanding of Simplex Standard Form rules, θ-ratio tie/unbounded rules, and Dual Transpose Minimization.',
      questions: [
        {
          prompt:
            'In Step 3 (Finding the Departing Variable) of the Simplex Method, what does it mean if all entries in the Pivot Column are negative or zero (≤ 0)?',
          options: [
            'The current Basic Feasible Solution is already optimal.',
            'The Linear Programming problem is UNBOUNDED (the entering variable can be increased infinitely without violating any constraint), so the algorithm stops.',
            'We should pick the most negative ratio as the pivot row.',
            'The feasible region is empty.',
          ],
          correctIndex: 1,
          explanation:
            'A positive entry a_{i,j*} > 0 in the pivot column limits how much the entering variable can grow. If all entries in the pivot column are ≤ 0, no constraint limits the entering variable, meaning the objective can grow to +∞ (unbounded)!',
        },
        {
          prompt:
            'Which of the following is NOT a requirement of Standard Form for the Simplex Method (Lecture 20 Slide 13 & Question Pool)?',
          options: [
            'It must be a maximization problem.',
            'All constraints (except non-negativity) must be linear equations with non-negative right-hand sides (bᵢ ≥ 0).',
            'All variables are required to be non-negative (≥ 0).',
            'All constraints must be in the form of non-linear inequalities.',
          ],
          correctIndex: 3,
          explanation:
            'Standard Form requires linear equations (= bᵢ with bᵢ ≥ 0), a maximization objective, and non-negative variables (≥ 0). Non-linear inequalities are never allowed.',
        },
      ],
    },
    analysis: {
      bestTime: 'Polynomial O(m·n) (1–2 pivots)',
      avgTime: 'Polynomial in practice (inspects only a small fraction of extreme points)',
      worstTime: 'Exponential O(2ⁿ) in pathological worst-case (Klee-Minty cube)',
      extraSpace: 'Θ(m × n) for the Simplex Tableau',
      tradeOffSummary:
        'Although worst-case number of extreme points is exponential, Simplex typically visits only a tiny fraction of extreme points (typically O(m) iterations), making it extremely fast in practice.',
      basicOperation: 'Gauss-Jordan row update: Row_r[k] ← Row_r[k] − coeff × NewPivotRow[k]',
      inputSizeParam: 'm constraints, n variables',
      summationSteps: [
        {
          label: '1. Cost of a Single Simplex Iteration (One Pivot)',
          math: 'T_{pivot}(m, n) = ∑_{i=1}^{m+1} ∑_{j=1}^{n+1} 1 = (m + 1)(n + 1) ∈ Θ(mn)',
          note: 'Each pivot updates (m + 1) rows across (n + 1) columns via Gauss-Jordan elimination.',
        },
        {
          label: '2. Total Number of Extreme Points (Upper Bound)',
          math: 'Total Basic Solutions ≤ C(n, m) = n! / (m!(n - m)!)',
          note: 'In the worst case, Simplex may visit an exponential number of extreme points, but in practice it inspects only a small fraction of them (Fall 2025 Final Q4).',
        },
      ],
      examNote:
        'Exam Favorite (Fall 2025 Final Q4 & Winter 2023 Final Q4): Remember that Simplex "inspects only a small fraction of extreme points" in practice, and know the 3 requirements of Standard Form + 5 Steps (Step 0 to Step 4).',
    },
  },

  // ============================================================================
  // 25. MAXIMUM FLOW PROBLEM — SHORTEST AUGMENTING PATH (Lecture 22)
  // ============================================================================
  {
    id: 'max-flow',
    title: 'Maximum Flow Problem (Ford-Fulkerson / Shortest-Augmenting-Path)',
    shortTitle: 'Maximum Flow (BFS Path)',
    lectureFile: 'Lecture 22: Iterative Improvement — Maximum Flow Problem',
    category: 'iterative-improvement',
    categoryLabel: 'Module 5: Iterative Improvement',
    indexingRule: 'Source = 1, Sink = n | Vertex Labels: (l_j, i⁺) or (l_j, i⁻)',
    summary:
      'Finds the maximum flow from source vertex 1 to sink vertex n in a capacity-constrained flow network using the Shortest-Augmenting-Path (Edmonds-Karp BFS Labeling) method. At each iteration, a FIFO Queue Q searches for an augmenting path using forward edges with unused capacity (r_{ij} = u_{ij} − x_{ij} > 0, labeled i⁺) and backward edges with positive flow (x_{ji} > 0, labeled i⁻).',
    pseudocodeTitle: 'Shortest-Augmenting-Path Algorithm (Lecture 22 Slide 33 & Fall 2025 CFE Q4)',
    pseudocodeLines: [
      'ALGORITHM ShortestAugmentingPath(G)',
      'for every edge (i, j) do x_{ij} ← 0',
      'label the source 1 with (∞, −);  Enqueue(Q, 1)',
      'while not Empty(Q) do',
      '    i ← Front(Q);  Dequeue(Q)',
      '    for every edge from i to j (Forward Edge) do',
      '        if j is unlabeled then',
      '            r_{ij} ← u_{ij} − x_{ij}',
      '            if r_{ij} > 0 then l_j ← min(l_i, r_{ij}); label j with (l_j, i⁺); Enqueue(Q, j)',
      '    for every edge from j to i (Backward Edge) do',
      '        if j is unlabeled and x_{ji} > 0 then',
      '            l_j ← min(l_i, x_{ji}); label j with (l_j, i⁻); Enqueue(Q, j)',
      '    if the sink n has been labeled then   // Augment along path!',
      '        j ← n',
      '        while j ≠ 1 do',
      '            if second label of j is i⁺ then x_{ij} ← x_{ij} + l_n else x_{ji} ← x_{ji} − l_n',
      '            j ← i',
      '        erase all vertex labels except source (∞, −); reinitialize Q ← {1}',
      'return x   // Maximum flow & Min-Cut achieved when Q becomes empty!',
    ],
    examples: [
      {
        id: 'maxflow-fall2025-cfe-q4',
        name: 'Fall 2025 Final Exam (CFE Q4): 6-Vertex Network (Loops 1–19, Max Flow = 10)',
        badge: 'Past Exam',
        description:
          'Exact 6-point question from Fall 2025 Final Exam (CFE Q4): Apply the Shortest-Augmenting-Path algorithm on the 6-vertex network (source = 1, sink = 6) with capacities (1,2):5, (1,3):6, (2,4):4, (2,5):2, (3,4):7, (4,6):8, (5,6):4. Traces all 4 augmentations (+4, +1, +4, +1) including backward edge (2,4) with label 4⁻ to reach Maximum Flow = 10!',
        inputSummary: 'Fall 2025 Final Q4: 6 vertices (1..6), 4 Augmenting Paths → Max Flow = 10',
        customInputDefaults: {
          edges: '1-2:5, 1-3:6, 2-4:4, 2-5:2, 3-4:7, 4-6:8, 5-6:4',
          source: '1',
          sink: '6',
          preset: 'fall2025-q4',
        },
        examSimulation: {
          examPaper: 'Fall 2025 Final Exam (CFE) — Question 04 (6 Marks)',
          examType: 'Final',
          marks: '6 Marks',
          questionStatement:
            'Apply the max-flow algorithm (shortest-augmenting path) on the following graph to find the maximum flow value, where the source vertex is 1 and the sink vertex is 6.\nEdges & Capacities: (1→2): 5, (1→3): 6, (2→4): 4, (2→5): 2, (3→4): 7, (4→6): 8, (5→6): 4.\nHint: The algorithm is provided and the solution is partially given across 10 steps (Loops 1 to 19). Fill in the gaps in each step to determine the flow x_{ij}/u_{ij} on each edge, the labels (l_j, i±) on each vertex, the Queue Q, and the final maximum flow value.',
          subQuestions: [
            'Box 1–3 (Loops 1–4): Initialize Q = {1}, label 2:(5,1⁺), 3:(6,1⁺), 4:(4,2⁺), 5:(2,2⁺), 6:(4,4⁺). Augment path 1→2→4→6 by l₆ = 4.',
            'Box 4–5 (Loops 5–8): Reinitialize Q = {1}, label 2:(1,1⁺), 3:(6,1⁺), 5:(1,2⁺), 4:(6,3⁺), 6:(1,5⁺). Augment path 1→2→5→6 by l₆ = 1.',
            'Box 6–7 (Loops 9–11): Reinitialize Q = {1}, label 3:(6,1⁺), 4:(6,3⁺), 6:(4,4⁺) and 2:(4,4⁻). Augment path 1→3→4→6 by l₆ = 4.',
            'Box 8–9 (Loops 12–16): Reinitialize Q = {1}, label 3:(2,1⁺), 4:(2,3⁺), backward edge 2:(2,4⁻), 5:(1,2⁺), 6:(1,5⁺). Augment path 1→3→4←2→5→6 by l₆ = 1 (reducing x_{24} from 4 to 3!).',
            'Box 10 (Loops 17–19): Reinitialize Q = {1}, label 3:(1,1⁺), 4:(1,3⁺), 2:(1,4⁻), then Q = {} → Stop! Maximum Flow = 10.',
          ],
          requiredStepsGuide: [
            '1. At each BFS wave, start with source 1 labeled (∞, −) and Q = {1}.',
            '2. Dequeue i = Front(Q): scan forward edges (i→j) with r_{ij} = u_{ij} − x_{ij} > 0 and label j with (min(l_i, r_{ij}), i⁺); scan backward edges (j→i) with x_{ji} > 0 and label j with (min(l_i, x_{ji}), i⁻).',
            '3. As soon as sink 6 is labeled, trace parent labels backward from 6 to 1: add l₆ on forward edges (+) and subtract l₆ on backward edges (−).',
            '4. Erase all labels except source (∞, −), reset Q = {1}, and repeat until Q becomes empty without labeling sink 6.',
          ],
        },
      },
      {
        id: 'maxflow-slide-ex1',
        name: 'Lecture 22 Slide Example: 6-Vertex Network (Max Flow = 3 with Backward Edge)',
        badge: 'Slide Example',
        description:
          'Complete trace of Lecture 22 Slides 35–85: 6-vertex network (1..6) with capacities (1,2):2, (1,4):3, (2,3):5, (2,5):3, (4,3):1, (3,6):2, (5,6):4. Augmentation 1 sends 2 units along 1→2→3→6; Augmentation 2 sends 1 unit along 1→4→3←2→5→6 (using backward edge 3←2) for Maximum Flow = 3 and Min-Cut C(X, X̄) = 3.',
        inputSummary: 'Lecture 22 Slides 35–85: 6 vertices (1..6), Max Flow = 3',
        customInputDefaults: {
          edges: '1-2:2, 1-4:3, 2-3:5, 2-5:3, 4-3:1, 3-6:2, 5-6:4',
          source: '1',
          sink: '6',
          preset: 'slide-ex1',
        },
      },
    ],
    customFields: [
      {
        key: 'edges',
        label: 'Directed Edges & Capacities (u-v:capacity)',
        placeholder: '1-2:5, 1-3:6, 2-4:4, 2-5:2, 3-4:7, 4-6:8, 5-6:4',
        helpText: 'Comma-separated directed edges from u to v with capacity u_{ij}.',
      },
      {
        key: 'source',
        label: 'Source Vertex',
        placeholder: '1',
        helpText: 'Source vertex s (default: 1).',
      },
      {
        key: 'sink',
        label: 'Sink Vertex',
        placeholder: '6',
        helpText: 'Sink vertex t (default: 6).',
      },
    ],
    designParadigmName: 'Iterative Improvement (Augmenting Path & Residual Network)',
    designSteps: [
      {
        stepNumber: 1,
        title: 'Step 1: Initialize Zero Flow & Source Label',
        subtitle: 'Start with a feasible flow x_{ij} = 0 on every edge',
        content: [
          'Every edge (i, j) starts with flow x_{ij} = 0 (written as 0 / u_{ij}).',
          'Label the source vertex 1 with (∞, −) and insert 1 into FIFO Queue Q.',
        ],
        formulaBox: 'x_{ij} = 0  for all (i, j) ∈ E  |  Label(1) = (∞, −),  Q = {1}',
      },
      {
        stepNumber: 2,
        title: 'Step 2: BFS Labeling via Forward (+) and Backward (−) Edges',
        subtitle: 'Find the shortest augmenting path (fewest edges) from source to sink',
        content: [
          'Dequeue vertex i from the front of Q.',
          'Forward Edges (i → j): If j is unlabeled and residual capacity r_{ij} = u_{ij} − x_{ij} > 0, label j with (min(l_i, r_{ij}), i⁺) and enqueue j.',
          'Backward Edges (j → i): If j is unlabeled and current flow x_{ji} > 0, label j with (min(l_i, x_{ji}), i⁻) and enqueue j.',
        ],
        formulaBox:
          'Forward (i→j):  l_j = min(l_i, u_{ij} − x_{ij}),  label (l_j, i⁺)\nBackward (j→i): l_j = min(l_i, x_{ji}),          label (l_j, i⁻)',
      },
      {
        stepNumber: 3,
        title: 'Step 3: Augment Flow Along the Discovered Path',
        subtitle: 'Add bottleneck l_n to forward edges and subtract l_n from backward edges',
        content: [
          'As soon as the sink n receives a label (l_n, i±), stop BFS and backtrack from j = n to 1 using the second component of each label.',
          'If j was labeled with i⁺ (forward edge), increase flow: x_{ij} ← x_{ij} + l_n.',
          'If j was labeled with i⁻ (backward edge), decrease flow (redirect flow): x_{ji} ← x_{ji} − l_n.',
          'Erase all vertex labels except source 1, reset Q ← {1}, and start the next BFS search.',
        ],
        formulaBox: 'x_{ij} ← x_{ij} + l_n  (on i⁺)   |   x_{ji} ← x_{ji} − l_n  (on i⁻)',
      },
      {
        stepNumber: 4,
        title: 'Step 4: Termination & Max-Flow Min-Cut Theorem',
        subtitle: 'When Q becomes empty without labeling the sink, current flow is Maximum!',
        content: [
          'When Q becomes empty and the sink n is still unlabeled, no augmenting path exists.',
          'By the Max-Flow Min-Cut Theorem, the final flow value v equals the capacity C(V_L, V − V_L) of the minimum cut separating labeled vertices V_L from unlabeled vertices V − V_L!',
        ],
        formulaBox: 'Max Flow Value v* = Min-Cut Capacity C(X, X̄)',
      },
    ],
    designChallenge: {
      scenarioTitle: 'Maximum Flow & Augmenting Path Quiz',
      problemStatement: 'Test your knowledge of forward/backward edge labeling and the Max-Flow Min-Cut Theorem.',
      questions: [
        {
          prompt:
            'Why does the Ford-Fulkerson / Shortest-Augmenting-Path algorithm need to check BACKWARD edges (j → i with flow x_{ji} > 0) during BFS labeling?',
          options: [
            'To allow the algorithm to undo/redirect flow sent along an earlier augmenting path so that a larger overall flow can reach the sink.',
            'Because the graph is undirected.',
            'To compute the shortest path using Dijkstra’s algorithm.',
            'Backward edges are never used in Maximum Flow.',
          ],
          correctIndex: 0,
          explanation:
            'Both in Lecture 22 (edge 2→3) and Fall 2025 Final Q4 (edge 2→4), an early augmenting path saturates a middle edge. Labeling the backward edge with i⁻ allows a later augmenting path to reduce flow on that edge and reroute it to achieve the true global maximum flow!',
        },
      ],
    },
    analysis: {
      bestTime: 'O(|E|)',
      avgTime: 'O(|V| · |E|²)',
      worstTime: 'O(|V| · |E|²) (Edmonds-Karp Shortest-Augmenting-Path)',
      extraSpace: 'Θ(|V| + |E|) for Queue Q and vertex labels',
      tradeOffSummary:
        'Using BFS (Shortest-Augmenting-Path / Edmonds-Karp) guarantees at most O(|V||E|) flow augmentations, each taking O(|E|) BFS time, yielding a polynomial O(|V||E|²) worst-case bound independent of edge capacities.',
      basicOperation: 'Edge inspection & vertex labeling during BFS',
      inputSizeParam: '|V| = n vertices, |E| = m edges',
      summationSteps: [
        {
          label: '1. Cost of One BFS Augmenting Path Search',
          math: 'T_{BFS} = O(|V| + |E|) = O(|E|)   (using adjacency lists)',
          note: 'Each vertex is enqueued at most once per phase, and each edge is inspected at most twice (forward & backward).',
        },
        {
          label: '2. Total Number of Augmenting Paths (Edmonds-Karp Bound)',
          math: 'Number of Augmentations ≤ |V| · |E| / 2 ∈ O(|V| · |E|)',
          note: 'Combining O(|V||E|) augmentations with O(|E|) per BFS gives O(|V||E|²) total time (Lecture 22 Slide 86).',
        },
      ],
      examNote:
        'Exam Tip (Fall 2025 Final Q4): Watch out for backward edges! When vertex 4 is dequeued and edge (2→4) already has flow 4/4, vertex 2 can be labeled via backward edge (2→4) as (min(l₄, x₂₄), 4⁻)!',
    },
  },

  // ============================================================================
  // 26. MAXIMUM MATCHING IN BIPARTITE GRAPHS (Lecture 23)
  // ============================================================================
  {
    id: 'bipartite-matching',
    title: 'Maximum Matching in Bipartite Graphs',
    shortTitle: 'Bipartite Matching',
    lectureFile: 'Lecture 23: Iterative Improvement — Maximum Matching',
    category: 'iterative-improvement',
    categoryLabel: 'Module 5: Iterative Improvement',
    indexingRule: 'Bipartition V = V₁ ∪ V₂ | Free Vertices → BFS Queue Q',
    summary:
      'Finds a matching M of maximum cardinality (largest number of non-adjacent edges sharing no vertices) in a bipartite graph G = (V₁, V₂, E). Starts with an initial matching M and repeatedly searches via BFS for an augmenting path P connecting a free vertex in V₁ to a free vertex in V₂ (alternating between unmatched edges V₁→V₂ and matched edges V₂→V₁). Flipping the edges along P increases |M| by 1.',
    pseudocodeTitle: 'Maximum Bipartite Matching Algorithm (Lecture 23 Slides 43–45)',
    pseudocodeLines: [
      'ALGORITHM MaximumBipartiteMatching(G)',
      'initialize set M of edges with some valid matching (e.g., empty or greedy)',
      'initialize queue Q with all free vertices in V₁ (in any order)',
      'while not Empty(Q) do',
      '    w ← Front(Q);  Dequeue(Q)',
      '    if w ∈ V₁ then',
      '        for every vertex u adjacent to w do',
      '            if u is free then   // Augmenting path found!',
      '                M ← M ∪ (w, u)',
      '                v ← w',
      '                while v is labeled do   // Flip edges along augmenting path',
      '                    u ← label of v;  M ← M − (v, u)',
      '                    v ← label of u;  M ← M ∪ (v, u)',
      '                remove all vertex labels; reinitialize Q with all remaining free vertices in V₁',
      '                break',
      '            else // u is matched',
      '                if (w, u) ∉ M and u is unlabeled then label u with w; Enqueue(Q, u)',
      '    else // w ∈ V₂ (and matched)',
      '        label the mate v of w with w;  Enqueue(Q, v)',
      'return M   // Maximum matching!',
    ],
    examples: [
      {
        id: 'matching-fall2020-spring2021-q4',
        name: 'Fall 2020 Final Q4 & Spring 2021 Final Q5(b): V₁={1,2,3}, V₂={4,5,6} (Initial M₁={(1,5)})',
        badge: 'Past Exam',
        description:
          'Exact 16-point / 8-point question from Fall 2020 Final Q4 & Spring 2021 Final Q5(b): Apply the maximum-matching iterative improvement algorithm starting from M₁ = {(1,5)}. Finds augmenting path 3-5-1-6 → M₂ = {(1,6), (3,5)}, then augmenting path 2-5-3-4 → Perfect Matching M₃ = {(1,6), (2,5), (3,4)}!',
        inputSummary: 'Fall 2020 Q4 & Spring 2021 Q5b: V₁={1,2,3}, V₂={4,5,6}, Initial M₁={(1,5)} → Perfect M₃',
        customInputDefaults: {
          v1: '1, 2, 3',
          v2: '4, 5, 6',
          edges: '1-5, 1-6, 2-5, 3-4, 3-5',
          initialM: '1-5',
          preset: 'exam-fall2020-q4',
        },
        examSimulation: {
          examPaper: 'Fall 2020 Final Q4 (16 Marks) & Spring 2021 Final Q5b (8 Marks)',
          examType: 'Final',
          marks: '16 Marks (Fall 2020) / 8 Marks (Spring 2021)',
          questionStatement:
            'Apply the maximum-matching iterative improvement algorithm to the given bipartite graph (V₁ = {1, 2, 3}, V₂ = {4, 5, 6} with edges (1,5), (1,6), (2,5), (3,4), (3,5)) by taking the initial matching as M₁ = {(1, 5)}. At each step clearly mention the augmentation path and show the updated matching graph.',
          subQuestions: [
            'Step 1 (From M₁ = {(1,5)}): Free vertices in V₁ are {2, 3}. Find augmenting path 3 → 5 → 1 → 6 (where 6 ∈ V₂ is free). Flip edges: remove (1,5) and add (3,5) and (1,6) → M₂ = {(1,6), (3,5)}.',
            'Step 2 (From M₂ = {(1,6), (3,5)}): Remaining free vertex in V₁ is {2}. Find augmenting path 2 → 5 → 3 → 4 (where 4 ∈ V₂ is free). Flip edges: remove (3,5) and add (2,5) and (3,4) → M₃ = {(1,6), (2,5), (3,4)}.',
            'Conclusion: All vertices are matched (no free vertices remain), so M₃ = {(1,6), (2,5), (3,4)} is both a Maximum Matching and a Perfect Matching!',
          ],
          requiredStepsGuide: [
            '1. Identify free (unmatched) vertices in V₁ and V₂ for the current matching M₁ = {(1,5)}.',
            '2. Trace an alternating path starting at a free vertex in V₁ (3), taking an unmatched edge to 5, following matched edge (5,1) back to 1, and taking unmatched edge (1,6) to free vertex 6.',
            '3. Symmetric difference M₂ = M₁ ⊕ P₁: remove matched edges on the path and add unmatched edges → M₂ = {(1,6), (3,5)}.',
            '4. Repeat from remaining free vertex 2 ∈ V₁ along path 2 → 5 → 3 → 4 to obtain M₃ = {(1,6), (2,5), (3,4)}.',
          ],
        },
      },
      {
        id: 'matching-slide-ex1',
        name: 'Lecture 23 Slide Example 01: 10-Vertex Bipartite Graph V₁={1..5}, V₂={6..10}',
        badge: 'Slide Example',
        description:
          'Complete trace of Lecture 23 Slides 46–61: V₁ = {1,2,3,4,5}, V₂ = {6,7,8,9,10} with initial matching M = {(1,6), (3,8), (4,9), (5,10)}. Queue starts with Q = {2}, finds augmenting path 2 → 6 → 1 → 7, and flips edges to reach a Perfect Matching of size 5.',
        inputSummary: 'Lecture 23 Slides 46–61: V₁={1..5}, V₂={6..10}, Path 2→6→1→7 → |M|=5',
        customInputDefaults: {
          v1: '1, 2, 3, 4, 5',
          v2: '6, 7, 8, 9, 10',
          edges: '1-6, 1-7, 2-6, 3-6, 3-8, 4-8, 4-9, 4-10, 5-9, 5-10',
          initialM: '1-6, 3-8, 4-9, 5-10',
          preset: 'slide-10v',
        },
      },
      {
        id: 'matching-slide-ex2',
        name: 'Lecture 23 Detailed & Max-Flow Reduction: V₁={v₁,v₂,v₃}, V₂={u₁,u₂,u₃}',
        badge: 'Slide Example',
        description:
          'Complete trace of Lecture 23 Detailed Slides & Using-Fulkerson Slides: V₁ = {v₁, v₂, v₃}, V₂ = {u₁, u₂, u₃} with initial M = {(v₁,u₁), (v₃,u₂)}. Traces the 5-edge augmenting path v₂ → u₁ → v₁ → u₂ → v₃ → u₃ to obtain Perfect Matching M = {(v₂,u₁), (v₁,u₂), (v₃,u₃)}.',
        inputSummary: 'Lecture 23 Details: V₁={v₁,v₂,v₃}, V₂={u₁,u₂,u₃}, Path v₂→u₁→v₁→u₂→v₃→u₃',
        customInputDefaults: {
          v1: 'v1, v2, v3',
          v2: 'u1, u2, u3',
          edges: 'v1-u1, v1-u2, v2-u1, v3-u2, v3-u3',
          initialM: 'v1-u1, v3-u2',
          preset: 'slide-6v',
        },
      },
    ],
    customFields: [
      {
        key: 'v1',
        label: 'Partition V₁ Vertices',
        placeholder: '1, 2, 3',
        helpText: 'Comma-separated vertices in left/top partition V₁.',
      },
      {
        key: 'v2',
        label: 'Partition V₂ Vertices',
        placeholder: '4, 5, 6',
        helpText: 'Comma-separated vertices in right/bottom partition V₂.',
      },
      {
        key: 'edges',
        label: 'Bipartite Edges (v-u)',
        placeholder: '1-5, 1-6, 2-5, 3-4, 3-5',
        helpText: 'Comma-separated edges between V₁ and V₂.',
      },
      {
        key: 'initialM',
        label: 'Initial Matching M₁',
        placeholder: '1-5',
        helpText: 'Comma-separated initially matched edges.',
      },
    ],
    designParadigmName: 'Iterative Improvement (Alternating & Augmenting Paths)',
    designSteps: [
      {
        stepNumber: 1,
        title: 'Step 1: Partition Vertices into V₁ and V₂ & Identify Free Vertices',
        subtitle: 'A bipartite graph has all edges between V₁ and V₂ (no odd cycles)',
        content: [
          'Start with an initial matching M (either given on the exam, such as M₁ = {(1,5)}, or empty M = ∅).',
          'Any vertex not incident to an edge in M is called a FREE vertex; otherwise it is MATCHED.',
          'Insert all free vertices of V₁ into the BFS Queue Q.',
        ],
        formulaBox: 'Q ← { w ∈ V₁ | w is free }',
      },
      {
        stepNumber: 2,
        title: 'Step 2: Alternate Between Unmatched (V₁→V₂) and Matched (V₂→V₁) Edges',
        subtitle: 'Search for an augmenting path of odd length connecting free w ∈ V₁ to free u ∈ V₂',
        content: [
          'When dequeuing w ∈ V₁: explore all adjacent u ∈ V₂ along unmatched edges. If u is free, we have found an augmenting path! If u is matched and unlabeled, label u with w and enqueue u.',
          'When dequeuing w ∈ V₂: follow its unique matched edge (w, v) ∈ M back to its mate v ∈ V₁, label v with w, and enqueue v.',
        ],
        formulaBox: 'Augmenting Path: Free(V₁) —[∉M]→ Matched(V₂) —[∈M]→ Matched(V₁) —[∉M]→ ... —[∉M]→ Free(V₂)',
      },
      {
        stepNumber: 3,
        title: 'Step 3: Symmetric Difference Flip (Augment Matching by +1)',
        subtitle: 'Remove k matched edges and add k + 1 unmatched edges along path P',
        content: [
          'Backtrack along the vertex labels from the free vertex u ∈ V₂ back to the starting free vertex in V₁.',
          'Add every odd-positioned (unmatched) edge on the path into M, and remove every even-positioned (previously matched) edge on the path from M.',
          'This increases the size of the matching |M| by exactly 1 while preserving validity!',
        ],
        formulaBox: 'M_new = (M − P) ∪ (P − M) = M ⊕ P   ⇒   |M_new| = |M| + 1',
      },
      {
        stepNumber: 4,
        title: 'Step 4: Termination Theorem (Berge’s Theorem)',
        subtitle: 'A matching M is maximum iff no augmenting path exists!',
        content: [
          'Erase all labels, reinitialize Q with the remaining free vertices in V₁, and repeat.',
          'When Q becomes empty without reaching any free vertex in V₂ (or when no free vertices remain in V₁), the current matching M is guaranteed to be a Maximum Matching!',
        ],
        formulaBox: 'Maximum Matching ⇔ No Augmenting Path Exists',
      },
    ],
    designChallenge: {
      scenarioTitle: 'Bipartite Matching Design Quiz',
      problemStatement: 'Practice the augmenting path flip rule and tree matching design from Past Final Exams.',
      questions: [
        {
          prompt:
            'If an augmenting path P contains 3 edges (e.g., 3 — 5 == 1 — 6 where (1,5) ∈ M and 3, 6 are free), what happens when we augment M along P?',
          options: [
            'We remove the 1 matched edge (1,5) and add the 2 unmatched edges (3,5) and (1,6), increasing the size of the matching |M| by 1.',
            'We add all 3 edges to M.',
            'We remove all 3 edges from M.',
            'The matching size increases by 3.',
          ],
          correctIndex: 0,
          explanation:
            'An augmenting path always has k matched edges and k + 1 unmatched edges. Swapping their roles replaces k edges with k + 1 edges, net gain = +1 edge!',
        },
      ],
    },
    analysis: {
      bestTime: 'O(|V| + |E|)',
      avgTime: 'O(|V|(|V| + |E|))',
      worstTime: 'O(|V|(|V| + |E|)) = O(n(n + m))',
      extraSpace: 'Θ(|V|) for Queue Q and vertex labels',
      tradeOffSummary:
        'Each BFS phase takes O(|V| + |E|) time and increases the matching size by 1. Since a matching can have at most ⌊|V|/2⌋ edges, there are at most |V|/2 + 1 phases.',
      basicOperation: 'BFS edge traversal & label assignment',
      inputSizeParam: 'n = |V| vertices, m = |E| edges',
      summationSteps: [
        {
          label: '1. Cost of One BFS Augmenting Path Search',
          math: 'T_{phase}(n, m) = O(n + m)   (Adjacency Lists)   or   O(n²)   (Adjacency Matrix)',
          note: 'Each vertex enters Q at most once per phase.',
        },
        {
          label: '2. Maximum Number of Augmentations',
          math: 'Phases ≤ ⌊n / 2⌋ + 1   ⇒   T_{total}(n, m) = O(n(n + m))',
          note: 'Matches Lecture 23 Slide 62 exact complexity analysis.',
        },
      ],
      examNote:
        'Exam Favorite (Fall 2020 Final Q4 & Spring 2021 Final Q5): Always write out the exact Augmentation Path (e.g. 3-5-1-6) and state which edge is removed and which edges are added at each step!',
    },
  },

  // ============================================================================
  // 27. THE STABLE MARRIAGE PROBLEM — GALE-SHAPLEY (Lecture 24)
  // ============================================================================
  {
    id: 'stable-marriage',
    title: 'The Stable Marriage Problem (Gale-Shapley Algorithm)',
    shortTitle: 'Stable Marriage',
    lectureFile: 'Lecture 24: Iterative Improvement — Stable Marriage Problem',
    category: 'iterative-improvement',
    categoryLabel: 'Module 5: Iterative Improvement',
    indexingRule: 'n Men × n Women | Ranking Matrix cell (m_rank, w_rank)',
    summary:
      'Finds a stable one-to-one marriage matching between n men and n women given their preference rankings, guaranteeing zero blocking pairs (no man m and woman w who both prefer each other over their assigned partners). In each iteration, a free man proposes to the highest-ranked woman on his preference list who has not yet rejected him; she accepts if she is free or if she prefers him over her current fiancé (dumping the former fiancé back to free).',
    pseudocodeTitle: 'Stable Marriage Algorithm (Gale-Shapley — Lecture 24 Slide 30)',
    pseudocodeLines: [
      'ALGORITHM StableMarriage(MenPrefs, WomenPrefs)',
      'Start with all n men and all n women in the FREE state',
      'while there are free men do',
      '    pick a free man m',
      '    let w be the highest-ranked woman on m’s preference list to whom m has not yet proposed',
      '    m proposes to w',
      '    if w is free then',
      '        w accepts m’s proposal → pair (m, w) is matched',
      '    else // w is currently matched to some man m_curr',
      '        if w prefers m over m_curr then',
      '            w accepts m and dumps m_curr → pair (m, w) is matched, and m_curr becomes FREE',
      '        else',
      '            w rejects m’s proposal → m remains FREE (and crosses w off his list)',
      'return the set of n matched pairs (m, w)   // Always terminates in ≤ n² proposals!',
    ],
    examples: [
      {
        id: 'marriage-fall2020-final-q6',
        name: 'Fall 2020 Final Exam Q6 (10 Marks): Men {X, Y, Z} & Women {A, B, C}',
        badge: 'Past Exam',
        description:
          'Exact 10-point question from Fall 2020 Final Exam Q6: Find a Stable Marriage matching for Men {X, Y, Z} and Women {A, B, C} with ranking matrix: X:[(1,3),(2,3),(3,1)], Y:[(3,1),(2,2),(1,2)], Z:[(2,2),(3,1),(1,3)]. Traces all 5 iterations: X→A (Accepts), Y→C (Accepts), Z→C (Rejects), Z→A (Accepts & dumps X!), X→B (Accepts) → {(X,B), (Y,C), (Z,A)}.',
        inputSummary: 'Fall 2020 Final Q6: Men {X,Y,Z}, Women {A,B,C} → Solution {(X,B), (Y,C), (Z,A)}',
        customInputDefaults: {
          men: 'X, Y, Z',
          women: 'A, B, C',
          menPrefs: 'X: A, B, C; Y: C, B, A; Z: C, A, B',
          womenPrefs: 'A: Y, Z, X; B: Z, Y, X; C: X, Y, Z',
        },
        examSimulation: {
          examPaper: 'Fall 2020 Final Exam — Question 06 (10 Marks)',
          examType: 'Final',
          marks: '10 Marks',
          questionStatement:
            'Find a Stable Marriage matching for the instance defined by the following ranking matrix, using the iterative improvement approach:\n         Women:     A        B        C\nMen   X          1, 3     2, 3     3, 1\n      Y          3, 1     2, 2     1, 2\n      Z          2, 2     3, 1     1, 3\n(Note: In each cell "r_m, r_w", the first number is the man’s rank of that woman, and the second number is the woman’s rank of that man.)',
          subQuestions: [
            'Iteration 1 (Free Men: X, Y, Z): X proposes to his 1st choice A → A is free and accepts (X, A).',
            'Iteration 2 (Free Men: Y, Z): Y proposes to his 1st choice C → C is free and accepts (Y, C).',
            'Iteration 3 (Free Men: Z): Z proposes to his 1st choice C → C compares current partner Y (rank 2) with Z (rank 3) and rejects Z.',
            'Iteration 4 (Free Men: Z): Z proposes to his 2nd choice A → A compares current partner X (rank 3) with Z (rank 2), accepts Z, and dumps X (making X free!).',
            'Iteration 5 (Free Men: X): X proposes to his 2nd choice B → B is free and accepts (X, B). Final Solution Set: {(X, B), (Y, C), (Z, A)}.',
          ],
          requiredStepsGuide: [
            '1. Read each row to see a man’s preference order (1st, 2nd, 3rd) and each column’s second number to see a woman’s preference order.',
            '2. Draw the 3×3 ranking matrix at each iteration: mark accepted proposals with a box/highlight and rejected proposals with an X (or strikethrough).',
            '3. List the "Free Men" set and the proposal/response action at each iteration until no free men remain.',
          ],
        },
      },
      {
        id: 'marriage-slide-ex1',
        name: 'Lecture 24 Slide Example: Men {Bob, Jim, Tom} & Women {Ann, Lea, Sue}',
        badge: 'Slide Example',
        description:
          'Complete trace of Lecture 24 Slides 31–44: Men {Bob, Jim, Tom} and Women {Ann, Lea, Sue}. Traces all 6 proposals: Bob→Lea (Accepts), Jim→Lea (Rejects), Jim→Sue (Accepts), Tom→Sue (Rejects), Tom→Lea (Accepts & dumps Bob!), Bob→Ann (Accepts) → {(Bob, Ann), (Jim, Sue), (Tom, Lea)}.',
        inputSummary: 'Lecture 24 Slides 31–44: {Bob, Jim, Tom} × {Ann, Lea, Sue} → {(Bob,Ann), (Jim,Sue), (Tom,Lea)}',
        customInputDefaults: {
          men: 'Bob, Jim, Tom',
          women: 'Ann, Lea, Sue',
          menPrefs: 'Bob: Lea, Ann, Sue; Jim: Lea, Sue, Ann; Tom: Sue, Lea, Ann',
          womenPrefs: 'Ann: Jim, Tom, Bob; Lea: Tom, Bob, Jim; Sue: Jim, Tom, Bob',
        },
      },
      {
        id: 'marriage-spring2021-q6',
        name: 'Spring 2021 Final Exam Q6: Gender Bias (Man-Optimal vs. Woman-Optimal 2×2 Instance)',
        badge: 'Past Exam',
        description:
          'Exact example from Spring 2021 Final Exam Q6 (15 Marks): Demonstrates why the Gale-Shapley algorithm is Man-Optimal when men propose and Woman-Optimal when women propose using the 2×2 ranking matrix: Man 1:[(1,2),(2,1)], Man 2:[(2,1),(1,2)].',
        inputSummary: 'Spring 2021 Final Q6: 2×2 Symmetric Instance (Man-Optimal vs. Woman-Optimal)',
        customInputDefaults: {
          men: 'Man1, Man2',
          women: 'Woman1, Woman2',
          menPrefs: 'Man1: Woman1, Woman2; Man2: Woman2, Woman1',
          womenPrefs: 'Woman1: Man2, Man1; Woman2: Man1, Man2',
        },
        examSimulation: {
          examPaper: 'Spring 2021 Final Exam — Question 06 (15 Marks)',
          examType: 'Final',
          marks: '15 Marks (9 + 1 + 1 + 4 Marks)',
          questionStatement:
            'Q6(i) [9 pts]: Design a simple algorithm for checking whether a given marriage matching is stable and determine its time efficiency class.\nQ6(ii) [1 pt]: Is the standard Gale-Shapley algorithm man-optimal or woman-optimal?\nQ6(iii) [1 pt]: Can we remove the gender bias nature of the stable marriage algorithm? (Yes/No)\nQ6(iv) [4 pts]: Give a very simple 2×2 example of a woman-optimal stable marriage problem.',
          subQuestions: [
            '(i) Stability Check Algorithm: Loop over every pair (m, w) not in M and check if m prefers w over his mate AND w prefers m over her mate. Time Efficiency: Θ(n²).',
            '(ii) Standard Gale-Shapley (men proposing) is Man-Optimal.',
            '(iii) Can gender bias be removed? No — one proposing side always gets its best valid partner.',
            '(iv) Simple 2×2 Example: Man1 prefers (W1, W2), Man2 prefers (W2, W1); Woman1 prefers (M2, M1), Woman2 prefers (M1, M2). When women propose, we get the woman-optimal matching {(M2, W1), (M1, W2)}!',
          ],
          requiredStepsGuide: [
            '1. Understand Blocking Pair: (m, w) blocks M if m and w are not married to each other in M, yet m prefers w to his current wife AND w prefers m to her current husband.',
            '2. When men propose, each man gets his highest-ranked partner achievable in any stable matching (Man-Optimal). When women propose, it is Woman-Optimal.',
          ],
        },
      },
    ],
    customFields: [
      {
        key: 'men',
        label: 'Men Names (comma-separated)',
        placeholder: 'X, Y, Z',
        helpText: 'List of n men.',
      },
      {
        key: 'women',
        label: 'Women Names (comma-separated)',
        placeholder: 'A, B, C',
        helpText: 'List of n women.',
      },
      {
        key: 'menPrefs',
        label: 'Men Preference Lists (semicolon-separated)',
        placeholder: 'X: A, B, C; Y: C, B, A; Z: C, A, B',
        helpText: 'For each man, list women from 1st choice to nth choice.',
      },
      {
        key: 'womenPrefs',
        label: 'Women Preference Lists (semicolon-separated)',
        placeholder: 'A: Y, Z, X; B: Z, Y, X; C: X, Y, Z',
        helpText: 'For each woman, list men from 1st choice to nth choice.',
      },
    ],
    designParadigmName: 'Iterative Improvement (Deferred Acceptance / Gale-Shapley)',
    designSteps: [
      {
        stepNumber: 1,
        title: 'Step 1: Define Blocking Pair (Instability Condition)',
        subtitle: 'What makes a matching unstable?',
        content: [
          'A marriage matching M is UNSTABLE if there exists a blocking pair (m, w) ∉ M such that:',
          '1. Man m prefers woman w over his assigned partner in M, AND',
          '2. Woman w prefers man m over her assigned partner in M.',
          'If no blocking pair exists among all n² pairs, the matching is STABLE.',
        ],
        formulaBox: 'Blocking Pair (m, w):  rank_m(w) < rank_m(mate(m))  AND  rank_w(m) < rank_w(mate(w))',
      },
      {
        stepNumber: 2,
        title: 'Step 2: Iterative Proposal & Deferred Acceptance',
        subtitle: 'Free men propose in decreasing order of preference; women trade up',
        content: [
          'While there is a free man m, he proposes to the highest-ranked woman w on his preference list to whom he has not yet proposed.',
          'If w is free, she tentatively accepts m.',
          'If w is already engaged to m_curr, she compares m and m_curr: if she prefers m (smaller rank number), she accepts m and dumps m_curr (who becomes free again); otherwise she rejects m.',
        ],
        formulaBox: 'Men propose down their list (1 → 2 → ... → n)  |  Women only improve their partner (monotone)',
      },
      {
        stepNumber: 3,
        title: 'Step 3: Guaranteed Termination in ≤ n² Iterations',
        subtitle: 'Why the algorithm can never loop infinitely',
        content: [
          'Once a woman becomes matched, she stays matched forever (she only swaps for a better partner).',
          'No man ever proposes to the same woman twice.',
          'Since there are n men and each can make at most n proposals, the total number of proposals (iterations) is at most n².',
        ],
        formulaBox: 'Maximum Proposals ≤ n(n − 1) + 1 ∈ O(n²)',
      },
      {
        stepNumber: 4,
        title: 'Step 4: Proof of Stability & Proposing-Side Optimality',
        subtitle: 'Man-Optimal when men propose; Woman-Optimal when women propose',
        content: [
          'Suppose (m, w) were a blocking pair where m prefers w over his final wife. Then m must have proposed to w earlier and been rejected (either immediately or later) in favor of someone w preferred more — contradiction!',
          'The output is always Man-Optimal (and Woman-Pessimal) when men propose. To get the Woman-Optimal stable matching, simply swap the roles so women propose to men!',
        ],
        formulaBox: 'Proposers = Man-Optimal (Unique)  |  Reviewers = Woman-Pessimal',
      },
    ],
    designChallenge: {
      scenarioTitle: 'Stable Marriage & Blocking Pair Quiz',
      problemStatement: 'Test your reading of the Ranking Matrix and Gale-Shapley properties from Past Final Exams.',
      questions: [
        {
          prompt:
            'In the CPCS-324 Ranking Matrix cell (2, 1) at row Z and column B, what do the two numbers 2 and 1 mean?',
          options: [
            'B is man Z’s 2nd choice, and Z is woman B’s 1st choice.',
            'B is man Z’s 1st choice, and Z is woman B’s 2nd choice.',
            'Z and B have proposed 2 times.',
            'Z is married to B in iteration 1.',
          ],
          correctIndex: 0,
          explanation:
            'In each cell (r_m, r_w) of the Ranking Matrix, the first number r_m is the row man’s ranking of the column woman (2nd choice), and the second number r_w is the column woman’s ranking of the row man (1st choice)!',
        },
      ],
    },
    analysis: {
      bestTime: 'Θ(n) (if every man gets his 1st choice immediately)',
      avgTime: 'O(n log n)',
      worstTime: 'Θ(n²) (at most n² − n + 1 proposals)',
      extraSpace: 'Θ(n²) to store preference/ranking matrices + Θ(n) partner arrays',
      tradeOffSummary:
        'Using a 2D inverse ranking array WomanRank[w][m] (Pre-Structuring space-for-time trade-off!) allows a woman w to compare two men m and m_curr in O(1) time, ensuring Θ(n²) worst-case time.',
      basicOperation: 'Proposal & woman’s O(1) preference comparison between two men',
      inputSizeParam: 'n men and n women (input size 2n² rankings)',
      summationSteps: [
        {
          label: '1. Bound the Total Number of Proposals',
          math: 'Proposals ≤ ∑_{m=1}^{n} n = n²',
          note: 'Each of the n men proposes to each of the n women at most once.',
        },
        {
          label: '2. Cost per Proposal using Pre-Structured Ranking Matrix',
          math: 'T(n) = O(1) per proposal × O(n²) proposals = O(n²)',
          note: 'Without the ranking matrix, scanning w’s preference list of length n would take O(n), giving O(n³).',
        },
      ],
      examNote:
        'Exam Tip (Fall 2020 Final Q6 & Spring 2021 Final Q6): Remember that Gale-Shapley is Man-Optimal, gender bias cannot be removed, and checking whether a given matching is stable takes Θ(n²) time.',
    },
  },

  // ============================================================================
  // 28. BACKTRACKING — N-QUEENS, HAMILTONIAN CIRCUIT & SUBSET-SUM (Lecture 25)
  // ============================================================================
  {
    id: 'backtracking',
    title: 'Backtracking (Subset-Sum, n-Queens & Hamiltonian Circuit)',
    shortTitle: 'Backtracking (Trees)',
    lectureFile: 'Lecture 25: Coping with Limitations — Backtracking',
    category: 'limitations-of-power',
    categoryLabel: 'Module 6: Coping with Limitations',
    indexingRule: 'Depth-First State-Space Tree | Promising vs. Non-Promising (×) Nodes',
    summary:
      'Constructs solutions one component at a time via a Depth-First Search (DFS) State-Space Tree. If a partial solution (x₁, ..., xᵢ) can still lead to a complete valid solution, the node is PROMISING and expanded; if it violates a constraint or fails a pruning inequality, it is NON-PROMISING (marked × / dead end), its subtree is pruned, and the algorithm backtracks to its parent to try the next choice.',
    pseudocodeTitle: 'General Backtracking & Subset-Sum Pruning Rules (Lecture 25 Slides 15 & 71)',
    pseudocodeLines: [
      'ALGORITHM Backtrack(X[1..i])   // X[1..i] is current partial solution at level i',
      'if X[1..i] is a complete solution (e.g., current sum s\' == d or i == n) then',
      '    write / record solution X[1..i]',
      'else',
      '    for each element x ∈ S_{i+1} consistent with X[1..i] and constraints do',
      '        // Subset-Sum Pruning Check (for sorted S₁ ≤ S₂ ≤ ... ≤ Sₙ and target d):',
      '        // Prune (Non-Promising ×) if:  (s\' + s_{i+1} > d)  OR  (s\' + ∑_{j=i+1..n} s_j < d)',
      '        X[i + 1] ← x',
      '        Backtrack(X[1..i + 1])   // Depth-First expansion!',
    ],
    examples: [
      {
        id: 'bt-fall2025-final-q6',
        name: 'Fall 2025 Final Exam Q6 (12 Marks): Subset-Sum S = {2, 4, 7, 9, 11}, d = 13',
        badge: 'Past Exam',
        description:
          'Exact 12-point question from Fall 2025 Final Exam Q6: Construct the complete Backtracking State-Space Tree for S = {2, 4, 7, 9, 11} and d = 13, clearly indicating inclusion/exclusion at each level, partial sums, promising vs. non-promising nodes, and all valid subsets: {2, 4, 7}, {2, 11}, and {4, 9}!',
        inputSummary: 'Fall 2025 Final Q6: S = {2, 4, 7, 9, 11}, d = 13 → Subsets {2,4,7}, {2,11}, {4,9}',
        customInputDefaults: {
          problemType: 'subset-sum',
          setS: '2, 4, 7, 9, 11',
          targetD: '13',
          stopAtFirst: 'false',
        },
        examSimulation: {
          examPaper: 'Fall 2025 Final Exam — Question 06 (12 Marks)',
          examType: 'Final',
          marks: '12 Marks (10 pts State-Space Tree + 2 pts Subsets)',
          questionStatement:
            'Consider the Subset-Sum Problem: Given a set S = {s₁, s₂, ..., sₙ} of positive integers and a positive integer d, determine whether there exists a subset of S whose elements sum exactly to d.\nUsing the Backtracking approach, construct the state-space tree for the given instance:\n   S = {2, 4, 7, 9, 11}  and  d = 13\nclearly indicating inclusion and exclusion of elements at each level and partial sum of each node. Also identify promising and non-promising nodes based on the backtracking conditions. Moreover, clearly show the subset(s) that satisfy the given sum, if any exist.',
          subQuestions: [
            '1. State-Space Tree (10 Marks): Left branch at level i includes sᵢ ("w/ sᵢ"), Right branch excludes sᵢ ("w/o sᵢ"). Write the running sum s\' inside each node circle.',
            '2. Pruning / Non-Promising Nodes: Any node whose sum exceeds d = 13 (e.g., 6+9=15 > 13, 9+9=18 > 13, 11+11=22 > 13) or whose remaining sum cannot reach 13 is marked as non-promising (×).',
            '3. Solution Subsets (2 Marks): Circle every node where partial sum s\' = 13 → Subsets are {2, 4, 7}, {2, 11}, and {4, 9}!',
          ],
          requiredStepsGuide: [
            '1. Start at Root with partial sum s\' = 0.',
            '2. Branch Left (With sᵢ: add sᵢ to parent sum) and Right (Without sᵢ: keep parent sum) in Depth-First order.',
            '3. Check pruning rules: if s\' == 13 → Solution found! If s\' > 13 or s\' + s_{i+1} > 13 or s\' + remaining < 13 → mark × and backtrack.',
          ],
        },
      },
      {
        id: 'bt-fall2025-cfe-q5a',
        name: 'Fall 2025 Final Exam (CFE Q5a): Subset-Sum A = {1, 5, 7, 9}, d = 10 (Stop at 1st Solution)',
        badge: 'Past Exam',
        description:
          'Exact 3-point question from Fall 2025 CFE Final Exam Q5(a): Apply Backtracking to A = {1, 5, 7, 9} and d = 10, stopping as soon as the first solution is found. Shows pruning at s\'=6 (6+7 > 10 → X) and s\'=8 (8+9 > 10 → X), then finds s\'=10 with subset {1, 9}!',
        inputSummary: 'Fall 2025 CFE Q5a: A = {1, 5, 7, 9}, d = 10 (Stop at 1st Solution → {1, 9})',
        customInputDefaults: {
          problemType: 'subset-sum',
          setS: '1, 5, 7, 9',
          targetD: '10',
          stopAtFirst: 'true',
        },
        examSimulation: {
          examPaper: 'Fall 2025 Final Exam (CFE) — Question 05(a) (3 Marks)',
          examType: 'Final',
          marks: '3 Marks',
          questionStatement:
            'Given a set A = {1, 5, 7, 9} and d = 10, apply the backtracking algorithm to find a subset of S whose sum is equal to d. Stop the construction of the state-space tree when you find a solution. Then answer:\n1. The subset whose sum equals d = 10 is ____________.\n2. In backtracking algorithms, the state-space tree is developed using: (i) Depth-first approach (similar to DFS) or (ii) Best-first approach.',
          subQuestions: [
            '1. Root (0) → With 1 (1) → With 5 (6): Check next item 7: 6 + 7 = 13 > 10 → Prune (X)! Backtrack to node (1).',
            '2. From (1) → Without 5 (1) → With 7 (8): Check next item 9: 8 + 9 = 17 > 10 → Prune (X)! Backtrack to node (1).',
            '3. From (1) → Without 7 (1) → With 9 (10): Sum = 10 == d → Solution Found! Subset = {1, 9}.',
            '4. Answer to Q2: (i) Depth-first approach (similar to Depth-First Search).',
          ],
          requiredStepsGuide: [
            '1. Expand only the left ("With") branch first (DFS).',
            '2. At node 6 (after {1, 5}), write "6 + 7 > 10" and mark X.',
            '3. Backtrack to 1, take "Without 5", then "With 7" to get 8; write "8 + 9 > 10" and mark X.',
            '4. Backtrack to 1, take "Without 7", then "With 9" to get 10 → Stop and write Subset = {1, 9}!',
          ],
        },
      },
      {
        id: 'bt-slide-subset-ex1',
        name: 'Lecture 25 Slide Example (Slides 73–90): Subset-Sum S = {1, 2, 5, 6, 8}, d = 9',
        badge: 'Slide Example',
        description:
          'Complete trace of Lecture 25 Slides 73–90: S = {1, 2, 5, 6, 8}, d = 9. Demonstrates both pruning inequalities (s\' + s_{i+1} > 9 and s\' + ∑ s_j < 9) and finds solutions {1, 2, 6} and {1, 8}.',
        inputSummary: 'Lecture 25 Slides 73–90: S = {1, 2, 5, 6, 8}, d = 9 → {1,2,6} & {1,8}',
        customInputDefaults: {
          problemType: 'subset-sum',
          setS: '1, 2, 5, 6, 8',
          targetD: '9',
          stopAtFirst: 'false',
        },
      },
      {
        id: 'bt-slide-subset-ex2',
        name: 'Lecture 25 Slide 91 Student Exercise: Subset-Sum S = {3, 5, 6, 7}, d = 15',
        badge: 'Slide Example',
        description:
          'Complete trace of Lecture 25 Slide 91 Exercise: S = {3, 5, 6, 7}, d = 15. Shows pruning at {3,5,6} (14+7 > 15), {3,6} (9+7 > 15), and Without 3 (0+18 > 15 → branch, then < 15 pruned), finding {3, 5, 7} = 15.',
        inputSummary: 'Lecture 25 Slide 91: S = {3, 5, 6, 7}, d = 15 → {3, 5, 7}',
        customInputDefaults: {
          problemType: 'subset-sum',
          setS: '3, 5, 6, 7',
          targetD: '15',
          stopAtFirst: 'false',
        },
      },
      {
        id: 'bt-slide-4queens',
        name: 'Lecture 25 Slides 19–55: The 4-Queens Problem State-Space Tree (n = 4)',
        badge: 'Slide Example',
        description:
          'Complete trace of the 4-Queens State-Space Tree from Lecture 25 Slides 19–55 (Nodes 0 to 16+): Places queens row-by-row on a 4×4 chessboard so no two queens share the same row, column, or diagonal. Discovers first solution [Col 2, Col 4, Col 1, Col 3] and symmetric second solution [Col 3, Col 1, Col 4, Col 2].',
        inputSummary: 'Lecture 25 Slides 19–55: 4-Queens Problem (4×4 Board) → [2,4,1,3] & [3,1,4,2]',
        customInputDefaults: {
          problemType: 'n-queens',
          setS: '4',
          targetD: '4',
          stopAtFirst: 'false',
        },
      },
      {
        id: 'bt-slide-hamiltonian',
        name: 'Lecture 25 Slides 56–65: Hamiltonian Circuit Problem (Vertices a..f)',
        badge: 'Slide Example',
        description:
          'Complete trace of Lecture 25 Slides 56–65: Starts at vertex a in graph {a,b,c,d,e,f}, explores a→b→c→d→e→f (dead end: f cannot return to a), backtracks to e (dead end), backtracks to c→f (dead end), backtracks to b→f→e→c→d→a to find the Hamiltonian Circuit!',
        inputSummary: 'Lecture 25 Slides 56–65: Graph {a..f} → Circuit a→b→f→e→c→d→a',
        customInputDefaults: {
          problemType: 'hamiltonian',
          setS: 'a, b, c, d, e, f',
          targetD: 'a',
          stopAtFirst: 'false',
        },
      },
    ],
    customFields: [
      {
        key: 'problemType',
        label: 'Backtracking Problem (subset-sum | n-queens | hamiltonian)',
        placeholder: 'subset-sum',
        helpText: 'Choose "subset-sum", "n-queens", or "hamiltonian".',
      },
      {
        key: 'setS',
        label: 'Set S (for Subset-Sum) or Board Size n (for n-Queens)',
        placeholder: '2, 4, 7, 9, 11',
        helpText: 'Comma-separated positive integers in ascending order (e.g. 2, 4, 7, 9, 11).',
      },
      {
        key: 'targetD',
        label: 'Target Sum d',
        placeholder: '13',
        helpText: 'Target subset sum d (e.g. 13 or 10).',
      },
      {
        key: 'stopAtFirst',
        label: 'Stop at First Solution? (true | false)',
        placeholder: 'false',
        helpText: 'Set "true" to stop immediately after the first solution (like Fall 2025 CFE Q5a), or "false" for full tree (like Fall 2025 Final Q6).',
      },
    ],
    designParadigmName: 'Coping with Intractability: Depth-First State-Space Tree Pruning',
    designSteps: [
      {
        stepNumber: 1,
        title: 'Step 1: Define the State-Space Tree Representation',
        subtitle: 'Each level i represents the choice for the i-th component of the tuple (x₁, ..., xᵢ)',
        content: [
          'Root (Level 0) represents the initial empty state before any decision is made (e.g., empty board, starting vertex a, or partial sum s\' = 0).',
          'In Subset-Sum: the state-space tree is a binary tree where the left branch includes s_{i+1} ("With s_{i+1}") and the right branch excludes s_{i+1} ("Without s_{i+1}").',
          'In n-Queens: level i places Queen i in row i across columns 1..n.',
        ],
        formulaBox: 'Level i Node = Partial Solution (x₁, x₂, ..., xᵢ)',
      },
      {
        stepNumber: 2,
        title: 'Step 2: Sort Input & Formulate Promising / Pruning Conditions',
        subtitle: 'Detect dead ends as early as possible without expanding their subtrees',
        content: [
          'For Subset-Sum, first sort the set in non-decreasing order: s₁ ≤ s₂ ≤ ... ≤ sₙ.',
          'Inequality 1 (Next-Smallest Overflow): If s\' + s_{i+1} > d, then even adding the smallest remaining element exceeds d → Prune!',
          'Inequality 2 (Remaining-Sum Underflow): If s\' + ∑_{j=i+1}^n s_j < d, then even adding ALL remaining elements cannot reach d → Prune!',
        ],
        formulaBox:
          'Subset-Sum Non-Promising (Prune ×) if:\n(1) s\' + s_{i+1} > d     OR     (2) s\' + ∑_{j=i+1}^{n} s_j < d',
      },
      {
        stepNumber: 3,
        title: 'Step 3: Traverse the Tree in Depth-First Search (DFS) Order',
        subtitle: 'Plunge deep along left branches; backtrack on dead ends',
        content: [
          'Always expand the leftmost promising child first (Depth-First Search).',
          'When a node is marked non-promising (×), do not generate its children; immediately backtrack to its parent and try the next branch.',
        ],
        formulaBox: 'Backtracking Traversal Order = Depth-First Search (DFS)',
      },
      {
        stepNumber: 4,
        title: 'Step 4: Record Solution Leaves (Stop at First vs. Find All)',
        subtitle: 'Check whether the exam asks for one solution or all solutions',
        content: [
          'When a node reaches partial sum s\' == d (or places all n queens / completes the Hamiltonian cycle back to a), mark it as a Solution!',
          'If the exam says "Stop when you find a solution" (Fall 2025 CFE Q5a), halt immediately. If it asks to construct the full state-space tree and list all subsets (Fall 2025 Final Q6), continue backtracking until all branches are explored.',
        ],
        formulaBox: 'Solution Leaf:  s\' == d   ⇒   Output subset of elements on "With" branches from root',
      },
    ],
    designChallenge: {
      scenarioTitle: 'Backtracking & Pruning Rules Quiz',
      problemStatement: 'Test your mastery of Subset-Sum pruning inequalities and Backtracking vs. Branch-and-Bound.',
      questions: [
        {
          prompt:
            'In Subset-Sum with sorted set S = {1, 5, 7, 9} and target d = 10, after choosing "With 1" and "With 5" (so current sum s\' = 6 and next element is s₃ = 7), why is node 6 immediately pruned as non-promising (X)?',
          options: [
            'Because s\' + s₃ = 6 + 7 = 13 > 10 (adding even the smallest remaining element exceeds d = 10).',
            'Because 6 is an even number.',
            'Because Backtracking uses Breadth-First Search.',
            'Because 6 + 7 + 9 < 10.',
          ],
          correctIndex: 0,
          explanation:
            'Since S is sorted in increasing order (7 ≤ 9), the smallest available remaining element is 7. Because 6 + 7 = 13 > 10, no subset extending {1, 5} can ever sum to 10!',
        },
      ],
    },
    analysis: {
      bestTime: 'O(n) (if first branch leads directly to a solution)',
      avgTime: 'Much faster than exhaustive search due to pruning',
      worstTime: 'O(2ⁿ) for Subset-Sum | O(n!) for n-Queens & Hamiltonian Circuit',
      extraSpace: 'Θ(n) recursion stack depth (DFS keeps only current root-to-node path in memory)',
      tradeOffSummary:
        'Backtracking avoids the exponential memory of Breadth-First/Best-First search by using Θ(n) DFS stack space while pruning large subtrees via feasibility checks.',
      basicOperation: 'Promising / feasibility check at each generated state-space tree node',
      inputSizeParam: 'n elements / vertices / queens',
      summationSteps: [
        {
          label: '1. Full Binary State-Space Tree Size (Subset-Sum Worst Case)',
          math: 'Total Nodes ≤ ∑_{i=0}^{n} 2^i = 2^{n+1} − 1 ∈ O(2^n)',
          note: 'Pruning inequalities s\' + s_{i+1} > d and s\' + ∑ s_j < d eliminate most of these 2^{n+1}-1 nodes in practice.',
        },
      ],
      examNote:
        'Exam Favorite (Fall 2025 Final Q6 & Fall 2025 CFE Q5a): Always remember that Backtracking builds its state-space tree using a DEPTH-FIRST approach (DFS), and write the pruning reason (e.g. 6+7 > 10) next to pruned nodes!',
    },
  },

  // ============================================================================
  // 29. BRANCH AND BOUND — 0-1 KNAPSACK & ASSIGNMENT PROBLEM (Lecture 26)
  // ============================================================================
  {
    id: 'branch-and-bound',
    title: 'Branch and Bound (0-1 Knapsack & Assignment Problem)',
    shortTitle: 'Branch and Bound',
    lectureFile: 'Lecture 26: Coping with Limitations — Branch and Bound',
    category: 'limitations-of-power',
    categoryLabel: 'Module 6: Coping with Limitations',
    indexingRule: 'Best-First State-Space Tree | Upper Bound ub (Max) or Lower Bound lb (Min)',
    summary:
      'Enhances the state-space tree technique for optimization problems by computing a numeric bound (Upper Bound ub for maximization like 0-1 Knapsack, or Lower Bound lb for minimization like the Assignment Problem) at every node. Uses Best-First Search to always expand the most promising live node (highest ub or lowest lb) and prunes any node whose bound cannot beat the best feasible solution found so far.',
    pseudocodeTitle: 'Best-First Branch and Bound for 0-1 Knapsack (Lecture 26 Slides 64–70)',
    pseudocodeLines: [
      'ALGORITHM KnapsackBranchAndBound(Weights[1..n], Values[1..n], W)',
      'Step 1: Reorder all n items in descending order of value-to-weight ratio: v₁/w₁ ≥ v₂/w₂ ≥ ... ≥ vₙ/wₙ',
      'Step 2: Initialize Root Node (Level 0) with w = 0, v = 0, and compute upper bound:',
      '        ub = v + (W − w) × (v_{i+1} / w_{i+1})   // Fractional payoff using next best item i+1',
      'Step 3: While there is a promising Live Node with ub > BestValueSoFar do',
      '        Pick the Live Node with the LARGEST upper bound ub (Best-First Search)',
      '        Generate Left Child ("With item i+1"):  w_L = w + w_{i+1},  v_L = v + v_{i+1}',
      '            If w_L > W then mark Left Child as Not Feasible (X)',
      '            Else compute ub_L = v_L + (W − w_L) × (v_{i+2} / w_{i+2}) and update BestValueSoFar',
      '        Generate Right Child ("Without item i+1"): w_R = w, v_R = v, ub_R = v + (W − w) × (v_{i+2} / w_{i+2})',
      '        Prune (kill) any Live Node whose ub ≤ BestValueSoFar',
      'return BestSubset and BestValueSoFar',
    ],
    secondaryPseudocodeTitle: 'Assignment Problem Branch and Bound (Lecture 26 Slides 20–59)',
    secondaryPseudocodeLines: [
      'Step 1: At Root (Level 0), compute Lower Bound lb = ∑_{i=1..n} min_{1≤j≤n} C[i, j] (sum of minimum element in each row)',
      'Step 2: At Level i, assign Person i to each available Job j (columns not yet taken by ancestors)',
      'Step 3: For each child node, compute lb = (cost of jobs assigned so far) + (sum of row minimums for remaining persons from available columns)',
      'Step 4: Always expand the Live Node with the SMALLEST lower bound lb (Best-First Minimization) until a leaf with lb ≤ all other live nodes is reached!',
    ],
    examples: [
      {
        id: 'bb-fall2025-cfe-q5b',
        name: 'Fall 2025 Final Exam (CFE Q5b): 0-1 Knapsack B&B (W = 5, 4 Items → Subset {2, 4, 1}, v = $16)',
        badge: 'Past Exam',
        description:
          'Exact 3-point question from Fall 2025 CFE Final Exam Q5(b): Solve the 0-1 Knapsack instance with W = 5 and items 1:(w=2,$5), 2:(w=1,$4), 3:(w=3,$8), 4:(w=2,$7) using Branch and Bound. First sorts items by vᵢ/wᵢ ratio → [Item 2 (4.0), Item 4 (3.5), Item 3 (2.67), Item 1 (2.5)], builds the B&B tree with ub = v + (W-w)(v_{i+1}/w_{i+1}), and finds optimal subset {2, 4, 1} with value $16!',
        inputSummary: 'Fall 2025 CFE Q5b: Items (2,$5),(1,$4),(3,$8),(2,$7), W=5 → Subset {2,4,1}, Value = $16',
        customInputDefaults: {
          problemType: 'knapsack',
          items: '1:2:5, 2:1:4, 3:3:8, 4:2:7',
          capacity: '5',
        },
        examSimulation: {
          examPaper: 'Fall 2025 Final Exam (CFE) — Question 05(b) (3 Marks)',
          examType: 'Final',
          marks: '3 Marks',
          questionStatement:
            'Solve the following instance of the knapsack problem by the branch-and-bound algorithm (Knapsack capacity W = 5):\n   Item 1: Weight = 2, Value = $5\n   Item 2: Weight = 1, Value = $4\n   Item 3: Weight = 3, Value = $8\n   Item 4: Weight = 2, Value = $7\nHint: ub = v + (W − w)(v_{i+1} / w_{i+1}). You must first sort items in decreasing order according to their ratio (payoff): v₁/w₁ ≥ v₂/w₂ ≥ ... ≥ vₙ/wₙ.\n1. Fill in the Sorted Items table based on their ratio.\n2. Fill in the missing w, v, and ub boxes in the Branch-and-Bound State-Space Tree.\n3. State the optimal solution (subset).',
          subQuestions: [
            '1. Sorted Items by Ratio vᵢ/wᵢ: Item 2 (w=1, v=4, ratio=4), Item 4 (w=2, v=7, ratio=3.5), Item 3 (w=3, v=8, ratio=2.67), Item 1 (w=2, v=5, ratio=2.5).',
            '2. Root: w=0, v=0, ub = 0 + (5−0)×4 = 20. Branch on Item 2: Left (With 2): w=1, v=4, ub = 4 + (5−1)×3.5 = 18; Right (Without 2): w=0, v=0, ub = 0 + 5×3.5 = 17.5.',
            '3. Expand best live node (ub=18, With 2) on Item 4: Left (With 4): w=3, v=11, ub = 11 + (5−3)×2.67 = 16.34; Right (Without 4): w=1, v=4, ub = 4 + 4×2.67 = 14.68.',
            '4. Notice ub=17.5 (Without 2) is also expanded in the exam diagram on Item 4: Left (With 4): w=2, v=7, ub = 7 + 3×2.67 = 15.01; Right (Without 4): w=0, v=0, ub = 0 + 5×2.67 = 13.35.',
            '5. Expand (w=3, v=11, ub=16.34) on Item 3: Left (With 3): w = 3+3 = 6 > 5 → X (Infeasible); Right (Without 3): w=3, v=11, ub = 11 + (5−3)×2.5 = 16.',
            '6. Expand (w=3, v=11, ub=16) on Item 1: Left (With 1): w=5, v=16, ub=16 (Optimal Solution!); Right (Without 1): w=3, v=11, ub=11. Optimal subset = {2, 4, 1}!',
          ],
          requiredStepsGuide: [
            'Step 1: Compute vᵢ/wᵢ for each item and sort descending: Item 2 (4), Item 4 (3.5), Item 3 (2.67), Item 1 (2.5).',
            'Step 2: At each node at level i, use the NEXT item’s ratio (level i+1) in ub = v + (W − w) × ratio_{i+1}.',
            'Step 3: If w > W, write w = 6 and X (infeasible). Otherwise compute w, v, and ub.',
            'Step 4: Read the optimal subset from the "With" branches leading to the optimal leaf (v = 16, ub = 16) → {2, 4, 1}.',
          ],
        },
      },
      {
        id: 'bb-slide-knapsack',
        name: 'Lecture 26 Slides 66–98: 0-1 Knapsack B&B (W = 10, 4 Items → Subset {1, 3}, v = $65)',
        badge: 'Slide Example',
        description:
          'Complete trace of Lecture 26 Slides 66–98: 4 items (1: w=4,v=$40, r=10; 2: w=7,v=$42, r=6; 3: w=5,v=$25, r=5; 4: w=3,v=$12, r=4) with W = 10. Traces Nodes 0 through 8: Root (ub=100) → Node 1 (w=4,v=40,ub=76) & Node 2 (w=0,v=0,ub=60) → Node 3 (w=11 > 10 Not Feasible) & Node 4 (w=4,v=40,ub=70) → Node 5 (w=9,v=65,ub=69) & Node 6 (w=4,v=40,ub=64) → Node 7 (w=12 > 10 Not Feasible) & Node 8 (w=9,v=65,ub=65, Optimal Subset {1, 3})!',
        inputSummary: 'Lecture 26 Slides 66–98: Items (4,$40),(7,$42),(5,$25),(3,$12), W=10 → Subset {1,3}, v=$65',
        customInputDefaults: {
          problemType: 'knapsack',
          items: '1:4:40, 2:7:42, 3:5:25, 4:3:12',
          capacity: '10',
        },
      },
      {
        id: 'bb-slide-assignment',
        name: 'Lecture 26 Slides 20–59: Assignment Problem B&B (4 Persons × 4 Jobs → Min Cost = 13)',
        badge: 'Slide Example',
        description:
          'Complete trace of Lecture 26 Slides 20–59: 4 persons {a,b,c,d} and 4 jobs {1,2,3,4} with cost matrix [9,2,7,8; 6,4,3,7; 5,8,1,8; 7,6,9,4]. Root lb = 2+3+1+4 = 10; Level 1 expands a→1 (lb=17), a→2 (lb=12, min!), a→3 (lb=20), a→4 (lb=18); Level 2 from a→2 expands b→1 (lb=13, min!), b→3 (lb=14), b→4 (lb=17); Level 3 from b→1 expands c→3, d→4 (cost=13, Optimal!) and c→4, d→3 (cost=25).',
        inputSummary: 'Lecture 26 Slides 20–59: 4×4 Cost Matrix → Optimal a→2, b→1, c→3, d→4 (Cost = 13)',
        customInputDefaults: {
          problemType: 'assignment',
          items: '9 2 7 8; 6 4 3 7; 5 8 1 8; 7 6 9 4',
          capacity: '4',
        },
      },
    ],
    customFields: [
      {
        key: 'problemType',
        label: 'B&B Problem (knapsack | assignment)',
        placeholder: 'knapsack',
        helpText: 'Use "knapsack" for 0-1 Knapsack B&B or "assignment" for Assignment Problem B&B.',
      },
      {
        key: 'items',
        label: 'Items (id:weight:value) or Cost Matrix Rows',
        placeholder: '1:2:5, 2:1:4, 3:3:8, 4:2:7',
        helpText: 'For Knapsack: id:weight:value comma-separated. For Assignment: semicolon-separated matrix rows.',
      },
      {
        key: 'capacity',
        label: 'Knapsack Capacity W (or Matrix Size n)',
        placeholder: '5',
        helpText: 'Knapsack weight limit W (e.g. 5 or 10).',
      },
    ],
    designParadigmName: 'Coping with Intractability: Best-First Search with Bounding Functions',
    designSteps: [
      {
        stepNumber: 1,
        title: 'Step 1: Preprocess / Order Candidates to Tighten the Bound',
        subtitle: 'For 0-1 Knapsack, sort items by descending value-to-weight ratio vᵢ / wᵢ',
        content: [
          'In 0-1 Knapsack, compute the payoff per unit weight (vᵢ / wᵢ) for each item and sort the items in non-increasing order: v₁/w₁ ≥ v₂/w₂ ≥ ... ≥ vₙ/wₙ.',
          'In the Assignment Problem, identify the minimum cost in each row i of the n × n cost matrix C.',
        ],
        formulaBox: 'Knapsack Payoff Ratio:  rᵢ = vᵢ / wᵢ   (sorted so r₁ ≥ r₂ ≥ ... ≥ rₙ)',
      },
      {
        stepNumber: 2,
        title: 'Step 2: Define the Optimistic Bounding Function (ub or lb)',
        subtitle: 'Upper bound ub ≥ any feasible completion (Max); Lower bound lb ≤ any feasible completion (Min)',
        content: [
          '0-1 Knapsack Upper Bound (ub): Add to current value v the remaining capacity (W − w) multiplied by the best per-unit ratio (v_{i+1}/w_{i+1}) among remaining items.',
          'Assignment Problem Lower Bound (lb): Sum the exact costs of rows already assigned plus the minimum available entry in each unassigned row.',
        ],
        formulaBox:
          'Knapsack Upper Bound:   ub = v + (W − w) × (v_{i+1} / w_{i+1})\nAssignment Lower Bound: lb = ∑_{assigned} C[i, job(i)] + ∑_{unassigned r} min_{avail j} C[r, j]',
      },
      {
        stepNumber: 3,
        title: 'Step 3: Best-First Branching Strategy',
        subtitle: 'Always expand the most promising Live Node (largest ub or smallest lb)',
        content: [
          'Unlike Backtracking (which uses blind Depth-First Search), Best-First Branch and Bound compares all currently active Live Nodes and expands the one with the best bound (highest ub for maximization, lowest lb for minimization).',
          'For Knapsack, generate two children: Left ("With item i+1") and Right ("Without item i+1").',
        ],
        formulaBox: 'Next Node to Expand = argmax_{node ∈ LiveNodes} (ub)   [or argmin (lb)]',
      },
      {
        stepNumber: 4,
        title: 'Step 4: Prune by Infeasibility & Bound Inferiority',
        subtitle: 'Terminate as soon as no Live Node has a better bound than the best solution found',
        content: [
          'A node is terminated (pruned / marked X) if:',
          '1. It violates constraints (e.g., total weight w > W in Knapsack).',
          '2. Its bound is no better than the value of the best complete solution already found (ub ≤ BestValue for Max, or lb ≥ BestCost for Min).',
          '3. It is a single complete feasible solution (leaf node), in which case it updates BestValue.',
        ],
        formulaBox: 'Stop when:  max_{LiveNodes}(ub) ≤ BestSolutionValue',
      },
    ],
    designChallenge: {
      scenarioTitle: 'Branch and Bound Exam Mastery Quiz',
      problemStatement: 'Test your ability to compute Knapsack upper bounds and distinguish Backtracking from Branch-and-Bound.',
      questions: [
        {
          prompt:
            'In 0-1 Knapsack Branch-and-Bound with W = 5 and sorted items: Item 2 (w=1, v=4, r=4), Item 4 (w=2, v=7, r=3.5), Item 3 (w=3, v=8, r=2.67), Item 1 (w=2, v=5, r=2.5), what is the upper bound ub at the node "With 2" (level 1, where w=1, v=4)?',
          options: [
            'ub = 4 + (5 − 1) × 3.5 = 4 + 14 = 18',
            'ub = 4 + (5 − 1) × 4 = 20',
            'ub = 0 + 5 × 3.5 = 17.5',
            'ub = 4 + (5 − 1) × 2.67 = 14.68',
          ],
          correctIndex: 0,
          explanation:
            'At level 1 (after deciding on the 1st sorted item, Item 2), the next best remaining item is the 2nd sorted item (Item 4, with ratio v₄/w₄ = 3.5). Thus ub = v + (W − w) × 3.5 = 4 + (5 − 1) × 3.5 = 18!',
        },
        {
          prompt:
            'What is the main structural difference between Backtracking and Branch-and-Bound (Lecture 26 & Fall 2025 Final)?',
          options: [
            'Backtracking applies to non-optimization/constraint satisfaction problems using Depth-First Search (DFS), whereas Branch-and-Bound applies to optimization problems using a numeric bounding function (ub/lb) and typically Best-First Search.',
            'Backtracking only works on graphs, while Branch-and-Bound only works on arrays.',
            'Backtracking uses upper bounds, while Branch-and-Bound does not.',
            'Branch-and-Bound always runs in O(n) time.',
          ],
          correctIndex: 0,
          explanation:
            'Backtracking traverses the state-space tree in DFS order and checks feasibility constraints, while Branch-and-Bound computes an upper/lower bound on the optimal value of every subtree to guide Best-First branching and prune suboptimal branches.',
        },
      ],
    },
    analysis: {
      bestTime: 'O(n log n) (sorting + direct path to optimal leaf)',
      avgTime: 'Drastically fewer nodes than 2ⁿ via Best-First bound pruning',
      worstTime: 'O(2ⁿ) for 0-1 Knapsack | O(n!) for Assignment Problem',
      extraSpace: 'O(2ⁿ) worst-case (typically small priority queue of Live Nodes)',
      tradeOffSummary:
        'Trades extra memory (storing Live Nodes and their bounds in a priority queue) to expand only the most promising branches first, often finding the global optimum after inspecting just a handful of nodes.',
      basicOperation: 'Bound calculation ub = v + (W − w)(v_{i+1}/w_{i+1}) and priority queue selection',
      inputSizeParam: 'n items (or n × n assignment matrix)',
      summationSteps: [
        {
          label: '1. Preprocessing Sort by Value-to-Weight Ratio',
          math: 'T_{sort}(n) = Θ(n log n)',
          note: 'Required before constructing the Knapsack B&B tree.',
        },
        {
          label: '2. State-Space Tree Exploration with Bound Pruning',
          math: 'T_{tree}(n) = O(n) per Assignment node, O(1) per Knapsack node (Worst case O(2^n))',
          note: 'In Lecture 26 Slide 98, only 9 nodes (out of 2⁵ − 1 = 31) are generated to prove optimality!',
        },
      ],
      examNote:
        'Exam Favorite (Fall 2025 CFE Q5b): Always sort items by ratio vᵢ/wᵢ in decreasing order FIRST, and remember to use the NEXT item’s ratio (v_{i+1}/w_{i+1}) when calculating ub at level i!',
    },
  },
];
