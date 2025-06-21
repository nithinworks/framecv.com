
import React from "react";
import { Button } from "@/components/ui/button";
import { Github, Key, Loader2 } from "lucide-react";

interface GitHubConnectionStateProps {
  isConnecting: boolean;
  onConnect: () => void;
}

const GitHubConnectionState: React.FC<GitHubConnectionStateProps> = ({
  isConnecting,
  onConnect,
}) => {
  return (
    <div className="text-center py-6">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
        <Key className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">
        Connect to GitHub
      </h3>
      <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
        To publish your portfolio, you need to connect your GitHub
        account. This grants temporary permission to create a repository
        for you.
      </p>
      <Button
        onClick={onConnect}
        disabled={isConnecting}
        className="min-w-[140px]"
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
