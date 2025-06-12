'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import InputField from '@/app/components/Input/InputField';
import TextAreaField from '@/app/components/Input/TextAreaField';
import { usePostStore } from '@/app/stores/post/postStore';
import { useShallow } from 'zustand/shallow';
import { Button } from '@/app/components/Button/Button';
import { formatHumanFileSize } from '@/app/utils/uploadFiles';

export const metadata = {
  title: 'Add Post | Samuday Mela',
};

const AddPostPage = () => {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const { addPost, loading, uploading, setLoading, uploadProgress } = usePostStore(
    useShallow((state) => state),
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setMediaFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleTags = (value: string) => {
    const list = value
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag);
    setHashtags(list);
  };

  const removeFile = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      await addPost({ title, description, hashtags, mediaFiles }, () => {
        router.push('/posts');
      });
    } catch (error) {
      console.log('');
    }
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-base-200 py-10 px-4 md:px-8">
      {uploading && loading ? (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-base-100 bg-opacity-90">
          <div className="w-[90%] max-w-lg text-center p-6 bg-base-200 shadow-xl rounded-box space-y-4">
            <h2 className="text-2xl font-bold text-primary">Uploading...</h2>

            {/* Optional file preview */}
            {/* {thumbnailUrl && (
              <div className="flex justify-center">
                <img
                  src={thumbnailUrl}
                  alt="Uploading preview"
                  className="w-20 h-20 rounded-lg object-cover border border-base-300"
                />
              </div>
            )} */}

            <progress
              className="progress progress-primary w-full h-4"
              value={uploadProgress?.percentage ?? 0}
              max="100"
            ></progress>

            <p className="text-lg font-medium text-base-content">
              {uploadProgress?.percentage.toFixed(1)}% uploaded
            </p>
            <p className="text-sm text-base-content">
              {formatHumanFileSize(uploadProgress?.uploadedSize ?? 0)} /{' '}
              {formatHumanFileSize(uploadProgress?.totalSize ?? 0)}
            </p>

            <p className="text-sm text-base-content opacity-80 mt-1">
              Uploading: <span className="font-medium">{uploadProgress?.currentFileName}</span>
            </p>

            {/* Cancel button */}
            {/* {onCancel && (
              <button onClick={onCancel} className="btn btn-sm btn-error mt-4">
                Cancel Upload
              </button>
            )} */}
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto bg-base-100 border border-base-300 shadow-xl rounded-xl p-6 md:p-10 transition-all duration-300 hover:shadow-2xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-primary">
            ✨ Add New Post
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <InputField
              type="text"
              label="Title"
              placeholder="Give your post a title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              id="post_title"
            />

            {/* Description */}
            <TextAreaField
              placeholder="What's on your mind?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              id="post_description"
              label="Description"
            />

            {/* Tags */}
            {/* Tags */}
            <InputField
              type="text"
              label=" Tags (comma-separated)"
              placeholder="e.g. coding, photography"
              id="post_tag"
              value={hashtags.join(',')}
              onChange={(e) => handleTags(e.target.value)}
              required
              // className="input input-bordered w-full"
            />

            {/* Media Upload */}
            <div className="transition duration-200 hover:scale-105 text-base-content">
              <label className="label">
                <span className="label-text font-semibold">Upload Images / Videos</span>
              </label>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                className="file-input file-input-bordered w-full"
                onChange={handleFileChange}
              />
              {mediaFiles.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {mediaFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="relative group rounded overflow-hidden border border-base-300 shadow hover:shadow-md transition"
                    >
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                        title="Remove"
                      >
                        ✕
                      </button>
                      {file.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`preview-${idx}`}
                          className="object-cover w-full h-32 rounded"
                        />
                      ) : (
                        <video
                          src={URL.createObjectURL(file)}
                          controls
                          className="object-cover w-full h-32 rounded"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={loading}
                className={`btn w-full gap-2 text-lg tracking-wide shadow-md hover:shadow-lg transition ${
                  loading ? 'btn-disabled' : 'transition-colors'
                }`}
              >
                🚀 Publish Post
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddPostPage;
