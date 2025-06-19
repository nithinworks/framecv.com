
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
      // Trigger confetti effect
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#059669', '#047857'],
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            Your Download is Ready!
          </DialogTitle>
          <DialogDescription className="text-center">
            Thank you for using our portfolio builder! Your {downloadType === "source" ? "source code" : "portfolio data"} has been downloaded successfully.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <Download className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Downloaded: <span className="font-medium">{fileName}</span>
            </p>
            <p className="text-sm text-gray-500">
              {downloadType === "source" 
                ? "Your portfolio source code is ready to deploy anywhere you like!"
                : "Your portfolio data has been saved for future use."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleGoHome}
              className="flex items-center gap-2"
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
