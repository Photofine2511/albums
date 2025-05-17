import { toast } from "sonner";
import imageCompression from "browser-image-compression";

// Updated Cloudinary configuration
const CLOUD_NAME = "dluk6cgro";
const UPLOAD_PRESET = "album_uploader"; // Using a custom upload preset name
const API_KEY = "285824994547856"; // Adding API key for proper authentication
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
}

export interface UploadedImage extends CloudinaryResponse {
  isCover?: boolean;
}

// Compression options
export const compressionOptions = {
  maxSizeMB: 5, // Compress to 5MB max
  maxWidthOrHeight: 1920, // Maintain good quality for most screens
  useWebWorker: true, // Use web worker for better performance
  initialQuality: 0.7, // Start with 70% quality
};

// Function to compress an image file
export const compressImage = async (
  file: File,
  options = compressionOptions
): Promise<File> => {
  try {
    console.log(`Compressing image: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    const compressedFile = await imageCompression(file, options);
    console.log(
      `Compressed ${file.name} from ${(file.size / 1024 / 1024).toFixed(2)}MB to ${(
        compressedFile.size / 1024 / 1024
      ).toFixed(2)}MB`
    );
    return compressedFile;
  } catch (error) {
    console.error("Compression error:", error);
    toast.error(`Failed to compress ${file.name}`);
    return file; // Return original file if compression fails
  }
};

export const uploadImage = async (file: File, onProgress?: (progress: number) => void): Promise<CloudinaryResponse | null> => {
  // First compress the image
  const compressedFile = await compressImage(file);
  
  const formData = new FormData();
  formData.append("file", compressedFile);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("cloud_name", CLOUD_NAME);
  formData.append("api_key", API_KEY);
  
  try {
    console.log("Starting upload to Cloudinary:", compressedFile.name);
    
    // Use XMLHttpRequest to track progress
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          // Calculate progress percentage (50-95%)
          // We start at 50% because compression is approximately half the work
          const progressPercent = 50 + Math.round((event.loaded / event.total) * 45);
          onProgress(progressPercent);
        }
      });
      
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const result = JSON.parse(xhr.responseText);
          console.log("Upload successful:", result.secure_url);
          if (onProgress) onProgress(100); // Mark as complete
          resolve(result);
        } else {
          const error = `Upload failed: ${xhr.statusText || "Unknown error"}`;
          console.error(error);
          reject(new Error(error));
        }
      });
      
      xhr.addEventListener("error", () => {
        reject(new Error("Network error during upload"));
      });
      
      xhr.addEventListener("abort", () => {
        reject(new Error("Upload aborted"));
      });
      
      xhr.open("POST", CLOUDINARY_URL);
      xhr.send(formData);
    });
  } catch (error) {
    toast.error(`Failed to upload ${file.name}. Please try again.`);
    console.error("Cloudinary upload error:", error);
    return null;
  }
};

export const uploadMultipleImages = async (
  files: File[],
  onProgress?: (fileIndex: number, progress: number) => void,
  onOverallProgress?: (progress: number) => void
): Promise<UploadedImage[]> => {
  console.log(`Starting upload of ${files.length} images`);
  
  const results: (CloudinaryResponse | null)[] = [];
  let completed = 0;
  
  // Process files sequentially to better track progress
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // Start with 0% for compression
    if (onProgress) onProgress(i, 0);
    if (onOverallProgress) {
      const overallPercent = Math.round((completed / files.length) * 100);
      onOverallProgress(overallPercent);
    }
    
    // Track progress for this file
    const result = await uploadImage(file, (progress) => {
      if (onProgress) onProgress(i, progress);
      
      // Update overall progress
      if (onOverallProgress) {
        // Calculate overall progress based on completed files + current file progress
        const overallPercent = Math.round(
          ((completed + progress / 100) / files.length) * 100
        );
        onOverallProgress(overallPercent);
      }
    });
    
    results.push(result);
    completed++;
  }
  
  // Final overall progress update
  if (onOverallProgress) onOverallProgress(100);
  
  // Filter out any null responses and ensure we have valid uploads
  const successfulUploads = results.filter((result): result is CloudinaryResponse => result !== null);
  
  console.log(`Successfully uploaded ${successfulUploads.length} out of ${files.length} images`);
  
  return successfulUploads.map((result) => ({
    ...result,
    isCover: false,
  }));
};
