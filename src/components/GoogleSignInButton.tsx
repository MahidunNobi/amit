import { Button } from 'flowbite-react';
import { FaGoogle } from 'react-icons/fa';
import { signIn } from 'next-auth/react';
import React from 'react';

interface GoogleSignInButtonProps {
  label?: string;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ label = 'Sign in with Google' }) => (
  <Button
    color="light"
    className="w-full mb-4 flex items-center justify-center gap-2 cursor-pointer"
    onClick={() => signIn('google', { callbackUrl: '/' })}
  >
    <FaGoogle className="text-lg" /> {label}
  </Button>
);

export default GoogleSignInButton; 