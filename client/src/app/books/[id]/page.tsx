"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { BookIcon, User, MapPin, Phone, Edit, Trash2, ArrowLeft, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { getCurrentUser } from "@/lib/auth"
import type { Book } from "@/types"
import { stringToColor, formatPhoneNumber, isBookOwner } from "@/lib/utils"
import { toast } from "sonner"

export default function BookDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
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
        const response = await api.get<{ book: Book }>(`/books/${id}`)
        setBook(response.book)
        const currentUser = getCurrentUser()
        if (currentUser) {
          setIsOwner(isBookOwner(response.book.ownerId, currentUser.id))
        }
      } catch (error) {
        console.error("Failed to fetch book:", error)
        toast.error("Book not found or has been removed")
        router.push("/books")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBook()
  }, [id, router])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await api.delete(`/books/${id}`)
      toast.success("Book deleted successfully")
      router.push("/dashboard")
    } catch (error) {
      console.error("Error deleting book:", error)
      toast.error("Failed to delete book")
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const handleRequestBook = async () => {
    setRequestingBook(true)
    try {
      await api.post(`/books/${id}/request`, {})
      toast.success("Book request sent successfully")
      const response = await api.get<{ book: Book }>(`/books/${id}`)
      setBook(response.book)
    } catch (error: any) {
      console.error("Error requesting book:", error)
      if (error.response?.status === 404) {
        toast.error("Book not found or unavailable for request")
      } else {
        toast.error("Failed to request book")
      }
    } finally {
      setRequestingBook(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <BookIcon className="h-16 w-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Book Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The book you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/books">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Books
          </Link>
        </Button>
      </div>
    )
  }

  const statusLabel = book.status === "available" ? "Available" : "Currently Rented"

  return (
    <div className="max-w-screen-xl mx-auto px-4">
      <div className="py-4">
        <Button variant="ghost" size="sm" asChild className="group">
          <Link href="/books" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Books
          </Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div
            className="aspect-[3/4] rounded-md flex items-center justify-center p-6 text-white"
            style={{ backgroundColor: book.coverColor || stringToColor(book.title) }}
          >
            <div className="text-center">
              <BookIcon className="h-16 w-16 mx-auto mb-4" />
              <h2 className="font-bold text-2xl">{book.title}</h2>
              <p className="mt-2">by {book.author}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <Badge variant="outline" className="px-3 py-1">
              {book.genre}
            </Badge>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
            <p className="text-xl text-muted-foreground">by {book.author}</p>
            <div className="mt-4">
              <Badge
                className={`px-3 py-1 ${
                  book.status === "available"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                }`}
              >
                {statusLabel}
              </Badge>
            </div>
          </div>

          <Card className="mb-6">
            <CardHeader className="pb-2">
              <h3 className="text-lg font-semibold">Book Information</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 mr-3 text-muted-foreground">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Status</p>
                  <p className="text-muted-foreground">
                    {book.status === "available" ? "Available for borrowing" : "Currently being borrowed"}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 mr-3 text-muted-foreground">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-muted-foreground">{book.location}</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 mr-3 text-muted-foreground">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Owner</p>
                  <p className="text-muted-foreground">Book Owner</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 mr-3 text-muted-foreground">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Contact</p>
                  <p className="text-muted-foreground">{formatPhoneNumber(book.contactInfo)}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              {isOwner ? (
                <div className="flex w-full gap-4">
                  <Button variant="outline" asChild className="flex-1">
                    <Link href={`/books/edit/${id}`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Book
                    </Link>
                  </Button>
                  <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)} className="flex-1">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Book
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full py-2"
                  disabled={book.status !== "available" || requestingBook}
                  onClick={handleRequestBook}
                >
                  {requestingBook ? "Sending Request..." : "Request This Book"}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Book</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {book.title}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}