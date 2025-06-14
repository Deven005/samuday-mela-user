// utils/communities/communityEnrich.ts
import { FieldPath, Timestamp } from 'firebase-admin/firestore';
import { serverFirestore } from '@/app/config/firebase.server.config';
import { getUserDataByUid } from '../utils';

const OWNER_NAME_CACHE_DURATION = 1000 * 60 * 10; // 10 minutes
const CACHE_DURATION = 1000 * 60 * 25; // 25 minutes
const ownerNameCache: Record<string, { name: string; timestamp: number }> = {};
export interface CommunityMembersType {
  id: string;
  role: string;
  joinedAt: Timestamp;
  status: string;
  displayName: string;
  photoURL: string;
  vibe: string;
  story: string;
  slug: string;
  userId: string;
  permissions: any;
  notificationPrefs: any;
}

export type CommunityMemberCache = {
  timestamp: number;
  data: CommunityMembersType[];
};

type MemberType = {
  // id: string;
  role: string;
  joinedAt: Timestamp;
  status: string;
  userId: string;
  permissions: any;
  notificationPrefs: any;
};

// ✅ Use per-community cache map
const communityMembersCache: Record<string, CommunityMemberCache> = {};

export async function getOwnerNamesByUids(uids: string[]): Promise<Record<string, string>> {
  const now = Date.now();
  const ownerMap: Record<string, string> = {};

  const toFetch: string[] = [];

  for (const uid of uids) {
    const cached = ownerNameCache[uid];
    if (cached && now - cached.timestamp < OWNER_NAME_CACHE_DURATION) {
      ownerMap[uid] = cached.name;
    } else {
      toFetch.push(uid);
    }
  }

  for (let i = 0; i < toFetch.length; i += 10) {
    const chunk = toFetch.slice(i, i + 10);
    const usersSnap = await serverFirestore
      .collection('Users') // 🔁 Adjust if your collection is named differently
      .where(FieldPath.documentId(), 'in', chunk)
      .get();

    for (const doc of usersSnap.docs) {
      const data = doc.data();
      const name = data.displayName || 'Unknown';
      ownerMap[doc.id] = name;
      ownerNameCache[doc.id] = { name, timestamp: now };
    }
  }

  return ownerMap;
}

export async function getMembersCountByCommunityIds(
  ids: string[],
): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};

  await Promise.all(
    ids.map(async (id) => {
      const snap = await serverFirestore
        .collection('community_members')
        .where('communityId', '==', id)
        .get();

      counts[id] = snap.size;
    }),
  );

  return counts;
}

export async function getCommunityMembersByCommunityId(communityId: string) {
  const now = Date.now();
  // ✅ Return cached if still fresh
  if (
    communityMembersCache[communityId] &&
    now - communityMembersCache[communityId].timestamp < CACHE_DURATION
  ) {
    return communityMembersCache[communityId].data;
  }

  const members = await serverFirestore
    .collection('community_members')
    .where('communityId', '==', communityId)
    .where('status', '==', 'active')
    .get();
  if (members.empty) return [];

  const communityMembers: CommunityMembersType[] = [];
  for (var member of members.docs) {
    const memberData = member.data();
    const userData = (await getUserDataByUid(memberData['userId']))!;
    communityMembers.push({
      id: member.id,
      displayName: userData['displayName'],
      joinedAt: memberData['joinedAt'],
      role: memberData['role'],
      status: memberData['status'],
      photoURL: userData['photoURL'],
      vibe: userData['vibe'],
      story: userData['story'],
      slug: userData['slug'],
      userId: memberData['userId'],
      permissions: memberData['permissions'],
      notificationPrefs: memberData['notificationPrefs'],
    });
  }

  // ✅ Store in cache
  communityMembersCache[communityId] = {
    timestamp: now,
    data: communityMembers,
  };

  return communityMembersCache[communityId].data;
}

export async function addCommunityMember(
  communityId: string,
  newMemberDocId: string,
  memberData: MemberType,
) {
  delete communityMembersCache[communityId];
  let members = await getCommunityMembersByCommunityId(communityId);
  const userData = (await getUserDataByUid(memberData.userId))!;

  members.push({
    id: newMemberDocId,
    displayName: userData['displayName'],
    joinedAt: memberData['joinedAt'],
    role: memberData['role'],
    status: memberData['status'],
    photoURL: userData['photoURL'],
    vibe: userData['vibe'],
    story: userData['story'],
    slug: userData['slug'],
    userId: memberData['userId'],
    permissions: memberData['permissions'],
    notificationPrefs: memberData['notificationPrefs'],
  });

  // ✅ Store in cache
  communityMembersCache[communityId] = {
    timestamp: communityMembersCache[communityId].timestamp,
    data: members,
  };
}

export async function leaveCommunityMember(communityId: string, userId: string) {
  delete communityMembersCache[communityId];
  await getCommunityMembersByCommunityId(communityId);
}
