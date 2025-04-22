"use client";
import React, { useState, useRef } from "react";
import { useUserStore } from "../stores/user/userStore";
import { useShallow } from "zustand/shallow";
import withAuth from "../components/withAuth";
import { usePostStore } from "../stores/post/postStore";
import { useOtherUserStore } from "../stores/user/otherUserStore";
import { StaggeredGrid, StaggeredGridItem } from "react-staggered-grid";
import Link from "next/link";
import Image from "next/image";
import { Button } from "../components/Button/Button";

const UserProfile = () => {
  const user = useUserStore(useShallow((state) => state.user));
  const posts = usePostStore(useShallow((state) => state.posts));
  const updateUserProfilePic = useUserStore(
    (state) => state.updateUserProfilePic
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  // const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mediaIndexes, setMediaIndexes] = useState<Record<string, number>>({});
  const otherUsers = useOtherUserStore(useShallow((state) => state.otherUsers));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;

    setUploading(true);
    try {
      await updateUserProfilePic(user, file);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const profileImage = user?.photoURL
    ? user.photoURL
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user?.displayName || "User"
      )}&rounded=true`;

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

  return !user ? (
    <div className="min-h-screen flex justify-center items-center">
      <p>Please sign in to view your profile.</p>
    </div>
  ) : (
    <div className="min-h bg-base-100 p-4">
      <div className="mx-10 space-y-6">
        {/* Profile Section */}
        <div className="card bg-white shadow-lg rounded-lg flex justify-center items-center">
          <div className="flex items-center gap-6 mb-4">
            <div className="relative transition duration-200 hover:scale-105 cursor-pointer">
              {uploading ? (
                <div className="skeleton w-20 h-20 rounded-full" />
              ) : (
                <Image
                  loading="eager"
                  height={100}
                  width={100}
                  src={profileImage}
                  className="w-20 h-20 rounded-full object-cover border-2 border-primary"
                  alt="Profile"
                />
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 btn btn-xs btn-primary"
              >
                Edit
              </button>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user.displayName}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="text-sm space-y-1">
            <p>
              <strong>Phone:</strong> {user.phoneNumber || "N/A"}
            </p>
            <p>
              <strong>Address:</strong> {user.address || "N/A"}
            </p>
            <p>
              <strong>Hobbies:</strong> {user.hobbies.join(", ") || "N/A"}
            </p>
            <p>
              <strong>Story:</strong> {user.story || "N/A"}
            </p>
            <p>
              <strong>Occupation:</strong> {user.currentOccupation || "N/A"}
            </p>
            <p>
              <strong>Vibe:</strong> {user.vibe || "N/A"}
            </p>
            <Link href="/profile/edit">
              <div className="mt-3 mb-3">
                <Button
                  variant="primary"
                  className="btn btn-primary transition duration-200 hover:scale-105 cursor-pointer"
                >
                  Edit Profile
                </Button>
              </div>
            </Link>
          </div>
        </div>

        {/* My Posts Section */}
        <div className="card bg-white shadow-md rounded-lg ">
          <h3 className="text-xl font-semibold mb-4">My Posts</h3>
          {posts?.filter((post) => post.userId == user.uid).length === 0 ? (
            <p className="text-gray-500">You haven't posted anything yet.</p>
          ) : (
            <div className="">
              <StaggeredGrid columns={4} columnWidth={300}>
                {posts
                  ?.filter((post) => post.userId == user.uid)
                  .map((post, index) => {
                    const currentIndex = mediaIndexes[post.postId] || 0;
                    const currentMedia = post.mediaFiles[currentIndex];
                    const postUser = otherUsers?.find(
                      (u) => u.uid === post.userId
                    ); // Make sure `otherUsers` exists

                    return (
                      <StaggeredGridItem key={post.postId} index={index}>
                        <div className="bg-white rounded-xl shadow-md p-4 m-4 transition-transform hover:scale-[1.01] duration-300">
                          {/* --- USER PROFILE HEADING --- */}
                          {postUser && (
                            <Link
                              href={`/profile/${postUser.uid}`}
                              className="flex items-center space-x-3 mb-3 group"
                            >
                              <Image
                                loading="eager"
                                height={100}
                                width={100}
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
                          {/* Media Section */}
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

                              {/* Arrows (Only if multiple) */}
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

                          {/* Content */}
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

                          {/* Edited Badge */}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default withAuth(UserProfile);
