"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { getAllBooks } from "@/lib/api";
import { Book } from "@/types";

export default function DashboardPage() {
  const { user, token, isOwner } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchBooks = async () => {
      if (!token) return;
      
      setLoading(true);
      try {
        const allBooks = await getAllBooks();
        // Filter books for owner - only show their books
        if (isOwner && user) {
          setBooks(allBooks.filter(book => book.ownerId === user.id));
        } else {
          setBooks(allBooks);
        }
      } catch (error) {
        console.error("Error fetching books:", error);
        toast.error("Error",{
          description: "Failed to load books.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchBooks();
  }, [token, user, isOwner]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p>Loading dashboard...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        {isOwner && (
          <Button asChild>
            <Link href="/books/add">Add New Book</Link>
          </Button>
        )}
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user?.name}!</h2>
        <p className="text-gray-600">
          {isOwner
            ? "Manage your shared books or add new ones to your collection."
            : "Discover books available in your community."}
        </p>
      </div>
      
      {isOwner && (
        <>
          <h2 className="text-2xl font-semibold mb-4">My Books</h2>
          
          {books.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-500 mb-4">You haven&apos;t added any books yet.</p>
                <Button asChild>
                  <Link href="/books/add">Add Your First Book</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {books.map(book => (
                <Card key={book.id} className="h-full">
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{book.title}</CardTitle>
                    <CardDescription>{book.author}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-2">
                    {book.genre && <p><span className="font-medium">Genre:</span> {book.genre}</p>}
                    <p><span className="font-medium">Location:</span> {book.location}</p>
                    <p className="capitalize"><span className="font-medium">Status:</span> {book.status}</p>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" asChild>
                      <Link href={`/books/${book.id}`}>View</Link>
                    </Button>
                    <Button asChild>
                      <Link href={`/books/edit/${book.id}`}>Edit</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
      
      {!isOwner && (
        <>
          <h2 className="text-2xl font-semibold mb-4">Recently Added Books</h2>
          
          {books.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-500">No books available at the moment.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {books.slice(0, 6).map(book => (
                <Link key={book.id} href={`/books/${book.id}`}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{book.title}</CardTitle>
                      <CardDescription>{book.author}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-2">
                      {book.genre && <p><span className="font-medium">Genre:</span> {book.genre}</p>}
                      <p><span className="font-medium">Location:</span> {book.location}</p>
                      <p className="capitalize"><span className="font-medium">Status:</span> {book.status}</p>
                    </CardContent>
                    
                    <CardFooter>
                      <Button variant="outline" className="w-full">View Details</Button>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}