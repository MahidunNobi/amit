"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
} from "flowbite-react";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function CompanyUsersPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.accountType !== "company") {
      setError("Unauthorized");
      router.replace("/dashboard");
      return;
    }
    fetch("/api/company/users")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data.users);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [session, status, router]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Company Users</h1>

      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                User Name
              </th>
              <th scope="col" className="px-6 py-3">
                User Email
              </th>           
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user._id}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200"
              >
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                  {user.firstName} {user.lastName}
                </th>
                <td className="px-6 py-4">{user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
