import { db } from "@/lib/db";
import { readSession, requireUser } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";
import { z } from "zod";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

const postSchema = z.object({
  body: z.string().min(1).max(800),
  /** Optional: only return messages after this id (long-poll style). */
});

export async function GET(req: Request, { params }: Params) {
  try {
    const { slug } = await params;
    const url = new URL(req.url);
    const after = url.searchParams.get("after");
    const limit = Math.min(200, Math.max(1, Number(url.searchParams.get("limit") ?? 50)));
    const room = await db.chatRoom.findUnique({
      where: { slug },
      select: { id: true, name: true, isPaid: true },
    });
    if (!room) return fail("Room not found.", 404, "NO_ROOM");

    const messages = await db.chatMessage.findMany({
      where: {
        roomId: room.id,
        ...(after ? { createdAt: { gt: new Date(after) } } : {}),
      },
      orderBy: after ? { createdAt: "asc" } : { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        body: true,
        createdAt: true,
        userId: true,
      },
    });

    // Attach minimal user info per message
    const userIds = Array.from(new Set(messages.map((m) => m.userId)));
    const users = await db.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, role: true },
    });
    const userMap = new Map(users.map((u) => [u.id, { name: u.name ?? u.email?.split("@")[0] ?? "User", role: u.role }]));

    const result = (after ? messages : messages.reverse()).map((m) => ({
      id: m.id,
      body: m.body,
      createdAt: m.createdAt,
      user: userMap.get(m.userId) ?? { name: "User", role: "FREE" },
    }));

    return ok({ messages: result, roomName: room.name });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { slug } = await params;
    const body = postSchema.parse(await req.json());

    const room = await db.chatRoom.findUnique({
      where: { slug },
      select: { id: true, isPaid: true },
    });
    if (!room) return fail("Room not found.", 404, "NO_ROOM");

    if (room.isPaid && !(user.role === "ADMIN" || user.role === "PREMIUM" || user.role === "FAMILY")) {
      return fail("This room is for Pro members.", 402, "PAYMENT_REQUIRED");
    }

    const msg = await db.chatMessage.create({
      data: { roomId: room.id, userId: user.id, body: body.body.trim() },
      select: { id: true, body: true, createdAt: true, userId: true },
    });
    return ok({
      message: {
        id: msg.id,
        body: msg.body,
        createdAt: msg.createdAt,
        user: { name: user.name ?? user.email?.split("@")[0] ?? "You", role: user.role },
      },
    });
  } catch (e) {
    return handleError(e);
  }
}
