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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

const AlbumContent: React.FC<{
  isAdminAuthenticated: boolean;
  openAdminDialog: () => void;
}> = ({ isAdminAuthenticated, openAdminDialog }) => {
  const { currentStep } = useAlbum();

  // Only allow album creation steps if admin is authenticated
  React.useEffect(() => {
    if ((currentStep === "upload" || currentStep === "selectCover" || currentStep === "albumDetails") && !isAdminAuthenticated) {
      openAdminDialog();
    }
  }, [currentStep, isAdminAuthenticated, openAdminDialog]);

  if ((currentStep === "upload" || currentStep === "selectCover" || currentStep === "albumDetails") && !isAdminAuthenticated) {
    return null;
  }

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
  const [isAdminDialogOpen, setIsAdminDialogOpen] = React.useState(false);
  const [adminUsername, setAdminUsername] = React.useState("");
  const [adminPassword, setAdminPassword] = React.useState("");
  const [adminError, setAdminError] = React.useState("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = React.useState(false);

  const openAdminDialog = React.useCallback(() => {
    setIsAdminDialogOpen(true);
    setAdminUsername("");
    setAdminPassword("");
    setAdminError("");
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUsername === "admin@photofine.com" && adminPassword === "Varad@2511") {
      setIsAdminAuthenticated(true);
      setIsAdminDialogOpen(false);
      setAdminError("");
    } else {
      setAdminError("Invalid admin credentials");
    }
  };

  return (
    <AlbumProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow py-8 px-4">
          <div className="container mx-auto">
            <AlbumContent isAdminAuthenticated={isAdminAuthenticated} openAdminDialog={openAdminDialog} />
          </div>
        </main>
        <footer className="py-4 text-center text-sm text-gray-500 bg-white border-t">
          <p>Album Uploader &copy; {new Date().getFullYear()}</p>
        </footer>
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
    </AlbumProvider>
  );
};

export default Index;
