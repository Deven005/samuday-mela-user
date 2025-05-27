import { serverFirestore } from '@/app/config/firebase.server.config';
import { Timestamp } from 'firebase-admin/firestore';

const cache: Record<string, { data: any; timestamp: number }> = {};
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
