
import React, { useEffect, useState } from "react";
import LandingHeader from "./landing/LandingHeader";

const ReportIssuePage: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader isLoaded={isLoaded} />
      
      {/* Iframe Container */}
      <div 
        className={`h-[calc(100vh-73px)] w-full transition-all duration-1000 ${
          isLoaded ? "animate-fade-up" : "opacity-0 translate-y-8"
        }`}
      >
        <iframe
          src="https://app.youform.com/forms/usxhtwxb"
          loading="lazy"
          width="100%"
          height="100%"
          frameBorder="0"
          marginHeight={0}
          marginWidth={0}
          className="border-0"
          title="Software Incident Report Form"
        />
      </div>
    </div>
  );
};

export default ReportIssuePage;
