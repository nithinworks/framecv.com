
import React, { useEffect } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { toast } from "sonner";

import BuilderToolbar from "./builder/BuilderToolbar";
import EditorSidebar from "./builder/EditorSidebar";
import PortfolioPreview from "./builder/PortfolioPreview";
import CodeView from "./builder/CodeView";
import DeployOptions from "./builder/DeployOptions";

const BuilderPage: React.FC = () => {
  const { 
    isProcessing, 
    showEditor, 
    showCode, 
    showDeploy,
    currentView,
    setCurrentView 
  } = usePortfolio();
  
  // Set default view to desktop and force initial render
  useEffect(() => {
    setCurrentView("desktop");
    
    // Show a welcome message to guide the user
    toast.success("Portfolio builder loaded", {
      description: "Use the editor sidebar to customize your portfolio"
    });
  }, [setCurrentView]);
  
  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-display font-bold mb-2">Processing Your Resume</h2>
          <p className="text-gray-600">Please wait while our AI analyzes your resume...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BuilderToolbar />
      
      <div className="pt-[60px] flex min-h-screen">
        {/* Editor Sidebar */}
        <EditorSidebar />
        
        {/* Main Preview Area */}
        <div className={`flex-1 transition-all duration-300 ${showEditor ? "ml-80" : ""}`}>
          <PortfolioPreview />
        </div>
        
        {/* Code View */}
        <CodeView />
        
        {/* Deploy Options */}
        <DeployOptions />
      </div>
    </div>
  );
};

export default BuilderPage;
