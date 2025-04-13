// src/app/books/edit/[id]/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/api"
import { BookFormData, Book } from "@/types"
import { toast } from "sonner"

const genres = [
  "Fiction", "Non-Fiction", "Science Fiction", "Fantasy", "Mystery", 
  "Thriller", "Romance", "History", "Biography", "Children",
  "Young Adult", "Science", "Technology", "Self-Help", "Other"
]

export default function EditBookPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<BookFormData>({
    title: "",
    author: "",
    genre: "",
    location: "",
    contactInfo: "",
    status: "available",
    imageUrl: "",
  })

  useEffect(() => {
    const fetchBook = async () => {
      setIsLoading(true)
      try {
        const response = await api.get<{book: Book}>(`/books/${params.id}`)
        const { ...bookData } = response.book
        setFormData(bookData as BookFormData)
      } catch (error) {
        console.error("Failed to fetch book:", error)
        toast.error("Book not found or you don't have permission to edit")
        router.push('/dashboard')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBook()
  }, [params.id, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await api.put(`/books/${params.id}`, formData)
      toast.success("Book updated successfully")
      router.push(`/books/${params.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update book")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/books/${params.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Book
          </Link>
        </Button>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Edit Book</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Book Title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  name="author"
                  placeholder="Author Name"
                  required
                  value={formData.author}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="genre">Genre</Label>
                <Select
                  value={formData.genre}
                  onValueChange={(value) => handleSelectChange("genre", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {genres.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Where is the book located"
                  required
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactInfo">Contact Information</Label>
                <Input
                  id="contactInfo"
                  name="contactInfo"
                  placeholder="Phone number or other contact"
                  required
                  value={formData.contactInfo}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value as "available" | "rented")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select availability status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="rented">Not Available</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    placeholder="Image URL or upload image"
                    value={formData.imageUrl || ""}
                    onChange={handleChange}
                  />
                  <Button type="button" variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Button variant="outline" type="button" asChild>
                <Link href={`/books/${params.id}`}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving Changes..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}