import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

  const handleGoHome = () => {
    onOpenChange(false);
    navigate("/");
  };

  const handleBackToBuilder = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#171717] border-gray-800 text-white">
        <div className="flex flex-col items-center text-center p-6 max-w-sm mx-auto">
          <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
          <DialogTitle className="text-xl font-bold mb-2">
            Download Successful
          </DialogTitle>
          <DialogDescription className="text-gray-400 mb-6">
            {downloadType === "source"
              ? `Your portfolio source code has been successfully downloaded as ${fileName}. You can now deploy it anywhere.`
              : `Your portfolio data (${fileName}) has been saved for future use.`}
          </DialogDescription>

          <div className="flex w-full max-w-sm flex-col sm:flex-row-reverse gap-3">
            <Button
              onClick={handleBackToBuilder}
              className="flex items-center gap-2 w-full"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Builder
            </Button>
            <Button
              variant="outline"
              onClick={handleGoHome}
              className="flex items-center gap-2 border-gray-700 hover:bg-gray-800 w-full"
            >
              <Home className="h-4 w-4" />
              Go to Home
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadSuccessModal;
