import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  AnnouncementTemplate,
  buildAnnouncement,
  resolveAnnouncementTemplate,
  VoiceIntensity,
  VoiceStyle,
} from "@/lib/announcements";
import { stripHtml } from "@/lib/sanitize";

const SPEECH_MODEL = "gpt-4o-mini-tts";
const SPEECH_CACHE_MAX_ENTRIES = 200;

const voiceStyles: Record<
  VoiceStyle,
  { voice: string; instructions: Record<VoiceIntensity, string> }
> = {
  "classic-host": {
    voice: "marin",
    instructions: {
      clean:
        "Speak only the provided announcement text. Perform like a polished game show host: clear, upbeat, and easy to understand.",
      amped:
        "Speak only the provided announcement text. Perform like a charismatic arcade game show host with bright energy, crisp diction, and a little theatrical suspense before the winner name.",
      extreme:
        "Speak only the provided announcement text. Perform like an over-the-top prime-time game show host announcing a jackpot. Use huge excitement, dramatic timing, and a celebratory finish while keeping the winner name unmistakable.",
    },
  },
  "arcade-robot": {
    voice: "echo",
    instructions: {
      clean:
        "Speak only the provided announcement text. Perform like a retro arcade cabinet voice with a slightly robotic cadence, clipped syllables, and clear pronunciation.",
      amped:
        "Speak only the provided announcement text. Perform like a 1980s arcade cabinet announcer. Use a synthetic robotic cadence, punchy clipped syllables, dramatic pauses, and playful intensity. Keep the winner name clear.",
      extreme:
        "Speak only the provided announcement text. Perform like a malfunctioning but friendly boss-level arcade cabinet. Use a metallic robotic cadence, exaggerated pauses, sharp syllables, and maximum retro drama. Keep the winner name easy to hear.",
    },
  },
  "hype-announcer": {
    voice: "verse",
    instructions: {
      clean:
        "Speak only the provided announcement text. Perform like a confident arena announcer with upbeat energy and clear delivery.",
      amped:
        "Speak only the provided announcement text. Perform like a stadium announcer during a championship player entrance. Big, celebratory, fast-rising excitement, and strong emphasis on the winner name.",
      extreme:
        "Speak only the provided announcement text. Perform like a sold-out arena announcer at the final boss entrance. Huge booming energy, dramatic build-up, explosive celebration, and a victorious finish. Keep the winner name unmistakable.",
    },
  },
  "calm-narrator": {
    voice: "cedar",
    instructions: {
      clean:
        "Speak only the provided announcement text. Perform like a calm standup facilitator: warm, composed, professional, and easy to hear.",
      amped:
        "Speak only the provided announcement text. Perform like a warm narrator opening a friendly team ritual. Calm but cinematic, with gentle emphasis on the winner name.",
      extreme:
        "Speak only the provided announcement text. Perform like an epic documentary narrator revealing the chosen speaker. Slow, warm, dramatic, and cinematic, while still sounding meeting-appropriate.",
    },
  },
};

const speechSchema = z.object({
  name: z.string().min(1).max(50),
  style: z.enum([
    "classic-host",
    "arcade-robot",
    "hype-announcer",
    "calm-narrator",
  ]),
  intensity: z.enum(["clean", "amped", "extreme"]).default("amped"),
  template: z.enum([
    "surprise",
    "youre-up",
    "next-player",
    "player-one",
    "jackpot",
    "spotlight",
    "bonus-round",
    "high-score",
    "boss-level",
    "level-up",
    "insert-coin",
  ]),
});

const speechCache = new Map<string, ArrayBuffer>();

function cacheAudio(key: string, audio: ArrayBuffer) {
  if (speechCache.size >= SPEECH_CACHE_MAX_ENTRIES) {
    const firstKey = speechCache.keys().next().value;
    if (firstKey) speechCache.delete(firstKey);
  }
  speechCache.set(key, audio);
}

export async function POST(request: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OpenAI speech is not configured" },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = speechSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0].message },
      { status: 400 }
    );
  }

  const name = stripHtml(result.data.name).slice(0, 50);
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const style = result.data.style as VoiceStyle;
  const intensity = result.data.intensity as VoiceIntensity;
  const template = result.data.template as AnnouncementTemplate;
  const resolvedTemplate = resolveAnnouncementTemplate(name, template);
  const input = buildAnnouncement(name, resolvedTemplate);
  const cacheKey = `${style}:${intensity}:${resolvedTemplate}:${name.toLowerCase()}`;
  const cachedAudio = speechCache.get(cacheKey);

  if (cachedAudio) {
    return new NextResponse(cachedAudio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "private, max-age=3600",
        "X-Standup-Arcade-Speech-Cache": "hit",
      },
    });
  }

  const styleDefinition = voiceStyles[style];
  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: SPEECH_MODEL,
      input,
      voice: styleDefinition.voice,
      instructions: styleDefinition.instructions[intensity],
      response_format: "mp3",
    }),
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 502 }
    );
  }

  const audio = await response.arrayBuffer();
  cacheAudio(cacheKey, audio);

  return new NextResponse(audio, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "private, max-age=3600",
      "X-Standup-Arcade-Speech-Cache": "miss",
    },
  });
}
