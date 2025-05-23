'use client';
import { useUserStore } from '@/app/stores/user/userStore';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';
import { showCustomToast } from '../../showCustomToast';

interface FacebookContinueAuthType {
  fb_custom_token: string | undefined;
}

const FacebookWithCustomTokenAuth = ({ fb_custom_token }: FacebookContinueAuthType) => {
  const router = useRouter();
  const signInWithFacebook = useUserStore((state) => state.signInWithFacebook);
  const searchParams = useSearchParams();

  const error_reason = searchParams.get('error_reason');

  useEffect(() => {
    // ✅ Fix Facebook "#_=_" fragment
    if (typeof window !== 'undefined' && window.location.hash === '#_=_') {
      window.history.replaceState(null, '', window.location.href.replace(/#_=_/, ''));
    }

    // ✅ Show toast for Facebook error
    if (error_reason === 'user_denied') {
      showCustomToast({
        title: 'Login Cancelled',
        message: 'Facebook login was cancelled by the user.',
        type: 'error',
      });
    } else if (error_reason) {
      showCustomToast({
        title: 'Facebook Login Error',
        message: error_reason,
        type: 'error',
      });
    }
  }, [error_reason]);

  useEffect(() => {
    if (fb_custom_token) {
      signInWithFacebook(fb_custom_token, () => {
        router.replace('/');
        router.refresh();
      });
    }
  }, [fb_custom_token]);

  return <div className="text-white">Logging you in with Facebook...</div>;
};

export default FacebookWithCustomTokenAuth;
