import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  AlertCircle,
  Globe,
  Github,
  ExternalLink,
} from "lucide-react";

interface GitHubSuccessStateProps {
  deploymentResult: {
    repoUrl: string;
    pagesUrl: string;
  };
  onClose: () => void;
}

const GitHubSuccessState: React.FC<GitHubSuccessStateProps> = ({
  deploymentResult,
  onClose,
}) => {
  return (
    <div className="flex flex-col items-center text-center gap-4 p-4">
      <h3 className="text-xl font-semibold text-white mb-1 mt-2">
        Your portfolio is live! 🥳
      </h3>
      <p className="text-sm text-gray-400 max-w-sm">
        Congratulations! Your portfolio is now accessible on the internet.
      </p>

      <div className="w-full max-w-sm flex flex-col gap-3 mt-4">
        <Button
          onClick={() => window.open(deploymentResult.pagesUrl, "_blank")}
          className="w-full"
        >
          <Globe className="h-4 w-4 mr-2" />
          View Live Website
        </Button>
        <Button
          variant="outline"
          onClick={() => window.open(deploymentResult.repoUrl, "_blank")}
          className="w-full border-gray-700 text-white hover:bg-gray-800"
        >
          <Github className="h-4 w-4 mr-2" />
          View Repository
        </Button>
      </div>

      {/* Deployment timing warning */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 max-w-sm w-full text-left flex items-start gap-3 mt-2">
        <AlertCircle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-gray-400">
          <p className="font-semibold text-white mb-1">
            First-time deployment takes time
          </p>
          <p>
            If the live URL isn't working yet, please wait 2-5 minutes and
            refresh the live site.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GitHubSuccessState;
