import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

export const config = {
  matcher: ["/admin/:path*"],
};

const COOKIE = "8r_session";

function getSecret() {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) return null;
  return new TextEncoder().encode(s);
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;

  const denyUrl = new URL("/signin", req.url);
  denyUrl.searchParams.set("next", req.nextUrl.pathname);
  denyUrl.searchParams.set("admin", "1");

  if (!token) return NextResponse.redirect(denyUrl);

  const secret = getSecret();
  if (!secret) return NextResponse.redirect(denyUrl);

  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "ADMIN") {
      const forbidden = new URL("/", req.url);
      forbidden.searchParams.set("error", "admin_only");
      return NextResponse.redirect(forbidden);
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(denyUrl);
  }
}
