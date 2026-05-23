import { requireUser } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";
import { rateLimitUser } from "@/lib/ratelimit";
import { completeJson } from "@/lib/ai/llm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  mood: z.number().int().min(0).max(10),
  sleep: z.number().int().min(0).max(12),
  stress: z.number().int().min(0).max(10),
  hours: z.number().int().min(0).max(14),
  note: z.string().max(400).optional().default(""),
});

type Band = "calm" | "stretched" | "burning" | "danger";

type Resp = {
  burnoutScore: number;
  band: Band;
  pepTalk: string;
  microActions: string[];
};

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const rl = await rateLimitUser(user, "motivation", 20, 3600);
    if (!rl.ok) return fail("Hourly limit reached", 429, "RATE_LIMITED");

    const body = schema.parse(await req.json());

    // Heuristic burnout score
    const moodPenalty = (10 - body.mood) * 6;
    const sleepPenalty = Math.max(0, (7 - body.sleep)) * 6;
    const stressPenalty = body.stress * 4;
    const overworkPenalty = Math.max(0, body.hours - 10) * 5;
    const raw = moodPenalty + sleepPenalty + stressPenalty + overworkPenalty;
    const burnoutScore = Math.max(0, Math.min(100, Math.round(raw)));

    const band: Band =
      burnoutScore >= 75 ? "danger" :
      burnoutScore >= 55 ? "burning" :
      burnoutScore >= 30 ? "stretched" : "calm";

    try {
      const ai = await completeJson<{ pepTalk: string; microActions: string[] }>({
        system:
          "You are a warm, encouraging Indian study mentor — Hinglish tone, never preachy. Validate feelings first, then give 4 concrete tiny actions. Never moralize. Always emit valid JSON.",
        user: JSON.stringify({
          input: body,
          burnoutScore,
          band,
          schema: {
            pepTalk: "2-3 sentence Hinglish pep talk, supportive, addresses the note if any, max 60 words",
            microActions: "Exactly 4 micro-actions, each under 14 words, all today/tonight, concrete",
          },
          rules: [
            "If band == danger, urge a real rest day + lower study hours. Mention talking to a trusted person if note signals despair.",
            "If band == burning, encourage 1 lighter day + sleep.",
            "Never say 'just push harder'. Never minimize feelings.",
            "Mention small wins: streak, XP, past mocks if relevant.",
          ],
        }),
        maxTokens: 500,
        prefer: "fast",
        operation: "doubt",
      });
      return ok<Resp>({ burnoutScore, band, ...ai });
    } catch {
      const pepTalk =
        band === "danger"
          ? "Rukh, breathe. Yeh feeling temporary hai. Aaj 2 ghante padho — ya bilkul rest karo. Burnout mein kuch retain nahi hota."
          : band === "burning"
          ? "Tu thaka hua hai — yeh galti nahi, signal hai. Aaj light revision karo, kal naye plan se shuru."
          : band === "stretched"
          ? "Achha kaam ho raha hai. Bas thodi pacing rakho — short break, paani, fir focus."
          : "Tu shanti se chal raha hai. Yahi flow rakho — consistent > intense.";
      return ok<Resp>({
        burnoutScore,
        band,
        pepTalk,
        microActions: [
          "10 deep breaths — 4 sec in, 4 hold, 6 out.",
          band === "danger" ? "Aaj sirf 1 chapter ka revision karo." : "1 short DPP (10 questions) attempt karo.",
          body.sleep < 6 ? "Aaj 11 PM tak sone ka plan banao." : "30 min walk ya stretch — phone off.",
          "Kisi 1 dost ko message karo — kaisa chal raha hai puchho.",
        ],
      });
    }
  } catch (e) {
    return handleError(e);
  }
}
