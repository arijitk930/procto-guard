"use client";

import { useAuth } from "@/hooks/useAuth";
import { useUserStore } from "@/store/userStore";
import { useEffect, useState } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { useInitAuth } = useAuth();
  const { isLoading } = useUserStore();
  const [mounted, setMounted] = useState(false);

  // Initialize authentication state on load
  useInitAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
}
