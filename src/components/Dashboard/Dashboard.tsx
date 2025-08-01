"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import DashboardChart from "./DashboardChart";

type Stats = {
  assignedCount: number;
  createdCount: number;
  completedCount: number;
  pendingCount: number;
};
const defaultStats = {
  createdCount: 0,
  assignedCount: 0,
  completedCount: 0,
  pendingCount: 0,
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [showModal, setShowModal] = useState(false);
  const [timer, setTimer] = useState(120);
  const [stats, setStats] = useState<Stats | null>(defaultStats);
  const inactivityTimeout = useRef<NodeJS.Timeout | null>(null);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);

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
    }, 60 * 1000);
  };
  console.log(session);
  useEffect(() => {
    if (status !== "authenticated") return;
    resetInactivityTimer();
    const events = ["mousedown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, resetInactivityTimer));
    return () => {
      if (inactivityTimeout.current) clearTimeout(inactivityTimeout.current);
      if (countdownInterval.current) clearInterval(countdownInterval.current);
      events.forEach((e) =>
        window.removeEventListener(e, resetInactivityTimer)
      );
    };
  }, [status]);

  useEffect(() => {
    if (!showModal) return;
    if (timer <= 0) {
      if (countdownInterval.current) clearInterval(countdownInterval.current);
      setShowModal(false);
      signOut({ callbackUrl: "/login" });
    }
  }, [timer, showModal]);

  // const handleYes = () => {
  //   setShowModal(false);
  //   setTimer(120);
  //   resetInactivityTimer();
  //   if (countdownInterval.current) clearInterval(countdownInterval.current);
  // };

  // const handleNo = () => {
  //   setShowModal(false);
  //   if (countdownInterval.current) clearInterval(countdownInterval.current);
  //   signOut({ callbackUrl: "/login" });
  // };

  // 📊 Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/dashboard-stats");
        const data = await res.json();
        console.log(data);
        setStats(data);
      } catch (err) {
        console.error("Failed to load stats:", err);
      }
    };
    if (status === "authenticated") fetchStats();
  }, [status]);

  return (
    // <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
    //   <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
    //     <Image
    //       className="dark:invert"
    //       src="/next.svg"
    //       alt="Next.js logo"
    //       width={180}
    //       height={38}
    //       priority
    //     />

    //     {status === "loading" && <p>Loading...</p>}

    //     {status === "authenticated" && (
    //       <div>
    //         <p className="text-center sm:text-left text-gray-800 dark:text-gray-200">
    //           Signed in as {session?.user?.name}
    //         </p>

    //         <button
    //           onClick={() => signOut()}
    //           className="mt-4 rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto cursor-pointer"
    //         >
    //           Sign out
    //         </button>

    //         {/* 📊 Dashboard Stats */}
    //         {stats && (
    //           <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
    //             <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center">
    //               <h4 className="text-gray-500 dark:text-gray-300">
    //                 Tasks Created
    //               </h4>
    //               <p className="text-2xl font-semibold text-gray-900 dark:text-white">
    //                 {stats.createdCount}
    //               </p>
    //             </div>
    //             <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center">
    //               <h4 className="text-gray-500 dark:text-gray-300">
    //                 Assigned to You
    //               </h4>
    //               <p className="text-2xl font-semibold text-gray-900 dark:text-white">
    //                 {stats.assignedCount}
    //               </p>
    //             </div>
    //             <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg shadow-md text-center">
    //               <h4 className="text-green-700 dark:text-green-300">
    //                 Completed
    //               </h4>
    //               <p className="text-2xl font-semibold text-green-800 dark:text-green-100">
    //                 {stats.completedCount}
    //               </p>
    //             </div>
    //             <div className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg shadow-md text-center">
    //               <h4 className="text-yellow-700 dark:text-yellow-300">
    //                 Pending
    //               </h4>
    //               <p className="text-2xl font-semibold text-yellow-800 dark:text-yellow-100">
    //                 {stats.pendingCount}
    //               </p>
    //             </div>
    //           </div>
    //         )}
    //       </div>
    //     )}

    //     {status === "unauthenticated" && (
    //       <div>
    //         <p className="text-center sm:text-left text-gray-800 dark:text-gray-200">
    //           Not signed in
    //         </p>

    //         <Link href="/login">
    //           <span className="mt-4 rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto cursor-pointer">
    //             Sign in
    //           </span>
    //         </Link>
    //       </div>
    //     )}
    //   </main>
    //   <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
    //     <p>Authentication example</p>
    //   </footer>

    //   <Modal show={showModal} onClose={handleNo} size="md" popup>
    //     <div className="text-center p-6">
    //       <h3 className="mb-4 text-lg font-normal text-gray-700 dark:text-gray-200">
    //         Are you there?
    //       </h3>
    //       <p className="mb-4 text-gray-500 dark:text-gray-400">
    //         You will be logged out in <span className="font-bold">{timer}</span>{" "}
    //         seconds.
    //       </p>
    //       <div className="flex justify-center gap-4">
    //         <Button color="success" onClick={handleYes}>
    //           Yes
    //         </Button>
    //         <Button color="failure" onClick={handleNo}>
    //           No
    //         </Button>
    //       </div>
    //     </div>
    //   </Modal>
    // </div>
    <div>
      <div>
        {/* 📊 Dashboard Stats */}
        {stats && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center">
              <h4 className="text-gray-500 dark:text-gray-300">
                Tasks Created
              </h4>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.createdCount}
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center">
              <h4 className="text-gray-500 dark:text-gray-300">
                Assigned to You
              </h4>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.assignedCount}
              </p>
            </div>
            <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg shadow-md text-center">
              <h4 className="text-green-700 dark:text-green-300">Completed</h4>
              <p className="text-2xl font-semibold text-green-800 dark:text-green-100">
                {stats.completedCount}
              </p>
            </div>
            <div className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg shadow-md text-center">
              <h4 className="text-yellow-700 dark:text-yellow-300">Pending</h4>
              <p className="text-2xl font-semibold text-yellow-800 dark:text-yellow-100">
                {stats.pendingCount}
              </p>
            </div>
          </div>
        )}
      </div>

      <DashboardChart stats={stats} />
    </div>
  );
}
