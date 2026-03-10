"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/shared/LogoutButton";

export default function StudentDashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen p-8 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Student Portal
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome, {user?.fullName || "Student"}
            </p>
          </div>
          <LogoutButton />
        </header>

        <div className="p-6 bg-white dark:bg-slate-900 rounded-lg shadow-sm border flex flex-col items-center justify-center text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No Upcoming Exams</h2>
          <p className="text-muted-foreground mb-6">
            When an educator invites you to a proctored exam, it will appear
            here.
          </p>
          <Button>Join Exam via Code</Button>
        </div>
      </div>
    </div>
  );
}
