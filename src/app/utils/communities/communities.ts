import { serverAuth, serverFirestore } from '@/app/config/firebase.server.config';
import { generateSlug } from '../slugify/slugify';
import { FieldPath, Timestamp } from 'firebase-admin/firestore';
import { parseError } from '../utils';
import { cookies } from 'next/headers';
import { getMembersCountByCommunityIds, getOwnerNamesByUids } from './communityEnrich';
import { verifySession } from '../auth/auth';

export type CommunityType = {
  //   communityId: string;
  name: string;
  description: string;
  slug: string;
  createdBy: string;
  createdAt: Timestamp;
  visibility: string;
  logo: string;
  banner: string;
  ownerName: string;
  membersCount: number;
  isJoined: boolean;
};

const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes
const communitiesCollName = 'communities',
  communitiesMembersCollName = 'community_members';
const communitiesBySlugCache: Record<string, { data: any; timestamp: number }> = {};

type CacheEntry = {
  timestamp: number;
  data: CommunityType[];
};
type CachedCommunity = {
  slug: string;
  updatedAt: Date;
};
let communitiesSlugCache: {
  data: CachedCommunity[];
  timestamp: number;
} | null = null;

// ✅ Use per-user cache map
const communitiesCache: Record<string, CacheEntry> = {};

export async function createCommunity(formData: FormData) {
  try {
    const userId = verifySession();

    const name = formData.get('name')?.toString();
    const description = formData.get('description')?.toString();
    const visibility = formData.get('visibility')?.toString() || 'public';

    if (!userId || !name || !description) throw new Error('Unauthorized or invalid form');

    // Check if same community already exists for user
    const existing = await serverFirestore
      .collection(communitiesCollName)
      .where('createdBy', '==', userId)
      .where('name', '==', name)
      .get();
    if (!existing.empty) throw { message: 'A community with this name already exists.' };

    // Create community
    const communityDoc = serverFirestore.collection(communitiesCollName).doc();
    const slug = generateSlug(`${name}-${description}`, communityDoc.id);
    const currentTimestamp = Timestamp.now();

    await communityDoc.set(
      {
        communityId: communityDoc.id,
        name,
        description,
        slug,
        createdBy: userId,
        createdAt: currentTimestamp,
        updatedAt: currentTimestamp,
        visibility,
        logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(name ?? 'Community')}&rounded=true`,
        banner: `https://ui-avatars.com/api/?name=${encodeURIComponent(name ?? 'Community')}&size=512&rounded=true`,
      },
      { merge: true },
    );

    await serverFirestore.collection('community_members').add({
      userId,
      communityId: communityDoc.id,
      joinedAt: currentTimestamp,
      role: 'owner', // "admin" or "moderator", "member", "pending"
      permissions: {
        canPost: true,
        canComment: true,
        canApprove: true,
      },
      status: 'active', // or "banned", "pending", "invited"
      notificationPrefs: {
        mentions: true,
        newPosts: true,
      },
    });

    return slug;
  } catch (error) {
    const err = parseError(error);
    throw err.message;
  }
}

export async function getCommunityBySlug(slug: string) {
  const now = Date.now();
  const cached = communitiesBySlugCache[slug];

  if (cached && now - cached.timestamp < 60 * 60 * 1000) return cached.data;

  console.log('fetching community by slug');
  const communitiesDocs = await serverFirestore
    .collection(communitiesCollName)
    .where('slug', '==', slug)
    .limit(1)
    .get();
  if (communitiesDocs.empty) throw new Error('No community found');

  const community = communitiesDocs.docs[0].data() as CommunityType;

  const [ownerMap, memberCounts] = await Promise.all([
    getOwnerNamesByUids([community.createdBy]),
    getMembersCountByCommunityIds([communitiesDocs.docs[0].id]),
  ]);

  // ✅ 3. Only keep public-safe fields
  const communityData = {
    name: community.name,
    description: community.description,
    slug: community.slug,
    createdAt: community.createdAt,
    createdBy: community.createdBy,
    visibility: community.visibility,
    logo: community.logo,
    banner: community.banner,
    ownerName: ownerMap[community.createdBy] ?? 'Unknown',
    membersCount: memberCounts[communitiesDocs.docs[0].id] ?? 0,
  } as CommunityType;
  communitiesBySlugCache[slug] = { data: communityData, timestamp: now };
  return communityData;
}

export async function getCommunities(userId?: string): Promise<CommunityType[]> {
  const now = Date.now();
  const cacheKey = userId ?? 'public-only';

  // ✅ Return cached if still fresh
  if (communitiesCache[cacheKey] && now - communitiesCache[cacheKey].timestamp < CACHE_DURATION) {
    return communitiesCache[cacheKey].data;
  }

  console.log(`🔄 Fetching communities for ${userId || 'guest'}`);

  const queries = [];

  // Public communities
  queries.push(
    serverFirestore.collection(communitiesCollName).where('visibility', '==', 'public').get(),
  );

  // Joined private communities (if userId is given)
  let joinedCommunityIds: string[] = [];
  if (userId) {
    const memberSnap = await serverFirestore
      .collection(communitiesMembersCollName)
      .where('userId', '==', userId)
      .get();

    joinedCommunityIds = memberSnap.docs.map((doc) => doc.data().communityId);

    // Handle joined communities in chunks (Firestore 'in' max 10)
    for (let i = 0; i < joinedCommunityIds.length; i += 10) {
      const chunk = joinedCommunityIds.slice(i, i + 10);
      queries.push(
        serverFirestore
          .collection(communitiesCollName)
          .where(FieldPath.documentId(), 'in', chunk)
          .get(),
      );
    }
  }

  // Run all queries
  const snapshots = await Promise.all(queries);
  const seen = new Set();
  const result: CommunityType[] = [];

  for (const snap of snapshots) {
    for (const doc of snap.docs) {
      if (!seen.has(doc.id)) {
        seen.add(doc.id);
        result.push({ ...(doc.data() as CommunityType) });
      }
    }
  }

  // 🔁 Enrich with cached owner names
  const ownerUids = result.map((c) => c.createdBy);
  const ownerMap = await getOwnerNamesByUids(ownerUids);

  // 🔁 Enrich with membersCount
  const communityIds = result.map((c) => c.slug); // or use `doc.id` if stored
  const membersCountMap = await getMembersCountByCommunityIds(communityIds);

  // 🔁 Enrich: isJoined
  const joinedSet = new Set(joinedCommunityIds);

  const enriched = result.map(
    (c) =>
      ({
        ...c,
        ownerName: ownerMap[c.createdBy] ?? 'Unknown',
        membersCount: membersCountMap[c.slug] ?? 0, // or use doc.id mapping
        isJoined: userId ? joinedSet.has(c.slug) : false,
      }) as CommunityType,
  );

  // ✅ Store in cache
  communitiesCache[cacheKey] = {
    timestamp: now,
    data: enriched,
  };

  return enriched;
}

export async function getAllCommunitiesSlugs(): Promise<CachedCommunity[]> {
  const now = Date.now();

  if (communitiesSlugCache && now - communitiesSlugCache.timestamp < CACHE_DURATION) {
    return communitiesSlugCache.data;
  }

  console.log('fetching all communities slugs');
  const snapshot = await serverFirestore.collection(communitiesCollName).get();

  const data = snapshot.docs.map((doc) => ({
    slug: doc.data().slug,
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
  }));

  communitiesSlugCache = {
    data,
    timestamp: now,
  };

  return data;
}
