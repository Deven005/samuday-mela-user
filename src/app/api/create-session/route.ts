// app/api/create-session/route.ts
import {
  serverAuth,
  serverMessaging,
} from "@/app/config/firebase.server.config";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // Ensure this runs in Node.js

export async function POST(req: NextRequest) {
  try {
    const { idToken, token } = await req.json();
    if (!idToken || !token) {
      return NextResponse.json(
        { error: "No id token or token provided" },
        { status: 400 }
      );
    }

    // Validate ID token
    const verifiedToken = await serverAuth.verifyIdToken(idToken);

    // Create a session cookie (valid for 7 days)
    const expiresIn = 1000 * 60 * 60 * 24 * 7; // 7 days
    const sessionCookie = await serverAuth.createSessionCookie(idToken, {
      expiresIn,
    });
    const mess = await serverMessaging.subscribeToTopic(
      token,
      verifiedToken.uid
    );
    if (mess.errors.length > 0) {
      throw new Error(`err for fcm with count: ${mess.failureCount}`);
    }

    await serverMessaging.send({
      topic: verifiedToken.uid,
      fcmOptions: { analyticsLabel: "tmp" },
      android: {
        notification: {
          title: "notification title",
          body: "notification body",
          imageUrl: "https://picsum.photos/200/300",
          icon: "https://firebasestorage.googleapis.com/v0/b/samudaymela.appspot.com/o/public%2FAppLogo.png?alt=media&token=c2d303b5-c27f-4bde-a8c4-5bb434c30237",
        },
      },
      webpush: {
        data: {
          title: "notification title",
          body: "notification body",
          imageUrl: "https://picsum.photos/200/300",
          logo: "https://firebasestorage.googleapis.com/v0/b/samudaymela.appspot.com/o/public%2FAppLogo.png?alt=media&token=c2d303b5-c27f-4bde-a8c4-5bb434c30237",
        },
      },
    });

    const response = NextResponse.json({ message: "Session created" });
    response.cookies.set("session", sessionCookie, {
      httpOnly: true,
      secure: true,
      maxAge: expiresIn,
    });

    return response;
  } catch (error) {
    console.error("Failed to create session:", error);
    return NextResponse.json(
      { error: "Session creation failed" },
      { status: 401 }
    );
  }
}
