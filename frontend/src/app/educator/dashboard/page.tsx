"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function EducatorDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen p-8 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Educator Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {user?.fullName || "Educator"}
            </p>
          </div>
          <Button variant="outline" onClick={() => logout()}>
            Log out
          </Button>
        </header>

        {/* Placeholder for future features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-lg">Active Exams</h3>
            <p className="text-3xl font-bold mt-2">0</p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-900 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-lg">Total Students</h3>
            <p className="text-3xl font-bold mt-2">0</p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-900 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-lg">System Status</h3>
            <p className="text-green-600 font-bold mt-2">
              All Systems Operational
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
