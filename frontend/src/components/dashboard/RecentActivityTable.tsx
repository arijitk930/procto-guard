"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Video, Clipboard } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { examApi } from "@/api/exam.api";
import { toast } from "sonner";
import { Skeleton } from "../ui/skeleton";

export function RecentActivityTable() {
  // 1. Fetch real data from your backend
  const { data, isLoading } = useQuery({
    queryKey: ["myExams"],
    queryFn: examApi.getMyExams,
  });

  // 2. Extract the exams array from your ApiResponse structure
  // If examApi returns response.data directly, data is already the array
  const exams = Array.isArray(data) ? data : data?.data || [];

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Invite code copied to clipboard!");
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm border border-slate-100 dark:border-slate-800 xl:col-span-2">
        <CardHeader className="px-8 pt-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="px-8 pb-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-md" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border border-slate-100 dark:border-slate-800 xl:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between border-b dark:border-slate-800 pb-5 mb-5 px-8">
        <div>
          <CardTitle className="text-xl font-bold">
            Your Created Exams
          </CardTitle>
          <CardDescription className="mt-1">
            Manage your exams and share invite codes with students
          </CardDescription>
        </div>
        <Button variant="outline" className="gap-2 font-semibold">
          View All Exams
          <ArrowRight size={16} />
        </Button>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
              <TableHead className="font-bold text-slate-800 dark:text-slate-200">
                Exam Name
              </TableHead>
              <TableHead className="font-bold text-slate-800 dark:text-slate-200">
                Invite Code
              </TableHead>
              <TableHead className="font-bold text-slate-800 dark:text-slate-200 text-center">
                Duration
              </TableHead>
              <TableHead className="font-bold text-slate-800 dark:text-slate-200">
                Status
              </TableHead>
              <TableHead className="font-bold text-slate-800 dark:text-slate-200 text-right">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* 3. Render real data or "Empty State" */}
            {exams.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-muted-foreground"
                >
                  No exams found. Create your first exam to see it here.
                </TableCell>
              </TableRow>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              exams.map((exam: any) => (
                <TableRow
                  key={exam._id}
                  className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors"
                >
                  <TableCell className="font-medium flex items-center gap-3 py-4">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Video className="text-blue-600 size-4" />
                    </div>
                    {exam.title}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => copyToClipboard(exam.inviteCode)}
                      className="flex items-center gap-2 font-mono font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded hover:bg-blue-100 transition-colors group"
                    >
                      {exam.inviteCode}
                      <Clipboard
                        size={14}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </button>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {exam.timeLimit} mins
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        exam.isActive
                          ? "bg-green-100 text-green-700 border-none hover:bg-green-100"
                          : "bg-slate-100 text-slate-700 border-none hover:bg-slate-100"
                      }
                    >
                      {exam.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      className="text-blue-600 font-medium hover:text-blue-700 hover:bg-blue-50"
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
