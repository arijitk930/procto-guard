// src/app/educator/layout.tsx
import { ReactNode } from "react";
import { EducatorSidebar } from "@/components/shared/EducatorSidebar";
import { RoleGate } from "@/components/auth/RoleGate"; // <-- New import

interface EducatorLayoutProps {
  children: ReactNode;
}

export default function EducatorLayout({ children }: EducatorLayoutProps) {
  return (
    <RoleGate allowedRole="educator">
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
        {/* 1. Static Modular Sidebar */}
        <EducatorSidebar />

        {/* 2. Main Content Area */}
        <main className="flex-1 lg:pl-72">
          {" "}
          {/* Padding to account for fixed sidebar */}
          <div className="p-8 md:p-12">{children}</div>
        </main>
      </div>
    </RoleGate>
  );
}
