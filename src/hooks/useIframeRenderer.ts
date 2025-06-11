import { useRef, useEffect, useState } from "react";

export const useIframeRenderer = (portfolioData: any, currentView: string) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [renderTimer, setRenderTimer] = useState<NodeJS.Timeout | null>(null);

  // Initialize iframe when component mounts or when portfolio data changes
  useEffect(() => {
    // Reset loaded state when view changes
    if (currentView) {
      setIsLoaded(false);
    }
    
    // Clear any existing timer
    if (renderTimer) {
      clearTimeout(renderTimer);
    }
    
    // Add a delay to prevent too frequent refreshes when typing in form fields
    const timer = setTimeout(() => {
      renderPortfolio();
    }, 300); // 300ms debounce
    
    setRenderTimer(timer);
    
    return () => {
      if (renderTimer) {
        clearTimeout(renderTimer);
      }
    };
  }, [portfolioData, currentView]);

  // Function to handle iframe load events
  const handleIframeLoad = () => {
    if (!isLoaded) {
      // If iframe just loaded but content not yet inserted, render it
      renderPortfolio();
    }
  };

  const renderPortfolio = () => {
    if (!iframeRef.current) return;
    
    try {
      const iframeDoc = iframeRef.current.contentDocument || 
                       (iframeRef.current.contentWindow?.document);
      
      if (iframeDoc) {
        // Start with a clean document
        iframeDoc.open();
        
        // Generate the full HTML document using the updated theme
        const html = generatePortfolioHTML(portfolioData);
        
        // Write the HTML to the iframe
        iframeDoc.write(html);
        iframeDoc.close();
        setIsLoaded(true);
      }
    } catch (error) {
      console.error("Error rendering portfolio preview:", error);
    }
  };

  return {
    iframeRef,
    handleIframeLoad
  };
};

// Generate portfolio HTML with the updated theme
const generatePortfolioHTML = (portfolioData: any): string => {
  return `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Portfolio - ${portfolioData.settings.name}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Ovo&family=Playfair+Display:wght@400;500;600;700;800;900&family=Poppins:wght@100;200;300;400;500;600;700;800;900&family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Montserrat:wght@100;200;300;400;500;600;700;800;900&family=Raleway:wght@100;200;300;400;500;600;700;800;900&family=Schibsted+Grotesk:wght@400;500;600;700;800;900&family=Outfit:wght@100;200;300;400;500;600;700;800;900&display=swap"
      rel="stylesheet"
    />

    <style>
      ${getPortfolioStyles()}
    </style>

    <script>
      ${getTailwindConfig()}
    </script>
  </head>
  <body
    class="overflow-x-hidden font-Schibsted leading-8 bg-white text-primary dark:bg-darkTheme dark:text-white"
  >
    <div id="app"></div>

    <script>
      ${getClientSideScript(portfolioData)}
    </script>
  </body>
</html>
  `;
};

// Get Tailwind configuration
const getTailwindConfig = (): string => {
  return `
    tailwind.config = {
      theme: {
        extend: {
          gridTemplateColumns: {
            auto: "repeat(auto-fit, minmax(200px, 1fr))",
          },
          fontFamily: {
            Ovo: ["Ovo", "serif"],
            Playfair: ["Playfair Display", "serif"],
            Poppins: ["Poppins", "sans-serif"],
            Inter: ["Inter", "sans-serif"],
            Montserrat: ["Montserrat", "sans-serif"],
            Raleway: ["Raleway", "sans-serif"],
            Schibsted: ["Schibsted Grotesk", "sans-serif"],
            Outfit: ["Outfit", "sans-serif"],
          },
          animation: {
            "fade-in": "fadeIn 0.7s ease-out both",
            "slide-up": "slideUp 0.7s cubic-bezier(0.4,0,0.2,1) both",
            float: "float 3s ease-in-out infinite",
            "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            "bounce-slow": "bounce 3s infinite",
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
            float: {
              "0%, 100%": { transform: "translateY(0)" },
              "50%": { transform: "translateY(-10px)" },
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
          boxShadow: {
            soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
            hover: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          },
          backdropBlur: {
            xs: "2px",
          },
        },
      },
      darkMode: "selector",
    };
  `;
};

// Get portfolio styles (CSS) - Updated with new styles
const getPortfolioStyles = (): string => {
  return `
    :root {
      --primary-color: #16a34a;
      --primary-color-light: rgba(22, 163, 74, 0.08);
      --primary-color-rgb: 22, 163, 74;
      --glass-bg: rgba(255, 255, 255, 0.1);
      --card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      --hover-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
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
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .hero-bg {
      background: linear-gradient(135deg, var(--primary-color-light) 0%, #fff 100%);
      position: relative;
      overflow: hidden;
    }

    .hero-bg .smoke-effect {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      background: radial-gradient(circle at 60% 40%, var(--primary-color-light) 0%, transparent 70%), radial-gradient(circle at 20% 80%, var(--primary-color-light) 0%, transparent 80%);
    }

    .hero-bg::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.8) 0%, transparent 50%);
      opacity: 0.5;
    }

    .dark .hero-bg {
      background: linear-gradient(135deg, #000 0%, #111 100%) !important;
    }

    .dark .hero-bg::before {
      background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
    }

    .footer-bg-smoke {
      background: linear-gradient(135deg, rgba(var(--primary-color-rgb, 22, 163, 74), 0.06) 0%, transparent 100%);
    }

    .dark .footer-bg-smoke {
      background: linear-gradient(135deg, rgba(var(--primary-color-rgb, 22, 163, 74), 0.1) 0%, transparent 100%) !important;
    }

    html, body {
      margin: 0;
      padding: 0;
      height: 100vh;
      overflow-x: hidden;
      scroll-behavior: smooth;
    }

    #app {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .main-content {
      flex: 1;
    }

    /* Modern Card Styles */
    .modern-card {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: var(--card-shadow);
      transition: all 0.3s ease;
    }

    .modern-card:hover {
      transform: translateY(-5px);
      box-shadow: var(--hover-shadow);
    }

    .dark .modern-card {
      background: rgba(17, 17, 17, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    /* Smooth Scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
    }

    ::-webkit-scrollbar-track {
      background: transparent;
    }

    ::-webkit-scrollbar-thumb {
      background: var(--primary-color);
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: var(--primary-color-light);
    }

    /* Custom Animations */
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
      100% { transform: translateY(0px); }
    }

    .float-animation {
      animation: float 3s ease-in-out infinite;
    }

    /* Gradient Text */
    .gradient-text {
      color: var(--primary-color) !important;
      background: none !important;
      -webkit-background-clip: unset !important;
      -webkit-text-fill-color: unset !important;
      background-clip: unset !important;
    }

    .primary-text {
      color: var(--primary-color) !important;
    }

    .footer-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.7em;
    }

    .footer-badge-wrapper {
      margin-top: 1.1em;
      display: flex;
      justify-content: center;
    }

    .framecv-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4em;
      background: transparent;
      border-radius: 1.2em;
      padding: 0.25em 0.8em 0.25em 0.5em;
      font-size: 0.85em;
      color: var(--primary-color);
      font-weight: 500;
      border: 1px solid rgba(var(--primary-color-rgb, 22, 163, 74), 0.2);
      box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.05);
      transition: all 0.2s ease;
      text-decoration: none;
      opacity: 0.9;
      letter-spacing: 0.01em;
    }

    .framecv-badge:hover {
      background: rgba(var(--primary-color-rgb, 22, 163, 74), 0.05);
      color: var(--primary-color);
      border: 1px solid var(--primary-color);
      box-shadow: 0 2px 8px 0 rgba(var(--primary-color-rgb, 22, 163, 74), 0.1);
      opacity: 1;
    }

    .framecv-badge svg {
      width: 1em;
      height: 1em;
      display: inline-block;
      vertical-align: middle;
      margin-right: 0.15em;
      border-radius: 0.25em;
      background: transparent;
      box-shadow: none;
      padding: 0.05em;
    }
    
    .dark .framecv-badge {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.9);
    }

    .dark .framecv-badge:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
      color: white;
    }
    
    .hero-title-spaced {
      line-height: 1.22;
    }
  `;
};

// Extract client-side script to separate function
const getClientSideScript = (portfolioData: any): string => {
  return `
    // getIconSVG: Inline SVGs for all icons used in the portfolio
    function getIconSVG(name) {
      switch (name) {
        case "mail":
          return '<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>';
        case "download":
          return '<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H4a2 2 0 01-2-2v-8a2 2 0 012-2h16a2 2 0 012 2v8a2 2 0 01-2 2z"/></svg>';
        case "phone":
          return '<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>';
        case "map":
          return '<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>';
        case "globe":
          return '<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 0c2.5 0 4.5 4.5 4.5 10S14.5 22 12 22 7.5 17.5 7.5 12 9.5 2 12 2zm0 0c5.25 0 9.5 4.03 9.5 10s-4.25 10-9.5 10m-9.5-10h19" /></svg>';
        case "linkedin":
          return '<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>';
        case "github":
          return '<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>';
        case "twitter":
          return '<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>';
        case "instagram":
          return '<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>';
        case "document":
          return '<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25m-9-3H9M12 10.5H9m6.75 4.5H9m5.25 4.5H9"/></svg>';
        default:
          return "";
      }
    }

    // Font mapping for CSS classes
    function getFontClass(fontName) {
      switch (fontName) {
        case "ovo":
          return "font-Ovo";
        case "playfair":
          return "font-Playfair";
        case "poppins":
          return "font-Poppins";
        case "inter":
          return "font-Inter";
        case "montserrat":
          return "font-Montserrat";
        case "raleway":
          return "font-Raleway";
        case "schibsted":
          return "font-Schibsted";
        case "outfit":
          return "font-Outfit";
        default:
          return "font-Ovo";
      }
    }

    // Theme functions
    function setThemeIcon() {
      const iconSpan = document.getElementById("theme-toggle-icon");
      if (!iconSpan) return;
      if (document.documentElement.classList.contains("dark")) {
        iconSpan.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>';
      } else {
        iconSpan.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>';
      }
    }

    window.toggleTheme = function () {
      document.documentElement.classList.toggle("dark");
      if (document.documentElement.classList.contains("dark")) {
        localStorage.theme = "dark";
      } else {
        localStorage.theme = "light";
      }
      setThemeIcon();
    };

    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Main rendering function
    function renderPortfolio() {
      try {
        const data = ${JSON.stringify(portfolioData)};

        // Set CSS variables
        document.documentElement.style.setProperty(
          "--primary-color",
          data.settings.primaryColor || "#16A34A"
        );

        function hexToRgb(hex) {
          let c = hex.replace("#", "");
          if (c.length === 3)
            c = c.split("").map((x) => x + x).join("");
          const num = parseInt(c, 16);
          return [(num >> 16) & 255, (num >> 8) & 255, num & 255].join(",");
        }

        document.documentElement.style.setProperty(
          "--primary-color-rgb",
          hexToRgb(data.settings.primaryColor || "#16A34A")
        );

        function hexToRgba(hex, alpha) {
          let c = hex.replace("#", "");
          if (c.length === 3)
            c = c.split("").map((x) => x + x).join("");
          const num = parseInt(c, 16);
          return "rgba(" + ((num >> 16) & 255) + "," + ((num >> 8) & 255) + "," + (num & 255) + "," + alpha + ")";
        }

        document.documentElement.style.setProperty(
          "--primary-color-light",
          hexToRgba(data.settings.primaryColor || "#16A34A", 0.08)
        );
        document.documentElement.style.setProperty(
          "--glass-bg",
          hexToRgba(data.settings.primaryColor || "#16A34A", 0.1)
        );

        const primaryFontClass = getFontClass(data.settings.fonts?.primary || "ovo");
        const secondaryFontClass = getFontClass(data.settings.fonts?.secondary || "schibsted");

        const nameParts = (data.settings.name || "").trim().split(" ");
        const logoName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];

        let navLinks = "";
        (data.navigation.items || []).forEach((link) => {
          navLinks += '<li><a href="' + link.url + '" class="hover:text-dynamic-primary transition-colors duration-300 relative after:content-[\\'\\'] after:absolute after:w-0 after:h-0.5 after:bg-dynamic-primary after:left-0 after:-bottom-1 after:transition-all hover:after:w-full">' + link.name + "</a></li>";
        });

        // Navigation bar
        let nav = '<nav class="w-full flex justify-between items-center px-4 sm:px-6 md:px-8 py-5 bg-white/80 dark:bg-black/90 backdrop-blur-md fixed top-0 left-0 z-50 border-b border-gray-200 dark:border-gray-800"><span class="' + primaryFontClass + ' text-xl font-bold tracking-tight primary-text">' + logoName + '<span class="dynamic-primary">.</span></span><ul class="hidden md:flex gap-6 sm:gap-8 md:gap-10 ' + primaryFontClass + ' text-lg">' + navLinks + '</ul><div class="flex items-center gap-4"><button id="theme-toggle" onclick="toggleTheme()" class="transition-colors duration-300 focus:outline-none hover:scale-110"><span id="theme-toggle-icon"></span></button><a href="#contact" class="px-6 py-2 rounded-full bg-dynamic-primary text-white ' + primaryFontClass + ' font-medium shadow hover:scale-105 transition-all duration-300 hover:shadow-lg">Connect</a></div></nav>';

        // Hero section with updated smoke effect
        let hero = "";
        if (data.sections.hero && data.sections.hero.enabled) {
          let ctas = "";
          (data.sections.hero.ctaButtons || []).forEach((btn) => {
            let iconName = btn.icon;
            if (btn.text.toLowerCase().includes("resume")) iconName = "document";
            ctas += '<a href="' + btn.url + '" class="flex items-center gap-2 ' + (btn.isPrimary ? "px-8 py-3 rounded-full bg-dynamic-primary text-white font-medium shadow hover:scale-105 transition-all duration-300 hover:shadow-lg" : "px-8 py-3 rounded-full border border-gray-400 dynamic-primary bg-white dark:bg-darkTheme dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 transition-all duration-300 hover:shadow-md") + '">' + (iconName ? getIconSVG(iconName) : "") + "<span>" + btn.text + "</span></a>";
          });
          
          hero = '<div class="hero-bg w-full min-h-[60vh] relative overflow-hidden"><div class="smoke-effect"></div><header id="home" class="relative z-10 pt-36 pb-16 flex flex-col items-center text-center max-w-2xl mx-auto animate-fade-in px-4 sm:px-6 md:px-8 w-full"><img src="' + data.settings.profileImage + '" alt="Profile" class="rounded-full w-24 h-24 object-cover mb-8 border-4 border-white shadow-lg float-animation" /><h2 class="' + primaryFontClass + " text-2xl mb-3 animate-slide-up primary-text\\">Hi! I'm " + data.settings.name + ' <span class="inline-block">👋</span></h2><h1 class="' + primaryFontClass + ' text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 animate-slide-up hero-title-spaced">' + data.settings.title + "<br />based in " + data.settings.location + '.</h1><p class="text-sm sm:text-[16px] text-gray-600 dark:text-gray-400 mb-10 sm:mb-12 animate-fade-in leading-relaxed">' + data.settings.summary + '</p><div class="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">' + ctas + "</div></header></div>";
        }

        // About section with modern cards
        let about = "";
        if (data.sections.about && data.sections.about.enabled) {
          let skills = "";
          if (data.sections.about.skills && data.sections.about.skills.enabled) {
            let skillTags = "";
            data.sections.about.skills.items.forEach((skill) => {
              skillTags += '<span class="px-4 py-1 rounded-full border border-gray-300 text-sm bg-primary-light dark:bg-black dark:border-gray-700 transition-all duration-300 hover:scale-105 hover:shadow-md">' + skill + "</span>";
            });
            skills = '<h2 class="' + primaryFontClass + ' text-2xl mb-4 mt-8 primary-text">' + data.sections.about.skills.title + '</h2><div class="flex flex-wrap justify-center gap-3">' + skillTags + "</div>";
          }
          about = '<section id="about" class="py-12 sm:py-16 md:py-20 bg-white dark:bg-black animate-fade-in px-4 sm:px-6 md:px-8 w-full"><div class="max-w-2xl mx-auto text-center"><h2 class="' + primaryFontClass + ' text-2xl sm:text-3xl mb-3 sm:mb-4 primary-text">' + data.sections.about.title + '</h2><p class="mb-6 sm:mb-8 text-gray-700 dark:text-gray-300">' + data.sections.about.content + "</p>" + skills + "</div></section>";
        }

        // Projects section with modern cards
        let projects = "";
        if (data.sections.projects && data.sections.projects.enabled) {
          let projectCards = "";
          data.sections.projects.items.forEach((project) => {
            let projectTags = "";
            project.tags.forEach((tag) => {
              projectTags += '<span class="text-xs px-3 py-1 rounded-full bg-primary-light dark:bg-black border border-gray-200 dark:border-gray-700">' + tag + "</span>";
            });
            let projectLink = "";
            if (project.previewUrl && project.previewUrl !== "#") {
              projectLink = '<a href="' + project.previewUrl + '" class="dynamic-primary font-normal hover:underline text-base flex items-center gap-1 group"><span>View project</span> <span class="transform group-hover:translate-x-1 transition-transform">→</span></a>';
            }
            projectCards += '<div class="modern-card rounded-2xl p-7 flex flex-col gap-3 w-full max-w-md mx-auto"><h3 class="' + primaryFontClass + ' text-lg mb-1 primary-text">' + project.title + '</h3><p class="text-sm text-gray-600 dark:text-gray-400">' + project.description + '</p><div class="flex flex-wrap gap-2 mb-2">' + projectTags + "</div>" + projectLink + "</div>";
          });
          projects = '<section id="projects" class="py-12 sm:py-16 bg-white dark:bg-black animate-fade-in px-2 sm:px-4 md:px-8 w-full"><div class="max-w-4xl mx-auto text-center mb-8 sm:mb-10"><h2 class="' + primaryFontClass + ' text-2xl sm:text-3xl mb-2 primary-text">' + data.sections.projects.title + '</h2></div><div class="max-w-5xl mx-auto grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 justify-center">' + projectCards + "</div></section>";
        }

        // Experience section with modern cards
        let experience = "";
        if (data.sections.experience && data.sections.experience.enabled) {
          let experienceItems = "";
          data.sections.experience.items.forEach((item) => {
            experienceItems += '<div class="modern-card rounded-2xl p-6 flex gap-4 items-start"><div class="w-3 h-3 mt-2 rounded-full bg-dynamic-primary"></div><div><h3 class="' + primaryFontClass + ' text-lg mb-1 primary-text">' + item.position + '</h3><div class="text-sm text-gray-500 mb-1">' + item.company + " • " + item.period + '</div><p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-2">' + item.description + "</p></div></div>";
          });
          experience = '<section id="experience" class="py-12 sm:py-16 bg-white dark:bg-black animate-fade-in px-4 sm:px-6 md:px-8 w-full"><div class="max-w-4xl mx-auto text-center mb-8 sm:mb-10"><h2 class="' + primaryFontClass + ' text-2xl sm:text-3xl mb-2 primary-text">' + data.sections.experience.title + '</h2></div><div class="max-w-2xl mx-auto flex flex-col gap-6 sm:gap-8">' + experienceItems + "</div></section>";
        }

        // Education section with modern cards
        let education = "";
        if (data.sections.education && data.sections.education.enabled) {
          let educationItems = "";
          data.sections.education.items.forEach((item) => {
            educationItems += '<div class="modern-card rounded-2xl p-6 flex flex-col gap-1"><h3 class="' + primaryFontClass + ' text-lg mb-1 primary-text">' + item.degree + '</h3><div class="text-sm text-gray-500 mb-1">' + item.institution + " • " + item.period + "</div></div>";
          });
          education = '<section id="education" class="py-12 sm:py-16 bg-white dark:bg-black animate-fade-in px-4 sm:px-6 md:px-8 w-full"><div class="max-w-4xl mx-auto text-center mb-8 sm:mb-10"><h2 class="' + primaryFontClass + ' text-2xl sm:text-3xl mb-2 primary-text">' + data.sections.education.title + '</h2></div><div class="max-w-2xl mx-auto flex flex-col gap-6">' + educationItems + "</div></section>";
        }

        // Contact section with clickable cards - FIXED NULL HANDLING
        let contact = "";
        if (data.sections.contact && data.sections.contact.enabled) {
          let contactCards = "";
          const contactInfo = [];
          
          // Only add email if it exists
          if (data.sections.contact.email) {
            contactInfo.push({
              icon: getIconSVG("mail"),
              value: data.sections.contact.email,
              link: "mailto:" + data.sections.contact.email,
            });
          }
          
          // Only add phone if it exists and is not null
          if (data.sections.contact.phone && data.sections.contact.phone !== null) {
            contactInfo.push({
              icon: getIconSVG("phone"),
              value: data.sections.contact.phone,
              link: "tel:" + data.sections.contact.phone.replace(/[^\\d+]/g, ""),
            });
          }
          
          // Only add location if it exists
          if (data.sections.contact.location) {
            contactInfo.push({
              icon: getIconSVG("map"),
              value: data.sections.contact.location,
              link: "https://www.google.com/maps/search/" + encodeURIComponent(data.sections.contact.location),
            });
          }
          
          contactInfo.forEach((card) => {
            contactCards += '<a href="' + card.link + '" target="_blank" rel="noopener noreferrer" class="modern-card w-full sm:w-auto min-w-0 max-w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm ' + secondaryFontClass + ' text-gray-700 dark:text-gray-200 justify-center" style="font-size:14px;font-weight:500;">' + card.icon + '<span class="break-words">' + card.value + "</span></a>";
          });
          contact = '<section id="contact" class="py-6 sm:py-8 bg-white dark:bg-black animate-fade-in px-4 sm:px-6 md:px-8 w-full"><div class="max-w-2xl mx-auto text-center mb-3 sm:mb-4"><h2 class="' + primaryFontClass + ' text-3xl sm:text-4xl mb-3 sm:mb-4 primary-text">' + data.sections.contact.title + '</h2><div class="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 mb-3 sm:mb-4 px-4 sm:px-0">' + contactCards + "</div></div></section>";
        }

        // Social section with modern cards
        let social = "";
        if (data.sections.social && data.sections.social.enabled) {
          let socialLinks = "";
          data.sections.social.items.forEach((item) => {
            socialLinks += '<a href="' + item.url + '" class="modern-card flex items-center gap-2 px-4 py-3 rounded-xl text-sm ' + secondaryFontClass + ' text-gray-700 dark:text-gray-200 justify-center hover:scale-105 transition-transform duration-300">' + getIconSVG(item.icon) + "<span>" + item.platform + "</span></a>";
          });
          social = '<section id="social" class="py-4 bg-white dark:bg-black animate-fade-in px-4 sm:px-0 w-full"><div class="max-w-2xl mx-auto text-center mb-3 sm:mb-4 w-full px-4 sm:px-0"><h3 class="' + primaryFontClass + ' text-xl sm:text-2xl mb-3 sm:mb-4 mt-4 primary-text">Social Media</h3><div class="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-2 px-4 sm:px-0">' + socialLinks + "</div></div></section>";
        }

        // Footer with updated FrameCV badge
        let footer = "";
        if (data.footer && data.footer.enabled) {
          const framecvBadge = '<div class="footer-badge-wrapper"><a href="https://framecv.com" class="framecv-badge" target="_blank" rel="noopener noreferrer" title="Built with FrameCV"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24" zoomAndPan="magnify" viewBox="0 0 375 374.999991" height="24" preserveAspectRatio="xMidYMid meet" version="1.2"><defs><clipPath id="6219930390"><path d="M 4.1875 14.59375 L 371 14.59375 L 371 360.40625 L 4.1875 360.40625 Z M 4.1875 14.59375 "/></clipPath><clipPath id="a8f637eb54"><path d="M 45.4375 14.59375 L 329.5625 14.59375 C 352.34375 14.59375 370.8125 33.0625 370.8125 55.84375 L 370.8125 319.15625 C 370.8125 341.9375 352.34375 360.40625 329.5625 360.40625 L 45.4375 360.40625 C 22.65625 360.40625 4.1875 341.9375 4.1875 319.15625 L 4.1875 55.84375 C 4.1875 33.0625 22.65625 14.59375 45.4375 14.59375 Z M 45.4375 14.59375 "/></clipPath><clipPath id="1951409292"><path d="M 121 73.691406 L 296.957031 73.691406 L 296.957031 150 L 121 150 Z M 121 73.691406 "/></clipPath><clipPath id="702972dd2f"><path d="M 77.957031 149 L 210 149 L 210 226 L 77.957031 226 Z M 77.957031 149 "/></clipPath><clipPath id="32938a13ad"><path d="M 77.957031 225 L 166 225 L 166 300.941406 L 77.957031 300.941406 Z M 77.957031 225 "/></clipPath></defs><g id="dc681a35a4"><g clip-rule="nonzero" clip-path="url(#6219930390)"><g clip-rule="nonzero" clip-path="url(#a8f637eb54)"><path style=" stroke:none;fill-rule:nonzero;fill:#171717;fill-opacity:1;" d="M 4.1875 14.59375 L 370.261719 14.59375 L 370.261719 360.40625 L 4.1875 360.40625 Z M 4.1875 14.59375 "/></g></g><g clip-rule="nonzero" clip-path="url(#1951409292)"><path style=" stroke:none;fill-rule:nonzero;fill:#ffffff;fill-opacity:1;" d="M 141.574219 73.691406 L 121.722656 73.691406 L 165.457031 149.441406 L 252.929688 149.441406 L 296.664062 73.691406 Z M 141.574219 73.691406 "/></g><g clip-rule="nonzero" clip-path="url(#702972dd2f)"><path style=" stroke:none;fill-rule:nonzero;fill:#ffffff;fill-opacity:1;" d="M 121.71875 225.191406 L 209.191406 225.191406 L 165.453125 149.445312 L 77.984375 149.445312 Z M 121.71875 225.191406 "/></g><g clip-rule="nonzero" clip-path="url(#32938a13ad)"><path style=" stroke:none;fill-rule:nonzero;fill:#ffffff;fill-opacity:1;" d="M 165.453125 300.945312 L 121.71875 225.191406 L 77.984375 300.945312 Z M 165.453125 300.945312 "/></g></g></svg><span>Built with FrameCV</span></a></div>';
          footer = '<footer class="footer-bg-smoke py-8 text-center text-sm text-gray-600 dark:text-gray-400 mt-auto w-full"><div class="footer-content max-w-2xl mx-auto px-4">' + data.footer.copyright + framecvBadge + "</div></footer>";
        } else {
          footer = '<footer class="bg-white dark:bg-darkTheme py-4 mt-auto w-full"></footer>';
        }

        // Combine all sections
        const content = nav + '<div class="main-content">' + hero + about + projects + experience + education + contact + social + "</div>" + footer;
        document.getElementById("app").innerHTML = content;
        setThemeIcon();
      } catch (err) {
        document.getElementById("app").innerHTML = "<pre style='color:red'>" + err + "</pre>";
        console.error(err);
      }
    }

    // Initialize the portfolio
    renderPortfolio();
  `;
};
