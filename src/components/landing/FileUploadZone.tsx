
import React, { useState, useCallback } from "react";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadZoneProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({ file, onFileSelect }) => {
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const validateFile = useCallback(async (file: File): Promise<boolean> => {
    // Check file type - only PDF allowed
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Only PDF files are allowed",
        variant: "destructive",
      });
      return false;
    }

    // Check file size - max 2MB
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 2MB",
        variant: "destructive",
      });
      return false;
    }

    // Check for single page - we'll do basic validation using PDF.js-like approach
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const text = new TextDecoder().decode(uint8Array);
      
      // Count occurrences of page objects in PDF
      const pageMatches = text.match(/\/Type\s*\/Page[^s]/g);
      const pageCount = pageMatches ? pageMatches.length : 0;
      
      if (pageCount > 1) {
        toast({
          title: "Multi-page PDF not supported",
          description: "Please upload a single-page PDF resume",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      // If we can't validate pages, allow the file to proceed
      // The server-side validation will catch any issues
    }

    return true;
  }, [toast]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const droppedFile = e.dataTransfer.files[0];
        if (await validateFile(droppedFile)) {
          onFileSelect(droppedFile);
        } else {
          onFileSelect(null);
        }
      }
    },
    [validateFile, onFileSelect]
  );

  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      if (e.target.files && e.target.files[0]) {
        const selectedFile = e.target.files[0];
        if (await validateFile(selectedFile)) {
          onFileSelect(selectedFile);
        } else {
          onFileSelect(null);
        }
      }
    },
    [validateFile, onFileSelect]
  );

  return (
    <div 
      className={`${dragActive ? 'border-white/30 bg-white/10' : 'border-white/20 bg-white/5'} ${file ? 'border-white/40 bg-white/10' : ''} border-2 border-dashed p-8 rounded-xl transition-all duration-300 backdrop-blur-sm hover:bg-white/10 hover:border-white/30 cursor-pointer group`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        id="resume-upload"
        className="hidden" 
        onChange={handleChange}
        accept=".pdf"
      />
      <label htmlFor="resume-upload" className="flex flex-col items-center cursor-pointer">
        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:bg-white/20 transition-all duration-300">
          <Upload className="w-5 h-5 text-white" />
        </div>
        {file ? (
          <div className="text-center">
            <p className="font-medium text-foreground mb-1">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to process
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="font-medium text-foreground mb-1">Drop your PDF resume here</p>
            <p className="text-sm text-muted-foreground">PDF only, max 2MB, single page</p>
          </div>
        )}
      </label>
    </div>
  );
};

export default FileUploadZone;
