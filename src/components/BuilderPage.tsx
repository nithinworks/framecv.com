
import React, { useEffect } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

import BuilderToolbar from "./builder/BuilderToolbar";
import EditorSidebar from "./builder/EditorSidebar";
import PortfolioPreview from "./builder/PortfolioPreview";
import CodeView from "./builder/CodeView";
import DeployOptions from "./builder/DeployOptions";

const BuilderPage: React.FC = () => {
  const { 
    portfolioData, 
    isProcessing, 
    showEditor, 
    showCode, 
    showDeploy, 
    currentView 
  } = usePortfolio();
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check if we have data to display
  useEffect(() => {
    // If no name is set, we may not have processed a resume yet
    if (!portfolioData.settings.name || portfolioData.settings.name === "Your Name") {
      toast({
        title: "No portfolio data",
        description: "Please upload a resume on the home page first",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [portfolioData, navigate, toast]);

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
          <div className="py-8 flex justify-center">
            <PortfolioPreview />
          </div>
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
