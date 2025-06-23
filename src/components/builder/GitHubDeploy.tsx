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
  } = useGitHubDeploy(open);

  const handleClose = () => {
    resetState();
    onOpenChange(false);
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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-[#171717] border-gray-800">
        {deploymentResult ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-white">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Portfolio Published
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Your portfolio is now live on GitHub Pages.
              </DialogDescription>
            </DialogHeader>
            <GitHubSuccessState
              deploymentResult={deploymentResult}
              onClose={handleClose}
            />
          </>
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
  );
};

export default GitHubDeploy;
