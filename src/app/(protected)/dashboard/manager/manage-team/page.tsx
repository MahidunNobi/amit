"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Spinner, Alert } from "flowbite-react";
import AddTaskModal from "@/UIModels/AddTaskModel";

interface TeamMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  team_id: string;
}

export default function TeamMembersPage() {
  const { data: session, status } = useSession();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const [openModalForAddTask, setOpenModalForAddTask] = useState<{
    member_id: string;
    team_id: string;
  } | null>();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }

    fetch("/api/teams/my-team")
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Failed to fetch team members");
        }
        const data = await res.json();

        setTeamMembers(
          data.teamMembers.map((tm: any) => ({
            _id: tm.employee._id,
            firstName: tm.employee.firstName,
            lastName: tm.employee.lastName,
            email: tm.employee.email,
            role: tm.role,
            team_id: data.team_id,
          }))
        );
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [session, status, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert color="failure" className="mt-4">
        {error}
      </Alert>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Team Members</h1>
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3"> Action</th>
            </tr>
          </thead>
          <tbody>
            {teamMembers.map((member) => (
              <tr
                key={member._id}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
              >
                <td className="px-6 py-4">
                  {member.firstName} {member.lastName}
                </td>
                <td className="px-6 py-4">{member.email}</td>
                <td className="px-6 py-4">{member.role}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() =>
                      setOpenModalForAddTask({
                        member_id: member._id,
                        team_id: member.team_id,
                      })
                    }
                    className="px-3 py-1 bg-indigo-600 text-white rounded"
                  >
                    Add Task
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AddTaskModal
        show={Boolean(openModalForAddTask?.member_id)}
        onClose={() => setOpenModalForAddTask(null)}
        memberId={openModalForAddTask?.member_id || ""}
        teamId={openModalForAddTask?.team_id || ""}
      />
    </div>
  );
}
