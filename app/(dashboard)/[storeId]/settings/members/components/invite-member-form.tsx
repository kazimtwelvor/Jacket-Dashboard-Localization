"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { toast } from "react-hot-toast"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  role: z.string().min(1, { message: "Please select a role" }),
})

type InviteFormValues = z.infer<typeof formSchema>

interface InviteMemberFormProps {
  storeId: string
  onSuccess?: () => void
}

export const InviteMemberForm: React.FC<InviteMemberFormProps> = ({ storeId, onSuccess }) => {
  const [loading, setLoading] = useState(false)

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      role: "viewer",
    },
  })

  const onSubmit = async (data: InviteFormValues) => {
    try {
      setLoading(true)
      await axios.post(`/api/stores/${storeId}/members`, data)
      form.reset()
      if (onSuccess) onSuccess()
    } catch (error: any) {
      toast.error(error.response?.data || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite a New Member</CardTitle>
        <CardDescription>Send an invitation to collaborate on this store</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
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
                  <Select disabled={loading} onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="manager">Manager (Full access)</SelectItem>
                      <SelectItem value="editor">Editor (Can edit content)</SelectItem>
                      <SelectItem value="viewer">Viewer (Read-only access)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>This determines what permissions the user will have</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Sending invitation..." : "Send Invitation"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
