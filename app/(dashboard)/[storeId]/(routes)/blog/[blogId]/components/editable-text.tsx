"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Check, X, Edit2, Bold, Italic, Underline, Code, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, LinkIcon, ImageIcon, Heading1, Heading2, Heading3, Strikethrough } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

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
import Placeholder from "@tiptap/extension-placeholder"
import BulletList from "@tiptap/extension-bullet-list"
import OrderedList from "@tiptap/extension-ordered-list"
import ListItem from "@tiptap/extension-list-item"

interface EditableTextProps {
  field: string
  value: string
  onSave: (field: string, value: string) => void
  className?: string
  isTextarea?: boolean
  isInline?: boolean
  isRichText?: boolean
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
    className="h-7 w-7 p-0"
    onClick={onClick}
    disabled={disabled}
    title={title}
  >
    {children}
  </Button>
)

export const EditableText: React.FC<EditableTextProps> = ({
  field,
  value,
  onSave,
  className = "",
  isTextarea = false,
  isInline = false,
  isRichText = false,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [localValue, setLocalValue] = useState(value || "")
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [imageAlt, setImageAlt] = useState("")
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  const initialValueRef = useRef(value || "")
  const linkUrlRef = useRef<HTMLInputElement>(null)

  // Initialize TipTap editor for rich text editing
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
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
    ],
    content: value,
    onUpdate: ({ editor }) => {
      setLocalValue(editor.getHTML())
    },
  })

  // Update local value when prop value changes and not in editing mode
  useEffect(() => {
    if (!isEditing) {
      setLocalValue(value || "")
      initialValueRef.current = value || ""
      
      // Update editor content if it exists
      if (editor && value !== editor.getHTML()) {
        editor.commands.setContent(value || "")
      }
    }
  }, [value, isEditing, editor])

  // Focus the input when editing starts
  useEffect(() => {
    if (isEditing && !isRichText && inputRef.current) {
      inputRef.current.focus()
    } else if (isEditing && isRichText && editor) {
      editor.commands.focus()
    }
  }, [isEditing, isRichText, editor])

  // Save changes
  const saveChanges = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    // Only save if the value has actually changed
    if (localValue !== initialValueRef.current) {
      // Use setTimeout to defer the save operation outside the current event cycle
      setTimeout(() => {
        onSave(field, localValue)
      }, 0)
    }
    setIsEditing(false)
  }

  // Cancel editing
  const cancelEditing = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    // Reset to the initial value
    setLocalValue(initialValueRef.current)
    if (editor) {
      editor.commands.setContent(initialValueRef.current)
    }
    setIsEditing(false)
  }

  // Start editing - completely isolated from form events
  const startEditing = (e: React.MouseEvent) => {
    // Prevent any form submission or event bubbling
    e.preventDefault()
    e.stopPropagation()

    // Store the current value as the initial value
    initialValueRef.current = value || ""
    setLocalValue(value || "")
    setIsEditing(true)

    // Prevent any other handlers from executing
    return false
  }

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent form submission on Enter
    if (e.key === "Enter" && !isTextarea && !isRichText) {
      e.preventDefault()
      saveChanges(e)
    } else if (e.key === "Enter" && e.ctrlKey && (isTextarea || isRichText)) {
      e.preventDefault()
      saveChanges(e)
    } else if (e.key === "Escape") {
      e.preventDefault()
      cancelEditing(e)
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

  if (isEditing) {
    if (isRichText) {
      return (
        <div
          className="relative w-full"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        >
          {/* Rich Text Editor */}
          <div className="border rounded-md">
            {/* Editor Toolbar */}
            <div className="border-b p-1 bg-muted/20 flex flex-wrap gap-1 items-center">
              {editor && (
                <>
                  {/* Text Formatting */}
                  <MenuButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive("bold")}
                    title="Bold"
                  >
                    <Bold className="h-3.5 w-3.5" />
                  </MenuButton>

                  <MenuButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive("italic")}
                    title="Italic"
                  >
                    <Italic className="h-3.5 w-3.5" />
                  </MenuButton>

                  <MenuButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    isActive={editor.isActive("underline")}
                    title="Underline"
                  >
                    <Underline className="h-3.5 w-3.5" />
                  </MenuButton>

                  <MenuButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive("strike")}
                    title="Strikethrough"
                  >
                    <Strikethrough className="h-3.5 w-3.5" />
                  </MenuButton>

                  <div className="w-px h-5 bg-border mx-1"></div>

                  {/* Headings */}
                  <MenuButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    isActive={editor.isActive("heading", { level: 1 })}
                    title="Heading 1"
                  >
                    <Heading1 className="h-3.5 w-3.5" />
                  </MenuButton>

                  <MenuButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive("heading", { level: 2 })}
                    title="Heading 2"
                  >
                    <Heading2 className="h-3.5 w-3.5" />
                  </MenuButton>

                  <MenuButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    isActive={editor.isActive("heading", { level: 3 })}
                    title="Heading 3"
                  >
                    <Heading3 className="h-3.5 w-3.5" />
                  </MenuButton>

                  <div className="w-px h-5 bg-border mx-1"></div>

                  {/* Lists */}
                  <MenuButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive("bulletList")}
                    title="Bullet List"
                  >
                    <List className="h-3.5 w-3.5" />
                  </MenuButton>

                  <MenuButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive("orderedList")}
                    title="Numbered List"
                  >
                    <ListOrdered className="h-3.5 w-3.5" />
                  </MenuButton>

                  <div className="w-px h-5 bg-border mx-1"></div>

                  {/* Alignment */}
                  <MenuButton
                    onClick={() => editor.chain().focus().setTextAlign("left").run()}
                    isActive={editor.isActive({ textAlign: "left" })}
                    title="Align Left"
                  >
                    <AlignLeft className="h-3.5 w-3.5" />
                  </MenuButton>

                  <MenuButton
                    onClick={() => editor.chain().focus().setTextAlign("center").run()}
                    isActive={editor.isActive({ textAlign: "center" })}
                    title="Align Center"
                  >
                    <AlignCenter className="h-3.5 w-3.5" />
                  </MenuButton>

                  <MenuButton
                    onClick={() => editor.chain().focus().setTextAlign("right").run()}
                    isActive={editor.isActive({ textAlign: "right" })}
                    title="Align Right"
                  >
                    <AlignRight className="h-3.5 w-3.5" />
                  </MenuButton>

                  <div className="w-px h-5 bg-border mx-1"></div>

                  {/* Media */}
                  <MenuButton onClick={() => setShowLinkDialog(true)} title="Insert Link">
                    <LinkIcon className="h-3.5 w-3.5" />
                  </MenuButton>

                  <MenuButton onClick={() => setShowImageDialog(true)} title="Insert Image">
                    <ImageIcon className="h-3.5 w-3.5" />
                  </MenuButton>
                </>
              )}
            </div>

            {/* Editor Content */}
            <div className="p-3 min-h-[100px]">
              <EditorContent editor={editor} className="prose prose-sm max-w-none min-h-[80px]" />
            </div>
          </div>

          <div className="absolute right-2 top-2 flex space-x-1 z-10">
            <Button size="sm" variant="ghost" onClick={saveChanges} className="h-6 w-6 p-0" type="button">
              <Check className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={cancelEditing} className="h-6 w-6 p-0" type="button">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div
        className="relative w-full"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        {isTextarea ? (
          <Textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`p-2 w-full ${className}`}
            rows={5}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <Input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`p-2 w-full ${className}`}
            onClick={(e) => e.stopPropagation()}
          />
        )}
        <div className="absolute right-2 top-2 flex space-x-1">
          <Button size="sm" variant="ghost" onClick={saveChanges} className="h-6 w-6 p-0" type="button">
            <Check className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={cancelEditing} className="h-6 w-6 p-0" type="button">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  const WrapperElement = isInline ? "span" : "div"

  return (
    <WrapperElement
      className={`group relative cursor-pointer min-w-[50px] ${className}`}
      onClick={startEditing}
      onMouseDown={(e) => e.preventDefault()}
    >
      {isRichText ? (
        <WrapperElement
          className="w-full prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: value || "Click to edit" }}
        />
      ) : (
        <WrapperElement className="w-full">{value || "Click to edit"}</WrapperElement>
      )}
      <Button
        size="sm"
        variant="ghost"
        className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          startEditing(e)
        }}
        type="button"
      >
        <Edit2 className="h-4 w-4" />
      </Button>

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
    </WrapperElement>
  )
}
