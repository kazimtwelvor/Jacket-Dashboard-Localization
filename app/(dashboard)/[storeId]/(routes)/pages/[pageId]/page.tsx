import type React from "react"
import prismadb from "@/lib/prismadb"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { PageForm } from "./components/page-form"

interface PagePageProps {
  params: {
    pageId: string
    storeId: string
  }
}

const PagePage: React.FC<PagePageProps> = async ({ params }) => {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  let page = null

  if (params.pageId !== "new") {
    page = await prismadb.page.findUnique({
      where: {
        id: params.pageId,
      },
    })
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <PageForm initialData={page} />
      </div>
    </div>
  )
}

export default PagePage
