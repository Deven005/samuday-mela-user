import { serverAuth } from '@/app/config/firebase.server.config';
import { createSession, generateStrongPassword, getOrCreateUser } from '@/app/utils/auth/auth';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { origin } = req.nextUrl;
    const code = searchParams.get('code');
    const error_reason = searchParams.get('error_reason');
    console.log('error_reason: ', error_reason);

    if (error_reason) {
      return NextResponse.redirect(`${origin}/auth/facebook/callback?error_reason=${error_reason}`);
    }

    if (!code) {
      return NextResponse.redirect('/login?error=MissingCode');
    }
    const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FB_APP_ID!;
    const FACEBOOK_APP_SECRET = process.env.FB_APP_SECRET!;
    const REDIRECT_URI = `${origin}/api/auth/facebook/callback`;

    // 1. Exchange code for access token
    const tokenRes = await fetch(
      `https://graph.facebook.com/v22.0/oauth/access_token?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&client_secret=${FACEBOOK_APP_SECRET}&code=${code}`,
    );

    const tokenData = await tokenRes.json();

    const accessToken = tokenData.access_token;

    // 2. Fetch user profile using access token
    const userRes = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`,
    );
    const fbUser = await userRes.json();

    console.log('fbUser: ', fbUser);
    const { id, name, email, picture } = fbUser;

    if (!email) {
      return NextResponse.redirect('/login?error=NoEmail');
    }

    let { user } = (await getOrCreateUser({
      origin,
      properties: {
        email: email!,
        emailVerified: true,
        displayName: name,
        photoURL: picture.data.url,
        password: generateStrongPassword(), // Can be set to a temp password if needed
      },
      headers: req.headers,
      userProvider: {
        providerId: 'facebook.com',
        uid: id,
        displayName: name,
        email,
        photoURL: picture.data.url,
      },
    }))!;

    const customToken = await serverAuth.createCustomToken(user.uid, { user: true });

    // Sign in to Firebase via REST API using Google ID token
    const firebaseCustomTokenFbSignInRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: customToken,
          returnSecureToken: true,
        }),
      },
    );
    const { idToken, isNewUser } = await firebaseCustomTokenFbSignInRes.json();

    await createSession({
      origin,
      idToken,
      headers: req.headers,
    });

    (await cookies()).set('fb_custom_token', customToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60,
    });

    // Redirect to frontend with Firebase custom token
    return NextResponse.redirect(`${origin}/auth/facebook/callback`);
    //   ?token=${customToken}
  } catch (error: any) {
    console.error('OAuth Error:', error);
    return NextResponse.json({ error: 'Failed to authenticate' }, { status: error.code ?? 500 });
  }
}
