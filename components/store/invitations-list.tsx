"use client"

import { useState } from "react"
import { toast } from "react-hot-toast"
import axios from "axios"
import { useParams, useRouter } from "next/navigation"
import { Trash, Clock } from "lucide-react"
import { format } from "date-fns"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"

interface InvitationsListProps {
  invitations: any[]
}

export const InvitationsList = ({ invitations }: InvitationsListProps) => {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [invitationToDelete, setInvitationToDelete] = useState<string | null>(null)

  const onCancel = async (invitationId: string) => {
    try {
      setLoading(true)

      await axios.delete(`/api/stores/${params.storeId}/invitations/${invitationId}`)

      router.refresh()
      toast.success("Invitation cancelled")
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
      setOpen(false)
      setInvitationToDelete(null)
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Admin"
      case "MANAGER":
        return "Manager"
      case "EDITOR":
        return "Editor"
      case "SUPPORT":
        return "Support"
      case "VIEWER":
        return "Viewer"
      default:
        return role
    }
  }

  const isExpired = (expiryDate: Date) => {
    return new Date(expiryDate) < new Date()
  }

  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the invitation. The user will no longer be able to join the store.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => invitationToDelete && onCancel(invitationToDelete)} disabled={loading}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No pending invitations
                </TableCell>
              </TableRow>
            )}
            {invitations.map((invitation) => (
              <TableRow key={invitation.id}>
                <TableCell>{invitation.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">{getRoleLabel(invitation.role)}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {format(new Date(invitation.expires), "MMM dd, yyyy")}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={isExpired(invitation.expires) ? "destructive" : "default"}>
                    {isExpired(invitation.expires) ? "Expired" : "Pending"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => {
                      setInvitationToDelete(invitation.id)
                      setOpen(true)
                    }}
                    disabled={loading}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
