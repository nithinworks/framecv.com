
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

      toast.success("Portfolio deployed successfully!", {
        description: "Your portfolio is now live on GitHub Pages",
        action: {
          label: "View Repository",
          onClick: () => window.open(data.repoUrl, '_blank')
        }
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Deploy error:', error);
      toast.error("Deployment failed. Please try again.");
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Deploy to GitHub
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4 p-1">
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
                Need a token? Create one at{" "}
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  GitHub Settings
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2">What happens next:</h4>
              <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Creates a new repository on your GitHub account</li>
                <li>• Uploads your portfolio files</li>
                <li>• Enables GitHub Pages for automatic deployment</li>
                <li>• Your portfolio will be live at username.github.io/repo-name</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeploying}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeploy}
            disabled={isDeploying || !githubToken.trim() || !repoName.trim()}
            className="min-w-[120px]"
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
      </DialogContent>
    </Dialog>
  );
};

export default GitHubDeploy;
