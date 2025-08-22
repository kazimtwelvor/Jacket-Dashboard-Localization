"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Heading } from "@/components/ui/heading"
import { DataTable } from "@/components/ui/data-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InviteModal } from "./invite-modal"
import { columns } from "./columns"
import { invitationColumns } from "./invitation-columns"

export const MembersClient = ({ members = [], invitations = [], currentUserId, storeId, isOwner }) => {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const params = useParams()

  // Add storeId to each member
  const enhancedMembers = members.map((member) => ({
    ...member,
    storeId: params.storeId,
  }))

  // Add storeId to each invitation
  const enhancedInvitations = invitations.map((invitation) => ({
    ...invitation,
    storeId: params.storeId,
  }))

  return (
    <>
      <InviteModal isOpen={open} onClose={() => setOpen(false)} storeId={params.storeId} />
      <div className="flex items-center justify-between">
        <Heading title={`Team Members (${members.length})`} description="Manage who has access to your store" />
        {isOwner && (
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        )}
      </div>
      <Separator />

      <Tabs defaultValue="members" className="w-full">
        <TabsList>
          <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
          <TabsTrigger value="invitations">Pending Invitations ({invitations.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="members" className="pt-4">
          {enhancedMembers.length > 0 ? (
            <DataTable
              columns={columns}
              data={enhancedMembers}
              searchKey="name"
              searchPlaceholder="Search members..."
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <p>No team members found</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="invitations" className="pt-4">
          {enhancedInvitations.length > 0 ? (
            <DataTable
              columns={invitationColumns}
              data={enhancedInvitations}
              searchKey="email"
              searchPlaceholder="Search invitations..."
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <p>No pending invitations</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  )
}
