"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Label, TextInput, Button, Alert, Card, Spinner } from "flowbite-react";
import { validateName } from "@/lib/nameValidation";
import { validateEmail } from "@/lib/emailValidation";
import { validatePassword } from "@/lib/passwordValidation";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import PasswordInput from "@/components/PasswordInput";

const errorFadeIn = {
  animation: "fadeIn 0.3s",
};

export default function SignupPage() {
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<{
    companyName?: string;
    address?: string;
    phoneNumber?: string;
    email?: string;
    password?: string;
    common?: string;
  }>({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState({
    score: 0,
    label: "",
    color: "",
  });
  const router = useRouter();

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
    if (score <= 2) {
      label = "Weak";
      color = "red";
    } else if (score <= 4) {
      label = "Medium";
      color = "orange";
    } else {
      label = "Strong";
      color = "green";
    }

    setStrength({
      score,
      label,
      color,
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
      companyName?: string;
      address?: string;
      phoneNumber?: string;
      email?: string;
      password?: string;
      common?: string;
    } = {};

    const validateCompanyName = validateName(companyName);
    if (validateCompanyName) {
      newError.companyName = validateCompanyName;
      hasError = true;
    }
    if (!address.trim()) {
      newError.address = "Address is required.";
      hasError = true;
    }
    if (!phoneNumber.trim()) {
      newError.phoneNumber = "Phone number is required.";
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
      newError.password = "Password is week.";
      hasError = true;
    }
    if (hasError) {
      setError(newError);
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName,
        address,
        phoneNumber,
        website,
        email,
        password,
      }),
    });
    setLoading(false);
    const data = await res.json();
    if (!res.ok) {
      setError({ common: data.message || "Something went wrong!" });
      return;
    }
    setSuccess("Signup successful! Redirecting to login...");
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
      <Card className="w-full max-w-sm p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h1 className="text-2xl font-bold text-center mb-4">Sign Up</h1>
          {error.common && (
            <Alert color="failure" style={errorFadeIn}>
              {error.common}
            </Alert>
          )}
          {success && <Alert color="success">{success}</Alert>}
          <div>
            <Label
              htmlFor="companyName"
              color={error.companyName ? "failure" : undefined}
            >
              Company Name
            </Label>
            <TextInput
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              color={error.companyName ? "failure" : undefined}
              placeholder="Company Name"
            />
            {error.companyName && (
              <p className="text-red-500 text-xs mt-1" style={errorFadeIn}>
                {error.companyName}
              </p>
            )}
          </div>
          <div>
            <Label
              htmlFor="address"
              color={error.address ? "failure" : undefined}
            >
              Address
            </Label>
            <TextInput
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              color={error.address ? "failure" : undefined}
              placeholder="Address"
            />
            {error.address && (
              <p className="text-red-500 text-xs mt-1" style={errorFadeIn}>
                {error.address}
              </p>
            )}
          </div>
          <div>
            <Label
              htmlFor="phoneNumber"
              color={error.phoneNumber ? "failure" : undefined}
            >
              Phone Number
            </Label>
            
            <PhoneInput
              placeholder="Enter phone number"
              value={phoneNumber}
              onChange={(value) => setPhoneNumber(value?.toString() || "")}
              className="[&>input]:block [&>input]:w-full [&>input]:border [&>input]:focus:outline-none [&>input]:focus:ring-1 [&>input]:disabled:cursor-not-allowed [&>input]:disabled:opacity-50 [&>input]:border-gray-300 [&>input]:bg-gray-50 [&>input]:text-gray-900 [&>input]:placeholder-gray-500 [&>input]:focus:border-primary-500 [&>input]:focus:ring-primary-500 [&>input]:dark:border-gray-600 [&>input]:dark:bg-gray-700 [&>input]:dark:text-white [&>input]:dark:placeholder-gray-400 [&>input]:dark:focus:border-primary-500 [&>input]:dark:focus:ring-primary-500 [&>input]:p-2.5 [&>input]:text-sm [&>input]:rounded-lg"
              />
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <TextInput
              id="website"
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              
              placeholder="Website (optional)"
            />
          </div>
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
              placeholder="Email"
            />
            {error.email && (
              <p className="text-red-500 text-xs mt-1" style={errorFadeIn}>
                {error.email}
              </p>
            )}
          </div>
          <PasswordInput
            id="password"
            value={password}
            onChange={handlePasswordChange}
            label="Password"
            placeholder="Password"
            error={error.password}
          />
          {password && (
            <div>
              <p style={{ color: strength.color }}>{strength.label}</p>
              <div
                style={{
                  height: "5px",
                  backgroundColor: strength.color,
                  width: `${(strength.score / 5) * 100}%`,
                }}
              />
            </div>
          )}
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
              "Sign Up"
            )}
          </Button>
          <p className="text-center mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-500 hover:underline">
              Login
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
