// app/api/auth/logout/route.ts
import { logoutUser } from '@/app/utils/auth/auth';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const idToken = req.headers.get('Authorization')?.replace('Bearer ', '') ?? '';

    if (!idToken) {
      return NextResponse.json({ error: 'No token provided' }, { status: 400 });
    }

    const { fcmToken } = await req.json();

    await logoutUser({ idToken, fcmTokens: [fcmToken] });

    return NextResponse.json({ message: 'Logout is done' }, { status: 200 });
  } catch (error: any) {
    console.log('logout error : ', error);
    return NextResponse.json(
      { message: error.message ?? 'Error while Logout!', error },
      { status: error.code ?? error.status ?? 400 },
    );
  }
}
