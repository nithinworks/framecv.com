
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
    <div className="space-y-4 px-2 sm:px-0">
      <div className="p-3 rounded-md bg-gray-800 border border-gray-700 flex items-center gap-3">
        <CheckCircle className="h-5 w-5 text-white flex-shrink-0" />
        <p className="text-sm font-medium text-white">
          GitHub account connected successfully!
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="repoName" className="text-white text-sm sm:text-base">Repository Name</Label>
        <Input
          id="repoName"
          value={repoName}
          onChange={(e) => setRepoName(e.target.value)}
          placeholder="e.g., my-awesome-portfolio"
          disabled={isDeploying}
          className="bg-gray-800 border-gray-700 text-white text-sm sm:text-base"
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isDeploying}
          className="border-gray-700 text-white hover:bg-gray-800 w-full sm:w-auto text-sm sm:text-base py-2.5"
        >
          Cancel
        </Button>
        <Button
          onClick={onDeploy}
          disabled={isDeploying || !repoName.trim()}
          className="min-w-[120px] w-full sm:w-auto text-sm sm:text-base py-2.5"
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
