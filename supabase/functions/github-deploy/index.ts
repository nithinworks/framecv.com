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
    const { githubToken, repoName, description, portfolioData } = await req.json();

    if (!githubToken || !repoName || !portfolioData) {
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
        'Authorization': 'token ' + githubToken,
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
        'Authorization': 'token ' + githubToken,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Portfolio-Deploy'
      },
      body: JSON.stringify({
        name: repoName,
        description: description || 'Portfolio website deployed via Portfolio Creator',
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
          'Authorization': 'token ' + githubToken,
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

    // Helper function to generate complete JavaScript code with font support
    const generateCompleteJavaScript = (data) => {
      return `// getIconSVG: Inline SVGs for all icons used in the portfolio
function getIconSVG(name) {
  switch (name) {
    case "mail":
      return '<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>';
    case "download":
      return '<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H4a2 2 0 01-2-2v-8a2 2 0 012-2h16a2 2 0 012 2v8a2 2 0 01-2 2z"/></svg>';
    case "phone":
      return '<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>';
    case "map":
      return '<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>';
    case "globe":
      return '<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 0v20m0-20C7.52 2 2 6.48 2 12m10-10c4.52 0 10 4.48 10 10m-10-10v10m0 0l5-5m-5 5l-5-5"/></svg>';
    case "linkedin":
      return '<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>';
    case "github":
      return '<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>';
    case "twitter":
      return '<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>';
    case "instagram":
      return '<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>';
    case "document":
      return '<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25m-9-3H9M12 10.5H9m6.75 4.5H9m5.25 4.5H9"/></svg>';
    default:
      return "";
  }
}

// Font mapping for CSS classes
function getFontClass(fontName) {
  switch (fontName) {
    case "ovo": return "font-Ovo";
    case "playfair": return "font-Playfair";
    case "poppins": return "font-Poppins";
    case "inter": return "font-Inter";
    case "montserrat": return "font-Montserrat";
    case "raleway": return "font-Raleway";
    case "schibsted": return "font-Schibsted";
    case "outfit": return "font-Outfit";
    default: return "font-Ovo";
  }
}

// Theme functions
function setThemeIcon() {
  const iconSpan = document.getElementById("theme-toggle-icon");
  if (!iconSpan) return;
  if (document.documentElement.classList.contains("dark")) {
    iconSpan.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>';
  } else {
    iconSpan.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>';
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

// Set initial theme
if (localStorage.theme === "dark" || (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}

// Main rendering function
async function renderPortfolio() {
  try {
    const res = await fetch("portfolio-data.json");
    if (!res.ok) throw new Error("Failed to fetch portfolio-data.json");
    const data = await res.json();
    
    // Set CSS variables
    document.documentElement.style.setProperty("--primary-color", data.settings.primaryColor || "#d65822");
    
    function hexToRgba(hex, alpha) {
      let c = hex.replace("#", "");
      if (c.length === 3) c = c.split("").map((x) => x + x).join("");
      const num = parseInt(c, 16);
      return "rgba(" + ((num >> 16) & 255) + "," + ((num >> 8) & 255) + "," + (num & 255) + "," + alpha + ")";
    }
    
    document.documentElement.style.setProperty("--primary-color-light", hexToRgba(data.settings.primaryColor || "#d65822", 0.08));
    document.documentElement.style.setProperty("--glass-bg", hexToRgba(data.settings.primaryColor || "#d65822", 0.1));
    
    // Apply custom fonts based on settings
    const primaryFontClass = getFontClass(data.settings.fonts?.primary || "ovo");
    const secondaryFontClass = getFontClass(data.settings.fonts?.secondary || "schibsted");
    
    // Get logo name
    const nameParts = (data.settings.name || "").trim().split(" ");
    const logoName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];
    
    // Build navigation
    let navLinks = "";
    (data.navigation.items || []).forEach((link) => {
      navLinks += '<li><a href="' + link.url + '" class="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors duration-300">' + link.name + '</a></li>';
    });
    
    // Navigation bar with primary font
    let nav = '<nav class="w-full flex justify-between items-center px-4 sm:px-6 md:px-8 py-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/20 dark:border-gray-700/20 fixed top-0 left-0 z-50"><div class="flex items-center gap-2"><span class="' + primaryFontClass + ' text-xl font-bold tracking-tight text-gray-900 dark:text-white">' + logoName + '</span><span class="text-primary text-xl font-bold">.</span></div><ul class="hidden md:flex gap-6 sm:gap-8 md:gap-10 ' + primaryFontClass + ' text-sm font-medium">' + navLinks + '</ul><div class="flex items-center gap-4"><button id="theme-toggle" onclick="toggleTheme()" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300 focus:outline-none"><span id="theme-toggle-icon"></span></button><a href="#contact" class="px-6 py-2 rounded-full bg-primary text-white ' + primaryFontClass + ' text-sm font-medium shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300">Get in touch</a></div></nav>';
    
    // Hero section with font support
    let hero = "";
    if (data.sections.hero && data.sections.hero.enabled) {
      let ctas = "";
      (data.sections.hero.ctaButtons || []).forEach((btn) => {
        ctas += '<a href="' + btn.url + '" class="inline-flex items-center gap-2 ' + (btn.isPrimary ? "px-6 py-3 rounded-full bg-primary text-white font-medium shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300" : "px-6 py-3 rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300") + '">' + (btn.icon ? getIconSVG(btn.icon) : "") + '<span>' + btn.text + '</span></a>';
      });
      hero = '<div class="hero-bg w-full min-h-screen flex items-center justify-center"><header id="home" class="pt-20 pb-16 flex flex-col items-center text-center max-w-3xl mx-auto animate-fade-in px-6 w-full"><div class="mb-8"><img src="' + data.settings.profileImage + '" alt="Profile" class="w-32 h-32 rounded-full object-cover mx-auto mb-6 border-4 border-white dark:border-gray-700 shadow-lg" /></div><h2 class="' + primaryFontClass + ' text-lg text-gray-600 dark:text-gray-400 mb-4 animate-slide-up">Hi! I\\'m ' + data.settings.name + ' <span class="inline-block animate-bounce">👋</span></h2><h1 class="' + primaryFontClass + ' text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 animate-slide-up leading-tight">' + data.settings.title + '<br />based in ' + data.settings.location + '</h1><p class="text-lg text-gray-600 dark:text-gray-400 mb-10 animate-fade-in leading-relaxed max-w-2xl">' + data.settings.summary + '</p><div class="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">' + ctas + '</div></header></div>';
    }
    
    // About section with font support
    let about = "";
    if (data.sections.about && data.sections.about.enabled) {
      let skills = "";
      if (data.sections.about.skills && data.sections.about.skills.enabled) {
        let skillTags = "";
        data.sections.about.skills.items.forEach((skill) => {
          skillTags += '<span class="px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-700">' + skill + '</span>';
        });
        skills = '<div class="mt-12"><h3 class="' + primaryFontClass + ' text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">' + data.sections.about.skills.title + '</h3><div class="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">' + skillTags + '</div></div>';
      }
      about = '<section id="about" class="py-20 bg-gray-50 dark:bg-gray-900/50"><div class="max-w-4xl mx-auto px-6 text-center"><h2 class="' + primaryFontClass + ' text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">' + data.sections.about.title + '</h2><p class="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto">' + data.sections.about.content + '</p>' + skills + '</div></section>';
    }
    
    // Projects section with font support
    let projects = "";
    if (data.sections.projects && data.sections.projects.enabled) {
      let projectCards = "";
      data.sections.projects.items.forEach((project) => {
        let projectTags = "";
        project.tags.forEach((tag) => {
          projectTags += '<span class="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20">' + tag + '</span>';
        });
        let projectLink = "";
        if (project.previewUrl && project.previewUrl !== "#") {
          projectLink = '<a href="' + project.previewUrl + '" class="inline-flex items-center text-primary font-medium hover:underline transition-all duration-300 group"><span>View project</span><svg class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg></a>';
        }
        projectCards += '<div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"><h3 class="' + primaryFontClass + ' text-xl font-bold text-gray-900 dark:text-white mb-3">' + project.title + '</h3><p class="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">' + project.description + '</p><div class="flex flex-wrap gap-2 mb-4">' + projectTags + '</div>' + projectLink + '</div>';
      });
      projects = '<section id="projects" class="py-20 bg-white dark:bg-gray-900"><div class="max-w-6xl mx-auto px-6"><div class="text-center mb-16"><h2 class="' + primaryFontClass + ' text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">' + data.sections.projects.title + '</h2></div><div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">' + projectCards + '</div></div></section>';
    }
    
    // Experience section with font support
    let experience = "";
    if (data.sections.experience && data.sections.experience.enabled) {
      let experienceItems = "";
      data.sections.experience.items.forEach((item) => {
        experienceItems += '<div class="relative pl-8 pb-12 last:pb-0"><div class="absolute left-0 top-0 w-4 h-4 bg-primary rounded-full border-4 border-white dark:border-gray-900"></div><div class="absolute left-2 top-4 w-0.5 h-full bg-gray-200 dark:bg-gray-700 last:hidden"></div><div><h3 class="' + primaryFontClass + ' text-xl font-bold text-gray-900 dark:text-white mb-1">' + item.position + '</h3><div class="text-sm text-gray-500 dark:text-gray-400 mb-2">' + item.company + ' • ' + item.period + '</div><p class="text-gray-600 dark:text-gray-400 leading-relaxed">' + item.description + '</p></div></div>';
      });
      experience = '<section id="experience" class="py-20 bg-gray-50 dark:bg-gray-900/50"><div class="max-w-4xl mx-auto px-6"><div class="text-center mb-16"><h2 class="' + primaryFontClass + ' text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">' + data.sections.experience.title + '</h2></div><div class="max-w-3xl mx-auto">' + experienceItems + '</div></div></section>';
    }
    
    // Education section with font support
    let education = "";
    if (data.sections.education && data.sections.education.enabled) {
      let educationItems = "";
      data.sections.education.items.forEach((item) => {
        educationItems += '<div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300"><h3 class="' + primaryFontClass + ' text-xl font-bold text-gray-900 dark:text-white mb-2">' + item.degree + '</h3><div class="text-gray-500 dark:text-gray-400 mb-1">' + item.institution + ' • ' + item.period + '</div></div>';
      });
      education = '<section id="education" class="py-20 bg-white dark:bg-gray-900"><div class="max-w-4xl mx-auto px-6"><div class="text-center mb-16"><h2 class="' + primaryFontClass + ' text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">' + data.sections.education.title + '</h2></div><div class="grid gap-6 md:grid-cols-2">' + educationItems + '</div></div></section>';
    }
    
    // Contact section with font support
    let contact = "";
    if (data.sections.contact && data.sections.contact.enabled) {
      let contactCards = "";
      const contactInfo = [
        { icon: getIconSVG("mail"), value: data.sections.contact.email, href: "mailto:" + data.sections.contact.email },
        { icon: getIconSVG("phone"), value: data.sections.contact.phone, href: "tel:" + data.sections.contact.phone },
        { icon: getIconSVG("map"), value: data.sections.contact.location, href: "#" }
      ];
      contactInfo.forEach((card) => {
        if (card.value) {
          contactCards += '<a href="' + card.href + '" class="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group"><div class="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">' + card.icon.replace('mr-2', '') + '</div><span class="text-gray-700 dark:text-gray-300 font-medium">' + card.value + '</span></a>';
        }
      });
      contact = '<section id="contact" class="py-20 bg-gray-50 dark:bg-gray-900/50"><div class="max-w-4xl mx-auto px-6 text-center"><h2 class="' + primaryFontClass + ' text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">' + data.sections.contact.title + '</h2><p class="text-lg text-gray-600 dark:text-gray-400 mb-12">Ready to work together? Let\\'s connect!</p><div class="grid gap-4 md:grid-cols-3 max-w-3xl mx-auto">' + contactCards + '</div></div></section>';
    }
    
    // Social section with font support
    let social = "";
    if (data.sections.social && data.sections.social.enabled) {
      let socialLinks = "";
      data.sections.social.items.forEach((item) => {
        socialLinks += '<a href="' + item.url + '" class="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group"><div class="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">' + getIconSVG(item.icon).replace('mr-2', '') + '</div><span class="text-gray-700 dark:text-gray-300 font-medium">' + item.platform + '</span></a>';
      });
      social = '<section id="social" class="py-16 bg-white dark:bg-gray-900"><div class="max-w-4xl mx-auto px-6 text-center"><h3 class="' + primaryFontClass + ' text-2xl font-bold text-gray-900 dark:text-white mb-8">Connect with me</h3><div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 max-w-2xl mx-auto">' + socialLinks + '</div></div></section>';
    }
    
    // Footer
    let footer = "";
    if (data.footer && data.footer.enabled) {
      footer = '<footer class="bg-gray-900 dark:bg-gray-950 py-12"><div class="max-w-4xl mx-auto px-6 text-center"><p class="text-gray-400 text-sm">' + data.footer.copyright + '</p><div class="mt-8 pt-8 border-t border-gray-800"><div class="flex items-center justify-center gap-2 text-xs text-gray-500"><span>Built with</span><svg class="w-8 h-8" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" rx="20" fill="#1a1a1a"/><path d="M50 80h100v40H50z" fill="#3b82f6"/><path d="M70 100h60v20H70z" fill="#ffffff"/><circle cx="170" cy="30" r="8" fill="#ef4444"/><circle cx="170" cy="50" r="8" fill="#f59e0b"/><circle cx="170" cy="70" r="8" fill="#10b981"/></svg><span>FrameCV</span></div></div></footer>';
    } else {
      footer = '<footer class="bg-gray-900 dark:bg-gray-950 py-8"><div class="max-w-4xl mx-auto px-6 text-center"><div class="flex items-center justify-center gap-2 text-xs text-gray-500"><span>Built with</span><svg class="w-8 h-8" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" rx="20" fill="#1a1a1a"/><path d="M50 80h100v40H50z" fill="#3b82f6"/><path d="M70 100h60v20H70z" fill="#ffffff"/><circle cx="170" cy="30" r="8" fill="#ef4444"/><circle cx="170" cy="50" r="8" fill="#f59e0b"/><circle cx="170" cy="70" r="8" fill="#10b981"/></svg><span>FrameCV</span></div></footer>';
    }
    
    // Combine all sections
    const content = nav + '<div class="main-content">' + hero + about + projects + experience + education + contact + social + '</div>' + footer;
    document.getElementById("app").innerHTML = content;
    setThemeIcon();
    
  } catch (err) {
    document.getElementById("app").innerHTML = "<pre style='color:red'>" + err + "</pre>";
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", renderPortfolio);`;
    };

    // Generate the 5 files for deployment with the updated template
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
    <!-- Include all available fonts -->
    <link
      href="https://fonts.googleapis.com/css2?family=Ovo&family=Playfair+Display:wght@400;500;600;700;800;900&family=Poppins:wght@100;200;300;400;500;600;700;800;900&family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Montserrat:wght@100;200;300;400;500;600;700;800;900&family=Raleway:wght@100;200;300;400;500;600;700;800;900&family=Schibsted+Grotesk:wght@400;500;600;700;800;900&family=Outfit:wght@100;200;300;400;500;600;700;800;900&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body
    class="overflow-x-hidden font-Schibsted leading-7 bg-white text-gray-900 dark:bg-gray-900 dark:text-white antialiased"
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

.text-primary {
  color: var(--primary-color) !important;
}

.bg-primary {
  background-color: var(--primary-color) !important;
}

.border-primary {
  border-color: var(--primary-color) !important;
}

.bg-primary\\/10 {
  background-color: rgba(214, 88, 34, 0.1) !important;
}

.bg-primary\\/20 {
  background-color: rgba(214, 88, 34, 0.2) !important;
}

.border-primary\\/20 {
  border-color: rgba(214, 88, 34, 0.2) !important;
}

.hero-bg {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.dark .hero-bg {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

html, body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(30px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0,0,0);
  }
  40%, 43% {
    transform: translate3d(0, -15px, 0);
  }
  70% {
    transform: translate3d(0, -7px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out both;
}

.animate-slide-up {
  animation: slideUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) both;
}

.animate-bounce {
  animation: bounce 2s infinite;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.dark ::-webkit-scrollbar-track {
  background: #1e293b;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.dark ::-webkit-scrollbar-thumb {
  background: #475569;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}`;

    const twConfigCode = `tailwind.config = {
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
        primary: "var(--primary-color)",
      },
    },
  },
  darkMode: "selector",
};`;

    const jsCode = generateCompleteJavaScript(portfolioData);
    const jsonCode = JSON.stringify(portfolioData, null, 2);

    const files = [
      { name: "index.html", content: htmlCode },
      { name: "styles.css", content: cssCode },
      { name: "script.js", content: jsCode },
      { name: "tailwind.config.js", content: twConfigCode },
      { name: "portfolio-data.json", content: jsonCode }
    ];

    // Upload files to repository
    console.log('Uploading files to repository...');
    
    for (const file of files) {
      // Check if file already exists
      const fileResponse = await fetch('https://api.github.com/repos/' + user.login + '/' + repoName + '/contents/' + file.name, {
        headers: {
          'Authorization': 'token ' + githubToken,
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
          'Authorization': 'token ' + githubToken,
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
        'Authorization': 'token ' + githubToken,
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
        'Authorization': 'token ' + githubToken,
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
