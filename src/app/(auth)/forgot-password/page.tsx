"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Label, TextInput, Button, Alert, Card, Spinner } from 'flowbite-react';

// Add fade-in animation style
const errorFadeIn = {
  animation: 'fadeIn 0.3s',
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<{ email?: string; common?: string }>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError({});
    let hasError = false;
    const newError: { email?: string; common?: string } = {};
    if (!email) {
      newError.email = 'Please enter your email address.';
      hasError = true;
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      newError.email = 'Please enter a valid email address.';
      hasError = true;
    }
    if (hasError) {
      setError(newError);
      return;
    }
    setLoading(true);
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    const data = await res.json();
    if (!res.ok) {
      setError({ common: data.message || 'Something went wrong!' });
    } else {
      setMessage(data.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
      <Card className="w-full max-w-sm p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h1 className="text-2xl font-bold text-center mb-4">Forgot Password</h1>
          {error.common && <Alert color="failure" style={errorFadeIn}>{error.common}</Alert>}
          {message && <Alert color="success">{message}</Alert>}
          <div>
            <Label htmlFor="email" color={error.email ? 'failure' : undefined}>Email</Label>
            <TextInput
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              color={error.email ? 'failure' : 'info'}
              placeholder="Enter your email"
            />
            {error.email && <p className="text-red-500 text-xs mt-1" style={errorFadeIn}>{error.email}</p>}
          </div>
          <Button type="submit" color="blue" className="w-full cursor-pointer" disabled={loading}>
            {loading ? (
              <><Spinner size="sm" aria-label="Loading" /> <span className="pl-2">Loading...</span></>
            ) : (
              'Send Reset Link'
            )}
          </Button>
          <p className="text-center mt-4">
            Remembered your password?{' '}
            <Link href="/login" className="text-blue-500 hover:underline">
              Login
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
} 