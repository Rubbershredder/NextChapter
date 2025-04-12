"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { getBookById, updateBook } from "@/lib/api";

const bookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  genre: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  contactInfo: z.string().min(1, "Contact information is required"),
  status: z.enum(["available", "rented"]),
  imageUrl: z.string().optional(),
});

type BookFormValues = z.infer<typeof bookSchema>;

export default function EditBookPage({ params }: { params: { id: string } }) {
  const { token, user, isOwner } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: "",
      author: "",
      genre: "",
      location: "",
      contactInfo: "",
      status: "available",
      imageUrl: "",
    },
  });
  
  useEffect(() => {
    const fetchBook = async () => {
      if (!token) return;
      
      try {
        const book = await getBookById(params.id);
        
        // Check if the user is the owner of the book
        if (book.ownerId !== user?.id) {
          toast.error("Unauthorized", {
            description: "You can only edit your own books",
          });
          router.push("/dashboard");
          return;
        }
        
        // Reset form with book data
        reset({
          title: book.title,
          author: book.author,
          genre: book.genre || "",
          location: book.location,
          contactInfo: book.contactInfo,
          status: book.status as "available" | "rented",
          imageUrl: book.imageUrl || "",
        });
      } catch (error) {
        console.error("Error fetching book:", error);
        toast.error("Error", {
          description: "Failed to load book details.",
        });
        router.push("/dashboard");
      } finally {
        setInitialLoading(false);
      }
    };
    
    fetchBook();
  }, [params.id, token, user, toast, router, reset]);
  
  const onSubmit = async (data: BookFormValues) => {
    if (!token || !isOwner) {
      toast.error("Unauthorized", {
        description: "You must be logged in as a book owner to edit books",
      });
      router.push("/login");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await updateBook(params.id, data, token);
      toast.success("Success", {
        description: "Book has been updated successfully",
      });
      router.push(`/books/${params.id}`);
    } catch (error) {
      console.error("Error updating book:", error);
      toast.error("Error", {
        description: "Failed to update book. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (initialLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p>Loading book details...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Edit Book</CardTitle>
            <CardDescription>
              Update your book listing
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title*</Label>
                <Input
                  id="title"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="author">Author*</Label>
                <Input
                  id="author"
                  {...register("author")}
                />
                {errors.author && (
                  <p className="text-sm text-red-500">{errors.author.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="genre">Genre</Label>
                <Input
                  id="genre"
                  {...register("genre")}
                />
                {errors.genre && (
                  <p className="text-sm text-red-500">{errors.genre.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status*</Label>
                <Select
                  onValueChange={(value) => setValue("status", value as "available" | "rented")}
                  defaultValue="available"
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="rented">Rented</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-red-500">{errors.status.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location*</Label>
                <Input
                  id="location"
                  placeholder="City, State"
                  {...register("location")}
                />
                {errors.location && (
                  <p className="text-sm text-red-500">{errors.location.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactInfo">Contact Information*</Label>
                <Textarea
                  id="contactInfo"
                  placeholder="Phone number, email, or preferred method of contact"
                  {...register("contactInfo")}
                />
                {errors.contactInfo && (
                  <p className="text-sm text-red-500">{errors.contactInfo.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Book Image URL</Label>
                <Input
                  id="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  {...register("imageUrl")}
                />
                {errors.imageUrl && (
                  <p className="text-sm text-red-500">{errors.imageUrl.message}</p>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push(`/books/${params.id}`)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}