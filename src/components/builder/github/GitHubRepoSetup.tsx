import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Github, CheckCircle, Loader2 } from "lucide-react";

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
    <div className="flex flex-col items-center text-center gap-4 p-4">
      <div className="flex items-center gap-2 text-sm text-green-400">
        <CheckCircle className="h-5 w-5" />
        <p>GitHub account connected!</p>
      </div>

      <div className="w-full max-w-sm space-y-2 text-left">
        <Label htmlFor="repoName" className="text-white">
          Repository Name
        </Label>
        <Input
          id="repoName"
          value={repoName}
          onChange={(e) => setRepoName(e.target.value)}
          placeholder="e.g., my-awesome-portfolio"
          disabled={isDeploying}
          className="bg-gray-800 border-gray-700 text-white"
        />
      </div>

      <div className="w-full max-w-sm flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-4">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isDeploying}
          className="border-gray-700 text-white hover:bg-gray-800"
        >
          Cancel
        </Button>
        <Button
          onClick={onDeploy}
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
    </div>
  );
};

export default GitHubRepoSetup;
