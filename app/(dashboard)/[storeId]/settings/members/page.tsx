import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

import prismadb from "@/lib/prismadb"
import { MembersClient } from "./components/client"
import { SettingsTabs } from "../components/settings-tabs"
import { getUserStoreRole } from "@/lib/store-roles"

const MembersPage = async ({ params }: { params: { storeId: string } }) => {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  // Check if user is the owner
  const store = await prismadb.store.findFirst({
    where: {
      id: params.storeId,
      userId,
    },
  })

  const isOwner = !!store

  // If not the owner, check if they have ADMIN role
  if (!store) {
    const userRole = await getUserStoreRole(userId, params.storeId)

    if (userRole !== "ADMIN") {
      redirect("/")
    }
  }

  // Fetch all store users (members)
  const storeUsers = await prismadb.storeUser.findMany({
    where: {
      storeId: params.storeId,
    },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Fetch all pending invitations
  const invitations = await prismadb.invitation.findMany({
    where: {
      storeId: params.storeId,
      status: "PENDING",
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Format members data for the client
  const formattedMembers = storeUsers.map((storeUser) => ({
    id: storeUser.id,
    userId: storeUser.userId,
    name: storeUser.user ? `${storeUser.user.firstName || ""} ${storeUser.user.lastName || ""}`.trim() : "Unknown User",
    email: storeUser.user?.email || "No email",
    role: storeUser.role,
    image: storeUser.user?.imageUrl || "",
    isOwner: storeUser.userId === store?.userId,
    isCurrentUser: storeUser.userId === userId,
    createdAt: storeUser.createdAt,
  }))

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SettingsTabs />
        <MembersClient
          members={formattedMembers}
          invitations={invitations}
          currentUserId={userId}
          storeId={params.storeId}
          isOwner={isOwner}
        />
      </div>
    </div>
  )
}

export default MembersPage
