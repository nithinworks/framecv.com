
import React, { useEffect, useState } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();
  
  // Set initial view to desktop on load
  useEffect(() => {
    setCurrentView("desktop");
    
    // Show a welcome message to guide the user
    {/*    toast({
      title: "Portfolio builder loaded",
      description: "Click the Editor button to start customizing your portfolio"
    });
  }, [setCurrentView, toast]); */}

  // Hide editor hint when editor is opened
  useEffect(() => {
    if (showEditor) {
      setShowEditorHint(false);
    }
  }, [showEditor]);

  // Disable right-click context menu globally on the builder page
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast({
        title: "Right-click disabled",
        description: "Right-click functionality is disabled in the builder for security"
      });
    };

    // Add event listener to the document
    document.addEventListener('contextmenu', handleContextMenu);

    // Also check for iframes and add the same protection
    const checkForIframes = () => {
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach((iframe) => {
        try {
          if (iframe.contentDocument) {
            iframe.contentDocument.addEventListener('contextmenu', handleContextMenu);
          }
        } catch (error) {
          // Cross-origin iframe, can't access content
          console.log('Cannot access iframe content for right-click protection');
        }
      });
    };

    // Check for iframes initially and then periodically
    checkForIframes();
    const intervalId = setInterval(checkForIframes, 1000);

    // Cleanup event listeners on component unmount
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      clearInterval(intervalId);
      
      // Clean up iframe listeners
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach((iframe) => {
        try {
          if (iframe.contentDocument) {
            iframe.contentDocument.removeEventListener('contextmenu', handleContextMenu);
          }
        } catch (error) {
          // Cross-origin iframe, can't access content
        }
      });
    };
  }, [toast]);
  
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
    <div className="h-screen bg-[#171717] overflow-hidden">
      <BuilderToolbar showEditorHint={showEditorHint} />
      
      <div className="h-full pt-14 flex overflow-hidden">
        {/* Editor Sidebar */}
        <EditorSidebar />
        
        {/* Main Preview Area */}
        <div className={`flex-1 transition-all duration-300 ${
          showEditor && !isMobile ? "ml-96" : ""
        } h-full overflow-hidden`}>
          <PortfolioPreview />
        </div>
        
        {/* Code View */}
        <CodeView />
      </div>
    </div>
  );
};

export default BuilderPage;
