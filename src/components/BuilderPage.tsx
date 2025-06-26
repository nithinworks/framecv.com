
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
  
  const { featureFlags, isLoading: flagsLoading } = useFeatureFlags();
  
  useEffect(() => {
    setCurrentView("desktop");
  }, [setCurrentView]);

  useEffect(() => {
    if (showEditor) {
      setShowEditorHint(false);
    }
  }, [showEditor]);

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
          // Cross-origin iframe, can't access content
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
    return <BrandedLoader message="Processing Your Resume..." size="lg" fullScreen={true} />;
  }

  return (
    <div className="h-screen bg-[#171717] overflow-hidden">
      <BuilderToolbar showEditorHint={showEditorHint} />
      
      <div className="h-full pt-14 flex overflow-hidden">
        <EditorSidebar />
        
        <div className={`flex-1 transition-all duration-300 ${
          showEditor && !isMobile ? "ml-96" : ""
        } h-full overflow-hidden`}>
          <PortfolioPreview />
        </div>
        
        <CodeView />
      </div>
    </div>
  );
};

export default BuilderPage;
