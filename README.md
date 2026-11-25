# Botdanna

**Your AI English coach.** Botdanna is a Windows app for learning English with a coach that answers any question, practises real situations with you, and checks your writing. It works with your own AI key, and it uses the same accounts and cloud data as [Danna](https://github.com/emireln/danna), so you can sign in with the same account in both apps.

## What you can do

- **Chat with the coach.** Ask anything about English, or pick a way to work: conversation practice, fix my writing, speaking practice, exam practice, a grammar lesson, a vocabulary builder, read and discuss, or practise your mistakes. The coach adapts to your level and goal, and every reply can include exercises, a feedback card, vocabulary to save, and quick replies.
- **Role-play scenes.** Practise real situations with a character: ordering at a café, a job interview, a hotel check-in, a complaint at a shop, and more. A scene ends with a short summary of what went well.
- **Writing check.** Write up to 1,500 words. The check gives a score, a tone, and a fix for each issue, with the reason written in your language. Take the fixes you agree with.
- **Your files.** Keep PDF, TXT and Markdown files and learning links in your library. Ask the coach about them, and tap a word while you read to see its meaning and save it for review.
- **Listen.** Read-aloud uses a built-in voice that works offline, or a Windows voice, or an OpenAI or Gemini voice with your key.
- **Your way.** Classic or Playful look, English or Português (Brasil).

## Your AI key

Botdanna works with your own key from OpenAI, Anthropic, Google Gemini, OpenRouter or DeepSeek. The key is encrypted on your computer with the protection Windows provides, and your messages go straight from the app to the provider you chose.

- The coach, the writing check, the word help and the practice all use the chat model of the provider you choose.
- Speech-to-text (speaking practice and the coach's microphone) needs an OpenAI or Gemini key.

## Accounts and data

- **With an online account**, your chats, files, profile and AI keys (sealed with your password) are kept in that account, the same one Danna uses.
- **On this device**, everything stays on your computer, and nothing is sent anywhere except to the AI provider when you ask the coach something.

## Install

Download `botdanna-setup-<version>-x64.exe` from the latest release and run it. Windows may warn about an unsigned app. Choose *More info*, then *Run anyway* if you trust the source.

## Privacy

- Each coach reply is sent to the provider you chose, with the recent messages of the chat, the files you attached, and a short summary of your learning: your level, goal, exam date, skill scores and recent mistakes. Your name and email are not included.

## For developers

```powershell
npm ci            # install, and set up the git hooks
npm run dev       # the desktop app, with hot reload
npm run web       # the interface in a browser (no AI keys, tray or files)
npm test          # every test
npm run typecheck
npm run dist      # the Windows installer in release/
```

`AGENTS.md` describes the layout, the rules the tests enforce, and how the database is shared with Danna. `docs/botdanna.md` explains what was kept from Danna and what was left out.
