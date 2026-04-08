# English Speaking Coach — MVP

An AI-powered workplace English speaking practice app. Practice real professional scenarios, get instant structured feedback, and track your improvement over time.

## Features

- 🎯 **25 workplace scenarios** across 5 categories (self-introduction, meeting updates, suggestions, cross-team collaboration, interviews)
- 🎤 **In-browser audio recording** with start/stop/re-record
- 📝 **Automatic transcription** via Whisper API
- 🤖 **AI structured feedback** powered by DeepSeek:
  - Fluency, Accuracy, Vocabulary, Professional Tone scores
  - 3 specific issues
  - 3 suggested rewrites with explanations
  - Next practice focus
- 🔄 **Retry round** with before/after comparison
- 📅 **History** — view past sessions with scores and transcripts
- 🔥 **Streak tracking** — consecutive practice days

## Tech Stack

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Backend**: Next.js Route Handlers
- **Database**: PostgreSQL + Prisma ORM
- **LLM**: DeepSeek API (via OpenAI-compatible SDK)
- **Speech-to-Text**: OpenAI Whisper API

## Getting Started

### 1. Prerequisites

- Node.js 18+
- PostgreSQL database (local or cloud)

### 2. Clone and Install

```bash
npm install
```

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://user:password@localhost:5432/engcoach?schema=public"
DEEPSEEK_API_KEY="your-deepseek-api-key"
OPENAI_API_KEY="your-openai-api-key"   # for Whisper transcription
```

Get your DeepSeek API key at: https://platform.deepseek.com

### 4. Database Setup

```bash
# Run migrations
npx prisma migrate dev --name init

# Seed scenario data
npx prisma db seed
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
├── page.tsx                    # Home — scenario selection
├── history/page.tsx            # Practice history & stats
├── practice/[scenarioId]/
│   ├── page.tsx                # Server component
│   └── PracticeClient.tsx      # Client-side practice flow
└── api/
    ├── scenarios/route.ts      # GET /api/scenarios
    ├── sessions/route.ts       # POST/GET /api/sessions
    └── sessions/[id]/
        ├── transcribe/route.ts # POST audio upload → transcript
        ├── feedback/route.ts   # POST transcript → AI feedback
        └── retry/route.ts      # POST retry with comparison

lib/
├── db.ts                       # Prisma client singleton
├── validation.ts               # Shared helpers
└── ai/
    ├── feedback.ts             # DeepSeek feedback generation
    └── transcribe.ts           # Whisper transcription

prisma/
├── schema.prisma               # Data model
└── seed.ts                     # Scenario seed data
```

## Deployment

Deploy to Vercel with one command:

```bash
npx vercel --prod
```

Set the environment variables in your Vercel project dashboard.

## API Reference

### POST /api/sessions
Create a new practice session.
```json
{ "scenarioId": "scn_intro_01" }
```

### POST /api/sessions/:id/transcribe
Upload audio (multipart/form-data with `audio` field) to transcribe.

### POST /api/sessions/:id/feedback
Generate AI feedback.
```json
{ "transcript": "...", "scenarioId": "..." }
```

### POST /api/sessions/:id/retry
Submit retry attempt and get comparison.
```json
{ "transcript": "..." }
```

### GET /api/sessions?limit=20
List recent sessions.

### GET /api/dashboard
Get streak, sessions this week, retry rate.
