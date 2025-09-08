"use client"

import { Bell } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export const Notifications = () => {
  const [isOpen, setIsOpen] = useState(false)

  const notifications = [
    {
      id: "1",
      title: "New order received",
      description: "Order #12345 has been placed",
      time: "5 minutes ago",
      read: false,
    },
    {
      id: "2",
      title: "Product out of stock",
      description: "Red T-shirt is now out of stock",
      time: "1 hour ago",
      read: true,
    },
    {
      id: "3",
      title: "New review",
      description: "A customer left a 5-star review",
      time: "2 hours ago",
      read: true,
    },
  ]

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Notifications</h4>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-blue-500">
                Mark all as read
              </Button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto space-y-2">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-md ${notification.read ? "bg-background" : "bg-muted"}`}
                >
                  <div className="flex justify-between items-start">
                    <h5 className="font-medium text-sm">{notification.title}</h5>
                    <span className="text-xs text-muted-foreground">{notification.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{notification.description}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-center text-muted-foreground py-4">No notifications</p>
            )}
          </div>
          {notifications.length > 0 && (
            <Button variant="outline" size="sm" className="w-full">
              View all notifications
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
