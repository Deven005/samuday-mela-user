import { create } from 'zustand';
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp,
  limit,
  getDocs,
  Query,
  startAfter,
  Unsubscribe,
  QueryDocumentSnapshot,
  DocumentData,
  doc,
  setDoc,
} from 'firebase/firestore';
import { auth, firestore } from '@/app/config/firebase.config';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useOtherUserStore } from '../user/otherUserStore';
import { FirebaseError } from 'firebase/app';
import { generateSlug } from '@/app/utils/slugify/slugify';
import { getIpAddress } from '@/app/utils/utils-client';
import { uploadFilesWithThumbnails, UploadProgress } from '@/app/utils/uploadFiles';
import { showCustomToast } from '@/app/components/showCustomToast';

// Define the Post type based on your Firestore data structure
export interface Post {
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  title: string;
  description: string;
  hashtags: string[];
  // ipAddress: string;
  isEdited: boolean;
  isPrivate: boolean;
  isVisible: boolean;
  // lastEngagementAt: string;
  // location: { lat: number; lng: number };
  mediaFiles: Array<{
    fileType: string;
    fileUrl: string;
    localFilePath: string;
    storageFilePath: string;
    thumbnailUrl: string;
    postId: string;
    updatedAt: string;
  }>;
  postId: string;
  userId: string;
  postSlug: string;
  likesCount: number;
}

export interface AddPostType {
  title: string;
  description: string;
  // createdAt: Timestamp;
  // updatedAt?: Timestamp;
  hashtags: string[];
  // ipAddress: string;
  // isEdited: boolean;
  // isPrivate: boolean;
  // isVisible: boolean;
  // lastEngagementAt: string;
  // location: { lat: number; lng: number };
  mediaFiles: Array<File>;
  // postId: string;
  // userId: string;
}

// Define the Zustand store
interface PostStore {
  _hasHydrated?: boolean;
  loading: boolean;
  uploading: boolean;
  lastDoc: QueryDocumentSnapshot<DocumentData, DocumentData> | null;
  posts: Post[] | null;
  listeners: Unsubscribe[];
  uploadProgress: UploadProgress | undefined;
  likedPosts: Set<string>;
  unlikedPosts: Set<string>;
  toggleLike: (postId: string) => void;
  getLikeStatus: () => { liked: string[]; unliked: string[] };
  clearLikes: () => void;
  setHasHydrated: () => void;
  setLoading: (loading: boolean) => void;
  setUploadProgress: (uploadProgress: UploadProgress) => void;
  setUploading: (uploading: boolean) => void;
  setPosts: (posts: Post[]) => void;
  addPost: (post: AddPostType, onSuccess?: () => void) => Promise<void>;
  updatePost: (post: Post) => void;
  removePost: (postId: string) => void;
  handleShare: (post: Post) => void;
  loadPosts: () => void;
  listenPostChanges: () => () => void;
  reset: () => void;
  // setProgress: (progress: number) => void;
}

// Create the store with Zustand
export const usePostStore = create<PostStore>()(
  persist(
    (set, get) => ({
      // hydration check
      _hasHydrated: false,
      loading: false,
      uploading: false,
      lastDoc: null,
      posts: [], // Initial state for posts
      listeners: [],
      progress: 0,
      uploadProgress: undefined,
      likedPosts: new Set(),
      unlikedPosts: new Set(),
      setHasHydrated: () => set({ _hasHydrated: true }),
      setLoading: (loading) => set({ loading: loading }),
      setUploading: (uploading) => set({ uploading: uploading }),
      // setProgress: (progress) => set({ progress: progress }),
      setPosts: (posts) => set({ posts }), // Action to set posts directly
      updatePost: (updatedPost) =>
        set((state) => ({
          posts: state.posts?.map((post) =>
            post.postId === updatedPost.postId ? updatedPost : post,
          ),
        })), // Action to update a post
      removePost: (postId) =>
        set((state) => ({
          posts: state.posts?.filter((post) => post.postId !== postId),
        })), // Action to remove a post by postId
      loadPosts: async () => {
        const { lastDoc, posts } = get();

        const q: Query = !lastDoc
          ? query(
              collection(firestore, 'posts'),
              where('isVisible', '==', true),
              orderBy('createdAt', 'desc'),
              limit(10),
            )
          : query(
              collection(firestore, 'posts'),
              where('isVisible', '==', true),
              orderBy('createdAt', 'desc'),
              startAfter(lastDoc),
              limit(10),
            );

        const snap = await getDocs(q);

        if (!snap.empty && snap.size > 0) {
          set({
            lastDoc: snap.docs[snap.docs.length - 1],
            posts: [
              ...(posts ?? []),
              ...snap.docs.map(
                (doc) =>
                  ({
                    ...doc.data(),
                    postId: doc.id,
                  }) as Post,
              ),
            ],
          });
        }
      },
      listenPostChanges: () => {
        const { listeners } = get();
        const unsubscribe = onSnapshot(
          query(
            collection(firestore, 'posts'),
            where('isVisible', '==', true),
            orderBy('createdAt', 'desc'),
          ), // Firestore collection name
          (snapshot) => {
            const currentPosts = get().posts ?? [];
            const updatedPosts = [...currentPosts];
            snapshot.docChanges().forEach((change) => {
              const postDoc = change.doc;
              const postData = {
                ...postDoc.data(),
                postId: postDoc.id,
              } as Post;

              switch (change.type) {
                case 'added':
                  // Add new post
                  const exists = updatedPosts.some((p) => p.postId === postData.postId);
                  if (!exists) updatedPosts.push(postData);
                  break;
                case 'modified':
                  const postChangeIndex = updatedPosts.findIndex(
                    (p) => p.postId === postData.postId,
                  );
                  if (postChangeIndex !== -1) updatedPosts[postChangeIndex] = postData;
                  // Update existing post
                  break;
                case 'removed':
                  //  Remove post
                  const postRemoveIndex = updatedPosts.findIndex(
                    (p) => p.postId === postData.postId,
                  );
                  if (postRemoveIndex !== -1) updatedPosts.splice(postRemoveIndex, 1);
                  break;
                default:
                  break;
              }
            });
            set({ posts: updatedPosts });
            useOtherUserStore
              .getState()
              .fetchOtherUserData?.([...new Set(updatedPosts.map((p) => p.userId))]);
          },
          (error: FirebaseError) => {
            console.error('Error fetching posts: ', error);
            throw error;
          },
        );

        // Return the unsubscribe function to stop listening when needed
        set(() => ({
          listeners: [...listeners, unsubscribe],
        }));

        return unsubscribe;
      },
      setUploadProgress: (uploadProgress) => set({ uploadProgress: uploadProgress }),
      addPost: async (post, onSuccess?: () => void) => {
        const { setLoading, setUploading, setUploadProgress } = get();

        try {
          if (!post.title || !post.description) throw { message: 'No title or description!' };

          setLoading(true);

          const user = auth.currentUser!;
          const currentTimestamp = Timestamp.now();
          const postDoc = doc(collection(firestore, 'posts'));

          let postData: any = {
            title: post.title,
            description: post.description,
            hashtags: post.hashtags,
            postSlug: generateSlug(post.title, user.uid),
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
            lastEngagementAt: currentTimestamp,
            postId: postDoc.id,
            userId: user.uid,
            isEdited: false,
            isPrivate: false,
            isVisible: true,
            ipAddress: await getIpAddress(),
            likesCount: 0,
          };

          if (post.mediaFiles && post.mediaFiles.length > 0) {
            setUploading(true);

            var filesResult = await Promise.all([
              new Promise((resolve) => setTimeout(resolve, 3)),
              uploadFilesWithThumbnails(
                post.mediaFiles,
                `Users/posts/${postDoc.id}`,
                postDoc.id,
                (prog) => setUploadProgress(prog),
              ),
            ]);

            console.log('File uploaded!');

            // const files = await uploadFilesWithThumbnails(
            //   post.mediaFiles,
            //   `Users/posts/${postDoc.id}`,
            //   postDoc.id,
            //   (prog) => setProgress(prog.percentage),
            // );

            postData = { ...postData, mediaFiles: filesResult[1] };
            setUploading(false);

            showCustomToast({
              title: 'File uploaded!',
              message: 'New post files uploaded successfully!',
              type: 'success',
            });
          }

          await Promise.all([
            new Promise((resolve) => setTimeout(resolve, 3)),
            setDoc(postDoc, postData, { merge: true }),
          ]);
          setLoading(false);
          setUploading(false);
          setUploadProgress({
            currentFileName: '',
            percentage: 0,
            totalSize: 0,
            uploadedSize: 0,
          });

          if (onSuccess) onSuccess();

          showCustomToast({
            title: 'Post is added!',
            message: 'New post is added successfully!',
            type: 'success',
          });
        } catch (error) {
          setLoading(false);
          setUploading(false);

          showCustomToast({
            title: 'Error',
            message: 'Something is wrong while adding Post!',
            type: 'error',
          });
          await new Promise((resolve) => setTimeout(resolve, 3));
          throw error;
        }
      },
      reset: () => {
        // Clear all listeners manually if needed (e.g., on component unmount)
        try {
          set((state) => {
            state.listeners.forEach((unsubscribe) => unsubscribe());
            return {};
          });
        } catch (error) {
          console.log('err: ', error);
        }
      },
      toggleLike: (postId: string) => {
        const { likedPosts, unlikedPosts } = get();
        const likedSet =
          likedPosts instanceof Set
            ? new Set(likedPosts)
            : new Set<string>(Object.values(likedPosts));

        const unLikedSet =
          unlikedPosts instanceof Set
            ? new Set(unlikedPosts)
            : new Set<string>(Object.values(unlikedPosts));

        if (likedSet.has(postId)) {
          likedSet.delete(postId);
          unLikedSet.add(postId);
        } else {
          likedSet.add(postId);
          unLikedSet.delete(postId);
        }

        set({ likedPosts: likedSet, unlikedPosts: unLikedSet });
      },
      getLikeStatus: () => {
        const { likedPosts, unlikedPosts } = get();
        return {
          liked: likedPosts instanceof Set ? Array.from(likedPosts) : Object.values(likedPosts),
          unliked:
            unlikedPosts instanceof Set ? Array.from(unlikedPosts) : Object.values(unlikedPosts),
        };
      },
      clearLikes: () => set({ likedPosts: new Set(), unlikedPosts: new Set() }),
      handleShare: (post) => {
        const url = `${window.location.origin}/posts/${post.postSlug}`;
        if (navigator.share) {
          navigator.share({ title: post.title || 'Check this out!', url });
        } else {
          navigator.clipboard.writeText(url);
          alert('Link copied to clipboard!');
        }
      },
    }),
    {
      name: 'posts-storage', // The key used to store the data in localStorage
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated();
      },
    },
  ),
);
