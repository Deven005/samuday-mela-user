import { serverFirestore } from '@/app/config/firebase.server.config';
import { Timestamp } from 'firebase-admin/firestore';

const cache: Record<string, { data: any; timestamp: number }> = {},
  postsByUserIdCache: Record<string, { data: PostDetailsProps[]; timestamp: number }> = {};

export type MediaFile = {
  fileUrl: string;
  thumbnailUrl: string;
  fileType: string;
  originalFileName: string;
};

export type PostDetailsProps = {
  title: string;
  description: string;
  hashtags: string[];
  createdAt: Date;
  updatedAt: Date;
  ipAddress: string;
  isEdited: boolean;
  isPrivate: boolean;
  isVisible: boolean;
  lastEngagementAt: Date;
  mediaFiles: MediaFile[];
  postId: string;
  postSlug: string;
  userId: string;
};

export async function getPostSlug(slug: string) {
  try {
    const now = Date.now();
    const cached = cache[slug];

    if (cached && now - cached.timestamp < 60 * 60 * 1000) return cached.data;

    console.log('fetching post by slug');
    var postDocs = await serverFirestore
      .collection(`posts`)
      .where('postSlug', '==', slug)
      .limit(1)
      .get();

    if (postDocs.empty) throw new Error('No user found');
    const post = postDocs.docs[0].data() as PostDetailsProps;
    // ✅ 3. Only keep public-safe fields
    const postData = {
      postSlug: post.postSlug,
      description: post.description,
      title: post.title,
      mediaFiles: post.mediaFiles,
      hashtags: post.hashtags,
      createdAt: (post.createdAt as unknown as Timestamp).toDate(),
      userId: post.userId,
      isPrivate: post.isPrivate,
      isEdited: post.isEdited,
      isVisible: post.isVisible,
    };
    cache[slug] = { data: postData, timestamp: now };
    return postData;
  } catch (error) {
    console.error('Error fetching user by slug!');
    throw error;
  }
}

export async function getPostsByUserId(userId: string): Promise<PostDetailsProps[]> {
  try {
    const now = Date.now();
    const cached = postsByUserIdCache[userId];

    // Use cache if not expired (valid for 5 min)
    if (cached && now - cached.timestamp < 60 * 5 * 1000) {
      return cached.data;
    }

    console.log('📡 Fetching posts from Firestore for user');

    const snapshot = await serverFirestore
      .collection('posts')
      .where('userId', '==', userId)
      .where('isPrivate', '==', false)
      .where('isVisible', '==', true)
      .orderBy('createdAt', 'desc')
      .get();

    if (snapshot.empty) {
      postsByUserIdCache[userId] = { data: [], timestamp: now };
      return [];
    }

    const posts: PostDetailsProps[] = snapshot.docs.map((doc) => {
      const post = doc.data() as PostDetailsProps;
      return {
        postId: doc.id,
        postSlug: post.postSlug,
        title: post.title,
        description: post.description,
        mediaFiles: post.mediaFiles || [],
        hashtags: post.hashtags || [],
        userId: post.userId,
        createdAt: (post.createdAt as unknown as Timestamp).toDate(),
        updatedAt: (post.updatedAt as unknown as Timestamp).toDate(),
        lastEngagementAt: (post.lastEngagementAt as unknown as Timestamp).toDate(),
        isEdited: post.isEdited,
        isPrivate: post.isPrivate,
        isVisible: post.isVisible,
        ipAddress: post.ipAddress,
      };
    });

    postsByUserIdCache[userId] = { data: posts, timestamp: now };
    return posts;
  } catch (error) {
    console.error('❌ Error fetching posts by user ID:', error);
    throw new Error('Failed to fetch posts for this user.');
  }
}
