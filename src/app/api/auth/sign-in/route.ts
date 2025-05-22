// app/api/auth/sign-in/route.ts
import { serverAuth, serverFirestore } from '@/app/config/firebase.server.config';
import { createSession } from '@/app/utils/auth/auth';
import { getUserData, removeUndefinedDeep, rsaDecrypt } from '@/app/utils/utils';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { origin } = req.nextUrl;
    const { encryptedData } = await req.json();

    const { email, password, fcmTokens } = JSON.parse(rsaDecrypt(encryptedData));

    if (!email || !password) throw { message: 'Email or pass is not provided!' };

    // const encryptedData1 = encryptJsonPayload({ email: email, password: password });
    // console.log('encryptedData: ', encryptedData);
    // console.log('encryptedData1: ', encryptedData1);

    // const decryptedString1 = rsaDecrypt(encryptedData);
    // console.log('email: ', email, 'password: ', password);

    const res = await fetch(
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

    const data = await res.json();

    if (data.error) {
      throw data.error;
    }

    const { idToken, localId } = data;

    await createSession({
      origin,
      idToken,
      headers: req.headers,
      fcmTokens,
    });

    await serverFirestore.doc(`Users/${localId}`).set(
      {
        ...removeUndefinedDeep((await serverAuth.getUser(localId)).toJSON()),
      },
      { merge: true },
    );

    const user = await serverAuth.getUser(localId);
    if (!user.providerData.some((p) => p.providerId === 'password')) {
      await serverAuth.updateUser(localId, {
        providerToLink: {
          providerId: 'password',
          email,
          uid: user.uid,
          displayName: user.displayName,
          phoneNumber: user.phoneNumber,
          photoURL: user.photoURL,
        },
      });
    }

    const userData = await getUserData();
    const customToken = await serverAuth.createCustomToken(localId, { user: true });

    return NextResponse.json({
      message: 'Signed in successfully',
      // uid: localId,
      customToken,
      userData,
    });
  } catch (error: any) {
    console.error('sign-in failed:', error);
    return NextResponse.json(
      { error: error.message ?? 'Sign-in failed!' },
      { status: error.status ?? 401 },
    );
  }
}
