// import { PrismaAdapter } from "@auth/prisma-adapter"
// import { type NextAuthOptions, getServerSession } from "next-auth"
// import { db } from "@/lib/db"
// import GoogleProvider from "next-auth/providers/google"
// import CredentialsProvider from "next-auth/providers/credentials"
// import bcrypt from "bcryptjs"

// export const authOptions: NextAuthOptions = {
//   adapter: PrismaAdapter(db),
//   session: {
//     strategy: "jwt",
//   },
//   pages: {
//     signIn: "/sign-in",
//   },
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//     CredentialsProvider({
//       name: "credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           return null
//         }

//         const user = await db.user.findUnique({
//           where: {
//             email: credentials.email,
//           },
//         })

//         if (!user) {
//           return null
//         }

//         if (!user.hashedPassword) {
//           return null
//         }

//         const passwordMatch = await bcrypt.compare(credentials.password, user.hashedPassword)

//         if (!passwordMatch) {
//           return null
//         }

//         return user
//       },
//     }),
//   ],
//   callbacks: {
//     async session({ token, session }) {
//       if (token) {
//         session.user.id = token.id
//         session.user.name = token.name
//         session.user.email = token.email
//         session.user.image = token.picture
//       }

//       return session
//     },
//     async jwt({ token, user }) {
//       const dbUser = await db.user.findFirst({
//         where: {
//           email: token.email,
//         },
//       })

//       if (!dbUser) {
//         if (user) {
//           token.id = user.id
//         }
//         return token
//       }

//       return {
//         id: dbUser.id,
//         name: dbUser.name,
//         email: dbUser.email,
//         picture: dbUser.image,
//       }
//     },
//   },
// }

// export const auth = () => getServerSession(authOptions)

import jwt from "jsonwebtoken"

type JWTPayload = {
  id: string
  email: string
  storeId: string
  iat: number
  exp: number
}

/**
 * Verifies a JWT token and returns the payload if valid
 */
export const verifyJWT = async (token: string): Promise<JWTPayload | null> => {
  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret) {
    throw new Error("JWT_SECRET environment variable is not defined")
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload
    return decoded
  } catch (error) {
    console.error("[JWT_VERIFICATION_ERROR]", error)
    return null
  }
}
// 