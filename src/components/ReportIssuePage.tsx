
import React, { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const ReportIssuePage: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div 
        className={`border-b border-border transition-all duration-1000 ${
          isLoaded ? "animate-blur-in" : "opacity-0 blur-md"
        }`}
      >
        <div className="container mx-auto py-4 px-4 md:px-8 flex items-center gap-4">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <h1 className="text-lg font-medium">Report an Issue</h1>
          </div>
        </div>
      </div>

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
