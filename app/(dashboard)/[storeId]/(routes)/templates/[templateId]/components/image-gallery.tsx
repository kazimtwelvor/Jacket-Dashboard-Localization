"use client"

import type React from "react"
import { useState } from "react"
import { X } from "lucide-react"

interface ImageGalleryProps {
  images: Array<{
    url: string
    caption?: string
  }>
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative aspect-square cursor-pointer group"
            onClick={() => setSelectedImage(index)}
          >
            <img
              src={image.url}
              alt={image.caption || `Gallery image ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Modal for full-size image view */}
      {selectedImage !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={images[selectedImage].url}
              alt={images[selectedImage].caption || `Gallery image ${selectedImage + 1}`}
              className="w-full h-auto rounded-lg"
            />
            {images[selectedImage].caption && (
              <p className="text-white text-center mt-4">{images[selectedImage].caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
