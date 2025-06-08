
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import FileUploadZone from "../FileUploadZone";

interface UploadFormProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  isProcessing: boolean;
}

const UploadForm: React.FC<UploadFormProps> = ({
  file,
  onFileSelect,
  onSubmit,
  isProcessing
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <FileUploadZone file={file} onFileSelect={onFileSelect} />
      
      <Button 
        type="submit" 
        className="w-full bg-foreground hover:bg-muted-foreground text-background font-medium py-4 px-8 rounded-xl transition-all duration-300" 
        disabled={!file || isProcessing}
      >
        {isProcessing ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin"></div>
            Processing your resume...
          </div>
        ) : (
          <>
            Create My Portfolio Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
};

export default UploadForm;
