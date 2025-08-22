import { Hr, Link, Section, Text } from "@react-email/components"
import { BaseTemplate } from "./base-template"

interface AccountVerificationEmailProps {
  userName: string
  email: string
  verificationLink: string
  expiryTime: string
  storeName: string
  storeLogoUrl?: string
}

export const AccountVerificationEmail = ({
  userName,
  email,
  verificationLink,
  expiryTime,
  storeName,
  storeLogoUrl,
}: AccountVerificationEmailProps) => {
  const previewText = `Verify your email address for ${storeName}`

  return (
    <BaseTemplate previewText={previewText} storeName={storeName} storeLogoUrl={storeLogoUrl}>
      <Section>
        <Text className="text-xl">Hello {userName},</Text>

        <Text className="text-base">
          Thank you for creating an account with {storeName}. To complete your registration and verify your email
          address, please click the button below.
        </Text>

        <Section className="bg-blue-50 rounded-md p-4 my-4 border-l-4 border-blue-500">
          <Text className="text-base">This verification link will expire in {expiryTime}.</Text>
        </Section>

        <Section className="text-center mt-6">
          <Link
            href={verificationLink}
            className="bg-blue-600 text-white font-bold py-3 px-6 rounded-md no-underline inline-block"
          >
            Verify Email Address
          </Link>
        </Section>

        <Text className="text-sm mt-4">Or copy and paste this URL into your browser:</Text>
        <Text className="text-xs text-gray-500 break-all">{verificationLink}</Text>

        <Hr className="my-6" />

        <Text className="text-sm text-gray-500">
          If you did not create an account with {storeName}, you can safely ignore this email.
        </Text>
      </Section>
    </BaseTemplate>
  )
}

export default AccountVerificationEmail
