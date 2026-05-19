import { callOpenAIJson, isRecord, json, stableStringify } from "./openaiShared";

type RequestLike = {
  method?: string;
  body?: unknown;
};

type ResponseLike = {
  setHeader?: (name: string, value: string) => void;
  status: (code: number) => { json: (value: unknown) => void };
};

const suggestionsSchema = {
  name: "activity_suggestions",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      suggestions: {
        type: "array",
        minItems: 1,
        maxItems: 4,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            suggestionId: { type: "string" },
            matchScore: { type: "number", minimum: 0, maximum: 100 },
            matchReasons: {
              type: "array",
              minItems: 1,
              maxItems: 4,
              items: { type: "string", maxLength: 120 },
            },
          },
          required: ["suggestionId", "matchScore", "matchReasons"],
        },
      },
    },
    required: ["suggestions"],
  },
};

const buildInput = (body: Record<string, unknown>, candidates: unknown[]) => {
  const profile = isRecord(body.profile) ? body.profile : {};
  const feedbackSummary = isRecord(body.feedbackSummary) ? body.feedbackSummary : {};

  return `You generate the suggested plans list for Gezellig in Rotterdam.
Rank up to 4 candidate sessions for the resident.
Only use provided candidate IDs. Do not invent events, people, private details, or addresses.
Return each candidate ID at most once.
Explain coordination fit: interests, availability, rough area, comfort preferences, public place, and host presence.
Each match reason must be short, complete, and under 12 words.
Do not diagnose loneliness, infer mental health, score vulnerability, or label residents.
Prefer varied activities when fit is similar, including sports, learning, culture, food, and tech events.

Resident profile summary:
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
  const candidates = Array.isArray(body.candidates) ? body.candidates.slice(0, 12) : [];
  if (candidates.length === 0) {
    json(res, 400, { error: "Candidates are required." });
    return;
  }

  const cacheKey = `suggestions:${stableStringify({ candidates, profile: body.profile, feedbackSummary: body.feedbackSummary })}`;
  const result = await callOpenAIJson({
    cacheKey,
    input: buildInput(body, candidates),
    schema: suggestionsSchema,
  });

  if (isRecord(result) && typeof result.error === "string") {
    json(res, 503, { error: result.error, fallbackUsed: true });
    return;
  }

  if (!isRecord(result) || !Array.isArray(result.suggestions)) {
    json(res, 503, { error: "Suggestions response was invalid.", fallbackUsed: true });
    return;
  }

  const suggestions = result.suggestions
    .filter(isRecord)
    .reduce<unknown[]>((items, item) => {
      const id = typeof item.suggestionId === "string" ? item.suggestionId : "";
      if (!id || items.some((existing) => isRecord(existing) && existing.id === id)) return items;
      const selected = candidates.find((candidate) => isRecord(candidate) && candidate.id === item.suggestionId);
      if (!selected || !isRecord(selected)) return items;
      items.push({
        ...selected,
        matchScore: typeof item.matchScore === "number" ? item.matchScore : 80,
        matchReasons: Array.isArray(item.matchReasons)
          ? item.matchReasons.filter((reason) => typeof reason === "string").map((reason) => cleanReason(reason)).slice(0, 4)
          : [],
      });
      return items;
    }, []);

  json(res, 200, { suggestions });
}

const cleanReason = (reason: string) => {
  const trimmed = reason.trim().replace(/\s+/g, " ");
  const short = trimmed.length > 96 ? `${trimmed.slice(0, 93).trim()}...` : trimmed;
  return /[.!?]$/.test(short) ? short : `${short}.`;
};
