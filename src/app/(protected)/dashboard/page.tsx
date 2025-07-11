import { validateSession } from '@/actions/validateSession';
import Dashboard from '@/components/Dashboard/Dashboard';

export default async function DashboardPage() {
  await validateSession();
  return <Dashboard />;
}
