// import { NextResponse } from "next/server"
// import { auth } from "@clerk/nextjs/server"
// import { db } from "@/lib/db"
// import crypto from "crypto"

// export async function POST(req: Request) {
//   try {
//     const { userId } = await auth()
//     const body = await req.json()

//     const { name } = body

//     if (!userId) {
//       return new NextResponse("Unauthenticated", { status: 401 })
//     }

//     if (!name) {
//       return new NextResponse("Name is required", { status: 400 })
//     }

//     // Check if user has admin role (only admins can create stores)
//     const { sessionClaims } = await auth()
//     const userRole = sessionClaims?.metadata?.role as string | undefined

//     // Check if user's email is in the SUPER_USER_EMAILS list
//     const { user } = await auth()
//     const userEmail = user?.emailAddresses?.[0]?.emailAddress
//     const superUserEmails = process.env.SUPER_USER_EMAILS?.split(",") || []
//     const isEmailSuperUser = userEmail ? superUserEmails.includes(userEmail) : false

//     if (userRole !== "admin" && userRole !== "super_admin" && !isEmailSuperUser) {
//       return new NextResponse("Only administrators can create stores", { status: 403 })
//     }

//     // First, ensure the user exists in the database
//     let dbUser = await db.user.findUnique({
//       where: { clerkId: userId },
//     })

//     // If user doesn't exist, create them
//     if (!dbUser) {
//       // Generate a random password since we're using Clerk for auth
//       // but our schema requires a password field
//       const randomPassword = crypto.randomBytes(16).toString("hex")

//       dbUser = await db.user.create({
//         data: {
//           clerkId: userId,
//           email: userEmail || "",
//           name: user?.firstName || "User",
//           password: randomPassword, // Add the required password field
//         },
//       })
//     }

//     // Create the store with the database user ID
//     const store = await db.store.create({
//       data: {
//         name,
//         userId,
//         url: name.toLowerCase().replace(/\s+/g, "-"), // Generate a URL slug from the store name
//         storeUsers: {
//           create: {
//             userId: dbUser.id, // Use the database user ID here
//             role: "OWNER",
//             permissions: [
//               "MANAGE_STORE",
//               "MANAGE_PRODUCTS",
//               "MANAGE_ORDERS",
//               "MANAGE_CUSTOMERS",
//               "MANAGE_STAFF",
//               "MANAGE_SETTINGS",
//               "MANAGE_MARKETING",
//               "VIEW_ANALYTICS",
//               "PROCESS_REFUNDS",
//               "MANAGE_REVIEWS",
//             ],
//           },
//         },
//       },
//     })

//     return NextResponse.json(store)
//   } catch (error) {
//     console.log("[STORES_POST]", error)
//     return new NextResponse("Internal error", { status: 500 })
//   }
// }


import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    const body = await req.json()

    const { name } = body

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 })
    }

    // Check if user has admin role (only admins can create stores)
    const { sessionClaims } = await auth()
    const userRole = sessionClaims?.metadata?.role as string | undefined

    // Check if user's email is in the SUPER_USER_EMAILS list
    const { user } = await auth() as any;
    const userEmail = user?.emailAddresses?.[0]?.emailAddress
    const superUserEmails = process.env.SUPER_USER_EMAILS?.split(",") || []
    const isEmailSuperUser = userEmail ? superUserEmails.includes(userEmail) : false

    if (userRole !== "admin" && userRole !== "super_admin" && !isEmailSuperUser) {
      return new NextResponse("Only administrators can create stores", { status: 403 })
    }

    // First, ensure the user exists in the database
    let dbUser = await db.user.findUnique({
      where: { clerkId: userId },
    })

    // If user doesn't exist, create them
    if (!dbUser) {
      // Generate a random password since we're using Clerk for auth
      // but our schema requires a password field
      const randomPassword = crypto.randomBytes(16).toString("hex")

      dbUser = await db.user.create({
        data: {
          clerkId: userId,
          email: userEmail || "",
          name: user?.firstName || "User",
          password: randomPassword, // Add the required password field
        },
      })
    }

    // Create the store with the database user ID
    const store = await db.store.create({
      data: {
        name,
        userId,
        url: name.toLowerCase().replace(/\s+/g, "-"), // Generate a URL slug from the store name
        // Create a Member record instead of StoreUser
        members: {
          create: {
            userId: dbUser.id, // Use the database user ID here
            role: "owner", // Use lowercase role as per new schema
          },
        },
      },
    })

    return NextResponse.json(store)
  } catch (error) {
    console.log("[STORES_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
