# PromptMentor — Architecture & System Design

## 1. Overview
**PromptMentor** is an interactive AI tutor and prompt engineering web application. It guides students through a structured 3-tier curriculum:
1. **Basics** (Foundations: tokens, few-shot, roles, clarity, constraints)
2. **Intermediate** (Cognitive workflows: CoT, prompt chaining, parameters, delimiters, anti-hallucination)
3. **Advanced** (Enterprise systems: ReAct, RAG, function calling, prompt injection defenses, multi-agent orchestration)

---

## 2. System Architecture

```
                       +-------------------------------+
                       |   Vercel Edge Network         |
                       |   React + Vite + Tailwind UI  |
                       +---------------+---------------+
                                       | HTTPS (REST API)
                                       v
                       +---------------+---------------+
                       |   Render Free Web Service     |
                       |   Node.js + Express (TS)      |
                       |   Keep-Alive Ping (14 min)    |
                       +-------+---------------+-------+
                               |               |
                Prisma Queries |               | Prompt & Critique Calls
                               v               v
               +---------------+---+   +-------+---------------+
               | Supabase / Neon   |   | OpenRouter API        |
               | PostgreSQL DB     |   | (Llama 3.1 8B Free /  |
               +-------------------+   |  Gemini Flash Free)   |
                                       | Fallback: Groq/Mock   |
                                       +-----------------------+
```

### Free Tier 24/7 Strategy:
- **Frontend (Vercel)**: Global CDN edge distribution with zero sleep time.
- **Backend (Render)**: Lightweight Express runtime. Integrated `keepAlive.ts` utility pings `/api/health` every 14 minutes to prevent the 15-minute inactivity spin-down.
- **Database (Supabase / Neon)**: Serverless PostgreSQL with pooling connection strings.
- **AI Layer (OpenRouter)**: Free-tier models with automatic graceful fallback to Groq or rule-based pedagogical generation if rate limits occur.

---

## 3. Database Schema (Prisma ORM)

- **User**: User account, hashed passwords, role, and current unlocked tier.
- **RefreshToken**: Cryptographically secure refresh tokens with single-use rotation and revocation.
- **Module**: Grouping for curriculum tiers (`BASICS`, `INTERMEDIATE`, `ADVANCED`).
- **Lesson**: Educational content in Markdown, practice goals, and starter templates.
- **QuizQuestion**: Multiple-choice assessment questions per lesson with explanations.
- **Progress**: Per-user status (`LOCKED`, `IN_PROGRESS`, `COMPLETED`), quiz score, and timestamps.
- **PromptAttempt**: History of student prompts submitted in the sandbox, AI scores, and critique records.

---

## 4. API Endpoints Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Create student account, return user + JWT pair |
| `POST` | `/api/auth/login` | Authenticate student, return user + JWT pair |
| `POST` | `/api/auth/refresh` | Rotate refresh token and issue fresh access token |
| `POST` | `/api/auth/logout` | Revoke refresh token |
| `GET` | `/api/auth/me` | Fetch authenticated student profile |

### Lessons & Curriculum (`/api/lessons`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/lessons` | List all curriculum modules and lessons with unlock states |
| `GET` | `/api/lessons/:slug` | Retrieve single lesson details, practice goals, and quiz questions |

### AI Tutor & Sandbox (`/api/tutor`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/tutor/chat` | Send student query; returns dynamic tutor response adhering to §6 |
| `POST` | `/api/tutor/sandbox` | Evaluate student prompt; returns score (0-100), strengths, and improvements |

### Progress & Quizzes (`/api/progress`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/progress` | Get completion % for Basics, Intermediate, Advanced, and overall |
| `POST` | `/api/progress/quiz` | Submit quiz answers; grades and unlocks subsequent lessons/tiers |
| `GET` | `/api/progress/attempts`| Fetch past sandbox submissions and feedback |

### System (`/api/health`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Uptime check, database status, and keep-alive response |

---

## 5. Security & Prompt Defense
1. **JWT Strategy**: 15-minute access token lifespan; 7-day refresh token with automatic one-time-use rotation.
2. **Rate Limiting**: 150 reqs/15m general API limiter; 20 reqs/min AI limiter to preserve free quotas; 15 reqs/15m auth limiter.
3. **Helmet**: Strict Content Security Policy, XSS protection, anti-clickjacking, and header hardening.
4. **Input Sanitization**: Length validation, HTML tag stripping, and defense against prompt injection exploits.

---

## 6. Deployment Guide

### Frontend on Vercel:
1. Link repository to Vercel.
2. Root Directory: `frontend`
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Environment Variable: `VITE_API_URL=https://your-backend.onrender.com`

### Backend on Render:
1. New Web Service -> Link repository.
2. Root Directory: `backend`
3. Environment: `Node`
4. Build Command: `npm install && npm run build`
5. Start Command: `npm run start`
6. Add Environment Variables:
   - `DATABASE_URL` (From Supabase / Neon)
   - `JWT_ACCESS_SECRET`
   - `JWT_REFRESH_SECRET`
   - `OPENROUTER_API_KEY`
   - `FRONTEND_URL` (Vercel domain)
   - `RENDER_EXTERNAL_URL` (The Render app's own URL for keep-alive)
