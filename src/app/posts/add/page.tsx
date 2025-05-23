'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import InputField from '@/app/components/Input/InputField';
import TextAreaField from '@/app/components/Input/TextAreaField';

const AddPostPage = () => {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);

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
    setTags(list);
  };

  const removeFile = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      title,
      description,
      tags,
      mediaFiles,
    });
    router.push('/posts');
  };

  return (
    <div className="min-h-screen bg-base-200 py-10 px-4 md:px-8">
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
            value={tags.join(',')}
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
            <button
              type="submit"
              className="btn btn-primary w-full text-lg tracking-wide shadow-md hover:shadow-lg transition"
            >
              🚀 Publish Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPostPage;
