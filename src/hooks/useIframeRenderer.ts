
import { useRef, useEffect, useState } from "react";
import { Theme } from "./useThemes";
import { generatePortfolioHTML } from "@/services/portfolioRenderer";

export const useIframeRenderer = (portfolioData: any, currentView: string, currentTheme?: Theme) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [renderTimer, setRenderTimer] = useState<NodeJS.Timeout | null>(null);

  // Initialize iframe when component mounts or when portfolio data changes
  useEffect(() => {
    // Reset loaded state when view changes
    if (currentView) {
      setIsLoaded(false);
    }
    
    // Clear any existing timer
    if (renderTimer) {
      clearTimeout(renderTimer);
    }
    
    // Add a delay to prevent too frequent refreshes when typing in form fields
    const timer = setTimeout(() => {
      renderPortfolio();
    }, 300); // 300ms debounce
    
    setRenderTimer(timer);
    
    return () => {
      if (renderTimer) {
        clearTimeout(renderTimer);
      }
    };
  }, [portfolioData, currentView, currentTheme]);

  // Function to handle iframe load events
  const handleIframeLoad = () => {
    if (!isLoaded) {
      // If iframe just loaded but content not yet inserted, render it
      renderPortfolio();
    }
  };

  const renderPortfolio = () => {
    if (!iframeRef.current) return;
    
    try {
      const iframeDoc = iframeRef.current.contentDocument || 
                       (iframeRef.current.contentWindow?.document);
      
      if (iframeDoc) {
        // Start with a clean document
        iframeDoc.open();
        
        // Generate the full HTML document using the portfolio renderer service
        const html = generatePortfolioHTML(portfolioData, currentTheme);
        
        // Write the HTML to the iframe
        iframeDoc.write(html);
        iframeDoc.close();
        setIsLoaded(true);
      }
    } catch (error) {
      console.error("Error rendering portfolio preview:", error);
    }
  };

  return {
    iframeRef,
    handleIframeLoad
  };
};
