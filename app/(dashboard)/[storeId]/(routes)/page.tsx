import type React from "react"

import { DollarSign, Package, ShoppingCart, Star, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"
import { Button } from "@/components/ui/button"
import { RecentSales } from "@/components/dashboard/recent-sales"
import { RecentReviews } from "@/components/dashboard/recent-reviews"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { TopProducts } from "@/components/dashboard/top-products"
import { QuickActions } from "@/components/dashboard/quick-actions"
import prismadb from "@/lib/prismadb"
import Link from "next/link"
import type { Decimal } from "@prisma/client/runtime/library"

interface OrderItem {
  id: string
  orderId: string
  productId: string
  product: Product
}

interface Product {
  id: string
  name: string
  price: Decimal | number
  images: { url: string }[]
  categoryData?: { material?: string; style?: string; gender?: string }
}

interface User {
  name?: string
  email?: string
}

interface ExtendedOrder {
  id: string
  storeId: string
  isPaid: boolean
  phone?: string
  createdAt: Date
  orderItems: OrderItem[]
  total?: Decimal | number
  user?: User
}

interface Review {
  id: string
  rating: number
  comment: string
  title?: string
  userName?: string
  createdAt: Date
  product: {
    name: string
  }
}

interface DashboardPageProps {
  params: { storeId: string }
}

const DashboardPage: React.FC<DashboardPageProps> = async ({ params }) => {
  const { storeId } = await params

  const store = await prismadb.store.findFirst({
    where: {
      id: storeId,
    },
  })

  const orders = (await prismadb.order.findMany({
    where: {
      storeId,
    },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })) as unknown as ExtendedOrder[]

  const paidOrders = orders.filter((order) => order.isPaid)

  const products = await prismadb.product.findMany({
    where: {
      storeId,
    },
    include: {
      orderItems: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const reviews = (await prismadb.review.findMany({
    where: {
      storeId,
    },
    include: {
      product: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 4,
  })) as unknown as Review[]

  const totalRevenue = paidOrders.reduce((total, order) => {
    return (
      total +
      (order.total
        ? Number(order.total)
        : order.orderItems.reduce((orderSum, item) => {
            return orderSum + Number(item.product.price)
          }, 0))
    )
  }, 0)

  const salesData = {
    totalRevenue,
    totalOrders: orders.length,
    paidOrders: paidOrders.length,
    pendingOrders: orders.filter((order) => !order.isPaid).length,
    totalProducts: products.length,
    totalReviews: reviews.length,
    averageRating:
      reviews.length > 0
        ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
        : "N/A",
  }

  const monthlyData = [
    { name: "Jan", total: 0, orders: 0 },
    { name: "Feb", total: 0, orders: 0 },
    { name: "Mar", total: 0, orders: 0 },
    { name: "Apr", total: 0, orders: 0 },
    { name: "May", total: 0, orders: 0 },
    { name: "Jun", total: 0, orders: 0 },
  ]

  const currentMonthRevenue = monthlyData[5]?.total || 0
  const previousMonthRevenue = monthlyData[4]?.total || 1 
  const revenueChange = ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100

  const currentMonthOrders = 0
  const previousMonthOrders = 1 
  const ordersChange = ((currentMonthOrders - previousMonthOrders) / previousMonthOrders) * 100

  const productsChange = 0 
  const productSalesMap = new Map()

  paidOrders.forEach((order) => {
    order.orderItems.forEach((item) => {
      const productId = item.product.id
      if (productSalesMap.has(productId)) {
        productSalesMap.set(productId, productSalesMap.get(productId) + 1)
      } else {
        productSalesMap.set(productId, 1)
      }
    })
  })

  const topSellingProducts = products
    .map((product) => ({
      id: product.id,
      name: product.name,
      price: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(product.price)),
      category: product.categoryData ? `${product.categoryData.material || ''} ${product.categoryData.style || ''}`.trim() || "Uncategorized" : "Uncategorized",
      image: "/placeholder.svg",
      salesCount: productSalesMap.get(product.id) || 0,
    }))
    .sort((a, b) => b.salesCount - a.salesCount)
    .slice(0, 5)

  const recentOrders = orders.slice(0, 5).map((order) => ({
    id: order.id,
    customerName: order.user?.name || `Customer #${order.id.substring(0, 8)}`,
    amount: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
      order.total
        ? Number(order.total)
        : order.orderItems.reduce((total, item) => total + Number(item.product.price), 0),
    ),
    status: order.isPaid ? "Paid" : "Pending",
    date: new Date(order.createdAt).toLocaleDateString(),
    email: order.user?.email || order.phone || "No contact info",
  }))

  const formattedReviews = reviews.map((review) => ({
    id: review.id,
    userName: review.userName || "Anonymous",
    rating: review.rating,
    comment: review.comment,
    title: review.title || undefined, 
    createdAt: review.createdAt,
    product: {
      name: review.product.name,
    },
  }))

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading title={`Dashboard: ${store?.name}`} description="Overview of your store" />
          <Button variant="outline" size="sm">
            <Clock className="mr-2 h-4 w-4" />
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </Button>
        </div>

        <Separator />

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(salesData.totalRevenue)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                {revenueChange > 0 ? (
                  <>
                    <ArrowUpRight className="mr-1 h-4 w-4 text-emerald-500" />
                    <span className="text-emerald-500">{revenueChange.toFixed(1)}%</span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="mr-1 h-4 w-4 text-rose-500" />
                    <span className="text-rose-500">{Math.abs(revenueChange).toFixed(1)}%</span>
                  </>
                )}
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{salesData.totalOrders}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                {ordersChange > 0 ? (
                  <>
                    <ArrowUpRight className="mr-1 h-4 w-4 text-emerald-500" />
                    <span className="text-emerald-500">{ordersChange.toFixed(1)}%</span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="mr-1 h-4 w-4 text-rose-500" />
                    <span className="text-rose-500">{Math.abs(ordersChange).toFixed(1)}%</span>
                  </>
                )}
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{salesData.totalProducts}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                {productsChange > 0 ? (
                  <>
                    <ArrowUpRight className="mr-1 h-4 w-4 text-emerald-500" />
                    <span className="text-emerald-500">{productsChange.toFixed(1)}%</span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="mr-1 h-4 w-4 text-rose-500" />
                    <span className="text-rose-500">{Math.abs(productsChange).toFixed(1)}%</span>
                  </>
                )}
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reviews</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{salesData.totalReviews}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Average Rating: <span className="font-medium">{salesData.averageRating}</span>
              </p>
            </CardContent>
          </Card>
        </div>

        <QuickActions storeId={storeId} />

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-full lg:col-span-4">
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>Monthly revenue and order trends</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <SalesChart data={monthlyData} />
            </CardContent>
          </Card>

          <Card className="col-span-full lg:col-span-3">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest {recentOrders.length} orders</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentSales orders={recentOrders} />
            </CardContent>
            <CardFooter>
              <Link href={`/${storeId}/orders`} className="w-full">
                <Button variant="outline" className="w-full">
                  View All Orders
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-full lg:col-span-4">
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>Your best performing products</CardDescription>
            </CardHeader>
            <CardContent>
              <TopProducts products={topSellingProducts} />
            </CardContent>
            <CardFooter>
              <Link href={`/${storeId}/products`} className="w-full">
                <Button variant="outline" className="w-full">
                  Manage Products
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="col-span-full lg:col-span-3">
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
              <CardDescription>Latest customer feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentReviews reviews={formattedReviews} />
            </CardContent>
            <CardFooter>
              <Link href={`/${storeId}/reviews`} className="w-full">
                <Button variant="outline" className="w-full">
                  View All Reviews
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
