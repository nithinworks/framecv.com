
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BrandedLoader } from "@/components/ui/branded-loader";

interface DownloadLoadingModalProps {
  open: boolean;
  downloadType: "source" | "json";
}

const DownloadLoadingModal: React.FC<DownloadLoadingModalProps> = ({
  open,
  downloadType,
}) => {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="text-center">
            Your Download is Getting Ready
          </DialogTitle>
          <DialogDescription className="text-center">
            {downloadType === "source" 
              ? "We're preparing your portfolio source code..."
              : "We're preparing your portfolio data..."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-8">
          <BrandedLoader size="lg" />
          <p className="text-sm text-gray-500 mt-4 text-center">
            This may take a few moments
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadLoadingModal;
