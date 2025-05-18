
import React from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import PortfolioPreviewFrame from "./preview/PortfolioPreviewFrame";

const PortfolioPreview: React.FC = () => {
  const { currentView } = usePortfolio();
  
  // Function to get container class based on view mode
  const getContainerClass = () => {
    if (currentView === "mobile") {
      return "max-w-[375px] h-[667px] mx-auto border border-gray-300 rounded-lg shadow-md overflow-hidden";
    }
    return "w-full h-[80vh] max-w-[1280px] mx-auto border border-gray-200 shadow-sm rounded-md overflow-hidden";
  };

  return (
    <div className="flex flex-col justify-center items-center py-4">      
      <div className={getContainerClass()}>
        <PortfolioPreviewFrame />
      </div>
    </div>
  );
};

export default PortfolioPreview;
