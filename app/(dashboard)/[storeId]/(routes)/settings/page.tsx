import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import prismadb from "@/lib/prismadb"
import { SettingsForm } from "./components/settings-form"
import { getUserStoreRole } from "@/lib/store-roles"

const SettingsPage = async ({ params }: { params: Promise<{ storeId: string }> }) => {
  const { storeId } = await params
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  // First check if user is the owner
  const store = await prismadb.store.findFirst({
    where: {
      id: storeId,
      userId,
    },
  })

  // If not the owner, check if they have ADMIN role
  if (!store) {
    const userRole = await getUserStoreRole(userId, storeId)

    if (userRole !== "ADMIN") {
      redirect("/")
    }

    // Get the store data for admin
    const storeData = await prismadb.store.findUnique({
      where: {
        id: storeId,
      },
    })

    if (!storeData) {
      redirect("/")
    }

    return (
      <div className="flex-col">
        <div className="flex-1 p-8 pt-6 space-y-4">
          <SettingsForm initialData={storeData} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-col">
      <div className="flex-1 p-8 pt-6 space-y-4">
        <SettingsForm initialData={store} />
      </div>
    </div>
  )
}

export default SettingsPage
