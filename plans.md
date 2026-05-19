# OpenAI-Backed Matcher Migration Plan

## Summary

Replace the prototype's hardcoded AI prompt and suggestion flows with server-side OpenAI calls while keeping resident privacy, deployment safety, and API spend tight.

Use OpenAI's Responses API with a cheap model, defaulting to `gpt-5.4-nano`, for two flows:

- Mobile resident activity matching.
- Municipality dashboard AI advice.

The API key must never reach browser code or Git. `openai_api_key.txt` is local-only source material for configuring `OPENAI_API_KEY` in server and Vercel environments.

## Security And Secret Handling

- Add explicit `.gitignore` entries for:
  - `openai_api_key.txt`
  - `.env.local`
- Never read, print, import, commit, or bundle `openai_api_key.txt`.
- Use only `process.env.OPENAI_API_KEY` from server-side code.
- Do not create any `VITE_OPENAI_*` variable.
- Configure `OPENAI_API_KEY` in Vercel project environment variables before production testing.
- Confirm with:
  - `git check-ignore openai_api_key.txt .env.local`
  - `git status --short`
  - bundle search for `OPENAI_API_KEY` and likely key prefixes after build.

## Implementation Changes

### Server API

Add Vercel serverless endpoints:

- `api/match.ts`
- `api/dashboard-advice.ts`

Use raw `fetch` against `POST https://api.openai.com/v1/responses`; do not add the OpenAI SDK unless raw fetch becomes impractical.

Shared server behavior:

- Model: `gpt-5.4-nano`.
- Use compact JSON prompts.
- Cap output around `500` tokens.
- No streaming.
- No tools.
- No web search.
- Validate request body shape manually.
- Return structured JSON only.
- On missing `OPENAI_API_KEY`, return a clear non-secret error so the client can fall back.
- Do not log prompts containing personal profile fields.

### Mobile Matcher

Replace the hardcoded `FIXED_PROMPT` / `FIXED_SUGGESTION` flow in `src/App.tsx`.

Client behavior:

- `AiPromptSection` sends the resident prompt, lightweight profile preferences, current availability, feedback summary, and candidate sessions to `/api/match`.
- Send at most the top 8 deterministic candidates from `rankSuggestions(...)` or equivalent prefiltering.
- Show loading, success, and failure states.
- If the server fails, times out, or returns invalid JSON, fall back to deterministic local suggestions.
- Do not resurrect the old sushi hardcoded result.

Server matcher behavior:

- The model may select and explain a match from provided candidate sessions.
- The model must not invent private participants, exact addresses, mental-health labels, loneliness scores, or resident-level risk inferences.
- Response shape:

```ts
type MatchResponse = {
  suggestion: ActivitySuggestion | null;
  explanation: string;
  fallbackUsed?: boolean;
};
```

### Dashboard AI Advice

Replace the hardcoded `FIXED_DASHBOARD_PROMPT` / `FIXED_AI_RESPONSE` flow in `src/Dashboard.tsx`.

Client behavior:

- Dashboard sends the user question, city fixed as `"Rotterdam"`, selected range, and aggregate dashboard metrics to `/api/dashboard-advice`.
- Show loading, success, and failure states.
- Keep existing static recommendation cards as proactive examples if desired, but the submitted question response must come from the server.

Server dashboard behavior:

- Use only grouped aggregate data.
- Prompt must explicitly forbid:
  - individual resident views
  - names, phone numbers, emails, exact addresses
  - rejected suggestions as individual behavior
  - loneliness scoring
  - mental-health inference or diagnosis
- Response shape:

```ts
type DashboardAdviceResponse = {
  answer: string;
  recommendations: {
    title: string;
    evidence: string;
    recommendation: string;
  }[];
};
```

## Cost Controls

- Default model: `gpt-5.4-nano`.
- Keep prompts short and structured.
- Truncate free-text prompts to about 500 characters.
- Limit mobile candidate sessions to 8.
- Limit dashboard payload to visible aggregate metrics only.
- Add a small in-memory server cache keyed by normalized prompt and a compact data snapshot.
- Unit/build tests must not call OpenAI.
- Live smoke tests require `RUN_OPENAI_SMOKE=1`.
- Overnight implementation should use at most:
  - one live `/api/match` smoke request
  - one live `/api/dashboard-advice` smoke request

## Test Plan

Run local checks:

```bash
rtk git check-ignore openai_api_key.txt .env.local
rtk npm run lint
rtk npm run build
```

Test non-live behavior:

- Missing API key returns graceful fallback.
- Invalid server response returns graceful fallback.
- Mobile prompt shows loading and then a real suggestion or fallback suggestion.
- Dashboard prompt shows loading and then advice or fallback copy.
- No resident profile data appears in dashboard output.
- No secret appears in Git diff, generated bundle, terminal output, or client code.

Optional sparse live smoke:

```bash
RUN_OPENAI_SMOKE=1 OPENAI_API_KEY=... npm run build
```

If a dedicated smoke script is added, it must call each endpoint at most once and avoid printing the key or full request payload.

## Deployment Plan

- Commit implementation on branch `openai-matcher-migration`.
- Push branch when ready.
- Configure `OPENAI_API_KEY` in Vercel project settings.
- Deploy from the branch or merge to `main` after validation.
- Confirm production behavior with one mobile AI prompt and one dashboard AI question.

## Assumptions

- Keep deterministic `rankSuggestions(...)` for default homepage suggestions and fallback.
- No Supabase integration.
- No persistence.
- No authentication changes.
- No client-side OpenAI SDK usage.
- No API key committed to Git.
- Current pending add-event changes in `src/App.tsx` should be preserved unless they conflict with the matcher migration.
