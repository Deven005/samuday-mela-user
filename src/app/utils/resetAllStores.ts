// utils/resetAllStores.ts
import { useUserStore } from '@/app/stores/user/userStore';
import { usePostStore } from '@/app/stores/post/postStore'; // Add other stores as needed
import { useOtherUserStore } from '../stores/user/otherUserStore';

export const resetAllStores = () => {
  useUserStore.getState().reset();
  usePostStore.getState().reset();
  useOtherUserStore.getState().reset();
  // Add more store resets here

  localStorage.clear();
};
