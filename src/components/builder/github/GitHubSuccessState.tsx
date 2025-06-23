
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, AlertCircle, Globe, Github, ExternalLink } from "lucide-react";

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
    <div className="space-y-6 px-2 sm:px-0">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700">
          <CheckCircle className="h-10 w-10 text-white" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
          Your portfolio is live! 🚀
        </h3>
        <p className="text-sm text-gray-400 leading-relaxed">
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
          <p className="text-xs text-gray-400 leading-relaxed">
            GitHub Pages needs time to build and deploy your site. If the
            live URL doesn't work immediately, please wait 2-5 minutes and
            try again.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm sm:text-base font-medium text-white">
            <Globe className="h-4 w-4 text-white" />
            Live Website
          </Label>
          <div className="flex items-center gap-2">
            <Input
              value={deploymentResult.pagesUrl}
              readOnly
              className="text-xs sm:text-sm bg-gray-800 border-gray-700 text-white"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                window.open(deploymentResult.pagesUrl, "_blank")
              }
              className="border-gray-700 hover:bg-gray-800 text-white flex-shrink-0"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm sm:text-base font-medium text-white">
            <Github className="h-4 w-4 text-white" />
            Repository
          </Label>
          <div className="flex items-center gap-2">
            <Input
              value={deploymentResult.repoUrl}
              readOnly
              className="text-xs sm:text-sm bg-gray-800 border-gray-700 text-white"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                window.open(deploymentResult.repoUrl, "_blank")
              }
              className="border-gray-700 hover:bg-gray-800 text-white flex-shrink-0"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Button onClick={onClose} className="w-full text-sm sm:text-base py-2.5">
        Awesome! Close
      </Button>
    </div>
  );
};

export default GitHubSuccessState;
