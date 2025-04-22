// app/api/auth/verify-appCheck-token/route.ts
import {
  serverAppCheck,
  serverAuth,
} from "@/app/config/firebase.server.config";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const appCheckToken = req.headers.get("X-Firebase-AppCheck"); // ✅ Extract App Check token
    console.log("appCheckToken: ", appCheckToken);

    if (!appCheckToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); // ❌ Reject requests without App Check
    }
    await serverAppCheck.verifyToken(appCheckToken);
    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("appCheckToken verification failed:", error);
    return NextResponse.redirect(new URL("/blocked", req.url));
  }
}
