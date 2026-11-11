import React, { useState, useEffect } from 'react';
import type { AlgorithmMeta, ModuleCategory } from '../types/algorithm';
import {
  Compass,
  Layers,
  Database,
  GitBranch,
  CheckCircle2,
  XCircle,
  Sparkles,
  BookOpen,
  Code2,
  HelpCircle,
  RotateCcw,
  ArrowRight,
  Table,
  Cpu,
} from 'lucide-react';

interface DesignViewProps {
  algorithm: AlgorithmMeta;
}

interface ParadigmBlueprintStep {
  stepNumber: number;
  title: string;
  subtitle: string;
  bullets: string[];
  formulaTemplate: string;
  pseudocodeTemplate: string;
}

interface ParadigmMasterData {
  id: ModuleCategory;
  badge: string;
  title: string;
  subtitle: string;
  coreIdea: string;
  whenToUseOnExam: string[];
  tradeOffEquation: string;
  blueprintTitle: string;
  steps: ParadigmBlueprintStep[];
  patternMatrixTitle: string;
  patternMatrixHeaders: string[];
  patternMatrixRows: string[][];
  workshopTitle: string;
  workshopScenario: string;
  workshopQuestions: {
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

const PARADIGM_MASTER_DATA: Record<ModuleCategory, ParadigmMasterData> = {
  'input-enhancement': {
    id: 'input-enhancement',
    badge: 'Core Concept 1 (Lectures 01–04)',
    title: 'Space-for-Time: Input Enhancement (Preprocessing)',
    subtitle:
      'Preprocess the problem input (in whole or in part) and store extracted information in an auxiliary table to accelerate the main execution phase.',
    coreIdea:
      'Instead of repeatedly re-scanning the input from scratch on every comparison or mismatch, spend a small upfront preprocessing step to build a lookup table (counts, cumulative distributions, or character shift distances).',
    whenToUseOnExam: [
      'Sorting without swaps when keys come from a small known range [l..u] or when you want to count smaller elements directly.',
      'Searching for a pattern P[0..m-1] inside a long text T[0..n-1] where mismatches allow skipping multiple characters at once.',
      'Any exam problem that asks you to "precompute an auxiliary array/table from the input to answer queries or place elements in O(1) per step."',
    ],
    tradeOffEquation:
      'Extra Space: Θ(n) or Θ(|Σ| + m) Auxiliary Table  ⇒  Saves Redundant Comparisons (Up to O(n/m) Best/Avg in String Matching, Θ(n) in Distribution Sort)',
    blueprintTitle: 'The 4-Step Input Enhancement Design Blueprint',
    steps: [
      {
        stepNumber: 1,
        title: 'Step 1: Identify Redundant Work in Brute Force',
        subtitle: 'Spot what information is being recomputed over and over',
        bullets: [
          'In Brute Force String Matching, a mismatch shifts the pattern by only 1 position even when the mismatched text character does not appear in the pattern at all.',
          'In sorting, standard comparison sorts move elements repeatedly instead of computing each element’s final destination index directly.',
          'Design Goal: Capture this structural property of the input once before the main loop starts.',
        ],
        formulaTemplate:
          'Brute Force Shift = 1 (always)\nInput-Enhanced Shift = t(c) or max(d₁, d₂) ≥ 1',
        pseudocodeTemplate:
          '// Ask: What property of input A[] or pattern P[0..m-1]\n// can be tabulated in advance so the main loop does O(1) lookups?',
      },
      {
        stepNumber: 2,
        title: 'Step 2: Define the Auxiliary Preprocessing Table',
        subtitle: 'Choose the exact table size, index domain, and meaning of each cell',
        bullets: [
          'Comparison Counting: Array Count[0..n-1] where Count[i] stores the number of elements strictly smaller than A[i].',
          'Distribution Counting: Frequency/Distribution array D[0..u-l] where D[j] stores the cumulative count of elements ≤ (l + j).',
          'Horspool: Shift table Table[0..|Σ|-1] indexed by alphabet character c, storing distance from the rightmost occurrence of c in P[0..m-2] to P[m-1].',
          'Boyer-Moore: Two tables — Bad-symbol table t₁(c) and Good-suffix table d₂(k) for 1 ≤ k < m.',
        ],
        formulaTemplate:
          'Horspool Shift Formula:\nt(c) = m  (if c is not among first m - 1 characters of P)\nt(c) = m - 1 - j  (where j is rightmost index in 0..m-2 with P[j] == c)',
        pseudocodeTemplate:
          'Algorithm ShiftTable(P[0..m-1])\n  for i ← 0 to size - 1 do Table[i] ← m\n  for j ← 0 to m - 2 do Table[P[j]] ← m - 1 - j\n  return Table',
      },
      {
        stepNumber: 3,
        title: 'Step 3: Populate the Preprocessing Table in One Pass',
        subtitle: 'Keep preprocessing fast — linear in pattern length m or range (u - l)',
        bullets: [
          'For Distribution Counting, initialize D[0..u-l] ← 0, count frequencies D[A[i] - l]++, then compute running sums D[j] ← D[j-1] + D[j].',
          'For Horspool, initialize all alphabet entries to m, then scan j from 0 to m - 2 left-to-right so later occurrences overwrite earlier ones (excluding the last character P[m-1]).',
          'For Boyer-Moore Good-Suffix d₂(k), for each suffix of length k (1 ≤ k < m), find the rightmost occurrence of that suffix not preceded by the same character, or match the longest prefix of P.',
        ],
        formulaTemplate:
          'Cumulative Distribution:\nD[0] = freq[0]\nD[j] = D[j - 1] + freq[j]   for j = 1 .. (u - l)',
        pseudocodeTemplate:
          'for j ← 0 to u - l do D[j] ← 0\nfor i ← 0 to n - 1 do D[A[i] - l] ← D[A[i] - l] + 1\nfor j ← 1 to u - l do D[j] ← D[j - 1] + D[j]',
      },
      {
        stepNumber: 4,
        title: 'Step 4: Execute the Main Algorithm Using O(1) Table Lookups',
        subtitle: 'Use the precomputed table to jump or place elements directly',
        bullets: [
          'In Distribution Counting Sort, scan input A from right to left (i = n - 1 down to 0) to preserve stability, placing A[i] at S[D[A[i] - l] - 1] and decrementing D[A[i] - l].',
          'In Horspool, align pattern at right end i, compare right-to-left (k = 0..m-1), and on mismatch jump i ← i + Table[T[i]] (always using T[i], the text character aligned with P[m-1]).',
          'In Boyer-Moore, after matching k > 0 suffix characters, compute d₁ = max(t₁(c) - k, 1) where c is the mismatched text character T[i - k], and shift by d = max(d₁, d₂(k)).',
        ],
        formulaTemplate:
          'Boyer-Moore Combined Shift (when 0 < k < m):\nd₁ = max(t₁(T[i - k]) - k, 1)\nd  = max(d₁, d₂(k))',
        pseudocodeTemplate:
          'while i ≤ n - 1 do\n  k ← 0\n  while k ≤ m - 1 and P[m - 1 - k] == T[i - k] do k ← k + 1\n  if k == m return i - m + 1\n  else i ← i + Table[T[i]] // Horspool O(1) lookup',
      },
    ],
    patternMatrixTitle: 'How Input Enhancement Applies Across Course Algorithms',
    patternMatrixHeaders: [
      'Algorithm',
      'Auxiliary Table Stored',
      'Table Size (Extra Space)',
      'Core Formula / Rule',
      'Main Phase Speedup',
    ],
    patternMatrixRows: [
      [
        'Comparison Counting Sort',
        'Count[0..n-1]',
        'Θ(n) + S[0..n-1]',
        'If A[i] < A[j] then Count[j]++ else Count[i]++',
        'Direct final placement S[Count[i]] ← A[i]',
      ],
      [
        'Distribution Counting Sort',
        'Frequency & Cumulative D[0..u-l]',
        'Θ(u - l) + S[0..n-1]',
        'D[j] = D[j-1] + D[j]; S[D[j]-1] ← A[i]',
        'Linear Θ(n + (u - l)) time with zero key-to-key comparisons',
      ],
      [
        'Horspool’s Algorithm',
        'Bad-Symbol Shift Table t(c)',
        'Θ(|Σ|)',
        't(c) = m - 1 - j (rightmost in P[0..m-2]); Shift by t(T[i])',
        'Average Θ(n) (often sublinear O(n/m) comparisons)',
      ],
      [
        'Boyer-Moore Algorithm',
        't₁(c) (size |Σ|) + d₂(1..m-1)',
        'Θ(|Σ| + m)',
        'd₁ = max(t₁(c) - k, 1); d = max(d₁, d₂(k))',
        'Maximizes skip using both bad-symbol and good-suffix rules',
      ],
    ],
    workshopTitle: 'Interactive Input Enhancement Design Workshop',
    workshopScenario:
      'Practice designing an Input Enhancement algorithm from scratch: choosing the right preprocessing table, formulating the shift/distribution rule, and avoiding classic exam traps.',
    workshopQuestions: [
      {
        prompt:
          'Suppose you need to sort n = 1,000,000 student grades where every grade is an integer between 50 and 100, and stability (preserving original order of equal grades) is required. How should you design the Input Enhancement algorithm?',
        options: [
          'Use Comparison Counting Sort with Count[0..n-1] in Θ(n²) time.',
          'Use Distribution Counting Sort with D[0..50] (size u - l + 1 = 51) and place elements scanning i from n - 1 down to 0.',
          'Use Distribution Counting Sort scanning i from 0 to n - 1 left-to-right.',
          'Build a Horspool shift table of size 51.',
        ],
        correctIndex: 1,
        explanation:
          'Because the keys come from a small fixed integer range [l..u] = [50..100], Distribution Counting Sort uses an auxiliary array D[0..50] of size 51, running in Θ(n) time. Scanning i from n - 1 down to 0 guarantees stability!',
      },
      {
        prompt:
          'When designing the Horspool shift table t(c) for pattern P = "GCAGAG" (m = 6), why must the loop that populates Table[P[j]] stop at j = m - 2 (index 4) instead of j = m - 1 (index 5)?',
        options: [
          'Because P[m - 1] is never compared with the text.',
          'Because if P[m - 1] were included, Table[P[m - 1]] would become m - 1 - (m - 1) = 0, causing an infinite loop (shift of 0)!',
          'Because Horspool uses 1-based indexing.',
          'To save 1 byte of memory in the shift table.',
        ],
        correctIndex: 1,
        explanation:
          'If j = m - 1 were included, t(P[m-1]) would be 0. Instead, P[m-1] only gets a shift < m if it also appears earlier in P[0..m-2] (for "GCAGAG", "G" appears at index 3, so t("G") = 6 - 1 - 3 = 2).',
      },
      {
        prompt:
          'What is the exact difference between how Horspool and Boyer-Moore look up the bad-symbol table when a mismatch occurs after k > 0 matched suffix characters?',
        options: [
          'Horspool always looks up T[i] (the text char aligned with P[m-1]), whereas Boyer-Moore looks up T[i - k] (the actual mismatched text char) and subtracts k: d₁ = max(t₁(T[i - k]) - k, 1).',
          'Horspool looks up T[i - k] and Boyer-Moore looks up T[i].',
          'Both algorithms always shift by t(T[i]) - k.',
          'Boyer-Moore only uses the bad-symbol table when k = m.',
        ],
        correctIndex: 0,
        explanation:
          'In Horspool, the shift is always Table[T[i]] regardless of k. In Boyer-Moore, c = T[i - k] is the mismatched character in the text, so d₁ = max(t₁(c) - k, 1), which is then compared against the good-suffix shift d₂(k).',
      },
    ],
  },

  'pre-structuring': {
    id: 'pre-structuring',
    badge: 'Core Concept 2 (Lectures 05–06)',
    title: 'Space-for-Time: Pre-Structuring (Hashing & B-Trees)',
    subtitle:
      'Use extra space to organize data into an access-optimized auxiliary structure so that search, insertion, and deletion avoid sequential scanning.',
    coreIdea:
      'Instead of storing records in a plain unsorted array (requiring Θ(n) search) or a sorted array (requiring Θ(n) shifts on insertion), pre-structure the key space using a Hash Function h(K) or a multiway balanced B-Tree index.',
    whenToUseOnExam: [
      'Fast O(1) average-case dictionary operations (Search, Insert, Delete) in main memory → Use Open Hashing (Separate Chaining) or Closed Hashing (Linear Probing).',
      'Large databases stored on disk where reading a disk block/page is expensive and range queries + guaranteed O(log n) worst-case performance are required → Use a B-Tree of order m.',
      'Choosing between Open vs. Closed Hashing when the number of keys n can exceed table size m (load factor α = n/m > 1).',
    ],
    tradeOffEquation:
      'Extra Space for Buckets / Pointers / Index Nodes  ⇒  Reduces Search Time from Θ(n) to Θ(1) Avg (Hashing) or Θ(log_m n) Worst-Case (B-Tree)',
    blueprintTitle: 'The 4-Step Pre-Structuring Design Blueprint',
    steps: [
      {
        stepNumber: 1,
        title: 'Step 1: Select the Access Model (Hash Table vs. Multiway Search Tree)',
        subtitle: 'Match the data structure to the storage medium and query type',
        bullets: [
          'If only exact-match lookups (K == target) are needed in RAM: choose Hashing with h(K) = K mod m.',
          'If ordered traversal, range queries, or disk page indexing are needed: choose a B-Tree of order m where every node packs up to m - 1 sorted keys.',
          'Choose m to be a prime number for Hash Tables to distribute keys uniformly across [0..m-1].',
        ],
        formulaTemplate:
          'Hash Function:   h(K) = K mod m   (produces index in 0 .. m - 1)\nLoad Factor:     α = n / m        (n = number of keys, m = table size)',
        pseudocodeTemplate:
          '// Design Choice:\n// Exact key lookup in RAM  -> Hash Table T[0..m-1]\n// Disk-based ordered index -> B-Tree of order m',
      },
      {
        stepNumber: 2,
        title: 'Step 2: Design the Collision Resolution or Node Capacity Rules',
        subtitle: 'Define how multiple keys sharing a location or page are handled',
        bullets: [
          'Open Hashing (Separate Chaining): Each cell T[0..m-1] is a header pointer to a linked list of keys that hash to h(K). Load factor α = n/m can be > 1.',
          'Closed Hashing (Open Addressing / Linear Probing): All keys are stored directly inside T[0..m-1] (requires α ≤ 1). On collision at h(K), probe sequentially: (h(K) + i) mod m for i = 1, 2, ...',
          'B-Tree of Order m: Root has 1 .. m-1 keys (2 .. m children if not a leaf). All non-root internal nodes have ⌈m/2⌉ - 1 .. m - 1 keys (⌈m/2⌉ .. m children). All leaves are at the exact same depth.',
        ],
        formulaTemplate:
          'Linear Probing Sequence:    probe(K, i) = (h(K) + i) mod m\nQuadratic Probing Sequence: probe(K, i) = (h(K) + i²) mod m\nB-Tree Non-Root Keys J:     ⌈m/2⌉ - 1  ≤  J  ≤  m - 1',
        pseudocodeTemplate:
          '// Closed Hashing (Linear Probing) Insert(K):\ni ← h(K)\nwhile T[i] is occupied do\n  i ← (i + 1) mod m\nT[i] ← K',
      },
      {
        stepNumber: 3,
        title: 'Step 3: Maintain Structural Invariants During Insert & Delete',
        subtitle: 'Prevent broken probe chains in Hashing and maintain balance in B-Trees',
        bullets: [
          'In Closed Hashing, deleting a key cannot simply leave an empty cell (which would break future searches for keys that probed past it); mark the slot as DELETED (lazy deletion).',
          'In B-Tree Insertion: Always insert into the appropriate leaf. If the leaf overflows (reaches m keys), split it at the median key ⌈m/2⌉ and promote that median key to the parent node (recursively up to the root).',
          'In B-Tree Deletion: If deleting from an internal node, replace the key with its inorder predecessor (largest key in left subtree). If a leaf underflows (< ⌈m/2⌉ - 1 keys), borrow/rotate via the parent from a sibling, or merge with a sibling and pull down the parent separator key.',
        ],
        formulaTemplate:
          'B-Tree Overflow Split (at m keys):\nLeft Node gets first ⌈m/2⌉ - 1 keys | Median key promoted to Parent | Right Node gets remaining keys',
        pseudocodeTemplate:
          'if leaf.keyCount == m then // Overflow!\n  median ← leaf.keys[⌈m/2⌉ - 1]\n  split leaf into Left and Right around median\n  promote median into Parent (split Parent if needed)',
      },
      {
        stepNumber: 4,
        title: 'Step 4: Tune Load Factor α or Tree Order m for Target Performance',
        subtitle: 'Quantify expected probes or worst-case disk accesses',
        bullets: [
          'In Open Hashing, keep α ≈ 1 so successful search takes S ≈ 1 + α/2 ≈ 1.5 comparisons and unsuccessful takes U = α ≈ 1.',
          'In Linear Probing, keep α ≤ 0.7 to avoid primary clustering (where S ≈ ½(1 + 1/(1 - α)) and U ≈ ½(1 + 1/(1 - α)²)).',
          'In B-Trees, choose order m so one node fits in one disk page (e.g. 4 KB), keeping height h ≤ ⌊log_⌈m/2⌉((n + 1)/2)⌋ + 1 ≤ 3 or 4 levels even for millions of keys.',
        ],
        formulaTemplate:
          'Open Hashing Avg Probes:   S ≈ 1 + α/2,          U = α\nLinear Probing Avg Probes: S ≈ ½(1 + 1/(1-α)),   U ≈ ½(1 + 1/(1-α)²)',
        pseudocodeTemplate:
          '// B-Tree Minimum Keys at Level L (Root = Level 1):\n// Level 1 (Root): min 1 key\n// Level 2:        min 2 * (⌈m/2⌉ - 1) keys\n// Level 3:        min 2 * ⌈m/2⌉ * (⌈m/2⌉ - 1) keys',
      },
    ],
    patternMatrixTitle: 'Pre-Structuring Architecture Comparison Matrix',
    patternMatrixHeaders: [
      'Structure',
      'Where Keys Live',
      'Load Factor / Capacity',
      'Collision / Overflow Handling',
      'Search Complexity',
    ],
    patternMatrixRows: [
      [
        'Open Hashing (Separate Chaining)',
        'Linked list nodes outside T[0..m-1]',
        'α = n / m (can be > 1)',
        'Append/insert key into bucket linked list at h(K)',
        'Avg Θ(1 + α), Worst Θ(n)',
      ],
      [
        'Closed Hashing (Linear Probing)',
        'Directly inside array T[0..m-1]',
        'α = n / m ≤ 1 (must not exceed 1)',
        'Probe (h(K) + i) mod m; suffers from primary clustering',
        'Avg Θ(1) for α < 0.7, Worst Θ(n)',
      ],
      [
        'Closed Hashing (Quadratic / Double)',
        'Directly inside array T[0..m-1]',
        'α = n / m ≤ 1',
        'Probe (h(K) + i²) mod m or (h₁(K) + i·h₂(K)) mod m',
        'Reduces clustering; Avg Θ(1)',
      ],
      [
        'B-Tree Index (Order m)',
        'Sorted arrays inside balanced multiway nodes',
        '⌈m/2⌉ - 1 to m - 1 keys per non-root node',
        'Split node on m keys & promote median; grow at root',
        'Guaranteed Θ(log n) in both Avg & Worst case',
      ],
    ],
    workshopTitle: 'Interactive Pre-Structuring Design Workshop',
    workshopScenario:
      'Test your ability to choose and configure Hashing and B-Tree structures for exam design questions.',
    workshopQuestions: [
      {
        prompt:
          'You are designing a Hash Table of size m = 13, but the number of keys n is unpredictable and may grow to n = 30 before a table resize is possible. Which Pre-Structuring scheme MUST you choose?',
        options: [
          'Closed Hashing with Linear Probing, because α = 30/13 = 2.31 > 1 is supported.',
          'Open Hashing (Separate Chaining), because keys are stored in linked lists attached to the 13 buckets, so α = n/m > 1 works without running out of array slots.',
          'Closed Hashing with Double Hashing.',
          'Comparison Counting Sort.',
        ],
        correctIndex: 1,
        explanation:
          'Closed Hashing stores keys directly inside the array T[0..m-1], so it fails completely when n > m (α > 1). Open Hashing (Separate Chaining) uses dynamic linked lists per bucket and gracefully handles α > 1.',
      },
      {
        prompt:
          'You are designing a B-Tree of order m = 5 to index a database file. What are the exact minimum and maximum number of keys allowed in any non-root internal node?',
        options: [
          'Minimum 1 key, Maximum 5 keys',
          'Minimum ⌈5/2⌉ - 1 = 2 keys (3 children), Maximum 5 - 1 = 4 keys (5 children)',
          'Minimum 3 keys, Maximum 5 keys',
          'Minimum 2 keys, Maximum 6 keys',
        ],
        correctIndex: 1,
        explanation:
          'For a B-Tree of order m, every non-root node must have at least ⌈m/2⌉ - 1 keys and at most m - 1 keys. For m = 5, ⌈5/2⌉ - 1 = 3 - 1 = 2 minimum keys, and 5 - 1 = 4 maximum keys.',
      },
      {
        prompt:
          'In Closed Hashing with Linear Probing, what happens if you implement Delete(K) by simply setting T[idx] = EMPTY (null)?',
        options: [
          'It speeds up future searches without any issues.',
          'It breaks future Search(K₂) operations for any key K₂ that collided earlier and probed past idx, causing Search(K₂) to stop prematurely and falsely report "Not Found"!',
          'It causes an overflow in the hash function.',
          'It converts the table into Open Hashing.',
        ],
        correctIndex: 1,
        explanation:
          'Linear Probing stops searching as soon as it hits an EMPTY slot. If a slot in the middle of a probe chain is cleared to EMPTY instead of a special DELETED (tombstone) marker, keys further down the probe chain become unreachable!',
      },
    ],
  },

  'dynamic-programming': {
    id: 'dynamic-programming',
    badge: 'Core Concept 3 (Lectures 07–14)',
    title: 'Dynamic Programming: The 4-Step Optimal Substructure Framework',
    subtitle:
      'Solve optimization and counting problems with overlapping subproblems by characterizing optimal substructure, writing a recurrence relation, filling a table (Bottom-Up or Memory Function), and backtracking.',
    coreIdea:
      'Top-down divide-and-conquer recomputes the exact same subproblems exponentially many times. Dynamic Programming solves each distinct subproblem only ONCE and records its answer in a table.',
    whenToUseOnExam: [
      'Optimization problems (minimum cost, maximum profit, longest subsequence, shortest path) where making a choice leaves smaller subproblems of the exact same type.',
      '1. Optimal Substructure: An optimal solution to the problem contains within it optimal solutions to subproblems.',
      '2. Overlapping Subproblems: A recursive algorithm visits the same small subproblems repeatedly rather than generating brand-new disjoint ones.',
    ],
    tradeOffEquation:
      'Extra Space: 1D or 2D DP Table (Θ(n), Θ(nW), or Θ(n²))  ⇒  Reduces Exponential O(2ⁿ) Recursion to Polynomial Time (Θ(n), Θ(nW), Θ(nm), or Θ(n³))',
    blueprintTitle: 'The 4-Step Dynamic Programming Design Blueprint (Used for Every DP Problem)',
    steps: [
      {
        stepNumber: 1,
        title: 'Step 1: Characterize the Structure of an Optimal Solution',
        subtitle: 'Define what a subproblem represents and how the final decision splits it',
        bullets: [
          'Ask: "What is the LAST decision made in an optimal solution, and what smaller subproblem(s) remain after that decision?"',
          '1D Prefix Subproblem (Coin-Row, Change-Making, Assembly Line): Subproblem of size i is the first i items/stations or amount i. Decision: include item i (jump to i-2 or i-d_j) or exclude item i (jump to i-1).',
          '2D Prefix/Capacity Subproblem (LCS, Robot Coin Collecting, 0/1 Knapsack): Subproblem (i, j) pairs prefix X[1..i] with Y[1..j], cell (i, j), or first i items with capacity j.',
          '2D Interval/Subchain Subproblem (Matrix Chain Multiplication, OBST): Subproblem (i, j) is a contiguous subchain A_i..A_j or keys k_i..k_j. Decision: pick split point k (i ≤ k ≤ j) that divides (i..j) into two independent sub-intervals.',
        ],
        formulaTemplate:
          '4 Common Subproblem Shapes in CPCS-324:\n• 1D Prefix:     F[i]       (i = 0..n)\n• 2D Grid/Knap:  F[i, j]    (i = 0..n, j = 0..W or m)\n• 2D Diagonal:   m[i, j]    (1 ≤ i ≤ j ≤ n, filled by chain length l = j - i + 1)\n• k-Stage Graph: R^(k)[i,j] / D^(k)[i,j] (intermediate vertices ≤ k)',
        pseudocodeTemplate:
          '// Step 1 Checklist on the Exam:\n// 1. State clearly what Table[i] or Table[i, j] represents in English.\n// 2. Identify the choices available at state (i, j).\n// 3. Show why the remaining subproblem must also be optimal (Cut-and-Paste argument).',
      },
      {
        stepNumber: 2,
        title: 'Step 2: Recursively Define the Value of an Optimal Solution',
        subtitle: 'Write the mathematical Recurrence Relation + Base Cases',
        bullets: [
          'Always write the Base Case(s) first (e.g., F[0] = 0, c[i,0] = c[0,j] = 0, m[i,i] = 0, C[i, i-1] = 0).',
          'For each choice at step (i, j), express the total cost/value as: (Immediate Cost of Choice) + (Optimal Value of Remaining Subproblem(s)).',
          'Wrap all valid choices in min{ ... } (for minimization like MCM, OBST, Change-Making, Assembly Line, Floyd) or max{ ... } (for maximization like LCS, Knapsack, Coin-Row, Robot Coin Collecting).',
        ],
        formulaTemplate:
          'Include / Exclude Pattern (0/1 Knapsack & Coin-Row):\nF[i, j] = max( F[i-1, j],  v_i + F[i-1, j - w_i] )   if j ≥ w_i\n\nInterval Split Pattern (MCM & OBST):\nm[i, j] = min_{i ≤ k < j} { m[i, k] + m[k+1, j] + p_{i-1} p_k p_j }\nC[i, j] = min_{i ≤ k ≤ j} { C[i, k-1] + C[k+1, j] } + ∑_{s=i}^j p_s',
        pseudocodeTemplate:
          '// Always state BOTH parts in Step 2:\n// 1. Base Case:   Table[0] = 0  (or Table[i, i] = 0)\n// 2. Recurrence:  Table[i, j] = max/min over valid choices { ... }',
      },
      {
        stepNumber: 3,
        title: 'Step 3: Compute the Value of an Optimal Solution (Bottom-Up vs. Memory Function)',
        subtitle: 'Design the table filling order so every needed subproblem is already solved',
        bullets: [
          'Row-by-Row / Left-to-Right Order: Used when (i, j) depends on (i-1, j), (i, j-1), or (i-1, j-1) (LCS, Knapsack, Robot Coin Collecting).',
          'Diagonal Filling Order (by length l = 2..n): REQUIRED for Matrix Chain Multiplication and OBST because (i, j) depends on shorter subchains (i, k) to its left and (k+1, j) below it!',
          'Top-Down Memory Function (MFKnapsack): Initialize table F[1..n, 1..W] to -1 (and row 0 / col 0 to 0). Before computing F[i, j] recursively, check `if F[i, j] < 0`. Combines top-down (solves ONLY needed subproblems) with bottom-up (solves each at most once).',
        ],
        formulaTemplate:
          'Bottom-Up Diagonal Loop (MCM / OBST):\nfor l ← 2 to n do          // chain length\n  for i ← 1 to n - l + 1 do\n    j ← i + l - 1\n    for k ← i to j - 1 do  // split point',
        pseudocodeTemplate:
          'Algorithm MFKnapsack(i, j)\n  if F[i, j] < 0 then\n    if j < Weights[i] then value ← MFKnapsack(i - 1, j)\n    else value ← max(MFKnapsack(i - 1, j), Values[i] + MFKnapsack(i - 1, j - Weights[i]))\n    F[i, j] ← value\n  return F[i, j]',
      },
      {
        stepNumber: 4,
        title: 'Step 4: Construct the Optimal Solution from Computed Information',
        subtitle: 'Backtrack through the decision table (s, b, l, or R) to print the actual items/structure',
        bullets: [
          'Step 3 gives the optimal VALUE (e.g., min multiplications = 7000, max LCS length = 4, max Knapsack profit = $65). Step 4 reconstructs the optimal CHOICES that achieved that value.',
          'Either record the winning choice in a companion table during Step 3 (`s[i,j] ← k` in MCM, `b[i,j] ← "↖/↑/←"` in LCS, `l_i[j]` in Assembly Line, `R[i,j] ← k` in OBST) or backtrack directly inside `F[i,j]`.',
          'Write a recursive printing procedure (`POP(s, i, j)`, `PRINT-LCS(b, X, i, j)`, `Print-Stations(l, n)`) that traces from the final cell back to the base cases.',
        ],
        formulaTemplate:
          'Backtracking Examples:\n• MCM:  POP(s, i, j) → "(" + POP(s, i, s[i,j]) + POP(s, s[i,j]+1, j) + ")"\n• LCS:  If b[i,j] == "↖", print X[i] after recursing on (i-1, j-1)\n• OBST: Root of subtree (i..j) is k = R[i, j]; Left is (i..k-1), Right is (k+1..j)',
        pseudocodeTemplate:
          'Algorithm POP(s, i, j)\n  if i == j then print "A" + i\n  else\n    print "("\n    POP(s, i, s[i, j])\n    POP(s, s[i, j] + 1, j)\n    print ")"',
      },
    ],
    patternMatrixTitle: 'Master Dynamic Programming Pattern Reference (Lectures 07–14)',
    patternMatrixHeaders: [
      'DP Problem',
      'Subproblem Table(s)',
      'Filling Order',
      'Core Recurrence Relation',
      'Step 4 Reconstruction',
    ],
    patternMatrixRows: [
      [
        'Assembly Line Scheduling',
        'f₁[1..n], f₂[1..n] & l₁[2..n], l₂[2..n]',
        'Station j = 1 to n (Left to Right)',
        'f₁[j] = min(f₁[j-1] + a_{1,j}, f₂[j-1] + t_{2,j-1} + a_{1,j})',
        'Trace l* then l_i[j] backward from j = n down to 2',
      ],
      [
        'Matrix Chain (MCM)',
        'Cost m[1..n, 1..n] & Split s[1..n, 1..n]',
        'Diagonal by chain length l = 2..n',
        'm[i,j] = min_{i≤k<j} {m[i,k] + m[k+1,j] + p_{i-1}p_kp_j}',
        'Recursive POP(s, 1, n) splitting at k = s[i,j]',
      ],
      [
        'Longest Common Subsequence',
        'Length c[0..m, 0..n] & Arrows b[1..m, 1..n]',
        'Row-by-row (i = 1..m, j = 1..n)',
        'If x_i==y_j: c[i-1,j-1]+1 (↖); else max(c[i-1,j] (↑), c[i,j-1] (←))',
        'PRINT-LCS(b, X, m, n) following ↖, ↑, ← arrows',
      ],
      [
        'Coin-Row Problem',
        'F[0..n]',
        'i = 1 to n (Left to Right)',
        'F[i] = max(C[i] + F[i-2], F[i-1]) with F[0]=0, F[1]=C[1]',
        'Backtrack from i = n: if C[i]+F[i-2] > F[i-1], pick coin i & jump to i-2',
      ],
      [
        'Change-Making Problem',
        'F[0..n] (min coins for amount i)',
        'i = 1 to n (Left to Right)',
        'F[i] = min_{j: i ≥ d_j} { F[i - d_j] } + 1, with F[0] = 0',
        'Subtract chosen denomination d_j repeatedly until amount = 0',
      ],
      [
        'Robot Coin Collecting',
        'F[1..n, 1..m]',
        'Row-by-row (i = 1..n, j = 1..m)',
        'F[i,j] = max(F[i-1, j], F[i, j-1]) + C[i, j]',
        'Trace from (n, m) to (1, 1) moving to larger of (i-1, j) or (i, j-1)',
      ],
      [
        '0/1 Knapsack & MFKnapsack',
        'F[0..n, 0..W] (Bottom-Up or -1 Memory Fn)',
        'Row-by-row OR Top-Down Memoized',
        'max(F[i-1, j], v_i + F[i-1, j - w_i]) if j ≥ w_i else F[i-1, j]',
        'If F[i,j] > F[i-1,j], include item i and move to (i-1, j - w_i)',
      ],
      [
        'Optimal BST (OBST)',
        'Cost C[1..n+1, 0..n] & Root R[1..n+1, 0..n]',
        'Diagonal by d = j - i = 1..n-1',
        'C[i,j] = min_{i≤k≤j} {C[i,k-1] + C[k+1,j]} + ∑_{s=i}^j p_s',
        'Root is k = R[1, n]; recursively build left R[1, k-1] & right R[k+1, n]',
      ],
      [
        'Warshall & Floyd',
        'R^(k)[1..n, 1..n] / D^(k)[1..n, 1..n]',
        'k = 1 to n matrices (in-place)',
        'Warshall: R[i,j] ∨ (R[i,k] ∧ R[k,j]) | Floyd: min(D[i,j], D[i,k]+D[k,j])',
        'Final matrix R^(n) gives transitive closure; D^(n) gives all-pairs shortest paths',
      ],
    ],
    workshopTitle: 'Interactive 4-Step Dynamic Programming Design Workshop',
    workshopScenario:
      'Practice applying the 4-Step DP Framework to design new recurrences, choose the right table filling order, and reconstruct optimal solutions.',
    workshopQuestions: [
      {
        prompt:
          'Why MUST Matrix Chain Multiplication (MCM) and Optimal Binary Search Tree (OBST) fill their 2D tables along the diagonals (by chain length l = j - i + 1) instead of standard row-by-row (i = 1..n, j = 1..n)?',
        options: [
          'Diagonal filling uses less memory than row-by-row filling.',
          'Because computing entry (i, j) requires entry (k+1, j) which lies in a LOWER row (row k+1 > i). In row-by-row order, row k+1 has not been computed yet when you are on row i!',
          'Because the matrices are symmetric.',
          'Because POP(s, 1, n) requires diagonal indexing.',
        ],
        correctIndex: 1,
        explanation:
          'In MCM and OBST, subproblem (i, j) depends on (i, k) [same row i, left column] AND (k+1, j) [lower row k+1, same column j]. Filling by increasing chain length (diagonal by diagonal) guarantees both shorter subproblems are already solved!',
      },
      {
        prompt:
          'What is the key design advantage of the Top-Down Memory Function approach (`MFKnapsack`) over standard Bottom-Up Dynamic Programming for the 0/1 Knapsack problem?',
        options: [
          'It eliminates the need for an auxiliary table F[0..n, 0..W].',
          'By initializing F[1..n, 1..W] to -1 and recursing from (n, W), it computes ONLY the subproblems that are actually needed for capacity W while still solving each subproblem at most once.',
          'It changes the worst-case time complexity from O(nW) to O(log n).',
          'It works without knowing the item weights.',
        ],
        correctIndex: 1,
        explanation:
          'Bottom-Up DP blindly fills every single cell in F[1..n, 1..W], including many capacities that are never needed to compute F[n, W]. The Memory Function initializes entries to -1 and evaluates only reachable states!',
      },
      {
        prompt:
          'Suppose a new exam problem asks for the minimum cost to paint n houses in a row where house i costs C[i] to paint, and you cannot leave two adjacent houses unpainted. How do you formulate Step 1 & Step 2 of the DP?',
        options: [
          'Define F[i] as min cost for first i houses; F[i] = C[i] + min(F[i-1], F[i-2]) with base cases F[0] = 0, F[1] = C[1].',
          'Use Horspool’s shift table on C[1..n].',
          'Use Warshall’s boolean matrix R^(k)[i, j].',
          'Define a 3D diagonal table of size n³.',
        ],
        correctIndex: 0,
        explanation:
          'By Optimal Substructure (Step 1), if house i is painted (cost C[i]), either house i-1 was painted (subproblem F[i-1]) or house i-1 was skipped so house i-2 had to be painted (subproblem F[i-2]). That directly yields the linear 1D recurrence F[i] = C[i] + min(F[i-1], F[i-2])!',
      },
    ],
  },

  greedy: {
    id: 'greedy',
    badge: 'Core Concept 4 (Lectures 15–18)',
    title: 'Greedy Techniques: Feasible, Locally Optimal & Irrevocable Choices',
    subtitle:
      'Construct a solution through a sequence of steps, each expanding a partially constructed solution by making the best immediate local choice without ever backtracking.',
    coreIdea:
      'Unlike Dynamic Programming (which solves all overlapping subproblems before committing), a Greedy algorithm makes one locally optimal choice at each step and reduces the problem to a single smaller state.',
    whenToUseOnExam: [
      'Minimum Spanning Tree (MST) on a connected weighted undirected graph → Use Prim’s Algorithm (expanding single tree V_T) or Kruskal’s Algorithm (expanding acyclic forest of sorted edges).',
      'Single-Source Shortest Paths on a weighted graph with non-negative weights → Use Dijkstra’s Algorithm with Priority Queue relaxation d_{u*} + w(u*, u) < d_u.',
      'Optimal Prefix-Free Data Compression → Use Huffman’s Algorithm to merge the two smallest-weight trees n - 1 times.',
    ],
    tradeOffEquation:
      'Priority Queue (Min-Heap) + Sorting  ⇒  O(|E| lg |V|) for Prim/Kruskal/Dijkstra & O(n lg n) for Huffman Coding',
    blueprintTitle: 'The 4-Step Greedy Algorithm Design Blueprint (Lectures 15–18)',
    steps: [
      {
        stepNumber: 1,
        title: 'Step 1: Verify the Three Greedy Choice Properties (Lecture 15 Slide 16)',
        subtitle: 'Every greedy step must be Feasible, Locally Optimal, and Irrevocable',
        bullets: [
          '1. Feasible: It must satisfy the problem’s constraints (e.g., Change + dᵢ ≤ N, edge does not create a cycle in E_T, prefix-free leaf property in Huffman).',
          '2. Locally Optimal: It has to be the best local choice among all feasible choices available on that step (e.g., lightest cut edge in Prim, lightest remaining edge in Kruskal, smallest d_u in Dijkstra, two smallest weights in Huffman).',
          '3. Irrevocable: Once made, it cannot be changed on subsequent steps of the algorithm.',
        ],
        formulaTemplate:
          'Greedy Choice = argmin / argmax over all FEASIBLE choices at the current step',
        pseudocodeTemplate:
          '// Check before applying Greedy:\n// Does the Locally Optimal choice always lead to a Globally Optimal solution?\n// Always TRUE for Prim, Kruskal, Dijkstra (w ≥ 0), and Huffman!\n// FALSE for general Coin Change (e.g. N=6, Coins={4,3,1}).',
      },
      {
        stepNumber: 2,
        title: 'Step 2: Preprocess / Initialize the Priority Queue or Sorted Order',
        subtitle: 'Organize candidates so the locally optimal choice can be extracted rapidly',
        bullets: [
          'Greedy Change-Making: Sort coins in decreasing order d₁ > d₂ > ... > dₖ.',
          'Kruskal’s Algorithm: Sort all |E| edges in nondecreasing order of weights w(e_{i₁}) ≤ ... ≤ w(e_{i_{|E|}}).',
          'Prim’s & Dijkstra’s Algorithms: Initialize V_T and a Min-Heap Priority Queue Q of fringe vertices keyed by edge weight w(v, u) (Prim) or cumulative distance d_u (Dijkstra).',
          'Huffman’s Algorithm: Initialize a Priority Queue Q of n one-node trees sorted by symbol frequency/probability.',
        ],
        formulaTemplate:
          'Prim Priority Key:     d_u = min_{v ∈ V_T} w(v, u)\nDijkstra Priority Key: d_u = min_{v ∈ V_T} (d_v + w(v, u))',
        pseudocodeTemplate:
          'Initialize(Q)\nfor every vertex v in V do\n  d_v ← ∞; p_v ← null; Insert(Q, v, d_v)\nd_s ← 0; Decrease(Q, s, d_s)',
      },
      {
        stepNumber: 3,
        title: 'Step 3: Iteratively Extract the Best Candidate & Update State',
        subtitle: 'Expand the partial solution |V| - 1 times (or n - 1 merges)',
        bullets: [
          'Prim: Extract u* with min cut edge e* = (v*, u*), add u* to V_T and e* to E_T, and update fringe neighbors.',
          'Kruskal: Pick next sorted edge e_{i_k} = (u, v); if Find(u) ≠ Find(v) (acyclic), add to E_T and Union(u, v).',
          'Dijkstra: Extract u* ← DeleteMin(Q), add to V_T, and relax every neighbor u ∈ V - V_T: if d_{u*} + w(u*, u) < d_u then update d_u and p_u.',
          'Huffman: Extract two smallest trees T_L and T_R, merge under new parent with weight(T_L) + weight(T_R), and re-insert into Q.',
        ],
        formulaTemplate:
          'Dijkstra Edge Relaxation:\nif d_{u*} + w(u*, u) < d_u then\n  d_u ← d_{u*} + w(u*, u);  p_u ← u*;  Decrease(Q, u, d_u)',
        pseudocodeTemplate:
          'for i ← 0 to |V| - 1 do\n  u* ← DeleteMin(Q)\n  V_T ← V_T ∪ {u*}\n  for every u ∈ V - V_T adjacent to u* do\n    if d_{u*} + w(u*, u) < d_u then\n      d_u ← d_{u*} + w(u*, u); p_u ← u*; Decrease(Q, u, d_u)',
      },
      {
        stepNumber: 4,
        title: 'Step 4: Extract Final Tree, Paths, or Prefix Codes',
        subtitle: 'Compute total MST weight, shortest paths from p_v, or Huffman compression ratio',
        bullets: [
          'MST (Prim & Kruskal): Sum weights of the |V| - 1 edges in E_T.',
          'Shortest Paths (Dijkstra): Follow parent pointers p_v backward from any target vertex v to source s.',
          'Huffman Coding: Label left branches 0 and right branches 1; compute L_avg = ∑ pᵢ·lᵢ and Compression Ratio = ((L_fixed - L_avg)/L_fixed) × 100%.',
        ],
        formulaTemplate:
          'Huffman Average Length: L_avg = ∑_{i=1..n} (pᵢ × length(codeᵢ))\nCompression Ratio:      ((L_fixed - L_avg) / L_fixed) × 100%   where L_fixed = ⌈log₂ n⌉',
        pseudocodeTemplate:
          '// Decoding a Huffman Bitstream:\n// Start at root of Huffman Tree; read bit (0=Left, 1=Right)\n// When a leaf is reached, output its symbol and reset to root!',
      },
    ],
    patternMatrixTitle: 'Master Greedy Algorithms Reference Matrix (Lectures 15–18)',
    patternMatrixHeaders: [
      'Greedy Algorithm',
      'Problem Solved',
      'Greedy Choice at Each Step',
      'Feasibility / Constraint Check',
      'Time Efficiency',
    ],
    patternMatrixRows: [
      [
        'Greedy Change-Making',
        'Coin change for amount N',
        'Pick largest coin dᵢ ≤ remaining amount',
        'Change + dᵢ ≤ N (Not always globally optimal!)',
        'O(k log k + N)',
      ],
      [
        'Prim’s Algorithm',
        'Minimum Spanning Tree (MST)',
        'Lightest cut edge (v*, u*) with v* ∈ V_T, u* ∈ V - V_T',
        'u* ∉ V_T (guarantees expanding single tree is acyclic)',
        'Θ(|V|²) (Matrix) or O(|E| lg |V|) (Min-Heap)',
      ],
      [
        'Kruskal’s Algorithm',
        'Minimum Spanning Tree (MST)',
        'Lightest remaining edge e_{i_k} in sorted E',
        'E_T ∪ {e_{i_k}} is acyclic (Find(u) ≠ Find(v))',
        'O(|E| lg |E|) = O(|E| lg |V|)',
      ],
      [
        'Dijkstra’s Algorithm',
        'Single-Source Shortest Paths (w ≥ 0)',
        'Extract u* ∈ V - V_T with minimum distance d_{u*}',
        'Non-negative edge weights; relax d_{u*} + w(u*, u) < d_u',
        'Θ(|V|²) (Matrix) or O(|E| lg |V|) (Min-Heap)',
      ],
      [
        'Huffman’s Algorithm',
        'Optimal Prefix-Free Binary Code',
        'Merge two trees T_L, T_R with smallest weights in Q',
        'Symbols placed only at leaves (Prefix-Free Property)',
        'O(n lg n)',
      ],
    ],
    workshopTitle: 'Interactive Greedy Techniques Design Workshop',
    workshopScenario:
      'Practice distinguishing between Greedy vs. DP, Prim vs. Kruskal, and Dijkstra vs. Prim on exam questions.',
    workshopQuestions: [
      {
        prompt:
          'Which of the following statements accurately compares Prim’s, Kruskal’s, and Dijkstra’s algorithms?',
        options: [
          'Prim grows a single connected MST from v₀; Kruskal grows a forest of sorted acyclic edges into an MST; Dijkstra grows a Shortest-Path Tree from source s by relaxing cumulative distances d_{u*} + w(u*, u) < d_u.',
          'Prim and Kruskal solve the Shortest Path problem, while Dijkstra solves the Minimum Spanning Tree problem.',
          'Dijkstra works on graphs with negative-weight edges, while Prim does not.',
          'Kruskal requires a starting vertex v₀, whereas Prim does not.',
        ],
        correctIndex: 0,
        explanation:
          'Prim and Kruskal both find a Minimum Spanning Tree (Prim via an expanding single tree, Kruskal via a sorted edge forest), while Dijkstra finds Single-Source Shortest Paths from source s using cumulative path relaxation.',
      },
      {
        prompt:
          'Why are all symbols in a Huffman Tree placed strictly at the LEAF nodes (never at internal nodes)?',
        options: [
          'To ensure the resulting variable-length binary code is Prefix-Free (no codeword is a prefix of another codeword), allowing unambiguous decoding without delimiters!',
          'To make all codewords have the exact same bit length.',
          'Because internal nodes cannot store characters in memory.',
          'To force the tree to have height log₂ n.',
        ],
        correctIndex: 0,
        explanation:
          'If a symbol were placed at an internal node, its root-to-node path would be a prefix of the paths to all leaves in its subtree, violating the Prefix-Free requirement!',
      },
    ],
  },

  'iterative-improvement': {
    id: 'iterative-improvement',
    badge: 'Core Concept 5 (Lectures 19–24)',
    title: 'Iterative Improvement: Feasible Point to Optimal Solution',
    subtitle:
      'Start with a feasible solution (e.g., origin 0, zero flow, empty matching, free men) and repeatedly apply a local improvement step (Simplex pivot, augmenting path, or proposal/engagement swap) until no further improvement is possible.',
    coreIdea:
      'Instead of building a solution from scratch without changes (Greedy) or solving all subproblems bottom-up (DP), Iterative Improvement maintains a complete feasible state and modifies it step-by-step along improving directions (adjacent extreme points in Simplex, augmenting paths in Flow/Matching, or stability-improving proposals in Stable Marriage).',
    whenToUseOnExam: [
      'Linear Programming (LP) optimization with linear objective and linear inequality constraints → Convert to Standard Form using slack variables and apply the Simplex Method (or Dual Transpose for Minimization).',
      'Maximizing material/data transport from source s to sink t through a capacity-constrained directed network → Use Ford-Fulkerson / Shortest-Augmenting-Path (Edmonds-Karp BFS Labeling).',
      'Pairing elements between two disjoint sets V and U with maximum cardinality → Use Maximum Bipartite Matching via augmenting paths from free vertices in V to free vertices in U.',
      'Pairing n men and n women with ranked preferences so no blocking pair (m, w) exists → Use the Gale-Shapley Stable Marriage algorithm.',
    ],
    tradeOffEquation:
      'Augmenting / Pivoting State Tables  ⇒  Guaranteed Global Optimum (Max-Flow = Min-Cut, Berge’s Theorem, LP Extreme Point Theorem, Man-Optimal Stable Matching)',
    blueprintTitle: 'The 4-Step Iterative Improvement Design Blueprint (Lectures 19–24)',
    steps: [
      {
        stepNumber: 1,
        title: 'Step 1: Initialize a Trivial Feasible Starting State',
        subtitle: 'Establish a valid starting configuration in the feasible region',
        bullets: [
          'Simplex Method: Convert ≤ constraints to = by adding slack variables s₁, s₂, ... ≥ 0; start at the basic feasible solution where original decision variables are 0 and slack variables equal the RHS constants bᵢ.',
          'Maximum Flow: Initialize flow x_{ij} = 0 on all edges (total flow v = 0) and label source s with (∞, -).',
          'Bipartite Matching: Initialize empty matching M = ∅ and enqueue all free vertices in V into BFS queue Q.',
          'Stable Marriage: Initialize all n men and n women as free (unengaged).',
        ],
        formulaTemplate:
          'Standard LP Form: Maximize ∑ cⱼxⱼ  subject to  ∑ a_{ij}xⱼ + sᵢ = bᵢ  (xⱼ, sᵢ ≥ 0)\nInitial Basic Feasible Solution: x = 0, sᵢ = bᵢ, Z = 0',
        pseudocodeTemplate:
          '// Initialize Feasible Solution:\n// Simplex: Tableau with slack basis (s₁..sₘ)\n// Max-Flow: x_{ij} ← 0 for all edges (i,j)\n// Matching: M ← ∅, Q ← all free vertices in V',
      },
      {
        stepNumber: 2,
        title: 'Step 2: Search for an Improving Direction (Pivot / Augmenting Path / Proposal)',
        subtitle: 'Identify whether the current feasible solution can be improved',
        bullets: [
          'Simplex Entering Variable: Scan bottom objective row for the most negative coefficient cⱼ < 0 (steepest rate of increase of Z).',
          'Max-Flow BFS Labeling: Scan vertex i from Q; traverse forward edges (i,j) with residual capacity r_{ij} = u_{ij} - x_{ij} > 0 (label +i) and backward edges (j,i) with positive flow x_{ji} > 0 (label -i).',
          'Bipartite Matching BFS: From v ∈ V, follow unmatched edges to u ∈ U; if u is free, an augmenting path is found! If u is matched to w ∈ V, label w and continue.',
          'Stable Marriage: Pick a free man m and have him propose to the highest-ranked woman w on his preference list to whom he has not yet proposed.',
        ],
        formulaTemplate:
          'Simplex Minimum Ratio Test (Leaving Row r):\nr = argmin_{i : a_{ie} > 0} { bᵢ / a_{ie} }  (Ignore zero or negative column entries!)',
        pseudocodeTemplate:
          'while improvement exists do\n  Find Entering Variable / Augmenting Path / Next Proposal\n  Update Feasible State (Gauss-Jordan Pivot / Augment Flow / Symmetric Difference M ⊕ P)',
      },
      {
        stepNumber: 3,
        title: 'Step 3: Apply the State Transition (Pivot / Augment / Re-Engage)',
        subtitle: 'Update the current solution while preserving feasibility',
        bullets: [
          'Simplex Pivot: Divide pivot row r by pivot element a_{re}; eliminate all other entries in entering column e using row_i ← row_i - (a_{ie}) × new_pivot_row.',
          'Max-Flow Augmentation: Backtrack from sink t using vertex labels: increase flow x_{ij} ← x_{ij} + l_t on forward (+) edges and decrease x_{ji} ← x_{ji} - l_t on backward (-) edges.',
          'Bipartite Matching Flip: Flip matched/unmatched status along augmenting path P (M ← M ⊕ P), increasing matching size |M| by exactly +1.',
          'Stable Marriage Acceptance: Woman w accepts m if she is free OR if she prefers m over her current fiancé m′ (freeing m′).',
        ],
        formulaTemplate:
          'Flow Augmentation: x_{ij} ← x_{ij} + Δ  (on + edges),  x_{ji} ← x_{ji} - Δ  (on - edges)\nMatching Update:   |M_new| = |M_old| + 1  (via alternating path flip)',
        pseudocodeTemplate:
          '// Symmetric Difference along Augmenting Path P:\n// Unmatched edges in P join M; matched edges in P leave M\n// Net gain: +1 matched pair!',
      },
      {
        stepNumber: 4,
        title: 'Step 4: Verify Optimality / Termination Certificate',
        subtitle: 'Prove that no further local improvement implies global optimality',
        bullets: [
          'Simplex Optimality: When all entries in the bottom objective row are ≥ 0, the current basic feasible solution is globally optimal.',
          'Max-Flow Min-Cut Theorem: When sink t cannot be labeled, let V_L be labeled vertices and V_U be unlabeled vertices; the cut C(V_L, V_U) has capacity equal to the maximum flow v*, proving optimality!',
          'Maximum Matching: When Q empties without reaching any free vertex in U, no augmenting path exists, so M is maximum.',
          'Stable Marriage Termination: Terminates in ≤ n² proposals with a man-optimal stable matching M containing zero blocking pairs.',
        ],
        formulaTemplate:
          'Max-Flow = Min-Cut Certificate:\nMax Flow Value v* = Capacity c(V_L, V_U) = ∑_{i ∈ V_L, j ∈ V_U} u_{ij}',
        pseudocodeTemplate:
          '// Stability Check for Matching M in O(n²):\n// For every pair (m, w) ∉ M:\n//   if m prefers w over M(m) AND w prefers m over M(w) -> Blocking Pair!',
      },
    ],
    patternMatrixTitle: 'Master Iterative Improvement Algorithms Reference (Lectures 19–24)',
    patternMatrixHeaders: [
      'Algorithm',
      'Feasible State Maintained',
      'Local Improvement Step',
      'Stopping / Optimality Criterion',
      'Time Complexity',
    ],
    patternMatrixRows: [
      [
        'Simplex Method (LP)',
        'Basic Feasible Solution (Extreme Point)',
        'Pivot: most negative obj coeff enters; min positive ratio leaves',
        'All objective row coefficients ≥ 0',
        'Polynomial average; exponential worst-case',
      ],
      [
        'Max-Flow (Edmonds-Karp)',
        'Feasible edge flow x_{ij} (0 ≤ x_{ij} ≤ u_{ij})',
        'Augment flow by bottleneck l_t along shortest BFS path s→t',
        'Sink t cannot be reached in residual network (Min-Cut reached)',
        'O(|V|·|E|²)',
      ],
      [
        'Max Bipartite Matching',
        'Valid 1-to-1 matching M ⊆ E',
        'Flip alternating path P between free v ∈ V and free u ∈ U',
        'No augmenting path exists (Queue Q empties)',
        'O(|V|·(|V| + |E|))',
      ],
      [
        'Stable Marriage (Gale-Shapley)',
        'Set of tentative engagements',
        'Free man m proposes to next w; w trades up if she prefers m',
        'All n men are engaged (no blocking pair exists)',
        'O(n²)',
      ],
    ],
    workshopTitle: 'Interactive Iterative Improvement Design Workshop',
    workshopScenario:
      'Practice Simplex standard-form rules, Min-Cut extraction, Bipartite tree matching, and Stable Marriage stability verification.',
    workshopQuestions: [
      {
        prompt:
          'In the Simplex Method, suppose all entries in the entering variable’s column are ≤ 0 (no positive coefficients a_{ie} > 0). What does this mean geometrically and algebraically?',
        options: [
          'The Linear Programming problem is UNBOUNDED (the entering variable can be increased infinitely without violating any constraint, driving Z → +∞).',
          'The current basic feasible solution is already optimal.',
          'The problem has no feasible solution.',
          'You should pick the most negative ratio as the pivot row.',
        ],
        correctIndex: 0,
        explanation:
          'Only positive coefficients a_{ie} > 0 restrict how much the entering variable can grow. If all a_{ie} ≤ 0 in the pivot column, the entering variable can grow without bound while keeping all basic variables ≥ 0, meaning the LP is unbounded!',
      },
      {
        prompt:
          'In the Gale-Shapley Stable Marriage algorithm, does the order in which free men are chosen to propose affect the final stable matching produced?',
        options: [
          'No! Regardless of which free man proposes first, Gale-Shapley always produces the exact same Man-Optimal (and Woman-Pessimal) stable matching.',
          'Yes, the first man to propose always gets his #1 choice while later men get random matches.',
          'It only produces a stable matching if men propose in alphabetical order.',
          'Switching the order of free men changes the result to Woman-Optimal.',
        ],
        correctIndex: 0,
        explanation:
          'A classic theorem of Gale-Shapley states that the proposal order of free men is completely irrelevant: the algorithm always converges to the unique Man-Optimal stable matching. To get the Woman-Optimal matching, women must propose to men!',
      },
    ],
  },

  'limitations-of-power': {
    id: 'limitations-of-power',
    badge: 'Core Concept 6 (Lectures 25–26)',
    title: 'Coping with Limitations: P, NP, NP-Complete, Backtracking & Branch-and-Bound',
    subtitle:
      'Recognize intractable (NP-Complete / NP-Hard) problems and solve them exactly on moderate inputs by pruning the State-Space Tree via Backtracking (feasibility pruning) or Branch-and-Bound (optimality bound pruning).',
    coreIdea:
      'When a problem is NP-Complete or NP-Hard (e.g., Subset-Sum, n-Queens, Hamiltonian Circuit, 0-1 Knapsack, Traveling Salesman), exhaustive search takes exponential O(2ⁿ) or O(n!) time. Backtracking and Branch-and-Bound build a State-Space Tree of partial solutions and prune entire subtrees the instant a node is proved non-promising.',
    whenToUseOnExam: [
      'Finding all/one exact solution to a constraint satisfaction problem (n-Queens, Hamiltonian Circuit, Subset-Sum, m-Coloring) → Use Backtracking with DFS and a feasibility bounding check.',
      'Finding an optimal (min cost or max profit) solution to a combinatorial optimization problem (0-1 Knapsack, Assignment Problem, Traveling Salesman) → Use Best-First Branch-and-Bound with an optimistic bound (ub or lb).',
      'Classifying computational problems into P, NP, NP-Hard, and NP-Complete on theoretical exam questions.',
    ],
    tradeOffEquation:
      'Feasibility Check + Optimistic Bound (ub / lb)  ⇒  Prunes Exponential Subtrees Early While Guaranteeing Exact / Globally Optimal Answer',
    blueprintTitle: 'The 4-Step State-Space Tree Design Blueprint (Lectures 25–26)',
    steps: [
      {
        stepNumber: 1,
        title: 'Step 1: Classify the Problem (P vs. NP vs. NP-Complete)',
        subtitle: 'Determine whether a polynomial algorithm exists or state-space search is required',
        bullets: [
          'Class P: Decision problems solvable in worst-case polynomial time O(n^k) by a deterministic algorithm (e.g., Sorting, MST, Shortest Path, Bipartite Matching).',
          'Class NP: Decision problems whose proposed solution (certificate) can be VERIFIED in polynomial time (P ⊆ NP).',
          'NP-Complete (NPC): Decision problem D is in NP AND every problem in NP is polynomially reducible to D (SAT, 3-SAT, Clique, Vertex Cover, Hamiltonian Circuit, Subset-Sum, Knapsack decision, Graph Coloring).',
        ],
        formulaTemplate:
          'Complexity Hierarchy:\nP ⊆ NP   |   NP-Complete = NP ∩ NP-Hard\nPolynomial Reduction: L₁ ≤_p L₂  (if L₂ ∈ P then L₁ ∈ P)',
        pseudocodeTemplate:
          '// Exam Classification Rule:\n// Shortest Path, MST, Sorting, Binary Search -> Class P\n// Hamiltonian Circuit, TSP, Subset-Sum, 0-1 Knapsack, SAT, Clique -> NP-Complete / NP-Hard',
      },
      {
        stepNumber: 2,
        title: 'Step 2: Define the State-Space Tree Tuple & Branching Rule',
        subtitle: 'Represent each level i of the tree as a choice for the i-th component',
        bullets: [
          'n-Queens: Level i places Queen i in column c ∈ {1..n} on row i.',
          'Subset-Sum: First sort S in nondecreasing order s₁ ≤ s₂ ≤ ... ≤ sₙ; at level i, branch Left (with s_{i+1}) and Right (without s_{i+1}).',
          '0-1 Knapsack Branch-and-Bound: First sort items by decreasing value-to-weight ratio vᵢ/wᵢ; at level i, branch Left (include item i+1) and Right (exclude item i+1).',
          'Assignment Problem Branch-and-Bound: Level i assigns Person i to one of the remaining unassigned jobs j.',
        ],
        formulaTemplate:
          'Subset-Sum Node State: (current sum s, remaining sum r = ∑_{j=i+1}^n sⱼ)\nKnapsack Node State:   (weight w, value v, upper bound ub)',
        pseudocodeTemplate:
          '// Always preprocess/sort before building the State-Space Tree:\n// Subset-Sum: sort s₁ ≤ s₂ ≤ ... ≤ sₙ\n// 0-1 Knapsack B&B: sort by v₁/w₁ ≥ v₂/w₂ ≥ ... ≥ vₙ/wₙ',
      },
      {
        stepNumber: 3,
        title: 'Step 3: Formulate the Pruning / Bounding Function (Promising Test)',
        subtitle: 'Detect dead ends and suboptimal subtrees as high in the tree as possible',
        bullets: [
          'Backtracking Feasibility Pruning (Subset-Sum): Prune node if (1) s + s_{i+1} > d (next smallest item overflows d) OR (2) s + ∑_{j=i+1}^n sⱼ < d (even adding all remaining items falls short of d).',
          '0-1 Knapsack Upper Bound (Maximization): ub = v + (W - w) × (v_{i+1} / w_{i+1}). Prune if w > W OR ub ≤ V_best.',
          'Assignment Lower Bound (Minimization): lb = cost(assigned so far) + ∑ (min valid entry in each remaining person’s row). Prune if lb ≥ C_best.',
        ],
        formulaTemplate:
          '0-1 Knapsack Upper Bound:   ub = v + (W - w) · (v_{i+1} / w_{i+1})\nAssignment Lower Bound:     lb = c_assigned + ∑_{unassigned p} min_j C[p, j]',
        pseudocodeTemplate:
          'if Node is Non-Promising (Infeasible OR Bound worse than Best Solution) then\n  Mark Node as PRUNED (×) and do NOT expand its children!\nelse\n  Expand children of Node',
      },
      {
        stepNumber: 4,
        title: 'Step 4: Choose Tree Traversal Strategy (DFS for Backtracking vs. Best-First for B&B)',
        subtitle: 'Find feasible solutions or prove global optimality',
        bullets: [
          'Backtracking uses Depth-First Search (DFS): dives deep down the left branch, and immediately backtracks to the parent when a node is pruned.',
          'Branch-and-Bound uses Best-First Search: among all live (unexpanded promising) leaves in the tree, always expand the node with the BEST bound (largest ub for maximization, smallest lb for minimization).',
          'Whenever a complete leaf achieves a better objective value than BestSoFar, update BestSoFar and immediately prune all live nodes whose bound cannot beat the new BestSoFar!',
        ],
        formulaTemplate:
          'Pruning Rule in Branch-and-Bound:\nMaximization: Prune if ub ≤ V_best\nMinimization: Prune if lb ≥ C_best',
        pseudocodeTemplate:
          'while LiveNodes queue is not empty do\n  u ← ExtractBestBound(LiveNodes)\n  if u.bound is better than BestSolution then\n    Generate children of u, compute their bounds, and prune non-promising ones',
      },
    ],
    patternMatrixTitle: 'Backtracking vs. Branch-and-Bound Comparison Matrix (Lectures 25–26)',
    patternMatrixHeaders: [
      'Technique / Problem',
      'Problem Type',
      'Tree Search Order',
      'Pruning / Bound Formula',
      'Why Preprocessing Matters',
    ],
    patternMatrixRows: [
      [
        'Backtracking: n-Queens',
        'Constraint Satisfaction',
        'Depth-First Search (DFS)',
        'Col conflict c_i == c_k OR Diag conflict |c_i - c_k| == |i - k|',
        'Row-by-row placement eliminates row conflicts automatically',
      ],
      [
        'Backtracking: Subset-Sum',
        'Exact Sum = d',
        'Depth-First Search (DFS)',
        'Prune if s + s_{i+1} > d OR s + ∑_{j=i+1}^n s_j < d',
        'Sorting s₁ ≤ ... ≤ sₙ enables the s + s_{i+1} > d cutoff',
      ],
      [
        'Backtracking: Hamiltonian',
        'Graph Cycle Visiting All V',
        'Depth-First Search (DFS)',
        'Vertex must be adjacent & unvisited; last must connect to v₀',
        'Fixes start vertex v₀ to avoid cyclic duplicates',
      ],
      [
        'B&B: 0-1 Knapsack',
        'Maximization (Profit)',
        'Best-First (Largest ub)',
        'ub = v + (W - w)·(v_{i+1}/w_{i+1}); Prune if w > W or ub ≤ V_best',
        'Sorting by vᵢ/wᵢ ↓ makes fractional relaxation a valid upper bound',
      ],
      [
        'B&B: Assignment Problem',
        'Minimization (Cost)',
        'Best-First (Smallest lb)',
        'lb = cost_so_far + ∑ min remaining row entries; Prune if lb ≥ C_best',
        'Row-minimum sum gives an O(n) optimistic lower bound per node',
      ],
    ],
    workshopTitle: 'Interactive Backtracking, Branch-and-Bound & NP-Completeness Workshop',
    workshopScenario:
      'Practice computing Branch-and-Bound upper/lower bounds, Subset-Sum pruning conditions, and P/NP/NP-Complete classifications from past Final Exams.',
    workshopQuestions: [
      {
        prompt:
          'In 0-1 Knapsack Branch-and-Bound with capacity W = 10 and items sorted by v/w: Item 1 (w=4, v=40, v/w=10), Item 2 (w=7, v=42, v/w=6), Item 3 (w=5, v=25, v/w=5). What is the Upper Bound ub at Node 1 (where Item 1 is included: w=4, v=40)?',
        options: [
          'ub = 40 + (10 - 4) × 6 = 40 + 36 = 76',
          'ub = 40 + (10 - 4) × 10 = 100',
          'ub = 40 + 42 = 82',
          'ub = 40 + (10 - 4) × 5 = 70',
        ],
        correctIndex: 0,
        explanation:
          'At level 1 (after deciding Item 1), the next available item is Item 2 with ratio v₂/w₂ = 42/7 = 6. Using ub = v + (W - w) × (v₂/w₂), we get ub = 40 + (10 - 4) × 6 = 40 + 36 = 76!',
      },
      {
        prompt:
          'Which of the following statements about P, NP, and NP-Complete problems is TRUE according to Lecture 25 and Final Exam questions?',
        options: [
          'Every problem in P is also in NP (P ⊆ NP), and a decision problem D is NP-Complete if D ∈ NP and every problem in NP is polynomially reducible to D.',
          'Dijkstra’s Shortest Path problem and Minimum Spanning Tree are NP-Complete problems.',
          'Backtracking and Branch-and-Bound solve NP-Complete problems in worst-case polynomial O(n²) time.',
          'NP stands for "Not Polynomial".',
        ],
        correctIndex: 0,
        explanation:
          'NP stands for "Nondeterministic Polynomial" (verifiable in polynomial time). Every problem solvable in polynomial time (Class P) is also verifiable in polynomial time, so P ⊆ NP.',
      },
    ],
  },
};

interface PastExamDesignQuestion {
  id: string;
  examType: 'M' | 'F';
  examPaper: string;
  marks: string;
  paradigm: ModuleCategory;
  title: string;
  questionPrompt: string;
  howToSolveSteps: string[];
  officialSolution: string;
  codeOrFormula: string;
}

const PAST_EXAM_DESIGN_QUESTIONS: PastExamDesignQuestion[] = [
  {
    id: 'm-horspool-preprocess-design',
    examType: 'M',
    examPaper: 'Spring 2025 MidTerm & Winter 2023 MidTerm Q1',
    marks: '4 Marks',
    paradigm: 'input-enhancement',
    title: 'Designing Horspool’s Shift Table Algorithm & Avoiding the Zero-Shift Trap',
    questionPrompt:
      'Write the pseudocode for Horspool’s ShiftTable(P[0..m-1]) algorithm and explain why the loop index j runs only from 0 to m - 2 (excluding the last character P[m-1]). How is t(c) defined piecewise?',
    howToSolveSteps: [
      'Step 1: Define the piecewise mathematical formula for t(c): if character c does not appear among the first m - 1 characters P[0..m-2], then t(c) = m; otherwise t(c) = m - 1 - j where j is the rightmost index in 0 ≤ j ≤ m - 2 such that P[j] = c.',
      'Step 2: Initialize all alphabet entries Table[0..size-1] to pattern length m.',
      'Step 3: Loop j from 0 to m - 2 (left-to-right) and set Table[P[j]] ← m - 1 - j so later occurrences automatically overwrite earlier ones.',
      'Step 4: Explain that if j = m - 1 were included, Table[P[m-1]] would become m - 1 - (m - 1) = 0, causing an infinite loop (zero shift) whenever the last character mismatches!',
    ],
    officialSolution:
      'The shift table precomputes how far we can safely shift pattern P[0..m-1] when aligning against text character c = T[i]. By scanning j = 0 to m - 2, any character appearing only at P[m-1] retains the full shift m, while any character appearing earlier in P[0..m-2] gets distance m - 1 - j to its rightmost occurrence.',
    codeOrFormula: `Algorithm ShiftTable(P[0..m - 1])
// Fills the shift table used by Horspool's and Boyer-Moore algorithms
// Input: Pattern P[0..m - 1] and alphabet of possible characters
// Output: Table[0..size - 1] indexed by alphabet characters
for i ← 0 to size - 1 do
    Table[i] ← m
for j ← 0 to m - 2 do
    Table[P[j]] ← m - 1 - j
return Table`,
  },
  {
    id: 'm-dist-counting-stability-design',
    examType: 'M',
    examPaper: 'Question Pool & Fall 2023 MidTerm Q1',
    marks: '3 Marks',
    paradigm: 'input-enhancement',
    title: 'Designing Stable Distribution Counting Sort in Θ(n + (u - l))',
    questionPrompt:
      'Design the Distribution Counting Sort algorithm for an array A[0..n-1] of integers drawn from the range [l..u]. Explain why the final placement loop must iterate backward from i = n - 1 down to 0.',
    howToSolveSteps: [
      'Step 1: Allocate frequency/distribution array D[0..u-l] of size (u - l + 1) initialized to 0, and output array S[0..n-1].',
      'Step 2: Count frequencies in one pass: for i = 0 to n - 1, increment D[A[i] - l].',
      'Step 3: Convert frequencies into cumulative distribution values: for j = 1 to u - l, set D[j] ← D[j - 1] + D[j]. Now D[j] holds the 1-based last position of value (l + j).',
      'Step 4: Scan input A from right to left (i = n - 1 down to 0), place A[i] at S[D[A[i] - l] - 1], and decrement D[A[i] - l]. Scanning right-to-left places the rightmost duplicate into the rightmost available slot first, preserving relative order (stability)!',
    ],
    officialSolution:
      'Distribution Counting Sort achieves linear Θ(n + (u - l)) time with zero key-to-key comparisons by using cumulative counts D[j] as direct placement pointers into output array S[0..n-1].',
    codeOrFormula: `Algorithm DistributionCounting(A[0..n - 1], l, u)
for j ← 0 to u - l do D[j] ← 0
for i ← 0 to n - 1 do D[A[i] - l] ← D[A[i] - l] + 1
for j ← 1 to u - l do D[j] ← D[j - 1] + D[j]
for i ← n - 1 down to 0 do
    j ← A[i] - l
    S[D[j] - 1] ← A[i]
    D[j] ← D[j] - 1
return S`,
  },
  {
    id: 'm-btree-node-capacity-design',
    examType: 'M',
    examPaper: 'Winter 2023 MidTerm Q3 & Fall 2023 MidTerm Q2',
    marks: '4 Marks',
    paradigm: 'pre-structuring',
    title: 'B-Tree Structural Properties, Node Key Bounds & Split Promotion Design',
    questionPrompt:
      'State the structural properties of a B-Tree of order m ≥ 2 (root vs. non-root key and child bounds) and describe the exact algorithm for inserting a new key K into a B-Tree when a leaf node overflows.',
    howToSolveSteps: [
      'Step 1: State Root bounds: The root has between 1 and m - 1 keys (and between 2 and m children if it is not a leaf).',
      'Step 2: State Non-Root Internal Node bounds: Every non-root internal node has between ⌈m/2⌉ - 1 and m - 1 keys (and between ⌈m/2⌉ and m children).',
      'Step 3: State Leaf Depth invariant: All leaves are at the exact same level (perfectly height-balanced).',
      'Step 4: Describe Overflow Split: Insert K into the appropriate leaf in sorted order. If the leaf now has m keys (overflow > m - 1), split it into two nodes around the median key at position ⌈m/2⌉: left node gets the first ⌈m/2⌉ - 1 keys, right node gets the remaining ⌊m/2⌋ keys, and the median key is promoted to the parent (splitting recursively up to the root if needed).',
    ],
    officialSolution:
      'Because a B-Tree only increases in height when the root itself splits and creates a new 1-key root with 2 children, all leaves remain at the exact same depth and every operation takes O(log_m n) disk page accesses.',
    codeOrFormula: `B-Tree of Order m Node Capacity Rules:
• Max Keys per Node:        m - 1       (Max Children = m)
• Min Keys (Root):          1           (Min Children = 2 if internal)
• Min Keys (Non-Root):      ⌈m/2⌉ - 1   (Min Children = ⌈m/2⌉)
• Median Key on Split (m):  Key at 1-based index ⌈m/2⌉ promoted to Parent`,
  },
  {
    id: 'm-dp-memory-function-design',
    examType: 'M',
    examPaper: 'Spring 2025 MidTerm & Question Pool DP Design',
    marks: '4 Marks',
    paradigm: 'dynamic-programming',
    title: 'Designing the Top-Down Memory Function Algorithm (MFKnapsack)',
    questionPrompt:
      'Explain how the Memory Function technique combines the strengths of Top-Down recursion and Bottom-Up Dynamic Programming for the 0-1 Knapsack problem, and write the MFKnapsack(i, j) algorithm.',
    howToSolveSteps: [
      'Step 1: Compare Top-Down vs. Bottom-Up: Pure top-down recursion solves only needed subproblems but solves overlapping ones exponentially many times. Bottom-up DP solves each subproblem once but blindly fills ALL cells in F[1..n, 1..W], even unreachable capacities.',
      'Step 2: Initialize the table: Set F[0, j] = 0 for 0 ≤ j ≤ W and F[i, 0] = 0 for 0 ≤ i ≤ n (base cases), and set all other entries F[i, j] = -1 to indicate "not yet computed".',
      'Step 3: In MFKnapsack(i, j), first check `if F[i, j] < 0`. If it is ≥ 0, return the cached answer immediately in O(1)!',
      'Step 4: Otherwise, compute `value` using the knapsack recurrence, store `F[i, j] ← value`, and return `F[i, j]`.',
    ],
    officialSolution:
      'MFKnapsack(n, W) evaluates only the subproblem states (i, j) that are actually required to reach (n, W), while memoizing every solved state in F[i, j] so no subproblem is ever recomputed.',
    codeOrFormula: `Algorithm MFKnapsack(i, j)
// Input: Nonnegative integers i (first i items) and j (knapsack capacity)
// Note: Array F[0..n, 0..W] initialized with 0s in row 0 & col 0, and -1s elsewhere
if F[i, j] < 0 then
    if j < Weights[i] then
        value ← MFKnapsack(i - 1, j)
    else
        value ← max(MFKnapsack(i - 1, j),
                    Values[i] + MFKnapsack(i - 1, j - Weights[i]))
    F[i, j] ← value
return F[i, j]`,
  },
  {
    id: 'f-fall2020-q2-max-spanning-tree',
    examType: 'F',
    examPaper: 'Fall 2020 Final Exam Q2',
    marks: '4 Marks',
    paradigm: 'greedy',
    title: 'Designing a Maximum Spanning Tree Algorithm (Modifying Kruskal / Prim)',
    questionPrompt:
      'Sometimes we need to find a Maximum Spanning Tree (a spanning tree with the maximum possible total edge weight) instead of a Minimum Spanning Tree. Describe how to modify Kruskal’s (or Prim’s) algorithm to find a Maximum Spanning Tree, or how to solve it by transforming the input weights.',
    howToSolveSteps: [
      'Method 1 (Direct Modification of Kruskal’s Algorithm): Sort the edges in NON-INCREASING (descending) order of weights w(e₁) ≥ w(e₂) ≥ ... ≥ w(e_{|E|}) instead of non-decreasing order, and greedily add each edge if it does not form a cycle (using Union-Find).',
      'Method 2 (Direct Modification of Prim’s Algorithm): Use a Max-Heap Priority Queue (instead of a Min-Heap) and at each step pick the uncommitted vertex u* connected to the current tree V_T by the MAXIMUM weight cut edge.',
      'Method 3 (Input Weight Transformation): Multiply every edge weight by -1 (set w′(e) = -w(e)) and run standard Minimum Spanning Tree (Prim or Kruskal) on w′(e)! Minimizing ∑(-w(e)) is mathematically identical to maximizing ∑w(e).',
    ],
    officialSolution:
      'Both Kruskal’s and Prim’s greedy cut/cycle properties hold symmetrically when edge order is reversed. Sorting edges in decreasing order in Kruskal’s algorithm (or negating edge weights w′(e) = -w(e)) produces a Maximum Spanning Tree in O(|E| log |V|) time.',
    codeOrFormula: `Algorithm MaxKruskal(G = (V, E))
// Sort E in nonincreasing (descending) order of weights:
// w(e_{i_1}) ≥ w(e_{i_2}) ≥ ... ≥ w(e_{i_|E|})
E_T ← ∅;  ecounter ← 0;  k ← 0
while ecounter < |V| - 1 do
    k ← k + 1
    if E_T ∪ {e_{i_k}} is acyclic then
        E_T ← E_T ∪ {e_{i_k}};  ecounter ← ecounter + 1
return E_T`,
  },
  {
    id: 'f-fall2020-q3a-unweighted-mst',
    examType: 'F',
    examPaper: 'Fall 2020 Final Exam Q3(a)',
    marks: '3 Marks',
    paradigm: 'greedy',
    title: 'Spanning Tree When All Edge Weights Are Equal (w(e) = 1)',
    questionPrompt:
      'Suppose all edges in a connected undirected graph G = (V, E) have the exact same weight (e.g., w(e) = 1 or c for every edge). What is the fastest way to find a Minimum Spanning Tree of G, and what is its time complexity?',
    howToSolveSteps: [
      'Step 1: Observe that ANY spanning tree of a connected graph with |V| vertices has exactly |V| - 1 edges.',
      'Step 2: Since every edge has weight c, EVERY spanning tree has the exact same total weight (|V| - 1) × c, so any spanning tree is automatically a Minimum Spanning Tree!',
      'Step 3: Therefore, we do NOT need a priority queue or edge sorting. Simply run Breadth-First Search (BFS) or Depth-First Search (DFS) starting from any vertex v₀ and collect the |V| - 1 tree edges.',
      'Step 4: State the improved time complexity: O(|V| + |E|) linear time (instead of O(|E| log |V|)).',
    ],
    officialSolution:
      'When all edge weights are identical, every spanning tree has total cost (|V| - 1)·c. A simple BFS or DFS traversal constructs the spanning tree in optimal O(|V| + |E|) time.',
    codeOrFormula: `Every Spanning Tree has |E_T| = |V| - 1 edges.
If w(e) = c for all e ∈ E:
  Total Weight(T) = (|V| - 1) × c  (constant for ALL spanning trees!)
Optimal Algorithm: Run BFS or DFS traversal → Time Complexity: Θ(|V| + |E|)`,
  },
  {
    id: 'f-fall2020-q3b-negative-weights-mst',
    examType: 'F',
    examPaper: 'Fall 2020 Final Exam Q3(b)',
    marks: '4 Marks',
    paradigm: 'greedy',
    title: 'Do Prim’s and Kruskal’s Algorithms Work with Negative Edge Weights?',
    questionPrompt:
      'Do Prim’s and Kruskal’s Minimum Spanning Tree algorithms work correctly if the graph contains negative-weight edges? Justify your answer and contrast this with Dijkstra’s algorithm.',
    howToSolveSteps: [
      'Step 1: Answer YES for both Prim’s and Kruskal’s algorithms! Both work 100% correctly on graphs with negative edge weights.',
      'Step 2: Justify using the Cut Property & Cycle Property: Prim and Kruskal only compare the relative order of single edge weights (w(e₁) < w(e₂)) and every spanning tree has a fixed number of edges (|V| - 1). Adding a constant C to all edges shifts every spanning tree’s weight by (|V| - 1)·C without changing which tree is minimum.',
      'Step 3: Contrast with Dijkstra’s Shortest Path algorithm: Dijkstra FAILS with negative edge weights because a path can have variable length, and traversing a negative edge later can reduce the cumulative distance to an already-finalized vertex u* ∈ V_T!',
    ],
    officialSolution:
      'YES — Prim’s and Kruskal’s algorithms work without any modification on graphs with negative edge weights because the MST cut property depends only on relative edge order and every spanning tree contains exactly |V| - 1 edges. (By contrast, Dijkstra’s algorithm requires non-negative edge weights w(e) ≥ 0.)',
    codeOrFormula: `Proof by Uniform Weight Shift:
Let C = |min_{e ∈ E} w(e)| + 1 so that w'(e) = w(e) + C > 0 for all e.
For any spanning tree T with |V| - 1 edges:
  w'(T) = ∑_{e ∈ T} (w(e) + C) = w(T) + (|V| - 1)·C
Since (|V| - 1)·C is a constant, T minimizes w'(T) iff T minimizes w(T)!`,
  },
  {
    id: 'f-fall2020-q5-activity-selection',
    examType: 'F',
    examPaper: 'Fall 2020 Final Exam Q5',
    marks: '5 Marks',
    paradigm: 'greedy',
    title: 'Designing the Recursive Greedy Activity-Selection Algorithm',
    questionPrompt:
      'Given n activities S = {a₁, a₂, ..., aₙ} with start times s[1..n] and finish times f[1..n] already sorted in monotonically increasing order of finish time (f₁ ≤ f₂ ≤ ... ≤ fₙ), state the greedy choice property and write the Recursive-Activity-Selector(s, f, k, n) algorithm.',
    howToSolveSteps: [
      'Step 1: State the Greedy Choice Property: Always pick the compatible activity that finishes FIRST (earliest finish time f_m). This leaves the maximum possible remaining time for future compatible activities.',
      'Step 2: In Recursive-Activity-Selector(s, f, k, n), k is the index of the last selected activity (with dummy activity a₀ having f₀ = 0).',
      'Step 3: Advance m ← k + 1 while m ≤ n and s[m] < f[k] (skip all activities that overlap with a_k).',
      'Step 4: If m ≤ n, select activity a_m and return {a_m} ∪ Recursive-Activity-Selector(s, f, m, n); otherwise return ∅.',
    ],
    officialSolution:
      'Because activities are pre-sorted by finish time f₁ ≤ ... ≤ fₙ, scanning m from k + 1 upward finds the earliest-finishing compatible activity a_m (where s[m] ≥ f[k]) in a single linear scan Across all recursive calls, the total time complexity is Θ(n) (or Θ(n log n) if sorting is required).',
    codeOrFormula: `Algorithm Recursive-Activity-Selector(s, f, k, n)
// Initial call: Recursive-Activity-Selector(s, f, 0, n) with f[0] = 0
m ← k + 1
while m ≤ n and s[m] < f[k] do   // find first activity compatible with a_k
    m ← m + 1
if m ≤ n then
    return {a_m} ∪ Recursive-Activity-Selector(s, f, m, n)
else
    return ∅`,
  },
  {
    id: 'f-spring2021-q5a-tree-bipartite-matching',
    examType: 'F',
    examPaper: 'Spring 2021 Final Exam Q5(a)',
    marks: '5 Marks',
    paradigm: 'iterative-improvement',
    title: 'Every Tree is Bipartite + Linear-Time Maximum Matching in a Tree',
    questionPrompt:
      'Explain why every tree T = (V, E) is a bipartite graph, and design an efficient algorithm to find a Maximum Matching in a tree (from leaves upward) without needing general augmenting-path searches.',
    howToSolveSteps: [
      'Step 1: Prove every tree is bipartite: A graph is bipartite iff it contains no odd-length cycles. Since a tree is acyclic (contains NO cycles at all), it is always bipartite! Specifically, root the tree at any vertex r: put vertices at even depth (0, 2, 4, ...) in set V₁ and vertices at odd depth (1, 3, 5, ...) in set V₂.',
      'Step 2: Observe the Leaf Greedy/Bottom-Up Property: Consider any leaf v of the tree and its unique parent p. Since v has degree 1, the ONLY way v can ever be matched is via the edge (v, p). Matching (v, p) leaves at least as many remaining vertices available as matching p to any other neighbor!',
      'Step 3: Design the bottom-up algorithm: Repeatedly pick an unmatched leaf v (or process vertices in post-order DFS from leaves to root). If neither v nor its parent p is matched yet, add edge (v, p) to matching M, mark both v and p as matched, and remove them (and incident edges).',
      'Step 4: State complexity: Using post-order DFS on the tree, this runs in optimal O(|V|) linear time!',
    ],
    officialSolution:
      'Every tree is bipartite by 2-coloring its levels (even depth vs. odd depth). Furthermore, a maximum matching in a tree can be found in O(|V|) time via a bottom-up post-order DFS traversal that greedily matches each unmatched child with its unmatched parent.',
    codeOrFormula: `Algorithm TreeMaxMatching(T, u, parent)
// Post-order DFS from leaves up to the root in O(|V|) time
for each child v of u (where v ≠ parent) do
    TreeMaxMatching(T, v, u)
    if v is unmatched and u is unmatched then
        M ← M ∪ {(u, v)}
        mark both u and v as matched`,
  },
  {
    id: 'f-spring2021-q6-stable-marriage-design',
    examType: 'F',
    examPaper: 'Spring 2021 Final Exam Q6(a, b)',
    marks: '6 Marks',
    paradigm: 'iterative-improvement',
    title: 'Designing an O(n²) Stability Checker & Constructing a 2×2 Instance with Two Stable Matchings',
    questionPrompt:
      '(a) Design an O(n²) algorithm that takes a given matching M and the preference matrices of n men and n women, and determines whether M is stable or contains a blocking pair. (b) Give a 2×2 instance where Man-Optimal and Woman-Optimal Gale-Shapley produce different stable matchings.',
    howToSolveSteps: [
      'Step 1 (Preprocess Rank Matrices for O(1) Lookups): Build 2D lookup tables ManRank[m, w] and WomanRank[w, m] in O(n²) time where ManRank[m, w] stores the position (1..n) of woman w on man m’s preference list, and Partner[m] / Partner[w] stores their assigned partner in M.',
      'Step 2 (Check All n² Pairs): Loop over every man m ∈ {1..n} and every woman w ∈ {1..n}. Check in O(1) time: if ManRank[m, w] < ManRank[m, Partner[m]] AND WomanRank[w, m] < WomanRank[w, Partner[w]], then (m, w) is a blocking pair → return UNSTABLE!',
      'Step 3 (If loop finishes): Return STABLE. Total time: O(n²) preprocessing + O(n²) pair checks = O(n²).',
      'Step 4 (Part b — 2×2 Latin Square Preferences): Let m₁ prefer (w₁, w₂), m₂ prefer (w₂, w₁), while w₁ prefers (m₂, m₁) and w₂ prefers (m₁, m₂). When men propose: M_men = {(m₁, w₁), (m₂, w₂)}. When women propose: M_women = {(m₁, w₂), (m₂, w₁)}. Both are stable!',
    ],
    officialSolution:
      'By inverting the preference lists into rank lookup matrices ManRank[m, w] and WomanRank[w, m], each potential blocking pair (m, w) can be tested in O(1) time, yielding an O(n²) stability verifier.',
    codeOrFormula: `Algorithm IsStableMatching(M, ManPref, WomanPref, n)
for m ← 1 to n do
    for rank ← 1 to n do ManRank[m, ManPref[m, rank]] ← rank
for w ← 1 to n do
    for rank ← 1 to n do WomanRank[w, WomanPref[w, rank]] ← rank
for m ← 1 to n do
    for w ← 1 to n do
        if w ≠ Partner[m] then
            if ManRank[m, w] < ManRank[m, Partner[m]] and
               WomanRank[w, m] < WomanRank[w, Partner[w]] then
                return FALSE // (m, w) is a blocking pair!
return TRUE`,
  },
  {
    id: 'f-winter2023-q4-simplex-standard-form',
    examType: 'F',
    examPaper: 'Winter 2023 Final Exam Q4(a, b)',
    marks: '6 Marks',
    paradigm: 'iterative-improvement',
    title: 'The 5 Steps of the Simplex Method & Converting General LP to Standard Form',
    questionPrompt:
      '(a) List the 5 main steps of the Simplex Method for solving a Linear Programming problem. (b) Convert the following LP into Standard Form: Minimize -3x₁ + 2x₂ subject to x₁ - x₂ ≥ 3, 2x₁ + 3x₂ ≤ 5, x₁ ≥ 0, x₂ unconstrained in sign.',
    howToSolveSteps: [
      'Part (a) — The 5 Steps of Simplex: (Step 0) Initialization: Express LP in standard form and set up initial tableau with slack variables as the initial basis. (Step 1) Optimality Test: If all entries in the objective row are ≥ 0, stop (optimal solution found). (Step 2) Entering Variable: Select the variable with the most negative coefficient in the objective row. (Step 3) Leaving Variable: Perform the minimum positive ratio test θ = min{bᵢ / a_{ie} : a_{ie} > 0} (if no a_{ie} > 0, problem is unbounded). (Step 4) Pivot Operation: Apply Gauss-Jordan row operations to make the pivot 1 and clear the pivot column, then return to Step 1.',
      'Part (b)Rule 1 (Minimization → Maximization): Replace Minimize (-3x₁ + 2x₂) with Maximize Z = -(-3x₁ + 2x₂) = 3x₁ - 2x₂.',
      'Part (b) Rule 2 (Unconstrained Variable x₂): Since x₂ has no sign restriction, substitute x₂ = x₂′ - x₂″ where x₂′ ≥ 0 and x₂″ ≥ 0.',
      'Part (b) Rule 3 (Inequalities → Equalities): For x₁ - (x₂′ - x₂″) ≥ 3, subtract surplus variable s₁ ≥ 0: x₁ - x₂′ + x₂″ - s₁ = 3. For 2x₁ + 3(x₂′ - x₂″) ≤ 5, add slack variable s₂ ≥ 0: 2x₁ + 3x₂′ - 3x₂″ + s₂ = 5.',
    ],
    officialSolution:
      'Every Linear Program can be systematically transformed into Standard Form (Maximization, equality constraints with non-negative RHS, and all variables ≥ 0) using objective negation, slack/surplus variables, and difference of two non-negative variables.',
    codeOrFormula: `Converted Standard Form LP (Winter 2023 Final Q4b):
Maximize   Z = 3x₁ - 2x₂' + 2x₂''
subject to:
   x₁ -  x₂' +  x₂'' - s₁      = 3
  2x₁ + 3x₂' - 3x₂''      + s₂ = 5
  x₁, x₂', x₂'', s₁, s₂ ≥ 0`,
  },
  {
    id: 'f-winter2023makeup-q4c-3color-sort',
    examType: 'F',
    examPaper: 'Winter 2023 MakeUp Final Exam Q4(c)',
    marks: '4 Marks',
    paradigm: 'input-enhancement',
    title: 'Designing an O(n) Linear-Time Sort for an Array of 3 Colors (Red, White, Blue)',
    questionPrompt:
      'An array A[0..n-1] contains n items, each colored Red, White, or Blue. Design a linear O(n) time algorithm to sort the array so that all Red items come first, followed by all White items, followed by all Blue items.',
    howToSolveSteps: [
      'Approach 1 (3-Pointer In-Place Partitioning / Dutch National Flag — O(n) time, O(1) space): Maintain three pointers: `low = 0` (boundary for Red), `mid = 0` (current element), and `high = n - 1` (boundary for Blue).',
      'If A[mid] == Red: swap(A[low], A[mid]), increment both `low` and `mid`.',
      'If A[mid] == White: increment `mid`.',
      'If A[mid] == Blue: swap(A[mid], A[high]), decrement `high` (do NOT increment `mid` yet since the swapped element from `high` must be inspected).',
      'Approach 2 (Distribution Counting Sort — O(n) time, O(n) space): Map Red=0, White=1, Blue=2 (range [0..2]) and count frequencies in D[0..2].',
    ],
    officialSolution:
      'Because there are only 3 distinct key values, we bypass the Ω(n log n) comparison-sort lower bound and sort in a single O(n) pass using either the 3-way Dutch National Flag partition or Distribution Counting.',
    codeOrFormula: `Algorithm ThreeColorSort(A[0..n - 1])
low ← 0;  mid ← 0;  high ← n - 1
while mid ≤ high do
    if A[mid] == RED then
        swap(A[low], A[mid]);  low ← low + 1;  mid ← mid + 1
    else if A[mid] == WHITE then
        mid ← mid + 1
    else // A[mid] == BLUE
        swap(A[mid], A[high]);  high ← high - 1`,
  },
  {
    id: 'f-fall2025-q5-np-completeness-classification',
    examType: 'F',
    examPaper: 'Fall 2025 Final Q5 & Fall 2025 CFE Final Q6',
    marks: '5 Marks',
    paradigm: 'limitations-of-power',
    title: 'Classifying P, NP, NP-Hard & NP-Complete Problems + Backtracking vs. Branch-and-Bound',
    questionPrompt:
      '(a) Define Class P, Class NP, and NP-Complete problems, and classify: Minimum Spanning Tree, Dijkstra Shortest Path, 0-1 Knapsack, Traveling Salesman Problem (TSP), Hamiltonian Circuit, and Graph Coloring. (b) Compare Backtracking and Branch-and-Bound in terms of problem type, tree traversal order, and pruning mechanism.',
    howToSolveSteps: [
      'Part (a) Definitions: Class P = decision problems solvable in polynomial time O(n^k). Class NP = decision problems whose candidate solutions can be verified in polynomial time (P ⊆ NP). NP-Complete = problems in NP to which every problem in NP reduces in polynomial time.',
      'Part (a) Classification Table: Minimum Spanning Tree (Prim/Kruskal) → Class P (and also in NP). Dijkstra Shortest Path → Class P (and also in NP). 0-1 Knapsack, Traveling Salesman (TSP), Hamiltonian Circuit, m-Coloring, Subset-Sum, CNF-SAT → NP-Complete (decision version) / NP-Hard (optimization version).',
      'Part (b) Backtracking vs. Branch-and-Bound: (1) Problem Type: Backtracking solves decision/constraint satisfaction problems (e.g., n-Queens, Subset-Sum, Hamiltonian Circuit); Branch-and-Bound solves combinatorial optimization problems (e.g., 0-1 Knapsack, Assignment, TSP).',
      '(2) Traversal Order: Backtracking uses Depth-First Search (DFS); Branch-and-Bound typically uses Best-First Search guided by the most promising bound. (3) Pruning Rule: Backtracking prunes only on feasibility violations; Branch-and-Bound prunes on both feasibility AND optimistic bound comparisons (ub ≤ V_best or lb ≥ C_best).',
    ],
    officialSolution:
      'Understanding the exact boundary between polynomial-time greedy/DP graph problems (MST, Shortest Path ∈ P) and intractable combinatorial problems (TSP, Hamiltonian Circuit, Subset-Sum, 0-1 Knapsack ∈ NP-Complete/NP-Hard) is tested on every CPCS-324 Final Exam.',
    codeOrFormula: `CPCS-324 Final Exam Problem Classification Cheat-Sheet:
• Class P (Polynomial):      Sorting, Binary Search, Prim MST, Kruskal MST,
                             Dijkstra Shortest Path, Floyd All-Pairs, Bipartite Matching
• NP-Complete / NP-Hard:     CNF-SAT, 3-SAT, Clique, Vertex Cover, Hamiltonian Circuit,
                             Traveling Salesman (TSP), Subset-Sum, 0-1 Knapsack, Graph Coloring`,
  },
  {
    id: 'f-winter2023makeup-q5-branch-and-bound-knapsack-design',
    examType: 'F',
    examPaper: 'Winter 2023 MakeUp Final Q5(b) & Fall 2025 CFE Final Q5(b)',
    marks: '5 Marks',
    paradigm: 'limitations-of-power',
    title: 'Formulating the 0-1 Knapsack Branch-and-Bound Upper Bound & Pruning Rules',
    questionPrompt:
      'Explain the preprocessing step and the exact mathematical formula used to compute the Upper Bound (ub) at a node in the Branch-and-Bound State-Space Tree for the 0-1 Knapsack problem. Under what two conditions is a node pruned (marked non-promising)?',
    howToSolveSteps: [
      'Step 1 (Preprocessing — Sort by Value-to-Weight Ratio): Sort all n items in non-increasing (decreasing) order of their value-to-weight ratios: v₁/w₁ ≥ v₂/w₂ ≥ ... ≥ vₙ/wₙ.',
      'Step 2 (Upper Bound Formula): For a node at level i (after deciding items 1..i) with current total weight w and current total value v, compute the fractional relaxation bound using the very next item (i + 1): ub = v + (W - w) × (v_{i+1} / w_{i+1}).',
      'Step 3 (Two Pruning Conditions): A node is pruned (non-promising) immediately if: (Condition 1 — Infeasible) its total weight exceeds capacity (w > W), OR (Condition 2 — Bound Cannot Beat Best Known Solution) its upper bound is less than or equal to the value of the best feasible solution found so far (ub ≤ V_best).',
    ],
    officialSolution:
      'Sorting items by decreasing vᵢ/wᵢ guarantees that filling the remaining capacity (W - w) with the best remaining unit ratio v_{i+1}/w_{i+1} yields a mathematically valid upper bound on any integer solution in that subtree.',
    codeOrFormula: `0-1 Knapsack Branch-and-Bound Rules:
1. Pre-sort items so:  v₁/w₁ ≥ v₂/w₂ ≥ ... ≥ vₙ/wₙ
2. Upper Bound at level i:
     ub = v + (W - w) × (v_{i+1} / w_{i+1})
3. Prune Node if:
     (a) w > W          (Exceeds knapsack capacity — Infeasible)
     (b) ub ≤ V_best    (Cannot improve on current best integer solution)`,
  },
];

export const DesignView: React.FC<DesignViewProps> = ({ algorithm }) => {
  // Default to the paradigm category of the currently selected sidebar algorithm,
  // but allow the user to freely switch between the 6 Core Course Paradigms!
  const [selectedParadigm, setSelectedParadigm] = useState<ModuleCategory>(algorithm.category);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [examFilter, setExamFilter] = useState<'all' | 'M' | 'F' | 'paradigm'>('all');

  useEffect(() => {
    setSelectedParadigm(algorithm.category);
  }, [algorithm.category]);

  const activeData = PARADIGM_MASTER_DATA[selectedParadigm];
  const midtermDesignCount = PAST_EXAM_DESIGN_QUESTIONS.filter((q) => q.examType === 'M').length;
  const finalDesignCount = PAST_EXAM_DESIGN_QUESTIONS.filter((q) => q.examType === 'F').length;
  const filteredExamQuestions = PAST_EXAM_DESIGN_QUESTIONS.filter((q) => {
    if (examFilter === 'M') return q.examType === 'M';
    if (examFilter === 'F') return q.examType === 'F';
    if (examFilter === 'paradigm') return q.paradigm === selectedParadigm;
    return true;
  });

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    const key = `${selectedParadigm}-${qIdx}`;
    setSelectedAnswers((prev) => ({
      ...prev,
      [key]: optIdx,
    }));
  };

  const resetWorkshop = () => {
    setSelectedAnswers((prev) => {
      const next = { ...prev };
      activeData.workshopQuestions.forEach((_, idx) => {
        delete next[`${selectedParadigm}-${idx}`];
      });
      return next;
    });
  };

  const totalQuestions = activeData.workshopQuestions.length;
  const answeredCount = activeData.workshopQuestions.filter(
    (_, idx) => selectedAnswers[`${selectedParadigm}-${idx}`] !== undefined
  ).length;
  const correctCount = activeData.workshopQuestions.filter(
    (q, idx) => selectedAnswers[`${selectedParadigm}-${idx}`] === q.correctIndex
  ).length;

  return (
    <div className="space-y-6">
      {/* Top 6-Paradigm Master Switcher */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                Design Mode — All 6 Course Paradigms (Lectures 01–26)
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                M: {midtermDesignCount} Midterm Design Qs
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                F: {finalDesignCount} Final Design Qs
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-1.5 flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              How to Design Algorithms Using the 6 Course Paradigms &amp; Official Exam Solutions
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Select any of the 6 course paradigms below to study its 4-step design blueprint, or scroll down to view all {PAST_EXAM_DESIGN_QUESTIONS.length} official Midterm &amp; Final Exam design questions with step-by-step solutions.
            </p>
          </div>
        </div>

        {/* 6 Big Paradigm Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          <button
            type="button"
            onClick={() => setSelectedParadigm('input-enhancement')}
            className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
              selectedParadigm === 'input-enhancement'
                ? 'border-indigo-500 bg-indigo-950/40 ring-1 ring-indigo-500/50 shadow-md'
                : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 font-bold">
                  1. Input Enhancement
                </span>
                <Layers className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-sm font-bold text-white">Preprocessing &amp; Lookup Tables</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Precompute auxiliary arrays (Counts, Cumulative Distributions, Shift Tables <code className="font-mono">t(c)</code>, <code className="font-mono">d₂(k)</code>) to speed up sorting &amp; string matching.
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-indigo-300 pt-1 border-t border-slate-800/80">
              <span>Counting Sorts, Horspool, Boyer-Moore</span>
              <ArrowRight className="w-3 h-3 ml-auto" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedParadigm('pre-structuring')}
            className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
              selectedParadigm === 'pre-structuring'
                ? 'border-emerald-500 bg-emerald-950/40 ring-1 ring-emerald-500/50 shadow-md'
                : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  2. Pre-Structuring
                </span>
                <Database className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-sm font-bold text-white">Access-Optimized Data Structures</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Organize keys into Open/Closed Hash Tables (<code className="font-mono">α = n/m</code>) or balanced multiway B-Trees (order <code className="font-mono">m</code>) for <code className="font-mono">O(1)</code> or <code className="font-mono">O(log n)</code> access.
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-300 pt-1 border-t border-slate-800/80">
              <span>Separate Chaining, Linear Probing, B-Trees</span>
              <ArrowRight className="w-3 h-3 ml-auto" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedParadigm('dynamic-programming')}
            className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
              selectedParadigm === 'dynamic-programming'
                ? 'border-violet-500 bg-violet-950/40 ring-1 ring-violet-500/50 shadow-md'
                : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-violet-400 font-bold">
                  3. Dynamic Programming
                </span>
                <GitBranch className="w-4 h-4 text-violet-400" />
              </div>
              <div className="text-sm font-bold text-white">The 4-Step Optimal Framework</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                1. Optimal Substructure → 2. Recurrence &amp; Base Cases → 3. Bottom-Up Table / Memory Function → 4. Backtracking (<code className="font-mono">POP</code>, <code className="font-mono">PRINT-LCS</code>).
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-violet-300 pt-1 border-t border-slate-800/80">
              <span>ALS, MCM, LCS, Knapsack, OBST, Floyd</span>
              <ArrowRight className="w-3 h-3 ml-auto" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedParadigm('greedy')}
            className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
              selectedParadigm === 'greedy'
                ? 'border-amber-500 bg-amber-950/40 ring-1 ring-amber-500/50 shadow-md'
                : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                  4. Greedy Techniques
                </span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-sm font-bold text-white">Feasible, Locally Optimal, Irrevocable</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Expand a partial solution step-by-step using the best immediate local choice (Cut Property, Union-Find, Edge Relaxation, Prefix-Free Tree Merging).
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-amber-300 pt-1 border-t border-slate-800/80">
              <span>Prim, Kruskal, Dijkstra, Huffman</span>
              <ArrowRight className="w-3 h-3 ml-auto" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedParadigm('iterative-improvement')}
            className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
              selectedParadigm === 'iterative-improvement'
                ? 'border-cyan-500 bg-cyan-950/40 ring-1 ring-cyan-500/50 shadow-md'
                : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                  5. Iterative Improvement
                </span>
                <RotateCcw className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-sm font-bold text-white">Simplex, Max-Flow, Matching &amp; Marriage</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Start with a feasible state and repeatedly improve via Simplex pivots, augmenting paths (<code className="font-mono">Max-Flow = Min-Cut</code>), or Gale-Shapley proposals.
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-cyan-300 pt-1 border-t border-slate-800/80">
              <span>Simplex LP, Ford-Fulkerson, Bipartite, Gale-Shapley</span>
              <ArrowRight className="w-3 h-3 ml-auto" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedParadigm('limitations-of-power')}
            className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
              selectedParadigm === 'limitations-of-power'
                ? 'border-rose-500 bg-rose-950/40 ring-1 ring-rose-500/50 shadow-md'
                : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-bold">
                  6. Coping with Limitations
                </span>
                <Cpu className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-sm font-bold text-white">P, NP, Backtracking &amp; Branch-and-Bound</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Classify P vs. NP-Complete problems and prune State-Space Trees using DFS feasibility checks or Best-First optimistic bounds (<code className="font-mono">ub</code> / <code className="font-mono">lb</code>).
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-rose-300 pt-1 border-t border-slate-800/80">
              <span>Subset-Sum, n-Queens, Knapsack B&amp;B, Assignment B&amp;B</span>
              <ArrowRight className="w-3 h-3 ml-auto" />
            </div>
          </button>
        </div>
      </div>

      {/* Active Paradigm Overview & Exam Recognition Rules */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-300 font-semibold">
              {activeData.badge}
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">{activeData.title}</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{activeData.subtitle}</p>
          </div>
          <div className="rounded-lg bg-slate-950 border border-indigo-500/30 px-3.5 py-2.5 text-xs font-mono text-amber-200 shrink-0 max-w-md">
            <div className="text-[10px] uppercase tracking-wider text-indigo-400 mb-0.5 flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              Space-for-Time Trade-Off Equation
            </div>
            {activeData.tradeOffEquation}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5 rounded-lg bg-slate-950/70 border border-slate-800 p-4 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Core Design Philosophy
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">{activeData.coreIdea}</p>
          </div>

          <div className="lg:col-span-7 rounded-lg bg-slate-950/70 border border-slate-800 p-4 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              How to Recognize This Paradigm on an Exam Question
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
              {activeData.whenToUseOnExam.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* The 4-Step Paradigm Blueprint Cards */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            {activeData.blueprintTitle}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Follow these exact 4 steps whenever you are asked to design or explain a {activeData.title.split(':')[0]} solution on the exam
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {activeData.steps.map((step) => (
            <div
              key={step.stepNumber}
              className="rounded-xl border border-slate-800 bg-slate-900/75 p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-mono font-bold text-sm flex items-center justify-center shrink-0">
                    {step.stepNumber}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{step.title}</h4>
                    <p className="text-xs text-indigo-300 font-medium mt-0.5">{step.subtitle}</p>
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-slate-300 leading-relaxed pl-1">
                  {step.bullets.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-indigo-400 font-bold mt-0.5">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-slate-800/80">
                <div className="rounded-lg bg-slate-950/90 border border-indigo-500/30 p-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 mb-1">
                    General Mathematical / Structural Template
                  </div>
                  <pre className="text-xs font-mono text-amber-200 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                    {step.formulaTemplate}
                  </pre>
                </div>

                <div className="rounded-lg bg-slate-950/90 border border-slate-800 p-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1">
                    <Code2 className="w-3 h-3" />
                    Pseudocode Blueprint Pattern
                  </div>
                  <pre className="text-xs font-mono text-emerald-200 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                    {step.pseudocodeTemplate}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Unified Pattern Matrix Across All Algorithms in this Paradigm */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Table className="w-4 h-4 text-emerald-400" />
            {activeData.patternMatrixTitle}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            One-glance summary showing how every lecture topic in this module applies the exact same paradigm rules
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80">
                {activeData.patternMatrixHeaders.map((h, i) => (
                  <th
                    key={i}
                    className="py-2.5 px-3 font-mono font-bold text-indigo-300 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {activeData.patternMatrixRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-800/40">
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      className={`py-2.5 px-3 font-mono leading-relaxed ${
                        cIdx === 0 ? 'font-bold text-white whitespace-nowrap' : 'text-slate-300'
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Paradigm Design Workshop */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Interactive Paradigm Design Challenge
              </span>
              <span className="text-xs font-mono text-slate-400">
                Score: {correctCount} / {totalQuestions} ({answeredCount} answered)
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-1.5">{activeData.workshopTitle}</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {activeData.workshopScenario}
            </p>
          </div>

          {answeredCount > 0 && (
            <button
              type="button"
              onClick={resetWorkshop}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Workshop
            </button>
          )}
        </div>

        <div className="space-y-5">
          {activeData.workshopQuestions.map((q, qIdx) => {
            const selected = selectedAnswers[`${selectedParadigm}-${qIdx}`];
            const isAnswered = selected !== undefined;
            const isCorrect = selected === q.correctIndex;

            return (
              <div
                key={qIdx}
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3"
              >
                <div className="flex items-start gap-2.5">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-xs font-bold shrink-0 mt-0.5">
                    Q{qIdx + 1}
                  </span>
                  <p className="text-sm font-semibold text-white leading-snug">{q.prompt}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                  {q.options.map((opt, optIdx) => {
                    const isThisSelected = selected === optIdx;
                    const isThisCorrectOption = optIdx === q.correctIndex;

                    let btnStyle =
                      'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900';

                    if (isAnswered) {
                      if (isThisCorrectOption) {
                        btnStyle =
                          'border-emerald-500/60 bg-emerald-950/40 text-emerald-200 font-medium';
                      } else if (isThisSelected && !isThisCorrectOption) {
                        btnStyle = 'border-rose-500/60 bg-rose-950/40 text-rose-200';
                      } else {
                        btnStyle = 'border-slate-800/60 bg-slate-900/40 text-slate-500';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(qIdx, optIdx)}
                        className={`text-left p-3 rounded-lg border text-xs font-mono transition-all flex items-start justify-between gap-2 cursor-pointer ${btnStyle}`}
                      >
                        <span className="leading-relaxed">{opt}</span>
                        {isAnswered && isThisCorrectOption && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        )}
                        {isAnswered && isThisSelected && !isThisCorrectOption && (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {isAnswered && (
                  <div
                    className={`rounded-lg p-3 text-xs border flex items-start gap-2.5 ${
                      isCorrect
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                        : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold uppercase tracking-wider text-[11px] block mb-0.5">
                        {isCorrect ? 'Correct Paradigm Design Choice!' : 'Design Explanation:'}
                      </span>
                      <span className="leading-relaxed">{q.explanation}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Official Past Exam Design Questions, Step-by-Step How-To-Solve & Complete Solutions */}
      <div className="rounded-2xl border-2 border-indigo-500/30 bg-slate-900/95 p-5 sm:p-6 space-y-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-indigo-500/20 border border-indigo-500/40 px-2.5 py-0.5 font-mono text-xs font-bold uppercase text-indigo-300">
                Official Past Exam Design Archive
              </span>
              <span className="rounded-md bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 font-mono text-xs font-extrabold text-amber-300">
                M: {midtermDesignCount} Midterm Questions
              </span>
              <span className="rounded-md bg-rose-500/20 border border-rose-500/40 px-2.5 py-0.5 font-mono text-xs font-extrabold text-rose-300">
                F: {finalDesignCount} Final Exam Questions
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mt-2">
              All Past Midterm &amp; Final Exam Algorithm Design Questions, Full Solutions &amp; How-To-Solve Guides
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Every algorithm design, standard-form conversion, modification, and theoretical classification question from the CPCS-324 Midterm and Final exam papers, with step-by-step solving methodology and complete solutions.
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setExamFilter('all')}
              className={`rounded-lg border px-3 py-1.5 font-mono text-xs font-bold transition cursor-pointer ${
                examFilter === 'all'
                  ? 'border-indigo-400 bg-indigo-500/25 text-white'
                  : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
              }`}
            >
              All Exam Qs ({PAST_EXAM_DESIGN_QUESTIONS.length})
            </button>
            <button
              type="button"
              onClick={() => setExamFilter('M')}
              className={`rounded-lg border px-3 py-1.5 font-mono text-xs font-bold transition cursor-pointer ${
                examFilter === 'M'
                  ? 'border-amber-400 bg-amber-500/25 text-amber-200'
                  : 'border-slate-800 bg-slate-950 text-amber-300/80 hover:border-slate-700'
              }`}
            >
              M: Midterm ({midtermDesignCount})
            </button>
            <button
              type="button"
              onClick={() => setExamFilter('F')}
              className={`rounded-lg border px-3 py-1.5 font-mono text-xs font-bold transition cursor-pointer ${
                examFilter === 'F'
                  ? 'border-rose-400 bg-rose-500/25 text-rose-200'
                  : 'border-slate-800 bg-slate-950 text-rose-300/80 hover:border-slate-700'
              }`}
            >
              F: Final ({finalDesignCount})
            </button>
            <button
              type="button"
              onClick={() => setExamFilter('paradigm')}
              className={`rounded-lg border px-3 py-1.5 font-mono text-xs font-bold transition cursor-pointer ${
                examFilter === 'paradigm'
                  ? 'border-emerald-400 bg-emerald-500/25 text-emerald-200'
                  : 'border-slate-800 bg-slate-950 text-emerald-300/80 hover:border-slate-700'
              }`}
            >
              Current Module Only
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredExamQuestions.map((eq, idx) => (
            <div
              key={eq.id}
              className="rounded-xl border border-slate-800 bg-slate-950/80 p-5 space-y-4 hover:border-slate-700 transition"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded px-2 py-0.5 font-mono text-xs font-extrabold ${
                        eq.examType === 'F'
                          ? 'bg-rose-500/25 text-rose-200 border border-rose-400/50'
                          : 'bg-amber-500/25 text-amber-200 border border-amber-400/50'
                      }`}
                    >
                      {eq.examType === 'F' ? `F #${idx + 1}: Final Exam` : `M #${idx + 1}: Midterm Exam`}
                    </span>
                    <span className="rounded border border-slate-700 bg-slate-900 px-2.5 py-0.5 font-mono text-xs font-semibold text-indigo-300">
                      {eq.examPaper}
                    </span>
                    <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-xs font-bold text-emerald-300">
                      {eq.marks}
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-white pt-1">{eq.title}</h4>
                </div>
              </div>

              {/* Exam Question Prompt */}
              <div className="rounded-lg border border-amber-500/30 bg-amber-950/15 p-3.5">
                <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-amber-300 mb-1">
                  Official Exam Question Prompt:
                </div>
                <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-medium">
                  {eq.questionPrompt}
                </p>
              </div>

              {/* Two-column layout: Step-by-step How-to-Solve + Official Solution & Pseudocode */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-6 rounded-lg border border-slate-800 bg-slate-900/80 p-4 space-y-2.5">
                  <div className="font-mono text-xs font-bold uppercase tracking-wider text-indigo-300">
                    How to Solve Step-by-Step on the Exam:
                  </div>
                  <ul className="space-y-2 text-xs text-slate-200 leading-relaxed">
                    {eq.howToSolveSteps.map((stepStr, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-2">
                        <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-500/25 border border-indigo-400/50 font-mono text-[10px] font-bold text-indigo-200">
                          {sIdx + 1}
                        </span>
                        <span>{stepStr}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2 border-t border-slate-800 text-xs text-emerald-200 leading-relaxed">
                    <strong className="text-emerald-400 font-mono uppercase mr-1">Key Takeaway:</strong>
                    {eq.officialSolution}
                  </div>
                </div>

                <div className="lg:col-span-6 rounded-lg border border-emerald-500/30 bg-slate-950 p-4 flex flex-col justify-between">
                  <div>
                    <div className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
                      <Code2 className="h-4 w-4" />
                      Official Exam Solution / Pseudocode / Mathematical Proof:
                    </div>
                    <pre className="font-mono text-xs text-emerald-200 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                      {eq.codeOrFormula}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
