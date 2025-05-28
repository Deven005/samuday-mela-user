import PostCard from '@/app/components/Post/PostCard';
import { getPostsByTag, getPostsMainEntity, PostDetailsProps } from '@/app/utils/post/post';
import { AppData, getAppData, getUserDataByUid, UserType } from '@/app/utils/utils';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

// app/hashtags/[tag]/page.tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  let postCount = 0;
  const tag = decodeURIComponent((await params).tag);

  let posts: PostDetailsProps[] = [];

  try {
    posts = await getPostsByTag(tag); // assumes your util returns public posts
    postCount = posts.length;
  } catch (error) {
    notFound();
  }

  const capitalizedTag = tag.charAt(0).toUpperCase() + tag.slice(1);

  return {
    title: `#${capitalizedTag} - Explore ${postCount} Posts`,
    description: `Browse ${postCount} posts tagged with #${capitalizedTag} on our platform.`,
    openGraph: {
      title: `#${capitalizedTag}`,
      description: `Discover ${postCount} posts tagged with #${capitalizedTag}`,
      url: `https://samuday-mela-user.vercel.app/hashtags/${tag}`,
      images: [
        {
          url: `https://samuday-mela-user.vercel.app/api/og?tag=${tag}`, // Dynamic OG image if you support it
          width: 1200,
          height: 630,
          alt: `Posts tagged with #${capitalizedTag}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `#${capitalizedTag}`,
      description: `Discover ${postCount} posts tagged with #${capitalizedTag}`,
      images: [`https://samuday-mela-user.vercel.app/og?tag=${tag}`],
    },
  };
}

const PostsByTags = async ({ params }: { params: Promise<{ tag: string }> }) => {
  const tag = decodeURIComponent((await params).tag);
  const capitalizedTag = tag.charAt(0).toUpperCase() + tag.slice(1);

  let posts: PostDetailsProps[] = [];
  let postCount = 0;
  let appData: AppData;

  try {
    appData = await getAppData();
    posts = await getPostsByTag(tag); // assumes your util returns public posts
    postCount = posts.length;
  } catch (error) {
    notFound();
  }
  const mainEntity = await getPostsMainEntity(posts);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `#${capitalizedTag}`,
    description: `Discover ${postCount} posts tagged with #${capitalizedTag}`,
    url: `https://samuday-mela-user.vercel.app/hashtags/${tag}`,
    mainEntity,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://samuday-mela-user.vercel.app/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: `Hashtags`,
          item: 'https://samuday-mela-user.vercel.app/hashtags',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: `#${capitalizedTag}`,
          item: `https://samuday-mela-user.vercel.app/hashtags/${tag}`,
        },
      ],
    },
    publisher: {
      '@type': 'Organization',
      name: 'Samuday Mela',
      url: 'https://samuday-mela-user.vercel.app',
      logo: {
        '@type': 'ImageObject',
        url: appData.logoUrl,
      },
    },
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {posts.map((post) => (
        <PostCard key={post.postId} post={post} />
      ))}
    </div>
  );
};

export default PostsByTags;
