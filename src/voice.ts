import { useCallback, useRef, useState } from "react";
import type { Interest } from "./types";

const MODEL_ID = "scribe_v2_realtime";

async function getRealtimeToken(): Promise<string> {
  const res = await fetch("/api/elevenlabs-token", { method: "POST" });
  if (!res.ok) {
    throw new Error("Voice token unavailable");
  }

  const data = await res.json();
  if (!data || typeof data.token !== "string") {
    throw new Error("Voice token response was invalid");
  }

  return data.token;
}

const KEYWORD_MAP: Record<string, Interest> = {
  coffee: "coffee",
  cafe: "coffee",
  koffie: "coffee",
  cappuccino: "coffee",
  latte: "coffee",
  espresso: "coffee",
  tea: "coffee",
  drink: "coffee",
  cinema: "cinema",
  movie: "cinema",
  movies: "cinema",
  film: "cinema",
  films: "cinema",
  bioscoop: "cinema",
  netflix: "cinema",
  theater: "cinema",
  theatre: "cinema",
  football: "football",
  soccer: "football",
  voetbal: "football",
  feyenoord: "football",
  ajax: "football",
  psv: "football",
  sport: "football",
  basketball: "basketball",
  basketbal: "basketball",
  hoops: "basketball",
  fencing: "fencing",
  fence: "fencing",
  schermen: "fencing",
  hackathon: "hackathons",
  hackathons: "hackathons",
  coding: "hackathons",
  startup: "hackathons",
  padel: "padel",
  tennis: "padel",
  squash: "padel",
  racket: "padel",
  badminton: "padel",
  walk: "walking",
  walking: "walking",
  walks: "walking",
  wandelen: "walking",
  hike: "walking",
  hiking: "walking",
  stroll: "walking",
  nature: "walking",
  park: "walking",
  outdoor: "walking",
  outdoors: "walking",
  joggen: "walking",
  jogging: "walking",
  running: "walking",
  museum: "museums",
  museums: "museums",
  art: "museums",
  gallery: "museums",
  exhibition: "museums",
  exhibitions: "museums",
  culture: "museums",
  cultural: "museums",
  kunst: "museums",
  tentoonstelling: "museums",
  "board game": "board_games",
  "board games": "board_games",
  boardgame: "board_games",
  bordspel: "board_games",
  games: "board_games",
  gaming: "board_games",
  chess: "board_games",
  cards: "board_games",
  puzzles: "board_games",
  puzzle: "board_games",
  study: "studying",
  studying: "studying",
  studeren: "studying",
  library: "studying",
  reading: "studying",
  books: "studying",
  book: "studying",
  lezen: "studying",
  learn: "studying",
  learning: "studying",
  homework: "studying",
  cook: "cooking",
  cooking: "cooking",
  koken: "cooking",
  baking: "cooking",
  bakken: "cooking",
  food: "cooking",
  recipe: "cooking",
  kitchen: "cooking",
  dinner: "cooking",
  lunch: "cooking",
  meal: "cooking",
  event: "community_events",
  events: "community_events",
  community: "community_events",
  local: "community_events",
  volunteer: "community_events",
  volunteering: "community_events",
  neighborhood: "community_events",
  buurt: "community_events",
  market: "community_events",
  festival: "community_events",
  meetup: "community_events",
  yoga: "yoga",
  meditation: "yoga",
  pilates: "yoga",
  stretching: "yoga",
  mindfulness: "yoga",
  cycling: "cycling",
  fietsen: "cycling",
  bike: "cycling",
  biking: "cycling",
  bicycle: "cycling",
  fiets: "cycling",
  photography: "photography",
  photo: "photography",
  photos: "photography",
  camera: "photography",
  fotografie: "photography",
  music: "music",
  muziek: "music",
  guitar: "music",
  piano: "music",
  singing: "music",
  zingen: "music",
  concert: "music",
  jam: "music",
  band: "music",
  gardening: "gardening",
  garden: "gardening",
  tuin: "gardening",
  tuinieren: "gardening",
  plants: "gardening",
  planten: "gardening",
  crafts: "crafts",
  craft: "crafts",
  knitting: "crafts",
  sewing: "crafts",
  painting: "crafts",
  drawing: "crafts",
  diy: "crafts",
  knutselen: "crafts",
  swimming: "swimming",
  swim: "swimming",
  zwemmen: "swimming",
  pool: "swimming",
  dancing: "dancing",
  dance: "dancing",
  dansen: "dancing",
  salsa: "dancing",
  bachata: "dancing",
  zumba: "dancing",
  languages: "languages",
  language: "languages",
  taal: "languages",
  talen: "languages",
  spanish: "languages",
  french: "languages",
  english: "languages",
  dutch: "languages",
  conversation: "languages",
};

export function extractInterests(text: string): Interest[] {
  const lower = text.toLowerCase();
  const matched = new Set<Interest>();

  for (const [keyword, interest] of Object.entries(KEYWORD_MAP)) {
    if (lower.includes(keyword)) {
      matched.add(interest);
    }
  }

  return [...matched];
}

export function useVoiceInput() {
  const [isRecording, setIsRecording] = useState(false);
  const [partialText, setPartialText] = useState("");
  const [finalText, setFinalText] = useState("");
  const [matchedInterests, setMatchedInterests] = useState<Interest[]>([]);
  const [liveWords, setLiveWords] = useState("");

  const wsRef = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const contextRef = useRef<AudioContext | null>(null);

  const stop = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (contextRef.current) {
      contextRef.current.close();
      contextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ message_type: "flush" }));
      }
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsRecording(false);

    setFinalText((prev) => {
      const interests = extractInterests(prev + " " + (partialText || ""));
      if (interests.length > 0) {
        setMatchedInterests((existing) => {
          const merged = new Set([...existing, ...interests]);
          return [...merged];
        });
      }
      return prev;
    });
  }, [partialText]);

  const start = useCallback(async () => {
    setPartialText("");
    setFinalText("");
    setMatchedInterests([]);
    setLiveWords("");

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true },
    });
    mediaStreamRef.current = stream;

    const token = await getRealtimeToken();
    const params = new URLSearchParams({
      model_id: MODEL_ID,
      token,
      language_code: "en",
    });
    const ws = new WebSocket(`wss://api.elevenlabs.io/v1/speech-to-text/realtime?${params}`);
    wsRef.current = ws;

    ws.onclose = (e) => {
      console.log("[voice] ws closed:", e.code, e.reason);
    };

    ws.onopen = () => {
      console.log("[voice] ws connected");
      const audioContext = new AudioContext({ sampleRate: 16000 });
      contextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      let chunkCount = 0;
      processor.onaudioprocess = (event) => {
        if (ws.readyState !== WebSocket.OPEN) return;
        const float32 = event.inputBuffer.getChannelData(0);
        const int16 = new Int16Array(float32.length);
        for (let i = 0; i < float32.length; i++) {
          int16[i] = Math.max(-32768, Math.min(32767, Math.round(float32[i] * 32767)));
        }
        const uint8 = new Uint8Array(int16.buffer);
        let binary = "";
        for (let i = 0; i < uint8.length; i++) {
          binary += String.fromCharCode(uint8[i]);
        }
        const base64 = btoa(binary);
        ws.send(JSON.stringify({
          message_type: "input_audio_chunk",
          audio_base_64: base64,
          commit: false,
        }));
        if (++chunkCount <= 3) console.log("[voice] sent chunk", chunkCount);
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
      setIsRecording(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const msgType = data.message_type || data.type || "";
        console.log("[voice] msg:", msgType, data.text?.slice(0, 50));

        if (msgType === "partial_transcript") {
          const text = data.text || "";
          setPartialText(text);
          setLiveWords(text);
          const interests = extractInterests(text);
          if (interests.length > 0) {
            setMatchedInterests((prev) => {
              const merged = new Set([...prev, ...interests]);
              return [...merged];
            });
          }
        } else if (msgType === "committed_transcript" || msgType === "committed_transcript_with_timestamps") {
          const text = data.text || "";
          setFinalText((prev) => (prev ? prev + " " + text : text));
          setLiveWords(text);
          const interests = extractInterests(text);
          if (interests.length > 0) {
            setMatchedInterests((prev) => {
              const merged = new Set([...prev, ...interests]);
              return [...merged];
            });
          }
        }
      } catch {
        // ignore non-JSON messages
      }
    };

    ws.onerror = () => {
      stop();
    };
  }, [stop]);

  return { isRecording, start, stop, partialText, finalText, matchedInterests, liveWords };
}
