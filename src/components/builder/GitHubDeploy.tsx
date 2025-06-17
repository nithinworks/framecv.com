import React, { useState, useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
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
  const { toast } = useToast();
  const { featureFlags } = useFeatureFlags();
  const [repoName, setRepoName] = useState(
    `${portfolioData.settings.name
      .toLowerCase()
      .replace(/\s+/g, "-")}-portfolio`
  );
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<{
    repoUrl: string;
    pagesUrl: string;
  } | null>(null);

  // Check for token in URL hash and handle connection state
  useEffect(() => {
    const handleTokenFromUrl = () => {
      console.log("Checking for GitHub token in URL...");
      const hash = window.location.hash;
      console.log("Current URL hash:", hash);

      if (hash.includes("github_token=")) {
        const token = hash.split("github_token=")[1].split("&")[0];
        console.log("Found GitHub token:", token ? "Yes" : "No");
        setGithubToken(token);
        toast({
          title: "GitHub Connected Successfully",
          description: "You can now publish your portfolio to GitHub Pages.",
        });
        // Clean the URL by removing the hash
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search
        );
      }
    };

    // Always check for token when dialog opens or component mounts
    if (open) {
      handleTokenFromUrl();
    }
  }, [open, toast]);

  const handleConnect = async () => {
    if (!featureFlags.github_deploy_status) {
      toast({
        title: "Feature temporarily unavailable",
        description:
          "GitHub publishing is currently disabled. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      console.log("Storing portfolio data before GitHub OAuth...");
      // Store portfolio data in sessionStorage before redirecting
      sessionStorage.setItem(
        "github_oauth_portfolio_data",
        JSON.stringify(portfolioData)
      );

      console.log("Redirecting to GitHub OAuth...");
      // Redirect to the 'github-auth-start' edge function
      const supabaseUrl = "https://rlnlbdrlruuoffnyaltc.supabase.co";
      window.location.href = `${supabaseUrl}/functions/v1/github-auth-start`;
    } catch (error) {
      console.error("Connection error:", error);
      toast({
        title: "Connection Failed",
        description:
          "Failed to connect to GitHub. You can download your portfolio and deploy it manually instead.",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  const handleDeploy = async () => {
    console.log("Starting deployment...");
    console.log("GitHub token present:", githubToken ? "Yes" : "No");
    console.log("Repo name:", repoName);

    // Check if GitHub deployment is enabled
    if (!featureFlags.github_deploy_status) {
      toast({
        title: "Feature temporarily unavailable",
        description:
          "GitHub publishing is currently disabled. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    if (!githubToken) {
      toast({
        title: "Error",
        description: "Please connect your GitHub account first.",
        variant: "destructive",
      });
      return;
    }

    if (!repoName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a repository name.",
        variant: "destructive",
      });
      return;
    }

    setIsDeploying(true);

    try {
      console.log("Calling github-deploy function...");
      // Call the github-deploy function without authentication
      const response = await fetch(
        `https://rlnlbdrlruuoffnyaltc.supabase.co/functions/v1/github-deploy`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            portfolioData,
            repoName: repoName.trim(),
            description: `Portfolio website for ${portfolioData.settings.name}`,
            githubToken: githubToken.trim(),
          }),
        }
      );

      console.log("Deploy response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Deploy response error:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Deploy response data:", data);

      // Track successful GitHub deployment
      try {
        await supabase.rpc("increment_portfolio_stat", {
          stat_type: "github_deploy",
        });
      } catch (error) {
        console.error("Failed to track portfolio stat:", error);
      }

      setDeploymentResult({
        repoUrl: data.repoUrl,
        pagesUrl: data.pagesUrl,
      });

      toast({
        title: "Portfolio published successfully!",
        description: "Your portfolio is now live on GitHub Pages",
      });
    } catch (error) {
      console.error("Publish error:", error);
      toast({
        title: "GitHub Publishing Failed",
        description:
          "Unable to publish to GitHub. You can download your portfolio and deploy it manually instead.",
        variant: "destructive",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const handleClose = () => {
    setDeploymentResult(null);
    setGithubToken(null); // Reset connection state when closing
    onOpenChange(false);
  };

  // If GitHub deployment is disabled, show a disabled state
  if (!featureFlags.github_deploy_status) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              Publish to GitHub
            </DialogTitle>
            <DialogDescription>
              GitHub publishing is currently unavailable.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Github className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Feature Temporarily Unavailable
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                GitHub publishing is currently disabled. Please try again later.
              </p>
            </div>

            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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
              : githubToken
              ? "Your GitHub account is connected. Enter a repository name to publish your portfolio."
              : "Connect your GitHub account to publish your portfolio directly to GitHub Pages."}
          </DialogDescription>
        </DialogHeader>

        {deploymentResult ? (
          <div className="space-y-4">
            <div className="text-center text-green-600 dark:text-green-400">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8" />
              </div>
              <p className="text-lg font-medium">Your portfolio is live!</p>
            </div>

            {/* Deployment timing warning */}
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
        ) : !githubToken ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Key className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Connect to GitHub
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              To publish your portfolio, you need to connect your GitHub
              account. This grants temporary permission to create a repository
              for you.
            </p>
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="min-w-[140px]"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Github className="h-4 w-4 mr-2" />
                  Connect to GitHub
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            <div className="p-3 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/50 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                GitHub account connected successfully!
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="repoName">Repository Name</Label>
              <Input
                id="repoName"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                placeholder="e.g., my-awesome-portfolio"
                disabled={isDeploying}
              />
            </div>

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
                disabled={isDeploying || !repoName.trim()}
                className="min-w-[120px]"
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GitHubDeploy;
