import type React from "react"
import { AlertTriangle, Info } from "lucide-react"

interface TipsWarningsProps {
  items: Array<{
    type: "tip" | "warning"
    content: string
  }>
}

export const TipsWarnings: React.FC<TipsWarningsProps> = ({ items }) => {
  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className={`flex items-start gap-4 p-4 rounded-lg ${
              item.type === "warning" ? "bg-red-50 border border-red-200" : "bg-blue-50 border border-blue-200"
            }`}
          >
            <div className="flex-shrink-0 mt-1">
              {item.type === "warning" ? (
                <AlertTriangle className="w-5 h-5 text-red-500" />
              ) : (
                <Info className="w-5 h-5 text-blue-500" />
              )}
            </div>
            <div className="flex-grow">
              <p className={`text-sm ${item.type === "warning" ? "text-red-700" : "text-blue-700"}`}>{item.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
