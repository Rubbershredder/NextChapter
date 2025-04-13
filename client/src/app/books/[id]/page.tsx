"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Book as BookIcon, User, MapPin, Phone, 
  Tag, Edit, Trash2, ArrowLeft, CheckCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog"
import { api } from "@/lib/api"
import {  getCurrentUser } from "@/lib/auth"
import { Book } from "@/types"
import { stringToColor, formatPhoneNumber, isBookOwner } from "@/lib/utils"
import { toast } from "sonner"

export default function BookDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [book, setBook] = useState<Book | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [requestingBook, setRequestingBook] = useState(false)

  useEffect(() => {
    const fetchBook = async () => {
      setIsLoading(true)
      try {
        const response = await api.get<{book: Book}>(`/books/${params.id}`)
        setBook(response.book)
        
        const currentUser = getCurrentUser()
        if (currentUser) {
          setIsOwner(isBookOwner(response.book.ownerId, currentUser.id))
        }
      } catch (error) {
        console.error("Failed to fetch book:", error)
        toast.error("Book not found or has been removed")
        router.push('/books')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBook()
  }, [params.id, router])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await api.delete(`/books/${params.id}`)
      toast.success("Book deleted successfully")
      router.push('/dashboard')
    } catch (error) {
      toast.error("Failed to delete book")
      console.error("Error deleting book:", error)
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const handleRequestBook = async () => {
    setRequestingBook(true)
    try {
      // This would be your actual booking/request API call
      await api.post(`/books/${params.id}/request`, {})
      toast.success("Book request sent successfully")
      // Refresh the book data to show updated status
      const response = await api.get<{book: Book}>(`/books/${params.id}`)
      setBook(response.book)
    } catch (error) {
      toast.error("Failed to request book")
      console.error("Error requesting book:", error)
    } finally {
      setRequestingBook(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="container py-8 flex flex-col items-center justify-center min-h-[60vh]">
        <BookIcon className="h-16 w-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Book Not Found</h1>
        <p className="text-muted-foreground mb-4">The book you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Button asChild>
          <Link href="/books">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Books
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/books">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Books
          </Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Book Cover/Image */}
        <div className="md:col-span-1">
          <div 
            className="h-80 rounded-lg bg-gradient-to-b flex items-center justify-center p-6 text-white"
            style={{ backgroundColor: stringToColor(book.title) }}
          >
            <div className="text-center">
              <BookIcon className="h-12 w-12 mx-auto mb-4" />
              <h2 className="font-bold text-xl">{book.title}</h2>
              <p className="mt-2">by {book.author}</p>
            </div>
          </div>
        </div>

        {/* Book Details */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
            <p className="text-xl text-muted-foreground">by {book.author}</p>
            <div className="flex items-center mt-4">
              <Tag className="h-4 w-4 mr-2 text-blue-500" />
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium dark:bg-blue-900/30 dark:text-blue-400">
                {book.genre}
              </span>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <h3 className="font-semibold">Book Information</h3>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-muted-foreground">{book.location}</p>
                </div>
              </div>
              <div className="flex items-start">
                <User className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                <div>
                  <p className="font-medium">Owner</p>
                  <p className="text-muted-foreground">Book Owner</p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                <div>
                  <p className="font-medium">Contact</p>
                  <p className="text-muted-foreground">{formatPhoneNumber(book.contactInfo)}</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                <div>
                  <p className="font-medium">Status</p>
                  <p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      book.status === 'available' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {book.status === 'available' ? 'Available' : 'Rented'}
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              {isOwner ? (
                <>
                  <Button variant="outline" asChild>
                    <Link href={`/books/edit/${book.id}`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Book
                    </Link>
                  </Button>
                  <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Book
                  </Button>
                </>
              ) : (
                <Button 
                  className="w-full" 
                  disabled={book.status !== 'available' || requestingBook}
                  onClick={handleRequestBook}
                >
                  {requestingBook ? "Sending Request..." : "Request This Book"}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Book</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {book.title}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}