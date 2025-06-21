
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
  Globe,
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
      const hash = window.location.hash;

      if (hash.includes("github_token=")) {
        const token = hash.split("github_token=")[1].split("&")[0];
        setGithubToken(token);
        
        // Clear localStorage after successful OAuth
        localStorage.removeItem("github_oauth_portfolio_data");
        
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

    // Check for token when dialog opens
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
      // Store portfolio data in localStorage before redirecting
      localStorage.setItem(
        "github_oauth_portfolio_data",
        JSON.stringify(portfolioData)
      );

      // Redirect to the 'github-auth-start' edge function
      const supabaseUrl = "https://rlnlbdrlruuoffnyaltc.supabase.co";
      window.location.href = `${supabaseUrl}/functions/v1/github-auth-start`;
    } catch (error) {
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Track successful GitHub deployment
      try {
        await supabase.rpc("increment_portfolio_stat", {
          stat_type: "github_deploy",
        });
      } catch (error) {
        // Silent fail for analytics
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

          <div className="space-y-4">
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
                <Github className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                Feature Temporarily Unavailable
              </h3>
              <p className="text-sm text-gray-400">
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
      <DialogContent className="sm:max-w-lg bg-[#171717] border-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            {deploymentResult ? (
              <>
                <CheckCircle className="h-5 w-5 text-white" />
                🎉 Portfolio Published Successfully!
              </>
            ) : (
              <>
                <Github className="h-5 w-5" />
                Publish to GitHub
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {deploymentResult
              ? "Congratulations! Your portfolio is now live on GitHub Pages. Share it with the world!"
              : githubToken
              ? "Your GitHub account is connected. Enter a repository name to publish your portfolio."
              : "Connect your GitHub account to publish your portfolio directly to GitHub Pages."}
          </DialogDescription>
        </DialogHeader>

        {deploymentResult ? (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Your portfolio is live! 🚀
              </h3>
              <p className="text-sm text-gray-400">
                Your beautiful portfolio is now accessible to anyone on the internet.
              </p>
            </div>

            {/* Deployment timing warning */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-white mb-1">
                  First-time deployment may take a few minutes
                </p>
                <p className="text-xs text-gray-400">
                  GitHub Pages needs time to build and deploy your site. If the
                  live URL doesn't work immediately, please wait 2-5 minutes and
                  try again.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base font-medium text-white">
                  <Globe className="h-4 w-4 text-white" />
                  Live Website
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={deploymentResult.pagesUrl}
                    readOnly
                    className="text-sm bg-gray-800 border-gray-700 text-white"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(deploymentResult.pagesUrl, "_blank")
                    }
                    className="border-gray-700 hover:bg-gray-800 text-white"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base font-medium text-white">
                  <Github className="h-4 w-4 text-white" />
                  Repository
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={deploymentResult.repoUrl}
                    readOnly
                    className="text-sm bg-gray-800 border-gray-700 text-white"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(deploymentResult.repoUrl, "_blank")
                    }
                    className="border-gray-700 hover:bg-gray-800 text-white"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Button onClick={handleClose} className="w-full">
              Awesome! Close
            </Button>
          </div>
        ) : !githubToken ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
              <Key className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              Connect to GitHub
            </h3>
            <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
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
            <div className="p-3 rounded-md bg-gray-800 border border-gray-700 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-white" />
              <p className="text-sm font-medium text-white">
                GitHub account connected successfully!
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="repoName" className="text-white">Repository Name</Label>
              <Input
                id="repoName"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                placeholder="e.g., my-awesome-portfolio"
                disabled={isDeploying}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isDeploying}
                className="border-gray-700 text-white hover:bg-gray-800"
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
