// app/api/delete-session/route.ts
import {
  serverAppCheck,
  serverAuth,
  serverMessaging,
} from "@/app/config/firebase.server.config";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { idToken, topic, token } = await req.json();
  if (!idToken) {
    return NextResponse.json({ error: "No token provided" }, { status: 400 });
  }

  // Validate ID token
  await serverAuth.verifyIdToken(idToken);
  await serverMessaging.unsubscribeFromTopic(token, topic);

  const response = NextResponse.json({ message: "Session deleted" });
  (await cookies()).delete("session");
  response.cookies.delete("session"); // Remove session cookie
  return response;
}
