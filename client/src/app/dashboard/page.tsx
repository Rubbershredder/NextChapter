"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Book } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Book as BookIcon, Edit, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { filterBooksByStatus, truncateText } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";
import { toast } from "sonner";

export default function DashboardPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchBooks = async () => {
      try {
        setLoading(true);
        const endpoint = user.role === "owner" ? "/books/owned" : "/rented-books";
        const response: { books: Book[] } = await api.get(endpoint);
        setBooks(response.books || []);
      } catch (error: any) {
        console.error("Error fetching books:", error);
        if (error.message === "Book not found" || error.response?.status === 404) {
          toast.info(user.role === "owner" ? "You haven't added any books yet." : "You haven't rented any books yet.");
        } else {
          toast.error("Failed to load books. Please try again later.");
        }
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [router, user]);

  const handleDeleteBook = async (bookId: string) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        await api.delete(`/books/${bookId}`);
        setBooks(books.filter(book => book.id !== bookId));
        toast.success("Book deleted successfully");
      } catch (error) {
        console.error("Error deleting book:", error);
        toast.error("Failed to delete book");
      }
    }
  };

  const availableBooks = filterBooksByStatus(books, "available");
  const rentedBooks = filterBooksByStatus(books, "rented");

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Dashboard</h1>
        {user?.role === "owner" && (
          <Button onClick={() => router.push("/books/add")}>
            Add New Book
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Books ({books.length})</TabsTrigger>
          <TabsTrigger value="available">Available ({availableBooks.length})</TabsTrigger>
          <TabsTrigger value="rented">Rented ({rentedBooks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <BookList 
            books={books} 
            userRole={user?.role || "seeker"} 
            onDelete={handleDeleteBook} 
            onEdit={(id) => router.push(`/books/edit/${id}`)}
          />
        </TabsContent>

        <TabsContent value="available">
          <BookList 
            books={availableBooks} 
            userRole={user?.role || "seeker"} 
            onDelete={handleDeleteBook} 
            onEdit={(id) => router.push(`/books/edit/${id}`)}
          />
        </TabsContent>

        <TabsContent value="rented">
          <BookList 
            books={rentedBooks} 
            userRole={user?.role || "seeker"} 
            onDelete={handleDeleteBook} 
            onEdit={(id) => router.push(`/books/edit/${id}`)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// BookList component remains unchanged
// ... (rest of the code for BookList)

interface BookListProps {
  books: Book[];
  userRole: "owner" | "seeker";
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

function BookList({ books, userRole, onDelete, onEdit }: BookListProps) {
  const router = useRouter();

  if (books.length === 0) {
    return (
      <div className="text-center py-10">
        <BookIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium">No books found</h3>
        <p className="mt-1 text-gray-500">
          {userRole === "owner" 
            ? "Add some books to your collection" 
            : "Browse available books to rent"}
        </p>
        <div className="mt-6">
          <Button 
            onClick={() => userRole === "owner" 
              ? router.push("/books/add") 
              : router.push("/books")
            }
          >
            {userRole === "owner" ? "Add a Book" : "Browse Books"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {books.map((book) => (
        <Card key={book.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="line-clamp-1">{book.title}</CardTitle>
                <CardDescription>by {book.author}</CardDescription>
              </div>
              <Badge variant={book.status === "available" ? "outline" : "secondary"}>
                {book.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>Genre:</strong> {book.genre}</div>
              <div><strong>Location:</strong> {book.location}</div>
              <div className="line-clamp-2">{truncateText(book.contactInfo, 100)}</div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <Button variant="outline" onClick={() => router.push(`/books/${book.id}`)}>
              View Details
            </Button>
            {userRole === "owner" && (
              <div className="flex space-x-2">
                <Button size="icon" variant="outline" onClick={() => onEdit(book.id)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" className="text-destructive" onClick={() => onDelete(book.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}