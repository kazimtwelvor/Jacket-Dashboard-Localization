"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface TemplateCardProps {
  id: string
  title: string
  description: string
  imageUrl: string
  storeId: string
}

export const TemplateCard = ({ id, title, description, imageUrl, storeId }: TemplateCardProps) => {
  const router = useRouter()

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="aspect-video relative overflow-hidden">
        <Image src={imageUrl || "/placeholder.svg?height=300&width=400"} alt={title} fill className="object-cover" />
      </div>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-x-2">
          <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">Responsive</div>
          <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">Modern</div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => router.push(`/${storeId}/pages/templates/${id}`)} className="w-full">
          Use Template
        </Button>
      </CardFooter>
    </Card>
  )
}
