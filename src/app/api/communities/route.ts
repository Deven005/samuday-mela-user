// /api/communities/route.ts
import { createCommunity } from '@/app/utils/communities/communities';
import { parseError } from '@/app/utils/utils';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Ensure this runs in Node.js

export async function POST(req: NextRequest) {
  try {
    const res = await createCommunity(await req.formData());
    console.log('create community: ', res);

    return NextResponse.json({ message: 'Community is created!' }, { status: 200 });
  } catch (error) {
    const err = parseError(error);
    return NextResponse.json(
      { error: err.message ?? 'Create Community is failed!', code: err.code },
      { status: err.status ?? 401 },
    );
  }
}
