"use client";

import React, { useEffect, useState } from "react";
import { usePostStore } from "@/app/stores/post/postStore";
import { StaggeredGrid, StaggeredGridItem } from "react-staggered-grid";
import withAuth from "../components/withAuth";
import { useOtherUserStore } from "../stores/user/otherUserStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useShallow } from "zustand/shallow";

const Posts = () => {
  const router = useRouter();
  const posts = usePostStore(useShallow((state) => state.posts));
  const listenPostChanges = usePostStore(
    useShallow((state) => state.listenPostChanges)
  );
  const [mediaIndexes, setMediaIndexes] = useState<Record<string, number>>({});
  const otherUsers = useOtherUserStore(useShallow((state) => state.otherUsers));

  useEffect(() => {
    const unsubscribe = listenPostChanges();
    return () => unsubscribe();
  }, []);

  const handleMediaChange = (
    postId: string,
    direction: "prev" | "next",
    total: number
  ) => {
    setMediaIndexes((prev) => {
      const current = prev[postId] || 0;
      const newIndex =
        direction === "next"
          ? (current + 1) % total
          : (current - 1 + total) % total;
      return { ...prev, [postId]: newIndex };
    });
  };

  const handleAddPostClick = () => {
    router.push("/posts/add");
  };

  return (
    <div className="container mx-auto px-4 py-6 relative">
      {/* Add Post Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleAddPostClick}
          className="btn btn-primary btn-circle text-white text-2xl shadow-lg hover:scale-105 transition-transform"
          title="Add Post"
        >
          +
        </button>
      </div>

      {posts?.length === 0 ? (
        <div className="text-center text-gray-500 text-lg mt-10">
          No posts available.
        </div>
      ) : (
        <StaggeredGrid columns={4} columnWidth={300}>
          {posts?.map((post, index) => {
            const currentIndex = mediaIndexes[post.postId] || 0;
            const currentMedia = post.mediaFiles[currentIndex];
            const postUser = otherUsers?.find((u) => u.uid === post.userId);

            return (
              <StaggeredGridItem key={post.postId} index={index}>
                <div className="bg-white rounded-xl shadow-md p-4 m-4 transition-transform hover:scale-[1.01] duration-300">
                  {/* User Info */}
                  {postUser && (
                    <Link
                      href={`/profile/${postUser.uid}`}
                      className="flex items-center space-x-3 mb-3 group"
                    >
                      <img
                        src={
                          postUser.photoURL ??
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            postUser?.displayName ?? "User"
                          )}&rounded=true&background=0D8ABC&color=fff`
                        }
                        alt={postUser.displayName}
                        className="w-10 h-10 rounded-full object-cover border shadow-sm transition-all duration-200 group-hover:shadow-md"
                      />
                      <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                        {postUser.displayName}
                      </span>
                    </Link>
                  )}

                  {/* Media Display */}
                  {currentMedia && (
                    <div className="relative group">
                      {currentMedia.fileType === "image" ? (
                        <img
                          src={currentMedia.fileUrl}
                          alt={`media-${currentIndex}`}
                          className="w-full object-cover rounded max-h-[250px]"
                        />
                      ) : (
                        <video
                          controls
                          src={currentMedia.fileUrl}
                          className="w-full object-cover rounded max-h-[250px]"
                        />
                      )}

                      {post.mediaFiles.length > 1 && (
                        <>
                          <button
                            onClick={() =>
                              handleMediaChange(
                                post.postId,
                                "prev",
                                post.mediaFiles.length
                              )
                            }
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 hover:bg-opacity-80 text-white p-2 rounded-full transition-opacity opacity-0 group-hover:opacity-100"
                          >
                            ❮
                          </button>
                          <button
                            onClick={() =>
                              handleMediaChange(
                                post.postId,
                                "next",
                                post.mediaFiles.length
                              )
                            }
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 hover:bg-opacity-80 text-white p-2 rounded-full transition-opacity opacity-0 group-hover:opacity-100"
                          >
                            ❯
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {/* Post Content */}
                  {post.content && (
                    <p className="text-sm text-gray-800 leading-snug mt-3">
                      {post.content}
                    </p>
                  )}

                  {/* Hashtags */}
                  {post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {post.hashtags.map((hashtag, idx) => (
                        <span
                          key={`${hashtag}-${idx}`}
                          className="badge badge-outline badge-primary text-xs"
                        >
                          #{hashtag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Edited Tag */}
                  {post.isEdited && (
                    <div className="text-xs italic text-yellow-500 mt-2">
                      Edited Post
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

export default withAuth(Posts);
