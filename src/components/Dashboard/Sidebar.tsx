"use client"
import { Sidebar, SidebarItems, SidebarItemGroup, SidebarItem } from "flowbite-react";
import { HiHome, HiUser, HiCog, HiArrowSmRight } from "react-icons/hi";
import Link from "next/link";

const DashboardSidebar = () => {
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
            <SidebarItem as={Link} href="/signout" icon={HiArrowSmRight} className="text-red-600 dark:text-red-400">
              Sign Out
            </SidebarItem>
          </SidebarItemGroup>
        </SidebarItems>
      </Sidebar>
  )
}

export default DashboardSidebar