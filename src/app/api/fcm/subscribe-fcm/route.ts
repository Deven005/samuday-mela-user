// api/fcm/subscribe-fcm
import { messaging } from "firebase-admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token, topic } = await req.json();

  console.log("fcm-subscribe post called!");

  if (!token || !topic) {
    return NextResponse.json(
      { error: "Missing token or topic" },
      { status: 400 }
    );
  }

  try {
    await messaging().subscribeToTopic(token, topic);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Subscription error:", error);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
