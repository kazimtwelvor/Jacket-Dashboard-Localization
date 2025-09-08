
import Stripe from "stripe"
import prismadb from "@/lib/prismadb"

export async function getStripeForStore(storeId: string) {
  try {
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
