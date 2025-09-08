

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { toast } from "react-hot-toast"
import {
  Building2,
  Globe,
  Lock,
  ShoppingBag,
  Store,
  AlertTriangle,
  Coffee,
  Sparkles,
  Mail,
  ArrowRight,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSuperAdmin } from "@/hooks/use-super-admin"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function CreateStorePage() {
  const router = useRouter()
  const { user } = useUser()
  const { isSuperAdmin } = useSuperAdmin()

  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isSuperAdmin) {
      toast.error("Only super administrators can create stores")
      return
    }

    try {
      setLoading(true)

      const response = await fetch("/api/stores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, url }),
      })

      if (!response.ok) {
        throw new Error("Failed to create store")
      }

      const store = await response.json()

      window.location.assign(`/${store.id}`)
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const userEmail = user?.emailAddresses?.[0]?.emailAddress || "Not available"

  if (!mounted) {
    return null
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
        className="w-full max-w-3xl z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="flex flex-col items-center mb-10"
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
              <Store className="h-12 w-12 text-blue-400" />
              <AnimatePresence>
                {!isSuperAdmin && (
                  <motion.div
                    className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-red-500/80 flex items-center justify-center shadow-lg shadow-red-500/20 border-2 border-[#0a1122]"
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  >
                    <Lock className="h-4 w-4 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
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
                Create your store
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, type: "spring" }}
                >
                  <Sparkles className="h-5 w-5 text-blue-400" />
                </motion.span>
              </motion.span>
            }
            description="Launch your e-commerce presence with just a few clicks"
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
                <Building2 className="h-5 w-5 text-blue-400" />
                Store Details
              </CardTitle>
              <CardDescription className="text-base text-gray-400">
                Provide information about your new store
              </CardDescription>
              <Separator className="mt-4 bg-[#1e2a4a]" />
            </CardHeader>

            <CardContent>
              <form onSubmit={onSubmit} id="create-store-form" className="space-y-6">
                {!isSuperAdmin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert
                      variant="destructive"
                      className="border-red-900/50 bg-red-900/20 shadow-md text-red-300 rounded-lg"
                    >
                      <AlertTriangle className="h-4 w-4 mr-2 text-red-400" />
                      <AlertDescription className="text-red-300 flex flex-col gap-1">
                        <span className="font-medium">Access denied for {userEmail}</span>
                        <span>
                          Looks like you're not on the VIP list! Maybe it's time for a coffee break instead? The
                          universe is telling you to take a moment for yourself. ☕
                        </span>
                        <span className="flex items-center gap-1 text-xs mt-1 text-red-400/80">
                          <Coffee className="h-3 w-3" /> Suggested alternative: Enjoy a nice cup of coffee and try again
                          later!
                        </span>
                      </AlertDescription>
                    </Alert>

                    {/* Invitation Link Card */}
                    <motion.div
                      className="mt-4 bg-blue-900/20 border border-blue-900/30 rounded-lg p-4 shadow-md"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-500/20 p-2 rounded-full">
                          <Mail className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-blue-300 mb-1">Have an invitation?</h3>
                          <p className="text-xs text-gray-400 mb-3">
                            If you've received an invitation token, you can use it to join an existing store.
                          </p>
                          <Link href="/accept-invitation" passHref>
                            <Button className="w-full bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-700/30 group transition-all duration-300 h-9">
                              <span className="flex items-center gap-1">
                                Accept Invitation
                                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                              </span>
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2 text-gray-300">
                      <ShoppingBag className="h-4 w-4 text-blue-400" />
                      Store Name
                    </label>
                    <div className="relative group">
                      <div className="absolute -inset-0.5 rounded-md bg-gradient-to-r from-blue-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity blur-sm"></div>
                      <Input
                        placeholder="E-Commerce"
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                        disabled={loading || !isSuperAdmin}
                        className="transition-all focus-visible:ring-blue-500/20 focus-visible:ring-offset-0 focus-visible:border-blue-500 h-12 pl-4 pr-4 shadow-sm bg-[#0d1631] border-[#1e2a4a] text-white relative"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5 ml-1">This will be displayed to your customers</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2 text-gray-300">
                      <Globe className="h-4 w-4 text-blue-400" />
                      Store URL
                    </label>
                    <div className="relative group">
                      <div className="absolute -inset-0.5 rounded-md bg-gradient-to-r from-blue-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity blur-sm"></div>
                      <Input
                        placeholder="example.com"
                        onChange={(e) => setUrl(e.target.value)}
                        value={url}
                        disabled={loading || !isSuperAdmin}
                        className="transition-all focus-visible:ring-blue-500/20 focus-visible:ring-offset-0 focus-visible:border-blue-500 h-12 pl-4 pr-4 shadow-sm bg-[#0d1631] border-[#1e2a4a] text-white relative"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5 ml-1">
                      Enter the website URL for this store (e.g., example.com)
                    </p>
                  </div>
                </div>
              </form>
            </CardContent>

            <CardFooter className="flex justify-between border-t border-[#1e2a4a] bg-[#0d1631]/80 p-6">
              <div className="text-sm text-gray-400">
                {isSuperAdmin ? (
                  <motion.span
                    className="flex items-center px-3 py-1 rounded-full bg-green-900/20 text-green-400 text-xs font-medium"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Lock className="h-3 w-3 mr-1" />
                    Authorized as admin
                  </motion.span>
                ) : (
                  <motion.span
                    className="flex items-center px-3 py-1 rounded-full bg-red-900/20 text-red-400 text-xs font-medium"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Lock className="h-3 w-3 mr-1" />
                    Not authorized
                  </motion.span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push("/")}
                  disabled={loading}
                  type="button"
                  className="border-[#1e2a4a] hover:bg-[#1e2a4a]/50 h-11 px-5 text-gray-300 rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="create-store-form"
                  disabled={loading || !name || !isSuperAdmin}
                  className="relative overflow-hidden group h-11 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg shadow-lg shadow-blue-500/20"
                >
                  <span className="relative z-10 font-medium flex items-center gap-1">
                    Continue
                    <Sparkles className="h-3.5 w-3.5 opacity-70" />
                  </span>
                  <span className="absolute inset-0 bg-white/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
                </Button>
              </div>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div
          className="mt-8 text-center text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <p className="flex items-center justify-center gap-1">
            <Lock className="h-3 w-3" />
            Need help? Contact your system administrator
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
