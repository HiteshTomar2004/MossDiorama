export const projectsData = [
  {
    id: 'digital-footprint-intel',
    title: 'Digital Footprint Intelligence Platform',
    category: 'Full-Stack / AI',
    summary: 'Forensics & fraud-ring detection engine correlating CDR, banking transactions, and social media intelligence with 7 anomaly algorithms.',
    description: 'A comprehensive digital forensics platform that ingests and correlates multi-source datasets (Call Detail Records with tower locations, bank transfers, and social media posts) to detect fraud rings, money laundering layering (A→B→C), and suspicious behavior using 7 anomaly algorithms, interactive NetworkX graph topologies, and real-time Socket.IO streaming simulation.',
    techStack: ['Python 3.11', 'Flask', 'Flask-SocketIO', 'NetworkX', 'GeoPy', 'React 18', 'Vis.js', 'Pandas'],
    githubUrl: 'https://github.com/HiteshTomar2004/Digital-Footprint-Intelligence-Platform',
    liveUrl: 'https://github.com/HiteshTomar2004/Digital-Footprint-Intelligence-Platform',
    accentColor: '#df9d52',
    rune: '◈ I'
  },
  {
    id: 'sourcemate-ai',
    title: 'SourceMate AI',
    category: 'Full-Stack / AI',
    summary: 'NotebookLM-style workspace chatbot streaming Google Gemini responses over Server-Sent Events (SSE) with IndexedDB caching.',
    description: 'An intelligent document workspace and multi-source research chatbot inspired by NotebookLM. Users create notebooks, upload PDF/image sources into browser IndexedDB, and stream context-grounded Gemini AI answers via Server-Sent Events (SSE). Containerized with Docker and architected for scalable AWS ECR / ECS Fargate deployment.',
    techStack: ['React', 'Vite', 'Node.js', 'Express', 'Gemini API', 'Server-Sent Events', 'IndexedDB', 'Docker'],
    githubUrl: 'https://github.com/HiteshTomar2004/SourceMateAI',
    liveUrl: 'https://github.com/HiteshTomar2004/SourceMateAI',
    accentColor: '#52b788',
    rune: '◈ II'
  },
  {
    id: 'ecoscout',
    title: 'EcoScout — Sustainable Shopping Analyst',
    category: 'Full-Stack / AI',
    summary: 'Multi-agent LangGraph application for UN SDG 12 executing parallel web research via Tavily and Gemini synthesis.',
    description: 'Developed for the IBM Agentic AI Workloads initiative, EcoScout provides an evidence-backed 0–100 sustainability index and greener alternatives for consumer products. Deploys a LangGraph state graph fanning out parallel specialized sub-agents (Materials Analyst, Corporate Ethics, Packaging Recyclability) with live Tavily web search and Gemini synthesis.',
    techStack: ['LangGraph', 'Python', 'FastAPI', 'Google Gemini', 'Tavily Search', 'React', 'Tailwind CSS', 'SSE'],
    githubUrl: 'https://github.com/HiteshTomar2004/EcoIndex',
    liveUrl: 'https://github.com/HiteshTomar2004/EcoIndex',
    accentColor: '#82d8b4',
    rune: '◈ III'
  },
  {
    id: 'bluestock-mf-analytics',
    title: 'Mutual Fund Analytics & Risk Platform',
    category: 'Open Source',
    summary: 'Automated ETL pipeline, quantitative financial risk models (VaR, Sharpe, Sortino, HHI), and Power BI executive dashboard.',
    description: 'Capstone project developed during the Bluestock FinTech internship. Ingests raw mutual fund datasets and live NAV feeds via MFAPI into a clean SQLite warehouse. Computes institutional-grade risk and performance metrics (CAGR, Sharpe, Sortino, VaR/CVaR, Tracking Error, HHI portfolio concentration) and visualizes insights in an interactive 5-page Power BI dashboard.',
    techStack: ['Python', 'Pandas', 'NumPy', 'SQLite', 'Power BI', 'Financial Analytics', 'ETL Pipelines', 'Jupyter'],
    githubUrl: 'https://github.com/HiteshTomar2004/Bluestock_mf_capstone',
    liveUrl: 'https://github.com/HiteshTomar2004/Bluestock_mf_capstone',
    accentColor: '#c89658',
    rune: '◈ IV'
  },
  {
    id: 'biohealth-agent',
    title: 'BioHealthAgent — Healthcare Assistant',
    category: 'Full-Stack / AI',
    summary: 'Modular WhatsApp healthcare chatbot with Google Gemini AI, emergency triage (<1ms regex), and CoWIN vaccination integration.',
    description: 'A modular WhatsApp healthcare service bridging emergency response and clinical guidance. Features sub-millisecond regex emergency triage triggers, automated CoWIN vaccination slot lookup, hospital directory search, outbreak alerts, and Gemini AI conversational guidance. Architected with layered Flask blueprints, strict Twilio signature verification, and 89% test coverage.',
    techStack: ['Python', 'Flask', 'Twilio WhatsApp API', 'Google Gemini API', 'CoWIN API', 'Pytest', 'Docker', 'Railway'],
    githubUrl: 'https://github.com/HiteshTomar2004/Health-Chatbot',
    liveUrl: 'https://github.com/HiteshTomar2004/Health-Chatbot',
    accentColor: '#e29b4e',
    rune: '◈ V'
  },
  {
    id: 'backend-ecom-v2',
    title: 'High-Performance E-Commerce Backend (V2)',
    category: 'Open Source',
    summary: 'Engineered V2 e-commerce API rewrite using Prisma ORM and atomic SQL transactions to eliminate N+1 queries and cart race conditions.',
    description: 'A complete architectural rewrite of an e-commerce backend addressing critical scalability failures of legacy prototypes. Replaced looping N+1 database queries with single-query batch operations in Prisma ORM, implemented box-packing shipping logic, and added atomic transactions with immutable historical receipt snapshotting to prevent post-checkout mutations.',
    techStack: ['Node.js', 'Express', 'Prisma ORM', 'PostgreSQL / SQLite', 'REST APIs', 'Atomic Transactions', 'Jest'],
    githubUrl: 'https://github.com/HiteshTomar2004/BackendEcomJS',
    liveUrl: 'https://github.com/HiteshTomar2004/BackendEcomJS',
    accentColor: '#c93b3b',
    rune: '◈ VI'
  },
  {
    id: 'moss-grotto-3d',
    title: 'The Moss Grotto 3D Diorama',
    category: 'Creative / 3D',
    summary: 'Interactive 2.5D/3D exploratory portfolio diorama built with React Three Fiber, custom shaders, and Silksong aesthetics.',
    description: 'An immersive digital sanctuary and interactive diorama inspired by the organic serenity of Wayfinder and Hollow Knight: Silksong. Features custom GLSL campfire shaders, dynamic particle embers, floating bioluminescent spores, a reflective emerald pond, and a seamless dual-layer architectural bridge into an accessible, responsive editorial reading experience.',
    techStack: ['React', 'Three.js', 'React Three Fiber', 'GLSL Shaders', 'Tailwind CSS', 'Web Audio API', 'Vite'],
    githubUrl: 'https://github.com/HiteshTomar2004',
    liveUrl: '#',
    accentColor: '#52b788',
    rune: '◈ VII'
  }
]
