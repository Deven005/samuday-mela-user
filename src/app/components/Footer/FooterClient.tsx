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
    <div className="bg-base-200 text-base-content py-12 mt-auto border-t border-base-300 transition-colors duration-300"></div>
  );
};

export default FooterClient;
