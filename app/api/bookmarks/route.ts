import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  kind: z.enum(["question", "flashcard", "note", "currentAffair", "predicted"]),
  label: z.string().max(160).optional(),
  payload: z.unknown(),
});

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const url = new URL(req.url);
    const kind = url.searchParams.get("kind");
    const rows = await db.bookmark.findMany({
      where: { userId: user.id, ...(kind ? { kind } : {}) },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return ok(rows);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = schema.parse(await req.json());
    const row = await db.bookmark.create({
      data: {
        userId: user.id,
        kind: body.kind,
        label: body.label,
        payload: body.payload as any,
      },
    });
    return ok(row);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await requireUser();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return fail("id required", 400);
    await db.bookmark.deleteMany({ where: { id, userId: user.id } });
    return ok({ deleted: true });
  } catch (e) {
    return handleError(e);
  }
}
