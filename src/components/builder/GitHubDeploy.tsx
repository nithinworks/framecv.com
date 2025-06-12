
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePortfolio } from "@/context/PortfolioContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Loader2,
  Github,
  ExternalLink,
  AlertCircle,
  Key,
  CheckCircle,
  Info,
} from "lucide-react";

interface GitHubDeployProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GitHubDeploy: React.FC<GitHubDeployProps> = ({ open, onOpenChange }) => {
  const { portfolioData } = usePortfolio();
  const [repoName, setRepoName] = useState(
    `${portfolioData.settings.name
      .toLowerCase()
      .replace(/\s+/g, "-")}-portfolio`
  );
  const [githubToken, setGithubToken] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<{
    repoUrl: string;
    pagesUrl: string;
  } | null>(null);

  const handleDeploy = async () => {
    if (!githubToken.trim()) {
      toast.error("Please enter your GitHub token");
      return;
    }

    if (!repoName.trim()) {
      toast.error("Please enter a repository name");
      return;
    }

    setIsDeploying(true);

    try {
      const { data, error } = await supabase.functions.invoke("github-deploy", {
        body: {
          portfolioData,
          repoName: repoName.trim(),
          description: `Portfolio website for ${portfolioData.settings.name}`,
          githubToken: githubToken.trim(),
        },
      });

      if (error) {
        console.error("Publish error:", error);
        toast.error("Github Publishing Failed, Try downloading the source code and publishing on your own like that.");
        return;
      }

      setDeploymentResult({
        repoUrl: data.repoUrl,
        pagesUrl: data.pagesUrl,
      });

      toast.success("Portfolio published successfully!", {
        description: "Your portfolio is now live on GitHub Pages",
      });
    } catch (error) {
      console.error("Publish error:", error);
      toast.error("Github Publishing Failed, Try downloading the source code and publishing on your own like that.");
    } finally {
      setIsDeploying(false);
    }
  };

  const handleClose = () => {
    setDeploymentResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            {deploymentResult ? "Publishing Successful!" : "Publish to GitHub"}
          </DialogTitle>
          <DialogDescription>
            {deploymentResult
              ? "Your portfolio has been published to GitHub Pages. You can view your live site and repository below."
              : "Publish your portfolio to GitHub Pages by providing a GitHub token and repository details."}
          </DialogDescription>
        </DialogHeader>

        {deploymentResult ? (
          <div className="space-y-4">
            <div className="text-center text-green-600 dark:text-green-400">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <Github className="h-8 w-8" />
              </div>
              <p className="text-lg font-medium">Your portfolio is live!</p>
            </div>

            {/* Deployment timing warning - Updated with glassy look and better contrast */}
            <div className="bg-orange-50/80 dark:bg-orange-900/30 backdrop-blur-sm border border-orange-200/50 dark:border-orange-700/50 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-orange-900 dark:text-orange-100">
                  First-time deployment may take a few minutes
                </p>
                <p className="text-xs text-orange-800 dark:text-orange-200 mt-1">
                  GitHub Pages needs time to build and deploy your site. If the
                  live URL doesn't work immediately, please wait 2-5 minutes and
                  try again.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Live Website</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={deploymentResult.pagesUrl}
                    readOnly
                    className="text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(deploymentResult.pagesUrl, "_blank")
                    }
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Repository</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={deploymentResult.repoUrl}
                    readOnly
                    className="text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(deploymentResult.repoUrl, "_blank")
                    }
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Video Player at the top */}
            <div className="bg-gray-50/80 dark:bg-gray-900/30 border border-gray-200/50 dark:border-gray-700/50 rounded-lg p-3">
              <div className="aspect-video w-full">
                <iframe
                  src="https://player.cloudinary.com/embed/?cloud_name=naganithin&public_id=zkkueerlu9gokxngcp1a&profile=cld-default"
                  width="100%"
                  height="100%"
                  style={{ border: "none" }}
                  allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                  allowFullScreen
                  title="GitHub Token Tutorial"
                  className="rounded"
                />
              </div>
            </div>

            {/* Create Token Button & Info */}
            <div className="flex items-center justify-between bg-blue-50/80 dark:bg-blue-900/30 border border-blue-200/50 dark:border-blue-700/50 rounded-lg p-3 mb-2">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Need a GitHub token?&nbsp;
                </span>
              </div>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="border-blue-500 text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900"
              >
                <a
                  href="https://github.com/settings/tokens/new?type=classic&description=FrameCV%20Portfolio&scopes=repo,workflow"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Create Token
                </a>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground -mt-2 mb-2 flex items-center gap-1">
              <Info className="h-3 w-3" />
              You can generate a token directly on GitHub with this link.
            </p>

            {/* Token Input */}
            <div className="space-y-2">
              <Label htmlFor="githubToken" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                GitHub Personal Access Token
              </Label>
              <Input
                id="githubToken"
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                disabled={isDeploying}
              />
            </div>

            {/* Repo Name */}
            <div className="space-y-2">
              <Label htmlFor="repoName">Repository Name</Label>
              <Input
                id="repoName"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                placeholder="my-portfolio"
                disabled={isDeploying}
              />
            </div>

            {/* Publish Button */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isDeploying}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeploy}
                disabled={
                  isDeploying || !githubToken.trim() || !repoName.trim()
                }
              >
                {isDeploying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Github className="h-4 w-4 mr-2" />
                    Publish
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GitHubDeploy;
