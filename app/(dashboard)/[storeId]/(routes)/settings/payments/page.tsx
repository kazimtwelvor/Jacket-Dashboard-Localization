

import type React from "react"
import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"

import prismadb from "@/lib/prismadb"

import { PaymentMethodsForm } from "./components/payment-methods-form"

interface SettingsPageProps {
  params: {
    storeId: string
  }
}

const SettingsPage: React.FC<SettingsPageProps> = async ({ params }) => {
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

  const stripeAccounts = await prismadb.stripeAccount.findMany({
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
        <PaymentMethodsForm initialData={store} />
      </div>
    </div>
  )
}

export default SettingsPage
