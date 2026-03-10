"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogoutButton } from "@/components/shared/LogoutButton";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [inviteCode, setInviteCode] = useState("");
  const router = useRouter();

  const handleJoin = () => {
    if (inviteCode.length < 6) {
      toast.error("Please enter a valid 6-character code");
      return;
    }
    // Routes the student to the hardware check page you just built!
    router.push(`/student/exam/setup/${inviteCode}`);
  };

  return (
    <div className="min-h-screen p-8 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border dark:border-slate-800 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Student Portal
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome, {user?.fullName || "Student"}
            </p>
          </div>

          {/* Constraining the Logout Button */}
          <div className="w-full md:w-auto md:min-w-[140px]">
            <LogoutButton />
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Join Exam Action Card */}
          <Card className="border-2 border-blue-100 dark:border-blue-900 shadow-xl shadow-blue-500/5 bg-white dark:bg-slate-900">
            <CardHeader>
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 flex items-center justify-center rounded-xl mb-4">
                <ShieldCheck className="text-blue-600" size={28} />
              </div>
              <CardTitle className="text-2xl">Join an Exam</CardTitle>
              <CardDescription>
                Enter the 6-character invite code provided by your educator to
                begin your proctored session.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Enter Code (e.g., ED58F0)"
                className="text-center font-mono text-xl tracking-widest uppercase h-14"
                maxLength={6}
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              />
              <Button
                onClick={handleJoin}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-md font-semibold gap-2"
              >
                Join Exam <ArrowRight size={18} />
              </Button>
            </CardContent>
          </Card>

          {/* Past Exams Placeholder */}
          <Card className="bg-white dark:bg-slate-900 border dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center py-12">
            <h2 className="text-xl font-semibold mb-2">No Past Attempts</h2>
            <p className="text-muted-foreground max-w-xs">
              Once you complete proctored exams, your score and trust reports
              will appear here.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
