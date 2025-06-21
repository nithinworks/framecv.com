
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface BackNavigationProps {
  onBackClick: () => void;
}

const BackNavigation: React.FC<BackNavigationProps> = ({ onBackClick }) => {
  const isMobile = useIsMobile();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onBackClick}
      className="text-gray-400 hover:text-white hover:bg-gray-800 px-3 py-2 h-8 text-sm transition-all duration-300"
    >
      <ChevronLeft className="h-4 w-4 mr-1" />
      {!isMobile && "Back"}
    </Button>
  );
};

export default BackNavigation;
