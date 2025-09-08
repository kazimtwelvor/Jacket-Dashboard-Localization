"use client"

import type React from "react"

import { useState, useEffect } from "react"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type { Store } from "@prisma/client"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import { toast } from "react-hot-toast"
import { Trash, Plus } from "lucide-react"

import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { PaypalSettings } from "./paypal-settings"
import { CashOnDeliverySettings } from "./cash-on-delivery-settings"
import { BankTransferSettings } from "./bank-transfer-settings"
import { AlertModal } from "@/components/modals/alert-modal"
import { Badge } from "@/components/ui/badge"

interface StripeAccount {
  id: string
  name: string
  publishableKey: string
  secretKey: string
  webhookSecret: string | null
  isEnabled: boolean
  isTestMode: boolean
  isDefault: boolean
}

interface PaymentMethodsFormProps {
  initialData: Store & {
    paypalClientId?: string
    paypalClientSecret?: string
    paypalEnabled?: boolean
    paypalSandboxMode?: boolean
    stripePublishableKey?: string
    stripeSecretKey?: string
    stripeEnabled?: boolean
    stripeTestMode?: boolean
    stripeWebhookSecret?: string
    cashOnDeliveryEnabled?: boolean
    cashOnDeliveryFee?: number
    bankTransferEnabled?: boolean
    bankTransferDetails?: string
  }
}

const formSchema = z.object({
  paypalClientId: z.string().optional(),
  paypalClientSecret: z.string().optional(),
  paypalEnabled: z.boolean().default(false),
  paypalSandboxMode: z.boolean().default(true),

  stripePublishableKey: z.string().optional(),
  stripeSecretKey: z.string().optional(),
  stripeEnabled: z.boolean().default(false),
  stripeTestMode: z.boolean().default(true),
  stripeWebhookSecret: z.string().optional(),

  cashOnDeliveryEnabled: z.boolean().default(false),
  cashOnDeliveryFee: z.coerce.number().min(0).default(0),

  bankTransferEnabled: z.boolean().default(false),
  bankTransferDetails: z.string().optional(),
})

const stripeAccountSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  publishableKey: z.string().min(1, "Publishable key is required"),
  secretKey: z.string().min(1, "Secret key is required"),
  webhookSecret: z.string().optional(),
  isEnabled: z.boolean().default(false),
  isTestMode: z.boolean().default(true),
  isDefault: z.boolean().default(false),
})

type PaymentMethodsFormValues = z.infer<typeof formSchema>
type StripeAccountFormValues = z.infer<typeof stripeAccountSchema>

export const PaymentMethodsForm: React.FC<PaymentMethodsFormProps> = ({ initialData }) => {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [stripeAccounts, setStripeAccounts] = useState<StripeAccount[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const form = useForm<PaymentMethodsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paypalClientId: initialData.paypalClientId || "",
      paypalClientSecret: initialData.paypalClientSecret || "",
      paypalEnabled: initialData.paypalEnabled || false,
      paypalSandboxMode: initialData.paypalSandboxMode !== false, 

      stripePublishableKey: initialData.stripePublishableKey || "",
      stripeSecretKey: initialData.stripeSecretKey || "",
      stripeEnabled: initialData.stripeEnabled || false,
      stripeTestMode: initialData.stripeTestMode !== false, 
      stripeWebhookSecret: initialData.stripeWebhookSecret || "",

      cashOnDeliveryEnabled: initialData.cashOnDeliveryEnabled || false,
      cashOnDeliveryFee: initialData.cashOnDeliveryFee || 0,

      bankTransferEnabled: initialData.bankTransferEnabled || false,
      bankTransferDetails: initialData.bankTransferDetails || "",
    },
  })

  const stripeAccountForm = useForm<StripeAccountFormValues>({
    resolver: zodResolver(stripeAccountSchema),
    defaultValues: {
      name: "",
      publishableKey: "",
      secretKey: "",
      webhookSecret: "",
      isEnabled: false,
      isTestMode: true,
      isDefault: false,
    },
  })

  useEffect(() => {
    const fetchStripeAccounts = async () => {
      try {
        const response = await axios.get(`/api/stores/${params.storeId}/stripe-accounts`)
        setStripeAccounts(response.data)
      } catch (error) {
        toast.error("Failed to load Stripe accounts")
      }
    }

    fetchStripeAccounts()
  }, [params.storeId])

  const onSubmit = async (data: PaymentMethodsFormValues) => {
    try {
      setLoading(true)
      await axios.patch(`/api/stores/${params.storeId}/payment-settings`, data)
      router.refresh()
      toast.success("Payment settings updated.")
    } catch (error) {
      toast.error("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  const onCreateStripeAccount = async (data: StripeAccountFormValues) => {
    try {
      setLoading(true)
      await axios.post(`/api/stores/${params.storeId}/stripe-accounts`, data)
      toast.success("Stripe account created.")
      setIsCreating(false)
      stripeAccountForm.reset()
      const response = await axios.get(`/api/stores/${params.storeId}/stripe-accounts`)
      setStripeAccounts(response.data)
    } catch (error) {
      toast.error("Failed to create Stripe account.")
    } finally {
      setLoading(false)
    }
  }

  const onEditStripeAccount = async (data: StripeAccountFormValues) => {
    if (!isEditing) return

    try {
      setLoading(true)
      await axios.patch(`/api/stores/${params.storeId}/stripe-accounts/${isEditing}`, data)
      toast.success("Stripe account updated.")
      setIsEditing(null)
      stripeAccountForm.reset()
      const response = await axios.get(`/api/stores/${params.storeId}/stripe-accounts`)
      setStripeAccounts(response.data)
    } catch (error) {
      toast.error("Failed to update Stripe account.")
    } finally {
      setLoading(false)
    }
  }

  const onDeleteStripeAccount = async () => {
    if (!deleteAccountId) return

    try {
      setLoading(true)
      await axios.delete(`/api/stores/${params.storeId}/stripe-accounts/${deleteAccountId}`)
      toast.success("Stripe account deleted.")
      setDeleteAccountId(null)
      setOpen(false)
      const response = await axios.get(`/api/stores/${params.storeId}/stripe-accounts`)
      setStripeAccounts(response.data)
    } catch (error) {
      toast.error("Failed to delete Stripe account.")
    } finally {
      setLoading(false)
    }
  }

  const startEditing = (account: StripeAccount) => {
    setIsEditing(account.id)
    stripeAccountForm.reset({
      name: account.name,
      publishableKey: account.publishableKey,
      secretKey: account.secretKey,
      webhookSecret: account.webhookSecret || "",
      isEnabled: account.isEnabled,
      isTestMode: account.isTestMode,
      isDefault: account.isDefault,
    })
  }

  const cancelEditing = () => {
    setIsEditing(null)
    stripeAccountForm.reset()
  }

  const cancelCreating = () => {
    setIsCreating(false)
    stripeAccountForm.reset()
  }

  return (
    <>
      <AlertModal isOpen={open} onClose={() => setOpen(false)} onConfirm={onDeleteStripeAccount} loading={loading} />
      <div className="flex items-center justify-between">
        <Heading title="Payment Methods" description="Configure your store's payment methods" />
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-8">
          <Tabs defaultValue="stripe" className="w-full">
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="stripe">Stripe</TabsTrigger>
              <TabsTrigger value="paypal">PayPal</TabsTrigger>
              <TabsTrigger value="cash">Cash on Delivery</TabsTrigger>
              <TabsTrigger value="bank">Bank Transfer</TabsTrigger>
            </TabsList>

            <TabsContent value="stripe" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Stripe Accounts</span>
                    <Button
                      onClick={() => {
                        setIsCreating(true)
                        stripeAccountForm.reset()
                      }}
                      type="button"
                      size="sm"
                      disabled={isCreating || !!isEditing}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Account
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isCreating && (
                    <Card className="mb-6 border-dashed">
                      <CardHeader>
                        <CardTitle>New Stripe Account</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Form {...stripeAccountForm}>
                          <form onSubmit={stripeAccountForm.handleSubmit(onCreateStripeAccount)} className="space-y-4">
                            <FormField
                              control={stripeAccountForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Account Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="US Store" {...field} />
                                  </FormControl>
                                  <FormDescription>A name to identify this Stripe account</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={stripeAccountForm.control}
                              name="publishableKey"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Publishable Key</FormLabel>
                                  <FormControl>
                                    <Input placeholder="pk_..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={stripeAccountForm.control}
                              name="secretKey"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Secret Key</FormLabel>
                                  <FormControl>
                                    <Input type="password" placeholder="sk_..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={stripeAccountForm.control}
                              name="webhookSecret"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Webhook Secret</FormLabel>
                                  <FormControl>
                                    <Input type="password" placeholder="whsec_..." {...field} />
                                  </FormControl>
                                  <FormDescription>Used to verify webhook events from Stripe</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="flex flex-col gap-4">
                              <FormField
                                control={stripeAccountForm.control}
                                name="isEnabled"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                      <FormLabel>Enable Stripe</FormLabel>
                                      <FormDescription>Allow customers to pay with Stripe</FormDescription>
                                    </div>
                                    <FormControl>
                                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={stripeAccountForm.control}
                                name="isTestMode"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                      <FormLabel>Test Mode</FormLabel>
                                      <FormDescription>Use Stripe in test mode</FormDescription>
                                    </div>
                                    <FormControl>
                                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={stripeAccountForm.control}
                                name="isDefault"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                      <FormLabel>Default Account</FormLabel>
                                      <FormDescription>Use this as the default Stripe account</FormDescription>
                                    </div>
                                    <FormControl>
                                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                              <Button type="button" variant="outline" onClick={cancelCreating} disabled={loading}>
                                Cancel
                              </Button>
                              <Button type="submit" disabled={loading}>
                                {loading ? "Creating..." : "Create Account"}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>
                  )}

                  {isEditing && (
                    <Card className="mb-6 border-dashed">
                      <CardHeader>
                        <CardTitle>Edit Stripe Account</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Form {...stripeAccountForm}>
                          <form onSubmit={stripeAccountForm.handleSubmit(onEditStripeAccount)} className="space-y-4">
                            <FormField
                              control={stripeAccountForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Account Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="US Store" {...field} />
                                  </FormControl>
                                  <FormDescription>A name to identify this Stripe account</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={stripeAccountForm.control}
                              name="publishableKey"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Publishable Key</FormLabel>
                                  <FormControl>
                                    <Input placeholder="pk_..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={stripeAccountForm.control}
                              name="secretKey"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Secret Key</FormLabel>
                                  <FormControl>
                                    <Input type="password" placeholder="sk_..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={stripeAccountForm.control}
                              name="webhookSecret"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Webhook Secret</FormLabel>
                                  <FormControl>
                                    <Input type="password" placeholder="whsec_..." {...field} />
                                  </FormControl>
                                  <FormDescription>Used to verify webhook events from Stripe</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="flex flex-col gap-4">
                              <FormField
                                control={stripeAccountForm.control}
                                name="isEnabled"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                      <FormLabel>Enable Stripe</FormLabel>
                                      <FormDescription>Allow customers to pay with Stripe</FormDescription>
                                    </div>
                                    <FormControl>
                                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={stripeAccountForm.control}
                                name="isTestMode"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                      <FormLabel>Test Mode</FormLabel>
                                      <FormDescription>Use Stripe in test mode</FormDescription>
                                    </div>
                                    <FormControl>
                                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={stripeAccountForm.control}
                                name="isDefault"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                      <FormLabel>Default Account</FormLabel>
                                      <FormDescription>Use this as the default Stripe account</FormDescription>
                                    </div>
                                    <FormControl>
                                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                              <Button type="button" variant="outline" onClick={cancelEditing} disabled={loading}>
                                Cancel
                              </Button>
                              <Button type="submit" disabled={loading}>
                                {loading ? "Saving..." : "Save Changes"}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>
                  )}

                  {stripeAccounts.length === 0 && !isCreating ? (
                    <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
                      <h3 className="font-medium">No Stripe accounts configured</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        Add a Stripe account to accept payments through Stripe
                      </p>
                      <Button onClick={() => setIsCreating(true)} className="mt-4" type="button">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Stripe Account
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {stripeAccounts.map((account) => (
                        <Card key={account.id} className={account.isDefault ? "border-primary" : ""}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium">{account.name}</h3>
                                  {account.isDefault && (
                                    <Badge variant="outline" className="bg-primary/10 text-primary">
                                      Default
                                    </Badge>
                                  )}
                                  {account.isEnabled ? (
                                    <Badge variant="outline" className="bg-green-50 text-green-700">
                                      Enabled
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-gray-50 text-gray-700">
                                      Disabled
                                    </Badge>
                                  )}
                                  {account.isTestMode && (
                                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                                      Test Mode
                                    </Badge>
                                  )}
                                </div>
                                <div className="mt-2 text-sm text-muted-foreground">
                                  <p>Publishable Key: {account.publishableKey.substring(0, 10)}...</p>
                                  <p>Secret Key: {account.secretKey.substring(0, 5)}...</p>
                                  {account.webhookSecret && (
                                    <p>Webhook Secret: {account.webhookSecret.substring(0, 5)}...</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => startEditing(account)}
                                  variant="outline"
                                  size="sm"
                                  type="button"
                                  disabled={isCreating || !!isEditing}
                                >
                                  Edit
                                </Button>
                                <Button
                                  onClick={() => {
                                    setDeleteAccountId(account.id)
                                    setOpen(true)
                                  }}
                                  variant="destructive"
                                  size="sm"
                                  type="button"
                                  disabled={isCreating || !!isEditing}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Legacy Stripe settings - kept for backward compatibility */}
                  {stripeAccounts.length === 0 && (
                    <div className="mt-6 border-t pt-6">
                      <h3 className="font-medium mb-4">Legacy Stripe Settings</h3>
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="stripePublishableKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Publishable Key</FormLabel>
                              <FormControl>
                                <Input placeholder="pk_..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="stripeSecretKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Secret Key</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="sk_..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="stripeWebhookSecret"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Webhook Secret</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="whsec_..." {...field} />
                              </FormControl>
                              <FormDescription>Used to verify webhook events from Stripe</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex flex-col gap-4">
                          <FormField
                            control={form.control}
                            name="stripeEnabled"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                  <FormLabel>Enable Stripe</FormLabel>
                                  <FormDescription>Allow customers to pay with Stripe</FormDescription>
                                </div>
                                <FormControl>
                                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="stripeTestMode"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                  <FormLabel>Test Mode</FormLabel>
                                  <FormDescription>Use Stripe in test mode</FormDescription>
                                </div>
                                <FormControl>
                                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="paypal" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <PaypalSettings form={form} loading={loading} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cash" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <CashOnDeliverySettings form={form} loading={loading} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bank" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <BankTransferSettings form={form} loading={loading} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Button disabled={loading} className="ml-auto" type="submit">
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Form>
    </>
  )
}

