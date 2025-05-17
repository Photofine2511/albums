import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAlbum, Album } from "../context/AlbumContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Lock, User, Album as AlbumIcon } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Album name must be at least 2 characters.",
  }),
  photographer: z.string().min(2, {
    message: "Photographer name must be at least 2 characters.",
  }),
  password: z.string().min(4, {
    message: "Password must be at least 4 characters.",
  }),
});

const AlbumDetails: React.FC = () => {
  const { uploadedImages, coverPhoto, addAlbum, setCurrentStep, setCurrentAlbum } = useAlbum();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      photographer: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!coverPhoto) {
      toast.error("Cover photo is required. Please go back and select one.");
      return;
    }

    setIsSubmitting(true);

    // Reorder images to put the cover photo first
    const reorderedImages = [
      coverPhoto,
      ...uploadedImages.filter(img => img.public_id !== coverPhoto.public_id)
    ];

    const newAlbum = {
      name: values.name,
      photographer: values.photographer,
      password: values.password,
      coverPhoto: coverPhoto,
      images: reorderedImages,
      createdAt: new Date().toISOString(),
    };

    try {
      const createdAlbum = await addAlbum(newAlbum);
      
      if (createdAlbum) {
        setCurrentAlbum(createdAlbum);
        setCurrentStep("viewAlbum");
        toast.success("Album created successfully!");
      }
    } catch (error) {
      toast.error("Failed to create album. Please try again.");
      console.error("Error creating album:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setCurrentStep("selectCover");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg mx-auto p-4"
    >
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <AlbumIcon className="h-6 w-6 text-purple" />
            Album Details
          </CardTitle>
          <CardDescription>
            Fill in the information about your album
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Album Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <AlbumIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <Input placeholder="My Vacation 2025" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Give your album a memorable name
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="photographer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Photographer Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <Input placeholder="John Smith" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Credit the photographer who took these images
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password Protection</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Set a password to protect your album from unauthorized viewers
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="submit"
                  className="bg-purple hover:bg-purple-dark text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">◌</span>
                      Creating...
                    </>
                  ) : (
                    "Create Album"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AlbumDetails;
