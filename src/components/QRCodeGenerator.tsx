
import React, { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download, Share } from "lucide-react";
import { toast } from "sonner";

interface QRCodeGeneratorProps {
  albumId: string;
  size?: number;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ albumId, size = 200 }) => {
  const qrRef = useRef<HTMLDivElement>(null);
  
  // Generate the URL to view the album
  const albumUrl = `${window.location.origin}/album/${albumId}`;
  
  const handleDownload = () => {
    if (!qrRef.current) return;
    
    const canvas = document.createElement("canvas");
    const svg = qrRef.current.querySelector("svg");
    
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    const img = new Image();
    img.onload = () => {
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(svgUrl);
      
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `album-${albumId}-qrcode.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      toast.success("QR code downloaded successfully");
    };
    
    img.src = svgUrl;
  };
  
  const handleShare = async () => {
    if (!navigator.share) {
      toast.error("Web Share API is not supported in your browser");
      return;
    }
    
    try {
      await navigator.share({
        title: "Album QR Code",
        text: "Scan this QR code to view the album",
        url: albumUrl,
      });
      toast.success("Shared successfully");
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        toast.error("Failed to share");
        console.error("Share error:", error);
      }
    }
  };
  
  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={qrRef} className="bg-white p-4 rounded-lg shadow-sm">
        <QRCodeSVG
          value={albumUrl}
          size={size}
          level="H"
          includeMargin={true}
          bgColor="#ffffff"
          fgColor="#000000"
        />
      </div>
      
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={handleDownload}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
        
        <Button 
          onClick={handleShare}
          className="bg-purple hover:bg-purple-dark flex items-center gap-2"
        >
          <Share className="h-4 w-4" />
          Share
        </Button>
      </div>
      
      <p className="text-sm text-gray-500 text-center mt-2">
        Scan this QR code to view the album on your mobile device
      </p>
    </div>
  );
};

export default QRCodeGenerator;
