
import React, { useRef, useEffect, useState } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { generatePortfolioHTML } from "@/services/portfolioRenderer";

const PortfolioPreviewFrame: React.FC = () => {
  const { portfolioData, currentView } = usePortfolio();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize iframe when component mounts and when portfolio data changes
  useEffect(() => {
    const updateIframeContent = () => {
      if (iframeRef.current) {
        const html = generatePortfolioHTML(portfolioData);
        const iframeDoc = iframeRef.current.contentDocument || 
                          iframeRef.current.contentWindow?.document;
        
        if (iframeDoc) {
          // Clear previous content
          iframeDoc.open();
          iframeDoc.write(html);
          iframeDoc.close();
          setIsLoaded(true);
        }
      }
    };
    
    // Use a small delay to ensure iframe is ready
    const timer = setTimeout(updateIframeContent, 100);
    return () => clearTimeout(timer);
  }, [portfolioData, currentView]);

  return (
    <iframe
      ref={iframeRef}
      className="w-full h-full bg-white"
      style={{ border: "none" }}
      title="Portfolio Preview"
      sandbox="allow-scripts allow-same-origin"
    />
  );
};

export default PortfolioPreviewFrame;
