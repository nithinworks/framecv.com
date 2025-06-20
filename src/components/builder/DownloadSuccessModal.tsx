
import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, Home, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";

interface DownloadSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  downloadType: "source" | "json";
  fileName: string;
}

const DownloadSuccessModal: React.FC<DownloadSuccessModalProps> = ({
  open,
  onOpenChange,
  downloadType,
  fileName,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      // Minimal confetti effect to match branding
      confetti({
        particleCount: 30,
        startVelocity: 20,
        spread: 50,
        ticks: 40,
        zIndex: 1000,
        origin: {
          x: 0.5,
          y: 0.3,
        },
        colors: ['#ffffff', '#a3a3a3', '#737373'],
      });
    }
  }, [open]);

  const handleGoHome = () => {
    onOpenChange(false);
    navigate("/");
  };

  const handleBackToBuilder = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#171717] border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2 text-white">
            <CheckCircle className="h-6 w-6 text-white" />
            Your Download is Ready!
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400">
            Thank you for using our portfolio builder! Your {downloadType === "source" ? "source code" : "portfolio data"} has been downloaded successfully.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700">
              <Download className="h-8 w-8 text-white" />
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Downloaded: <span className="font-medium text-white">{fileName}</span>
            </p>
            <p className="text-sm text-gray-400">
              {downloadType === "source" 
                ? "Your portfolio source code is ready to deploy anywhere you like!"
                : "Your portfolio data has been saved for future use."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleGoHome}
              className="flex items-center gap-2 border-gray-700 text-white hover:bg-gray-800"
            >
              <Home className="h-4 w-4" />
              Go to Home
            </Button>
            <Button
              onClick={handleBackToBuilder}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Builder
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadSuccessModal;
