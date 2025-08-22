"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  LinkIcon,
  ImageIcon,
  Code,
  Youtube,
  TableIcon,
  Undo,
  Redo,
  CheckSquare,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Write your content here...",
  className = "",
}: RichTextEditorProps) {
  const [editorContent, setEditorContent] = useState(content)
  const [editorRef, setEditorRef] = useState<HTMLDivElement | null>(null)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [showVideoDialog, setShowVideoDialog] = useState(false)
  const [showTableDialog, setShowTableDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [linkText, setLinkText] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [imageAlt, setImageAlt] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [tableRows, setTableRows] = useState(3)
  const [tableCols, setTableCols] = useState(3)

  useEffect(() => {
    setEditorContent(content)
  }, [content])

  useEffect(() => {
    if (editorRef) {
      editorRef.innerHTML = editorContent
    }
  }, [editorRef, editorContent])

  const handleContentChange = () => {
    if (editorRef) {
      const newContent = editorRef.innerHTML
      setEditorContent(newContent)
      onChange(newContent)
    }
  }

  const execCommand = (command: string, value = "") => {
    document.execCommand(command, false, value)
    handleContentChange()
    editorRef?.focus()
  }

  const insertLink = () => {
    if (linkUrl) {
      const text = linkText || linkUrl
      execCommand("insertHTML", `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`)
      setLinkUrl("")
      setLinkText("")
      setShowLinkDialog(false)
    }
  }

  const insertImage = () => {
    if (imageUrl) {
      execCommand("insertHTML", `<img src="${imageUrl}" alt="${imageAlt}" style="max-width: 100%; height: auto;" />`)
      setImageUrl("")
      setImageAlt("")
      setShowImageDialog(false)
    }
  }

  const insertVideo = () => {
    if (videoUrl) {
      // Extract YouTube video ID
      let videoId = ""
      const match = videoUrl.match(
        /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/,
      )
      if (match && match[1]) {
        videoId = match[1]
        execCommand(
          "insertHTML",
          `<div class="video-container"><iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`,
        )
        setVideoUrl("")
        setShowVideoDialog(false)
      } else {
        alert("Please enter a valid YouTube URL")
      }
    }
  }

  const insertTable = () => {
    let tableHTML = '<table style="width:100%; border-collapse: collapse;">'

    // Create header row
    tableHTML += "<thead><tr>"
    for (let i = 0; i < tableCols; i++) {
      tableHTML += `<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Header ${i + 1}</th>`
    }
    tableHTML += "</tr></thead><tbody>"

    // Create data rows
    for (let i = 0; i < tableRows; i++) {
      tableHTML += "<tr>"
      for (let j = 0; j < tableCols; j++) {
        tableHTML += `<td style="border: 1px solid #ddd; padding: 8px;">Cell ${i + 1}-${j + 1}</td>`
      }
      tableHTML += "</tr>"
    }

    tableHTML += "</tbody></table>"
    execCommand("insertHTML", tableHTML)
    setShowTableDialog(false)
  }

  return (
    <div className={`border rounded-md ${className}`}>
      <Tabs defaultValue="edit">
        <div className="border-b px-3">
          <div className="flex items-center flex-wrap gap-1 py-2">
            <Button variant="ghost" size="icon" onClick={() => execCommand("bold")} type="button">
              <Bold className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => execCommand("italic")} type="button">
              <Italic className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => execCommand("underline")} type="button">
              <Underline className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => execCommand("strikeThrough")} type="button">
              <Strikethrough className="h-4 w-4" />
            </Button>
            <span className="w-px h-6 bg-gray-300 mx-1"></span>
            <Button variant="ghost" size="icon" onClick={() => execCommand("formatBlock", "<h1>")} type="button">
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => execCommand("formatBlock", "<h2>")} type="button">
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => execCommand("formatBlock", "<h3>")} type="button">
              <Heading3 className="h-4 w-4" />
            </Button>
            <span className="w-px h-6 bg-gray-300 mx-1"></span>
            <Button variant="ghost" size="icon" onClick={() => execCommand("insertUnorderedList")} type="button">
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => execCommand("insertOrderedList")} type="button">
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => execCommand("insertHTML", '<li><input type="checkbox" /> Task item</li>')}
              type="button"
            >
              <CheckSquare className="h-4 w-4" />
            </Button>
            <span className="w-px h-6 bg-gray-300 mx-1"></span>
            <Button variant="ghost" size="icon" onClick={() => execCommand("justifyLeft")} type="button">
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => execCommand("justifyCenter")} type="button">
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => execCommand("justifyRight")} type="button">
              <AlignRight className="h-4 w-4" />
            </Button>
            <span className="w-px h-6 bg-gray-300 mx-1"></span>
            <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" type="button">
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Insert Link</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="link-url">URL</Label>
                    <Input
                      id="link-url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="link-text">Text (optional)</Label>
                    <Input
                      id="link-text"
                      value={linkText}
                      onChange={(e) => setLinkText(e.target.value)}
                      placeholder="Link text"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={insertLink} type="button">
                    Insert Link
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" type="button">
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Insert Image</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="image-url">Image URL</Label>
                    <Input
                      id="image-url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="image-alt">Alt Text</Label>
                    <Input
                      id="image-alt"
                      value={imageAlt}
                      onChange={(e) => setImageAlt(e.target.value)}
                      placeholder="Image description"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={insertImage} type="button">
                    Insert Image
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="ghost" size="icon" onClick={() => execCommand("formatBlock", "<pre>")} type="button">
              <Code className="h-4 w-4" />
            </Button>

            <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" type="button">
                  <Youtube className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Insert YouTube Video</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="video-url">YouTube URL</Label>
                    <Input
                      id="video-url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={insertVideo} type="button">
                    Insert Video
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" type="button">
                  <TableIcon className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Insert Table</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="table-rows">Rows</Label>
                    <Input
                      id="table-rows"
                      type="number"
                      min="1"
                      max="10"
                      value={tableRows}
                      onChange={(e) => setTableRows(Number.parseInt(e.target.value))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="table-cols">Columns</Label>
                    <Input
                      id="table-cols"
                      type="number"
                      min="1"
                      max="10"
                      value={tableCols}
                      onChange={(e) => setTableCols(Number.parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={insertTable} type="button">
                    Insert Table
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <span className="w-px h-6 bg-gray-300 mx-1"></span>
            <Button variant="ghost" size="icon" onClick={() => execCommand("undo")} type="button">
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => execCommand("redo")} type="button">
              <Redo className="h-4 w-4" />
            </Button>
          </div>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="edit" className="p-4">
          <div
            ref={setEditorRef}
            contentEditable
            className="min-h-[200px] focus:outline-none"
            onInput={handleContentChange}
            onBlur={handleContentChange}
            dangerouslySetInnerHTML={{ __html: editorContent || placeholder }}
          />
        </TabsContent>
        <TabsContent value="preview" className="p-4 prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: editorContent || "<p>No content to preview</p>" }} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
