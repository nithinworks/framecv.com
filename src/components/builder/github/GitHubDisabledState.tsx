
import React from "react";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

interface GitHubDisabledStateProps {
  onClose: () => void;
}

const GitHubDisabledState: React.FC<GitHubDisabledStateProps> = ({ onClose }) => {
  return (
    <div className="space-y-4 px-2 sm:px-0">
      <div className="text-center py-6 sm:py-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
          <Github className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">
          Feature Temporarily Unavailable
        </h3>
        <p className="text-sm text-gray-400 leading-relaxed">
          GitHub publishing is currently disabled. Please try again later.
        </p>
      </div>

      <Button onClick={onClose} className="w-full text-sm sm:text-base py-2.5">
        Close
      </Button>
    </div>
  );
};

export default GitHubDisabledState;
