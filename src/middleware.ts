// middleware.ts
import { NextResponse, NextRequest } from "next/server";

export const config = {
  matcher: [
    "/((?!sign-in|sign-up|_next/static|_next/image|api|favicon.ico).*)",
  ],
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  console.log("pathname: ", pathname);

  // ✅ Skip protection for "/", "/sign-in", "/sign-up"
  if (
    pathname === "/" ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up")
  ) {
    return NextResponse.next();
  }

  // try {
  //   const res = await fetch(
  //     `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify-appCheck-token`,
  //     {
  //       method: "POST",
  //       headers: request.headers,
  //     }
  //   );

  //   if (!res.ok || !(await res.json()).valid) {
  //     console.log("🚨 Invalid token, redirecting to /blocked.");
  //     return NextResponse.redirect(new URL("/blocked", request.url));
  //   }
  // } catch (error) {
  //   console.error("❌ Error verifying token:", error);
  //   return NextResponse.redirect(new URL("/blocked", request.url));
  // }

  const sessionCookie = request.cookies.get("session")?.value;
  const idToken = request.headers.get("Authorization")?.replace("Bearer ", "");

  if (!sessionCookie && !idToken) {
    console.log("⚠ No session or ID token found, redirecting to /sign-in.");
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify-session`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionCookie, idToken }),
      }
    );
    // verify-appCheck-token

    if (!res.ok) {
      console.log("🚨 Invalid session or token, redirecting to /.");
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("❌ Error verifying session:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
