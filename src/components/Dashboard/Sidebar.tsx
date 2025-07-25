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
} from "react-icons/hi";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

const DashboardSidebar = () => {
  const { data: session } = useSession();
  const handleSignOut = () => {
    signOut();
  };
  return (
    <Sidebar
      aria-label="Dashboard sidebar"
      className="w-64 h-screen sticky top-0"
    >
      <SidebarItems>
        <SidebarItemGroup>
          {/* -------------------Common routes all users----------- */}
          <SidebarItem as={Link} href="/dashboard" icon={HiHome}>
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
  );
};

export default DashboardSidebar;
