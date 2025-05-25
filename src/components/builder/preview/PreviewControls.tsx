
import React from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { Button } from "@/components/ui/button";
import { Laptop, Smartphone } from "lucide-react";

const PreviewControls: React.FC = () => {
  const { currentView, setCurrentView } = usePortfolio();

  return (
    <div className="flex justify-center mb-4 gap-2 animate-fade-in">
      <Button
        variant={currentView === "desktop" ? "default" : "ghost"}
        size="sm"
        onClick={() => setCurrentView("desktop")}
        className="flex items-center gap-2 h-8 px-3 text-xs"
      >
        <Laptop className="w-4 h-4" />
        <span className="hidden sm:inline">Desktop</span>
      </Button>
      
      <Button
        variant={currentView === "mobile" ? "default" : "ghost"}
        size="sm"
        onClick={() => setCurrentView("mobile")}
        className="flex items-center gap-2 h-8 px-3 text-xs"
      >
        <Smartphone className="w-4 h-4" />
        <span className="hidden sm:inline">Mobile</span>
      </Button>
    </div>
  );
};

export default PreviewControls;
