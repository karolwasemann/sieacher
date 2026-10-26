# Sieacher — plan

Living document. Updated as decisions are made. Terms are defined in [GLOSSARY.md](GLOSSARY.md).

## Settled decisions

| #   | Decision                                                                                                                            | Notes                                                   |
| --- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| 1   | Language: TypeScript                                                                                                                |                                                         |
| 2   | Single Learner, no accounts                                                                                                         | Design so users can be added later                      |
| 3   | Web app                                                                                                                             | Browser mic recording needed for voice phase            |
| 5   | Tutor gives Corrections alongside its reply, explained in the App language                                                          | Was Polish only until M2                                |
| 6   | Separate backend server and frontend app                                                                                            | Separation of concerns                                  |
| 7   | Anthropic models only; model id set in `.env` (e.g. Haiku)                                                                          | Our own thin wrapper over `@anthropic-ai/sdk`           |
| 8   | Tutor returns structured JSON (`reply` + `corrections`), validated with zod                                                         |                                                         |
| 9   | No streaming for now: reply arrives all at once                                                                                     | Streaming may come later as its own step                |
| 10  | Learner may ask for help in the App language; Tutor answers briefly in it, then returns to the Target language                      | Goes into the system prompt                             |
| 11  | Learner types a Topic or picks one of a few randomly suggested Topics                                                               |                                                         |
| 12  | Conversations and Corrections are stored locally in SQLite; the Tutor reuses past Corrections to check what the Learner has learned |                                                         |
| 13  | Tests with Vitest against a fake model; frontend built with Vite                                                                    |                                                         |
| 14  | Local only for now: nothing deployed, server listens on localhost                                                                   | Deploy later: see "D — deploy to AWS"                   |
| 15  | Runtime: Node.js; web framework: Hono                                                                                               | Hono is web-standard and runtime-portable               |
| 16  | pnpm workspace: `server/`, `web/`, `shared/`                                                                                        | `shared/` holds the zod contract between server and web |
| 17  | Frontend: React + Vite + Tailwind                                                                                                   |                                                         |
| 18  | Suggested Topics: 5 picked at random from a fixed list of 20 in `web/`, each written in EN, DE and PL                               | Replaces model-generated Topics; no model call, no cost |
| 19  | SQLite file lives next to the local server                                                                                          |                                                         |
| 20  | Corrections are grouped into Mistakes (recurring patterns)                                                                          |                                                         |
| 21  | Active review: Tutor tests past Mistakes; a Mistake is Learned after N passed Checks, and comes back if made again                  | A small spaced-repetition system                        |
| 22  | No Turborepo; plain `pnpm -r` scripts                                                                                               | Add only if build caching becomes a pain                |
| 23  | Database access: Drizzle ORM                                                                                                        | Typed, SQL-like, no decorators (unlike TypeORM)         |
| 24  | Server owns Conversation state behind a `ConversationStore` interface (in-memory in M1, SQLite from M3)                             | API shape stays stable across milestones                |
| 25  | Full history to the model in M1–M2; from M5, last N Messages + a summary (Topic tags, most frequent Mistakes)                       | Measure tokens first                                    |
| 26  | Mistake categories are a fixed list per Target language in `shared/`, enforced by the JSON schema                                   | Keys only; labels live in `web/` i18n                   |
| 27  | Level is fixed for a Conversation; changing Level means starting a new Conversation                                                 |                                                         |
| 28  | Invalid model JSON: retry once with the validation error, then show a Polish error and let the Learner resend                       |                                                         |
| 29  | UI strings through react-i18next, in PL, EN and DE                                                                                  | Tutor's explanations come from the model, not i18n      |
| 30  | Past Conversations can be resumed, always at their original Level                                                                   | M3                                                      |
| 31  | All tooling runs inside WSL: Node 24 LTS via nvm, pnpm via corepack                                                                 |                                                         |
| 32  | One commit per step, Conventional Commits                                                                                           |                                                         |
| 33  | The Tutor is called Lulu (she), same persona for both Target languages                                                              |                                                         |
| 34  | Toolchain: Vite+ (`vp`) for dev, build, test, lint, format, tasks                                                                   | Fall back to separate tools for `server/` if awkward    |
| 35  | First screen: the Learner picks the App language (PL, EN or DE); all UI text, Topics and explanations use it                        | Not remembered yet; settings come with M3               |
| 36  | The Target language cannot equal the App language; `shared/` enforces it on the create request                                      | Picker hides that option                                |
| 37  | The App language is stored on the Conversation and sent to the server, which uses it in Lulu's prompt                               | Fixed for a Conversation, like the Level                |
| 38  | Topic is required, validated as `z.string().trim().min(1).max(120)`, and goes into Lulu's system prompt                             | Trust boundary: typed text reaches the prompt           |
| 39  | Lulu writes the Opening: the server sends a fixed kickoff Message, stores her answer as `opening` on the Conversation               | API needs a user Message first; flat Message list in M3 |
| 40  | The Opening is generated inside `POST /api/conversations`; if the model fails, 502 and no Conversation is created                   | One request gives a ready chat                          |
| 41  | "Suggest others" button re-picks 5 Topics                                                                                           |                                                         |
| 42  | Deployed to AWS                                                                                                                     |                                                         |
| 43  | `web/` on S3 + CloudFront; `server/` in a Docker container, first on one EC2 with docker compose, later on ECS Fargate              | SQLite needs a persistent disk                          |
| 44  | Infrastructure in Terraform, deployed from GitHub Actions                                                                           |                                                         |

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

SQLite. Conversations and Corrections are saved; the Learner can view past Conversations.

### D — deploy to AWS

Sieacher runs on AWS with a domain and HTTPS, built and deployed from GitHub Actions. Comes after M3; steps 1–4 can start earlier.

| Step | What                                                                                                                    | Status |
| ---- | ----------------------------------------------------------------------------------------------------------------------- | ------ |
| 1    | Dockerfiles for `server/` and `web/`, docker compose for local dev; server host comes from config, not `127.0.0.1` only | todo   |
| 2    | GitHub Actions CI: lint, test and build the images on every push                                                        | todo   |
| 3    | AWS account: IAM user (no root), MFA, billing alarm                                                                     | todo   |
| 4    | `web/` on S3 + CloudFront, domain + HTTPS                                                                               | todo   |
| 5    | Access control for the public app (no accounts yet, every call spends Anthropic credits)                                | todo   |
| 6    | `server/` on one EC2 with docker compose; SQLite on a persistent volume; API key in SSM Parameter Store                 | todo   |
| 7    | CD: deploy from GitHub Actions on push to `main`                                                                        | todo   |
| 8    | Infrastructure in Terraform                                                                                             | todo   |
| 9    | Monitoring: Sentry, CloudWatch logs, health check endpoint                                                              | todo   |
| 10   | `server/` to ECS Fargate (+ Postgres on RDS if chosen)                                                                  | todo   |
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
- Before M3: database in the cloud: SQLite on a persistent volume (fine on EC2) or Postgres on RDS (needed on ECS Fargate, where local disk is wiped on restart). Affects the Drizzle schema.
- D: how the public app is protected (access code, basic auth, rate limit) while there are no accounts.
- M5: generate the prompt's output format from the zod schema (`z.toJSONSchema`), together with API structured outputs.
