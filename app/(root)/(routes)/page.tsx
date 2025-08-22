// "use client"
// import { useStoreModal } from "@/hooks/use-store-modal"
// import { useEffect } from "react"

// const SetupPage = () => {
//   const onOpen = useStoreModal((state) => state.onOpen)
//   const isOpen = useStoreModal((state) => state.isOpen)

//   useEffect(() => {
//     if (!isOpen) {
//       onOpen()
//     }
//   }, [isOpen, onOpen])

//   return null
// }

// export default SetupPage

export const dynamic = "force-dynamic"
export const revalidate = 0

import { redirect } from "next/navigation"

export default function SetupPage() {
  // Instead of client-side redirection, use server-side redirect
  redirect("/create-store")
}
