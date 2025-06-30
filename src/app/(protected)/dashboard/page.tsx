import { validateSession } from '@/actions/validateSession';
import Dashboard from '@/components/Dashboard';

export default async function DashboardPage() {
  await validateSession();
  return <Dashboard />;
}
