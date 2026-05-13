# LifeQuest XP

LifeQuest XP is a local-first daily growth tracker built with React, Vite, Tailwind CSS, and browser localStorage. It turns normal daily activity text into structured activities, Growth scores, levels, streaks, and attribute stats.

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
- lucide-react icons
- Browser Web Speech API for voice input

## Core Screens

- Account Gate: local registration/login before activity recording.
- Dashboard: today's activities, activity capture, Daily Growth, Total Growth, Level, streak multiplier, attributes, and daily summary.
- Log Entry: full activity inbox using the same input system as Dashboard.
- Daily Report: score, strengths, weaknesses, suggestions, category split, and today's log.
- Profile: game-like character stats, milestones, and lifetime category totals.

## MVP Behavior

- New local accounts start with empty entries and zero stats.
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
  hooks/            Browser APIs like speech recognition
  pages/            Dashboard, Log Entry, Daily Report, Profile
  utils/            Parser, scoring, stats, AI integration design, reports
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

Important: the public beta still stores accounts and activity logs in browser `localStorage`. Add backend auth and cloud storage before inviting users who need cross-device sync.

## Data Storage

Accounts and entries are stored in browser localStorage. Each local account gets its own activity log.

Important:

- This is an MVP local account system.
- The passcode is hashed before it is stored locally.
- It is still not production-grade authentication.
- Do not reuse an important password.
- New accounts start empty; demo data must be loaded manually.
- Real production login should use a backend auth provider such as Supabase Auth, Firebase Auth, Auth.js, Clerk, or a custom backend.

Use the Demo button in the header to load sample data for the current account.
