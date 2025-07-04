'use client';
import React, { useState, useRef } from 'react';
import { useUserStore } from '../stores/user/userStore';
import { useShallow } from 'zustand/shallow';
import { usePostStore } from '../stores/post/postStore';
import { useOtherUserStore } from '../stores/user/otherUserStore';
import { StaggeredGrid, StaggeredGridItem } from 'react-staggered-grid';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../components/Button/Button';
import LanguageSelector from '../components/languageSelector';

// export const metadata = {
//   title: 'User Profile | Samuday Mela',
// };

const UserProfile = () => {
  const { user, updateUserProfilePic, loadingProvider, unlinkUserProvider } = useUserStore(
    useShallow((state) => state),
  );
  const posts = usePostStore(useShallow((state) => state.posts));
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleUnlink = async (providerId: string) => await unlinkUserProvider(providerId);

  const handleMediaChange = (postId: string, direction: 'prev' | 'next', total: number) => {
    setMediaIndexes((prev) => {
      const current = prev[postId] || 0;
      const newIndex = direction === 'next' ? (current + 1) % total : (current - 1 + total) % total;
      return { ...prev, [postId]: newIndex };
    });
  };

  return !user ? (
    <div className="min-h-screen flex justify-center items-center text-base-content">
      <p>Please sign in to view your profile.</p>
    </div>
  ) : (
    <div className="min-h bg-base-200 p-4 text-base-content">
      <div className="mx-10 space-y-6">
        {/* Profile Section */}
        <div className="card dark:bg-base-800 shadow-lg rounded-lg flex justify-center items-center">
          <div className="flex items-center gap-6 mb-4">
            <div className="relative transition duration-200 hover:scale-105 cursor-pointer">
              {uploading ? (
                <div className="skeleton w-20 h-20 rounded-full" />
              ) : (
                <Image
                  loading="eager"
                  height={100}
                  width={100}
                  src={user.photoURL}
                  fetchPriority="high"
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
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 btn btn-xs btn-primary"
              >
                Edit
              </Button>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-base-content">{user.displayName}</h2>
              <p className="text-sm text-base-content">{user.email}</p>
            </div>
          </div>

          <div className="text-sm space-y-1">
            {user.phoneNumber && (
              <p>
                <strong className="text-base-content">Phone:</strong> {user.phoneNumber || 'N/A'}
              </p>
            )}
            <p>
              <strong className="text-base-content">Address:</strong> {user.address || 'N/A'}
            </p>
            {user.hobbies && user.hobbies.length > 0 && (
              <p>
                <strong className="text-base-content">Hobbies:</strong>{' '}
                {user.hobbies?.join(', ') || 'N/A'}
              </p>
            )}
            <p>
              <strong className="text-base-content">Story:</strong> {user.story || 'N/A'}
            </p>
            {user.currentOccupation && (
              <p>
                <strong className="text-base-content">Occupation:</strong>{' '}
                {user.currentOccupation || 'N/A'}
              </p>
            )}
            <p>
              <strong className="text-base-content">Vibe:</strong> {user.vibe || 'N/A'}
            </p>
            <LanguageSelector />
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-base-content mb-2">Linked Accounts</h3>
              <ul className="space-y-2">
                {user.providerData.length === 0 && (
                  <p className="text-sm text-base-content/70">No linked provider data found.</p>
                )}
                {user.providerData.map((provider, idx) => (
                  <div
                    key={provider.providerId + idx}
                    className="p-4 rounded-lg bg-base-200 shadow flex items-center gap-4"
                  >
                    {provider.photoURL ? (
                      <img
                        src={provider.photoURL}
                        alt={provider.displayName || 'Provider'}
                        className="w-12 h-12 rounded-full shadow-md"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-base-300 flex items-center justify-center text-sm">
                        ?
                      </div>
                    )}

                    <div className="flex-1">
                      <h4 className="font-semibold text-base-content">
                        {provider.displayName || 'Unnamed User'}
                      </h4>
                      <p className="text-sm text-base-content/70">{provider.email || 'No email'}</p>
                      <p className="text-xs text-base-content/50 capitalize">
                        Provider: {provider.providerId.replace('.com', '')}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="error"
                      className="btn btn-sm btn-error"
                      onClick={() => handleUnlink(provider.providerId)}
                      disabled={
                        user.providerData.length <= 1 || loadingProvider === provider.providerId
                      }
                    >
                      {loadingProvider === provider.providerId ? 'Unlinking...' : 'Unlink'}
                    </Button>
                  </div>
                ))}
              </ul>
            </div>
            <Link href="/profile/edit">
              <Button
                variant="primary"
                className="mt-3 mb-3 btn btn-primary transition duration-200 hover:scale-105 cursor-pointer"
              >
                Edit Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* My Posts Section */}
        <div className="card  dark:bg-base-800 shadow-md rounded-lg">
          <h3 className="text-xl font-semibold text-base-content mb-4">My Posts</h3>
          {posts?.filter((post) => post.userId === user.uid).length === 0 ? (
            <p className="text-gray-500">You haven't posted anything yet.</p>
          ) : (
            <div className="space-y-4">
              <StaggeredGrid columns={4} columnWidth={300}>
                {posts
                  ?.filter((post) => post.userId === user.uid)
                  .map((post, index) => {
                    const currentIndex = mediaIndexes[post.postId] || 0;
                    const currentMedia = post.mediaFiles[currentIndex];
                    const postUser = otherUsers?.find((u) => u.uid === post.userId);

                    return (
                      <StaggeredGridItem key={post.postId} index={index}>
                        <div className=" dark:bg-base-800 rounded-xl shadow-md p-4 m-4 transition-transform hover:scale-[1.01] duration-300">
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
                                    postUser?.displayName ?? 'User',
                                  )}&rounded=true&background=0D8ABC&color=fff`
                                }
                                alt={postUser.displayName}
                                className="w-10 h-10 rounded-full object-cover border shadow-sm transition-all duration-200 group-hover:shadow-md"
                              />
                              <span className="text-sm font-semibold text-base-content  group-hover:text-blue-600 transition-colors duration-200">
                                {postUser.displayName}
                              </span>
                            </Link>
                          )}
                          {/* Media Section */}
                          {currentMedia && (
                            <div className="relative group">
                              {currentMedia.fileType === 'image' ? (
                                <Image
                                  src={currentMedia.fileUrl}
                                  alt={`media-${currentIndex}`}
                                  className="w-full object-cover rounded max-h-[250px]"
                                />
                              ) : (
                                <video
                                  controls
                                  src={currentMedia.fileUrl}
                                  className="w-full object-cover rounded max-h-[250px]"
                                  poster={currentMedia.thumbnailUrl}
                                />
                              )}

                              {/* Arrows (Only if multiple) */}
                              {post.mediaFiles.length > 1 && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleMediaChange(post.postId, 'prev', post.mediaFiles.length)
                                    }
                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 hover:bg-opacity-80 text-white p-2 rounded-full transition-opacity opacity-0 group-hover:opacity-100"
                                  >
                                    ❮
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleMediaChange(post.postId, 'next', post.mediaFiles.length)
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
                          {post.description && (
                            <p className="text-sm text-base-content leading-snug mt-3">
                              {post.description}
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
                            <div className="text-xs italic text-yellow-500 mt-2">Edited Post</div>
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

export default UserProfile;
