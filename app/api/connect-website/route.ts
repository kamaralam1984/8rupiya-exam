import { z } from "zod";
import { ok, fail, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  websiteUrl: z.string().url("websiteUrl must be a valid URL"),
  apiKey: z.string().min(1, "apiKey is required"),
  secretToken: z.string().min(1, "secretToken is required"),
});

export async function POST(req: Request) {
  try {
    const xApiKey = req.headers.get("X-API-Key");
    const body = bodySchema.parse(await req.json());

    if (!xApiKey || xApiKey !== body.apiKey) {
      return fail("Invalid API Key", 401, "INVALID_API_KEY");
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    let res: Response;
    try {
      // Probe the backend health endpoint — backend must expose GET /api/health
      // and validate X-Secret-Token to confirm the secret is correct.
      res = await fetch(`${body.websiteUrl.replace(/\/$/, "")}/api/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": body.apiKey,
          "X-Secret-Token": body.secretToken,
        },
        signal: controller.signal,
      });
    } catch {
      return fail("Could not reach the backend — check the URL and try again", 502, "CONNECTION_FAILED");
    } finally {
      clearTimeout(timer);
    }

    if (res.status === 401 || res.status === 403) {
      return fail("Invalid API Key or Secret Token", 401, "INVALID_API_KEY");
    }

    if (!res.ok) {
      return fail(`Backend responded with ${res.status}`, 502, "CONNECTION_FAILED");
    }

    return ok({ connected: true, url: body.websiteUrl });
  } catch (e) {
    return handleError(e);
  }
}
