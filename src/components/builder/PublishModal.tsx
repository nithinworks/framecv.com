
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PortfolioData } from "@/types/portfolio";
import PublishInstructionsStep from "./publish/PublishInstructionsStep";
import PublishFormStep from "./publish/PublishFormStep";
import PublishSuccessStep from "./publish/PublishSuccessStep";

interface PublishModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portfolioData: PortfolioData;
}

const PublishModal: React.FC<PublishModalProps> = ({
  open,
  onOpenChange,
  portfolioData,
}) => {
  const [step, setStep] = useState<"instructions" | "form" | "success">("instructions");
  const [publishedUrl, setPublishedUrl] = useState("");

  const handleAgree = () => {
    setStep("form");
  };

  const handleFormSuccess = (url: string) => {
    setPublishedUrl(url);
    setStep("success");
  };

  const handleClose = () => {
    setStep("instructions");
    setPublishedUrl("");
    onOpenChange(false);
  };

  const getTitle = () => {
    switch (step) {
      case "instructions":
        return "Publish Portfolio";
      case "form":
        return "Portfolio Details";
      case "success":
        return "Published Successfully!";
      default:
        return "Publish Portfolio";
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>

        {step === "instructions" && (
          <PublishInstructionsStep 
            onAgree={handleAgree}
            onClose={handleClose}
          />
        )}

        {step === "form" && (
          <PublishFormStep
            portfolioData={portfolioData}
            onSuccess={handleFormSuccess}
            onBack={() => setStep("instructions")}
          />
        )}

        {step === "success" && (
          <PublishSuccessStep
            publishedUrl={publishedUrl}
            onClose={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PublishModal;
