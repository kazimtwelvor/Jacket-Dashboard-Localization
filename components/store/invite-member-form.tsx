"use client"

import * as z from "zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "react-hot-toast"
import axios from "axios"
import { useParams, useRouter } from "next/navigation"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  role: z.enum(["ADMIN", "MANAGER", "EDITOR", "SUPPORT", "VIEWER"]),
  permissions: z.array(z.string()).optional(),
})

const roleOptions = [
  { value: "ADMIN", label: "Admin" },
  { value: "MANAGER", label: "Manager" },
  { value: "EDITOR", label: "Editor" },
  { value: "SUPPORT", label: "Support" },
  { value: "VIEWER", label: "Viewer" },
]

const permissionOptions = [
  { value: "MANAGE_PRODUCTS", label: "Manage Products" },
  { value: "MANAGE_ORDERS", label: "Manage Orders" },
  { value: "MANAGE_CUSTOMERS", label: "Manage Customers" },
  { value: "MANAGE_STAFF", label: "Manage Staff" },
  { value: "MANAGE_SETTINGS", label: "Manage Settings" },
  { value: "MANAGE_MARKETING", label: "Manage Marketing" },
  { value: "VIEW_ANALYTICS", label: "View Analytics" },
  { value: "PROCESS_REFUNDS", label: "Process Refunds" },
  { value: "MANAGE_REVIEWS", label: "Manage Reviews" },
]

export const InviteMemberForm = () => {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      role: "VIEWER",
      permissions: [],
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)

      await axios.post("/api/invitations", {
        storeId: params.storeId,
        email: values.email,
        role: values.role,
        permissions: values.permissions,
      })

      router.refresh()
      toast.success("Invitation sent successfully")
      form.reset()
    } catch (error: any) {
      toast.error(error.response?.data || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter email address" disabled={loading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select disabled={loading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Permissions</FormLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {permissionOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={option.value}
                  disabled={loading}
                  checked={form.watch("permissions")?.includes(option.value)}
                  onCheckedChange={(checked) => {
                    const currentPermissions = form.getValues("permissions") || []
                    if (checked) {
                      form.setValue("permissions", [...currentPermissions, option.value])
                    } else {
                      form.setValue(
                        "permissions",
                        currentPermissions.filter((p) => p !== option.value),
                      )
                    }
                  }}
                />
                <label
                  htmlFor={option.value}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          Send Invitation
        </Button>
      </form>
    </Form>
  )
}
