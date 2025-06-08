
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Code, Monitor, Smartphone, Tablet, Github, Upload } from "lucide-react";
import { usePortfolio } from "@/context/PortfolioContext";
import GitHubDeploy from "./GitHubDeploy";
import PublishModal from "./PublishModal";
import DownloadDropdown from "./DownloadDropdown";

interface BuilderToolbarProps {
  currentDevice: 'desktop' | 'tablet' | 'mobile';
  onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void;
  onPreviewToggle: () => void;
  showEditorHint?: boolean;
}

const BuilderToolbar: React.FC<BuilderToolbarProps> = ({
  currentDevice,
  onDeviceChange,
  onPreviewToggle,
  showEditorHint
}) => {
  const { 
    showCode, 
    setShowCode,
    portfolioData
  } = usePortfolio();

  const [showGitHubDeploy, setShowGitHubDeploy] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);

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
        {/* Preview Toggle */}
        <Button
          onClick={onPreviewToggle}
          variant="outline"
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
        <Button
          onClick={() => setShowGitHubDeploy(true)}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Github className="h-4 w-4" />
          <span className="hidden sm:inline">Deploy</span>
        </Button>

        {/* Publish Modal */}
        <Button
          onClick={() => setShowPublishModal(true)}
          variant="default"
          size="sm"
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">Publish</span>
        </Button>
      </div>

      {/* Modals */}
      <GitHubDeploy 
        open={showGitHubDeploy} 
        onOpenChange={setShowGitHubDeploy} 
      />
      
      <PublishModal 
        open={showPublishModal} 
        onOpenChange={setShowPublishModal}
        portfolioData={portfolioData}
      />
    </div>
  );
};

export default BuilderToolbar;
