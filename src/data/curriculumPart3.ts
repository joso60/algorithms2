import type { AlgorithmMeta } from '../types/algorithm';

export const ALGORITHMS_PART3: AlgorithmMeta[] = [
  // ==========================================================================
  // 19. GREEDY CHANGE-MAKING VS. DYNAMIC PROGRAMMING (Lecture 15)
  // ==========================================================================
  {
    id: 'greedy-change-making',
    title: 'Greedy Change-Making (vs. Dynamic Programming)',
    shortTitle: 'Greedy Change-Making',
    lectureFile: '15-CPCS 324 - Greedy-Intro.pptx (Slides 1–50)',
    category: 'greedy',
    categoryLabel: 'Module 4: Greedy Techniques',
    indexingRule: 'Coins sorted in decreasing order d₁ > d₂ > ... > dₖ (1-based)',
    summary:
      'Repeatedly selects the largest coin denomination dᵢ that does not exceed the remaining amount (Change + dᵢ ≤ N), and compares the Greedy result directly against the optimal Dynamic Programming table.',
    pseudocodeTitle: 'GreedyAlgorithm(N) — Lecture 15 Slide 25 & 36',
    pseudocodeLines: [
      'GreedyAlgorithm(N)',
      '// Sort coins in decreasing order: d₁ > d₂ > d₃ > ... > dₖ',
      'S ← ∅',
      'Change ← 0',
      'i ← 1',
      'while Change ≠ N do',
      '    if Change + dᵢ ≤ N then',
      '        Change ← Change + dᵢ',
      '        S ← S ∪ {dᵢ}',
      '    else',
      '        i ← i + 1',
      'return S',
    ],
    secondaryPseudocodeTitle: 'Dynamic Programming ChangeMaking(D[1..m], n) — Optimal Reference',
    secondaryPseudocodeLines: [
      'F[0] ← 0',
      'for i ← 1 to n do',
      '    temp ← ∞',
      '    for j ← 1 to m while i ≥ D[j] do',
      '        temp ← min(F[i - D[j]], temp)',
      '    F[i] ← temp + 1',
      'return F[n]',
    ],
    examples: [
      {
        id: 'greedy-cm-slide-ex1',
        name: 'Slide Ex 01 (N = 6, D = {1, 3, 4})',
        badge: 'Slide Example',
        description:
          'Lecture 15 Slides 21–32: Target N = 6 with coins {1, 3, 4}. Greedy picks {4, 1, 1} (3 coins — Suboptimal!), whereas Dynamic Programming finds the true optimum {3, 3} (2 coins).',
        inputSummary: 'N = 6, Coins = [1, 3, 4] (Sorted: 4 > 3 > 1)',
        customInputDefaults: {
          amount: '6',
          denoms: '1, 3, 4',
        },
      },
      {
        id: 'greedy-cm-slide-ex2',
        name: 'Slide Ex 02 (N = 12, D = {1, 4, 6})',
        badge: 'Slide Example',
        description:
          'Lecture 15 Slides 33–39: Target N = 12 with coins {1, 4, 6}. Shows both the 2D DP Table C[1..3, 0..12] (Slide 34) and the Greedy trace picking {6, 6} (2 coins).',
        inputSummary: 'N = 12, Coins = [1, 4, 6] (Sorted: 6 > 4 > 1)',
        customInputDefaults: {
          amount: '12',
          denoms: '1, 4, 6',
        },
      },
      {
        id: 'greedy-cm-counterexample-8',
        name: 'Counterexample (N = 8, D = {1, 4, 6})',
        badge: 'Edge Case',
        description:
          'Same coin set {1, 4, 6} from Slide Ex 02, but for target N = 8: Greedy picks {6, 1, 1} (3 coins), failing to find the optimal DP solution {4, 4} (2 coins)!',
        inputSummary: 'N = 8, Coins = [1, 4, 6] (Greedy = 3 coins vs. DP = 2 coins)',
        customInputDefaults: {
          amount: '8',
          denoms: '1, 4, 6',
        },
      },
      {
        id: 'greedy-cm-canonical',
        name: 'Standard US Coins (N = 41, D = {1, 5, 10, 25})',
        badge: 'Standard Case',
        description:
          'Lecture 15 Slide 18: Standard canonical coin system {25, 10, 5, 1} where the Greedy approach is mathematically guaranteed to yield an optimal solution for every N.',
        inputSummary: 'N = 41, Coins = [1, 5, 10, 25] → {25, 10, 5, 1} (4 coins)',
        customInputDefaults: {
          amount: '41',
          denoms: '1, 5, 10, 25',
        },
      },
    ],
    customFields: [
      {
        key: 'amount',
        label: 'Target Amount (N)',
        placeholder: '6',
        helpText: 'Positive integer target amount N (e.g., 6, 8, 12)',
      },
      {
        key: 'denoms',
        label: 'Coin Denominations (comma-separated)',
        placeholder: '1, 3, 4',
        helpText: 'Include 1 so every amount is feasible (automatically sorted d₁ > d₂ > ... > dₖ)',
      },
    ],
    designParadigmName: 'Greedy Technique (Feasible, Locally Optimal, Irrevocable)',
    designSteps: [
      {
        stepNumber: 1,
        title: 'Three Criteria of Every Greedy Choice (Slide 16)',
        subtitle: 'Feasible, Locally Optimal, and Irrevocable',
        content: [
          '1. Feasible: The chosen coin dᵢ must satisfy the problem constraint (Change + dᵢ ≤ N, never exceeding the target amount N).',
          '2. Locally Optimal: Among all feasible coins at the current step, pick the largest denomination dᵢ available.',
          '3. Irrevocable: Once a coin dᵢ is added to the solution set S, it is never removed or reconsidered (unlike DP/backtracking).',
        ],
        formulaBox: 'Feasibility Check: Change + dᵢ ≤ N\nGreedy Choice: Pick largest dᵢ satisfying Change + dᵢ ≤ N',
      },
      {
        stepNumber: 2,
        title: 'Sorting Preprocessing Step',
        subtitle: 'Order denominations in decreasing order d₁ > d₂ > ... > dₖ',
        content: [
          'Before the while-loop begins, sort the coin denominations from largest to smallest: d₁ > d₂ > ... > dₖ.',
          'Maintain pointer i starting at 1 (the largest denomination d₁).',
        ],
        formulaBox: 'd₁ > d₂ > d₃ > ... > dₖ   (with dₖ = 1 to guarantee termination)',
      },
      {
        stepNumber: 3,
        title: 'Iterative Greedy Selection Loop',
        subtitle: 'Keep taking dᵢ while it fits, otherwise advance i ← i + 1',
        content: [
          'While Change ≠ N, test whether Change + dᵢ ≤ N.',
          'If true, add dᵢ to Change and append dᵢ to multiset S (staying on the same index i in case dᵢ can be used again).',
          'If false (Change + dᵢ > N), increment i ← i + 1 to try the next smaller coin denomination.',
        ],
        codeSnippet:
          'while Change ≠ N do\n  if Change + dᵢ ≤ N then\n    Change ← Change + dᵢ; S ← S ∪ {dᵢ}\n  else i ← i + 1',
      },
      {
        stepNumber: 4,
        title: 'Optimality Analysis: Greedy vs. Dynamic Programming',
        subtitle: 'Why Greedy fails for arbitrary coins like {1, 3, 4} when N = 6',
        content: [
          'For canonical coin systems (such as US coins {25, 10, 5, 1}), the greedy choice property holds and Greedy always finds the minimum number of coins.',
          'For arbitrary denominations like D = {1, 3, 4} with N = 6, Greedy irrevocably commits to d₁ = 4 first, forcing S = {4, 1, 1} (3 coins), whereas DP explores all subproblems F[i - dⱼ] and finds {3, 3} (2 coins).',
        ],
        formulaBox: 'N = 6, D = {4, 3, 1}:\nGreedy → {4, 1, 1} (3 coins, Suboptimal)\nDP     → {3, 3}    (2 coins, Optimal)',
      },
    ],
    designChallenge: {
      scenarioTitle: 'Greedy vs. DP on the Change-Making Problem',
      problemStatement:
        'Test your understanding of the 3 Greedy Criteria and when Greedy Change-Making produces a suboptimal solution.',
      questions: [
        {
          prompt:
            'According to Lecture 15 Slide 16, every choice made by a Greedy algorithm must satisfy which three properties?',
          options: [
            'Recursive, Memoized, and Backtracked',
            'Feasible, Locally Optimal, and Irrevocable',
            'Sorted, Randomized, and Reversible',
            'Divide, Conquer, and Combine',
          ],
          correctIndex: 1,
          explanation:
            'A greedy choice must be Feasible (satisfies problem constraints), Locally Optimal (best immediate choice among feasible options), and Irrevocable (cannot be undone once made).',
        },
        {
          prompt:
            'Trace GreedyAlgorithm(6) on coins D = {1, 3, 4} (sorted as d₁ = 4, d₂ = 3, d₃ = 1). How many iterations of the while-loop execute, and what is the final set S?',
          options: [
            '2 iterations, S = {3, 3}',
            '5 iterations (pick 4, reject 4, reject 3, pick 1, pick 1), S = {4, 1, 1}',
            '3 iterations, S = {4, 2}',
            '6 iterations, S = {1, 1, 1, 1, 1, 1}',
          ],
          correctIndex: 1,
          explanation:
            'Step 1: 0+4 ≤ 6 → Change=4, S={4}. Step 2: 4+4 > 6 → i=2 (d₂=3). Step 3: 4+3 > 6 → i=3 (d₃=1). Step 4: 4+1 ≤ 6 → Change=5, S={4,1}. Step 5: 5+1 ≤ 6 → Change=6, S={4,1,1}.',
        },
      ],
    },
    analysis: {
      bestTime: 'Θ(k log k) (sorting) + O(k)',
      avgTime: 'O(k log k + N)',
      worstTime: 'O(k log k + N) (or O(k) using integer division N / dᵢ)',
      extraSpace: 'Θ(1) auxiliary space (vs. Θ(N) or Θ(kN) for DP)',
      tradeOffSummary:
        'Greedy Change-Making is much faster and uses O(1) space compared to DP’s Θ(kN) time and Θ(N) space, but Greedy is NOT guaranteed to find the global optimum for arbitrary coin denominations.',
      basicOperation: 'Feasibility comparison (Change + dᵢ ≤ N)',
      inputSizeParam: 'Target amount N, number of coin denominations k',
      summationSteps: [
        {
          label: 'Step 1: Sorting the k coin denominations',
          math: 'T_{sort}(k) = O(k \\log k)',
          note: 'Arranges coins in decreasing order d₁ > d₂ > ... > dₖ.',
        },
        {
          label: 'Step 2: While-loop iterations',
          math: 'T_{loop}(N, k) \\le N + k \\in O(N + k)',
          note: 'Each iteration either increases Change by at least 1 (at most N times) or increments i (at most k - 1 times).',
        },
        {
          label: 'Step 3: Comparison with Dynamic Programming',
          math: 'T_{DP}(N, k) = \\Theta(k \\cdot N), \\quad S_{DP}(N) = \\Theta(N)',
          note: 'DP guarantees global optimality for any coin set at the cost of a table of size N + 1.',
        },
      ],
      examNote:
        'On exams, if asked "Does the Greedy algorithm always yield an optimal solution for Change-Making?", answer NO and give the slide counterexample: N = 6 with coins {4, 3, 1} (Greedy gives {4, 1, 1} = 3 coins, Optimal is {3, 3} = 2 coins).',
    },
  },

  // ==========================================================================
  // 20. PRIM'S ALGORITHM FOR MINIMUM SPANNING TREE (Lecture 16)
  // ==========================================================================
  {
    id: 'prim',
    title: "Prim's Algorithm (Minimum Spanning Tree)",
    shortTitle: "Prim's MST Algorithm",
    lectureFile: '16-CPCS 324 - Greedy-Prim.pptx (Slides 1–76)',
    category: 'greedy',
    categoryLabel: 'Module 4: Greedy Techniques',
    indexingRule: 'Vertices V_T starts with {v₀}; |V| - 1 iterations',
    summary:
      'Constructs a Minimum Spanning Tree through a sequence of expanding subtrees T = (V_T, E_T), greedily attaching the nearest vertex u* ∉ V_T connected to V_T by the minimum-weight fringe edge e* = (v*, u*).',
    pseudocodeTitle: 'Algorithm Prim(G) — Lecture 16 Slide 25 & 47',
    pseudocodeLines: [
      'Algorithm Prim(G)',
      '// Input: A weighted connected undirected graph G = ⟨V, E⟩',
      '// Output: E_T, the set of edges composing a minimum spanning tree of G',
      'V_T ← {v₀}   // start with tree vertex v₀',
      'E_T ← ∅',
      'for i ← 1 to |V| - 1 do',
      '    find a minimum-weight edge e* = (v*, u*) among all the edges (v, u)',
      '        such that v is in V_T and u is in V - V_T',
      '    V_T ← V_T ∪ {u*}',
      '    E_T ← E_T ∪ {e*}',
      'return E_T',
    ],
    examples: [
      {
        id: 'prim-exam-cfe2025',
        name: 'Fall 2025 CFE Final Exam Q3(a) (5 Vertices a..e with Center e ➔ MST = 13)',
        badge: 'Past Exam',
        description:
          'Official Final Exam problem from Fall 2025 CFE Final Exam Q3(a)! 5-vertex graph with outer square (a, b, c, d) and center vertex e: (a,b)=5, (a,c)=7, (b,d)=6, (c,d)=4, (a,e)=2, (b,e)=3, (c,e)=4, (d,e)=5 → MST Cost = 2 + 3 + 4 + 4 = 13.',
        inputSummary: '5 Vertices (a..e, center e), 8 Edges, Start = a → MST Edges: ae(2), eb(3), ec(4), cd(4) (Cost = 13)',
        customInputDefaults: {
          edges: 'a-b:5, a-c:7, b-d:6, c-d:4, a-e:2, b-e:3, c-e:4, d-e:5',
          startNode: 'a',
        },
        examSimulation: {
          examTitle: 'Fall 2025 CFE Final Exam — Question 3(a)',
          marks: '6 Marks',
          questionText:
            'Apply Prim’s algorithm starting from vertex a to find the Minimum Spanning Tree (MST) of the given weighted connected graph with center vertex e and outer vertices a, b, c, d: (a,b)=5, (a,c)=7, (b,d)=6, (c,d)=4, (a,e)=2, (b,e)=3, (c,e)=4, (d,e)=5.',
          subQuestions: [
            '(a) Show Tree Vertices and Remaining Vertices (Fringe / Unseen) at each step: a(-,-) → e(a,2) → b(e,3) → c(e,4) → d(c,4).',
            '(b) State the Minimum Spanning Tree Cost: 2 + 3 + 4 + 4 = 13.',
          ],
        },
      },
      {
        id: 'prim-exam-5v',
        name: 'Winter 2023 MakeUp Final Q3(a) (5 Vertices a..e ➔ MST = 13)',
        badge: 'Past Exam',
        description:
          'Official Final Exam problem from Winter 2023 Make-Up Final Q3(a)! Apply Prim’s algorithm starting at vertex a on the 5-vertex graph (a..e) to reach Total MST Weight = 13.',
        inputSummary: '5 Vertices (a..e), 7 Edges, Start = a → MST Edges: ab(3), bd(2), bc(4), de(4) (Weight = 13)',
        customInputDefaults: {
          edges: 'a-b:3, a-d:7, b-c:4, b-d:2, c-d:5, c-e:6, d-e:4',
          startNode: 'a',
        },
        examSimulation: {
          examTitle: 'Winter 2023 Make-Up Final Exam — Question 3(a)',
          marks: '6 Marks',
          questionText:
            'Apply Prim’s algorithm to find a Minimum Spanning Tree for the given 5-vertex weighted connected graph with edges: (a,b)=3, (a,d)=7, (b,c)=4, (b,d)=2, (c,d)=5, (c,e)=6, (d,e)=4, starting at vertex a. Show the Tree Vertices V_T and Fringe Priority Queue Q at each step.',
          subQuestions: [
            '(a) Initialize V_T = {a} and show the fringe labels u(p_u, d_u) for all remaining vertices.',
            '(b) Trace all 4 iterations picking (a,b)=3, (b,d)=2, (b,c)=4, and (d,e)=4 to obtain Total MST Weight = 13.',
          ],
        },
      },
      {
        id: 'prim-slide-ex2',
        name: 'Spring 2021 Final Exam Q4(b) & Slide Ex 02 (9 Vertices a..i ➔ MST = 37)',
        badge: 'Past Exam',
        description:
          'Official Final Exam problem from Spring 2021 Final Exam Q4(b) (and Lecture 16 Slides 48–73)! Classic 9-vertex graph (a..i) with 14 edges starting at vertex a → Total MST Weight = 37.',
        inputSummary: '9 Vertices (a..i), 14 Edges, Start = a → MST Weight = 37',
        customInputDefaults: {
          edges:
            'a-b:4, a-h:8, b-h:11, b-c:8, h-i:7, h-g:1, i-c:2, i-g:6, c-f:4, c-d:7, g-f:2, d-f:14, d-e:9, f-e:10',
          startNode: 'a',
        },
        examSimulation: {
          examTitle: 'Spring 2021 Final Exam — Question 4(b)',
          marks: '8 Marks',
          questionText:
            'Trace Prim’s algorithm starting from vertex a on the 9-vertex weighted graph (a, b, c, d, e, f, g, h, i). List the edges added to E_T in exact order and compute the total weight of the Minimum Spanning Tree.',
          subQuestions: [
            '(a) Show each vertex added to V_T and the fringe edge e* = (v*, u*) selected in each of the 8 iterations.',
            '(b) Verify that the 8 selected edges sum to Total MST Weight = 37.',
          ],
        },
      },
      {
        id: 'prim-slide-ex1',
        name: 'Slide Ex 01 (6 Vertices a..f)',
        badge: 'Slide Example',
        description:
          'Lecture 16 Slides 26–46: 6-vertex graph (a, b, c, d, e, f) starting at v₀ = a. Shows every cut candidate edge (v ∈ V_T, u ∈ V - V_T) and builds the MST step by step.',
        inputSummary: '6 Vertices (a..f), 10 Edges, Start = a → MST Weight = 15',
        customInputDefaults: {
          edges: 'a-b:3, a-f:5, a-e:6, b-c:1, b-f:4, c-f:4, c-d:6, f-d:5, f-e:2, e-d:8',
          startNode: 'a',
        },
      },
    ],
    customFields: [
      {
        key: 'edges',
        label: 'Undirected Weighted Edges (u-v:w, comma-separated)',
        placeholder: 'a-b:3, a-f:5, a-e:6, b-c:1, b-f:4, c-f:4, c-d:6, f-d:5, f-e:2, e-d:8',
        helpText: 'Format: u-v:weight separated by commas',
      },
      {
        key: 'startNode',
        label: 'Starting Vertex (v₀)',
        placeholder: 'a',
        helpText: 'Initial vertex placed in V_T (defaults to first vertex)',
      },
    ],
    designParadigmName: 'Greedy Expanding Subtree (Cut Property)',
    designSteps: [
      {
        stepNumber: 1,
        title: 'Initialize Single-Vertex Subtree T₀',
        subtitle: 'Start with V_T = {v₀} and E_T = ∅',
        content: [
          'Pick an arbitrary starting vertex v₀ (usually the first vertex a) and initialize V_T ← {v₀} and E_T ← ∅.',
          'At every stage, V_T induces a single connected tree, and V - V_T contains all remaining vertices not yet in the tree.',
        ],
        formulaBox: 'Initial State: V_T = {v₀},   E_T = ∅',
      },
      {
        stepNumber: 2,
        title: 'Identify All Fringe (Cut) Edges Crossing (V_T, V - V_T)',
        subtitle: 'Maintain for each u ∈ V - V_T its nearest tree neighbor v ∈ V_T',
        content: [
          'Consider only edges e = (v, u) that have exactly ONE endpoint v ∈ V_T and the other endpoint u ∈ V - V_T.',
          'Edges with both endpoints already in V_T are ignored (they would form a cycle), and edges with both endpoints in V - V_T cannot yet be attached to the current tree.',
        ],
        formulaBox: 'Candidate Cut Set = { (v, u) ∈ E  |  v ∈ V_T  and  u ∈ V - V_T }',
      },
      {
        stepNumber: 3,
        title: 'Make the Greedy Choice: Attach Nearest Vertex u*',
        subtitle: 'Pick minimum-weight edge e* = (v*, u*) across the cut',
        content: [
          'Select the edge e* = (v*, u*) with the minimum weight w(v*, u*) among all candidate cut edges.',
          'Add u* to V_T and add e* to E_T. Because u* was not in V_T, adding e* never creates a cycle.',
        ],
        formulaBox: 'e* = argmin_{(v, u): v ∈ V_T, u ∈ V - V_T} w(v, u)\nV_T ← V_T ∪ {u*},   E_T ← E_T ∪ {e*}',
      },
      {
        stepNumber: 4,
        title: 'Repeat |V| - 1 Times & Choose Optimal Data Structure',
        subtitle: 'Use Priority Queue (Min-Heap) + Adjacency Lists for O(|E| lg |V|)',
        content: [
          'After |V| - 1 iterations, V_T = V and E_T contains |V| - 1 edges forming a Minimum Spanning Tree.',
          'Using a Min-Heap priority queue keyed by shortest edge weight connecting each u ∈ V - V_T to V_T reduces time complexity to O(|E| lg |V|).',
        ],
        formulaBox: 'Total MST Edges = |V| - 1\nMin-Heap + Adjacency List Time = O(|E| lg |V|)',
      },
    ],
    designChallenge: {
      scenarioTitle: "Prim's Algorithm Design & Complexity Quiz",
      problemStatement:
        "Check your mastery of Prim's cut rule, cycle prevention, and priority queue complexity.",
      questions: [
        {
          prompt:
            "Why doesn't Prim's algorithm need an explicit Union-Find cycle detection check like Kruskal's algorithm?",
          options: [
            "Because Prim's algorithm only works on acyclic input graphs.",
            'Because Prim always selects an edge (v*, u*) where v* ∈ V_T and u* ∈ V - V_T (one endpoint inside the tree and one endpoint outside), which can never form a cycle!',
            'Because Prim sorts all edges in decreasing order.',
            'Because Prim deletes edges from the graph.',
          ],
          correctIndex: 1,
          explanation:
            'Every edge added by Prim connects a vertex already in V_T to a brand-new vertex u* ∉ V_T. Attaching a new leaf vertex to an existing tree can never create a cycle.',
        },
        {
          prompt:
            "According to Lecture 16 Slide 76, what is the time efficiency of Prim's algorithm when the graph is represented by adjacency lists and the priority queue is implemented as a binary min-heap?",
          options: [
            'Θ(|V|³)',
            'O(|E| lg |V|)',
            'Θ(|V| + |E|)',
            'O(2^|V|)',
          ],
          correctIndex: 1,
          explanation:
            'With adjacency lists and a binary min-heap, |V|-1 DeleteMin operations take O(|V| lg |V|) and at most |E| DecreaseKey updates take O(|E| lg |V|), giving O(|E| lg |V|) overall.',
        },
      ],
    },
    analysis: {
      bestTime: 'O(|E| lg |V|) (Min-Heap + Adjacency Lists)',
      avgTime: 'O(|E| lg |V|) (or Θ(|V|²) with Weight Matrix)',
      worstTime: 'O(|E| lg |V|) (Min-Heap) / Θ(|V|²) (Weight Matrix + Unordered Array)',
      extraSpace: 'Θ(|V|) for V_T / Fringe Priority Queue',
      tradeOffSummary:
        'Adjacency Matrix + Unordered Array runs in Θ(|V|²) (optimal for dense graphs where |E| ≈ |V|²), while Adjacency Lists + Min-Heap runs in O(|E| lg |V|) (much faster for sparse graphs).',
      basicOperation: 'Weight comparison & priority queue key update (DecreaseKey / DeleteMin)',
      inputSizeParam: '|V| (number of vertices), |E| (number of edges)',
      summationSteps: [
        {
          label: 'Case 1: Weight Matrix + Unordered Priority Array (Slide 76)',
          math: 'T(|V|) = \\sum_{i=1}^{|V|-1} (|V| - i) = \\frac{|V|(|V|-1)}{2} \\in \\Theta(|V|^2)',
          note: 'In each of the |V|-1 iterations, scanning the fringe array for the minimum weight and updating distances takes O(|V|).',
        },
        {
          label: 'Case 2: Adjacency Lists + Binary Min-Heap (Slide 76)',
          math: 'T(|V|, |E|) = (|V| - 1) \\cdot O(\\lg |V|) + |E| \\cdot O(\\lg |V|) \\in O(|E| \\lg |V|)',
          note: 'Performs |V|-1 DeleteMin operations and at most |E| DecreaseKey heap bubble-up operations (since for a connected graph |V|-1 ≤ |E|).',
        },
        {
          label: 'Case 3: Naive Scan of All Edges on Each Iteration (Slide 75)',
          math: 'T(|V|, |E|) = (|V| - 1) \\cdot O(|E|) = O(|V| \\cdot |E|)',
          note: 'If all |E| edges are rescanned from scratch on every iteration without maintaining fringe labels.',
        },
      ],
      examNote:
        'Memorize both complexities from Slide 76: Weight Matrix + Unordered Array = Θ(|V|²); Adjacency Lists + Min-Heap = O(|E| lg |V|).',
    },
  },

  // ==========================================================================
  // 21. KRUSKAL'S ALGORITHM FOR MINIMUM SPANNING TREE (Lecture 17)
  // ==========================================================================
  {
    id: 'kruskal',
    title: "Kruskal's Algorithm (Minimum Spanning Tree)",
    shortTitle: "Kruskal's MST Algorithm",
    lectureFile: '17-CPCS 324 - Greedy-Kruskal.pptx (Slides 1–85)',
    category: 'greedy',
    categoryLabel: 'Module 4: Greedy Techniques',
    indexingRule: 'Sort E in nondecreasing order w(e_{i₁}) ≤ ... ≤ w(e_{i_{|E|}}); stop at |V| - 1 accepted edges',
    summary:
      'Constructs a Minimum Spanning Tree as an expanding acyclic subgraph (forest of trees) by sorting all edges by weight and greedily adding the next lightest edge that does not create a cycle.',
    pseudocodeTitle: 'Algorithm Kruskal(G) — Lecture 17 Slide 15 & 84',
    pseudocodeLines: [
      'Algorithm Kruskal(G)',
      '// Input: A weighted connected graph G = ⟨V, E⟩',
      '// Output: E_T, the set of edges composing a minimum spanning tree of G',
      'sort E in nondecreasing order of the edge weights w(e_{i₁}) ≤ ... ≤ w(e_{i_{|E|}})',
      'E_T ← ∅;  ecounter ← 0   // initialize the set of tree edges and its size',
      'k ← 0                    // initialize the number of processed edges',
      'while ecounter < |V| - 1 do',
      '    k ← k + 1',
      '    if E_T ∪ {e_{i_k}} is acyclic then',
      '        E_T ← E_T ∪ {e_{i_k}};  ecounter ← ecounter + 1',
      'return E_T',
    ],
    examples: [
      {
        id: 'kruskal-exam-cfe2025',
        name: 'Fall 2025 CFE Final Q3 (5 Vertices a..e with Center e ➔ MST = 13)',
        badge: 'Past Exam',
        description:
          'Official 5-vertex connected weighted exam graph from Fall 2025 CFE Final Exam Q3 with center vertex e and outer square a, b, c, d.',
        inputSummary: '5 Vertices (a..e, center e), 8 Edges → Accepted: ae(2), be(3), cd(4), ce(4) (Weight = 13)',
        customInputDefaults: {
          edges: 'a-b:5, a-c:7, b-d:6, c-d:4, a-e:2, b-e:3, c-e:4, d-e:5',
        },
        examSimulation: {
          examTitle: 'Fall 2025 CFE Final Exam — Question 3',
          marks: '6 Marks',
          questionText:
            'Apply Kruskal’s algorithm to find the Minimum Spanning Tree of the 5-vertex graph with center vertex e and edges: (a,b)=5, (a,c)=7, (b,d)=6, (c,d)=4, (a,e)=2, (b,e)=3, (c,e)=4, (d,e)=5. Show the sorted edge list, disjoint sets at each step, and which edges are accepted or rejected.',
          subQuestions: [
            '(a) Sort the 8 edges in nondecreasing order of weight: (a,e):2, (b,e):3, (c,d):4, (c,e):4, (a,b):5, (d,e):5, (b,d):6, (a,c):7.',
            '(b) Trace Find(u) ≠ Find(v) and Union(u, v) until |V| - 1 = 4 edges are accepted (Total Weight = 13).',
          ],
        },
      },
      {
        id: 'kruskal-exam-5v',
        name: 'Winter 2023 MakeUp Final Q3 (5 Vertices a..e ➔ MST = 13)',
        badge: 'Past Exam',
        description:
          '5-vertex connected weighted exam graph from Winter 2023 Make-Up Final Q3 demonstrating edge sorting, Disjoint-Set component merging, and cycle rejection.',
        inputSummary: '5 Vertices (a..e), 7 Edges → Accepted: bd(2), ab(3), bc(4), de(4) (Weight = 13)',
        customInputDefaults: {
          edges: 'a-b:3, a-d:7, b-c:4, b-d:2, c-d:5, c-e:6, d-e:4',
        },
        examSimulation: {
          examTitle: 'Winter 2023 Make-Up Final Exam — Question 3',
          marks: '6 Marks',
          questionText:
            'Apply Kruskal’s algorithm to find the Minimum Spanning Tree of the 5-vertex graph (a..e) with edges: (a,b)=3, (a,d)=7, (b,c)=4, (b,d)=2, (c,d)=5, (c,e)=6, (d,e)=4. Show the sorted edge list, disjoint sets at each step, and which edges are accepted or rejected.',
          subQuestions: [
            '(a) Sort the 7 edges in nondecreasing order of weight: (b,d):2, (a,b):3, (b,c):4, (d,e):4, (c,d):5, (c,e):6, (a,d):7.',
            '(b) Trace Find(u) ≠ Find(v) and Union(u, v) until |V| - 1 = 4 edges are accepted (Total Weight = 13).',
          ],
        },
      },
      {
        id: 'kruskal-exam-fall2020-neg',
        name: 'Fall 2020 Final Exam Q3(b) (Graph with Negative Edge Weights)',
        badge: 'Past Exam',
        description:
          'Official Final Exam problem from Fall 2020 Final Exam Q3(b)! Proves that Kruskal’s (and Prim’s) algorithms work properly on graphs with negative edge weights!',
        inputSummary: '5 Vertices (a..e) with negative weights: b-d:-4, a-b:-2, d-e:1, b-c:3, c-d:4 → MST Weight = -2',
        customInputDefaults: {
          edges: 'a-b:-2, a-d:5, b-c:3, b-d:-4, c-d:4, c-e:6, d-e:1',
        },
        examSimulation: {
          examTitle: 'Fall 2020 Final Exam — Question 3(b)',
          marks: '4 Marks',
          questionText:
            'Do Prim’s and Kruskal’s algorithms work properly on graphs that have negative edge weights? Demonstrate by tracing Kruskal’s algorithm on a graph containing negative weights.',
          subQuestions: [
            '(a) Explain why both Prim’s and Kruskal’s greedy cut/cycle properties remain 100% valid even when edge weights are negative (unlike Dijkstra’s algorithm!).',
            '(b) Trace Kruskal’s algorithm sorting negative weights first (-4, -2, 1, 3) while still rejecting any edge that forms a cycle.',
          ],
        },
      },
      {
        id: 'kruskal-slide-ex1',
        name: 'Slide Ex 01 (6 Vertices a..f)',
        badge: 'Slide Example',
        description:
          'Lecture 17 Slides 16–43: 6-vertex graph (a..f). Sorts all 10 edges, accepts bc(1), ef(2), ab(3), bf(4), df(5) (Total = 15), and rejects cf(4) & af(5) due to cycle creation!',
        inputSummary: '6 Vertices (a..f), 10 Edges → Accepted: bc, ef, ab, bf, df (Weight = 15)',
        customInputDefaults: {
          edges: 'a-b:3, a-f:5, a-e:6, b-c:1, b-f:4, c-f:4, c-d:6, d-f:5, e-f:2, d-e:8',
        },
      },
      {
        id: 'kruskal-slide-ex2',
        name: 'Slide Ex 02 (9 Vertices a..i CLRS Graph)',
        badge: 'Slide Example',
        description:
          'Lecture 17 Slides 44–82: 9-vertex graph (a..i) with 14 edges. Accepts 8 edges (Total = 37) and highlights every skipped edge that would create a cycle ((g,i):6, (h,i):7, (b,c):8).',
        inputSummary: '9 Vertices (a..i), 14 Edges → 8 Tree Edges, 3 Cycle-Skipped (Weight = 37)',
        customInputDefaults: {
          edges:
            'a-b:4, a-h:8, b-h:11, b-c:8, h-i:7, g-h:1, c-i:2, g-i:6, c-f:4, c-d:7, f-g:2, d-f:14, d-e:9, e-f:10',
        },
      },
    ],
    customFields: [
      {
        key: 'edges',
        label: 'Undirected Weighted Edges (u-v:w, comma-separated)',
        placeholder: 'a-b:3, a-f:5, a-e:6, b-c:1, b-f:4, c-f:4, c-d:6, d-f:5, e-f:2, d-e:8',
        helpText: 'Format: u-v:weight separated by commas (automatically sorted by weight)',
      },
    ],
    designParadigmName: 'Greedy Expanding Forest (Sort Edges + Disjoint-Set Acyclicity Check)',
    designSteps: [
      {
        stepNumber: 1,
        title: 'Sort All Edges in Nondecreasing Order of Weight',
        subtitle: 'Preprocessing step: w(e_{i₁}) ≤ w(e_{i₂}) ≤ ... ≤ w(e_{i_{|E|}})',
        content: [
          'Unlike Prim (which grows a single connected tree from v₀), Kruskal looks globally at the lightest available edges across the entire graph.',
          'First, sort all |E| edges in nondecreasing order of weight in O(|E| lg |E|) time.',
        ],
        formulaBox: 'w(e_{i₁}) ≤ w(e_{i₂}) ≤ ... ≤ w(e_{i_{|E|}})',
      },
      {
        stepNumber: 2,
        title: 'Initialize Forest of |V| Disjoint Single-Vertex Trees',
        subtitle: 'Start with E_T = ∅, ecounter = 0, and each vertex in its own component',
        content: [
          'Initially, each vertex v ∈ V forms its own isolated component {v}.',
          'At any intermediate stage, the subgraph (V, E_T) is a forest of disconnected trees (not necessarily a single connected tree until the final step).',
        ],
        formulaBox: 'Initial Components: {v₁}, {v₂}, ..., {v_{|V|}}   |   E_T = ∅, ecounter = 0',
      },
      {
        stepNumber: 3,
        title: 'Test Acyclicity (Find(u) ≠ Find(v)) & Merge Components',
        subtitle: 'Accept edge e_{i_k} = (u, v) iff u and v belong to different trees',
        content: [
          'Scan the sorted edge list k = 1, 2, ... while ecounter < |V| - 1.',
          'An edge e = (u, v) is acyclic with respect to E_T if and only if u and v currently belong to DIFFERENT connected components (Find(u) ≠ Find(v)).',
          'If Find(u) ≠ Find(v), accept e into E_T, increment ecounter, and Union their components. If Find(u) == Find(v), reject e (Cycle Created!).',
        ],
        formulaBox: 'If Find(u) ≠ Find(v): Accept e, Union(u, v), ecounter++\nIf Find(u) == Find(v): Reject e (creates a cycle)',
      },
      {
        stepNumber: 4,
        title: 'Stop Early When ecounter == |V| - 1',
        subtitle: 'Any remaining heavier edges in the sorted list do not need to be checked',
        content: [
          'As soon as ecounter reaches |V| - 1, all |V| vertices are connected into a single Minimum Spanning Tree.',
          'The while-loop terminates immediately without inspecting the remaining heavier edges.',
        ],
        formulaBox: 'Termination Condition: ecounter == |V| - 1',
      },
    ],
    designChallenge: {
      scenarioTitle: "Prim's vs. Kruskal's MST Design Comparison",
      problemStatement:
        "Test your understanding of how Kruskal's intermediate subgraphs and time complexity work.",
      questions: [
        {
          prompt:
            "What is the structural difference between the intermediate subgraphs produced by Prim's algorithm vs. Kruskal's algorithm?",
          options: [
            "Prim's intermediate subgraph is always a single connected tree, whereas Kruskal's intermediate subgraph is a forest (collection of disconnected trees) that merges into one tree at the end.",
            'Kruskal always maintains a single connected tree, while Prim maintains a forest.',
            'Both algorithms always maintain a single connected tree at every step.',
            'Kruskal allows cycles in intermediate steps and removes them at the end.',
          ],
          correctIndex: 0,
          explanation:
            'Lecture 17 Slide 6: Prim grows one connected tree from v₀, whereas Kruskal picks the lightest edges anywhere in the graph, forming a forest of acyclic components that gradually coalesce into a single tree.',
        },
        {
          prompt:
            "In Slide Example 01 (6 vertices a..f), after accepting bc(1), ef(2), ab(3), and bf(4), why is the next sorted edge cf(4) rejected?",
          options: [
            'Because weight 4 is too large.',
            'Because vertices c and f are already in the same connected component {a, b, c, e, f} via path c—b—f, so adding cf(4) would create cycle b-c-f-b!',
            'Because ecounter has already reached |V| - 1 = 5.',
            'Because vertex f already has degree 2.',
          ],
          correctIndex: 1,
          explanation:
            'Since (b, c) and (b, f) are already in E_T, vertices c and f are already connected. Adding (c, f) would form the cycle b–c–f–b.',
        },
      ],
    },
    analysis: {
      bestTime: 'O(|E| lg |E|) (or O(|E| lg |V|))',
      avgTime: 'O(|E| lg |E|)',
      worstTime: 'O(|E| lg |E|) (dominated by sorting the |E| edges)',
      extraSpace: 'Θ(|E| + |V|) (sorted edge list + Union-Find parent/rank arrays)',
      tradeOffSummary:
        'With an efficient Union-Find (Disjoint-Set) data structure, testing acyclicity and merging sets across all |E| edges takes nearly linear time, so sorting the |E| edges in O(|E| lg |E|) dominates.',
      basicOperation: 'Edge weight comparison during sorting & Disjoint-Set Find/Union',
      inputSizeParam: '|V| (number of vertices), |E| (number of edges)',
      summationSteps: [
        {
          label: 'Step 1: Sorting the |E| edges by weight (Slide 85)',
          math: 'T_{sort}(|E|) = O(|E| \\lg |E|)',
          note: 'Using MergeSort, QuickSort, or HeapSort on the |E| edges.',
        },
        {
          label: 'Step 2: While-loop Acyclicity Checks & Component Unions',
          math: 'T_{UF}(|V|, |E|) = O(|E| \\alpha(|V|)) \\subset O(|E| \\lg |E|)',
          note: 'Executes at most |E| Find/Union checks before ecounter reaches |V| - 1.',
        },
        {
          label: 'Step 3: Total Time Complexity (Slide 85)',
          math: 'T(|V|, |E|) = O(|E| \\lg |E|) = O(|E| \\lg |V|)',
          note: 'Since |E| ≤ |V|(|V|-1)/2 < |V|², lg |E| ≤ 2 lg |V| = O(lg |V|).',
        },
      ],
      examNote:
        'Lecture 17 Slide 85 states explicitly: With an efficient sorting algorithm, the time efficiency of Kruskal’s algorithm is in O(|E| lg |E|).',
    },
  },

  // ==========================================================================
  // 22. DIJKSTRA'S ALGORITHM FOR SINGLE-SOURCE SHORTEST PATHS (Lecture 18)
  // ==========================================================================
  {
    id: 'dijkstra',
    title: "Dijkstra's Algorithm (Single-Source Shortest Paths)",
    shortTitle: "Dijkstra's Shortest Path",
    lectureFile: '18-CPCS 324 - Greedy-Dijkstra-Huffman.pptx (Slides 1–41)',
    category: 'greedy',
    categoryLabel: 'Module 4: Greedy Techniques',
    indexingRule: 'Labels (p_v, d_v) where d_s = 0 and d_v = ∞ for v ≠ s; requires non-negative edge weights',
    summary:
      'Finds the shortest paths from a single source vertex s to all other vertices in a graph with non-negative edge weights by greedily extracting the fringe vertex u* with minimum distance d_{u*} and relaxing its outgoing edges.',
    pseudocodeTitle: 'Algorithm Dijkstra(G, s) — Lecture 18 Slide 13 & 40',
    pseudocodeLines: [
      'Algorithm Dijkstra(G, s)',
      '// Input: A weighted connected graph G = ⟨V, E⟩ with nonnegative weights and its vertex s',
      '// Output: The length d_v of a shortest path from s to v and its penultimate vertex p_v',
      'Initialize(Q)   // initialize vertex priority queue to empty',
      'for every vertex v in V do',
      '    d_v ← ∞;  p_v ← null',
      '    Insert(Q, v, d_v)   // initialize vertex priority in the priority queue',
      'd_s ← 0;  Decrease(Q, s, d_s)   // update priority of s with d_s',
      'V_T ← ∅',
      'for i ← 0 to |V| - 1 do',
      '    u* ← DeleteMin(Q)   // delete the minimum priority element',
      '    V_T ← V_T ∪ {u*}',
      '    for every vertex u in V - V_T that is adjacent to u* do',
      '        if d_{u*} + w(u*, u) < d_u then',
      '            d_u ← d_{u*} + w(u*, u);  p_u ← u*',
      '            Decrease(Q, u, d_u)',
    ],
    examples: [
      {
        id: 'dijkstra-slide-ex2',
        name: 'Fall 2025 Final Exam Q3 & Slide 36 (Directed 5 Vertices s, t, x, y, z)',
        badge: 'Past Exam',
        description:
          'Official 10-point Final Exam problem from Fall 2025 Final Exam Q3 (and Lecture 18 Slides 36–37)! 5-vertex directed graph (s, t, x, y, z) starting from source s → d = [s:0, y:5, z:7, t:8, x:9].',
        inputSummary: '5 Vertices (s, t, x, y, z), Directed, Source = s → d = [s:0, y:5, z:7, t:8, x:9]',
        customInputDefaults: {
          edges: 's-t:10, s-y:5, t-x:1, t-y:2, y-t:3, y-x:9, y-z:2, x-z:4, z-s:7, z-x:6',
          source: 's',
          directed: 'true',
        },
        examSimulation: {
          examTitle: 'Fall 2025 Final Exam — Question 3',
          marks: '10 Marks',
          questionText:
            'Apply Dijkstra’s algorithm to find the shortest paths from source vertex s to all other vertices in the directed weighted graph with edges: (s,t)=10, (s,y)=5, (t,x)=1, (t,y)=2, (y,t)=3, (y,x)=9, (y,z)=2, (x,z)=4, (z,s)=7, (z,x)=6. Show Tree Vertices V_T, Remaining Vertices Q, and all shortest paths.',
          subQuestions: [
            '(a) Initialize s(-, 0) and t(-, ∞), x(-, ∞), y(-, ∞), z(-, ∞).',
            '(b) Trace the 5 extractions in order: s(0) → y(s, 5) → z(y, 7) → t(y, 8) → x(t, 9).',
            '(c) List the shortest path and total distance from s to every vertex: s→y (5), s→y→z (7), s→y→t (8), s→y→t→x (9).',
          ],
        },
      },
      {
        id: 'dijkstra-exam-winter2023-final',
        name: 'Winter 2023 Final Exam Q3(b) (Undirected 5 Vertices s, t, x, y, z)',
        badge: 'Past Exam',
        description:
          'Official Final Exam problem from Winter 2023 Final Exam Q3(b)! Undirected version of the 5-vertex graph (s, t, x, y, z) with edges s-t:10, s-y:5, s-z:7, t-y:2, t-x:1, y-x:9, y-z:2, x-z:4 → d = [s:0, y:5, t:7, z:7, x:8]!',
        inputSummary: '5 Vertices (s, t, x, y, z), Undirected, Source = s → d = [s:0, y:5, t:7, z:7, x:8]',
        customInputDefaults: {
          edges: 's-t:10, s-y:5, s-z:7, t-y:2, t-x:1, y-x:9, y-z:2, x-z:4',
          source: 's',
          directed: 'false',
        },
        examSimulation: {
          examTitle: 'Winter 2023 Final Exam — Question 3(b)',
          marks: '6 Marks',
          questionText:
            'Apply Dijkstra’s algorithm to find the shortest paths from source vertex s to all other vertices in the undirected weighted graph with edges: (s,t)=10, (s,y)=5, (s,z)=7, (t,y)=2, (t,x)=1, (y,x)=9, (y,z)=2, (x,z)=4.',
          subQuestions: [
            '(a) Show the priority queue Q and tree set V_T after each DeleteMin operation.',
            '(b) Write each shortest path from s and its total length: s→y (5), s→y→t (7), s→z or s→y→z (7), s→y→t→x (8).',
          ],
        },
      },
      {
        id: 'dijkstra-exam-fall2020-final',
        name: 'Fall 2020 Final Exam Q7 (Directed 5 Vertices a..e, Source = a)',
        badge: 'Past Exam',
        description:
          'Official Final Exam problem from Fall 2020 Final Exam Q7! 5-vertex directed graph (a, b, c, d, e) with edges a→b:3, a→d:7, b→c:4, b→d:2, c→d:5, c→e:6, d→c:2, d→e:4 → d = [a:0, b:3, d:5, c:7, e:9].',
        inputSummary: '5 Vertices (a..e), Directed, Source = a → d = [a:0, b:3, d:5, c:7, e:9]',
        customInputDefaults: {
          edges: 'a-b:3, a-d:7, b-c:4, b-d:2, c-e:6, d-c:2, d-e:4',
          source: 'a',
          directed: 'true',
        },
        examSimulation: {
          examTitle: 'Fall 2020 Final Exam — Question 7',
          marks: '8 Marks',
          questionText:
            'Solve the Single-Source Shortest-Paths problem using Dijkstra’s algorithm for the directed graph with vertices {a, b, c, d, e} starting from source a. Show the Tree Vertices V_T and Remaining Vertices table.',
          subQuestions: [
            '(a) Trace each iteration as vertices a(0), b(a,3), d(b,5), c(b,7), and e(d,9) are moved into V_T.',
            '(b) List all shortest paths from source a: a→b (3), a→b→d (5), a→b→c (7), a→b→d→e (9).',
          ],
        },
      },
      {
        id: 'dijkstra-exam-winter2023-makeup',
        name: 'Winter 2023 MakeUp Final Q3(b) (Undirected 9 Vertices a..i, Source = a)',
        badge: 'Past Exam',
        description:
          'Official Final Exam problem from Winter 2023 Make-Up Final Q3(b)! Apply Dijkstra’s algorithm to the 9-vertex graph (a..i) starting at source a.',
        inputSummary: '9 Vertices (a..i), Undirected, Source = a → Shortest Paths to all 9 vertices',
        customInputDefaults: {
          edges:
            'a-b:4, a-h:8, b-h:11, b-c:8, h-i:7, h-g:1, i-c:2, i-g:6, c-f:4, c-d:7, g-f:2, d-f:14, d-e:9, f-e:10',
          source: 'a',
          directed: 'false',
        },
        examSimulation: {
          examTitle: 'Winter 2023 Make-Up Final Exam — Question 3(b)',
          marks: '8 Marks',
          questionText:
            'Apply Dijkstra’s algorithm to find the shortest path from source vertex a to all other vertices in the 9-vertex undirected graph (a..i). Notice how Dijkstra’s Shortest-Path Tree differs from Prim’s MST on the exact same graph!',
          subQuestions: [
            '(a) Trace all 9 extractions from Q and compare cumulative distances d_{u*} + w(u*, u) < d_u.',
          ],
        },
      },
      {
        id: 'dijkstra-slide-ex1',
        name: 'Slide Ex 01 (Undirected 5 Vertices a..e, Source = a)',
        badge: 'Slide Example',
        description:
          'Lecture 18 Slides 14–35: 5-vertex undirected graph (a, b, c, d, e) starting from source a. Shows V_T and Priority Queue Q = {v(p_v, d_v)} at every step.',
        inputSummary: '5 Vertices (a..e), Undirected, Source = a → d = [a:0, b:3, d:5, c:7, e:9]',
        customInputDefaults: {
          edges: 'a-b:3, a-d:7, b-c:4, b-d:2, c-d:5, c-e:6, d-e:4',
          source: 'a',
          directed: 'false',
        },
      },
      {
        id: 'dijkstra-intro-graph',
        name: 'Lecture 15 Intro Graph (A..D Global vs. Local Trap)',
        badge: 'Edge Case',
        description:
          'Lecture 15 Slides 8–15: Shows why a naive memoryless greedy hop (A→B:5 then B→D:15 = 20) fails, whereas Dijkstra tracks cumulative distance d_u from source A and finds A→C(10)→D(1) = 11!',
        inputSummary: '4 Vertices (A..D), Source = A → Shortest Path to D is A→C→D (11, not 20)',
        customInputDefaults: {
          edges: 'A-B:5, A-C:10, B-D:15, C-D:1',
          source: 'A',
          directed: 'true',
        },
      },
    ],
    customFields: [
      {
        key: 'edges',
        label: 'Weighted Edges (u-v:w, comma-separated)',
        placeholder: 'a-b:3, a-d:7, b-c:4, b-d:2, c-d:5, c-e:6, d-e:4',
        helpText: 'Format: u-v:weight (non-negative weights)',
      },
      {
        key: 'source',
        label: 'Source Vertex (s)',
        placeholder: 'a',
        helpText: 'Starting vertex s where d_s = 0',
      },
      {
        key: 'directed',
        label: 'Directed Graph? (true / false)',
        placeholder: 'false',
        helpText: 'Enter "true" for directed edges (u → v) or "false" for undirected edges',
      },
    ],
    designParadigmName: 'Greedy Shortest-Path Tree Expansion (Edge Relaxation)',
    designSteps: [
      {
        stepNumber: 1,
        title: 'Initialize Labels (p_v, d_v) and Priority Queue Q',
        subtitle: 'Set d_s = 0 for source s and d_v = ∞ for all other vertices',
        content: [
          'For every vertex v ∈ V, maintain two labels: d_v (length of the shortest path from source s to v found so far) and p_v (penultimate/parent vertex on that path).',
          'Initialize d_s ← 0, p_s ← -, and for all v ≠ s set d_v ← ∞, p_v ← -. Insert all vertices into Priority Queue Q ordered by d_v.',
        ],
        formulaBox: 'Q_init = { s(-, 0),  v₁(-, ∞),  v₂(-, ∞), ... }   |   V_T = ∅',
      },
      {
        stepNumber: 2,
        title: 'Extract Closest Fringe Vertex u* ← DeleteMin(Q)',
        subtitle: 'Add u* to V_T (its shortest path distance d_{u*} is now permanently finalized)',
        content: [
          'Remove the vertex u* with the smallest priority d_{u*} from Q and add it to V_T.',
          'Because all edge weights are non-negative (w(u, v) ≥ 0), no detour through any remaining vertex in V - V_T can ever produce a shorter path to u*.',
        ],
        formulaBox: 'u* = DeleteMin(Q),   V_T ← V_T ∪ {u*}',
      },
      {
        stepNumber: 3,
        title: 'Relax Outgoing Edges from u* to Neighbors u ∈ V - V_T',
        subtitle: 'Test if going through u* improves the known distance d_u',
        content: [
          'For every vertex u ∈ V - V_T adjacent to u*, compare the new path length through u* (d_{u*} + w(u*, u)) with the current estimate d_u.',
          'If d_{u*} + w(u*, u) < d_u, update d_u ← d_{u*} + w(u*, u), set parent p_u ← u*, and call Decrease(Q, u, d_u).',
        ],
        formulaBox: 'Relaxation Condition:\nif d_{u*} + w(u*, u) < d_u then\n    d_u ← d_{u*} + w(u*, u);  p_u ← u*',
      },
      {
        stepNumber: 4,
        title: 'Reconstruct Shortest Paths via Parent Pointers p_v',
        subtitle: 'Follow p_v backward from any destination v to source s',
        content: [
          'Once all |V| vertices have been moved into V_T, d_v holds the exact shortest path distance from s to v.',
          'Following the penultimate vertices p_v backward from v to s yields the exact shortest path (and together all edges (p_v, v) form the Shortest-Path Spanning Tree rooted at s).',
        ],
        formulaBox: 'Prim vs. Dijkstra Key Difference:\nPrim updates with edge weight:        w(u*, u) < d_u\nDijkstra updates with cumulative sum: d_{u*} + w(u*, u) < d_u',
      },
    ],
    designChallenge: {
      scenarioTitle: "Dijkstra's Algorithm & Relaxation Quiz",
      problemStatement:
        "Test your knowledge of Dijkstra's edge relaxation formula, non-negative weight requirement, and similarity to Prim's algorithm.",
      questions: [
        {
          prompt:
            "Compare the pseudocode of Prim's algorithm and Dijkstra's algorithm. What is the exact difference in how they update priority queue labels for a neighbor u ∈ V - V_T of u*?",
          options: [
            'Prim checks if w(u*, u) < d_u (weight of single connecting edge), whereas Dijkstra checks if d_{u*} + w(u*, u) < d_u (cumulative distance from source s through u*).',
            'Prim uses a Max-Heap while Dijkstra uses a Min-Heap.',
            'Dijkstra only works on trees.',
            'There is no difference; they always produce the exact same tree.',
          ],
          correctIndex: 0,
          explanation:
            'Prim minimizes the weight of the individual edge connecting u to the tree, whereas Dijkstra minimizes the total path length d_{u*} + w(u*, u) from the source vertex s!',
        },
        {
          prompt:
            "According to Lecture 18 Slide 10, why is Dijkstra's algorithm ONLY applicable to graphs with non-negative edge weights?",
          options: [
            'Because negative numbers cannot be stored in a priority queue.',
            'Because once u* is moved into V_T, Dijkstra assumes its distance d_{u*} can never be improved; a negative-weight edge later in V - V_T could violate this assumption and create a shorter path to u*!',
            'Because negative weights always create infinite self-loops.',
            'Because sorting negative numbers takes exponential time.',
          ],
          correctIndex: 1,
          explanation:
            'Dijkstra’s greedy permanence property relies on w(x, y) ≥ 0 so that extending a path always increases or preserves its total weight.',
        },
      ],
    },
    analysis: {
      bestTime: 'O(|E| lg |V|) (Min-Heap + Adjacency Lists)',
      avgTime: 'O(|E| lg |V|) (or Θ(|V|²) with Weight Matrix)',
      worstTime: 'O(|E| lg |V|) (Min-Heap) / Θ(|V|²) (Weight Matrix + Unordered Array)',
      extraSpace: 'Θ(|V|) for Priority Queue Q and labels (p_v, d_v)',
      tradeOffSummary:
        'Identical asymptotic complexity to Prim’s algorithm: Θ(|V|²) using a weight matrix and unordered array priority queue, or O(|E| lg |V|) using adjacency lists and a binary min-heap.',
      basicOperation: 'Edge relaxation comparison (d_{u*} + w(u*, u) < d_u) and priority queue operations',
      inputSizeParam: '|V| (number of vertices), |E| (number of edges)',
      summationSteps: [
        {
          label: 'Case 1: Weight Matrix + Unordered Array Priority Queue (Slide 41)',
          math: 'T(|V|) = \\Theta(|V|^2)',
          note: '|V| DeleteMin scans take ∑_{i=1}^{|V|} i = Θ(|V|²) and adjacency row scans take Θ(|V|²).',
        },
        {
          label: 'Case 2: Adjacency Lists + Binary Min-Heap Priority Queue (Slide 41)',
          math: 'T(|V|, |E|) = |V| \\cdot O(\\lg |V|) + |E| \\cdot O(\\lg |V|) \\in O(|E| \\lg |V|)',
          note: '|V| DeleteMin operations + at most |E| Decrease(Q, u, d_u) operations, each taking O(lg |V|) in a binary min-heap.',
        },
      ],
      examNote:
        'Lecture 18 Slide 41: Time efficiency is Θ(|V|²) for weight matrix + array priority queue, and O(|E| lg |V|) for adjacency lists + min-heap priority queue.',
    },
  },

  // ==========================================================================
  // 23. HUFFMAN TREES AND CODES (Lecture 18 Slides 42–115)
  // ==========================================================================
  {
    id: 'huffman',
    title: 'Huffman Trees & Prefix Codes (Variable-Length Encoding)',
    shortTitle: 'Huffman Trees & Codes',
    lectureFile: '18-CPCS 324 - Greedy-Dijkstra-Huffman.pptx (Slides 42–115)',
    category: 'greedy',
    categoryLabel: 'Module 4: Greedy Techniques',
    indexingRule: 'Left edge = 0, Right edge = 1; Merge two smallest-weight trees at each step',
    summary:
      'Constructs an optimal variable-length prefix-free binary code by repeatedly merging the two trees with the smallest frequencies/probabilities, assigning shorter codewords to more frequent symbols.',
    pseudocodeTitle: "Huffman's Algorithm — Lecture 18 Slide 58",
    pseudocodeLines: [
      '// Initialize n one-node trees and label them with the symbols of the alphabet',
      '// Record the frequency/probability of each symbol in its tree’s root to indicate the tree’s weight',
      'Insert all n one-node trees into a Priority Queue Q ordered by weight (nondecreasing)',
      'while |Q| > 1 do',
      '    T_L ← DeleteMin(Q)   // tree with smallest weight (becomes Left child, edge = 0)',
      '    T_R ← DeleteMin(Q)   // tree with next smallest weight (becomes Right child, edge = 1)',
      '    Create a new tree root T_new with weight(T_new) = weight(T_L) + weight(T_R)',
      '    Attach T_L as left subtree (edge 0) and T_R as right subtree (edge 1) of T_new',
      '    Insert(Q, T_new)     // re-insert combined tree into sorted priority queue Q',
      'return the remaining single tree in Q as the Huffman Tree',
    ],
    secondaryPseudocodeTitle: 'Average Codeword Length & Compression Ratio (Slides 93 & 105)',
    secondaryPseudocodeLines: [
      'Fixed-Length Bits per Symbol:  L_fixed = ⌈log₂(n)⌉',
      'Huffman Average Bits/Symbol:   L_avg   = ∑_{i=1..n} (length(code_i) × p_i)',
      'Compression Ratio (% saved):   ((L_fixed - L_avg) / L_fixed) × 100%',
    ],
    examples: [
      {
        id: 'huffman-slide-ex1',
        name: 'Slide Ex 01 (A:0.35, B:0.1, C:0.2, D:0.2, _:0.15)',
        badge: 'Slide Example',
        description:
          'Lecture 18 Slides 60–75, 84–93, 104–105: 5-symbol alphabet {A, B, C, D, _}. Builds both Fixed-Length (3 bits) and Variable-Length Huffman Tree (2.25 bits/symbol, 25% compression), encodes "DAD", and decodes "10011011011101" → "BAD_AD".',
        inputSummary: 'A:0.35, B:0.1, C:0.2, D:0.2, _:0.15 → Avg = 2.25 bits (25% Compression)',
        customInputDefaults: {
          symbols: 'A:0.35, B:0.1, C:0.2, D:0.2, _:0.15',
          encodeText: 'DAD',
          decodeBits: '10011011011101',
        },
      },
      {
        id: 'huffman-slide-ex2-summer2018',
        name: 'Slide Ex 02 & Summer 2018 Final Q3 (a:45, b:13, c:12, d:16, e:9, f:5)',
        badge: 'Past Exam',
        description:
          'Lecture 18 Slides 76–83, 94–103 & Summer 2018 Final Exam Q3: 6 characters {a..f} with frequencies 45, 13, 12, 16, 9, 5. Computes codes, avg length (2.24 vs 3 bits = 25.33% compression), encodes "BADFACE", and decodes "1100110111011111010100" → "FEEDBAC".',
        inputSummary: 'a:45, b:13, c:12, d:16, e:9, f:5 → Encode "BADFACE" & Decode "FEEDBAC"',
        customInputDefaults: {
          symbols: 'a:45, b:13, c:12, d:16, e:9, f:5',
          encodeText: 'badface',
          decodeBits: '1100110111011111010100',
        },
        examSimulation: {
          examTitle: 'Summer 2018 Final Exam — Question 3',
          marks: '6 Marks',
          questionText:
            'Construct the Huffman Tree and prefix-free binary codes for the 6 characters {a, b, c, d, e, f} with frequencies {45, 13, 12, 16, 9, 5}. Compute the average codeword length, compression ratio against fixed-length encoding, encode "BADFACE", and decode "1100110111011111010100".',
          subQuestions: [
            '(a) Merge the two smallest-weight trees 5 times (f:5+e:9=14, c:12+b:13=25, 14+d:16=30, 25+30=55, a:45+55=100).',
            '(b) Read codewords: a=0, c=100, b=101, f=1100, e=1101, d=111 (L_avg = 2.24 bits/symbol, Compression = 25.33%).',
          ],
        },
      },
      {
        id: 'huffman-exercise-02',
        name: 'Student Exercise 02 (A:0.4, B:0.1, C:0.2, D:0.15, _:0.15)',
        badge: 'Slide Example',
        description:
          'Lecture 18 Slide 114: 5-symbol alphabet with probabilities A:0.4, B:0.1, C:0.2, D:0.15, _:0.15. Includes encoding "ABACABAD" and decoding "100010111001010".',
        inputSummary: 'A:0.4, B:0.1, C:0.2, D:0.15, _:0.15 → Encode "ABACABAD" & Decode "100010111001010"',
        customInputDefaults: {
          symbols: 'A:0.4, B:0.1, C:0.2, D:0.15, _:0.15',
          encodeText: 'ABACABAD',
          decodeBits: '100010111001010',
        },
      },
      {
        id: 'huffman-exercise-03',
        name: 'Student Exercise 03 (A:0.1, B:0.1, C:0.2, D:0.2, E:0.4)',
        badge: 'Slide Example',
        description:
          'Lecture 18 Slide 115: 5-symbol alphabet with probabilities A:0.1, B:0.1, C:0.2, D:0.2, E:0.4.',
        inputSummary: 'A:0.1, B:0.1, C:0.2, D:0.2, E:0.4 → Complete Huffman Tree & Compression Ratio',
        customInputDefaults: {
          symbols: 'A:0.1, B:0.1, C:0.2, D:0.2, E:0.4',
          encodeText: 'DECADE',
          decodeBits: '01101110',
        },
      },
    ],
    customFields: [
      {
        key: 'symbols',
        label: 'Symbols & Frequencies/Probabilities (symbol:weight, comma-separated)',
        placeholder: 'A:0.35, B:0.1, C:0.2, D:0.2, _:0.15',
        helpText: 'Enter either probabilities (e.g. A:0.35) or integer counts (e.g. a:45, b:13)',
      },
      {
        key: 'encodeText',
        label: 'Text String to Encode (Optional)',
        placeholder: 'DAD',
        helpText: 'Characters from your alphabet to encode into binary bits',
      },
      {
        key: 'decodeBits',
        label: 'Bit String to Decode (Optional)',
        placeholder: '10011011011101',
        helpText: 'Binary string of 0s and 1s to decode using the Huffman tree',
      },
    ],
    designParadigmName: 'Greedy Bottom-Up Tree Merging (Optimal Prefix-Free Coding)',
    designSteps: [
      {
        stepNumber: 1,
        title: 'Prefix-Free Property (Leaves-Only Symbol Placement)',
        subtitle: 'Why variable-length codes need no delimiter between codewords',
        content: [
          'In Fixed-Length Encoding, every symbol uses ⌈log₂ n⌉ bits (e.g., 3 bits for 5 or 6 symbols), wasting bits on high-frequency characters.',
          'In Variable-Length Encoding, to decode a bit stream unambiguously without separators, no codeword can be a prefix of another codeword (Prefix-Free Code).',
          'Any binary tree with edges labeled 0 (left) and 1 (right) and symbols placed ONLY at the LEAVES automatically defines a prefix-free code!',
        ],
        formulaBox: 'Prefix-Free Rule: Every symbol is a LEAF node (no symbol is an ancestor of another).',
      },
      {
        stepNumber: 2,
        title: 'Initialize Priority Queue of n Single-Node Trees',
        subtitle: 'Sort all symbols in nondecreasing order of frequency/probability',
        content: [
          'Create n one-node trees, each labeled with a symbol and its frequency/probability weight.',
          'Sort the queue in nondecreasing order of weight so the two least frequent symbols are at the front.',
        ],
        formulaBox: 'Q₀ = [ T₁(w₁), T₂(w₂), ..., Tₙ(wₙ) ]   where w₁ ≤ w₂ ≤ ... ≤ wₙ',
      },
      {
        stepNumber: 3,
        title: 'Greedy Merge: Combine Two Smallest-Weight Trees (n - 1 Times)',
        subtitle: 'Left child = smaller weight (edge 0), Right child = second smallest (edge 1)',
        content: [
          'In each of the n - 1 iterations, extract the two trees T_L and T_R with the smallest weights from Q.',
          'Create a new parent node with weight = weight(T_L) + weight(T_R), attach T_L on the left (edge 0) and T_R on the right (edge 1), and insert the new tree back into Q in sorted order.',
          'By placing the lowest-frequency symbols first, they sink deepest in the tree (longest codewords), while high-frequency symbols merge last near the root (shortest codewords).',
        ],
        formulaBox: 'weight(T_new) = weight(T_L) + weight(T_R)   (repeated n - 1 times)',
      },
      {
        stepNumber: 4,
        title: 'Read Codewords, Compute Average Bits & Compression Ratio',
        subtitle: 'Compare L_avg against Fixed-Length L_fixed = ⌈log₂ n⌉',
        content: [
          'Read each symbol’s binary codeword by tracing the path from the root to its leaf (0 for left, 1 for right).',
          'Compute the expected bits per symbol L_avg = ∑ pᵢ · lᵢ and compare it with fixed-length encoding L_fixed = ⌈log₂ n⌉ using the compression ratio formula.',
        ],
        formulaBox:
          'L_avg = ∑ (pᵢ × length(codeᵢ))\nL_fixed = ⌈log₂ n⌉\nCompression Ratio = ((L_fixed - L_avg) / L_fixed) × 100%',
      },
    ],
    designChallenge: {
      scenarioTitle: 'Huffman Coding & Compression Ratio Quiz',
      problemStatement:
        'Test your mastery of prefix-free decoding, tree construction, and compression ratio math from Lecture 18.',
      questions: [
        {
          prompt:
            'In Slide Example 01 (5 symbols A:0.35, B:0.1, C:0.2, D:0.2, _:0.15), the Huffman codewords have lengths A:2, B:3, C:2, D:2, _:3 (average = 2.25 bits/symbol). What is the fixed-length bits/symbol and the resulting compression ratio?',
          options: [
            'Fixed-length = 3 bits/symbol; Compression Ratio = ((3 - 2.25) / 3) × 100% = 25%',
            'Fixed-length = 5 bits/symbol; Compression Ratio = 55%',
            'Fixed-length = 2 bits/symbol; Compression Ratio = 12.5%',
            'Fixed-length = 4 bits/symbol; Compression Ratio = 43.75%',
          ],
          correctIndex: 0,
          explanation:
            'With 5 symbols, fixed-length encoding requires ⌈log₂ 5⌉ = 3 bits per symbol (since 2² = 4 < 5 ≤ 2³ = 8). Thus ((3 - 2.25) / 3) × 100% = 25%!',
        },
        {
          prompt:
            'Given Huffman codewords a=0, b=101, c=100, d=111, e=1101, f=1100 (Summer 2018 Final Q3 / Slide 103), how does the decoder uniquely decode the bit string "11001101..." without spaces?',
          options: [
            'By guessing every possible split of the string.',
            'By starting at the root of the Huffman tree, following 1→1→0→0 until reaching leaf "f", outputting "f", and immediately resetting to the root for the next bit!',
            'By reading 3 bits at a time.',
            'By scanning from right to left.',
          ],
          correctIndex: 1,
          explanation:
            'Because Huffman codes are prefix-free (all symbols are at the leaves), traversing from the root uniquely hits a leaf at the exact end of each codeword.',
        },
      ],
    },
    analysis: {
      bestTime: 'O(n lg n)',
      avgTime: 'O(n lg n)',
      worstTime: 'O(n lg n) (using a Min-Heap Priority Queue for n symbols)',
      extraSpace: 'Θ(n) (full binary tree with 2n - 1 nodes)',
      tradeOffSummary:
        'Builds the provably optimal prefix-free variable-length code in O(n lg n) time, typically achieving 20%–80% compression on natural text.',
      basicOperation: 'Priority Queue DeleteMin & Insert of tree weights',
      inputSizeParam: 'n (number of alphabet symbols)',
      summationSteps: [
        {
          label: 'Step 1: Initial Priority Queue Construction',
          math: 'T_{init}(n) = O(n \\lg n) \\text{ (or } O(n) \\text{ heapify)}',
          note: 'Inserts n single-node trees into the priority queue.',
        },
        {
          label: 'Step 2: n - 1 Tree Merge Iterations',
          math: 'T_{merge}(n) = \\sum_{i=1}^{n-1} 3 \\cdot O(\\lg n) = O(n \\lg n)',
          note: 'Each of the n - 1 merges performs two DeleteMin operations and one Insert operation on the heap.',
        },
        {
          label: 'Step 3: Total Nodes in the Huffman Tree',
          math: '\\text{Total Nodes} = n \\text{ leaves} + (n - 1) \\text{ internal nodes} = 2n - 1 \\in \\Theta(n)',
          note: 'A full binary tree with n leaves always has exactly n - 1 internal merge nodes.',
        },
      ],
      examNote:
        'Always show: (1) All sorted queue states during the n - 1 merges, (2) 0/1 labels on every left/right branch, (3) Codeword table, (4) Average bits L_avg = ∑ pᵢ·lᵢ, and (5) Compression Ratio = ((L_fixed - L_avg)/L_fixed) × 100%.',
    },
  },
];
