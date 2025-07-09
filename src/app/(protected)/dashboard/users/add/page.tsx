"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Label, TextInput, Button, Alert, Card, Spinner } from "flowbite-react";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import PasswordInput from "@/components/PasswordInput";

export default function AddUserPage() {
  const { data: session, status } = useSession();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [number, setNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (status === "loading") return <div>Loading...</div>;
  if (!session) return <div>Unauthorized</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
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
    setLoading(false);
    const data = await res.json();
    if (!res.ok) {
      setError(data.message || "Something went wrong!");
      return;
    }
    router.push("/dashboard/users");
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h1 className="text-2xl font-bold text-center mb-4">Add User</h1>
          {error && <Alert color="failure">{error}</Alert>}
          <div>
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
          <div>
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
          <div>
            <Label htmlFor="number">Number</Label>
            <PhoneInput
              placeholder="Enter phone number"
              value={number}
              onChange={(value) => setNumber(value?.toString() || "")}
              className="[&>input]:block [&>input]:w-full [&>input]:border [&>input]:focus:outline-none [&>input]:focus:ring-1 [&>input]:disabled:cursor-not-allowed [&>input]:disabled:opacity-50 [&>input]:border-gray-300 [&>input]:bg-gray-50 [&>input]:text-gray-900 [&>input]:placeholder-gray-500 [&>input]:focus:border-primary-500 [&>input]:focus:ring-primary-500 [&>input]:dark:border-gray-600 [&>input]:dark:bg-gray-700 [&>input]:dark:text-white [&>input]:dark:placeholder-gray-400 [&>input]:dark:focus:border-primary-500 [&>input]:dark:focus:ring-primary-500 [&>input]:p-2.5 [&>input]:text-sm [&>input]:rounded-lg"
            />
          </div>
          <div>
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
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            label="Password"
            placeholder="Password"
            required={true}
          />
          <Button type="submit" color="blue" className="w-full cursor-pointer" disabled={loading}>
            {loading ? (
              <><Spinner size="sm" aria-label="Loading" /> <span className="pl-2">Loading...</span></>
            ) : (
              'Add User'
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
} 