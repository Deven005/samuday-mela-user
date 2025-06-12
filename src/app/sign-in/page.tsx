'use client';
import { useEffect, useState } from 'react';
import { useUserStore } from '../stores/user/userStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import InputField from '../components/Input/InputField';
import { Button } from '../components/Button/Button';
import { useShallow } from 'zustand/shallow';
import { showCustomToast } from '../components/showCustomToast';
import { auth } from '../config/firebase.config';
import { resetAllStores } from '../utils/resetAllStores';

// export const metadata = {
//   title: 'Sign-In | Samuday Mela',
// };

const SignIn = () => {
  const { signIn, user, _hasHydrated } = useUserStore(useShallow((state) => state));
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(auth.currentUser);

  useEffect(() => {
    firebaseUser?.reload();
    if (user && firebaseUser) {
      window.location.href = '/';
    }
    if (!firebaseUser) {
      resetAllStores();
    }
  }, [user, _hasHydrated, firebaseUser]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      router.replace('/api/auth/google');
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      showCustomToast({
        title: 'Sign in error!',
        message: err.message,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      setLoading(false);
      router.push('/');
    } catch (err: any) {
      if (err === 'INVALID_LOGIN_CREDENTIALS') {
        setError('invalid email or pass, or no account exist!');
        showCustomToast({
          title: 'Sign in error!',
          message: 'invalid email or pass, or no account exist!',
          type: 'error',
        });
      } else {
        setError(err.message);
        showCustomToast({
          title: 'Sign in error!',
          message: err.message,
          type: 'error',
        });
      }
      console.error(err);
      setLoading(false);
    } finally {
      // setLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FB_APP_ID!;
    const domain = typeof window !== 'undefined' ? window.location.origin : '';
    const REDIRECT_URI = `${domain}/api/auth/facebook/callback`;

    // const loginUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=fb-login&scope=email,public_profile`;

    const login = `https://www.facebook.com/v22.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=fb-login`;

    router.replace(login);
  };

  return user || !_hasHydrated ? (
    <div className="flex justify-center items-center bg-base-100 dark:bg-base-900 p-4 ">
      <p className="text-base-content">Loading</p>
    </div>
  ) : (
    <div className="flex justify-center items-center bg-base-100 dark:bg-base-900 p-4 min-h-screen">
      <div className="w-full max-w-md bg-base-200 dark:bg-base-800 p-8 rounded-2xl shadow-2xl text-base-content">
        <h2 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          Sign In
        </h2>

        {error && (
          <div className="mb-4 text-center text-sm text-red-500 dark:text-red-400">{error}</div>
        )}

        {/* Google Sign-In Button */}
        <div className="flex flex-col gap-3 mb-6">
          <Button
            type="button"
            onClick={handleFacebookSignIn}
            disabled={loading}
            className={`btn w-full gap-2 ${
              loading
                ? 'btn-disabled'
                : 'bg-[#1877F2] text-white hover:bg-[#166fe5] dark:bg-[#1877F2] dark:hover:bg-[#166fe5] transition-colors'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              fill="currentColor"
              className="w-5 h-5 text-white"
            >
              <path d="M29 0H3C1.3 0 0 1.3 0 3v26c0 1.7 1.3 3 3 3h13.6v-11h-3.7v-4.3h3.7v-3.2c0-3.7 2.2-5.7 5.5-5.7 1.6 0 3.1.1 3.5.2v4h-2.4c-1.9 0-2.3.9-2.3 2.2v2.9h4.6l-.6 4.3h-4v11H29c1.7 0 3-1.3 3-3V3c0-1.7-1.3-3-3-3z" />
            </svg>
            {loading ? 'Signing in...' : 'Continue with Facebook'}
          </Button>

          <Button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className={`btn w-full gap-2 border border-gray-300 bg-white text-gray-800 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800 transition-colors ${
              loading ? 'btn-disabled' : ''
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M533.5 278.4c0-17.4-1.5-34.1-4.3-50.3H272.1v95.2h146.9c-6.3 33.5-25.2 61.9-53.7 81l86.9 67.6c50.6-46.7 81.3-115.6 81.3-193.5z"
                fill="#4285F4"
              />
              <path
                d="M272.1 544.3c72.9 0 134-24.2 178.6-65.6l-86.9-67.6c-24.1 16.1-55 25.6-91.7 25.6-70.4 0-130.2-47.6-151.5-111.4H31.6v69.9c44.6 88 135.9 149.1 240.5 149.1z"
                fill="#34A853"
              />
              <path
                d="M120.6 325.3c-10.5-31.5-10.5-65.3 0-96.8V158.6H31.6c-32.9 65.9-32.9 143.3 0 209.2l89-69.6z"
                fill="#FBBC05"
              />
              <path
                d="M272.1 107.6c39.7-.6 77.8 13.8 106.9 40.1l80.2-80.2C408.6 24 342.3-.2 272.1 0 167.5 0 76.2 61.1 31.6 149.1l89 69.6C141.9 155.2 201.7 107.6 272.1 107.6z"
                fill="#EA4335"
              />
            </svg>
            {loading ? 'Signing in...' : 'Continue with Google'}
          </Button>
        </div>

        <div className="flex items-center mb-6">
          <div className="flex-grow border-t border-base-300"></div>
          <span className="mx-4 text-sm text-base-content">or</span>
          <div className="flex-grow border-t border-base-300"></div>
        </div>

        {/* Sign-In Form */}
        <form onSubmit={handleSignIn} className="space-y-4">
          <InputField
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <InputField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex justify-between text-sm">
            <Link href="/auth/forgot-password" className="text-primary hover:underline">
              Forgot password?
            </Link>
            <Link href="/sign-up" className="text-primary hover:underline">
              Sign Up
            </Link>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className={`btn w-full ${loading ? 'btn-disabled' : 'btn-primary'}`}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
