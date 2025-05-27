// app/api/auth/sign-up/route.ts
import { serverAuth } from '@/app/config/firebase.server.config';
import { createSession, getOrCreateUser } from '@/app/utils/auth/auth';
import { rsaDecrypt } from '@/app/utils/utils';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { origin } = req.nextUrl;
    const { encryptedData } = await req.json();

    const { email, password, displayName, fcmTokens } = JSON.parse(rsaDecrypt(encryptedData));

    if (!email || !password || !displayName)
      throw { message: 'Sign-up required details not provided!' };

    const { userData } = (await getOrCreateUser({
      origin,
      properties: {
        email: email,
        password: password,
        displayName: displayName,
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          displayName || 'User',
        )}&rounded=true`,
      },
      headers: req.headers,
    }))!;

    const signInRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      },
    );
    const signInData = await signInRes.json();

    console.log('signInData: ', signInData);

    if (signInData.error) throw signInData.error;

    const { idToken, localId } = signInData;

    await createSession({
      origin,
      idToken,
      headers: req.headers,
      fcmTokens,
    });

    const removeKeys = ['signUpFromIpAddress', 'tokensValidAfterTime', 'customClaims', 'disabled'];

    for (var key in removeKeys) {
      delete userData[key];
    }

    return NextResponse.json({
      message: 'Signed up successfully',
      customToken: await serverAuth.createCustomToken(localId),
      userData,
    });
  } catch (error: any) {
    console.error('sign-up failed:', error);
    return NextResponse.json(
      { error: error.message ?? 'Sign-Up failed!' },
      { status: error.code ?? error.status ?? 401 },
    );
  }
}
