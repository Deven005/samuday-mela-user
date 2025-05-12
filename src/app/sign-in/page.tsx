'use client';

import { useState } from 'react';
import { useUserStore } from '../stores/user/userStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import InputField from '../components/Input/InputField';
import { Button } from '../components/Button/Button';

const SignIn = () => {
  const signIn = useUserStore((state) => state.signIn);
  const signInWithGoogle = useUserStore((state) => state.signInWithGoogle);
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push('/');
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center bg-base-100 dark:bg-base-900 p-4 min-h-screen">
      <div className="w-full max-w-md bg-base-200 dark:bg-base-800 p-8 rounded-2xl shadow-2xl text-base-content">
        <h2 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          Sign In
        </h2>

        {error && (
          <div className="mb-4 text-center text-sm text-red-500 dark:text-red-400">{error}</div>
        )}

        {/* Google Sign-In Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className={`btn btn-outline w-full gap-2 ${
              loading
                ? 'btn-disabled'
                : 'hover:bg-base-100 dark:hover:bg-base-700 transition-colors'
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
          </button>
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
            <Link href="/forgot-password" className="text-primary hover:underline">
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
