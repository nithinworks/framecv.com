
import React, { useEffect, useState } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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
    setCurrentView,
    portfolioData 
  } = usePortfolio();
  
  const [showEditorHint, setShowEditorHint] = useState(true);
  const navigate = useNavigate();
  
  // Always set view to desktop
  useEffect(() => {
    setCurrentView("desktop");
    
    // Check if we have actual portfolio data, if not redirect to landing
    if (!portfolioData || portfolioData.settings.name === "Your Name") {
      toast.error("No portfolio data found", {
        description: "Please upload a resume first"
      });
      navigate("/");
      return;
    }
    
    // Show a welcome message to guide the user
    toast.success("Portfolio builder loaded", {
      description: "Click the Editor button to start customizing your portfolio"
    });
  }, [setCurrentView, portfolioData, navigate]);

  // Hide editor hint when editor is opened
  useEffect(() => {
    if (showEditor) {
      setShowEditorHint(false);
    }
  }, [showEditor]);
  
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
      
      {/* Editor Button Hint */}
      {showEditorHint && !showEditor && (
        <div className="fixed top-16 left-4 z-40 animate-pulse">
          <div className="bg-primary text-white px-3 py-2 rounded-lg shadow-lg text-sm relative">
            Click here to edit your portfolio
            <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary"></div>
          </div>
        </div>
      )}
      
      <div className="pt-[60px] flex min-h-screen">
        {/* Editor Sidebar */}
        <EditorSidebar />
        
        {/* Main Preview Area */}
        <div className={`flex-1 transition-all duration-300 ${showEditor ? "ml-96" : ""}`}>
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
