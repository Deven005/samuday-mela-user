// utils/uploadProfileImage.ts

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebase.config";

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
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const maxWidth = 200;
      const scale = maxWidth / img.width;

      canvas.width = maxWidth;
      canvas.height = img.height * scale;

      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject("Failed to create thumbnail");
        },
        "image/jpeg",
        0.7
      );
    };

    reader.readAsDataURL(file);
  });
};

export const uploadProfileImage = async (
  file: File,
  uid: string
): Promise<UploadedProfileImage> => {
  const ext = file.name.split(".").pop();
  const filePath = `Users/${uid}/profileImages/${uid}.${ext}`;
  const fileRef = ref(storage, filePath);

  // Upload main image
  await uploadBytes(fileRef, file);
  const fileUrl = await getDownloadURL(fileRef);

  // Upload thumbnail
  const thumbnailBlob = await generateThumbnail(file);
  const thumbPath = `Users/${uid}/profileImages/thumbnails/${uid}.jpg`;
  const thumbRef = ref(storage, thumbPath);

  await uploadBytes(thumbRef, thumbnailBlob);
  const thumbnailUrl = await getDownloadURL(thumbRef);

  return {
    fileUrl,
    thumbnailUrl,
    storagePath: filePath,
  };
};
