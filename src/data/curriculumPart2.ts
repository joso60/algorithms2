import type { AlgorithmMeta } from '../types/algorithm';

export const ALGORITHMS_PART2: AlgorithmMeta[] = [
  // ==========================================================================
  // 8. ASSEMBLY LINE SCHEDULING
  // ==========================================================================
  {
    id: 'assembly-line',
    title: 'Assembly Line Scheduling (ALS)',
    shortTitle: 'Assembly Line Scheduling',
    lectureFile: '08-CPCS 324 - DP-AssemblyLineScheduling.pptx',
    category: 'dynamic-programming',
    categoryLabel: 'Module 3: Dynamic Programming',
    indexingRule: '1-based stations: j = 1..n, Lines i = 1, 2, l[i, j] for j = 2..n',
    syllabusInfo: {
      status: 'excluded',
      badgeLabel: 'EXCLUDED (SLIDES 9–102)',
      excludedSlides: 'Slides 9 to 102 (Case Studies: Assembly Line Scheduling Problem — most of File 08)',
      requiredScope: 'Slides 1 to 8 ONLY (General Introduction to Dynamic Programming)',
      reason: 'Excluded per Instructor Blacklist & Official Syllabus: Assembly Line Scheduling Problem is removed.',
      affectedExams: [
        'Winter 2023 Midterm Exam Q4 (Assembly Line Scheduling & MCQs — EXCLUDED)',
      ],
    },
    summary:
      '🚫 [EXCLUDED FROM SYLLABUS — Slides 9–102 of File 08; only Slides 1–8 General DP Intro are required]. Finds the fastest path for an automobile chassis through two parallel assembly lines with n stations each.',
    pseudocodeTitle: 'Algorithm: Fastest-Way(a, t, e, x, n)',
    pseudocodeLines: [
      'f₁[1] ← e₁ + a_{1,1}',
      'f₂[1] ← e₂ + a_{2,1}',
      'for j ← 2 to n do',
      '    if f₁[j - 1] + a_{1,j} ≤ f₂[j - 1] + t_{2,j-1} + a_{1,j} then',
      '        f₁[j] ← f₁[j - 1] + a_{1,j};  l₁[j] ← 1',
      '    else',
      '        f₁[j] ← f₂[j - 1] + t_{2,j-1} + a_{1,j};  l₁[j] ← 2',
      '    if f₂[j - 1] + a_{2,j} ≤ f₁[j - 1] + t_{1,j-1} + a_{2,j} then',
      '        f₂[j] ← f₂[j - 1] + a_{2,j};  l₂[j] ← 2',
      '    else',
      '        f₂[j] ← f₁[j - 1] + t_{1,j-1} + a_{2,j};  l₂[j] ← 1',
      'if f₁[n] + x₁ ≤ f₂[n] + x₂ then',
      '    f* ← f₁[n] + x₁;  l* ← 1',
      'else f* ← f₂[n] + x₂;  l* ← 2',
    ],
    secondaryPseudocodeTitle: 'Step 4 Algorithm: Print-Stations(l, l*, n)',
    secondaryPseudocodeLines: [
      'i ← l*',
      'print "line " + i + ", station " + n',
      'for j ← n downto 2 do',
      '    i ← lᵢ[j]',
      '    print "line " + i + ", station " + (j - 1)',
    ],
    examples: [
      {
        id: 'als-slide-60',
        name: 'Slide 60 Factory Example (6 Stations, f* = 38, l* = 1)',
        badge: 'Slide Example',
        description: 'Exact 6-station assembly line trace from Lecture 08 Slides 60–97.',
        inputSummary: 'a₁=[7,9,3,4,8,4], a₂=[8,5,6,4,5,7], e=[2,4], x=[3,2]',
        customInputDefaults: {
          a1: '7, 9, 3, 4, 8, 4',
          a2: '8, 5, 6, 4, 5, 7',
          t1: '2, 3, 1, 3, 4',
          t2: '2, 1, 2, 2, 1',
          ex: '2, 4, 3, 2',
        },
      },
      {
        id: 'als-standard-4',
        name: '4-Station Quick Exam Practice',
        badge: 'Standard Case',
        description: 'Compact 4-station problem ideal for rapid hand-tracing practice.',
        inputSummary: 'a₁=[4,5,3,2], a₂=[2,10,1,4], t₁=[0,7,4], t₂=[0,9,2]',
        customInputDefaults: {
          a1: '4, 5, 3, 2',
          a2: '2, 10, 1, 4',
          t1: '1, 7, 4',
          t2: '2, 9, 2',
          ex: '10, 12, 18, 7',
        },
      },
      {
        id: 'als-zero-transfer',
        name: 'High Transfer Penalty Edge Case',
        badge: 'Edge Case',
        description: 'Transfer costs are so large that the chassis never switches lines once entered.',
        inputSummary: 't₁ = [50, 50, 50], t₂ = [50, 50, 50]',
        customInputDefaults: {
          a1: '5, 6, 4, 7',
          a2: '4, 8, 3, 6',
          t1: '50, 50, 50',
          t2: '50, 50, 50',
          ex: '2, 3, 4, 2',
        },
      },
    ],
    customFields: [
      {
        key: 'a1',
        label: 'Line 1 Station Costs a₁,₁ .. a₁,ₙ',
        placeholder: '7, 9, 3, 4, 8, 4',
        helpText: 'Comma-separated processing times on Line 1.',
      },
      {
        key: 'a2',
        label: 'Line 2 Station Costs a₂,₁ .. a₂,ₙ',
        placeholder: '8, 5, 6, 4, 5, 7',
        helpText: 'Comma-separated processing times on Line 2.',
      },
      {
        key: 't1',
        label: 'Transfer Costs t₁,₁ .. t₁,ₙ₋₁ (Line 1 → Line 2)',
        placeholder: '2, 3, 1, 3, 4',
        helpText: 'n - 1 transfer costs from Line 1 to Line 2.',
      },
      {
        key: 't2',
        label: 'Transfer Costs t₂,₁ .. t₂,ₙ₋₁ (Line 2 → Line 1)',
        placeholder: '2, 1, 2, 2, 1',
        helpText: 'n - 1 transfer costs from Line 2 to Line 1.',
      },
      {
        key: 'ex',
        label: 'Entry & Exit Costs [e₁, e₂, x₁, x₂]',
        placeholder: '2, 4, 3, 2',
        helpText: 'Four numbers: e₁, e₂, x₁, x₂.',
      },
    ],
    designParadigmName: 'Dynamic Programming (The 4-Step Framework — Lecture 08)',
    designSteps: [
      {
        stepNumber: 1,
        title: 'Step 1: Characterize the Structure of an Optimal Solution',
        subtitle: 'Optimal Substructure Property (Slides 27–28)',
        content: [
          'The fastest way through station S_{1,j} MUST pass through station j - 1 on either Line 1 (directly, no transfer cost) or Line 2 (with transfer cost t_{2,j-1}).',
          'By optimal substructure, whichever predecessor station was used, the sub-path to that station S_{1,j-1} or S_{2,j-1} must itself be the fastest way to reach station j - 1!',
        ],
      },
      {
        stepNumber: 2,
        title: 'Step 2: Recursively Define the Value of an Optimal Solution',
        subtitle: 'Base Cases & Recurrence Relation (Slides 29–33)',
        content: [
          'Let f_i[j] denote the fastest possible time to get a chassis from the starting point through station S_{i,j}.',
          'Base cases (j = 1): f₁[1] = e₁ + a_{1,1} and f₂[1] = e₂ + a_{2,1}.',
          'For j = 2..n, take the minimum of staying on the same line vs transferring from the other line:',
        ],
        formulaBox:
          'f₁[j] = min( f₁[j-1] + a_{1,j},  f₂[j-1] + t_{2,j-1} + a_{1,j} )\nf₂[j] = min( f₂[j-1] + a_{2,j},  f₁[j-1] + t_{1,j-1} + a_{2,j} )\nf* = min( f₁[n] + x₁,  f₂[n] + x₂ )',
      },
      {
        stepNumber: 3,
        title: 'Step 3: Compute the Value of an Optimal Solution (Bottom-Up)',
        subtitle: 'Eliminating Exponential 2ⁿ Recursion (Slides 34–52)',
        content: [
          'A naive recursive solver recomputes f_i[j] exponentially many times (2ⁿ total paths).',
          'Instead, we allocate tables f[1..2, 1..n] and l[1..2, 2..n] and fill them from left to right (j = 1 to n) in a single Θ(n) loop.',
        ],
      },
      {
        stepNumber: 4,
        title: 'Step 4: Construct the Optimal Solution (PRINT-STATIONS)',
        subtitle: 'Backtracking Table l[i, j] from n downto 2 (Slides 53–58)',
        content: [
          'Start with i = l* at station n.',
          'Loop j from n down to 2, updating i ← l_i[j] to trace which line was used at station j - 1.',
        ],
      },
    ],
    designChallenge: {
      scenarioTitle: 'Exam Design Question: Extending ALS to 3 Assembly Lines',
      problemStatement:
        'Suppose a factory has 3 parallel assembly lines instead of 2. How does the recurrence for f₁[j] change?',
      questions: [
        {
          prompt: 'What is the recurrence for f₁[j] (j ≥ 2) when there are 3 assembly lines?',
          options: [
            'f₁[j] = a_{1,j} + min( f₁[j-1],  f₂[j-1] + t_{2→1, j-1},  f₃[j-1] + t_{3→1, j-1} )',
            'f₁[j] = min( f₁[j-1] + a_{1,j},  f₂[j-1] + f₃[j-1] )',
            'f₁[j] = f₁[j-1] + a_{1,j} + t_{1,j}',
          ],
          correctIndex: 0,
          explanation:
            'Station S_{1,j} can be entered from Line 1 (no transfer), Line 2 (transfer t_{2→1,j-1}), or Line 3 (transfer t_{3→1,j-1}).',
        },
      ],
    },
    analysis: {
      bestTime: 'Θ(n)',
      avgTime: 'Θ(n)',
      worstTime: 'Θ(n) [vs. Θ(2ⁿ) in Brute Force]',
      extraSpace: 'Θ(n) [Tables f₁, f₂, l₁, l₂ of size n]',
      tradeOffSummary:
        'Trades 4 arrays of length n (Θ(n) space) to reduce exponential Θ(2ⁿ) brute-force enumeration down to linear Θ(n) time!',
      basicOperation: 'Addition & comparison inside the single for-loop (j = 2 to n)',
      inputSizeParam: 'n (number of stations per assembly line)',
      summationSteps: [
        {
          label: '1. Convert the main for-loop (j = 2 to n) into a summation',
          math: 'T(n) = ∑_{j=2}^{n} c = c · (n - 2 + 1) = c(n - 1)',
          note: 'Each station j performs 2 comparisons and a constant number of additions.',
        },
        {
          label: '2. Backtracking loop (Print-Stations from n downto 2)',
          math: 'T_{print}(n) = ∑_{j=2}^{n} 1 = n - 1',
          note: 'Traces the optimal station sequence in linear time.',
        },
        {
          label: '3. Total Running Time Class (Lecture 08 Slide 102)',
          math: 'T(n) ∈ Θ(n)',
          note: 'Exponentially faster than the Ω(2ⁿ) brute-force approach.',
        },
      ],
    },
  },

  // ==========================================================================
  // 9. MATRIX CHAIN MULTIPLICATION (MCM)
  // ==========================================================================
  {
    id: 'matrix-chain',
    title: 'Matrix Chain Multiplication (MCM)',
    shortTitle: 'Matrix Chain Multiplication',
    lectureFile: '09-CPCS 324 - DP-MatrixChainMultiplication.pptx',
    category: 'dynamic-programming',
    categoryLabel: 'Module 3: Dynamic Programming',
    indexingRule: '1-based matrices A₁..Aₙ, dimensions p₀..pₙ (Aᵢ is p_{i-1} × pᵢ), tables m[1..n, 1..n], s[1..n-1, 2..n]',
    summary:
      'Finds the optimal parenthesization of a matrix chain <A₁, A₂, ..., Aₙ> that minimizes total scalar multiplications. Fills m[i, j] and split table s[i, j] diagonally by chain length l = 2..n, then calls POP(s, 1, n).',
    pseudocodeTitle: 'Algorithm: Matrix-Chain-Order(p[0..n])',
    pseudocodeLines: [
      'n ← length[p] - 1',
      'for i ← 1 to n do',
      '    m[i, i] ← 0',
      'for l ← 2 to n do                      // l is the chain length',
      '    for i ← 1 to n - l + 1 do',
      '        j ← i + l - 1',
      '        m[i, j] ← ∞',
      '        for k ← i to j - 1 do',
      '            q ← m[i, k] + m[k + 1, j] + p_{i-1} · p_k · p_j',
      '            if q < m[i, j] then',
      '                m[i, j] ← q;  s[i, j] ← k',
      'return m and s',
    ],
    secondaryPseudocodeTitle: 'Step 4 Algorithm: POP(s, i, j) — Print Optimal Parenthesization',
    secondaryPseudocodeLines: [
      'if i = j then',
      '    print "A" + i',
      'else',
      '    print "("',
      '    POP(s, i, s[i, j])',
      '    POP(s, s[i, j] + 1, j)',
      '    print ")"',
    ],
    examples: [
      {
        id: 'mcm-slide-88',
        name: 'Slide 88 Example (6 Matrices: p = [10, 20, 5, 15, 50, 10, 15])',
        badge: 'Slide Example',
        description: 'Complete 6-matrix trace from Lecture 09 Slides 88–155 (Min cost = 8750, ((A1A2)(((A3A4)A5)A6))).',
        inputSummary: 'p = [10, 20, 5, 15, 50, 10, 15] (n = 6)',
        customInputDefaults: { p: '10, 20, 5, 15, 50, 10, 15' },
      },
      {
        id: 'mcm-slide-162',
        name: 'Slide 162 Student Exercise (p = [30, 35, 15, 5, 10, 20, 25])',
        badge: 'Slide Example',
        description: 'Classic CLRS & Slide 162 exercise (Min cost = 15125, ((A1(A2A3))((A4A5)A6))).',
        inputSummary: 'p = [30, 35, 15, 5, 10, 20, 25] (n = 6)',
        customInputDefaults: { p: '30, 35, 15, 5, 10, 20, 25' },
      },
      {
        id: 'mcm-slide-34',
        name: 'Slide 34 3-Matrix Motivation (p = [10, 100, 5, 50])',
        badge: 'Standard Case',
        description: 'Shows 10× difference between ((A1A2)A3) = 7,500 and (A1(A2A3)) = 75,000!',
        inputSummary: 'p = [10, 100, 5, 50] (n = 3)',
        customInputDefaults: { p: '10, 100, 5, 50' },
      },
    ],
    customFields: [
      {
        key: 'p',
        label: 'Dimension Array p[0..n] (for n matrices, enter n + 1 numbers)',
        placeholder: '10, 20, 5, 15, 50, 10, 15',
        helpText: 'Matrix Aᵢ has dimensions p_{i-1} × pᵢ. Example: 4 numbers defines 3 matrices.',
      },
    ],
    designParadigmName: 'Dynamic Programming (4-Step Framework — Interval / Diagonal DP)',
    designSteps: [
      {
        stepNumber: 1,
        title: 'Step 1: Optimal Substructure of Parenthesization',
        subtitle: 'Splitting A_{i..j} at Index k (i ≤ k < j) — Slides 53–58',
        content: [
          'Any optimal parenthesization of the product A_i A_{i+1} ... A_j must split the product into two subchains A_{i..k} and A_{k+1..j} for some integer k (i ≤ k < j).',
          'The subchains A_{i..k} and A_{k+1..j} must themselves be parenthesized optimally!',
        ],
      },
      {
        stepNumber: 2,
        title: 'Step 2: Recursive Definition of Minimum Cost m[i, j]',
        subtitle: 'Slides 59–67',
        content: [
          'Since matrix A_{i..k} has dimension p_{i-1} × p_k and matrix A_{k+1..j} has dimension p_k × p_j, multiplying them together takes p_{i-1} · p_k · p_j scalar multiplications.',
        ],
        formulaBox:
          'm[i, j] = 0                                                     if i = j\nm[i, j] = min_{i ≤ k < j} { m[i, k] + m[k + 1, j] + p_{i-1}·p_k·p_j }   if i < j',
      },
      {
        stepNumber: 3,
        title: 'Step 3: Bottom-Up Diagonal Table Filling (Why Loop Over Length l)',
        subtitle: 'Slides 68–79',
        content: [
          'Notice that m[i, j] depends on m[i, k] (same row, left) and m[k+1, j] (same column, below)—both of which have strictly smaller chain length!',
          'Therefore, we cannot fill row-by-row. We MUST fill diagonally by chain length l = 2, 3, ..., n.',
        ],
      },
      {
        stepNumber: 4,
        title: 'Step 4: Construct Optimal Parenthesization via POP(s, 1, n)',
        subtitle: 'Slides 80–86 & 123–155',
        content: [
          'Table s[i, j] stores the optimal split point k.',
          'Calling POP(s, 1, n) prints "(" then recursively prints POP(s, 1, s[1,n]) and POP(s, s[1,n]+1, n), followed by ")".',
        ],
      },
    ],
    designChallenge: {
      scenarioTitle: 'Lecture 09 Slide 19–20 & 90 Check: Matrix Chain Setup',
      problemStatement:
        'Suppose you are given 4 matrices with dimensions: M₁ = 5×10, M₂ = 35×15, M₃ = 15×5, M₄ = 30×35.',
      questions: [
        {
          prompt: 'In what valid chain order can M₁, M₂, M₃, M₄ be multiplied so that col(A) = row(B) for every adjacent pair?',
          options: [
            'M₄ · M₂ · M₃ · M₁  (30×35 · 35×15 · 15×5 · 5×10) → p = [30, 35, 15, 5, 10]',
            'M₁ · M₂ · M₃ · M₄',
            'M₂ · M₄ · M₁ · M₃',
          ],
          correctIndex: 0,
          explanation:
            'As shown on Lecture 09 Slide 20: M₄ (30×35) × M₂ (35×15) × M₃ (15×5) × M₁ (5×10) matches all inner dimensions!',
        },
        {
          prompt: 'When computing m[2, 5] in Matrix-Chain-Order, which values of k are tested?',
          options: [
            'k = 2, 3, 4 (since i ≤ k < j)',
            'k = 2, 3, 4, 5 (since i ≤ k ≤ j)',
            'k = 1, 2, 3, 4',
          ],
          correctIndex: 0,
          explanation:
            'In MCM, k splits A_i..A_j into A_{i..k} and A_{k+1..j}, so k ranges from i to j - 1 (2, 3, 4). Contrast this with OBST where k ranges from i to j!',
        },
      ],
    },
    analysis: {
      bestTime: 'Θ(n³)',
      avgTime: 'Θ(n³)',
      worstTime: 'Θ(n³) [vs. Ω(2ⁿ) recursive]',
      extraSpace: 'Θ(n²) [Tables m[1..n, 1..n] and s[1..n-1, 2..n]]',
      tradeOffSummary:
        'Stores Θ(n²) subchain costs in m[i,j] and s[i,j] to reduce exponential Ω(2ⁿ) parenthesization trees down to polynomial Θ(n³) time.',
      basicOperation: 'Scalar cost evaluation (q ← m[i,k] + m[k+1,j] + p_{i-1}p_kp_j) in innermost k-loop',
      inputSizeParam: 'n (number of matrices in the chain)',
      summationSteps: [
        {
          label: '1. Convert the 3 nested loops (l, i, k) into summations',
          math: 'T(n) = ∑_{l=2}^{n} ∑_{i=1}^{n-l+1} ∑_{k=i}^{i+l-2} 1',
          note: 'Since j = i + l - 1, the k-loop runs from i to j - 1, which is (l - 1) iterations.',
        },
        {
          label: '2. Solve innermost k-summation and middle i-summation',
          math: '= ∑_{l=2}^{n} ∑_{i=1}^{n-l+1} (l - 1) = ∑_{l=2}^{n} (l - 1)(n - l + 1)',
          note: 'For a fixed chain length l, there are (n - l + 1) cells on that diagonal, each testing (l - 1) splits.',
        },
        {
          label: '3. Evaluate outer summation',
          math: '= (n³ - n) / 6 ∈ Θ(n³)',
          note: 'Cubic running time (Lecture 09 Slide 160).',
        },
      ],
    },
  },

  // ==========================================================================
  // 10. LONGEST COMMON SUBSEQUENCE (LCS)
  // ==========================================================================
  {
    id: 'lcs',
    title: 'Longest Common Subsequence (LCS)',
    shortTitle: 'Longest Common Subsequence',
    lectureFile: '10-CPCS 324 - DP-StudentExercise-LCS.pptx',
    category: 'dynamic-programming',
    categoryLabel: 'Module 3: Dynamic Programming',
    indexingRule: '1-based strings X[1..m], Y[1..n], table c[0..m, 0..n], arrows b[1..m, 1..n]',
    syllabusInfo: {
      status: 'excluded',
      badgeLabel: 'EXCLUDED (ENTIRE FILE 10)',
      excludedSlides: 'Entire File 10 (From Slide 1 to the last slide)',
      requiredScope: 'None — File 10 is completely excluded from the syllabus',
      reason: 'Excluded per Instructor Blacklist: Longest Common Subsequence (File 10) is completely removed.',
    },
    summary:
      '🚫 [EXCLUDED FROM SYLLABUS — Entire File 10 is removed per Instructor Blacklist]. Finds the longest subsequence common to two sequences X[1..m] and Y[1..n] using DP length table c[0..m, 0..n] and directional arrows b[1..m, 1..n].',
    pseudocodeTitle: 'Algorithm: LCS-Length(X[1..m], Y[1..n])',
    pseudocodeLines: [
      'm ← length[X];  n ← length[Y]',
      'for i ← 1 to m do c[i, 0] ← 0',
      'for j ← 0 to n do c[0, j] ← 0',
      'for i ← 1 to m do',
      '    for j ← 1 to n do',
      '        if x_i = y_j then',
      '            c[i, j] ← c[i - 1, j - 1] + 1',
      '            b[i, j] ← "↖"',
      '        else if c[i - 1, j] ≥ c[i, j - 1] then',
      '            c[i, j] ← c[i - 1, j]',
      '            b[i, j] ← "↑"',
      '        else',
      '            c[i, j] ← c[i, j - 1]',
      '            b[i, j] ← "←"',
      'return c and b',
    ],
    secondaryPseudocodeTitle: 'Step 4 Algorithm: Print-LCS(b, X, i, j)',
    secondaryPseudocodeLines: [
      'if i = 0 or j = 0 then return',
      'if b[i, j] = "↖" then',
      '    Print-LCS(b, X, i - 1, j - 1)',
      '    print x_i',
      'else if b[i, j] = "↑" then',
      '    Print-LCS(b, X, i - 1, j)',
      'else Print-LCS(b, X, i, j - 1)',
    ],
    examples: [
      {
        id: 'lcs-slide-8',
        name: 'Slide 8 & 16 Example (X = "ABCBDA", Y = "BDCABA")',
        badge: 'Slide Example',
        description: 'Classic textbook & Lecture 10 Slide 8 example (LCS = "BCBA" of length 4).',
        inputSummary: 'X = "ABCBDA", Y = "BDCABA"',
        customInputDefaults: { X: 'ABCBDA', Y: 'BDCABA' },
      },
      {
        id: 'lcs-dna',
        name: 'DNA Strand Alignment (X = "ACCGGTCG", Y = "GTCGTTCG")',
        badge: 'Standard Case',
        description: 'Biological sequence comparison example.',
        inputSummary: 'X = "ACCGGTCG", Y = "GTCGTTCG"',
        customInputDefaults: { X: 'ACCGGTCG', Y: 'GTCGTTCG' },
      },
      {
        id: 'lcs-disjoint',
        name: 'Disjoint Alphabet Edge Case (X = "ABCD", Y = "EFGH")',
        badge: 'Edge Case',
        description: 'Zero common characters—every cell takes the "↑" tie-breaker with length 0.',
        inputSummary: 'X = "ABCD", Y = "EFGH"',
        customInputDefaults: { X: 'ABCD', Y: 'EFGH' },
      },
    ],
    customFields: [
      {
        key: 'X',
        label: 'Sequence X[1..m] (Row String)',
        placeholder: 'ABCBDA',
        helpText: 'Enter first string X.',
      },
      {
        key: 'Y',
        label: 'Sequence Y[1..n] (Column String)',
        placeholder: 'BDCABA',
        helpText: 'Enter second string Y.',
      },
    ],
    designParadigmName: 'Dynamic Programming (4-Step Prefix Alignment Framework)',
    designSteps: [
      {
        stepNumber: 1,
        title: 'Step 1: Optimal Substructure of Prefixes X_i and Y_j',
        subtitle: 'Lecture 10 Slide 12',
        content: [
          'A sequence X of length m has 2ᵐ subsequences—exhaustive enumeration is exponential.',
          'Let X_i = <x₁..x_i> and Y_j = <y₁..y_j> be prefixes. If x_i = y_j, then the LCS of X_i and Y_j ends with x_i = y_j appended to the LCS of X_{i-1} and Y_{j-1}.',
          'If x_i ≠ y_j, then the LCS of X_i and Y_j is the longer of LCS(X_{i-1}, Y_j) and LCS(X_i, Y_{j-1}).',
        ],
      },
      {
        stepNumber: 2,
        title: 'Step 2: Recursive Definition of c[i, j]',
        subtitle: 'Lecture 10 Slide 13',
        content: [
          'Let c[i, j] be the length of an LCS of prefixes X_i and Y_j:',
        ],
        formulaBox:
          'c[i, j] = 0                                  if i = 0 or j = 0\nc[i, j] = c[i - 1, j - 1] + 1                if i, j > 0 and x_i = y_j  (Arrow "↖")\nc[i, j] = max(c[i - 1, j], c[i, j - 1])      if i, j > 0 and x_i ≠ y_j  (Arrow "↑" if top ≥ left, else "←")',
      },
      {
        stepNumber: 3,
        title: 'Step 3 & 4: Bottom-Up Table & PRINT-LCS Backtracking',
        subtitle: 'Lecture 10 Slides 14–18',
        content: [
          'Fill c[1..m, 1..n] row-by-row from left to right.',
          'Notice the tie-breaking rule when x_i ≠ y_j: "else if c[i-1, j] ≥ c[i, j-1]" always points "↑" (Up) on a tie!',
          'PRINT-LCS starts at b[m, n] and prints x_i ONLY when it steps across a diagonal "↖" arrow.',
        ],
      },
    ],
    designChallenge: {
      scenarioTitle: 'Exam Check: LCS Tie-Breaking & Arrow Backtracking',
      problemStatement:
        'When filling the LCS table at cell (i, j) where x_i ≠ y_j, suppose the top cell c[i-1, j] = 2 and the left cell c[i, j-1] = 2.',
      questions: [
        {
          prompt: 'Which arrow is stored in b[i, j] according to the CPCS-324 slide pseudocode when c[i-1, j] == c[i, j-1]?',
          options: [
            'Up arrow "↑" (because the condition is if c[i - 1, j] ≥ c[i, j - 1])',
            'Left arrow "←"',
            'Diagonal arrow "↖"',
          ],
          correctIndex: 0,
          explanation:
            'Because line 9 checks `else if c[i - 1, j] ≥ c[i, j - 1]`, ties between top and left always choose the top cell and set b[i, j] = "↑".',
        },
      ],
    },
    analysis: {
      bestTime: 'Θ(mn)',
      avgTime: 'Θ(mn)',
      worstTime: 'Θ(mn) [Table construction] + O(m + n) [PRINT-LCS]',
      extraSpace: 'Θ(mn) [Tables c[0..m, 0..n] and b[1..m, 1..n]]',
      tradeOffSummary:
        'Uses an (m+1)×(n+1) table to avoid checking all 2ᵐ subsequences, solving LCS in quadratic Θ(mn) time.',
      basicOperation: 'Character comparison (x_i = y_j) inside nested i and j loops',
      inputSizeParam: 'm (length of sequence X), n (length of sequence Y)',
      summationSteps: [
        {
          label: '1. Convert nested for-loops (i = 1..m, j = 1..n) into summations',
          math: 'T(m, n) = ∑_{i=1}^{m} ∑_{j=1}^{n} 1',
          note: 'Every cell (i, j) performs O(1) comparisons and assignments.',
        },
        {
          label: '2. Evaluate inner and outer summations',
          math: '= ∑_{i=1}^{m} n = m · n ∈ Θ(mn)',
          note: 'PRINT-LCS takes O(m + n) because each recursive call decrements i, j, or both.',
        },
      ],
    },
  },

  // ==========================================================================
  // 11. COIN ROW PROBLEM
  // ==========================================================================
  {
    id: 'coin-row',
    title: 'Coin Row Problem',
    shortTitle: 'Coin Row Problem',
    lectureFile: '11-CPCS 324 - DP-CR-CM-CC.pptx (Slides 7–45)',
    category: 'dynamic-programming',
    categoryLabel: 'Module 3: Dynamic Programming',
    indexingRule: '1-based coins C[1..n], DP array F[0..n]',
    summary:
      'Given a row of n coins with values c₁, c₂, ..., cₙ, picks a subset of non-adjacent coins with maximum total value using F[i] = max(cᵢ + F[i - 2], F[i - 1]).',
    pseudocodeTitle: 'Algorithm: CoinRow(C[1..n])',
    pseudocodeLines: [
      '// Input: Array C[1..n] of coin values',
      'F[0] ← 0;  F[1] ← C[1]',
      'for i ← 2 to n do',
      '    F[i] ← max(C[i] + F[i - 2], F[i - 1])',
      'return F[n]',
    ],
    examples: [
      {
        id: 'cr-slide-30',
        name: 'Slide 30 Example (Coins: 5, 1, 2, 10, 6, 2 ➔ Max = 17)',
        badge: 'Slide Example',
        description: 'Exact 6-coin trace from Lecture 11 Slides 30–42 (picks c₁=5, c₄=10, c₆=2 → 17).',
        inputSummary: 'C = [5, 1, 2, 10, 6, 2]',
        customInputDefaults: { coins: '5, 1, 2, 10, 6, 2' },
      },
      {
        id: 'cr-standard',
        name: '7-Coin Exam Practice (7, 12, 9, 4, 15, 8, 5)',
        badge: 'Standard Case',
        description: 'Tests alternating vs skipping two coins in a row.',
        inputSummary: 'C = [7, 12, 9, 4, 15, 8, 5]',
        customInputDefaults: { coins: '7, 12, 9, 4, 15, 8, 5' },
      },
      {
        id: 'cr-trap',
        name: 'Greedy Trap Case (10, 25, 20, 5)',
        badge: 'Edge Case',
        description: 'Shows why picking the single largest coin first (25) can be suboptimal vs (10 + 20 = 30)!',
        inputSummary: 'C = [10, 25, 20, 5]',
        customInputDefaults: { coins: '10, 25, 20, 5' },
      },
    ],
    customFields: [
      {
        key: 'coins',
        label: 'Coin Row Values C[1..n] (comma-separated positive integers)',
        placeholder: '5, 1, 2, 10, 6, 2',
        helpText: 'Enter coin values c₁, c₂, ..., cₙ.',
      },
    ],
    designParadigmName: 'Dynamic Programming (Binary Choice: Include cᵢ vs. Exclude cᵢ)',
    designSteps: [
      {
        stepNumber: 1,
        title: 'Partition Feasible Solutions into Two Groups',
        subtitle: 'Lecture 11 Slides 9–18',
        content: [
          'Let F(n) be the maximum amount that can be picked from the first n coins.',
          'Group 1 (Include the n-th coin cₙ): Since adjacent coins cannot be picked, we cannot pick c_{n-1}, so the best we can do is cₙ + F(n - 2).',
          'Group 2 (Exclude the n-th coin cₙ): The best we can do from the remaining n - 1 coins is F(n - 1).',
        ],
        formulaBox:
          'F(0) = 0,   F(1) = c₁\nF(i) = max( cᵢ + F(i - 2),  F(i - 1) )   for i = 2 .. n',
      },
    ],
    designChallenge: {
      scenarioTitle: 'Exam Check: Backtracking Picked Coins from F[0..n]',
      problemStatement:
        'In the Slide 30 example C = [5, 1, 2, 10, 6, 2], the computed table is F[0..6] = [0, 5, 5, 7, 15, 15, 17].',
      questions: [
        {
          prompt: 'Which coins are picked to achieve F[6] = 17?',
          options: [
            'c₁ (5), c₄ (10), and c₆ (2) → 5 + 10 + 2 = 17',
            'c₂ (1), c₄ (10), and c₆ (2) → 13',
            'c₁ (5), c₃ (2), and c₅ (6) → 13',
          ],
          correctIndex: 0,
          explanation:
            'At i=6: c₆ + F[4] = 2 + 15 = 17 > F[5] (15) → pick c₆, jump to i=4. At i=4: c₄ + F[2] = 10 + 5 = 15 > F[3] (7) → pick c₄, jump to i=2. At i=2: F[1] (5) = F[2], so c₁ is picked.',
        },
      ],
    },
    analysis: {
      bestTime: 'Θ(n)',
      avgTime: 'Θ(n)',
      worstTime: 'Θ(n)',
      extraSpace: 'Θ(n) [Array F[0..n]]',
      tradeOffSummary: 'Stores 1D array F[0..n] to compute the optimal non-adjacent subset in a single linear pass.',
      basicOperation: 'Addition and max comparison (C[i] + F[i - 2] vs F[i - 1])',
      inputSizeParam: 'n (number of coins in the row)',
      summationSteps: [
        {
          label: '1. Convert the for-loop (i = 2 to n) into a summation (Slide 44)',
          math: 'T(n) = ∑_{i=2}^{n} 1 = n - 2 + 1 = n - 1 ∈ Θ(n)',
          note: 'Each step performs 1 addition and 1 comparison.',
        },
      ],
    },
  },

  // ==========================================================================
  // 12. CHANGE MAKING PROBLEM
  // ==========================================================================
  {
    id: 'change-making',
    title: 'Change-Making Problem (DP)',
    shortTitle: 'Change-Making Problem',
    lectureFile: '11-CPCS 324 - DP-CR-CM-CC.pptx (Slides 49–114)',
    category: 'dynamic-programming',
    categoryLabel: 'Module 3: Dynamic Programming',
    indexingRule: '0-based amount F[0..n], 1-based denominations D[1..m] (d₁ < d₂ < ... < dₘ)',
    summary:
      'Finds the minimum number of coins of denominations d₁ < d₂ < ... < dₘ needed to make change for amount n using F[i] = min_{j: i ≥ d_j} { F[i - d_j] } + 1.',
    pseudocodeTitle: 'Algorithm: ChangeMaking(D[1..m], n)',
    pseudocodeLines: [
      '// Input: Amount n and denominations D[1..m] in increasing order',
      'F[0] ← 0',
      'for i ← 1 to n do',
      '    temp ← ∞;  j ← 1',
      '    while j ≤ m and i ≥ D[j] do',
      '        temp ← min(F[i - D[j]], temp)',
      '        j ← j + 1',
      '    F[i] ← temp + 1',
      'return F[n]',
    ],
    examples: [
      {
        id: 'cm-slide-73',
        name: 'Slide 73 Example (Amount n = 6, Denominations D = [1, 3, 4])',
        badge: 'Slide Example',
        description: 'Exact trace from Lecture 11 Slides 73–111 (F[6] = 2 using two 3-value coins, whereas greedy would use 4+1+1 = 3 coins!).',
        inputSummary: 'n = 6, D = [1, 3, 4]',
        customInputDefaults: { amount: '6', denoms: '1, 3, 4' },
      },
      {
        id: 'cm-standard-9',
        name: 'Standard Exam Case (Amount n = 9, D = [1, 4, 6])',
        badge: 'Standard Case',
        description: 'Shows F[8] = 2 (4+4) and F[9] = 3 (6+1+1+1 vs 4+4+1).',
        inputSummary: 'n = 9, D = [1, 4, 6]',
        customInputDefaults: { amount: '9', denoms: '1, 4, 6' },
      },
      {
        id: 'cm-edge-11',
        name: 'Tricky Denominations (Amount n = 10, D = [1, 5, 7])',
        badge: 'Edge Case',
        description: 'For n=10, DP finds 5+5 (2 coins) instead of 7+1+1+1 (4 coins).',
        inputSummary: 'n = 10, D = [1, 5, 7]',
        customInputDefaults: { amount: '10', denoms: '1, 5, 7' },
      },
    ],
    customFields: [
      {
        key: 'amount',
        label: 'Target Amount n',
        placeholder: '6',
        helpText: 'Enter target integer amount n (1..30).',
      },
      {
        key: 'denoms',
        label: 'Coin Denominations D[1..m] (comma-separated)',
        placeholder: '1, 3, 4',
        helpText: 'Enter coin denominations (e.g. 1, 3, 4).',
      },
    ],
    designParadigmName: 'Dynamic Programming (Multi-Branch Minimization Over Denominations)',
    designSteps: [
      {
        stepNumber: 1,
        title: 'Recurrence Formulation Over All Valid Denominations d_j ≤ i',
        subtitle: 'Lecture 11 Slides 51–62',
        content: [
          'To make change for amount i, the first coin we use can be any denomination d_j such that d_j ≤ i.',
          'Once we pick coin d_j, we need the optimal (minimum) number of coins for the remaining amount i - d_j, which is F[i - d_j].',
        ],
        formulaBox:
          'F[0] = 0\nF[i] = min_{j: i ≥ d_j} { F[i - d_j] } + 1   for i = 1 .. n',
      },
    ],
    designChallenge: {
      scenarioTitle: 'Slide 73 Check: Why DP Beats Naive Largest-Coin Selection for n = 6, D = [1, 3, 4]',
      problemStatement:
        'Consider making change for n = 6 using denominations D = [1, 3, 4].',
      questions: [
        {
          prompt: 'How does ChangeMaking compute F[6] when F[0..5] = [0, 1, 2, 1, 1, 2]?',
          options: [
            'F[6] = min(F[6-1], F[6-3], F[6-4]) + 1 = min(F[5]=2, F[3]=1, F[2]=2) + 1 = 1 + 1 = 2',
            'F[6] = F[6-4] + 1 = F[2] + 1 = 3',
            'F[6] = F[5] + 1 = 3',
          ],
          correctIndex: 0,
          explanation:
            'Testing all three coins d₁=1, d₂=3, d₃=4 gives temp = min(F[5], F[3], F[2]) = min(2, 1, 2) = 1 (using coin d₂=3), so F[6] = 1 + 1 = 2 coins (3 + 3).',
        },
      ],
    },
    analysis: {
      bestTime: 'Θ(n)',
      avgTime: 'Θ(nm)',
      worstTime: 'Θ(nm)',
      extraSpace: 'Θ(n) [Array F[0..n]]',
      tradeOffSummary: 'Stores F[0..n] of size n + 1 to find the exact minimum coin count in O(nm) time.',
      basicOperation: 'Comparison min(F[i - D[j]], temp) inside inner while loop',
      inputSizeParam: 'n (target amount), m (number of coin denominations)',
      summationSteps: [
        {
          label: '1. Convert outer for-loop (1..n) and inner while-loop (1..m) into summations',
          math: 'T(n, m) = ∑_{i=1}^{n} ∑_{j=1}^{m} 1',
          note: 'In the worst case (when i ≥ d_m), the inner loop runs m times for each i.',
        },
        {
          label: '2. Solve nested summations (Lecture 11 Slide 114)',
          math: '= ∑_{i=1}^{n} m = n · m ∈ Θ(nm)',
          note: 'Space complexity is Θ(n) for array F[0..n].',
        },
      ],
    },
  },

  // ==========================================================================
  // 13. ROBOT COIN COLLECTING PROBLEM
  // ==========================================================================
  {
    id: 'coin-collecting',
    title: 'Robot Coin Collecting Problem',
    shortTitle: 'Robot Coin Collecting',
    lectureFile: '11-CPCS 324 - DP-CR-CM-CC.pptx (Slides 117–End)',
    category: 'dynamic-programming',
    categoryLabel: 'Module 3: Dynamic Programming',
    indexingRule: '1-based n × m board: C[1..n, 1..m] and DP table F[1..n, 1..m]',
    syllabusInfo: {
      status: 'excluded',
      badgeLabel: 'EXCLUDED (SLIDES 117–END)',
      excludedSlides: 'Slides 117 to 141 / End of File 11 (Case Studies: Coin Collecting Problem)',
      requiredScope: 'Slides 1 to 116 of File 11 ONLY (Coin-Row Problem & Change-Making Problem)',
      reason: 'Excluded per Instructor Blacklist: Coin Collecting (last section of File 11) is removed.',
      affectedExams: [
        'Final Exam Fall 2021 Q1 (Robot Coin-Collection — EXCLUDED)',
        'Final Exam Spring 2021 Q1 (Robot Coin-Collection — EXCLUDED)',
      ],
    },
    summary:
      '🚫 [EXCLUDED FROM SYLLABUS — Last section of File 11 (Slides 117–End); only Coin-Row and Change-Making (Slides 1–116) are required]. A robot starts at upper-left cell (1, 1) of an n × m board and moves only Right or Down.',
    pseudocodeTitle: 'Algorithm: RobotCoinCollection(C[1..n, 1..m])',
    pseudocodeLines: [
      'F[1, 1] ← C[1, 1]',
      'for j ← 2 to m do',
      '    F[1, j] ← F[1, j - 1] + C[1, j]',
      'for i ← 2 to n do',
      '    F[i, 1] ← F[i - 1, 1] + C[i, 1]',
      '    for j ← 2 to m do',
      '        F[i, j] ← max(F[i - 1, j], F[i, j - 1]) + C[i, j]',
      'return F[n, m]',
    ],
    examples: [
      {
        id: 'cc-slide-146',
        name: 'Slide 146 5×6 Board Example (Max Coins = 5)',
        badge: 'Slide Example',
        description: 'Exact 5×6 grid trace from Lecture 11 Slides 146–180.',
        inputSummary: '5×6 Board from Lecture 11 Slide 146',
        customInputDefaults: {
          grid: '0 0 0 0 1 0; 0 1 0 1 0 0; 0 0 0 1 0 1; 0 0 1 0 0 1; 1 0 0 0 1 0',
        },
      },
      {
        id: 'cc-standard-4x4',
        name: '4×4 Practice Grid',
        badge: 'Standard Case',
        description: 'Compact 4×4 board for quick practice.',
        inputSummary: '4×4 Board',
        customInputDefaults: {
          grid: '0 1 0 1; 1 0 1 0; 0 1 1 0; 1 0 0 1',
        },
      },
      {
        id: 'cc-perimeter',
        name: 'Border-Only Coins Edge Case (3×4)',
        badge: 'Edge Case',
        description: 'Coins placed along first column and bottom row.',
        inputSummary: '3×4 Board',
        customInputDefaults: {
          grid: '1 0 0 0; 1 0 0 0; 1 1 1 1',
        },
      },
    ],
    customFields: [
      {
        key: 'grid',
        label: 'Board Matrix C[1..n, 1..m] (rows separated by semicolons ";", values 0 or 1)',
        placeholder: '0 0 0 0 1 0; 0 1 0 1 0 0; 0 0 0 1 0 1; 0 0 1 0 0 1; 1 0 0 0 1 0',
        helpText: 'Use 1 for a cell with a coin and 0 for an empty cell. Separate rows with ";".',
      },
    ],
    designParadigmName: 'Dynamic Programming (2D Grid Path Optimization)',
    designSteps: [
      {
        stepNumber: 1,
        title: 'Reachability & Optimal Substructure on a 2D Grid',
        subtitle: 'Lecture 11 Slides 120–135',
        content: [
          'Since the robot can only move ONE cell Right or ONE cell Down, any cell (i, j) can only be entered from (i - 1, j) (above) or (i, j - 1) (left).',
          'First row F[1, j] has no cells above it, and first column F[i, 1] has no cells to its left.',
        ],
        formulaBox:
          'F(0, j) = 0,  F(i, 0) = 0\nF(i, j) = max( F(i - 1, j),  F(i, j - 1) ) + C[i, j]   for 1 ≤ i ≤ n, 1 ≤ j ≤ m',
      },
    ],
    designChallenge: {
      scenarioTitle: 'Exam Design Variant: Cells with Obstacles (Blocked Cells)',
      problemStatement:
        'Suppose some cells on the n × m board contain obstacles (inaccessible cells) that the robot cannot step into. How do we modify the DP recurrence?',
      questions: [
        {
          prompt: 'How should an obstacle at cell (i, j) be represented in F[i, j]?',
          options: [
            'Set F[i, j] = -∞ (or 0 with a blocked flag) so paths passing through (i, j) are never chosen by max()',
            'Set F[i, j] = F[i-1, j] + F[i, j-1]',
            'Swap rows and columns',
          ],
          correctIndex: 0,
          explanation:
            'Setting F[i, j] = -∞ (unreachable) ensures that neither (i+1, j) nor (i, j+1) will select a path coming from the blocked cell.',
        },
      ],
    },
    analysis: {
      bestTime: 'Θ(nm)',
      avgTime: 'Θ(nm)',
      worstTime: 'Θ(nm) [Table] + Θ(n + m) [Optimal Path]',
      extraSpace: 'Θ(nm) [Table F[1..n, 1..m]]',
      tradeOffSummary: 'Computes maximum coins in Θ(nm) time and traces the robot path in Θ(n + m) steps (Slide 183).',
      basicOperation: 'Addition and max(F[i-1, j], F[i, j-1])',
      inputSizeParam: 'n (rows), m (columns)',
      summationSteps: [
        {
          label: '1. Convert nested grid loops into summations (Slide 182)',
          math: 'T(n, m) = ∑_{i=2}^{n} ∑_{j=2}^{m} 1 = (n - 1)(m - 1) ∈ Θ(nm)',
          note: 'Plus (m - 1) + (n - 1) for initializing row 1 and col 1.',
        },
        {
          label: '2. Backtracking Optimal Path Complexity (Slide 183)',
          math: 'T_{path}(n, m) = Θ(n + m)',
          note: 'Each step moves either 1 row up or 1 column left from (n, m) to (1, 1).',
        },
      ],
    },
  },

  // ==========================================================================
  // 14. 0/1 KNAPSACK PROBLEM & MEMORY FUNCTION
  // ==========================================================================
  {
    id: 'knapsack-01',
    title: '0/1 Knapsack Problem (Bottom-Up DP)',
    shortTitle: '0/1 Knapsack Problem',
    lectureFile: '12-CPCS 324 - DP-KnapsackProblem.pptx & Fall 2025 MidTerm Q4',
    category: 'dynamic-programming',
    categoryLabel: 'Module 3: Dynamic Programming',
    indexingRule: '1-based items i = 1..n, 0-based capacity j = 0..W, Table F[0..n, 0..W]',
    syllabusInfo: {
      status: 'partial-exclusion',
      badgeLabel: 'MEMORY FUNC EXCLUDED (123–177)',
      excludedSlides: 'Slides 123 to 177 (Memory Function Algorithm / Top-Down MFKnapsack)',
      requiredScope: 'Slides 1 to 122 ONLY (Standard Bottom-Up Dynamic Programming for 0/1 Knapsack)',
      reason: 'Crossed out in red in the official syllabus: Memory Functions in File 12 are excluded.',
    },
    summary:
      'Solves the 0/1 Knapsack Problem using standard Bottom-Up DP (Slides 1–122, required in syllabus & Fall 2025 Midterm Q4). (Note: Slides 123–177 on Top-Down Memory Function MFKnapsack are EXCLUDED per the official syllabus).',
    pseudocodeTitle: 'Algorithm: BottomUpKnapsack(w[1..n], v[1..n], W)',
    pseudocodeLines: [
      'for i ← 0 to n do F[i, 0] ← 0',
      'for j ← 0 to W do F[0, j] ← 0',
      'for i ← 1 to n do',
      '    for j ← 1 to W do',
      '        if j - w[i] < 0 then           // or if w[i] > j',
      '            F[i, j] ← F[i - 1, j]',
      '        else',
      '            F[i, j] ← max(F[i - 1, j], v[i] + F[i - 1, j - w[i]])',
      'return F[n, W]',
    ],
    secondaryPseudocodeTitle: 'Algorithm: MFKnapsack(i, j) — Top-Down Memory Function',
    secondaryPseudocodeLines: [
      '// Table F[1..n, 1..W] initialized to -1 (Row 0 & Col 0 initialized to 0)',
      'if F[i, j] < 0 then',
      '    if j < Weights[i] then',
      '        value ← MFKnapsack(i - 1, j)',
      '    else',
      '        value ← max(MFKnapsack(i - 1, j), Values[i] + MFKnapsack(i - 1, j - Weights[i]))',
      '    F[i, j] ← value',
      'return F[i, j]',
    ],
    examples: [
      {
        id: 'ks-exam-2025',
        name: 'Fall 2025 MidTerm Q4 (5 Items, W = 6, Max Value = $65)',
        badge: 'Past Exam',
        description: 'Exact 12-point exam problem from Fall 2025 Midterm Q4!',
        inputSummary: 'w = [3, 2, 1, 4, 5], v = [25, 20, 15, 40, 50], W = 6',
        customInputDefaults: {
          weights: '3, 2, 1, 4, 5',
          values: '25, 20, 15, 40, 50',
          capacity: '6',
        },
      },
      {
        id: 'ks-slide-22',
        name: 'Slide 22 & Slide 124 MFK Example (4 Items, W = 5, Max = $37)',
        badge: 'Slide Example',
        description: 'Exact trace from Lecture 12 Slides 22–111 (Bottom-Up) and Slides 124–196 (Memory Function MFK).',
        inputSummary: 'w = [2, 1, 3, 2], v = [12, 10, 20, 15], W = 5',
        customInputDefaults: {
          weights: '2, 1, 3, 2',
          values: '12, 10, 20, 15',
          capacity: '5',
        },
      },
      {
        id: 'ks-heavy',
        name: 'Heavy Items Edge Case (4 Items, W = 4)',
        badge: 'Edge Case',
        description: 'Demonstrates how Memory Function skips almost the entire table when weights are large.',
        inputSummary: 'w = [3, 4, 2, 3], v = [30, 50, 20, 35], W = 4',
        customInputDefaults: {
          weights: '3, 4, 2, 3',
          values: '30, 50, 20, 35',
          capacity: '4',
        },
      },
    ],
    customFields: [
      {
        key: 'weights',
        label: 'Item Weights w[1..n]',
        placeholder: '2, 1, 3, 2',
        helpText: 'Comma-separated positive integer weights.',
      },
      {
        key: 'values',
        label: 'Item Values v[1..n]',
        placeholder: '12, 10, 20, 15',
        helpText: 'Comma-separated item values.',
      },
      {
        key: 'capacity',
        label: 'Knapsack Capacity W',
        placeholder: '5',
        helpText: 'Maximum weight capacity W (1..20).',
      },
    ],
    designParadigmName: 'Dynamic Programming (Bottom-Up Table vs. Top-Down Memory Function)',
    designSteps: [
      {
        stepNumber: 1,
        title: 'Step 1 & 2: Characterize Subsets & Formulate Recurrence F[i, j]',
        subtitle: 'Lecture 12 Slides 16–18',
        content: [
          'Consider a subproblem with the first i items (1 ≤ i ≤ n) and knapsack capacity j (0 ≤ j ≤ W).',
          'All feasible subsets of the first i items fall into two categories:',
          '1. Subsets that DO NOT include item i → optimal value is F[i - 1, j].',
          '2. Subsets that DO include item i (only possible if j - wᵢ ≥ 0) → optimal value is vᵢ + F[i - 1, j - wᵢ].',
        ],
        formulaBox:
          'F[i, j] = F[i - 1, j]                                if wᵢ > j   (or j - wᵢ < 0)\nF[i, j] = max( F[i - 1, j],  vᵢ + F[i - 1, j - wᵢ] )  if wᵢ ≤ j   (or j - wᵢ ≥ 0)',
      },
      {
        stepNumber: 2,
        title: 'Step 3: Bottom-Up vs. Top-Down Memory Function (MFKnapsack)',
        subtitle: 'Lecture 12 Slides 117–196',
        content: [
          'Top-Down Pure Recursion: Solves overlapping subproblems repeatedly → exponential Θ(2ⁿ) time.',
          'Bottom-Up DP: Solves every subproblem once, but computes ALL n × W cells even though many are never needed for F[n, W].',
          'Memory Function (MFKnapsack): Combines the best of both worlds! Initializes F[1..n, 1..W] = -1 and uses top-down recursion that checks `if F[i, j] < 0`. It solves ONLY the necessary subproblems and solves each at most once!',
        ],
      },
    ],
    designChallenge: {
      scenarioTitle: 'Fall 2025 MidTerm Q4 & Slide 124 Check: Knapsack & Memory Functions',
      problemStatement:
        'In Lecture 12 Slide 124 (w = [2, 1, 3, 2], v = [12, 10, 20, 15], W = 5), we call MFKnapsack(4, 5).',
      questions: [
        {
          prompt: 'Which two recursive calls are immediately made by MFKnapsack(4, 5) given w₄ = 2 and v₄ = 15?',
          options: [
            'max( MFKnapsack(3, 5),  15 + MFKnapsack(3, 3) )',
            'max( MFKnapsack(3, 5),  15 + MFKnapsack(4, 3) )',
            'max( MFKnapsack(3, 4),  15 + MFKnapsack(3, 2) )',
          ],
          correctIndex: 0,
          explanation:
            'Since j = 5 ≥ w₄ = 2, MFKnapsack(4, 5) evaluates max(MFK(4-1, 5), v₄ + MFK(4-1, 5-2)) = max(MFK(3, 5), 15 + MFK(3, 3)) (Slide 126).',
        },
        {
          prompt: 'Why is F[1..n, 1..W] initialized to -1 in the Memory Function technique?',
          options: [
            'To indicate that a subproblem has not yet been computed (since valid knapsack values are ≥ 0)',
            'Because -1 is the base case for capacity j = 0',
            'To subtract 1 from the weight of each item',
          ],
          correctIndex: 0,
          explanation:
            'Row 0 and Column 0 are initialized to 0 (base cases), while interior cells are set to -1 so `if F[i, j] < 0` detects unvisited states.',
        },
      ],
    },
    analysis: {
      bestTime: 'Θ(nW) [Bottom-Up]  |  O(nW) [Memory Function]',
      avgTime: 'Θ(nW)',
      worstTime: 'Θ(nW) [vs. Θ(2ⁿ) Exhaustive Search]',
      extraSpace: 'Θ(nW) [Table F[0..n, 0..W]]',
      tradeOffSummary:
        'Trades a 2D table of size (n+1)(W+1) to reduce Θ(2ⁿ) exhaustive subset enumeration to Θ(nW). Memory Function further saves time by leaving unneeded cells as -1.',
      basicOperation: 'Addition and max comparison inside the nested loops (i = 1..n, j = 1..W)',
      inputSizeParam: 'n (number of items), W (knapsack capacity)',
      summationSteps: [
        {
          label: '1. Convert nested for-loops into summations (Lecture 12 Slide 114)',
          math: 'T(n, W) = ∑_{i=1}^{n} ∑_{j=1}^{W} 1',
          note: 'Outer loop runs for n items; inner loop runs for W capacity units.',
        },
        {
          label: '2. Solve inner and outer summations (Slide 115)',
          math: '= ∑_{i=1}^{n} W = n · W ∈ O(nW)',
          note: 'Pseudo-polynomial running time O(nW).',
        },
      ],
      comparisonTable: {
        headers: ['Approach (Slide 120)', 'Subproblem Evaluation', 'Time Efficiency'],
        rows: [
          ['Exhaustive Search / Naive Top-Down', 'Solved more than once (overlapping)', 'Exponential Θ(2ⁿ)'],
          ['Bottom-Up Dynamic Programming', 'All n×W subproblems solved once', 'Θ(nW)'],
          ['Memory Function (MFKnapsack)', 'Only necessary subproblems solved once', '≤ O(nW) (fewer cell evaluations)'],
        ],
      },
    },
  },

  // ==========================================================================
  // 15. OPTIMAL BINARY SEARCH TREE (OBST)
  // ==========================================================================
  {
    id: 'obst',
    title: 'Optimal Binary Search Tree (OBST)',
    shortTitle: 'Optimal BST (OBST)',
    lectureFile: '13-CPCS 324 - DP-OBST.pptx & Fall 2020 Q3 / Fall 2025 Q6',
    category: 'dynamic-programming',
    categoryLabel: 'Module 3: Dynamic Programming',
    indexingRule: 'Rows i = 1..n+1, Columns j = 0..n (C[i, i-1] = 0, C[i, i] = pᵢ, R[i, i] = i)',
    summary:
      'Constructs a Binary Search Tree for keys a₁ < a₂ < ... < aₙ with known search probabilities p₁..pₙ that minimizes the expected number of comparisons in a search. Fills cost table C[1..n+1, 0..n] and root table R[1..n+1, 0..n] diagonally, then builds the Optimal BST step-by-step from R.',
    pseudocodeTitle: 'Algorithm: OptimalBST(P[1..n])',
    pseudocodeLines: [
      'for i ← 1 to n do',
      '    C[i, i - 1] ← 0',
      '    C[i, i] ← P[i]',
      '    R[i, i] ← i',
      'C[n + 1, n] ← 0',
      'for d ← 1 to n - 1 do                  // diagonal count d = j - i',
      '    for i ← 1 to n - d do',
      '        j ← i + d',
      '        minval ← ∞',
      '        for k ← i to j do',
      '            if C[i, k - 1] + C[k + 1, j] < minval then',
      '                minval ← C[i, k - 1] + C[k + 1, j];  kmin ← k',
      '        R[i, j] ← kmin',
      '        sum ← P[i];  for s ← i + 1 to j do sum ← sum + P[s]',
      '        C[i, j] ← minval + sum',
      'return C[1, n] and R',
    ],
    examples: [
      {
        id: 'obst-exam-2020-2025',
        name: 'Fall 2020 Q3 & Fall 2025 Q6 MidTerm Exam (p = [0.2, 0.1, 0.4, 0.3])',
        badge: 'Past Exam',
        description: 'Exact exam problem from BOTH Fall 2020 Q3 and Fall 2025 Q6! Computes C[2,3]=0.6, C[2,4]=1.2, C[1,4]=1.7.',
        inputSummary: 'Keys = [A, B, C, D], Prob = [0.2, 0.1, 0.4, 0.3]',
        customInputDefaults: {
          keys: 'A, B, C, D',
          probs: '0.2, 0.1, 0.4, 0.3',
        },
      },
      {
        id: 'obst-slide-30',
        name: 'Slide 30 Lecture Example (p = [0.1, 0.2, 0.4, 0.3])',
        badge: 'Slide Example',
        description: 'Exact trace from Lecture 13 Slides 30–32 (C[1,4] = 1.7, Root = C).',
        inputSummary: 'Keys = [A, B, C, D], Prob = [0.1, 0.2, 0.4, 0.3]',
        customInputDefaults: {
          keys: 'A, B, C, D',
          probs: '0.1, 0.2, 0.4, 0.3',
        },
      },
      {
        id: 'obst-7-keys',
        name: '7-Key Deep Tree Trace (Keys A..G, Multi-Level Root Table Practice)',
        badge: 'Standard Case',
        description: '7-key example (A, B, C, D, E, F, G) ideal for practicing multi-step OBST tree extraction from Root Table R[1..7, 1..7]!',
        inputSummary: 'Keys = [A, B, C, D, E, F, G], Prob = [0.22, 0.05, 0.15, 0.05, 0.35, 0.03, 0.15]',
        customInputDefaults: {
          keys: 'A, B, C, D, E, F, G',
          probs: '0.22, 0.05, 0.15, 0.05, 0.35, 0.03, 0.15',
        },
      },
    ],
    customFields: [
      {
        key: 'keys',
        label: 'Sorted Keys (comma-separated)',
        placeholder: 'A, B, C, D',
        helpText: 'Enter key labels in sorted order (e.g. A, B, C, D).',
      },
      {
        key: 'probs',
        label: 'Search Probabilities p₁ .. pₙ',
        placeholder: '0.2, 0.1, 0.4, 0.3',
        helpText: 'Enter probabilities corresponding to each key.',
      },
    ],
    designParadigmName: 'Dynamic Programming (Expected Search Cost Optimization on Subtrees)',
    designSteps: [
      {
        stepNumber: 1,
        title: 'Step 1 & 2: Subtree Structure & Recurrence Relation C[i, j]',
        subtitle: 'Lecture 13 Slides 16–26 & Fall 2020/2025 Exam Formula',
        content: [
          'Among keys a_i .. a_j, suppose we pick key a_k (i ≤ k ≤ j) as the root of the BST.',
          'Then keys a_i .. a_{k-1} form the left subtree (cost C[i, k-1]) and keys a_{k+1} .. a_j form the right subtree (cost C[k+1, j]).',
          'Because pushing the subtrees down 1 level increases the depth (number of comparisons) of every key in a_i..a_j by 1, we add ∑_{s=i}^{j} p_s!',
        ],
        formulaBox:
          'C(i, i - 1) = 0   for 1 ≤ i ≤ n + 1\nC(i, i) = pᵢ      for 1 ≤ i ≤ n\nC(i, j) = min_{i ≤ k ≤ j} { C(i, k - 1) + C(k + 1, j) } + ∑_{s=i}^{j} p_s   for 1 ≤ i < j ≤ n',
      },
      {
        stepNumber: 2,
        title: 'Why Table C Has Rows 1..n+1 and Columns 0..n',
        subtitle: 'Avoiding Out-of-Bounds When k = i or k = j',
        content: [
          'When testing k = i (leftmost key as root), the formula accesses C[i, i - 1] (empty left subtree). For i = 1, that is column j = 0!',
          'When testing k = j (rightmost key as root), the formula accesses C[j + 1, j] (empty right subtree). For j = n, that is row i = n + 1!',
          'That is why OBST tables ALWAYS have rows 1..n+1 and columns 0..n.',
        ],
      },
      {
        stepNumber: 3,
        title: 'Step 4: Constructing the OBST from Root Table R',
        subtitle: 'Fall 2020 Slide 33 Handwritten Solution',
        content: [
          '1. Look up R[1, n] = k → key a_k is the root of the entire OBST.',
          '2. Recursively construct the left child from R[1, k - 1] and the right child from R[k + 1, n].',
        ],
      },
    ],
    designChallenge: {
      scenarioTitle: 'Fall 2020 Q3 & Fall 2025 Q6 Exam Check: Computing C[2, 3] and Tree Construction',
      problemStatement:
        'Given keys A, B, C, D with probabilities p = [0.2, 0.1, 0.4, 0.3], we want to compute C[2, 3] and construct the final tree from R[1, 4] = 3, R[1, 2] = 1, R[2, 2] = 2, R[4, 4] = 4.',
      questions: [
        {
          prompt: 'How is C[2, 3] calculated in detail (as required for full marks on the exam)?',
          options: [
            'min_{2≤k≤3} { C[2,1]+C[3,3], C[2,2]+C[4,3] } + p₂ + p₃ = min(0 + 0.4, 0.1 + 0) + 0.1 + 0.4 = 0.1 + 0.5 = 0.6 (for k=3)',
            'min(C[2,2] + C[3,3]) + p₂ + p₃ = 0.5 + 0.5 = 1.0',
            'C[2,2] + p₃ = 0.1 + 0.4 = 0.5',
          ],
          correctIndex: 0,
          explanation:
            'Matches the exact handwritten solution on Fall 2020 Slide 24: k=2 gives C[2,1]+C[3,3] = 0+0.4 = 0.4; k=3 gives C[2,2]+C[4,3] = 0.1+0 = 0.1. Minimum is 0.1 (at k=3), plus p₂+p₃ (0.5) = 0.6.',
        },
        {
          prompt: 'Given R[1, 4] = 3 (C), R[1, 2] = 1 (A), R[2, 2] = 2 (B), and R[4, 4] = 4 (D), what is the structure of the OBST?',
          options: [
            'Root is C; left child of C is A (with right child B); right child of C is D',
            'Root is C; left child of C is B (with left child A); right child of C is D',
            'Root is B; left child is A; right child is C (with right child D)',
          ],
          correctIndex: 0,
          explanation:
            'R[1,4]=3 makes C the root. Left subtree is C[1,2] where R[1,2]=1 (A is root of left subtree, and B=R[2,2] is right child of A). Right subtree is C[4,4] where R[4,4]=4 (D).',
        },
      ],
    },
    analysis: {
      bestTime: 'Θ(n³)',
      avgTime: 'Θ(n³)',
      worstTime: 'Θ(n³)',
      extraSpace: 'Θ(n²) [Tables C[1..n+1, 0..n] and R[1..n+1, 0..n]]',
      tradeOffSummary:
        'Trades two quadratic tables C and R (Θ(n²) space) to avoid checking all C(2n, n)/(n+1) ∈ Ω(4ⁿ/n^{1.5}) binary search trees.',
      basicOperation: 'Addition & comparison inside the innermost k-loop (k = i to j)',
      inputSizeParam: 'n (number of keys)',
      summationSteps: [
        {
          label: '1. Convert the 3 nested loops (d, i, k) into summations (Lecture 13 Slide 34)',
          math: 'T(n) = ∑_{d=1}^{n-1} ∑_{i=1}^{n-d} ∑_{k=i}^{i+d} 1',
          note: 'Since j = i + d, the innermost k-loop runs from i to i + d, which is (d + 1) iterations.',
        },
        {
          label: '2. Solve innermost k-summation and middle i-summation',
          math: '= ∑_{d=1}^{n-1} ∑_{i=1}^{n-d} (d + 1) = ∑_{d=1}^{n-1} (d + 1)(n - d)',
          note: 'Standard algebraic expansion over diagonals d = 1..n-1.',
        },
        {
          label: '3. Asymptotic Running Time Class (Slide 35)',
          math: '= n(n² - 1) / 6 + ... ∈ Θ(n³)',
          note: 'Cubic running time.',
        },
      ],
    },
  },

  // ==========================================================================
  // 17. WARSHALL'S ALGORITHM
  // ==========================================================================
  {
    id: 'warshall',
    title: 'Warshall’s Algorithm (Transitive Closure)',
    shortTitle: 'Warshall’s Algorithm',
    lectureFile: '14-CPCS 324 - DP-WarshallFloyd.pptx (Slides 7–35)',
    category: 'dynamic-programming',
    categoryLabel: 'Module 3: Dynamic Programming',
    indexingRule: '1-based n × n Boolean matrices R^(0) .. R^(n), k = 1..n intermediate pivot',
    summary:
      'Computes the Transitive Closure of a directed graph with n vertices through a sequence of Boolean matrices R^(0), R^(1), ..., R^(n) using R^(k)[i, j] = R^(k-1)[i, j] OR (R^(k-1)[i, k] AND R^(k-1)[k, j]).',
    pseudocodeTitle: 'Algorithm: Warshall(A[1..n, 1..n])',
    pseudocodeLines: [
      '// Computes transitive closure of digraph with adjacency matrix A',
      'R^(0) ← A',
      'for k ← 1 to n do',
      '    for i ← 1 to n do',
      '        for j ← 1 to n do',
      '            R^(k)[i, j] ← R^(k-1)[i, j] or (R^(k-1)[i, k] and R^(k-1)[k, j])',
      'return R^(n)',
    ],
    examples: [
      {
        id: 'warshall-slide-27',
        name: 'Slide 27 Digraph Example (4 Vertices a, b, c, d)',
        badge: 'Slide Example',
        description: 'Exact 4-vertex directed graph trace from Lecture 14 Slides 27–32.',
        inputSummary: 'a→b, b→d, d→a, d→c',
        customInputDefaults: {
          matrix: '0 1 0 0; 0 0 0 1; 0 0 0 0; 1 0 1 0',
        },
      },
      {
        id: 'warshall-cycle',
        name: 'Directed 4-Cycle (a → b → c → d → a)',
        badge: 'Standard Case',
        description: 'Every vertex eventually reaches every other vertex (all 1s in R^(4)).',
        inputSummary: '4-Cycle Digraph',
        customInputDefaults: {
          matrix: '0 1 0 0; 0 0 1 0; 0 0 0 1; 1 0 0 0',
        },
      },
      {
        id: 'warshall-dag',
        name: 'DAG Chain (a → b → c → d)',
        badge: 'Edge Case',
        description: 'Upper triangular transitive closure with zero cycles.',
        inputSummary: 'a → b → c → d',
        customInputDefaults: {
          matrix: '0 1 0 0; 0 0 1 0; 0 0 0 1; 0 0 0 0',
        },
      },
    ],
    customFields: [
      {
        key: 'matrix',
        label: 'Boolean Adjacency Matrix A[1..n, 1..n] (rows separated by ";")',
        placeholder: '0 1 0 0; 0 0 0 1; 0 0 0 0; 1 0 1 0',
        helpText: 'Enter n rows of 0s and 1s separated by semicolons ";".',
      },
    ],
    designParadigmName: 'Dynamic Programming (Progressive Intermediate Vertex Restriction)',
    designSteps: [
      {
        stepNumber: 1,
        title: 'Definition of Matrix Series R^(0), R^(1), ..., R^(n)',
        subtitle: 'Lecture 14 Slides 14–21',
        content: [
          'In matrix R^(k), element r_{ij}^(k) = 1 if and only if there exists a directed path from vertex i to vertex j using ONLY vertices from {1, 2, ..., k} as intermediate vertices.',
          'Rule 1: If r_{ij} is already 1 in R^(k-1), it remains 1 in R^(k).',
          'Rule 2: If r_{ij} is 0 in R^(k-1), it changes to 1 in R^(k) if and only if BOTH the element in its row i and column k (r_{ik}^(k-1)) AND the element in row k and column j (r_{kj}^(k-1)) are 1s!',
        ],
        formulaBox: 'R^(k)[i, j] = R^(k-1)[i, j]  ∨  ( R^(k-1)[i, k]  ∧  R^(k-1)[k, j] )',
      },
    ],
    designChallenge: {
      scenarioTitle: 'Fast Hand-Tracing Trick for Warshall on Exams',
      problemStatement:
        'When computing R^(k) from R^(k-1) on an exam paper, how can you quickly find all new 1s without checking every (i, j) pair slowly?',
      questions: [
        {
          prompt: 'How do Pivot Column k and Pivot Row k quickly identify which cells become 1 in R^(k)?',
          options: [
            'Find every row i that has a 1 in column k, and every col j that has a 1 in row k; set every intersection (i, j) to 1!',
            'Invert all 0s and 1s on the main diagonal',
            'Multiply row k by column k',
          ],
          correctIndex: 0,
          explanation:
            'Since R^(k)[i, k] AND R^(k)[k, j] must both be 1, only rows i where col k has a 1 and columns j where row k has a 1 can intersect to produce a new 1!',
        },
      ],
    },
    analysis: {
      bestTime: 'Θ(n³)',
      avgTime: 'Θ(n³)',
      worstTime: 'Θ(n³)',
      extraSpace: 'Θ(1) extra space [Can overwrite matrix R in-place!]',
      tradeOffSummary: 'Updates an n×n matrix in place across n stages in Θ(n³) time.',
      basicOperation: 'Logical OR / AND inside the 3 nested loops (k, i, j = 1..n)',
      inputSizeParam: 'n (number of vertices in the digraph)',
      summationSteps: [
        {
          label: '1. Convert the 3 nested loops (k, i, j = 1..n) into summations (Slide 34)',
          math: 'T(n) = ∑_{k=1}^{n} ∑_{i=1}^{n} ∑_{j=1}^{n} 1',
          note: 'Each loop runs from 1 to n independently.',
        },
        {
          label: '2. Solve inner, middle, and outer summations (Slide 35)',
          math: '= ∑_{k=1}^{n} ∑_{i=1}^{n} n = ∑_{k=1}^{n} n² = n³ ∈ Θ(n³)',
          note: 'Exact cubic complexity.',
        },
      ],
    },
  },

  // ==========================================================================
  // 18. FLOYD'S ALGORITHM
  // ==========================================================================
  {
    id: 'floyd',
    title: 'Floyd’s Algorithm (All-Pairs Shortest Paths)',
    shortTitle: 'Floyd’s Algorithm',
    lectureFile: '14-CPCS 324 - DP-WarshallFloyd.pptx & Fall 2020 Q1 / Fall 2025 Q7',
    category: 'dynamic-programming',
    categoryLabel: 'Module 3: Dynamic Programming',
    indexingRule: '1-based n × n Distance matrices D^(0) .. D^(n), k = 1..n intermediate pivot',
    summary:
      'Finds the shortest-path distances between ALL pairs of vertices in a weighted graph through distance matrices D^(0), D^(1), ..., D^(n) using D^(k)[i, j] = min(D^(k-1)[i, j], D^(k-1)[i, k] + D^(k-1)[k, j]).',
    pseudocodeTitle: 'Algorithm: Floyd(W[1..n, 1..n])',
    pseudocodeLines: [
      '// Implements Floyd’s algorithm for All-Pairs Shortest Paths',
      'D ← W                              // D^(0) is the weight matrix W',
      'for k ← 1 to n do',
      '    for i ← 1 to n do',
      '        for j ← 1 to n do',
      '            D[i, j] ← min(D[i, j], D[i, k] + D[k, j])',
      'return D',
    ],
    examples: [
      {
        id: 'floyd-exam-2020-2025',
        name: 'Fall 2020 Q1 & Fall 2025 Q7 MidTerm Exam Graph (a, b, c, d)',
        badge: 'Past Exam',
        description: 'Exact exam problem from BOTH Fall 2020 Q1 and Fall 2025 Q7 (and Lecture 14 Slide 50)!',
        inputSummary: 'a→b(8), a→d(1), b→c(1), c→a(4), d→b(2), d→c(9)',
        customInputDefaults: {
          matrix: '0 8 inf 1; inf 0 1 inf; 4 inf 0 inf; inf 2 9 0',
        },
      },
      {
        id: 'floyd-slide-40',
        name: 'Slide 40 Background Graph (4 Vertices)',
        badge: 'Slide Example',
        description: 'Introductory weighted graph from Lecture 14 Slides 40–41.',
        inputSummary: 'W = [0 ∞ 3 ∞; 2 0 ∞ ∞; ∞ 7 0 1; 6 ∞ ∞ 0]',
        customInputDefaults: {
          matrix: '0 inf 3 inf; 2 0 inf inf; inf 7 0 1; 6 inf inf 0',
        },
      },
      {
        id: 'floyd-3v',
        name: '3-Vertex Triangle Shortcut',
        badge: 'Standard Case',
        description: 'Simple 3-vertex graph where every direct edge is beaten by a 2-edge detour.',
        inputSummary: '3×3 Weighted Digraph',
        customInputDefaults: {
          matrix: '0 10 5; 2 0 1; 3 7 0',
        },
      },
    ],
    customFields: [
      {
        key: 'matrix',
        label: 'Weight Matrix W[1..n, 1..n] (use "inf" for ∞, separate rows with ";")',
        placeholder: '0 8 inf 1; inf 0 1 inf; 4 inf 0 inf; inf 2 9 0',
        helpText: 'Use 0 on diagonal, edge weight for direct edges, and "inf" where no direct edge exists.',
      },
    ],
    designParadigmName: 'Dynamic Programming (All-Pairs Shortest Path Relaxation via Pivot k)',
    designSteps: [
      {
        stepNumber: 1,
        title: 'Step 1 & 2: Characterize Shortest Paths & Recurrence D^(k)[i, j]',
        subtitle: 'Lecture 14 Slides 43–48',
        content: [
          'Let D^(k)[i, j] be the length of the shortest path from vertex i to vertex j using only vertices from {1, 2, ..., k} as intermediate vertices.',
          'When we allow vertex k as a new candidate intermediate vertex:',
          '• Either the shortest path from i to j does NOT pass through k → length is D^(k-1)[i, j].',
          '• Or the shortest path DOES pass through k (i ↝ k ↝ j) → length is D^(k-1)[i, k] + D^(k-1)[k, j].',
        ],
        formulaBox:
          'D^(0) = W   (Weight matrix: 0 on diagonal, edge weight w_{ij}, or ∞)\nD^(k)[i, j] = min( D^(k-1)[i, j],  D^(k-1)[i, k] + D^(k-1)[k, j] )   for k = 1 .. n',
      },
      {
        stepNumber: 2,
        title: 'Exam Hand-Tracing Rule for Floyd’s Algorithm',
        subtitle: 'Fall 2020 Q1 & Fall 2025 Q7 Solution Method',
        content: [
          'At step k: copy Row k, Column k, and the main diagonal (0s) unchanged from D^(k-1) to D^(k).',
          'Furthermore, if Pivot Row k has ∞ in column j, then NO cell in column j can change during step k! Similarly, if Pivot Column k has ∞ in row i, then NO cell in row i can change during step k!',
        ],
      },
    ],
    designChallenge: {
      scenarioTitle: 'Fall 2020 Q1 & Fall 2025 Q7 Check: Computing D^(4) from D^(3)',
      problemStatement:
        'In the exam graph (a, b, c, d), at step k = 4 (pivot vertex d), row d in D^(3) is [7, 2, 3, 0] and column d in D^(3) is [1, 6, 5, 0]^T.',
      questions: [
        {
          prompt: 'How do D^(4)[a, b], D^(4)[a, c], and D^(4)[c, b] update during Step k = 4 (via pivot d)?',
          options: [
            'D[a,b] = min(8, 1+2)=3; D[a,c] = min(9, 1+3)=4; D[c,b] = min(12, 5+2)=7',
            'D[a,b] = 8; D[a,c] = 9; D[c,b] = 12 (no changes)',
            'D[a,b] = min(8, 7+2)=8; D[a,c] = min(9, 7+3)=9; D[c,b] = min(12, 3+2)=5',
          ],
          correctIndex: 0,
          explanation:
            'Via pivot d: D[a,b] = min(D[a,b]=8, D[a,d]+D[d,b] = 1+2=3) = 3; D[a,c] = min(9, D[a,d]+D[d,c] = 1+3=4) = 4; D[c,b] = min(12, D[c,d]+D[d,b] = 5+2=7) = 7!',
        },
      ],
    },
    analysis: {
      bestTime: 'Θ(n³)',
      avgTime: 'Θ(n³)',
      worstTime: 'Θ(n³)',
      extraSpace: 'Θ(1) extra space [Updates n×n distance matrix D in-place]',
      tradeOffSummary: 'Computes shortest paths between all n² vertex pairs in Θ(n³) time using a single n×n matrix.',
      basicOperation: 'Addition and min comparison (min(D[i, j], D[i, k] + D[k, j]))',
      inputSizeParam: 'n (number of vertices in the graph)',
      summationSteps: [
        {
          label: '1. Convert the 3 nested for-loops (k, i, j = 1..n) into summations (Slide 57)',
          math: 'T(n) = ∑_{k=1}^{n} ∑_{i=1}^{n} ∑_{j=1}^{n} 1',
          note: 'Identical loop structure to Warshall’s algorithm.',
        },
        {
          label: '2. Solve inner, middle, and outer summations (Slide 58)',
          math: '= ∑_{k=1}^{n} ∑_{i=1}^{n} n = ∑_{k=1}^{n} n² = n³ ∈ Θ(n³)',
          note: 'Cubic running time.',
        },
      ],
    },
  },
];
