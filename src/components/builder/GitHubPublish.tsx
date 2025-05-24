
import React, { useState, useEffect } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Github, ExternalLink, Loader2, CheckCircle, AlertCircle, Globe } from "lucide-react";
import { githubService, GitHubUser, GitHubRepo } from "@/services/githubService";
import { useToast } from "@/hooks/use-toast";

const GitHubPublish: React.FC = () => {
  const { portfolioData } = usePortfolio();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [isTokenConfigured, setIsTokenConfigured] = useState(false);
  const [repoName, setRepoName] = useState(`${portfolioData.settings.name.toLowerCase().replace(/\s+/g, '-')}-portfolio`);
  const [repoDescription, setRepoDescription] = useState(`Personal portfolio website for ${portfolioData.settings.name}`);
  const [publishedRepo, setPublishedRepo] = useState<GitHubRepo | null>(null);

  useEffect(() => {
    if (isOpen) {
      checkAuthentication();
    }
  }, [isOpen]);

  const checkAuthentication = async () => {
    setIsCheckingAuth(true);
    try {
      const isAuth = await githubService.checkAuthentication();
      setIsTokenConfigured(isAuth);
      
      if (isAuth) {
        const userInfo = await githubService.getUser();
        setUser(userInfo);
      }
    } catch (error) {
      setIsTokenConfigured(false);
      setUser(null);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const generatePortfolioFiles = () => {
    // Generate the complete HTML file
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${portfolioData.settings.name} - Portfolio</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '${portfolioData.settings.primaryColor}'
                    }
                }
            }
        }
    </script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, ${portfolioData.settings.primaryColor} 0%, #667eea 100%); }
        .fade-in { animation: fadeIn 0.6s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-lg fixed w-full top-0 z-50">
        <div class="max-w-6xl mx-auto px-4">
            <div class="flex justify-between items-center py-4">
                <div class="font-bold text-xl text-gray-800">${portfolioData.settings.name}</div>
                <div class="hidden md:flex space-x-8">
                    ${portfolioData.navigation.items.map(item => `
                        <a href="${item.url}" class="text-gray-600 hover:text-gray-900 transition">${item.name}</a>
                    `).join('')}
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    ${portfolioData.sections.hero.enabled ? `
    <section id="hero" class="gradient-bg text-white min-h-screen flex items-center pt-16">
        <div class="max-w-6xl mx-auto px-4 text-center fade-in">
            <h1 class="text-5xl md:text-6xl font-bold mb-6">${portfolioData.settings.name}</h1>
            <p class="text-xl md:text-2xl mb-8 opacity-90">${portfolioData.settings.title}</p>
            <p class="text-lg mb-8 max-w-2xl mx-auto opacity-80">${portfolioData.settings.summary}</p>
            <div class="space-x-4">
                ${portfolioData.sections.hero.ctaButtons.map(button => `
                    <a href="${button.url}" class="${button.isPrimary ? 'bg-white text-gray-800' : 'border-2 border-white text-white hover:bg-white hover:text-gray-800'} px-8 py-3 rounded-lg font-semibold transition">${button.text}</a>
                `).join('')}
            </div>
        </div>
    </section>
    ` : ''}

    <!-- About Section -->
    ${portfolioData.sections.about.enabled ? `
    <section id="about" class="py-20 bg-white">
        <div class="max-w-6xl mx-auto px-4">
            <h2 class="text-4xl font-bold text-center mb-16 text-gray-800">${portfolioData.sections.about.title}</h2>
            <div class="grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <p class="text-lg text-gray-600 leading-relaxed">${portfolioData.sections.about.content}</p>
                </div>
                ${portfolioData.sections.about.skills.enabled ? `
                <div>
                    <h3 class="text-xl font-semibold mb-4">${portfolioData.sections.about.skills.title}</h3>
                    <div class="flex flex-wrap gap-2">
                        ${portfolioData.sections.about.skills.items.map(skill => `
                            <span class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">${skill}</span>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    </section>
    ` : ''}

    <!-- Projects Section -->
    ${portfolioData.sections.projects.enabled ? `
    <section id="projects" class="py-20 bg-gray-50">
        <div class="max-w-6xl mx-auto px-4">
            <h2 class="text-4xl font-bold text-center mb-16 text-gray-800">${portfolioData.sections.projects.title}</h2>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                ${portfolioData.sections.projects.items.map(project => `
                    <div class="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
                        <div class="p-6">
                            <h3 class="text-xl font-semibold mb-3 text-gray-800">${project.title}</h3>
                            <p class="text-gray-600 mb-4">${project.description}</p>
                            <div class="flex flex-wrap gap-2 mb-4">
                                ${project.tags.map(tag => `
                                    <span class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">${tag}</span>
                                `).join('')}
                            </div>
                            ${project.previewUrl && project.previewUrl !== '#' ? `<a href="${project.previewUrl}" target="_blank" class="text-blue-600 hover:text-blue-800 font-medium">View Project →</a>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>
    ` : ''}

    <!-- Experience Section -->
    ${portfolioData.sections.experience.enabled ? `
    <section id="experience" class="py-20 bg-white">
        <div class="max-w-6xl mx-auto px-4">
            <h2 class="text-4xl font-bold text-center mb-16 text-gray-800">${portfolioData.sections.experience.title}</h2>
            <div class="space-y-8">
                ${portfolioData.sections.experience.items.map(exp => `
                    <div class="bg-gray-50 rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-gray-800">${exp.position}</h3>
                        <p class="text-lg text-blue-600 mb-2">${exp.company}</p>
                        <p class="text-sm text-gray-500 mb-4">${exp.period}</p>
                        <p class="text-gray-600">${exp.description}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>
    ` : ''}

    <!-- Contact Section -->
    ${portfolioData.sections.contact.enabled ? `
    <section id="contact" class="py-20 bg-white">
        <div class="max-w-6xl mx-auto px-4 text-center">
            <h2 class="text-4xl font-bold mb-16 text-gray-800">${portfolioData.sections.contact.title}</h2>
            <div class="max-w-2xl mx-auto">
                <p class="text-lg text-gray-600 mb-8">
                    I'm always interested in new opportunities and collaborations. 
                    Feel free to reach out if you'd like to work together!
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    ${portfolioData.sections.contact.email ? `<a href="mailto:${portfolioData.sections.contact.email}" class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">Email Me</a>` : ''}
                </div>
            </div>
        </div>
    </section>
    ` : ''}

    <!-- Footer -->
    ${portfolioData.footer.enabled ? `
    <footer class="bg-gray-800 text-white py-8">
        <div class="max-w-6xl mx-auto px-4 text-center">
            <p>${portfolioData.footer.copyright}</p>
        </div>
    </footer>
    ` : ''}
</body>
</html>`;

    const readmeContent = `# ${portfolioData.settings.name} - Portfolio

This is the personal portfolio website for ${portfolioData.settings.name}.

## About

${portfolioData.sections.about.content}

## Live Demo

Visit the live portfolio: [https://${user?.login}.github.io/${repoName}](https://${user?.login}.github.io/${repoName})

## Technologies Used

- HTML5
- Tailwind CSS
- JavaScript
- Responsive Design
- GitHub Pages

## Contact

- Email: ${portfolioData.sections.contact.email || 'N/A'}
- Phone: ${portfolioData.sections.contact.phone || 'N/A'}

## License

This project is open source and available under the [MIT License](LICENSE).
`;

    const portfolioDataContent = JSON.stringify(portfolioData, null, 2);

    return [
      { path: 'index.html', content: htmlContent },
      { path: 'README.md', content: readmeContent },
      { path: 'portfolio-data.json', content: portfolioDataContent },
    ];
  };

  const handlePublish = async () => {
    if (!user) return;

    setIsPublishing(true);
    try {
      // Create repository
      const repo = await githubService.createRepository(repoName, repoDescription);
      
      // Generate portfolio files
      const files = generatePortfolioFiles();
      
      // Upload files to repository
      await githubService.uploadFiles(user.login, repo.name, files);
      
      setPublishedRepo(repo);
      
      toast({
        title: "Portfolio published successfully!",
        description: `Your portfolio is now live at https://${user.login}.github.io/${repo.name}`,
      });
    } catch (error) {
      toast({
        title: "Publication failed",
        description: error instanceof Error ? error.message : "Failed to publish portfolio",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="px-2 sm:px-3">
          <Github className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Publish to GitHub</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Publish to GitHub
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {isCheckingAuth ? (
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="text-sm text-gray-600">Checking GitHub connection...</p>
            </div>
          ) : !isTokenConfigured ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">GitHub Token Required</h3>
                <p className="text-sm text-gray-600 mt-1">
                  A GitHub Personal Access Token needs to be configured by the administrator to enable GitHub publishing.
                </p>
              </div>
              <Button onClick={checkAuthentication} variant="outline" className="w-full">
                <Loader2 className="h-4 w-4 mr-2" />
                Retry Connection
              </Button>
            </div>
          ) : publishedRepo ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Portfolio Published!</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Your portfolio has been published to GitHub
                </p>
              </div>
              <div className="space-y-2">
                <Button asChild variant="default" className="w-full">
                  <a href={`https://${user?.login}.github.io/${publishedRepo.name}`} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4 mr-2" />
                    View Live Site
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <a href={publishedRepo.html_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Repository
                  </a>
                </Button>
                <Button 
                  onClick={() => {
                    setPublishedRepo(null);
                    setIsOpen(false);
                  }}
                  variant="ghost"
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          ) : user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <img 
                  src={user.avatar_url} 
                  alt={user.name || user.login}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-medium">{user.name || user.login}</p>
                  <p className="text-sm text-gray-600">Connected to GitHub</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Repository Name</label>
                  <Input
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    placeholder="my-portfolio"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={repoDescription}
                    onChange={(e) => setRepoDescription(e.target.value)}
                    placeholder="Personal portfolio website"
                    rows={2}
                  />
                </div>
              </div>

              <Button 
                onClick={handlePublish} 
                disabled={isPublishing || !repoName.trim()}
                className="w-full"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Github className="h-4 w-4 mr-2" />
                    Publish Portfolio
                  </>
                )}
              </Button>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GitHubPublish;
