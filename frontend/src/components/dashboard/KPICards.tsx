// src/components/dashboard/KPICards.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Video, AlertTriangle, Users, BookOpenCheck } from "lucide-react";

const kpiData = [
  {
    title: "Active Exams",
    value: "3",
    change: "+1 today",
    icon: Video,
    color: "text-blue-600",
  },
  {
    title: "Students Monitored",
    value: "128",
    change: "Current load",
    icon: Users,
    color: "text-green-600",
  },
  {
    title: "Flagged Events",
    value: "12",
    change: "+5 today",
    icon: AlertTriangle,
    color: "text-red-600",
  },
  {
    title: "Avg. Review Score",
    value: "94%",
    change: "-2% this week",
    icon: BookOpenCheck,
    color: "text-purple-600",
  },
];

export function KPICards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      {kpiData.map((kpi, index) => (
        <Card
          key={index}
          className="shadow-sm border border-slate-100 dark:border-slate-800"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-base font-semibold text-muted-foreground">
              {kpi.title}
            </CardTitle>
            <kpi.icon
              className={`${kpi.color} opacity-80`}
              size={24}
              strokeWidth={2.5}
            />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold tracking-tight">
              {kpi.value}
            </p>
            <p className="text-sm text-muted-foreground mt-1.5">{kpi.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
