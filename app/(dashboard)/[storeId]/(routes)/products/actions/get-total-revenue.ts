import prismadb from "@/lib/prismadb"

export async function getTotalRevenue(storeId: string): Promise<number> {
  const paidOrders = await prismadb.order.findMany({
    where: {
      storeId,
      isPaid: true,
    },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  })

  const totalRevenue = paidOrders.reduce((total, order) => {
    const orderTotal = order.orderItems.reduce((orderSum, item) => {
      return orderSum + Number.parseFloat(item.product.price.toString()) * item.quantity
    }, 0)

    return total + orderTotal
  }, 0)

  return totalRevenue
}
