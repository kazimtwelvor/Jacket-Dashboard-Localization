import prismadb from "@/lib/prismadb"
import { OrdersClient } from "./components/client"

const OrdersPage = async ({
  params,
}: {
  params: { storeId: string }
}) => {
  const orders = await prismadb.order.findMany({
    where: {
      storeId: params.storeId,
    },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Convert Decimal fields to numbers for client compatibility
  const serializedOrders = orders.map(order => ({
    ...order,
    shippingCost: Number(order.shippingCost),
    tax: Number(order.tax),
    discount: Number(order.discount),
    total: Number(order.total),
    orderItems: order.orderItems.map(item => ({
      ...item,
      price: Number(item.price),
      // originalPrice: Number(item.originalPrice),
      discountAmount: Number(item.discountAmount),
      total: Number(item.total),
      product: item.product ? {
        ...item.product,
        price: Number(item.product.price),
        salePrice: item.product.salePrice ? Number(item.product.salePrice) : null,
        // originalPrice: Number(item.product.originalPrice)
      } : null
    }))
  }))

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OrdersClient data={serializedOrders} />
      </div>
    </div>
  )
}

export default OrdersPage
