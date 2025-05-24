
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePortfolio } from "@/context/PortfolioContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Github, ExternalLink, Loader2, Copy, Eye, EyeOff } from "lucide-react";

interface GitHubDeployProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GitHubDeploy: React.FC<GitHubDeployProps> = ({ open, onOpenChange }) => {
  const { portfolioData } = usePortfolio();
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState("");
  const [repoName, setRepoName] = useState("");
  const [showToken, setShowToken] = useState(false);

  const generatePortfolioFiles = () => {
    // Generate HTML
    const htmlContent = `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${portfolioData.settings.name} - Portfolio</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="./tailwind.config.js"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&family=Ovo&family=Schibsted+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body class="bg-white text-gray-900 font-Schibsted">
    <div id="app"></div>
    <script src="./script.js"></script>
  </body>
</html>`;

    const cssContent = `:root {
  --primary-color: ${portfolioData.settings.primaryColor};
  --primary-color-light: rgba(214, 88, 34, 0.08);
}
.dynamic-primary { color: var(--primary-color) !important; }
.bg-dynamic-primary { background-color: var(--primary-color) !important; }
.border-dynamic-primary { border-color: var(--primary-color) !important; }
.bg-primary-light { background: var(--primary-color-light) !important; }
body { font-family: 'Schibsted Grotesk', sans-serif; }`;

    const tailwindConfig = `tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        'Schibsted': ['Schibsted Grotesk', 'sans-serif'],
        'Outfit': ['Outfit', 'sans-serif'],
        'Ovo': ['Ovo', 'serif'],
      },
      colors: {
        primary: 'var(--primary-color)',
      }
    }
  }
};`;

    const scriptContent = `document.addEventListener("DOMContentLoaded", async function() {
  try {
    const res = await fetch("./portfolio-data.json");
    const data = await res.json();
    
    document.documentElement.style.setProperty("--primary-color", data.settings.primaryColor);
    
    const app = document.getElementById("app");
    app.innerHTML = \`
      <!-- Hero Section -->
      <section class="py-20 px-4 text-center bg-gradient-to-br from-blue-50 to-white">
        <div class="max-w-4xl mx-auto">
          <img src="\${data.settings.profileImage}" alt="\${data.settings.name}" class="w-32 h-32 rounded-full mx-auto mb-6 object-cover" />
          <h1 class="text-4xl md:text-6xl font-bold mb-4">\${data.settings.name}</h1>
          <p class="text-xl md:text-2xl dynamic-primary mb-4">\${data.settings.title}</p>
          <p class="text-gray-600 mb-2">\${data.settings.location}</p>
          <p class="text-lg text-gray-700 max-w-2xl mx-auto">\${data.settings.summary}</p>
        </div>
      </section>

      \${data.sections.about.enabled ? \`
      <section class="py-16 px-4">
        <div class="max-w-4xl mx-auto">
          <h2 class="text-3xl font-bold mb-8 text-center">\${data.sections.about.title}</h2>
          <p class="text-lg text-gray-700 mb-8">\${data.sections.about.content}</p>
          \${data.sections.about.skills.enabled ? \`
          <div>
            <h3 class="text-xl font-semibold mb-4">\${data.sections.about.skills.title}</h3>
            <div class="flex flex-wrap gap-2">
              \${data.sections.about.skills.items.map(skill => \`<span class="px-3 py-1 bg-primary-light dynamic-primary rounded-full text-sm font-medium">\${skill}</span>\`).join('')}
            </div>
          </div>
          \` : ''}
        </div>
      </section>
      \` : ''}

      \${data.sections.experience.enabled ? \`
      <section class="py-16 px-4 bg-gray-50">
        <div class="max-w-4xl mx-auto">
          <h2 class="text-3xl font-bold mb-8 text-center">\${data.sections.experience.title}</h2>
          <div class="space-y-6">
            \${data.sections.experience.items.map(item => \`
            <div class="bg-white p-6 rounded-lg shadow-sm">
              <h3 class="text-xl font-semibold dynamic-primary">\${item.position}</h3>
              <p class="text-lg font-medium text-gray-800">\${item.company}</p>
              <p class="text-gray-600 mb-3">\${item.period}</p>
              <p class="text-gray-700">\${item.description}</p>
            </div>
            \`).join('')}
          </div>
        </div>
      </section>
      \` : ''}

      \${data.sections.projects.enabled ? \`
      <section class="py-16 px-4">
        <div class="max-w-4xl mx-auto">
          <h2 class="text-3xl font-bold mb-8 text-center">\${data.sections.projects.title}</h2>
          <div class="grid gap-6 md:grid-cols-2">
            \${data.sections.projects.items.map(project => \`
            <div class="bg-white border border-gray-200 p-6 rounded-lg">
              <h3 class="text-xl font-semibold mb-3 dynamic-primary">\${project.title}</h3>
              <p class="text-gray-700 mb-4">\${project.description}</p>
              <div class="flex flex-wrap gap-2 mb-4">
                \${project.tags.map(tag => \`<span class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">\${tag}</span>\`).join('')}
              </div>
              \${project.previewUrl !== '#' ? \`<a href="\${project.previewUrl}" class="dynamic-primary font-medium hover:underline">View Project →</a>\` : ''}
            </div>
            \`).join('')}
          </div>
        </div>
      </section>
      \` : ''}

      \${data.sections.contact.enabled ? \`
      <section class="py-16 px-4 bg-gray-50">
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="text-3xl font-bold mb-8">\${data.sections.contact.title}</h2>
          <div class="space-y-4">
            <p class="text-lg"><strong>Email:</strong> <a href="mailto:\${data.sections.contact.email}" class="dynamic-primary hover:underline">\${data.sections.contact.email}</a></p>
            <p class="text-lg"><strong>Phone:</strong> \${data.sections.contact.phone}</p>
            <p class="text-lg"><strong>Location:</strong> \${data.sections.contact.location}</p>
          </div>
        </div>
      </section>
      \` : ''}

      \${data.footer.enabled ? \`
      <footer class="py-8 px-4 text-center text-gray-600 border-t">
        <p>\${data.footer.copyright}</p>
      </footer>
      \` : ''}
    \`;
  } catch (err) {
    console.error("Error loading portfolio:", err);
    document.getElementById("app").innerHTML = "<h1>Error loading portfolio</h1>";
  }
});`;

    const portfolioDataContent = JSON.stringify(portfolioData, null, 2);

    return [
      { name: "index.html", content: htmlContent },
      { name: "styles.css", content: cssContent },
      { name: "tailwind.config.js", content: tailwindConfig },
      { name: "script.js", content: scriptContent },
      { name: "portfolio-data.json", content: portfolioDataContent }
    ];
  };

  const deployToGitHub = async () => {
    if (!accessToken.trim()) {
      toast.error("Please enter your GitHub Personal Access Token");
      return;
    }

    if (!repoName.trim()) {
      toast.error("Please enter a repository name");
      return;
    }

    setIsDeploying(true);
    console.log('Starting deployment to GitHub Pages...');
    
    try {
      const files = generatePortfolioFiles();
      console.log('Generated files:', files.length);
      
      const { data, error } = await supabase.functions.invoke('github-deploy', {
        body: {
          accessToken: accessToken.trim(),
          repoName: repoName.trim(),
          portfolioData,
          files
        }
      });

      console.log('Deployment response:', { data, error });

      if (error || !data?.success) {
        console.error('Deployment failed:', error);
        toast.error('Deployment failed', {
          description: error?.message || 'Failed to deploy your portfolio to GitHub Pages.'
        });
        return;
      }

      setDeployedUrl(data.pagesUrl);
      console.log('Deployment successful, URL:', data.pagesUrl);
      
      toast.success('Portfolio deployed successfully!', {
        description: `Your portfolio is now live at ${data.pagesUrl}`
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const generateRepoName = () => {
    const name = portfolioData.settings.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setRepoName(`${name}-portfolio`);
  };

  React.useEffect(() => {
    if (open && !repoName) {
      generateRepoName();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Deploy to GitHub Pages
          </DialogTitle>
          <DialogDescription>
            Deploy your portfolio to GitHub Pages for free hosting with a custom domain.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!deployedUrl ? (
            <>
              {/* GitHub Token Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">How to get your GitHub Personal Access Token:</h4>
                <ol className="text-sm text-blue-800 space-y-1 mb-3">
                  <li>1. Go to GitHub Settings → Developer settings → Personal access tokens</li>
                  <li>2. Click "Generate new token" → "Generate new token (classic)"</li>
                  <li>3. Give it a name like "Portfolio Deploy"</li>
                  <li>4. Select these permissions: <strong>repo</strong> (Full control of private repositories)</li>
                  <li>5. Click "Generate token" and copy it immediately</li>
                </ol>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://github.com/settings/tokens', '_blank')}
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open GitHub Token Settings
                </Button>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="token">GitHub Personal Access Token *</Label>
                  <div className="relative">
                    <Input
                      id="token"
                      type={showToken ? "text" : "password"}
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowToken(!showToken)}
                    >
                      {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This token is only used for deployment and is not stored anywhere.
                  </p>
                </div>

                <div>
                  <Label htmlFor="repo">Repository Name *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="repo"
                      value={repoName}
                      onChange={(e) => setRepoName(e.target.value)}
                      placeholder="my-portfolio"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateRepoName}
                    >
                      Auto
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    A new repository will be created with this name.
                  </p>
                </div>
              </div>

              <Button 
                onClick={deployToGitHub} 
                disabled={isDeploying || !accessToken.trim() || !repoName.trim()}
                className="w-full"
              >
                {isDeploying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deploying to GitHub Pages...
                  </>
                ) : (
                  <>
                    <Github className="h-4 w-4 mr-2" />
                    Deploy Portfolio
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">✅ Deployment Successful!</p>
                <p className="text-sm text-green-600 mt-1">Your portfolio is now live on GitHub Pages</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Live URL:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm bg-white p-2 rounded border">{deployedUrl}</code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(deployedUrl)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => window.open(deployedUrl, '_blank')} 
                  className="flex-1"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Live Site
                </Button>
                <Button 
                  onClick={() => {
                    setDeployedUrl(null);
                    setAccessToken("");
                  }} 
                  variant="outline" 
                  className="flex-1"
                >
                  Deploy Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GitHubDeploy;
