
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePortfolio } from "@/context/PortfolioContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Github, ExternalLink } from "lucide-react";

interface GitHubDeployProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GitHubDeploy: React.FC<GitHubDeployProps> = ({ open, onOpenChange }) => {
  const { portfolioData } = usePortfolio();
  const [repoName, setRepoName] = useState(`${portfolioData.settings.name.toLowerCase().replace(/\s+/g, '-')}-portfolio`);
  const [description, setDescription] = useState(`Portfolio website for ${portfolioData.settings.name}`);
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
      const { data, error } = await supabase.functions.invoke('github-deploy', {
        body: {
          portfolioData,
          repoName: repoName.trim(),
          description: description.trim(),
          githubToken: githubToken.trim()
        }
      });

      if (error) {
        console.error('Deploy error:', error);
        toast.error("Deployment failed. Please check your GitHub token and try again.");
        return;
      }

      setDeploymentResult({
        repoUrl: data.repoUrl,
        pagesUrl: data.pagesUrl
      });

      toast.success("Portfolio deployed successfully!", {
        description: "Your portfolio is now live on GitHub Pages"
      });

    } catch (error) {
      console.error('Deploy error:', error);
      toast.error("Deployment failed. Please try again.");
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            {deploymentResult ? "Deployment Successful!" : "Deploy to GitHub"}
          </DialogTitle>
        </DialogHeader>

        {deploymentResult ? (
          <div className="space-y-4">
            <div className="text-center text-green-600 dark:text-green-400">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <Github className="h-8 w-8" />
              </div>
              <p className="text-lg font-medium">Your portfolio is live!</p>
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
                    onClick={() => window.open(deploymentResult.pagesUrl, '_blank')}
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
                    onClick={() => window.open(deploymentResult.repoUrl, '_blank')}
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

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Portfolio website"
                disabled={isDeploying}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="githubToken">GitHub Personal Access Token</Label>
              <Input
                id="githubToken"
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                disabled={isDeploying}
              />
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Need a token?{" "}
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Create one here
                </a>
              </p>
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
                disabled={isDeploying || !githubToken.trim() || !repoName.trim()}
              >
                {isDeploying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Github className="h-4 w-4 mr-2" />
                    Deploy
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
