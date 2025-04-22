// app/api/verify-session/route.ts
import { serverAuth } from "@/app/config/firebase.server.config";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { sessionCookie } = body;
    // const sessionCookie = (await cookies()).getAll()?.values();

    if (!sessionCookie)
      return NextResponse.json({
        error: "No session provided",
        status: 400,
        valid: false,
      });

    // await serverAuth.verifyIdToken(idToken, true);
    const decodedToken = await serverAuth.verifySessionCookie(
      sessionCookie,
      true
    );

    return NextResponse.json({ valid: true, uid: decodedToken.uid });
  } catch (error) {
    console.error("Session verification failed:", error);
    return NextResponse.json({ error: error, valid: false }, { status: 401 });
  }
}
