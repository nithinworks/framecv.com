
import React from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import PortfolioPreviewFrame from "./preview/PortfolioPreviewFrame";

const PortfolioPreview: React.FC = () => {
  const { currentView } = usePortfolio();
  
  // Function to get container class based on view mode
  const getContainerClass = () => {
    if (currentView === "mobile") {
      // Mobile preview with subtle border and rounded corners
      return "max-w-[412px] h-[732px] mx-auto border border-gray-800/30 rounded-xl overflow-hidden shadow-2xl";
    }
    return "w-full h-full max-w-[1280px] mx-auto border border-gray-800/20 rounded-xl overflow-hidden shadow-lg";
  };

  return (
    <div className="flex flex-col justify-center items-center h-full p-4">      
      <div className={getContainerClass()}>
        <PortfolioPreviewFrame />
      </div>
    </div>
  );
};

export default PortfolioPreview;
