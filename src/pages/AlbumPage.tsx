import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Album } from "../context/AlbumContext";
import AlbumViewer from "../components/AlbumViewer";
import Header from "../components/Header";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const AlbumPage: React.FC = () => {
  const { albumId } = useParams<{ albumId: string }>();
  const [album, setAlbum] = useState<Album | null>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(true);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");

  // Load the album from localStorage
  useEffect(() => {
    const loadAlbum = () => {
      const savedAlbums = localStorage.getItem("albums");
      if (savedAlbums) {
        const albums: Album[] = JSON.parse(savedAlbums);
        const foundAlbum = albums.find(a => a.id === albumId);
        if (foundAlbum) {
          setAlbum(foundAlbum);
        } else {
          setError("Album not found");
          toast.error("Album not found");
        }
      } else {
        setError("No albums found");
        toast.error("No albums found");
      }
    };

    loadAlbum();
  }, [albumId]);

  const handleVerifyPassword = () => {
    if (album && password === album.password) {
      setIsAuthenticated(true);
      setIsPasswordDialogOpen(false);
      toast.success("Access granted");
    } else {
      setError("Incorrect password");
      toast.error("Incorrect password");
    }
  };

  if (!album) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-bold mb-4">
              {error || "Loading album..."}
            </h2>
            <Button asChild>
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Return to Home
              </Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
            <DialogContent className="sm:max-w-md w-[90%] mx-auto">
              <DialogHeader>
                <DialogTitle>Enter Album Password</DialogTitle>
                <DialogDescription>
                  This album is protected. Please enter the password to view it.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-4">
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleVerifyPassword();
                    }
                  }}
                  className="col-span-3"
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button onClick={handleVerifyPassword} className="bg-purple hover:bg-purple-dark">
                  View Album
                </Button>
                <div className="text-center mt-2">
                  <Button variant="ghost" asChild>
                    <Link to="/" className="text-sm text-gray-500">
                      Return to Home
                    </Link>
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow py-4 md:py-8 px-2 md:px-4">
        <div className="container mx-auto">
          <div className="mb-4 md:mb-6">
            <Button asChild variant="ghost" className="mb-4 md:mb-6 text-xs md:text-sm" size="sm">
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="h-3 w-3 md:h-4 md:w-4" />
                Return to Home
              </Link>
            </Button>
          </div>
          <AlbumViewer />
        </div>
      </main>
      <footer className="py-3 md:py-4 text-center text-xs md:text-sm text-gray-500 bg-white border-t">
        <p>Album Uploader &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default AlbumPage;
