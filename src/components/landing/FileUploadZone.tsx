import React, { useState, useCallback } from "react";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
interface FileUploadZoneProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
}
const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  file,
  onFileSelect
}) => {
  const [dragActive, setDragActive] = useState(false);
  const {
    toast
  } = useToast();
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
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
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
  }, [validateFile, onFileSelect]);
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
  }, [validateFile, onFileSelect]);
  return <div className={`${dragActive ? 'border-white/30 bg-white/10' : 'border-white/20 bg-white/5'} ${file ? 'border-white/40 bg-white/10' : ''} border-2 border-dashed p-8 rounded-xl transition-all duration-300 backdrop-blur-sm hover:bg-white/10 hover:border-white/30 cursor-pointer group`} onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}>
      <input type="file" id="resume-upload" className="hidden" onChange={handleChange} accept=".pdf" />
      <label htmlFor="resume-upload" className="flex flex-col items-center cursor-pointer">
        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:bg-white/20 transition-all duration-300">
          <Upload className="w-5 h-5 text-white" />
        </div>
        {file ? <div className="text-center">
            <p className="font-medium text-foreground mb-1">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to process
            </p>
          </div> : <div className="text-center">
            <p className="font-medium text-foreground mb-1">Drop your resume here</p>
            <p className="text-sm text-muted-foreground">Supported File Types: PDF</p>
            
          </div>}
      </label>
    </div>;
};
export default FileUploadZone;