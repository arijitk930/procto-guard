"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface RoleGateProps {
  children: React.ReactNode;
  allowedRole: "student" | "educator";
}

export const RoleGate = ({ children, allowedRole }: RoleGateProps) => {
  // 1. Destructure user and the useInitAuth hook
  const { user, useInitAuth } = useAuth();

  // 2. Call the hook to get the actual isLoading state
  const { isLoading } = useInitAuth();

  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/login");
      } else if (user.role !== allowedRole) {
        const redirectPath =
          user.role === "student"
            ? "/student/dashboard"
            : "/educator/dashboard";
        router.replace(redirectPath);
      }
    }
  }, [user, isLoading, allowedRole, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-blue-600 size-12" />
      </div>
    );
  }

  if (user && user.role === allowedRole) {
    return <>{children}</>;
  }

  return null;
};
