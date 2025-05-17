import React from "react";
import { useAlbum } from "../context/AlbumContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const CoverSelector: React.FC = () => {
  const { uploadedImages, setUploadedImages, setCoverPhoto, setCurrentStep } = useAlbum();

  const handleSelectCover = (selectedIndex: number) => {
    const updatedImages = uploadedImages.map((img, idx) => ({
      ...img,
      isCover: idx === selectedIndex,
    }));

    const selectedCover = updatedImages[selectedIndex];

    setUploadedImages(updatedImages);
    setCoverPhoto(selectedCover);
    setCurrentStep("albumDetails");
    toast.success("Cover photo selected. Please enter album details.");
  };

  const handleBack = () => {
    setCurrentStep("upload");
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-center mb-2">Select Cover Photo</h2>
        <p className="text-center text-gray-600">
          Choose the main image for your album
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {uploadedImages.map((image, index) => (
          <motion.div
            key={image.public_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`relative group cursor-pointer rounded-lg overflow-hidden
              ${image.isCover ? "ring-4 ring-purple ring-offset-2" : ""}
            `}
            onClick={() => handleSelectCover(index)}
          >
            <div className="aspect-square">
              <img
                src={image.secure_url}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <div className={`absolute inset-0 bg-black bg-opacity-40 
              ${image.isCover ? 'opacity-70' : 'opacity-0 group-hover:opacity-100'} 
              flex items-center justify-center transition-opacity`}>
              <Check className="text-white w-8 h-8" />
            </div>
            {image.isCover && (
              <div className="absolute top-2 right-2 bg-purple text-white text-xs py-1 px-2 rounded-full">
                Cover
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Button
          variant="outline"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Upload
        </Button>
      </div>
    </div>
  );
};

export default CoverSelector;
