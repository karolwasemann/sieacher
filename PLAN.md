# Sieacher — plan

Living document. Updated as decisions are made. Terms are defined in [GLOSSARY.md](GLOSSARY.md).

## Settled decisions

| #   | Decision                                                                                                                      | Notes                                                                               |
| --- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 1   | Language: TypeScript                                                                                                          |                                                                                     |
| 2   | Single Learner, no accounts                                                                                                   | Design so users can be added later                                                  |
| 3   | Web app                                                                                                                       | Browser mic recording needed for voice phase                                        |
| 5   | Tutor gives Corrections alongside its reply, explained in the App language                                                    | Was Polish only until M2                                                            |
| 6   | Separate backend server and frontend app                                                                                      | Separation of concerns                                                              |
| 7   | Anthropic models only; model id set in `.env` (e.g. Haiku)                                                                    | Our own thin wrapper over `@anthropic-ai/sdk`                                       |
| 8   | Tutor returns structured JSON (`reply` + `corrections`), validated with zod                                                   |                                                                                     |
| 9   | No streaming for now: reply arrives all at once                                                                               | Streaming may come later as its own step                                            |
| 10  | Learner may ask for help in the App language; Tutor answers briefly in it, then returns to the Target language                | Goes into the system prompt                                                         |
| 11  | Learner types a Topic or picks one of a few randomly suggested Topics                                                         |                                                                                     |
| 12  | Conversations and Corrections are stored in Postgres; the Tutor reuses past Corrections to check what the Learner has learned | Was SQLite until M3 planning                                                        |
| 13  | Tests with Vitest against a fake model; frontend built with Vite                                                              |                                                                                     |
| 14  | Local only for now: nothing deployed, server listens on localhost                                                             | Deploy later: see "D — deploy to AWS"                                               |
| 15  | Runtime: Node.js; web framework: Hono                                                                                         | Hono is web-standard and runtime-portable                                           |
| 16  | pnpm workspace: `server/`, `web/`, `shared/`                                                                                  | `shared/` holds the zod contract between server and web                             |
| 17  | Frontend: React + Vite + Tailwind                                                                                             |                                                                                     |
| 18  | Suggested Topics: 5 picked at random from a fixed list of 20 in `web/`, each written in EN, DE and PL                         | Replaces model-generated Topics; no model call, no cost                             |
| 19  | Locally, Postgres runs in Docker Compose (`postgres:17`, data in a named volume); the server reads `DATABASE_URL` from `.env` | Replaces the SQLite file next to the server                                         |
| 20  | Corrections are grouped into Mistakes (recurring patterns)                                                                    |                                                                                     |
| 21  | Active review: Tutor tests past Mistakes; a Mistake is Learned after N passed Checks, and comes back if made again            | A small spaced-repetition system                                                    |
| 22  | No Turborepo; plain `pnpm -r` scripts                                                                                         | Add only if build caching becomes a pain                                            |
| 23  | Database access: Drizzle ORM                                                                                                  | Typed, SQL-like, no decorators (unlike TypeORM)                                     |
| 24  | Server owns Conversation state behind a `ConversationStore` interface (in-memory in M1, Postgres from M3)                     | API shape stays stable across milestones                                            |
| 25  | Full history to the model in M1–M2; from M5, last N Messages + a summary (Topic tags, most frequent Mistakes)                 | Measure tokens first                                                                |
| 26  | Mistake categories are a fixed list per Target language in `shared/`, enforced by the JSON schema                             | Keys only; labels live in `web/` i18n                                               |
| 27  | Level is fixed for a Conversation; changing Level means starting a new Conversation                                           |                                                                                     |
| 28  | Invalid model JSON: retry once with the validation error, then show a Polish error and let the Learner resend                 |                                                                                     |
| 29  | UI strings through react-i18next, in PL, EN and DE                                                                            | Tutor's explanations come from the model, not i18n                                  |
| 30  | Past Conversations can be resumed, always at their original Level                                                             | M3                                                                                  |
| 31  | All tooling runs inside WSL: Node 24 LTS via nvm, pnpm via corepack                                                           |                                                                                     |
| 32  | One commit per step, Conventional Commits                                                                                     |                                                                                     |
| 33  | The Tutor is called Lulu (she), same persona for both Target languages                                                        |                                                                                     |
| 34  | Toolchain: Vite+ (`vp`) for dev, build, test, lint, format, tasks                                                             | Fall back to separate tools for `server/` if awkward                                |
| 35  | First screen: the Learner picks the App language (PL, EN or DE); all UI text, Topics and explanations use it                  | Not remembered yet; settings come with M3                                           |
| 36  | The Target language cannot equal the App language; `shared/` enforces it on the create request                                | Picker hides that option                                                            |
| 37  | The App language is stored on the Conversation and sent to the server, which uses it in Lulu's prompt                         | Fixed for a Conversation, like the Level                                            |
| 38  | Topic is required, validated as `z.string().trim().min(1).max(120)`, and goes into Lulu's system prompt                       | Trust boundary: typed text reaches the prompt                                       |
| 39  | Lulu writes the Opening: the server sends a fixed kickoff Message, stores her answer as `opening` on the Conversation         | API needs a user Message first; flat Message list in M3                             |
| 40  | The Opening is generated inside `POST /api/conversations`; if the model fails, 502 and no Conversation is created             | One request gives a ready chat                                                      |
| 41  | "Suggest others" button re-picks 5 Topics                                                                                     |                                                                                     |
| 42  | Deployed to AWS                                                                                                               |                                                                                     |
| 43  | `web/` on S3 + CloudFront; `server/` in a Docker container, first on one EC2 with docker compose, later maybe on ECS Fargate  | Fargate is optional, a learning step                                                |
| 44  | Infrastructure in Terraform, deployed from GitHub Actions                                                                     |                                                                                     |
| 45  | Database: Postgres; in the cloud on RDS from the first deploy, so the server holds no data (stateless)                        | Server can restart or move without losing data                                      |
| 46  | Postgres driver: `pg` (node-postgres) with `drizzle-orm/node-postgres`                                                        | Most used; works with RDS as is                                                     |
| 47  | Migrations: `drizzle-kit generate` writes SQL files we commit and review; the server applies them on startup                  | Not `drizzle-kit push`: we want to read the SQL                                     |
| 48  | Store and route tests run against PGlite (Postgres in-process, no Docker); the in-memory store is deleted once Postgres works | A fake only pays off when the real thing is slow, costly or random (like the model) |
| 49  | Tables: `conversations`, `messages` (flat list, Opening is the first Tutor Message), `corrections`; kickoff not stored        | Mistake tables come in M4                                                           |
| 50  | Resuming a Conversation switches the UI to that Conversation's App language                                                   | Its explanations are already in that language                                       |
| 51  | The App language is remembered in `localStorage` in `web/`                                                                    | No settings table: one Learner, server never reads it                               |

## Milestones

### M1 — first working Conversation

The Learner opens the app, picks a Target language (EN/DE) and a Level (A1–C2), and has a text Conversation with the Tutor, who adapts to that Level and gives Corrections. No saved history, no voice, no settings page.

| Step | What                                                                                                      | Status |
| ---- | --------------------------------------------------------------------------------------------------------- | ------ |
| 0    | Install Node 24 (nvm) and pnpm (corepack) in WSL                                                          | done   |
| 1    | Workspace skeleton: `server/`, `shared/`, base tsconfig, Vite+, one passing test (`web/` moved to step 7) | done   |
| 2    | `shared/`: zod schemas — Target language, Level, Mistake category, Tutor reply                            | done   |
| 3    | `server/`: `ChatModel` interface, Anthropic adapter, `.env` config (key + model id)                       | done   |
| 4    | `server/`: Lulu's system prompt builder (pure function + tests)                                           | done   |
| 5    | `server/`: Tutor reply flow — call → parse → validate → retry once; fake model, tested with it            | done   |
| 6    | `server/`: in-memory `ConversationStore` + Hono routes, listening on `127.0.0.1`                          | done   |
| 7    | `web/`: Vite + React + Tailwind + react-i18next, Target language & Level picker                           | done   |
| 8    | `web/`: chat screen with Corrections and error state                                                      | done   |
| 9    | Try it end to end, look at token usage                                                                    | done   |

### M2 — App language and Topics

The Learner first picks their App language (PL, EN or DE). All UI text, suggested Topics and Lulu's explanations use it. Then they pick a Target language and Level, and type a Topic or pick one of 5 suggested ones. Lulu opens the Conversation with an Opening about the Topic.

| Step | What                                                                                                                                          | Status |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1    | `shared/`: `AppLanguage`; `appLanguage` in the create request; Target ≠ App language                                                          | done   |
| 2    | `server/`: App language in Lulu's prompt (explanations, help rule) and in the store                                                           | done   |
| 3    | `web/`: EN and DE translations of all UI strings; i18n follows the App language                                                               | done   |
| 4    | `web/`: App language screen before the Target language & Level picker                                                                         | done   |
| 5    | `shared/` + `server/`: `topic` in the create request, Topic in Lulu's prompt, kickoff Message, `opening` in the store and the create response | done   |
| 6    | `web/`: list of 20 Topics (EN/DE/PL) and a random pick of 5, with a test                                                                      | done   |
| 7    | `web/`: Topic screen in the App language — 5 suggestions, own Topic, Suggest others, loading/error                                            | done   |
| 8    | `web/`: chat shows the Topic and Lulu's Opening                                                                                               | done   |
| 9    | Try it end to end in all three App languages, look at the Opening's token usage                                                               | todo   |

### M3 — persistence

Conversations, Messages and Corrections are saved in Postgres, so they survive a server restart. The Learner sees a list of past Conversations and can continue any of them.

**In plain words.** Today everything lives in the server's memory: stop `pnpm dev` and all Conversations are gone. After M3, the server writes every Message into a database. Example: you talk to Lulu about "my last holiday", close the laptop, come back the next day, pick that Conversation from the list, and continue where you stopped, at the same Level.

**How the pieces fit:**

```
browser → server (pnpm dev) → Postgres (Docker container, port 5432)
```

- **Postgres** is a database program. It runs in Docker, so you don't install it into WSL. Its data sits in a Docker _volume_ (a folder Docker keeps), so stopping the container does not delete it.
- **Drizzle** is how our TypeScript talks to Postgres. We describe the tables in TypeScript; Drizzle turns queries into SQL and gives us types.
- **Migration** is a SQL file that changes the database shape, e.g. "create table `messages`". Drizzle writes it from our schema, we read it, commit it, and the server runs new ones when it starts.
- **PGlite** is Postgres running inside the test process. Tests use it, so `vp test` needs no Docker.

**The data, with an example:**

| Table           | One row looks like                                                                 |
| --------------- | ---------------------------------------------------------------------------------- |
| `conversations` | `id: 7f3a…`, `appLanguage: pl`, `targetLanguage: de`, `level: A2`, `topic: Urlaub` |
| `messages`      | `id: 12`, `conversationId: 7f3a…`, `role: tutor`, `content: "Wohin bist du…"`      |
| `corrections`   | `messageId: 13`, `original: "ich habe gegangen"`, `corrected: "ich bin gegangen"`  |

The Opening is just the first `tutor` Message. A Correction belongs to the Learner's Message it fixes.

| Step | What                                                                                                                                                             | Status |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 0    | Install Docker Engine in WSL; `compose.yaml` with Postgres 17 (data in a volume, port only on `127.0.0.1`)                                                       | done   |
| 1    | `server/`: `ConversationStore` becomes async and stores a flat list of Messages; update the in-memory store and routes; tests stay green, no database yet        | done   |
| 2    | `server/`: Drizzle schema for the 3 tables, drizzle-kit config, first migration generated and read together                                                      | done   |
| 3    | `server/`: Postgres `ConversationStore` (writes in a transaction), tested against PGlite                                                                         | done   |
| 4    | `server/`: `DATABASE_URL` in `.env.example` and config, run migrations on startup; `index.ts` and route tests use the Postgres store; delete the in-memory store | done   |
| 5    | `shared/` + `server/`: `GET /api/conversations` (the list) and `GET /api/conversations/:id` (Messages + Corrections); `:id` checked as a uuid                    | done   |
| 6    | `web/`: Home screen after the App language screen: "New Conversation" button and the list of past Conversations                                                  | todo   |
| 7    | `web/`: resume: the chat loads its history and continues at the original Level, in the Conversation's App language                                               | todo   |
| 8    | `web/`: remember the App language in `localStorage`                                                                                                              | todo   |
| 9    | Try it end to end: talk, restart the server, resume, look at the rows with `psql`; short retro                                                                   | todo   |

**Why some choices, in one line each:**

- Step 1 has no database on purpose: we change the shape of the store first and review it alone, then add Postgres.
- A _transaction_ means "all or nothing". Example: saving a turn writes the Learner's Message, Lulu's reply and 2 Corrections. If the third write fails, none are kept, so you never see a reply without its Corrections.
- `:id` is checked as a uuid because Postgres throws an error on a broken id like `abc`. Without the check, a typo in the URL would be a 500 instead of a 404.

### D — deploy to AWS

Sieacher runs on AWS with a domain and HTTPS, built and deployed from GitHub Actions. Comes after M3; steps 1–4 can start earlier.

| Step | What                                                                                                                    | Status |
| ---- | ----------------------------------------------------------------------------------------------------------------------- | ------ |
| 1    | Dockerfiles for `server/` and `web/`, docker compose for local dev; server host comes from config, not `127.0.0.1` only | todo   |
| 2    | GitHub Actions CI: lint, test and build the images on every push                                                        | todo   |
| 3    | AWS account: IAM user (no root), MFA, billing alarm                                                                     | todo   |
| 4    | `web/` on S3 + CloudFront, domain + HTTPS                                                                               | todo   |
| 5    | Access control for the public app (no accounts yet, every call spends Anthropic credits)                                | todo   |
| 6    | Postgres on RDS; `server/` on one EC2 with docker compose; API key and `DATABASE_URL` in SSM Parameter Store            | todo   |
| 7    | CD: deploy from GitHub Actions on push to `main`                                                                        | todo   |
| 8    | Infrastructure in Terraform                                                                                             | todo   |
| 9    | Monitoring: Sentry, CloudWatch logs, health check endpoint                                                              | todo   |
| 10   | Optional, for learning: `server/` to ECS Fargate (same image, same RDS; adds a load balancer, ~$16+/month)              | todo   |
| 11   | README: how it's deployed                                                                                               | todo   |

### M4 — Mistakes and review

Corrections are grouped into Mistakes. The Tutor weaves past Mistakes into new Conversations to check them; passed checks lead to a Mistake becoming Learned.

### M5 — polish

Streaming replies, other quality-of-life improvements.

### M6 — voice

The Learner speaks; speech-to-text in, text-to-speech out. Providers decided at that point.

## End product vision

_To be discussed._

## Deferred decisions

- M4: N (passed Checks needed for Learned), how many Checks per Conversation, the "comes back" rule details.
- M6: speech-to-text and text-to-speech providers.
- D: check current AWS free-tier rules and prices (EC2, RDS, Fargate on the Free plan) in the console at step 3, before building anything.
- D: how the public app is protected (access code, basic auth, rate limit) while there are no accounts.
- M5: generate the prompt's output format from the zod schema (`z.toJSONSchema`), together with API structured outputs.
