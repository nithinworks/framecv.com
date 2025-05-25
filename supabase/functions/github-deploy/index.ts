import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const { accessToken, repoName, portfolioData } = await req.json();

    if (!accessToken || !repoName || !portfolioData) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Creating GitHub repository:', repoName);

    // Get authenticated user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': 'token ' + accessToken,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Portfolio-Deploy'
      }
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('Failed to get user info:', errorText);
      return new Response(
        JSON.stringify({ error: 'Invalid GitHub token or insufficient permissions' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const user = await userResponse.json();
    console.log('Authenticated as:', user.login);

    // Create repository
    const createRepoResponse = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': 'token ' + accessToken,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Portfolio-Deploy'
      },
      body: JSON.stringify({
        name: repoName,
        description: 'Portfolio website deployed via Portfolio Creator',
        auto_init: true,
        private: false
      })
    });

    let repo;
    if (createRepoResponse.status === 422) {
      // Repository already exists, get it
      console.log('Repository already exists, fetching...');
      const getRepoResponse = await fetch('https://api.github.com/repos/' + user.login + '/' + repoName, {
        headers: {
          'Authorization': 'token ' + accessToken,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Portfolio-Deploy'
        }
      });
      
      if (!getRepoResponse.ok) {
        const errorText = await getRepoResponse.text();
        console.error('Failed to get existing repository:', errorText);
        return new Response(
          JSON.stringify({ error: 'Repository exists but cannot access it' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      repo = await getRepoResponse.json();
    } else if (!createRepoResponse.ok) {
      const errorText = await createRepoResponse.text();
      console.error('Failed to create repository:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to create GitHub repository' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } else {
      repo = await createRepoResponse.json();
      console.log('Repository created:', repo.name);
    }

    // Generate the 5 files for deployment
    const htmlCode = '<!DOCTYPE html>\n<html lang="en" class="scroll-smooth">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>Portfolio - ' + portfolioData.settings.name + '</title>\n    <script src="https://cdn.tailwindcss.com"></script>\n    <script src="./tailwind.config.js"></script>\n    <link rel="preconnect" href="https://fonts.googleapis.com" />\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n    <link\n      href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&family=Ovo&family=Schibsted+Grotesk:wght@400;500;700&display=swap"\n      rel="stylesheet"\n    />\n    <link rel="stylesheet" href="./styles.css" />\n  </head>\n  <body\n    class="overflow-x-hidden font-Schibsted leading-8 bg-white text-primary dark:bg-darkTheme dark:text-white"\n  >\n    <div id="app"></div>\n    <script src="./script.js"></script>\n  </body>\n</html>';

    const cssCode = ':root {\n  --primary-color: ' + portfolioData.settings.primaryColor + ';\n  --primary-color-light: rgba(214, 88, 34, 0.08);\n  --glass-bg: rgba(252, 186, 3, 0.1);\n}\n.dynamic-primary {\n  color: var(--primary-color) !important;\n}\n.bg-dynamic-primary {\n  background-color: var(--primary-color) !important;\n}\n.border-dynamic-primary {\n  border-color: var(--primary-color) !important;\n}\n.bg-primary-light {\n  background: var(--primary-color-light) !important;\n}\n.glass-bg {\n  background: var(--glass-bg) !important;\n  backdrop-filter: blur(2px);\n}\n.hero-bg {\n  background: linear-gradient(120deg, var(--primary-color-light) 0%, #fff 100%);\n}\n.dark .hero-bg {\n  background: #000 !important;\n}\n.footer-bg-smoke {\n  background: linear-gradient(120deg, var(--primary-color-light) 0%, #fff 100%);\n}\n.dark .footer-bg-smoke {\n  background: linear-gradient(\n    120deg,\n    rgba(252, 186, 3, 0.1) 0%,\n    #000 100%\n  ) !important;\n}';

    const twConfigCode = 'tailwind.config = {\n  theme: {\n    extend: {\n      gridTemplateColumns: {\n        auto: "repeat(auto-fit, minmax(200px, 1fr))",\n      },\n      fontFamily: {\n        Outfit: ["Outfit", "sans-serif"],\n        Ovo: ["Ovo", "serif"],\n      },\n      animation: {\n        "fade-in": "fadeIn 0.7s ease-out both",\n        "slide-up": "slideUp 0.7s cubic-bezier(0.4,0,0.2,1) both",\n      },\n      keyframes: {\n        fadeIn: {\n          "0%": { opacity: "0" },\n          "100%": { opacity: "1" },\n        },\n        slideUp: {\n          "0%": { transform: "translateY(30px)", opacity: "0" },\n          "100%": { transform: "translateY(0)", opacity: "1" },\n        },\n      },\n      colors: {\n        darkTheme: "#111111",\n        white: "#fff",\n        black: "#000",\n        gray: {\n          100: "#f5f5f5",\n          200: "#e5e5e5",\n          300: "#d4d4d4",\n          400: "#a3a3a3",\n          500: "#737373",\n          600: "#525252",\n          700: "#404040",\n          800: "#262626",\n          900: "#181818",\n        },\n      },\n    },\n  },\n  darkMode: "selector",\n};';

    const jsCode = '// getIconSVG: Inline SVGs for all icons used in the portfolio\nfunction getIconSVG(name) {\n  switch (name) {\n    case "mail":\n      return \'<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>\';\n    case "download":\n      return \'<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H4a2 2 0 01-2-2v-8a2 2 0 012-2h16a2 2 0 012 2v8a2 2 0 01-2 2z"/></svg>\';\n    case "phone":\n      return \'<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>\';\n    case "map":\n      return \'<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>\';\n    case "globe":\n      return \'<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 0v20m0-20C7.52 2 2 6.48 2 12m10-10c4.52 0 10 4.48 10 10m-10-10v10m0 0l5-5m-5 5l-5-5"/></svg>\';\n    case "linkedin":\n      return \'<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>\';\n    case "github":\n      return \'<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>\';\n    case "twitter":\n      return \'<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>\';\n    case "instagram":\n      return \'<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>\';\n    case "document":\n      return \'<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25m-9-3H9M12 10.5H9m6.75 4.5H9m5.25 4.5H9"/></svg>\'; // Simple document icon\n    default:\n      return "";\n  }\n}\n\n// Theme icon logic\nfunction setThemeIcon() {\n  const iconSpan = document.getElementById("theme-toggle-icon");\n  if (!iconSpan) return;\n  if (document.documentElement.classList.contains("dark")) {\n    // Sun icon (minimal, Heroicons style)\n    iconSpan.innerHTML = \'<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />\n    </svg>\';\n  } else {\n    // Moon icon\n    iconSpan.innerHTML = \'<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />\n    </svg>\';\n  }\n}\n\n// Theme toggling logic\nwindow.toggleTheme = function () {\n  document.documentElement.classList.toggle("dark");\n  if (document.documentElement.classList.contains("dark")) {\n    localStorage.theme = "dark";\n  } else {\n    localStorage.theme = "light";\n  }\n  setThemeIcon();\n};\n\n// Set initial theme on load\nif (\n  localStorage.theme === "dark" ||\n  (!("theme" in localStorage) &&\n    window.matchMedia("(prefers-color-scheme: dark)").matches)\n) {\n  document.documentElement.classList.add("dark");\n} else {\n  document.documentElement.classList.remove("dark");\n}\n\n// Main rendering logic\nasync function renderPortfolio() {\n  try {\n    const res = await fetch("portfolio-data.json");\n    if (!res.ok) throw new Error("Failed to fetch portfolio-data.json");\n    const data = await res.json();\n    // Set primary color and light version\n    document.documentElement.style.setProperty(\n      "--primary-color",\n      data.settings.primaryColor || "#d65822"\n    );\n    // Calculate a very light version of primary color for backgrounds\n    function hexToRgba(hex, alpha) {\n      let c = hex.replace("#", "");\n      if (c.length === 3)\n        c = c\n          .split("")\n          .map((x) => x + x)\n          .join("");\n      const num = parseInt(c, 16);\n      return "rgba(" + ((num >> 16) & 255) + "," + ((num >> 8) & 255) + "," + (num & 255) + "," + alpha + ")";\n    }\n    document.documentElement.style.setProperty(\n      "--primary-color-light",\n      hexToRgba(data.settings.primaryColor || "#d65822", 0.08)\n    );\n    document.documentElement.style.setProperty(\n      "--glass-bg",\n      hexToRgba(data.settings.primaryColor || "#d65822", 0.1)\n    );\n    // Get last name for logo\n    const nameParts = (data.settings.name || "").trim().split(" ");\n    const logoName =\n      nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];\n    // Navigation\n    let navLinks = "";\n    (data.navigation.items || []).forEach((link) => {\n      navLinks += \'<li><a href="\' + link.url + \'" class="hover:dynamic-primary transition-colors duration-300">' + link.name + \'</a></li>\';\n    });\n    // Header/Navbar\n    let nav = \'<nav class="w-full flex justify-between items-center px-4 sm:px-6 md:px-8 py-5 bg-white/80 dark:bg-black/90 backdrop-blur-md fixed top-0 left-0 z-50"><span class="font-Ovo text-xl font-bold tracking-tight">' + logoName + \'<span class="dynamic-primary">.</span></span><ul class="hidden md:flex gap-6 sm:gap-8 md:gap-10 font-Ovo text-lg border-none bg-transparent shadow-none">' + navLinks + \'</ul><div class="flex items-center gap-4"><button id="theme-toggle" onclick="toggleTheme()" class="transition-colors duration-300 focus:outline-none"><span id="theme-toggle-icon"></span></button><a href="#contact" class="px-6 py-2 rounded-full bg-dynamic-primary text-white font-Ovo font-medium shadow hover:scale-105 transition-transform duration-300">Connect</a></div></nav>\';\n\n    // ... keep existing code (all the section rendering logic)\n\n    document.getElementById("app").innerHTML =\n      nav +\n      hero +\n      about +\n      projects +\n      experience +\n      education +\n      contact +\n      social +\n      footer;\n    setThemeIcon();\n    document.addEventListener("click", function (e) {\n      if (e.target.closest("#theme-toggle")) setTimeout(setThemeIcon, 10);\n    });\n  } catch (err) {\n    document.getElementById("app").innerHTML =\n      "<pre style=\'color:red\'>" + err + "</pre>";\n    console.error(err);\n  }\n}\ndocument.addEventListener("DOMContentLoaded", renderPortfolio);';

    const jsonCode = JSON.stringify(portfolioData, null, 2);

    const files = [\n      { name: "index.html", content: htmlCode },\n      { name: "styles.css", content: cssCode },\n      { name: "script.js", content: jsCode },\n      { name: "tailwind.config.js", content: twConfigCode },\n      { name: "portfolio-data.json", content: jsonCode }\n    ];

    // Upload files to repository
    console.log('Uploading files to repository...');
    
    for (const file of files) {
      // Check if file already exists
      const fileResponse = await fetch('https://api.github.com/repos/' + user.login + '/' + repoName + '/contents/' + file.name, {
        headers: {
          'Authorization': 'token ' + accessToken,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Portfolio-Deploy'
        }
      });

      let existingFileSha = null;
      if (fileResponse.ok) {
        const existingFile = await fileResponse.json();
        existingFileSha = existingFile.sha;
      }

      // Create or update file
      const fileData = {
        message: 'Deploy portfolio: ' + file.name,
        content: btoa(unescape(encodeURIComponent(file.content))), // Base64 encode with UTF-8 support
        ...(existingFileSha && { sha: existingFileSha })
      };

      const uploadResponse = await fetch('https://api.github.com/repos/' + user.login + '/' + repoName + '/contents/' + file.name, {
        method: 'PUT',
        headers: {
          'Authorization': 'token ' + accessToken,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Portfolio-Deploy'
        },
        body: JSON.stringify(fileData)
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Failed to upload ' + file.name + ':', errorText);
        return new Response(
          JSON.stringify({ error: 'Failed to upload ' + file.name }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      console.log('Uploaded ' + file.name + ' successfully');
    }

    // Enable GitHub Pages
    console.log('Enabling GitHub Pages...');
    const pagesResponse = await fetch('https://api.github.com/repos/' + user.login + '/' + repoName + '/pages', {
      method: 'POST',
      headers: {
        'Authorization': 'token ' + accessToken,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Portfolio-Deploy'
      },
      body: JSON.stringify({
        source: {
          branch: 'main',
          path: '/'
        }
      })
    });

    // GitHub Pages might already be enabled, so 409 is okay
    if (!pagesResponse.ok && pagesResponse.status !== 409) {
      const errorText = await pagesResponse.text();
      console.error('Failed to enable GitHub Pages:', errorText);
      // Continue anyway, as the files are uploaded
    }

    // Wait a moment for GitHub to process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get GitHub Pages URL
    const pagesInfoResponse = await fetch('https://api.github.com/repos/' + user.login + '/' + repoName + '/pages', {
      headers: {
        'Authorization': 'token ' + accessToken,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Portfolio-Deploy'
      }
    });

    let pagesUrl = 'https://' + user.login + '.github.io/' + repoName;
    if (pagesInfoResponse.ok) {
      const pagesInfo = await pagesInfoResponse.json();
      pagesUrl = pagesInfo.html_url || pagesUrl;
    }

    console.log('Deployment successful. Pages URL:', pagesUrl);

    return new Response(
      JSON.stringify({ 
        success: true,
        repoUrl: repo.html_url,
        pagesUrl: pagesUrl,
        username: user.login,
        repoName: repoName
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('GitHub deploy error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
