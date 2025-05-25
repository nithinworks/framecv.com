
import React from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { useIsMobile } from "@/hooks/use-mobile";
import PortfolioPreviewFrame from "./preview/PortfolioPreviewFrame";

const PortfolioPreview: React.FC = () => {
  const { currentView } = usePortfolio();
  const isMobile = useIsMobile();
  
  // Function to get container class based on view mode
  const getContainerClass = () => {
    if (isMobile) {
      // Mobile: full screen preview with minimal padding
      return "w-full h-full bg-white";
    }
    
    if (currentView === "mobile") {
      // Mobile preview with device frame
      return "max-w-[412px] h-[732px] mx-auto bg-white rounded-2xl overflow-hidden shadow-2xl";
    }
    
    // Desktop preview - clean and full
    return "w-full h-full max-w-[1280px] mx-auto bg-white overflow-hidden";
  };

  const containerPadding = isMobile ? "p-0" : "p-6";

  return (
    <div className={`flex flex-col justify-center items-center h-full ${containerPadding} overflow-hidden`}>      
      <div className={getContainerClass()}>
        <PortfolioPreviewFrame />
      </div>
    </div>
  );
};

export default PortfolioPreview;
