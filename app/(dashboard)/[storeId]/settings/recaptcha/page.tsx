import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"

import prismadb from "@/lib/prismadb"
import { RecaptchaForm } from "./components/recaptcha-form"
import { getUserStoreRole } from "@/lib/store-roles"
import { SettingsTabs } from "../components/settings-tabs"

export default async function RecaptchaPage({
  params,
}: {
  params: { storeId: string }
}) {
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

  // If not the owner, check if they have ADMIN role
  if (!store) {
    const userRole = await getUserStoreRole(userId, params.storeId)

    if (userRole !== "ADMIN") {
      redirect("/")
    }
  }

  // Get reCAPTCHA settings from the database
  const recaptchaSettings = await prismadb.recaptchaSettings.findFirst({
    where: {
      storeId: params.storeId,
    },
  })

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SettingsTabs />
        <RecaptchaForm initialData={recaptchaSettings} storeId={params.storeId} />
      </div>
    </div>
  )
}
