"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Label, TextInput, Button, Alert, Card, Spinner, Textarea } from "flowbite-react";
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
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; details?: string; deadline?: string; employees?: string; common?: string }>({});

  // Employee selection state
  const [employeesModalOpen, setEmployeesModalOpen] = useState(false);
  const [companyUsers, setCompanyUsers] = useState<any[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  console.log(companyUsers)
  // Fetch company users when modal opens
  const fetchCompanyUsers = async () => {
    setUsersLoading(true);
    setUsersError("");
    try {
      const res = await fetch("/api/company/users");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch users");
      setCompanyUsers(data.users);
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
    if (!selectedEmployees.some((u) => u._id === user._id)) {
      setSelectedEmployees([...selectedEmployees, user]);
    }
  };

  const handleRemoveEmployee = (user: any) => {
    setSelectedEmployees(selectedEmployees.filter((u) => u._id !== user._id));
  };

  if (status === "loading") return <div>Loading...</div>;
  if (!session || session.accountType !== "company") {
    return <div>Unauthorized</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setError("");
    let hasError = false;
    const newErrors: { name?: string; details?: string; deadline?: string; employees?: string; common?: string } = {};
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
    if (selectedEmployees.length === 0) {
      newErrors.employees = "At least one employee is required.";
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
        employees: selectedEmployees.map((u) => u._id),
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
            <Label color={fieldErrors.employees ? "failure" : undefined}>Employees</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedEmployees.map((user) => (
                <span key={user._id} className="flex items-center bg-gray-600 rounded px-2 py-1 text-xs">
                  {user.firstName} {user.lastName}
                  <button type="button" className="ml-1 text-red-500 cursor-pointer" onClick={() => handleRemoveEmployee(user)} title="Remove">
                    <HiUserRemove />
                  </button>
                </span>
              ))}
              <Button type="button" size="xs" color="alternative" onClick={openEmployeesModal} className="cursor-pointer">
                <HiUserAdd className="mr-1" /> Add employees
              </Button>
            </div>
            {fieldErrors.employees && (
              <p className="text-red-500 text-xs mt-1" style={errorFadeIn}>{fieldErrors.employees}</p>
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
      {/* Employee selection modal */}
      <Modal show={employeesModalOpen} onClose={closeEmployeesModal} size="lg" popup>
        <div className="p-6 bg-white dark:bg-gray-900 rounded-lg">
          <h3 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-100">Select Employees</h3>
          {usersLoading ? (
            <div className="text-center py-4 text-gray-700 dark:text-gray-200">Loading users...</div>
          ) : usersError ? (
            <div className="text-center text-red-500 py-4">{usersError}</div>
          ) : (
            <Table className="bg-white dark:bg-gray-800 rounded-lg relative overflow-hidden">
              <TableHead className="bg-gray-100 dark:bg-gray-800 *:px-3">
                <TableHeadCell className="text-gray-700 dark:text-gray-200">Name</TableHeadCell>
                <TableHeadCell className="text-gray-700 dark:text-gray-200">Email</TableHeadCell>
                <TableHeadCell className="text-gray-700 dark:text-gray-200">Add</TableHeadCell>
              </TableHead>
              <TableBody>
             
                {companyUsers.map((user) => (
                  <TableRow
                    key={user._id}
                    className={
                      selectedEmployees.some((u) => u._id === user._id)
                        ? "bg-green-100 dark:bg-green-900 *:px-3"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700 *:px-3"
                    }
                  >
                    <TableCell className="text-gray-800 dark:text-gray-100">{user.firstName} {user.lastName}</TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-300">{user.email}</TableCell>
                    <TableCell>
                      {selectedEmployees.some((u) => u._id === user._id) ? (
                        <Button size="xs" color="success" disabled className="bg-green-500 dark:bg-green-700 text-white cursor-pointer">Added</Button>
                      ) : (
                        <Button size="xs" color="info" onClick={() => handleAddEmployee(user)} className="bg-blue-500 dark:bg-blue-700 text-white cursor-pointer">Add</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <div className="flex justify-end mt-4">
            <Button color="gray" onClick={closeEmployeesModal} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 cursor-pointer">Done</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 