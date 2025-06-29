"use client";

import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { Card, Spinner } from 'flowbite-react';

export default function SignoutPage() {
  const [countdown, setCountdown] = useState(5);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsSigningOut(true);
          // Sign out the user
          signOut({ callbackUrl: '/login' });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-500">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="space-y-4">
          {!isSigningOut ? (
            <>
              <div className="text-6xl font-bold text-blue-600 mb-4">
                {countdown}
              </div>
              <h1 className="text-2xl font-semibold text-gray-800 mb-2">
                We are signing you out
              </h1>
              <p className="text-gray-600">
                You have logged in from somewhere else. So, You will be automatically signed out in {countdown} second{countdown !== 1 ? 's' : ''}
              </p>
            </>
          ) : (
            <>
              <Spinner size="xl" className="mx-auto mb-4" />
              <h1 className="text-2xl font-semibold text-gray-800 mb-2">
                Signing you out...
              </h1>
              <p className="text-gray-600">
                Please wait while we complete the sign out process
              </p>
            </>
          )}
        </div>
      </Card>
    </div>
  );
} 