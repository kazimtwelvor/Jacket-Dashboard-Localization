
"use client"

import type React from "react"

import * as z from "zod"
import axios from "axios"
import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { Trash } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { Heading } from "@/components/ui/heading"
import { AlertModal } from "@/components/modals/alert-modal"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { OrderItemsTable } from "./order-items-table"
import { OrderSummary } from "./order-summary"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  isPaid: z.boolean().default(false),
  status: z.string().min(1),
  paymentMethod: z.string().optional(),
  shippingMethod: z.string().optional(),
  shippingCost: z.coerce.number().min(0).default(0),
  // tax: z.coerce.number().min(0).default(0),
  discount: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
  // trackingNumber: z.string().optional(),
  billingAddress: z.string().optional(),
  shippingAddress: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  // fulfillmentStatus: z.string().min(1),
  // estimatedDelivery: z.date().optional().nullable(),
  // actualDelivery: z.date().optional().nullable(),
  transactionId: z.string().optional(),
  paymentStatus: z.string().min(1),
  // cardNumber: z.string().optional(),
  // expirationDate: z.string().optional(),
  // securityCode: z.string().optional(),
  // cardCountry: z.string().optional(),
})

type OrderFormValues = z.infer<typeof formSchema>

interface OrderFormProps {
  initialData: any | null
  products: any[]
  storeUsers: any[]
}

const normalizePaymentMethod = (method: string | null | undefined): string => {
  if (!method) return ""

  const lowercaseMethod = method.toLowerCase()

  if (lowercaseMethod === "stripe" || lowercaseMethod === "STRIPE") {
    return "stripe"
  }

  return lowercaseMethod
}

export const OrderForm: React.FC<OrderFormProps> = ({ initialData, products, storeUsers }) => {
  const params = useParams()
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [orderItems, setOrderItems] = useState(initialData?.orderItems || [])

  const title = initialData ? "Edit order" : "Create order"
  const description = initialData ? "Edit order details" : "Create a new order"
  const toastMessage = initialData ? "Order updated." : "Order created."
  const action = initialData ? "Save changes" : "Create"
  const normalizedPaymentMethod = normalizePaymentMethod(initialData?.paymentMethod)


  const defaultValues = initialData
    ? {
        customerName: initialData.customerName || "",
        customerEmail: initialData.customerEmail || "",
        phone: initialData.phone || "",
        address: initialData.address || "",
        isPaid: initialData.isPaid || false,
        status: initialData.status || "PENDING",
        paymentMethod: normalizedPaymentMethod,
        shippingMethod: initialData.shippingMethod || "",
        shippingCost: Number.parseFloat(String(initialData.shippingCost)) || 0,
        // tax: Number.parseFloat(String(initialData.tax)) || 0,
        discount: Number.parseFloat(String(initialData.discount)) || 0,
        notes: initialData.notes || "",
        // trackingNumber: initialData.trackingNumber || "",
        billingAddress: initialData.billingAddress || "",
        shippingAddress: initialData.shippingAddress || "",
        city: initialData.city || "",
        country: initialData.country || "",
        state: initialData.state || "",
        zipCode: initialData.zipCode || "",
        // fulfillmentStatus: initialData.fulfillmentStatus || "pending",
        // estimatedDelivery: initialData.estimatedDelivery ? new Date(initialData.estimatedDelivery) : null,
        // actualDelivery: initialData.actualDelivery ? new Date(initialData.actualDelivery) : null,
        transactionId: initialData.transactionId || "",
        paymentStatus: initialData.paymentStatus || "pending",
        // cardNumber: initialData.cardNumber || "",
        // expirationDate: initialData.expirationDate || "",
        // securityCode: initialData.securityCode || "",
        // cardCountry: initialData.cardCountry || "",
      }
    : {
        customerName: "",
        customerEmail: "",
        phone: "",
        address: "",
        isPaid: false,
        status: "PENDING",
        paymentMethod: "",
        shippingMethod: "",
        shippingCost: 0,
        // tax: 0,
        discount: 0,
        notes: "",
        // trackingNumber: "",
        billingAddress: "",
        shippingAddress: "",
        city: "",
        country: "",
        state: "",
        zipCode: "",
        // fulfillmentStatus: "pending",
        // estimatedDelivery: null,
        // actualDelivery: null,
        transactionId: "",
        paymentStatus: "pending",
        // cardNumber: "",
        // expirationDate: "",
        // securityCode: "",
        // cardCountry: "",
      }

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  useEffect(() => {
    if (initialData) {
      const normalizedPaymentMethod = normalizePaymentMethod(initialData.paymentMethod)

      form.setValue("paymentMethod", normalizedPaymentMethod)

      form.setValue("userId", initialData.userId || "")
      form.setValue("customerEmail", initialData.customerEmail || "")
      form.setValue("isPaid", initialData.isPaid || false)
      form.setValue("status", initialData.status || "PENDING")
      form.setValue("transactionId", initialData.transactionId || "")
      form.setValue("paymentStatus", initialData.paymentStatus || "pending")
    }
  }, [initialData, form])

  const onSubmit = async (data: OrderFormValues) => {
    try {
      setLoading(true)

      if (!orderItems || orderItems.length === 0) {
        toast.error("Please add at least one item to the order")
        setLoading(false)
        return
      }

      const subtotal = orderItems.reduce((acc: number, item: any) => {
        return acc + Number.parseFloat(String(item.price)) * item.quantity
      }, 0)

      const total = subtotal + data.shippingCost - data.discount
      const formattedOrderItems = orderItems.map((item: any) => {
        const productId = item.productId || item.product?.id
        if (!productId) {
          throw new Error(`Product ID is required for item: ${item.product?.name || 'Unknown'}`)
        }
        
        return {
          id: item.id,
          productId,
          quantity: item.quantity || 1,
          price: Number.parseFloat(String(item.price || 0)),
          discountAmount: Number.parseFloat(String(item.discountAmount || 0)),
          total: Number.parseFloat(String(item.price || 0)) * (item.quantity || 1),
          sizeIds: item.sizeIds || [],
          colorIds: item.colorIds || [],
          selectedOptions: item.selectedOptions || {},
          productSku: item.productSku || item.product?.sku || "",
          productName: item.productName || item.product?.name || "",
          customerName: "Customer",
        }
      })

      const requestData = {
        ...data,
        total,
        orderItems: formattedOrderItems,
      }
      
      console.log("Sending order data:", JSON.stringify(requestData, null, 2))

      if (initialData) {
        await axios.patch(`/api/${params?.storeId}/orders/${params?.orderId}`, requestData)
      } else {
        const response = await axios.post(`/api/${params?.storeId}/orders`, requestData)
        router.push(`/${params?.storeId}/orders/${response.data.id}`)
      }

      router.refresh()
      toast.success(toastMessage)
    } catch (error: any) {
      toast.error("Something went wrong.")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async () => {
    try {
      setLoading(true)
      await axios.delete(`/api/${params?.storeId}/orders/${params?.orderId}`)
      router.push(`/${params?.storeId}/orders`)
      toast.success("Order deleted.")
    } catch (error: any) {
      toast.error("Something went wrong.")
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  const handleAddOrderItem = (product: any) => {
    setOrderItems([
      ...orderItems,
      {
        product,
        productId: product.id,
        quantity: 1,
        price: Number.parseFloat(String(product.price)),
        discountAmount: 0,
        sizeIds: [],
        colorIds: [],
      },
    ])
  }

  const handleRemoveOrderItem = (index: number) => {
    const newOrderItems = [...orderItems]
    newOrderItems.splice(index, 1)
    setOrderItems(newOrderItems)
  }

  const handleUpdateOrderItem = (index: number, field: string, value: any) => {
    const newOrderItems = [...orderItems]
    newOrderItems[index] = {
      ...newOrderItems[index],
      [field]: value,
    }
    setOrderItems(newOrderItems)
  }

  const subtotal = orderItems.reduce((acc: number, item: any) => {
    return acc + Number.parseFloat(String(item.price)) * item.quantity
  }, 0)

  const shippingCost = form.watch("shippingCost") || 0
  // const tax = form.watch("tax") || 0
  const discount = form.watch("discount") || 0
  const total = subtotal + shippingCost - discount

  return (
    <>
      <AlertModal isOpen={open} onClose={() => setOpen(false)} onConfirm={onDelete} loading={loading} />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button disabled={loading} variant="destructive" size="sm" onClick={() => setOpen(true)}>
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="items">Order Items</TabsTrigger>
              <TabsTrigger value="shipping">Shipping & Payment</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Information</CardTitle>
                    <CardDescription>Customer details for this order</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">


                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Name</FormLabel>
                          <FormControl>
                            <Input disabled={loading} placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="customerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Email</FormLabel>
                          <FormControl>
                            <Input disabled={loading} placeholder="customer@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input disabled={loading} placeholder="+1 (555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Order Status</CardTitle>
                    <CardDescription>Set the current status of this order</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order Status</FormLabel>
                          <Select
                            disabled={loading}
                            onValueChange={field.onChange}
                            value={field.value}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue defaultValue={field.value} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="PENDING">Pending</SelectItem>
                              <SelectItem value="PROCESSING">Processing</SelectItem>
                              <SelectItem value="SHIPPED">Shipped</SelectItem>
                              <SelectItem value="DELIVERED">Delivered</SelectItem>
                              <SelectItem value="CANCELLED">Cancelled</SelectItem>
                              <SelectItem value="REFUNDED">Refunded</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isPaid"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Paid</FormLabel>
                            <FormDescription>Mark this order as paid</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order Notes</FormLabel>
                          <FormControl>
                            <Textarea disabled={loading} placeholder="Add notes about this order" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="items" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                  <CardDescription>Products included in this order</CardDescription>
                </CardHeader>
                <CardContent>
                  <OrderItemsTable
                    orderItems={orderItems}
                    products={products}
                    onAddItem={handleAddOrderItem}
                    onRemoveItem={handleRemoveOrderItem}
                    onUpdateItem={handleUpdateOrderItem}
                  />
                </CardContent>
              </Card>

              <OrderSummary
                subtotal={subtotal}
                shippingCost={shippingCost}
                // tax={tax}
                discount={discount}
                total={total}
              />
            </TabsContent>

            <TabsContent value="shipping" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Information</CardTitle>
                    <CardDescription>Shipping details for this order</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input disabled={loading} placeholder="123 Main St" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shippingAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shipping Address</FormLabel>
                          <FormControl>
                            <Textarea disabled={loading} placeholder="Full shipping address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="billingAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Billing Address</FormLabel>
                          <FormControl>
                            <Textarea disabled={loading} placeholder="Full billing address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input disabled={loading} placeholder="City" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Destination Country</FormLabel>
                            <FormControl>
                              <Input disabled={loading} placeholder="Country" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State/Province</FormLabel>
                            <FormControl>
                              <Input disabled={loading} placeholder="State/Province" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Zip/Postal Code</FormLabel>
                            <FormControl>
                              <Input disabled={loading} placeholder="Zip/Postal Code" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="shippingMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shipping Method</FormLabel>
                          <Select
                            disabled={loading}
                            onValueChange={field.onChange}
                            value={field.value || ""}
                            defaultValue={field.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue defaultValue={field.value} placeholder="Select shipping method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="standard">Standard Shipping</SelectItem>
                              <SelectItem value="express">Express Shipping</SelectItem>
                              <SelectItem value="overnight">Overnight Shipping</SelectItem>
                              <SelectItem value="pickup">Local Pickup</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shippingCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shipping Cost</FormLabel>
                          <FormControl>
                            <Input type="number" disabled={loading} placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* <FormField
                      control={form.control}
                      name="trackingNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tracking Number</FormLabel>
                          <FormControl>
                            <Input disabled={loading} placeholder="Tracking number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    /> */}
                    {/* 
                    <FormField
                      control={form.control}
                      name="fulfillmentStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fulfillment Status</FormLabel>
                          <Select
                            disabled={loading}
                            onValueChange={field.onChange}
                            value={field.value}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue defaultValue={field.value} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    /> */}

                    {/* <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="estimatedDelivery"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Estimated Delivery</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground",
                                    )}
                                  >
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value || undefined}
                                  onSelect={field.onChange}
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="actualDelivery"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Actual Delivery</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground",
                                    )}
                                  >
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value || undefined}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div> */}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Payment Information</CardTitle>
                    <CardDescription>Payment details for this order</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method</FormLabel>
                          <Select
                            disabled={loading}
                            onValueChange={field.onChange}
                            value={field.value || ""}
                            defaultValue={field.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue defaultValue={field.value} placeholder="Select payment method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="credit_card">Credit Card</SelectItem>
                              <SelectItem value="stripe">Stripe</SelectItem>
                              <SelectItem value="paypal">PayPal</SelectItem>
                              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                              <SelectItem value="cash">Cash on Delivery</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="transactionId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transaction ID</FormLabel>
                          <FormControl>
                            <Input disabled={loading} placeholder="Transaction ID" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="paymentStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Status</FormLabel>
                          <Select
                            disabled={loading}
                            onValueChange={field.onChange}
                            value={field.value}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue defaultValue={field.value} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="failed">Failed</SelectItem>
                              <SelectItem value="refunded">Refunded</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* <FormField
                      control={form.control}
                      name="tax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tax</FormLabel>
                          <FormControl>
                            <Input type="number" disabled={loading} placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    /> */}

                    <FormField
                      control={form.control}
                      name="discount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount</FormLabel>
                          <FormControl>
                            <Input type="number" disabled={loading} placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Credit Card Fields - Show only when payment method is credit_card */}
                    {/* {form.watch("paymentMethod") === "credit_card" && (
                      <>
                        <FormField
                          control={form.control}
                          name="cardNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Card Number</FormLabel>
                              <FormControl>
                                <Input disabled={loading} placeholder="1234 5678 9012 3456" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="expirationDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Expiration Date (MM/YY)</FormLabel>
                                <FormControl>
                                  <Input disabled={loading} placeholder="MM/YY" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="securityCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Security Code (CVC)</FormLabel>
                                <FormControl>
                                  <Input disabled={loading} placeholder="123" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="cardCountry"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <Select
                                disabled={loading}
                                onValueChange={field.onChange}
                                value={field.value || ""}
                                defaultValue={field.value || ""}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select country" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="US">United States</SelectItem>
                                  <SelectItem value="CA">Canada</SelectItem>
                                  <SelectItem value="GB">United Kingdom</SelectItem>
                                  <SelectItem value="AU">Australia</SelectItem>
                                  <SelectItem value="DE">Germany</SelectItem>
                                  <SelectItem value="FR">France</SelectItem>
                                  <SelectItem value="IT">Italy</SelectItem>
                                  <SelectItem value="ES">Spain</SelectItem>
                                  <SelectItem value="NL">Netherlands</SelectItem>
                                  <SelectItem value="PK">Pakistan</SelectItem>
                                  <SelectItem value="IN">India</SelectItem>
                                  <SelectItem value="JP">Japan</SelectItem>
                                  <SelectItem value="CN">China</SelectItem>
                                  <SelectItem value="BR">Brazil</SelectItem>
                                  <SelectItem value="MX">Mexico</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )} */}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  )
}
