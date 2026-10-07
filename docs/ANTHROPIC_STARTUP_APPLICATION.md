# Anthropic Startups — application notes for CDS Films

Internal working document. Not published: `_config.yml` excludes `docs/` from the GitHub Pages
build. Every claim below is tied to a repo or a live URL; see "Evidence" and "Claims deliberately
not made". Last checked: 2026-10-07.

## Company

| Field                 | Value                                                         |
| --------------------- | ------------------------------------------------------------- |
| Name                  | CDS Films (also used: CD Singularity Films)                   |
| Founded               | 2024 (started in 2024; not incorporated)                      |
| Country               | Vietnam (Ho Chi Minh City)                                    |
| Stage                 | Bootstrapped / pre-seed, founder-led                          |
| Incorporation status  | Not yet incorporated. No registered legal entity.             |
| Funding               | None raised                                                   |
| Founder               | Canh Nguyen Duc                                               |
| Website               | https://cdsfilms.com                                          |
| Company email         | cdsf@cdsfilms.com (Google Workspace on cdsfilms.com)          |

If a form field requires a legal entity name or registration number, do not invent one. State
"Not yet incorporated — operating as a founder-led studio" or leave it blank and explain in a
free-text field.

## One-line description

CDS Films is a bootstrapped, founder-led studio in Vietnam building AI-native tools for
filmmaking, including FTS, a desktop app that turns films into structured screenplays using Claude.

## Application description (≈130 words)

CDS Films is a bootstrapped, founder-led studio in Vietnam building AI-native tools for filmmaking
and small creative studios. Our main Claude use case is FTS (Film-to-Screenplay), a macOS app that
turns a film into a Fountain screenplay: it transcribes and diarizes the audio, detects scenes, and
sends keyframes to Claude through the Message Batches API for visual scene understanding, then uses
Claude to name characters and polish the draft. Its output feeds Singularity Pencil, our
screenplay-native production workspace (writing, rewrite, storyboard, breakdown, shoot planning),
now in a closed pilot. Our third product, 1ManABnd, is a local-first desktop app where AI agents
running on Claude Code plan and draft work under human approval; the founder uses it
internally. All three are working software, built and used in-house.

## Claude use cases (as the code stands today)

### FTS — Anthropic API, in production code

Repo: `fts-macos` (Python, `anthropic` SDK). Cloud mode is the default backend.

| Stage                  | What Claude does                                                                                      | Where                         | Configured default model |
| ---------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------- | ------------------------ |
| Visual scene captions  | Reads 1–2 keyframes per detected scene plus nearby dialogue, returns JSON: INT/EXT, location, time, action. System prompt is prompt-cached. | `src/screenplay/vision.py` — `client.messages.batches.create/retrieve/results` | Claude Sonnet            |
| Character reasoning    | Maps diarized `SPEAKER_XX` labels to character names from in-dialogue address; conservative, unknowns stay anonymous. | `src/screenplay/characters.py` | Claude Opus              |
| Screenplay polish      | Rewrites the assembled Fountain draft to production quality, chunked at scene boundaries (~35k chars) with strict output rules. | `src/screenplay/polish.py`    | Claude Opus              |

Not Claude: transcription (OpenAI Whisper API in cloud mode), diarization (pyannote, local), scene
detection (PySceneDetect), keyframes (ffmpeg), scene grouping/Fountain assembly (deterministic code).
A fully local mode (faster-whisper / mlx-whisper + Ollama) exists as an alternative backend.

A Windows rewrite (`fts-windows`, Tauri + Python sidecar) has a pluggable provider layer with an
Anthropic provider (tool-use JSON output, vision) alongside OpenAI-compatible and local providers.
It is in development.

### 1ManABnd — Claude Code, in production code

Repo: `1manabnd` (TypeScript, Fastify server + React UI + Electron).

- The default agent engine is Claude Code in headless mode (`claude -p --output-format stream-json`),
  see `server/src/engines/claudeCode.ts`. All four company configs in the repo use `engine: claude-code`.
- Each agent role gets an explicit tool allowlist; runs are bounded by per-day / per-task quotas and
  timeouts; every deliverable goes to an approval queue; an append-only SQLite event log is the
  audit trail.
- OpenAI Codex CLI is supported as an alternative engine.
- Today it runs on the user's own Claude subscription through Claude Code, **not** on API credits.
  A direct `anthropic-api` engine for always-on / low-latency work is designed
  (`docs/ARCHITECTURE.md`, `server/src/engines/index.ts`) but not built.

### Singularity Pencil — optional, bring-your-own-key

Repo: `sp`. `packages/ai-integration` has Anthropic and OpenAI adapters; the user supplies their own
key. CDS Films does not pay for this usage, so it is not a credit use case.

## Suggested use of $1,000 API credits

Per-run cost estimates come from the FTS README (2-hour feature, cloud mode): Claude vision
$8–15 via Batch API, Claude polish $3–8. That is roughly $11–23 of Claude usage per feature-length
run, before Whisper.

| Workload                                                                                              | Budget  |
| ----------------------------------------------------------------------------------------------------- | ------- |
| FTS end-to-end runs on a fixed evaluation set (features and shorts, including Vietnamese-language films) to measure scene-heading accuracy, character naming and polish quality | ~$450   |
| Visual scene analysis experiments: frames per scene, prompt variants, dialogue context on/off, all through the Batch API | ~$200   |
| Model comparison and evals for each Claude stage (e.g. Haiku vs Sonnet for captions, Sonnet vs Opus for polish and character reasoning), to set cost-appropriate defaults | ~$200   |
| 1ManABnd: prototype the planned `anthropic-api` engine for a few always-on, low-latency agent tasks (triage, scheduling), measured against the Claude Code path | ~$100   |
| Reserve for reruns and regressions                                                                    | ~$50    |

The FTS work is the priority. The 1ManABnd line is only spent if the API engine is built.

## Claude Team use

- One seat for the founder (product development, writing, code review with Claude / Claude Code).
- Any additional seat only for a real person or an internal testing/service use that Anthropic's
  terms permit for Team plans. Check the current Team plan terms before assigning a seat to anything
  other than a named individual.
- Not planned: creating seats as artificial "worker" accounts, splitting agent load across seats to
  multiply usage limits, or any other quota farming. 1ManABnd's agents run within one account's
  limits, and its quota caps exist to keep them there.

## Traction / evidence

No users outside the closed pilot, no revenue, no funding. This is a founder-operated, early-stage
studio. What the repos and live URLs do show:

- **FTS** (`fts-macos`): working pipeline, macOS `.app` packaged with py2app (`Screenplay.app`),
  CLI and desktop UI. Four cached pipeline runs in `work/` (May–June 2026): two at feature scale
  (702 and 887 shot captions) and one completed end-to-end to a 25-scene `screenplay.fountain`.
  The cache does not record which backend (cloud or local) produced each run. No automated tests.
- **Singularity Pencil** (`sp`): ~320 commits since July 2026; Web (Vite/React) + Desktop
  (Electron 44). Closed hosted pilot at https://sp.cdsfilms.com since 2026-08-29 for 4–5 invited
  testers, password-gated (`docs/RELEASE_BLOCKERS.md`). Packaged macOS acceptance harness green at
  75 scenarios (2026-09-10). Recent unit suites in `docs/PROGRESS.md`: UI 345 passed / 1 skipped,
  Web 188/188, Exporter 117/117. Public release blockers still open: signing/notarization, manual
  packaged smoke, hosted functional smoke.
- **1ManABnd** (`1manabnd`): ~770 commits since July 2026; 45 beta tags, latest `v0.5.41-beta.0`
  (2026-10-07), installed and used by the founder as the live operating app. Release check for that
  tag: server 835/835 and UI 616/616 tests. Public product page, privacy policy and terms at
  https://1manabnd.cdsfilms.com (needed for its Google OAuth consent screen). Builds are signed with
  a local identity only, not notarized.

## Claims deliberately not made

- No legal entity name ("Co., Ltd." or similar), registration number, tax ID or registered address.
- "Founded/started in 2024", never "incorporated in 2024".
- No user counts, customers, revenue, funding or partnerships.
- No public launch for any product. Singularity Pencil is a closed pilot and its name is provisional.
- No Anthropic partnership, endorsement, sponsorship or prior acceptance into the program; the
  website says so explicitly and uses no Anthropic logo.
- Claude is not described as the only model used: FTS also uses Whisper and has a local mode;
  1ManABnd supports Codex; Singularity Pencil is BYOK with OpenAI or Anthropic.
- 1ManABnd is not described as autonomous; human approval is the core design.

## Program eligibility (checked 2026-10-07 against https://claude.com/programs/startups)

- Founded in the last 5 years: yes (2024). No VC funding required; bootstrapped qualifies.
- Company email on the website's domain: cdsf@cdsfilms.com on cdsfilms.com. Apply from a Claude
  Console account signed in with that address, not a personal Gmail.
- The public page does not list incorporation as a requirement. If the form asks for it, answer
  "Not yet incorporated" and accept that this may decide the outcome.
- API credits expire six months after grant; the budget above is sized for that window
  (roughly 20–40 feature-length FTS runs at $450).

## Pre-submission items (resolved 2026-10-07)

1. **New homepage published.** Commit `6905d12` on `cdsfilms/web` `main`; GitHub Pages build
   verified live at https://cdsfilms.com, and `docs/` returns 404 there.
2. **https://1manabnd.cdsfilms.com restored.** It returned 404 because the Vercel project
   `1manabnd-site` had become Git-connected with Root Directory `.`, so pushes to the `1manabnd`
   repo built from the repo root instead of `site/`. Root Directory is now `site` and production was
   redeployed; `/`, `/privacy` and `/terms` return 200 and the privacy page shows the
   7 October 2026 version. Future pushes to `1manabnd` `main` will redeploy this page from `site/`.
