# botdanna: scope and decisions

botdanna is the AI version of danna. It has the same interface, behaviour, styles, languages and accounts, but it keeps only what the AI coach needs. This page records what was kept, what was left out, and what is shared with danna.

## Kept

- **Accounts and onboarding.** Welcome, sign in and sign up, the setup (look, name, goal, level and an AI key), and the profile picture and banner. The accounts and the cloud profile are the same as danna's.
- **The coach.** The chat with its ten modes and the role-play scenes, the coach's cards (exercises, feedback, vocabulary, actions and quick replies), attachments, read aloud, export, and recent chats.
- **Talk live (switched off for now).** The 3D coach (drawn by TalkingHead), the Gemini Live engine, and the typed engine that reads with the app's voice stay in the code. `LIVE_TALK_ENABLED` in `src/lib/features.ts` hides the tab, the coach card and the page until the talk is ready.
- **Writing check.** The check with a model or with local rules, and the fixes that can be taken or ignored.
- **Library.** Files and learning links, the library's coach, and word help with save-to-review.
- **Settings.** Language, look, sounds, AI keys and models, the listening voice, the tray, the account, updates and feedback.

## Left out

- The roadmap, lessons, units, placement, the practice runner, the TOEFL and level tests, and the bundled lesson content.
- Decks and the flashcard screens, self study, the review screen, and the reports.
- The daily goal, quests, streaks, XP, the weekly league, achievements and levels.
- Friends, shared results, and the sharing sheet.
- Reminders and notifications, the guided tour, the global search, the announcements banner and the "What's new" page.
- The support link to the developer's donation page.

## Shared with danna

- **The database.** `supabase/` is byte-identical to danna's repository: the same `schema.sql`, the same migrations and the same policy tests. botdanna uses the same tables for profiles, chats, files and AI keys, so a change to one app's data is seen by the other.
- **The accounts.** The same Supabase project and the same public settings (`.env.development` and `.env.production`).
- **The AI keys in an account.** A key saved in the account is sealed with the account's vault and bound to `danna-ai-key:<provider>`. botdanna keeps that binding, so a key saved by either app opens in the other. See `AGENTS.md`.

## Not shared

- **Data on the device.** botdanna keeps its own local database (`botdanna.db`) and its own app data folder, so the data on this device is not shared with danna on the same computer. Moving data to the account works the same way as in danna.
- **Keys on the device.** The encrypted device copy of each key is stored in botdanna's own folder.

## Renamed

- The app: name, product name, app id (`app.botdanna.desktop`), installer, shortcuts, tray menu and window title. Version `1.0.0` starts the line.
- Identifiers: the bridge is `window.botdanna`, the environment variables are `BOTDANNA_*`, and the browser storage keys are `botdanna.*`.
- The app icon and the tray icon are built from `brand/icon.png` and `brand/tray-icon.png`. The in-app mark comes from `brand/logo.png`, and the installer's side picture from `brand/banner.png`.

## Follow-ups

- The Portuguese pack still holds translations for the removed screens. They are harmless, and can be pruned later.
- The lesson tables stay in the shared schema on purpose, because danna still uses them.
- The installer is not code-signed, so Windows shows a warning on first run.
- The coach's behaviour was checked for structure and tests, not against live models. Try a few real chats with your own key before you rely on the prompts.
