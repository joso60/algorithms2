import type { AlgorithmMeta } from '../types/algorithm';

export const ALGORITHMS_PART1: AlgorithmMeta[] = [
  // ==========================================================================
  // 1. COMPARISON COUNTING SORT
  // ==========================================================================
  {
    id: 'comparison-counting-sort',
    title: 'Comparison Counting Sort',
    shortTitle: 'Comparison Counting Sort',
    lectureFile: '02-CPCS 324 - CountingSort.pptx',
    category: 'input-enhancement',
    categoryLabel: 'Module 1: Input Enhancement',
    indexingRule: '0-based indexing: A[0..n-1], Count[0..n-1], S[0..n-1]',
    summary:
      'Applies Input Enhancement (Preprocessing) by counting the total number of elements strictly smaller than each element A[i], storing counts in Count[0..n-1], and placing A[i] directly at S[Count[i]].',
    pseudocodeTitle: 'Algorithm: ComparisonCountingSort(A[0..n-1])',
    pseudocodeLines: [
      '// Sorts an array by comparison counting',
      'for i ← 0 to n - 1 do',
      '    Count[i] ← 0',
      'for i ← 0 to n - 2 do',
      '    for j ← i + 1 to n - 1 do',
      '        if A[i] < A[j] then Count[j] ← Count[j] + 1',
      '        else Count[i] ← Count[i] + 1',
      'for i ← 0 to n - 1 do',
      '    S[Count[i]] ← A[i]',
      'return S',
    ],
    examples: [
      {
        id: 'ccs-slide-1',
        name: 'Slide 17 Example (62, 31, 84, 96, 19, 47)',
        badge: 'Slide Example',
        description: 'Exact 6-element trace from Lecture 02 Slide 17.',
        inputSummary: 'A = [62, 31, 84, 96, 19, 47]',
        customInputDefaults: { array: '62, 31, 84, 96, 19, 47' },
      },
      {
        id: 'ccs-slide-2',
        name: 'Slide 18 Student Exercise (15, 75, 45, 25, 5, 55)',
        badge: 'Slide Example',
        description: 'Student exercise from Lecture 02 Slide 18.',
        inputSummary: 'A = [15, 75, 45, 25, 5, 55]',
        customInputDefaults: { array: '15, 75, 45, 25, 5, 55' },
      },
      {
        id: 'ccs-edge',
        name: 'Reverse Sorted Edge Case (90, 70, 50, 30, 10)',
        badge: 'Edge Case',
        description: 'Worst-order arrangement where every pair triggers the else branch.',
        inputSummary: 'A = [90, 70, 50, 30, 10]',
        customInputDefaults: { array: '90, 70, 50, 30, 10' },
      },
    ],
    customFields: [
      {
        key: 'array',
        label: 'Input Array A[0..n-1] (comma-separated)',
        placeholder: '62, 31, 84, 96, 19, 47',
        helpText: 'Enter distinct numbers or strings to sort via Comparison Counting.',
      },
    ],
    designParadigmName: 'Input Enhancement (Preprocessing)',
    designSteps: [
      {
        stepNumber: 1,
        title: 'Identify What to Preprocess from the Input',
        subtitle: 'Space-for-Time Trade-Off Strategy',
        content: [
          'Instead of repeatedly swapping elements in-place (like Bubble or Insertion sort), we allocate an auxiliary table Count[0..n-1] initialized to 0.',
          'For each element A[i], if we know exactly how many elements in the array are smaller than A[i] (say k elements), then A[i] must belong at 0-based index k in the sorted output array S[0..n-1].',
        ],
        formulaBox: 'Final Index of A[i] in S = Count[i] = |{ A[j] : A[j] < A[i] }|',
      },
      {
        stepNumber: 2,
        title: 'Avoid Duplicate Pair Comparisons',
        subtitle: 'Triangle Loop Structure (i from 0 to n-2, j from i+1 to n-1)',
        content: [
          'A naive approach would compare every element with every other element (n(n-1) comparisons).',
          'By running i from 0 to n-2 and j from i+1 to n-1, we compare each pair (A[i], A[j]) only ONCE and increment the count of whichever element is larger.',
        ],
        codeSnippet:
          'if A[i] < A[j]\n    Count[j] ← Count[j] + 1\nelse\n    Count[i] ← Count[i] + 1',
      },
      {
        stepNumber: 3,
        title: 'Direct Placement in Minimum Data Movements',
        subtitle: 'Single Pass Output Construction',
        content: [
          'After the nested loop completes, each Count[i] holds the exact final index for A[i].',
          'We copy S[Count[i]] ← A[i] in a single O(n) pass with zero swaps—minimizing data movement.',
          'Limitation (Slide 22): Not appropriate when keys have multiple duplicate occurrences unless modified (which leads to Distribution Counting Sort).',
        ],
      },
    ],
    designChallenge: {
      scenarioTitle: 'Exam Design Question: Ranking Exam Scores Without Swapping Heavy Records',
      problemStatement:
        'Suppose you have n = 500 large student records in memory where swapping records is very expensive, and all scores are distinct. How does Comparison Counting Sort minimize record movements?',
      questions: [
        {
          prompt: 'If element A[i] has 10 elements strictly smaller than it, at which 1-based position (and 0-based index) will it be placed?',
          options: [
            '11th position (0-based index S[10])',
            '10th position (0-based index S[9])',
            '9th position (0-based index S[8])',
          ],
          correctIndex: 0,
          explanation:
            'As stated in Lecture 02 Slide 14: "for count 10, the element will be placed at 11th position" (which corresponds to 0-based index S[10]).',
        },
        {
          prompt: 'Why does the inner loop start at j = i + 1 instead of j = 0?',
          options: [
            'To compare each pair (A[i], A[j]) exactly once and update the larger element’s counter',
            'Because elements before i are already sorted in place',
            'To reduce space complexity from O(n) to O(1)',
          ],
          correctIndex: 0,
          explanation:
            'Starting at j = i + 1 ensures every pair of indices (i, j) with i < j is compared once, halving comparisons to n(n-1)/2.',
        },
      ],
    },
    analysis: {
      bestTime: 'Θ(n²)',
      avgTime: 'Θ(n²)',
      worstTime: 'Θ(n²)',
      extraSpace: 'Θ(n) [Count[0..n-1] + S[0..n-1]]',
      tradeOffSummary:
        'Uses 2n extra memory cells (Count + S) to eliminate swaps and place every element directly into its final sorted slot in a single assignment.',
      basicOperation: 'Key comparison (A[i] < A[j]) inside the nested loops',
      inputSizeParam: 'n (number of elements in array A)',
      summationSteps: [
        {
          label: '1. Convert nested loops into summations',
          math: 'C(n) = ∑_{i=0}^{n-2} ∑_{j=i+1}^{n-1} 1',
          note: 'Outer loop i runs from 0 to n-2; inner loop j runs from i+1 to n-1.',
        },
        {
          label: '2. Evaluate inner summation (upper - lower + 1)',
          math: '= ∑_{i=0}^{n-2} [ (n - 1) - (i + 1) + 1 ] = ∑_{i=0}^{n-2} (n - 1 - i)',
          note: 'Apply standard rule ∑_{j=a}^{b} 1 = b - a + 1.',
        },
        {
          label: '3. Expand arithmetic series from n-1 down to 1',
          math: '= (n - 1) + (n - 2) + ... + 2 + 1 = [n(n - 1)] / 2',
          note: 'Sum of first (n - 1) integers.',
        },
        {
          label: '4. Asymptotic Complexity Class',
          math: '= ½ n² - ½ n ∈ Θ(n²)',
          note: 'Quadratic time in all cases (Best, Average, Worst).',
        },
      ],
      examNote:
        'Lecture 02 Slide 19-20 also shows total operations including initialization and copy loops: T(n) = n + n(n-1)/2 + n = (n² + 3n)/2 ∈ Θ(n²).',
    },
  },

  // ==========================================================================
  // 2. DISTRIBUTION COUNTING SORT
  // ==========================================================================
  {
    id: 'distribution-counting-sort',
    title: 'Distribution Counting Sort',
    shortTitle: 'Distribution Counting Sort',
    lectureFile: '02-CPCS 324 - CountingSort.pptx & Fall 2025 MidTerm Q1',
    category: 'input-enhancement',
    categoryLabel: 'Module 1: Input Enhancement',
    indexingRule: '0-based: A[0..n-1], D[0..u-l], S[0..n-1] (Right-to-Left placement)',
    summary:
      'Sorts elements drawn from a known small range [l..u] in linear Θ(n) time by precomputing Frequency counts and cumulative Distribution values D[0..u-l], then placing elements from right-to-left (i = n-1 down to 0).',
    pseudocodeTitle: 'Algorithm: DistributionCountingSort(A[0..n-1], l, u)',
    pseudocodeLines: [
      '// Sorts array of integers/chars from limited range [l..u]',
      'for j ← 0 to u - l do D[j] ← 0        // Initialize frequencies',
      'for i ← 0 to n - 1 do',
      '    D[A[i] - l] ← D[A[i] - l] + 1     // Compute frequencies',
      'for j ← 1 to u - l do',
      '    D[j] ← D[j - 1] + D[j]            // Reuse for distribution',
      'for i ← n - 1 downto 0 do',
      '    j ← A[i] - l',
      '    S[D[j] - 1] ← A[i]',
      '    D[j] ← D[j] - 1',
      'return S',
    ],
    examples: [
      {
        id: 'dcs-exam-2025',
        name: 'Spring 2021 Q1 & Fall 2025 Q1 (b, c, d, c, b, a, a, b)',
        badge: 'Past Exam',
        description: 'Exact question from both Spring 2021 Midterm Q1 and Fall 2025 Midterm Q1!',
        inputSummary: 'A = [b, c, d, c, b, a, a, b] (Range a..d)',
        customInputDefaults: { array: 'b, c, d, c, b, a, a, b' },
      },
      {
        id: 'dcs-slide-31',
        name: 'Slide 31 Example (13, 11, 12, 13, 12, 12)',
        badge: 'Slide Example',
        description: 'Exact numerical example from Lecture 02 Slide 31 (l=11, u=13).',
        inputSummary: 'A = [13, 11, 12, 13, 12, 12]',
        customInputDefaults: { array: '13, 11, 12, 13, 12, 12' },
      },
      {
        id: 'dcs-slide-32',
        name: 'Winter 2023 MidTerm Q1 & Slide 32 (7, 3, 6, 7, 7, 3, 2, 5, 1, 5, 9, 3, 1, 4, 5)',
        badge: 'Past Exam',
        description: 'Exact 10-point tracing question from Winter 2023 Midterm Exam Q1 (and Lecture 02 Slide 32).',
        inputSummary: 'A = [7, 3, 6, 7, 7, 3, 2, 5, 1, 5, 9, 3, 1, 4, 5]',
        customInputDefaults: { array: '7, 3, 6, 7, 7, 3, 2, 5, 1, 5, 9, 3, 1, 4, 5' },
      },
    ],
    customFields: [
      {
        key: 'array',
        label: 'Input Array A[0..n-1] (characters or integers in a bounded range)',
        placeholder: 'b, c, d, c, b, a, a, b',
        helpText: 'Enter comma-separated letters (e.g. b, c, d, a) or integers (e.g. 13, 11, 12, 13, 12, 12).',
      },
    ],
    designParadigmName: 'Input Enhancement (Frequency & Cumulative Distribution Tables)',
    designSteps: [
      {
        stepNumber: 1,
        title: 'Step 1: Count Key Frequencies',
        subtitle: 'Map Domain [l..u] to 0-Based Bucket Index j = A[i] - l',
        content: [
          'When keys belong to a known small range [l..u] with duplicates, we count how many times each value occurs.',
          'Store frequencies in D[0..u-l] where index j = A[i] - l.',
        ],
        formulaBox: 'Frequency[j] = number of occurrences of (l + j) in A[0..n-1]',
      },
      {
        stepNumber: 2,
        title: 'Step 2: Compute Cumulative Distribution D[j]',
        subtitle: 'Find the Last 1-Based Position for Each Distinct Key',
        content: [
          'By computing prefix sums D[j] = D[j-1] + D[j], each entry D[j] tells us how many elements are ≤ (l + j).',
          'Therefore, D[j] - 1 is the exact 0-based index of the LAST slot in S[0..n-1] where key (l + j) should be placed!',
        ],
        formulaBox: 'D[j] = D[j - 1] + Frequency[j]  for j = 1 .. (u - l)',
      },
      {
        stepNumber: 3,
        title: 'Step 3: Right-to-Left Scan & Decrement',
        subtitle: 'Preserving Stability for Records with Duplicate Keys',
        content: [
          'Process input array A from right to left (i = n-1 down to 0).',
          'For each A[i], compute bucket j = A[i] - l, place A[i] into S[D[j] - 1], and decrement D[j] ← D[j] - 1 so the next duplicate of the same key goes one slot to the left.',
        ],
      },
    ],
    designChallenge: {
      scenarioTitle: 'Fall 2025 MidTerm Q1 Design Check: Distribution Array Mechanics',
      problemStatement:
        'Given A = [b, c, d, c, b, a, a, b] with frequencies a:2, b:3, c:2, d:1 and initial Distribution array D = [2, 5, 7, 8]:',
      questions: [
        {
          prompt: 'In the first iteration of the placement loop (i = 7, A[7] = b), where is b placed and what becomes of D?',
          options: [
            'Placed at S[5 - 1] = S[4], and D becomes [2, 4, 7, 8]',
            'Placed at S[5] = S[5], and D becomes [2, 4, 7, 8]',
            'Placed at S[2 - 1] = S[1], and D becomes [1, 5, 7, 8]',
          ],
          correctIndex: 0,
          explanation:
            'Key b corresponds to j = 1 where D[1] = 5. We place b at S[D[1] - 1] = S[4] and decrement D[1] from 5 to 4.',
        },
        {
          prompt: 'Why is the final placement loop executed from i = n - 1 downto 0 (right-to-left)?',
          options: [
            'Because D[j] points to the LAST position for key j and decrements leftward, making the sort stable',
            'Because arrays in pseudocode cannot be read left-to-right',
            'To reduce time complexity from O(n²) to O(n log n)',
          ],
          correctIndex: 0,
          explanation:
            'Since D[j] starts at the rightmost index of bucket j and decrements, scanning A from right-to-left places the rightmost occurrence of a duplicate key into the rightmost slot of its bucket—preserving relative order (stability).',
        },
      ],
    },
    analysis: {
      bestTime: 'Θ(n + (u - l)) = Θ(n)',
      avgTime: 'Θ(n + (u - l)) = Θ(n)',
      worstTime: 'Θ(n + (u - l)) = Θ(n)',
      extraSpace: 'Θ(n + (u - l)) [D[0..u-l] + S[0..n-1]]',
      tradeOffSummary:
        'Beats the Ω(n log n) comparison-sort lower bound by trading O(n + u - l) extra space for direct index calculation without key-to-key comparisons!',
      basicOperation: 'Array indexing & increment/decrement inside the four sequential for-loops',
      inputSizeParam: 'n (number of elements), u - l + 1 (range of key values)',
      summationSteps: [
        {
          label: '1. Sum the four sequential (non-nested) for-loops',
          math: 'T(n) = ∑_{j=0}^{u-l} 1 + ∑_{i=0}^{n-1} 1 + ∑_{j=1}^{u-l} 1 + ∑_{i=0}^{n-1} 1',
          note: 'Loop 1 (init D), Loop 2 (frequencies), Loop 3 (distribution), Loop 4 (placement).',
        },
        {
          label: '2. Evaluate each summation',
          math: '= (u - l + 1) + n + (u - l) + n = 2n + 2(u - l) + 1',
          note: 'Each loop runs a linear number of times.',
        },
        {
          label: '3. Assuming range (u - l) is bounded / constant relative to n',
          math: 'T(n) ∈ Θ(n)',
          note: 'Linear running time—faster than QuickSort/MergeSort when range [l..u] is small!',
        },
      ],
    },
  },

  // ==========================================================================
  // 3. BRUTE FORCE STRING MATCHING
  // ==========================================================================
  {
    id: 'brute-force-sm',
    title: 'Brute Force String Matching',
    shortTitle: 'Brute Force String Match',
    lectureFile: '03-CPCS 324 - SM-BruteForce.pptx',
    category: 'input-enhancement',
    categoryLabel: 'Module 1: Input Enhancement',
    indexingRule: '0-based: T[0..n-1], P[0..m-1], last alignment i = n - m',
    summary:
      'Baseline string matching algorithm (zero preprocessing space). Aligns P[0..m-1] with T[0..n-1], compares left-to-right, and shifts by exactly 1 position on any mismatch.',
    pseudocodeTitle: 'Algorithm: BruteForceStringMatch(T[0..n-1], P[0..m-1])',
    pseudocodeLines: [
      '// Searches for pattern P in text T (left-to-right comparison)',
      'for i ← 0 to n - m do',
      '    j ← 0',
      '    while j < m and P[j] = T[i + j] do',
      '        j ← j + 1',
      '    if j = m then return i',
      'return -1',
    ],
    examples: [
      {
        id: 'bf-slide-14',
        name: 'Slide 14 Example ("NOBODY_NOTICED_HIM", Pattern "NOT")',
        badge: 'Slide Example',
        description: 'Exact trace from Lecture 03 Slides 14–28.',
        inputSummary: 'T = "NOBODY_NOTICED_HIM", P = "NOT"',
        customInputDefaults: { text: 'NOBODY_NOTICED_HIM', pattern: 'NOT' },
      },
      {
        id: 'bf-slide-7',
        name: 'Slide 7 Binary String ("10010101101001100101111010", "001011")',
        badge: 'Slide Example',
        description: 'Binary pattern example from Lecture 03 Slide 7 (shows repeated partial matches).',
        inputSummary: 'T = "10010101101001100101111010", P = "001011"',
        customInputDefaults: { text: '10010101101001100101111010', pattern: '001011' },
      },
      {
        id: 'bf-worst',
        name: 'Worst-Case Θ(nm) Input ("AAAAAAAAAAAAB", "AAAB")',
        badge: 'Edge Case',
        description: 'Forces all m comparisons on every single alignment i = 0..n-m.',
        inputSummary: 'T = "AAAAAAAAAAAAB", P = "AAAB"',
        customInputDefaults: { text: 'AAAAAAAAAAAAB', pattern: 'AAAB' },
      },
    ],
    customFields: [
      {
        key: 'text',
        label: 'Text T[0..n-1]',
        placeholder: 'NOBODY_NOTICED_HIM',
        helpText: 'Enter text string T of length n.',
      },
      {
        key: 'pattern',
        label: 'Pattern P[0..m-1]',
        placeholder: 'NOT',
        helpText: 'Enter pattern P of length m (m ≤ n).',
      },
    ],
    designParadigmName: 'Brute Force Baseline (Why We Need Input Enhancement)',
    designSteps: [
      {
        stepNumber: 1,
        title: 'Alignment & Boundary Analysis',
        subtitle: 'Why Outer Loop Stops at i = n - m',
        content: [
          'Text T is indexed 0 to n-1 and Pattern P is indexed 0 to m-1.',
          'The last valid starting index in T where a pattern of length m can still fit is n - m (Lecture 03 Slide 11: if n = 8 and m = 3, last position is 8 - 3 = 5).',
        ],
        formulaBox: 'Valid alignment range: 0 ≤ i ≤ n - m (Total n - m + 1 alignments)',
      },
      {
        stepNumber: 2,
        title: 'Left-to-Right Character Comparison',
        subtitle: 'Shifting by 1 on Mismatch',
        content: [
          'At alignment i, inner index j scans from 0 to m-1 comparing P[j] with T[i + j].',
          'If a mismatch occurs, Brute Force discards all knowledge of characters already inspected and shifts P by only 1 position (i ← i + 1).',
          'This motivates Horspool and Boyer-Moore: by preprocessing P into a Shift Table and comparing right-to-left, we can jump up to m positions at once!',
        ],
      },
    ],
    designChallenge: {
      scenarioTitle: 'Lecture 03 Slide 30 Exercise: Finding ALL Occurrences of Pattern P',
      problemStatement:
        'Standard BruteForceStringMatch stops and returns i as soon as the first match (j = m) is found. How should you modify it to find ALL indices of multiple occurrences of P in T?',
      questions: [
        {
          prompt: 'What change inside the outer loop allows finding all occurrences of P in T?',
          options: [
            'Instead of "if j = m return i", append i to a result list and let the outer loop continue up to n - m',
            'Change outer loop bound from n - m to n - 1',
            'Start inner loop at j = 1 instead of j = 0',
          ],
          correctIndex: 0,
          explanation:
            'Recording index i (or printing i) when j = m instead of returning early allows the outer loop to test all remaining alignments up to n - m.',
        },
      ],
    },
    analysis: {
      bestTime: 'Ω(m) [First alignment matches immediately]',
      avgTime: 'Θ(n) [On random natural-language text]',
      worstTime: 'Θ(nm) [m(n - m + 1) character comparisons]',
      extraSpace: 'Θ(1) [Zero auxiliary tables]',
      tradeOffSummary:
        'Uses O(1) extra space, but suffers up to m(n - m + 1) ∈ Θ(nm) comparisons in the worst case because it shifts by only 1.',
      basicOperation: 'Character comparison (P[j] = T[i + j])',
      inputSizeParam: 'n (length of text T), m (length of pattern P)',
      summationSteps: [
        {
          label: '1. Formulate worst-case nested summation',
          math: 'C_{worst}(n, m) = ∑_{i=0}^{n-m} ∑_{j=0}^{m-1} 1',
          note: 'Outer loop runs from 0 to n - m; inner while loop runs m times (0 to m - 1) in worst case.',
        },
        {
          label: '2. Solve inner summation',
          math: '= ∑_{i=0}^{n-m} [ (m - 1) - 0 + 1 ] = ∑_{i=0}^{n-m} m',
          note: 'Each alignment performs m comparisons.',
        },
        {
          label: '3. Solve outer summation',
          math: '= m · [ (n - m) - 0 + 1 ] = m(n - m + 1) ∈ Θ(nm)',
          note: 'Matches exact formula on Lecture 03 Slide 33.',
        },
      ],
    },
  },

  // ==========================================================================
  // 4. HORSPOOL'S ALGORITHM
  // ==========================================================================
  {
    id: 'horspool',
    title: 'Horspool’s String Matching Algorithm',
    shortTitle: 'Horspool’s Algorithm',
    lectureFile: '04-CPCS 324 - SM-Horspool.pptx & Fall 2020/2025 MidTerm Q2',
    category: 'input-enhancement',
    categoryLabel: 'Module 1: Input Enhancement',
    indexingRule: '0-based: P[0..m-1], T[0..n-1], i starts at m-1, shift uses T[i]',
    summary:
      'Simplifies Boyer-Moore using a single preprocessed Shift Table t(c). Compares pattern right-to-left; on any mismatch, shifts by t(T[i]) where T[i] is the text character aligned with the LAST character of the pattern.',
    pseudocodeTitle: 'Algorithm: HorspoolMatching(P[0..m-1], T[0..n-1])',
    pseudocodeLines: [
      'ShiftTable(P[0..m-1])              // Generate Table[c] of shifts',
      'i ← m - 1                          // Position of pattern’s right end',
      'while i ≤ n - 1 do',
      '    k ← 0                          // Number of matched characters',
      '    while k ≤ m - 1 and P[m - 1 - k] = T[i - k] do',
      '        k ← k + 1',
      '    if k = m then',
      '        return i - m + 1           // Match found at index i - m + 1',
      '    else',
      '        i ← i + Table[T[i]]        // Shift by char aligned with P[m-1]',
      'return -1',
    ],
    secondaryPseudocodeTitle: 'Algorithm: ShiftTable(P[0..m-1])',
    secondaryPseudocodeLines: [
      'for i ← 0 to size - 1 do Table[i] ← m',
      'for j ← 0 to m - 2 do Table[P[j]] ← m - 1 - j',
      'return Table',
    ],
    examples: [
      {
        id: 'hp-exam-gcagag',
        name: 'Fall 2020 & Fall 2025 MidTerm Q2 ("GCAGAG" in DNA Text)',
        badge: 'Past Exam',
        description: 'Exact 15-point exam question from both Fall 2020 Q2 and Fall 2025 Q2!',
        inputSummary: 'P = "GCAGAG", T = "GCATCGTAGAGAGTATACGCAGAG"',
        customInputDefaults: {
          text: 'GCATCGTAGAGAGTATACGCAGAG',
          pattern: 'GCAGAG',
        },
      },
      {
        id: 'hp-slide-barber',
        name: 'Slide 43 Example ("BARBER" in "JIM_SAW_ME_IN_A_BARBERSHOP")',
        badge: 'Slide Example',
        description: 'Classic textbook & Lecture 04 Slides 23–63 trace.',
        inputSummary: 'P = "BARBER", T = "JIM_SAW_ME_IN_A_BARBERSHOP"',
        customInputDefaults: {
          text: 'JIM_SAW_ME_IN_A_BARBERSHOP',
          pattern: 'BARBER',
        },
      },
      {
        id: 'hp-slide-baobab',
        name: 'Slide 67 Student Exercise ("BAOBAB" in "BARD_LOVED_BAOBAB_BANANAS")',
        badge: 'Slide Example',
        description: 'Student exercise from Lecture 04 Slide 67.',
        inputSummary: 'P = "BAOBAB", T = "BARD_LOVED_BAOBAB_BANANAS"',
        customInputDefaults: {
          text: 'BARD_LOVED_BAOBAB_BANANAS',
          pattern: 'BAOBAB',
        },
      },
    ],
    customFields: [
      {
        key: 'text',
        label: 'Text T[0..n-1]',
        placeholder: 'GCATCGTAGAGAGTATACGCAGAG',
        helpText: 'Enter text string T.',
      },
      {
        key: 'pattern',
        label: 'Pattern P[0..m-1]',
        placeholder: 'GCAGAG',
        helpText: 'Enter pattern string P to construct t(c) and trace.',
      },
    ],
    designParadigmName: 'Input Enhancement (Horspool Shift Table Preprocessing)',
    designSteps: [
      {
        stepNumber: 1,
        title: 'The 4 Shift Scenarios (Why We Exclude P[m-1])',
        subtitle: 'Lecture 04 Slides 10–21',
        content: [
          'Let c = T[i] be the text character currently aligned with the LAST character of the pattern P[m-1].',
          'Case I: c does not appear in P at all → shift by full length m.',
          'Case II: c appears in the first m-1 characters P[0..m-2] (and not at P[m-1]) → align rightmost occurrence of c in P[0..m-2] with T[i].',
          'Case III: c is P[m-1] and does NOT appear in P[0..m-2] → shift by full length m.',
          'Case IV: c is P[m-1] AND also appears in P[0..m-2] → align rightmost occurrence in P[0..m-2] with T[i].',
        ],
        formulaBox:
          't(c) = m if c is not among first m - 1 characters of P; else m - 1 - j (where j is rightmost index of c in P[0..m-2])',
      },
      {
        stepNumber: 2,
        title: 'Crucial Exam Rule: Always Look Up T[i]!',
        subtitle: 'Avoiding the #1 Student Exam Mistake',
        content: [
          'Even if k > 0 characters matched from right-to-left before a mismatch at T[i - k], Horspool’s algorithm ALWAYS looks up Table[T[i]]—the character aligned with the LAST character of the pattern, NOT the mismatched character T[i - k]!',
        ],
        codeSnippet: 'for j ← 0 to m - 2 do\n    Table[P[j]] ← m - 1 - j',
      },
    ],
    designChallenge: {
      scenarioTitle: 'Fall 2025 MidTerm Q2 Check: Shift Table for P = "GCAGAG"',
      problemStatement:
        'Construct the Horspool shift table t(c) for pattern P = "GCAGAG" (length m = 6, indices 0..5). Remember the loop runs for j = 0 to m - 2 (indices 0..4: G, C, A, G, A).',
      questions: [
        {
          prompt: 'What are the exact shift values t(A), t(C), t(G), and t(Other) for P = "GCAGAG"?',
          options: [
            't(A) = 1, t(C) = 4, t(G) = 2, t(Other) = 6',
            't(A) = 1, t(C) = 4, t(G) = 0, t(Other) = 6',
            't(A) = 3, t(C) = 4, t(G) = 5, t(Other) = 6',
          ],
          correctIndex: 0,
          explanation:
            'In P[0..4] = "GCAGA": rightmost A is at j=4 (6-1-4 = 1); rightmost C is at j=1 (6-1-1 = 4); rightmost G in P[0..4] is at j=3 (6-1-3 = 2, ignoring P[5]). All other chars get m = 6.',
        },
      ],
    },
    analysis: {
      bestTime: 'Ω(n / m) [Shifts by m on every first comparison]',
      avgTime: 'Θ(n) [Sublinear on random text]',
      worstTime: 'Θ(nm) [m(n - m + 1) when shifting by 1 repeatedly]',
      extraSpace: 'Θ(|Σ|) [Shift table of alphabet size]',
      tradeOffSummary:
        'Stores a single Shift Table of size |Σ| (alphabet size) to achieve Θ(n) average time and Ω(n/m) best case, vastly outperforming Brute Force in practice.',
      basicOperation: 'Character comparison (P[m - 1 - k] = T[i - k])',
      inputSizeParam: 'n (text length), m (pattern length)',
      summationSteps: [
        {
          label: '1. Preprocessing Shift Table loop',
          math: 'T_{pre}(m) = ∑_{i=0}^{|Σ|-1} 1 + ∑_{j=0}^{m-2} 1 = |Σ| + (m - 1) ∈ Θ(m + |Σ|)',
          note: 'Initializes alphabet table and scans first m - 1 pattern characters.',
        },
        {
          label: '2. Worst-case search loop summation (Lecture 04 Slide 64)',
          math: 'C_{worst}(n, m) = ∑_{i=m-1}^{n-1} ∑_{k=0}^{m-1} 1 = ∑_{i=m-1}^{n-1} m',
          note: 'Outer while runs from i = m-1 to n-1; inner while runs k = 0 to m-1 (m times).',
        },
        {
          label: '3. Solve outer summation',
          math: '= m · [ (n - 1) - (m - 1) + 1 ] = m(n - m + 1) ∈ Θ(nm)',
          note: 'Matches exact algebraic derivation on Lecture 04 Slide 64.',
        },
      ],
    },
  },

  // ==========================================================================
  // 5. BOYER-MOORE ALGORITHM
  // ==========================================================================
  {
    id: 'boyer-moore',
    title: 'Boyer-Moore String Matching Algorithm',
    shortTitle: 'Boyer-Moore Algorithm',
    lectureFile: '05-CPCS 324 - SM-BoyerMoore.pptx & Fall 2025 MidTerm Q3',
    category: 'input-enhancement',
    categoryLabel: 'Module 1: Input Enhancement',
    indexingRule: '0-based: P[0..m-1], k = 1..m-1 matched suffix, d = max(d₁, d₂)',
    summary:
      'Uses TWO preprocessed tables: Bad-Symbol Shift Table t₁(c) and Good-Suffix Shift Table d₂(k). When k > 0 characters match from right-to-left, shifts by d = max(d₁, d₂) where d₁ = max(t₁(c) - k, 1).',
    pseudocodeTitle: 'Algorithm: BoyerMooreMatching(P[0..m-1], T[0..n-1])',
    pseudocodeLines: [
      'Construct Bad-Symbol Table t₁(c) and Good-Suffix Table d₂(k)',
      'i ← m - 1',
      'while i ≤ n - 1 do',
      '    k ← 0',
      '    while k ≤ m - 1 and P[m - 1 - k] = T[i - k] do',
      '        k ← k + 1',
      '    if k = m then return i - m + 1',
      '    c ← T[i - k]                   // MISMATCHED character in Text',
      '    d₁ ← max(t₁(c) - k, 1)         // Bad-symbol shift',
      '    if k = 0 then d ← d₁',
      '    else d ← max(d₁, d₂(k))        // Combine with Good-suffix shift',
      '    i ← i + d',
      'return -1',
    ],
    examples: [
      {
        id: 'bm-slide-baobab',
        name: 'Slide 42 Example ("BAOBAB" in "BESS_KNEW_ABOUT_BAOBABS")',
        badge: 'Slide Example',
        description: 'Complete trace from Lecture 05 Slides 42–62 showing d₁, d₂, and d = max(d₁, d₂).',
        inputSummary: 'P = "BAOBAB", T = "BESS_KNEW_ABOUT_BAOBABS"',
        customInputDefaults: {
          text: 'BESS_KNEW_ABOUT_BAOBABS',
          pattern: 'BAOBAB',
        },
      },
      {
        id: 'bm-exam-01010',
        name: 'Fall 2025 MidTerm Q3 Good-Suffix Table ("01010")',
        badge: 'Past Exam',
        description: 'Exact 5-point question from Fall 2025 Midterm Q3: Construct Good Suffix Table for 01010.',
        inputSummary: 'P = "01010", T = "1101001001010"',
        customInputDefaults: {
          text: '1101001001010',
          pattern: '01010',
        },
      },
      {
        id: 'bm-slide-abcbab',
        name: 'Slide 36 Good-Suffix Example (Pattern "ABCBAB")',
        badge: 'Slide Example',
        description: 'Good-suffix table construction example from Lecture 05 Slide 36.',
        inputSummary: 'P = "ABCBAB", T = "CBABCBABCBAB"',
        customInputDefaults: {
          text: 'CBABCBABCBAB',
          pattern: 'ABCBAB',
        },
      },
    ],
    customFields: [
      {
        key: 'text',
        label: 'Text T[0..n-1]',
        placeholder: 'BESS_KNEW_ABOUT_BAOBABS',
        helpText: 'Enter text string T.',
      },
      {
        key: 'pattern',
        label: 'Pattern P[0..m-1]',
        placeholder: 'BAOBAB',
        helpText: 'Enter pattern P to build both t₁(c) and Good-Suffix d₂(k) tables.',
      },
    ],
    designParadigmName: 'Input Enhancement (Dual Table Preprocessing: Bad-Symbol & Good-Suffix)',
    designSteps: [
      {
        stepNumber: 1,
        title: 'Bad-Symbol Shift d₁ = max(t₁(c) - k, 1)',
        subtitle: 'Lecture 05 Slides 9–23',
        content: [
          'Unlike Horspool (which always uses T[i]), Boyer-Moore uses c = T[i - k], the actual MISMATCHED text character after k successful right-to-left matches.',
          'Since k characters already matched, the distance from c to the end of the pattern is reduced by k: t₁(c) - k.',
          'Because t₁(c) - k can be zero or negative, we enforce a minimum shift of 1: d₁ = max(t₁(c) - k, 1).',
        ],
        formulaBox: 'd₁ = max(t₁(c) - k, 1)   where c = T[i - k] is the mismatched text character',
      },
      {
        stepNumber: 2,
        title: 'Good-Suffix Shift d₂(k) — The 3 Cases',
        subtitle: 'Lecture 05 Slides 24–36',
        content: [
          'When 0 < k < m characters match, let suff(k) be the matched suffix of length k:',
          'Case I: Another occurrence of suff(k) NOT preceded by the same character exists in P → d₂ is the distance from the right end to the rightmost such occurrence.',
          'Case II: No other occurrence of suff(k) AND no prefix of P matches a suffix of suff(k) → d₂ = m (full pattern length).',
          'Case III: No other occurrence of suff(k), BUT a shorter prefix of P matches a tail suffix of suff(k) → d₂ is the distance to align that prefix with the tail suffix.',
        ],
        formulaBox: 'Total Shift d = d₁ (if k = 0)  |  d = max(d₁, d₂(k)) (if 0 < k < m)',
      },
    ],
    designChallenge: {
      scenarioTitle: 'Fall 2025 MidTerm Q3 Check: Good Suffix Table for P = "01010"',
      problemStatement:
        'Construct the Good Suffix Table d₂(k) for pattern P = "01010" (m = 5) for k = 1, 2, 3, 4.',
      questions: [
        {
          prompt: 'For P = "01010", what are the values of d₂ for k = 1, 2, 3, 4?',
          options: [
            'k=1: d₂=4, k=2: d₂=4, k=3: d₂=2, k=4: d₂=2',
            'k=1: d₂=2, k=2: d₂=2, k=3: d₂=4, k=4: d₂=4',
            'k=1: d₂=5, k=2: d₂=5, k=3: d₂=2, k=4: d₂=2',
          ],
          correctIndex: 0,
          explanation:
            'For k=1 (suff="0", preceded by "1"): earlier "0" at index 2 is ALSO preceded by "1" (invalid!), while "0" at index 0 has no preceding char → distance = 4. For k=2 (suff="10", preceded by "0"): earlier "10" at index 1 is also preceded by "0", but prefix "0" (len 1) matches suffix "0" → 5-1 = 4. For k=3 ("010") & k=4 ("1010"): longest matching prefix is "010" (len 3) → 5-3 = 2.',
        },
      ],
    },
    analysis: {
      bestTime: 'Ω(n / m)',
      avgTime: 'Θ(n) [Sublinear character inspections]',
      worstTime: 'O(n) [When pattern is not in text; O(nm) for finding all matches]',
      extraSpace: 'Θ(|Σ| + m) [Bad-symbol table + Good-suffix table]',
      tradeOffSummary:
        'Trades two auxiliary tables (size |Σ| and m) to achieve worst-case O(n) search when pattern is absent and the fastest jumps on large alphabets.',
      basicOperation: 'Character comparison (P[m - 1 - k] = T[i - k])',
      inputSizeParam: 'n (text length), m (pattern length)',
      summationSteps: [
        {
          label: '1. Preprocessing Space & Time',
          math: 'T_{pre}(m, |Σ|) = Θ(|Σ| + m)',
          note: 'Builds t₁[0..|Σ|-1] and d₂[1..m-1] before searching.',
        },
        {
          label: '2. Search Time Complexity (Lecture 05 Slide 63)',
          math: 'T_{worst}(n) ∈ O(n)',
          note: 'Faster than both Brute Force and Horspool; especially effective on large alphabets.',
        },
      ],
    },
  },

  // ==========================================================================
  // 6. HASHING
  // ==========================================================================
  {
    id: 'hashing',
    title: 'Hashing (Open vs. Closed Hashing)',
    shortTitle: 'Hashing & Collision Resolution',
    lectureFile: '06-CPCS 324 - Hashing.pptx',
    category: 'pre-structuring',
    categoryLabel: 'Module 2: Pre-Structuring',
    indexingRule: '0-based Hash Table[0..m-1], H₁(x) = x mod m, Load Factor α = n / m',
    summary:
      'Implements dictionaries in O(1) average time using Pre-Structuring. Compares Closed Hashing (Linear Probing, Quadratic Probing, Double Hashing) and Open Hashing (Separate Chaining), plus Lazy Deletion.',
    pseudocodeTitle: 'Algorithm: HashTableInsertAndSearch(K, m)',
    pseudocodeLines: [
      'h ← K mod m                        // Primary hash address H₁(K)',
      '// 1. Separate Chaining (Open Hashing):',
      'Insert K at end/front of LinkedList Table[h]',
      '// 2. Open Addressing (Closed Hashing):',
      'i ← 0',
      'while Table[(h + probe(i)) mod m] is Occupied do',
      '    i ← i + 1                      // Linear: i | Quad: i² | Double: i·H₂(K)',
      'Table[(h + probe(i)) mod m] ← K',
    ],
    examples: [
      {
        id: 'hash-slide-47',
        name: 'Slide 47 Review Question (1837, 2209, 7777, 2100, 6897, 4012, m=10)',
        badge: 'Slide Example',
        description: 'Exact review question from Lecture 06 Slides 47–50 comparing Quadratic, Double Hashing, and Separate Chaining.',
        inputSummary: 'Keys = [1837, 2209, 7777, 2100, 6897, 4012], m = 10',
        customInputDefaults: {
          keys: '1837, 2209, 7777, 2100, 6897, 4012',
          tableSize: '10',
        },
      },
      {
        id: 'hash-slide-32',
        name: 'Slide 32 Example (1234, 4055, 3962, 5853, 1766, 1270, m=31)',
        badge: 'Slide Example',
        description: 'All keys collide at index 25 and 30 in a table of size m = 31 (Slides 32–44).',
        inputSummary: 'Keys = [1234, 4055, 3962, 5853, 1766, 1270], m = 31',
        customInputDefaults: {
          keys: '1234, 4055, 3962, 5853, 1766, 1270',
          tableSize: '31',
        },
      },
      {
        id: 'hash-clustering',
        name: 'Primary Clustering Stress Test (15, 25, 35, 45, 5, 16, m=10)',
        badge: 'Edge Case',
        description: 'Demonstrates primary clustering in Linear Probing vs Quadratic/Double dispersion.',
        inputSummary: 'Keys = [15, 25, 35, 45, 5, 16], m = 10',
        customInputDefaults: {
          keys: '15, 25, 35, 45, 5, 16',
          tableSize: '10',
        },
      },
    ],
    customFields: [
      {
        key: 'keys',
        label: 'Keys to Insert (comma-separated integers)',
        placeholder: '1837, 2209, 7777, 2100, 6897, 4012',
        helpText: 'Enter integer keys to insert in order from left to right.',
      },
      {
        key: 'tableSize',
        label: 'Hash Table Size m',
        placeholder: '10',
        helpText: 'Use m = 10 for Slide 47 rules (H₂(x) = 4 - (x mod 2)) or any m ∈ [3..31].',
      },
    ],
    designParadigmName: 'Pre-Structuring (Auxiliary Hash Table & Collision Resolution)',
    designSteps: [
      {
        stepNumber: 1,
        title: 'Why Direct Access Tables Fail & How Hash Functions Work',
        subtitle: 'Lecture 06 Slides 12–27',
        content: [
          'Storing 30 KAU students by 7-digit ID in a Direct Access Table requires an array of 10 million cells ("O(stupid)" space — Slide 14).',
          'A Hash Function h(K) maps keys into a reasonable table size m: Selecting Digits, Folding Method (summing digits/groups), or Modulo Arithmetic h(x) = x mod m (best when m is prime).',
        ],
        formulaBox: 'Load Factor α = n / m   (Average chain length in Separate Chaining)',
      },
      {
        stepNumber: 2,
        title: 'Collision Resolution: Closed vs. Open Hashing',
        subtitle: 'Lecture 06 Slides 29–50',
        content: [
          'Closed Hashing (Open Addressing): All keys live inside the 1D array of size m. On collision at h = H₁(x), probe:',
          '• Linear Probing: (h + i) mod m → suffers from Primary Clustering.',
          '• Quadratic Probing: (h + i²) mod m → reduces primary clustering (has milder secondary clustering).',
          '• Double Hashing: (h + i · H₂(x)) mod m where H₂(x) ≠ 0 and H₂ ≠ H₁ → eliminates clustering.',
          'Open Hashing (Separate Chaining): Each cell Table[i] points to a dynamic linked list of colliding keys.',
        ],
      },
      {
        stepNumber: 3,
        title: 'The Deletion Problem & Lazy Deletion',
        subtitle: 'Lecture 06 Slides 52–55',
        content: [
          'In Closed Hashing, simply emptying a deleted cell breaks future searches for keys that probed past that cell!',
          'Solution (Lazy Deletion): Mark each location as Empty, Occupied, or Deleted (tombstone). Searches treat Deleted cells as Occupied (keep probing), while Insertions treat Deleted cells as Empty (reusable).',
        ],
      },
    ],
    designChallenge: {
      scenarioTitle: 'Lecture 06 Slide 47–55 Check: Double Hashing & Lazy Deletion',
      problemStatement:
        'We insert keys 1837, 2209, 7777, 2100, 6897 into a table of size m = 10 using H₁(x) = x mod 10 and Double Hashing with H₂(x) = 4 - (x mod 2).',
      questions: [
        {
          prompt: 'Where does 6897 land under Double Hashing (given 1837 is at index 7 and 7777 is at index 0)?',
          options: [
            'Index 3',
            'Index 1',
            'Index 8',
          ],
          correctIndex: 0,
          explanation:
            'H₁(6897) = 7 (occupied by 1837). Step size H₂(6897) = 4 - (6897 mod 2) = 4 - 1 = 3. First probe: (7 + 3) mod 10 = 0 (occupied by 7777). Second probe: (7 + 2×3) mod 10 = 13 mod 10 = 3 (Empty!).',
        },
        {
          prompt: 'In Closed Hashing with Lazy Deletion, how is a cell marked "Deleted" treated during Search vs. Insertion?',
          options: [
            'Treated as Occupied during Search (keep probing) and as Empty during Insertion',
            'Treated as Empty during Search and Occupied during Insertion',
            'Treated as Empty in both Search and Insertion',
          ],
          correctIndex: 0,
          explanation:
            'As explained on Slide 55: "deleted locations are treated as empty during insertion operation and as occupied during search operation."',
        },
      ],
    },
    analysis: {
      bestTime: 'Θ(1) [No collision at H₁(x)]',
      avgTime: 'Θ(1 + α) = Θ(1) [When load factor α = n/m is bounded]',
      worstTime: 'Θ(n) [All n keys collide into the same chain/cluster]',
      extraSpace: 'Θ(m) table cells + Θ(n) pointers (in Separate Chaining)',
      tradeOffSummary:
        'Allocating a hash table of size m ≈ n (so α = n/m ≤ 1) reduces dictionary Search, Insert, and Delete from O(log n) in BSTs to O(1) expected time.',
      basicOperation: 'Hash evaluation H₁(x) and key comparisons during probing/chaining',
      inputSizeParam: 'n (number of stored keys), m (hash table size), α = n/m (load factor)',
      summationSteps: [
        {
          label: '1. Load Factor Definition (Slide 45)',
          math: 'α = n / m   (Average number of keys per linked list in Separate Chaining)',
          note: 'In Open Addressing, α must satisfy α ≤ 1 (ideally α ≤ 0.75).',
        },
        {
          label: '2. Speed Ranking of Collision Resolution Schemes (Slide 51)',
          math: 'Linear Probing (Slowest) < Quadratic Probing < Double Hashing < Separate Chaining (Quickest)',
          note: 'Separate chaining avoids clustering and handles α > 1 gracefully.',
        },
      ],
      comparisonTable: {
        headers: ['Data Structure', 'Add Record', 'Delete Record', 'Search Record'],
        rows: [
          ['Unsorted Array (Slide 9)', 'O(1)', 'O(n)', 'O(n)'],
          ['Sorted Array (Slide 10)', 'O(n)', 'O(n)', 'O(log n)'],
          ['Binary Search Tree (Slide 11)', 'O(log n)', 'O(log n)', 'O(log n)'],
          ['Hash Table (Ideal / Avg, Slide 17)', 'O(1)', 'O(1)', 'O(1)'],
        ],
      },
    },
  },

  // ==========================================================================
  // 7. INDEXING WITH B-TREES
  // ==========================================================================
  {
    id: 'b-trees',
    title: 'Indexing with B-Trees',
    shortTitle: 'B-Trees (Order m)',
    lectureFile: '07-CPCS 324 - B-Trees.pptx & Fall 2020 Q5 / Fall 2025 Q8',
    category: 'pre-structuring',
    categoryLabel: 'Module 2: Pre-Structuring',
    indexingRule: 'Order m: Children ∈ [⌈m/2⌉ .. m], Keys ∈ [⌈m/2⌉ - 1 .. m - 1] (Root ≥ 1 key)',
    summary:
      'Multiway balanced search tree designed for magnetic disks using Pre-Structuring. Covers structural bounds (order m), bottom-up node splitting on overflow, and the 4 exam deletion scenarios (borrowing & merging).',
    pseudocodeTitle: 'Algorithm: BTreeInsertAndDelete(T, K, m)',
    pseudocodeLines: [
      '// Insertion in B-Tree of order m (Max keys = m - 1):',
      'Search down from root to appropriate leaf L for key K',
      'if L has < m - 1 keys then Insert K into L in sorted order',
      'else (Overflow: L has m keys):',
      '    Split node into two halves around median key (⌈m/2⌉)',
      '    Push median key up to parent (recursively up to root)',
      '// Deletion Scenarios (Min keys = ⌈m/2⌉ - 1):',
      'Scenario I: K in leaf with > Min keys → Simply remove K',
      'Scenario II: K in internal node → Replace K with inorder successor',
      'Scenario III: Underflow leaf has sibling with extra key → Borrow via parent',
      'Scenario IV: No sibling has extra key → Combine (merge) with sibling & parent key',
    ],
    examples: [
      {
        id: 'bt-slide-create',
        name: 'Slides 34–71 Creation Ex. 1 (All 20 Letters: C, N, G, A..S, m = 5)',
        badge: 'Slide Example',
        description:
          'Complete 20-letter B-Tree creation from Slides 34–71 (C N G A H E K Q M F W L T Z D P R X Y S), culminating in the cascading root split on S!',
        inputSummary: 'Insert C, N, G, A, H, E, K, Q, M, F, W, L, T, Z, D, P, R, X, Y, S (m = 5)',
        customInputDefaults: {
          keys: 'C, N, G, A, H, E, K, Q, M, F, W, L, T, Z, D, P, R, X, Y, S',
          order: '5',
        },
      },
      {
        id: 'bt-slide-create-2',
        name: 'Slides 72–83 Creation Ex. 2 (17 Numbers: 78, 21, 14..30, 21, m = 5)',
        badge: 'Slide Example',
        description:
          'Complete 17-key numeric creation from Slides 72–83 (78, 21, 14, 11, 97, 85, 74, 63, 45, 42, 57, 20, 16, 19, 52, 30, 21), showing every overflow and the final 3-level split on 42!',
        inputSummary: 'Insert 78, 21, 14, 11, 97, 85, 74, 63, 45, 42, 57, 20, 16, 19, 52, 30, 21 (m = 5)',
        customInputDefaults: {
          keys: '78, 21, 14, 11, 97, 85, 74, 63, 45, 42, 57, 20, 16, 19, 52, 30, 21',
          order: '5',
        },
      },
      {
        id: 'bt-exam-2023',
        name: 'Winter 2023 MidTerm Q3: Create B-Tree (m = 5) with 20 Keys (19, 25..3)',
        badge: 'Past Exam',
        description:
          'Exact 20-point B-Tree creation question from Winter 2023 Midterm Q3, including the cascading root split on [6 | 12 | 16 | 19 | 24] → Root [16]!',
        inputSummary: 'Insert 19, 25, 24, 18, 16, 4, 26, 20, 12, 23, 6, 13, 17, 11, 5, 8, 1, 7, 14, 3 (m = 5)',
        customInputDefaults: {
          keys: '19, 25, 24, 18, 16, 4, 26, 20, 12, 23, 6, 13, 17, 11, 5, 8, 1, 7, 14, 3',
          order: '5',
        },
      },
      {
        id: 'bt-exam-2025',
        name: 'Fall 2025 MidTerm Q8: Insert 19, 56, 87, 42, 77 (m = 4)',
        badge: 'Past Exam',
        description: 'Exact 15-point B-Tree insertion trace from Fall 2025 Midterm Q8 (includes double split on 87!).',
        inputSummary: 'Initial Tree (m=4) + Insert [19, 56, 87, 42, 77]',
        customInputDefaults: { keys: 'fall2025-q8', order: '4' },
      },
      {
        id: 'bt-exam-2020',
        name: 'Fall 2020 MidTerm Q5: Delete E, R, M (m = 5)',
        badge: 'Past Exam',
        description: 'Exact B-Tree deletion trace from Fall 2020 Midterm Q5 (Borrowing & Internal Successor).',
        inputSummary: 'Initial Tree (m=5) + Delete E, Delete R, Delete M',
        customInputDefaults: { keys: 'fall2020-q5', order: '5' },
      },
      {
        id: 'bt-slide-del-1',
        name: 'Slides 95–108 Deletion Scenarios I–IV: Delete H, T, R, E (m = 5)',
        badge: 'Slide Example',
        description: 'All 4 deletion scenarios from Lecture 07 Slides 95–108 on the 20-letter B-Tree (Delete H, Delete T, Delete R, Delete E).',
        inputSummary: '20-Letter B-Tree (m=5) → Delete H, Delete T, Delete R, Delete E',
        customInputDefaults: { keys: 'slide-del-htre', order: '5' },
      },
    ],
    customFields: [
      {
        key: 'keys',
        label: 'Keys or Preset ("fall2025-q8", "fall2020-q5", or comma-separated keys)',
        placeholder: 'fall2025-q8',
        helpText: 'Type "fall2025-q8", "fall2020-q5", or your own sequence of keys (e.g. 10, 20, 30, 40, 50, 60).',
      },
      {
        key: 'order',
        label: 'B-Tree Order m',
        placeholder: '4',
        helpText: 'Order m defines Max Subtrees = m, Max Keys = m-1, Min Keys = ⌈m/2⌉ - 1.',
      },
    ],
    designParadigmName: 'Pre-Structuring (Multiway Balanced Disk Indexing)',
    designSteps: [
      {
        stepNumber: 1,
        title: 'Structural Properties of a B-Tree of Order m',
        subtitle: 'Lecture 07 Slides 8–11',
        content: [
          '1. Root is either a leaf or has between 2 and m children (1 to m-1 keys).',
          '2. Every internal/leaf node (except root) has between ⌈m/2⌉ and m children, and therefore between ⌈m/2⌉ - 1 and m - 1 keys.',
          '3. Perfectly balanced: all leaves are at the exact same level, because the tree grows bottom-up by splitting the root.',
        ],
        formulaBox: 'For Order m:  Min Keys = ⌈m / 2⌉ - 1  |  Max Keys = m - 1  |  Min Subtrees = ⌈m / 2⌉  |  Max Subtrees = m',
      },
      {
        stepNumber: 2,
        title: 'Insertion & Bottom-Up Splitting',
        subtitle: 'Lecture 07 Slides 20–32',
        content: [
          'Always search down to the appropriate leaf node.',
          'If the leaf has room (< m - 1 keys), insert in sorted order.',
          'If the leaf overflows (reaches m keys), split the node in half at ⌈m/2⌉ and push the median key up to the parent node. If the parent also overflows, split recursively up to the root.',
        ],
      },
      {
        stepNumber: 3,
        title: 'The 4 Deletion Scenarios',
        subtitle: 'Lecture 07 Slides 95–108 & Fall 2020 Midterm Q5',
        content: [
          'Scenario I: Key is in a leaf with > ⌈m/2⌉ - 1 keys → simply remove it.',
          'Scenario II: Key is in an internal node → replace it with its inorder successor (smallest key in right subtree leaf), then handle the leaf.',
          'Scenario III: Leaf underflows (< ⌈m/2⌉ - 1 keys) and an adjacent sibling has an extra key → borrow via the common parent (parent key moves down, sibling key moves up).',
          'Scenario IV: Neither sibling has an extra key → combine (merge) the leaf, its sibling, and their common parent separator key into a single node.',
        ],
      },
    ],
    designChallenge: {
      scenarioTitle: 'Exam Check: B-Tree Order Bounds & Deletion Rules',
      problemStatement:
        'Suppose you are working with a B-Tree of order m = 5 (as in Fall 2020 Midterm Q5 and Lecture 07 Slide 11).',
      questions: [
        {
          prompt: 'For a B-Tree of order m = 5, what are the minimum and maximum number of keys allowed in any non-root node?',
          options: [
            'Min keys = 2, Max keys = 4',
            'Min keys = 3, Max keys = 5',
            'Min keys = 1, Max keys = 4',
          ],
          correctIndex: 0,
          explanation:
            'Min keys = ⌈5/2⌉ - 1 = 3 - 1 = 2. Max keys = m - 1 = 5 - 1 = 4 (Lecture 07 Slide 11).',
        },
        {
          prompt: 'When deleting a key from a leaf that currently has exactly 2 keys (in an m = 5 B-Tree) and its right sibling has 3 keys, which scenario applies?',
          options: [
            'Scenario III: Move the common parent key down into the underflowing leaf and move the smallest key of the right sibling up to the parent',
            'Scenario IV: Merge both leaves and the parent key into a single 5-key node',
            'Scenario I: Simply delete the key and leave 1 key in the leaf',
          ],
          correctIndex: 0,
          explanation:
            'Because the right sibling has 3 keys (> Min 2), it has a spare key. We rotate through the common parent (Scenario III).',
        },
      ],
    },
    analysis: {
      bestTime: 'Θ(1) [Key in root]',
      avgTime: 'Θ(log_m n)',
      worstTime: 'O(log_{⌈m/2⌉} n) disk page accesses [h + 1 nodes accessed]',
      extraSpace: 'Θ(n) index nodes',
      tradeOffSummary:
        'Uses extra index nodes and pointers (Pre-Structuring) so that a tree of millions of keys has height h ≤ 3, requiring at most h + 1 disk page reads!',
      basicOperation: 'Disk node (page) access along root-to-leaf path',
      inputSizeParam: 'n (total number of keys), m (B-Tree order), h (height of B-Tree)',
      summationSteps: [
        {
          label: '1. Minimum Nodes & Keys per Level i (Lecture 07 Slides 131–133)',
          math: 'Level 0 (Root): 1 node, 1 key  |  Level i (i ≥ 1): 2·⌈m/2⌉^{i-1} nodes,  2·⌈m/2⌉^{i-1}·(⌈m/2⌉ - 1) keys',
          note: 'Root has at least 1 key and 2 children; every other node has at least ⌈m/2⌉ children.',
        },
        {
          label: '2. Sum Minimum Keys Across Levels 0 to h',
          math: 'n ≥ 1 + 2(⌈m/2⌉ - 1) ∑_{i=1}^{h} ⌈m/2⌉^{i-1} = 2·⌈m/2⌉^h - 1',
          note: 'Geometric series summation simplifies to 2·⌈m/2⌉^h - 1 (or 4·⌈m/2⌉^{h-1} - 1 when leaves hold data).',
        },
        {
          label: '3. Solve for Height Upper Bound h (Slide 134)',
          math: 'h ≤ ⌊ log_{⌈m/2⌉} ((n + 1) / 2) ⌋  ⇒  Search accesses h + 1 ∈ O(log n) nodes',
          note: 'Demonstrates logarithmic worst-case search, insertion, and deletion.',
        },
      ],
      comparisonTable: {
        headers: ['Level i', 'Min # of Nodes', 'Min # of Keys (c = ⌈m/2⌉)'],
        rows: [
          ['0 (Root)', '1', '1'],
          ['1', '2', '2(c - 1)'],
          ['2', '2c', '2c(c - 1)'],
          ['3', '2c²', '2c²(c - 1)'],
          ['i', '2c^{i-1}', '2c^{i-1}(c - 1)'],
        ],
      },
    },
  },
];
