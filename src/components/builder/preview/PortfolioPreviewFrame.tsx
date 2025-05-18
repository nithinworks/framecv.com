
import React, { useRef, useEffect, useState } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { generatePortfolioHTML } from "@/services/portfolioRenderer";

const PortfolioPreviewFrame: React.FC = () => {
  const { portfolioData } = usePortfolio();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize iframe when component mounts and when portfolio data changes
  useEffect(() => {
    const initIframe = () => {
      if (iframeRef.current) {
        const html = generatePortfolioHTML(portfolioData);
        const iframeDoc = iframeRef.current.contentDocument || 
                          iframeRef.current.contentWindow?.document;
        
        if (iframeDoc) {
          iframeDoc.open();
          iframeDoc.write(html);
          iframeDoc.close();
          setIsLoaded(true);
        }
      }
    };
    
    // Set a timeout to ensure the iframe is ready
    const timer = setTimeout(initIframe, 100);
    return () => clearTimeout(timer);
  }, [portfolioData]);

  return (
    <iframe
      ref={iframeRef}
      className="w-full h-full bg-white"
      style={{ border: "none" }}
      title="Portfolio Preview"
    />
  );
};

export default PortfolioPreviewFrame;
