## Goal
Add an AI article-writing studio to the admin dashboard: a ChatGPT-style assistant that can use multiple AI providers (OpenRouter, Gemini, DeepSeek, Claude, OpenAI, or a fully custom base URL/model/key), do live web research, hold a 24-hour conversation, and publish its output directly into a new or existing blog post or page.

## User decisions (confirmed)
- Web research: included now (live web search).
- Chat history: live session, auto-deletes after 24 hours.
- Publish target: create new AND edit existing posts/pages.
- API keys: stored in the backend DB, admin-only access.

## Database (one migration)
1. `ai_providers` — `name` (label), `provider_type` (openrouter | gemini | deepseek | claude | openai | custom), `base_url`, `model`, `api_key`, `enabled`, `is_default`. Admin-only RLS (via `has_role`), plus `service_role`. No anon/authenticated read — keys never leave the server.
2. `ai_conversations` — `title`, `messages` (jsonb), `expires_at` (default now()+24h), `created_by`. Admin-only RLS. Expired rows deleted on every load (and on save) so they self-clean after 24h.
3. Standard `updated_at` triggers + GRANTs in the same migration.

## Web research
Use the Firecrawl connector for `search` + `scrape`. I'll link it via the connector flow. The assistant gets two AI-SDK tools (`web_search`, `read_url`) that call Firecrawl server-side; if Firecrawl isn't connected, research is disabled gracefully and normal writing still works.

## Backend
- `src/lib/ai-writer.functions.ts` (admin, `requireSupabaseAuth` + admin check):
  - Providers CRUD: list / upsert / delete / set-default. List masks the key (returns only last 4 chars) — full key never sent to the browser.
  - Conversations: list / get / save / delete, with expired-row cleanup.
  - `publishFromAi`: create or update a post (reuses the existing `posts` shape) or update a content page.
- `src/routes/api/ai-writer-chat.ts` — streaming chat server route (raw HTTP for token streaming). Verifies the admin bearer token, loads the selected provider from the DB, builds an OpenAI-compatible provider from its `base_url` + `api_key` + `model`, streams with `streamText`, and exposes the research tools with `stopWhen: stepCountIs(50)`. All provider types are OpenAI-compatible endpoints (Gemini/DeepSeek/Claude/OpenRouter all expose one), so a single code path handles them; "custom" just takes the raw base URL.

## Admin UI
- New nav item **AI Writer** in `admin.tsx`.
- `admin.ai.tsx` (layout) with two areas:
  - **Providers** panel: add/edit/delete providers — choose type (auto-fills base URL + example model), enter model name + API key, toggle enabled, pick default. Custom type exposes editable base URL.
  - **Chat studio**: ChatGPT-style thread using `@ai-sdk/react` `useChat` pointed at the streaming route (bearer attached), provider picker, a "Research" toggle, streamed markdown rendering, multi-turn prompting, and conversation auto-save (24h).
- **Publish bar** under the chat: pick target = New Post / Existing Post / Page, prefilled title/slug/excerpt, then publish or save as draft via `publishFromAi`. Generated markdown is converted to the editor's HTML so it renders correctly in the existing rich-text editor.

## Technical notes
- Streaming route lives at `/api/ai-writer-chat` (not `/api/public/*`) and enforces admin auth itself; the client fetch attaches the Supabase access token.
- Keys are write-only from the UI's perspective (masked on read), decrypted-at-rest not needed but never exposed to non-admins by RLS + masking.
- No Lovable AI key required — this uses the user's own provider keys. (Lovable AI could be added later as one more provider row.)

## Out of scope for this pass
- Image generation inside chat, and permanent (>24h) chat history — can be added later.
