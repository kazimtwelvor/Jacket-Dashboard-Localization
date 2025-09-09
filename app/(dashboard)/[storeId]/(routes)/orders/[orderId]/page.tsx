


import prismadb from "@/lib/prismadb"

import { OrderForm } from "./components/order-form"

const OrderPage = async ({
  params,
}: {
  params: { orderId: string; storeId: string }
}) => {
  let order = null

  if (params.orderId !== "new") {
    order = await prismadb.order.findUnique({
      where: {
        id: params.orderId,
      },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                images: {
                  include: {
                    image: true,
                  },
                },
              },
            },
          },
        },
        user: true,
      },
    })

    // Log order details for debugging
 
  }

  // Fetch products for product selection
  const products = await prismadb.product.findMany({
    where: {
      storeId: params.storeId,
      isArchived: false,
    },
    include: {
      images: {
        include: {
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Fetch store users for customer selection
  const storeUsers = await prismadb.storeUser.findMany({
    where: {
      storeId: params.storeId,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Convert Decimal fields to numbers for client compatibility
  const serializedOrder = order ? {
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
  } : null

  const serializedProducts = products.map(product => ({
    ...product,
    price: Number(product.price),
    salePrice: product.salePrice ? Number(product.salePrice) : null,
    originalPrice: Number(product.originalPrice)
  }))

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OrderForm initialData={serializedOrder} products={serializedProducts} storeUsers={storeUsers} />
      </div>
    </div>
  )
}

export default OrderPage
