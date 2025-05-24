import React, { useState } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { Button } from "@/components/ui/button";
import { X, Github, ExternalLink, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DeploymentResult {
  success: boolean;
  url?: string;
  adminUrl?: string;
  error?: string;
}

const DeployOptions: React.FC = () => {
  const { showDeploy, setShowDeploy, portfolioData } = usePortfolio();
  const { toast } = useToast();
  
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<string>("");
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [siteName, setSiteName] = useState("");

  const handleNetlifyDeploy = async () => {
    try {
      setShowDeployModal(true);
      setIsDeploying(true);
      setDeploymentStatus("Connecting to Netlify...");
      setDeploymentResult(null);

      // Step 1: Get OAuth URL
      const { data: authData, error: authError } = await supabase.functions.invoke('netlify-auth');
      
      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData?.authUrl) {
        throw new Error('Failed to get Netlify authorization URL');
      }

      setDeploymentStatus("Please authorize Netlify access...");
      console.log('Opening OAuth URL:', authData.authUrl);

      // Step 2: Open OAuth popup with proper settings to avoid sandbox restrictions
      const popup = window.open(
        authData.authUrl,
        'netlify-auth',
        'width=600,height=700,scrollbars=yes,resizable=yes,menubar=no,toolbar=no,location=yes'
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups and try again.');
      }

      // Step 3: Wait for OAuth callback with improved polling and message handling
      const accessToken = await new Promise<string>((resolve, reject) => {
        let messageReceived = false;
        let pollCount = 0;
        const maxPolls = 300; // 5 minutes at 1 second intervals
        
        const handleMessage = (event: MessageEvent) => {
          console.log('Received message from:', event.origin, 'Data:', event.data);
          
          // Accept messages from Supabase domains or the popup itself
          if (!event.origin.includes('supabase.co') && event.origin !== window.location.origin) {
            console.log('Ignoring message from:', event.origin);
            return;
          }
          
          if (event.data.type === 'NETLIFY_AUTH_SUCCESS' && !messageReceived) {
            messageReceived = true;
            window.removeEventListener('message', handleMessage);
            clearInterval(pollInterval);
            console.log('OAuth success, access token received');
            resolve(event.data.accessToken);
          } else if (event.data.type === 'NETLIFY_AUTH_ERROR' && !messageReceived) {
            messageReceived = true;
            window.removeEventListener('message', handleMessage);
            clearInterval(pollInterval);
            reject(new Error(event.data.error || 'Authorization failed'));
          }
        };

        // Add message listener
        window.addEventListener('message', handleMessage);

        // Poll for popup status and try to communicate
        const pollInterval = setInterval(() => {
          pollCount++;
          
          if (popup.closed && !messageReceived) {
            messageReceived = true;
            clearInterval(pollInterval);
            window.removeEventListener('message', handleMessage);
            reject(new Error('Authorization was cancelled'));
            return;
          }

          // Try to check if popup has navigated to our callback
          try {
            if (popup.location && popup.location.href.includes('netlify-callback')) {
              console.log('Popup navigated to callback URL');
              // Try to access the popup content
              try {
                const popupDoc = popup.document;
                if (popupDoc && popupDoc.body) {
                  console.log('Trying to extract token from popup document');
                  // Look for script content that might contain our token
                  const scripts = popupDoc.getElementsByTagName('script');
                  for (let script of scripts) {
                    if (script.textContent && script.textContent.includes('NETLIFY_AUTH_SUCCESS')) {
                      console.log('Found success script in popup');
                      // Try to execute the postMessage manually
                      try {
                        const match = script.textContent.match(/accessToken:\s*'([^']+)'/);
                        if (match && match[1] && !messageReceived) {
                          messageReceived = true;
                          clearInterval(pollInterval);
                          window.removeEventListener('message', handleMessage);
                          popup.close();
                          resolve(match[1]);
                          return;
                        }
                      } catch (e) {
                        console.log('Failed to extract token:', e);
                      }
                    }
                  }
                }
              } catch (e) {
                console.log('Cannot access popup document (cross-origin):', e);
              }
            }
          } catch (e) {
            // Cross-origin access blocked, this is expected
          }

          if (pollCount >= maxPolls && !messageReceived) {
            messageReceived = true;
            clearInterval(pollInterval);
            window.removeEventListener('message', handleMessage);
            if (!popup.closed) {
              popup.close();
            }
            reject(new Error('Authorization timeout. Please try again.'));
          }
        }, 1000);
      });

      setDeploymentStatus("Creating site on Netlify...");
      console.log('Starting deployment with access token');

      // Step 4: Deploy to Netlify
      const { data: deployData, error: deployError } = await supabase.functions.invoke('netlify-deploy', {
        body: {
          accessToken,
          portfolioData,
          siteName: siteName || `${portfolioData.settings.name.replace(/\s+/g, '-').toLowerCase()}-portfolio`
        }
      });

      if (deployError) {
        console.error('Deploy error:', deployError);
        throw new Error(deployError.message);
      }

      if (!deployData?.success) {
        console.error('Deploy failed:', deployData);
        throw new Error(deployData?.error || 'Deployment failed');
      }

      setDeploymentStatus("Deployment successful!");
      setDeploymentResult({
        success: true,
        url: deployData.url,
        adminUrl: deployData.adminUrl
      });

      toast({
        title: "Deployment successful!",
        description: `Your portfolio is now live at ${deployData.url}`,
      });

    } catch (error) {
      console.error('Deployment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Deployment failed';
      
      setDeploymentResult({
        success: false,
        error: errorMessage
      });
      
      toast({
        title: "Deployment failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const handleOtherDeploy = (platform: string) => {
    toast({
      title: "Coming soon",
      description: `${platform} deployment will be available soon. For now, use the "Download Source Code" option.`,
    });
  };

  const resetDeployment = () => {
    setShowDeployModal(false);
    setIsDeploying(false);
    setDeploymentStatus("");
    setDeploymentResult(null);
    setSiteName("");
  };

  return (
    <>
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
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Recommended
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                One-click deployment with instant live URL. Perfect for portfolios.
              </p>
              <Button
                className="w-full"
                onClick={handleNetlifyDeploy}
                disabled={isDeploying}
              >
                {isDeploying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  "Deploy to Netlify"
                )}
              </Button>
            </div>

            <div className="border rounded-lg p-4 opacity-75">
              <div className="flex items-center mb-3">
                <Github className="h-5 w-5 mr-2" />
                <h3 className="font-semibold">GitHub Pages</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Deploy from your GitHub repository.
              </p>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => handleOtherDeploy("GitHub Pages")}
              >
                Coming Soon
              </Button>
            </div>

            <div className="border rounded-lg p-4 opacity-75">
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
                variant="outline"
                onClick={() => handleOtherDeploy("Vercel")}
              >
                Coming Soon
              </Button>
            </div>

            <div className="mt-8 text-center">
              <Button variant="outline" className="text-sm" onClick={() => window.open("https://docs.netlify.com/", "_blank")}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Learn more about Netlify
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Deployment Progress Modal */}
      <Dialog open={showDeployModal} onOpenChange={resetDeployment}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Deploying to Netlify</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {!deploymentResult && (
              <div className="mb-4">
                <Label htmlFor="siteName">Site Name (optional)</Label>
                <Input
                  id="siteName"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder={`${portfolioData.settings.name.replace(/\s+/g, '-').toLowerCase()}-portfolio`}
                  disabled={isDeploying}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to auto-generate from your name
                </p>
              </div>
            )}

            <div className="flex items-center space-x-3">
              {isDeploying ? (
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              ) : deploymentResult?.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : deploymentResult?.error ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : null}
              
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {deploymentResult?.success ? "Deployment Complete!" : 
                   deploymentResult?.error ? "Deployment Failed" :
                   deploymentStatus}
                </p>
                
                {deploymentResult?.error && (
                  <p className="text-xs text-red-600 mt-1">
                    {deploymentResult.error}
                  </p>
                )}
              </div>
            </div>

            {deploymentResult?.success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      🎉 Your portfolio is now live!
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      onClick={() => window.open(deploymentResult.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit Your Site
                    </Button>
                    
                    {deploymentResult.adminUrl && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => window.open(deploymentResult.adminUrl, '_blank')}
                      >
                        Manage on Netlify
                      </Button>
                    )}
                  </div>
                  
                  <div className="text-xs text-green-700 bg-green-100 p-2 rounded">
                    <strong>Live URL:</strong> {deploymentResult.url}
                  </div>
                </div>
              </div>
            )}

            {deploymentResult && (
              <Button
                variant="outline"
                className="w-full"
                onClick={resetDeployment}
              >
                {deploymentResult.success ? "Deploy Another" : "Try Again"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DeployOptions;
