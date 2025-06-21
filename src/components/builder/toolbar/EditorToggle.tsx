
import React from "react";
import { Button } from "@/components/ui/button";
import { PanelLeft, Eye } from "lucide-react";
import { usePortfolio } from "@/context/PortfolioContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface EditorToggleProps {
  showEditorHint?: boolean;
}

const EditorToggle: React.FC<EditorToggleProps> = ({ showEditorHint = false }) => {
  const { showEditor, setShowEditor } = usePortfolio();
  const isMobile = useIsMobile();

  return (
    <div className="relative">
      <Button
        variant={showEditor ? "default" : "ghost"}
        size="sm"
        onClick={() => setShowEditor(!showEditor)}
        className={`px-3 py-2 h-8 text-sm transition-all duration-300 relative overflow-hidden ${
          showEditor
            ? "bg-white text-black hover:bg-gray-200"
            : "text-gray-400 hover:text-white hover:bg-gray-800"
        } ${
          showEditorHint && !showEditor
            ? "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r before:from-transparent before:via-gray-600 before:to-transparent before:animate-[shimmer_2s_ease-in-out_infinite] before:-translate-x-full"
            : ""
        }`}
        style={{
          background:
            showEditorHint && !showEditor
              ? "linear-gradient(90deg, transparent, rgba(156, 163, 175, 0.1), transparent)"
              : undefined,
        }}
      >
        {showEditor ? (
          <>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </>
        ) : (
          <>
            <PanelLeft className="h-4 w-4 mr-2" />
            Editor
          </>
        )}
      </Button>

      {showEditorHint && !showEditor && !isMobile && (
        <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 z-50 animate-fade-in">
          <div className="bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-xs font-medium relative whitespace-nowrap">
            <span>Click to edit</span>
            <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-[4px] border-b-[4px] border-r-[4px] border-transparent border-r-gray-800"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorToggle;
