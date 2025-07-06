"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Label, TextInput, Button, Alert, Card, Spinner } from "flowbite-react";
import { FaGoogle } from "react-icons/fa";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { validateEmail } from '@/lib/emailValidation';
import { validatePassword } from '@/lib/passwordValidation';
import PasswordInput from "@/components/PasswordInput";
// Removed import of missing GoogleSignInButton

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<{
    email?: string;
    password?: string;
    common?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError({});
    setLoading(true);
    let hasError = false;
    const newError: { email?: string; password?: string; common?: string } = {};
    const emailMsg = validateEmail(email);
    if (emailMsg) {
      newError.email = emailMsg;
      hasError = true;
    }
    const passwordMsg = validatePassword(password);
    if (passwordMsg) {
      newError.password = passwordMsg;
      hasError = true;
    }
    if (hasError) {
      setError(newError);
      setLoading(false);
      return;
    }
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        accountType: "company",
      });
      if (result?.error) {
        setError({ common: "Incorrect email or password. Please try again." });
      } else if (result?.ok) {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError({ common: "An error occurred during login. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h1 className="text-2xl font-bold text-center mb-4">Login</h1>
          {error.common && <Alert color="failure">{error.common}</Alert>}
          <div>
            <Label htmlFor="email" color={error.email ? "failure" : undefined}>
              Email
            </Label>
            <TextInput
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              color={error.email ? "failure" : undefined}
              placeholder="test@example.com"
            />
            {error.email && (
              <p className="text-red-500 text-xs mt-1">{error.email}</p>
            )}
          </div>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            label="Password"
            placeholder="password"
            error={error.password}
          />
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-500 hover:underline cursor-pointer"
            >
              Forgot Password?
            </Link>
          </div>
          <Button
            type="submit"
            color="blue"
            className="w-full cursor-pointer"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" aria-label="Loading" />{" "}
                <span className="pl-2">Loading...</span>
              </>
            ) : (
              "Sign In"
            )}
          </Button>
          <p className="text-center mt-4">
            Don't have an account?{" "}
            <Link href="/signup" className="text-blue-500 hover:underline">
              Sign Up
            </Link>
          </p>
        </form>
        <GoogleSignInButton />
      </Card>
    </div>
  );
}
