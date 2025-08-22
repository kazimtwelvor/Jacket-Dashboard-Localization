import { Loader } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center">
        <Loader className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-lg font-medium">Processing invitation...</p>
      </div>
    </div>
  )
}
