// utils/communities/communityEnrich.ts
import { FieldPath } from 'firebase-admin/firestore';
import { serverFirestore } from '@/app/config/firebase.server.config';

const OWNER_NAME_CACHE_DURATION = 1000 * 60 * 10; // 10 minutes
const ownerNameCache: Record<string, { name: string; timestamp: number }> = {};

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
