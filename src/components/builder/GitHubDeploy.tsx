
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Github, CheckCircle } from "lucide-react";
import { useGitHubDeploy } from "@/hooks/useGitHubDeploy";
import GitHubDisabledState from "./github/GitHubDisabledState";
import GitHubConnectionState from "./github/GitHubConnectionState";
import GitHubRepoSetup from "./github/GitHubRepoSetup";
import GitHubSuccessState from "./github/GitHubSuccessState";
import UserDetailsModal from "./UserDetailsModal";

interface GitHubDeployProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GitHubDeploy: React.FC<GitHubDeployProps> = ({ open, onOpenChange }) => {
  const {
    featureFlags,
    repoName,
    setRepoName,
    githubToken,
    isDeploying,
    isConnecting,
    deploymentResult,
    handleConnect,
    handleDeploy,
    resetState,
    showUserDetails,
    setShowUserDetails,
    portfolioName,
  } = useGitHubDeploy(open);

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const handleDeploySuccess = () => {
    setShowUserDetails(false);
    // The actual deployment will be handled by the deploy function
  };

  // If GitHub deployment is disabled, show a disabled state
  if (!featureFlags.github_deploy_status) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md bg-[#171717] border-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Github className="h-5 w-5" />
              Publish to GitHub
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              GitHub publishing is currently unavailable.
            </DialogDescription>
          </DialogHeader>

          <GitHubDisabledState onClose={handleClose} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg bg-[#171717] border-gray-800">
          {deploymentResult ? (
            <GitHubSuccessState
              deploymentResult={deploymentResult}
              onClose={handleClose}
            />
          ) : !githubToken ? (
            <GitHubConnectionState
              isConnecting={isConnecting}
              onConnect={handleConnect}
            />
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-white">
                  <Github className="h-5 w-5" />
                  Configure and Publish
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Your GitHub account is connected. Enter a repository name to
                  publish.
                </DialogDescription>
              </DialogHeader>
              <GitHubRepoSetup
                repoName={repoName}
                setRepoName={setRepoName}
                isDeploying={isDeploying}
                onDeploy={handleDeploy}
                onClose={handleClose}
              />
            </>
          )}
        </DialogContent>
      </Dialog>

      <UserDetailsModal
        open={showUserDetails}
        onOpenChange={setShowUserDetails}
        actionType="deploy"
        portfolioName={portfolioName}
        portfolioLink={deploymentResult?.pagesUrl}
        onSuccess={handleDeploySuccess}
      />
    </>
  );
};

export default GitHubDeploy;
