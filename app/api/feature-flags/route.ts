import { ok, handleError } from "@/lib/api";
import { ensureSeededFlags, listFlags } from "@/lib/feature-flags";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureSeededFlags();
    const all = await listFlags();
    // Only expose enabled+key+requiresPaid to public clients
    const data = all.map((f) => ({
      key: f.key,
      label: f.label,
      enabled: f.enabled,
      requiresPaid: f.requiresPaid,
    }));
    return ok(data);
  } catch (e) {
    return handleError(e);
  }
}
