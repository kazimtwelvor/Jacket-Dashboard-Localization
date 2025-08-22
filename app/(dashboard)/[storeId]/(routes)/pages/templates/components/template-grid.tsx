import { TemplateCard } from "./template-card"

interface Template {
  id: string
  title: string
  description: string
  imageUrl: string
}

interface TemplateGridProps {
  templates: Template[]
  storeId: string
}

export const TemplateGrid = ({ templates, storeId }: TemplateGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          id={template.id}
          title={template.title}
          description={template.description}
          imageUrl={template.imageUrl}
          storeId={storeId}
        />
      ))}
    </div>
  )
}
