import type { NextPage } from "next"
import type { ReactElement, ReactNode } from "react"

declare module "next" {
  export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
    getLayout?: (page: ReactElement) => ReactNode
  }
}

declare module "next/types" {
  export interface PageProps {
    params?: Record<string, string>
    searchParams?: Record<string, string | string[]>
  }
}

