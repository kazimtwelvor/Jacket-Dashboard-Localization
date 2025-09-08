
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { toast } from "react-hot-toast"
import { motion } from "framer-motion"
import { Mail, Lock, User, Key, ArrowRight, Sparkles, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function AcceptInvitationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoaded } = useUser()
  const [token, setToken] = useState("")
  const [loading, setLoading] = useState(false)
  const [processingToken, setProcessingToken] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const tokenFromUrl = searchParams?.get("token")
    if (tokenFromUrl) {
      setToken(tokenFromUrl)
      if (isLoaded && user) {
        handleSubmitToken(tokenFromUrl)
      }
    }
  }, [searchParams, isLoaded, user])

  const handleSubmitToken = async (tokenToSubmit: string) => {
    if (!tokenToSubmit.trim()) {
      toast.error("Please enter an invitation token")
      return
    }

    if (processingToken) return 

    try {
      setProcessingToken(true)
      setLoading(true)

      const response = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: tokenToSubmit }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to accept invitation")
      }

      toast.success("Invitation accepted successfully")

      setTimeout(() => {
        router.push(`/${data.storeId}`)
        router.refresh()
      }, 1000)
    } catch (error: any) {
      toast.error(error.message || "Something went wrong")
    } finally {
      setLoading(false)
      setProcessingToken(false)
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleSubmitToken(token)
  }

  if (!mounted) {
    return null
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0a1122] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center text-white"
        >
          <Loader2 className="h-10 w-10 text-blue-400 animate-spin mb-4" />
          <p className="text-gray-400">Loading your account...</p>
        </motion.div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a1122] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1122] via-[#0c1529] to-[#0a1122] opacity-80"></div>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>

          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.2,
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <motion.div
          className="z-10 flex flex-col items-center justify-center text-center max-w-md px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-600/30 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/10 relative z-10 border border-white/10">
            <Lock className="h-10 w-10 text-blue-400" />
          </div>

          <Heading
            title="Sign In Required"
            description="Please sign in to accept your invitation"
            className="text-center text-white"
          />

          <Button
            className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg shadow-lg shadow-blue-500/20 h-12 px-8 relative overflow-hidden group"
            onClick={() => router.push("/sign-in")}
          >
            <span className="relative z-10 font-medium flex items-center gap-2">
              Sign In
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
            <span className="absolute inset-0 bg-white/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a1122] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1122] via-[#0c1529] to-[#0a1122] opacity-80"></div>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-indigo-400/5 rounded-full blur-3xl"></div>
        <div className="stars">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-[2px] h-[2px] rounded-full bg-white"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.2,
                scale: Math.random() * 0.5 + 0.5,
              }}
              animate={{
                opacity: [0.1, 0.5, 0.1],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>
        <motion.div
          className="absolute top-20 right-[20%] w-12 h-12 rounded-full bg-blue-500/5 backdrop-blur-md"
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-40 left-[30%] w-16 h-16 rounded-full bg-indigo-500/5 backdrop-blur-md"
          animate={{
            y: [0, 20, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>

      <motion.div
        className="w-full max-w-md z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="flex flex-col items-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="relative mb-6">
            <motion.div
              className="absolute -inset-4 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 blur-md"
              animate={{
                rotate: 360,
                scale: [0.95, 1.05, 0.95],
              }}
              transition={{
                rotate: { duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                scale: { duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
              }}
            />
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-600/30 flex items-center justify-center shadow-lg shadow-blue-500/10 relative z-10 border border-white/10">
              <Mail className="h-12 w-12 text-blue-400" />
            </div>
          </div>
          <Heading
            title={
              <motion.span
                className="inline-flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Accept Invitation
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, type: "spring" }}
                >
                  <Sparkles className="h-5 w-5 text-blue-400" />
                </motion.span>
              </motion.span>
            }
            description="Join a store by entering your invitation token"
            className="text-center text-white"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="shadow-2xl border-[#1e2a4a] overflow-hidden backdrop-blur-md bg-[#111a2f]/90 text-white rounded-xl">
            <div className="absolute h-1 top-0 left-0 right-0 bg-gradient-to-r from-blue-500/40 via-blue-400 to-indigo-600/80"></div>

            <CardHeader className="pb-4 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2 text-white">
                <Key className="h-5 w-5 text-blue-400" />
                Invitation Token
              </CardTitle>
              <CardDescription className="text-base text-gray-400">
                Enter the token you received in your invitation
              </CardDescription>
              <Separator className="mt-4 bg-[#1e2a4a]" />
            </CardHeader>

            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="bg-blue-900/20 border border-blue-900/30 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500/20 p-2 rounded-full">
                      <User className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">
                        Signed in as:{" "}
                        <span className="font-medium text-white">{user.primaryEmailAddress?.emailAddress}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Make sure you're signed in with the email address that received the invitation.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={onSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2 text-gray-300">
                      <Key className="h-4 w-4 text-blue-400" />
                      Invitation Token
                    </label>
                    <div className="relative group">
                      <div className="absolute -inset-0.5 rounded-md bg-gradient-to-r from-blue-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity blur-sm"></div>
                      <Input
                        placeholder="Enter your invitation token"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        disabled={loading}
                        className="transition-all focus-visible:ring-blue-500/20 focus-visible:ring-offset-0 focus-visible:border-blue-500 h-12 pl-4 pr-4 shadow-sm bg-[#0d1631] border-[#1e2a4a] text-white relative"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5 ml-1">
                      The token was sent to your email when you were invited
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !token.trim()}
                    className="w-full relative overflow-hidden group h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg shadow-lg shadow-blue-500/20"
                  >
                    <span className="relative z-10 font-medium flex items-center gap-2">
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Accept Invitation
                          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </>
                      )}
                    </span>
                    <span className="absolute inset-0 bg-white/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
                  </Button>
                </form>
              </div>
            </CardContent>

            <CardFooter className="flex justify-center border-t border-[#1e2a4a] bg-[#0d1631]/80 p-6">
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                disabled={loading}
                className="border-[#1e2a4a] hover:bg-[#1e2a4a]/50 h-10 px-4 text-gray-300 rounded-lg"
              >
                Return to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
