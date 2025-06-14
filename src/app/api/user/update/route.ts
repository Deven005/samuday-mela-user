// src/app/api/user/update/route.ts
import { clearUserData, getUserData, parseError } from '@/app/utils/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    await clearUserData();
    await getUserData(true);
    return NextResponse.json({ message: 'Profile is updated!' }, { status: 200, statusText: 'OK' });
  } catch (error) {
    const parsed = parseError(error);

    return NextResponse.json(
      { error: parsed.message, code: parsed.code },
      { status: parsed?.status ?? 500 },
    );
  }
}
