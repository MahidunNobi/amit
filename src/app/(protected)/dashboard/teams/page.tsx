"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}
interface Team {
  _id: string;
  name: string;
  employees: Employee[];
}

export default function TeamsPage() {
  const { data: session, status } = useSession();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.accountType !== "company") {
      setError("Unauthorized");
      router.replace("/dashboard");
      return;
    }
    fetch("/api/company/teams")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch teams");
        const data = await res.json();
        setTeams(data.teams);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [session, status, router]);

  const handleDelete = async (teamId: string) => {
    if (!window.confirm("Are you sure you want to delete this team?")) return;
    setDeletingId(teamId);
    try {
      const res = await fetch("/api/company/teams", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId }),
      });
      if (!res.ok) throw new Error("Failed to delete team");
      setTeams((prev) => prev.filter((t) => t._id !== teamId));
    } catch (err: any) {
      setError(err.message || "Failed to delete team");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Teams</h1>
        <Link
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          href={"/dashboard/teams/add"}
        >
          Create Team
        </Link>
      </div>
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Team Name</th>
              <th scope="col" className="px-6 py-3">Employees</th>
              <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => (
              <tr
                key={team._id}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200"
              >
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                  {team.name}
                </th>
                <td className="px-6 py-4">
                  {team.employees && team.employees.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {team.employees.map((emp) => (
                        <span
                          key={emp._id}
                          className="inline-block bg-blue-600 dark:bg-blue-800 text-white rounded px-2 py-1 text-xs"
                        >
                          {emp.firstName} {emp.lastName}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">No employees</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                    onClick={() => handleDelete(team._id)}
                    disabled={deletingId === team._id}
                  >
                    {deletingId === team._id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 