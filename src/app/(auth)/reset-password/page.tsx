"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Label, TextInput, Button, Alert, Card, Spinner } from 'flowbite-react';

const errorFadeIn = {
  animation: 'fadeIn 0.3s',
};

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<{ password?: string; confirmPassword?: string; common?: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError({ common: "No token provided. Please request a new password reset link." });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;
    const newError: { password?: string; confirmPassword?: string; common?: string } = {};
    if (!password.trim()) {
      newError.password = "Please enter a new password.";
      hasError = true;
    } else if (password.trim().length < 6) {
      newError.password = "Password must be at least 6 characters.";
      hasError = true;
    }
    if (!confirmPassword.trim()) {
      newError.confirmPassword = "Please confirm your new password.";
      hasError = true;
    } else if (password.trim() !== confirmPassword.trim()) {
      newError.confirmPassword = "Passwords do not match.";
      hasError = true;
    }
    if (hasError) {
      setError(newError);
      return;
    }
    setError({});
    setMessage('');
    setLoading(true);
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    setLoading(false);
    const data = await res.json();
    if (!res.ok) {
      setError({ common: data.message || 'Something went wrong!' });
    } else {
      setMessage(data.message + " Redirecting to login...");
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
      <Card className="w-full max-w-sm p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h1 className="text-2xl font-bold text-center mb-4">Reset Password</h1>
          {error.common && <Alert color="failure" style={errorFadeIn}>{error.common}</Alert>}
          {message && <Alert color="success">{message}</Alert>}
          {token ? (
            <>
              <div>
                <Label htmlFor="password" color={error.password ? 'failure' : undefined}>New Password</Label>
                <TextInput
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  color={error.password ? 'failure' : 'info'}
                  placeholder="New Password"
                />
                {error.password && <p className="text-red-500 text-xs mt-1" style={errorFadeIn}>{error.password}</p>}
              </div>
              <div>
                <Label htmlFor="confirmPassword" color={error.confirmPassword ? 'failure' : undefined}>Confirm New Password</Label>
                <TextInput
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  color={error.confirmPassword ? 'failure' : 'info'}
                  placeholder="Confirm New Password"
                />
                {error.confirmPassword && <p className="text-red-500 text-xs mt-1" style={errorFadeIn}>{error.confirmPassword}</p>}
              </div>
              <Button type="submit" color="blue" className="w-full cursor-pointer" disabled={loading}>
                {loading ? (
                  <><Spinner size="sm" aria-label="Loading" /> <span className="pl-2">Loading...</span></>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </>
          ) : (
            <p className="text-center">Invalid or missing token.</p>
          )}
        </form>
      </Card>
    </div>
  );
} 