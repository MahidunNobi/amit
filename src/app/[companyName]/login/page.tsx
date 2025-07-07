"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Label, TextInput, Button, Alert, Card, Spinner } from "flowbite-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { validateEmail } from '@/lib/emailValidation';
import { validatePassword } from '@/lib/passwordValidation';
import PasswordInput from "@/components/PasswordInput";
import GoogleSignInButton from "@/components/GoogleSignInButton";

const errorFadeIn = {
  animation: 'fadeIn 0.3s',
};

export default function CompanyUserLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<{ email?: string; password?: string; common?: string }>({});
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError({});
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
      return;
    }
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        accountType: "user",
      });
      
      if (result?.error) {
        setError({ common: "Incorrect email or password. Please try again." });
      } else if (result?.ok) {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError({ common: "An error occurred during login. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
      <Card className="w-full max-w-sm p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h1 className="text-2xl font-bold text-center mb-4">Login to {companyName}</h1>
          {error.common && <Alert color="failure" style={errorFadeIn}>{error.common}</Alert>}
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
            onChange={(e) => setPassword(e.target.value)}
            label="Password"
            placeholder="Password"
            error={error.password}
            disabled={!companyExists || checkingCompany}
          />
          <Button type="submit" color="blue" className="w-full cursor-pointer" disabled={loading || !companyExists || checkingCompany}>
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
        {/* <GoogleSignInButton label="Sign in with Google" callbackUrl={`/dashboard`} /> */}
      </Card>
      
    </div>
  );
} 