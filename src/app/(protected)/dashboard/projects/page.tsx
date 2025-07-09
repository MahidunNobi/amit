"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ITeam } from "@/models/Team";
import { Button, Modal } from "flowbite-react";

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
  team: ITeam;
}

export default function CompanyProjectsPage() {
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const router = useRouter();

  const handleDeleteClick = (projectId: string) => {
    setSelectedProjectId(projectId);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProjectId) return;
    setDeletingId(selectedProjectId);
    setModalOpen(false);
    try {
      const res = await fetch("/api/company/projects", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: selectedProjectId }),
      });
      if (!res.ok) throw new Error("Failed to delete project");
      setProjects((prev) => prev.filter((p) => p._id !== selectedProjectId));
    } catch (err: any) {
      setError(err.message || "Failed to delete project");
    } finally {
      setDeletingId(null);
      setSelectedProjectId(null);
    }
  };

  const handleCancelDelete = () => {
    setModalOpen(false);
    setSelectedProjectId(null);
  };

  useEffect(() => {    
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
              <th scope="col" className="px-6 py-3">
                Project Name
              </th>
              <th scope="col" className="px-6 py-3">
                Details
              </th>
              <th scope="col" className="px-6 py-3">
                Deadline
              </th>
              <th scope="col" className="px-6 py-3">
                Team
              </th>
              <th scope="col" className="px-6 py-3">Actions</th>
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
                <td className="px-6 py-4">
                  {new Date(project.deadline).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  {project.team ? (
                    <div className="flex flex-wrap gap-1">
                      <span className="inline-block bg-blue-600 dark:bg-blue-800 text-white rounded px-2 py-1 text-xs">
                        {project.team.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400">No Team</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                    onClick={() => handleDeleteClick(project._id)}
                    disabled={deletingId === project._id}
                  >
                    {deletingId === project._id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal show={modalOpen} onClose={handleCancelDelete} popup>
        <div className="text-center p-6">
          <svg
            aria-hidden="true"
            className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.054 0 1.918-.816 1.995-1.85l.007-.15V6c0-1.054-.816-1.918-1.85-1.995L19 4H5c-1.054 0-1.918.816-1.995 1.85L3 6v12c0 1.054.816 1.918 1.85 1.995L5 20zm7-8V9a4 4 0 10-8 0v3m8 0v3m0 0a4 4 0 108 0v-3m-8 0V9a4 4 0 018 0v3"
            />
          </svg>
          <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
            Are you sure you want to delete this project?
          </h3>
          <div className="flex justify-center gap-4">
            <Button color="failure" onClick={handleConfirmDelete} disabled={!!deletingId} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50 cursor-pointer">
              {deletingId ? "Deleting..." : "Yes, delete"}
            </Button>
            <Button color="gray" onClick={handleCancelDelete} disabled={!!deletingId}>
              No, cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
