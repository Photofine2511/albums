import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAlbum } from "../context/AlbumContext";
import { ArrowLeft, ArrowRight, Images, List, User, Calendar, QrCode } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import QRCodeGenerator from "./QRCodeGenerator";

const AlbumViewer: React.FC = () => {
  const { uploadedImages, currentAlbum, reset, setCurrentStep } = useAlbum();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showQRCode, setShowQRCode] = useState(false);

  // Use either the current album images or uploaded images
  const displayImages = currentAlbum ? currentAlbum.images : uploadedImages;
  
  // Reset to first image (cover photo) whenever album changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [currentAlbum]);
  
  // Get the title and metadata
  const albumName = currentAlbum?.name || "Untitled Album";
  const photographerName = currentAlbum?.photographer || "Unknown";
  const createdDate = currentAlbum?.createdAt ? format(new Date(currentAlbum.createdAt), "MMMM d, yyyy") : format(new Date(), "MMMM d, yyyy");

  const handlePrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => 
      prev === 0 ? displayImages.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => 
      prev === displayImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleCreateNewAlbum = () => {
    reset();
  };

  const handleViewAllAlbums = () => {
    setCurrentStep("albumsList");
  };

  const toggleQRCode = () => {
    setShowQRCode(prev => !prev);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-2 md:p-4">
      <div className="mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-center mb-2">{albumName}</h2>
        <div className="flex justify-center flex-wrap gap-2 md:gap-4 text-xs md:text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3 md:h-4 md:w-4" />
            {photographerName}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 md:h-4 md:w-4" />
            {createdDate}
          </div>
        </div>
      </div>

      <div className="relative w-full max-w-3xl mx-auto aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 shadow-lg">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute inset-0"
          >
            <img
              src={displayImages[currentIndex]?.secure_url}
              alt={`Album image ${currentIndex + 1}`}
              className="w-full h-full object-contain"
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-x-0 bottom-0 flex justify-between p-2 md:p-4 bg-gradient-to-t from-black/70 to-transparent">
          <Button 
            onClick={handlePrevious}
            variant="secondary" 
            size="sm"
            className="bg-white/30 backdrop-blur-sm hover:bg-white/50 text-white text-xs md:text-sm"
          >
            <ArrowLeft className="h-3 w-3 md:h-4 md:w-4" />
            <span className="ml-1 hidden sm:inline">Previous</span>
          </Button>
          <Button 
            onClick={handleNext}
            variant="secondary" 
            size="sm"
            className="bg-white/30 backdrop-blur-sm hover:bg-white/50 text-white text-xs md:text-sm"
          >
            <span className="mr-1 hidden sm:inline">Next</span>
            <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
        </div>

        <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-black/50 text-white py-1 px-2 rounded-full text-xs md:text-sm backdrop-blur-sm">
          {currentIndex + 1} / {displayImages.length}
        </div>
      </div>

      <div className="mt-4 md:mt-8 flex justify-center">
        <div className="flex flex-wrap gap-1 md:gap-3 max-w-3xl justify-center">
          {displayImages.map((image, index) => (
            <div
              key={image.public_id}
              className={`w-12 h-12 md:w-16 md:h-16 cursor-pointer rounded overflow-hidden border-2 transition-all
                ${currentIndex === index ? "border-purple scale-110" : "border-transparent opacity-70"}
              `}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
            >
              <img
                src={image.secure_url}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {currentAlbum && showQRCode && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 md:mt-8"
        >
          <QRCodeGenerator albumId={currentAlbum.id} size={window.innerWidth < 640 ? 150 : 200} />
        </motion.div>
      )}

      <div className="mt-6 md:mt-8 flex justify-center flex-wrap gap-2 md:gap-4">
        <Button 
          onClick={handleViewAllAlbums} 
          variant="outline"
          size="sm"
          className="flex items-center gap-1 md:gap-2 text-xs md:text-sm"
        >
          <List className="h-3 w-3 md:h-4 md:w-4" />
          <span>All Albums</span>
        </Button>
        
        {currentAlbum && (
          <Button
            onClick={toggleQRCode}
            variant="outline"
            size="sm"
            className={`flex items-center gap-1 md:gap-2 text-xs md:text-sm ${showQRCode ? "bg-purple/10" : ""}`}
          >
            <QrCode className="h-3 w-3 md:h-4 md:w-4" />
            <span>{showQRCode ? "Hide QR Code" : "Show QR Code"}</span>
          </Button>
        )}
        
        <Button 
          onClick={handleCreateNewAlbum} 
          size="sm"
          className="bg-purple hover:bg-purple-dark flex items-center gap-1 md:gap-2 text-xs md:text-sm"
        >
          <Images className="h-3 w-3 md:h-4 md:w-4" />
          <span>Create New Album</span>
        </Button>
      </div>
    </div>
  );
};

export default AlbumViewer;
