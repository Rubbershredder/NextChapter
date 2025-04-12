"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { getAllBooks } from "@/lib/api";
import { Book } from "@/types";

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    title: "",
    location: "",
    genre: "",
  });
  
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const data = await getAllBooks(filters);
      setBooks(data);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchBooks();
  }, []);
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBooks();
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Browse Available Books</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Search by title"
              value={filters.title}
              onChange={handleFilterChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              placeholder="Search by location"
              value={filters.location}
              onChange={handleFilterChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="genre">Genre</Label>
            <Input
              id="genre"
              name="genre"
              placeholder="Search by genre"
              value={filters.genre}
              onChange={handleFilterChange}
            />
          </div>
          
          <div className="flex items-end">
            <Button type="submit" className="w-full">Search Books</Button>
          </div>
        </form>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading books...</p>
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No books found</h2>
          <p className="text-gray-500">Try adjusting your search filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {books.map((book) => (
            <Link key={book.id} href={`/books/${book.id}`}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{book.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><span className="font-medium">Author:</span> {book.author}</p>
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
    </div>
  );
}