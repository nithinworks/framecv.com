
import { useState, useEffect } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";

export const useGitHubDeploy = (open: boolean) => {
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
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [portfolioName] = useState(portfolioData.settings.name);

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

      // Show user details modal after successful deployment
      setShowUserDetails(true);

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

  const resetState = () => {
    setDeploymentResult(null);
    setGithubToken(null);
    setShowUserDetails(false);
  };

  return {
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
  };
};
