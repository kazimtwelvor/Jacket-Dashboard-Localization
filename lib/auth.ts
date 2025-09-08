

import jwt from "jsonwebtoken"

type JWTPayload = {
  id: string
  email: string
  storeId: string
  iat: number
  exp: number
}

export const verifyJWT = async (token: string): Promise<JWTPayload | null> => {
  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret) {
    throw new Error("JWT_SECRET environment variable is not defined")
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload
    return decoded
  } catch (error) {
    return null
  }
}
