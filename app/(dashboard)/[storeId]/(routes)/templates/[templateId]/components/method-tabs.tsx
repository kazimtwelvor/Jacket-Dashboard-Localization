"use client"

import type React from "react"
import { useState } from "react"

interface MethodTabsProps {
  methods: Array<{
    title: string
    content: string
    image?: string
  }>
}

export const MethodTabs: React.FC<MethodTabsProps> = ({ methods }) => {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Methods">
          {methods.map((method, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === index
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              {method.title}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-6">
        {methods.map((method, index) => (
          <div key={index} className={activeTab === index ? "block" : "hidden"}>
            <div className="prose max-w-none">
              <p className="text-gray-600 mb-4">{method.content}</p>
              {method.image && (
                <div className="mt-4">
                  <img src={method.image} alt={method.title} className="rounded-lg max-w-full h-auto" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
