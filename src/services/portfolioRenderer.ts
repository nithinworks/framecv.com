import { PortfolioData } from "@/types/portfolio";
import { Theme } from "@/hooks/useThemes";

export const generatePortfolioHTML = (
  portfolioData: PortfolioData,
  theme?: Theme,
  viewMode: "light" | "dark" = "light"
): string => {
  // Get last name for logo
  const nameParts = (portfolioData.settings.name || "").trim().split(" ");
  const logoName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];
  
  // Generate HTML structure
  return `
    <!DOCTYPE html>
    <html lang="en" class="${viewMode === "dark" ? "dark" : ""} scroll-smooth">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Portfolio - ${portfolioData.settings.name}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@100..900&family=Ovo&family=Schibsted+Grotesk:wght@400;500;700&family=Poppins:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&family=Crimson+Text:wght@400;600&display=swap" rel="stylesheet" />
        
        <style>
          ${getBaseStyles()}
          
          ${getPortfolioStyles(portfolioData.settings.primaryColor || "#0067C7", theme)}
          
          /* Set body height to 100% to avoid scrolling issues in the iframe */
          body {
            min-height: 100%;
            overflow-x: hidden;
          }
        </style>
      </head>
      <body class="font-themed leading-8 bg-themed-bg text-themed-primary">
        ${renderNavigation(portfolioData)}
        ${renderHeroSection(portfolioData)}
        ${renderAboutSection(portfolioData)}
        ${renderProjectsSection(portfolioData)}
        ${renderExperienceSection(portfolioData)}
        ${renderEducationSection(portfolioData)}
        ${renderContactSection(portfolioData)}
        ${renderSocialSection(portfolioData)}
        ${renderFooter(portfolioData)}
        
        <script>
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
          
          // Set theme icon based on current theme
          function setThemeIcon() {
            const iconSpan = document.getElementById("theme-toggle-icon");
            if (!iconSpan) return;
            
            if (document.documentElement.classList.contains("dark")) {
              // Sun icon (minimal, Heroicons style)
              iconSpan.innerHTML = '${getSunIcon()}';
            } else {
              // Moon icon
              iconSpan.innerHTML = '${getMoonIcon()}';
            }
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
          
          // Initialize theme icon
          setThemeIcon();
        </script>
      </body>
    </html>
  `;
};

// Navigation Section
const renderNavigation = (data: PortfolioData): string => {
  const nameParts = (data.settings.name || "").trim().split(" ");
  const logoName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];
  
  let navLinks = "";
  (data.navigation.items || []).forEach((link) => {
    navLinks += `<li><a href="${link.url}" class="hover:dynamic-primary transition-colors duration-300">${link.name}</a></li>`;
  });
  
  return `<nav class="w-full flex justify-between items-center px-4 sm:px-6 md:px-8 py-5 bg-themed-card backdrop-blur-md fixed top-0 left-0 z-50 border-b border-themed-border">
    <span class="font-themed font-bold text-xl tracking-tight">${logoName}<span class='dynamic-primary'>.</span></span>
    <ul class="hidden md:flex gap-6 sm:gap-8 md:gap-10 font-themed text-lg border-none bg-transparent shadow-none">${navLinks}</ul>
    <div class="flex items-center gap-4">
      <button id="theme-toggle" onclick="toggleTheme()" class="transition-colors duration-300 focus:outline-none">
        <span id="theme-toggle-icon"></span>
      </button>
      <a href="#contact" class="px-6 py-2 rounded-full bg-dynamic-primary text-white font-themed font-medium shadow hover:scale-105 transition-transform duration-300">Connect</a>
    </div>
  </nav>`;
};

// Hero Section
const renderHeroSection = (data: PortfolioData): string => {
  if (!data.sections.hero || !data.sections.hero.enabled) return '';

  let ctas = "";
  (data.sections.hero.ctaButtons || []).forEach((btn) => {
    ctas += `<a href="${btn.url}" class="flex items-center gap-2 ${
      btn.isPrimary
        ? "px-8 py-3 rounded-full bg-dynamic-primary text-white font-medium shadow hover:scale-105 transition-transform duration-300"
        : "px-8 py-3 rounded-full border border-themed-border dynamic-primary bg-themed-card hover:bg-themed-accent transition-colors duration-300"
    }">${btn.icon ? getIconSVG(btn.icon) : ""}<span>${btn.text}</span></a>`;
  });

  return `<div class="hero-themed w-full"><header id="home" class="pt-36 pb-16 flex flex-col items-center text-center max-w-2xl mx-auto animate-fade-in px-4 sm:px-6 md:px-8 w-full">
    <img src="${data.settings.profileImage}" alt="Profile" class="rounded-full w-28 mb-8 border-4 border-white shadow-md animate-fade-in" />
    <h2 class="font-themed text-xl mb-3 animate-slide-up">Hi! I'm ${data.settings.name} <span class="inline-block">👋</span></h2>
    <h1 class="font-themed text-5xl sm:text-6xl font-bold mb-6 animate-slide-up">${data.settings.title}<br />based in ${data.settings.location}.</h1>
    <p class="text-[16px] text-themed-secondary mb-8 animate-fade-in">${data.settings.summary}</p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">${ctas}</div>
  </header></div>`;
};

// About Section
const renderAboutSection = (data: PortfolioData): string => {
  if (!data.sections.about || !data.sections.about.enabled) return '';

  let skills = "";
  if (data.sections.about.skills && data.sections.about.skills.enabled) {
    skills = `<h2 class="font-themed text-2xl mb-4 mt-8">${
      data.sections.about.skills.title
    }</h2><div class="flex flex-wrap justify-center gap-3">${data.sections.about.skills.items
      .map(
        (skill) =>
          `<span class="px-4 py-1 rounded-full border border-themed-border text-sm bg-themed-accent transition-all duration-300">${skill}</span>`
      )
      .join("")}</div>`;
  }

  return `<section id="about" class="py-16 sm:py-20 bg-themed-bg animate-fade-in px-4 sm:px-6 md:px-8 w-full">
    <div class="max-w-2xl mx-auto text-center">
      <h2 class="font-themed text-3xl mb-4">${data.sections.about.title}</h2>
      <p class="mb-8 text-themed-secondary">${data.sections.about.content}</p>
      ${skills}
    </div>
  </section>`;
};

// Projects Section
const renderProjectsSection = (data: PortfolioData): string => {
  if (!data.sections.projects || !data.sections.projects.enabled) return '';

  const projectCards = data.sections.projects.items
    .map(
      (project) =>
        `<div class="bg-themed-card border border-themed-border rounded-2xl p-7 flex flex-col gap-3 shadow-sm hover:shadow-md transition w-full max-w-md mx-auto backdrop-blur-sm">
          <h3 class="font-themed text-lg mb-1">${project.title}</h3>
          <p class="text-sm text-themed-secondary">${
            project.description
          }</p>
          <div class="flex flex-wrap gap-2 mb-2">${project.tags
            .map(
              (tag) =>
                `<span class="text-xs px-3 py-1 rounded-full bg-themed-accent border border-themed-border">${tag}</span>`
            )
            .join("")}</div>
          ${
            project.previewUrl && project.previewUrl !== "#"
              ? `<a href="${project.previewUrl}" class="dynamic-primary font-normal hover:underline text-base flex items-center gap-1">View project <span aria-hidden="true">→</span></a>`
              : ""
          }
        </div>`
    )
    .join("");

  return `<section id="projects" class="py-16 bg-themed-bg animate-fade-in px-2 sm:px-4 md:px-8 w-full">
    <div class="max-w-4xl mx-auto text-center mb-10">
      <h2 class="font-themed text-3xl mb-2">${data.sections.projects.title}</h2>
    </div>
    <div class="max-w-5xl mx-auto grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 justify-center">${projectCards}</div>
  </section>`;
};

// Experience Section
const renderExperienceSection = (data: PortfolioData): string => {
  if (!data.sections.experience || !data.sections.experience.enabled) return '';

  const experiences = data.sections.experience.items
    .map(
      (item) =>
        `<div class="flex gap-4 items-start">
          <div class="w-3 h-3 mt-2 rounded-full bg-dynamic-primary"></div>
          <div>
            <h3 class="font-themed text-lg mb-1">${item.position}</h3>
            <div class="text-sm text-themed-secondary mb-1">${item.company} • ${item.period}</div>
            <p class="text-themed-secondary text-sm leading-relaxed mb-2">${item.description}</p>
          </div>
        </div>`
    )
    .join("");

  return `<section id="experience" class="py-16 bg-themed-bg animate-fade-in px-4 sm:px-6 md:px-8 w-full">
    <div class="max-w-4xl mx-auto text-center mb-10">
      <h2 class="font-themed text-3xl mb-2">${data.sections.experience.title}</h2>
    </div>
    <div class="max-w-2xl mx-auto flex flex-col gap-8">${experiences}</div>
  </section>`;
};

// Education Section
const renderEducationSection = (data: PortfolioData): string => {
  if (!data.sections.education || !data.sections.education.enabled) return '';

  const educationItems = data.sections.education.items
    .map(
      (item) =>
        `<div class="bg-themed-card border border-themed-border rounded-2xl p-5 flex flex-col gap-1 shadow-sm w-full backdrop-blur-sm">
          <h3 class="font-themed text-lg mb-1">${item.degree}</h3>
          <div class="text-sm text-themed-secondary mb-1">${item.institution} • ${item.period}</div>
        </div>`
    )
    .join("");

  return `<section id="education" class="py-16 bg-themed-bg animate-fade-in px-4 sm:px-6 md:px-8 w-full">
    <div class="max-w-4xl mx-auto text-center mb-10">
      <h2 class="font-themed text-3xl mb-2">${data.sections.education.title}</h2>
    </div>
    <div class="max-w-2xl mx-auto flex flex-col gap-6">${educationItems}</div>
  </section>`;
};

// Contact Section
const renderContactSection = (data: PortfolioData): string => {
  if (!data.sections.contact || !data.sections.contact.enabled) return '';

  const contactInfo = [
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
        `<div class="w-full sm:w-auto min-w-0 max-w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-themed-card border border-themed-border text-sm font-themed text-themed-primary justify-center shadow-sm backdrop-blur-sm" style="font-size:14px;font-weight:500;">
            ${card.icon}<span class="break-words">${card.value}</span>
        </div>`
    )
    .join("");

  return `<section id="contact" class="py-8 bg-themed-bg animate-fade-in px-4 sm:px-6 md:px-8 w-full">
    <div class="max-w-2xl mx-auto text-center mb-4">
      <h2 class="font-themed text-4xl mb-4">${data.sections.contact.title}</h2>
      <div class="flex flex-col sm:flex-row flex-wrap justify-center gap-4 mb-4 px-4 sm:px-0">${contactInfo}</div>
    </div>
  </section>`;
};

// Social Section
const renderSocialSection = (data: PortfolioData): string => {
  if (!data.sections.social || !data.sections.social.enabled) return '';

  const socialLinks = data.sections.social.items
    .map(
      (item) =>
        `<a href="${item.url}" class="flex items-center gap-2 px-4 py-3 rounded-xl bg-themed-card border border-themed-border text-sm font-themed text-themed-primary hover:bg-themed-accent transition w-full sm:w-auto justify-center backdrop-blur-sm" style="font-size:14px;font-weight:500;">
          ${item.icon ? getIconSVG(item.icon) : ""}${item.platform}
        </a>`
    )
    .join("");

  return `<section id="social" class="py-4 bg-themed-bg animate-fade-in px-4 sm:px-0 w-full">
    <div class="max-w-2xl mx-auto text-center mb-4 w-full px-4 sm:px-0">
      <h3 class="font-themed text-2xl mb-4 mt-4">Social Media</h3>
      <div class="flex flex-col sm:flex-row justify-center gap-4 mb-2 px-4 sm:px-0">${socialLinks}</div>
    </div>
  </section>`;
};

// Footer
const renderFooter = (data: PortfolioData): string => {
  if (!data.footer || !data.footer.enabled) return '';

  const nameParts = (data.settings.name || "").trim().split(" ");
  const logoName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];

  const navLinks = (data.navigation.items || [])
    .map(
      (link) =>
        `<a href="${link.url}" class="text-themed-secondary hover:dynamic-primary transition text-base">${link.name}</a>`
    )
    .join("");

  return `<footer class="py-8 bg-themed-bg border-t border-themed-border mt-0 px-4 sm:px-6 md:px-8 w-full">
    <div class="max-w-2xl mx-auto text-center flex flex-col gap-6 items-center">
      <span class="font-themed text-2xl font-bold tracking-tight mb-2">${logoName}<span class='dynamic-primary'>.</span></span>
      <div class="flex flex-wrap justify-center gap-8 mb-2">${navLinks}</div>
      <p class="text-themed-secondary text-sm mt-2 mb-2">${data.footer.copyright}</p>
      <div class="flex justify-center">
        <span class="px-5 py-2 rounded-full bg-themed-accent border border-themed-border text-sm text-themed-primary font-medium">Built with Nithin.io</span>
      </div>
    </div>
  </footer>`;
};

// Get icon SVG
const getIconSVG = (name: string): string => {
  switch (name) {
    case "mail":
      return `<svg xmlns='http://www.w3.org/2000/svg' class='w-6 h-6 mr-2 flex-shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'/></svg>`;
    case "download":
      return `<svg xmlns='http://www.w3.org/2000/svg' class='w-6 h-6 mr-2 flex-shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H4a2 2 0 01-2-2v-8a2 2 0 012-2h16a2 2 0 012 2v8a2 2 0 01-2 2z'/></svg>`;
    case "phone":
      return `<svg xmlns='http://www.w3.org/2000/svg' class='w-6 h-6 mr-2 flex-shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'/></svg>`;
    case "map":
      return `<svg xmlns='http://www.w3.org/2000/svg' class='w-6 h-6 mr-2 flex-shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'/><path stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'/></svg>`;
    case "globe":
      return `<svg xmlns='http://www.w3.org/2000/svg' class='w-6 h-6 mr-2 flex-shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 0v20m0-20C7.52 2 2 6.48 2 12m10-10c4.52 0 10 4.48 10 10m-10-10v10m0 0l5-5m-5 5l-5-5'/></svg>`;
    case "linkedin":
      return `<svg xmlns='http://www.w3.org/2000/svg' class='w-6 h-6 mr-2 flex-shrink-0' fill='currentColor' viewBox='0 0 24 24'><path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'/></svg>`;
    case "github":
      return `<svg xmlns='http://www.w3.org/2000/svg' class='w-6 h-6 mr-2 flex-shrink-0' fill='currentColor' viewBox='0 0 24 24'><path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z'/></svg>`;
    case "twitter":
      return `<svg xmlns='http://www.w3.org/2000/svg' class='w-6 h-6 mr-2 flex-shrink-0' fill='currentColor' viewBox='0 0 24 24'><path d='M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z'/></svg>`;
    case "instagram":
      return `<svg xmlns='http://www.w3.org/2000/svg' class='w-6 h-6 mr-2 flex-shrink-0' fill='currentColor' viewBox='0 0 24 24'><path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058 1.644.07 4.849.07 3.204 0 3.584-.012 4.849-.07 4.354-.2 6.782-2.618 6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.204.014 3.583.07 4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.28.073 1.689-.073 4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z'/></svg>`;
    default:
      return "";
  }
};

// Sun icon
const getSunIcon = (): string => {
  return `<svg xmlns='http://www.w3.org/2000/svg' class='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor' stroke-width='1.5'>
    <path stroke-linecap='round' stroke-linejoin='round' d='M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z' />
  </svg>`;
};

// Moon icon
const getMoonIcon = (): string => {
  return `<svg xmlns='http://www.w3.org/2000/svg' class='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor' stroke-width='1.5'>
    <path stroke-linecap='round' stroke-linejoin='round' d='M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z' />
  </svg>`;
};

// Base Styles
const getBaseStyles = (): string => {
  return `
    /* Base Tailwind Reset */
    *,::before,::after{box-sizing:border-box;border-width:0;border-style:solid;border-color:currentColor}
    html{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif}
    body{margin:0;line-height:inherit}
    
    /* Tailwind Config */
    .w-full { width: 100%; }
    .max-w-2xl { max-width: 42rem; }
    .max-w-4xl { max-width: 56rem; }
    .max-w-5xl { max-width: 64rem; }
    .max-w-md { max-width: 28rem; }
    .mx-auto { margin-left: auto; margin-right: auto; }
    .mb-1 { margin-bottom: 0.25rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-3 { margin-bottom: 0.75rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .mb-8 { margin-bottom: 2rem; }
    .mb-10 { margin-bottom: 2.5rem; }
    .mt-2 { margin-top: 0.5rem; }
    .mt-4 { margin-top: 1rem; }
    .mt-8 { margin-top: 2rem; }
    .mr-2 { margin-right: 0.5rem; }
    .ml-2 { margin-left: 0.5rem; }
    .mt-0 { margin-top: 0; }
    .flex { display: flex; }
    .inline-block { display: inline-block; }
    .grid { display: grid; }
    .hidden { display: none; }
    .h-3 { height: 0.75rem; }
    .h-6 { height: 1.5rem; }
    .w-3 { width: 0.75rem; }
    .w-6 { width: 1.5rem; }
    .w-28 { width: 7rem; }
    .min-w-0 { min-width: 0; }
    .max-w-full { max-width: 100%; }
    .flex-shrink-0 { flex-shrink: 0; }
    .flex-col { flex-direction: column; }
    .flex-wrap { flex-wrap: wrap; }
    .items-start { align-items: flex-start; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }
    .justify-between { justify-content: space-between; }
    .gap-1 { gap: 0.25rem; }
    .gap-2 { gap: 0.5rem; }
    .gap-3 { gap: 0.75rem; }
    .gap-4 { gap: 1rem; }
    .gap-6 { gap: 1.5rem; }
    .gap-8 { gap: 2rem; }
    .gap-10 { gap: 2.5rem; }
    .rounded-full { border-radius: 9999px; }
    .rounded-xl { border-radius: 0.75rem; }
    .rounded-2xl { border-radius: 1rem; }
    .border { border-width: 1px; }
    .border-4 { border-width: 4px; }
    .border-t { border-top-width: 1px; }
    .border-b { border-bottom-width: 1px; }
    .bg-white { background-color: rgb(255 255 255); }
    .bg-black { background-color: rgb(0 0 0); }
    .bg-gray-900 { background-color: rgb(17 24 39); }
    .bg-gray-100 { background-color: rgb(243 244 246); }
    .bg-transparent { background-color: transparent; }
    .p-5 { padding: 1.25rem; }
    .p-7 { padding: 1.75rem; }
    .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
    .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .px-5 { padding-left: 1.25rem; padding-right: 1.25rem; }
    .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
    .px-8 { padding-left: 2rem; padding-right: 2rem; }
    .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
    .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
    .py-5 { padding-top: 1.25rem; padding-bottom: 1.25rem; }
    .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
    .py-16 { padding-top: 4rem; padding-bottom: 4rem; }
    .py-20 { padding-top: 5rem; padding-bottom: 5rem; }
    .pt-36 { padding-top: 9rem; }
    .pb-16 { padding-bottom: 4rem; }
    .text-center { text-align: center; }
    .text-xs { font-size: 0.75rem; line-height: 1rem; }
    .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
    .text-base { font-size: 1rem; line-height: 1.5rem; }
    .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
    .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
    .text-2xl { font-size: 1.5rem; line-height: 2rem; }
    .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
    .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
    .text-5xl { font-size: 3rem; line-height: 1; }
    .text-\\[16px\\] { font-size: 16px; }
    .font-medium { font-weight: 500; }
    .font-bold { font-weight: 700; }
    .font-normal { font-weight: 400; }
    .leading-8 { line-height: 2rem; }
    .leading-relaxed { line-height: 1.625; }
    .tracking-tight { letter-spacing: -0.025em; }
    .text-white { color: rgb(255 255 255); }
    .shadow { box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1); }
    .shadow-sm { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
    .shadow-md { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }
    .backdrop-blur-md { backdrop-filter: blur(12px); }
    .backdrop-blur-sm { backdrop-filter: blur(4px); }
    .transition { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
    .transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
    .transition-colors { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
    .transition-transform { transition-property: transform; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
    .duration-300 { transition-duration: 300ms; }
    .hover\\:scale-105:hover { transform: scale(1.05); }
    .hover\\:shadow-md:hover { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }
    .hover\\:underline:hover { text-decoration: underline; }
    .z-50 { z-index: 50; }
    .fixed { position: fixed; }
    .top-0 { top: 0; }
    .left-0 { left: 0; }
    .break-words { overflow-wrap: break-word; }
    
    .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    
    @media (min-width: 640px) {
      .sm\\:px-0 { padding-left: 0; padding-right: 0; }
      .sm\\:px-4 { padding-left: 1rem; padding-right: 1rem; }
      .sm\\:px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
      .sm\\:py-20 { padding-top: 5rem; padding-bottom: 5rem; }
      .sm\\:gap-8 { gap: 2rem; }
      .sm\\:flex-row { flex-direction: row; }
      .sm\\:w-auto { width: auto; }
      .sm\\:text-6xl { font-size: 3.75rem; line-height: 1; }
      .sm\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    
    @media (min-width: 768px) {
      .md\\:px-8 { padding-left: 2rem; padding-right: 2rem; }
      .md\\:gap-10 { gap: 2.5rem; }
      .md\\:flex { display: flex; }
      .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    
    @media (min-width: 1280px) {
      .xl\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
  `;
};

// Portfolio Styles with Theme Support
const getPortfolioStyles = (primaryColor: string, theme?: Theme): string => {
  const defaultTheme = {
    background: "linear-gradient(120deg, rgba(var(--primary-rgb), 0.03) 0%, #fff 100%)",
    heroBackground: "linear-gradient(120deg, rgba(var(--primary-rgb), 0.08) 0%, #fff 100%)",
    cardBackground: "rgba(255, 255, 255, 0.8)",
    textPrimary: "#2d3748",
    textSecondary: "#718096",
    border: "rgba(0, 0, 0, 0.1)",
    accent: "rgba(var(--primary-rgb), 0.1)",
    fontFamily: "'Inter', system-ui, sans-serif"
  };

  const currentTheme = theme?.styles || defaultTheme;
  
  return `
    :root {
      --primary-color: ${primaryColor};
      --primary-rgb: ${hexToRgb(primaryColor)};
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
    
    /* Theme-specific styles */
    .font-themed {
      font-family: ${currentTheme.fontFamily};
    }
    
    .bg-themed-bg {
      background: ${currentTheme.background};
    }
    
    .hero-themed {
      background: ${currentTheme.heroBackground};
    }
    
    .bg-themed-card {
      background: ${currentTheme.cardBackground};
    }
    
    .text-themed-primary {
      color: ${currentTheme.textPrimary};
    }
    
    .text-themed-secondary {
      color: ${currentTheme.textSecondary};
    }
    
    .border-themed-border {
      border-color: ${currentTheme.border};
    }
    
    .bg-themed-accent {
      background: ${currentTheme.accent};
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
    
    .hover\\:dynamic-primary:hover {
      color: var(--primary-color) !important;
    }
  `;
};

// Helper function to convert hex to rgb
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 0, 0';
}
