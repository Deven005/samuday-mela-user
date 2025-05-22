import GoogleWithCustomTokenAuth from '@/app/components/Auth/GoogleWithCustomTokenAuth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';

const ContinueAuth = async () => {
  const cookieStore = await cookies();
  const customToken = cookieStore.get('firebase_custom_token')?.value;
  // (await cookies()).delete('firebase_custom_token');

  if (!customToken) {
    redirect('/');
  }

  return <GoogleWithCustomTokenAuth customToken={customToken!} />;
};

export default ContinueAuth;
