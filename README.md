# JobCraft AI 🚀

> **AI-powered career preparation platform** — Upload your resume, paste a job description, and get instant skill-gap analysis, personalized mock interviews, and a tailored learning path.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [AI Pipeline](#ai-pipeline)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Deployment](#deployment)

---

## Overview

**JobCraft AI** is a full-stack Next.js application that bridges the gap between a candidate's current skills and job requirements. It uses AI-powered analysis to parse resumes, extract skills, identify gaps, conduct adaptive mock interviews, evaluate answers in real-time, and generate personalized learning paths with curated resources.

### Key Highlights

- 🤖 **Dual AI Provider Architecture** — Groq (primary) + OpenRouter (fallback) for zero-downtime AI processing
- 📄 **Server-side PDF Parsing** — Secure, local resume text extraction using `pdf-parse`
- 🎯 **Skill Gap Analysis** — Compares resume skills against job requirements with priority scoring
- 🎤 **Adaptive Mock Interviews** — AI-generated questions tailored to skill gaps and difficulty level
- 📊 **Real-time Answer Evaluation** — Instant scoring (0–100) with detailed constructive feedback
- 📚 **Personalized Learning Paths** — Full Prep and Quick Sprint modes with curated resources
- ✏️ **Resume Editor** — Built-in editor to refine your resume based on analysis feedback
- 🔒 **Firebase Authentication** — Secure Google sign-in with protected routes

---

## Features

### 1. 📄 Resume Analysis & Skill Gap Detection
- Upload a PDF resume and paste a job description
- AI extracts technical skills, experience, and tools from the resume
- AI parses the job description for role, company, required skills, and difficulty
- Matched and missing skills are identified and stored for reference
- Overall readiness score is computed

### 2. 🎤 Mock Interview Sessions
- AI generates 7 interview questions based on skill gaps:
  - 3 Technical, 2 Conceptual, 1 Scenario-based, 1 Edge-case
- Difficulty adapts to Easy / Medium / Hard based on the job
- Each answer is evaluated in real-time with a score (0–100) and feedback
- Session summary shows overall score, strongest skill, and area to improve
- All sessions are persisted to Firestore with skill-level breakdowns

### 3. 📚 Learning Paths
- **Full Prep Mode** — Step-by-step vertical learning journey for every skill gap, with:
  - Priority-based ordering (High → Medium → Low)
  - Curated video, documentation, and practice resources per skill
  - Performance metrics (current score, gap score, priority)
  - Journey completion indicator
- **Quick Sprint Mode** — Top 3 skills with 15-minute actionable tasks and performance summary
- Multi-role support — switch between different job roles analyzed

### 4. ✏️ Resume Editor
- Built-in editor to update your resume content
- Informed by AI analysis feedback for targeted improvements

### 5. 📊 Dashboard
- Welcome banner with latest session results
- Quick action buttons for all major features
- 4 stat cards: Job Readiness score, Skill Gaps count, Weakest Area, Total Sessions
- Recent Interview Sessions table with scores, difficulty badges, and dates
- Profile card with session statistics
- Skill Gap Analysis card showing matched and missing skills

### 6. 🔐 Authentication
- Firebase Authentication with Google Sign-In
- Protected routes that redirect unauthenticated users
- Non-blocking login flow for seamless UX

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **Next.js 15** | React framework with App Router, Server Actions, Turbopack |
| **React 18** | UI library with hooks and server components |
| **TypeScript** | Type-safe development across the entire codebase |
| **Tailwind CSS 3** | Utility-first CSS with custom design tokens |
| **ShadCN/UI** | Radix-based component library (Accordion, Card, Dialog, Tabs, etc.) |
| **Framer Motion** | Fluid animations, transitions, and micro-interactions |
| **Recharts** | Data visualization (radial bar charts for readiness scores) |
| **Lucide React** | Icon library |

### Backend & AI
| Technology | Purpose |
|---|---|
| **Groq API** | Primary LLM provider (LLaMA 3.3 70B Versatile) |
| **OpenRouter API** | Fallback LLM provider (LLaMA 3.3 70B Instruct) |
| **pdf-parse 1.1.1** | Server-side PDF text extraction |
| **Next.js Server Actions** | Secure server-side RPC for AI and database operations |
| **Zod** | Runtime schema validation |

### Database & Auth
| Technology | Purpose |
|---|---|
| **Firebase Auth** | Google OAuth authentication |
| **Cloud Firestore** | NoSQL database for users, sessions, and skill gaps |
| **Firebase SDK 11** | Client-side Firebase integration |

### Dev Tools
| Technology | Purpose |
|---|---|
| **Turbopack** | Fast bundler for development |
| **ESLint** | Code linting |
| **PostCSS** | CSS processing pipeline |
| **Genkit CLI** | AI flow development tooling (legacy) |

---

## System Architecture

```
┌─────────────────────────────────────────────────┐
│                    CLIENT (Browser)              │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │Dashboard │ │Interview │ │ Learning Path    │ │
│  │   Page   │ │ Session  │ │     Page         │ │
│  └────┬─────┘ └────┬─────┘ └────────┬─────────┘ │
│       │             │                │           │
│  ┌────┴─────────────┴────────────────┴─────────┐ │
│  │         React Components (ShadCN/UI)         │ │
│  │         + Framer Motion Animations           │ │
│  └──────────────────┬──────────────────────────┘ │
└─────────────────────┼───────────────────────────┘
                      │  Server Actions
                      ▼
┌─────────────────────────────────────────────────┐
│              NEXT.JS SERVER (Node.js)            │
│                                                  │
│  ┌──────────────────────────────────────────┐    │
│  │           Server Actions Layer            │    │
│  │  • analyzeMatchAction()                   │    │
│  │  • generateQuestionsAction()              │    │
│  │  • evaluateAnswerAction()                 │    │
│  └────────────────┬─────────────────────────┘    │
│                   │                              │
│  ┌────────────────┴─────────────────────────┐    │
│  │           AI Service Layer                │    │
│  │                                           │    │
│  │  AIService.chat() ──┬── Groq (Primary)    │    │
│  │                     └── OpenRouter (FB)    │    │
│  │                                           │    │
│  │  AIService.analyzeMatch()                 │    │
│  └───────────────────────────────────────────┘    │
│                                                  │
│  ┌───────────────────────────────────────────┐    │
│  │           PDF Processing Layer            │    │
│  │  pdf-parse → Buffer → extractTextFromPDF  │    │
│  └───────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│              EXTERNAL SERVICES                    │
│                                                  │
│  ┌─────────────┐  ┌─────────────────────────┐    │
│  │  Groq API   │  │      Firebase           │    │
│  │  (LLaMA 3.3)│  │  ┌─────────────────┐    │    │
│  └─────────────┘  │  │  Authentication  │    │    │
│                   │  │  (Google OAuth)  │    │    │
│  ┌─────────────┐  │  ├─────────────────┤    │    │
│  │ OpenRouter  │  │  │  Firestore DB   │    │    │
│  │ (Fallback)  │  │  │  • users        │    │    │
│  └─────────────┘  │  │  • sessions     │    │    │
│                   │  │  • skill_gaps    │    │    │
│                   │  └─────────────────┘    │    │
│                   └─────────────────────────┘    │
└──────────────────────────────────────────────────┘
```

### Data Flow

```
Resume (PDF) ──► pdf-parse ──► Plain Text ──┐
                                            ├──► AIService.analyzeMatch()
Job Description (Text) ────────────────────┘         │
                                                     ▼
                                          ┌──────────────────┐
                                          │  Analysis Output  │
                                          │  • resume skills  │
                                          │  • job skills     │
                                          │  • skill gaps     │
                                          │  • readiness %    │
                                          └────────┬─────────┘
                                                   │
                              ┌─────────────────────┼──────────────────┐
                              ▼                     ▼                  ▼
                     Mock Interview          Learning Path       Dashboard
                    ┌──────────────┐       ┌──────────────┐    ┌──────────┐
                    │ generateQ()  │       │ Full Prep    │    │ Stats    │
                    │ evaluateA()  │       │ Quick Sprint │    │ History  │
                    └──────────────┘       └──────────────┘    └──────────┘
```

---

## Project Structure

```
src/
├── ai/                          # AI configuration and flows
│   ├── flows/
│   │   ├── analyze-match.ts         # Resume ↔ Job comparison
│   │   ├── generate-interview-questions.ts  # Question generation
│   │   ├── evaluate-user-answer.ts  # Answer scoring & feedback
│   │   ├── parse-job-description.ts # JD parsing
│   │   └── parse-resume-skills.ts   # Resume skill extraction
│   ├── genkit.ts                # Genkit AI instance (legacy)
│   └── dev.ts                   # Dev server for AI flows
│
├── app/                         # Next.js App Router pages
│   ├── page.tsx                     # Landing page
│   ├── layout.tsx                   # Root layout with providers
│   ├── globals.css                  # Global styles & design tokens
│   ├── auth/                        # Authentication pages
│   ├── dashboard/                   # Main dashboard
│   │   ├── layout.tsx               # Dashboard layout with sidebar
│   │   └── page.tsx                 # Dashboard page (stats, sessions)
│   ├── analysis/
│   │   └── new/                     # New analysis (upload + analyze)
│   │       ├── page.tsx             # Upload form UI
│   │       └── actions.ts           # Server actions for analysis
│   ├── interview/
│   │   ├── layout.tsx               # Interview layout with sidebar
│   │   └── session/
│   │       ├── page.tsx             # Mock interview UI (Q&A + summary)
│   │       └── actions.ts           # Server actions for interview
│   ├── learning-path/
│   │   ├── layout.tsx               # Learning path layout
│   │   └── page.tsx                 # Full Prep + Quick Sprint views
│   └── resume/
│       ├── layout.tsx               # Resume editor layout
│       └── edit/                    # Resume editing page
│
├── components/                  # Shared UI components
│   ├── sidebar.tsx                  # Navigation sidebar
│   ├── header.tsx                   # Page header
│   ├── user-nav.tsx                 # User avatar & dropdown
│   ├── protected-route.tsx          # Auth guard wrapper
│   ├── theme-provider.tsx           # Dark/light theme
│   ├── FirebaseErrorListener.tsx    # Global error handler
│   └── ui/                          # ShadCN component library
│       ├── button.tsx, card.tsx, dialog.tsx, tabs.tsx,
│       ├── accordion.tsx, badge.tsx, progress.tsx,
│       ├── table.tsx, toast.tsx, skeleton.tsx, ...
│       └── chart.tsx                # Recharts wrapper
│
├── firebase/                    # Firebase integration
│   ├── config.ts                    # Firebase project config
│   ├── provider.tsx                 # FirebaseProvider context
│   ├── client-provider.tsx          # Client-side Firebase init
│   ├── index.ts                     # Custom hooks (useUser, useCollection)
│   ├── firestore/                   # Firestore utilities
│   ├── non-blocking-login.tsx       # Non-blocking auth flow
│   ├── non-blocking-updates.tsx     # Non-blocking writes
│   ├── errors.ts                    # Error definitions
│   └── error-emitter.ts            # Error event emitter
│
├── lib/                         # Utilities and services
│   ├── ai/
│   │   └── ai.service.ts           # AIService (Groq/OpenRouter)
│   ├── pdf-util.ts                  # PDF text extraction
│   ├── utils.ts                     # cn() utility
│   ├── types.ts                     # Shared TypeScript types
│   └── icons.tsx                    # Custom icon components
│
└── hooks/                       # Custom React hooks
    └── use-toast.ts                 # Toast notification hook
```

---

## AI Pipeline

### 1. Resume Analysis Flow

```
PDF Upload → pdf-parse → extractTextFromPDF() → plain text
                                                     │
Job Description (textarea) ──────────────────────────┤
                                                     ▼
                                          AIService.analyzeMatch()
                                                     │
                                                     ▼
                                          Structured JSON Output:
                                          {
                                            resume: { skills, experience, tools },
                                            job: { role, company, requiredSkills, difficulty }
                                          }
```

### 2. Interview Question Generation

```
Input: { jobDescription, skillGaps[], difficulty }
                    │
                    ▼
       AIService.chat() → Groq LLaMA 3.3 70B
                    │
                    ▼
       7 Questions (3 technical, 2 conceptual, 1 scenario, 1 edge-case)
       Each with: questionText, skill, difficulty, type
```

### 3. Answer Evaluation

```
Input: { questionText, userAnswer, skill, difficulty }
                    │
                    ▼
       AIService.chat() → Groq LLaMA 3.3 70B
                    │
                    ▼
       { score: 0-100, feedback: "Detailed constructive feedback..." }
```

### Provider Failover Strategy

```
┌──────────────┐     ┌───────────────┐
│  GROQ_API_KEY│────►│   Groq API     │  ✅ Primary
│  (env var)   │     │  LLaMA 3.3 70B │     (fast, free tier)
└──────────────┘     └───────────────┘
        │
        │ (if missing)
        ▼
┌───────────────────┐     ┌───────────────┐
│ OPENROUTER_API_KEY│────►│ OpenRouter API │  🔄 Fallback
│    (env var)      │     │ LLaMA 3.3 70B │     (broader model access)
└───────────────────┘     └───────────────┘
```

---

## Database Schema

### Firestore Collections

#### `users`
| Field | Type | Description |
|---|---|---|
| `id` | string | Firebase Auth UID |
| `displayName` | string | User's display name |
| `email` | string | User's email |
| `readinessScore` | number | Overall job readiness (0–100) |
| `createdAt` | timestamp | Account creation date |

#### `sessions`
| Field | Type | Description |
|---|---|---|
| `userId` | string | Owner's Auth UID |
| `jobDescriptionId` | string | Reference to job description |
| `jobRole` | string | Analyzed job role title |
| `jobCompany` | string | Company name |
| `difficulty` | string | Easy / Medium / Hard |
| `overallScore` | number | Average interview score |
| `skillScores` | map | `{ skillName: score }` |
| `totalQuestions` | number | Number of questions asked |
| `questionsAnswered` | number | Number answered |
| `createdAt` | timestamp | Session start time |
| `completedAt` | timestamp | Session end time |

#### `skill_gaps`
| Field | Type | Description |
|---|---|---|
| `userId` | string | Owner's Auth UID |
| `jobDescriptionId` | string | Associated job description |
| `matchedSkills` | array | Skills found in resume |
| `missingSkills` | array | Skills missing from resume |
| `createdAt` | timestamp | Analysis date |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- A **Groq** or **OpenRouter** API key
- A **Firebase** project with Authentication and Firestore enabled

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Darshini-2006/jobcraft.git
cd jobcraft

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys (see below)

# 4. Start the development server
npm run dev
```

The app will be running at **http://localhost:3000**.

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
# AI Provider (at least one required)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxxxxxxxxxx

# Firebase (configured in src/firebase/config.ts)
# No additional env vars needed — config is embedded
```

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | ✅ (or OpenRouter) | Groq API key for LLaMA 3.3 70B |
| `OPENROUTER_API_KEY` | 🔄 Fallback | OpenRouter API key as backup |

> **Note:** At least one AI provider key must be set. Groq is recommended as the primary provider for its speed and generous free tier.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run clean` | Delete `.next` cache |
| `npm run rebuild` | Clean + dev (fresh start) |

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repo on [vercel.com](https://vercel.com)
3. Add environment variables (`GROQ_API_KEY`)
4. Deploy — Vercel auto-detects Next.js

### Important Configuration

In `next.config.ts`, `pdf-parse` is listed under `serverExternalPackages` to prevent Next.js from bundling it:

```typescript
const nextConfig: NextConfig = {
  serverExternalPackages: ['pdf-parse'],
};
```

---

## Design System

The app uses a cohesive warm-toned design language:

| Token | Value | Usage |
|---|---|---|
| Primary Dark | `#3E2F20` | Text, headings, dark accents |
| Primary Accent | `#E8A87C` | Buttons, highlights, gradients |
| Secondary Accent | `#D4B68A` | Subtle backgrounds, secondary elements |
| Background | `#FAF7F3` | Page backgrounds, card fills |
| White | `#FFFFFF` | Card surfaces, clean areas |

### UI Features
- **Gradient buttons** with hover effects
- **Glassmorphism** card backgrounds (`backdrop-blur-sm`)
- **Framer Motion** micro-animations on every interactive element
- **Responsive layout** with sidebar navigation (desktop) and sheet drawer (mobile)

---

## License

This project is for educational and personal use.

---

<p align="center">
  Built with ❤️ using Next.js, Firebase, and AI
</p>
