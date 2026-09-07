import { PreloadedSyllabus } from '../types';

export const SAMPLE_CURRICULA: PreloadedSyllabus[] = [
  {
    id: 'cs-algo',
    name: 'CS 201: Data Structures & Algorithms',
    category: 'Computer Science',
    estimatedDays: 14,
    suggestedDailyHours: 2.5,
    rawText: `Module 1: Foundations & Asymptotic Analysis
- Big-O, Big-Omega, Big-Theta runtime derivations
- Master Theorem and recursion trees for divide-and-conquer
- Space complexity analysis and memory hierarchies

Module 2: Linear & Hash-Based Structures
- Dynamic Arrays: amortized doubling cost and pointer arithmetic
- Singly and Doubly Linked Lists: cycle detection (Floyd's algorithm)
- Hash Maps: collision resolution (separate chaining vs open addressing)
- Universal hashing and load factor balancing

Module 3: Non-Linear Structures & Trees
- Binary Search Trees: insert, delete, in-order predecessor traversal
- AVL Trees & Red-Black Trees: rotation mechanics and balance invariants
- Priority Queues & Binary Heaps: heapify, sift-up, sift-down implementations

Module 4: Graph Theory & Algorithms
- Graph representations: Adjacency list vs matrix trade-offs
- Breadth-First Search (BFS) and shortest unweighted path
- Depth-First Search (DFS), topological sorting, cycle detection
- Dijkstra's algorithm with min-heap priority queue
- Minimum Spanning Trees: Kruskal's with Disjoint Set Union (DSU) and Prim's

Module 5: Dynamic Programming & Optimization
- Overlapping subproblems vs optimal substructure
- 1D DP: Coin change, longest increasing subsequence
- 2D DP: 0/1 Knapsack problem, Edit Distance matrix calculation
- Memoization (top-down) vs Tabulation (bottom-up) optimization

Module 6: Exam Review & Mock Tests
- Comprehensive timed problem set
- Proof-writing for invariant properties and runtimes
- Final mock technical exam`
  },
  {
    id: 'orgo-chem',
    name: 'CHEM 232: Organic Chemistry II',
    category: 'Pre-Med / Chemistry',
    estimatedDays: 16,
    suggestedDailyHours: 3.0,
    rawText: `Module 1: Carbonyl Chemistry & Nucleophilic Addition
- Aldehydes and Ketones: reactivity trends and steric hindrance
- Hydration, acetal and hemiacetal formation under acid catalysis
- Imine and enamine formation with primary and secondary amines
- Grignard and organolithium additions to carbonyls

Module 2: Carboxylic Acids & Derivatives
- Relative reactivity: acyl chlorides, anhydrides, esters, amides
- Nucleophilic acyl substitution mechanisms (addition-elimination)
- Fischer esterification and saponification mechanics
- Reduction pathways with LiAlH4 vs NaBH4 vs DIBAL-H

Module 3: Alpha-Carbon Chemistry & Enolates
- Keto-enol tautomerism and alpha-deprotonation acidity (pKa trends)
- Aldol condensation: crossed aldol and intramolecular cyclization
- Claisen condensation and Dieckmann cyclization
- Michael additions and Robinson annulation sequences

Module 4: Aromatic Chemistry & EAS
- Hückel's 4n+2 rule for aromaticity, antiaromaticity
- Electrophilic Aromatic Substitution (EAS): nitration, halogenation, sulfonation
- Friedel-Crafts alkylation vs acylation: rearrangements and limitations
- Substituent effects: activating/deactivating, ortho/para vs meta directors

Module 5: Spectroscopy & Structure Elucidation
- 1H NMR: chemical shift, integration, splitting patterns (n+1 rule)
- 13C NMR: DEPT-90, DEPT-135 spectral interpretation
- Infrared (IR) Spectroscopy: identifying diagnostic functional group stretches

Module 6: Comprehensive Synthesis & Exam Drill
- Multi-step retrosynthetic analysis
- Common reagent roadmaps and reaction checklists
- Timed practice ACS-style exam`
  },
  {
    id: 'mcat-bio',
    name: 'MCAT Biology & Human Physiology',
    category: 'Pre-Med',
    estimatedDays: 18,
    suggestedDailyHours: 3.5,
    rawText: `Module 1: Cellular & Molecular Biology
- Eukaryotic vs prokaryotic organelles, membrane transport (active vs passive)
- Cellular respiration: Glycolysis, Pyruvate Dehydrogenase, Krebs Cycle, ETC/ATP Synthase
- Fermentation pathways and metabolic ATP stoichiometry
- DNA replication, transcription, RNA processing, and translation mechanisms

Module 2: Genetics & Evolution
- Mendelian inheritance, Punnett squares, sex-linked traits, pedigree charts
- Non-Mendelian genetics: codominance, incomplete dominance, penetrance/expressivity
- Hardy-Weinberg equilibrium equations and population genetics
- Genetic recombination, map distances, and chromosomal aberrations

Module 3: Human Organ Systems: Regulatory & Transport
- Nervous system: Action potentials, ion channel kinetics, synaptic transmission, CNS vs PNS
- Endocrine system: Peptide vs steroid hormones, hypothalamic-pituitary axis
- Circulatory system: Cardiac cycle, ECG interpretation, Hemoglobin-O2 dissociation curves
- Respiratory system: Gas exchange, alveoli surfactant mechanics, bicarbonate buffer equation

Module 4: Human Organ Systems: Excretion & Defense
- Renal system: Nephron filtration, countercurrent multiplier, RAAS aldosterone-ADH regulation
- Immune system: Innate vs adaptive immunity, B-cells, T-cells, antibody structure
- Musculoskeletal system: Sarcomere sliding filament model, calcium regulation, bone remodeling

Module 5: High-Yield Review & Passage Strategies
- Critical data analysis of gel electrophoresis, Western blots, and PCR experiments
- High-frequency metabolic pathways consolidation
- Full-length FL Section Practice Review`
  },
  {
    id: 'calc-multi',
    name: 'MATH 152: Multivariable Calculus',
    category: 'Mathematics / Engineering',
    estimatedDays: 12,
    suggestedDailyHours: 2.0,
    rawText: `Module 1: Vectors and 3D Geometry
- Dot product, cross product, lines and planes in 3-space
- Quadric surfaces and cylindrical/spherical coordinates

Module 2: Vector-Valued Functions & Motion
- Curves in space, tangent vectors, arc length, curvature
- Velocity, acceleration, and tangential/normal components

Module 3: Partial Derivatives & Gradient
- Limits and continuity of multivariable functions
- Partial derivatives, tangent planes, linear approximations
- Directional derivatives, gradient vector, Lagrange multipliers for constrained optimization

Module 4: Multiple Integrals
- Double integrals over rectangular and general regions
- Double integrals in polar coordinates
- Surface area and triple integrals in cylindrical/spherical coordinates

Module 5: Vector Calculus Theorems
- Vector fields, line integrals, fundamental theorem for line integrals
- Green's Theorem in the plane (flux and circulation forms)
- Curl and divergence
- Stokes' Theorem and Divergence Theorem

Module 6: Final Review
- Synthesis problems connecting gradient, curl, and boundary integrals
- Comprehensive practice exam`
  }
];
