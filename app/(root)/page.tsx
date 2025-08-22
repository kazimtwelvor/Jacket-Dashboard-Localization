// export const dynamic = "force-dynamic"
// export const revalidate = 0

// import { redirect } from "next/navigation"
// import { auth, currentUser } from "@clerk/nextjs/server"

// import prismadb from "@/lib/prismadb"

// export default async function SetupPage() {
//   const { userId } = await auth()
//   const user = await currentUser()

//   if (!userId) {
//     redirect("/sign-in")
//   }

//   // Get the user's email
//   const userEmail = user?.emailAddresses[0]?.emailAddress

//   if (!userEmail) {
//     redirect("/sign-in")
//   }

//   // Find the database User record for this Clerk user
//   let dbUser = await prismadb.user.findFirst({
//     where: {
//       clerkId: userId,
//     },
//   })

//   // If no User record exists, create one
//   if (!dbUser) {
//     dbUser = await prismadb.user.create({
//       data: {
//         clerkId: userId,
//         name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || "User",
//         email: userEmail,
//         password: "", // Not used with Clerk
//         role: "CUSTOMER", // Default role
//       },
//     })
//   }

//   // First check if the user owns any stores
//   const store = await prismadb.store.findFirst({
//     where: {
//       userId,
//     },
//   })

//   // If the user owns a store, redirect to it
//   if (store) {
//     redirect(`/${store.id}`)
//   }

//   // If the user doesn't own any stores, check if they're a member of any stores
//   const storeMembership = await prismadb.storeUser.findFirst({
//     where: {
//       userId: dbUser.id,
//     },
//     include: {
//       store: true,
//     },
//   })

//   // If the user is a member of a store, redirect to it
//   if (storeMembership) {
//     redirect(`/${storeMembership.storeId}`)
//   }

//   // If the user doesn't own or belong to any stores, show the create store page
//   return redirect("/create-store")
// }


export const dynamic = "force-dynamic"
export const revalidate = 0

import { redirect } from "next/navigation"
import { auth, currentUser } from "@clerk/nextjs/server"

import prismadb from "@/lib/prismadb"

export default async function SetupPage() {
 const { userId } = await auth()
 const user = await currentUser()

 if (!userId) {
   redirect("/sign-in")
 }

 // Get the user's email
 const userEmail = user?.emailAddresses[0]?.emailAddress

 if (!userEmail) {
   redirect("/sign-in")
 }

 // Find the database User record for this Clerk user
 let dbUser = await prismadb.user.findFirst({
   where: {
     clerkId: userId,
   },
 })

 // If no User record exists, create one
 if (!dbUser) {
   dbUser = await prismadb.user.create({
     data: {
       clerkId: userId,
       name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || "User",
       email: userEmail,
       password: "", // Not used with Clerk
       role: "CUSTOMER", // Default role
     },
   })
 }

 // First check if the user owns any stores
 const store = await prismadb.store.findFirst({
   where: {
     userId,
   },
 })

 // If the user owns a store, redirect to it
 if (store) {
   redirect(`/${store.id}`)
 }

 // If the user doesn't own any stores, check if they're a member of any stores
 const storeMembership = await prismadb.storeUser.findFirst({
   where: {
     userId: dbUser.id, // Use the database User ID
   },
   include: {
     store: true,
   },
 })

 // If the user is a member of a store, redirect to it
 if (storeMembership) {
   redirect(`/${storeMembership.storeId}`)
 }

 // If the user doesn't own or belong to any stores, show the create store page
 return redirect("/create-store")
}