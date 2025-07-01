"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Modal, Button } from "flowbite-react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [showModal, setShowModal] = useState(false);
  const [timer, setTimer] = useState(120); // 2 minutes in seconds
  const inactivityTimeout = useRef<NodeJS.Timeout | null>(null);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);
  const sessionData = useSession();
  
  // Reset inactivity timer
  const resetInactivityTimer = () => {
    if (inactivityTimeout.current) clearTimeout(inactivityTimeout.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    setShowModal(false);
    setTimer(120);
    inactivityTimeout.current = setTimeout(() => {
      setShowModal(true);
      setTimer(120);
      countdownInterval.current = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }, 1 * 60 * 1000); // 1 minute
  };

  // Handle user activity
  useEffect(() => {
    if (status !== "authenticated") return;
    resetInactivityTimer();
    const events = ["mousedown", "touchstart", "scroll"];
    const handleActivity = resetInactivityTimer;
    events.forEach((event) => window.addEventListener(event, handleActivity));
    return () => {
      if (inactivityTimeout.current) clearTimeout(inactivityTimeout.current);
      if (countdownInterval.current) clearInterval(countdownInterval.current);
      events.forEach((event) => window.removeEventListener(event, handleActivity));
    };
  }, [status]);

  // Handle timer countdown and auto-logout
  useEffect(() => {
    if (!showModal) return;
    if (timer <= 0) {
      if (countdownInterval.current) clearInterval(countdownInterval.current);
      setShowModal(false);
      signOut({ callbackUrl: "/login" });
    }
  }, [timer, showModal]);

  const handleYes = () => {
    setShowModal(false);
    setTimer(120);
    resetInactivityTimer();
    if (countdownInterval.current) clearInterval(countdownInterval.current);
  };

  const handleNo = () => {
    setShowModal(false);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />

        {status === "loading" && <p>Loading...</p>}

        {status === "authenticated" && (
          <div>
            <p className="text-center sm:text-left">Signed in as {session.user?.name}</p>
            <button
              onClick={() => signOut()}
              className="mt-4 rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto cursor-pointer"
            >
              Sign out
            </button>
          </div>
        )}

        {status === "unauthenticated" && (
          <div>
            <p className="text-center sm:text-left">Not signed in</p>
            <Link href="/login">
              <span className="mt-4 rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto cursor-pointer">
                Sign in
              </span>
            </Link>
          </div>
        )}
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <p>Authentication example</p>
      </footer>
      <Modal show={showModal} onClose={handleNo} size="md" popup>
        <div className="text-center p-6">
          <h3 className="mb-4 text-lg font-normal text-gray-700 dark:text-gray-200">Are you there?</h3>
          <p className="mb-4 text-gray-500 dark:text-gray-400">You will be logged out in <span className="font-bold">{timer}</span> seconds.</p>
          <div className="flex justify-center gap-4">
            <Button color="success" onClick={handleYes}>Yes</Button>
            <Button color="failure" onClick={handleNo}>No</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 