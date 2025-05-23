// src/app/api/auth/facebook/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { origin } = req.nextUrl;

  const FACEBOOK_APP_ID = process.env.FB_APP_ID!;
  const REDIRECT_URI = `${origin}/api/auth/facebook/callback`;

  const loginUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI,
  )}&state=fb-login&scope=email,public_profile`;

  return NextResponse.redirect(loginUrl);
}
