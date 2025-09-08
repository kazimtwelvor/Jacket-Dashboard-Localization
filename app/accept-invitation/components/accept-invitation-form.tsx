"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import axios from "axios"
import { useUser } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export const AcceptInvitationForm = () => {
  const router = useRouter()
  const { user } = useUser()
  const [token, setToken] = useState("")
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      toast.error("Please enter an invitation token")
      return
    }

    if (!user) {
      toast.error("You must be logged in to accept an invitation")
      return
    }

    const userEmail = user.primaryEmailAddress?.emailAddress

    if (!userEmail) {
      toast.error("Your account must have an email address")
      return
    }

    setLoading(true)

    try {
      const response = await axios.post("/api/invitations/accept", {
        token,
        email: userEmail,
      })

      toast.success("Invitation accepted successfully!")

      if (response.data.storeId) {
        router.push(`/${response.data.storeId}`)
      } else {
        router.push("/")
      }

      router.refresh()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to accept invitation")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Accept Store Invitation</CardTitle>
        <CardDescription>Enter the invitation token you received to join a store.</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Enter invitation token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                disabled={loading}
              />
            </div>
            {user?.primaryEmailAddress?.emailAddress && (
              <p className="text-sm text-muted-foreground">
                You will join with email: {user.primaryEmailAddress.emailAddress}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Processing..." : "Accept Invitation"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
