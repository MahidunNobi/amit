"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Protects routes by validating session periodically
export default function SessionGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/session/validate");
        if (!res.ok) {
          router.push("/signout");
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.log(err);
        router.push("/signout");
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [router]);

  return <>{children}</>;
}
