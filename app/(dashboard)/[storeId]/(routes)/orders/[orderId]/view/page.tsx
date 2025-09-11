import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

import prismadb from "@/lib/prismadb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const ViewOrderPage = async ({
  params,
}: {
  params: Promise<{ orderId: string; storeId: string }>
}) => {
  const { orderId, storeId } = await params

  const order = await prismadb.order.findUnique({
    where: {
      id: orderId,
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

  if (!order) {
    return <div>Order not found</div>
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'refunded': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={`/${storeId}/orders`}>
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
              <p className="text-muted-foreground">Order #{order.id}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={getStatusColor(order.status)}>
                {order.status}
              </Badge>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-muted-foreground">
                  Payment: <span className="font-medium">{order.paymentStatus}</span>
                </p>
                {/* <p className="text-sm text-muted-foreground">
                  Fulfillment: <span className="font-medium">{order.fulfillmentStatus}</span>
                </p> */}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {order.customerName && (
                <p className="text-sm">
                  <span className="font-medium">Name:</span> {order.customerName}
                </p>
              )}
              {order.customerEmail && (
                <p className="text-sm">
                  <span className="font-medium">Email:</span> {order.customerEmail}
                </p>
              )}
              {order.phone && (
                <p className="text-sm">
                  <span className="font-medium">Phone:</span> {order.phone}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Total:</span> ${Number(order.total).toFixed(2)}
              </p>
              <p className="text-sm">
                <span className="font-medium">Shipping:</span> ${Number(order.shippingCost).toFixed(2)}
              </p>
              <p className="text-sm">
                {/* <span className="font-medium">Tax:</span> ${Number(order.tax).toFixed(2)} */}
              </p>
              <p className="text-sm">
                <span className="font-medium">Discount:</span> ${Number(order.discount).toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                {order.address && <p>{order.address}</p>}
                {order.shippingAddress && <p>{order.shippingAddress}</p>}
                {order.city && order.state && (
                  <p>{order.city}, {order.state} {order.zipCode}</p>
                )}
                {order.country && <p>{order.country}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Method:</span> {order.paymentMethod || 'N/A'}
              </p>
              {order.transactionId && (
                <p className="text-sm">
                  <span className="font-medium">Transaction ID:</span> {order.transactionId}
                </p>
              )}
              <p className="text-sm">
                <span className="font-medium">Paid:</span> {order.isPaid ? 'Yes' : 'No'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 border-b pb-4">
                  <div className="h-16 w-16 rounded-md bg-gray-100 flex items-center justify-center">
                    {item.product?.images?.[0]?.image?.url ? (
                      <img
                        src={item.product.images[0].image.url}
                        alt={item.product.name}
                        className="h-full w-full object-cover rounded-md"
                      />
                    ) : (
                      <div className="text-xs text-gray-500">No Image</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.productName || item.product?.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      SKU: {item.productSku || item.product?.sku}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity} × ${Number(item.price).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${Number(item.total).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {order.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Order Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{order.notes}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Order Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">Created:</span> {format(new Date(order.createdAt), 'PPP p')}
            </p>
            <p className="text-sm">
              <span className="font-medium">Last Updated:</span> {format(new Date(order.updatedAt), 'PPP p')}
            </p>
            {/* {order.estimatedDelivery && (
              <p className="text-sm">
                <span className="font-medium">Estimated Delivery:</span> {format(new Date(order.estimatedDelivery), 'PPP')}
              </p>
            )}
            {order.actualDelivery && (
              <p className="text-sm">
                <span className="font-medium">Actual Delivery:</span> {format(new Date(order.actualDelivery), 'PPP')}
              </p>
            )} */}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ViewOrderPage