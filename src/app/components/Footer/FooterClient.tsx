'use client';
import { auth } from '@/app/config/firebase.config';
import useFCM from '@/app/hooks/useFCM';
import { useUserStore } from '@/app/stores/user/userStore';
import { useEffect } from 'react';
import { useShallow } from 'zustand/shallow';

const FooterClient = () => {
  const { reloadUser, listenToUser } = useUserStore(useShallow((state) => state));

  useFCM();

  useEffect(() => {
    auth.languageCode = 'hi';
    reloadUser().then(
      (res) => {},
      (err) => {},
    );
    listenToUser();
    // auth.setPersistence(browserLocalPersistence).then();
  }, []);

  return null;
};

export default FooterClient;
