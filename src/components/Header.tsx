import React from "react";
import { Images, Album } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAlbum } from "../context/AlbumContext";

const Header: React.FC = () => {
  const { setCurrentStep } = useAlbum();

  const handleMyAlbumsClick = () => {
    setCurrentStep("albumsList");
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentStep("upload")}>
          <Images className="h-6 w-6 text-purple" />
          <h1 className="text-xl font-bold text-gray-800">Album Uploader</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500 hidden md:block">Create beautiful digital albums</div>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1" 
            onClick={handleMyAlbumsClick}
          >
            <Album className="h-4 w-4" />
            <span>My Albums</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
