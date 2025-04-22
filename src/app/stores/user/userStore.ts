import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  appCheck,
  auth,
  firestore,
  messaging,
} from "../../config/firebase.config";
import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { uploadProfileImage } from "../../utils/uploadFiles";
import { resetAllStores } from "../../utils/resetAllStores";
import { fetchWithAppCheck } from "@/app/utils/generateAppCheckToken";
import { getFCMToken } from "@/app/utils/getFCMToken";

// Define the types for User data and store
export interface CurrentUser {
  displayName: string;
  email: string | null;
  emailVerified: boolean | null;
  phoneNumber: string;
  address: string;
  hobbies: string[];
  story: string;
  currentOccupation: string;
  occupationHistory: {
    occupation: string;
    occupationUpdatedAt: Timestamp;
  };
  vibe: string;
  uid: string;
  photoURL: string | null;
  providerData: any[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface UserSignUpDataType {
  displayName: string;
  email: string;
  phoneNumber: string;
  address: string;
  hobbies: string[];
  story: string;
  currentOccupation: string;
  vibe: string;
  photoURL: string;
}

export interface UserState {
  _hasHydrated?: boolean;
  setHasHydrated: (hydrated: boolean) => void;
  user: CurrentUser | null;
  listeners: (() => void)[];
  fcmToken: string | undefined;
  setUser: (user: CurrentUser) => void;
  setFcmToken: (fcmToken: string) => void;
  updateUser: (user: CurrentUser) => Promise<void>;
  updateUserProfilePic: (
    user: CurrentUser,
    profileImageFile: File
  ) => Promise<void>;
  clearUser: () => void;
  signUp: (
    email: string,
    password: string,
    userData: Omit<UserSignUpDataType, "uid">,
    onSuccess?: () => void
  ) => Promise<void>;
  signIn: (
    email: string,
    password: string,
    onSuccess?: () => void
  ) => Promise<void>;
  signInWithGoogle: (onSuccess?: () => void) => Promise<void>;
  reloadUser: () => Promise<void>;
  fetchUserData: (uid: string) => Promise<void>;
  listenToUser: () => (() => void)[];
  reset: () => void;
  logoutUser: () => Promise<void>;
}

// Create the Zustand store with persistence using localStorage
export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set, get) => ({
        // hydration check
        _hasHydrated: false,
        listeners: [],
        user: null,
        fcmToken: undefined,
        setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
        setUser: (user) => set({ user }),
        setFcmToken: (fcmToken: string) =>
          set({ fcmToken, _hasHydrated: true }),
        reloadUser: async () => {
          try {
            const user = auth.currentUser;
            if (user) {
              await user.reload(); // ⬅️ This fetches the latest data from Firebase
              // console.log("Reloaded user:", user); // now has updated values
            }
          } catch (error) {
            console.log("reloadUser | userStore Err: ", error);
            throw error;
          }
        },
        clearUser: () => set({ user: null }),
        updateUserProfilePic: async (
          updatedUser: CurrentUser,
          profileImageFile: File
        ) => {
          if (!updatedUser?.uid) return; // If there's no UID, don't update.

          try {
            let photoURL = updatedUser.photoURL || "";
            // let thumbnailURL = updatedUser.thumbnailURL || "";

            // Upload new profile image if available
            if (profileImageFile) {
              const uploaded = await uploadProfileImage(
                profileImageFile,
                updatedUser.uid
              );
              photoURL = uploaded.fileUrl;
              // thumbnailURL = uploaded.thumbnailUrl;
            }
            // Assuming the collection name is 'users'
            await updateDoc(doc(firestore, "Users", updatedUser.uid), {
              ...updatedUser,
              photoURL,
              updatedAt: Timestamp.now(), // Set updatedAt field to current timestamp
            });
            const user = auth.currentUser;
            if (user && profileImageFile) {
              await updateProfile(user, { photoURL });
              await user.reload(); // ⬅️ This fetches the latest data from Firebase
              // console.log("Reloaded user:", user); // now has updated values
            }
            set({ user: updatedUser });
          } catch (error) {
            console.error("Error updating user profile pic data:", error);
            throw error;
          }
        },
        updateUser: async (updatedUser: CurrentUser) => {
          if (!updatedUser?.uid) return; // If there's no UID, don't update.
          try {
            // Update Firestore document for user
            // Assuming the collection name is 'users'
            await updateDoc(doc(firestore, "Users", updatedUser.uid), {
              ...updatedUser,
              updatedAt: Timestamp.now(), // Set updatedAt field to current timestamp
            });

            const user = auth.currentUser;

            if (user && get().user?.displayName != updatedUser.displayName) {
              await updateProfile(user, {
                displayName: updatedUser.displayName ?? "",
              });
              await user.reload(); // ⬅️ This fetches the latest data from Firebase
              // console.log("Reloaded user:", user); // now has updated values
            }

            // Update local Zustand store with new user data
            set({ user: updatedUser });
          } catch (error) {
            console.error("Error updating user data:", error);
            throw error;
          }
        },
        // Sign-up function to create a new user and store it in Firestore
        signUp: async (email, password, userData, onSuccess?: () => void) => {
          try {
            const { setHasHydrated } = get();
            //   const trace = performance.trace("custom_trace");
            const userCredential = await createUserWithEmailAndPassword(
              auth,
              email,
              password
            );
            const user = userCredential.user;

            const timestamp = Timestamp.now();
            // Create the user document in Firestore with additional data
            await setDoc(doc(firestore, "Users", user.uid), {
              ...userData,
              uid: user.uid,
              createdAt: timestamp,
              updatedAt: timestamp,
            });
            const token = await getFCMToken(setHasHydrated);
            const userIdToken = await user.getIdToken(true);
            if (!token || token === "") throw Error("No token from fcm");

            await fetchWithAppCheck(`/api/create-session`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userIdToken}`,
              },
              body: JSON.stringify({
                idToken: userIdToken,
                token,
              }),
            });

            if (onSuccess) {
              onSuccess();
            }

            // Update Zustand store with new user data
            set({
              user: {
                ...userData,
                uid: user.uid,
                email: user.email,
                createdAt: timestamp,
                updatedAt: timestamp,
                emailVerified: user.emailVerified,
                occupationHistory: {
                  occupation: "",
                  occupationUpdatedAt: timestamp,
                },
                photoURL: user.photoURL,
                providerData: [],
              },
              _hasHydrated: true,
              fcmToken: token,
            });
          } catch (err) {
            console.error("Error signing up:", err);
            throw err;
          }
        },
        // Sign-in function to authenticate the user
        signIn: async (email, password, onSuccess?: () => void) => {
          try {
            const { fetchUserData, setHasHydrated } = get();
            const userCredential = await signInWithEmailAndPassword(
              auth,
              email,
              password
            );
            const user = userCredential.user;

            // Fetch user data after sign-in
            await fetchUserData(user.uid);
            const userIdToken = await user.getIdToken(true);
            const token = await getFCMToken(setHasHydrated);
            if (!token || token === "") throw Error("No token from fcm");
            await fetchWithAppCheck(`/api/create-session`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userIdToken}`,
              },
              body: JSON.stringify({ idToken: userIdToken, token }),
            });

            if (onSuccess) {
              onSuccess();
            }

            set({ fcmToken: token, _hasHydrated: true });
          } catch (err) {
            console.error("Error signing in:", err);
            throw err;
          }
        },
        // Sign-in function with Google authentication
        signInWithGoogle: async (onSuccess?: () => void) => {
          try {
            const { setHasHydrated } = get();
            const result = await signInWithPopup(
              auth,
              new GoogleAuthProvider()
            );
            const user = result.user;

            // Fetch user data after Google sign-in
            await useUserStore.getState().fetchUserData(user.uid);

            const userIdToken = await user.getIdToken(true);
            const token = await getFCMToken(setHasHydrated);
            if (!token || token === "") throw Error("No token from fcm");
            await fetchWithAppCheck(`/api/create-session`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userIdToken}`,
              },
              body: JSON.stringify({ idToken: userIdToken, token }),
            });

            if (onSuccess) {
              onSuccess();
            }

            set({ fcmToken: token, _hasHydrated: true });
          } catch (err) {
            console.error("Error signing in with Google:", err);
            throw err;
          }
        },
        // Fetch user data from Firestore and update the store
        fetchUserData: async (uid) => {
          try {
            const userDoc = await getDoc(doc(firestore, "Users", uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              set({
                user: {
                  uid,
                  email: userData.email || null,
                  displayName: userData.displayName || "",
                  emailVerified: userData.emailVerified || false,
                  phoneNumber: userData.phoneNumber || "",
                  address: userData.address || "",
                  hobbies: userData.hobbies || [],
                  story: userData.story || "",
                  currentOccupation: userData.currentOccupation || "",
                  occupationHistory: userData.occupationHistory,
                  vibe: userData.vibe || "",
                  photoURL: userData.photoURL || null,
                  providerData: userData.providerData || [],
                  createdAt: userData.createdAt,
                  updatedAt: userData.updatedAt,
                },
                _hasHydrated: true,
              });
            } else {
              console.log("No such user document!");
              throw "No such user document!";
            }
          } catch (err) {
            console.error("Error fetching user data:", err);
            throw err;
          }
        },
        // 👇 Real-time listener
        listenToUser: () => {
          const unsubList: (() => void)[] = [];
          const authUnsub = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
              await get().reloadUser();
              const uid = firebaseUser.uid;

              const unsubscribe = onSnapshot(
                doc(firestore, "Users", uid),
                (userDoc) => {
                  if (userDoc.exists()) {
                    const userData = userDoc.data();
                    set({
                      user: {
                        uid,
                        email: userData.email || null,
                        displayName: userData.displayName || "",
                        emailVerified: userData.emailVerified || false,
                        phoneNumber: userData.phoneNumber || "",
                        address: userData.address || "",
                        hobbies: userData.hobbies || [],
                        story: userData.story || "",
                        currentOccupation: userData.currentOccupation || "",
                        occupationHistory: userData.occupationHistory || {},
                        vibe: userData.vibe || "",
                        photoURL: userData.photoURL || null,
                        providerData: userData.providerData || [],
                        createdAt: userData.createdAt,
                        updatedAt: userData.updatedAt,
                      },
                    });
                  }
                }
              );
              unsubList.push(unsubscribe);
            } else {
              resetAllStores();
            }
          });

          unsubList.push(authUnsub);
          // Add unsubscribe functions to the listeners array
          set((state) => ({
            listeners: [...state.listeners, ...unsubList],
          }));
          return unsubList;
        },
        reset: () => {
          // Clear all listeners manually if needed (e.g., on component unmount)
          set((state) => {
            state.listeners.forEach((unsubscribe) => unsubscribe());
            return {};
          });
        },
        logoutUser: async () => {
          const { user, fcmToken } = get();
          try {
            await Promise.all([
              resetAllStores(),
              fetchWithAppCheck(`/api/delete-session`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  token: fcmToken,
                  topic: user?.uid,
                  idToken: await auth.currentUser?.getIdToken(true),
                }),
              }),
              // fetchWithAppCheck("/api/fcm/unsubscribe-fcm", {
              //   method: "POST",
              //   body: JSON.stringify({
              //     token: fcmToken,
              //     topic: user?.uid,
              //   }),
              //   headers: { "Content-Type": "application/json" },
              // }),
              signOut(auth), // Firebase logout
            ]);
          } catch (err) {
            console.error("Error during logout:", err);
            throw err;
          }
        },
      }),
      {
        name: "user-storage", // The key used to store the data in localStorage
        storage: createJSONStorage(() => localStorage),
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true);
        },
      }
    ),
    { enabled: true }
  )
);
