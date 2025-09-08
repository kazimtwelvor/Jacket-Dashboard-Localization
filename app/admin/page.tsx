import { Suspense } from "react"
import { clerkClient } from "@clerk/clerk-sdk-node"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Users, ShieldCheck, UserCog, BarChart3 } from "lucide-react"

import { AdminUserCard } from "./admin-user-card"
import { SearchForm } from "./search"
import { RoleFilter } from "./role-filter"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { search?: string; role?: string; view?: string }
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const user = await clerkClient.users.getUser(userId)
  const userRole = user.publicMetadata.role as string


  if (userRole !== "admin" && userRole !== "super_admin") {
    redirect("/")
  }

  const query = searchParams?.search || ""
  const roleFilter = searchParams?.role || ""
  const viewMode = searchParams?.view || "grid"

  let users = []
  try {
    const MAX_USERS = 500

    users = query
      ? await clerkClient.users.getUserList({
          query,
          limit: MAX_USERS,
          orderBy: "-created_at",
        })
      : await clerkClient.users.getUserList({
          limit: MAX_USERS,
          orderBy: "-created_at",
        })
  } catch (error) {
    users = []
  }

  const serializedUsers = users.map((user) => ({
    id: user.id,
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.emailAddresses[0]?.emailAddress || "",
    imageUrl: user.imageUrl,
    role: (user.publicMetadata.role as string) || "user",
    createdAt: user.createdAt,
    lastSignInAt: user.lastSignInAt,
  }))

  const filteredUsers = roleFilter ? serializedUsers.filter((user) => user.role === roleFilter) : serializedUsers
  const roleCount = {
    admin: serializedUsers.filter((u) => u.role === "admin").length,
    superAdmin: serializedUsers.filter((u) => u.role === "super_admin").length,
    moderator: serializedUsers.filter((u) => u.role === "moderator").length,
    user: serializedUsers.filter((u) => u.role === "user" || !u.role).length,
  }

  const getRoleFilterLabel = () => {
    switch (roleFilter) {
      case "super_admin":
        return "Super Admins"
      case "admin":
        return "Admins"
      case "moderator":
        return "Moderators"
      case "user":
        return "Regular Users"
      default:
        return "All Users"
    }
  }

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const activeUsers = serializedUsers.filter((u) => u.lastSignInAt && new Date(u.lastSignInAt) > thirtyDaysAgo).length

  const buildQueryString = (params: Record<string, string>) => {
    const urlParams = new URLSearchParams()

    if (query) urlParams.set("search", query)
    if (roleFilter) urlParams.set("role", roleFilter)

    for (const [key, value] of Object.entries(params)) {
      if (value) {
        urlParams.set(key, value)
      } else {
        urlParams.delete(key)
      }
    }

    const queryString = urlParams.toString()
    return queryString ? `?${queryString}` : ""
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 -mx-6 -mt-6 mb-8 border-b">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
              <p className="text-muted-foreground mt-1">Manage user accounts, permissions and roles</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <SearchForm defaultValue={query} />
              <RoleFilter />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{serializedUsers.length}</div>
              <p className="text-xs text-muted-foreground">
                {query || roleFilter ? `Showing ${filteredUsers.length} filtered results` : `All registered accounts`}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <BarChart3 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeUsers}</div>
              <p className="text-xs text-muted-foreground">Active in the last 30 days</p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <UserCog className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{roleCount.admin + roleCount.superAdmin}</div>
              <p className="text-xs text-muted-foreground">
                {roleCount.superAdmin} super admin, {roleCount.admin} admin
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Users</CardTitle>
              <ShieldCheck className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{roleCount.user + roleCount.moderator}</div>
              <p className="text-xs text-muted-foreground">
                {roleCount.moderator} moderator, {roleCount.user} regular user
              </p>
            </CardContent>
          </Card>
        </div>

        {(query || roleFilter) && (
          <div className="bg-white dark:bg-slate-900 border rounded-lg p-4 mt-6 flex items-center justify-between shadow-sm">
            <div>
              <span className="font-medium">{getRoleFilterLabel()}</span>
              {query && (
                <span className="ml-1">
                  matching <span className="font-medium">"{query}"</span>
                </span>
              )}
              <span className="ml-1">
                ({filteredUsers.length} {filteredUsers.length === 1 ? "result" : "results"})
              </span>
            </div>
            <a href="/admin" className="text-sm text-primary hover:text-primary/80 underline underline-offset-4">
              Clear all filters
            </a>
          </div>
        )}

        <Tabs defaultValue={viewMode} className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">User Accounts</h2>
            <TabsList>
              <TabsTrigger value="grid" asChild>
                <a href={`/admin${buildQueryString({ view: "grid" })}`}>Grid View</a>
              </TabsTrigger>
              <TabsTrigger value="compact" asChild>
                <a href={`/admin${buildQueryString({ view: "compact" })}`}>Compact View</a>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="grid" className="mt-0">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <Suspense fallback={<div className="col-span-full text-center py-10">Loading users...</div>}>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => <AdminUserCard key={user.id} user={user} currentUserRole={userRole} />)
                ) : (
                  <div className="col-span-full text-center p-10 bg-muted rounded-lg">
                    <p className="text-muted-foreground">No users found matching your criteria</p>
                    {(query || roleFilter) && (
                      <a href="/admin" className="mt-2 text-sm underline underline-offset-4 inline-block">
                        Clear filters
                      </a>
                    )}
                  </div>
                )}
              </Suspense>
            </div>
          </TabsContent>

          <TabsContent value="compact" className="mt-0">
            <div className="bg-white dark:bg-slate-900 rounded-lg border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-3 font-medium text-sm">User</th>
                      <th className="text-left p-3 font-medium text-sm">Email</th>
                      <th className="text-left p-3 font-medium text-sm">Role</th>
                      <th className="text-left p-3 font-medium text-sm">Joined</th>
                      <th className="text-left p-3 font-medium text-sm">ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user, index) => (
                        <tr
                          key={user.id}
                          className={`border-t ${index % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50 dark:bg-slate-800/50"} hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors`}
                        >
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-muted overflow-hidden">
                                {user.imageUrl ? (
                                  <img
                                    src={user.imageUrl || "/placeholder.svg"}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xs font-medium">
                                    {user.firstName?.charAt(0) || ""}
                                    {user.lastName?.charAt(0) || ""}
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-medium">
                                  {user.firstName} {user.lastName}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-sm">{user.email}</td>
                          <td className="p-3">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                user.role === "super_admin"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                  : user.role === "admin"
                                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                                    : user.role === "moderator"
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                              }`}
                            >
                              {user.role || "user"}
                            </span>
                          </td>
                          <td className="p-3 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td className="p-3">
                            <code className="text-xs font-mono bg-muted p-1 rounded">
                              {user.id.substring(0, 10)}...
                            </code>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center p-8 text-muted-foreground">
                          No users found matching your criteria
                          {(query || roleFilter) && (
                            <div>
                              <a href="/admin" className="mt-2 text-sm underline underline-offset-4 inline-block">
                                Clear filters
                              </a>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="text-sm text-muted-foreground text-center mt-6">
          {filteredUsers.length === serializedUsers.length ? (
            <>
              Showing all {filteredUsers.length} users
              {query && ` matching "${query}"`}
            </>
          ) : (
            <>
              Showing {filteredUsers.length} of {serializedUsers.length} users
              {roleFilter && ` with role "${roleFilter}"`}
              {query && ` matching "${query}"`}
            </>
          )}
          {serializedUsers.length === 500 && (
            <div className="mt-1 text-amber-500">
              Note: Maximum of 500 users shown. Use search or filters to narrow results if needed.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
