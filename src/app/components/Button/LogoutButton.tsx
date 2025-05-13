// app/components/LogoutButton.tsx
'use client';
import { useUserStore } from '@/app/stores/user/userStore';
import { useRouter } from 'next/navigation';
import { Button } from './Button';

export default function LogoutButton() {
  const router = useRouter();
  const logout = useUserStore((state) => state.logoutUser);

  const logoutClick = async () => {
    try {
      await logout();
      router.replace('/sign-in');
      router.refresh();
      localStorage.clear();
    } catch (error) {
      console.log('logoutClick: ', error);
    }
  };

  return (
    <Button type="submit" onClick={logoutClick}>
      Logout
    </Button>
  );
}
