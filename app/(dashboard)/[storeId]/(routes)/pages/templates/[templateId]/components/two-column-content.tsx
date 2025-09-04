

"use client"

import React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  LinkIcon,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface TwoColumnContentProps {
  isEditing?: boolean
  mainHeading: string
  leftColumnTitle: string
  leftColumnContent: string
  leftColumnSecondTitle: string
  leftColumnSecondContent: string
  rightColumnTitle: string
  rightColumnContent: string
  rightColumnSecondTitle: string
  rightColumnSecondContent: string
  onMainHeadingChange: (value: string) => void
  onLeftColumnTitleChange: (value: string) => void
  onLeftColumnContentChange: (value: string) => void
  onLeftColumnSecondTitleChange: (value: string) => void
  onLeftColumnSecondContentChange: (value: string) => void
  onRightColumnTitleChange: (value: string) => void
  onRightColumnContentChange: (value: string) => void
  onRightColumnSecondTitleChange: (value: string) => void
  onRightColumnSecondContentChange: (value: string) => void
}

interface LinkDialogProps {
  isOpen: boolean
  onClose: () => void
  onInsert: (url: string, text: string) => void
  selectedText: string
}

const LinkDialog = ({ isOpen, onClose, onInsert, selectedText }: LinkDialogProps) => {
  const [url, setUrl] = useState("https://")
  const [linkText, setLinkText] = useState("")

  React.useEffect(() => {
    if (isOpen && selectedText) {
      setLinkText(selectedText)
    } else if (isOpen && !selectedText) {
      setLinkText("")
    }
  }, [isOpen, selectedText])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onInsert(url, linkText || "Link")
    onClose()
    setUrl("https://")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Insert Link</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="link-text">Link Text</Label>
            <Input
              id="link-text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="Text to display"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="link-url">URL</Label>
            <Input
              id="link-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Insert Link</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const TextFormatToolbar = ({
  targetRef,
  onFormat,
  onLinkClick,
}: {
  targetRef: React.RefObject<HTMLTextAreaElement>
  onFormat: (tag: string, endTag: string) => void
  onLinkClick: () => void
}) => {
  return (
    <div className="flex flex-wrap items-center gap-1 p-1 border rounded-md bg-muted/20 mb-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onFormat("<b>", "</b>")}
        className="h-8 w-8 p-0"
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onFormat("<i>", "</i>")}
        className="h-8 w-8 p-0"
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onFormat("<u>", "</u>")}
        className="h-8 w-8 p-0"
        title="Underline"
      >
        <Underline className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onLinkClick} className="h-8 w-8 p-0" title="Insert Link">
        <LinkIcon className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-border mx-1" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onFormat("<h1>", "</h1>")}
        className="h-8 w-8 p-0"
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onFormat("<h2>", "</h2>")}
        className="h-8 w-8 p-0"
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onFormat("<h3>", "</h3>")}
        className="h-8 w-8 p-0"
        title="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-border mx-1" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onFormat("<ul>\n  <li>", "</li>\n</ul>")}
        className="h-8 w-8 p-0"
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onFormat("<ol>\n  <li>", "</li>\n</ol>")}
        className="h-8 w-8 p-0"
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-border mx-1" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onFormat('<div style="text-align: left;">', "</div>")}
        className="h-8 w-8 p-0"
        title="Align Left"
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onFormat('<div style="text-align: center;">', "</div>")}
        className="h-8 w-8 p-0"
        title="Align Center"
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onFormat('<div style="text-align: right;">', "</div>")}
        className="h-8 w-8 p-0"
        title="Align Right"
      >
        <AlignRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

export const TwoColumnContent: React.FC<TwoColumnContentProps> = ({
  isEditing = false,
  mainHeading,
  leftColumnTitle = "",
  leftColumnContent = "",
  leftColumnSecondTitle = "",
  leftColumnSecondContent = "",
  rightColumnTitle = "",
  rightColumnContent = "",
  rightColumnSecondTitle = "",
  rightColumnSecondContent = "",
  onMainHeadingChange,
  onLeftColumnTitleChange,
  onLeftColumnContentChange,
  onLeftColumnSecondTitleChange,
  onLeftColumnSecondContentChange,
  onRightColumnTitleChange,
  onRightColumnContentChange,
  onRightColumnSecondTitleChange,
  onRightColumnSecondContentChange,
}) => {
  const [leftExpanded, setLeftExpanded] = useState(false)
  const [rightExpanded, setRightExpanded] = useState(false)

  const leftContentRef = useRef<HTMLTextAreaElement>(null)
  const leftSecondContentRef = useRef<HTMLTextAreaElement>(null)
  const rightContentRef = useRef<HTMLTextAreaElement>(null)
  const rightSecondContentRef = useRef<HTMLTextAreaElement>(null)

  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [currentTextarea, setCurrentTextarea] = useState<React.RefObject<HTMLTextAreaElement> | null>(null)
  const [currentUpdateFn, setCurrentUpdateFn] = useState<((value: string) => void) | null>(null)
  const [selectedText, setSelectedText] = useState("")

  const insertFormatting = (
    ref: React.RefObject<HTMLTextAreaElement>,
    startTag: string,
    endTag: string,
    updateFn: (value: string) => void,
  ) => {
    const textarea = ref.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const selectedText = text.substring(start, end)

    const newText = text.substring(0, start) + startTag + selectedText + endTag + text.substring(end)

    updateFn(newText)

    setTimeout(() => {
      if (textarea) {
        textarea.focus()
        textarea.setSelectionRange(start + startTag.length, start + startTag.length + selectedText.length)
      }
    }, 0)
  }

  const handleLinkClick = (ref: React.RefObject<HTMLTextAreaElement>, updateFn: (value: string) => void) => {
    const textarea = ref.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const selection = text.substring(start, end)

    setSelectedText(selection)
    setCurrentTextarea(ref)
    setCurrentUpdateFn(() => updateFn)
    setLinkDialogOpen(true)
  }

  const insertLink = (url: string, text: string) => {
    if (!currentTextarea || !currentUpdateFn) return

    const textarea = currentTextarea.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const currentText = textarea.value

    const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`

    const newText = currentText.substring(0, start) + linkHtml + currentText.substring(end)

    currentUpdateFn(newText)

    setCurrentTextarea(null)
    setCurrentUpdateFn(null)
    setSelectedText("")
  }

  const truncateText = (text: string) => {
    const words = text.split(" ")
    if (words.length <= 250) return text
    return words.slice(0, 250).join(" ") + "..."
  }

  return (
    <div className="w-full py-12 px-4 bg-slate-900 text-white">
      <LinkDialog
        isOpen={linkDialogOpen}
        onClose={() => setLinkDialogOpen(false)}
        onInsert={insertLink}
        selectedText={selectedText}
      />

      {isEditing ? (
        <div className="space-y-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Main Section Heading</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="main-heading">Main Heading</Label>
                <Input
                  id="main-heading"
                  value={mainHeading}
                  onChange={(e) => onMainHeadingChange(e.target.value)}
                  placeholder="Enter main heading"
                  className="mb-4"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Left Column Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="left-title">First Section Title</Label>
                <Input
                  id="left-title"
                  value={leftColumnTitle}
                  onChange={(e) => onLeftColumnTitleChange(e.target.value)}
                  placeholder="Enter section title"
                  className="mb-4"
                />

                <Label htmlFor="left-content">First Section Content</Label>
                <TextFormatToolbar
                  targetRef={leftContentRef}
                  onFormat={(start, end) => insertFormatting(leftContentRef, start, end, onLeftColumnContentChange)}
                  onLinkClick={() => handleLinkClick(leftContentRef, onLeftColumnContentChange)}
                />
                <Textarea
                  id="left-content"
                  ref={leftContentRef}
                  value={leftColumnContent}
                  onChange={(e) => onLeftColumnContentChange(e.target.value)}
                  placeholder="Enter first section content"
                  rows={6}
                  className="min-h-[150px]"
                />
              </div>
              <div>
                <Label htmlFor="left-second-title">Second Heading</Label>
                <Input
                  id="left-second-title"
                  value={leftColumnSecondTitle}
                  onChange={(e) => onLeftColumnSecondTitleChange(e.target.value)}
                  placeholder="Enter section title"
                  className="mb-4"
                />

                <Label htmlFor="left-second-content">Second Section Content (Revealed on Read More)</Label>
                <TextFormatToolbar
                  targetRef={leftSecondContentRef}
                  onFormat={(start, end) =>
                    insertFormatting(leftSecondContentRef, start, end, onLeftColumnSecondContentChange)
                  }
                  onLinkClick={() => handleLinkClick(leftSecondContentRef, onLeftColumnSecondContentChange)}
                />
                <Textarea
                  id="left-second-content"
                  ref={leftSecondContentRef}
                  value={leftColumnSecondContent}
                  onChange={(e) => onLeftColumnSecondContentChange(e.target.value)}
                  placeholder="Enter second section content"
                  rows={6}
                  className="min-h-[150px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Right Column Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="right-title">First Section Title</Label>
                <Input
                  id="right-title"
                  value={rightColumnTitle}
                  onChange={(e) => onRightColumnTitleChange(e.target.value)}
                  placeholder="Enter section title"
                  className="mb-4"
                />

                <Label htmlFor="right-content">First Section Content</Label>
                <TextFormatToolbar
                  targetRef={rightContentRef}
                  onFormat={(start, end) => insertFormatting(rightContentRef, start, end, onRightColumnContentChange)}
                  onLinkClick={() => handleLinkClick(rightContentRef, onRightColumnContentChange)}
                />
                <Textarea
                  id="right-content"
                  ref={rightContentRef}
                  value={rightColumnContent}
                  onChange={(e) => onRightColumnContentChange(e.target.value)}
                  placeholder="Enter first section content"
                  rows={6}
                  className="min-h-[150px]"
                />
              </div>
              <div>
                <Label htmlFor="right-second-title">Second Heading</Label>
                <Input
                  id="right-second-title"
                  value={rightColumnSecondTitle}
                  onChange={(e) => onRightColumnSecondTitleChange(e.target.value)}
                  placeholder="Enter section title"
                  className="mb-4"
                />

                <Label htmlFor="right-second-content">Second Section Content (Revealed on Read More)</Label>
                <TextFormatToolbar
                  targetRef={rightSecondContentRef}
                  onFormat={(start, end) =>
                    insertFormatting(rightSecondContentRef, start, end, onRightColumnSecondContentChange)
                  }
                  onLinkClick={() => handleLinkClick(rightSecondContentRef, onRightColumnSecondContentChange)}
                />
                <Textarea
                  id="right-second-content"
                  ref={rightSecondContentRef}
                  value={rightColumnSecondContent}
                  onChange={(e) => onRightColumnSecondContentChange(e.target.value)}
                  placeholder="Enter second section content"
                  rows={6}
                  className="min-h-[150px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-orange-500">{mainHeading}</h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-orange-400 border-b border-orange-400 pb-2">{leftColumnTitle}</h3>
            <div className="prose prose-invert max-w-none">
              <div
                className="text-sm leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: leftExpanded ? leftColumnContent : truncateText(leftColumnContent),
                }}
              />

              {leftExpanded && (
                <>
                  <h3 className="text-xl font-semibold text-orange-400 border-b border-orange-400 pb-2 mt-6">
                    {leftColumnSecondTitle}
                  </h3>
                  <div
                    className="text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: leftColumnSecondContent,
                    }}
                  />
                </>
              )}

              <Button
                variant="link"
                className="text-orange-400 p-0 h-auto mt-2"
                onClick={() => setLeftExpanded(!leftExpanded)}
              >
                {leftExpanded ? "Read Less" : "Read More"}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-orange-400 border-b border-orange-400 pb-2">
              {rightColumnTitle}
            </h3>
            <div className="prose prose-invert max-w-none">
              <div
                className="text-sm leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: rightExpanded ? rightColumnContent : truncateText(rightColumnContent),
                }}
              />

              {rightExpanded && (
                <>
                  <h3 className="text-xl font-semibold text-orange-400 border-b border-orange-400 pb-2 mt-6">
                    {rightColumnSecondTitle}
                  </h3>
                  <div
                    className="text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: rightColumnSecondContent,
                    }}
                  />
                </>
              )}

              <Button
                variant="link"
                className="text-orange-400 p-0 h-auto mt-2"
                onClick={() => setRightExpanded(!rightExpanded)}
              >
                {rightExpanded ? "Read Less" : "Read More"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
