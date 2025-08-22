import type React from "react"

import type { Metadata } from "next"
import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs"

import ModalProvider from "@/providers/modal-provider"
import { ToasterProvider } from "@/providers/toast-provider"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin Dashboard",
  generator: "fineyst.com",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="antialiased" suppressHydrationWarning>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange={false}>
            <ToasterProvider />
            <ModalProvider />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}


import './globals.css'