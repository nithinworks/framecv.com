
import React from "react";
import { Button } from "@/components/ui/button";
import { Github, Lock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

interface PublishButtonProps {
  isEnabled: boolean;
  onPublishClick: () => void;
}

const PublishButton: React.FC<PublishButtonProps> = ({ isEnabled, onPublishClick }) => {
  const isMobile = useIsMobile();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={onPublishClick}
              disabled={!isEnabled}
              className={`px-3 py-2 h-8 text-sm transition-all duration-300 ${
                isEnabled
                  ? "text-gray-400 hover:text-white hover:bg-gray-800"
                  : "text-gray-600 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center">
                {!isEnabled && (
                  <Lock className="h-3 w-3 mr-1" />
                )}
                <Github className="h-4 w-4 mr-2" />
                {!isMobile && "Publish"}
              </div>
            </Button>
          </div>
        </TooltipTrigger>
        {!isEnabled && (
          <TooltipContent side="bottom">
            <p className="text-sm">
              Feature temporarily disabled due to high usage
            </p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default PublishButton;
