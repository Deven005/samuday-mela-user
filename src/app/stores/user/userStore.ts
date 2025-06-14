import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import {
  updateProfile,
  signOut,
  onAuthStateChanged,
  User,
  signInWithCustomToken,
  UserInfo,
} from 'firebase/auth';
import { analytics, auth, firestore, performance } from '../../config/firebase.config';
import { doc, getDoc, onSnapshot, Timestamp, updateDoc } from 'firebase/firestore';
import { uploadProfileImage } from '../../utils/uploadFiles';
import { resetAllStores } from '../../utils/resetAllStores';
import { fetchWithAppCheck } from '@/app/utils/generateAppCheckToken';
import { getFCMToken, sendNotification } from '@/app/utils/fcm/fcm';
import { trace } from 'firebase/performance';
import { logEvent } from 'firebase/analytics';
import { encryptJsonPayloadClient } from '@/app/utils/encrypt/encrypt';
import { showCustomToast } from '@/app/components/showCustomToast';

// Define the types for User data and store
export interface CurrentUser {
  preferredLanguage: string | null;
  displayName: string;
  email: string | null;
  emailVerified: boolean | null;
  phoneNumber: string;
  address: string;
  hobbies: string[];
  story: string;
  currentOccupation: string;
  vibe: string;
  uid: string;
  photoURL: string;
  providerData: UserInfo[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface UserSignUpDataType {
  displayName: string;
  // email: string;
  // phoneNumber: string;
  // address: string;
  // hobbies: string[];
  // story: string;
  // currentOccupation: string;
  // vibe: string;
  // photoURL: string;
}

export interface UserState {
  _hasHydrated?: boolean;
  setHasHydrated: (hydrated: boolean) => void;
  user: CurrentUser | null;
  listeners: (() => void)[];
  fcmToken: string | undefined;
  loadingProvider: string;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setUser: (user: CurrentUser) => void;
  setFcmToken: (fcmToken: string) => void;
  updateUser: (user: CurrentUser) => Promise<void>;
  updateUserProfilePic: (user: CurrentUser, profileImageFile: File) => Promise<void>;
  clearUser: () => void;
  signUp: (
    email: string,
    password: string,
    userData: Omit<UserSignUpDataType, 'uid'>,
    onSuccess?: () => void,
  ) => Promise<void>;
  signIn: (email: string, password: string, onSuccess?: () => void) => Promise<void>;
  signInWithGoogle: (customToken: string, onSuccess?: () => void) => Promise<void>;
  signInWithFacebook: (customToken: string, onSuccess?: () => void) => Promise<void>;
  // signUpWithGoogle: (onSuccess?: () => void) => Promise<void>;
  runAfterSignIn: (user: User, userData: CurrentUser, onSuccess?: () => void) => Promise<void>;
  runAfterSignUp: (user: User, userData: CurrentUser, onSuccess?: () => void) => Promise<void>;
  unlinkUserProvider: (providerId: string, onSuccess?: () => void) => Promise<void>;
  reloadUser: () => Promise<void>;
  fetchUserData: (uid: string) => Promise<CurrentUser>;
  listenToUser: () => (() => void)[];
  reset: () => void;
  logoutUser: () => Promise<void>;
  setLoadingProvider: (providerId: string) => void;
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
        loadingProvider: '',
        loading: false,
        setLoading: (loading) => set({ loading }),
        setHasHydrated: () => set({ _hasHydrated: true }),
        setLoadingProvider: (providerId: string) => set({ loadingProvider: providerId }),
        setUser: (user) => set({ user }),
        setFcmToken: (fcmToken: string) => set({ fcmToken }),
        reloadUser: async () => {
          try {
            const user = auth.currentUser;
            if (user) {
              await user.reload(); // ⬅️ This fetches the latest data from Firebase
              // console.log("Reloaded user:", user); // now has updated values
            }
          } catch (error) {
            console.log('reloadUser | userStore Err: ', error);
            throw error;
          }
        },
        clearUser: () => set({ user: null }),
        updateUserProfilePic: async (updatedUser: CurrentUser, profileImageFile: File) => {
          if (!updatedUser?.uid) return; // If there's no UID, don't update.

          try {
            let photoURL = updatedUser.photoURL ?? '';
            // let thumbnailURL = updatedUser.thumbnailURL ?? "";

            // Upload new profile image if available
            const uploaded = await uploadProfileImage(profileImageFile, updatedUser.uid);
            photoURL = uploaded.fileUrl;
            // thumbnailURL = uploaded.thumbnailUrl;
            // Assuming the collection name is 'users'
            updatedUser.photoURL = photoURL;
            await updateDoc(doc(firestore, 'Users', updatedUser.uid), {
              ...updatedUser,
              photoURL,
              updatedAt: Timestamp.now(), // Set updatedAt field to current timestamp
            });

            const user = auth.currentUser;
            if (user) {
              await updateProfile(user, { photoURL });
              await user.reload(); // ⬅️ This fetches the latest data from Firebase
              // console.log("Reloaded user:", user); // now has updated values

              await sendNotification({
                topic: user?.uid ?? '',
                title: 'Profile picture is updated!',
                body: 'Profile picture is updated successfully!',
                imageUrl: photoURL,
              });
            }
            set({ user: updatedUser });
          } catch (error) {
            console.error('Error updating user profile pic data:', error);
            throw error;
          }
        },
        updateUser: async (updatedUser: CurrentUser) => {
          if (!updatedUser?.uid) return; // If there's no UID, don't update.
          try {
            // Update Firestore document for user
            // Assuming the collection name is 'users'
            await updateDoc(doc(firestore, 'Users', updatedUser.uid), {
              ...updatedUser,
              updatedAt: Timestamp.now(), // Set updatedAt field to current timestamp
            });

            const user = auth.currentUser;

            if (user && get().user?.displayName != updatedUser.displayName) {
              await updateProfile(user, {
                displayName: updatedUser.displayName ?? '',
              });
              await user.reload(); // ⬅️ This fetches the latest data from Firebase
              // console.log("Reloaded user:", user); // now has updated values
            }

            // Update local Zustand store with new user data
            set({ user: updatedUser });

            await fetchWithAppCheck('/api/user/update', (await user?.getIdToken()) ?? '', {
              method: 'POST',
              // body: JSON.stringify({ encryptedData: await encryptJsonPayloadClient(signInBody) }),
            });

            await sendNotification({
              topic: user?.uid ?? '',
              title: 'Profile is updated!',
              body: 'Profile is updated successfully!',
            });
          } catch (error) {
            console.error('Error updating user data:', error);
            throw error;
          }
        },
        // Sign-up function to create a new user and store it in Firestore
        signUp: async (email, password, userData, onSuccess?: () => void) => {
          const { runAfterSignUp, fcmToken, setFcmToken } = get();
          const signUpTrace = trace(performance, 'email_pass_sign_up_custom_token_time');
          try {
            signUpTrace.start();

            // console.log('fcmToken: ', fcmToken);
            const updatedFcmToken = await getFCMToken(fcmToken, true);
            const signUpBody: any = { email, password, ...userData };

            if (
              updatedFcmToken &&
              typeof updatedFcmToken === 'string' &&
              updatedFcmToken.trim() !== ''
            ) {
              signUpBody['fcmTokens'] = [updatedFcmToken];
              setFcmToken(updatedFcmToken);
            }

            const signUpRes = await fetchWithAppCheck('/api/auth/sign-up', '', {
              method: 'POST',
              body: JSON.stringify({ encryptedData: await encryptJsonPayloadClient(signUpBody) }),
            });

            const { message, customToken, error } = signUpRes;
            var updatedUserData = signUpRes['userData'];

            if (error) throw error;

            const authUser = (await signInWithCustomToken(auth, customToken)).user;

            // const user: User = (await createUserWithEmailAndPassword(auth, email, password)).user;
            await runAfterSignUp(authUser, updatedUserData, onSuccess);
            logEvent(analytics, 'sign_up', { method: 'email_pass_sign_up_custom_token' });
          } catch (err) {
            console.error('Error signing up:', err);
            throw err;
          } finally {
            signUpTrace.stop();
          }
        },
        // signUpWithGoogle: async (onSuccess?: () => void) => {
        //   const { runAfterSignUp } = get();
        //   const googleSignUpTrace = trace(performance, 'google_sign_up_time');

        //   try {
        //     googleSignUpTrace.start();
        //     const user: User = (await signInWithPopup(auth, new GoogleAuthProvider())).user;
        //     if (onSuccess) onSuccess();
        //     // await runAfterSignUp(
        //     //   user,
        //     //   {
        //     //     email: user?.email ?? '',
        //     //     displayName: user?.displayName ?? '',
        //     //     phoneNumber: user?.phoneNumber ?? '',
        //     //     photoURL: user?.photoURL ?? '',
        //     //     address: 'Update your address',
        //     //     currentOccupation: 'Update',
        //     //     vibe: 'What’s your vibe today? Spill the tea! ☕️🔥',
        //     //     story: 'Share a bit about yourself, your passions, and what drives you! 💬✨',
        //     //     hobbies: [],
        //     //   },
        //     //   onSuccess,
        //     // );
        //     logEvent(analytics, 'sign_up', { method: 'google' });
        //   } catch (err) {
        //     console.error('Error google signing up:', err);
        //     throw err;
        //   } finally {
        //     googleSignUpTrace.stop();
        //   }
        // },
        runAfterSignUp: async (user: User, userData, onSuccess?: () => void) => {
          try {
            const { listenToUser } = get();
            auth.languageCode = userData.preferredLanguage ?? 'hi';
            // if (!user.emailVerified) {
            //   await sendEmailVerification(user);
            // }
            if (onSuccess) onSuccess();

            // Update Zustand store with new user data
            set({
              user: userData,
              // _hasHydrated: true,
            });
            listenToUser();
          } catch (err) {
            console.error('Error runAfterSignUp signing up:', err);
            throw err;
          }
        },
        // Sign-in function to authenticate the user
        signIn: async (email, password, onSuccess?: () => void) => {
          const { runAfterSignIn, fcmToken, setFcmToken } = get();
          const signInTrace = trace(performance, 'email_pass_sign_in_custom_token_time');

          try {
            signInTrace.start();

            // console.log('fcmToken: ', fcmToken);
            const updatedFcmToken = await getFCMToken(fcmToken, true);
            const signInBody: any = { email, password };

            if (
              updatedFcmToken &&
              typeof updatedFcmToken === 'string' &&
              updatedFcmToken.trim() !== ''
            ) {
              signInBody['fcmTokens'] = [updatedFcmToken];
              setFcmToken(updatedFcmToken);
            }

            const signInRes = await fetchWithAppCheck('/api/auth/sign-in', '', {
              method: 'POST',
              body: JSON.stringify({ encryptedData: await encryptJsonPayloadClient(signInBody) }),
            });

            console.log('user sign-in : ', signInRes);
            const { message, customToken, error, userData } = signInRes;

            if (error) {
              throw error;
            }
            const authUser = (await signInWithCustomToken(auth, customToken)).user;

            // const userCredential = await signInWithEmailAndPassword(auth, email, password);
            await runAfterSignIn(authUser, userData, onSuccess);
            logEvent(analytics, 'login', { method: 'email_pass_sign_in_custom_token' });
          } catch (err: any) {
            console.error('Error signing in:', err);
            throw err;
          } finally {
            signInTrace.stop();
          }
        },
        // Sign-in function with Google authentication
        signInWithGoogle: async (customToken, onSuccess?: () => void) => {
          const { runAfterSignIn, fetchUserData, reloadUser, fcmToken, setFcmToken } = get();

          const googleTrace = trace(performance, 'google_sign_in_custom_token_time');
          try {
            googleTrace.start();
            const googleAuthUser = (await signInWithCustomToken(auth, customToken)).user;

            try {
              const token = await getFCMToken(fcmToken, true);
              if (token && typeof token === 'string' && token.trim() !== '') {
                await fetchWithAppCheck(
                  '/api/fcm/subscribe-fcm',
                  await googleAuthUser.getIdToken(),
                  {
                    method: 'POST',
                    body: JSON.stringify({ token, topic: googleAuthUser.uid }),
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  },
                );
                setFcmToken(token);
              }
            } catch (error) {
              console.error('sub fcm err: ');
            }

            await runAfterSignIn(
              googleAuthUser,
              await fetchUserData(googleAuthUser.uid),
              onSuccess,
            );
            logEvent(analytics, 'login', { method: 'google_sign_in_custom_token' });
            await reloadUser();
          } catch (err) {
            console.error('Error signing in with Google:', err);
            throw err;
          } finally {
            googleTrace.stop();
          }
        },
        signInWithFacebook: async (customToken, onSuccess?: () => void) => {
          const { runAfterSignIn, fetchUserData, reloadUser, fcmToken, setFcmToken } = get();

          const fbTrace = trace(performance, 'facebook_sign_in_custom_token_time');

          try {
            fbTrace.start();
            const facebookAuthUser = (await signInWithCustomToken(auth, customToken)).user;

            try {
              const token = await getFCMToken(fcmToken, true);
              if (token && typeof token === 'string' && token.trim() !== '') {
                await fetchWithAppCheck(
                  '/api/fcm/subscribe-fcm',
                  await facebookAuthUser.getIdToken(),
                  {
                    method: 'POST',
                    body: JSON.stringify({ token, topic: facebookAuthUser.uid }),
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  },
                );
                setFcmToken(token);
              }
            } catch (error) {
              console.error('sub fcm err: ');
            }

            await runAfterSignIn(
              facebookAuthUser,
              await fetchUserData(facebookAuthUser.uid),
              onSuccess,
            );
            logEvent(analytics, 'login', { method: 'facebook_sign_in_custom_token' });
            await reloadUser();
          } catch (err) {
            console.error('Error signing in with Google:', err);
            throw err;
          } finally {
            fbTrace.stop();
          }
        },
        runAfterSignIn: async (user: User, userData, onSuccess?: () => void) => {
          try {
            const { listenToUser } = get();
            auth.languageCode = userData.preferredLanguage ?? 'hi';
            // if (!user.emailVerified) {
            //   await sendEmailVerification(user);
            // }
            if (onSuccess) onSuccess();
            set({
              user: userData,
              //  fcmToken: updatedFcmToken ?? ''
              // _hasHydrated: true,
            });

            // updateDoc(doc(firestore, `Users/${user.uid}`), {
            //   lastUsedIpAddress: await getIpAddress(),
            // }).catch((e) => {
            //   console.log('runAfterSignIn catch: ', e);
            // });
            listenToUser();
          } catch (err) {
            console.error('Error signing in with Google:', err);
            throw err;
          }
        },
        // Fetch user data from Firestore and update the store
        fetchUserData: async (uid: string) => {
          try {
            const userDoc = await getDoc(doc(firestore, 'Users', uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              return {
                uid,
                email: userData.email ?? null,
                displayName: userData.displayName ?? '',
                emailVerified: userData.emailVerified ?? false,
                phoneNumber: userData.phoneNumber ?? '',
                address: userData.address ?? '',
                hobbies: userData.hobbies ?? [],
                story: userData.story ?? '',
                currentOccupation: userData.currentOccupation ?? '',
                vibe: userData.vibe ?? '',
                photoURL: userData.photoURL ?? null,
                providerData: userData.providerData ?? [],
                createdAt: userData.createdAt,
                updatedAt: userData.updatedAt,
                preferredLanguage: userData.preferredLanguage ?? 'hi',
              };
            } else {
              console.log('No such user document!');
              throw 'No such user document!';
            }
          } catch (err) {
            console.error('Error fetching user data:', err);
            throw err;
          }
        },
        // 👇 Real-time listener
        listenToUser: () => {
          const unsubList: (() => void)[] = [];
          const authUnsub = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
              const { reloadUser, user } = get();

              await reloadUser();

              if (user === null) {
                resetAllStores();
                return;
              }

              if (user?.emailVerified != firebaseUser.emailVerified) {
                user!.emailVerified = firebaseUser.emailVerified;
              }
              const uid = firebaseUser.uid;
              user.providerData = firebaseUser.providerData;

              const unsubscribe = onSnapshot(doc(firestore, 'Users', uid), (userDoc) => {
                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  set({
                    user: {
                      uid,
                      email: userData.email ?? null,
                      displayName: userData.displayName ?? '',
                      emailVerified: userData.emailVerified ?? false,
                      phoneNumber: userData.phoneNumber ?? '',
                      address: userData.address ?? '',
                      hobbies: userData.hobbies ?? [],
                      story: userData.story ?? '',
                      currentOccupation: userData.currentOccupation ?? '',
                      vibe: userData.vibe ?? '',
                      photoURL: userData.photoURL ?? null,
                      providerData: userData.providerData ?? [],
                      createdAt: userData.createdAt,
                      updatedAt: userData.updatedAt,
                      preferredLanguage: userData.preferredLanguage,
                    },
                  });
                }
              });
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
        unlinkUserProvider: async (providerId, onSuccess) => {
          const { user, reloadUser, setLoadingProvider } = get();
          try {
            const currentUser = auth.currentUser;
            if (!currentUser || !user) return;

            setLoadingProvider(providerId);
            const res = await fetchWithAppCheck(
              `/api/user/unlink-provider`,
              (await auth.currentUser?.getIdToken()) ?? '',
              {
                method: 'POST',
                body: JSON.stringify({
                  encryptedData: await encryptJsonPayloadClient({ providerIds: [providerId] }),
                }),
              },
            );
            console.log('RES: ', res);

            const { message, error } = res;
            if (error) throw error;

            if (message.includes('Provider unlinked')) {
              setLoadingProvider('');
              showCustomToast({ title: 'Update', message: res['message'], type: 'success' });
              // ✅ Manually remove the unlinked provider from the list
              set({
                user: {
                  ...user,
                  providerData: user.providerData.filter((p) => p.providerId !== providerId),
                },
              });
              reloadUser()
                .then()
                .catch((e) =>
                  console.log('userstore reload user e: ', e.message ?? 'something is wrong!'),
                );
            }
          } catch (error) {
            // setLoadingProvider('');
            var err = JSON.parse(JSON.stringify(error));
            showCustomToast({
              title: 'Error',
              message: err.message ?? 'Something is wrong',
              type: 'error',
            });
          }
        },
        reset: () => {
          // Clear all listeners manually if needed (e.g., on component unmount)
          set((state) => {
            try {
              state.listeners.forEach((unsubscribe) => unsubscribe());
            } catch (e) {
              console.log('rest catch');
            }
            return {};
          });
        },
        logoutUser: async () => {
          const { fcmToken } = get();

          try {
            await Promise.all([
              resetAllStores(),
              fetchWithAppCheck(`/api/auth/logout`, (await auth.currentUser?.getIdToken()) ?? '', {
                method: 'POST',
                body: JSON.stringify({ fcmToken: fcmToken }),
              }),
              signOut(auth), // Firebase logout
            ]);
            // localStorage.clear();
          } catch (err) {
            console.error('Error during logout:', err);
            throw err;
          }
        },
      }),
      {
        name: 'user-storage', // The key used to store the data in localStorage
        storage: createJSONStorage(() => localStorage),
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true);
        },
      },
    ),
    { enabled: false },
  ),
);
