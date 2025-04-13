import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, Book, Share2, Search } from "lucide-react"

export default function HomePage() {
  return (
    <div className="max-w-screen-xl mx-auto px-4">
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Share Books, Share Stories, Share Knowledge</h1>
                <p className="text-gray-500 dark:text-gray-400 md:text-xl">
                  BookShare brings booklovers together by making it easy to share and borrow books in your community.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg">
                  <Link href="/books">
                    <Search className="mr-2 h-4 w-4" />
                    Find Books
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/register">
                    <Share2 className="mr-2 h-4 w-4" />
                    Start Sharing
                  </Link>
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center p-6">
              <div className="relative w-full max-w-md">
                <div className="absolute -left-4 -top-4 h-72 w-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob dark:bg-blue-900"></div>
                <div className="absolute -bottom-8 right-4 h-72 w-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 dark:bg-purple-900"></div>
                <div className="absolute -right-4 -top-8 h-72 w-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 dark:bg-pink-900"></div>
                <div className="relative shadow-2xl rounded-2xl p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-center mb-6">
                    <BookOpen className="h-16 w-16 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-center mb-2">How It Works</h3>
                  <ul className="space-y-4">
                    <li className="flex items-center">
                      <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-2 mr-3">
                        <Book className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-sm">List your books to share</span>
                    </li>
                    <li className="flex items-center">
                      <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-2 mr-3">
                        <Search className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-sm">Find books near you</span>
                    </li>
                    <li className="flex items-center">
                      <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-2 mr-3">
                        <Share2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-sm">Borrow and share knowledge</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Why BookShare?</h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Our platform makes it easy to connect book lovers and share the joy of reading.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 mt-12 md:grid-cols-3 md:gap-8">
            <div className="flex flex-col items-center space-y-2 border rounded-lg p-6 dark:border-gray-800">
              <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20">
                <Book className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold">Discover New Books</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Explore a diverse collection of books shared by people in your community.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 border rounded-lg p-6 dark:border-gray-800">
              <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20">
                <Share2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold">Share Your Collection</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Give your books a new life by sharing them with eager readers.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 border rounded-lg p-6 dark:border-gray-800">
              <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20">
                <Search className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold">Local Connections</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Connect with book lovers in your neighborhood and build a reading community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-blue-50 dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Start Sharing?</h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Join our community today and start sharing books with people who love reading as much as you do.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg">
                <Link href="/register">Create an Account</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/books">Browse Books</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
    </div>
  )
}