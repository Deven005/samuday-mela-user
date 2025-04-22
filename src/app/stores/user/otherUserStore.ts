import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { auth, firestore } from "../../config/firebase.config";
import {
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { uploadProfileImage } from "../../utils/uploadFiles";
import { resetAllStores } from "../../utils/resetAllStores";

// Define the types for User data and store
export interface OtherUser {
  displayName: string;
  uid: string;
  photoURL: string | null;
}

export interface OtherUsersState {
  _hasHydrated?: boolean;
  setHasHydrated: () => void;
  otherUsers: OtherUser[] | null;
  setOtherUsers: (otherUsers: OtherUser[]) => void;
  //   updateOtherUsers: (otherUsers: OtherUser[]) => Promise<void>;
  clearOtherUsers: () => void;
  fetchOtherUserData: (uids: string[]) => Promise<void>;
  //   listenToOtherUsers: (uids: string[]) => () => void;
  reset: () => void;
}

// Create the Zustand store with persistence using localStorage
export const useOtherUserStore = create<OtherUsersState>()(
  devtools(
    persist(
      (set, get) => ({
        // hydration check
        _hasHydrated: false,
        setHasHydrated: () => set({ _hasHydrated: true }),
        otherUsers: [],
        setOtherUsers: (otherUsers) => set({ otherUsers }),
        clearUser: () => set({ otherUsers: null, _hasHydrated: true }),
        // updateOtherUsers: async (otherUsers: OtherUser[]) => {},
        // Fetch user data from Firestore and update the store
        fetchOtherUserData: async (uids: string[]) => {
          // Filter out uids from allUids that already exist in userList
          try {
            if (uids.length == 0) return;
            const uniqueUids = uids.filter(
              (uid) =>
                !new Set((get().otherUsers ?? []).map((user) => user.uid)).has(
                  uid
                )
            );
            if (uniqueUids.length == 0) return;
            const snapshot = await getDocs(
              query(
                collection(firestore, "Users"),
                where(documentId(), "in", uniqueUids)
              )
            );

            set({
              otherUsers: snapshot.docs.map((doc) => ({
                uid: doc.id,
                displayName: doc.data()["displayName"],
                photoURL: doc.data()["photoURL"],
              })),
            });
          } catch (err) {
            console.error("Error fetching other user's data:", err);
            throw err;
          }
        },
        // 👇 Real-time listener
        // listenToOtherUsers: (uids: string[]) => {
        //   const unsubscribe = onSnapshot(
        //     doc(firestore, "Users", uid),
        //     (userDoc) => {
        //       if (userDoc.exists()) {
        //         const userData = userDoc.data();
        //         set({
        //           user: {
        //             uid,
        //             email: userData.email || null,
        //             displayName: userData.displayName || "",
        //             emailVerified: userData.emailVerified || false,
        //             phoneNumber: userData.phoneNumber || "",
        //             address: userData.address || "",
        //             hobbies: userData.hobbies || [],
        //             story: userData.story || "",
        //             currentOccupation: userData.currentOccupation || "",
        //             occupationHistory: userData.occupationHistory || {},
        //             vibe: userData.vibe || "",
        //             photoURL: userData.photoURL || null,
        //             providerData: userData.providerData || [],
        //             createdAt: userData.createdAt,
        //             updatedAt: userData.updatedAt,
        //           },
        //         });
        //       }
        //     }
        //   );
        //   return unsubscribe; // ☝️ Always return unsubscribe function
        // },
        clearOtherUsers: () => {
          set({ otherUsers: [], _hasHydrated: true });
        },
        reset: () => {
          set({ otherUsers: null, _hasHydrated: true });
        },
      }),
      {
        name: "other-user-storage", // The key used to store the data in localStorage
        storage: createJSONStorage(() => localStorage),
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated();
        },
      }
    ),
    { enabled: true }
  )
);
