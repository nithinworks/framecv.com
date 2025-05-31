
import React from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDevicePreview } from "@/hooks/useDevicePreview";
import PortfolioPreviewFrame from "./preview/PortfolioPreviewFrame";
import DevicePreviewControls from "./preview/DevicePreviewControls";

const PortfolioPreview: React.FC = () => {
  const { currentView } = usePortfolio();
  const isMobile = useIsMobile();
  const { getCurrentDevice } = useDevicePreview();
  
  const currentDevice = getCurrentDevice();
  
  // Function to get container class based on device type
  const getContainerClass = () => {
    if (isMobile) {
      // Mobile: full screen preview without any padding or rounded corners
      return "w-full h-full bg-white";
    }
    
    if (currentDevice.type === "mobile") {
      // Mobile preview with device frame and elegant rounded corners
      return `w-full max-w-[375px] h-[732px] mx-auto bg-white rounded-xl overflow-hidden shadow-lg`;
    }

    if (currentDevice.type === "tablet") {
      // Tablet preview with device frame
      return `w-full max-w-[768px] h-[800px] mx-auto bg-white rounded-xl overflow-hidden shadow-lg`;
    }
    
    // Desktop preview - clean with subtle rounded corners
    return "w-full h-full max-w-[1280px] mx-auto bg-white overflow-hidden rounded-lg shadow-sm";
  };

  const containerPadding = isMobile ? "p-0" : "p-6";

  return (
    <div className={`flex flex-col justify-center items-center h-full ${containerPadding} overflow-hidden`}>
      {!isMobile && <DevicePreviewControls />}
      <div className={getContainerClass()}>
        <PortfolioPreviewFrame />
      </div>
    </div>
  );
};

export default PortfolioPreview;
