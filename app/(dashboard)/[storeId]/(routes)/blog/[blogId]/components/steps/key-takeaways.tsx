"use client"

import type React from "react"

import { ArrowRight } from 'lucide-react'
import { EditableText } from "../editable-text"

interface KeyTakeawaysProps {
  title: string
  whatYouLearned: {
    title: string
    items: string[]
  }
  nextSteps: {
    title: string
    description: string
    items: string[]
  }
  onSaveText: (field: string, value: string) => void
  openTextEditor?: () => void // Add this prop
}

export const KeyTakeaways: React.FC<KeyTakeawaysProps> = ({ 
  title, 
  whatYouLearned, 
  nextSteps, 
  onSaveText,
  openTextEditor
}) => {
  return (
    <div className="mb-10 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-8 bg-blue-400 rounded-full"></div>
        <h2 className="text-2xl font-bold text-[#0A2463]">
          {title}
        </h2>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold text-[#0A2463] mb-3">
              {whatYouLearned.title}
            </h3>
            <ul className="space-y-2">
              {whatYouLearned.items.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-400 text-white flex items-center justify-center mt-0.5 flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[#0A2463] mb-3">
              {nextSteps.title}
            </h3>
            <div className="text-gray-700 mb-4">
              {nextSteps.description}
            </div>
            <ul className="space-y-2">
              {nextSteps.items.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <ArrowRight size={16} className="text-blue-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
