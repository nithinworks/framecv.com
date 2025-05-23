
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  PanelLeft, 
  Code, 
  Upload, 
  ChevronLeft
} from "lucide-react";
import { usePortfolio } from "@/context/PortfolioContext";
import { useNavigate } from "react-router-dom";

const BuilderToolbar: React.FC = () => {
  const { 
    showEditor, 
    setShowEditor,
    showCode,
    setShowCode,
    showDeploy,
    setShowDeploy
  } = usePortfolio();
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 right-0 h-[60px] bg-white border-b shadow-sm z-40 flex justify-between items-center px-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="text-gray-600"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>

        <div className="h-6 border-r border-gray-300"></div>

        <Button
          variant={showEditor ? "default" : "outline"}
          size="sm"
          onClick={() => setShowEditor(!showEditor)}
        >
          <PanelLeft className="h-4 w-4 mr-2" />
          Editor
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant={showCode ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setShowCode(!showCode);
            if (!showCode) {
              setShowDeploy(false);
            }
          }}
        >
          <Code className="h-4 w-4 mr-2" />
          View Code
        </Button>

        <Button
          variant={showDeploy ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setShowDeploy(!showDeploy);
            if (!showDeploy) {
              setShowCode(false);
            }
          }}
        >
          <Upload className="h-4 w-4 mr-2" />
          Deploy
        </Button>
      </div>
    </div>
  );
};

export default BuilderToolbar;
