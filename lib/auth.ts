import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { db } from "./db";

const COOKIE = "8r_session";
const ALG = "HS256";

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) {
    throw new Error("JWT_SECRET must be set and at least 32 chars");
  }
  return new TextEncoder().encode(s);
}

export type SessionPayload = {
  sub: string;
  role: "STUDENT" | "ADMIN";
};

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export async function signSession(payload: SessionPayload, ttlSec = 60 * 60 * 24 * 30) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + ttlSec)
    .sign(secret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return { sub: payload.sub as string, role: payload.role as SessionPayload["role"] };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function readSession(req?: NextRequest): Promise<SessionPayload | null> {
  const token = req
    ? req.cookies.get(COOKIE)?.value
    : (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function requireUser(req?: NextRequest) {
  const session = await readSession(req);
  if (!session) throw new AuthError("UNAUTHENTICATED");
  const user = await db.user.findUnique({ where: { id: session.sub } });
  if (!user) throw new AuthError("UNAUTHENTICATED");
  return user;
}

export async function requireAdmin(req?: NextRequest) {
  const user = await requireUser(req);
  if (user.role !== "ADMIN") throw new AuthError("FORBIDDEN");
  return user;
}

export class AuthError extends Error {
  constructor(public code: "UNAUTHENTICATED" | "FORBIDDEN") {
    super(code);
  }
}
