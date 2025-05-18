import React, { useState } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Copy, Check } from "lucide-react";

const CodeView: React.FC = () => {
  const { showCode, setShowCode, portfolioData } = usePortfolio();
  const [copied, setCopied] = useState<string | null>(null);

  // Sample code templates based on the portfolio data
  const htmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${portfolioData.settings.name} - Portfolio</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css">
</head>
<body>
  <!-- This is a simplified version, the actual HTML would be much more detailed -->
  <header>
    <nav>
      <!-- Navigation from portfolioData.navigation -->
    </nav>
  </header>
  
  <main>
    <!-- Hero section -->
    <section id="hero">
      <h1>${portfolioData.settings.name}</h1>
      <h2>${portfolioData.settings.title}</h2>
      <p>${portfolioData.settings.summary}</p>
    </section>
    
    <!-- Other sections dynamically generated from portfolioData -->
  </main>
  
  <footer>
    <p>${portfolioData.footer.copyright}</p>
  </footer>
  
  <script src="script.js"></script>
</body>
</html>`;

  const cssCode = `/* Main styles for the portfolio */
:root {
  --primary-color: ${portfolioData.settings.primaryColor};
  --primary-dark: ${portfolioData.settings.primaryColor}dd;
  --primary-light: ${portfolioData.settings.primaryColor}22;
}

body {
  font-family: 'Inter', sans-serif;
  color: #333;
  line-height: 1.6;
}

header {
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

/* More styles would be here in a real portfolio */`;

  const jsCode = `// This script loads the portfolio data from a JSON file
// and renders the portfolio sections

document.addEventListener('DOMContentLoaded', function() {
  // In a real implementation, this would fetch the data
  // But here we're just showing the concept
  const portfolioData = loadPortfolioData();
  renderPortfolio(portfolioData);
  
  // Initialize navigation and interactivity
  initializeNav();
});

function loadPortfolioData() {
  // In reality, this would fetch from portfolio-data.json
  return ${JSON.stringify(portfolioData, null, 2)};
}

function renderPortfolio(data) {
  // This would render each section based on the data
  console.log('Portfolio data loaded:', data);
}

function initializeNav() {
  // Initialize navigation interactivity
  console.log('Navigation initialized');
}`;

  const jsonCode = JSON.stringify(portfolioData, null, 2);

  const twConfigCode = `module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '${portfolioData.settings.primaryColor}',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  variants: {},
  plugins: [],
}`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className={`fixed top-[60px] right-0 bottom-0 w-96 bg-white border-l shadow-lg transition-all duration-300 z-30 ${
      showCode ? "" : "translate-x-full"
    }`}>
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="font-display font-semibold">View Code</h3>
        <Button variant="ghost" size="sm" onClick={() => setShowCode(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="html" className="p-4">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="html">HTML</TabsTrigger>
          <TabsTrigger value="css">CSS</TabsTrigger>
          <TabsTrigger value="js">JS</TabsTrigger>
          <TabsTrigger value="json">JSON</TabsTrigger>
          <TabsTrigger value="tw">TW Config</TabsTrigger>
        </TabsList>

        {[
          { id: "html", label: "index.html", code: htmlCode },
          { id: "css", label: "styles.css", code: cssCode },
          { id: "js", label: "script.js", code: jsCode },
          { id: "json", label: "portfolio-data.json", code: jsonCode },
          { id: "tw", label: "tailwind.config.js", code: twConfigCode },
        ].map((tab) => (
          <TabsContent key={tab.id} value={tab.id}>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-semibold">{tab.label}</h4>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => copyToClipboard(tab.code, tab.id)}
                className="text-xs"
              >
                {copied === tab.id ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <pre className="bg-gray-50 p-4 rounded border overflow-auto max-h-[calc(100vh-220px)] text-xs">
              <code>{tab.code}</code>
            </pre>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default CodeView;
