
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

    // Helper function to generate complete JavaScript code with new theme
    const generateCompleteJavaScript = (data) => {
      return `// Portfolio Data
const portfolioData = ${JSON.stringify(data, null, 2)};

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
function renderPortfolio() {
  try {
    const data = portfolioData;
    
    // Set CSS variables for primary color
    document.documentElement.style.setProperty("--primary-color", data.settings.primaryColor || "#3b82f6");
    
    // Apply custom fonts based on settings
    const primaryFontClass = getFontClass(data.settings.fonts?.primary || "ovo");
    const secondaryFontClass = getFontClass(data.settings.fonts?.secondary || "inter");
    
    // Get logo name
    const nameParts = (data.settings.name || "").trim().split(" ");
    const logoName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];
    
    // Build navigation
    let navLinks = "";
    (data.navigation.items || []).forEach((link) => {
      navLinks += '<li><a href="' + link.url + '" class="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">' + link.name + '</a></li>';
    });
    
    // Navigation bar
    let nav = '<nav class="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="flex justify-between items-center h-16"><div class="flex items-center"><a href="#" class="' + primaryFontClass + ' text-xl font-bold text-gray-900 dark:text-white">' + logoName + '<span class="text-primary">.</span></a></div><div class="hidden md:block"><ul class="flex space-x-8 ' + primaryFontClass + '">' + navLinks + '</ul></div><div class="flex items-center space-x-4"><button id="theme-toggle" onclick="toggleTheme()" class="p-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"><span id="theme-toggle-icon"></span></button><a href="#contact" class="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90 transition-colors">Contact</a></div></div></div></nav>';
    
    // Hero section
    let hero = "";
    if (data.sections.hero && data.sections.hero.enabled) {
      let ctas = "";
      (data.sections.hero.ctaButtons || []).forEach((btn) => {
        if (btn.isPrimary) {
          ctas += '<a href="' + btn.url + '" class="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-primary hover:bg-primary/90 transition-colors">' + btn.text + '</a>';
        } else {
          ctas += '<a href="' + btn.url + '" class="inline-flex items-center px-8 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-full text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">' + btn.text + '</a>';
        }
      });
      hero = '<section id="home" class="pt-24 pb-20 bg-gradient-to-br from-primary/5 to-blue-50 dark:from-primary/10 dark:to-gray-900"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="text-center"><div class="mb-8"><img src="' + data.settings.profileImage + '" alt="Profile" class="w-32 h-32 rounded-full mx-auto object-cover border-4 border-white shadow-lg" /></div><h1 class="' + primaryFontClass + ' text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">' + data.settings.title + '</h1><p class="' + secondaryFontClass + ' text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">' + data.settings.summary + '</p><div class="flex flex-col sm:flex-row gap-4 justify-center">' + ctas + '</div></div></div></section>';
    }
    
    // About section
    let about = "";
    if (data.sections.about && data.sections.about.enabled) {
      let skills = "";
      if (data.sections.about.skills && data.sections.about.skills.enabled) {
        let skillTags = "";
        data.sections.about.skills.items.forEach((skill) => {
          skillTags += '<span class="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">' + skill + '</span>';
        });
        skills = '<div class="mt-12"><h3 class="' + primaryFontClass + ' text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">' + data.sections.about.skills.title + '</h3><div class="flex flex-wrap justify-center gap-3">' + skillTags + '</div></div>';
      }
      about = '<section id="about" class="py-20 bg-white dark:bg-gray-900"><div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"><h2 class="' + primaryFontClass + ' text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">' + data.sections.about.title + '</h2><p class="' + secondaryFontClass + ' text-lg text-gray-600 dark:text-gray-300 leading-relaxed">' + data.sections.about.content + '</p>' + skills + '</div></section>';
    }
    
    // Projects section
    let projects = "";
    if (data.sections.projects && data.sections.projects.enabled) {
      let projectCards = "";
      data.sections.projects.items.forEach((project) => {
        let projectTags = "";
        project.tags.forEach((tag) => {
          projectTags += '<span class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">' + tag + '</span>';
        });
        let projectLink = "";
        if (project.previewUrl && project.previewUrl !== "#") {
          projectLink = '<a href="' + project.previewUrl + '" class="inline-flex items-center text-primary hover:text-primary/80 font-medium">View Project <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>';
        }
        projectCards += '<div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"><div class="p-6"><h3 class="' + primaryFontClass + ' text-xl font-bold text-gray-900 dark:text-white mb-3">' + project.title + '</h3><p class="' + secondaryFontClass + ' text-gray-600 dark:text-gray-300 mb-4">' + project.description + '</p><div class="flex flex-wrap gap-2 mb-4">' + projectTags + '</div>' + projectLink + '</div></div>';
      });
      projects = '<section id="projects" class="py-20 bg-gray-50 dark:bg-gray-800"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="text-center mb-16"><h2 class="' + primaryFontClass + ' text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">' + data.sections.projects.title + '</h2></div><div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">' + projectCards + '</div></div></section>';
    }
    
    // Experience section
    let experience = "";
    if (data.sections.experience && data.sections.experience.enabled) {
      let experienceItems = "";
      data.sections.experience.items.forEach((item) => {
        experienceItems += '<div class="relative pl-8 pb-8"><div class="absolute left-0 top-2 w-4 h-4 bg-primary rounded-full"></div><div class="absolute left-2 top-6 w-0.5 h-full bg-gray-200 dark:bg-gray-700"></div><h3 class="' + primaryFontClass + ' text-xl font-bold text-gray-900 dark:text-white mb-1">' + item.position + '</h3><p class="text-primary font-medium mb-2">' + item.company + ' • ' + item.period + '</p><p class="' + secondaryFontClass + ' text-gray-600 dark:text-gray-300">' + item.description + '</p></div>';
      });
      experience = '<section id="experience" class="py-20 bg-white dark:bg-gray-900"><div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"><div class="text-center mb-16"><h2 class="' + primaryFontClass + ' text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">' + data.sections.experience.title + '</h2></div><div class="relative">' + experienceItems + '</div></div></section>';
    }
    
    // Education section
    let education = "";
    if (data.sections.education && data.sections.education.enabled) {
      let educationItems = "";
      data.sections.education.items.forEach((item) => {
        educationItems += '<div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"><h3 class="' + primaryFontClass + ' text-xl font-bold text-gray-900 dark:text-white mb-2">' + item.degree + '</h3><p class="text-primary font-medium mb-1">' + item.institution + '</p><p class="' + secondaryFontClass + ' text-gray-600 dark:text-gray-300">' + item.period + '</p></div>';
      });
      education = '<section id="education" class="py-20 bg-gray-50 dark:bg-gray-800"><div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"><div class="text-center mb-16"><h2 class="' + primaryFontClass + ' text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">' + data.sections.education.title + '</h2></div><div class="grid md:grid-cols-2 gap-6">' + educationItems + '</div></div></section>';
    }
    
    // Contact section
    let contact = "";
    if (data.sections.contact && data.sections.contact.enabled) {
      contact = '<section id="contact" class="py-20 bg-white dark:bg-gray-900"><div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"><h2 class="' + primaryFontClass + ' text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">' + data.sections.contact.title + '</h2><div class="grid md:grid-cols-3 gap-8"><div class="flex flex-col items-center"><div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4"><svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg></div><h3 class="' + primaryFontClass + ' font-bold text-gray-900 dark:text-white mb-2">Email</h3><p class="' + secondaryFontClass + ' text-gray-600 dark:text-gray-300">' + data.sections.contact.email + '</p></div><div class="flex flex-col items-center"><div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4"><svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg></div><h3 class="' + primaryFontClass + ' font-bold text-gray-900 dark:text-white mb-2">Phone</h3><p class="' + secondaryFontClass + ' text-gray-600 dark:text-gray-300">' + data.sections.contact.phone + '</p></div><div class="flex flex-col items-center"><div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4"><svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></div><h3 class="' + primaryFontClass + ' font-bold text-gray-900 dark:text-white mb-2">Location</h3><p class="' + secondaryFontClass + ' text-gray-600 dark:text-gray-300">' + data.sections.contact.location + '</p></div></div></div></section>';
    }
    
    // Social section
    let social = "";
    if (data.sections.social && data.sections.social.enabled) {
      let socialLinks = "";
      data.sections.social.items.forEach((item) => {
        socialLinks += '<a href="' + item.url + '" class="flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-primary hover:text-white transition-colors"><span class="sr-only">' + item.platform + '</span><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 3.403-2.132 4.64-1.235 1.236-2.781 1.963-4.639 2.132-.62.057-1.218.06-1.818.059v6.204c-.958-.045-1.959-.104-2.979-.229v-6.017c-.598.002-1.195-.002-1.814-.059-1.858-.169-3.404-.896-4.64-2.132C-1.29 11.522-1.017 10.01-.848 8.152c.057-.62.061-1.218.059-1.817H-6.994c.045-.959.104-1.96.228-2.979H-.748c-.002-.599.002-1.196.059-1.815.169-1.858.896-3.403 2.132-4.64C2.678-1.336 4.223-2.063 6.081-2.232c.619-.057 1.216-.06 1.815-.059V-8.496c.958.045 1.959.104 2.979.229v6.017c.599-.002 1.196.002 1.815.059 1.858.169 3.404.896 4.64 2.132 1.235 1.237 1.962 2.782 2.131 4.64.057.619.061 1.216.059 1.815h6.205c-.045.959-.104 1.96-.229 2.98h-6.016c.002.598-.002 1.195-.059 1.814z"/></svg></a>';
      });
      social = '<section class="py-12 bg-gray-50 dark:bg-gray-800"><div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"><h3 class="' + primaryFontClass + ' text-2xl font-bold text-gray-900 dark:text-white mb-8">Connect With Me</h3><div class="flex justify-center space-x-4">' + socialLinks + '</div></div></section>';
    }
    
    // Footer
    let footer = "";
    if (data.footer && data.footer.enabled) {
      footer = '<footer class="bg-gray-900 text-white py-12"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"><p class="' + secondaryFontClass + ' text-gray-400">' + data.footer.copyright + '</p></div></footer>';
    }
    
    // Combine all sections
    const content = nav + hero + about + projects + experience + education + contact + social + footer;
    document.getElementById("app").innerHTML = content;
    setThemeIcon();
    
  } catch (err) {
    document.getElementById("app").innerHTML = "<pre style='color:red'>" + err + "</pre>";
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", renderPortfolio);`;
    };

    // Generate the 5 files for deployment with new theme
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
  <body class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
    <div id="app"></div>
    <script src="./script.js"></script>
  </body>
</html>`;

    const cssCode = `:root {
  --primary-color: ${portfolioData.settings.primaryColor || "#3b82f6"};
}

.text-primary {
  color: var(--primary-color);
}

.bg-primary {
  background-color: var(--primary-color);
}

.bg-primary\\/10 {
  background-color: color-mix(in srgb, var(--primary-color) 10%, transparent);
}

.bg-primary\\/5 {
  background-color: color-mix(in srgb, var(--primary-color) 5%, transparent);
}

.hover\\:bg-primary\\/90:hover {
  background-color: color-mix(in srgb, var(--primary-color) 90%, transparent);
}

.hover\\:text-primary\\/80:hover {
  color: color-mix(in srgb, var(--primary-color) 80%, transparent);
}

.border-primary {
  border-color: var(--primary-color);
}

html, body {
  margin: 0;
  padding: 0;
  scroll-behavior: smooth;
}

.font-Ovo { font-family: "Ovo", serif; }
.font-Playfair { font-family: "Playfair Display", serif; }
.font-Poppins { font-family: "Poppins", sans-serif; }
.font-Inter { font-family: "Inter", sans-serif; }
.font-Montserrat { font-family: "Montserrat", sans-serif; }
.font-Raleway { font-family: "Raleway", sans-serif; }
.font-Schibsted { font-family: "Schibsted Grotesk", sans-serif; }
.font-Outfit { font-family: "Outfit", sans-serif; }

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Dark mode scrollbar */
.dark ::-webkit-scrollbar-track {
  background: #1f2937;
}

.dark ::-webkit-scrollbar-thumb {
  background: #4b5563;
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}`;

    const twConfigCode = `tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
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
      colors: {
        primary: "var(--primary-color)",
      },
    },
  },
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
