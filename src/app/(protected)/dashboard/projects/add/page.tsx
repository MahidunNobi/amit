"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Label, TextInput, Button, Alert, Card, Spinner, Textarea, Select } from "flowbite-react";
import { validateName } from "@/lib/nameValidation";
import { Modal, Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell } from "flowbite-react";
import { HiUserAdd, HiUserRemove } from "react-icons/hi";

const errorFadeIn = {
  animation: "fadeIn 0.3s",
};

export default function AddProjectPage() {
  const { data: session, status } = useSession();
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; details?: string; deadline?: string; team?: string; common?: string }>({});

  // Team selection state
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");

  useEffect(() => {
    // Fetch teams for the dropdown
    fetch("/api/company/teams")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch teams");
        const data = await res.json();
        setTeams(data.teams);
      })
      .catch(() => setTeams([]));
  }, []);

  if (status === "loading") return <div>Loading...</div>;
  if (!session || session.accountType !== "company") {
    return <div>Unauthorized</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setError("");
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
    setLoading(true);
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
    setLoading(false);
    const data = await res.json();
    if (!res.ok) {
      setFieldErrors({ common: data.message || "Something went wrong!" });
      return;
    }
    router.push("/dashboard/projects");
  };
  return (
    <div className="flex items-center justify-center min-h-screen">
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
      <Card className="w-full max-w-sm p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h1 className="text-2xl font-bold text-center mb-4">Add Project</h1>
          {fieldErrors.common && (
            <Alert color="failure" style={errorFadeIn}>{fieldErrors.common}</Alert>
          )}
          <div>
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
              <p className="text-red-500 text-xs mt-1" style={errorFadeIn}>{fieldErrors.name}</p>
            )}
          </div>
          <div>
            <Label htmlFor="details" color={fieldErrors.details ? "failure" : undefined}>Details</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              color={fieldErrors.details ? "failure" : undefined}
              placeholder="Project Details"
            />
            {fieldErrors.details && (
              <p className="text-red-500 text-xs mt-1" style={errorFadeIn}>{fieldErrors.details}</p>
            )}
          </div>
          <div>
            <Label htmlFor="deadline" color={fieldErrors.deadline ? "failure" : undefined}>Deadline</Label>
            <TextInput
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              color={fieldErrors.deadline ? "failure" : undefined}
            />
            {fieldErrors.deadline && (
              <p className="text-red-500 text-xs mt-1" style={errorFadeIn}>{fieldErrors.deadline}</p>
            )}
          </div>
          <div>
            <Label htmlFor="team" color={fieldErrors.team ? "failure" : undefined}>Team</Label>
            <Select
              id="team"
              value={selectedTeam}
              onChange={e => setSelectedTeam(e.target.value)}
              color={fieldErrors.team ? "failure" : undefined}
              required
            >
              <option value="">Select a team</option>
              {teams.map((team) => (
                <option key={team._id} value={team._id}>{team.name}</option>
              ))}
            </Select>
            {fieldErrors.team && (
              <p className="text-red-500 text-xs mt-1" style={errorFadeIn}>{fieldErrors.team}</p>
            )}
          </div>
          <Button type="submit" color="blue" className="w-full cursor-pointer" disabled={loading}>
            {loading ? (
              <><Spinner size="sm" aria-label="Loading" /> <span className="pl-2">Loading...</span></>
            ) : (
              'Add Project'
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
} 