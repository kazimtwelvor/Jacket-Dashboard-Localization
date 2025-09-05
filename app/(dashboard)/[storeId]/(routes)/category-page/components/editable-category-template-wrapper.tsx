"use client"

import { useState, useEffect } from "react"
import { EditableCategoryTemplate } from "../../categories/[categoryId]/components/editable-category-template"
import { UseFormReturn } from "react-hook-form"

interface EditableCategoryTemplateWrapperProps {
  form: UseFormReturn<any>
}

export const EditableCategoryTemplateWrapper: React.FC<EditableCategoryTemplateWrapperProps> = ({ form }) => {
  const [processedForm, setProcessedForm] = useState<UseFormReturn<any>>(form)
  
  useEffect(() => {
    console.log('Current form values:', {
      categoryContent: form.getValues('categoryContent'),
      contentType: typeof form.getValues('categoryContent')
    });
    
    const wrappedForm = {
      ...form,
      getValues: (path?: any) => {
        if (path === "categoryContent") {
          const value = form.getValues(path);
          console.log('Getting categoryContent:', value, 'type:', typeof value);
          return value;
        }
        return form.getValues(path);
      },
      setValue: (name: any, value: any, options?: any) => {
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