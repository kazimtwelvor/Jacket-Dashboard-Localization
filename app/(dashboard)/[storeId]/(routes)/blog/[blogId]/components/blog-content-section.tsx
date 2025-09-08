"use client"

import type React from "react"
import { useState } from "react"
import { EditableImage } from "./editable-image"
import { TextEditorModal } from "./text-editor-modal"
import { Button } from "@/components/ui/button"
import { Edit, PenSquare } from "lucide-react"
import { toast } from "react-hot-toast"

interface BlogContentSectionProps {
  title: string
  text: string
  mainImage: string
  smallImageTop: string
  smallImageBottom: string
  subtitleHeading: string
  subtitleText: string
  onSaveText: (field: string, value: string) => void
  onSaveImage: (field: string, url: string) => void
}

export const BlogContentSection: React.FC<BlogContentSectionProps> = ({
  title,
  text,
  mainImage,
  smallImageTop,
  smallImageBottom,
  subtitleHeading,
  subtitleText,
  onSaveText,
  onSaveImage,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentEditField, setCurrentEditField] = useState<string>("")
  const [editData, setEditData] = useState<any>(null)

  const openEditorModal = (field: string) => {
    let data = null

    switch (field) {
      case "title":
        data = {
          title: "Blog Title",
          subtitle: "",
          content: [title],
        }
        break
      case "text":
        data = {
          title: "Main Content",
          subtitle: "",
          content: Array.isArray(text) ? text : [text],
        }
        break
      case "subtitleHeading":
        data = {
          title: "Subtitle Heading",
          subtitle: "",
          content: [subtitleHeading],
        }
        break
      case "subtitleText":
        data = {
          title: "Subtitle Text",
          subtitle: "",
          content: Array.isArray(subtitleText) ? subtitleText : [subtitleText],
        }
        break
    }

    setCurrentEditField(field)
    setEditData(data)
    setIsModalOpen(true)
  }

  const handleSaveContent = (data: any) => {
    if (!currentEditField) return

    const content =
      data.content && data.content.length > 0
        ? Array.isArray(data.content)
          ? data.content.join("\n")
          : data.content
        : ""

    switch (currentEditField) {
      case "title":
        onSaveText("contentSection.title", content)
        break
      case "text":
        onSaveText("contentSection.text", content)
        break
      case "subtitleHeading":
        onSaveText("contentSection.subtitleHeading", content)
        break
      case "subtitleText":
        onSaveText("contentSection.subtitleText", content)
        break
    }

    setIsModalOpen(false)
    toast.success("Content updated successfully")
  }

  return (
    <div className="py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold" dangerouslySetInnerHTML={{ __html: title || "" }} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditorModal("title")}
            className="flex items-center gap-1"
          >
            <Edit className="h-4 w-4" />
            Edit Title
          </Button>
        </div>

        <div className="relative mb-8">
          <div className="prose max-w-none mb-4" dangerouslySetInnerHTML={{ __html: text || "" }} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditorModal("text")}
            className="flex items-center gap-1"
          >
            <PenSquare className="h-4 w-4" />
            Edit Content
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <div className="aspect-video relative rounded-lg overflow-hidden">
            <EditableImage
              field="contentSection.mainImage"
              value={mainImage}
              onSave={onSaveImage}
              className="object-cover"
              width={800}
              height={450}
              alt="Main content image"
            />
          </div>
        </div>
        <div className="flex flex-col justify-between">
          <div className="aspect-square relative rounded-lg overflow-hidden mb-4">
            <EditableImage
              field="contentSection.smallImageTop"
              value={smallImageTop}
              onSave={onSaveImage}
              className="object-cover"
              width={300}
              height={300}
              alt="Small top image"
            />
          </div>
          <div className="aspect-square relative rounded-lg overflow-hidden">
            <EditableImage
              field="contentSection.smallImageBottom"
              value={smallImageBottom}
              onSave={onSaveImage}
              className="object-cover"
              width={300}
              height={300}
              alt="Small bottom image"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-bold" dangerouslySetInnerHTML={{ __html: subtitleHeading || "" }} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditorModal("subtitleHeading")}
            className="flex items-center gap-1"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </div>

        <div className="relative">
          <div className="text-gray-700" dangerouslySetInnerHTML={{ __html: subtitleText || "" }} />
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openEditorModal("subtitleText")}
              className="flex items-center gap-1"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      <TextEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        stepData={editData}
        keyTakeawaysData={null}
        stepIndex={0}
        type="step"
        onSave={handleSaveContent}
      />
    </div>
  )
}
