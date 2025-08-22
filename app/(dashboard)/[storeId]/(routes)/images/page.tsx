import type { Metadata } from "next"
import { ImagesClient } from "./components/images-client"

export const metadata: Metadata = {
  title: "Image Gallery",
  description: "Manage all your store images in one place",
}

export default async function ImagesPage() {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ImagesClient />
      </div>
    </div>
  )
}
