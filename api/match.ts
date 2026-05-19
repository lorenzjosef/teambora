import { callOpenAIJson, isRecord, json, stableStringify, truncate } from "./openaiShared";

type RequestLike = {
  method?: string;
  body?: unknown;
};

type ResponseLike = {
  setHeader?: (name: string, value: string) => void;
  status: (code: number) => { json: (value: unknown) => void };
};

const matchSchema = {
  name: "activity_match",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      suggestionId: { type: ["string", "null"] },
      matchScore: { type: "number", minimum: 0, maximum: 100 },
      matchReasons: {
        type: "array",
        minItems: 1,
        maxItems: 4,
        items: { type: "string", maxLength: 120 },
      },
      explanation: { type: "string", maxLength: 280 },
    },
    required: ["suggestionId", "matchScore", "matchReasons", "explanation"],
  },
};

const buildInput = (body: Record<string, unknown>, prompt: string, candidates: unknown[]) => {
  const profile = isRecord(body.profile) ? body.profile : {};
  const feedbackSummary = isRecord(body.feedbackSummary) ? body.feedbackSummary : {};

  return `You are a privacy-preserving activity coordination matcher for Gezellig in Rotterdam.
Use the resident prompt and provided candidate sessions to select one session ID.
Do not diagnose loneliness, infer mental health, invent participants, invent addresses, or use resident-level risk labels.
Only choose from candidate IDs. If none fits, return suggestionId null.
Explain coordination fit: activity intent, availability, rough area, comfort preferences, and public/hosted setting.

Resident prompt: ${prompt}

Resident preference summary:
${JSON.stringify(profile)}

Feedback summary:
${JSON.stringify(feedbackSummary)}

Candidate sessions:
${JSON.stringify(candidates)}`;
};

export default async function handler(req: RequestLike, res: ResponseLike) {
  res.setHeader?.("Cache-Control", "no-store");

  if (req.method !== "POST") {
    json(res, 405, { error: "Method not allowed." });
    return;
  }

  const body = isRecord(req.body) ? req.body : {};
  const prompt = truncate(body.prompt, 500);
  const candidates = Array.isArray(body.candidates) ? body.candidates.slice(0, 8) : [];

  if (!prompt || candidates.length === 0) {
    json(res, 400, { error: "Prompt and candidates are required." });
    return;
  }

  const cacheKey = `match:${stableStringify({ prompt: prompt.toLowerCase(), candidates, profile: body.profile, feedbackSummary: body.feedbackSummary })}`;
  const result = await callOpenAIJson({
    cacheKey,
    input: buildInput(body, prompt, candidates),
    schema: matchSchema,
  });

  if (isRecord(result) && typeof result.error === "string") {
    json(res, 503, { error: result.error, fallbackUsed: true });
    return;
  }

  if (!isRecord(result)) {
    json(res, 503, { error: "Matcher response was invalid.", fallbackUsed: true });
    return;
  }

  const suggestionId = typeof result.suggestionId === "string" ? result.suggestionId : null;
  const selected = candidates.find((candidate) => isRecord(candidate) && candidate.id === suggestionId);

  json(res, 200, {
    suggestion: selected && isRecord(selected) ? {
      ...selected,
      matchScore: typeof result.matchScore === "number" ? result.matchScore : 80,
      matchReasons: Array.isArray(result.matchReasons) ? result.matchReasons.filter((item) => typeof item === "string").slice(0, 4) : [],
    } : null,
    explanation: typeof result.explanation === "string" ? result.explanation : "No suitable match was found.",
  });
}
