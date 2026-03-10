"use client";

import { useAuth } from "@/hooks/useAuth";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  Clock,
  FileText,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";

export default function ExamSuccessPage() {
  const { user } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const inviteCode = params.code as string;
  const warnings = parseInt(searchParams.get("warnings") || "0", 10);

  // Determine integrity status based on warnings
  const isHighTrust = warnings === 0;
  const isMediumTrust = warnings > 0 && warnings <= 3;
  const isLowTrust = warnings > 3;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header Animation */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle2 className="text-green-600 dark:text-green-400 size-12" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Submission Successful
          </h1>
          <p className="text-slate-500 max-w-md">
            Your exam has been securely transmitted and recorded. You may now
            close this window or return to your dashboard.
          </p>
        </div>

        {/* Audit Trail Card */}
        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-slate-100/50 dark:bg-slate-900/50 border-b pb-6">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="text-blue-600" size={20} />
              Session Receipt
            </CardTitle>
            <CardDescription>
              Keep this information for your records.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y dark:divide-slate-800">
              {/* Student Info */}
              <div className="flex justify-between items-center p-6">
                <span className="text-slate-500 font-medium">Candidate</span>
                <span className="font-semibold text-slate-900 dark:text-white capitalize">
                  {user?.fullName || "Arijit Karmakar"}
                </span>
              </div>

              {/* Exam Info */}
              <div className="flex justify-between items-center p-6">
                <span className="text-slate-500 font-medium">
                  Exam Session ID
                </span>
                <span className="font-mono font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded">
                  {inviteCode}
                </span>
              </div>

              {/* Timestamp */}
              <div className="flex justify-between items-center p-6">
                <span className="text-slate-500 font-medium">
                  Time Submitted
                </span>
                <span className="font-medium flex items-center gap-2">
                  <Clock size={16} className="text-slate-400" />
                  {new Date().toLocaleString()}
                </span>
              </div>

              {/* Security Audit */}
              <div
                className={`flex justify-between items-center p-6 ${
                  isHighTrust
                    ? "bg-green-50/50 dark:bg-green-950/20"
                    : isMediumTrust
                      ? "bg-amber-50/50 dark:bg-amber-950/20"
                      : "bg-red-50/50 dark:bg-red-950/20"
                }`}
              >
                <span className="text-slate-500 font-medium">
                  Integrity Check
                </span>
                <div className="flex items-center gap-2 font-semibold">
                  {isHighTrust ? (
                    <>
                      <ShieldCheck className="text-green-600 size-5" />{" "}
                      <span className="text-green-600">
                        Secure (0 Warnings)
                      </span>
                    </>
                  ) : isMediumTrust ? (
                    <>
                      <AlertTriangle className="text-amber-600 size-5" />{" "}
                      <span className="text-amber-600">
                        Flagged ({warnings} Warnings)
                      </span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="text-red-600 size-5" />{" "}
                      <span className="text-red-600">
                        Critical ({warnings} Warnings)
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="flex justify-center pt-4">
          <Button
            size="lg"
            onClick={() => router.push("/student/dashboard")}
            className="gap-2 font-semibold"
          >
            Return to Dashboard <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
