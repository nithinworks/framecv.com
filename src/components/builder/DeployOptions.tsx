
import React from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { Button } from "@/components/ui/button";
import { X, Github, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DeployOptions: React.FC = () => {
  const { showDeploy, setShowDeploy } = usePortfolio();
  const { toast } = useToast();

  const handleDeploy = (platform: string) => {
    toast({
      title: "Deployment initiated",
      description: `Preparing to deploy to ${platform}. This is a demo feature.`,
    });
  };

  return (
    <div
      className={`fixed top-[60px] right-0 bottom-0 w-80 bg-white border-l shadow-lg transition-all duration-300 z-30 ${
        showDeploy ? "" : "translate-x-full"
      }`}
    >
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="font-display font-semibold">Deploy Portfolio</h3>
        <Button variant="ghost" size="sm" onClick={() => setShowDeploy(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4">
        <p className="text-sm text-gray-600 mb-6">
          Deploy your portfolio to one of these platforms to share it with the world.
        </p>

        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Github className="h-5 w-5 mr-2" />
              <h3 className="font-semibold">GitHub Pages</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Publish your portfolio directly from your GitHub repository.
            </p>
            <Button
              className="w-full"
              onClick={() => handleDeploy("GitHub Pages")}
            >
              Deploy to GitHub Pages
            </Button>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center mb-3">
              <svg 
                className="h-5 w-5 mr-2" 
                viewBox="0 0 24 24" 
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M12.0001 0L23.1001 18.3599H0.900024L12.0001 0Z" 
                  fill="currentColor" 
                />
              </svg>
              <h3 className="font-semibold">Netlify</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Fast and secure hosting with continuous deployment.
            </p>
            <Button
              className="w-full"
              onClick={() => handleDeploy("Netlify")}
            >
              Deploy to Netlify
            </Button>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center mb-3">
              <svg 
                className="h-5 w-5 mr-2" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M12 2L2 19.9434H22L12 2Z" 
                  fill="currentColor" 
                />
              </svg>
              <h3 className="font-semibold">Vercel</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Deploy with zero configuration and global CDN.
            </p>
            <Button
              className="w-full"
              onClick={() => handleDeploy("Vercel")}
            >
              Deploy to Vercel
            </Button>
          </div>

          <div className="mt-8 text-center">
            <Button variant="outline" className="text-sm" onClick={() => window.open("#", "_blank")}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Learn more about deploying
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeployOptions;
