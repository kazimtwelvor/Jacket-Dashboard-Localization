"use client"

import type React from "react"
import Link from "next/link"
import { Instagram, Twitter, Facebook, Youtube, Linkedin } from "lucide-react"
import { PinIcon as Pinterest } from "lucide-react"
import { EditableText } from "./editable-text"
import { EditableImage } from "./editable-image"

interface BlogHeroSectionProps {
  title: string
  author: string
  date: string
  bannerImage: string
  category: string
  readTime: string
  socialLinks: {
    instagram: string
    twitter: string
    facebook: string
    youtube: string
    pinterest: string
    linkedin: string
  }
  onSaveText: (field: string, value: string) => void
  onSaveImage: (field: string, url: string) => void
}

export const BlogHeroSection: React.FC<BlogHeroSectionProps> = ({
  title,
  author,
  date,
  bannerImage,
  category,
  readTime,
  socialLinks,
  onSaveText,
  onSaveImage,
}) => {
  return (
    <section className="relative overflow-hidden rounded-b-3xl" style={{ backgroundColor: "#f2f2f2" }}>
      <div className="container mx-auto px-4 py-12 md:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div className="w-full md:w-3/4">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0A2463] leading-tight mb-2 w-full">
                <EditableText
                  field="title"
                  value={title}
                  onSave={onSaveText}
                  className="bg-transparent focus:outline-none focus:ring-0 border-0 p-0 w-full block"
                />
              </h1>
              <div className="text-gray-500">
                By{" "}
                <EditableText
                  field="author"
                  value={author}
                  onSave={onSaveText}
                  className="bg-transparent inline-block focus:outline-none focus:ring-0 border-0 p-0"
                  isInline={true}
                />{" "}
                |{" "}
                <EditableText
                  field="date"
                  value={date}
                  onSave={onSaveText}
                  className="bg-transparent inline-block focus:outline-none focus:ring-0 border-0 p-0"
                  isInline={true}
                />
              </div>
            </div>
            <div className="flex items-center mt-4 md:mt-0">
              <Link href={socialLinks.instagram} className="text-gray-500 hover:text-[#FF6C1A] mr-3">
                <Instagram size={20} />
              </Link>
              <Link href={socialLinks.twitter} className="text-gray-500 hover:text-[#FF6C1A] mr-3">
                <Twitter size={20} />
              </Link>
              <Link href={socialLinks.facebook} className="text-gray-500 hover:text-[#FF6C1A] mr-3">
                <Facebook size={20} />
              </Link>
              <Link href={socialLinks.youtube} className="text-gray-500 hover:text-[#FF6C1A] mr-3">
                <Youtube size={20} />
              </Link>
              <Link href={socialLinks.pinterest} className="text-gray-500 hover:text-[#FF6C1A] mr-3">
                <Pinterest size={20} />
              </Link>
              <Link href={socialLinks.linkedin} className="text-gray-500 hover:text-[#FF6C1A]">
                <Linkedin size={20} />
              </Link>
            </div>
          </div>
          <div className="relative h-[300px] md:h-[400px] rounded-xl overflow-hidden">
            <EditableImage
              field="bannerImage"
              value={bannerImage}
              onSave={onSaveImage}
              alt={title}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="flex justify-start items-center mt-4">
            <span className="bg-[#FF6C1A] text-white px-3 py-1 rounded-full text-sm font-medium mr-2">
              <EditableText
                field="category"
                value={category}
                onSave={onSaveText}
                className="bg-transparent focus:outline-none focus:ring-0 border-0 p-0 text-white"
                isInline={true}
              />
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-500 ml-2">
              <EditableText
                field="readTime"
                value={readTime}
                onSave={onSaveText}
                className="bg-transparent focus:outline-none focus:ring-0 border-0 p-0"
                isInline={true}
              />
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
