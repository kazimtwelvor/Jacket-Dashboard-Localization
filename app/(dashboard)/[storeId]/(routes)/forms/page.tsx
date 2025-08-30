import { FormsClient } from "./components/client"
import prismadb from "@/lib/prismadb"

const FormsPage = async ({ params }: { params: { storeId: string } }) => {
  // Fetch contact forms from database
  const contactForms = await prismadb.contactForm.findMany({
    where: {
      storeId: params.storeId,
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  // Fetch newsletter forms from database
  const newsletterForms = await prismadb.newsletterForm.findMany({
    where: {
      storeId: params.storeId,
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  // Format contact forms to match interface
  const formattedContactForms = contactForms.map(form => ({
    ...form,
    type: "contact" as const,
    createdAt: form.createdAt,
    status: form.status || "PENDING"
  }))

  const formattedNewsletterForms = newsletterForms.map(form => ({
    ...form,
    name: form.email, // Use email as name for display
    type: "newsletter" as const,
    createdAt: form.createdAt,
    status: form.status || "ACTIVE"
  }))

  const allForms = [...formattedContactForms, ...formattedNewsletterForms]

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <FormsClient 
        contactForms={formattedContactForms}
        newsletterForms={formattedNewsletterForms}
        allForms={allForms}
      />
    </div>
  )
}

export default FormsPage