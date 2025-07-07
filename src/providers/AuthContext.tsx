"use client";

import { SessionProvider } from "next-auth/react";

// Provides authentication context to children components
export default function AuthContext({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
} 