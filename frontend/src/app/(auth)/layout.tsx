// src/app/(auth)/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      {/* Branding Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Procto<span className="text-primary">Guard</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Secure Examination Sandbox & Proctoring Engine
        </p>
      </div>

      {/* The Auth Card Content */}
      <div className="w-full max-w-md">{children}</div>

      {/* Footer / Support */}
      <p className="mt-8 text-xs text-muted-foreground text-center">
        &copy; 2026 ProctoGuard. All rights reserved.
      </p>
    </div>
  );
}
