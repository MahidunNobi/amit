"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Label, TextInput, Button, Alert, Card, Spinner } from "flowbite-react";
import Link from "next/link";

export default function CompanyUserSignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [number, setNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const companyName = params.companyName as string;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const res = await fetch("/api/company-user/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, number, companyName, email, password }),
    });
    setLoading(false);
    const data = await res.json();
    if (!res.ok) {
      setError(data.message || "Something went wrong!");
      return;
    }
    setSuccess("Signup successful! Redirecting to login...");
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h1 className="text-2xl font-bold text-center mb-4">Sign Up for {companyName}</h1>
          {error && <Alert color="failure">{error}</Alert>}
          {success && <Alert color="success">{success}</Alert>}
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
            <TextInput
              id="number"
              type="text"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              required
              placeholder="Number"
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
          <div>
            <Label htmlFor="password">Password</Label>
            <TextInput
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
            />
          </div>
          <Button type="submit" color="blue" className="w-full cursor-pointer" disabled={loading}>
            {loading ? (
              <><Spinner size="sm" aria-label="Loading" /> <span className="pl-2">Loading...</span></>
            ) : (
              'Sign Up'
            )}
          </Button>
          <p className="text-center mt-4">
            Already have an account?{' '}
            <Link href={`/${companyName}/login`} className="text-blue-500 hover:underline">
              Login
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
} 