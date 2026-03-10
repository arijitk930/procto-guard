"use client";

import { useAuth } from "@/hooks/useAuth";
import { KPICards } from "@/components/dashboard/KPICards";
import { RecentActivityTable } from "@/components/dashboard/RecentActivityTable";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

import Link from "next/link";

export default function EducatorDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-10">
      {/* 1. Header Section */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-2">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Educator Dashboard
          </h1>
          <p className="text-xl text-muted-foreground mt-2">
            Welcome back,{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
              {user?.fullName || "Educator"}
            </span>
            . Here is your overview for today.
          </p>
        </div>
        <Link href="/educator/dashboard/exams/create">
          <Button className="font-semibold text-md gap-3 py-6 px-7 bg-blue-600 hover:bg-blue-700 transition-colors">
            <PlusCircle size={22} />
            Create New Exam
          </Button>
        </Link>
      </header>

      {/* 2. Key Metrics */}
      <section>
        <KPICards />
      </section>

      {/* 3. Main Data Area */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <RecentActivityTable />
        {/* We can place the "Top Violated Students" or "System Logs" here later */}
      </section>
    </div>
  );
}
