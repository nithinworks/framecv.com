
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useBuilderToolbar } from "@/hooks/useBuilderToolbar";
import BackNavigation from "./toolbar/BackNavigation";
import EditorToggle from "./toolbar/EditorToggle";
import PublishButton from "./toolbar/PublishButton";
import DownloadDropdown from "./toolbar/DownloadDropdown";
import DeviceToggle from "./DeviceToggle";
import BackNavigationModal from "./BackNavigationModal";
import UserDetailsModal from "./UserDetailsModal";
import DownloadLoadingModal from "./DownloadLoadingModal";
import DownloadSuccessModal from "./DownloadSuccessModal";
import GitHubDeploy from "./GitHubDeploy";

interface BuilderToolbarProps {
  showEditorHint?: boolean;
}

const BuilderToolbar: React.FC<BuilderToolbarProps> = ({
  showEditorHint = false,
}) => {
  const isMobile = useIsMobile();
  const {
    portfolioData,
    featureFlags,
    showGitHubDeploy,
    setShowGitHubDeploy,
    showUserDetails,
    setShowUserDetails,
    showBackModal,
    setShowBackModal,
    pendingAction,
    isDownloadLoading,
    showDownloadSuccess,
    downloadType,
    fileName,
    setShowDownloadSuccess,
    handleBackClick,
    handleBackConfirm,
    handleDownloadSourceCodeClick,
    handleDownloadJSONClick,
    handlePublishClick,
    handleUserDetailsSuccess,
    handleUserDetailsClose,
  } = useBuilderToolbar();

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-14 bg-[#171717] border-b border-gray-800 z-40 flex justify-between items-center px-4 animate-blur-in">
        <div className="flex items-center gap-3">
          <BackNavigation onBackClick={handleBackClick} />

          <div className="h-4 w-px bg-gray-800"></div>

          <EditorToggle showEditorHint={showEditorHint} />
        </div>

        {/* Centered Device Toggle - Only show on desktop */}
        {!isMobile && (
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
            <DeviceToggle />
          </div>
        )}

        <div className="flex items-center gap-2">
          <PublishButton
            isEnabled={featureFlags.github_deploy_status}
            onPublishClick={handlePublishClick}
          />

          <DownloadDropdown
            isLoading={isDownloadLoading}
            onDownloadSourceCode={handleDownloadSourceCodeClick}
            onDownloadJSON={handleDownloadJSONClick}
          />
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
