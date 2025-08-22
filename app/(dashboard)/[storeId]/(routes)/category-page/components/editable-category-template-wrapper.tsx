"use client"

import { useState, useEffect } from "react"
import { EditableCategoryTemplate } from "../../categories/[categoryId]/components/editable-category-template"
import { UseFormReturn } from "react-hook-form"

interface EditableCategoryTemplateWrapperProps {
  form: UseFormReturn<any>
}

export const EditableCategoryTemplateWrapper: React.FC<EditableCategoryTemplateWrapperProps> = ({ form }) => {
  // Process the categoryContent before passing it to the EditableCategoryTemplate
  const [processedForm, setProcessedForm] = useState<UseFormReturn<any>>(form)
  
  useEffect(() => {
    // Log the current form values
    console.log('Current form values:', {
      categoryContent: form.getValues('categoryContent'),
      contentType: typeof form.getValues('categoryContent')
    });
    
    // Create a wrapper around the form to handle categoryContent properly
    const wrappedForm = {
      ...form,
      getValues: (path?: any) => {
        if (path === "categoryContent") {
          const value = form.getValues(path);
          console.log('Getting categoryContent:', value, 'type:', typeof value);
          // If it's already a string, return it; otherwise stringify it
          return value;
        }
        return form.getValues(path);
      },
      setValue: (name: any, value: any, options?: any) => {
        // When setting categoryContent, ensure it's properly handled
        if (name === "categoryContent") {
          console.log("Setting categoryContent:", value, 'type:', typeof value);
        }
        return form.setValue(name, value, options);
      }
    }
    
    setProcessedForm(wrappedForm as UseFormReturn<any>)
  }, [form])
  
  return <EditableCategoryTemplate form={processedForm} />
}