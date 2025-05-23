'use client';
import { auth } from '@/app/config/firebase.config';
import useFCM from '@/app/hooks/useFCM';
import { useUserStore } from '@/app/stores/user/userStore';
import { browserLocalPersistence } from 'firebase/auth';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { useShallow } from 'zustand/shallow';

const FooterClient = () => {
  const { reloadUser } = useUserStore(useShallow((state) => state));

  useFCM();
  reloadUser().then(
    (res) => {},
    (err) => {},
  );

  useEffect(() => {
    auth.languageCode = 'hi';
    auth.setPersistence(browserLocalPersistence).then();
  }, []);

  return (
    <>
      <ToastContainer />
    </>
  );
};

export default FooterClient;
