
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
        setTimeout(resetForm, 300);
      }
    }}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] bg-[#0f0f0f] border-gray-800 flex flex-col">
        <DialogHeader className="space-y-4 pb-4 flex-shrink-0">
          <DialogTitle className="flex items-center gap-3 text-xl font-medium text-white">
            <Github className="h-6 w-6" />
            Deploy to GitHub Pages
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-base leading-relaxed">
            Deploy your portfolio as a GitHub repository with automatic GitHub Pages hosting.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          {!deployResult && (
            <>
              {/* Instructions */}
              <Alert className="bg-gray-900/50 border-gray-800 p-4">
                <AlertDescription className="text-gray-300">
                  <div className="space-y-4">
                    <div className="text-base font-medium text-white">
                      Step 1: Create a GitHub Personal Access Token
                    </div>
                    <div className="text-sm text-gray-400 space-y-2 pl-0">
                      <div className="flex items-start gap-3">
                        <span className="text-white font-mono text-xs bg-gray-800 px-2 py-1 rounded min-w-[20px] text-center">1</span>
                        <span>Go to{" "}
                          <a
                            href="https://github.com/settings/tokens/new"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-1 transition-colors"
                          >
                            GitHub Token Settings
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-white font-mono text-xs bg-gray-800 px-2 py-1 rounded min-w-[20px] text-center">2</span>
                        <span>Give it a name like "Portfolio Deploy"</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-white font-mono text-xs bg-gray-800 px-2 py-1 rounded min-w-[20px] text-center">3</span>
                        <span>Select expiration (30 days recommended)</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-white font-mono text-xs bg-gray-800 px-2 py-1 rounded min-w-[20px] text-center">4</span>
                        <span>Check: <code className="bg-gray-800 px-2 py-1 rounded text-xs text-white font-mono">repo</code> permission</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-white font-mono text-xs bg-gray-800 px-2 py-1 rounded min-w-[20px] text-center">5</span>
                        <span>Click "Generate token" and copy it</span>
                      </div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Form */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="accessToken" className="text-white text-sm font-medium">
                    GitHub Personal Access Token *
                  </Label>
                  <Input
                    id="accessToken"
                    type="password"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    className="h-11 bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-gray-600 focus:ring-gray-600"
                  />
                  <p className="text-xs text-gray-500 leading-relaxed">
                    This token is only used for this deployment and is not stored.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="repoName" className="text-white text-sm font-medium">
                    Repository Name *
                  </Label>
                  <Input
                    id="repoName"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    placeholder="my-portfolio"
                    className="h-11 bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-gray-600 focus:ring-gray-600"
                  />
                  <p className="text-xs text-gray-500 leading-relaxed">
                    This will be your GitHub repository name (must be unique in your account).
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Results */}
          {deployResult && (
            <div className="space-y-5">
              {deployResult.success ? (
                <Alert className="border-green-700/50 bg-green-900/20 p-5">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <AlertDescription className="text-green-300">
                    <div className="space-y-4">
                      <div className="text-lg font-medium text-green-200">
                        ✅ Deployment Successful!
                      </div>
                      
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-green-200">GitHub Repository:</div>
                          <div className="flex items-center gap-2">
                            <code className="bg-gray-900 px-3 py-2 rounded-lg text-sm flex-1 text-white font-mono border border-gray-700">
                              {deployResult.repoUrl}
                            </code>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(deployResult.repoUrl!)}
                              className="h-9 w-9 p-0 border-gray-700 hover:bg-gray-800"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(deployResult.repoUrl, "_blank")}
                              className="h-9 w-9 p-0 border-gray-700 hover:bg-gray-800"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm font-medium text-green-200">Live Website:</div>
                          <div className="flex items-center gap-2">
                            <code className="bg-gray-900 px-3 py-2 rounded-lg text-sm flex-1 text-white font-mono border border-gray-700">
                              {deployResult.pagesUrl}
                            </code>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(deployResult.pagesUrl!)}
                              className="h-9 w-9 p-0 border-gray-700 hover:bg-gray-800"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(deployResult.pagesUrl, "_blank")}
                              className="h-9 w-9 p-0 border-gray-700 hover:bg-gray-800"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="text-sm text-green-400 bg-green-900/30 p-3 rounded-lg border border-green-700/30">
                        <strong>Note:</strong> GitHub Pages may take a few minutes to be available after first deployment.
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-red-700/50 bg-red-900/20 p-5">
                  <AlertDescription className="text-red-300">
                    <div className="space-y-3">
                      <div className="text-lg font-medium text-red-200">❌ Deployment Failed</div>
                      <div className="text-sm bg-red-900/30 p-3 rounded-lg border border-red-700/30">
                        {deployResult.error || "An unknown error occurred"}
                      </div>
                      <div className="text-xs text-red-400">
                        Please check that your access token has the correct permissions and try again.
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={resetForm}
                variant="outline"
                className="w-full h-11 text-base border-gray-700 hover:bg-gray-800 text-white"
              >
                Deploy Another Portfolio
              </Button>
            </div>
          )}
        </div>

        {/* Fixed Footer with Deploy Button */}
        {!deployResult && (
          <div className="flex-shrink-0 pt-4 border-t border-gray-800 mt-4">
            <Button
              onClick={handleDeploy}
              disabled={isDeploying || !accessToken.trim() || !repoName.trim()}
              className="w-full h-12 text-base font-medium bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              size="lg"
            >
              {isDeploying ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Github className="mr-3 h-5 w-5" />
                  Deploy to GitHub
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GitHubDeploy;
