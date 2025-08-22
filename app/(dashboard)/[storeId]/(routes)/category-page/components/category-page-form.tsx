"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useParams, useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import axios from "axios"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import ImageUpload from "@/components/ui/image-upload"
import { MaterialSelector } from "./material-selector"
import { StyleSelector } from "./style-selector"
import { ColorSelector } from "./color-selector"
import { GenderSelector } from "./gender-selector"
import { CollarSelector } from "./collar-selector"
import { CuffSelector } from "./cuff-selector"
import { ClosureSelector } from "./closure-selector"
import { PocketSelector } from "./pocket-selector"
import { SeoSettings } from "./seo-settings"
import { EditableCategoryTemplateWrapper } from "./editable-category-template-wrapper"
import { ApiSlugDisplay } from "./api-slug-display"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  apiSlug: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  bannerImageUrl: z.string().optional(),
  materials: z.array(z.string()).optional(),
  styles: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  genders: z.array(z.string()).optional(),
  collars: z.array(z.string()).optional(),
  cuffs: z.array(z.string()).optional(),
  closures: z.array(z.string()).optional(),
  pockets: z.array(z.string()).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  focusKeyword: z.string().optional(),
  supportingKeywords: z.array(z.string()).optional(),
  categoryContent: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  twitterTitle: z.string().optional(),
  twitterDescription: z.string().optional(),
  canonicalUrl: z.string().optional(),
  indexPage: z.boolean().optional(),
  followLinks: z.boolean().optional(),
  enableSchema: z.boolean().optional(),
  schemaType: z.string().optional(),
  customSchema: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
})

type CategoryPageFormValues = z.infer<typeof formSchema>

interface CategoryPageFormProps {
  initialData?: any
}

export const CategoryPageForm: React.FC<CategoryPageFormProps> = ({ initialData }) => {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  
  const processedInitialData = initialData ? {
    ...initialData,
    categoryContent: initialData.categoryContent ? 
      (typeof initialData.categoryContent === 'string' ? 
        initialData.categoryContent : 
        JSON.stringify(initialData.categoryContent)
      ) : "",
    focusKeyword: initialData.focusKeyword || "",
    supportingKeywords: initialData.supportingKeywords || [],
    apiSlug: initialData.apiSlug || "",
    ogTitle: initialData.ogTitle || "",
    ogDescription: initialData.ogDescription || "",
    twitterTitle: initialData.twitterTitle || "",
    twitterDescription: initialData.twitterDescription || "",
    canonicalUrl: initialData.canonicalUrl || "",
    indexPage: initialData.indexPage !== false,
    followLinks: initialData.followLinks !== false,
    enableSchema: initialData.enableSchema !== false,
    schemaType: initialData.schemaType || "CollectionPage",
    customSchema: initialData.customSchema || "",
    status: initialData.status || "DRAFT",
  } : null;
  
  console.log('Processed initial data:', JSON.stringify(processedInitialData));
  
  const form = useForm<CategoryPageFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: processedInitialData || {
      name: "",
      slug: "",
      apiSlug: "",
      description: "",
      imageUrl: "",
      bannerImageUrl: "",
      materials: [],
      styles: [],
      colors: [],
      genders: [],
      collars: [],
      cuffs: [],
      closures: [],
      pockets: [],
      seoTitle: "",
      seoDescription: "",
      focusKeyword: "",
      supportingKeywords: [],
      categoryContent: "",
      ogTitle: "",
      ogDescription: "",
      twitterTitle: "",
      twitterDescription: "",
      canonicalUrl: "",
      indexPage: true,
      followLinks: true,
      enableSchema: true,
      schemaType: "CollectionPage",
      customSchema: "",
      status: "DRAFT",
    }
  })
  
  // No need to clear imageUrl when other categories are selected

  const onSubmit = async (data: CategoryPageFormValues, action: 'save' | 'publish' = 'save') => {
    try {
      setLoading(true)
      
      // Generate apiSlug from selected filters
      const queryParams = [];
      
      if (data.materials && data.materials.length > 0) {
        queryParams.push(`materials=${data.materials.join(',')}`)
      }
      
      if (data.styles && data.styles.length > 0) {
        queryParams.push(`styles=${data.styles.join(',')}`)
      }
      
      if (data.colors && data.colors.length > 0) {
        queryParams.push(`colors=${data.colors.join(',')}`)
      }
      
      if (data.genders && data.genders.length > 0) {
        queryParams.push(`genders=${data.genders.join(',')}`)
      }
      
      if (data.collars && data.collars.length > 0) {
        queryParams.push(`collars=${data.collars.join(',')}`)
      }
      
      if (data.cuffs && data.cuffs.length > 0) {
        queryParams.push(`cuffs=${data.cuffs.join(',')}`)
      }
      
      if (data.closures && data.closures.length > 0) {
        queryParams.push(`closures=${data.closures.join(',')}`)
      }
      
      if (data.pockets && data.pockets.length > 0) {
        queryParams.push(`pockets=${data.pockets.join(',')}`)
      }
      
      const apiSlug = queryParams.join('&');
      const status = action === 'publish' ? 'PUBLISHED' : 'DRAFT';
      const formData = {
        name: data.name,
        slug: data.slug,
        apiSlug,
        description: data.description || "",
        imageUrl: data.imageUrl || "",
        bannerImageUrl: data.bannerImageUrl || "",
        materials: data.materials || [],
        styles: data.styles || [],
        colors: data.colors || [],
        genders: data.genders || [],
        collars: data.collars || [],
        cuffs: data.cuffs || [],
        closures: data.closures || [],
        pockets: data.pockets || [],
        seoTitle: data.seoTitle || "",
        seoDescription: data.seoDescription || "",
        focusKeyword: data.focusKeyword || "",
        supportingKeywords: data.supportingKeywords || [],
        categoryContent: data.categoryContent,
        ogTitle: data.ogTitle || "",
        ogDescription: data.ogDescription || "",
        twitterTitle: data.twitterTitle || "",
        twitterDescription: data.twitterDescription || "",
        canonicalUrl: data.canonicalUrl || "",
        indexPage: data.indexPage !== false,
        followLinks: data.followLinks !== false,
        enableSchema: data.enableSchema !== false,
        schemaType: data.schemaType || "CollectionPage",
        customSchema: data.customSchema ? (typeof data.customSchema === 'string' ? data.customSchema : JSON.stringify(data.customSchema)) : null,
        status,
        isPublished: status === 'PUBLISHED',
      }
      
      console.log('Submitting form data:', JSON.stringify(formData));
      console.log('Action type:', action);
      console.log('Status being sent:', formData.status);
      
      if (initialData && initialData.id) {
        console.log('Updating category page with ID:', initialData.id);
        try {
          const updateUrl = `/api/${params.storeId}/category-pages/${initialData.id}`;
          console.log('Update URL:', updateUrl);
          const response = await axios.patch(updateUrl, formData);
          console.log('Update response:', response.data);
          toast.success(status === 'PUBLISHED' ? "Category page published successfully" : "Category page updated successfully");
        } catch (updateError) {
          console.error('Update error details:', {
            status: updateError.response?.status,
            data: updateError.response?.data,
            message: updateError.message
          });
          throw updateError;
        }
      } else {
        try {
          const response = await axios.post(`/api/${params.storeId}/category-pages`, formData);
          console.log('Create response:', response.data);
          toast.success(status === 'PUBLISHED' ? "Category page published successfully" : "Category page created successfully");
        } catch (createError) {
          console.error('Create error details:', {
            status: createError.response?.status,
            data: createError.response?.data,
            message: createError.message
          });
          throw createError;
        }
      }
      router.refresh()
      router.push(`/${params.storeId}/category-page`) 
    } catch (error) {
      console.error("Error saving category page:", error)
      toast.error("Failed to save category page")
    } finally {
      setLoading(false)
    }
  }
  
  const handleSaveDraft = () => {
    form.handleSubmit((data) => onSubmit(data, 'save'))()
  }
  
  const handlePublish = () => {
    form.handleSubmit((data) => onSubmit(data, 'publish'))()
  }
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const slug = value
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
    form.setValue("slug", slug, { shouldValidate: true })
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="attributes">Attributes</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="template">Template</TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Category page name" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e)
                            // Auto-generate slug if slug is empty
                            if (!form.getValues("slug")) {
                              handleSlugChange(e)
                            }
                          }}
                          disabled={loading} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        URL Slug
                        <span className="ml-1 text-xs text-muted-foreground">(used in page URL)</span>
                      </FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <span className="text-sm text-muted-foreground mr-1">/category/</span>
                          <Input
                            placeholder="category-page-slug"
                            {...field}
                            onChange={handleSlugChange}
                            disabled={loading}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Category page description"
                          {...field}
                          disabled={loading}
                          className="resize-none"
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Image</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value ? [field.value] : []}
                          disabled={loading}
                          onChange={(url) => field.onChange(url)}
                          onRemove={() => field.onChange("")}
                          multiple={false}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bannerImageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Banner Image (Optional)</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value ? [field.value] : []}
                          disabled={loading}
                          onChange={(url) => field.onChange(url)}
                          onRemove={() => field.onChange("")}
                          multiple={false}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="attributes" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Category Attributes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <MaterialSelector form={form} />
                <StyleSelector form={form} />
                <ColorSelector form={form} />
                <GenderSelector form={form} />
                <CollarSelector form={form} />
                <CuffSelector form={form} />
                <ClosureSelector form={form} />
                <PocketSelector form={form} />
              </CardContent>
            </Card>
            
            {/* API Slug Display */}
            <ApiSlugDisplay apiSlug={form.watch("apiSlug")} />
          </TabsContent>
          
          <TabsContent value="seo" className="space-y-4 pt-4">
            <SeoSettings form={form} />
          </TabsContent>
          
          <TabsContent value="template" className="space-y-4 pt-4">
            <EditableCategoryTemplateWrapper form={form} />
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {initialData && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                initialData.status === 'PUBLISHED' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {initialData.status === 'PUBLISHED' ? 'Published' : 'Draft'}
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              disabled={loading}
              onClick={() => form.handleSubmit((data) => onSubmit(data, 'save'))()}
            >
              {loading ? "Saving..." : "Save as Draft"}
            </Button>
            <Button 
              type="button" 
              disabled={loading}
              onClick={() => form.handleSubmit((data) => onSubmit(data, 'publish'))()}
            >
              {loading ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}