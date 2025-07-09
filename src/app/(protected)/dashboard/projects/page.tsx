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
interface Project {
  _id: string;
  name: string;
  details: string;
  deadline: string;
  employees: Employee[];
}

export default function CompanyProjectsPage() {
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
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
    fetch("/api/company/projects")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch projects");
        const data = await res.json();
        setProjects(data.projects);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [session, status, router]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
console.log(projects)
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Company Projects</h1>
        <Link
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          href={"/dashboard/projects/add"}
        >
          Add Project
        </Link>
      </div>
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Project Name</th>
              <th scope="col" className="px-6 py-3">Details</th>
              <th scope="col" className="px-6 py-3">Deadline</th>
              <th scope="col" className="px-6 py-3">Employees</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr
                key={project._id}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200"
              >
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                  {project.name}
                </th>
                <td className="px-6 py-4">{project.details}</td>
                <td className="px-6 py-4">{new Date(project.deadline).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  {project.employees && project.employees.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {project.employees.map((emp) => (
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 