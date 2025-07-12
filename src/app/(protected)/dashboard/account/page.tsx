"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, Spinner, Alert } from "flowbite-react";
import { HiUser, HiUsers, HiBriefcase, HiCog } from "react-icons/hi";

interface UserAccount {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  team: string | null;
  teamRole: string | null;
  project?: {
    name: string;
    details: string;
    deadline: string;
  } | null;
}

export default function AccountPage() {
  const { data: session, status } = useSession();
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session) return;

    fetch("/api/company-user/account")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch account information");
        const data = await res.json();
        setUserAccount(data.user);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [session, status]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert color="failure">
          <span className="font-medium">Error!</span> {error}
        </Alert>
      </div>
    );
  }

  if (!userAccount) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert color="failure">
          <span className="font-medium">Error!</span> User account not found
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <HiUser className="text-2xl text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Account</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <HiUser className="text-xl text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Personal Information</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {userAccount.firstName} {userAccount.lastName}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{userAccount.email}</p>
            </div>
          </div>
        </Card>

        {/* Role Information */}
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <HiCog className="text-xl text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Company Role</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Role</label>
              <div className="mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {userAccount.role}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Team Information */}
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <HiUsers className="text-xl text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Team Information</h2>
          </div>
          <div className="space-y-3">
            {userAccount.team ? (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Team Name</label>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      {userAccount.team}
                    </span>
                  </div>
                </div>
                {userAccount.teamRole && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Team Role</label>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {userAccount.teamRole}
                      </span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Team</label>
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    Not Assigned
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Project Information */}
        <Card className="hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-3">
          <div className="flex items-center gap-3 mb-4">
            <HiBriefcase className="text-xl text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Current Project</h2>
          </div>
          <div className="space-y-3">
            {userAccount.project ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Project Name</label>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">{userAccount.project.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Deadline</label>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {new Date(userAccount.project.deadline).toLocaleDateString()}
                  </p>
                </div>
                <div className="md:col-span-3">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Project Details</label>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">{userAccount.project.details}</p>
                </div>
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Project</label>
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    No Project Assigned
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
} 