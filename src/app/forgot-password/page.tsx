"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Label, TextInput, Button, Alert, Card, Spinner } from 'flowbite-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    const data = await res.json();
    if (!res.ok) {
      setError(data.message || 'Something went wrong!');
    } else {
      setMessage(data.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h1 className="text-2xl font-bold text-center mb-4">Forgot Password</h1>
          {error && <Alert color="failure">{error}</Alert>}
          {message && <Alert color="success">{message}</Alert>}
          <div>
            <Label htmlFor="email">Email</Label>
            <TextInput
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
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