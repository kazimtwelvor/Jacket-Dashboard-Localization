import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers"

// Tailwind utility for merging conditional class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Extract client IP from request headers
export function getClientIp(headers: ReadonlyHeaders): string | null {
  // Try to get IP from standard headers
  const forwardedFor = headers.get("x-forwarded-for")
  if (forwardedFor) {
    // Get the first IP if there are multiple
    return forwardedFor.split(",")[0].trim()
  }
  // Try alternative headers
  const realIp = headers.get("x-real-ip")
  if (realIp) {
    return realIp.trim()
  }
  // If we can't determine the IP
  return null
}

// Currency formatter for USD
export const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})