"use client"

import { useState } from "react"
import { toast } from "react-hot-toast"
import axios from "axios"
import { useParams, useRouter } from "next/navigation"
import { Trash } from "lucide-react"

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface MembersListProps {
  storeMembers: any[]
  canManageMembers: boolean
}

export const MembersList = ({ storeMembers, canManageMembers }: MembersListProps) => {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null)

  const onRemove = async (memberId: string) => {
    try {
      setLoading(true)

      await axios.delete(`/api/stores/${params.storeId}/members/${memberId}`)

      router.refresh()
      toast.success("Member removed")
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
      setOpen(false)
      setMemberToRemove(null)
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "OWNER":
        return "Owner"
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

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "OWNER":
        return "default"
      case "ADMIN":
        return "destructive"
      case "MANAGER":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the member from your store. They will no longer have access to your store data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => memberToRemove && onRemove(memberToRemove)} disabled={loading}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              {canManageMembers && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {storeMembers.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No members found
                </TableCell>
              </TableRow>
            )}
            {storeMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.user.image} />
                      <AvatarFallback>{member.user.name?.charAt(0) || member.user.email.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.user.name}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{member.user.email}</TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(member.role)}>{getRoleLabel(member.role)}</Badge>
                </TableCell>
                {canManageMembers && (
                  <TableCell className="text-right">
                    {member.role !== "OWNER" && (
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          setMemberToRemove(member.id)
                          setOpen(true)
                        }}
                        disabled={loading || !canManageMembers}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
