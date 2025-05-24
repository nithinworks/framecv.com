
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  PanelLeft, 
  Download, 
  ChevronLeft
} from "lucide-react";
import { usePortfolio } from "@/context/PortfolioContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

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
  background: linear-gradient(120deg, rgba(252, 186, 3, 0.1) 0%, #000 100%) !important;
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
document.addEventListener("DOMContentLoaded", async function() {
  try {
    const res = await fetch("portfolio-data.json");
    const data = await res.json();
    
    // Set primary color
    document.documentElement.style.setProperty("--primary-color", data.settings.primaryColor || "#0067c7");
    
    // Simple portfolio rendering
    document.getElementById("app").innerHTML = "<h1>Portfolio loaded successfully!</h1><p>Add your portfolio rendering logic here.</p>";
  } catch (err) {
    console.error("Error loading portfolio:", err);
  }
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
    <div className="fixed top-0 left-0 right-0 h-[60px] bg-white border-b shadow-sm z-40 flex justify-between items-center px-2 sm:px-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="text-gray-600 px-2 sm:px-3"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {!isMobile && "Back"}
        </Button>

        <div className="h-6 border-r border-gray-300"></div>

        <div className="relative">
          <Button
            variant={showEditor ? "default" : "outline"}
            size="sm"
            onClick={() => setShowEditor(!showEditor)}
            className={`px-2 sm:px-3 ${
              showEditorHint && !showEditor 
                ? "animate-pulse border-2 border-blue-500 shadow-lg shadow-blue-500/25" 
                : ""
            }`}
          >
            <PanelLeft className="h-4 w-4 mr-1 sm:mr-2" />
            Editor
          </Button>
          
          {showEditorHint && !showEditor && !isMobile && (
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-1 z-50">
              <div className="bg-gray-800 text-white px-2 py-1 rounded text-xs font-medium relative whitespace-nowrap">
                <span>Click to edit</span>
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-[6px] border-b-[6px] border-r-[6px] border-transparent border-r-gray-800"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={downloadSourceCode}
          className="px-2 sm:px-3"
        >
          <Download className="h-4 w-4 sm:mr-2" />
          {!isMobile && "Download Code"}
        </Button>
      </div>
    </div>
  );
};

export default BuilderToolbar;
