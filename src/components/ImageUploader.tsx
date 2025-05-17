import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, Image, AlertCircle } from "lucide-react";
import { uploadMultipleImages } from "../services/cloudinaryService";
import { useAlbum } from "../context/AlbumContext";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FileWithStatus extends File {
  id: string;
  status: "idle" | "processing" | "complete" | "error";
}

const ImageUploader: React.FC = () => {
  const { setUploadedImages, setCurrentStep } = useAlbum();
  const [isUploading, setIsUploading] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [files, setFiles] = useState<FileWithStatus[]>([]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;
      
      setUploadError(null);

      // Validate files
      const validFiles = acceptedFiles.filter(
        (file) => file.type.startsWith("image/")
      );

      if (validFiles.length !== acceptedFiles.length) {
        toast.error("Some files are not images and were excluded");
      }

      if (!validFiles.length) {
        toast.error("Please upload image files (PNG, JPEG, etc.)");
        return;
      }

      // Initialize files with status tracking (no individual progress)
      const filesWithStatus: FileWithStatus[] = validFiles.map(file => ({
        ...file,
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        status: "idle"
      }));
      
      setFiles(filesWithStatus);
      setIsUploading(true);
      setOverallProgress(0);

      try {
        // Create array of plain Files to upload
        const filesToUpload: File[] = validFiles.map(file => file);
        
        // Update all files to processing status
        setFiles(prevFiles => 
          prevFiles.map(file => ({
            ...file,
            status: "processing"
          }))
        );
        
        // Upload all files with progress tracking
        const uploadedImages = await uploadMultipleImages(
          filesToUpload,
          (fileIndex, _progress) => {
            // We don't need to update individual file progress anymore
            // Just update the file status
            setFiles(prevFiles => 
              prevFiles.map((file, index) => 
                index === fileIndex ? { ...file, status: "processing" } : file
              )
            );
          },
          (progress) => {
            // Update overall progress
            setOverallProgress(progress);
          }
        );
        
        // Mark all files as complete
        setFiles(prevFiles => 
          prevFiles.map(file => ({
            ...file,
            status: "complete"
          }))
        );
        
        if (uploadedImages.length > 0) {
          setUploadedImages(uploadedImages);
          setCurrentStep("selectCover");
          toast.success(`Successfully uploaded ${uploadedImages.length} images`);
        } else {
          setUploadError("Failed to upload images. Please check your connection and try again.");
          toast.error("Failed to upload images");
        }
      } catch (error) {
        console.error("Upload error:", error);
        setUploadError("Something went wrong during upload. Please try again.");
        toast.error("Something went wrong during upload");
      } finally {
        setIsUploading(false);
        // We keep the files visible so user can see the results
      }
    },
    [setUploadedImages, setCurrentStep]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    disabled: isUploading,
    multiple: true
  });

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {uploadError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 transition-all cursor-pointer 
          ${isDragActive ? "bg-purple-light border-purple" : "border-gray-300 bg-gray-50 hover:bg-gray-100"}
          ${isUploading ? "pointer-events-none opacity-70" : ""}
          flex flex-col items-center justify-center h-64`}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          <Upload size={48} className="mx-auto mb-4 text-purple" />
          {isDragActive ? (
            <p className="text-lg font-medium text-purple-dark">Drop the images here...</p>
          ) : (
            <div>
              <p className="text-lg font-medium mb-2">
                Drag & drop images here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                Images will be compressed to optimize upload speed
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Overall progress */}
      {isUploading && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Overall Progress: {overallProgress}%</p>
          <Progress value={overallProgress} className="h-3" />
        </div>
      )}
      
      {/* Show only file names without individual progress bars */}
      {files.length > 0 && !isUploading && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Uploaded Files: {files.length}</h3>
          <div className="text-sm text-gray-600">
            {files.length > 0 && `${files.length} ${files.length === 1 ? 'image' : 'images'} uploaded successfully.`}
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <Button 
          className="bg-purple hover:bg-purple-dark text-white"
          disabled={isUploading}
          onClick={() => {}}
        >
          <Image className="mr-2 h-4 w-4" />
          {isUploading ? "Processing..." : "Select Images to Upload"}
        </Button>
      </div>
    </div>
  );
};

export default ImageUploader;
