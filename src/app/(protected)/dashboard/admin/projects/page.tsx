"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ITeam } from "@/models/Team";
import { Label, TextInput, Button, Alert, Card, Spinner, Modal, Textarea, Select } from "flowbite-react";
import { validateName } from "@/lib/nameValidation";

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

  // Add project modal state
  const [addProjectModalOpen, setAddProjectModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [deadline, setDeadline] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; details?: string; deadline?: string; team?: string; common?: string }>({});
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");

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
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to delete project");
      } else {
        setError("Failed to delete project");
      }
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
      .catch((err: unknown) => {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to fetch projects");
        }
      })
      .finally(() => setLoading(false));
  }, [session, status, router]);

  // Fetch teams for the add project modal
  const openAddProjectModal = () => {
    setName("");
    setDetails("");
    setDeadline("");
    setSelectedTeam("");
    setFieldErrors({});
    setAddProjectModalOpen(true);
    fetch("/api/company/teams")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch teams");
        const data = await res.json();
        setTeams(data.teams);
      })
      .catch(() => setTeams([]));
  };
  const closeAddProjectModal = () => setAddProjectModalOpen(false);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    let hasError = false;
    const newErrors: { name?: string; details?: string; deadline?: string; team?: string; common?: string } = {};
    // Validate name
    const nameMsg = validateName(name);
    if (nameMsg) {
      newErrors.name = nameMsg;
      hasError = true;
    }
    if (!details.trim()) {
      newErrors.details = "Details are required.";
      hasError = true;
    }
    if (!deadline) {
      newErrors.deadline = "Deadline is required.";
      hasError = true;
    }
    if (!selectedTeam) {
      newErrors.team = "Team is required.";
      hasError = true;
    }
    if (hasError) {
      setFieldErrors(newErrors);
      return;
    }
    setAddLoading(true);
    const res = await fetch("/api/company/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        details,
        deadline,
        team: selectedTeam,
      }),
    });
    setAddLoading(false);
    const data = await res.json();
    if (!res.ok) {
      setFieldErrors({ common: data.message || "Something went wrong!" });
      return;
    }
    setAddProjectModalOpen(false);
    // Refresh projects list
    setLoading(true);
    fetch("/api/company/projects")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch projects");
        const data = await res.json();        
        setProjects(data.projects);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to fetch projects");
        }
      })
      .finally(() => setLoading(false));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Company Projects</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={openAddProjectModal}
        >
          Add Project
        </button>
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
      {/* Add Project Modal */}
      <Modal show={addProjectModalOpen} onClose={closeAddProjectModal} size="md" popup>
        <div className="w-full max-w-lg mx-auto">
          <Card className="w-full shadow-none bg-transparent! border-none">
            <form onSubmit={handleAddProject} className="space-y-4">
              <h1 className="text-2xl font-bold text-center mb-4">Add Project</h1>
              {fieldErrors.common && (
                <Alert color="failure">{fieldErrors.common}</Alert>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Project Name input */}
                <div className="md:col-span-2">
                  {/* Project's name */}
                  <Label htmlFor="name" color={fieldErrors.name ? "failure" : undefined}>Project Name</Label>
                  <TextInput
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    color={fieldErrors.name ? "failure" : undefined}
                    placeholder="Project Name"
                  />
                  {fieldErrors.name && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>
                  )}
                </div>
                {/* Details input */}
                <div className="md:col-span-2">
                  {/* Project's details */}
                  <Label htmlFor="details" color={fieldErrors.details ? "failure" : undefined}>Details</Label>
                  <Textarea
                    id="details"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    color={fieldErrors.details ? "failure" : undefined}
                    placeholder="Project Details"
                  />
                  {fieldErrors.details && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.details}</p>
                  )}
                </div>
                {/* Deadline input */}
                <div>
                  {/* Project's deadline */}
                  <Label htmlFor="deadline" color={fieldErrors.deadline ? "failure" : undefined}>Deadline</Label>
                  <TextInput
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    color={fieldErrors.deadline ? "failure" : undefined}
                  />
                  {fieldErrors.deadline && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.deadline}</p>
                  )}
                </div>
                {/* Team input */}
                <div>
                  {/* Project's team */}
                  <Label htmlFor="team" color={fieldErrors.team ? "failure" : undefined}>Team</Label>
                  <Select
                    id="team"
                    value={selectedTeam}
                    onChange={e => setSelectedTeam(e.target.value)}
                    color={fieldErrors.team ? "failure" : undefined}
                    required
                  >
                    <option value="">Select a team</option>
                    {teams.map((team:ITeam) => (
                      <option key={team._id} value={team._id}>{team.name}</option>
                    ))}
                  </Select>
                  {fieldErrors.team && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.team}</p>
                  )}
                </div>
              </div>
              <Button type="submit" color="blue" className="w-full cursor-pointer" disabled={addLoading}>
                {addLoading ? (
                  <><Spinner size="sm" aria-label="Loading" /> <span className="pl-2">Loading...</span></>
                ) : (
                  'Add Project'
                )}
              </Button>
              <Button
                onClick={closeAddProjectModal}
                type="button"
                color="red"
                className="w-full cursor-pointer"
                disabled={addLoading}
              >
                Cancel
              </Button>
            </form>
          </Card>
        </div>
      </Modal>
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
