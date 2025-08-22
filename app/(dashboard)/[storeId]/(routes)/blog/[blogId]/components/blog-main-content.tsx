"use client"

import type React from "react"
import { EditableText } from "./editable-text"

interface BlogMainContentProps {
  content: string
  onSaveText: (field: string, value: string) => void
}

export const BlogMainContent: React.FC<BlogMainContentProps> = ({ content, onSaveText }) => {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="prose max-w-none">
        <EditableText
          field="content"
          value={content}
          onSave={onSaveText}
          className="bg-transparent focus:outline-none focus:ring-0 border-0 p-0"
          isTextarea={true}
        />
      </div>
    </div>
  )
}
