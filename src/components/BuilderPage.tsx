
import React, { useEffect, useState } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

import BuilderToolbar from "./builder/BuilderToolbar";
import EditorSidebar from "./builder/EditorSidebar";
import PortfolioPreview from "./builder/PortfolioPreview";
import CodeView from "./builder/CodeView";

const BuilderPage: React.FC = () => {
  const { 
    isProcessing, 
    showEditor, 
    showCode,
    setCurrentView
  } = usePortfolio();
  
  const [showEditorHint, setShowEditorHint] = useState(true);
  const isMobile = useIsMobile();
  
  // Always set view to desktop
  useEffect(() => {
    setCurrentView("desktop");
    
    // Show a welcome message to guide the user
    toast.success("Portfolio builder loaded", {
      description: "Click the Editor button to start customizing your portfolio"
    });
  }, [setCurrentView]);

  // Hide editor hint when editor is opened
  useEffect(() => {
    if (showEditor) {
      setShowEditorHint(false);
    }
  }, [showEditor]);
  
  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#171717] px-4">
        <div className="text-center animate-blur-in">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-medium mb-3 text-white">Processing Your Resume</h2>
          <p className="text-gray-400 text-sm">Please wait while our AI analyzes your resume...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#171717]">
      <BuilderToolbar showEditorHint={showEditorHint} />
      
      <div className="pt-14 flex min-h-screen">
        {/* Editor Sidebar */}
        <EditorSidebar />
        
        {/* Main Preview Area */}
        <div className={`flex-1 transition-all duration-300 ${
          showEditor && !isMobile ? "ml-96" : ""
        } ${isMobile ? "px-2" : ""}`}>
          <PortfolioPreview />
        </div>
        
        {/* Code View */}
        <CodeView />
      </div>
    </div>
  );
};

export default BuilderPage;
