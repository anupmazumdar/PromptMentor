# PromptMentor — Interactive AI Prompt Engineering Tutor

[![CI/CD Quality Gate](https://github.com/anupmazumdar/PromptMentor/actions/workflows/ci.yml/badge.svg)](https://github.com/anupmazumdar/PromptMentor/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Frontend: React Vite PWA](https://img.shields.io/badge/Frontend-React%20%7C%20Vite%20%7C%20PWA-violet)](https://vitejs.dev/)
[![Backend: Express TypeScript](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%20%7C%20TS-blue)](https://expressjs.com/)
[![Database: Prisma PostgreSQL](https://img.shields.io/badge/Database-Prisma%20%7C%20PostgreSQL-38bdf8)](https://www.prisma.io/)
[![AI: OpenRouter Free Tier](https://img.shields.io/badge/AI-OpenRouter%20%7C%20Llama%203.1-orange)](https://openrouter.ai/)

**PromptMentor** is an always-available, full-stack educational web application designed to systematically train students, engineers, and researchers in modern Prompt Engineering across three progressive tiers: **Basics** → **Intermediate** → **Advanced**.

---

## 📖 Table of Contents

- [The Problem](#-the-problem)
- [Why PromptMentor & What It Solves](#-why-promptmentor--what-it-solves)
- [Where It Helps Learners Overcome Obstacles](#-where-it-helps-learners-overcome-obstacles)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Repository Structure](#-repository-structure)
- [Core Features & Curriculum](#-core-features--curriculum)
- [Getting Started Locally](#-getting-started-locally)
- [Deployment Runbook](#-deployment-runbook)
- [Security & Architecture Guardrails](#-security--architecture-guardrails)
- [Author](#-author)

---

## 💥 The Problem

Large Language Models (LLMs) are only as effective as the prompts that guide them. However, prompt engineering education today suffers from critical shortcomings:

1. **Passive Theory vs. Active Practice**: Most tutorials are static blog posts or video lectures. Learners read about concepts like *Chain-of-Thought* or *Few-Shot Prompting*, but rarely practice formulating them under real constraint rubrics.
2. **Hallucination & Ambiguity**: Without structural prompting (delimiters, defensive framing, negative constraints, and output schema enforcement), models produce unpredictable, hallucinated, or unparseable outputs.
3. **Absence of Real-Time Pedagogical Feedback**: When practicing on commercial chatbots, learners receive raw answers to their prompts rather than qualitative critique on their prompt architecture, clarity, edge-case coverage, and formatting.
4. **Connectivity & Device Barriers**: Traditional educational platforms fail when students lose internet access or switch to mobile devices with cramped viewports and untracked progress.

---

## 🚀 Why PromptMentor & What It Solves

PromptMentor bridges the gap between passive reading and deliberate mastery by combining an **interactive curriculum**, an **active AI tutor**, an **evaluation sandbox**, and an **offline-first PWA**.

- **Socratic AI Tutor**: Rather than writing prompts for you, the tutor follows strict pedagogical guardrails—delivering concise concept definitions (<150 words), practical examples, hands-on tasks, and Socratic check-questions to verify understanding.
- **Interactive Practice Sandbox**: A specialized laboratory where students submit prompts against targeted goals. The engine scores submissions from 0–100 based on clarity, specificity, constraints, and edge cases, providing actionable strengths, weaknesses, and optimized rewrites.
- **Structured 3-Tier Progression**: Progression is gated through quizzes and exercises, ensuring solid foundations before diving into complex workflows.
- **Resilient AI Layer**: Uses OpenRouter free-tier models (`meta-llama/llama-3.1-8b-instruct:free`) backed by an autonomous local fallback engine to ensure 100% uptime with zero vendor lock-in.
- **Offline-First PWA Architecture**: Built with `vite-plugin-pwa` and `Dexie.js` (IndexedDB). Students can read lessons, attempt quizzes, and draft sandbox prompts offline; all actions automatically sync when reconnected.

---

## 🎯 Where It Helps Learners Overcome Obstacles

| Learning Stage | Traditional Challenge | How PromptMentor Overcomes It |
| :--- | :--- | :--- |
| **Tier 1: Basics** | Confusion around tokens, vague roles, and prompt drift. | Interactive lessons on tokenization, role priming, few-shot demonstration, and constraint anchoring. |
| **Tier 2: Intermediate** | Hallucinations, brittle outputs, and multi-step reasoning failures. | Hands-on exercises in Chain-of-Thought (CoT), XML/JSON delimiters, prompt chaining, and temperature/top-p tuning. |
| **Tier 3: Advanced** | Production vulnerabilities, complex agent orchestration, and tool use. | Real-world scenarios covering ReAct loops, RAG context framing, structured JSON function calling, and prompt injection defense. |

---

## 🏗️ System Architecture

```text
                                 PROMPTMENTOR ECOSYSTEM
                                 
      +-------------------------------------------------------------------------+
      |                         Client Layer (PWA)                              |
      |   React 18  *  TypeScript  *  Tailwind CSS  *  Dexie.js (IndexedDB)    |
      |          Global CDN Edge Distribution (Vercel Edge Network)             |
      +------------------------------------+------------------------------------+
                                           | HTTPS (REST API + JWT)
                                           v
      +-------------------------------------------------------------------------+
      |                         Server Layer (API)                              |
      |       Node.js  *  Express (TypeScript)  *  Helmet  *  Rate Limiting     |
      |        Hosted on Render Web Service with Self-Ping Keep-Alive           |
      +--------------------+-------------------------------+--------------------+
                           |                               |
       Prisma ORM Queries  |                               | Prompt Evaluation
                           v                               v
      +--------------------+---------------+   +-----------+--------------------+
      |         Database Layer             |   |            AI Layer            |
      |   PostgreSQL (Neon / Supabase)     |   |   OpenRouter API (Free Tier)   |
      |   - User & RefreshToken Sessions   |   |   - Llama 3.1 8B Instruct      |
      |   - 20 Seeded Lessons & Quizzes    |   |   - Autonomous Fallback Engine |
      |   - Progress & Sandbox Attempts    |   |     (Zero Downtime Guarantee)  |
      +------------------------------------+   +--------------------------------+
```

---

## 💻 Technology Stack

### Frontend
- **Library & Runtime**: React 18 with TypeScript
- **Bundler & Dev Server**: Vite 6
- **Styling**: Tailwind CSS with custom cyber-dark palette (`#080C14`) and fluid typography (`clamp()`)
- **PWA & Caching**: `vite-plugin-pwa` (Service Worker precaching & Web App Manifest)
- **Local Database**: `Dexie.js` (IndexedDB for offline curriculum storage, quiz queueing, and background sync)
- **Routing & Icons**: `react-router-dom` v6, `lucide-react`

### Backend
- **Framework**: Express.js with TypeScript (Strict mode enabled)
- **Security & Protection**:
  - `helmet`: Comprehensive HTTP security headers
  - `cors`: Dynamic origin validation supporting custom and `*.vercel.app` domains
  - `express-rate-limit`: Tiered window limits for General API, Authentication, and AI Tutor endpoints
  - `inputSanitizer`: Input sanitization and payload size bounds to prevent injection attacks
- **Session Management**: Dual-token JWT (15-minute access token + 7-day single-use rotating refresh token)
- **Password Hashing**: `bcryptjs` (salted hashing)
- **High Availability**: Built-in keep-alive self-ping scheduler to prevent free-tier container sleep

### Database & ORM
- **Database Engine**: Serverless PostgreSQL (Neon / Supabase)
- **ORM**: Prisma ORM with typed schema definitions and relation cascades
- **Resilience**: In-memory database fallback mode for instant zero-config local testing

### AI Engine
- **Primary Provider**: OpenRouter API (`meta-llama/llama-3.1-8b-instruct:free`)
- **Resilience Engine**: Autonomous rule-based pedagogical fallback system that activates transparently if external APIs encounter rate limits

---

## 📁 Repository Structure

```text
promptmentor/
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions quality gate (strict TypeScript compile & build)
├── auth/
│   ├── jwt.strategy.ts            # JWT signing, verification, and payload interfaces
│   ├── passwordHash.util.ts       # Salted password hashing utilities
│   └── refreshToken.service.ts    # Single-use refresh token rotation and revocation
├── backend/
│   ├── src/
│   │   ├── controllers/           # Auth, Lessons, Tutor, and Progress request handlers
│   │   ├── middlewares/           # JWT auth, error handling, input validation
│   │   ├── routes/                # Express router modules (/auth, /lessons, /tutor, /progress, /health)
│   │   ├── services/              # OpenRouter API client and autonomous fallback engine
│   │   ├── utils/                 # Prisma singleton, pedagogical prompt builder, keep-alive ping
│   │   └── server.ts              # Server bootstrap and middleware pipeline
│   ├── render.yaml                # Render Infrastructure-as-Code deployment specification
│   ├── tsconfig.json              # Strict TypeScript compiler options
│   └── package.json
├── database/
│   ├── prisma/
│   │   └── schema.prisma          # Relational schema (User, Token, Module, Lesson, Quiz, Progress, Attempt)
│   ├── seed/
│   │   ├── curriculumData.ts      # Structured data for 20 prompt engineering lessons & quizzes
│   │   └── seed.ts                # Database seeding script
│   └── package.json
├── frontend/
│   ├── public/                    # PWA icons and web manifest assets
│   ├── src/
│   │   ├── components/            # Navbar, NetworkStatusBadge, TutorChat, PracticeSandbox, QuizModal
│   │   ├── context/               # React AuthContext and ProgressContext providers
│   │   ├── db/                    # offlineDb.ts (Dexie.js IndexedDB schema)
│   │   ├── pages/                 # Dashboard, Tier Pages (Basics, Intermediate, Advanced), Sandbox, Auth
│   │   ├── services/              # Offline sync engine, API client, curriculum services
│   │   ├── index.css              # Fluid typography clamp() rules and cyber theme
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── vercel.json                # Single Page Application (SPA) routing rewrites
│   ├── vite.config.ts             # Vite configuration with VitePWA plugin
│   └── package.json
├── security/
│   ├── corsConfig.ts              # Origin verification supporting localhost and Vercel domains
│   ├── helmetConfig.ts            # Secure HTTP header configuration
│   ├── inputSanitizer.ts          # XSS and payload size sanitation middleware
│   └── rateLimiter.ts             # Tiered Express endpoint rate limiters
├── docs/
│   └── architecture.md            # In-depth system design, ERD diagrams, and API specifications
├── .gitignore                     # Repository exclusion rules (secrets, build outputs, node_modules)
└── package.json                   # Root orchestrator scripts (concurrent dev, multi-package builds)
```

---

## 📚 Core Features & Curriculum

### 1. 20-Lesson Structured Curriculum

- **Basics Tier (6 Lessons)**:
  1. What is a Prompt & How LLMs Process Tokens
  2. The Anatomy of a High-Quality Prompt
  3. Zero-Shot vs. Few-Shot Prompting
  4. Role Priming & Persona Assignment
  5. Negative Constraints & Guardrails
  6. Output Formatting (JSON, Markdown, Tables)

- **Intermediate Tier (7 Lessons)**:
  1. Chain-of-Thought (CoT) Prompting
  2. Delimiters & Structured Markdown
  3. Prompt Chaining & Stepwise Workflows
  4. Directional Stimulus & Context Priming
  5. Avoiding Hallucinations & Factual Grounding
  6. Temperature, Top-P, and Generation Parameters
  7. Self-Consistency Sampling

- **Advanced Tier (7 Lessons)**:
  1. ReAct Framework (Reasoning + Action)
  2. Retrieval-Augmented Generation (RAG) Prompting
  3. Function Calling & Tool Augmentation
  4. Defensive Prompting & Prompt Injection Mitigation
  5. Few-Shot Dynamic Exemplar Selection
  6. Meta-Prompting & Self-Reflective Loops
  7. Multi-Agent Prompt Orchestration

### 2. Practice Sandbox Laboratory
- Live interactive editor with pre-loaded goals.
- Automated evaluation scoring criteria across **Clarity**, **Constraint Adherence**, and **Edge-Case Resilience**.
- Provides constructive critique and an improved prompt rewrite.

### 3. Progressive Assessment & Quizzes
- Multiple-choice knowledge checks per lesson.
- Immediate rationales explaining why choices are correct or incorrect.
- Automatic unlocking of subsequent lessons and tiers upon passing.

---

## 🛠️ Getting Started Locally

### Prerequisites
- Node.js 18+ (Node 20 LTS recommended)
- npm or yarn

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/anupmazumdar/PromptMentor.git
cd PromptMentor

# Install root dependencies
npm install

# Install backend & frontend dependencies
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### 2. Configure Local Environment Variables
Create `.env` files in `backend/` and `frontend/` using the provided `.env.example` templates.

**`backend/.env`**:
```ini
PORT=5000
NODE_ENV=development
# MANDATORY: Must be set before starting the backend (server fails at boot if missing)
JWT_ACCESS_SECRET=your_jwt_access_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
OPENROUTER_API_KEY=your_openrouter_key_here
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
FRONTEND_URL=http://localhost:5173
# Optional: DATABASE_URL=postgresql://... (if omitted, runs in fast memory-fallback mode)
```

**`frontend/.env`**:
```ini
VITE_API_URL=http://localhost:5000
```

### 3. Run Development Servers
From the root directory, launch both frontend and backend concurrently:
```bash
npm run dev
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🚢 Deployment Runbook

### Frontend Deployment (Vercel)
1. Import the repository into **Vercel**.
2. Set **Root Directory** to `frontend`.
3. Set **Framework Preset** to `Vite`.
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: Your deployed backend URL (e.g., `https://your-backend.onrender.com` without a trailing slash).
5. Deploy. `frontend/vercel.json` automatically handles client-side SPA routing.

### Backend Deployment (Render)
1. Create a new **Web Service** on **Render** connected to the repository.
2. Set **Root Directory** to `backend`.
3. Set **Build Command**:
   ```bash
   npm install --include=dev && npm run build
   ```
4. Set **Start Command**:
   ```bash
   npm run start
   ```
5. Configure Environment Variables:
   - `NODE_ENV=production`
   - `PORT=10000`
   - `JWT_ACCESS_SECRET`: *(Mandatory 32+ char secret - server fails at boot if missing)*
   - `JWT_REFRESH_SECRET`: *(Mandatory 32+ char secret - server fails at boot if missing)*
   - `OPENROUTER_API_KEY`: *(Your OpenRouter API key)*
   - `DATABASE_URL`: *(PostgreSQL connection string)*
   - `FRONTEND_URL`: `https://promptmentor.anupmazumdar.me`
   - `RENDER_EXTERNAL_URL`: `https://promptmentor.onrender.com`
6. Set **Health Check Path** to `/api/health`.

---

## 🛡️ Security & Architecture Guardrails

- **Zero Secret Leakage**: Strict `.gitignore` rules prevent `.env` files, credentials, or private configuration files from being committed.
- **Session Replay Protection**: Single-use refresh token rotation invalidates compromised refresh tokens immediately.
- **Rate Limiting**: Defends against brute-force attacks on `/api/auth` and protects AI tutor endpoints from abuse.
- **XSS & Injection Protection**: HTML script stripping and payload bounds on input fields.
- **Continuous Integration**: GitHub Actions enforces strict TypeScript compilation (`strict: true`) on every push and pull request.

---

## 👨‍💻 Author

Made with ❤️ by Anup Mazumdar
