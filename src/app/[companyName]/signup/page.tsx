"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Label, TextInput, Button, Alert, Card, Spinner } from "flowbite-react";
import Link from "next/link";
import { validateName } from '@/lib/nameValidation';
import { validateEmail } from '@/lib/emailValidation';
import { validatePassword } from '@/lib/passwordValidation';

const errorFadeIn = {
  animation: 'fadeIn 0.3s',
};

export default function CompanyUserSignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [number, setNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<{
    firstName?: string;
    lastName?: string;
    number?: string;
    email?: string;
    password?: string;
    common?: string;
  }>({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const companyName = params.companyName as string;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError({});
    setSuccess("");
    let hasError = false;
    const newError: {
      firstName?: string;
      lastName?: string;
      number?: string;
      email?: string;
      password?: string;
      common?: string;
    } = {};
    
      const validateFirstName = validateName(firstName);
      if (validateFirstName) {
        newError.firstName = validateFirstName;
        hasError = true;
      }    
    
      const validateLastName = validateName(lastName);
      if (validateLastName) {
        newError.lastName = validateLastName;
        hasError = true;
      }
    
    if (!number.trim()) {
      newError.number = "Number is required.";
      hasError = true;
    }
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
      return;
    }
    setLoading(true);
    const res = await fetch("/api/company-user/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, number, companyName, email, password }),
    });
    setLoading(false);
    const data = await res.json();
    if (!res.ok) {
      setError({ common: data.message || "Something went wrong!" });
      return;
    }
    setSuccess("Signup successful! Redirecting to login...");
    setTimeout(() => {
      router.push(`/${companyName}/login`);
    }, 2000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
      <Card className="w-full max-w-sm p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h1 className="text-2xl font-bold text-center mb-4">Sign Up for {companyName}</h1>
          {error.common && <Alert color="failure" style={errorFadeIn}>{error.common}</Alert>}
          {success && <Alert color="success">{success}</Alert>}
          <div>
            <Label htmlFor="firstName" color={error.firstName ? 'failure' : undefined}>First Name</Label>
            <TextInput
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              color={error.firstName ? 'failure' : 'info'}
              placeholder="First Name"
            />
            {error.firstName && <p className="text-red-500 text-xs mt-1" style={errorFadeIn}>{error.firstName}</p>}
          </div>
          <div>
            <Label htmlFor="lastName" color={error.lastName ? 'failure' : undefined}>Last Name</Label>
            <TextInput
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              color={error.lastName ? 'failure' : 'info'}
              placeholder="Last Name"
            />
            {error.lastName && <p className="text-red-500 text-xs mt-1" style={errorFadeIn}>{error.lastName}</p>}
          </div>
          <div>
            <Label htmlFor="number" color={error.number ? 'failure' : undefined}>Number</Label>
            <TextInput
              id="number"
              type="text"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              color={error.number ? 'failure' : 'info'}
              placeholder="Number"
            />
            {error.number && <p className="text-red-500 text-xs mt-1" style={errorFadeIn}>{error.number}</p>}
          </div>
          <div>
            <Label htmlFor="email" color={error.email ? 'failure' : undefined}>Email</Label>
            <TextInput
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              color={error.email ? 'failure' : 'info'}
              placeholder="Email"
            />
            {error.email && <p className="text-red-500 text-xs mt-1" style={errorFadeIn}>{error.email}</p>}
          </div>
          <div>
            <Label htmlFor="password" color={error.password ? 'failure' : undefined}>Password</Label>
            <TextInput
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              color={error.password ? 'failure' : 'info'}
              placeholder="Password"
            />
            {error.password && <p className="text-red-500 text-xs mt-1" style={errorFadeIn}>{error.password}</p>}
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