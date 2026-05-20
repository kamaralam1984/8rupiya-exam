import { requireAdmin } from "@/lib/auth";
import { getQueue, QUEUE_NAMES } from "@/lib/queue";
import { ok, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const out: Record<string, any> = {};
    for (const name of Object.values(QUEUE_NAMES)) {
      const q = getQueue(name as any);
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        q.getWaitingCount(),
        q.getActiveCount(),
        q.getCompletedCount(),
        q.getFailedCount(),
        q.getDelayedCount(),
      ]);
      const recentFailed = await q.getFailed(0, 4);
      out[name] = {
        counts: { waiting, active, completed, failed, delayed },
        recentFailed: recentFailed.map((j) => ({
          id: j.id,
          name: j.name,
          attemptsMade: j.attemptsMade,
          failedReason: (j.failedReason ?? "").slice(0, 200),
          createdAt: j.timestamp,
        })),
      };
    }
    return ok(out);
  } catch (e) {
    return handleError(e);
  }
}
