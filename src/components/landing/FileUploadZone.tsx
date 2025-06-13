
import React, { useState, useCallback } from "react";
import { Upload, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FileUploadZoneProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  isDisabled?: boolean;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  file,
  onFileSelect,
  isDisabled = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const validateFile = useCallback((file: File): boolean => {
    console.log('Validating file:', file.name, 'Type:', file.type, 'Size:', file.size);
    if (file.type !== "application/pdf") {
      console.log('Invalid file type detected');
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file only",
        variant: "destructive"
      });
      return false;
    }
    const maxSize = 2 * 1024 * 1024; // 2MB limit
    if (file.size > maxSize) {
      console.log('File too large detected');
      toast({
        title: "File too large",
        description: "Maximum file size is 2MB",
        variant: "destructive"
      });
      return false;
    }
    const minSize = 1000; // 1KB minimum
    if (file.size < minSize) {
      console.log('File too small detected');
      toast({
        title: "File too small",
        description: "File appears to be empty or corrupted",
        variant: "destructive"
      });
      return false;
    }
    return true;
  }, [toast]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    if (isDisabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, [isDisabled]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    if (isDisabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      console.log('File dropped:', droppedFile.name);
      if (validateFile(droppedFile)) {
        onFileSelect(droppedFile);
      } else {
        onFileSelect(null);
      }
    }
  }, [validateFile, onFileSelect, isDisabled]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      console.log('File selected:', selectedFile.name);
      if (validateFile(selectedFile)) {
        onFileSelect(selectedFile);
      } else {
        onFileSelect(null);
      }
    }
  }, [validateFile, onFileSelect, isDisabled]);

  const handleDisabledClick = () => {
    if (isDisabled) {
      toast({
        title: "Feature temporarily disabled",
        description: "Resume processing is currently disabled due to high usage. Please try again later.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="relative">
      <div 
        className={`${dragActive && !isDisabled ? 'border-white/30 bg-white/10' : 'border-white/20 bg-white/5'} ${file && !isDisabled ? 'border-white/40 bg-white/10' : ''} ${isDisabled ? 'border-gray-500/30 bg-gray-500/10' : ''} border-2 border-dashed p-8 rounded-xl transition-all duration-300 backdrop-blur-sm ${!isDisabled ? 'hover:bg-white/10 hover:border-white/30 cursor-pointer' : 'cursor-not-allowed'} group`} 
        onDragEnter={handleDrag} 
        onDragOver={handleDrag} 
        onDragLeave={handleDrag} 
        onDrop={handleDrop}
        onClick={handleDisabledClick}
      >
        <input 
          type="file" 
          id="resume-upload" 
          className="hidden" 
          onChange={handleChange} 
          accept=".pdf" 
          disabled={isDisabled}
        />
        <label 
          htmlFor="resume-upload" 
          className={`flex flex-col items-center ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className={`w-12 h-12 rounded-full ${isDisabled ? 'bg-gray-500/20' : 'bg-white/10'} backdrop-blur-sm flex items-center justify-center mb-4 ${!isDisabled ? 'group-hover:bg-white/20' : ''} transition-all duration-300`}>
            <Upload className={`w-5 h-5 ${isDisabled ? 'text-gray-500' : 'text-white'}`} />
          </div>
          {file ? (
            <div className="text-center">
              <p className={`font-medium mb-1 ${isDisabled ? 'text-gray-500' : 'text-foreground'}`}>{file.name}</p>
              <p className={`text-xs ${isDisabled ? 'text-gray-600' : 'text-muted-foreground'}`}>
                {(file.size / (1024 * 1024)).toFixed(2)} MB • {isDisabled ? 'Upload disabled' : 'Ready to process'}
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className={`font-medium mb-1 ${isDisabled ? 'text-gray-500' : 'text-foreground'}`}>
                {isDisabled ? 'Upload temporarily disabled' : 'Drop your resume here'}
              </p>
              <p className={`text-sm ${isDisabled ? 'text-gray-600' : 'text-muted-foreground'}`}>
                {isDisabled ? 'Feature disabled due to high usage' : 'Supported File Types: PDF'}
              </p>
            </div>
          )}
        </label>
      </div>

      {/* Lock Overlay */}
      {isDisabled && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px] rounded-xl cursor-not-allowed">
                <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-600 rounded-full p-3">
                  <Lock className="w-6 h-6 text-gray-300" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-sm">Feature temporarily disabled due to high usage. Please try again later.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default FileUploadZone;
