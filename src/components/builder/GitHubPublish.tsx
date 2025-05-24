
import React, { useState } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Github, ExternalLink, Loader2, CheckCircle } from "lucide-react";
import { githubService, GitHubUser, GitHubRepo } from "@/services/githubService";
import { useToast } from "@/hooks/use-toast";

const GitHubPublish: React.FC = () => {
  const { portfolioData } = usePortfolio();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repoName, setRepoName] = useState(`${portfolioData.settings.name.toLowerCase().replace(/\s+/g, '-')}-portfolio`);
  const [repoDescription, setRepoDescription] = useState(`Personal portfolio website for ${portfolioData.settings.name}`);
  const [publishedRepo, setPublishedRepo] = useState<GitHubRepo | null>(null);

  const handleAuthenticate = async () => {
    setIsAuthenticating(true);
    try {
      await githubService.authenticate();
      const userInfo = await githubService.getUser();
      setUser(userInfo);
      toast({
        title: "Authentication successful",
        description: `Connected as ${userInfo.name || userInfo.login}`,
      });
    } catch (error) {
      toast({
        title: "Authentication failed",
        description: error instanceof Error ? error.message : "Failed to authenticate with GitHub",
        variant: "destructive",
      });
    } finally {
      setIsAuthenticating(false);
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
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, ${portfolioData.settings.primaryColor} 0%, #764ba2 100%); }
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
                    <a href="#hero" class="text-gray-600 hover:text-gray-900 transition">Home</a>
                    <a href="#about" class="text-gray-600 hover:text-gray-900 transition">About</a>
                    <a href="#experience" class="text-gray-600 hover:text-gray-900 transition">Experience</a>
                    <a href="#projects" class="text-gray-600 hover:text-gray-900 transition">Projects</a>
                    <a href="#contact" class="text-gray-600 hover:text-gray-900 transition">Contact</a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section id="hero" class="gradient-bg text-white min-h-screen flex items-center pt-16">
        <div class="max-w-6xl mx-auto px-4 text-center fade-in">
            <h1 class="text-5xl md:text-6xl font-bold mb-6">${portfolioData.hero.name}</h1>
            <p class="text-xl md:text-2xl mb-8 opacity-90">${portfolioData.hero.title}</p>
            <p class="text-lg mb-8 max-w-2xl mx-auto opacity-80">${portfolioData.hero.description}</p>
            <div class="space-x-4">
                <a href="#contact" class="bg-white text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">Get In Touch</a>
                <a href="#projects" class="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-800 transition">View Work</a>
            </div>
        </div>
    </section>

    <!-- About Section -->
    <section id="about" class="py-20 bg-white">
        <div class="max-w-6xl mx-auto px-4">
            <h2 class="text-4xl font-bold text-center mb-16 text-gray-800">About Me</h2>
            <div class="grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <p class="text-lg text-gray-600 leading-relaxed">${portfolioData.about.description}</p>
                </div>
                <div class="space-y-4">
                    ${portfolioData.about.skills.map(skill => `
                        <div>
                            <div class="flex justify-between mb-1">
                                <span class="text-sm font-medium text-gray-700">${skill.name}</span>
                                <span class="text-sm text-gray-500">${skill.level}%</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="bg-blue-600 h-2 rounded-full" style="width: ${skill.level}%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    </section>

    <!-- Projects Section -->
    <section id="projects" class="py-20 bg-gray-50">
        <div class="max-w-6xl mx-auto px-4">
            <h2 class="text-4xl font-bold text-center mb-16 text-gray-800">Projects</h2>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                ${portfolioData.projects.map(project => `
                    <div class="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
                        <div class="p-6">
                            <h3 class="text-xl font-semibold mb-3 text-gray-800">${project.title}</h3>
                            <p class="text-gray-600 mb-4">${project.description}</p>
                            <div class="flex flex-wrap gap-2 mb-4">
                                ${project.technologies.map(tech => `
                                    <span class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">${tech}</span>
                                `).join('')}
                            </div>
                            ${project.liveUrl ? `<a href="${project.liveUrl}" target="_blank" class="text-blue-600 hover:text-blue-800 font-medium">View Project →</a>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="py-20 bg-white">
        <div class="max-w-6xl mx-auto px-4 text-center">
            <h2 class="text-4xl font-bold mb-16 text-gray-800">Get In Touch</h2>
            <div class="max-w-2xl mx-auto">
                <p class="text-lg text-gray-600 mb-8">
                    I'm always interested in new opportunities and collaborations. 
                    Feel free to reach out if you'd like to work together!
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    ${portfolioData.contact.email ? `<a href="mailto:${portfolioData.contact.email}" class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">Email Me</a>` : ''}
                </div>
            </div>
        </div>
    </section>
</body>
</html>`;

    const readmeContent = `# ${portfolioData.settings.name} - Portfolio

This is the personal portfolio website for ${portfolioData.settings.name}.

## About

${portfolioData.about.description}

## Technologies Used

- HTML5
- Tailwind CSS
- Responsive Design

## Contact

- Email: ${portfolioData.contact.email || 'N/A'}
- Phone: ${portfolioData.contact.phone || 'N/A'}

## License

This project is open source and available under the [MIT License](LICENSE).
`;

    return [
      { path: 'index.html', content: htmlContent },
      { path: 'README.md', content: readmeContent },
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
        description: `Your portfolio is now live on GitHub Pages`,
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
          {!user ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Connect your GitHub account to publish your portfolio as a repository
              </p>
              <Button 
                onClick={handleAuthenticate} 
                disabled={isAuthenticating}
                className="w-full"
              >
                {isAuthenticating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Github className="h-4 w-4 mr-2" />
                    Connect GitHub Account
                  </>
                )}
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
          ) : (
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

              <Button 
                onClick={() => {
                  githubService.logout();
                  setUser(null);
                }}
                variant="ghost"
                className="w-full text-sm"
              >
                Disconnect GitHub
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GitHubPublish;
