// /api/communities/leave/route.ts
import { serverFirestore } from '@/app/config/firebase.server.config';
import { verifySession } from '@/app/utils/auth/auth';
import { leaveCommunityMember } from '@/app/utils/communities/communityEnrich';
import { parseError, rsaDecrypt } from '@/app/utils/utils';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Ensure this runs in Node.js

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const encryptedData = (await req.formData()).get('encryptedData')?.toString();

    if (!encryptedData || encryptedData === undefined) {
      throw { message: 'No data found!', code: 'no-data', status: 400 };
    }

    const { communityId } = JSON.parse(rsaDecrypt(encryptedData));

    if (!communityId || communityId === undefined) throw { message: 'No id found!' };

    const userId = await verifySession();
    const currentMember = await serverFirestore
      .collection('community_members')
      .where('communityId', '==', communityId)
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (currentMember.empty) throw { message: 'No member found!' };

    await currentMember.docs[0].ref.delete();
    await leaveCommunityMember(communityId, userId);

    return NextResponse.redirect(`${req.nextUrl.origin}/communities`);
  } catch (error) {
    const err = parseError(error);
    return NextResponse.json(
      { error: err.message ?? 'Member leaving is failed!', code: err.code },
      { status: err.status ?? 401 },
    );
  }
}
