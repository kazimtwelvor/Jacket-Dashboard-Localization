import type React from "react"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { redirect } from "next/navigation"
import Link from "next/link"
import prismadb from "@/lib/prismadb"
import { auth } from "@clerk/nextjs/server"
import { PageClient } from "./components/client"

interface PagesPageProps {
  params: {
    storeId: string
  }
}

const PagesPage: React.FC<PagesPageProps> = async ({ params }) => {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const pages = await prismadb.page.findMany({
    where: {
      storeId: params.storeId,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading title={`Pages (${pages.length})`} description="Manage your custom pages" />
          <Link href={`/${params.storeId}/pages/new`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New
            </Button>
          </Link>
        </div>
        <Separator />
        <PageClient data={pages} />
      </div>
    </div>
  )
}

export default PagesPage
