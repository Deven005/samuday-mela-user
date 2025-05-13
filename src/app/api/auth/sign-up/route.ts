// app/api/auth/sign-up/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); // ❌ Reject requests without App Check
    return NextResponse.json({ message: 'Sign-up api', valid: true }, { status: 200 });
  } catch (error: any) {
    console.error('sign-up failed:', error);
    return NextResponse.json(
      { message: error.message ?? 'Sign-Up failed!' },
      { status: error.status ?? 400 },
    );
  }
}
