import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { UploadedImage } from "../services/cloudinaryService";
import { albumApi } from "../services/api";
import { toast } from "sonner";

// Define our album type
export interface Album {
  id?: string;
  _id?: string;
  name: string;
  photographer: string;
  password: string;
  coverPhoto: UploadedImage;
  images: UploadedImage[];
  createdAt: string;
}

interface AlbumContextType {
  uploadedImages: UploadedImage[];
  setUploadedImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>;
  coverPhoto: UploadedImage | null;
  setCoverPhoto: React.Dispatch<React.SetStateAction<UploadedImage | null>>;
  currentStep: "upload" | "selectCover" | "albumDetails" | "viewAlbum" | "albumsList";
  setCurrentStep: React.Dispatch<
    React.SetStateAction<"upload" | "selectCover" | "albumDetails" | "viewAlbum" | "albumsList">
  >;
  albums: Album[];
  setAlbums: React.Dispatch<React.SetStateAction<Album[]>>;
  addAlbum: (album: Album) => Promise<Album | null>;
  deleteAlbum: (albumId: string, password: string) => Promise<boolean>;
  currentAlbum: Album | null;
  setCurrentAlbum: React.Dispatch<React.SetStateAction<Album | null>>;
  loadAlbums: () => Promise<void>;
  isLoading: boolean;
  reset: () => void;
}

const AlbumContext = createContext<AlbumContextType | undefined>(undefined);

export const useAlbum = (): AlbumContextType => {
  const context = useContext(AlbumContext);
  if (!context) {
    throw new Error("useAlbum must be used within an AlbumProvider");
  }
  return context;
};

export const AlbumProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [coverPhoto, setCoverPhoto] = useState<UploadedImage | null>(null);
  const [currentStep, setCurrentStep] = useState<
    "upload" | "selectCover" | "albumDetails" | "viewAlbum" | "albumsList"
  >("upload");
  const [albums, setAlbums] = useState<Album[]>([]);
  const [currentAlbum, setCurrentAlbum] = useState<Album | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load albums from API on initial render
  const loadAlbums = useCallback(async () => {
    try {
      setIsLoading(true);
      const albumsData = await albumApi.getAllAlbums();
      setAlbums(albumsData);
    } catch (error) {
      console.error("Failed to load albums:", error);
      toast.error("Failed to load albums. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlbums();
  }, [loadAlbums]);

  // Add a new album via API
  const addAlbum = async (album: Album): Promise<Album | null> => {
    try {
      setIsLoading(true);
      const createdAlbum = await albumApi.createAlbum(album);
      setAlbums((prevAlbums) => [...prevAlbums, createdAlbum]);
      return createdAlbum;
    } catch (error) {
      console.error("Error adding album:", error);
      toast.error("Failed to create album. Please try again.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete an album via API
  const deleteAlbum = async (albumId: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      await albumApi.deleteAlbum(albumId, password);
      setAlbums((prevAlbums) => prevAlbums.filter(album => album._id !== albumId));
      toast.success("Album deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting album:", error);
      toast.error("Failed to delete album. Please check your password and try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setUploadedImages([]);
    setCoverPhoto(null);
    setCurrentAlbum(null);
    setCurrentStep("upload");
  };

  const value = {
    uploadedImages,
    setUploadedImages,
    coverPhoto,
    setCoverPhoto,
    currentStep,
    setCurrentStep,
    albums,
    setAlbums,
    addAlbum,
    deleteAlbum,
    currentAlbum,
    setCurrentAlbum,
    loadAlbums,
    isLoading,
    reset,
  };

  return <AlbumContext.Provider value={value}>{children}</AlbumContext.Provider>;
};
