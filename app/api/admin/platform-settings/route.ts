import { requireAdmin } from "@/lib/auth";
import { ok, handleError } from "@/lib/api";
import { getDefaultPlanKind, setDefaultPlanKind } from "@/lib/access";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  planKind: z.enum(["MONTH", "YEAR", "LIFETIME"]),
});

export async function GET() {
  try {
    await requireAdmin();
    const planKind = await getDefaultPlanKind();
    return ok({ planKind });
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
    const body = schema.parse(await req.json());
    await setDefaultPlanKind(body.planKind);
    return ok({ planKind: body.planKind });
  } catch (e) {
    return handleError(e);
  }
}
