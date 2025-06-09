import React, { useState, useMemo, useEffect } from "react";
import { useAlbum, Album } from "../context/AlbumContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Album as AlbumIcon, Lock, Plus, User, Calendar, Search, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { albumApi } from "../services/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AlbumsList: React.FC = () => {
  const { albums, setCurrentAlbum, setCurrentStep, reset, loadAlbums, isLoading, deleteAlbum } = useAlbum();
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [password, setPassword] = useState("");
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [albumToDelete, setAlbumToDelete] = useState<Album | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Filter albums based on search term
  const filteredAlbums = useMemo(() => {
    return albums.filter(album => 
      album.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      album.photographer.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [albums, searchTerm]);

  // Use effect to reload albums when component mounts
  useEffect(() => {
    loadAlbums();
  }, [loadAlbums]);

  const handleCreateNewAlbum = () => {
    if (!isAdminAuthenticated) {
      setIsAdminDialogOpen(true);
      setAdminUsername("");
      setAdminPassword("");
      setAdminError("");
      return;
    }
    reset();
    setCurrentStep("upload");
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUsername === "admin@photofine.com" && adminPassword === "Varad@2511") {
      setIsAdminAuthenticated(true);
      setIsAdminDialogOpen(false);
      setAdminError("");
      reset();
      setCurrentStep("upload");
    } else {
      setAdminError("Invalid admin credentials");
    }
  };

  const handleSelectAlbum = (album: Album) => {
    setSelectedAlbum(album);
    setPasswordDialogOpen(true);
    setPassword("");
    setPasswordError(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAlbum || !password) {
      setPasswordError(true);
      return;
    }
    
    try {
      // Use the album ID from either id or _id property
      const albumId = selectedAlbum._id || selectedAlbum.id;
      if (!albumId) {
        toast.error("Invalid album ID");
        return;
      }
      
      // Verify password and get full album details
      const verifiedAlbum = await albumApi.verifyAlbumPassword(albumId, password);
      setCurrentAlbum(verifiedAlbum);
      setCurrentStep("viewAlbum");
      setPasswordDialogOpen(false);
      toast.success("Album unlocked successfully!");
    } catch (error) {
      setPasswordError(true);
      toast.error("Incorrect password!");
    }
  };

  const handleDeleteClick = (album: Album, e: React.MouseEvent) => {
    e.stopPropagation();
    setAlbumToDelete(album);
    setDeletePassword("");
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!albumToDelete || !deletePassword) {
      toast.error("Password is required to delete the album");
      return;
    }
    
    setIsDeleting(true);
    
    try {
      // Use the album ID from either id or _id property
      const albumId = albumToDelete._id || albumToDelete.id;
      if (!albumId) {
        toast.error("Invalid album ID");
        return;
      }
      
      const success = await deleteAlbum(albumId, deletePassword);
      
      if (success) {
        setDeleteDialogOpen(false);
      }
    } catch (error) {
      toast.error("Failed to delete album. Please check your password and try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-4 flex justify-center items-center py-20">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">◌</div>
          <p>Loading albums...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-center mb-2">My Albums</h2>
        <p className="text-center text-gray-600 mb-6">
          Browse and view your saved photo albums
        </p>

        {albums.length > 0 && (
          <div className="flex gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search albums by name or photographer..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              onClick={handleCreateNewAlbum}
              className="bg-purple hover:bg-purple-dark text-white whitespace-nowrap"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Album
            </Button>
          </div>
        )}

        {albums.length === 0 ? (
          <div className="text-center py-12">
            <AlbumIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-700">No Albums Yet</h3>
            <p className="text-gray-500 mb-6">
              Start by creating your first photo album
            </p>
            <Button
              onClick={handleCreateNewAlbum}
              className="bg-purple hover:bg-purple-dark text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New Album
            </Button>
          </div>
        ) : filteredAlbums.length === 0 ? (
          <div className="text-center py-12">
            <Search className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-700">No Matching Albums</h3>
            <p className="text-gray-500 mb-6">
              Try a different search term
            </p>
            <Button
              onClick={() => setSearchTerm("")}
              variant="outline"
              className="mr-2"
            >
              Clear Search
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlbums.map((album, index) => (
              <motion.div
                key={album.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow">
                  <div 
                    className="relative aspect-video overflow-hidden cursor-pointer"
                    onClick={() => handleSelectAlbum(album)}
                  >
                    <img
                      src={album.coverPhoto.secure_url}
                      alt={album.name}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center">
                      <Lock className="h-3 w-3 mr-1" />
                      Protected
                    </div>
                  </div>
                  <CardHeader className="py-4">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-lg truncate">
                        <AlbumIcon className="h-5 w-5 text-purple flex-shrink-0" />
                        <span className="truncate">{album.name}</span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2 text-sm space-y-2">
                    <div className="flex items-center text-gray-600">
                      <User className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{album.photographer}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                      {format(new Date(album.createdAt), "MMM d, yyyy")}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 pb-4 mt-auto gap-2 flex">
                    <Button
                      onClick={() => handleSelectAlbum(album)}
                      className="flex-1"
                      variant="outline"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button
                      onClick={(e) => handleDeleteClick(album, e)}
                      variant="outline" 
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" /> 
              Password Protected Album
            </DialogTitle>
            <DialogDescription>
              Enter the password to view "{selectedAlbum?.name}"
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Input
                type="password" 
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(false);
                }}
                className={passwordError ? "border-red-500" : ""}
              />
              {passwordError && (
                <p className="text-sm text-red-500">Incorrect password</p>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setPasswordDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Unlock</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Album</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>Are you sure you want to delete "{albumToDelete?.name}"? This action cannot be undone.</p>
              <div className="pt-2">
                <label className="text-sm font-medium">Enter album password to confirm deletion:</label>
                <Input
                  type="password"
                  placeholder="Password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="mt-1"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <span className="animate-spin mr-2">◌</span>
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Admin Login Required
            </DialogTitle>
            <DialogDescription>
              Enter admin credentials to create a new album.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdminLogin} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Admin Username"
                value={adminUsername}
                onChange={e => setAdminUsername(e.target.value)}
                autoFocus
              />
              <Input
                type="password"
                placeholder="Admin Password"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
              />
              {adminError && (
                <p className="text-sm text-red-500">{adminError}</p>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAdminDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Login</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AlbumsList;
