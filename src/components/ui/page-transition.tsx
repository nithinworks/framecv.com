
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { BrandedLoader } from "./branded-loader";

const PageTransitionLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsTransitioning(true);
    
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 150); // Short transition for perceived performance

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (isTransitioning) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#171717]">
        <BrandedLoader size="md" />
      </div>
    );
  }

  return <>{children}</>;
};

export default PageTransitionLoader;
