'use client';
import React, { useEffect, useState } from 'react';
import { usePostStore } from '@/app/stores/post/postStore';
import { StaggeredGrid, StaggeredGridItem } from 'react-staggered-grid';
import { useOtherUserStore } from '../stores/user/otherUserStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useShallow } from 'zustand/shallow';
import Image from 'next/image';
import { Button } from '../components/Button/Button';
import { useUserStore } from '../stores/user/userStore';
import { auth, firestore } from '../config/firebase.config';
import { doc, increment, Timestamp, writeBatch } from 'firebase/firestore';

export const metadata = {
  title: 'Posts | Samuday Mela',
};

const Posts = () => {
  const router = useRouter();
  const { posts, listenPostChanges, handleShare, toggleLike, getLikeStatus, clearLikes } =
    usePostStore(useShallow((state) => state));
  const { user } = useUserStore(useShallow((state) => state));
  const [mediaIndexes, setMediaIndexes] = useState<Record<string, number>>({});
  const otherUsers = useOtherUserStore(useShallow((state) => state.otherUsers));

  useEffect(() => {
    const unsubscribe = listenPostChanges();
    return () => {
      unsubscribe();
      syncLikes()
        .then((res) => {})
        .catch((e) => console.error('Error syncLikes post'));
    };
  }, [listenPostChanges]);

  const syncLikes = async () => {
    const { liked, unliked } = getLikeStatus();

    const user = auth.currentUser;
    if (!user) return;

    const batch = writeBatch(firestore);

    liked.forEach((postId) => {
      const postRef = doc(firestore, 'posts', postId);
      batch.set(postRef, {
        likesCount: increment(1),
      });

      const likeRef = doc(firestore, 'posts', postId, 'postLikes', user.uid);
      batch.set(likeRef, {
        userId: user.uid,
        actionTime: Timestamp.now(),
      });
    });

    unliked.forEach((postId) => {
      const postRef = doc(firestore, 'posts', postId);
      batch.set(postRef, {
        likesCount: increment(-1),
      });

      const likeRef = doc(firestore, 'posts', postId, 'postLikes', user.uid);
      batch.delete(likeRef);
    });

    try {
      await batch.commit();
      clearLikes();
      console.log('✅ Synced likes/unlikes');
    } catch (error) {
      console.error('🔥 Failed to sync likes to Firestore:', error);
    }
  };

  useEffect(() => {
    const handleUnload = async () => {
      await syncLikes();
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  const handleMediaChange = (postId: string, direction: 'prev' | 'next', total: number) => {
    setMediaIndexes((prev) => {
      const current = prev[postId] || 0;
      const newIndex = direction === 'next' ? (current + 1) % total : (current - 1 + total) % total;
      return { ...prev, [postId]: newIndex };
    });
  };

  const handleAddPostClick = () => {
    router.push('/posts/add');
  };

  return (
    <div className="container mx-auto px-4 relative bg-base-200 text-base-content py-6 mt-auto border-t border-base-300 transition-colors duration-300">
      {/* Add Post Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleAddPostClick}
          className="btn btn-circle text-2xl shadow-lg hover:scale-105 transition-transform text-base-content dark:bg-base-800"
          title="Add Post"
          aria-label="Add Post"
        >
          +
        </Button>
      </div>

      {posts?.length === 0 ? (
        <div className="text-center text-base-content text-lg mt-10">No posts available.</div>
      ) : (
        <StaggeredGrid columns={4} columnWidth={300} className="bg-base-200 text-base-content">
          {posts?.map((post, index) => {
            const currentIndex = mediaIndexes[post.postId] || 0;
            const currentMedia = post.mediaFiles[currentIndex];
            const postUser = otherUsers?.find((u) => u.uid === post.userId);

            return (
              <StaggeredGridItem key={post.postId} index={index}>
                <div className="bg-base-100 border border-base-300 rounded-xl shadow-xl p-3 mx-2 transition-transform duration-300 hover:scale-[1.01]">
                  {/* User Info */}
                  {postUser && (
                    <Link href={`/user/${postUser.slug}`} className="flex items-center gap-3 mb-2">
                      <div className="relative w-9 h-9">
                        <Image
                          src={
                            postUser.photoURL ??
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              postUser?.displayName ?? 'User',
                            )}&rounded=true&background=0D8ABC&color=fff`
                          }
                          alt="User Avatar"
                          fill
                          className="rounded-full object-cover border shadow-sm"
                        />
                      </div>
                      <span className="text-sm font-semibold text-base-content hover:text-primary transition">
                        {postUser.displayName}
                      </span>
                    </Link>
                  )}

                  {/* Title & Description */}
                  <div className="space-y-1 mb-2">
                    {post.title && (
                      <p className="text-base-content text-sm font-medium">{post.title}</p>
                    )}
                    {post.description && (
                      <p className="text-base-content text-sm">{post.description}</p>
                    )}
                    {post.isEdited && <p className="text-xs italic text-warning">Edited</p>}
                  </div>

                  {/* Hashtags */}
                  {post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {post.hashtags.map((tag, idx) => (
                        <Link key={idx} href={`/hashtags/${tag}`}>
                          <span className="badge badge-sm badge-outline badge-primary text-xs">
                            #{tag}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Media Display */}
                  {currentMedia && (
                    <Link href={`/posts/${post.postSlug}`}>
                      <div className="relative mt-3 group rounded-md overflow-hidden">
                        <div className="relative w-full h-64">
                          {currentMedia.fileType.includes('image') ? (
                            <Image
                              src={currentMedia.fileUrl}
                              alt="Post media"
                              fill
                              className="object-fill rounded"
                              fetchPriority={index === 0 ? 'high' : 'auto'}
                              loading={index === 0 ? 'eager' : 'lazy'}
                            />
                          ) : (
                            <video
                              controls
                              src={currentMedia.fileUrl}
                              className="object-fill w-full h-64 rounded"
                              poster={currentMedia.thumbnailUrl}
                            />
                          )}
                        </div>

                        {/* Media Navigation */}
                        {post.mediaFiles.length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleMediaChange(post.postId, 'prev', post.mediaFiles.length);
                              }}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
                            >
                              ❮
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleMediaChange(post.postId, 'next', post.mediaFiles.length);
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
                            >
                              ❯
                            </button>
                          </>
                        )}
                      </div>
                    </Link>
                  )}

                  {/* Like / Comment / Share Buttons */}
                  {user && (
                    <div className="mt-4 flex items-center justify-around text-sm text-base-content">
                      <Button
                        onClick={() => toggleLike(post.postId)}
                        className="flex items-center gap-1 hover:text-error transition active:scale-90 border border-gray-300"
                      >
                        ❤️ <span>{0 + (getLikeStatus().liked.includes(post.postId) ? 1 : 0)}</span>
                      </Button>

                      <Button
                        onClick={() => handleShare(post)}
                        className="flex items-center gap-1 hover:text-success transition active:scale-90 border border-gray-300"
                      >
                        💬 <span>{0}</span>
                      </Button>

                      <Button
                        onClick={() => handleShare(post)}
                        className="flex items-center gap-1 hover:text-success transition active:scale-90 border border-gray-300"
                      >
                        🔄 <span>Share</span>
                      </Button>
                    </div>
                  )}
                </div>
              </StaggeredGridItem>
            );
          })}
        </StaggeredGrid>
      )}
    </div>
  );
};

export default Posts;
