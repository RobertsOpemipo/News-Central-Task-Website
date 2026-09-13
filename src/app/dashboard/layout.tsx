import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 antialiased font-sans text-slate-900">
      <Sidebar currentUser={user} />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}