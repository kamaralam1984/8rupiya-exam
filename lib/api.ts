import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "./auth";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function fail(message: string, status = 400, code?: string) {
  return NextResponse.json({ ok: false, error: { code: code ?? "BAD_REQUEST", message } }, { status });
}

export function handleError(err: unknown) {
  if (err instanceof AuthError) {
    const status = err.code === "FORBIDDEN" ? 403 : 401;
    return fail(err.code, status, err.code);
  }
  if (err instanceof ZodError) {
    return NextResponse.json(
      { ok: false, error: { code: "VALIDATION", issues: err.flatten() } },
      { status: 422 }
    );
  }
  console.error("[api]", err);
  return fail("Internal Server Error", 500, "INTERNAL");
}
