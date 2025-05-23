
import React from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import PortfolioPreviewFrame from "./preview/PortfolioPreviewFrame";

const PortfolioPreview: React.FC = () => {
  const { currentView } = usePortfolio();
  
  // Function to get container class based on view mode
  const getContainerClass = () => {
    if (currentView === "mobile") {
      // Mobile preview with no rounded corners
      return "max-w-[412px] h-[732px] mx-auto border border-gray-300 overflow-hidden";
    }
    return "w-full h-full max-w-[1280px] mx-auto border border-gray-200 overflow-hidden";
  };

  return (
    <div className="flex flex-col justify-center items-center h-full">      
      <div className={getContainerClass()}>
        <PortfolioPreviewFrame />
      </div>
    </div>
  );
};

export default PortfolioPreview;
