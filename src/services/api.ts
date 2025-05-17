import axios from 'axios';
import { Album } from '../context/AlbumContext';
import { UploadedImage } from './cloudinaryService';

// Configure axios instance with base URL
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interface for API responses
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string | string[];
  count?: number;
}

// Album API functions
export const albumApi = {
  // Get all albums
  getAllAlbums: async (): Promise<Album[]> => {
    try {
      const response = await apiClient.get<ApiResponse<Album[]>>('/albums');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching albums:', error);
      throw error;
    }
  },

  // Get album by ID (public info only)
  getAlbumById: async (id: string): Promise<Album> => {
    try {
      const response = await apiClient.get<ApiResponse<Album>>(`/albums/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching album ${id}:`, error);
      throw error;
    }
  },

  // Verify album password and get full album details
  verifyAlbumPassword: async (id: string, password: string): Promise<Album> => {
    try {
      const response = await apiClient.post<ApiResponse<Album>>(`/albums/${id}/verify`, { password });
      return response.data.data;
    } catch (error) {
      console.error(`Error verifying album ${id}:`, error);
      throw error;
    }
  },

  // Create a new album
  createAlbum: async (albumData: {
    name: string;
    photographer: string;
    password: string;
    coverPhoto: UploadedImage;
    images: UploadedImage[];
  }): Promise<Album> => {
    try {
      const response = await apiClient.post<ApiResponse<Album>>('/albums', albumData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating album:', error);
      throw error;
    }
  },

  // Delete an album
  deleteAlbum: async (id: string, password: string): Promise<void> => {
    try {
      await apiClient.delete<ApiResponse<{}>>(`/albums/${id}`, {
        data: { password }
      });
    } catch (error) {
      console.error(`Error deleting album ${id}:`, error);
      throw error;
    }
  }
};

export default apiClient; 