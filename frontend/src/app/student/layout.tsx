// src/app/student/layout.tsx
import { RoleGate } from "@/components/auth/RoleGate";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGate allowedRole="student">
      {/* If you ever want to add a Student Navbar later, it goes right here! */}
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        {children}
      </div>
    </RoleGate>
  );
}
