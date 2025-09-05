"use client"

import type React from "react"

import { useState, useEffect, type KeyboardEvent } from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"

interface KeywordTagInputProps {
  keywords: string[]
  onChange: (keywords: string[]) => void
}

export const KeywordTagInput: React.FC<KeywordTagInputProps> = ({ keywords = [], onChange }) => {
  const [inputValue, setInputValue] = useState("")
  const [keywordsList, setKeywordsList] = useState<string[]>(keywords)
  const form = useForm()

  useEffect(() => {
    setKeywordsList(keywords || [])
  }, [keywords])

  const handleKeywordsChange = (newKeywords: string[]) => {
    form.setValue("seo.keywords", newKeywords, {
      shouldDirty: true,
      shouldValidate: true,
    })

    form.setValue("keywords", newKeywords, {
      shouldDirty: true,
    })

  }

  useEffect(() => {
    onChange(keywordsList)
    handleKeywordsChange(keywordsList)
  }, [keywordsList, onChange])

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault()
      if (!keywordsList.includes(inputValue.trim())) {
        setKeywordsList([...keywordsList, inputValue.trim()])
        setInputValue("")
      }
    }
  }

  const removeKeyword = (index: number) => {
    const newKeywords = [...keywordsList]
    newKeywords.splice(index, 1)
    setKeywordsList(newKeywords)
  }

  const promoteToPrimary = (index: number) => {
    if (index === 0) return

    const newKeywords = [...keywordsList]
    const keyword = newKeywords[index]
    newKeywords.splice(index, 1)
    newKeywords.unshift(keyword)
    setKeywordsList(newKeywords)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {keywordsList.map((keyword, index) => (
          <Badge
            key={index}
            variant={index === 0 ? "default" : "outline"}
            className="px-3 py-1 text-sm flex items-center gap-1 cursor-pointer"
          >
            {keyword}
            {index !== 0 && (
              <span
                className="text-xs underline ml-1 hover:text-primary"
                onClick={() => promoteToPrimary(index)}
                title="Make focus keyword"
              >
                promote
              </span>
            )}
            <X className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive" onClick={() => removeKeyword(index)} />
          </Badge>
        ))}
      </div>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a keyword and press Enter"
        className="w-full"
      />
      {keywordsList.length > 0 && (
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">Focus keyword:</span> {keywordsList[0]}
          {keywordsList.length > 1 && (
            <>
              <span className="font-medium ml-2">Additional keywords:</span> {keywordsList.slice(1).join(", ")}
            </>
          )}
        </div>
      )}
    </div>
  )
}
