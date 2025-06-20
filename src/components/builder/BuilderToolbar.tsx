import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  PanelLeft,
  Download,
  ChevronLeft,
  Github,
  ChevronDown,
  Eye,
  Lock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePortfolio } from "@/context/PortfolioContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import GitHubDeploy from "@/components/builder/GitHubDeploy";
import UserDetailsModal from "@/components/builder/UserDetailsModal";
import DownloadLoadingModal from "@/components/builder/DownloadLoadingModal";
import DownloadSuccessModal from "@/components/builder/DownloadSuccessModal";
import DeviceToggle from "@/components/builder/DeviceToggle";
import BackNavigationModal from "@/components/builder/BackNavigationModal";
import { useDownloadWithLoading } from "@/hooks/useDownloadWithLoading";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { useUserDetailsStorage } from "@/hooks/useUserDetailsStorage";

interface BuilderToolbarProps {
  showEditorHint?: boolean;
}

const BuilderToolbar: React.FC<BuilderToolbarProps> = ({
  showEditorHint = false,
}) => {
  const { showEditor, setShowEditor, portfolioData } = usePortfolio();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { featureFlags } = useFeatureFlags();
  const { toast } = useToast();
  const { loadStoredUserData } = useUserDetailsStorage();
  const [showGitHubDeploy, setShowGitHubDeploy] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showBackModal, setShowBackModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "download" | "deploy" | "json" | null
  >(null);

  const {
    isLoading: isDownloadLoading,
    showSuccess: showDownloadSuccess,
    downloadType,
    fileName,
    setShowSuccess: setShowDownloadSuccess,
    handleDownloadSourceCode,
    handleDownloadJSON,
  } = useDownloadWithLoading();

  useEffect(() => {
    // Check for GitHub token in URL hash (after OAuth redirect)
    const hash = window.location.hash;
    if (hash.includes("github_token=")) {
      console.log("GitHub token detected in URL, automatically opening deploy modal");
      setShowGitHubDeploy(true);
      return;
    }

    // Check for connection errors in URL params
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("error") === "github_oauth_failed") {
      toast({
        title: "GitHub Connection Failed",
        description:
          "Unable to connect to GitHub. You can download your portfolio and deploy it manually instead.",
        variant: "destructive",
      });
      // Clean the URL
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [toast]);

  const handleBackClick = () => {
    setShowBackModal(true);
  };

  const handleBackConfirm = () => {
    setShowBackModal(false);
    navigate("/");
  };

  const checkUserDetailsAndProceed = (action: "download" | "json") => {
    const storedData = loadStoredUserData();
    if (storedData) {
      // User has stored details, proceed directly
      if (action === "download") {
        handleDownloadSourceCode();
      } else {
        handleDownloadJSON();
      }
    } else {
      // No stored details, show modal
      setPendingAction(action);
      setShowUserDetails(true);
    }
  };

  const handleDownloadSourceCodeClick = () => {
    checkUserDetailsAndProceed("download");
  };

  const handleDownloadJSONClick = () => {
    checkUserDetailsAndProceed("json");
  };

  const handlePublishClick = () => {
    if (!featureFlags.github_deploy_status) {
      return; // Do nothing if disabled
    }
    setPendingAction("deploy");
    setShowUserDetails(true);
  };

  const handleUserDetailsSuccess = async () => {
    if (pendingAction === "download") {
      await handleDownloadSourceCode();
    } else if (pendingAction === "json") {
      handleDownloadJSON();
    } else if (pendingAction === "deploy") {
      setShowGitHubDeploy(true);
    }
    setPendingAction(null);
  };

  const handleUserDetailsClose = () => {
    setPendingAction(null);
  };

  // Test functions for modal testing
  const handleTestGitHubSuccess = () => {
    setShowGitHubDeploy(true);
    // Simulate successful deployment
    setTimeout(() => {
      const mockDeploymentResult = {
        repoUrl: "https://github.com/testuser/test-portfolio",
        pagesUrl: "https://testuser.github.io/test-portfolio"
      };
      // We need to access the GitHubDeploy component's state directly
      // For now, we'll just open the modal - you can manually test the success state
    }, 100);
  };

  const handleTestDownloadSuccess = () => {
    setShowDownloadSuccess(true);
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-14 bg-[#171717] border-b border-gray-800 z-40 flex justify-between items-center px-4 animate-blur-in">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackClick}
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
              className={`px-3 py-2 h-8 text-sm transition-all duration-300 relative overflow-hidden ${
                showEditor
                  ? "bg-white text-black hover:bg-gray-200"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              } ${
                showEditorHint && !showEditor
                  ? "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r before:from-transparent before:via-gray-600 before:to-transparent before:animate-[shimmer_2s_ease-in-out_infinite] before:-translate-x-full"
                  : ""
              }`}
              style={{
                background:
                  showEditorHint && !showEditor
                    ? "linear-gradient(90deg, transparent, rgba(156, 163, 175, 0.1), transparent)"
                    : undefined,
              }}
            >
              {showEditor ? (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </>
              ) : (
                <>
                  <PanelLeft className="h-4 w-4 mr-2" />
                  Editor
                </>
              )}
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

          {/* Test buttons for modal testing - will be removed later */}
          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleTestGitHubSuccess}
              className="px-2 py-1 h-6 text-xs text-red-400 hover:text-red-300 hover:bg-gray-800"
            >
              Test GitHub
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleTestDownloadSuccess}
              className="px-2 py-1 h-6 text-xs text-red-400 hover:text-red-300 hover:bg-gray-800"
            >
              Test Download
            </Button>
          </div>
        </div>

        {/* Centered Device Toggle - Only show on desktop */}
        {!isMobile && (
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
            <DeviceToggle />
          </div>
        )}

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePublishClick}
                    disabled={!featureFlags.github_deploy_status}
                    className={`px-3 py-2 h-8 text-sm transition-all duration-300 ${
                      featureFlags.github_deploy_status
                        ? "text-gray-400 hover:text-white hover:bg-gray-800"
                        : "text-gray-600 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center">
                      {!featureFlags.github_deploy_status && (
                        <Lock className="h-3 w-3 mr-1" />
                      )}
                      <Github className="h-4 w-4 mr-2" />
                      {!isMobile && "Publish"}
                    </div>
                  </Button>
                </div>
              </TooltipTrigger>
              {!featureFlags.github_deploy_status && (
                <TooltipContent side="bottom">
                  <p className="text-sm">
                    Feature temporarily disabled due to high usage
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                disabled={isDownloadLoading}
                className="px-3 py-2 h-8 text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-300"
              >
                {isDownloadLoading ? (
                  <>
                    <div className="h-4 w-4 mr-2 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    {!isMobile && "Processing..."}
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    {!isMobile && "Download"}
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleDownloadSourceCodeClick}>
                <Download className="h-4 w-4 mr-2" />
                Download Source Code
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadJSONClick}>
                <Download className="h-4 w-4 mr-2" />
                Download JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <BackNavigationModal
        open={showBackModal}
        onOpenChange={setShowBackModal}
        onConfirm={handleBackConfirm}
      />

      <UserDetailsModal
        open={showUserDetails}
        onOpenChange={(open) => {
          setShowUserDetails(open);
          if (!open) {
            handleUserDetailsClose();
          }
        }}
        actionType={pendingAction === "json" ? "download" : (pendingAction || "download")}
        portfolioName={portfolioData.settings.name}
        onSuccess={handleUserDetailsSuccess}
      />

      <DownloadLoadingModal
        open={isDownloadLoading}
        downloadType={downloadType}
      />

      <DownloadSuccessModal
        open={showDownloadSuccess}
        onOpenChange={setShowDownloadSuccess}
        downloadType={downloadType}
        fileName={fileName}
      />

      <GitHubDeploy
        open={showGitHubDeploy}
        onOpenChange={setShowGitHubDeploy}
      />
    </>
  );
};

export default BuilderToolbar;
