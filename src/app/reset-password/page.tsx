"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Label, TextInput, Button, Alert, Card, Spinner } from 'flowbite-react';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
        setError("No token provided. Please request a new password reset link.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setError('');
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
      setError(data.message || 'Something went wrong!');
    } else {
      setMessage(data.message + " Redirecting to login...");
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h1 className="text-2xl font-bold text-center mb-4">Reset Password</h1>
          {error && <Alert color="failure">{error}</Alert>}
          {message && <Alert color="success">{message}</Alert>}
          {token ? (
            <>
              <div>
                <Label htmlFor="password">New Password</Label>
                <TextInput
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="New Password"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <TextInput
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm New Password"
                />
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