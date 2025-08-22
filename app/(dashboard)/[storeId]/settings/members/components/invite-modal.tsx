"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "react-hot-toast"
import { Copy, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  role: z.enum(["ADMIN", "MANAGER", "EDITOR", "SUPPORT", "VIEWER"], {
    required_error: "Please select a role",
  }),
})

export const InviteModal = ({
  isOpen,
  onClose,
  storeId,
}: {
  isOpen: boolean
  onClose: () => void
  storeId: string
}) => {
  const [loading, setLoading] = useState(false)
  const [invitationToken, setInvitationToken] = useState("")
  const [copied, setCopied] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      role: "VIEWER",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/${storeId}/invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong")
      }

      setInvitationToken(data.token)
      toast.success("Invitation created successfully")
    } catch (error: any) {
      toast.error(error.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const onCopy = () => {
    navigator.clipboard.writeText(invitationToken)
    setCopied(true)
    toast.success("Token copied to clipboard")
    setTimeout(() => setCopied(false), 3000)
  }

  const resetForm = () => {
    form.reset()
    setInvitationToken("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={resetForm}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>Send an invitation to join your store team.</DialogDescription>
        </DialogHeader>

        {!invitationToken ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email address" disabled={loading} {...field} />
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
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="MANAGER">Manager</SelectItem>
                        <SelectItem value="EDITOR">Editor</SelectItem>
                        <SelectItem value="SUPPORT">Support</SelectItem>
                        <SelectItem value="VIEWER">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Invitation"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                Share this token with your team member. They will need to enter this token after logging in with the
                email address you invited.
              </AlertDescription>
            </Alert>

            <div className="flex items-center space-x-2">
              <Input value={invitationToken} readOnly className="font-mono text-sm" />
              <Button size="icon" variant="outline" onClick={onCopy} className="flex-shrink-0">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="pt-2">
              <p className="text-sm text-muted-foreground">Your team member should:</p>
              <ol className="list-decimal list-inside text-sm text-muted-foreground pl-2 space-y-1 mt-2">
                <li>
                  Sign in with the email address: <span className="font-medium">{form.getValues().email}</span>
                </li>
                <li>
                  Go to <span className="font-medium">Accept Invitation</span> page
                </li>
                <li>Enter this token to gain access to your store</li>
              </ol>
            </div>

            <DialogFooter>
              <Button onClick={resetForm}>Done</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
