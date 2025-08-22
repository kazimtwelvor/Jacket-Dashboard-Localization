"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { toast } from "react-hot-toast"
import { Clock, Mail, MoreHorizontal, RefreshCw, Shield, Trash } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { AlertModal } from "@/components/modals/alert-modal"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Invitation {
  id: string
  storeId: string
  email: string
  role: string
  token: string
  expires: string
  createdAt: string
  updatedAt: string
}

interface InvitationsListProps {
  storeId: string
}

export const InvitationsList: React.FC<InvitationsListProps> = ({ storeId }) => {
  const router = useRouter()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [deletingId, setDeletingId] = useState("")
  const [resendingId, setResendingId] = useState("")

  const fetchInvitations = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/stores/${storeId}/invitations`)
      setInvitations(response.data)
    } catch (error) {
      toast.error("Failed to load invitations")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvitations()
  }, [storeId])

  const onDelete = async () => {
    try {
      await axios.delete(`/api/stores/${storeId}/invitations/${deletingId}`)
      toast.success("Invitation cancelled successfully")
      fetchInvitations()
      router.refresh()
    } catch (error: any) {
      toast.error(error.response?.data || "Failed to cancel invitation")
    } finally {
      setDeletingId("")
      setOpen(false)
    }
  }

  const onResend = async (id: string) => {
    try {
      setResendingId(id)
      await axios.patch(`/api/stores/${storeId}/invitations/${id}`)
      toast.success("Invitation resent successfully")
      fetchInvitations()
      router.refresh()
    } catch (error: any) {
      toast.error(error.response?.data || "Failed to resend invitation")
    } finally {
      setResendingId("")
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "manager":
        return <Badge className="bg-blue-500">Manager</Badge>
      case "editor":
        return <Badge className="bg-green-500">Editor</Badge>
      case "viewer":
        return <Badge className="bg-gray-500">Viewer</Badge>
      default:
        return <Badge>{role}</Badge>
    }
  }

  const isExpired = (expires: string) => {
    return new Date() > new Date(expires)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-24">
        <p className="text-sm text-muted-foreground">Loading invitations...</p>
      </div>
    )
  }

  if (invitations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-24">
        <p className="text-sm text-muted-foreground">No pending invitations</p>
      </div>
    )
  }

  return (
    <>
      <AlertModal isOpen={open} onClose={() => setOpen(false)} onConfirm={onDelete} loading={false} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {invitations.map((invitation) => (
          <Card key={invitation.id} className={isExpired(invitation.expires) ? "border-red-300" : ""}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <Mail className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-base">Invitation</CardTitle>
                    <CardDescription className="text-xs truncate max-w-[200px]">{invitation.email}</CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onResend(invitation.id)} disabled={resendingId === invitation.id}>
                      {resendingId === invitation.id ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Resending...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Resend invitation
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setDeletingId(invitation.id)
                        setOpen(true)
                      }}
                      className="text-red-600"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Cancel invitation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{getRoleBadge(invitation.role)}</span>
              </div>
              {isExpired(invitation.expires) && (
                <div className="mt-2 flex items-center space-x-2 text-red-500">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs">Expired</span>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-2">
              <p className="text-xs text-muted-foreground">
                Sent {new Date(invitation.createdAt).toLocaleDateString()}
                {!isExpired(invitation.expires) && <> · Expires {new Date(invitation.expires).toLocaleDateString()}</>}
              </p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  )
}
