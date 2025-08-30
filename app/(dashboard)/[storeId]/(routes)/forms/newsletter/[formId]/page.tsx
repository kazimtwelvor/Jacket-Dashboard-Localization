import { NewsletterFormDetail } from "./components/newsletter-form-detail"

const NewsletterFormPage = ({ params }: { params: { formId: string } }) => {
  // Mock newsletter form data
  const newsletterForm = {
    id: params.formId,
    name: "Alice Johnson",
    email: "alice.johnson@example.com", 
    preferences: "Weekly updates",
    createdAt: "January 10th, 2024",
    type: "newsletter"
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <NewsletterFormDetail data={newsletterForm} />
    </div>
  )
}

export default NewsletterFormPage