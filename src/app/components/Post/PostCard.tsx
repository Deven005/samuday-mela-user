import { MediaFile, PostDetailsProps } from '@/app/utils/post/post';
import { formatLocalDate } from '@/app/utils/utils';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface PostCardType {
  post: PostDetailsProps;
}

const PostCard = ({ post }: PostCardType) => {
  return (
    <div
      key={`${post.postId}-${post.postSlug}`}
      className="bg-base-200 p-4 rounded-lg shadow transition hover:shadow-md"
    >
      <h3 className="text-lg font-bold text-base-content mb-2">{post.title}</h3>
      <p className="text-base-content opacity-90">{post.description}</p>
      <div className="flex gap-2 flex-wrap mt-2 mb-4">
        {post.hashtags.map((tag, i) => (
          <Link href={`/hashtags/${tag}`} key={i}>
            <span className="badge badge-outline badge-accent">#{tag}</span>
          </Link>
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
              <video controls className="w-full h-48 object-fill" poster={media.thumbnailUrl}>
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
  );
};

export default PostCard;
