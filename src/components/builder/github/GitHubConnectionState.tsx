
import React from "react";
import { Button } from "@/components/ui/button";
import { Github, Loader2, ShieldCheck } from "lucide-react";

interface GitHubConnectionStateProps {
  isConnecting: boolean;
  onConnect: () => void;
}

const GitHubConnectionState: React.FC<GitHubConnectionStateProps> = ({
  isConnecting,
  onConnect,
}) => {
  return (
    <div className="text-center py-4 sm:py-6 flex flex-col items-center px-2 sm:px-0">
      <Github className="h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-bold text-white mb-2">
        Connect your GitHub Account
      </h3>
      <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto leading-relaxed">
        Allow FrameCV to connect to your GitHub account to publish your
        portfolio directly.
      </p>

      <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-3 max-w-sm w-full text-left flex items-start gap-3 mb-6">
        <ShieldCheck className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-green-200">
          <p className="font-bold mb-1">Temporary & Secure Access</p>
          <p className="leading-relaxed">
            We use temporary permission to deploy your code to a new public
            repository.
          </p>
        </div>
      </div>

      <Button
        onClick={onConnect}
        disabled={isConnecting}
        className="w-full max-w-sm text-sm sm:text-base py-2.5"
      >
        {isConnecting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Github className="h-4 w-4 mr-2" />
            Connect to GitHub
          </>
        )}
      </Button>
    </div>
  );
};

export default GitHubConnectionState;
