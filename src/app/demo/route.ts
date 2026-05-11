import { NextResponse, type NextRequest } from "next/server";
import { DEMO_COOKIE, roleFromEmail, type DemoRole } from "@/lib/demo-data";

export function GET(request: NextRequest) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email") ?? "";
  const requestedRole = url.searchParams.get("role");
  const role = normalizeRole(requestedRole) ?? roleFromEmail(email) ?? "member";
  const next = role === "admin" ? "/admin" : role === "onboarding" ? "/onboarding" : "/club";
  const response = NextResponse.redirect(new URL(next, request.url));

  response.cookies.set(DEMO_COOKIE, role, {
    httpOnly: true,
    maxAge: 60 * 60 * 24,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

function normalizeRole(value: string | null): DemoRole | null {
  if (value === "admin" || value === "member" || value === "builder" || value === "onboarding") {
    return value;
  }

  return null;
}
