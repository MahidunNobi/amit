"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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
        console.log(data);
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
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Email</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td className="border px-4 py-2">{user.firstName} {user.lastName}</td>
              <td className="border px-4 py-2">{user.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 