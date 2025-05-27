// app/api/auth/logout/route.ts
import { logoutUser } from '@/app/utils/auth/auth';
import { parseError } from '@/app/utils/utils';
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
    const err = parseError(error);
    console.log('logout error : ', err);
    return NextResponse.json(
      { message: err.message ?? 'Error while Logout!', code: err.code },
      { status: err.status ?? 400 },
    );
  }
}
