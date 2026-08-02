import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOGIN_PATH = "/auth/login";

function dashboardForRole(role?: string) {
  if (role === "PROVIDER") return "/dashboard/provider";
  if (role === "ADMIN") return "/dashboard/admin";
  return "/dashboard/customer";
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value;

  if (
    token &&
    (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register"))
  ) {
    return NextResponse.redirect(new URL(dashboardForRole(role), request.url));
  }

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  if (role === "PROVIDER" && !pathname.startsWith("/dashboard/provider")) {
    return NextResponse.redirect(new URL("/dashboard/provider", request.url));
  }
  if (role === "ADMIN" && !pathname.startsWith("/dashboard/admin")) {
    return NextResponse.redirect(new URL("/dashboard/admin", request.url));
  }
  if (role === "CUSTOMER" && !pathname.startsWith("/dashboard/customer")) {
    return NextResponse.redirect(new URL("/dashboard/customer", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/login", "/auth/register"],
};
