import { serverAuth } from "@/app/config/firebase.server.config";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { sessionCookie, idToken } = await req.json();

    let decodedToken;

    // 1️⃣ First, check session cookie if it's still valid
    if (sessionCookie) {
      decodedToken = await serverAuth.verifySessionCookie(sessionCookie, true);
    }
    // 2️⃣ If session expired, require fresh ID token
    else if (idToken) {
      decodedToken = await serverAuth.verifyIdToken(idToken);
    } else {
      return NextResponse.json(
        { error: "No session or ID token provided" },
        { status: 401 }
      );
    }

    // Generate a new session cookie if needed
    const expiresIn = 1000 * 60 * 60 * 24 * 7;
    const newSessionCookie = await serverAuth.createSessionCookie(idToken, {
      expiresIn,
    });

    const response = NextResponse.json({ message: "Session refreshed" });
    response.cookies.set("session", newSessionCookie, {
      httpOnly: true,
      secure: true,
      maxAge: expiresIn,
    });

    return response;
  } catch (error) {
    console.error("Session renewal failed:", error);
    return NextResponse.json(
      { error: "Session renewal failed" },
      { status: 401 }
    );
  }
}
