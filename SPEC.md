# Sieacher — language tutor agent

A personal AI tutor for daily English and German conversation practice.
The project has two goals: improve my languages, and teach me how to build an agent from scratch.

## Learner

- Native language: Polish
- English: B1
- German: B2
- Goal: fluent everyday and work conversation
- Developer profile: 4+ years of TypeScript, new to AI

## Decisions

### Product

- **Users**: one user (me), running locally. No login.
- **Interface**: web app in the browser.
- **Modality**: text first. Voice in the browser is the last milestone.
- **One language per session**: I pick English or German at the start. Mistakes, vocabulary and level are stored separately per language.
- **Session shape**: free conversation on a topic, about 15 minutes. The tutor replies naturally; corrections appear in a side panel and do not interrupt the chat.
- **Topics**: in the first sessions the tutor proposes random topics. Later it proposes topics based on my preferences and weak areas. I can always type my own.
- **Corrections**: every mistake is saved in the database. What the panel shows depends on how many there are:
  - many mistakes in a message: only the important ones
  - few mistakes: also the small ones
  - each correction has the corrected sentence, a short rule and a category (grammar, word choice, word order, spelling)
- **Explanation language**: the tutor explains in the target language first. If that does not help, it explains in Polish.
- **Polish input**: when I write something in Polish, the tutor gives the proper way to say it in the target language.
- **Level**: stored per language. The tutor speaks slightly above my level. It may suggest a level change in the session summary, but only I confirm it.
- **Ending a session**: an "End session" button triggers the summary, updates the review boxes and saves everything.

### Technical

- **Model API**: Claude API through the official `@anthropic-ai/sdk` only. No LangChain, no Vercel AI SDK, no agent framework.
- **Model**: Sonnet 5.5 (`claude-sonnet-5-5`) by default. The model ID is an env variable so I can compare with Opus 5.5.
- **Stack**: one repo, pnpm, running in WSL. Node server with Hono, Vite + React frontend, replies streamed with Server-Sent Events. No Next.js, so the agent loop stays plain and visible.
- **API key**: in a `.env` file that is never committed. A low monthly spend limit is set in the Anthropic Console.
- **Storage**: SQLite, one file on my machine. Tables for learner profile, mistakes, vocabulary, session summaries and full transcripts.
- **Long-term memory**: a short digest goes into the system prompt at session start. The tutor reads more through tools when it needs it. No embeddings or vector database in the first version.
- **Context**: the whole session history is sent on each turn, with prompt caching. No summarising of old turns in the first version.
- **Agent tools**: save a mistake, save a new word, read the learner profile, pick items due for review, write a session summary.
- **How corrections are produced**: the tutor calls a `record_mistake` tool in the same turn as its reply. Later I build a separate corrector call and compare the two.
- **Review system**: a Leitner box system implemented by hand. Right answer moves the item up a box, wrong answer sends it back to box 1.
- **Tests**: Vitest unit tests for the agent loop with a mocked model client. Later, a small eval set of sentences with known mistakes.

### How we work

- I write the agent core myself (loop, tool calling, memory, prompts).
- Each step starts with a short explanation of the concept and a concrete example.
- When I need it, Claude writes code together with me, step by step, explaining why each part is there.
- Claude writes the boring parts alone: project setup, UI shell, config.
- Claude reviews my code after each step.

## Milestones

1. **Bare streaming chat** — browser sends a message, server calls the model, reply streams back.
2. **Agent loop with the first tool** — the loop handles tool calls and tool results.
3. **SQLite and memory** — profile, transcripts and the session-start digest.
4. **Corrections panel** — `record_mistake` tool and the adaptive side panel.
5. **Review and session summary** — Leitner boxes, "End session", topic proposals from preferences.
6. **Evals** — a set of sentences with known mistakes that checks the tutor.
7. **Voice in the browser** — speech-to-text and text-to-speech; the technology is chosen when we get here.

## Before milestone 1

- Create an Anthropic API key with billing and put it in `.env`.
