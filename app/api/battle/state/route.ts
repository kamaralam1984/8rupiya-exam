import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";
import { fetchRoom, saveRoom, getUserRoom, leaveRoom, publicView } from "@/lib/battle-room";
import { z } from "zod";

export const dynamic = "force-dynamic";

/** Get current room state. */
export async function GET() {
  try {
    const user = await requireUser();
    const rid = await getUserRoom(user.id);
    if (!rid) return ok({ inRoom: false });
    const room = await fetchRoom(rid);
    if (!room) return ok({ inRoom: false });
    return ok({ inRoom: true, room: publicView(room, room.status === "ended") });
  } catch (e) {
    return handleError(e);
  }
}

/** Submit an answer. Body: { qIndex: number, picked: number, tookMs: number } */
const answerSchema = z.object({
  qIndex: z.number().int().min(0).max(50),
  picked: z.number().int().min(-1).max(10),
  tookMs: z.number().int().min(0).max(120000),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = answerSchema.parse(await req.json());
    const rid = await getUserRoom(user.id);
    if (!rid) return fail("Not in a room.", 404, "NO_ROOM");
    const room = await fetchRoom(rid);
    if (!room) return fail("Room expired.", 404, "ROOM_GONE");
    const me = room.players[user.id];
    if (!me) return fail("Not part of room.", 403, "NOT_PLAYER");

    const q = room.questions[body.qIndex];
    if (!q) return fail("Invalid question index.", 400, "BAD_Q");

    if (body.qIndex !== me.answered) {
      return fail("Question already answered or out of order.", 409, "OUT_OF_ORDER");
    }
    const correct = body.picked === q.correctIndex;
    const points = correct ? Math.max(40, 100 - Math.floor(body.tookMs / 600)) : 0;
    me.score += points;
    me.answered += 1;

    const totalQ = room.questions.length;
    const playerCount = Object.keys(room.players).length;
    const allDone = Object.values(room.players).every((p) => p.answered >= totalQ);
    if (allDone) {
      room.status = "ended";
      // Award XP to leader (or both on tie)
      const sorted = Object.values(room.players).sort((a, b) => b.score - a.score);
      const top = sorted[0].score;
      await Promise.all(
        sorted.map((p) =>
          db.user.update({
            where: { id: p.userId },
            data: { xp: { increment: p.score === top ? 50 : 15 } },
          }),
        ),
      );
    }
    await saveRoom(room);
    return ok({
      correct,
      points,
      room: publicView(room, room.status === "ended"),
    });
  } catch (e) {
    return handleError(e);
  }
}

/** Leave room. */
export async function DELETE() {
  try {
    const user = await requireUser();
    await leaveRoom(user.id);
    return ok({ left: true });
  } catch (e) {
    return handleError(e);
  }
}
