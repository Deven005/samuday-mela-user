// hooks/useRedirectIfAuthenticated.ts
import { useEffect, useState } from "react";
import { useUserStore } from "../stores/user/userStore";
import { useRouter } from "next/navigation";
import { useShallow } from "zustand/shallow";

export const useRedirectIfAuthenticated = () => {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const user = useUserStore(useShallow((state) => state.user));
  const _hasHydrated = useUserStore(useShallow((state) => state._hasHydrated));

  useEffect(() => {
    if (!_hasHydrated) return;
    if (user?.uid) {
      router.replace("/");
    } else {
      setReady(true); // allow page to render (sign-in / sign-up)
    }
  }, [_hasHydrated, user, router]);

  return { ready, hydrated: _hasHydrated };
};
