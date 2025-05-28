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

const Posts = () => {
  const router = useRouter();
  const posts = usePostStore(useShallow((state) => state.posts));
  const listenPostChanges = usePostStore(useShallow((state) => state.listenPostChanges));
  const [mediaIndexes, setMediaIndexes] = useState<Record<string, number>>({});
  const otherUsers = useOtherUserStore(useShallow((state) => state.otherUsers));

  useEffect(() => {
    const unsubscribe = listenPostChanges();
    return () => unsubscribe();
  }, [listenPostChanges]);

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
    <div className="container mx-auto px-4 relative bg-base-200 text-base-content py-12 mt-auto border-t border-base-300 transition-colors duration-300">
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
                <div className="bg-base-200 border border-base-300 rounded-xl shadow-2xl p-4 m-4 transition-transform hover:scale-[1.02] duration-300">
                  {/* User Info */}
                  {postUser && (
                    <Link
                      href={`/user/${postUser.slug}`}
                      className="flex items-center space-x-3 mb-3 group"
                    >
                      <div className="relative w-10 h-10">
                        <Image
                          src={
                            postUser.photoURL ??
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              postUser?.displayName ?? 'User',
                            )}&rounded=true&background=0D8ABC&color=fff`
                          }
                          alt={postUser.displayName ?? 'User Avatar'}
                          fill
                          className="rounded-full object-cover border shadow-sm transition-all duration-200 group-hover:shadow-md"
                        />
                      </div>
                      <span className="text-sm font-semibold text-base-content group-hover:text-primary transition-colors duration-200">
                        {postUser.displayName}
                      </span>
                    </Link>
                  )}

                  {/* Post Title */}
                  {post.description && (
                    <p className="text-sm text-base-content leading-snug mt-3">{post.title}</p>
                  )}

                  {/* Post Content */}
                  {post.description && (
                    <p className="text-sm text-base-content leading-snug mt-3">
                      {post.description}
                    </p>
                  )}

                  {/* Hashtags */}
                  {post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {post.hashtags.map((hashtag, idx) => (
                        <Link href={`hashtags/${hashtag}`} key={`${hashtag}-${idx}`}>
                          <span className="badge badge-outline badge-primary text-xs">
                            #{hashtag}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Edited Tag */}
                  {post.isEdited && (
                    <div className="text-xs italic text-warning mt-2">Edited Post</div>
                  )}

                  {/* Media Display */}
                  {currentMedia && (
                    <Link href={`posts/${post.postSlug}`}>
                      <div className="relative group mt-3">
                        <div className="relative w-full h-64">
                          {currentMedia.fileType.includes('image') ? (
                            <Image
                              id={`${currentMedia.postId}-media-${currentMedia.fileUrl}`}
                              src={
                                currentMedia.fileType.includes('image')
                                  ? currentMedia.fileUrl
                                  : currentMedia.thumbnailUrl
                              }
                              alt={`media-${currentIndex}`}
                              fill
                              className="object-fill rounded"
                              fetchPriority="high"
                            />
                          ) : (
                            <video
                              controls
                              src={currentMedia.fileUrl}
                              className="object-fill rounded h-64"
                              poster={currentMedia.thumbnailUrl}
                              id={`${currentMedia.postId}-media-${currentMedia.fileUrl}`}
                            />
                          )}
                        </div>

                        {post.mediaFiles.length > 1 && (
                          <>
                            <button
                              onClick={() =>
                                handleMediaChange(post.postId, 'prev', post.mediaFiles.length)
                              }
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-base-300 bg-opacity-60 hover:bg-opacity-90 text-base-content p-2 rounded-full transition-opacity opacity-0 group-hover:opacity-100"
                              aria-label="Previous media"
                            >
                              ❮
                            </button>
                            <button
                              onClick={() =>
                                handleMediaChange(post.postId, 'next', post.mediaFiles.length)
                              }
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-base-300 bg-opacity-60 hover:bg-opacity-90 text-base-content p-2 rounded-full transition-opacity opacity-0 group-hover:opacity-100"
                              aria-label="Next media"
                            >
                              ❯
                            </button>
                          </>
                        )}
                      </div>
                    </Link>
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
