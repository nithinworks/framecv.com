
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Github, ExternalLink, Copy, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePortfolio } from "@/context/PortfolioContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GitHubDeployProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GitHubDeploy: React.FC<GitHubDeployProps> = ({ open, onOpenChange }) => {
  const { portfolioData } = usePortfolio();
  const [accessToken, setAccessToken] = useState("");
  const [repoName, setRepoName] = useState(
    `${portfolioData.settings.name.toLowerCase().replace(/\s+/g, "-")}-portfolio`
  );
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<{
    success: boolean;
    repoUrl?: string;
    pagesUrl?: string;
    username?: string;
    repoName?: string;
    error?: string;
  } | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleDeploy = async () => {
    if (!accessToken.trim() || !repoName.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsDeploying(true);
    setDeployResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('github-deploy', {
        body: {
          accessToken: accessToken.trim(),
          repoName: repoName.trim(),
          portfolioData
        }
      });

      if (error) {
        console.error('GitHub deploy error:', error);
        setDeployResult({
          success: false,
          error: error.message || 'Failed to deploy to GitHub'
        });
      } else if (data) {
        setDeployResult(data);
        if (data.success) {
          toast.success("Portfolio deployed successfully!");
        }
      }
    } catch (error) {
      console.error('GitHub deploy error:', error);
      setDeployResult({
        success: false,
        error: 'Failed to deploy to GitHub'
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const resetForm = () => {
    setAccessToken("");
    setRepoName(`${portfolioData.settings.name.toLowerCase().replace(/\s+/g, "-")}-portfolio`);
    setDeployResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      onOpenChange(newOpen);
      if (!newOpen) {
        setTimeout(resetForm, 300); // Reset after dialog closes
      }
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Deploy to GitHub Pages
          </DialogTitle>
          <DialogDescription>
            Deploy your portfolio as a GitHub repository with automatic GitHub Pages hosting.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!deployResult && (
            <>
              {/* Instructions */}
              <Alert>
                <AlertDescription>
                  <div className="space-y-3">
                    <div>
                      <strong>Step 1:</strong> Create a GitHub Personal Access Token
                    </div>
                    <div className="text-sm text-muted-foreground pl-4">
                      1. Go to{" "}
                      <a
                        href="https://github.com/settings/tokens/new"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        GitHub Token Settings
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <br />
                      2. Give it a name like "Portfolio Deploy"
                      <br />
                      3. Select expiration (30 days recommended)
                      <br />
                      4. Check these permissions: <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">repo</code> (Full control of private repositories)
                      <br />
                      5. Click "Generate token" and copy it
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="accessToken">GitHub Personal Access Token *</Label>
                  <Input
                    id="accessToken"
                    type="password"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This token is only used for this deployment and is not stored.
                  </p>
                </div>

                <div>
                  <Label htmlFor="repoName">Repository Name *</Label>
                  <Input
                    id="repoName"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    placeholder="my-portfolio"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This will be your GitHub repository name (must be unique in your account).
                  </p>
                </div>
              </div>

              {/* Deploy Button */}
              <Button
                onClick={handleDeploy}
                disabled={isDeploying || !accessToken.trim() || !repoName.trim()}
                className="w-full"
                size="lg"
              >
                {isDeploying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Github className="mr-2 h-4 w-4" />
                    Deploy to GitHub
                  </>
                )}
              </Button>
            </>
          )}

          {/* Results */}
          {deployResult && (
            <div className="space-y-4">
              {deployResult.success ? (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <div className="space-y-3">
                      <div className="font-medium">✅ Deployment Successful!</div>
                      
                      <div className="space-y-2">
                        <div>
                          <strong>GitHub Repository:</strong>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="bg-white px-2 py-1 rounded text-sm flex-1">
                              {deployResult.repoUrl}
                            </code>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(deployResult.repoUrl!)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(deployResult.repoUrl, "_blank")}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div>
                          <strong>Live Website:</strong>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="bg-white px-2 py-1 rounded text-sm flex-1">
                              {deployResult.pagesUrl}
                            </code>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(deployResult.pagesUrl!)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(deployResult.pagesUrl, "_blank")}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="text-sm">
                        <strong>Note:</strong> GitHub Pages may take a few minutes to be available after first deployment.
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="font-medium">❌ Deployment Failed</div>
                      <div className="text-sm">
                        {deployResult.error || "An unknown error occurred"}
                      </div>
                      <div className="text-xs">
                        Please check that your access token has the correct permissions and try again.
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={resetForm}
                variant="outline"
                className="w-full"
              >
                Deploy Another Portfolio
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GitHubDeploy;
