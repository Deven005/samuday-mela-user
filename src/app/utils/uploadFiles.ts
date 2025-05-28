// utils/uploadProfileImage.ts

import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../config/firebase.config';
import { Timestamp } from 'firebase/firestore';

export interface UploadedProfileImage {
  fileUrl: string;
  thumbnailUrl: string;
  storagePath: string;
}

// Generate thumbnail using canvas
const generateThumbnail = async (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      if (!e.target?.result) return;
      img.src = e.target.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const maxWidth = 200;
      const scale = maxWidth / img.width;

      canvas.width = maxWidth;
      canvas.height = img.height * scale;

      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject('Failed to create thumbnail');
        },
        'image/jpeg',
        0.7,
      );
    };

    reader.readAsDataURL(file);
  });
};

export const uploadProfileImage = async (
  file: File,
  uid: string,
): Promise<UploadedProfileImage> => {
  const ext = file.name.split('.').pop();
  const filePath = `Users/${uid}/profileImages/${uid}.${ext}`;
  const fileRef = ref(storage, filePath);

  // Upload main image
  await uploadBytesResumable(fileRef, file);
  const fileUrl = await getDownloadURL(fileRef);

  // Upload thumbnail
  const thumbnailBlob = await generateThumbnail(file);
  const thumbPath = `Users/${uid}/profileImages/thumbnails/${uid}.jpg`;
  const thumbRef = ref(storage, thumbPath);

  await uploadBytesResumable(thumbRef, thumbnailBlob);
  const thumbnailUrl = await getDownloadURL(thumbRef);

  return {
    fileUrl,
    thumbnailUrl,
    storagePath: filePath,
  };
};

type UploadResult = {
  fileUrl: string;
  thumbnailUrl: string;
  storagePath: string;
  originalFileName: string;
  fileType: string;
};

export interface UploadProgress {
  totalSize: number;
  uploadedSize: number;
  percentage: number;
  currentFileName: string;
}

export const uploadFilesWithThumbnails = async (
  files: File[],
  folderPath: string,
  identifier: string,
  onProgress?: (progress: UploadProgress) => void,
): Promise<UploadResult[]> => {
  const cleanId = identifier.replace(/\W/g, '');
  const timestamp = Timestamp.now();
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  let uploadedBytes = 0;

  const uploadSingleFile = async (file: File, index: number): Promise<UploadResult> => {
    const ext = file.name.split('.').pop();
    const filename = `${timestamp}-${cleanId}-${index}.${ext}`;
    const filePath = `${folderPath}/${filename}`;
    const fileRef = ref(storage, filePath);

    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(fileRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const uploadedSoFar = uploadedBytes + snapshot.bytesTransferred;

          if (onProgress) {
            onProgress({
              totalSize,
              uploadedSize: uploadedSoFar,
              percentage: (uploadedSoFar / totalSize) * 100,
              currentFileName: file.name,
            });
          }
        },
        (error) => reject(error),
        async () => {
          uploadedBytes += file.size;
          const fileUrl = await getDownloadURL(uploadTask.snapshot.ref);

          // Generate thumbnail
          const isImage = file.type.startsWith('image');
          const isVideo = file.type.startsWith('video');

          let thumbnailBlob: Blob;
          if (isImage) {
            thumbnailBlob = await generateImageThumbnail(file);
          } else if (isVideo) {
            thumbnailBlob = await generateVideoThumbnail(file);
          } else {
            throw new Error(`Unsupported file type for thumbnail: ${file.type}`);
          }

          const thumbPath = `${folderPath}/thumbnails/${timestamp}-${cleanId}-${index}.jpg`;
          const thumbRef = ref(storage, thumbPath);
          const thumbUploadTask = uploadBytesResumable(thumbRef, thumbnailBlob);

          thumbUploadTask.on(
            'state_changed',
            (snapshot) => {
              const uploadedSoFar = uploadedBytes + snapshot.bytesTransferred;

              if (onProgress) {
                onProgress({
                  totalSize,
                  uploadedSize: uploadedSoFar,
                  percentage: (uploadedSoFar / totalSize) * 100,
                  currentFileName: file.name,
                });
              }
            },
            (error) => reject(error),
            async () => {
              const thumbnailUrl = await getDownloadURL(thumbRef);
              uploadedBytes += thumbnailBlob.size;

              resolve({
                fileUrl,
                thumbnailUrl,
                storagePath: filePath,
                originalFileName: file.name,
                fileType: file.type,
              });
            },
          );
        },
      );
    });
  };

  const results = await Promise.all(files.map((file, index) => uploadSingleFile(file, index)));
  return results;
};

export const generateImageThumbnail = async (file: File): Promise<Blob> => {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const reader = new FileReader();
    reader.onload = () => {
      if (!reader.result) return;
      img.src = reader.result.toString();
    };

    img.onload = () => {
      const maxSize = 300;
      const scale = Math.min(maxSize / img.width, maxSize / img.height);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.75);
    };

    reader.readAsDataURL(file);
  });
};

export const generateVideoThumbnail = (file: File, seekTo = 3): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.crossOrigin = 'anonymous';

    const fileURL = URL.createObjectURL(file);
    video.src = fileURL;

    video.onloadedmetadata = () => {
      if (video.duration < seekTo) {
        seekTo = 0; // fallback if video too short
      }
      video.currentTime = seekTo;
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
            URL.revokeObjectURL(fileURL); // clean up
          } else {
            reject(new Error('Could not convert canvas to blob'));
          }
        },
        'image/jpeg',
        0.8,
      );
    };

    video.onerror = (e) => {
      reject(new Error('Error loading video file'));
    };
  });
};

// 4. Fully human readable (KB, MB, GB, TB)
export const formatHumanFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(2)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(2)} MB`;
  const gb = mb / 1024;
  if (gb < 1024) return `${gb.toFixed(2)} GB`;
  return `${(gb / 1024).toFixed(2)} TB`;
};
