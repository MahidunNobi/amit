// app/dashboard/layout.tsx
import { validateSession } from "@/actions/validateSession";
import SessionGuard from "@/providers/SessionGuard";
import DashboardSidebar from "@/components/Dashboard/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await validateSession(); // server-side validation

  return (
    <SessionGuard>
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <main className="flex-1 p-8">{children} </main>
      </div>
    </SessionGuard>
  );
}
