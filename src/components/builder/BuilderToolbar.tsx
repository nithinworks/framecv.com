
import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, Code, Monitor, Smartphone, Tablet } from "lucide-react";
import { usePortfolio } from "@/context/PortfolioContext";
import GitHubDeploy from "./GitHubDeploy";
import PublishModal from "./PublishModal";
import DownloadDropdown from "./DownloadDropdown";

interface BuilderToolbarProps {
  currentDevice: 'desktop' | 'tablet' | 'mobile';
  onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void;
  onPreviewToggle: () => void;
}

const BuilderToolbar: React.FC<BuilderToolbarProps> = ({
  currentDevice,
  onDeviceChange,
  onPreviewToggle
}) => {
  const { 
    showPreview, 
    showCode, 
    setShowCode,
    isProcessing
  } = usePortfolio();

  const deviceIcons = {
    desktop: Monitor,
    tablet: Tablet,
    mobile: Smartphone,
  };

  return (
    <div className="h-[60px] bg-white border-b flex items-center justify-between px-4 md:px-6 relative z-40">
      <div className="flex items-center gap-4">
        <h1 className="font-display font-semibold text-lg">Portfolio Builder</h1>
        
        {/* Device Toggle - Hidden on mobile */}
        <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-1">
          {Object.entries(deviceIcons).map(([device, Icon]) => (
            <Button
              key={device}
              variant={currentDevice === device ? "default" : "ghost"}
              size="sm"
              onClick={() => onDeviceChange(device as any)}
              className="h-8 w-8 p-0"
            >
              <Icon className="h-4 w-4" />
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Preview Toggle - Hidden when preview is already shown on mobile */}
        <Button
          onClick={onPreviewToggle}
          variant={showPreview ? "default" : "outline"}
          size="sm"
          className="flex items-center gap-2"
        >
          <Eye className="h-4 w-4" />
          <span className="hidden sm:inline">Preview</span>
        </Button>

        {/* Code View Toggle */}
        <Button
          onClick={() => setShowCode(!showCode)}
          variant={showCode ? "default" : "outline"}
          size="sm"
          className="flex items-center gap-2"
        >
          <Code className="h-4 w-4" />
          <span className="hidden sm:inline">Code</span>
        </Button>

        {/* Download Dropdown */}
        <DownloadDropdown />

        {/* GitHub Deploy */}
        <GitHubDeploy />

        {/* Publish Modal */}
        <PublishModal />
      </div>
    </div>
  );
};

export default BuilderToolbar;
