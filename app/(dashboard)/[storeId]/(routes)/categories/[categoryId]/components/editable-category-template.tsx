"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Tag, Truck, Award, ThumbsUp, Edit, Plus, X, Upload, GripVertical, Search } from "lucide-react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import ImageUpload from "@/components/ui/image-upload"
import TiptapEditor from "../../../products/[productId]/components/sections/general/tiptap-editor"
import type { UseFormReturn } from "react-hook-form"
import { useParams } from "next/navigation"
import axios from "axios"

interface FAQ {
  question: string
  answer: string
}

interface PopularSearch {
  term: string
  link: string
}

interface OtherCategory {
  categoryId: string
  categoryName: string
  imageUrl: string
}

interface SelectedBlog {
  blogId: string
  blogTitle: string
  blogSlug: string
}

interface Category {
  id: string
  name: string
  type: string
}

interface EditableCategoryTemplateProps {
  form: UseFormReturn<any>
}

export const EditableCategoryTemplate: React.FC<EditableCategoryTemplateProps> = ({ form }) => {
  const params = useParams()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [allCategories, setAllCategories] = useState<Category[]>([])
  
  const existingContent = form.getValues("categoryContent")
  
  let parsedContent = null
  try {
    if (existingContent) {
      if (typeof existingContent === 'string') {
        parsedContent = JSON.parse(existingContent);
      } else {
        parsedContent = existingContent;
      }
    } else {
    }
  } catch (e) {
    parsedContent = null;
  }
  
  
  const [mainContent, setMainContent] = useState<string>(parsedContent?.mainContent || `<h2>Explore Our Collection</h2>
<p>Discover our premium collection of products designed with quality and style in mind. Our carefully curated selection offers something for everyone, combining the latest trends with timeless classics.</p>
<p>Each item in our collection is crafted with attention to detail, ensuring exceptional quality and durability. We source the finest materials and work with trusted manufacturers to bring you products that exceed expectations.</p>
<p>Whether you're looking for everyday essentials or statement pieces, our range offers versatile options for every occasion. From classic designs to contemporary styles, we have something to suit every taste and preference.</p>`)
  const [learnMoreContent, setLearnMoreContent] = useState<string>(parsedContent?.learnMoreContent || `<p>Additional information about our collection.</p>
<p>This section can contain more details, specifications, or benefits.</p>`)
  const [faqs, setFaqs] = useState<FAQ[]>(parsedContent?.faqs || [
    { question: "What sizes are available?", answer: "Our collection is available in a range of sizes from XS to XXL, ensuring a perfect fit for everyone." },
    { question: "How do I care for my products?", answer: "We recommend following the care instructions on each product label for optimal longevity and to maintain the quality of your items." },
    { question: "What is your return policy?", answer: "We offer a 30-day return policy on all items. Products must be in original condition with tags attached for a full refund." },
    { question: "Do you ship internationally?", answer: "Yes, we ship to most countries worldwide. Shipping times and costs vary depending on location." }
  ])
  const [popularSearches, setPopularSearches] = useState<PopularSearch[]>(parsedContent?.popularSearches || [
    { term: "Premium Collection", link: "" },
    { term: "Affordable Options", link: "" },
    { term: "Best 2025", link: "" },
    { term: "Latest Trends", link: "" },
    { term: "Luxury Items", link: "" },
    { term: "Designer Collection", link: "" }
  ])
  const [otherCategories, setOtherCategories] = useState<OtherCategory[]>(parsedContent?.otherCategories || [])
  const [selectedBlogs, setSelectedBlogs] = useState<SelectedBlog[]>(parsedContent?.selectedBlogs || [])

  const [categoryPages, setCategoryPages] = useState<any[]>([])
  const [availableBlogs, setAvailableBlogs] = useState<any[]>([])
  const [categorySearchTerm, setCategorySearchTerm] = useState<string>("")
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoryPagesResponse = await axios.get(`/api/${params?.storeId}/category-pages`)
        const pages = categoryPagesResponse.data
        setCategoryPages(pages)
        
        const blogsResponse = await axios.get(`/api/${params?.storeId}/blog`)
        const blogs = blogsResponse.data
        setAvailableBlogs(blogs)
        
        const categoryPagesAsCategories = pages.map(page => ({
          id: page.id,
          name: page.name,
          type: 'category-page'
        }))
        
        setAllCategories(categoryPagesAsCategories)
        console.log('Available categories loaded:', categoryPagesAsCategories.length)
        
        // Update image URLs for existing selected categories
        setOtherCategories(prevCategories => {
          if (prevCategories.length === 0) return prevCategories
          
          return prevCategories.map(cat => {
            const matchingPage = pages.find(page => page.id === cat.categoryId)
            if (matchingPage?.imageUrl) {
              return { ...cat, imageUrl: matchingPage.imageUrl }
            }
            return cat
          })
        })
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    if (params.storeId) {
      fetchData()
    }
  }, [params.storeId])

  const categoryName = form.watch("name") || "Category"
  const categoryDescription = form.watch("description") || "Discover our premium collection of products designed with quality and style in mind."

  // Filter categories based on search term
  const filteredCategories = allCategories.filter(category =>
    category.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
  )

  const addFaq = () => {
    setFaqs([...faqs, { question: "", answer: "" }])
  }

  const removeFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index))
  }

  const updateFaq = (index: number, field: keyof FAQ, value: string) => {
    const updated = [...faqs]
    updated[index][field] = value
    setFaqs(updated)
  }

  const addPopularSearch = () => {
    setPopularSearches([...popularSearches, { term: "", link: "" }])
  }

  const removePopularSearch = (index: number) => {
    setPopularSearches(popularSearches.filter((_, i) => i !== index))
  }

  const updatePopularSearch = (index: number, field: keyof PopularSearch, value: string) => {
    const updated = [...popularSearches]
    updated[index][field] = value
    setPopularSearches(updated)
  }

  const toggleCategory = (category: Category, checked: boolean) => {
    if (checked) {
      const matchingPage = categoryPages.find(page => page.id === category.id)
      const imageUrl = matchingPage?.imageUrl || ""
      setOtherCategories([...otherCategories, {
        categoryId: category.id,
        categoryName: category.name,
        imageUrl: imageUrl
      }])
    } else {
      setOtherCategories(otherCategories.filter(c => c.categoryId !== category.id))
    }
  }

  const updateCategoryImage = (categoryId: string, imageUrl: string) => {
    const updated = otherCategories.map(cat => 
      cat.categoryId === categoryId ? { ...cat, imageUrl } : cat
    )
    setOtherCategories(updated)
  }

  const moveCategory = (fromIndex: number, toIndex: number) => {
    const updated = [...otherCategories]
    const [movedCategory] = updated.splice(fromIndex, 1)
    updated.splice(toIndex, 0, movedCategory)
    setOtherCategories(updated)
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index

    if (sourceIndex === destinationIndex) return

    moveCategory(sourceIndex, destinationIndex)
  }

  const toggleBlog = (blog: any, checked: boolean) => {
    if (checked) {
      setSelectedBlogs([...selectedBlogs, {
        blogId: blog.id,
        blogTitle: blog.title,
        blogSlug: blog.slug
      }])
    } else {
      setSelectedBlogs(selectedBlogs.filter(b => b.blogId !== blog.id))
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Category Page Template</CardTitle>
            <CardDescription>Preview and edit your category page content</CardDescription>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit Content
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Category Content</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="content">Main Content</TabsTrigger>
                  <TabsTrigger value="learnmore">Learn More</TabsTrigger>
                  <TabsTrigger value="faqs">FAQs</TabsTrigger>
                  <TabsTrigger value="searches">Popular Searches</TabsTrigger>
                  <TabsTrigger value="blogs">Select Blogs</TabsTrigger>
                  <TabsTrigger value="categories">Related Pages</TabsTrigger>
                </TabsList>
                
                <TabsContent value="content" className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Main Content</Label>
                    <p className="text-sm text-muted-foreground mb-4">Edit the main content section that appears in the "Explore Our Collection" area</p>
                    <TiptapEditor
                      value={mainContent}
                      onChange={setMainContent}
                      placeholder="Enter the main content for your category page..."
                      disabled={false}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="learnmore" className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Learn More Section</Label>
                    <p className="text-sm text-muted-foreground mb-4">Edit the content that appears when users click "Learn more about our category"</p>
                    <TiptapEditor
                      value={learnMoreContent}
                      onChange={setLearnMoreContent}
                      placeholder="Enter additional information about your category..."
                      disabled={false}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="faqs" className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">FAQ Section</h3>
                    {faqs.map((faq, index) => (
                      <div key={index} className="border p-4 rounded-lg space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 space-y-4">
                            <div>
                              <Label>Question</Label>
                              <Input
                                value={faq.question}
                                onChange={(e) => updateFaq(index, "question", e.target.value)}
                                placeholder="Enter FAQ question"
                              />
                            </div>
                            <div>
                              <Label>Answer</Label>
                              <TiptapEditor
                                value={faq.answer}
                                onChange={(value) => updateFaq(index, "answer", value)}
                                placeholder="Enter FAQ answer..."
                                disabled={false}
                              />
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFaq(index)}
                            className="ml-2"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button onClick={addFaq} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add FAQ
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="searches" className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Popular Searches</h3>
                    {popularSearches.map((search, index) => (
                      <div key={index} className="border p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <div>
                              <Label>Search Term</Label>
                              <Input
                                value={search.term}
                                onChange={(e) => updatePopularSearch(index, "term", e.target.value)}
                                placeholder="Enter search term"
                              />
                            </div>
                            <div>
                              <Label>Link</Label>
                              <Input
                                value={search.link}
                                onChange={(e) => updatePopularSearch(index, "link", e.target.value)}
                                placeholder="Enter link URL"
                              />
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePopularSearch(index)}
                            className="ml-2"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button onClick={addPopularSearch} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Popular Search
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="blogs" className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Select Blogs</h3>
                    <p className="text-sm text-muted-foreground mb-4">Choose existing blogs to feature on this category page</p>
                    
                    <div className="space-y-4">
                      {availableBlogs.map((blog) => {
                        const isSelected = selectedBlogs.some(b => b.blogId === blog.id)
                        
                        return (
                          <div key={blog.id} className="border p-4 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`blog-${blog.id}`}
                                checked={isSelected}
                                onCheckedChange={(checked) => toggleBlog(blog, checked as boolean)}
                              />
                              <div className="flex-1">
                                <Label htmlFor={`blog-${blog.id}`} className="font-medium">
                                  {blog.title || 'Untitled Blog'}
                                </Label>
                                {blog.slug && (
                                  <p className="text-sm text-muted-foreground">/{blog.slug}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      
                      {availableBlogs.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No blogs available. Create some blogs first to feature them here.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="categories" className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Related Category Pages</h3>
                    <p className="text-sm text-muted-foreground mb-4">Select other category pages to feature on this page. You can reorder them by dragging.</p>
                    
                    {/* Selected Categories with Sorting */}
                    {otherCategories?.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-md font-medium mb-3">Selected Categories (Drag to reorder)</h4>
                        <DragDropContext onDragEnd={handleDragEnd}>
                          <Droppable droppableId="categories">
                            {(provided) => (
                              <div 
                                {...provided.droppableProps} 
                                ref={provided.innerRef}
                                className="space-y-2"
                              >
                                {otherCategories.map((category, index) => (
                                  <Draggable 
                                    key={category.categoryId} 
                                    draggableId={category.categoryId} 
                                    index={index}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={`border p-3 rounded-lg bg-gray-50 transition-shadow ${
                                          snapshot.isDragging ? 'shadow-lg' : ''
                                        }`}
                                      >
                                        <div className="flex items-center space-x-3">
                                          <div 
                                            {...provided.dragHandleProps}
                                            className="flex items-center space-x-2 cursor-move"
                                          >
                                            <GripVertical className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                                          </div>
                                          <div className="flex-1">
                                            <div className="font-medium">{category.categoryName}</div>
                                            {category.imageUrl && (
                                              <div className="mt-2">
                                                <div className="relative w-[100px] h-[100px] rounded-md overflow-hidden">
                                                  <img 
                                                    src={category.imageUrl} 
                                                    alt={category.categoryName}
                                                    className="w-full h-full object-cover"
                                                  />
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex space-x-1">
                                            {index > 0 && (
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => moveCategory(index, index - 1)}
                                                className="text-xs"
                                              >
                                                ↑
                                              </Button>
                                            )}
                                            {index < otherCategories.length - 1 && (
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => moveCategory(index, index + 1)}
                                                className="text-xs"
                                              >
                                                ↓
                                              </Button>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </DragDropContext>
                      </div>
                    )}
                    
                    {/* Available Categories to Select */}
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search categories..."
                          value={categorySearchTerm}
                          onChange={(e) => setCategorySearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Showing {filteredCategories.length} of {allCategories.length} categories
                      </div>
                      {filteredCategories.map((category) => {
                        const isSelected = otherCategories.some(c => c.categoryId === category.id)
                        const selectedCategory = otherCategories.find(c => c.categoryId === category.id)
                        
                        return (
                          <div key={category.id} className="border p-4 rounded-lg">
                            <div className="flex items-center space-x-2 mb-3">
                              <Checkbox
                                id={category.id}
                                checked={isSelected}
                                onCheckedChange={(checked) => toggleCategory(category, checked as boolean)}
                              />
                              <Label htmlFor={category.id} className="font-medium">
                                {category.name}
                              </Label>
                            </div>
                            
                            {isSelected && (
                              <div className="ml-6">
                                <Label className="text-sm">Category Image</Label>
                                <div className="mt-2">
                                  {selectedCategory?.imageUrl ? (
                                    <div className="relative w-[200px] h-[200px] rounded-md overflow-hidden">
                                      <img 
                                        src={selectedCategory.imageUrl} 
                                        alt={category.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <div className="text-sm text-muted-foreground">
                                      No image available for this category
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end mt-6 pt-4 border-t">
                <Button onClick={() => {
                  const templateData = {
                    mainContent,
                    learnMoreContent,
                    faqs,
                    popularSearches,
                    selectedBlogs,
                    otherCategories
                  }

                  const jsonString = JSON.stringify(templateData);
                  form.setValue("categoryContent", jsonString);
                  setIsModalOpen(false);
                }}>
                  Save Changes
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <section className="w-full bg-[#131a31] py-16 rounded-lg">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              <div className="lg:col-span-2">
                <h2 className="text-3xl font-bold mb-6 text-[#f3f4f6]">
                  Explore Our <span className="text-[#fd6633]">{categoryName}</span> Collection
                </h2>

                <div 
                  className="max-w-none text-[#f3f4f6] [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-4 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mb-3 [&>h4]:text-lg [&>h4]:font-medium [&>h4]:mb-2 [&>p]:mb-4 [&>ul]:mb-4 [&>ol]:mb-4 [&>li]:mb-1"
                  dangerouslySetInnerHTML={{ __html: mainContent
                    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
                    .replace(/<p>([^<]*?)(<h[1-6][^>]*>.*?<\/h[1-6]>)(.*?)<\/p>/g, (match, before, heading, after) => {
                      let result = '';
                      if (before.trim()) result += `<p>${before.trim()}</p>`;
                      result += heading;
                      if (after.trim()) result += `<p>${after.trim()}</p>`;
                      return result;
                    })
                    .replace(/(<h[1-6][^>]*>.*?<\/h[1-6]>)([^<]+)(<h[1-6][^>]*>.*?<\/h[1-6]>)/g, '$1<p>$2</p>$3')
                    .replace(/<a([^>]*?)\s+target="[^"]*"([^>]*?)>/g, '<a$1$2>')
                    .replace(/<a([^>]*?)\s+rel="[^"]*"([^>]*?)>/g, '<a$1$2>')
                    .replace(/<a([^>]*?)\s+class="[^"]*"([^>]*?)>/g, '<a$1$2>')
                  }}
                />

                <details className="mt-8">
                  <summary className="inline-flex items-center text-[#fd6633] font-medium hover:underline cursor-pointer">
                    Learn more about our {categoryName.toLowerCase()} <ArrowRight className="ml-2 h-4 w-4" />
                  </summary>
                  <div 
                    className="mt-4 text-[#f3f4f6] max-w-none [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-4 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mb-3 [&>h4]:text-lg [&>h4]:font-medium [&>h4]:mb-2 [&>p]:mb-4 [&>ul]:mb-4 [&>ol]:mb-4 [&>li]:mb-1"
                    dangerouslySetInnerHTML={{ __html: learnMoreContent }}
                  />
                </details>
              </div>

              <div className="bg-[#131a31] p-6 rounded-lg border border-[#fd6633]/20">
                <h3 className="text-xl font-bold mb-4 text-[#f3f4f6]">Why Choose Our {categoryName}</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="bg-[#fd6633]/10 p-2 rounded-full mr-4">
                      <Award className="h-5 w-5 text-[#fd6633]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-[#f3f4f6]">Premium Quality</h4>
                      <p className="text-sm text-[#f3f4f6]/80">Crafted with the finest materials for exceptional durability</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-[#fd6633]/10 p-2 rounded-full mr-4">
                      <Tag className="h-5 w-5 text-[#fd6633]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-[#f3f4f6]">Competitive Pricing</h4>
                      <p className="text-sm text-[#f3f4f6]/80">Exceptional value without compromising on quality</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-[#fd6633]/10 p-2 rounded-full mr-4">
                      <Truck className="h-5 w-5 text-[#fd6633]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-[#f3f4f6]">Fast Shipping</h4>
                      <p className="text-sm text-[#f3f4f6]/80">Quick delivery to your doorstep with care</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-[#fd6633]/10 p-2 rounded-full mr-4">
                      <ThumbsUp className="h-5 w-5 text-[#fd6633]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-[#f3f4f6]">Customer Satisfaction</h4>
                      <p className="text-sm text-[#f3f4f6]/80">Thousands of happy customers trust our products</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-[#131a31] p-8 rounded-lg border border-[#fd6633]/20">
              <h3 className="text-2xl font-bold mb-6 text-[#f3f4f6]">Frequently Asked Questions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {faqs.map((faq, index) => (
                  <div key={index}>
                    <h4 className="font-medium text-lg text-[#f3f4f6] mb-2">{faq.question}</h4>
                    <div 
                      className="text-[#f3f4f6] max-w-none [&>h1]:text-xl [&>h1]:font-bold [&>h1]:mb-3 [&>h2]:text-lg [&>h2]:font-bold [&>h2]:mb-3 [&>h3]:text-base [&>h3]:font-semibold [&>h3]:mb-2 [&>h4]:text-sm [&>h4]:font-medium [&>h4]:mb-2 [&>p]:mb-3 [&>ul]:mb-3 [&>ol]:mb-3 [&>li]:mb-1"
                      dangerouslySetInnerHTML={{ __html: faq.answer }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12">
              <h3 className="text-lg font-medium text-[#f3f4f6] mb-4">Popular Searches</h3>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((search, index) => (
                  search.link ? (
                    <a
                      key={index}
                      href={search.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#fd6633]/20 hover:bg-[#fd6633]/30 px-3 py-1 rounded-full text-sm text-[#f3f4f6] transition-colors cursor-pointer"
                    >
                      {search.term}
                    </a>
                  ) : (
                    <span
                      key={index}
                      className="bg-[#fd6633]/20 px-3 py-1 rounded-full text-sm text-[#f3f4f6] opacity-70"
                    >
                      {search.term}
                    </span>
                  )
                ))}
              </div>
            </div>

            {selectedBlogs.length > 0 && (
              <div className="mt-12">
                <h3 className="text-2xl font-bold mb-6 text-[#f3f4f6]">Featured Blogs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {selectedBlogs.map((blog, index) => (
                    <div key={index} className="bg-[#131a31] p-6 rounded-lg border border-[#fd6633]/20 hover:border-[#fd6633]/40 transition-colors">
                      <h4 className="font-medium text-[#f3f4f6] mb-2">{blog.blogTitle}</h4>
                      <p className="text-sm text-[#f3f4f6]/80 mb-4">Read our latest insights and tips</p>
                      <a 
                        href={`/blogs/${blog.blogSlug}`}
                        className="inline-flex items-center text-[#fd6633] hover:underline text-sm font-medium"
                      >
                        Read More <ArrowRight className="ml-1 h-3 w-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {otherCategories.length > 0 && (
              <div className="mt-12">
                <h3 className="text-2xl font-bold mb-6 text-[#f3f4f6]">Related Category Pages</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {otherCategories.map((category, index) => (
                    <div key={index} className="bg-[#131a31] p-4 rounded-lg border border-[#fd6633]/20 hover:border-[#fd6633]/40 transition-colors">
                      {category.imageUrl && (
                        <div className="aspect-square mb-3 rounded-lg overflow-hidden">
                          <img 
                            src={category.imageUrl} 
                            alt={category.categoryName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <h4 className="font-medium text-[#f3f4f6] text-center">{category.categoryName}</h4>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </CardContent>
    </Card>
  )
}