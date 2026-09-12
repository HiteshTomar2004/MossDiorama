export const blogPostsData = [
  {
    id: 'multi-agent-langgraph',
    title: 'Multi-Agent Orchestration with LangGraph: Beyond Linear LLM Chains',
    date: 'Winter 2026',
    readTime: '6 min read',
    tags: ['Agentic AI', 'LangGraph', 'Gemini API', 'System Architecture'],
    excerpt: 'Why single-prompt LLM wrappers collapse under complex research tasks, and how fanning out parallel domain agents with dynamic state graphs delivers verifiable results.',
    content: `When building AI-powered applications, most engineers start with a simple linear prompt chain: take user input, prepend a system prompt, call an LLM, and return the answer.

For simple summarization or basic Q&A, this works. But the moment you tackle real-world investigation—like assessing the comprehensive sustainability of consumer goods for UN SDG 12—linear pipelines immediately collapse into hallucination or shallow generalities.

### The Breakdown of Single-Pass Prompting
Assessing a single consumer product requires three vastly different domains:
1. Material science: What synthetic polymers or organic fibers comprise the textile?
2. Corporate ethics: Has the parent conglomerate had labor violations, carbon footprint penalties, or greenwashing lawsuits?
3. Packaging lifecycle: Is the post-consumer resin recyclable in municipal streams, or does it end up in landfills?

Asking a single prompt to simultaneously query web APIs for all three domains results in token bloat, context dilution, and premature consensus. The model often skips rigorous sourcing to meet token limits.

### The Multi-Agent Graph Architecture
In EcoScout, we broke this down using LangGraph into a fan-out / fan-in state graph:

1. Intake Coordinator: Analyzes the raw product query, normalizes entity names, and generates targeted search parameters for specialized domains.
2. Parallel Specialized Workers: Three distinct worker nodes (Materials Analyst, Supply Chain Auditor, Packaging Specialist) execute concurrently. Each maintains its own localized prompt, queries live web sources via Tavily, extracts citations, and computes domain-specific metrics.
3. Synthesizer Node: Aggregates the parallel node outputs into a unified state schema, resolves conflicting claims against authoritative databases, and calculates a calibrated 0–100 composite index.
4. Streaming Agent Telemetry: By streaming intermediate node state updates over Server-Sent Events (SSE), users see the investigation unfold live—observing which sub-agent is querying which source in real time.

Splitting monolithic prompts into isolated, verifiable agent nodes transforms LLMs from creative guessing engines into deterministic research workhorses.`
  },
  {
    id: 'forensic-anomaly-detection',
    title: 'Forensic Anomaly Detection: Correlating Multi-Source Graph Topologies',
    date: 'Autumn 2025',
    readTime: '7 min read',
    tags: ['Graph Analytics', 'Digital Forensics', 'NetworkX', 'Python'],
    excerpt: 'Detecting fraud rings, money laundering layering, and impossible travel patterns across heterogeneous telecom CDR and banking streams.',
    content: `In financial and cybercrime investigations, malicious actors rarely operate through a single identity or channel. A coordinated fraud ring will deliberately distribute communication across burner SIM cards, route illicit capital through multi-hop banking layers, and coordinate operational movements on encrypted or ephemeral social accounts.

Analyzing each data stream in isolation yields nothing: every single phone call or bank transfer appears completely benign. The signal only emerges when you stitch these heterogeneous streams into a unified spatio-temporal graph.

### The Unified Entity Model
To make disparate datasets comparable, we normalized Call Detail Records (CDR), banking transfers, and social interactions into an interconnected property graph:
- Vertices (Nodes): Represent real-world entities, phone numbers, bank accounts, and cell towers.
- Edges: Represent interactions labeled with timestamps, source types, and monetary or duration weights.

### The Core Detection Algorithms
Once the graph is constructed, we apply heuristic and geometric anomaly detectors:

1. Impossible Travel: By calculating the great-circle distance between consecutive cell tower pings using GeoPy and dividing by the elapsed time, we flag any velocity exceeding 150 km/h as a cloned SIM or shared credential anomaly.
2. Layering & Rapid Flow (A → B → C): In money laundering, illicit funds are quickly moved through intermediary accounts to obscure their origin. We trace directed transaction subgraphs where funds arriving at Node B are transferred to Node C within a critical temporal window (< 30 minutes) with minimal balance retention.
3. Smurfing / Structuring: Identifying multiple inbound transactions just beneath statutory regulatory reporting thresholds (e.g., three separate ₹49,500 transfers within 48 hours).
4. Cross-Channel Correlation: Linking voice calls directly preceding or succeeding high-value financial transfers between associated nodes.

### Interactive Visual Forensics
Using NetworkX on the backend and Vis.js on the frontend, investigators can inspect high-confidence clusters, toggle severity thresholds, and export automated Markdown evidence chains ready for legal review. Graph analysis turns millions of disjointed log lines into an undeniable timeline of truth.`
  },
  {
    id: 'eliminating-n-plus-one',
    title: 'Eliminating the N+1 Bottleneck: Lessons from an E-Commerce Backend Rewrite',
    date: 'Summer 2025',
    readTime: '5 min read',
    tags: ['Backend Architecture', 'Prisma ORM', 'SQL Performance', 'Node.js'],
    excerpt: 'How naive loop queries crippled checkout throughput, and why atomic transactions and immutable receipt snapshotting are non-negotiable in production backends.',
    content: `During the early iterations of building an e-commerce platform, functionality always precedes performance. You build a working cart, you compute shipping, you decrement inventory, and everything looks great in your local test environment with a single user and five mock products.

But the moment you run a load test or simulate concurrent checkouts, naive architectural patterns will catastrophically implode your database.

### The Infamous N+1 Query Anti-Pattern
In the legacy V1 implementation, our checkout route iterated through the user's cart items in a for loop:
- Inside each iteration, it issued a database query to check product inventory.
- It issued a second query to calculate item-specific shipping tariffs.
- It issued a third query to create the order item record.

For a cart with 15 items, this resulted in over 45 roundtrips to the database for a single customer order! Multiply that across 100 simultaneous users, and the database connection pool is instantly exhausted, leading to timeouts and dropped requests.

### The V2 Architecture: Batching and Prisma Transactions
In our V2 backend rewrite, we overhauled the persistence layer using Prisma ORM:

1. Single-Query Batch Retrieval: Instead of looping, we fetch all relevant products and prices in a single prisma.product.findMany({ where: { id: { in: itemIds } } }) operation.
2. Atomic Isolation with $transaction: Inventory decrements and order creation must succeed or fail as an indivisible atomic unit. Using Prisma's interactive transaction API guarantees that if product stock drops below zero during checkout, the entire transaction rolls back cleanly without leaving orphan orders or phantom charges.
3. Immutable Receipt Snapshotting: A subtle yet devastating bug in naive e-commerce code is linking past orders directly to the live Product table. If an administrator later updates a product's name or price, every historical customer receipt retroactively changes! In V2, we enforce strict snapshotting: price, tax, and delivery estimates are frozen into immutable JSON columns at the precise millisecond of checkout.

Writing performant backends isn't about premature micro-optimizations; it's about respecting database roundtrips and ensuring transactional guarantees.`
  },
  {
    id: 'dual-layer-web-architecture',
    title: 'The Dual-Layer Web: Bridging 3D Spatial Canvases with Accessible Editorial Typography',
    date: 'Early 2026',
    readTime: '5 min read',
    tags: ['Web3D', 'Three.js', 'Typography', 'Frontend Design'],
    excerpt: 'Why 3D websites must not trap content in WebGL canvas meshes, and how pairing React Three Fiber with Newsreader and Instrument Serif creates the ultimate digital haven.',
    content: `The biggest trap in creative web development is the all-or-nothing dichotomy: you either build a hyper-creative 3D game in a WebGL canvas that is completely unreadable to search engines and screen readers, or you build a rigid, generic corporate dashboard that feels devoid of human soul.

When designing The Moss Grotto, our goal was to prove that you never have to sacrifice craft for accessibility.

### The Problem with 3D Text
Trapping text inside WebGL meshes—whether through TextGeometry, MSDF font bitmaps, or canvas textures—breaks the fundamental promises of the open web:
- Users cannot highlight, copy, or search text with Cmd+F.
- Screen readers and assistive technologies receive an opaque black box.
- Mobile viewport rendering is notoriously difficult to scale with crisp typography.

### The Dual-Layer Solution
The architecture of this site decouples atmospheric presence from informational clarity:

1. Layer 1: The Ambient Diorama (WebGL Canvas): Powered by Three.js and React Three Fiber. It handles spatial presence, custom GLSL campfire shaders, dynamic particle physics, and isometric scene composition. It sets the emotional tone—a serene nocturnal haven.
2. Layer 2: The Accessible Editorial Surface (Semantic DOM): A dedicated 2D reading experience engineered with world-class editorial typography—Newsreader for long-form prose, Instrument Serif for expressive headlines, and JetBrains Mono for technical runes.

With a single fluid keypress or toggle, visitors can navigate seamlessly between an immersive spatial experience and a print-worthy, distraction-free reading sanctuary.`
  }
]
