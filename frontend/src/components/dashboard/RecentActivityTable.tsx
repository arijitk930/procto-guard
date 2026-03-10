// src/components/dashboard/RecentActivityTable.tsx
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
import { ArrowRight, Video } from "lucide-react";

// Mock Data for upcoming/active exams
const recentExams = [
  {
    id: "101",
    name: "CS-301 Midterm (Algorithm Design)",
    date: "Mar 12, 10:00 AM",
    students: 48,
    status: "Scheduled",
    badge:
      "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-500",
  },
  {
    id: "102",
    name: "EE-101 Final (Circuit Theory)",
    date: "Mar 12, 02:30 PM",
    students: 110,
    status: "Live",
    badge: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-500",
  },
  {
    id: "103",
    name: "CS-202 Quiz (Data Structures)",
    date: "Mar 13, 11:15 AM",
    students: 65,
    status: "Scheduled",
    badge:
      "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-500",
  },
];

export function RecentActivityTable() {
  return (
    <Card className="shadow-sm border border-slate-100 dark:border-slate-800 xl:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between border-b dark:border-slate-800 pb-5 mb-5 px-8">
        <div>
          <CardTitle className="text-xl font-bold">
            Upcoming Exam Schedule
          </CardTitle>
          <CardDescription className="mt-1">
            Overview of exams scheduled for the next 48 hours
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
            <TableRow className="border-slate-100 dark:border-slate-800">
              <TableHead className="font-bold text-slate-800 dark:text-slate-200">
                Exam Name
              </TableHead>
              <TableHead className="font-bold text-slate-800 dark:text-slate-200">
                Date & Time
              </TableHead>
              <TableHead className="font-bold text-slate-800 dark:text-slate-200 text-center">
                Candidates
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
            {recentExams.map((exam) => (
              <TableRow
                key={exam.id}
                className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/50"
              >
                <TableCell className="font-medium flex items-center gap-3">
                  <Video className="text-blue-600 size-5 opacity-70" />
                  {exam.name}
                </TableCell>
                <TableCell>{exam.date}</TableCell>
                <TableCell className="text-center font-semibold">
                  {exam.students}
                </TableCell>
                <TableCell>
                  <Badge
                    className={`${exam.badge} border-none font-semibold px-3 py-1`}
                  >
                    {exam.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" className="text-blue-600 font-medium">
                    Review Settings
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
