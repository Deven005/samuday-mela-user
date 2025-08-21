import { getPostSlug, MediaFile, PostDetailsProps } from '@/app/utils/post/post';
import { formatLocalDate, getUserDataByUid } from '@/app/utils/utils';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export const revalidate = 60; // ISR: Cache every 60s

const PostBySlug = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;

  let post: PostDetailsProps, user;

  try {
    post = await getPostSlug(slug);
    if (!post.isVisible) throw { message: 'No post to show!' };
    
    user = await getUserDataByUid(post.userId);
  } catch (error) {
    notFound();
  }
  return (
    <div className="max-w-4xl mx-auto p-6 bg-base-100 rounded-lg shadow-md m-4">
      <h1 className="text-2xl font-bold text-base-content mb-2">{post.title}</h1>
      <p className="text-base-content opacity-80 mb-4">{post.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {post.hashtags &&
          post.hashtags.map((tag: string, idx: number) => (
            <span key={idx} className="badge badge-outline badge-primary">
              #{tag}
            </span>
          ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {post.mediaFiles &&
          post.mediaFiles.map((media: MediaFile, idx: number) => (
            <div key={idx} className="relative group rounded overflow-hidden bg-base-200 shadow-sm">
              {media.fileType.startsWith('image') ? (
                <Image
                  src={media.thumbnailUrl || media.fileUrl}
                  alt={media.originalFileName}
                  width={300}
                  height={200}
                  className="w-full h-48 object-fill"
                />
              ) : media.fileType.startsWith('video') ? (
                <video controls className="w-full h-48 object-cover" poster={media.thumbnailUrl}>
                  <source src={media.fileUrl} type={media.fileType} />
                </video>
              ) : null}
            </div>
          ))}
      </div>

      <div className="bg-base-200 p-4 rounded-lg text-sm text-base-content">
        {/* <p>
          <strong>User ID:</strong> {post.userId}
        </p> */}
        <p>
          <strong>Created At:</strong> {formatLocalDate(post.createdAt)}
        </p>
        <p>
          <strong>Updated At:</strong> {formatLocalDate(post.updatedAt)}
        </p>
        <p>
          <strong>Posted By:</strong> {user?.displayName}
        </p>
        {/* <p>
          <strong>Edited:</strong> {post.isEdited ? 'Yes' : 'No'}
        </p>
        <p>
          <strong>Private:</strong> {post.isPrivate ? 'Yes' : 'No'}
        </p>
        <p>
          <strong>Visible:</strong> {post.isVisible ? 'Yes' : 'No'}
        </p> */}
      </div>
    </div>
  );
};

export default PostBySlug;
