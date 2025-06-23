
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Github, CheckCircle, Loader2, Sparkles } from "lucide-react";

interface GitHubRepoSetupProps {
  repoName: string;
  setRepoName: (name: string) => void;
  isDeploying: boolean;
  onDeploy: () => void;
  onClose: () => void;
}

const GitHubRepoSetup: React.FC<GitHubRepoSetupProps> = ({
  repoName,
  setRepoName,
  isDeploying,
  onDeploy,
  onClose,
}) => {
  return (
    <div className="space-y-6 p-2">
      {/* Success Connection Banner */}
      <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-500/30 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
          </div>
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-green-400">GitHub Connected Successfully!</p>
              <Sparkles className="h-4 w-4 text-green-400" />
            </div>
            <p className="text-sm text-green-200/80">
              Your account is ready for deployment. Enter a repository name to continue.
            </p>
          </div>
        </div>
      </div>

      {/* Repository Configuration */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="repoName" className="text-white font-medium">
            Repository Name
          </Label>
          <div className="relative">
            <Input
              id="repoName"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              placeholder="e.g., my-awesome-portfolio"
              disabled={isDeploying}
              className="bg-gray-800/50 border-gray-700 text-white focus:border-green-500/50 focus:ring-green-500/20 pr-10"
            />
            <Github className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <p className="text-xs text-gray-400">
            This will create a new public repository on your GitHub account
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeploying}
            className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={onDeploy}
            disabled={isDeploying || !repoName.trim()}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 min-w-[140px] font-medium"
          >
            {isDeploying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Github className="h-4 w-4 mr-2" />
                Publish to GitHub
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GitHubRepoSetup;
