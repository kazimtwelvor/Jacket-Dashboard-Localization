import checkoutNodeJssdk from "@paypal/checkout-server-sdk"
import prismadb from "@/lib/prismadb"

export const getPayPalClient = async (storeId: string) => {
  const store = await prismadb.store.findUnique({
    where: {
      id: storeId,
    },
    select: {
      paypalClientId: true,
      paypalClientSecret: true,
      paypalSandboxMode: true,
    },
  })

  if (!store || !store.paypalClientId || !store.paypalClientSecret) {
    throw new Error("PayPal credentials not configured for this store")
  }

  const environment = store.paypalSandboxMode
    ? new checkoutNodeJssdk.core.SandboxEnvironment(store.paypalClientId, store.paypalClientSecret)
    : new checkoutNodeJssdk.core.LiveEnvironment(store.paypalClientId, store.paypalClientSecret)

  return new checkoutNodeJssdk.core.PayPalHttpClient(environment)
}
