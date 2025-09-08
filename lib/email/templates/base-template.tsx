import { Body, Container, Head, Heading, Html, Img, Link, Preview, Section, Text, Hr } from "@react-email/components"
import type { ReactNode } from "react"

interface BaseTemplateProps {
  previewText: string
  heading: string
  children: ReactNode
  footerText?: string
  storeName?: string
  storeLogoUrl?: string
}

export const BaseTemplate = ({
  previewText,
  heading,
  children,
  footerText = "© 2023 Your Store. All rights reserved.",
  storeName = "Your Store",
  storeLogoUrl = "https://via.placeholder.com/150x50",
}: BaseTemplateProps) => {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Img src={storeLogoUrl} alt={storeName} width="150" height="50" style={logoStyle} />
          </Section>

          {/* Main Content */}
          <Section style={contentStyle}>
            <Heading style={headingStyle}>{heading}</Heading>
            {children}
          </Section>

          {/* Footer */}
          <Section style={footerStyle}>
            <Hr style={hrStyle} />
            <Text style={footerTextStyle}>{footerText}</Text>
            <Text style={footerTextStyle}>
              <Link href="#" style={linkStyle}>
                Privacy Policy
              </Link>{" "}
              •
              <Link href="#" style={linkStyle}>
                {" "}
                Terms of Service
              </Link>{" "}
              •
              <Link href="#" style={linkStyle}>
                {" "}
                Unsubscribe
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const bodyStyle = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
  margin: 0,
  padding: 0,
}

const containerStyle = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  maxWidth: "600px",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
}

const headerStyle = {
  backgroundColor: "#ffffff",
  padding: "24px",
  textAlign: "center" as const,
  borderBottom: "1px solid #f0f0f0",
}

const logoStyle = {
  display: "inline-block",
}

const contentStyle = {
  padding: "32px 24px",
  backgroundColor: "#ffffff",
}

const headingStyle = {
  fontSize: "24px",
  fontWeight: "600",
  color: "#333333",
  margin: "0 0 24px",
}

const footerStyle = {
  padding: "24px",
  backgroundColor: "#f9f9f9",
  textAlign: "center" as const,
}

const footerTextStyle = {
  fontSize: "14px",
  color: "#666666",
  margin: "8px 0",
}

const hrStyle = {
  borderColor: "#e6ebf1",
  margin: "0 0 16px",
}

const linkStyle = {
  color: "#666666",
  textDecoration: "underline",
}
