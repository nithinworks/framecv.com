
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { usePortfolio } from "@/context/PortfolioContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Globe, ExternalLink, Loader2 } from "lucide-react";

interface NetlifyDeployProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NetlifyDeploy: React.FC<NetlifyDeployProps> = ({ open, onOpenChange }) => {
  const { portfolioData } = usePortfolio();
  const [isDeploying, setIsDeploying] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already connected to Netlify
    const token = sessionStorage.getItem('netlify_access_token');
    setIsConnected(!!token);
  }, [open]);

  const connectToNetlify = () => {
    const clientId = 'Opkk5yL1Gax2qMd5d5xXIuPoCCTRKsI3MZyp4vdW9LE';
    const redirectUri = 'https://framecv.com/auth/netlify/callback';
    const scope = 'read write';
    
    const authUrl = `https://app.netlify.com/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
    
    window.location.href = authUrl;
  };

  const generatePortfolioFiles = () => {
    // Generate HTML
    const htmlContent = `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${portfolioData.settings.name} - Portfolio</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&family=Ovo&family=Schibsted+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
    <style>
      :root {
        --primary-color: ${portfolioData.settings.primaryColor};
        --primary-color-light: rgba(214, 88, 34, 0.08);
      }
      .dynamic-primary { color: var(--primary-color) !important; }
      .bg-dynamic-primary { background-color: var(--primary-color) !important; }
      .border-dynamic-primary { border-color: var(--primary-color) !important; }
      .bg-primary-light { background: var(--primary-color-light) !important; }
      body { font-family: 'Schibsted Grotesk', sans-serif; }
    </style>
  </head>
  <body class="bg-white text-gray-900">
    <div class="min-h-screen">
      <!-- Hero Section -->
      <section class="py-20 px-4 text-center bg-gradient-to-br from-blue-50 to-white">
        <div class="max-w-4xl mx-auto">
          <img src="${portfolioData.settings.profileImage}" alt="${portfolioData.settings.name}" class="w-32 h-32 rounded-full mx-auto mb-6 object-cover" />
          <h1 class="text-4xl md:text-6xl font-bold mb-4">${portfolioData.settings.name}</h1>
          <p class="text-xl md:text-2xl dynamic-primary mb-4">${portfolioData.settings.title}</p>
          <p class="text-gray-600 mb-2">${portfolioData.settings.location}</p>
          <p class="text-lg text-gray-700 max-w-2xl mx-auto">${portfolioData.settings.summary}</p>
        </div>
      </section>

      <!-- About Section -->
      ${portfolioData.sections.about.enabled ? `
      <section class="py-16 px-4">
        <div class="max-w-4xl mx-auto">
          <h2 class="text-3xl font-bold mb-8 text-center">${portfolioData.sections.about.title}</h2>
          <p class="text-lg text-gray-700 mb-8">${portfolioData.sections.about.content}</p>
          ${portfolioData.sections.about.skills.enabled ? `
          <div>
            <h3 class="text-xl font-semibold mb-4">${portfolioData.sections.about.skills.title}</h3>
            <div class="flex flex-wrap gap-2">
              ${portfolioData.sections.about.skills.items.map(skill => `<span class="px-3 py-1 bg-primary-light dynamic-primary rounded-full text-sm font-medium">${skill}</span>`).join('')}
            </div>
          </div>
          ` : ''}
        </div>
      </section>
      ` : ''}

      <!-- Experience Section -->
      ${portfolioData.sections.experience.enabled ? `
      <section class="py-16 px-4 bg-gray-50">
        <div class="max-w-4xl mx-auto">
          <h2 class="text-3xl font-bold mb-8 text-center">${portfolioData.sections.experience.title}</h2>
          <div class="space-y-6">
            ${portfolioData.sections.experience.items.map(item => `
            <div class="bg-white p-6 rounded-lg shadow-sm">
              <h3 class="text-xl font-semibold dynamic-primary">${item.position}</h3>
              <p class="text-lg font-medium text-gray-800">${item.company}</p>
              <p class="text-gray-600 mb-3">${item.period}</p>
              <p class="text-gray-700">${item.description}</p>
            </div>
            `).join('')}
          </div>
        </div>
      </section>
      ` : ''}

      <!-- Projects Section -->
      ${portfolioData.sections.projects.enabled ? `
      <section class="py-16 px-4">
        <div class="max-w-4xl mx-auto">
          <h2 class="text-3xl font-bold mb-8 text-center">${portfolioData.sections.projects.title}</h2>
          <div class="grid gap-6 md:grid-cols-2">
            ${portfolioData.sections.projects.items.map(project => `
            <div class="bg-white border border-gray-200 p-6 rounded-lg">
              <h3 class="text-xl font-semibold mb-3 dynamic-primary">${project.title}</h3>
              <p class="text-gray-700 mb-4">${project.description}</p>
              <div class="flex flex-wrap gap-2 mb-4">
                ${project.tags.map(tag => `<span class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">${tag}</span>`).join('')}
              </div>
              ${project.previewUrl !== '#' ? `<a href="${project.previewUrl}" class="dynamic-primary font-medium hover:underline">View Project →</a>` : ''}
            </div>
            `).join('')}
          </div>
        </div>
      </section>
      ` : ''}

      <!-- Contact Section -->
      ${portfolioData.sections.contact.enabled ? `
      <section class="py-16 px-4 bg-gray-50">
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="text-3xl font-bold mb-8">${portfolioData.sections.contact.title}</h2>
          <div class="space-y-4">
            <p class="text-lg"><strong>Email:</strong> <a href="mailto:${portfolioData.sections.contact.email}" class="dynamic-primary hover:underline">${portfolioData.sections.contact.email}</a></p>
            <p class="text-lg"><strong>Phone:</strong> ${portfolioData.sections.contact.phone}</p>
            <p class="text-lg"><strong>Location:</strong> ${portfolioData.sections.contact.location}</p>
          </div>
        </div>
      </section>
      ` : ''}

      <!-- Footer -->
      ${portfolioData.footer.enabled ? `
      <footer class="py-8 px-4 text-center text-gray-600 border-t">
        <p>${portfolioData.footer.copyright}</p>
      </footer>
      ` : ''}
    </div>
  </body>
</html>`;

    return [
      { name: 'index.html', content: htmlContent }
    ];
  };

  const deployToNetlify = async () => {
    const accessToken = sessionStorage.getItem('netlify_access_token');
    if (!accessToken) {
      toast.error('Not connected to Netlify');
      return;
    }

    setIsDeploying(true);
    try {
      const files = generatePortfolioFiles();
      
      const { data, error } = await supabase.functions.invoke('netlify-deploy', {
        body: {
          accessToken,
          portfolioData,
          files
        }
      });

      if (error || !data?.success) {
        console.error('Deployment failed:', error);
        toast.error('Deployment failed', {
          description: 'Failed to deploy your portfolio to Netlify.'
        });
        return;
      }

      setDeployedUrl(data.url);
      toast.success('Portfolio deployed successfully!', {
        description: `Your portfolio is now live at ${data.url}`
      });

    } catch (error) {
      console.error('Deployment error:', error);
      toast.error('Deployment failed', {
        description: 'An unexpected error occurred during deployment.'
      });
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Deploy to Netlify
          </DialogTitle>
          <DialogDescription>
            Deploy your portfolio to Netlify for free hosting with a custom domain.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!isConnected ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Connect your Netlify account to deploy your portfolio.
              </p>
              <Button onClick={connectToNetlify} className="w-full">
                Connect to Netlify
              </Button>
            </div>
          ) : deployedUrl ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">✅ Deployment Successful!</p>
                <p className="text-sm text-green-600 mt-1">Your portfolio is now live</p>
              </div>
              <Button 
                onClick={() => window.open(deployedUrl, '_blank')} 
                className="w-full"
                variant="outline"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Live Site
              </Button>
              <Button 
                onClick={() => {
                  setDeployedUrl(null);
                  onOpenChange(false);
                }} 
                variant="ghost" 
                className="w-full"
              >
                Close
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 font-medium">✅ Connected to Netlify</p>
                <p className="text-sm text-blue-600 mt-1">Ready to deploy your portfolio</p>
              </div>
              <Button 
                onClick={deployToNetlify} 
                disabled={isDeploying}
                className="w-full"
              >
                {isDeploying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  'Deploy Portfolio'
                )}
              </Button>
              <Button 
                onClick={() => {
                  sessionStorage.removeItem('netlify_access_token');
                  setIsConnected(false);
                }} 
                variant="ghost" 
                className="w-full text-red-600 hover:text-red-700"
              >
                Disconnect
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NetlifyDeploy;
