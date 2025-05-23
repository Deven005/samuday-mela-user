import { serverAuth } from '@/app/config/firebase.server.config';
import { createSession, generateStrongPassword, getOrCreateUser } from '@/app/utils/auth/auth';
import { google } from 'googleapis';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { origin } = req.nextUrl;
  const url = new URL(req.url);

  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${origin}/api/auth/google/callback`,
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    if (!tokens.id_token) {
      return NextResponse.json({ error: 'No ID token from Google' }, { status: 500 });
    }

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    const {
      email,
      picture,
      name,
      verified_email,
      id,
      gender,
      link,
      locale,
      family_name,
      given_name,
      hd,
    } = userInfo.data;

    let { user } = (await getOrCreateUser({
      origin,
      properties: {
        email: email!,
        emailVerified: verified_email!,
        displayName: name,
        photoURL: picture,
        password: generateStrongPassword(), // Can be set to a temp password if needed
      },
      headers: req.headers,
      userProvider: {
        email: email!,
        photoURL: picture!,
        displayName: name!,
        providerId: 'google.com',
        uid: id!,
      },
      userProviderData: {
        gender,
        link,
        locale,
        family_name,
        given_name,
        hd,
      },
    }))!;

    const customToken = await serverAuth.createCustomToken(user!.uid, { user: true });

    // Sign in to Firebase via REST API using Google ID token
    const firebaseCustomTokenSignInRes = await fetch(
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

    const { idToken, isNewUser } = await firebaseCustomTokenSignInRes.json();

    // // Sign in to Firebase via REST API using Google ID token
    // const firebaseGoogleSignInRes = await fetch(
    //   `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
    //   {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       postBody: `id_token=${tokens.id_token}&providerId=google.com`,
    //       idToken,
    //       requestUri: origin,
    //       returnIdpCredential: true,
    //       returnSecureToken: true,
    //     }),
    //   },
    // );

    // const firebaseGoogleSignInData = await firebaseGoogleSignInRes.json();

    // if (!firebaseGoogleSignInRes.ok) {
    //   return NextResponse.json({ error: firebaseGoogleSignInData }, { status: 400 });
    // }

    await createSession({
      origin,
      idToken,
      headers: req.headers,
    });

    (await cookies()).set('firebase_custom_token', customToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 20, // expires in 20 seconds
    });

    return NextResponse.redirect(`${origin}/auth/google/callback`);
  } catch (err) {
    console.error('OAuth Error:', err);
    return NextResponse.json({ error: 'Failed to authenticate' }, { status: 500 });
  }
}
