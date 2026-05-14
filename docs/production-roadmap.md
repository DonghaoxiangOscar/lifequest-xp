# LifeQuest XP Production Roadmap

This file tracks the seven practical steps needed to move the app from a local MVP toward a real product.

## 1. Voice Input

Current state:

- Uses browser Web Speech API.
- Works best in Chrome or Edge.
- Includes language selection and detailed error messages.

Remaining production work:

- Test on target browsers and devices.
- Add a backend speech-to-text fallback if browser support is not reliable enough.

## 2. AI Integration

Current state:

- Local parser runs first.
- AI is only designed for low-confidence parsing or user-requested report generation.
- Scoring stays local.
- Frontend contains no API key.

Remaining production work:

- Create backend endpoints:
  - `POST /api/ai/parse-activities`
  - `POST /api/ai/daily-report`
- Add rate limits and caching.
- Require JSON-only AI responses.

## 3. Data Storage

Current state:

- localStorage.
- Local registration/login gate.
- Per-account local activity logs.
- Optional Supabase Auth integration when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured.
- Optional Supabase Postgres tables for profiles, entries, parsed activities, settings, and daily summaries.
- Row-level security policies are included in `supabase/schema.sql`.
- New local accounts start empty.
- Demo data is loaded only when the user clicks the Demo action.
- Passcode hashes are stored locally for MVP convenience.
- JSON export and import backup.
- Settings now includes account status, sync status, backup/import controls, safe data clearing, beta privacy copy, and beta terms.
- Cloud data clearing deletes LifeQuest activity entries and daily summaries under the signed-in user's RLS scope.

Remaining production work:

- Create a Supabase project and run `supabase/schema.sql`.
- Add production Supabase environment variables in Vercel or Netlify.
- For GitHub Pages, add `VITE_SUPABASE_URL` as a repository variable and `VITE_SUPABASE_ANON_KEY` as a repository secret.
- Test sign-up, login, logout, import, delete, and cross-device sync with real test users.
- Add a secure backend or Edge Function for full Supabase Auth account deletion before a broader launch.

Suggested auth options:

- Supabase Auth for a small full-stack app. This is now the built-in first path.
- Firebase Auth if you want fast Google/Email login.
- Clerk if you want a polished managed auth layer.
- Custom backend only if you need full control.

## 4. Parser Correction

Current state:

- Users can edit parsed activities before saving.
- Fields include activity name, category, minutes, difficulty, and BaseXP.

Remaining production work:

- Save user corrections as custom rules.
- Learn frequent aliases locally.

## 5. Edit Saved Logs

Current state:

- Saved entries can be edited and rescored.

Remaining production work:

- Add undo for deletes.
- Add change history if users need auditing.

## 6. Tests

Current state:

- Parser, Chinese parsing, scoring, manual correction, and stats have Node tests.

Run:

```bash
npm test
```

Remaining production work:

- Add component tests.
- Add browser end-to-end tests.

## 7. Deployment

Current state:

- App builds with Vite.
- GitHub Pages can host the static public beta.
- Vercel and Netlify can host the app with Supabase environment variables.

Run:

```bash
npm run build
```

Deploy options:

- Vercel
- Netlify
- Static file hosting from the `dist/` folder

Production notes:

- Use HTTPS for microphone permissions.
- Keep AI provider API keys on the backend.
- Keep Supabase service-role keys out of the frontend.
- Use service-role credentials only in a trusted backend when implementing full account deletion.
- Verify Supabase row-level security before inviting real users.
- Replace beta privacy/terms copy with production-reviewed legal text before a broad launch.
