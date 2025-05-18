
import React, { useRef, useEffect, useState } from "react";
import { usePortfolio } from "@/context/PortfolioContext";

const PortfolioPreviewFrame: React.FC = () => {
  const { portfolioData, currentView } = usePortfolio();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Initialize iframe when component mounts or when portfolio data changes
  useEffect(() => {
    // Reset loaded state when data or view changes
    setIsLoaded(false);
    
    // Add a delay to ensure the iframe is ready before writing to it
    const timer = setTimeout(() => {
      renderPortfolio();
    }, 100);
    
    return () => clearTimeout(timer);
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
        
        // Generate the full HTML document
        const html = `
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
      href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&family=Ovo&family=Schibsted+Grotesk:wght@400;500;700&display=swap"
      rel="stylesheet"
    />

    <style>
      :root {
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
        background: linear-gradient(
          120deg,
          var(--primary-color-light) 0%,
          #fff 100%
        );
      }
      .dark .hero-bg {
        background: #000 !important;
      }
      .footer-bg-smoke {
        background: linear-gradient(
          120deg,
          var(--primary-color-light) 0%,
          #fff 100%
        );
      }
      .dark .footer-bg-smoke {
        background: linear-gradient(
          120deg,
          rgba(252, 186, 3, 0.1) 0%,
          #000 100%
        ) !important;
      }
    </style>

    <script>
      tailwind.config = {
        theme: {
          extend: {
            gridTemplateColumns: {
              auto: "repeat(auto-fit, minmax(200px, 1fr))",
            },
            fontFamily: {
              Outfit: ["Outfit", "sans-serif"],
              Ovo: ["Ovo", "serif"],
              Schibsted: ["Schibsted Grotesk", "sans-serif"],
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
      };
    </script>
  </head>
  <body
    class="overflow-x-hidden font-Schibsted leading-8 bg-white text-primary dark:bg-darkTheme dark:text-white"
  >
    <div id="app"></div>

    <script>
      // Icon SVG function
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
          default:
            return "";
        }
      }

      // Theme icon logic
      function setThemeIcon() {
        const iconSpan = document.getElementById("theme-toggle-icon");
        if (!iconSpan) return;
        if (document.documentElement.classList.contains("dark")) {
          iconSpan.innerHTML = \`<svg xmlns='http://www.w3.org/2000/svg' class='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor' stroke-width='1.5'>
                    <path stroke-linecap='round' stroke-linejoin='round' d='M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z' />
                </svg>\`;
        } else {
          iconSpan.innerHTML = \`<svg xmlns='http://www.w3.org/2000/svg' class='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor' stroke-width='1.5'>
                    <path stroke-linecap='round' stroke-linejoin='round' d='M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z' />
                </svg>\`;
        }
      }

      // Theme toggling logic
      window.toggleTheme = function () {
        document.documentElement.classList.toggle("dark");
        if (document.documentElement.classList.contains("dark")) {
          localStorage.theme = "dark";
        } else {
          localStorage.theme = "light";
        }
        setThemeIcon();
      };

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

      // Main rendering logic
      function renderPortfolio() {
        // Get data from parent scope, don't redeclare portfolioData
        const data = ${JSON.stringify(portfolioData)};

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
            }">\${btn.icon ? getIconSVG(btn.icon) : ""}<span>\${
              btn.text
            }</span></a>\`;
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
          if (
            data.sections.about.skills &&
            data.sections.about.skills.enabled
          ) {
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
          const projectCards = data.sections.projects.items
            .map(
              (project) =>
                \`<div class="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-7 flex flex-col gap-3 shadow-sm hover:shadow-md transition w-full max-w-md mx-auto">
                                <h3 class="font-Ovo text-lg mb-1">\${
                                  project.title
                                }</h3>
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
                                  project.previewUrl &&
                                  project.previewUrl !== "#"
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
                        <h2 class="font-Ovo text-4xl mb-4">\${
                          data.sections.contact.title
                        }</h2>
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
                                  }" class="flex items-center gap-2 px-4 py-3 rounded-xl glass-bg text-sm font-Schibsted text-gray-700 dark:text-gray-200 justify-center shadow-sm hover:scale-105 transition-transform duration-300">
                                            \${getIconSVG(item.icon)}<span>\${
                                    item.platform
                                  }</span>
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
          footer = \`<footer class="footer-bg-smoke py-8 text-center text-sm text-gray-600 dark:text-gray-400">
                    <div class="max-w-2xl mx-auto px-4">
                        \${data.footer.copyright}
                    </div>
                </footer>\`;
        }

        // Combine all sections
        const content = \`\${nav}\${hero}\${about}\${projects}\${experience}\${education}\${contact}\${social}\${footer}\`;
        document.getElementById("app").innerHTML = content;
        setThemeIcon();
      }

      // Initialize the portfolio
      renderPortfolio();
      
      // Tell the parent frame that we've loaded successfully
      try {
        window.parent.postMessage('iframe-loaded', '*');
      } catch (e) {
        console.error('Failed to notify parent window', e);
      }
    </script>
  </body>
</html>
        `;
        
        // Write the HTML to the iframe
        iframeDoc.write(html);
        iframeDoc.close();
        setIsLoaded(true);
      }
    } catch (error) {
      console.error("Error rendering portfolio preview:", error);
    }
  };

  return (
    <iframe
      ref={iframeRef}
      className="w-full h-full bg-white"
      style={{ border: "none" }}
      title="Portfolio Preview"
      sandbox="allow-scripts allow-same-origin"
      onLoad={handleIframeLoad}
    />
  );
};

export default PortfolioPreviewFrame;
