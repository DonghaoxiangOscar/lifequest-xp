# LifeQuest XP Public Beta Test Plan

Use this plan before inviting people outside the project to test LifeQuest XP.

## 1. Deployment Smoke Test

- Open the public URL on desktop Chrome or Edge.
- Open the public URL on a mobile browser.
- Refresh on Dashboard, Log Entry, Report, Profile, and Settings.
- Confirm the page does not get stuck on the loading screen.
- Confirm language switching works.

## 2. Account Test

- Register a new test account.
- Confirm the email, then return to the app.
- Log in with the confirmed account.
- Log out and log in again.
- Request a password reset from the login screen.
- Open the reset email and set a new password.
- Log in using the new password.

## 3. Activity Test

- Add one activity from a quick-start button.
- Add one natural-language entry, such as `Today I studied for 1 hour and ran 20 minutes`.
- Edit a parsed activity before saving.
- Delete a saved activity.
- Refresh the page and confirm the activity remains.

## 4. Data Control Test

- Export JSON from Settings.
- Clear LifeQuest data.
- Import the JSON backup.
- Confirm Growth, attributes, and today's activities return.
- Copy the account deletion request template.

## 5. Public Beta Invite Rules

- Start with 5 to 10 testers.
- Tell testers it is a beta self-tracking tool, not medical or professional advice.
- Tell testers not to reuse an important password until the launch stack is fully reviewed.
- Ask testers to report where they get stuck, confusing scoring, and sync failures.

## 6. Manual Setup Before Larger Beta

- Configure Supabase custom SMTP to avoid email rate limits.
- Add a custom domain and HTTPS deployment through Vercel or Netlify.
- Add error monitoring such as Sentry.
- Replace beta privacy and terms copy with reviewed production text.
- Add a secure backend or Edge Function for full Supabase Auth account deletion.
