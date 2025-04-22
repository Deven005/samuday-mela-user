// app/components/LogoutButton.tsx
"use client";
import { useUserStore } from "@/app/stores/user/userStore";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const logout = useUserStore((state) => state.logoutUser);

  const logoutClick = async () => {
    await logout();
    localStorage.clear();
    router.push("/sign-in");
    router.refresh();
  };

  return (
    <button type="submit" onClick={logoutClick}>
      Logout
    </button>
  );
}
