import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"
import { DraftClient } from "./components/client"

const DraftPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const { userId } = await auth()
  const { storeId } = await params

  if (!userId) {
    redirect('/sign-in')
  }

  const user = await prismadb.user.findUnique({
    where: {
      clerkId: userId
    }
  })

  if (!user) {
    redirect('/')
  }

  const store = await prismadb.store.findFirst({
    where: {
      id: storeId,
      userId: user.clerkId
    }
  })

  const storeUser = await prismadb.storeUser.findFirst({
    where: {
      userId: user.id,
      storeId: storeId,
      OR: [
        { isOwner: true },
        { role: 'ADMIN' },
        { role: 'EDITOR' }
      ]
    }
  })

  if (!store && !storeUser) {
    redirect('/')
  }

  const products = await prismadb.product.findMany({
    where: {
      storeId: storeId,
      isDeleted: false,
    },
    include: {
      images: {
        include: {
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const trashedProducts = await prismadb.product.findMany({
    where: {
      storeId: storeId,
      isDeleted: true,
    },
    include: {
      images: {
        include: {
          image: true,
        },
      },
    },
    orderBy: {
      deletedAt: 'desc'
    }
  })

  const userRole = store ? 'OWNER' : storeUser?.role || 'VIEWER'

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <DraftClient data={products} trashedData={trashedProducts} userRole={userRole} />
      </div>
    </div>
  )
}

export default DraftPage