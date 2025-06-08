
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Download, FileJson } from "lucide-react";
import { useDownloadCode } from "@/hooks/useDownloadCode";
import { usePortfolio } from "@/context/PortfolioContext";

const DownloadDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { downloadSourceCode } = useDownloadCode();
  const { portfolioData } = usePortfolio();

  const downloadJSON = () => {
    const jsonString = JSON.stringify(portfolioData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${portfolioData.settings.name.replace(/\s+/g, '-')}-Portfolio-Data.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const downloadZIP = () => {
    downloadSourceCode();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
        variant="outline"
      >
        <Download className="h-4 w-4" />
        Download
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 overflow-hidden">
            <button
              onClick={downloadZIP}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
            >
              <Download className="h-4 w-4" />
              <div>
                <div className="font-medium">Download ZIP</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Complete source code</div>
              </div>
            </button>
            
            <div className="border-t border-gray-200 dark:border-gray-700" />
            
            <button
              onClick={downloadJSON}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
            >
              <FileJson className="h-4 w-4" />
              <div>
                <div className="font-medium">Download JSON</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Portfolio data only</div>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DownloadDropdown;
