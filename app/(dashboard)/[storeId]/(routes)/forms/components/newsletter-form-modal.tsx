"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface NewsletterFormModalProps {
  isOpen: boolean
  onClose: () => void
}

export const NewsletterFormModal = ({ isOpen, onClose }: NewsletterFormModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    preferences: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Newsletter form submitted:", formData)
    onClose()
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add New Newsletter Subscription</DialogTitle>
          <DialogDescription>
            Create a new newsletter subscription
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="preferences">Preferences</Label>
            <Select value={formData.preferences} onValueChange={(value) => handleChange("preferences", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select preferences" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily updates</SelectItem>
                <SelectItem value="weekly">Weekly updates</SelectItem>
                <SelectItem value="monthly">Monthly updates</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}