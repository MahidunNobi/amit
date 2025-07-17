"use client";
import { Label, TextInput, Button, Alert, Card, Spinner, Modal, Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, Select } from "flowbite-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { HiUserAdd, HiUserRemove } from "react-icons/hi";

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface TeamMember {
  employee: Employee;
  role: string;
}

interface Team {
  _id: string;
  name: string;
  teamMembers: TeamMember[];
}

const ROLE_OPTIONS = [
  "General",
  "Developer", 
  "Project Manager",
  "QA",
  "Designer",
  "Team Lead",
  "Scrum Master"
];

export default function TeamsPage() {
  const { status } = useSession();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  // Add team modal state
  const [addTeamModalOpen, setAddTeamModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; employees?: string; common?: string }>({});
  const [employeesModalOpen, setEmployeesModalOpen] = useState(false);
  const [companyUsers, setCompanyUsers] = useState<any[]>([]);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<{ employee: any; role: string }[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [usersInTeams, setUsersInTeams] = useState<string[]>([]);

  // Manage team modal state
  const [manageTeamModalOpen, setManageTeamModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editName, setEditName] = useState("");
  const [editTeamMembers, setEditTeamMembers] = useState<{ employee: any; role: string }[]>([]);
  const [editLoading, setEditLoading] = useState(false);
  const [editFieldErrors, setEditFieldErrors] = useState<{ name?: string; employees?: string; common?: string }>({});
  const [editEmployeesModalOpen, setEditEmployeesModalOpen] = useState(false);
  const [editCompanyUsers, setEditCompanyUsers] = useState<any[]>([]);
  const [editUsersInTeams, setEditUsersInTeams] = useState<string[]>([]);

  useEffect(() => {
    if (status === "loading") return;
    fetch("/api/company/teams")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch teams");
        const data: { teams: Team[] } = await res.json();
        setTeams(data.teams);
      })
      .catch((err: unknown) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [status]);

  const handleDeleteClick = (teamId: string) => {
    setSelectedTeamId(teamId);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTeamId) return;
    setDeletingId(selectedTeamId);
    setModalOpen(false);
    try {
      const res = await fetch("/api/company/teams", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: selectedTeamId }),
      });
      if (!res.ok) throw new Error("Failed to delete team");
      setTeams((prev) => prev.filter((t) => t._id !== selectedTeamId));
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to delete team");
    } finally {
      setDeletingId(null);
      setSelectedTeamId(null);
    }
  };

  const handleCancelDelete = () => {
    setModalOpen(false);
    setSelectedTeamId(null);
  };

  // Add team modal logic
  const openAddTeamModal = () => {
    setName("");
    setFieldErrors({});
    setSelectedTeamMembers([]);
    setAddTeamModalOpen(true);
  };
  const closeAddTeamModal = () => setAddTeamModalOpen(false);

  // Manage team modal logic
  const openManageTeamModal = (team: Team) => {
    setEditingTeam(team);
    setEditName(team.name);
    setEditTeamMembers(team.teamMembers.map(member => ({
      employee: member.employee,
      role: member.role
    })));
    setEditFieldErrors({});
    setManageTeamModalOpen(true);
  };
  const closeManageTeamModal = () => {
    setManageTeamModalOpen(false);
    setEditingTeam(null);
    setEditName("");
    setEditTeamMembers([]);
  };

  // Employee selection modal logic
  const fetchCompanyUsers = async () => {
    setUsersLoading(true);
    setUsersError("");
    try {
      const [usersRes, teamsRes] = await Promise.all([
        fetch("/api/company/users"),
        fetch("/api/company/teams")
      ]);
      const usersData = await usersRes.json();
      const teamsData = await teamsRes.json();
      if (!usersRes.ok) throw new Error(usersData.error || "Failed to fetch users");
      if (!teamsRes.ok) throw new Error(teamsData.message || "Failed to fetch teams");
      setCompanyUsers(usersData.users);
      // Collect all user IDs already in a team
      const inTeams: string[] = [];
      for (const team of teamsData.teams) {
        for (const member of team.teamMembers) {
          inTeams.push(member.employee._id);
        }
      }
      setUsersInTeams(inTeams);
    } catch (err: any) {
      setUsersError(err.message || "Error fetching users");
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchEditCompanyUsers = async () => {
    setUsersLoading(true);
    setUsersError("");
    try {
      const [usersRes, teamsRes] = await Promise.all([
        fetch("/api/company/users"),
        fetch("/api/company/teams")
      ]);
      const usersData = await usersRes.json();
      const teamsData = await teamsRes.json();
      if (!usersRes.ok) throw new Error(usersData.error || "Failed to fetch users");
      if (!teamsRes.ok) throw new Error(teamsData.message || "Failed to fetch teams");
      setEditCompanyUsers(usersData.users);
      // Collect all user IDs already in a team (excluding current team members)
      const inTeams: string[] = [];
      for (const team of teamsData.teams) {
        if (team._id !== editingTeam?._id) {
          for (const member of team.teamMembers) {
            inTeams.push(member.employee._id);
          }
        }
      }
      setEditUsersInTeams(inTeams);
    } catch (err: any) {
      setUsersError(err.message || "Error fetching users");
    } finally {
      setUsersLoading(false);
    }
  };

  const openEmployeesModal = () => {
    setEmployeesModalOpen(true);
    if (companyUsers.length === 0) fetchCompanyUsers();
  };
  const closeEmployeesModal = () => setEmployeesModalOpen(false);
  const handleAddEmployee = (user: any) => {
    if (!selectedTeamMembers.some((member) => member.employee._id === user._id)) {
      setSelectedTeamMembers([...selectedTeamMembers, { employee: user, role: "General" }]);
    }
  };
  const handleRemoveEmployee = (user: any) => {
    setSelectedTeamMembers(selectedTeamMembers.filter((member) => member.employee._id !== user._id));
  };
  const handleRoleChange = (employeeId: string, newRole: string) => {
    setSelectedTeamMembers(prev => 
      prev.map(member => 
        member.employee._id === employeeId 
          ? { ...member, role: newRole }
          : member
      )
    );
  };

  // Edit team member functions
  const openEditEmployeesModal = () => {
    setEditEmployeesModalOpen(true);
    if (editCompanyUsers.length === 0) fetchEditCompanyUsers();
  };
  const closeEditEmployeesModal = () => setEditEmployeesModalOpen(false);
  const handleAddEditEmployee = (user: any) => {
    if (!editTeamMembers.some((member) => member.employee._id === user._id)) {
      setEditTeamMembers([...editTeamMembers, { employee: user, role: "General" }]);
    }
  };
  const handleRemoveEditEmployee = (user: any) => {
    setEditTeamMembers(editTeamMembers.filter((member) => member.employee._id !== user._id));
  };
  const handleEditRoleChange = (employeeId: string, newRole: string) => {
    setEditTeamMembers(prev => 
      prev.map(member => 
        member.employee._id === employeeId 
          ? { ...member, role: newRole }
          : member
      )
    );
  };

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    let hasError = false;
    const newErrors: { name?: string; employees?: string; common?: string } = {};
    if (!name.trim()) {
      newErrors.name = "Team name is required.";
      hasError = true;
    }
    if (selectedTeamMembers.length === 0) {
      newErrors.employees = "At least one employee is required.";
      hasError = true;
    }
    if (hasError) {
      setFieldErrors(newErrors);
      return;
    }
    setAddLoading(true);
    const res = await fetch("/api/company/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        teamMembers: selectedTeamMembers.map((member) => ({
          employee: member.employee._id,
          role: member.role,
        })),
      }),
    });
    setAddLoading(false);
    const data = await res.json();
    if (!res.ok) {
      setFieldErrors({ common: data.message || "Something went wrong!" });
      return;
    }
    setAddTeamModalOpen(false);
    // Refresh teams list
    setLoading(true);
    fetch("/api/company/teams")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch teams");
        const data: { teams: Team[] } = await res.json();
        setTeams(data.teams);
      })
      .catch((err: unknown) => setError((err as Error).message))
      .finally(() => setLoading(false));
  };

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;
    
    setEditFieldErrors({});
    let hasError = false;
    const newErrors: { name?: string; employees?: string; common?: string } = {};
    if (!editName.trim()) {
      newErrors.name = "Team name is required.";
      hasError = true;
    }
    if (editTeamMembers.length === 0) {
      newErrors.employees = "At least one employee is required.";
      hasError = true;
    }
    if (hasError) {
      setEditFieldErrors(newErrors);
      return;
    }
    setEditLoading(true);
    const res = await fetch("/api/company/teams", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teamId: editingTeam._id,
        name: editName,
        teamMembers: editTeamMembers.map((member) => ({
          employee: member.employee._id,
          role: member.role,
        })),
      }),
    });
    setEditLoading(false);
    const data = await res.json();
    if (!res.ok) {
      setEditFieldErrors({ common: data.message || "Something went wrong!" });
      return;
    }
    setManageTeamModalOpen(false);
    // Refresh teams list
    setLoading(true);
    fetch("/api/company/teams")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch teams");
        const data: { teams: Team[] } = await res.json();
        setTeams(data.teams);
      })
      .catch((err: unknown) => setError((err as Error).message))
      .finally(() => setLoading(false));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Teams</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={openAddTeamModal}
        >
          Create Team
        </button>
      </div>
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Team Name
              </th>
              <th scope="col" className="px-6 py-3">
                Members & Roles
              </th>
              <th scope="col" className="px-6 py-3">
                Actions
              </th>
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
                  {team.teamMembers && team.teamMembers.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {team.teamMembers.map((member) => (
                        <span
                          key={member.employee._id}
                          className="inline-block bg-blue-600 dark:bg-blue-800 text-white rounded px-2 py-1 text-xs"
                          title={`${member.employee.firstName} ${member.employee.lastName} - ${member.role}`}
                        >
                          {member.employee.firstName} {member.employee.lastName} ({member.role})
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">No members</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 cursor-pointer"
                      onClick={() => openManageTeamModal(team)}
                    >
                      Manage
                    </button>
                    <button
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                      onClick={() => handleDeleteClick(team._id)}
                      disabled={deletingId === team._id}
                    >
                      {deletingId === team._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Add Team Modal */}
      <Modal show={addTeamModalOpen} onClose={closeAddTeamModal} size="md" popup>
        <div className="w-full max-w-lg mx-auto">
          <Card className="w-full shadow-none bg-transparent! border-none">
            <form onSubmit={handleAddTeam} className="space-y-4">
              <h1 className="text-2xl font-bold text-center mb-4">Create Team</h1>
              {fieldErrors.common && (
                <Alert color="failure">{fieldErrors.common}</Alert>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Team Name input */}
                <div className="md:col-span-2">
                  {/* Team's name */}
                  <Label htmlFor="name" color={fieldErrors.name ? "failure" : undefined}>Team Name</Label>
                  <TextInput
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    color={fieldErrors.name ? "failure" : undefined}
                    placeholder="Team Name"
                  />
                  {fieldErrors.name && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>
                  )}
                </div>
                {/* Team Members input */}
                <div className="md:col-span-2">
                  {/* Team's members */}
                  <Label color={fieldErrors.employees ? "failure" : undefined}>Team Members</Label>
                  <div className="space-y-2 mb-2">
                    {selectedTeamMembers.map((member) => (
                      <div key={member.employee._id} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded p-2">
                        <span className="flex-1 text-sm">
                          {member.employee.firstName} {member.employee.lastName}
                        </span>
                        <Select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.employee._id, e.target.value)}
                          className="w-32"
                        >
                          {ROLE_OPTIONS.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </Select>
                        <button 
                          type="button" 
                          className="text-red-500 cursor-pointer" 
                          onClick={() => handleRemoveEmployee(member.employee)}
                          title="Remove"
                        >
                          <HiUserRemove />
                        </button>
                      </div>
                    ))}
                    <Button type="button" size="xs" color="alternative" onClick={openEmployeesModal} className="cursor-pointer">
                      <HiUserAdd className="mr-1" /> Add members
                    </Button>
                  </div>
                  {fieldErrors.employees && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.employees}</p>
                  )}
                </div>
              </div>
              <Button type="submit" color="blue" className="w-full cursor-pointer" disabled={addLoading}>
                {addLoading ? (
                  <><Spinner size="sm" aria-label="Loading" /> <span className="pl-2">Loading...</span></>
                ) : (
                  'Create Team'
                )}
              </Button>
              <Button
                onClick={closeAddTeamModal}
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
        {/* Employee selection modal (nested) */}
        <Modal show={employeesModalOpen} onClose={closeEmployeesModal} size="lg" popup>
          <div className="p-6 bg-white dark:bg-gray-900 rounded-lg">
            <h3 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-100">Select Team Members</h3>
            {usersLoading ? (
              <div className="text-center py-4 text-gray-700 dark:text-gray-200">Loading users...</div>
            ) : usersError ? (
              <div className="text-center text-red-500 py-4">{usersError}</div>
            ) : (
              <Table className="bg-white dark:bg-gray-800 rounded-lg relative overflow-hidden">
                <TableHead className="bg-gray-100 dark:bg-gray-800 *:px-3">
                  <tr>
                    <TableHeadCell className="text-gray-700 dark:text-gray-200">First Name</TableHeadCell>
                    <TableHeadCell className="text-gray-700 dark:text-gray-200">Last Name</TableHeadCell>
                    <TableHeadCell className="text-gray-700 dark:text-gray-200">Email</TableHeadCell>
                    <TableHeadCell className="text-gray-700 dark:text-gray-200">Add</TableHeadCell>
                  </tr>
                </TableHead>
                <TableBody>
                  {companyUsers.map((user) => {
                    const inTeam = usersInTeams.includes(user._id);
                    const alreadySelected = selectedTeamMembers.some((member) => member.employee._id === user._id);
                    return (
                      <TableRow
                        key={user._id}
                        className={
                          inTeam
                            ? "bg-gray-200 dark:bg-gray-700 *:px-3"
                            : alreadySelected
                              ? "bg-green-100 dark:bg-green-900 *:px-3"
                              : "hover:bg-gray-50 dark:hover:bg-gray-700 *:px-3"
                        }
                      >
                        <TableCell className="text-gray-800 dark:text-gray-100">{user.firstName}</TableCell>
                        <TableCell className="text-gray-800 dark:text-gray-100">{user.lastName}</TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-300">{user.email}</TableCell>
                        <TableCell>
                          <Button
                            size="xs"
                            className={
                              inTeam
                                ? "bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed"
                                : alreadySelected
                                  ? "bg-green-500 dark:bg-green-700 text-white cursor-pointer"
                                  : "bg-blue-500 dark:bg-blue-700 text-white cursor-pointer"
                            }
                            disabled={inTeam || alreadySelected}
                            onClick={() => handleAddEmployee(user)}
                          >
                            {inTeam ? "In a Team" : alreadySelected ? "Added" : "Add"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
            <div className="flex justify-end mt-4">
              <Button
                color="gray"
                onClick={closeEmployeesModal}
                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 cursor-pointer"
              >
                Done
              </Button>
            </div>
          </div>
        </Modal>
      </Modal>

      {/* Manage Team Modal */}
      <Modal show={manageTeamModalOpen} onClose={closeManageTeamModal} size="md" popup>
        <div className="w-full max-w-lg mx-auto">
          <Card className="w-full shadow-none bg-transparent! border-none">
            <form onSubmit={handleUpdateTeam} className="space-y-4">
              <h1 className="text-2xl font-bold text-center mb-4">Manage Team</h1>
              {editFieldErrors.common && (
                <Alert color="failure">{editFieldErrors.common}</Alert>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Team Name input */}
                <div className="md:col-span-2">
                  <Label htmlFor="editName" color={editFieldErrors.name ? "failure" : undefined}>Team Name</Label>
                  <TextInput
                    id="editName"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    color={editFieldErrors.name ? "failure" : undefined}
                    placeholder="Team Name"
                  />
                  {editFieldErrors.name && (
                    <p className="text-red-500 text-xs mt-1">{editFieldErrors.name}</p>
                  )}
                </div>
                {/* Team Members input */}
                <div className="md:col-span-2">
                  <Label color={editFieldErrors.employees ? "failure" : undefined}>Team Members</Label>
                  <div className="space-y-2 mb-2">
                    {editTeamMembers.map((member) => (
                      <div key={member.employee._id} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded p-2">
                        <span className="flex-1 text-sm">
                          {member.employee.firstName} {member.employee.lastName}
                        </span>
                        <Select
                          value={member.role}
                          onChange={(e) => handleEditRoleChange(member.employee._id, e.target.value)}
                          className="w-32"
                        >
                          {ROLE_OPTIONS.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </Select>
                        <button 
                          type="button" 
                          className="text-red-500 cursor-pointer" 
                          onClick={() => handleRemoveEditEmployee(member.employee)}
                          title="Remove"
                        >
                          <HiUserRemove />
                        </button>
                      </div>
                    ))}
                    <Button type="button" size="xs" color="alternative" onClick={openEditEmployeesModal} className="cursor-pointer">
                      <HiUserAdd className="mr-1" /> Add members
                    </Button>
                  </div>
                  {editFieldErrors.employees && (
                    <p className="text-red-500 text-xs mt-1">{editFieldErrors.employees}</p>
                  )}
                </div>
              </div>
              <Button type="submit" color="blue" className="w-full cursor-pointer" disabled={editLoading}>
                {editLoading ? (
                  <><Spinner size="sm" aria-label="Loading" /> <span className="pl-2">Loading...</span></>
                ) : (
                  'Update Team'
                )}
              </Button>
              <Button
                onClick={closeManageTeamModal}
                type="button"
                color="red"
                className="w-full cursor-pointer"
                disabled={editLoading}
              >
                Cancel
              </Button>
            </form>
          </Card>
        </div>
        {/* Edit Employee selection modal (nested) */}
        <Modal show={editEmployeesModalOpen} onClose={closeEditEmployeesModal} size="lg" popup>
          <div className="p-6 bg-white dark:bg-gray-900 rounded-lg">
            <h3 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-100">Select Team Members</h3>
            {usersLoading ? (
              <div className="text-center py-4 text-gray-700 dark:text-gray-200">Loading users...</div>
            ) : usersError ? (
              <div className="text-center text-red-500 py-4">{usersError}</div>
            ) : (
              <Table className="bg-white dark:bg-gray-800 rounded-lg relative overflow-hidden">
                <TableHead className="bg-gray-100 dark:bg-gray-800 *:px-3">
                  <tr>
                    <TableHeadCell className="text-gray-700 dark:text-gray-200">First Name</TableHeadCell>
                    <TableHeadCell className="text-gray-700 dark:text-gray-200">Last Name</TableHeadCell>
                    <TableHeadCell className="text-gray-700 dark:text-gray-200">Email</TableHeadCell>
                    <TableHeadCell className="text-gray-700 dark:text-gray-200">Add</TableHeadCell>
                  </tr>
                </TableHead>
                <TableBody>
                  {editCompanyUsers.map((user) => {
                    const inTeam = editUsersInTeams.includes(user._id);
                    const alreadySelected = editTeamMembers.some((member) => member.employee._id === user._id);
                    return (
                      <TableRow
                        key={user._id}
                        className={
                          inTeam
                            ? "bg-gray-200 dark:bg-gray-700 *:px-3"
                            : alreadySelected
                              ? "bg-green-100 dark:bg-green-900 *:px-3"
                              : "hover:bg-gray-50 dark:hover:bg-gray-700 *:px-3"
                        }
                      >
                        <TableCell className="text-gray-800 dark:text-gray-100">{user.firstName}</TableCell>
                        <TableCell className="text-gray-800 dark:text-gray-100">{user.lastName}</TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-300">{user.email}</TableCell>
                        <TableCell>
                          <Button
                            size="xs"
                            className={
                              inTeam
                                ? "bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed"
                                : alreadySelected
                                  ? "bg-green-500 dark:bg-green-700 text-white cursor-pointer"
                                  : "bg-blue-500 dark:bg-blue-700 text-white cursor-pointer"
                            }
                            disabled={inTeam || alreadySelected}
                            onClick={() => handleAddEditEmployee(user)}
                          >
                            {inTeam ? "In a Team" : alreadySelected ? "Added" : "Add"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
            <div className="flex justify-end mt-4">
              <Button
                color="gray"
                onClick={closeEditEmployeesModal}
                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 cursor-pointer"
              >
                Done
              </Button>
            </div>
          </div>
        </Modal>
      </Modal>

      {/* Delete Team Modal (existing) */}
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
            Are you sure you want to delete this team?
          </h3>
          <div className="flex justify-center gap-4">
            <Button
              color="failure"
              onClick={handleConfirmDelete}
              disabled={!!deletingId}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50 cursor-pointer"
            >
              {deletingId ? "Deleting..." : "Yes, delete"}
            </Button>
            <Button
              color="gray"
              onClick={handleCancelDelete}
              disabled={!!deletingId}
            >
              No, cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
