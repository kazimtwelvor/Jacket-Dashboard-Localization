
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
      throw new Error(`No Stripe key found for store ${storeId}`)
    }

    return new Stripe(store.stripeSecretKey, {
      apiVersion: "2025-02-24.acacia",
    })
  } catch (error) {
    throw error
  }
}
