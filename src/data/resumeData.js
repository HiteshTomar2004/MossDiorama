export const resumeData = {
  name: 'Hitesh Tomar',
  title: 'B.Tech in AI & ML · Full-Stack & Applied AI Engineer',
  tagline: 'Engineering edge-intelligent TinyML wearables, multi-agent AI systems, and resilient full-stack platforms.',
  location: 'Greater Delhi Area, India',
  email: 'hitesh28tomar@gmail.com',
  github: 'https://github.com/HiteshTomar2004',
  linkedin: 'https://www.linkedin.com/in/hitesh-tomar-b31059344',

  about: `I am an AI & Machine Learning undergraduate and engineer passionate about building applied AI systems, TinyML edge wearables, multi-agent architectures, and data-driven platforms. From engineering on-device quantized neural networks for disaster-response personnel at AICTE IDEA Lab to designing digital forensics graph intelligence and high-throughput backend systems, I focus on solving mission-critical real-world challenges with rigorous engineering and intuitive user interfaces.`,

  experience: [
    {
      period: 'Summer 2026',
      role: 'Machine Learning Engineer Intern — Edge AI & TinyML',
      company: 'AICTE IDEA Lab, GGSIPU',
      location: 'New Delhi, India',
      highlights: [
        'Engineered the complete Edge AI / TinyML pipeline for "NDRF Guardian" (Team NIRVANA) — an AIoT wearable monitoring disaster responder vitals and hazard environments in network-dead zones.',
        'Synthesized a 15,000-sample clinical training dataset anchored to AHA heart rate zones, WHO SpO₂ thresholds, and NIOSH work-rest cycles; engineered 11 input features including Heat Index, Fatigue Score, and SpO₂ drop.',
        'Trained a dual-output multi-task ANN simultaneously predicting discrete risk levels (Safe/Warning/Critical) and a continuous Worker Safety Index (0–100 WSI) with 95% accuracy and 96% critical-class recall.',
        'Quantized the model to 5.8 KB (INT8) running on-device via TensorFlow Lite Micro on an ESP32-S3 microcontroller with zero cloud dependency and ~7s inference cycles.',
        'Collaborated with hardware engineers integrating LoRa SX1278 (5–10 km range), BLE indoor localization beacons, MAX30102, MQ-2, and an offline Node-RED command dashboard.'
      ]
    },
    {
      period: 'June 2026 — Aug 2026',
      role: 'Data Analyst Intern — FinTech',
      company: 'Bluestock™',
      location: 'Delhi, India',
      highlights: [
        'Built an end-to-end Mutual Fund Analytics Platform covering automated data ingestion, cleaning, ETL, SQLite integration, and financial analytics.',
        'Analyzed historical NAV, investor transactions, SIP inflows, AUM, and portfolio holdings across 40+ mutual fund schemes.',
        'Implemented quantitative risk and performance metrics: CAGR, Sharpe Ratio, Sortino Ratio, Alpha, Beta, Maximum Drawdown, Tracking Error, VaR, and CVaR.',
        'Developed advanced investor cohort analytics, SIP continuity modeling, portfolio concentration (HHI), and rule-based fund recommendations.',
        'Designed an interactive 5-page Power BI business intelligence dashboard with dynamic slicers, KPIs, and drill-through NAV detail pages.'
      ]
    },
    {
      period: 'Sept 2025 — Present',
      role: 'Technical Team Member',
      company: 'ACTS-EDC',
      location: 'Delhi, India',
      highlights: [
        'Collaborating on full-stack web platforms and community initiatives, building high-performance interactive interfaces and hackathon portals.',
        'Engineered responsive React and Vite web experiences with modern state management, component architecture, and deployment workflows.',
        'Coordinated technical events, hackathons, and developer engagement initiatives across college ecosystems.'
      ]
    }
  ],

  skillGarden: [
    {
      category: 'Languages & Core',
      skills: ['Python 3.11+', 'JavaScript (ESNext)', 'C / C++', 'SQL', 'HTML5 / CSS3', 'Go (Learning)']
    },
    {
      category: 'AI, Agents & Data Science',
      skills: ['TinyML', 'TensorFlow Lite Micro', 'ESP32-S3 Edge AI', 'INT8 Quantization', 'LangGraph (Multi-Agent)', 'Google Gemini API', 'Pandas', 'NumPy', 'NetworkX', 'Anomaly Detection', 'GeoPy', 'EDA & Statistics']
    },
    {
      category: 'Frameworks & Web Development',
      skills: ['React 18 / 19', 'Vite', 'Node.js', 'Express', 'FastAPI', 'Flask', 'Tailwind CSS', 'Prisma ORM', 'Socket.IO (WebSockets)', 'Server-Sent Events (SSE)']
    },
    {
      category: 'Databases, DevOps & Tools',
      skills: ['SQLite', 'PostgreSQL', 'Docker', 'Power BI', 'LoRa (SX1278)', 'BLE Beacons', 'Node-RED', 'Twilio API', 'Git & GitHub', 'Jupyter', 'Linux / Bash', 'Railway', 'Render']
    }
  ],

  education: [
    {
      degree: 'Bachelor of Technology (B.Tech.) in Artificial Intelligence & Machine Learning',
      institution: 'Guru Gobind Singh Indraprastha University (GGSIPU)',
      period: '2024 — 2028'
    },
    {
      degree: 'Senior Secondary Certificate (12th Standard)',
      institution: 'M.M. Public School - India',
      period: 'Completed'
    },
    {
      degree: 'Secondary School Certificate (10th Standard)',
      institution: 'Mother Divine Public School - India',
      period: 'Completed'
    }
  ],

  certifications: [
    'Winter Training Programme on Remote Sensing and GIS',
    'Data Structures and Algorithms (DSA) with C/C++'
  ]
}

