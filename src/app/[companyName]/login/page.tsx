"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Label, TextInput, Button, Alert, Card, Spinner } from "flowbite-react";
import Link from "next/link";

export default function CompanyUserLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const companyName = params.companyName as string;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/company-user/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, companyName }),
    });
    setLoading(false);
    const data = await res.json();
    if (!res.ok) {
      setError(data.message || "Invalid credentials or company.");
      return;
    }
    router.push(`/${companyName}`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h1 className="text-2xl font-bold text-center mb-4">Login to {companyName}</h1>
          {error && <Alert color="failure">{error}</Alert>}
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
              'Login'
            )}
          </Button>
          <p className="text-center mt-4">
            Don't have an account?{' '}
            <Link href={`/${companyName}/signup`} className="text-blue-500 hover:underline">
              Sign Up
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
} 