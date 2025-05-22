import React, { useRef, useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download, Share, Copy } from "lucide-react";
import { toast } from "sonner";

interface QRCodeGeneratorProps {
  albumId: string;
  size?: number;
  photographerName?: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  albumId, 
  size = 200,
  photographerName = "Photographer" 
}) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  
  // Make sure we have a valid photographer name
  const displayName = photographerName && photographerName !== "Unknown" ? 
    photographerName : "Photographer";
  
  // Debug: log the photographer name we received and what we'll display
  useEffect(() => {
    console.log("QRCodeGenerator received photographerName:", photographerName);
    console.log("QRCodeGenerator will display name:", displayName);
  }, [photographerName, displayName]);
  
  // Generate the absolute URL to view the album
  const albumUrl = window.location.href.includes('localhost') 
    ? `${window.location.origin}/album/${albumId}` 
    : `${window.location.protocol}//${window.location.host}/album/${albumId}`;
  
  // Generate styled QR code with photographer name
  useEffect(() => {
    const generateStyledQR = async () => {
      if (!qrRef.current) return;
      
      const svg = qrRef.current.querySelector("svg");
      if (!svg) return;
      
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      // Create an image from the QR code SVG
      const qrImage = new Image();
      qrImage.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        
        // Set canvas size with extra padding for the text and borders
        const padding = 60;
        const totalSize = size + padding * 2;
        canvas.width = totalSize;
        canvas.height = totalSize + 40; // Extra space at bottom for text
        
        // Clear canvas
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw border
        const borderColor = "#8a2be2"; // Purple color
        ctx.fillStyle = borderColor;
        ctx.fillRect(0, 0, totalSize, padding); // Top border
        
        // Draw photographer name at the top
        ctx.font = "bold 20px Arial";
        ctx.textAlign = "center";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(displayName, totalSize / 2, padding / 2 + 8);
        
        // Draw QR code in the middle with white background - fixed positioning
        ctx.fillStyle = "#ffffff";
        // Position QR code with enough margin below the header
        const qrTop = padding + 10; // Add extra margin after the header
        ctx.fillRect(padding, qrTop, size, size);
        ctx.drawImage(qrImage, padding, qrTop, size, size);
        
        // Draw the bottom banner - adjust position based on new QR position
        const bottomBannerTop = qrTop + size + 10; // 10px gap after QR
        ctx.fillStyle = borderColor;
        ctx.fillRect(0, bottomBannerTop, totalSize, 40); // Bottom border
        
        // Add "Scan to view album" text at the bottom
        ctx.font = "16px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.fillText("Scan to view album", totalSize / 2, bottomBannerTop + 25);
        
        // Create data URL
        const dataUrl = canvas.toDataURL("image/png");
        setQrImageUrl(dataUrl);
        
        // Clean up
        URL.revokeObjectURL(svgUrl);
      };
      
      qrImage.src = svgUrl;
    };
    
    generateStyledQR();
  }, [size, displayName, albumId]);
  
  const handleDownload = () => {
    if (!qrImageUrl) return;
    
    const downloadLink = document.createElement("a");
    downloadLink.href = qrImageUrl;
    downloadLink.download = `${displayName}-album-qrcode.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    toast.success("QR code downloaded successfully");
  };
  
  const handleShare = async () => {
    if (!navigator.share) {
      // Fallback for browsers that don't support the Web Share API
      try {
        await navigator.clipboard.writeText(albumUrl);
        toast.success("Album URL copied to clipboard");
      } catch (error) {
        toast.error("Couldn't copy to clipboard. The Web Share API is not supported in your browser.");
      }
      return;
    }
    
    try {
      await navigator.share({
        title: `${displayName}'s Album`,
        text: `Scan this QR code to view ${displayName}'s album`,
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

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(albumUrl);
      toast.success("Album URL copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy URL");
    }
  };
  
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Hidden QR code SVG for initial generation */}
      <div ref={qrRef} className="hidden">
        <QRCodeSVG
          value={albumUrl}
          size={size}
          level="H"
          includeMargin={false}
          bgColor="#ffffff"
          fgColor="#000000"
        />
      </div>
      
      {/* Canvas for rendering - hidden once the image is generated */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* Display the styled QR code */}
      {qrImageUrl ? (
        <div className="bg-white p-1 rounded-lg shadow-md">
          <img 
            src={qrImageUrl} 
            alt={`QR Code for ${displayName}'s album`} 
            className="rounded-lg" 
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
      ) : (
        <div className="w-full max-w-sm h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
          <span className="text-gray-400">Generating QR code...</span>
        </div>
      )}
      
      <div className="flex flex-wrap justify-center gap-3">
        <Button 
          variant="outline" 
          onClick={handleDownload}
          disabled={!qrImageUrl}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
        
        <Button 
          onClick={handleShare}
          disabled={!qrImageUrl}
          className="bg-purple hover:bg-purple-dark flex items-center gap-2"
        >
          <Share className="h-4 w-4" />
          Share
        </Button>

        <Button
          variant="outline"
          onClick={handleCopyLink}
          className="flex items-center gap-2"
        >
          <Copy className="h-4 w-4" />
          Copy Link
        </Button>
      </div>
      
      <p className="text-sm text-gray-500 text-center mt-2">
        Scan this QR code to view {displayName}'s album on your mobile device
      </p>
    </div>
  );
};

export default QRCodeGenerator;
