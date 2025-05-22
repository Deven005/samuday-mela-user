'use client';
import { useUserStore } from '@/app/stores/user/userStore';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

const GoogleWithCustomTokenAuth = ({ customToken }: GoogleAuthWithCustomTokenType) => {
  const router = useRouter();
  const signInWithGoogle = useUserStore((state) => state.signInWithGoogle);
  useEffect(() => {
    signInWithGoogle(customToken, () => {
      router.replace('/');
      router.refresh();
    });
  }, []);

  return <div className="text-white">Loading!</div>;
};

export default GoogleWithCustomTokenAuth;

interface GoogleAuthWithCustomTokenType {
  customToken: string;
}
