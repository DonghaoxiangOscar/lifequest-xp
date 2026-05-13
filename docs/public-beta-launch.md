# LifeQuest XP Public Beta Launch Notes

This document describes the first public-test version of LifeQuest XP.

## What This Version Can Do

- Visitors can create a local account in the browser.
- New accounts start with zero stats and empty activity logs.
- Users can log activities with text, quick actions, or supported browser voice input.
- The app parses activities locally and calculates Growth locally.
- Users can switch display language in Settings.
- Users can export, import, or clear local data from Profile.
- The app can be built as a static Vite site.

## Current Limitations

- Accounts are local-only and do not sync across devices.
- Activity data is stored in `localStorage`, not a cloud database.
- AI parser/report endpoints are only designed as placeholders.
- Browser speech support depends on the user's browser.
- There is no production privacy policy or delete-account backend yet.

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
6. Invite only a small group of testers and explain that data is local to their browser.

## Next Production Upgrade

For a real public website, add:

- Supabase Auth or another production auth provider.
- Cloud tables for profiles, entries, parsed activities, settings, and daily reports.
- Row-level access rules so users can only read and write their own data.
- Backend AI endpoints for low-confidence parsing and user-requested daily reports.
- Privacy policy, terms, export data, and delete account flows.
