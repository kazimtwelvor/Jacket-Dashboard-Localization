"use client"
import { useCallback, useEffect, useState, useRef, forwardRef, useImperativeHandle } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Image from "@tiptap/extension-image"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import Link from "@tiptap/extension-link"
import {
  AlignRight,
  Bold,
  Italic,
  UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  Heading1,
  Heading2,
  Heading3,
  LinkIcon,
  Link2OffIcon as LinkOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface TiptapEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

interface TiptapEditorRef {
  insertImage: (url: string, link?: string) => void
  getEditor: () => any
}

const INLINE_STYLES = `
  .tiptap-editor span.inline-heading {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1f2937;
    line-height: 1.2;
    display: inline;
  }
  .tiptap-editor span.inline-subheading {
    font-size: 1.0rem;
    font-weight: 500;
    color: #374151;
    display: inline;
  }
`

const formatContent = (content: string): string => {
  if (!content) return "<p></p>"

  let cleanContent = content.trim()

  if (!cleanContent.match(/^<(p|h[1-6]|div|ul|ol|blockquote)/)) {
    cleanContent = `<p>${cleanContent}</p>`
  }

  return cleanContent
}

const TiptapEditor = forwardRef<TiptapEditorRef, TiptapEditorProps>(
  ({ value, onChange, placeholder = "Enter full product description (required)", disabled = false }, ref) => {
    const [linkUrl, setLinkUrl] = useState<string>("")
    const [linkPopoverOpen, setLinkPopoverOpen] = useState<boolean>(false)
    const linkButtonRef = useRef<HTMLButtonElement>(null)

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3, 4, 5, 6],
          },
        }),
        Underline,
        TextAlign.configure({
          types: ["paragraph", "heading", "image"],
          alignments: ["left", "center", "right"],
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: "text-primary underline",
          },
          validate: (href) => /^(https?:\/\/|\/|mailto:|tel:)/.test(href),
        }),
        Image.configure({
          HTMLAttributes: {
            class: "rounded-lg shadow-md max-w-full",
          },
          allowBase64: true,
        }),
        Placeholder.configure({
          placeholder: placeholder || "Enter full product description (required)",
        }),
      ],
      content: formatContent(value),
      editorProps: {
        attributes: {
          class: "min-h-[300px] p-3 focus:outline-none text-base",
        },
      },
      onUpdate: ({ editor }) => {
        const html = editor.getHTML()
        onChange(html)
      },
      editable: !disabled,
    })

    useImperativeHandle(ref, () => ({
      insertImage: (url: string, link?: string) => {
        if (!editor) return

        editor.commands.focus()
        
        const { state } = editor
        const isAtEnd = state.selection.$head.pos === state.doc.content.size
        if (isAtEnd) {
          editor.commands.insertContent("<p></p>")
        }

        editor.commands.insertContent(
          `<img src="${url}" alt="Product image" class="rounded-lg shadow-md max-w-full" />`,
        )

        if (link && link.trim() !== "") {
          const formattedLink = link.match(/^https?:\/\//) ? link : `https://${link}`
          editor.commands.insertContent(
            `<p><a href="${formattedLink}">View product details</a></p>`,
          )
        }

        editor.commands.insertContent("<p></p>")
      },
      getEditor: () => editor,
    }))

    const setLink = useCallback(() => {
      if (!editor) return

      const url = linkUrl.trim()
      if (url === "") {
        return
      }

      if (editor.state.selection.empty) {
        alert("Please select some text first")
        return
      }

      const fullUrl = url.match(/^https?:\/\//) ? url : `https://${url}`
      editor.chain().focus().extendMarkRange("link").setLink({ href: fullUrl }).run()
      setLinkPopoverOpen(false)
      setLinkUrl("")
    }, [editor, linkUrl])

    const removeLink = useCallback(() => {
      if (!editor) return
      if (editor.isActive("link")) {
        editor.chain().focus().unsetLink().run()
      }
    }, [editor])

    useEffect(() => {
      if (editor && value !== editor.getHTML()) {
        const formattedContent = formatContent(value)
        editor.commands.setContent(formattedContent)
      }
    }, [editor, value])

    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if ((event.ctrlKey || event.metaKey) && event.key === "k") {
          event.preventDefault()
          if (editor) {
            if (editor.isActive("link")) {
              const attrs = editor.getAttributes("link")
              setLinkUrl(attrs.href || "")
            } else {
              setLinkUrl("")
            }
            setLinkPopoverOpen(true)
          }
        }
      }

      document.addEventListener("keydown", handleKeyDown)
      return () => {
        document.removeEventListener("keydown", handleKeyDown)
      }
    }, [editor])

    if (!editor) {
      return null
    }

    return (
      <>
        <style jsx>{INLINE_STYLES}</style>
        <div className="border rounded-md overflow-hidden transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/20">
          <div className="flex flex-wrap items-center gap-1 p-1 border-b bg-muted/20">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={disabled}
              className={cn("h-8 w-8 p-0", editor.isActive("bold") && "bg-muted")}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={disabled}
              className={cn("h-8 w-8 p-0", editor.isActive("italic") && "bg-muted")}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              disabled={disabled}
              className={cn("h-8 w-8 p-0", editor.isActive("underline") && "bg-muted")}
            >
              <UnderlineIcon className="h-4 w-4" />
            </Button>

            <Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  ref={linkButtonRef}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (editor.isActive("link")) {
                      const attrs = editor.getAttributes("link")
                      setLinkUrl(attrs.href || "")
                    } else {
                      setLinkUrl("")
                    }
                    setLinkPopoverOpen(true)
                  }}
                  disabled={disabled}
                  className={cn("h-8 px-2", editor.isActive("link") && "bg-muted")}
                >
                  <LinkIcon className="h-4 w-4 mr-1" />
                  <span className="text-xs">Link</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="link-url">URL</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="link-url"
                        placeholder="https://example.com  "
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            setLink()
                          }
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Tip: Select text first, then add your link</p>
                  </div>
                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        removeLink()
                        setLinkPopoverOpen(false)
                      }}
                      disabled={!editor.isActive("link")}
                    >
                      <LinkOff className="h-4 w-4 mr-2" />
                      Remove Link
                    </Button>
                    <Button type="button" size="sm" onClick={setLink}>
                      Apply Link
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {editor.isActive("link") && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeLink}
                disabled={disabled}
                className="h-8 w-8 p-0"
              >
                <LinkOff className="h-4 w-4" />
              </Button>
            )}

            <div className="w-px h-6 bg-border mx-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                const { from, to } = editor.state.selection
                const selectedText = editor.state.doc.textBetween(from, to)
                if (selectedText.trim()) {
                  editor.chain().focus().deleteSelection().insertContent(`<h2>${selectedText.trim()}</h2>`).run()
                } else {
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
              }}
              disabled={disabled}
              className={cn("h-8 w-8 p-0", 
                editor.isActive('heading', { level: 2 }) && "bg-muted"
              )}
            >
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                const { from, to } = editor.state.selection
                const selectedText = editor.state.doc.textBetween(from, to)
                if (selectedText.trim()) {
                  editor.chain().focus().deleteSelection().insertContent(`<h3>${selectedText.trim()}</h3>`).run()
                } else {
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
              }}
              disabled={disabled}
              className={cn("h-8 w-8 p-0", 
                editor.isActive('heading', { level: 3 }) && "bg-muted"
              )}
            >
              <Heading3 className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              disabled={disabled}
              className={cn("h-8 w-8 p-0", editor.isActive("bulletList") && "bg-muted")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              disabled={disabled}
              className={cn("h-8 w-8 p-0", editor.isActive("orderedList") && "bg-muted")}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              disabled={disabled}
              className={cn("h-8 w-8 p-0", editor.isActive({ textAlign: "left" }) && "bg-muted")}
              title="Align left (also works for selected images)"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              disabled={disabled}
              className={cn("h-8 w-8 p-0", editor.isActive({ textAlign: "center" }) && "bg-muted")}
              title="Align center (also works for selected images)"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              disabled={disabled}
              className={cn("h-8 w-8 p-0", editor.isActive({ textAlign: "right" }) && "bg-muted")}
              title="Align right (also works for selected images)"
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>
          <EditorContent 
            editor={editor} 
            className="tiptap-editor min-h-[300px] [&_span.inline-heading]:font-semibold [&_span.inline-subheading]:font-medium"
          />

          <div className="px-3 py-2 text-xs text-muted-foreground border-t">
            Tip: Press <kbd className="px-1.5 py-0.5 bg-muted rounded border">Ctrl</kbd>+
            <kbd className="px-1.5 py-0.5 bg-muted rounded border">K</kbd> to add or edit links
          </div>
        </div>
      </>
    )
  },
)

TiptapEditor.displayName = "TiptapEditor"

export default TiptapEditor