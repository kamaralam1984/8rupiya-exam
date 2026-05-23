import { requireUser } from "@/lib/auth";
import { ok, handleError } from "@/lib/api";
import { tryMatch, leaveQueue, publicView } from "@/lib/battle-room";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({ examSlug: z.string().min(1).max(40) });

/** Join (or rejoin) the matchmaking queue for an exam slug. */
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = schema.parse(await req.json());
    const { room, queued } = await tryMatch({
      userId: user.id,
      name: user.name ?? "Player",
      examSlug: body.examSlug,
    });
    if (room) return ok({ matched: true, room: publicView(room, false) });
    return ok({ matched: false, queued });
  } catch (e) {
    return handleError(e);
  }
}

/** Cancel matchmaking. */
export async function DELETE(req: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const examSlug = searchParams.get("examSlug");
    if (!examSlug) return ok({ removed: false });
    await leaveQueue(user.id, examSlug);
    return ok({ removed: true });
  } catch (e) {
    return handleError(e);
  }
}
