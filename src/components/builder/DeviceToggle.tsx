
import React from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { Monitor, Smartphone } from "lucide-react";

const DeviceToggle: React.FC = () => {
  const { currentView, setCurrentView } = usePortfolio();

  return (
    <div className="flex items-center bg-gray-900/90 backdrop-blur-sm rounded-full p-1 border border-gray-700/50 shadow-lg">
      <button
        onClick={() => setCurrentView("desktop")}
        className={`
          flex items-center justify-center px-3 py-2 rounded-full transition-all duration-300 relative
          ${currentView === "desktop" 
            ? "bg-white text-gray-900 shadow-sm" 
            : "text-gray-400 hover:text-white hover:bg-gray-800/50"
          }
        `}
      >
        <Monitor className="h-4 w-4" />
        <span className="ml-2 text-xs font-medium hidden sm:inline">Desktop</span>
      </button>
      
      <button
        onClick={() => setCurrentView("mobile")}
        className={`
          flex items-center justify-center px-3 py-2 rounded-full transition-all duration-300 relative
          ${currentView === "mobile" 
            ? "bg-white text-gray-900 shadow-sm" 
            : "text-gray-400 hover:text-white hover:bg-gray-800/50"
          }
        `}
      >
        <Smartphone className="h-4 w-4" />
        <span className="ml-2 text-xs font-medium hidden sm:inline">Mobile</span>
      </button>
    </div>
  );
};

export default DeviceToggle;
