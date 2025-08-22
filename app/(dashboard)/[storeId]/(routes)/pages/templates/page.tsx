import type React from "react"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

import { TemplatesClient } from "./components/client"
import prismadb from "@/lib/prismadb"

interface TemplatesPageProps {
  params: {
    storeId: string
  }
}

const TemplatesPage: React.FC<TemplatesPageProps> = async ({ params }) => {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const store = await prismadb.store.findFirst({
    where: {
      id: params.storeId,
      userId,
    },
  })

  if (!store) {
    redirect("/")
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <TemplatesClient />
      </div>
    </div>
  )
}

export default TemplatesPage
