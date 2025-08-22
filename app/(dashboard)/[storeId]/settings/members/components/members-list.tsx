"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { toast } from "react-hot-toast"
import { Edit, MoreHorizontal, ShieldAlert, Trash, User } from "lucide-react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Member {
  id: string
  userId: string
  storeId: string
  role: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    firstName: string | null
    lastName: string | null
    imageUrl: string
    email: string | null
  } | null
}

interface MembersListProps {
  storeId: string
}

export const MembersList: React.FC<MembersListProps> = ({ storeId }) => {
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [deletingId, setDeletingId] = useState("")
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [editRole, setEditRole] = useState("")

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/stores/${storeId}/members`)
      setMembers(response.data)
    } catch (error) {
      toast.error("Failed to load members")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [storeId])

  const onDelete = async () => {
    try {
      await axios.delete(`/api/stores/${storeId}/members/${deletingId}`)
      toast.success("Member removed successfully")
      fetchMembers()
      router.refresh()
    } catch (error: any) {
      toast.error(error.response?.data || "Failed to remove member")
    } finally {
      setDeletingId("")
      setOpen(false)
    }
  }

  const onRoleChange = async () => {
    if (!editingMember) return

    try {
      await axios.patch(`/api/stores/${storeId}/members/${editingMember.id}`, {
        role: editRole,
      })
      toast.success("Member role updated successfully")
      fetchMembers()
      router.refresh()
    } catch (error: any) {
      toast.error(error.response?.data || "Failed to update member role")
    } finally {
      setEditingMember(null)
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "manager":
        return <ShieldAlert className="h-4 w-4 text-blue-500" />
      case "editor":
        return <Edit className="h-4 w-4 text-green-500" />
      case "viewer":
        return <User className="h-4 w-4 text-gray-500" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-24">
        <p className="text-sm text-muted-foreground">Loading members...</p>
      </div>
    )
  }

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-24">
        <p className="text-sm text-muted-foreground">No members found</p>
      </div>
    )
  }

  return (
    <>
      <AlertModal isOpen={open} onClose={() => setOpen(false)} onConfirm={onDelete} loading={false} />
      <Dialog open={!!editingMember} onOpenChange={(open) => !open && setEditingMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Member Role</DialogTitle>
            <DialogDescription>
              Update the role for {editingMember?.user?.firstName} {editingMember?.user?.lastName}
            </DialogDescription>
          </DialogHeader>
          <Select value={editRole} onValueChange={setEditRole}>
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manager">Manager (Full access)</SelectItem>
              <SelectItem value="editor">Editor (Can edit content)</SelectItem>
              <SelectItem value="viewer">Viewer (Read-only access)</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMember(null)}>
              Cancel
            </Button>
            <Button onClick={onRoleChange}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <Card key={member.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarImage src={member.user?.imageUrl} />
                    <AvatarFallback>
                      {member.user?.firstName?.charAt(0) || "U"}
                      {member.user?.lastName?.charAt(0) || ""}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">
                      {member.user?.firstName} {member.user?.lastName}
                    </CardTitle>
                    <CardDescription className="text-xs truncate max-w-[200px]">{member.user?.email}</CardDescription>
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
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingMember(member)
                        setEditRole(member.role)
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Change role
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setDeletingId(member.id)
                        setOpen(true)
                      }}
                      className="text-red-600"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Remove member
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center space-x-2">
                {getRoleIcon(member.role)}
                <span className="text-sm">{getRoleBadge(member.role)}</span>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <p className="text-xs text-muted-foreground">Joined {new Date(member.createdAt).toLocaleDateString()}</p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  )
}
