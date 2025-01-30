"use client"

import { useState, useCallback, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { uploadFile, fetchPrompts } from "@/lib/api"
import { Loader2 } from "lucide-react"
import { NotificationBanner } from "@/components/ui/notification-banner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const formSchema = z.object({
  audioFile: z.instanceof(File).refine((file) => file.size <= 100000000, {
    message: "Audio file must be 5MB or less.",
  }),
  promptCategory: z.string({
    required_error: "Please select a prompt category.",
  }),
  promptSubcategory: z.string({
    required_error: "Please select a prompt subcategory.",
  }),
})

interface Prompt {
  [key: string]: string
}

interface Subcategory {
  subcategory_name: string
  subcategory_id: string
  prompts: Prompt
}

interface Category {
  category_name: string
  category_id: string
  subcategories: Subcategory[]
}

export function AudioUploadForm() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  useEffect(() => {
    fetchPrompts()
      .then((response) => {
        setCategories(response.data)
      })
      .catch((error) => {
        console.error("Error fetching prompts:", error)
        setNotification({
          type: "error",
          message: "Failed to load prompt categories. Please try again later.",
        })
      })
  }, [])

  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      setIsUploading(true)
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("No authentication token found. Please log in again.")
        }

        const response = await uploadFile(values.audioFile, values.promptCategory, values.promptSubcategory, token)

        setNotification({
          type: "success",
          message: `File ${values.audioFile.name} uploaded successfully! Job ID: ${response.job_id}`,
        })
        form.reset()
      } catch (error) {
        console.error("Error in form submission:", error)
        let errorMessage = "There was an error uploading your file. Please try again."

        if (error instanceof Error) {
          errorMessage = error.message
        }

        setNotification({
          type: "error",
          message: errorMessage,
        })
      } finally {
        setIsUploading(false)
      }
    },
    [form],
  )

  const selectedCategoryData = categories.find((cat) => cat.category_id === selectedCategory)
  const selectedSubcategoryData = selectedCategoryData?.subcategories.find(
    (sub) => sub.subcategory_id === selectedSubcategory,
  )

  return (
    <>
      {notification && (
        <NotificationBanner
          variant={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="audioFile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Audio File</FormLabel>
                <FormControl>
                  <Input type="file" accept="audio/*" onChange={(e) => field.onChange(e.target.files?.[0])} />
                </FormControl>
                <FormDescription>Upload an audio file (max 5MB)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="promptCategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prompt Category</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value)
                    setSelectedCategory(value)
                    setSelectedSubcategory(null)
                    form.setValue("promptSubcategory", "")
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.category_id} value={category.category_id}>
                        {category.category_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="promptSubcategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prompt Subcategory</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value)
                    setSelectedSubcategory(value)
                  }}
                  disabled={!selectedCategory}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subcategory" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {selectedCategoryData?.subcategories.map((subcategory) => (
                      <SelectItem key={subcategory.subcategory_id} value={subcategory.subcategory_id}>
                        {subcategory.subcategory_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {selectedSubcategoryData && (
            <Card>
              <CardHeader>
                <CardTitle>Selected Prompt</CardTitle>
                <CardDescription>Prompt details for the selected subcategory</CardDescription>
              </CardHeader>
              <CardContent>
                {Object.entries(selectedSubcategoryData.prompts).map(([key, value]) => (
                  <div key={key} className="mb-4">
                    <h4 className="font-semibold">{key}</h4>
                    <p className="text-sm text-gray-600">{value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          <Button
            type="submit"
            disabled={isUploading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload and Process"
            )}
          </Button>
        </form>
      </Form>
    </>
  )
}

