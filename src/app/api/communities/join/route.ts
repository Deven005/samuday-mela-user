// /api/communities/join/route.ts
import { serverFirestore } from '@/app/config/firebase.server.config';
import { verifySession } from '@/app/utils/auth/auth';
import { CommunityType, getCommunityById } from '@/app/utils/communities/communities';
import { addCommunityMember } from '@/app/utils/communities/communityEnrich';
import { parseError, rsaDecrypt } from '@/app/utils/utils';
import { Timestamp } from 'firebase-admin/firestore';
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

    const community: CommunityType = await getCommunityById(communityId);
    const userId = await verifySession();

    const currentMember = await serverFirestore
      .collection('community_members')
      .where('communityId', '==', communityId)
      .where('userId', '==', userId)
      .get();

    if (!currentMember.empty) throw { message: 'Member is already joined!' };

    const newMemberDocData = {
      userId,
      communityId,
      joinedAt: Timestamp.now(),
      role: 'member', // "admin" or "moderator", "member", "pending"
      permissions: {
        canPost: true,
        canComment: true,
        canApprove: false,
      },
      status: 'active', // or "banned", "pending", "invited"
      notificationPrefs: {
        mentions: true,
        newPosts: true,
      },
    };

    const newMemberDoc = await serverFirestore
      .collection('community_members')
      .add(newMemberDocData);

    await addCommunityMember(communityId, newMemberDoc.id, newMemberDocData);

    return NextResponse.redirect(`${req.nextUrl.origin}/communities/${community.slug}`);
  } catch (error) {
    const err = parseError(error);
    return NextResponse.json(
      { error: err.message ?? 'Member joining is failed!', code: err.code },
      { status: err.status ?? 401 },
    );
  }
}
