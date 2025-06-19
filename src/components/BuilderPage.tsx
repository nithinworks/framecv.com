import React, { useEffect, useState } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";

import BuilderToolbar from "./builder/BuilderToolbar";
import EditorSidebar from "./builder/EditorSidebar";
import PortfolioPreview from "./builder/PortfolioPreview";
import CodeView from "./builder/CodeView";
import { BrandedLoader } from "./ui/branded-loader";

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
  
  // Use the simple feature flags hook without caching
  const { featureFlags, isLoading: flagsLoading } = useFeatureFlags();
  
  // Set initial view to desktop on load
  useEffect(() => {
    setCurrentView("desktop");
  }, [setCurrentView]);

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

    document.addEventListener('contextmenu', handleContextMenu);

    const checkForIframes = () => {
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach((iframe) => {
        try {
          if (iframe.contentDocument) {
            iframe.contentDocument.addEventListener('contextmenu', handleContextMenu);
          }
        } catch (error) {
          console.log('Cannot access iframe content for right-click protection');
        }
      });
    };

    checkForIframes();
    const intervalId = setInterval(checkForIframes, 1000);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      clearInterval(intervalId);
      
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
          <BrandedLoader message="Processing Your Resume..." size="lg" />
          <p className="text-gray-400 text-sm mt-4">Please wait while our AI analyzes your resume...</p>
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
