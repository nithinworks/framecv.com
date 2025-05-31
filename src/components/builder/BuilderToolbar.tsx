
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  PanelLeft, 
  Download, 
  ChevronLeft,
  Github,
  Smartphone,
  Tablet,
  Laptop,
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePortfolio } from "@/context/PortfolioContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import GitHubDeploy from "@/components/builder/GitHubDeploy";
import UserDetailsModal from "@/components/builder/UserDetailsModal";
import { useDownloadCode } from "@/hooks/useDownloadCode";
import { useDevicePreview, type DeviceType } from "@/hooks/useDevicePreview";

interface BuilderToolbarProps {
  showEditorHint?: boolean;
}

const BuilderToolbar: React.FC<BuilderToolbarProps> = ({ showEditorHint = false }) => {
  const { 
    showEditor, 
    setShowEditor,
    portfolioData
  } = usePortfolio();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showGitHubDeploy, setShowGitHubDeploy] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [pendingAction, setPendingAction] = useState<"download" | "deploy" | null>(null);
  const { currentDevice, setCurrentDevice, getCurrentDevice, devices } = useDevicePreview();

  // Use the download code hook
  const { downloadSourceCode } = useDownloadCode();

  const handleDownloadClick = () => {
    setPendingAction("download");
    setShowUserDetails(true);
  };

  const handleDeployClick = () => {
    setPendingAction("deploy");
    setShowUserDetails(true);
  };

  const handleUserDetailsSuccess = () => {
    if (pendingAction === "download") {
      downloadSourceCode();
    } else if (pendingAction === "deploy") {
      setShowGitHubDeploy(true);
    }
    setPendingAction(null);
  };

  const getDeviceIcon = (deviceType: DeviceType) => {
    switch (deviceType) {
      case "mobile":
        return <Smartphone className="h-4 w-4" />;
      case "tablet":
        return <Tablet className="h-4 w-4" />;
      case "desktop":
        return <Laptop className="h-4 w-4" />;
    }
  };

  const currentDeviceInfo = getCurrentDevice();

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-14 bg-[#171717] border-b border-gray-800 z-40 flex justify-between items-center px-4 animate-blur-in">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white hover:bg-gray-800 px-3 py-2 h-8 text-sm transition-all duration-300"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {!isMobile && "Back"}
          </Button>

          <div className="h-4 w-px bg-gray-800"></div>

          <div className="relative">
            <Button
              variant={showEditor ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowEditor(!showEditor)}
              className={`px-3 py-2 h-8 text-sm transition-all duration-300 relative overflow-hidden ${showEditor ? "bg-white text-black hover:bg-gray-200" : "text-gray-400 hover:text-white hover:bg-gray-800"} ${showEditorHint && !showEditor ? "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r before:from-transparent before:via-gray-600 before:to-transparent before:animate-[shimmer_2s_ease-in-out_infinite] before:-translate-x-full" : ""}`}
              style={{
                background: showEditorHint && !showEditor 
                  ? 'linear-gradient(90deg, transparent, rgba(156, 163, 175, 0.1), transparent)'
                  : undefined
              }}
            >
              <PanelLeft className="h-4 w-4 mr-2" />
              Editor
            </Button>
            
            {showEditorHint && !showEditor && !isMobile && (
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 z-50 animate-fade-in">
                <div className="bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-xs font-medium relative whitespace-nowrap">
                  <span>Click to edit</span>
                  <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-[4px] border-b-[4px] border-r-[4px] border-transparent border-r-gray-800"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isMobile && (
            <>
              <div className="h-4 w-px bg-gray-800"></div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-3 py-2 h-8 text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-300 flex items-center gap-2"
                  >
                    {getDeviceIcon(currentDevice)}
                    <span>{currentDeviceInfo.label}</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  {devices.map((device) => (
                    <DropdownMenuItem
                      key={device.type}
                      onClick={() => setCurrentDevice(device.type)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      {getDeviceIcon(device.type)}
                      <span>{device.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="h-4 w-px bg-gray-800"></div>
            </>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeployClick}
            className="px-3 py-2 h-8 text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-300"
          >
            <Github className="h-4 w-4 mr-2" />
            {!isMobile && "Deploy"}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownloadClick}
            className="px-3 py-2 h-8 text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-300"
          >
            <Download className="h-4 w-4 mr-2" />
            {!isMobile && "Download"}
          </Button>
        </div>
      </div>

      <UserDetailsModal 
        open={showUserDetails}
        onOpenChange={setShowUserDetails}
        actionType={pendingAction || "download"}
        portfolioName={portfolioData.settings.name}
        onSuccess={handleUserDetailsSuccess}
      />

      <GitHubDeploy 
        open={showGitHubDeploy} 
        onOpenChange={setShowGitHubDeploy} 
      />
    </>
  );
};

export default BuilderToolbar;
