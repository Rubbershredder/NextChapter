import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Share and discover books in your community
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          NextChapter connects book owners with readers, making knowledge accessible to everyone.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" asChild>
            <Link href="/books">Find Books</Link>
          </Button>
          
          <Button size="lg" variant="outline" asChild>
            <Link href="/register">Share Your Books</Link>
          </Button>
        </div>
      </div>
      
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Share Your Collection</h2>
          <p className="text-gray-600">
            List books you&apos;re willing to share with others in your community.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Find Rare Books</h2>
          <p className="text-gray-600">
            Discover books that might not be available in stores or libraries.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Build Community</h2>
          <p className="text-gray-600">
            Connect with fellow readers and book enthusiasts in your area.
          </p>
        </div>
      </div>
    </div>
  );
}