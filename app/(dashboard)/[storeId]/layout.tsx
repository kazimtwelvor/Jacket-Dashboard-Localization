import type React from "react"
import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"

import { Sidebar } from "@/components/sidebar/sidebar"
import Topbar from "@/components/topbar"
import prismadb from "@/lib/prismadb"

interface DashboardLayoutProps {
  children: React.ReactNode
  params: { storeId: string }
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  
  const storeId = String(params?.storeId || "")

  if (!storeId) {
    redirect("/")
  }

  try {
    const dbUser = await prismadb.user.findFirst({
      where: {
        clerkId: userId,
      },
    })

    if (!dbUser) {
      console.error("User not found in database with Clerk ID:", userId)
      redirect("/")
    }

    const store = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    })

    const serializedStore = store
      ? {
          ...store,
          taxRate: store.taxRate ? Number.parseFloat(store.taxRate.toString()) : null,
        }
      : null

    if (!serializedStore) {
      const storeMember = await prismadb.storeUser.findFirst({
        where: {
          storeId: storeId,
          userId: dbUser.id, 
        },
        include: {
          store: true, 
        },
      })

      if (!storeMember) {
        redirect("/")
      }

      console.log("User is a member of this store:", {
        storeId: storeMember.storeId,
        storeName: storeMember.store.name,
        role: storeMember.role,
      })
    }

    const ownedStores = await prismadb.store.findMany({
      where: {
        userId,
      },
    })

    const serializedOwnedStores = ownedStores.map((store) => ({
      ...store,
      taxRate: store.taxRate ? Number.parseFloat(store.taxRate.toString()) : null,
    }))

    const memberStores = await prismadb.storeUser.findMany({
      where: {
        userId: dbUser.id,
      },
      include: {
        store: true,
      },
    })

    const serializedMemberStores = memberStores.map((membership) => ({
      ...membership.store,
      taxRate: membership.store.taxRate ? Number.parseFloat(membership.store.taxRate.toString()) : null,
      role: membership.role,
    }))

    const allStores = [
      ...serializedOwnedStores,
      ...serializedMemberStores.filter(
        (memberStore) => !serializedOwnedStores.some((ownedStore) => ownedStore.id === memberStore.id),
      ),
    ]

    console.log(`Dashboard layout: Found ${allStores.length} total stores for user`, {
      ownedStores: serializedOwnedStores.length,
      memberStores: serializedMemberStores.length,
      allStores: allStores.map((store) => ({ id: store.id, name: store.name, role: store.role })),
    })

    return (
      <div className="h-full relative">
        <Sidebar items={serializedOwnedStores} memberStores={serializedMemberStores} />
        <Topbar stores={allStores} />
        <main className="md:pl-[var(--sidebar-width,70px)] pt-20 md:pt-16 min-h-screen bg-gradient-to-b from-background to-background/95">
          <div className="px-4 py-6 max-w-[2000px] mx-auto">{children}</div>
        </main>
      </div>
    )
  } catch (error) {
    console.error("Dashboard layout error:", error)
    redirect("/")
  }
}
