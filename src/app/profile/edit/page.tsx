"use client";

import { useUserStore } from "@/app/stores/user/userStore";
import { Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";
import Image from "next/image";
import { sendNotification } from "@/app/utils/getFCMToken";

const EditProfile = () => {
  const user = useUserStore(useShallow((state) => state.user));
  const updateUser = useUserStore((state) => state.updateUser);
  const router = useRouter();

  const [editedUser, setEditedUser] = useState({
    uid: user?.uid || "",
    photoURL: user?.photoURL || "",
    displayName: user?.displayName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    address: user?.address || "",
    hobbies: user?.hobbies.join(", ") || "",
    story: user?.story || "",
    currentOccupation: user?.currentOccupation || "",
    vibe: user?.vibe || "",
    emailVerified: user?.emailVerified ?? false,
    occupationHistory: user?.occupationHistory || {
      occupation: "",
      occupationUpdatedAt: Timestamp.now(),
    },
    providerData: user?.providerData || [],
    createdAt: user?.createdAt ?? Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  useEffect(() => {
    if (user) {
      setEditedUser({
        ...editedUser,
        uid: user.uid,
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
        hobbies: user.hobbies.join(", ") || "",
        story: user.story || "",
        currentOccupation: user.currentOccupation || "",
        vibe: user.vibe || "",
        emailVerified: user.emailVerified ?? false,
        occupationHistory: user.occupationHistory || {
          occupation: "",
          occupationUpdatedAt: Timestamp.now(),
        },
        providerData: user.providerData || [],
        createdAt: user.createdAt ?? Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }
  }, [user]);

  const handleSave = async () => {
    await updateUser({
      ...user,
      ...editedUser,
      hobbies: editedUser.hobbies.split(",").map((h) => h.trim()),
      updatedAt: Timestamp.now(),
    });
    user?.uid &&
      (await sendNotification({
        topic: user?.uid,
        title: "Profile is updated!",
        body: "Profile is updated successfully!",
      }));
    router.back();
    router.refresh();
  };

  const handleCancel = () => router.replace("/profile");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-base-100 min-h-screen flex justify-center items-center p-6">
      <div className="card w-full max-w-lg md:max-w-xl lg:max-w-2xl bg-white shadow-xl p-8 rounded-lg">
        {/* Profile Image Section */}
        <div className="flex flex-col items-center">
          <div className="relative w-28 h-28">
            <Image
              src={
                editedUser.photoURL ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  editedUser.displayName || "User"
                )}&rounded=true&background=0D8ABC&color=fff`
              }
              alt="Profile"
              width={112}
              height={112}
              className="rounded-full object-cover ring-2 ring-primary shadow-md transition duration-200 hover:scale-110"
            />
          </div>
          {/* <h2 className="text-2xl font-bold mt-4">{editedUser.displayName}</h2> */}
          <p className="text-gray-600 text-2xl font-bold mt-4">
            {editedUser.email}
          </p>
        </div>

        {/* Profile Edit Form */}
        <div className="mt-6 grid grid-cols-1 gap-4">
          <label className="label">
            <span className="label-text">Display Name</span>
            <input
              name="displayName"
              value={editedUser.displayName}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Your Name"
            />
          </label>

          <label className="label">
            <span className="label-text">Phone Number</span>
            <input
              name="phoneNumber"
              value={editedUser.phoneNumber}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Phone"
            />
          </label>

          <label className="label">
            <span className="label-text">Address</span>
            <input
              name="address"
              value={editedUser.address}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Address"
            />
          </label>

          <label className="label">
            <span className="label-text">Hobbies</span>
            <input
              name="hobbies"
              value={editedUser.hobbies}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Hobbies (comma-separated)"
            />
          </label>

          <label className="label">
            <span className="label-text">Your Story</span>
            <textarea
              name="story"
              value={editedUser.story}
              onChange={handleChange}
              className="textarea textarea-bordered w-full"
              placeholder="Share your journey"
            />
          </label>

          <label className="label">
            <span className="label-text">Occupation</span>
            <input
              name="currentOccupation"
              value={editedUser.currentOccupation}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Occupation"
            />
          </label>

          <label className="label">
            <span className="label-text">Vibe</span>
            <input
              name="vibe"
              value={editedUser.vibe}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Your vibe"
            />
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={handleSave}
            className="btn btn-primary btn-lg w-1/2 rounded-md shadow-md hover:shadow-lg"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="btn btn-outline btn-lg w-1/2 rounded-md hover:bg-gray-200 ml-4"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
