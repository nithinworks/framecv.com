
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";

interface DownloadDropdownProps {
  isLoading: boolean;
  onDownloadSourceCode: () => void;
  onDownloadJSON: () => void;
}

const DownloadDropdown: React.FC<DownloadDropdownProps> = ({
  isLoading,
  onDownloadSourceCode,
  onDownloadJSON,
}) => {
  const isMobile = useIsMobile();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={isLoading}
          className="px-3 py-2 h-8 text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-300"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 mr-2 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              {!isMobile && "Processing..."}
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              {!isMobile && "Download"}
              <ChevronDown className="h-3 w-3 ml-1" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={onDownloadSourceCode}>
          <Download className="h-4 w-4 mr-2" />
          Download Source Code
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDownloadJSON}>
          <Download className="h-4 w-4 mr-2" />
          Download JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DownloadDropdown;
