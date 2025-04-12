"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getBookById, deleteBook } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Book } from "@/types";

export default function BookDetailPage({ params }: { params: { id: string } }) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, token, isOwner } = useAuth();
  const router = useRouter();

  
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const data = await getBookById(params.id);
        setBook(data);
      } catch (error) {
        console.error("Error fetching book:", error);
        toast.error("Error", {
          description: "Failed to load book details.",
        });
      } finally {
        setLoading(false);
      }
    };
  
    fetchBook();
  }, [params.id]);
  
  // Delete handler
  const handleDelete = async () => {
    if (!token || !book) return;
  
    if (confirm("Are you sure you want to delete this book?")) {
      try {
        await deleteBook(book.id, token);
        toast.success("Success", {
          description: "Book has been deleted",
        });
        router.push("/dashboard");
      } catch (error) {
        console.error("Error deleting book:", error);
        toast.error("Error", {
          description: "Failed to delete book.",
        });
      }
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p>Loading book details...</p>
      </div>
    );
  }
  
  if (!book) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Book Not Found</h1>
        <Button onClick={() => router.push("/books")}>Back to Books</Button>
      </div>
    );
  }
  
  const isOwnerOfBook = user?.id === book.ownerId;
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="outline"
          className="mb-6"
          onClick={() => router.push("/books")}
        >
          ← Back to Books
        </Button>
        
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="aspect-[2/3] bg-gray-100 rounded-md flex items-center justify-center">
                {book.imageUrl ? (
                  <img
                    src={book.imageUrl}
                    alt={book.title}
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <div className="text-center p-4 text-gray-400">
                    No image available
                  </div>
                )}
              </div>
            </div>
            
            <div className="md:col-span-2 space-y-4">
              <h1 className="text-3xl font-bold">{book.title}</h1>
              <p className="text-xl">{book.author}</p>
              
              <div className="border-t border-b py-4 space-y-2">
                {book.genre && (
                  <div className="flex">
                    <span className="font-medium w-32">Genre:</span>
                    <span>{book.genre}</span>
                  </div>
                )}
                
                <div className="flex">
                  <span className="font-medium w-32">Status:</span>
                  <span className="capitalize">{book.status}</span>
                </div>
                
                <div className="flex">
                  <span className="font-medium w-32">Location:</span>
                  <span>{book.location}</span>
                </div>
              </div>
              
              <div className="space-y-4 pt-4">
                <h2 className="text-xl font-semibold">Contact Information</h2>
                <p>{book.contactInfo}</p>
                
                {isOwnerOfBook && isOwner && (
                  <div className="flex space-x-4 mt-8">
                    <Button onClick={() => router.push(`/books/edit/${book.id}`)}>
                      Edit Book
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                      Delete Book
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}