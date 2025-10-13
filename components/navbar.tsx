import { UserButton } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import Link from "next/link"

import { ThemeToggle } from "@/components/theme-toggle"
import { GlobalSearch } from "@/components/global-search"
import { Notifications } from "@/components/notifications"
import { getUserRole } from "@/utils/roles"
import { Button } from "@/components/ui/button"
import { Shield, ShieldAlert, User } from "lucide-react"
import { MainNav } from "./sidebar/main-nav"
import { DashboardCountrySelector } from "./dashboard-country-selector"

export const Navbar = async () => {
  const { userId } = await auth()

  if (!userId) {
    return null
  }

  const userRole = await getUserRole()

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <MainNav className="mx-6" />
        <div className="ml-auto flex items-center space-x-4">
          <GlobalSearch />
          <Notifications />
          <DashboardCountrySelector />

          {userRole === "admin" && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin" className="flex items-center gap-1">
                <ShieldAlert className="h-4 w-4" />
                <span>Admin</span>
              </Link>
            </Button>
          )}

          {(userRole === "admin" || userRole === "moderator") && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/moderator" className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                <span>Moderator</span>
              </Link>
            </Button>
          )}

          {userRole && (
            <div className="flex items-center gap-1 text-xs bg-secondary px-2 py-1 rounded-md">
              <User className="h-3 w-3" />
              <span>{userRole}</span>
            </div>
          )}

          <ThemeToggle />
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
  )
}
