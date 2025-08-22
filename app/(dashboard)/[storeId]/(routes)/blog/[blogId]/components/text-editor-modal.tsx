"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Plus,
  Trash,
  Bold,
  Italic,
  Underline,
  Code,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  LinkIcon,
  ImageIcon,
  Video,
  Table,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
  CheckSquare,
  Strikethrough,
} from "lucide-react"

// Import TipTap editor components
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import UnderlineExtension from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import TextAlign from "@tiptap/extension-text-align"
import TextStyle from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import Highlight from "@tiptap/extension-highlight"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import Placeholder from "@tiptap/extension-placeholder"
import BulletList from "@tiptap/extension-bullet-list"
import OrderedList from "@tiptap/extension-ordered-list"
import ListItem from "@tiptap/extension-list-item"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import TableExtension from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import Youtube from "@tiptap/extension-youtube"

interface StepData {
  title?: string
  subtitle?: string
  content?: string[]
  [key: string]: any
}

interface KeyTakeawaysData {
  title?: string
  whatYouLearned?: {
    title?: string
    items?: string[]
  }
  nextSteps?: {
    title?: string
    description?: string
    items?: string[]
  }
  [key: string]: any
}

interface TextEditorModalProps {
  isOpen: boolean
  onClose: () => void
  stepData: StepData | null
  keyTakeawaysData: KeyTakeawaysData | null
  stepIndex: number
  type: "step" | "keyTakeaways"
  onSave: (data: any) => void
}

// Menu button component for editor toolbar
const MenuButton = ({
  onClick,
  isActive = false,
  disabled = false,
  children,
  title,
}: {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  children: React.ReactNode
  title?: string
}) => (
  <Button
    type="button"
    variant={isActive ? "default" : "outline"}
    size="icon"
    className="h-8 w-8 p-0"
    onClick={onClick}
    disabled={disabled}
    title={title}
  >
    {children}
  </Button>
)

export const TextEditorModal: React.FC<TextEditorModalProps> = ({
  isOpen,
  onClose,
  stepData,
  keyTakeawaysData,
  stepIndex,
  type,
  onSave,
}) => {
  const [formData, setFormData] = useState<any>({})
  const [activeTab, setActiveTab] = useState("main")
  const [editorContent, setEditorContent] = useState("")
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [showVideoDialog, setShowVideoDialog] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [imageAlt, setImageAlt] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const linkUrlRef = useRef<HTMLInputElement>(null)

  // Convert array of paragraphs to HTML for editor
  const contentToHtml = useCallback((paragraphs: string[] | undefined) => {
    if (!paragraphs || paragraphs.length === 0) return ""

    // Check if content already has HTML tags
    if (paragraphs[0].trim().startsWith("<")) {
      return paragraphs.join("")
    }
    return paragraphs.map((p) => `<p>${p}</p>`).join("")
  }, [])

  // Convert HTML from editor back to array of paragraphs
  const htmlToContent = useCallback((html: string): string[] => {
    // If the content is already rich HTML, just return it as a single item
    if (
      html.includes("<h1>") ||
      html.includes("<ul>") ||
      html.includes("<ol>") ||
      html.includes("<img") ||
      html.includes("<a ") ||
      html.includes("<strong>") ||
      html.includes("<em>") ||
      html.includes("<code>") ||
      html.includes("<table>")
    ) {
      return [html]
    }

    // Otherwise, split by paragraphs
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = html
    const paragraphs = tempDiv.querySelectorAll("p")

    if (paragraphs.length === 0) {
      return html ? [html] : []
    }

    return Array.from(paragraphs).map((p) => p.innerHTML)
  }, [])

  // Initialize TipTap editor for content
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      UnderlineExtension,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: "rounded-md max-w-full",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Placeholder.configure({
        placeholder: "Write your content here...",
      }),
      BulletList,
      OrderedList,
      ListItem,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      TableExtension.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Youtube.configure({
        width: 640,
        height: 480,
        controls: true,
      }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      setEditorContent(editor.getHTML())
    },
  })

  // Initialize form data when modal opens
  useEffect(() => {
    if (type === "step" && stepData) {
      setFormData({
        title: stepData.title || "",
        subtitle: stepData.subtitle || "",
        content: [...(stepData.content || [])],
      })

      // Set editor content
      if (editor) {
        const html = contentToHtml(stepData.content)
        editor.commands.setContent(html)
      }
    } else if (type === "keyTakeaways" && keyTakeawaysData) {
      setFormData({
        title: keyTakeawaysData.title || "",
        whatYouLearned: {
          title: keyTakeawaysData.whatYouLearned?.title || "",
          items: [...(keyTakeawaysData.whatYouLearned?.items || [])],
        },
        nextSteps: {
          title: keyTakeawaysData.nextSteps?.title || "",
          description: keyTakeawaysData.nextSteps?.description || "",
          items: [...(keyTakeawaysData.nextSteps?.items || [])],
        },
      })
    }
  }, [isOpen, stepData, keyTakeawaysData, type, editor, contentToHtml])

  const handleInputChange = (path: string, value: string) => {
    const keys = path.split(".")
    setFormData((prev: any) => {
      const newData = { ...prev }
      let current = newData

      // Navigate to the nested property
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {}
        }
        current = current[keys[i]]
      }

      // Set the value
      current[keys[keys.length - 1]] = value
      return newData
    })
  }

  const handleArrayChange = (path: string, index: number, value: string) => {
    const keys = path.split(".")
    setFormData((prev: any) => {
      const newData = { ...prev }
      let current = newData

      // Navigate to the nested property
      for (let i = 0; i < keys.length; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = []
        }
        current = current[keys[i]]
      }

      // Set the value at the specified index
      current[index] = value
      return newData
    })
  }

  const addArrayItem = (path: string, defaultValue = "") => {
    const keys = path.split(".")
    setFormData((prev: any) => {
      const newData = { ...prev }
      let current = newData

      // Navigate to the nested property
      for (let i = 0; i < keys.length; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = []
        }
        current = current[keys[i]]
      }

      // Add a new item
      current.push(defaultValue)
      return newData
    })
  }

  const removeArrayItem = (path: string, index: number) => {
    const keys = path.split(".")
    setFormData((prev: any) => {
      const newData = { ...prev }
      let current = newData

      // Navigate to the nested property
      for (let i = 0; i < keys.length; i++) {
        if (!current[keys[i]]) {
          return prev // If path doesn't exist, return unchanged
        }
        current = current[keys[i]]
      }

      // Remove the item at the specified index
      if (Array.isArray(current) && index >= 0 && index < current.length) {
        current.splice(index, 1)
      }

      return newData
    })
  }

  const handleSave = () => {
    if (type === "step" && editor) {
      // Update content from editor
      const contentArray = htmlToContent(editorContent || editor.getHTML())
      const updatedFormData = {
        ...formData,
        content: contentArray,
      }
      onSave(updatedFormData)
    } else {
      onSave(formData)
    }
  }

  // Editor toolbar actions
  const setLink = useCallback(() => {
    if (!editor) return

    const url = linkUrlRef.current?.value || ""

    // cancelled
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }

    // update link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()

    // Close dialog
    setShowLinkDialog(false)
  }, [editor])

  const addImage = useCallback(() => {
    if (!editor) return

    if (imageUrl) {
      editor
        .chain()
        .focus()
        .setImage({
          src: imageUrl,
          alt: imageAlt,
        })
        .run()

      // Reset and close dialog
      setImageUrl("")
      setImageAlt("")
      setShowImageDialog(false)
    }
  }, [editor, imageUrl, imageAlt])

  const addVideo = useCallback(() => {
    if (!editor) return

    if (videoUrl) {
      editor.commands.setYoutubeVideo({
        src: videoUrl,
      })

      // Reset and close dialog
      setVideoUrl("")
      setShowVideoDialog(false)
    }
  }, [editor, videoUrl])

  const addTable = useCallback(() => {
    if (!editor) return

    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }, [editor])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{type === "step" ? `Edit Step ${stepIndex + 1}` : "Edit Key Takeaways"}</DialogTitle>
        </DialogHeader>

        {type === "step" ? (
          <Tabs defaultValue="main" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="main">Main Content</TabsTrigger>
              <TabsTrigger value="editor">Rich Editor</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="main" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title || ""}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Step title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle || ""}
                  onChange={(e) => handleInputChange("subtitle", e.target.value)}
                  placeholder="Step subtitle"
                />
              </div>
            </TabsContent>

            <TabsContent value="editor" className="space-y-4">
              {editor && (
                <>
                  {/* Editor Toolbar */}
                  <div className="border rounded-t-md p-1 bg-muted/20 flex flex-wrap gap-1 items-center">
                    {/* Text Formatting */}
                    <MenuButton
                      onClick={() => editor.chain().focus().toggleBold().run()}
                      isActive={editor.isActive("bold")}
                      title="Bold"
                    >
                      <Bold className="h-4 w-4" />
                    </MenuButton>

                    <MenuButton
                      onClick={() => editor.chain().focus().toggleItalic().run()}
                      isActive={editor.isActive("italic")}
                      title="Italic"
                    >
                      <Italic className="h-4 w-4" />
                    </MenuButton>

                    <MenuButton
                      onClick={() => editor.chain().focus().toggleUnderline().run()}
                      isActive={editor.isActive("underline")}
                      title="Underline"
                    >
                      <Underline className="h-4 w-4" />
                    </MenuButton>

                    <MenuButton
                      onClick={() => editor.chain().focus().toggleStrike().run()}
                      isActive={editor.isActive("strike")}
                      title="Strikethrough"
                    >
                      <Strikethrough className="h-4 w-4" />
                    </MenuButton>

                    <MenuButton
                      onClick={() => editor.chain().focus().toggleCode().run()}
                      isActive={editor.isActive("code")}
                      title="Inline Code"
                    >
                      <Code className="h-4 w-4" />
                    </MenuButton>

                    <div className="w-px h-6 bg-border mx-1"></div>

                    {/* Headings */}
                    <MenuButton
                      onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                      isActive={editor.isActive("heading", { level: 1 })}
                      title="Heading 1"
                    >
                      <Heading1 className="h-4 w-4" />
                    </MenuButton>

                    <MenuButton
                      onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                      isActive={editor.isActive("heading", { level: 2 })}
                      title="Heading 2"
                    >
                      <Heading2 className="h-4 w-4" />
                    </MenuButton>

                    <MenuButton
                      onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                      isActive={editor.isActive("heading", { level: 3 })}
                      title="Heading 3"
                    >
                      <Heading3 className="h-4 w-4" />
                    </MenuButton>

                    <div className="w-px h-6 bg-border mx-1"></div>

                    {/* Lists */}
                    <MenuButton
                      onClick={() => editor.chain().focus().toggleBulletList().run()}
                      isActive={editor.isActive("bulletList")}
                      title="Bullet List"
                    >
                      <List className="h-4 w-4" />
                    </MenuButton>

                    <MenuButton
                      onClick={() => editor.chain().focus().toggleOrderedList().run()}
                      isActive={editor.isActive("orderedList")}
                      title="Numbered List"
                    >
                      <ListOrdered className="h-4 w-4" />
                    </MenuButton>

                    <MenuButton
                      onClick={() => editor.chain().focus().toggleTaskList().run()}
                      isActive={editor.isActive("taskList")}
                      title="Task List"
                    >
                      <CheckSquare className="h-4 w-4" />
                    </MenuButton>

                    <div className="w-px h-6 bg-border mx-1"></div>

                    {/* Alignment */}
                    <MenuButton
                      onClick={() => editor.chain().focus().setTextAlign("left").run()}
                      isActive={editor.isActive({ textAlign: "left" })}
                      title="Align Left"
                    >
                      <AlignLeft className="h-4 w-4" />
                    </MenuButton>

                    <MenuButton
                      onClick={() => editor.chain().focus().setTextAlign("center").run()}
                      isActive={editor.isActive({ textAlign: "center" })}
                      title="Align Center"
                    >
                      <AlignCenter className="h-4 w-4" />
                    </MenuButton>

                    <MenuButton
                      onClick={() => editor.chain().focus().setTextAlign("right").run()}
                      isActive={editor.isActive({ textAlign: "right" })}
                      title="Align Right"
                    >
                      <AlignRight className="h-4 w-4" />
                    </MenuButton>

                    <div className="w-px h-6 bg-border mx-1"></div>

                    {/* Media */}
                    <MenuButton onClick={() => setShowLinkDialog(true)} title="Insert Link">
                      <LinkIcon className="h-4 w-4" />
                    </MenuButton>

                    <MenuButton onClick={() => setShowImageDialog(true)} title="Insert Image">
                      <ImageIcon className="h-4 w-4" />
                    </MenuButton>

                    <MenuButton onClick={() => setShowVideoDialog(true)} title="Insert YouTube Video">
                      <Video className="h-4 w-4" />
                    </MenuButton>

                    <MenuButton onClick={addTable} title="Insert Table">
                      <Table className="h-4 w-4" />
                    </MenuButton>

                    <div className="w-px h-6 bg-border mx-1"></div>

                    {/* Undo/Redo */}
                    <MenuButton
                      onClick={() => editor.chain().focus().undo().run()}
                      disabled={!editor.can().undo()}
                      title="Undo"
                    >
                      <Undo className="h-4 w-4" />
                    </MenuButton>

                    <MenuButton
                      onClick={() => editor.chain().focus().redo().run()}
                      disabled={!editor.can().redo()}
                      title="Redo"
                    >
                      <Redo className="h-4 w-4" />
                    </MenuButton>
                  </div>

                  {/* Editor Content */}
                  <div className="border rounded-b-md min-h-[300px] p-4">
                    <EditorContent editor={editor} className="prose prose-sm max-w-none min-h-[250px]" />
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="preview" className="pt-4">
              <div className="border p-4 rounded-md">
                <h2 className="text-xl font-bold text-[#0A2463] mb-2">{formData.title}</h2>
                <p className="text-gray-700 mb-4">{formData.subtitle}</p>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: editorContent || (editor ? editor.getHTML() : "") }}
                />
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <Tabs defaultValue="main" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="main">Main</TabsTrigger>
              <TabsTrigger value="learned">What You've Learned</TabsTrigger>
              <TabsTrigger value="nextSteps">Next Steps</TabsTrigger>
            </TabsList>

            <TabsContent value="main" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="kt-title">Title</Label>
                <Input
                  id="kt-title"
                  value={formData.title || ""}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Key Takeaways title"
                />
              </div>
            </TabsContent>

            <TabsContent value="learned" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="learned-title">Section Title</Label>
                <Input
                  id="learned-title"
                  value={formData.whatYouLearned?.title || ""}
                  onChange={(e) => handleInputChange("whatYouLearned.title", e.target.value)}
                  placeholder="What You've Learned title"
                />
              </div>

              <div className="space-y-4 mt-4">
                <div className="flex justify-between items-center">
                  <Label>Items</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem("whatYouLearned.items")}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Item
                  </Button>
                </div>

                {formData.whatYouLearned?.items?.map((item: string, idx: number) => (
                  <div key={idx} className="space-y-2 relative">
                    <div className="flex justify-between items-center">
                      <Label htmlFor={`learned-item-${idx}`}>Item {idx + 1}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem("whatYouLearned.items", idx)}
                        className="text-red-500 h-8 w-8 p-0"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      id={`learned-item-${idx}`}
                      value={item}
                      onChange={(e) => handleArrayChange("whatYouLearned.items", idx, e.target.value)}
                      placeholder={`Item ${idx + 1}`}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="nextSteps" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="next-title">Section Title</Label>
                <Input
                  id="next-title"
                  value={formData.nextSteps?.title || ""}
                  onChange={(e) => handleInputChange("nextSteps.title", e.target.value)}
                  placeholder="Next Steps title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="next-desc">Description</Label>
                <Input
                  id="next-desc"
                  value={formData.nextSteps?.description || ""}
                  onChange={(e) => handleInputChange("nextSteps.description", e.target.value)}
                  placeholder="Next Steps description"
                />
              </div>

              <div className="space-y-4 mt-4">
                <div className="flex justify-between items-center">
                  <Label>Items</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("nextSteps.items")}>
                    <Plus className="h-4 w-4 mr-1" /> Add Item
                  </Button>
                </div>

                {formData.nextSteps?.items?.map((item: string, idx: number) => (
                  <div key={idx} className="space-y-2 relative">
                    <div className="flex justify-between items-center">
                      <Label htmlFor={`next-item-${idx}`}>Item {idx + 1}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem("nextSteps.items", idx)}
                        className="text-red-500 h-8 w-8 p-0"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      id={`next-item-${idx}`}
                      value={item}
                      onChange={(e) => handleArrayChange("nextSteps.items", idx, e.target.value)}
                      placeholder={`Item ${idx + 1}`}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>

      {/* Link Dialog */}
      {showLinkDialog && (
        <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Insert Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label htmlFor="url" className="text-sm font-medium">
                  URL
                </label>
                <Input
                  id="url"
                  ref={linkUrlRef}
                  placeholder="https://example.com"
                  defaultValue={editor ? editor.getAttributes("link").href || "" : ""}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                Cancel
              </Button>
              <Button onClick={setLink}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Image Dialog */}
      {showImageDialog && (
        <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Insert Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label htmlFor="imageUrl" className="text-sm font-medium">
                  Image URL
                </label>
                <Input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="imageAlt" className="text-sm font-medium">
                  Alt Text
                </label>
                <Input
                  id="imageAlt"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Image description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowImageDialog(false)}>
                Cancel
              </Button>
              <Button onClick={addImage}>Insert</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Video Dialog */}
      {showVideoDialog && (
        <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Insert YouTube Video</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label htmlFor="videoUrl" className="text-sm font-medium">
                  YouTube URL
                </label>
                <Input
                  id="videoUrl"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowVideoDialog(false)}>
                Cancel
              </Button>
              <Button onClick={addVideo}>Insert</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  )
}
