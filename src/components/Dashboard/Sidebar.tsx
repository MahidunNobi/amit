"use client";
import {
  Sidebar,
  SidebarItems,
  SidebarItemGroup,
  SidebarItem,
} from "flowbite-react";
import {
  HiHome,
  HiCog,
  HiArrowSmRight,
  HiUsers,
  HiIdentification,
  HiX,
  HiMenu,
} from "react-icons/hi";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";

const DashboardSidebar = () => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const handleSignOut = () => {
    signOut();
  };

  useEffect(() => {
    const checkScreenSize = () => {
      setIsTablet(window.innerWidth <= 770); // 768px is typically the tablet breakpoint
    };

    // Check on mount and on resize
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Close sidebar when clicking outside on tablet
  useEffect(() => {
    if (!isTablet || !isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.querySelector(".dashboard-sidebar");
      if (sidebar && !sidebar.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isTablet, isOpen]);

  return (
    <>
      {/* Mobile/Tablet menu button */}
      {isTablet && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`fixed z-40 p-2 mt-2 ml-2 text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600`}
        >
          {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
        </button>
      )}

      <Sidebar
        aria-label="Dashboard sidebar"
        className={`dashboard-sidebar w-64 h-screen sticky top-0 transition-transform duration-300 ease-in-out ${
          isTablet
            ? `fixed z-30 ${isOpen ? "translate-x-0" : "-translate-x-full"}`
            : ""
        }`}
      >
        <SidebarItems>
          <SidebarItemGroup>
            {/* -------------------Common routes all users----------- */}
            <SidebarItem
              as={Link}
              href="/dashboard"
              icon={HiHome}
              className="pt-12 lg:pt-0"
            >
              Home
            </SidebarItem>
            <SidebarItem as={Link} href="/dashboard/settings" icon={HiCog}>
              Settings
            </SidebarItem>
            {/* -------------------Company admin routes----------- */}
            {session?.accountType === "company" && (
              <>
                <SidebarItem
                  as={Link}
                  href="/dashboard/admin/users"
                  icon={HiUsers}
                >
                  Company Users
                </SidebarItem>
                <SidebarItem
                  as={Link}
                  href="/dashboard/admin/teams"
                  icon={HiUsers}
                >
                  Teams
                </SidebarItem>
                <SidebarItem
                  as={Link}
                  href="/dashboard/admin/projects"
                  icon={HiCog}
                >
                  Company Projects
                </SidebarItem>
              </>
            )}
            {/* -------------------Company users routes----------- */}
            {session?.accountType === "user" && (
              <SidebarItem
                as={Link}
                href="/dashboard/account"
                icon={HiIdentification}
              >
                Account
              </SidebarItem>
            )}
            {/* -------------------Managers routes----------- */}
            {session?.accountType === "user" &&
              session?.user.role === "Project Manager" && (
                <SidebarItem
                  as={Link}
                  href="/dashboard/manager/manage-team"
                  icon={HiIdentification}
                >
                  Manage Team
                </SidebarItem>
              )}
            {/* -------------------Employee routes----------- */}
            {session?.accountType === "user" &&
              session?.user.role !== "Project Manager" && (
                <SidebarItem
                  as={Link}
                  href="/dashboard/my-task"
                  icon={HiIdentification}
                >
                  My Task
                </SidebarItem>
              )}
            <SidebarItem
              as={"button"}
              onClick={handleSignOut}
              icon={HiArrowSmRight}
              className="text-red-600 dark:text-red-400 w-full cursor-pointer text-left"
            >
              Sign Out
            </SidebarItem>
          </SidebarItemGroup>
        </SidebarItems>
      </Sidebar>
    </>
  );
};

export default DashboardSidebar;
