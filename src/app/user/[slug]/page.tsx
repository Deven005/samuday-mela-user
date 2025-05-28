import { getUserDataSlug } from '@/app/utils/utils';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { formatLocalDate } from '@/app/utils/utils';
import { getPostsByUserId, type MediaFile, type PostDetailsProps } from '@/app/utils/post/post';
import { Metadata } from 'next';

export const revalidate = 60; // ISR every 60s

// 🧠 SEO Metadata for each user profile
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const userData = await getUserDataSlug((await params).slug);
    return {
      title: `${userData.displayName} | User Profile`,
      description: userData.story || `${userData.displayName}'s profile and public posts.`,
      openGraph: {
        title: `${userData.displayName} | User Profile`,
        description: userData.story || `${userData.displayName}'s profile and posts.`,
        images: [{ url: userData.photoURL, width: 600, height: 600 }],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${userData.displayName} | User Profile`,
        description: userData.story || `${userData.displayName}'s profile and posts.`,
        images: [userData.photoURL],
      },
    };
  } catch {
    return {
      title: 'User Not Found',
      description: 'The user you are looking for does not exist.',
    };
  }
}

const UserPublicProfile = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;

  let userData;
  let userPosts: PostDetailsProps[] = [];

  try {
    userData = await getUserDataSlug(slug);
    userPosts = await getPostsByUserId(userData.uid); // assumes your util returns public posts
  } catch (error) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      {/* Profile Card */}
      <div className="card bg-base-100 shadow-lg mb-6 p-6">
        <div className="flex items-center gap-6">
          <Image
            src={userData.photoURL}
            alt="User Avatar"
            width={80}
            height={80}
            className="rounded-full border-2 border-primary"
          />
          <div>
            <h1 className="text-base-content text-2xl font-bold">{userData.displayName}</h1>
            <p className="text-base-content text-sm">{userData.vibe || 'No vibe set.'}</p>
            <p className="text-base-content text-sm">{userData.story || 'No story provided.'}</p>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-base-content">Posts</h2>
        {userPosts.length === 0 ? (
          <p className="text-base-content">No posts yet.</p>
        ) : (
          <div className="space-y-8">
            {userPosts.map((post) => (
              <div
                key={post.postId}
                className="bg-base-200 p-4 rounded-lg shadow transition hover:shadow-md"
              >
                <h3 className="text-lg font-bold text-base-content mb-2">{post.title}</h3>
                <p className="text-base-content opacity-90">{post.description}</p>
                <div className="flex gap-2 flex-wrap mt-2 mb-4">
                  {post.hashtags.map((tag, i) => (
                    <span key={i} className="badge badge-outline badge-accent">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Media */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                  {post.mediaFiles.map((media: MediaFile, idx: number) => (
                    <div key={idx} className="relative group overflow-hidden rounded bg-base-300">
                      {media.fileType.startsWith('image') ? (
                        <Image
                          src={media.fileUrl}
                          alt={media.originalFileName}
                          width={400}
                          height={250}
                          className="w-full h-48 object-fill"
                          fetchPriority="high"
                        />
                      ) : (
                        <video
                          controls
                          className="w-full h-48 object-fill"
                          poster={media.thumbnailUrl}
                        >
                          <source src={media.fileUrl} type={media.fileType} />
                        </video>
                      )}
                    </div>
                  ))}
                </div>

                <div className="text-sm text-base-content opacity-80">
                  Posted on {formatLocalDate(post.createdAt)}
                  {post.isEdited && <span className="ml-2 badge badge-info">Edited</span>}
                  {!post.isVisible && <span className="ml-2 badge badge-warning">Hidden</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPublicProfile;
