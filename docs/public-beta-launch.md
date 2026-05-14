# LifeQuest XP Public Beta Launch Notes

This document describes the first public-test version of LifeQuest XP.

## What This Version Can Do

- Visitors can create a local account in the browser.
- If Supabase environment variables are configured, visitors can use Supabase Auth accounts instead.
- New accounts start with zero stats and empty activity logs.
- Users can log activities with text, quick actions, or supported browser voice input.
- The app parses activities locally and calculates Growth locally.
- Users can switch display language in Settings.
- Users can export, import, or clear app data from Profile and Settings.
- Settings includes account status, sync status, a privacy note, beta terms, and an account deletion request template.
- The app can be built as a static Vite site.
- Supabase schema and row-level security policies are included in `supabase/schema.sql`.

## Current Limitations

- Local mode accounts do not sync across devices.
- Cloud sync requires creating a Supabase project, running the SQL schema, and setting deployment environment variables.
- AI parser/report endpoints are only designed as placeholders.
- Browser speech support depends on the user's browser.
- The app includes beta privacy and terms copy, but production legal review is still needed.
- Full Supabase Auth account deletion still needs a secure backend or admin action; the frontend must not contain a service-role key.

## Recommended First Deployment

1. Push the project to GitHub.
2. Connect the repository to Vercel or Netlify.
3. Use this build command:

```bash
npm run build
```

4. Use this publish directory:

```text
dist
```

5. Deploy with HTTPS.
6. For local-mode testing, invite only a small group and explain that data is local to their browser.
7. For cloud-mode testing, run `supabase/schema.sql`, then add `VITE_SUPABASE_URL` as a GitHub repository variable and `VITE_SUPABASE_ANON_KEY` as a GitHub repository secret.
8. Test RLS before inviting users.

## Next Production Upgrade

For a real public website, finish:

- A Supabase project using the included schema.
- Production env vars in Vercel or Netlify.
- Email templates and auth redirect URLs.
- Backend AI endpoints for low-confidence parsing and user-requested daily reports.
- Production-reviewed privacy policy and terms.
- A backend delete-account endpoint or Supabase Edge Function using service-role credentials safely on the server side.
