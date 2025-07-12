"use client"
import { Sidebar, SidebarItems, SidebarItemGroup, SidebarItem } from "flowbite-react";
import { HiHome, HiUser, HiCog, HiArrowSmRight, HiUsers, HiIdentification } from "react-icons/hi";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

const DashboardSidebar = () => {
  const { data: session } = useSession();
  const handleSignOut = () => {
    signOut();
  }
  return (
    <Sidebar aria-label="Dashboard sidebar" className="w-64 h-screen sticky top-0">
        <SidebarItems>
          <SidebarItemGroup>
            <SidebarItem as={Link} href="/dashboard" icon={HiHome}>
              Home
            </SidebarItem>
            <SidebarItem as={Link} href="/dashboard/profile" icon={HiUser}>
              Profile
            </SidebarItem>
            <SidebarItem as={Link} href="/dashboard/settings" icon={HiCog}>
              Settings
            </SidebarItem>
            {session?.accountType === "company" && (
              <>
                <SidebarItem as={Link} href="/dashboard/users" icon={HiUsers}>
                  Company Users
                </SidebarItem>
                <SidebarItem as={Link} href="/dashboard/teams" icon={HiUsers}>
                  Teams
                </SidebarItem>
                <SidebarItem as={Link} href="/dashboard/projects" icon={HiCog}>
                  Company Projects
                </SidebarItem>
              </>
            )}
            {session?.accountType === "user" && (
              <SidebarItem as={Link} href="/dashboard/account" icon={HiIdentification}>
                Account
              </SidebarItem>
            )}
            <SidebarItem as={"button"} onClick={handleSignOut} icon={HiArrowSmRight} className="text-red-600 dark:text-red-400 w-full cursor-pointer text-left">
              Sign Out
            </SidebarItem>
          </SidebarItemGroup>
        </SidebarItems>
      </Sidebar>
  )
}

export default DashboardSidebar