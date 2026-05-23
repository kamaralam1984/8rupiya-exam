import { requireUser } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";
import { rateLimitUser } from "@/lib/ratelimit";
import { completeJson } from "@/lib/ai/llm";
import { YoutubeTranscript } from "youtube-transcript";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  url: z.string().min(8).max(500),
  subject: z.string().max(120).optional().default(""),
});

type Resp = {
  videoId: string;
  title: string;
  tldr: string;
  keyPoints: string[];
  formulas: string[];
  examTip: string;
  miniQuiz: { stem: string; options: string[]; correctIndex: number; explanation: string }[];
  durationSec: number;
};

function extractVideoId(url: string): string | null {
  // Accepts: https://www.youtube.com/watch?v=XXX, https://youtu.be/XXX, raw 11-char id
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  const m = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  return m?.[1] ?? null;
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const rl = await rateLimitUser(user, "summarize_yt", 10, 3600);
    if (!rl.ok) return fail("Hourly limit reached", 429, "RATE_LIMITED");

    const body = schema.parse(await req.json());
    const videoId = extractVideoId(body.url.trim());
    if (!videoId) return fail("Invalid YouTube URL or video ID.", 400, "BAD_URL");

    let transcript: { text: string; offset: number; duration: number }[] = [];
    try {
      const raw = await YoutubeTranscript.fetchTranscript(videoId, { lang: "en" });
      transcript = raw.map((t) => ({ text: t.text, offset: t.offset, duration: t.duration }));
    } catch {
      try {
        const raw = await YoutubeTranscript.fetchTranscript(videoId);
        transcript = raw.map((t) => ({ text: t.text, offset: t.offset, duration: t.duration }));
      } catch (e: any) {
        return fail(
          "Couldn't fetch transcript — video may have captions disabled or be region-locked.",
          422,
          "NO_TRANSCRIPT",
        );
      }
    }

    if (transcript.length === 0) {
      return fail("No transcript content found for this video.", 422, "EMPTY_TRANSCRIPT");
    }

    const fullText = transcript.map((t) => t.text).join(" ").trim();
    const durationSec = Math.round(
      transcript.reduce((acc, t) => Math.max(acc, t.offset + t.duration), 0) / 1000,
    );
    const truncated = fullText.length > 14000 ? fullText.slice(0, 14000) + "…" : fullText;

    const ai = await completeJson<Omit<Resp, "videoId" | "durationSec">>({
      system:
        "You are a precise study summarizer for Indian competitive exams. Always emit valid JSON matching the requested schema. Use clean, exam-ready phrasing.",
      user: JSON.stringify({
        source: "youtube_transcript",
        subject: body.subject || "(unspecified)",
        videoId,
        durationMin: Math.round(durationSec / 60),
        transcript: truncated,
        schema: {
          title: "string — concise topic title inferred from the transcript",
          tldr: "1 sentence summary, under 30 words",
          keyPoints: "Array of 6-10 bullet points, each under 22 words",
          formulas: "Array of formulas as plain strings; empty if none mentioned",
          examTip: "1-2 sentences — actionable revision tip specific to the topic",
          miniQuiz: "Array of EXACTLY 5 MCQs: stem (string), options (4 strings), correctIndex (0-3), explanation (1 sentence)",
        },
        rules: [
          "Do not invent facts not present in the transcript.",
          "Formulas should be transcribed faithfully when said in the video.",
          "MCQs must test the actual content covered in the transcript.",
        ],
      }),
      maxTokens: 2500,
      prefer: "quality",
      operation: "doubt",
    });

    return ok<Resp>({ videoId, durationSec, ...ai });
  } catch (e) {
    return handleError(e);
  }
}
