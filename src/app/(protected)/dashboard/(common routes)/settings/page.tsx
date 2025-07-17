import { validateSession } from "@/actions/validateSession";
import DeleteAccountButton from "@/components/settings/DeleteAccountButton";

export default async function SettingsPage() {
  await validateSession();
  return (
    <div className="max-w-xl mx-auto mt-12 p-6 bg-white dark:bg-gray-900 rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <section>
        <h2 className="text-lg font-semibold mb-2">Danger Zone</h2>
        <DeleteAccountButton />
      </section>
    </div>
  );
} 