import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getClientIp(headers: ReadonlyHeaders): string | null {
  const forwardedFor = headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim()
  }
  const realIp = headers.get("x-real-ip")
  if (realIp) {
    return realIp.trim()
  }
  return null
}

export const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})