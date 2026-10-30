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
};

export const DesignView: React.FC<DesignViewProps> = ({ algorithm }) => {
  // Default to the paradigm category of the currently selected sidebar algorithm,
  // but allow the user to freely switch between the 3 Core Course Paradigms!
  const [selectedParadigm, setSelectedParadigm] = useState<ModuleCategory>(algorithm.category);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});

  useEffect(() => {
    setSelectedParadigm(algorithm.category);
  }, [algorithm.category]);

  const activeData = PARADIGM_MASTER_DATA[selectedParadigm];

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
      {/* Top 3-Paradigm Master Switcher */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                Design Mode — The 3 Core Course Paradigms
              </span>
              <span className="text-xs font-mono text-slate-400">
                Unified Strategy Guide (Lectures 01–14)
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-1.5 flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              How to Design Algorithms Using the 3 Core Paradigms
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Select one of the three core paradigms below to study its general design blueprint, see how every course problem maps onto it, and practice exam design scenarios.
            </p>
          </div>
        </div>

        {/* 3 Big Paradigm Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
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
    </div>
  );
};
