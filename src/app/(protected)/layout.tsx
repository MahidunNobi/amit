// app/dashboard/layout.tsx
import { validateSession } from "@/actions/validateSession";
import SessionGuard from "@/providers/SessionGuard";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await validateSession(); // server-side validation

  return <SessionGuard>{children}</SessionGuard>;
}
