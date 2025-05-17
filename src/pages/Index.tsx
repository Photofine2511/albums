
import React from "react";
import { AlbumProvider } from "../context/AlbumContext";
import { useAlbum } from "../context/AlbumContext";
import Header from "../components/Header";
import ImageUploader from "../components/ImageUploader";
import CoverSelector from "../components/CoverSelector";
import AlbumDetails from "../components/AlbumDetails";
import AlbumViewer from "../components/AlbumViewer";
import AlbumsList from "../components/AlbumsList";
import { motion } from "framer-motion";

const AlbumContent: React.FC = () => {
  const { currentStep } = useAlbum();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {currentStep === "upload" && <ImageUploader />}
      {currentStep === "selectCover" && <CoverSelector />}
      {currentStep === "albumDetails" && <AlbumDetails />}
      {currentStep === "viewAlbum" && <AlbumViewer />}
      {currentStep === "albumsList" && <AlbumsList />}
    </motion.div>
  );
};

const Index: React.FC = () => {
  return (
    <AlbumProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow py-8 px-4">
          <div className="container mx-auto">
            <AlbumContent />
          </div>
        </main>
        <footer className="py-4 text-center text-sm text-gray-500 bg-white border-t">
          <p>Album Uploader &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </AlbumProvider>
  );
};

export default Index;
