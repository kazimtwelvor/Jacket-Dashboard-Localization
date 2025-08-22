"use client"

import { useState, type KeyboardEvent } from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"

interface KeywordTagInputProps {
  form: UseFormReturn<any>
}

export const KeywordTagInput: React.FC<KeywordTagInputProps> = ({ form }) => {
  const [inputValue, setInputValue] = useState("")
  
  // Get keywords from form - for display purposes only
  const focusKeyword = form.watch("focusKeyword") || ""
  const supportingKeywords = form.watch("supportingKeywords") || []
  
  // Log keyword data
  console.log('KeywordTagInput - Current Keywords:', {
    focusKeyword,
    supportingKeywords
  })
  
  // Combine keywords for display
  const allKeywords = focusKeyword ? [focusKeyword, ...supportingKeywords] : [...supportingKeywords]
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault()
      
      const newKeyword = inputValue.trim()
      
      // If no focus keyword exists, set this as focus keyword
      if (!focusKeyword) {
        console.log('Setting focus keyword:', newKeyword)
        form.setValue("focusKeyword", newKeyword, {
          shouldValidate: true,
          shouldDirty: true,
        })
      } else if (!supportingKeywords.includes(newKeyword) && newKeyword !== focusKeyword) {
        // Otherwise add as supporting keyword if not duplicate
        console.log('Adding supporting keyword:', newKeyword)
        form.setValue("supportingKeywords", [...supportingKeywords, newKeyword], {
          shouldValidate: true,
          shouldDirty: true,
        })
      }
      
      setInputValue("")
    }
  }

  const removeKeyword = (keyword: string) => {
    console.log('Removing keyword:', keyword)
    
    // If it's the focus keyword
    if (keyword === focusKeyword) {
      console.log('Removing focus keyword')
      form.setValue("focusKeyword", "", {
        shouldValidate: true,
        shouldDirty: true,
      })
      
      // If we have supporting keywords, promote the first one to focus
      if (supportingKeywords.length > 0) {
        const [newFocus, ...restKeywords] = supportingKeywords
        console.log('Promoting supporting keyword to focus:', newFocus)
        form.setValue("focusKeyword", newFocus, {
          shouldValidate: true,
          shouldDirty: true,
        })
        form.setValue("supportingKeywords", restKeywords, {
          shouldValidate: true,
          shouldDirty: true,
        })
      }
    } else {
      // It's a supporting keyword
      console.log('Removing supporting keyword')
      form.setValue(
        "supportingKeywords",
        supportingKeywords.filter(k => k !== keyword),
        {
          shouldValidate: true,
          shouldDirty: true,
        }
      )
    }
  }

  const promoteToPrimary = (keyword: string) => {
    if (keyword === focusKeyword) return // Already primary
    
    // Remove from supporting keywords
    const newSupportingKeywords = supportingKeywords.filter(k => k !== keyword)
    
    // Add current focus keyword to supporting if it exists
    if (focusKeyword) {
      newSupportingKeywords.unshift(focusKeyword)
    }
    
    // Set new focus keyword
    form.setValue("focusKeyword", keyword, {
      shouldValidate: true,
      shouldDirty: true,
    })
    
    // Update supporting keywords
    form.setValue("supportingKeywords", newSupportingKeywords, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {allKeywords.map((keyword, index) => (
          <Badge
            key={index}
            variant={keyword === focusKeyword ? "default" : "outline"}
            className="px-3 py-1 text-sm flex items-center gap-1 cursor-pointer"
          >
            {keyword}
            {keyword !== focusKeyword && (
              <span
                className="text-xs underline ml-1 hover:text-primary"
                onClick={() => promoteToPrimary(keyword)}
                title="Make focus keyword"
              >
                promote
              </span>
            )}
            <X 
              className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive" 
              onClick={() => removeKeyword(keyword)} 
            />
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
      {allKeywords.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {focusKeyword && (
            <span>
              <span className="font-medium">Focus keyword:</span> {focusKeyword}
            </span>
          )}
          {supportingKeywords.length > 0 && (
            <span className="ml-2">
              <span className="font-medium">Additional keywords:</span> {supportingKeywords.join(", ")}
            </span>
          )}
        </div>
      )}
    </div>
  )
}