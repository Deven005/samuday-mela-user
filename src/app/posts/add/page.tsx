"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import InputField from "@/app/components/Input/InputField";
import TextAreaField from "@/app/components/Input/TextAreaField";

const AddPostPage = () => {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);
    setTags(list);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Upload to Firestore/Storage
    console.log({
      title,
      description,
      tags,
      mediaFiles,
    });
    router.push("/posts");
  };

  return (
    <div className="min-h-screen bg-base-200 py-8 px-4 md:px-8">
      <div className="max-w-3xl mx-auto bg-base-100 shadow-lg rounded-lg p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">
          Add New Post
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
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
          <InputField
            label=" Tags (comma-separated)"
            type="text"
            placeholder="e.g. coding, photography"
            onChange={(e) => handleTags(e.target.value)}
            id={"post_tag"}
            value={tags.join(",")}
          />

          {/* Media Upload */}
          <div>
            <label className="label">
              <span className="label-text font-semibold">
                Upload Images / Videos
              </span>
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
                  <div key={idx} className="rounded overflow-hidden">
                    {file.type.startsWith("image/") ? (
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
            <button type="submit" className="btn btn-primary w-full">
              Publish Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPostPage;
