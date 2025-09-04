"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface SatisfactionBannerProps {
  isEditing?: boolean
  heading: string
  highlightedText: string
  endText: string
  subtext: string
  emailLabel: string
  emailValue: string
  phoneLabel: string
  phoneValue: string
  onHeadingChange: (value: string) => void
  onHighlightedTextChange: (value: string) => void
  onEndTextChange: (value: string) => void
  onSubtextChange: (value: string) => void
  onEmailLabelChange: (value: string) => void
  onEmailValueChange: (value: string) => void
  onPhoneLabelChange: (value: string) => void
  onPhoneValueChange: (value: string) => void
}

export const SatisfactionBanner: React.FC<SatisfactionBannerProps> = ({
  isEditing = false,
  heading,
  highlightedText,
  endText,
  subtext,
  emailLabel,
  emailValue,
  phoneLabel,
  phoneValue,
  onHeadingChange,
  onHighlightedTextChange,
  onEndTextChange,
  onSubtextChange,
  onEmailLabelChange,
  onEmailValueChange,
  onPhoneLabelChange,
  onPhoneValueChange,
}) => {
  const [particlesCreated, setParticlesCreated] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined" && !isEditing && !particlesCreated) {
      createParticles()
      setParticlesCreated(true)
    }
  }, [isEditing, particlesCreated])

  const createParticles = () => {
    const particles = document.querySelector(".particles")
    if (!particles) return

    const particleCount = 20

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div")
      particle.className = "particle"

      const size = Math.random() * 2 + 2
      particle.style.width = `${size}px`
      particle.style.height = `${size}px`

      particle.style.left = `${Math.random() * 100}%`
      particle.style.top = `${Math.random() * 100}%`

      const duration = Math.random() * 20 + 10
      const delay = Math.random() * -20

      particle.style.animation = `float ${duration}s ${delay}s infinite`

      particles.appendChild(particle)
    }
  }

  return (
    <>
      {isEditing ? (
        <div className="space-y-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Satisfaction Banner Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="banner-heading">Heading Start</Label>
                  <Input
                    id="banner-heading"
                    value={heading}
                    onChange={(e) => onHeadingChange(e.target.value)}
                    placeholder="Enter heading start"
                  />
                </div>
                <div>
                  <Label htmlFor="banner-highlight">Highlighted Text</Label>
                  <Input
                    id="banner-highlight"
                    value={highlightedText}
                    onChange={(e) => onHighlightedTextChange(e.target.value)}
                    placeholder="Enter highlighted text"
                  />
                </div>
                <div>
                  <Label htmlFor="banner-end">Heading End</Label>
                  <Input
                    id="banner-end"
                    value={endText}
                    onChange={(e) => onEndTextChange(e.target.value)}
                    placeholder="Enter heading end"
                  />
                </div>
                <div>
                  <Label htmlFor="banner-subtext">Subtext</Label>
                  <Textarea
                    id="banner-subtext"
                    value={subtext}
                    onChange={(e) => onSubtextChange(e.target.value)}
                    placeholder="Enter subtext"
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email-label">Email Label</Label>
                  <Input
                    id="email-label"
                    value={emailLabel}
                    onChange={(e) => onEmailLabelChange(e.target.value)}
                    placeholder="Enter email label"
                  />
                </div>
                <div>
                  <Label htmlFor="email-value">Email Value</Label>
                  <Input
                    id="email-value"
                    value={emailValue}
                    onChange={(e) => onEmailValueChange(e.target.value)}
                    placeholder="Enter email value"
                  />
                </div>
                <div>
                  <Label htmlFor="phone-label">Phone Label</Label>
                  <Input
                    id="phone-label"
                    value={phoneLabel}
                    onChange={(e) => onPhoneLabelChange(e.target.value)}
                    placeholder="Enter phone label"
                  />
                </div>
                <div>
                  <Label htmlFor="phone-value">Phone Value</Label>
                  <Input
                    id="phone-value"
                    value={phoneValue}
                    onChange={(e) => onPhoneValueChange(e.target.value)}
                    placeholder="Enter phone value"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="banner-container">
        <div className="banner-wrapper">
          <div className="orange-line"></div>
          <div className="banner-content">
            <div className="text-content">
              <h1 className="banner-heading">
                {heading}
                <br />
                <span className="highlight">{highlightedText}</span> {endText}
              </h1>
              <p className="banner-subtext">{subtext}</p>
              <div className="contact-wrapper">
                <div className="contact-box">
                  <div className="contact-label">{emailLabel}</div>
                  <div className="contact-value">{emailValue}</div>
                </div>
                <div className="contact-box">
                  <div className="contact-label">{phoneLabel}</div>
                  <div className="contact-value">{phoneValue}</div>
                </div>
              </div>
            </div>
            <div className="stamp-container">
              <div className="stamp">
                <div className="stamp-text">
                  <div className="stamp-top">★ PREMIUM QUALITY ★</div>
                  <div className="stamp-main">LOW</div>
                  <div className="stamp-main">PRICES</div>
                  <div className="stamp-bottom">EVERYDAY</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="particles"></div>
      </div>

      <style jsx>{`
        .banner-container {
          position: relative;
          background-color: #141a32;
          overflow: hidden;
          height: 400px;
        }

        .banner-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          height: 100%;
          display: flex;
          position: relative;
        }

        .orange-line {
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 70%;
          background-color: #FF4800;
        }

        .banner-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          padding-left: 40px;
          height: 100%;
        }

        .text-content {
          max-width: 700px;
        }

        .banner-heading {
          font-size: 2.5rem;
          font-weight: 700;
          color: white;
          line-height: 1.2;
          margin-bottom: 1rem;
        }

        .highlight {
          color: #FF4800;
        }

        .banner-subtext {
          color: white;
          font-size: 1rem;
          line-height: 1.5;
          margin-bottom: 1.5rem;
          max-width: 600px;
        }

        .contact-wrapper {
          display: flex;
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          overflow: hidden;
          max-width: 400px;
        }

        .contact-box {
          padding: 12px 20px;
          flex: 1;
        }

        .contact-box:first-child {
          border-right: 1px solid rgba(255, 255, 255, 0.1);
        }

        .contact-label {
          color: #FF8A47;
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 4px;
        }

        .contact-value {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.85rem;
        }

        .stamp-container {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stamp {
          width: 180px;
          height: 180px;
          border-radius: 50%;
          border: 2px solid #FF4800;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          animation: pulse 3s infinite;
        }

        .stamp::before {
          content: '';
          position: absolute;
          top: -5px;
          left: -5px;
          right: -5px;
          bottom: -5px;
          border-radius: 50%;
          border: 1px solid rgba(255, 72, 0, 0.3);
          animation: pulse 3s infinite 0.5s;
        }

        .stamp-text {
          text-align: center;
          color: #FF4800;
          transform: rotate(-8deg);
        }

        .stamp-top {
          font-size: 0.6rem;
          margin-bottom: 5px;
        }

        .stamp-main {
          font-size: 2.2rem;
          font-weight: 800;
          line-height: 0.9;
          letter-spacing: 1px;
        }

        .stamp-bottom {
          font-size: 1.4rem;
          font-weight: 700;
          margin-top: 5px;
        }

        .particles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .particle {
          position: absolute;
          background-color: #FF4800;
          border-radius: 50%;
          opacity: 0.5;
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 10px rgba(255, 72, 0, 0.5);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 20px rgba(255, 72, 0, 0.8);
            transform: scale(1.05);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @media (max-width: 768px) {
          .banner-container {
            height: auto;
            padding: 40px 0;
          }

          .banner-content {
            flex-direction: column;
            padding-left: 20px;
          }

          .orange-line {
            height: 80%;
          }

          .text-content {
            margin-bottom: 30px;
          }

          .banner-heading {
            font-size: 2rem;
          }

          .stamp {
            width: 150px;
            height: 150px;
          }

          .stamp-main {
            font-size: 1.8rem;
          }

          .stamp-bottom {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </>
  )
}
