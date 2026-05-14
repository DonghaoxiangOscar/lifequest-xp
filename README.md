# LifeQuest XP

LifeQuest XP is a daily growth tracker built with React, Vite, Tailwind CSS, and a local-first product flow. It turns normal daily activity text into structured activities, Growth scores, levels, streaks, and attribute stats. It still works with browser localStorage, and it now has a Supabase-ready path for real accounts and cloud activity storage.

## Product Goals

- Make today's activities the main daily-use surface.
- Support voice input, natural-language input, and quick actions.
- Keep parsing and scoring beginner-friendly and rule-based.
- Use AI only as a fallback for complex input or user-requested reports.
- Keep all Growth scoring local.

## Tech Stack

- React
- Vite
- Tailwind CSS
- localStorage
- Optional Supabase Auth and Supabase Postgres cloud storage
- lucide-react icons
- Browser Web Speech API for voice input

## Core Screens

- Account Gate: registration/login before activity recording.
- Dashboard: today's activities, activity capture, Daily Growth, Total Growth, Level, streak multiplier, attributes, and daily summary.
- Log Entry: full activity inbox using the same input system as Dashboard.
- Daily Report: score, strengths, weaknesses, suggestions, category split, and today's log.
- Profile: game-like character stats, milestones, and lifetime category totals.

## MVP Behavior

- New accounts start with empty entries and zero stats.
- Without Supabase environment variables, accounts and logs stay local in the browser.
- With Supabase environment variables, accounts use Supabase Auth and logs sync to Supabase tables.
- Sample data is never created automatically.
- Use the Demo button only when you want to replace the current account's entries with sample logs.
- Use Profile -> Data Backup -> Clear Local to reset an existing test account to zero.
- Voice input is best-effort because browser Web Speech API support varies. If it fails in the in-app browser, try Chrome or Edge directly.
- localStorage data is tied to the current browser and device.

## Public Beta Website Mode

The app now includes a top-level Settings page for public-test readiness:

- Display language can be switched between English and Chinese.
- The selected language is saved in `localStorage`.
- Core product surfaces use the selected language: navigation, auth gate, Dashboard, input composer, reports, profile, data backup, and settings.
- The Settings page shows the current public beta status and the remaining production steps.

See also:

```text
docs/public-beta-launch.md
```

## Project Structure

```text
src/
  components/       Reusable UI pieces
  data/             Activity rules and category metadata
  hooks/            Auth, entries, local storage, and browser APIs
  pages/            Dashboard, Log Entry, Daily Report, Profile
  utils/            Parser, scoring, stats, AI integration design, reports
supabase/
  schema.sql        Production foundation tables, triggers, indexes, and RLS policies
```

## Input System

The activity composer supports three input methods:

- Voice Input: microphone button uses `SpeechRecognition` / `webkitSpeechRecognition`.
- Natural Language: example, `Today I studied linear algebra for 2 hours and ran 30 minutes`.
- Quick Actions: `+Study 1h`, `+Exercise 30min`, `+Healthy Meal`, `-Scroll Social Media`.

## Parser

The local parser lives in:

```text
src/utils/parser.js
```

It converts text into structured activity objects:

```js
{
  type: "linear-algebra",
  duration: 120,
  category: "knowledge",
  confidence: 0.95
}
```

The parser is intentionally simple:

- Split a sentence into activity fragments.
- Match each fragment against keyword rules.
- Extract duration from text such as `2 hours` or `30 minutes`.
- Assign a confidence score.
- Mark low-confidence input as AI-eligible.

## Growth Formula

Scoring lives in:

```text
src/utils/scoring.js
```

Each parsed activity uses:

```js
Growth = BaseXP * TimeFactor * ConsistencyFactor * DifficultyFactor
```

Time uses diminishing returns:

```js
TimeFactor = Math.log(1 + minutes / 30)
```

Consistency uses the current streak, capped at 30 days:

```js
ConsistencyFactor = 1 + Math.min(streakDays, 30) / 100
```

Difficulty values:

```js
easy = 0.8
normal = 1.0
hard = 1.3
veryHard = 1.6
```

Attributes decay slightly every day:

```js
NewAttribute = OldAttribute * 0.995 + DailyGrowth
```

Level uses a nonlinear curve:

```js
Level = Math.floor(Math.sqrt(totalGrowth / 100))
```

## Cost-Efficient AI Design

The AI integration design lives in:

```text
src/utils/ai.js
```

The app does not call an AI model for every activity.

The intended flow is:

1. Always run the local parser first.
2. If parser confidence is high, skip AI entirely.
3. If parser confidence is low, optionally call a backend AI parser.
4. If the user requests an AI daily report, optionally call a backend AI report endpoint.
5. AI returns only small structured JSON.
6. All Growth scoring still happens locally.

This reduces token cost because simple logs never leave the local rule engine, the AI is not asked to calculate formulas, and responses are constrained to short JSON.

Important: API keys should not be placed in this frontend app. A production version should call your own backend, and the backend should call the AI provider.

## Run Locally

Install dependencies:

```bash
npm install
```

Start development:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Enable Supabase Cloud Mode

The app automatically stays in local mode until Supabase variables are present.

1. Create a Supabase project.
2. Open the Supabase SQL editor and run `supabase/schema.sql`.
3. Copy the example env file:

```bash
cp .env.example .env.local
```

4. Fill in:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

5. Restart the dev server.

Important: only use the public anon key in this Vite app. Service-role keys and AI provider keys must stay on a backend.

For GitHub Pages, the workflow already reads these optional deployment settings:

- Repository variable: `VITE_SUPABASE_URL`
- Repository secret: `VITE_SUPABASE_ANON_KEY`

## Deploy Public Beta

This project is ready for a static public beta deploy.

Vercel:

- Import the GitHub repository into Vercel.
- Framework preset: `Vite`.
- Build command: `npm run build`.
- Output directory: `dist`.
- `vercel.json` is included for these defaults.

Netlify:

- Import the GitHub repository into Netlify.
- Build command: `npm run build`.
- Publish directory: `dist`.
- `netlify.toml` is included for these defaults.

Important: the public beta can run in local mode or Supabase cloud mode. For a broader launch, configure Supabase Auth, run the SQL schema, add privacy/legal pages, and test row-level security before inviting users who need cross-device sync.

GitHub Pages fallback:

- The repository includes `.github/workflows/deploy-pages.yml`.
- Pushing to `main` runs tests, builds the Vite app, and deploys `dist`.
- The expected public URL is:

```text
https://donghaoxiangoscar.github.io/lifequest-xp/
```

## Data Storage

LifeQuest XP supports two storage modes:

- Local mode: accounts and entries are stored in browser localStorage. Each local account gets its own activity log.
- Cloud mode: Supabase Auth handles accounts, and entries sync to Supabase tables protected by row-level security.

Important:

- Local mode is still an MVP convenience system.
- In local mode, the passcode is hashed before it is stored locally.
- Do not reuse an important password in local mode.
- New accounts start empty; demo data must be loaded manually.
- Real production login should use Supabase Auth or another backend auth provider.

Use the Demo button in the header to load sample data for the current account.
