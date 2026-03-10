// src/components/shared/EducatorSidebar.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FilePlus2,
  Users,
  FileText,
  Settings,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogoutButton } from "@/components/shared/LogoutButton";

// Simple typed navigation structure
const navItems = [
  { name: "Overview", href: "/educator/dashboard", icon: LayoutDashboard },
  { name: "Exams", href: "/educator/exams", icon: FileText },
  { name: "Students", href: "/educator/students", icon: Users },
  { name: "Results", href: "/educator/results", icon: FilePlus2 },
  { name: "Settings", href: "/educator/settings", icon: Settings },
];

export function EducatorSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r dark:border-slate-800 p-6 flex flex-col justify-between max-lg:hidden">
      <div>
        {/* 1. Branding */}
        <div className="flex items-center gap-2 mb-10">
          <div className="p-2 bg-blue-600 rounded-lg text-white font-bold text-xl">
            PG
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Procto<span className="text-blue-600">Guard</span>
          </h1>
        </div>

        {/* 2. Navigation */}
        <nav className="space-y-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-4 text-slate-700 dark:text-slate-300 font-medium py-3 px-4",
                    isActive &&
                      "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-500 font-semibold",
                  )}
                >
                  <item.icon
                    className={
                      isActive ? "text-blue-600" : "text-muted-foreground"
                    }
                    size={20}
                  />
                  {item.name}
                  {isActive && <ChevronRight className="ml-auto" size={16} />}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 3. User Profile & Logout */}
      <div className="border-t dark:border-slate-800 pt-6 mt-6">
        <div className="flex items-center gap-4 mb-5">
          <Avatar className="h-12 w-12 border-2 border-slate-100 dark:border-slate-800">
            {mounted && user?.username ? (
              <AvatarImage
                src={`https://api.dicebear.com/8.x/initials/svg?seed=${user.username}`}
              />
            ) : null}
            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
              {mounted && user?.fullName
                ? user.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()
                : "ED"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="font-semibold text-lg truncate flex items-center gap-2">
              {mounted && user?.fullName ? user.fullName : "Educator"}
            </p>
            <p className="text-sm text-muted-foreground w-full truncate">
              {mounted && user?.email ? user.email : "loading..."}
            </p>
          </div>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
