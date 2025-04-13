"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Book, Search, Map, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/api"
import { Book as BookType, BookSearchParams } from "@/types"
import { truncateText, stringToColor } from "@/lib/utils"

// Use constants for the "all" filter values
const ALL_LOCATIONS = "all_locations"
const ALL_GENRES = "all_genres"

export default function BooksPage() {
  const router = useRouter()
  const urlSearchParams = useSearchParams()
  const initialQuery = urlSearchParams.get("q") || ""
  const initialLocation = urlSearchParams.get("location") || ALL_LOCATIONS
  const initialGenre = urlSearchParams.get("genre") || ALL_GENRES

  const [books, setBooks] = useState<BookType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchParams, setSearchParams] = useState<BookSearchParams>({
    q: initialQuery,
    location: initialLocation === ALL_LOCATIONS ? "" : initialLocation,
    genre: initialGenre === ALL_GENRES ? "" : initialGenre,
  })
  const [genres, setGenres] = useState<string[]>([])
  const [locations, setLocations] = useState<string[]>([])

  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true)
      try {
        // Create API params object without the "all" values
        const apiParams = {
          q: searchParams.q,
          location: searchParams.location,
          genre: searchParams.genre
        }
        
        const response = await api.get<{books: BookType[]}>('/books', apiParams)
        setBooks(response.books)
        
        // Extract unique genres and locations for filters
        const uniqueGenres = [...new Set(response.books.map(book => book.genre))]
        const uniqueLocations = [...new Set(response.books.map(book => book.location))]
        
        setGenres(uniqueGenres)
        setLocations(uniqueLocations)
      } catch (error) {
        console.error("Failed to fetch books:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBooks()
  }, [searchParams.q, searchParams.location, searchParams.genre])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Update URL with search params
    const params = new URLSearchParams()
    if (searchParams.q) params.set("q", searchParams.q)
    
    // Use the constants for URL params
    params.set("location", searchParams.location || ALL_LOCATIONS)
    params.set("genre", searchParams.genre || ALL_GENRES)
    
    router.push(`/books?${params.toString()}`)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSearchParams(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    // Convert "all_*" constants to empty string for API requests
    const apiValue = (value === ALL_LOCATIONS || value === ALL_GENRES) ? "" : value
    setSearchParams(prev => ({ ...prev, [name]: apiValue }))
  }

  const clearFilters = () => {
    setSearchParams({ q: "", location: "", genre: "" })
    router.push("/books")
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-4">Browse Books</h1>
          <p className="text-muted-foreground">
            Discover books available in your community or search for specific titles.
          </p>
        </div>

        {/* Search and filters */}
        <Card>
          <CardHeader>
            <CardTitle>Find Your Next Read</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    name="q"
                    placeholder="Search by title, author..."
                    className="pl-8"
                    value={searchParams.q || ""}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <Select
                    value={searchParams.location ? searchParams.location : ALL_LOCATIONS}
                    onValueChange={(value) => handleSelectChange("location", value)}
                  >
                    <SelectTrigger>
                      <div className="flex items-center">
                        <Map className="mr-2 h-4 w-4 text-gray-500" />
                        <SelectValue placeholder="Location" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_LOCATIONS}>All Locations</SelectItem>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Select
                    value={searchParams.genre ? searchParams.genre : ALL_GENRES}
                    onValueChange={(value) => handleSelectChange("genre", value)}
                  >
                    <SelectTrigger>
                      <div className="flex items-center">
                        <Tag className="mr-2 h-4 w-4 text-gray-500" />
                        <SelectValue placeholder="Genre" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_GENRES}>All Genres</SelectItem>
                      {genres.map((genre) => (
                        <SelectItem key={genre} value={genre}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" type="button" onClick={clearFilters}>
                  Clear Filters
                </Button>
                <Button type="submit">
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Books listing */}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12">
            <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No books found</h3>
            <p className="text-gray-500">
              Try adjusting your search or filters to find more books.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {books.map((book) => (
              <Link key={book.id} href={`/books/${book.id}`} className="transition-all hover:scale-[1.02]">
                <Card className="h-full flex flex-col overflow-hidden">
                  <div 
                    className="h-48 bg-gradient-to-b flex items-center justify-center p-4 text-white text-center" 
                    style={{ backgroundColor: stringToColor(book.title) }}
                  >
                    <h3 className="font-bold text-lg">{book.title}</h3>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{book.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2 flex-grow">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">by {book.author}</p>
                      <p className="text-sm text-muted-foreground">
                        {truncateText(book.genre, 30)}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 flex justify-between border-t text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <Map className="h-3 w-3 mr-1" />
                      {truncateText(book.location, 20)}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      book.status === 'available' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {book.status === 'available' ? 'Available' : 'Rented'}
                    </span>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}