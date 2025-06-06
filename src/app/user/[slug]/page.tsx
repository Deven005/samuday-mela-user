import { getUserDataSlug } from '@/app/utils/utils';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getPostsByUserId, getPostsMainEntity, type PostDetailsProps } from '@/app/utils/post/post';
import { Metadata } from 'next';
import PostCard from '@/app/components/Post/PostCard';

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

  const mainEntity = await getPostsMainEntity(userPosts);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${userData.displayName} | User Profile`,
    description: userData.story || `${userData.displayName}'s profile and public posts.`,
    url: userData.photoURL,
    mainEntity,
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
              <PostCard post={post} key={post.postId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPublicProfile;
