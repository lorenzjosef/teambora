const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
export const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-5.5";

type JsonObject = Record<string, unknown>;

type OpenAIJsonSchema = {
  name: string;
  schema: JsonObject;
};

type CachedValue = {
  expiresAt: number;
  value: unknown;
};

const responseCache = new Map<string, CachedValue>();
const CACHE_MS = 5 * 60 * 1000;

export const json = (res: { status: (code: number) => { json: (value: unknown) => void } }, status: number, value: unknown) => {
  res.status(status).json(value);
};

export const truncate = (value: unknown, maxLength: number) => {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
};

export const isRecord = (value: unknown): value is JsonObject => {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
};

export const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  if (!isRecord(value)) return JSON.stringify(value);
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
    .join(",")}}`;
};

const getCached = (key: string) => {
  const cached = responseCache.get(key);
  if (!cached || cached.expiresAt < Date.now()) {
    responseCache.delete(key);
    return null;
  }
  return cached.value;
};

const setCached = (key: string, value: unknown) => {
  responseCache.set(key, { expiresAt: Date.now() + CACHE_MS, value });
};

const extractOutputText = (payload: JsonObject) => {
  if (typeof payload.output_text === "string") return payload.output_text;
  const output = Array.isArray(payload.output) ? payload.output : [];
  for (const item of output) {
    if (!isRecord(item) || !Array.isArray(item.content)) continue;
    for (const content of item.content) {
      if (isRecord(content) && typeof content.text === "string") return content.text;
    }
  }
  return "";
};

export async function callOpenAIJson({
  cacheKey,
  input,
  schema,
}: {
  cacheKey: string;
  input: string;
  schema: OpenAIJsonSchema;
}) {
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { error: "OPENAI_API_KEY is not configured." };
  }

  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input,
      max_output_tokens: 500,
      text: {
        format: {
          type: "json_schema",
          name: schema.name,
          schema: schema.schema,
          strict: true,
        },
      },
    }),
  });

  if (!response.ok) {
    return { error: `OpenAI request failed with status ${response.status}.` };
  }

  const payload = await response.json() as JsonObject;
  const outputText = extractOutputText(payload);
  if (!outputText) return { error: "OpenAI response did not include JSON text." };

  try {
    const parsed = JSON.parse(outputText) as unknown;
    setCached(cacheKey, parsed);
    return parsed;
  } catch {
    return { error: "OpenAI response JSON was invalid." };
  }
}
