// app/components/LogoutButton.tsx
'use client';
import { useUserStore } from '@/app/stores/user/userStore';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  const logout = useUserStore((state) => state.logoutUser);

  const logoutClick = async () => {
    try {
      await logout();
    } catch (error) {
      console.log('logoutClick: ', error);
    } finally {
      router.push('/sign-in');
      router.refresh();
      localStorage.clear();
    }
  };

  return (
    <button type="submit" onClick={logoutClick}>
      Logout
    </button>
  );
}
