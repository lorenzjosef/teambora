import { callOpenAIJson, isRecord, json, stableStringify, truncate } from "./openaiShared";

type RequestLike = {
  method?: string;
  body?: unknown;
};

type ResponseLike = {
  setHeader?: (name: string, value: string) => void;
  status: (code: number) => { json: (value: unknown) => void };
};

const dashboardSchema = {
  name: "dashboard_advice",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      answer: { type: "string", maxLength: 1200 },
      recommendations: {
        type: "array",
        minItems: 1,
        maxItems: 3,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            title: { type: "string", maxLength: 80 },
            evidence: { type: "string", maxLength: 180 },
            recommendation: { type: "string", maxLength: 220 },
          },
          required: ["title", "evidence", "recommendation"],
        },
      },
    },
    required: ["answer", "recommendations"],
  },
};

const buildInput = (body: Record<string, unknown>, question: string) => {
  const range = typeof body.range === "string" ? body.range : "Last 30 days";
  const aggregateMetrics = isRecord(body.aggregateMetrics) ? body.aggregateMetrics : {};

  return `You are an AI advisor for Rotterdam municipality using Gezellig aggregate activity coordination data.
Answer operationally. Recommend supply, outreach, partner, venue, or QR-code actions.
Use only grouped aggregate data.
Never expose or infer individual resident details.
Never include names, phone numbers, emails, exact addresses, rejected suggestions as individual behavior, loneliness scores, mental-health status, diagnosis, or risk labels.
Frame insights as coordination friction and activity supply/demand, not loneliness detection.

City: Rotterdam
Range: ${range}
Question: ${question}

Aggregate metrics:
${JSON.stringify(aggregateMetrics)}`;
};

export default async function handler(req: RequestLike, res: ResponseLike) {
  res.setHeader?.("Cache-Control", "no-store");

  if (req.method !== "POST") {
    json(res, 405, { error: "Method not allowed." });
    return;
  }

  const body = isRecord(req.body) ? req.body : {};
  const question = truncate(body.question, 500);
  if (!question) {
    json(res, 400, { error: "Question is required." });
    return;
  }

  const cacheKey = `dashboard:${stableStringify({ question: question.toLowerCase(), range: body.range, aggregateMetrics: body.aggregateMetrics })}`;
  const result = await callOpenAIJson({
    cacheKey,
    input: buildInput(body, question),
    schema: dashboardSchema,
  });

  if (isRecord(result) && typeof result.error === "string") {
    json(res, 503, { error: result.error, fallbackUsed: true });
    return;
  }

  if (!isRecord(result) || typeof result.answer !== "string" || !Array.isArray(result.recommendations)) {
    json(res, 503, { error: "Dashboard advice response was invalid.", fallbackUsed: true });
    return;
  }

  json(res, 200, {
    answer: result.answer,
    recommendations: result.recommendations
      .filter(isRecord)
      .slice(0, 3)
      .map((item) => ({
        title: typeof item.title === "string" ? item.title : "Recommendation",
        evidence: typeof item.evidence === "string" ? item.evidence : "Based on aggregate activity data.",
        recommendation: typeof item.recommendation === "string" ? item.recommendation : "Review partner supply for this activity.",
      })),
  });
}
