"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { createBook } from "@/lib/api";

// Schema
const bookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  genre: z.string(), 
  location: z.string().min(1, "Location is required"),
  contactInfo: z.string().min(1, "Contact information is required"),
  imageUrl: z.string(), 
});
// Types
type BookFormValues = z.infer<typeof bookSchema>;

export default function AddBookPage() {
  const { token, isOwner } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: "",
      author: "",
      genre: "", // Change this to an empty string
      location: "",
      contactInfo: "",
      imageUrl: "", // Change this to an empty string
    },
  });

  const onSubmit = async (data: BookFormValues) => {
    if (!token || !isOwner) {
      toast.error("Unauthorized", {
        description: "You must be logged in as a book owner to add books.",
      });
      router.push("/login");
      return;
    }

    setIsLoading(true);

    try {
      await createBook(data, token);
      toast.success("Book added", {
        description: "The book has been successfully added.",
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Error adding book:", error);
      toast.error("Failed to add book", {
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Add New Book</CardTitle>
            <CardDescription>Share a book from your collection</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title*</Label>
                <Input id="title" {...register("title")} />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              {/* Author */}
              <div className="space-y-2">
                <Label htmlFor="author">Author*</Label>
                <Input id="author" {...register("author")} />
                {errors.author && (
                  <p className="text-sm text-red-500">{errors.author.message}</p>
                )}
              </div>

              {/* Genre */}
              <div className="space-y-2">
                <Label htmlFor="genre">Genre</Label>
                <Input id="genre" {...register("genre")} />
                {errors.genre && (
                  <p className="text-sm text-red-500">{errors.genre.message}</p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location*</Label>
                <Input
                  id="location"
                  placeholder="City, State"
                  {...register("location")}
                />
                {errors.location && (
                  <p className="text-sm text-red-500">
                    {errors.location.message}
                  </p>
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                <Label htmlFor="contactInfo">Contact Information*</Label>
                <Textarea
                  id="contactInfo"
                  placeholder="How can others reach you?"
                  {...register("contactInfo")}
                />
                {errors.contactInfo && (
                  <p className="text-sm text-red-500">
                    {errors.contactInfo.message}
                  </p>
                )}
              </div>

              {/* Image URL */}
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL (optional)</Label>
                <Input
                  id="imageUrl"
                  placeholder="https://example.com/book.jpg"
                  {...register("imageUrl")}
                />
                {errors.imageUrl && (
                  <p className="text-sm text-red-500">
                    {errors.imageUrl.message}
                  </p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Book"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
