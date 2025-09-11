import type React from "react"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

import { Sidebar } from "@/components/sidebar/sidebar"
import { db } from "@/lib/db"

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { storeId: string }
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const storeData = await db.store.findFirst({
    where: {
      id: params.storeId,
      OR: [
        { userId },
        {
          storeUsers: {
            some: {
              userId,
            },
          },
        },
      ],
    },
  })

  if (!storeData) {
    redirect("/")
  }

  const store = storeData

  const storesData = await db.store.findMany({
    where: {
      OR: [
        { userId },
        {
          storeUsers: {
            some: {
              userId,
            },
          },
        },
      ],
    },
  })

  const stores = storesData

  return (
    <div className="h-full">
      <div className="h-full flex">
        <Sidebar items={stores} />
        <main className="flex-1 h-full overflow-y-auto pl-[var(--sidebar-width,240px)] transition-all duration-300">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
