import React, { useEffect, useRef, useState } from "react";
import { usePortfolio } from "@/context/PortfolioContext";

const PortfolioPreview: React.FC = () => {
  const { portfolioData, currentView, showEditor } = usePortfolio();
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize iframe content when the component mounts
  useEffect(() => {
    const initIframe = () => {
      if (iframeRef.current) {
        renderPortfolioInIframe();
        setIsLoaded(true);
      }
    };
    
    // Initial render with a slight delay to ensure iframe is ready
    const timer = setTimeout(initIframe, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // Re-render when portfolio data or view changes
  useEffect(() => {
    if (iframeRef.current && isLoaded) {
      renderPortfolioInIframe();
    }
  }, [portfolioData, currentView, isLoaded]);

  const renderPortfolioInIframe = () => {
    if (!iframeRef.current) return;
    
    const iframe = iframeRef.current;
    const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDocument) return;
    
    // Clear existing content
    iframeDocument.open();
    
    // Write the full HTML document including your template structure
    iframeDocument.write(`
      <!DOCTYPE html>
      <html lang="en" class="scroll-smooth">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Portfolio - ${portfolioData.settings.name}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
          <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&family=Ovo&family=Schibsted+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
          
          <style>
            /* Base Tailwind Reset */
            *,::before,::after{box-sizing:border-box;border-width:0;border-style:solid;border-color:currentColor}
            html{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif}
            body{margin:0;line-height:inherit}
            
            /* Tailwind Config */
            ${getTailwindConfig()}
            
            /* Portfolio Styles */
            ${getPortfolioStyles()}
            
            /* Set body height to 100% to avoid scrolling issues in the iframe */
            body {
              min-height: 100%;
              overflow-x: hidden;
            }
          </style>
        </head>
        <body class="font-Schibsted leading-8 bg-white text-primary dark:bg-darkTheme dark:text-white">
          <div id="app"></div>
          
          <script>
            // Force the immediate execution of the script
            ${getPortfolioScripts()}
            
            // Initialize with portfolio data
            const portfolioData = ${JSON.stringify(portfolioData)};
            
            // Immediately render the portfolio
            (function() {
              try {
                renderPortfolio();
                setThemeIcon();
              } catch(e) {
                console.error("Error rendering portfolio:", e);
                document.getElementById("app").innerHTML = "<div style='color:red;padding:20px;'>Error rendering portfolio: " + e.message + "</div>";
              }
            })();
            
            // Function to render the portfolio
            function renderPortfolio() {
              const data = portfolioData;
              
              // Set primary color and light version
              document.documentElement.style.setProperty(
                "--primary-color",
                data.settings.primaryColor || "#d65822"
              );
              
              // Calculate a very light version of primary color for backgrounds
              function hexToRgba(hex, alpha) {
                let c = hex.replace("#", "");
                if (c.length === 3)
                  c = c
                    .split("")
                    .map((x) => x + x)
                    .join("");
                const num = parseInt(c, 16);
                return \`rgba(\${(num >> 16) & 255},\${(num >> 8) & 255},\${
                  num & 255
                },\${alpha})\`;
              }
              
              document.documentElement.style.setProperty(
                "--primary-color-light",
                hexToRgba(data.settings.primaryColor || "#d65822", 0.08)
              );
              document.documentElement.style.setProperty(
                "--glass-bg",
                hexToRgba(data.settings.primaryColor || "#d65822", 0.1)
              );
              
              // Get last name for logo
              const nameParts = (data.settings.name || "").trim().split(" ");
              const logoName =
                nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];
                
              // Navigation
              let navLinks = "";
              (data.navigation.items || []).forEach((link) => {
                navLinks += \`<li><a href="\${link.url}" class="hover:dynamic-primary transition-colors duration-300">\${link.name}</a></li>\`;
              });
              
              // Header/Navbar
              let nav = \`<nav class="w-full flex justify-between items-center px-4 sm:px-6 md:px-8 py-5 bg-white/80 dark:bg-black/90 backdrop-blur-md fixed top-0 left-0 z-50">
                <span class="font-Ovo text-xl font-bold tracking-tight">\${logoName}<span class='dynamic-primary'>.</span></span>
                <ul class="hidden md:flex gap-6 sm:gap-8 md:gap-10 font-Ovo text-lg border-none bg-transparent shadow-none">\${navLinks}</ul>
                <div class="flex items-center gap-4">
                  <button id="theme-toggle" onclick="toggleTheme()" class="transition-colors duration-300 focus:outline-none">
                    <span id="theme-toggle-icon"></span>
                  </button>
                  <a href="#contact" class="px-6 py-2 rounded-full bg-dynamic-primary text-white font-Ovo font-medium shadow hover:scale-105 transition-transform duration-300">Connect</a>
                </div>
              </nav>\`;
              
              // Hero Section
              let hero = "";
              if (data.sections.hero && data.sections.hero.enabled) {
                let ctas = "";
                (data.sections.hero.ctaButtons || []).forEach((btn) => {
                  ctas += \`<a href="\${btn.url}" class="flex items-center gap-2 \${
                    btn.isPrimary
                      ? "px-8 py-3 rounded-full bg-dynamic-primary text-white font-medium shadow hover:scale-105 transition-transform duration-300"
                      : "px-8 py-3 rounded-full border border-gray-400 dynamic-primary bg-white dark:bg-darkTheme dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors duration-300"
                  }">\${btn.icon ? getIconSVG(btn.icon) : ""}<span>\${btn.text}</span></a>\`;
                });
                hero = \`<div class="hero-bg w-full"><header id="home" class="pt-36 pb-16 flex flex-col items-center text-center max-w-2xl mx-auto animate-fade-in px-4 sm:px-6 md:px-8 w-full">
                  <img src="\${data.settings.profileImage}" alt="Profile" class="rounded-full w-28 mb-8 border-4 border-white shadow-md animate-fade-in" />
                  <h2 class="font-Ovo text-xl mb-3 animate-slide-up">Hi! I'm \${data.settings.name} <span class="inline-block">👋</span></h2>
                  <h1 class="font-Ovo text-5xl sm:text-6xl font-bold mb-6 animate-slide-up">\${data.settings.title}<br />based in \${data.settings.location}.</h1>
                  <p class="text-[16px] text-gray-600 dark:text-gray-400 mb-8 animate-fade-in">\${data.settings.summary}</p>
                  <div class="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">\${ctas}</div>
                </header></div>\`;
              }
              
              // About Section
              let about = "";
              if (data.sections.about && data.sections.about.enabled) {
                let skills = "";
                if (data.sections.about.skills && data.sections.about.skills.enabled) {
                  skills = \`<h2 class="font-Ovo text-2xl mb-4 mt-8">\${
                    data.sections.about.skills.title
                  }</h2><div class="flex flex-wrap justify-center gap-3">\${data.sections.about.skills.items
                    .map(
                      (skill) =>
                        \`<span class="px-4 py-1 rounded-full border border-gray-300 text-sm bg-primary-light dark:bg-black dark:border-gray-700 transition-all duration-300">\${skill}</span>\`
                    )
                    .join("")}</div>\`;
                }
                about = \`<section id="about" class="py-16 sm:py-20 bg-white dark:bg-black animate-fade-in px-4 sm:px-6 md:px-8 w-full"><div class="max-w-2xl mx-auto text-center"><h2 class="font-Ovo text-3xl mb-4">\${data.sections.about.title}</h2><p class="mb-8 text-gray-700 dark:text-gray-300">\${data.sections.about.content}</p>\${skills}</div></section>\`;
              }
              
              // Projects Section
              let projects = "";
              if (data.sections.projects && data.sections.projects.enabled) {
                // Centered grid, stretch width, light primary color for tags
                const projectCards = data.sections.projects.items
                  .map(
                    (project) =>
                      \`<div class="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-7 flex flex-col gap-3 shadow-sm hover:shadow-md transition w-full max-w-md mx-auto">
                        <h3 class="font-Ovo text-lg mb-1">\${project.title}</h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400">\${
                          project.description
                        }</p>
                        <div class="flex flex-wrap gap-2 mb-2">\${project.tags
                          .map(
                            (tag) =>
                              \`<span class="text-xs px-3 py-1 rounded-full bg-primary-light dark:bg-black border border-gray-200 dark:border-gray-700">\${tag}</span>\`
                          )
                          .join("")}</div>
                        \${
                          project.previewUrl && project.previewUrl !== "#"
                            ? \`<a href="\${project.previewUrl}" class="dynamic-primary font-normal hover:underline text-base flex items-center gap-1">View project <span aria-hidden="true">→</span></a>\`
                            : ""
                        }
                      </div>\`
                  )
                  .join("");
                projects = \`<section id="projects" class="py-16 bg-white dark:bg-black animate-fade-in px-2 sm:px-4 md:px-8 w-full"><div class="max-w-4xl mx-auto text-center mb-10"><h2 class="font-Ovo text-3xl mb-2">\${data.sections.projects.title}</h2></div><div class="max-w-5xl mx-auto grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 justify-center">\${projectCards}</div></section>\`;
              }
              
              // Experience Section
              let experience = "";
              if (data.sections.experience && data.sections.experience.enabled) {
                experience = \`<section id="experience" class="py-16 bg-white dark:bg-black animate-fade-in px-4 sm:px-6 md:px-8 w-full"><div class="max-w-4xl mx-auto text-center mb-10"><h2 class="font-Ovo text-3xl mb-2">\${
                  data.sections.experience.title
                }</h2></div><div class="max-w-2xl mx-auto flex flex-col gap-8">\${data.sections.experience.items
                  .map(
                    (item) =>
                      \`<div class="flex gap-4 items-start"><div class="w-3 h-3 mt-2 rounded-full bg-dynamic-primary"></div><div><h3 class="font-Ovo text-lg mb-1">\${item.position}</h3><div class="text-sm text-gray-500 mb-1">\${item.company} • \${item.period}</div><p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-2">\${item.description}</p></div></div>\`
                  )
                  .join("")}</div></section>\`;
              }
              
              // Education Section
              let education = "";
              if (data.sections.education && data.sections.education.enabled) {
                education = \`<section id="education" class="py-16 bg-white dark:bg-black animate-fade-in px-4 sm:px-6 md:px-8 w-full"><div class="max-w-4xl mx-auto text-center mb-10"><h2 class="font-Ovo text-3xl mb-2">\${
                  data.sections.education.title
                }</h2></div><div class="max-w-2xl mx-auto flex flex-col gap-6">\${data.sections.education.items
                  .map(
                    (item) =>
                      \`<div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 flex flex-col gap-1 shadow-sm w-full"><h3 class="font-Ovo text-lg mb-1">\${item.degree}</h3><div class="text-sm text-gray-500 mb-1">\${item.institution} • \${item.period}</div></div>\`
                  )
                  .join("")}</div></section>\`;
              }
              
              // Contact Section
              let contact = "";
              if (data.sections.contact && data.sections.contact.enabled) {
                contact = \`<section id="contact" class="py-8 bg-white dark:bg-black animate-fade-in px-4 sm:px-6 md:px-8 w-full">
                <div class="max-w-2xl mx-auto text-center mb-4">
                    <h2 class="font-Ovo text-4xl mb-4">\${data.sections.contact.title}</h2>
                    <div class="flex flex-col sm:flex-row flex-wrap justify-center gap-4 mb-4 px-4 sm:px-0">
                        \${[
                          {
                            icon: getIconSVG("mail"),
                            value: data.sections.contact.email,
                          },
                          {
                            icon: getIconSVG("phone"),
                            value: data.sections.contact.phone,
                          },
                          {
                            icon: getIconSVG("map"),
                            value: data.sections.contact.location,
                          },
                        ]
                          .map(
                            (card) =>
                              \`<div class="w-full sm:w-auto min-w-0 max-w-full flex items-center gap-2 px-4 py-3 rounded-xl glass-bg text-sm font-Schibsted text-gray-700 dark:text-gray-200 justify-center shadow-sm" style="font-size:14px;font-weight:500;">
                                  \${card.icon}<span class="break-words">\${card.value}</span>
                              </div>\`
                          )
                          .join("")}
                    </div>
                </div>
              </section>\`;
              }
              
              // Social Section
              let social = "";
              if (data.sections.social && data.sections.social.enabled) {
                social = \`<section id="social" class="py-4 bg-white dark:bg-black animate-fade-in px-4 sm:px-0 w-full">
                <div class="max-w-2xl mx-auto text-center mb-4 w-full px-4 sm:px-0">
                    <h3 class="font-Ovo text-2xl mb-4 mt-4">Social Media</h3>
                    <div class="flex flex-col sm:flex-row justify-center gap-4 mb-2 px-4 sm:px-0">
                        \${data.sections.social.items
                          .map(
                            (item) =>
                              \`<a href="\${
                                item.url
                              }" class="flex items-center gap-2 px-4 py-3 rounded-xl glass-bg text-sm font-Schibsted text-gray-700 dark:text-gray-200 hover:bg-primary-light dark:hover:bg-gray-800 transition w-full sm:w-auto justify-center" style="font-size:14px;font-weight:500;">
                                  \${item.icon ? getIconSVG(item.icon) : ""}\${
                                item.platform
                              }
                              </a>\`
                          )
                          .join("")}
                    </div>
                </div>
              </section>\`;
              }
              
              // Footer
              let footer = "";
              if (data.footer && data.footer.enabled) {
                footer = \`<footer class="py-8 bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800 mt-0 px-4 sm:px-6 md:px-8 w-full">
                <div class="max-w-2xl mx-auto text-center flex flex-col gap-6 items-center">
                    <span class="font-Ovo text-2xl font-bold tracking-tight mb-2">\${logoName}<span class='dynamic-primary'>.</span></span>
                    <div class="flex flex-wrap justify-center gap-8 mb-2">
                        \${(data.navigation.items || [])
                          .map(
                            (link) =>
                              \`<a href="\${link.url}" class="text-gray-700 dark:text-gray-300 hover:dynamic-primary transition text-base">\${link.name}</a>\`
                          )
                          .join("")}
                    </div>
                    <p class="text-gray-500 dark:text-gray-400 text-sm mt-2 mb-2">\${
                      data.footer.copyright
                    }</p>
                    <div class="flex justify-center">
                        <span class="px-5 py-2 rounded-full glass-bg text-sm text-gray-700 dark:text-gray-200 font-medium">Built with Nithin.io</span>
                    </div>
                </div>
              </footer>\`;
              }
              
              document.getElementById("app").innerHTML =
                nav +
                hero +
                about +
                projects +
                experience +
                education +
                contact +
                social +
                footer;
                
              setThemeIcon();
            }
          </script>
        </body>
      </html>
    `);
    iframeDocument.close();
  };

  // Helper function to generate the Tailwind config
  const getTailwindConfig = () => {
    return `
      tailwind.config = {
        theme: {
          extend: {
            gridTemplateColumns: {
              auto: "repeat(auto-fit, minmax(200px, 1fr))",
            },
            fontFamily: {
              Outfit: ["Outfit", "sans-serif"],
              Ovo: ["Ovo", "serif"],
              Schibsted: ["Schibsted Grotesk", "sans-serif"]
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
              primary: "#333333",
              white: "#ffffff",
              black: "#000000",
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
      };
    `;
  };

  // Helper function to generate the portfolio styles
  const getPortfolioStyles = () => {
    return `
      :root {
        --primary-color: #d65822;
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
      }
      
      .animate-fade-in {
        animation: fadeIn 0.7s ease-out both;
      }
      .animate-slide-up {
        animation: slideUp 0.7s cubic-bezier(0.4,0,0.2,1) both;
      }
      @keyframes fadeIn {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
      @keyframes slideUp {
        0% { transform: translateY(30px); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
      }
      
      .font-Ovo {
        font-family: 'Ovo', serif;
      }
      .font-Outfit {
        font-family: 'Outfit', sans-serif;
      }
      .font-Schibsted {
        font-family: 'Schibsted Grotesk', sans-serif;
      }
      .text-primary {
        color: #333;
      }
      .dark .text-primary {
        color: white;
      }
      body {
        line-height: 2;
      }
      .hover\\:dynamic-primary:hover {
        color: var(--primary-color) !important;
      }
      
      /* Additional mobile-responsive styles */
      @media (max-width: 640px) {
        .animate-slide-up {
          animation-delay: 0.1s;
        }
      }
    `;
  };

  // Helper function to generate the portfolio scripts
  const getPortfolioScripts = () => {
    return `
      // getIconSVG: Inline SVGs for all icons used in the portfolio
      function getIconSVG(name) {
        switch (name) {
          case "mail":
            return \`<svg xmlns='http://www.w3.org/2000/svg' class='w-6 h-6 mr-2 flex-shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'/></svg>\`;
          case "download":
            return \`<svg xmlns='http://www.w3.org/2000/svg' class='w-6 h-6 mr-2 flex-shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H4a2 2 0 01-2-2v-8a2 2 0 012-2h16a2 2 0 012 2v8a2 2 0 01-2 2z'/></svg>\`;
          case "phone":
            return \`<svg xmlns='http://www.w3.org/2000/svg' class='w-6 h-6 mr-2 flex-shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'/></svg>\`;
          case "map":
            return \`<svg xmlns='http://www.w3.org/2000/svg' class='w-6 h-6 mr-2 flex-shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'/><path stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'/></svg>\`;
          case "globe":
            return \`<svg xmlns='http://www.w3.org/2000/svg' class='w-6 h-6 mr-2 flex-shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 0v20m0-20C7.52 2 2 6.48 2 12m10-10c4.52 0 10 4.48 10 10m-10-10v10m0 0l5-5m-5 5l-5-5'/></svg>\`;
          case "linkedin":
            return \`<svg xmlns='http://www.w3.org/2000/svg' class='w-6 h-6 mr-2 flex-shrink-0' fill='currentColor' viewBox='0 0 24 24'><path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'/></svg>\`;
          case "github":
            return \`<svg xmlns='http://www.w3.org/2000/svg' class='w-6 h-6 mr-2 flex-shrink-0' fill='currentColor' viewBox='0 0 24 24'><path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z'/></svg>\`;
          case "twitter":
            return \`<svg xmlns='http://www.w3.org/2000/svg' class='w-6 h-6 mr-2 flex-shrink-0' fill='currentColor' viewBox='0 0 24 24'><path d='M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z'/></svg>\`;
          case "instagram":
            return \`<svg xmlns='http://www.w3.org/2000/svg' class='w-6 h-6 mr-2 flex-shrink-0' fill='currentColor' viewBox='0 0 24 24'><path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058 1.644.07 4.849.07 3.204 0 3.584-.012 4.849-.07 4.354-.2 6.782-2.618 6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.204.014 3.583.07 4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.28.073 1.689-.073 4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z'/></svg>\`;
          default:
            return "";
        }
      }
      
      // Theme icon logic
      function setThemeIcon() {
        const iconSpan = document.getElementById("theme-toggle-icon");
        if (!iconSpan) return;
        
        if (document.documentElement.classList.contains("dark")) {
          // Sun icon (minimal, Heroicons style)
          iconSpan.innerHTML = \`<svg xmlns='http://www.w3.org/2000/svg' class='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor' stroke-width='1.5'>
            <path stroke-linecap='round' stroke-linejoin='round' d='M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z' />
          </svg>\`;
        } else {
          // Moon icon
          iconSpan.innerHTML = \`<svg xmlns='http://www.w3.org/2000/svg' class='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor' stroke-width='1.5'>
            <path stroke-linecap='round' stroke-linejoin='round' d='M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z' />
          </svg>\`;
        }
      }
      
      // Theme toggling logic
      function toggleTheme() {
        document.documentElement.classList.toggle("dark");
        if (document.documentElement.classList.contains("dark")) {
          localStorage.theme = "dark";
        } else {
          localStorage.theme = "light";
        }
        setThemeIcon();
      }
      
      // Set initial theme on load
      if (
        localStorage.theme === "dark" ||
        (!("theme" in localStorage) &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      ) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    `;
  };

  // Calculate container class based on view mode
  const getContainerClass = () => {
    if (currentView === "mobile") {
      return "max-w-[375px] h-[667px] mx-auto border border-gray-300 rounded-lg shadow-md overflow-hidden";
    }
    return "w-full h-[80vh] max-w-[1280px] mx-auto border border-gray-200 shadow-sm rounded-md overflow-hidden";
  };

  return (
    <div className="flex flex-col justify-center items-center py-4">
      <div ref={previewContainerRef} className={getContainerClass()}>
        <iframe
          ref={iframeRef}
          className="w-full h-full bg-white"
          style={{ border: "none" }}
          title="Portfolio Preview"
        />
      </div>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default PortfolioPreview;
