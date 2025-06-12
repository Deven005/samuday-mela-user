'use client';
import { useUserStore } from '@/app/stores/user/userStore';
import { Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import InputField from '@/app/components/Input/InputField';
import TextAreaField from '@/app/components/Input/TextAreaField';
import { Button } from '@/app/components/Button/Button';
import { showCustomToast } from '@/app/components/showCustomToast';

export const metadata = {
  title: 'Edit User Profile | Samuday Mela',
};

const EditProfile = () => {
  // const user = useUserStore(useShallow((state) => state.user));
  const { user, updateUser } = useUserStore((state) => state);
  const router = useRouter();

  const [editedUser, setEditedUser] = useState({
    uid: user?.uid || '',
    photoURL: user?.photoURL || '',
    displayName: user?.displayName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || '',
    hobbies: user?.hobbies && user.hobbies.length > 0 ? user?.hobbies : [],
    story: user?.story || '',
    currentOccupation: user?.currentOccupation || '',
    vibe: user?.vibe || '',
    emailVerified: user?.emailVerified ?? false,
    // occupationHistory: user?.occupationHistory || {
    //   occupation: '',
    //   occupationUpdatedAt: Timestamp.now(),
    // },
    providerData: user?.providerData || [],
    createdAt: user?.createdAt ?? Timestamp.now(),
    updatedAt: Timestamp.now(),
    preferredLanguage: user?.preferredLanguage ?? 'hi',
  });

  useEffect(() => {
    if (user) {
      setEditedUser({
        ...editedUser,
        uid: user.uid,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        hobbies: user?.hobbies && user.hobbies.length > 0 ? user?.hobbies : [],
        story: user.story || '',
        currentOccupation: user.currentOccupation || '',
        vibe: user.vibe || '',
        emailVerified: user.emailVerified ?? false,
        // occupationHistory: user.occupationHistory || {
        //   occupation: '',
        //   occupationUpdatedAt: Timestamp.now(),
        // },
        providerData: user.providerData || [],
        createdAt: user.createdAt ?? Timestamp.now(),
        updatedAt: Timestamp.now(),
        preferredLanguage: user.preferredLanguage ?? 'hi',
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      const updatedUser = {
        ...user,
        ...editedUser,
        hobbies: editedUser.hobbies
          // .split(',')
          .map((h) => h.trim())
          .filter(Boolean),
        updatedAt: Timestamp.now(),
      };

      if (!isEqualExceptUpdatedAt(user, updatedUser)) {
        await updateUser(updatedUser);
        showCustomToast({
          title: 'Profile Update',
          message: 'Profile is updated successfully!',
          type: 'success',
        });
      }
      router.back();
      router.refresh();
    } catch (error) {
      showCustomToast({
        title: 'Profile Update',
        message: 'Profile is not updated!',
        type: 'error',
      });
    }
  };

  // Function to deeply compare 2 objects (excluding updatedAt)
  function isEqualExceptUpdatedAt(a: any, b: any): boolean {
    const { updatedAt: _, ...aWithoutUpdatedAt } = a;
    const { updatedAt: __, ...bWithoutUpdatedAt } = b;
    return JSON.stringify(aWithoutUpdatedAt) === JSON.stringify(bWithoutUpdatedAt);
  }

  const handleCancel = () => router.replace('/profile');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;

    if (id === 'hobbies') {
      setEditedUser((prev) => ({
        ...prev,
        hobbies: e.target.value.split(',').map((h: string) => h.trim()),
      }));
    } else {
      setEditedUser((prev) => ({ ...prev, [id]: value }));
    }
  };

  return (
    <div className="bg-base-100 min-h-screen flex justify-center items-center p-6">
      <div className="card w-full max-w-lg md:max-w-xl lg:max-w-2xl shadow-xl p-8 rounded-lg">
        {/* Profile Image Section */}
        <div className="flex flex-col items-center">
          <div className="relative w-28 h-28">
            <Image
              src={
                editedUser.photoURL ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  editedUser.displayName || 'User',
                )}&rounded=true&background=0D8ABC&color=fff`
              }
              alt="Profile"
              width={112}
              height={112}
              className="rounded-full object-cover ring-2 ring-primary shadow-md transition duration-200 hover:scale-110"
            />
          </div>
          {/* <h2 className="text-2xl font-bold mt-4">{editedUser.displayName}</h2> */}
          <p className="text-base-content text-2xl font-bold mt-4">{editedUser.email}</p>
        </div>

        {/* Profile Edit Form */}
        <div className="mt-3 grid grid-cols-1 gap-1">
          <InputField
            label="Display Name"
            id="displayName"
            value={editedUser.displayName}
            onChange={handleChange}
            type="text"
            // className="input input-bordered w-full"
            placeholder="Your Name"
          />

          <InputField
            id="phoneNumber"
            value={editedUser.phoneNumber}
            onChange={handleChange}
            label="Phone Number"
            required
            // className="input input-bordered w-full"
            placeholder="Phone"
          />

          <TextAreaField
            id="address"
            label="Address"
            value={editedUser.address}
            onChange={handleChange}
            // className="input input-bordered w-full"
            placeholder="Address"
          />

          <InputField
            id="hobbies"
            label="Hobbies (comma separated)"
            placeholder="Hobbies (comma-separated)"
            value={(editedUser?.hobbies ?? []).join(',')}
            onChange={handleChange}
            required
          />

          <TextAreaField
            id="story"
            label="Story"
            value={editedUser.story}
            onChange={handleChange}
            // className="textarea textarea-bordered w-full"
            placeholder="Share your journey"
          />

          <InputField
            id="currentOccupation"
            label="Current Occupation"
            value={editedUser.currentOccupation}
            onChange={handleChange}
            // className="input input-bordered w-full"
            placeholder="Occupation"
          />

          <InputField
            id="vibe"
            label="Vibe"
            value={editedUser.vibe}
            onChange={handleChange}
            // className="input input-bordered w-full"
            placeholder="Your vibe"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-6">
          <Button
            onClick={handleSave}
            className="btn btn-lg w-1/2 rounded-md shadow-md hover:shadow-2xl"
          >
            Save
          </Button>
          <Button
            onClick={handleCancel}
            className="btn btn-outline btn-lg w-1/2 rounded-md hover:bg-gray-200 ml-4 text-base-content hover:text-black"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
