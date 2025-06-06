'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
// import { toast } from 'react-hot-toast';
import { sendPasswordResetEmail } from 'firebase/auth';
import Image from 'next/image';
import Link from 'next/link';
import { auth } from '@/app/config/firebase.config';
import { Button } from '@/app/components/Button/Button';
import InputField from '@/app/components/Input/InputField';
import { showCustomToast } from '@/app/components/showCustomToast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      auth.languageCode = 'hi';
      await sendPasswordResetEmail(auth, email);
      //   toast.success('Password reset email sent!');
      showCustomToast({
        title: 'Email is sent!',
        message: 'Password reset email sent!',
        type: 'success',
      });
      router.push('/sign-in');
    } catch (error: any) {
      //   toast.error(error.message || 'Failed to send reset email');
      showCustomToast({
        title: 'Email is sent!',
        message: error.message || 'Failed to send reset email',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4 py-12">
      <div className="max-w-md w-full bg-base-100 shadow-lg rounded-2xl p-8 space-y-6">
        <div className="flex flex-col items-center">
          <Image src="/forgot-password.svg" alt="Forgot password" width={120} height={120} />
          <h2 className="mt-4 text-2xl font-bold text-center text-base-content">
            Forgot your password?
          </h2>
          <p className="text-sm text-center text-base-content/70">
            No worries, we’ll send you a reset link.
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="label text-sm font-medium">Email</label>
            <InputField
              type="email"
              className="input input-bordered w-full"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id={'email'}
              label={'Enter Email'}
            />
          </div>

          <Button type="submit" className="btn btn-primary w-full" disabled={loading || !email}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>

          <div className="text-sm text-center">
            <Link href="/sign-in" className="link link-hover">
              Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
