

export const dynamic = "force-dynamic"
export const revalidate = 0

import { redirect } from "next/navigation"
import { auth, currentUser } from "@clerk/nextjs/server"

import prismadb from "@/lib/prismadb"

export default async function SetupPage() {
 try {
   const { userId } = await auth()
   const user = await currentUser()

   if (!userId || !user) {
     redirect("/sign-in")
   }

 const userEmail = user?.emailAddresses[0]?.emailAddress

 if (!userEmail) {
   redirect("/sign-in")
 }

 let dbUser = await prismadb.user.findFirst({
   where: {
     clerkId: userId,
   },
 })

 if (!dbUser) {
   try {
     dbUser = await prismadb.user.create({
       data: {
         clerkId: userId,
         name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || "User",
         email: userEmail,
         password: "", 
         role: "CUSTOMER", 
       },
     })
   } catch (error) {
     console.error("Error creating user:", error)
     redirect("/sign-in")
   }
 }

 const store = await prismadb.store.findFirst({
   where: {
     userId,
   },
 })

 if (store) {
   redirect(`/${store.id}`)
 }

 const storeMembership = await prismadb.storeUser.findFirst({
   where: {
     userId: dbUser.id, 
   },
   include: {
     store: true,
   },
 })

 if (storeMembership) {
   redirect(`/${storeMembership.storeId}`)
 }

   return redirect("/create-store")
 } catch (error) {
   if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
     throw error;
   }
   console.error("Error in SetupPage:", error)
   redirect("/sign-in")
 }
}