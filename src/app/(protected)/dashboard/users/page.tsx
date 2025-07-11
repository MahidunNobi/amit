"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Label,
  TextInput,
  Button,
  Alert,
  Card,
  Spinner,
  Modal,
} from "flowbite-react";
import PhoneInput from "react-phone-number-input";
import PasswordInput from "@/components/PasswordInput";

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
  const [modalOpen, setModalOpen] = useState(false);
  // Add user form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [number, setNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) return;
    fetch("/api/company/users")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data.users);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [session, status, router]);

  const handleOpenModal = () => {
    setFirstName("");
    setLastName("");
    setNumber("");
    setEmail("");
    setPassword("");
    setFormError("");
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);
    if (!session) {
      setFormError("Unauthorized");
      setFormLoading(false);
      return;
    }
    const res = await fetch("/api/company-user/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName,
        lastName,
        number,
        companyName: session.user.name,
        email,
        password,
      }),
    });
    setFormLoading(false);
    const data = await res.json();
    if (!res.ok) {
      setFormError(data.message || "Something went wrong!");
      return;
    }
    // Refresh users list
    setModalOpen(false);
    setLoading(true);
    fetch("/api/company/users")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data.users);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Company Users</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
          onClick={handleOpenModal}
        >
          Add User
        </button>
      </div>
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
      {/* Add User Modal */}
      <Modal show={modalOpen} onClose={handleCloseModal} size="md" popup>
        <div className="w-full max-w-sm mx-auto">
          <Card className="w-full shadow-none bg-transparent! border-none">
            <form onSubmit={handleAddUser} className="space-y-4">
              <h1 className="text-2xl font-bold text-center mb-4">Add User</h1>
              {formError && <Alert color="failure">{formError}</Alert>}
              {/* User details inputs in 2-column grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name input */}
                <div>
                  {/* User's first name */}
                  <Label htmlFor="firstName">First Name</Label>
                  <TextInput
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    placeholder="First Name"
                  />
                </div>
                {/* Last Name input */}
                <div>
                  {/* User's last name */}
                  <Label htmlFor="lastName">Last Name</Label>
                  <TextInput
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    placeholder="Last Name"
                  />
                </div>
                {/* Number input */}

                <div className="md:col-span-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>

                  <PhoneInput
                    placeholder="Enter phone number"
                    value={number}
                    onChange={(value) => setNumber(value?.toString() || "")}
                    className="[&>input]:block [&>input]:w-full [&>input]:border [&>input]:focus:outline-none [&>input]:focus:ring-1 [&>input]:disabled:cursor-not-allowed [&>input]:disabled:opacity-50 [&>input]:border-gray-300 [&>input]:bg-gray-50 [&>input]:text-gray-900 [&>input]:placeholder-gray-500 [&>input]:focus:border-primary-500 [&>input]:focus:ring-primary-500 [&>input]:dark:border-gray-600 [&>input]:dark:bg-gray-700 [&>input]:dark:text-white [&>input]:dark:placeholder-gray-400 [&>input]:dark:focus:border-primary-500 [&>input]:dark:focus:ring-primary-500 [&>input]:p-2.5 [&>input]:text-sm [&>input]:rounded-lg"
                  />
                </div>
                {/* Email input */}
                <div className="md:col-span-2">
                  {/* User's email address */}
                  <Label htmlFor="email">Email</Label>
                  <TextInput
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Email"
                  />
                </div>
                {/* Password input */}
                <div className="md:col-span-2">
                  {/* User's password */}
                  <PasswordInput
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    label="Password"
                    placeholder="Password"
                    required={true}
                  />
                </div>
              </div>
              <Button
                type="submit"
                color="blue"
                className="w-full cursor-pointer"
                disabled={formLoading}
              >
                {formLoading ? (
                  <>
                    <Spinner size="sm" aria-label="Loading" />{" "}
                    <span className="pl-2">Loading...</span>
                  </>
                ) : (
                  "Add User"
                )}
              </Button>
            </form>
            <Button
              onClick={() => setModalOpen(false)}
              type="button"
              color="red"
              className="w-full cursor-pointer"
              disabled={formLoading}
            >
              Cancle
            </Button>
          </Card>
        </div>
      </Modal>
    </div>
  );
}
