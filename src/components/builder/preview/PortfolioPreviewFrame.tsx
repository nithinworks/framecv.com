
import React from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { useIframeRenderer } from "@/hooks/useIframeRenderer";

const PortfolioPreviewFrame: React.FC = () => {
  const { portfolioData, currentView } = usePortfolio();
  const { iframeRef, handleIframeLoad } = useIframeRenderer(portfolioData, currentView);

  return (
    <iframe
      ref={iframeRef}
      className="w-full h-full bg-white"
      style={{ border: "none" }}
      title="Portfolio Preview"
      sandbox="allow-scripts allow-same-origin"
      onLoad={handleIframeLoad}
    />
  );
};

export default PortfolioPreviewFrame;
