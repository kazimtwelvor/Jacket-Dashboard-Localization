

// "use client"

// import { useState, useEffect } from "react"
// import type React from "react"
// import type { UseFormReturn } from "react-hook-form"
// import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form"
// import { Input } from "@/components/ui/input"
// import { Switch } from "@/components/ui/switch"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { InfoIcon, PlusCircle, Trash2, Edit2 } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { ScrollArea } from "@/components/ui/scroll-area"

// // Update the StripeAccount interface to include webhookSecret
// interface StripeAccount {
//   id: string
//   name: string
//   publishableKey: string
//   secretKey: string
//   isActive: boolean
//   webhookSecret?: string
// }

// interface StripeSettingsProps {
//   form: UseFormReturn<any>
//   loading: boolean
// }

// export const StripeSettings: React.FC<StripeSettingsProps> = ({ form, loading }) => {
//   // Update the state variables to include webhookSecret and editing state
//   const [newAccount, setNewAccount] = useState(false)
//   const [editingAccountId, setEditingAccountId] = useState<string | null>(null)
//   const [accountName, setAccountName] = useState("")
//   const [publishableKey, setPublishableKey] = useState("")
//   const [secretKey, setSecretKey] = useState("")
//   const [webhookSecret, setWebhookSecret] = useState("")

//   // Get stripe accounts from form or initialize empty array
//   const stripeAccounts = form.watch("stripeAccounts") || []

//   // Debug log to see what accounts are available
//   useEffect(() => {
//     console.log("Current stripe accounts:", stripeAccounts)
//   }, [stripeAccounts])

//   // Reset form fields
//   const resetFormFields = () => {
//     setAccountName("")
//     setPublishableKey("")
//     setSecretKey("")
//     setWebhookSecret("")
//     setNewAccount(false)
//     setEditingAccountId(null)
//   }

//   // Handle starting the edit process for an account
//   const handleEditAccount = (account: StripeAccount) => {
//     setEditingAccountId(account.id)
//     setAccountName(account.name)
//     setPublishableKey(account.publishableKey)
//     setSecretKey(account.secretKey)
//     setWebhookSecret(account.webhookSecret || "")
//     setNewAccount(false)
//   }

//   // Update the handleAddAccount function to make an API call to save the account
//   const handleAddAccount = async () => {
//     if (!accountName || !publishableKey || !secretKey) return

//     try {
//       // First create the account in the database
//       const response = await fetch(`/api/stores/${form.getValues("storeId")}/stripe-accounts`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           name: accountName,
//           publishableKey,
//           secretKey,
//           webhookSecret: webhookSecret || "",
//           isEnabled: true,
//           isTestMode: form.getValues("stripeTestMode") || false,
//           isDefault: stripeAccounts.length === 0, // Make default if it's the first account
//         }),
//       })

//       if (!response.ok) {
//         throw new Error("Failed to create Stripe account")
//       }

//       const savedAccount = await response.json()
//       console.log("Saved account:", savedAccount)

//       // Update the form with the new account from the database
//       const newAccounts = [...stripeAccounts, savedAccount]

//       form.setValue("stripeAccounts", newAccounts)
//       form.setValue("stripeEnabled", true)

//       // If this is the first account, also set the main stripe keys for backward compatibility
//       if (stripeAccounts.length === 0) {
//         form.setValue("stripePublishableKey", publishableKey)
//         form.setValue("stripeSecretKey", secretKey)
//         form.setValue("stripeWebhookSecret", webhookSecret || "")
//       }

//       // Reset form
//       resetFormFields()
//     } catch (error) {
//       console.error("Error saving Stripe account:", error)
//       alert("Failed to save Stripe account. Please try again.")
//     }
//   }

//   // Update the handleSaveEdit function to make an API call to update the account
//   const handleSaveEdit = async () => {
//     if (!accountName || !publishableKey || !secretKey || !editingAccountId) return

//     try {
//       // First update the account in the database
//       const response = await fetch(`/api/stores/${form.getValues("storeId")}/stripe-accounts/${editingAccountId}`, {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           name: accountName,
//           publishableKey,
//           secretKey,
//           webhookSecret: webhookSecret || "",
//           isEnabled: true,
//           isTestMode: form.getValues("stripeTestMode") || false,
//           isDefault: stripeAccounts.find((acc) => acc.id === editingAccountId)?.isActive || false,
//         }),
//       })

//       if (!response.ok) {
//         throw new Error("Failed to update Stripe account")
//       }

//       const updatedAccount = await response.json()
//       console.log("Updated account:", updatedAccount)

//       // Update the form with the updated account
//       const updatedAccounts = stripeAccounts.map((account) => {
//         if (account.id === editingAccountId) {
//           const updatedAccount = {
//             ...account,
//             name: accountName,
//             publishableKey,
//             secretKey,
//             webhookSecret,
//           }

//           // If this is the active account, update the main stripe keys
//           if (account.isActive) {
//             form.setValue("stripePublishableKey", publishableKey)
//             form.setValue("stripeSecretKey", secretKey)
//             form.setValue("stripeWebhookSecret", webhookSecret || "")
//           }

//           return updatedAccount
//         }
//         return account
//       })

//       form.setValue("stripeAccounts", updatedAccounts)
//       form.trigger("stripeAccounts")
//       resetFormFields()
//     } catch (error) {
//       console.error("Error updating Stripe account:", error)
//       alert("Failed to update Stripe account. Please try again.")
//     }
//   }

//   // Update the handleToggleActive function to make an API call to update the active status
//   const handleToggleActive = async (id: string) => {
//     try {
//       // First update the account in the database to set it as default
//       const response = await fetch(`/api/stores/${form.getValues("storeId")}/stripe-accounts/${id}`, {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           name: stripeAccounts.find((acc) => acc.id === id)?.name || "",
//           publishableKey: stripeAccounts.find((acc) => acc.id === id)?.publishableKey || "",
//           secretKey: stripeAccounts.find((acc) => acc.id === id)?.secretKey || "",
//           webhookSecret: stripeAccounts.find((acc) => acc.id === id)?.webhookSecret || "",
//           isEnabled: true,
//           isTestMode: form.getValues("stripeTestMode") || false,
//           isDefault: true,
//         }),
//       })

//       if (!response.ok) {
//         throw new Error("Failed to update Stripe account")
//       }

//       // Update the form state
//       const updatedAccounts = stripeAccounts.map((account) => ({
//         ...account,
//         isActive: account.id === id,
//       }))

//       form.setValue("stripeAccounts", updatedAccounts)
//       form.trigger("stripeAccounts")

//       // Also update the main stripe keys for backward compatibility
//       const activeAccount = updatedAccounts.find((account) => account.isActive)
//       if (activeAccount) {
//         form.setValue("stripePublishableKey", activeAccount.publishableKey)
//         form.setValue("stripeSecretKey", activeAccount.secretKey)
//         form.setValue("stripeWebhookSecret", activeAccount.webhookSecret || "")
//       }
//     } catch (error) {
//       console.error("Error updating Stripe account:", error)
//       alert("Failed to set account as active. Please try again.")
//     }
//   }

//   // Update the handleRemoveAccount function to make an API call to delete the account
//   const handleRemoveAccount = async (id: string) => {
//     try {
//       // First delete the account from the database
//       const response = await fetch(`/api/stores/${form.getValues("storeId")}/stripe-accounts/${id}`, {
//         method: "DELETE",
//       })

//       if (!response.ok) {
//         throw new Error("Failed to delete Stripe account")
//       }

//       // Update the form state
//       const filteredAccounts = stripeAccounts.filter((account) => account.id !== id)

//       // If we removed the active account, make the first remaining one active
//       if (filteredAccounts.length > 0 && !filteredAccounts.some((account) => account.isActive)) {
//         filteredAccounts[0].isActive = true

//         // Also update this account in the database to set it as default
//         await fetch(`/api/stores/${form.getValues("storeId")}/stripe-accounts/${filteredAccounts[0].id}`, {
//           method: "PATCH",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             name: filteredAccounts[0].name,
//             publishableKey: filteredAccounts[0].publishableKey,
//             secretKey: filteredAccounts[0].secretKey,
//             webhookSecret: filteredAccounts[0].webhookSecret || "",
//             isEnabled: true,
//             isTestMode: form.getValues("stripeTestMode") || false,
//             isDefault: true,
//           }),
//         })
//       }

//       form.setValue("stripeAccounts", filteredAccounts)

//       // Update main stripe keys
//       const activeAccount = filteredAccounts.find((account) => account.isActive)
//       if (activeAccount) {
//         form.setValue("stripePublishableKey", activeAccount.publishableKey)
//         form.setValue("stripeSecretKey", activeAccount.secretKey)
//         form.setValue("stripeWebhookSecret", activeAccount.webhookSecret || "")
//       } else {
//         form.setValue("stripePublishableKey", "")
//         form.setValue("stripeSecretKey", "")
//         form.setValue("stripeWebhookSecret", "")
//         form.setValue("stripeEnabled", false)
//       }
//     } catch (error) {
//       console.error("Error deleting Stripe account:", error)
//       alert("Failed to delete Stripe account. Please try again.")
//     }
//   }

//   // Add a useEffect to load Stripe accounts when the component mounts
//   useEffect(() => {
//     const loadStripeAccounts = async () => {
//       try {
//         const storeId = form.getValues("storeId")
//         if (!storeId) return

//         console.log("Loading Stripe accounts for store:", storeId)
//         const response = await fetch(`/api/stores/${storeId}/stripe-accounts`)
//         if (!response.ok) {
//           throw new Error("Failed to load Stripe accounts")
//         }

//         const accounts = await response.json()
//         console.log("Loaded Stripe accounts:", accounts)

//         if (accounts && accounts.length > 0) {
//           // Map isDefault to isActive for UI consistency
//           const accountsWithActive = accounts.map((account: any) => ({
//             ...account,
//             isActive: account.isDefault,
//           }))

//           console.log("Setting accounts in form:", accountsWithActive)
//           form.setValue("stripeAccounts", accountsWithActive)

//           // Set the main stripe keys from the default account for backward compatibility
//           const defaultAccount = accountsWithActive.find((account: any) => account.isActive)
//           if (defaultAccount) {
//             form.setValue("stripePublishableKey", defaultAccount.publishableKey)
//             form.setValue("stripeSecretKey", defaultAccount.secretKey)
//             form.setValue("stripeWebhookSecret", defaultAccount.webhookSecret || "")
//           }
//         }
//       } catch (error) {
//         console.error("Error loading Stripe accounts:", error)
//       }
//     }

//     loadStripeAccounts()
//   }, [form])

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col gap-4">
//         <h3 className="text-lg font-medium">Stripe Integration</h3>
//         <p className="text-sm text-muted-foreground">
//           Configure Stripe to accept payments through credit cards and other payment methods.
//         </p>

//         <Alert variant="outline" className="bg-blue-50 border-blue-200">
//           <InfoIcon className="h-4 w-4 text-blue-500 mr-2" />
//           <AlertDescription className="text-blue-700">
//             You can find your Stripe API keys in your Stripe Dashboard under Developers &gt; API keys.
//           </AlertDescription>
//         </Alert>
//       </div>

//       <FormField
//         control={form.control}
//         name="stripeEnabled"
//         render={({ field }) => (
//           <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
//             <div className="space-y-0.5">
//               <FormLabel className="text-base">Enable Stripe</FormLabel>
//               <FormDescription>Allow customers to pay with credit cards via Stripe at checkout</FormDescription>
//             </div>
//             <FormControl>
//               <Switch
//                 checked={field.value}
//                 onCheckedChange={field.onChange}
//                 disabled={loading || stripeAccounts.length === 0}
//               />
//             </FormControl>
//           </FormItem>
//         )}
//       />

//       <FormField
//         control={form.control}
//         name="stripeTestMode"
//         render={({ field }) => (
//           <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
//             <div className="space-y-0.5">
//               <FormLabel className="text-base">Test Mode</FormLabel>
//               <FormDescription>Use Stripe test mode for development. Turn off for live payments.</FormDescription>
//             </div>
//             <FormControl>
//               <Switch checked={field.value} onCheckedChange={field.onChange} disabled={loading} />
//             </FormControl>
//           </FormItem>
//         )}
//       />

//       {/* Stripe Accounts List */}
//       <div className="space-y-4">
//         <div className="flex justify-between items-center">
//           <h4 className="text-md font-medium">Stripe Accounts</h4>
//           <Button
//             type="button"
//             variant="outline"
//             size="sm"
//             onClick={() => {
//               resetFormFields()
//               setNewAccount(true)
//             }}
//             disabled={loading || newAccount || editingAccountId !== null}
//           >
//             <PlusCircle className="h-4 w-4 mr-2" />
//             Add Account
//           </Button>
//         </div>

//         {stripeAccounts.length === 0 && !newAccount && (
//           <div className="text-sm text-muted-foreground p-4 border rounded-md text-center">
//             No Stripe accounts configured. Add an account to enable Stripe payments.
//           </div>
//         )}

//         <ScrollArea className="h-[300px]">
//           <div className="space-y-3">
//             {/* Add webhookSecret to the account card display */}
//             {Array.isArray(stripeAccounts) &&
//               stripeAccounts.map((account: StripeAccount) => (
//                 <Card key={account.id} className={`border ${account.isActive ? "border-primary" : ""}`}>
//                   <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
//                     <CardTitle className="text-base flex items-center">
//                       {account.name}
//                       {account.isActive && <Badge className="ml-2 bg-primary">Active</Badge>}
//                     </CardTitle>
//                     <div className="flex space-x-2">
//                       <Button
//                         type="button"
//                         variant="outline"
//                         size="sm"
//                         onClick={() => handleToggleActive(account.id)}
//                         disabled={loading || account.isActive || editingAccountId !== null}
//                       >
//                         {account.isActive ? "Active" : "Set Active"}
//                       </Button>
//                       <Button
//                         type="button"
//                         variant="outline"
//                         size="sm"
//                         onClick={() => handleEditAccount(account)}
//                         disabled={loading || editingAccountId !== null}
//                       >
//                         <Edit2 className="h-4 w-4" />
//                       </Button>
//                       <Button
//                         type="button"
//                         variant="destructive"
//                         size="sm"
//                         onClick={() => handleRemoveAccount(account.id)}
//                         disabled={loading || editingAccountId !== null}
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </CardHeader>
//                   <CardContent className="p-4 pt-2">
//                     <div className="text-sm">
//                       <div className="flex justify-between">
//                         <span className="text-muted-foreground">Publishable Key:</span>
//                         <span className="font-mono">{account.publishableKey.substring(0, 10)}...</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-muted-foreground">Secret Key:</span>
//                         <span className="font-mono">••••••••••••••••</span>
//                       </div>
//                       {account.webhookSecret && (
//                         <div className="flex justify-between">
//                           <span className="text-muted-foreground">Webhook Secret:</span>
//                           <span className="font-mono">••••••••••••••••</span>
//                         </div>
//                       )}
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}

//             {/* New Account Form */}
//             {newAccount && (
//               <Card>
//                 <CardHeader className="p-4 pb-2">
//                   <CardTitle className="text-base">New Stripe Account</CardTitle>
//                 </CardHeader>
//                 <CardContent className="p-4 pt-2 space-y-3">
//                   <div>
//                     <FormLabel>Account Name</FormLabel>
//                     <Input
//                       placeholder="e.g., Production Stripe"
//                       value={accountName}
//                       onChange={(e) => setAccountName(e.target.value)}
//                     />
//                   </div>
//                   <div>
//                     <FormLabel>Publishable Key</FormLabel>
//                     <Input
//                       placeholder="pk_..."
//                       value={publishableKey}
//                       onChange={(e) => setPublishableKey(e.target.value)}
//                     />
//                   </div>
//                   <div>
//                     <FormLabel>Secret Key</FormLabel>
//                     <Input
//                       placeholder="sk_..."
//                       type="password"
//                       value={secretKey}
//                       onChange={(e) => setSecretKey(e.target.value)}
//                     />
//                   </div>
//                   <div>
//                     <FormLabel>Webhook Secret (Optional)</FormLabel>
//                     <Input
//                       placeholder="whsec_..."
//                       type="password"
//                       value={webhookSecret}
//                       onChange={(e) => setWebhookSecret(e.target.value)}
//                     />
//                     <FormDescription className="text-xs mt-1">Used for verifying Stripe webhook events</FormDescription>
//                   </div>
//                   <div className="flex justify-end space-x-2 pt-2">
//                     <Button type="button" variant="outline" onClick={resetFormFields}>
//                       Cancel
//                     </Button>
//                     <Button
//                       type="button"
//                       onClick={handleAddAccount}
//                       disabled={!accountName || !publishableKey || !secretKey}
//                     >
//                       Add Account
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             )}

//             {/* Edit Account Form */}
//             {editingAccountId !== null && (
//               <Card className="border border-amber-300">
//                 <CardHeader className="p-4 pb-2">
//                   <CardTitle className="text-base">Edit Stripe Account</CardTitle>
//                 </CardHeader>
//                 <CardContent className="p-4 pt-2 space-y-3">
//                   <div>
//                     <FormLabel>Account Name</FormLabel>
//                     <Input
//                       placeholder="e.g., Production Stripe"
//                       value={accountName}
//                       onChange={(e) => setAccountName(e.target.value)}
//                     />
//                   </div>
//                   <div>
//                     <FormLabel>Publishable Key</FormLabel>
//                     <Input
//                       placeholder="pk_..."
//                       value={publishableKey}
//                       onChange={(e) => setPublishableKey(e.target.value)}
//                     />
//                   </div>
//                   <div>
//                     <FormLabel>Secret Key</FormLabel>
//                     <Input
//                       placeholder="sk_..."
//                       type="password"
//                       value={secretKey}
//                       onChange={(e) => setSecretKey(e.target.value)}
//                     />
//                     <FormDescription className="text-xs mt-1">
//                       Leave unchanged if you don't want to update the secret key
//                     </FormDescription>
//                   </div>
//                   <div>
//                     <FormLabel>Webhook Secret (Optional)</FormLabel>
//                     <Input
//                       placeholder="whsec_..."
//                       type="password"
//                       value={webhookSecret}
//                       onChange={(e) => setWebhookSecret(e.target.value)}
//                     />
//                     <FormDescription className="text-xs mt-1">Used for verifying Stripe webhook events</FormDescription>
//                   </div>
//                   <div className="flex justify-end space-x-2 pt-2">
//                     <Button type="button" variant="outline" onClick={resetFormFields}>
//                       Cancel
//                     </Button>
//                     <Button
//                       type="button"
//                       onClick={handleSaveEdit}
//                       disabled={!accountName || !publishableKey || !secretKey}
//                     >
//                       Save Changes
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             )}
//           </div>
//         </ScrollArea>
//       </div>
//     </div>
//   )
// }
"use client"

import { useState, useEffect } from "react"
import type React from "react"
import type { UseFormReturn } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon, PlusCircle, Trash2, Edit2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

// Update the StripeAccount interface to match exactly what comes from the API
interface StripeAccount {
  id: string
  name: string
  publishableKey: string
  secretKey: string
  webhookSecret?: string
  isEnabled?: boolean
  isTestMode?: boolean
  isDefault?: boolean
  storeId?: string
  createdAt?: Date
  updatedAt?: Date
}

interface StripeSettingsProps {
  form: UseFormReturn<any>
  loading: boolean
}

export const StripeSettings: React.FC<StripeSettingsProps> = ({ form, loading }) => {
  // Update the state variables to include webhookSecret and editing state
  const [newAccount, setNewAccount] = useState(false)
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null)
  const [accountName, setAccountName] = useState("")
  const [publishableKey, setPublishableKey] = useState("")
  const [secretKey, setSecretKey] = useState("")
  const [webhookSecret, setWebhookSecret] = useState("")
  const [accounts, setAccounts] = useState<StripeAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugMode, setDebugMode] = useState(false)

  // Reset form fields
  const resetFormFields = () => {
    setAccountName("")
    setPublishableKey("")
    setSecretKey("")
    setWebhookSecret("")
    setNewAccount(false)
    setEditingAccountId(null)
  }

  // Handle starting the edit process for an account
  const handleEditAccount = (account: StripeAccount) => {
    setEditingAccountId(account.id)
    setAccountName(account.name)
    setPublishableKey(account.publishableKey)
    setSecretKey(account.secretKey)
    setWebhookSecret(account.webhookSecret || "")
    setNewAccount(false)
  }

  // Handle adding a new account
  const handleAddAccount = async () => {
    if (!accountName || !publishableKey || !secretKey) return

    try {
      setIsLoading(true)
      setError(null)

      // First create the account in the database
      const response = await fetch(`/api/stores/${form.getValues("storeId")}/stripe-accounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: accountName,
          publishableKey,
          secretKey,
          webhookSecret: webhookSecret || "",
          isEnabled: true,
          isTestMode: form.getValues("stripeTestMode") || false,
          isDefault: accounts.length === 0, // Make default if it's the first account
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create Stripe account")
      }

      const savedAccount = await response.json()
      console.log("Saved account:", savedAccount)

      // Update our local accounts state
      const newAccounts = [...accounts, savedAccount]
      setAccounts(newAccounts)

      // If this is the first account, also set the main stripe keys for backward compatibility
      if (accounts.length === 0) {
        form.setValue("stripePublishableKey", publishableKey)
        form.setValue("stripeSecretKey", secretKey)
        form.setValue("stripeWebhookSecret", webhookSecret || "")
      }

      form.setValue("stripeEnabled", true)

      // Reset form
      resetFormFields()
    } catch (error) {
      console.error("Error saving Stripe account:", error)
      setError("Failed to save Stripe account. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle editing an account
  const handleSaveEdit = async () => {
    if (!accountName || !publishableKey || !secretKey || !editingAccountId) return

    try {
      setIsLoading(true)
      setError(null)

      // First update the account in the database
      const response = await fetch(`/api/stores/${form.getValues("storeId")}/stripe-accounts/${editingAccountId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: accountName,
          publishableKey,
          secretKey,
          webhookSecret: webhookSecret || "",
          isEnabled: true,
          isTestMode: form.getValues("stripeTestMode") || false,
          isDefault: accounts.find((acc) => acc.id === editingAccountId)?.isDefault || false,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update Stripe account")
      }

      const updatedAccount = await response.json()
      console.log("Updated account:", updatedAccount)

      // Update our local accounts state
      const updatedAccounts = accounts.map((account) => {
        if (account.id === editingAccountId) {
          return {
            ...account,
            name: accountName,
            publishableKey,
            secretKey,
            webhookSecret,
          }
        }
        return account
      })

      setAccounts(updatedAccounts)

      // If this is the active account, update the main stripe keys
      const editedAccount = accounts.find((acc) => acc.id === editingAccountId)
      if (editedAccount?.isDefault) {
        form.setValue("stripePublishableKey", publishableKey)
        form.setValue("stripeSecretKey", secretKey)
        form.setValue("stripeWebhookSecret", webhookSecret || "")
      }

      resetFormFields()
    } catch (error) {
      console.error("Error updating Stripe account:", error)
      setError("Failed to update Stripe account. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle setting an account as active/default
  const handleToggleActive = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)

      // First update the account in the database to set it as default
      const response = await fetch(`/api/stores/${form.getValues("storeId")}/stripe-accounts/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: accounts.find((acc) => acc.id === id)?.name || "",
          publishableKey: accounts.find((acc) => acc.id === id)?.publishableKey || "",
          secretKey: accounts.find((acc) => acc.id === id)?.secretKey || "",
          webhookSecret: accounts.find((acc) => acc.id === id)?.webhookSecret || "",
          isEnabled: true,
          isTestMode: form.getValues("stripeTestMode") || false,
          isDefault: true,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update Stripe account")
      }

      // Update our local accounts state
      const updatedAccounts = accounts.map((account) => ({
        ...account,
        isDefault: account.id === id,
      }))

      setAccounts(updatedAccounts)

      // Also update the main stripe keys for backward compatibility
      const activeAccount = updatedAccounts.find((account) => account.isDefault)
      if (activeAccount) {
        form.setValue("stripePublishableKey", activeAccount.publishableKey)
        form.setValue("stripeSecretKey", activeAccount.secretKey)
        form.setValue("stripeWebhookSecret", activeAccount.webhookSecret || "")
      }
    } catch (error) {
      console.error("Error updating Stripe account:", error)
      setError("Failed to set account as active. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle removing an account
  const handleRemoveAccount = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)

      // First delete the account from the database
      const response = await fetch(`/api/stores/${form.getValues("storeId")}/stripe-accounts/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete Stripe account")
      }

      // Update our local accounts state
      const filteredAccounts = accounts.filter((account) => account.id !== id)

      // If we removed the default account, make the first remaining one default
      if (filteredAccounts.length > 0 && !filteredAccounts.some((account) => account.isDefault)) {
        filteredAccounts[0].isDefault = true

        // Also update this account in the database to set it as default
        await fetch(`/api/stores/${form.getValues("storeId")}/stripe-accounts/${filteredAccounts[0].id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: filteredAccounts[0].name,
            publishableKey: filteredAccounts[0].publishableKey,
            secretKey: filteredAccounts[0].secretKey,
            webhookSecret: filteredAccounts[0].webhookSecret || "",
            isEnabled: true,
            isTestMode: form.getValues("stripeTestMode") || false,
            isDefault: true,
          }),
        })
      }

      setAccounts(filteredAccounts)

      // Update main stripe keys
      const defaultAccount = filteredAccounts.find((account) => account.isDefault)
      if (defaultAccount) {
        form.setValue("stripePublishableKey", defaultAccount.publishableKey)
        form.setValue("stripeSecretKey", defaultAccount.secretKey)
        form.setValue("stripeWebhookSecret", defaultAccount.webhookSecret || "")
      } else {
        form.setValue("stripePublishableKey", "")
        form.setValue("stripeSecretKey", "")
        form.setValue("stripeWebhookSecret", "")
        form.setValue("stripeEnabled", false)
      }
    } catch (error) {
      console.error("Error deleting Stripe account:", error)
      setError("Failed to delete Stripe account. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Load accounts from the API
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const storeId = form.getValues("storeId")
        if (!storeId) {
          setError("No store ID available")
          return
        }

        // Direct HTTP request to get payment settings
        const response = await fetch(`/api/stores/${storeId}/payment-settings`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to load payment settings: ${response.status}`)
        }

        const settings = await response.json()
        console.log("Loaded payment settings:", settings)

        // Check if accounts array exists and has items
        let currentAccounts: StripeAccount[] = []

        if (settings?.stripeAccounts && Array.isArray(settings.stripeAccounts) && settings.stripeAccounts.length > 0) {
          console.log("Found accounts in settings:", settings.stripeAccounts.length)
          currentAccounts = settings.stripeAccounts

          // For debugging: log each account ID
          settings.stripeAccounts.forEach((account: any, index: number) => {
            console.log(`Account ${index}: ${account.id} - ${account.name}`)
          })
        }
        // Fallback to creating a default account from the main settings if needed
        else if (settings?.stripePublishableKey && settings?.stripeSecretKey) {
          console.log("No accounts found, creating default from main settings")
          currentAccounts = [
            {
              id: `default-${Date.now()}`,
              name: "Default Account",
              publishableKey: settings.stripePublishableKey,
              secretKey: settings.stripeSecretKey,
              webhookSecret: settings.stripeWebhookSecret || "",
              isDefault: true,
              isEnabled: settings.stripeEnabled || false,
              isTestMode: settings.stripeTestMode || true,
              storeId: storeId,
            },
          ]
        }

        console.log("Setting accounts state:", currentAccounts)
        setAccounts(currentAccounts)
      } catch (error) {
        console.error("Error loading accounts:", error)
        setError(`Failed to load accounts: ${(error as Error).message}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadAccounts()
  }, [form])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-medium">Stripe Integration</h3>
        <p className="text-sm text-muted-foreground">
          Configure Stripe to accept payments through credit cards and other payment methods.
        </p>

        <Alert variant="default" className="bg-blue-50 border-blue-200">
          <InfoIcon className="h-4 w-4 text-blue-500 mr-2" />
          <AlertDescription className="text-blue-700">
            You can find your Stripe API keys in your Stripe Dashboard under Developers &gt; API keys.
          </AlertDescription>
        </Alert>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Debug Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-fit self-end"
          onClick={() => {
            setDebugMode(!debugMode)
            console.log("Accounts state:", accounts)
          }}
        >
          {debugMode ? "Hide Debug" : "Show Debug"}
        </Button>
      </div>

      {debugMode && (
        <div className="bg-muted p-4 rounded-md overflow-auto max-h-[300px]">
          <h4 className="font-mono mb-2 text-sm">Debug Info</h4>
          <pre className="text-xs">{JSON.stringify(accounts, null, 2)}</pre>
        </div>
      )}

      <FormField
        control={form.control}
        name="stripeEnabled"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Enable Stripe</FormLabel>
              <FormDescription>Allow customers to pay with credit cards via Stripe at checkout</FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={loading || accounts.length === 0}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="stripeTestMode"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Test Mode</FormLabel>
              <FormDescription>Use Stripe test mode for development. Turn off for live payments.</FormDescription>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} disabled={loading} />
            </FormControl>
          </FormItem>
        )}
      />

      {/* Stripe Accounts List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-md font-medium">Stripe Accounts ({accounts.length})</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              resetFormFields()
              setNewAccount(true)
            }}
            disabled={loading || isLoading || newAccount || editingAccountId !== null}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            <span>Loading Stripe accounts...</span>
          </div>
        )}

        {!isLoading && accounts.length === 0 && !newAccount && (
          <div className="text-sm text-muted-foreground p-4 border rounded-md text-center">
            No Stripe accounts configured. Add an account to enable Stripe payments.
          </div>
        )}

        {/* Display Stripe Accounts */}
        {!isLoading && accounts.length > 0 && (
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {accounts.map((account) => (
                <Card key={account.id} className={`border ${account.isDefault ? "border-primary" : ""}`}>
                  <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-base flex items-center">
                      {account.name}
                      {account.isDefault && <Badge className="ml-2 bg-primary">Active</Badge>}
                    </CardTitle>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(account.id)}
                        disabled={loading || isLoading || account.isDefault || editingAccountId !== null}
                      >
                        {account.isDefault ? "Active" : "Set Active"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditAccount(account)}
                        disabled={loading || isLoading || editingAccountId !== null}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveAccount(account.id)}
                        disabled={loading || isLoading || editingAccountId !== null}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Publishable Key:</span>
                        <span className="font-mono">{account.publishableKey.substring(0, 10)}...</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Secret Key:</span>
                        <span className="font-mono">••••••••••••••••</span>
                      </div>
                      {account.webhookSecret && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Webhook Secret:</span>
                          <span className="font-mono">••••••••••••••••</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* New Account Form */}
        {newAccount && (
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">New Stripe Account</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
              <div>
                <FormLabel>Account Name</FormLabel>
                <Input
                  placeholder="e.g., Production Stripe"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                />
              </div>
              <div>
                <FormLabel>Publishable Key</FormLabel>
                <Input
                  placeholder="pk_..."
                  value={publishableKey}
                  onChange={(e) => setPublishableKey(e.target.value)}
                />
              </div>
              <div>
                <FormLabel>Secret Key</FormLabel>
                <Input
                  placeholder="sk_..."
                  type="password"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                />
              </div>
              <div>
                <FormLabel>Webhook Secret (Optional)</FormLabel>
                <Input
                  placeholder="whsec_..."
                  type="password"
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                />
                <FormDescription className="text-xs mt-1">Used for verifying Stripe webhook events</FormDescription>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={resetFormFields} disabled={isLoading}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleAddAccount}
                  disabled={isLoading || !accountName || !publishableKey || !secretKey}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Account"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Account Form */}
        {editingAccountId !== null && (
          <Card className="border border-amber-300">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">Edit Stripe Account</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
              <div>
                <FormLabel>Account Name</FormLabel>
                <Input
                  placeholder="e.g., Production Stripe"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                />
              </div>
              <div>
                <FormLabel>Publishable Key</FormLabel>
                <Input
                  placeholder="pk_..."
                  value={publishableKey}
                  onChange={(e) => setPublishableKey(e.target.value)}
                />
              </div>
              <div>
                <FormLabel>Secret Key</FormLabel>
                <Input
                  placeholder="sk_..."
                  type="password"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                />
                <FormDescription className="text-xs mt-1">
                  Leave unchanged if you don't want to update the secret key
                </FormDescription>
              </div>
              <div>
                <FormLabel>Webhook Secret (Optional)</FormLabel>
                <Input
                  placeholder="whsec_..."
                  type="password"
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                />
                <FormDescription className="text-xs mt-1">Used for verifying Stripe webhook events</FormDescription>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={resetFormFields} disabled={isLoading}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={isLoading || !accountName || !publishableKey || !secretKey}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
