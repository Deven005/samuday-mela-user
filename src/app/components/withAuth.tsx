// components/withAuth.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "../stores/user/userStore";
import { useShallow } from "zustand/shallow";

const withAuth = (WrappedComponent: React.ComponentType) => {
  const Wrapper = (props: any) => {
    const user = useUserStore(useShallow((state) => state.user));
    const hasHydrated = useUserStore(useShallow((state) => state._hasHydrated));
    const router = useRouter();

    useEffect(() => {
      if (hasHydrated && !user) {
        router.replace("/sign-in");
      }
    }, [hasHydrated, user, router]);

    // Don't render the component until user check completes
    if (!hasHydrated) return <div>Loading!</div>;

    return <WrappedComponent {...props} />;
  };

  return Wrapper;
};

export default withAuth;
