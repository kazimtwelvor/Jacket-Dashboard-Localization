// import Stripe from "stripe"
// import prismadb from "./prismadb"

// // For development, use an environment variable
// export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2025-02-24.acacia",
// })

// // For production with multiple stores
// export async function getStripeForStore(storeId: string) {
//   try {
//     // First try to get a default Stripe account from the stripeAccounts table
//     const defaultAccount = await prismadb.stripeAccount.findFirst({
//       where: {
//         storeId: storeId,
//         isDefault: true,
//         isEnabled: true,
//       },
//     })

//     if (defaultAccount?.secretKey) {
//       console.log(`Using Stripe account: ${defaultAccount.name} for store ${storeId}`)
//       return new Stripe(defaultAccount.secretKey, {
//         apiVersion: "2025-02-24.acacia",
//       })
//     }

//     // Fall back to the legacy approach if no default account is found
//     const store = await prismadb.store.findUnique({
//       where: { id: storeId },
//       select: { stripeSecretKey: true },
//     })

//     if (store?.stripeSecretKey) {
//       console.log(`Using legacy Stripe key for store ${storeId}`)
//       return new Stripe(store.stripeSecretKey, {
//         apiVersion: "2025-02-24.acacia",
//       })
//     }

//     throw new Error(`No Stripe key found for store ${storeId}`)
//   } catch (error) {
//     console.error("Error getting Stripe for store:", error)
//     throw error
//   }
// }
import Stripe from "stripe"
import prismadb from "@/lib/prismadb"

// For production with multiple stores
export async function getStripeForStore(storeId: string) {
  try {
    // First try to get a default Stripe account from the stripeAccounts table
    const defaultAccount = await prismadb.stripeAccount.findFirst({
      where: {
        storeId: storeId,
        isDefault: true,
        isEnabled: true,
      },
    })

    if (defaultAccount?.secretKey) {
      console.log(`Using Stripe account: ${defaultAccount.name} for store ${storeId}`)
      return new Stripe(defaultAccount.secretKey, {
        apiVersion: "2025-02-24.acacia",
      })
    }

    // Fall back to the legacy approach if no default account is found
    const store = await prismadb.store.findUnique({
      where: { id: storeId },
      select: { stripeSecretKey: true },
    })

    if (!store?.stripeSecretKey) {
      console.log(`No Stripe account found for store ${storeId}`)
      throw new Error(`No Stripe key found for store ${storeId}`)
    }

    console.log(`Using legacy Stripe key for store ${storeId}`)
    return new Stripe(store.stripeSecretKey, {
      apiVersion: "2025-02-24.acacia",
    })
  } catch (error) {
    console.error("Error getting Stripe for store:", error)
    throw error
  }
}
