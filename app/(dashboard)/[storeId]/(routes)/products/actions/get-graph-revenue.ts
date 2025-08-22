import prismadb from "@/lib/prismadb"

interface GraphData {
  name: string
  total: number
}

export async function getGraphRevenue(storeId: string): Promise<GraphData[]> {
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

  const monthlyRevenue: { [key: number]: number } = {}

  // Initialize with all months
  for (let i = 0; i < 12; i++) {
    monthlyRevenue[i] = 0
  }

  // Group orders by month and sum the revenue
  for (const order of paidOrders) {
    const month = new Date(order.createdAt).getMonth()

    const orderTotal = order.orderItems.reduce((total, item) => {
      return total + Number.parseFloat(item.product.price.toString()) * item.quantity
    }, 0)

    monthlyRevenue[month] += orderTotal
  }

  // Format the data for the graph
  const graphData: GraphData[] = [
    { name: "Jan", total: monthlyRevenue[0] },
    { name: "Feb", total: monthlyRevenue[1] },
    { name: "Mar", total: monthlyRevenue[2] },
    { name: "Apr", total: monthlyRevenue[3] },
    { name: "May", total: monthlyRevenue[4] },
    { name: "Jun", total: monthlyRevenue[5] },
    { name: "Jul", total: monthlyRevenue[6] },
    { name: "Aug", total: monthlyRevenue[7] },
    { name: "Sep", total: monthlyRevenue[8] },
    { name: "Oct", total: monthlyRevenue[9] },
    { name: "Nov", total: monthlyRevenue[10] },
    { name: "Dec", total: monthlyRevenue[11] },
  ]

  return graphData
}
