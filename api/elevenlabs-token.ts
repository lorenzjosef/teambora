import { isRecord, json } from "./openaiShared.js";

type RequestLike = {
  method?: string;
};

type ResponseLike = {
  setHeader?: (name: string, value: string) => void;
  status: (code: number) => { json: (value: unknown) => void };
};

const ELEVENLABS_TOKEN_URL = "https://api.elevenlabs.io/v1/single-use-token/realtime_scribe";

export default async function handler(req: RequestLike, res: ResponseLike) {
  res.setHeader?.("Cache-Control", "no-store");

  if (req.method !== "POST") {
    json(res, 405, { error: "Method not allowed." });
    return;
  }

  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) {
    json(res, 503, { error: "Voice service is not configured." });
    return;
  }

  const tokenResponse = await fetch(ELEVENLABS_TOKEN_URL, {
    method: "POST",
    headers: { "xi-api-key": apiKey },
  });

  if (!tokenResponse.ok) {
    json(res, 502, { error: "Voice token request failed." });
    return;
  }

  const payload = await tokenResponse.json() as unknown;
  const token = isRecord(payload) && typeof payload.token === "string" ? payload.token : "";
  if (!token) {
    json(res, 502, { error: "Voice token response was invalid." });
    return;
  }

  json(res, 200, { token });
}
