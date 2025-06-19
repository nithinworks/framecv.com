
import React from "react";
import { Loader } from "lucide-react";

interface BrandedLoaderProps {
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const BrandedLoader: React.FC<BrandedLoaderProps> = ({ 
  message = "Loading...", 
  className = "",
  size = "md"
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <div className="relative">
        <Loader className={`${sizeClasses[size]} animate-spin text-white`} />
        <div className="absolute inset-0 rounded-full bg-white/10 animate-pulse" />
      </div>
      {message && (
        <p className="text-sm text-gray-400 font-medium animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

// Full page loader variant
export const PageLoader: React.FC<{ message?: string }> = ({ 
  message = "Loading..." 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#171717] px-4">
      <div className="text-center animate-blur-in">
        <BrandedLoader message={message} size="lg" />
      </div>
    </div>
  );
};
