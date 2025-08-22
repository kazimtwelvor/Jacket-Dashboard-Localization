"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { TipTapEditor } from "@/components/ui/tiptap-editor"
import { PlusIcon, X } from "lucide-react"

interface FAQItem {
  id: string
  icon: string
  question: string
  answer: string
  listItems?: string[]
}

interface FAQSectionProps {
  isEditing?: boolean
  title: string
  description: string
  faqs: FAQItem[]
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onFAQChange: (id: string, field: string, value: string) => void
  onFAQListItemChange: (id: string, index: number, value: string) => void
  onAddFAQListItem: (id: string) => void
  onRemoveFAQListItem: (id: string, index: number) => void
  onAddFAQ: (faq: FAQItem) => void
  onRemoveFAQ: (id: string) => void
}

export const FAQSection: React.FC<FAQSectionProps> = ({
  isEditing = false,
  title,
  description,
  faqs,
  onTitleChange,
  onDescriptionChange,
  onFAQChange,
  onFAQListItemChange,
  onAddFAQListItem,
  onRemoveFAQListItem,
  onAddFAQ,
  onRemoveFAQ,
}) => {
  // Split FAQs into left and right columns
  const leftColumnFAQs = faqs.slice(0, Math.ceil(faqs.length / 2))
  const rightColumnFAQs = faqs.slice(Math.ceil(faqs.length / 2))

  // Function to handle FAQ toggle
  const handleFAQToggle = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isEditing) return

    const faqItem = e.currentTarget.closest(".faq-item")
    if (faqItem) {
      faqItem.classList.toggle("active")
    }
  }

  return (
    <>
      {isEditing && (
        <div className="space-y-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>FAQ Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="faq-title">Section Title</Label>
                  <Input
                    id="faq-title"
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder="Enter section title"
                  />
                </div>
                <div>
                  <Label htmlFor="faq-description">Section Description</Label>
                  <Textarea
                    id="faq-description"
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    placeholder="Enter section description"
                    rows={2}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">FAQ Items</h3>
                  <Button
                    onClick={() => {
                      const newId = `faq${faqs.length + 1}`
                      const newFaq = {
                        id: newId,
                        icon: "❓",
                        question: "New Question",
                        answer: "Add your answer here",
                        listItems: [],
                      }
                      onAddFAQ(newFaq)
                    }}
                    size="sm"
                    variant="outline"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add FAQ
                  </Button>
                </div>

                {faqs.map((faq, index) => (
                  <Card key={faq.id} className="p-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">FAQ #{index + 1}</h4>
                        {faqs.length > 1 && (
                          <Button onClick={() => onRemoveFAQ(faq.id)} size="sm" variant="destructive">
                            Remove
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`faq-icon-${faq.id}`}>Icon (emoji)</Label>
                          <Input
                            id={`faq-icon-${faq.id}`}
                            value={faq.icon}
                            onChange={(e) => onFAQChange(faq.id, "icon", e.target.value)}
                            placeholder="Enter icon (emoji)"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`faq-question-${faq.id}`}>Question</Label>
                          <Input
                            id={`faq-question-${faq.id}`}
                            value={faq.question}
                            onChange={(e) => onFAQChange(faq.id, "question", e.target.value)}
                            placeholder="Enter question"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor={`faq-answer-${faq.id}`}>Answer</Label>
                        <Textarea
                          id={`faq-answer-${faq.id}`}
                          value={faq.answer}
                          onChange={(e) => onFAQChange(faq.id, "answer", e.target.value)}
                          placeholder="Enter answer"
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>List Items (Optional)</Label>
                          <Button onClick={() => onAddFAQListItem(faq.id)} size="sm" variant="outline">
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Add Item
                          </Button>
                        </div>

                        {faq.listItems && faq.listItems.length > 0 ? (
                          <div className="space-y-2">
                            {faq.listItems.map((item, itemIndex) => (
                              <div key={itemIndex} className="flex gap-2">
                                <Input
                                  value={item}
                                  onChange={(e) => onFAQListItemChange(faq.id, itemIndex, e.target.value)}
                                  placeholder={`List item ${itemIndex + 1}`}
                                />
                                <Button
                                  onClick={() => onRemoveFAQListItem(faq.id, itemIndex)}
                                  size="icon"
                                  variant="destructive"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No list items added. Add items for bullet points.
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="faq-section">
        <div className="container">
          <h2 className="premium-title text-center">{title}</h2>
          <p className="premium-description text-center">{description}</p>

          <div className="faq-grid">
            {/* Left Column */}
            <div className="faq-column">
              <div className="faq-accordion">
                {leftColumnFAQs.map((faq) => (
                  <div key={faq.id} className="faq-item">
                    <div className="faq-header" onClick={handleFAQToggle}>
                      <span className="faq-icon">{faq.icon}</span>
                      <h3>{faq.question}</h3>
                      <span className="faq-toggle">+</span>
                    </div>
                    <div className="faq-content">
                      <p>{faq.answer}</p>
                      {faq.listItems && faq.listItems.length > 0 && (
                        <ul className="faq-list">
                          {faq.listItems.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div className="faq-column">
              <div className="faq-accordion">
                {rightColumnFAQs.map((faq) => (
                  <div key={faq.id} className="faq-item">
                    <div className="faq-header" onClick={handleFAQToggle}>
                      <span className="faq-icon">{faq.icon}</span>
                      <h3>{faq.question}</h3>
                      <span className="faq-toggle">+</span>
                    </div>
                    <div className="faq-content">
                      <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                      {faq.listItems && faq.listItems.length > 0 && (
                        <ul className="faq-list">
                          {faq.listItems.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* FAQ Section Styles */
        .faq-section {
          padding: 6rem 0;
          background: linear-gradient(135deg, #fff 0%, var(--light-orange) 100%);
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .text-center {
          text-align: center;
        }

        .premium-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--dark-orange);
          margin-bottom: 1rem;
        }

        .premium-description {
          font-size: 1.2rem;
          color: var(--medium-orange);
          margin-bottom: 2rem;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
        }

        .faq-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
          margin-top: 4rem;
        }

        .faq-column {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .faq-item {
          background: white;
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(254, 114, 36, 0.1);
          transition: all 0.3s ease;
          border: 1px solid rgba(254, 114, 36, 0.1);
        }

        .faq-item:hover {
          box-shadow: 0 10px 15px -3px rgba(254, 114, 36, 0.2);
          transform: translateY(-2px);
        }

        .faq-header {
          display: flex;
          align-items: center;
          padding: 1.5rem;
          cursor: pointer;
          background: white;
          gap: 1rem;
        }

        .faq-icon {
          width: 40px;
          height: 40px;
          background: var(--gradient-orange, linear-gradient(135deg, #ff7e00, #ff4800));
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.2rem;
          flex-shrink: 0;
        }

        .faq-header h3 {
          flex: 1;
          margin: 0;
          font-size: 1.1rem;
          color: var(--dark-orange, #ff4800);
          font-weight: 600;
        }

        .faq-toggle {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--light-orange, #fff2e5);
          border-radius: 6px;
          color: var(--primary-orange, #ff7e00);
          font-weight: bold;
          transition: all 0.3s ease;
        }

        .faq-item.active .faq-toggle {
          transform: rotate(45deg);
          background: var(--primary-orange, #ff7e00);
          color: white;
        }

        .faq-content {
          padding: 0 1.5rem;
          max-height: 0;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .faq-item.active .faq-content {
          padding: 0 1.5rem 1.5rem;
          max-height: 1000px;
        }

        .faq-list {
          list-style: none;
          padding: 0;
          margin: 1rem 0;
        }

        .faq-list li {
          position: relative;
          padding-left: 1.5rem;
          margin-bottom: 0.75rem;
          color: #4a5568;
        }

        .faq-list li::before {
          content: "•";
          color: var(--primary-orange, #ff7e00);
          position: absolute;
          left: 0;
          font-weight: bold;
        }

        /* Responsive Design */
        @media (max-width: 992px) {
          .faq-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .faq-section {
            padding: 4rem 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .faq-header {
            flex-direction: column;
            text-align: center;
          }

          .faq-toggle {
            margin-top: 1rem;
          }
        }

        /* Define CSS variables */
        :root {
          --light-orange: #fff2e5;
          --medium-orange: #ff7e00;
          --primary-orange: #ff7e00;
          --dark-orange: #ff4800;
          --gradient-orange: linear-gradient(135deg, #ff7e00, #ff4800);
        }
      `}</style>
    </>
  )
}
