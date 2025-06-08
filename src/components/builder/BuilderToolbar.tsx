
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  PanelLeft, 
  Download, 
  ChevronLeft,
  Github,
  Globe
} from "lucide-react";
import { usePortfolio } from "@/context/PortfolioContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import GitHubDeploy from "@/components/builder/GitHubDeploy";
import UserDetailsModal from "@/components/builder/UserDetailsModal";
import PublishModal from "@/components/builder/PublishModal";
import DeviceToggle from "@/components/builder/DeviceToggle";
import { useDownloadCode } from "@/hooks/useDownloadCode";

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
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<"download" | "deploy" | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Use the download code hook
  const { downloadSourceCode } = useDownloadCode();

  const handleDownloadClick = async () => {
    setIsDownloading(true);
    setPendingAction("download");
    setShowUserDetails(true);
  };

  const handleDeployClick = () => {
    setPendingAction("deploy");
    setShowUserDetails(true);
  };

  const handleUserDetailsSuccess = async () => {
    if (pendingAction === "download") {
      try {
        await downloadSourceCode();
      } finally {
        setIsDownloading(false);
      }
    } else if (pendingAction === "deploy") {
      setShowGitHubDeploy(true);
    }
    setPendingAction(null);
  };

  const handleUserDetailsClose = () => {
    if (pendingAction === "download") {
      setIsDownloading(false);
    }
    setPendingAction(null);
  };

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

        {/* Centered Device Toggle - Only show on desktop */}
        {!isMobile && (
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
            <DeviceToggle />
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPublishModal(true)}
            className="px-3 py-2 h-8 text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-300"
          >
            <Globe className="h-4 w-4 mr-2" />
            {!isMobile && "Publish"}
          </Button>

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
            disabled={isDownloading}
            className="px-3 py-2 h-8 text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-300"
          >
            {isDownloading ? (
              <>
                <div className="h-4 w-4 mr-2 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                {!isMobile && "Processing..."}
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                {!isMobile && "Download"}
              </>
            )}
          </Button>
        </div>
      </div>

      <UserDetailsModal 
        open={showUserDetails}
        onOpenChange={(open) => {
          setShowUserDetails(open);
          if (!open) {
            handleUserDetailsClose();
          }
        }}
        actionType={pendingAction || "download"}
        portfolioName={portfolioData.settings.name}
        onSuccess={handleUserDetailsSuccess}
      />

      <GitHubDeploy 
        open={showGitHubDeploy} 
        onOpenChange={setShowGitHubDeploy} 
      />

      <PublishModal
        open={showPublishModal}
        onOpenChange={setShowPublishModal}
        portfolioData={portfolioData}
      />
    </>
  );
};

export default BuilderToolbar;
