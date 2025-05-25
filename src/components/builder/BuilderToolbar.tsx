
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  PanelLeft, 
  Download, 
  ChevronLeft,
  Github
} from "lucide-react";
import { usePortfolio } from "@/context/PortfolioContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import GitHubDeploy from "@/components/builder/GitHubDeploy";
import UserDetailsModal from "@/components/builder/UserDetailsModal";

interface BuilderToolbarProps {
  showEditorHint?: boolean;
}

const BuilderToolbar: React.FC<BuilderToolbarProps> = ({ showEditorHint = false }) => {
  const { 
    showEditor, 
    setShowEditor,
    portfolioData
  } = usePortfolio();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showGitHubDeploy, setShowGitHubDeploy] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [pendingAction, setPendingAction] = useState<"download" | "deploy" | null>(null);

  const handleDownloadClick = () => {
    setPendingAction("download");
    setShowUserDetails(true);
  };

  const handleDeployClick = () => {
    setPendingAction("deploy");
    setShowUserDetails(true);
  };

  const handleUserDetailsSuccess = () => {
    if (pendingAction === "download") {
      downloadSourceCode();
    } else if (pendingAction === "deploy") {
      setShowGitHubDeploy(true);
    }
    setPendingAction(null);
  };

  const downloadSourceCode = () => {
    // HTML template
    const htmlCode = `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Portfolio - ${portfolioData.settings.name}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="./tailwind.config.js"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&family=Ovo&family=Schibsted+Grotesk:wght@400;500;700&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body
    class="overflow-x-hidden font-Schibsted leading-8 bg-white text-primary dark:bg-darkTheme dark:text-white"
  >
    <div id="app"></div>
    <script src="./script.js"></script>
  </body>
</html>`;

    const cssCode = `:root {
  --primary-color: ${portfolioData.settings.primaryColor};
  --primary-color-light: rgba(214, 88, 34, 0.08);
  --glass-bg: rgba(252, 186, 3, 0.1);
}
.dynamic-primary {
  color: var(--primary-color) !important;
}
.bg-dynamic-primary {
  background-color: var(--primary-color) !important;
}
.border-dynamic-primary {
  border-color: var(--primary-color) !important;
}
.bg-primary-light {
  background: var(--primary-color-light) !important;
}
.glass-bg {
  background: var(--glass-bg) !important;
  backdrop-filter: blur(2px);
}
.hero-bg {
  background: linear-gradient(120deg, var(--primary-color-light) 0%, #fff 100%);
}
.dark .hero-bg {
  background: #000 !important;
}
.footer-bg-smoke {
  background: linear-gradient(120deg, var(--primary-color-light) 0%, #fff 100%);
}
.dark .footer-bg-smoke {
  background: linear-gradient(
    120deg,
    rgba(252, 186, 3, 0.1) 0%,
    #000 100%
  ) !important;
}`;

    const twConfigCode = `tailwind.config = {
  theme: {
    extend: {
      gridTemplateColumns: {
        auto: "repeat(auto-fit, minmax(200px, 1fr))",
      },
      fontFamily: {
        Outfit: ["Outfit", "sans-serif"],
        Ovo: ["Ovo", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.7s ease-out both",
        "slide-up": "slideUp 0.7s cubic-bezier(0.4,0,0.2,1) both",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(30px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      colors: {
        darkTheme: "#111111",
        white: "#fff",
        black: "#000",
        gray: {
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#181818",
        },
      },
    },
  },
  darkMode: "selector",
};`;

    const jsCode = `// Portfolio rendering script
document.addEventListener("DOMContentLoaded", function() {
  // Simple portfolio rendering
  const portfolioName = "${portfolioData.settings.name}";
  const portfolioTitle = "${portfolioData.settings.title}";
  
  document.getElementById("app").innerHTML = \`
    <div class="min-h-screen bg-white dark:bg-gray-900">
      <header class="bg-blue-600 text-white p-8">
        <h1 class="text-4xl font-bold">\${portfolioName}</h1>
        <p class="text-xl">\${portfolioTitle}</p>
      </header>
      <main class="p-8">
        <section class="mb-8">
          <h2 class="text-2xl font-bold mb-4">About</h2>
          <p class="text-gray-700 dark:text-gray-300">${portfolioData.settings.summary}</p>
        </section>
      </main>
    </div>
  \`;
});`;

    const jsonCode = JSON.stringify(portfolioData, null, 2);

    const files = [
      { name: "index.html", content: htmlCode },
      { name: "styles.css", content: cssCode },
      { name: "script.js", content: jsCode },
      { name: "tailwind.config.js", content: twConfigCode },
      { name: "portfolio-data.json", content: jsonCode }
    ];

    import('jszip').then(JSZip => {
      const zip = new JSZip.default();
      
      files.forEach(file => {
        zip.file(file.name, file.content);
      });

      zip.generateAsync({ type: "blob" }).then(content => {
        const url = URL.createObjectURL(content);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${portfolioData.settings.name.replace(/\s+/g, '-')}-Portfolio-Code.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    });
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-14 bg-[#171717] border-b border-gray-800 z-40 flex justify-between items-center px-4 animate-blur-in">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white hover:bg-gray-800 px-3 py-2 h-8 text-sm transition-all duration-300"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {!isMobile && "Back"}
          </Button>

          <div className="h-4 w-px bg-gray-800"></div>

          <div className="relative">
            <Button
              variant={showEditor ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowEditor(!showEditor)}
              className={`px-3 py-2 h-8 text-sm transition-all duration-300 relative overflow-hidden ${showEditor ? "bg-white text-black hover:bg-gray-200" : "text-gray-400 hover:text-white hover:bg-gray-800"} ${showEditorHint && !showEditor ? "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r before:from-transparent before:via-gray-600 before:to-transparent before:animate-[shimmer_2s_ease-in-out_infinite] before:-translate-x-full" : ""}`}
              style={{
                background: showEditorHint && !showEditor 
                  ? 'linear-gradient(90deg, transparent, rgba(156, 163, 175, 0.1), transparent)'
                  : undefined
              }}
            >
              <PanelLeft className="h-4 w-4 mr-2" />
              Editor
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
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeployClick}
            className="px-3 py-2 h-8 text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-300"
          >
            <Github className="h-4 w-4 mr-2" />
            {!isMobile && "Deploy"}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownloadClick}
            className="px-3 py-2 h-8 text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-300"
          >
            <Download className="h-4 w-4 mr-2" />
            {!isMobile && "Download"}
          </Button>
        </div>
      </div>

      <UserDetailsModal 
        open={showUserDetails}
        onOpenChange={setShowUserDetails}
        actionType={pendingAction || "download"}
        portfolioName={portfolioData.settings.name}
        onSuccess={handleUserDetailsSuccess}
      />

      <GitHubDeploy 
        open={showGitHubDeploy} 
        onOpenChange={setShowGitHubDeploy} 
      />
    </>
  );
};

export default BuilderToolbar;
