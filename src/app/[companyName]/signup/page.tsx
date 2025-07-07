"use client";
import { useState, useEffect, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { Label, TextInput, Button, Alert, Card, Spinner } from "flowbite-react";
import Link from "next/link";
import { validateName } from '@/lib/nameValidation';
import { validateEmail } from '@/lib/emailValidation';
import { validatePassword } from '@/lib/passwordValidation';
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import PasswordInput from "@/components/PasswordInput";

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
  const [strength, setStrength] = useState({
    score: 0,
    label: '',
    color: ''
  });
  const [companyExists, setCompanyExists] = useState(true);
  const [checkingCompany, setCheckingCompany] = useState(true);
  const router = useRouter();
  const params = useParams();
  const companyName = params.companyName as string;

  useEffect(() => {
    const checkCompany = async () => {
      setCheckingCompany(true);
      try {
        const res = await fetch(`/api/company/check?companyName=${encodeURIComponent(companyName)}`);
        if (!res.ok) {
          setCompanyExists(false);
          setError({ common: "Company doesn't exist." });
        } else {
          setCompanyExists(true);
        }
      } catch (err) {
        setCompanyExists(false);
        setError({ common: "Company doesn't exist." });
      } finally {
        setCheckingCompany(false);
      }
    };
    checkCompany();
  }, [companyName]);

  const checkPasswordStrength = (pass: string) => {
    let score = 0;
    
    // Length
    if (pass.length > 0) score += 1;
    if (pass.length >= 8) score += 1;
    
    // Complexity
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    
    // Determine label and color
    let label, color;
    if (score < 3) {
      label = 'Weak';
      color = 'red';
    } else if (score <= 4) {
      label = 'Medium';
      color = 'orange';
    } else {
      label = 'Strong';
      color = 'green';
    }
    
    setStrength({
      score,
      label,
      color
    });
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkPasswordStrength(newPassword);
  };

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
    } else if (strength.label === "Weak") {
      newError.password = "Password is weak.";
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
              color={error.firstName ? 'failure' : undefined}
              placeholder="First Name"
              disabled={!companyExists || checkingCompany}
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
              color={error.lastName ? 'failure' : undefined}
              placeholder="Last Name"
              disabled={!companyExists || checkingCompany}
            />
            {error.lastName && <p className="text-red-500 text-xs mt-1" style={errorFadeIn}>{error.lastName}</p>}
          </div>
          <div>
            <Label htmlFor="number" color={error.number ? 'failure' : undefined}>Number</Label>
            <PhoneInput
              placeholder="Enter phone number"
              value={number}
              onChange={(value) => setNumber(value?.toString() || "")}
              className="[&>input]:block [&>input]:w-full [&>input]:border [&>input]:focus:outline-none [&>input]:focus:ring-1 [&>input]:disabled:cursor-not-allowed [&>input]:disabled:opacity-50 [&>input]:border-gray-300 [&>input]:bg-gray-50 [&>input]:text-gray-900 [&>input]:placeholder-gray-500 [&>input]:focus:border-primary-500 [&>input]:focus:ring-primary-500 [&>input]:dark:border-gray-600 [&>input]:dark:bg-gray-700 [&>input]:dark:text-white [&>input]:dark:placeholder-gray-400 [&>input]:dark:focus:border-primary-500 [&>input]:dark:focus:ring-primary-500 [&>input]:p-2.5 [&>input]:text-sm [&>input]:rounded-lg"
              disabled={!companyExists || checkingCompany}
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
              color={error.email ? 'failure' : undefined}
              placeholder="Email"
              disabled={!companyExists || checkingCompany}
            />
            {error.email && <p className="text-red-500 text-xs mt-1" style={errorFadeIn}>{error.email}</p>}
          </div>
          <PasswordInput
            id="password"
            value={password}
            onChange={handlePasswordChange}
            label="Password"
            placeholder="Password"
            error={error.password}
            disabled={!companyExists || checkingCompany}
          />
          {password && (
            <div>
              <p style={{color: strength.color}}>{strength.label}</p>
              <div style={{
                height: '5px',
                backgroundColor: strength.color,
                width: `${(strength.score / 5) * 100}%`
              }} />
            </div>
          )}
          <Button type="submit" color="blue" className="w-full cursor-pointer" disabled={loading || !companyExists || checkingCompany}>
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