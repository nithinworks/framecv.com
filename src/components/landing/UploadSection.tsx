
import React, { useState } from "react";
import UploadForm from "./upload/UploadForm";
import ManualCreationLink from "./upload/ManualCreationLink";
import { useResumeProcessor } from "./upload/ResumeProcessor";

interface UploadSectionProps {
  isLoaded: boolean;
}

const UploadSection: React.FC<UploadSectionProps> = ({ isLoaded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { processResume } = useResumeProcessor({ 
    file, 
    onProcessingChange: setIsProcessing 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await processResume();
  };

  return (
    <div className={`transition-all duration-1000 delay-300 ${isLoaded ? 'animate-blur-in' : 'opacity-0 blur-md translate-y-8'}`}>
      <div className="max-w-md mx-auto">
        <UploadForm
          file={file}
          onFileSelect={setFile}
          onSubmit={handleSubmit}
          isProcessing={isProcessing}
        />
        <ManualCreationLink />
      </div>
    </div>
  );
};

export default UploadSection;
