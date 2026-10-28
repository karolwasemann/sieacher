# Sieacher

**Practise a foreign language by chatting with Lulu, an AI tutor who talks to you at your level and quietly fixes your mistakes.**

<p align="center">
  <img src="docs/demo.gif" alt="Picking English as the app language, German at level A2 and a topic, then chatting with Lulu, who replies in German and shows Corrections explained in English" width="720">
</p>

## What it does

Textbooks teach you rules; Sieacher gives you somewhere to use them. You pick a language, a level and something to talk about, and Lulu starts a conversation. You write back, she answers, and every mistake you make shows up as a small card under your message, with the fix and a one-sentence explanation in your own language. The conversation never stops for a grammar lesson.

1. **Pick your app language**: Polish, English or German. All buttons, topics and explanations use it.
2. **Pick what you are learning and your level**: English or German, from A1 to C2 (CEFR).
3. **Pick a topic**: choose one of the suggestions (_Travelling_, _Your family_, _Childhood memories_ …) or type your own.
4. **Chat**: Lulu opens with a question about the topic. You answer in the language you are learning.
5. **Learn from your Corrections**: each one shows what you wrote, what it should be, the kind of mistake (tense, case, articles, word order …) and why.

## Features

- **Lulu adapts to your level.** At A1 she uses short, present-tense sentences and everyday words; at C2 she talks like a native speaker, idioms and all.
- **Corrections without interruptions.** Mistakes are shown next to the conversation, never inside Lulu's reply. Correct messages get a ✓.
- **Explanations in your language.** The reply is in the language you are learning; the explanation of each mistake is in Polish, English or German.
- **Ask for help any time.** Stuck on a word? Ask in your own language; Lulu answers briefly and switches back.
- **Mistakes sorted by kind.** Every Correction has a category (for German: case, gender, verb position, conjugation …; for English: tense, articles, prepositions …), so patterns become visible.
- **Conversations are saved** in Postgres and survive a restart.

## Coming next

- A list of past Conversations you can continue
- Recurring **Mistakes**: Lulu notices what you keep getting wrong, checks it again later, and marks it learned once you get it right
- **Voice**: speak instead of typing, and hear Lulu reply

See [PLAN.md](PLAN.md) for the milestones, [SPEC.md](SPEC.md) for the product idea and [GLOSSARY.md](GLOSSARY.md) for the terms used in the code.

## How it works

```
web (React, Vite, Tailwind) ──/api──▶ server (Hono, Node) ──▶ Anthropic API (Lulu)
                                           │
                                           ▼
                                  Postgres (Drizzle ORM)
```

| Folder    | What is in it                                                                                    |
| --------- | ------------------------------------------------------------------------------------------------ |
| `web/`    | The React app: language, level and topic screens, the chat, translations (react-i18next)         |
| `server/` | The Hono API: Lulu's system prompt, calls to Claude, reply validation, Postgres storage          |
| `shared/` | The zod contract between them: languages, levels, Mistake categories, the shape of a Tutor reply |

Lulu answers in JSON (`reply` + `corrections`). The server validates it with zod, asks once more if it is invalid, and stores the Conversation only after a valid answer.

## Run it locally

You need Node 24 (see `.nvmrc`), pnpm (via corepack), Docker and an [Anthropic API key](https://console.anthropic.com/).

```bash
pnpm install
```

```bash
cp server/.env.example server/.env
```

Put your API key into `server/.env`, then start Postgres:

```bash
docker compose up -d
```

Start the server and the web app together:

```bash
pnpm dev
```

Open http://localhost:5173. The server listens on http://127.0.0.1:3000 and applies database migrations when it starts.

### Other commands

| Command                                | What it does                                                         |
| -------------------------------------- | -------------------------------------------------------------------- |
| `pnpm test`                            | Run all tests (no Docker or API key needed: a fake model and PGlite) |
| `pnpm check`                           | Lint, format and type-check                                          |
| `pnpm -F @sieacher/server db:generate` | Write a new migration after changing `server/src/db/schema.ts`       |
| `pnpm -F @sieacher/server db:studio`   | Browse the database in Drizzle Studio                                |
