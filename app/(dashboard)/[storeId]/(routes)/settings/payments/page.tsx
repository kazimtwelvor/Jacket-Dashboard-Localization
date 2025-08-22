// import { auth } from "@clerk/nextjs/server"
// import { redirect } from "next/navigation"
// import prismadb from "@/lib/prismadb"
// import { PaymentMethodsForm } from "./components/payment-methods-form"

// const PaymentSettingsPage = async ({ params }: { params: Promise<{ storeId: string }> }) => {
//   const { storeId } = await params
//   const { userId } = await auth()

//   if (!userId) {
//     redirect("/sign-in")
//   }

//   const store = await prismadb.store.findFirst({
//     where: {
//       id: storeId,
//       userId,
//     },
//   })

//   if (!store) {
//     redirect("/")
//   }

//   return (
//     <div className="flex-col">
//       <div className="flex-1 p-8 pt-6 space-y-4">
//         <PaymentMethodsForm initialData={store} />
//       </div>
//     </div>
//   )
// }

// export default PaymentSettingsPage


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

  // Fetch Stripe accounts for this store
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

// Make sure the form is properly submitting the stripeAccounts data
// Add this to the onSubmit function in the payment-methods-form.tsx component
// If this file is not included in the project, we need to ensure the parent form is correctly handling the submission

// Ensure the form includes stripeAccounts in the data being submitted
// Example:
/*
const onSubmit = async (data: PaymentSettingsFormValues) => {
  try {
    setLoading(true)
    
    // Make sure stripeAccounts is included in the data being sent to the API
    await axios.patch(`/api/stores/${params.storeId}/payment-settings`, {
      ...data,
      stripeAccounts: data.stripeAccounts || [],
    })
    
    router.refresh()
    toast.success("Payment settings updated")
  } catch (error) {
    toast.error("Something went wrong")
  } finally {
    setLoading(false)
  }
}
*/
