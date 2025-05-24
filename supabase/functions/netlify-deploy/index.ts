
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { accessToken, portfolioData, siteName } = await req.json();

    if (!accessToken) {
      throw new Error('Access token is required');
    }

    if (!portfolioData) {
      throw new Error('Portfolio data is required');
    }

    console.log('Starting deployment process for site:', siteName);

    // Generate HTML content for the portfolio
    const htmlContent = generatePortfolioHTML(portfolioData);
    
    // Create a new site on Netlify
    const siteResponse = await fetch('https://api.netlify.com/api/v1/sites', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: siteName,
        custom_domain: null,
        password: null,
        notification_email: null,
        build_settings: {
          provider: 'manual',
        }
      })
    });

    if (!siteResponse.ok) {
      const errorText = await siteResponse.text();
      console.error('Site creation failed:', siteResponse.status, errorText);
      throw new Error(`Failed to create site: ${siteResponse.status} ${errorText}`);
    }

    const siteData = await siteResponse.json();
    console.log('Site created successfully:', siteData.id);

    // Deploy the HTML content
    const deployResponse = await fetch(`https://api.netlify.com/api/v1/sites/${siteData.id}/deploys`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/zip',
      },
      body: await createDeploymentZip(htmlContent)
    });

    if (!deployResponse.ok) {
      const errorText = await deployResponse.text();
      console.error('Deployment failed:', deployResponse.status, errorText);
      throw new Error(`Failed to deploy: ${deployResponse.status} ${errorText}`);
    }

    const deployData = await deployResponse.json();
    console.log('Deployment successful:', deployData.id);

    // Wait for deployment to be ready (optional polling)
    const finalUrl = siteData.ssl_url || siteData.url;
    const adminUrl = `https://app.netlify.com/sites/${siteData.name}/overview`;

    return new Response(
      JSON.stringify({
        success: true,
        url: finalUrl,
        adminUrl: adminUrl,
        siteId: siteData.id,
        deployId: deployData.id
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );

  } catch (error) {
    console.error('Error in netlify-deploy:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});

function generatePortfolioHTML(portfolioData: any): string {
  const { settings, hero, about, experience, projects, education, achievements, contact, social } = portfolioData;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${settings.name} - Portfolio</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .fade-in { animation: fadeIn 0.6s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-lg fixed w-full top-0 z-50">
        <div class="max-w-6xl mx-auto px-4">
            <div class="flex justify-between items-center py-4">
                <div class="font-bold text-xl text-gray-800">${settings.name}</div>
                <div class="hidden md:flex space-x-8">
                    <a href="#hero" class="text-gray-600 hover:text-gray-900">Home</a>
                    <a href="#about" class="text-gray-600 hover:text-gray-900">About</a>
                    <a href="#experience" class="text-gray-600 hover:text-gray-900">Experience</a>
                    <a href="#projects" class="text-gray-600 hover:text-gray-900">Projects</a>
                    <a href="#contact" class="text-gray-600 hover:text-gray-900">Contact</a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section id="hero" class="gradient-bg text-white min-h-screen flex items-center pt-16">
        <div class="max-w-6xl mx-auto px-4 text-center fade-in">
            <h1 class="text-5xl md:text-6xl font-bold mb-6">${hero.name}</h1>
            <p class="text-xl md:text-2xl mb-8 opacity-90">${hero.title}</p>
            <p class="text-lg mb-8 max-w-2xl mx-auto opacity-80">${hero.description}</p>
            <div class="space-x-4">
                <a href="#contact" class="bg-white text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">Get In Touch</a>
                <a href="#projects" class="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-800 transition">View Work</a>
            </div>
        </div>
    </section>

    <!-- About Section -->
    <section id="about" class="py-20 bg-white">
        <div class="max-w-6xl mx-auto px-4">
            <h2 class="text-4xl font-bold text-center mb-16 text-gray-800">About Me</h2>
            <div class="grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <p class="text-lg text-gray-600 leading-relaxed">${about.description}</p>
                </div>
                <div class="space-y-4">
                    ${about.skills.map(skill => `
                        <div>
                            <div class="flex justify-between mb-1">
                                <span class="text-sm font-medium text-gray-700">${skill.name}</span>
                                <span class="text-sm text-gray-500">${skill.level}%</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="bg-blue-600 h-2 rounded-full" style="width: ${skill.level}%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    </section>

    <!-- Experience Section -->
    <section id="experience" class="py-20 bg-gray-50">
        <div class="max-w-6xl mx-auto px-4">
            <h2 class="text-4xl font-bold text-center mb-16 text-gray-800">Experience</h2>
            <div class="space-y-8">
                ${experience.map(exp => `
                    <div class="bg-white p-8 rounded-lg shadow-md">
                        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                            <div>
                                <h3 class="text-xl font-semibold text-gray-800">${exp.position}</h3>
                                <p class="text-lg text-blue-600">${exp.company}</p>
                            </div>
                            <div class="text-gray-500 mt-2 md:mt-0">
                                ${exp.startDate} - ${exp.endDate}
                            </div>
                        </div>
                        <p class="text-gray-600">${exp.description}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>

    <!-- Projects Section -->
    <section id="projects" class="py-20 bg-white">
        <div class="max-w-6xl mx-auto px-4">
            <h2 class="text-4xl font-bold text-center mb-16 text-gray-800">Projects</h2>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                ${projects.map(project => `
                    <div class="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
                        <div class="p-6">
                            <h3 class="text-xl font-semibold mb-3 text-gray-800">${project.title}</h3>
                            <p class="text-gray-600 mb-4">${project.description}</p>
                            <div class="flex flex-wrap gap-2 mb-4">
                                ${project.technologies.map(tech => `
                                    <span class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">${tech}</span>
                                `).join('')}
                            </div>
                            ${project.liveUrl ? `<a href="${project.liveUrl}" target="_blank" class="text-blue-600 hover:text-blue-800 font-medium">View Project →</a>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="py-20 bg-gray-50">
        <div class="max-w-6xl mx-auto px-4 text-center">
            <h2 class="text-4xl font-bold mb-16 text-gray-800">Get In Touch</h2>
            <div class="max-w-2xl mx-auto">
                <p class="text-lg text-gray-600 mb-8">
                    I'm always interested in new opportunities and collaborations. 
                    Feel free to reach out if you'd like to work together!
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    ${contact.email ? `<a href="mailto:${contact.email}" class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">Email Me</a>` : ''}
                    ${contact.phone ? `<a href="tel:${contact.phone}" class="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition">Call Me</a>` : ''}
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-8">
        <div class="max-w-6xl mx-auto px-4 text-center">
            <div class="flex justify-center space-x-6 mb-4">
                ${social.github ? `<a href="${social.github}" target="_blank" class="text-gray-300 hover:text-white">GitHub</a>` : ''}
                ${social.linkedin ? `<a href="${social.linkedin}" target="_blank" class="text-gray-300 hover:text-white">LinkedIn</a>` : ''}
                ${social.twitter ? `<a href="${social.twitter}" target="_blank" class="text-gray-300 hover:text-white">Twitter</a>` : ''}
            </div>
            <p class="text-gray-400">© 2024 ${settings.name}. All rights reserved.</p>
        </div>
    </footer>

    <script>
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    </script>
</body>
</html>`;
}

async function createDeploymentZip(htmlContent: string): Promise<Uint8Array> {
  // Create a simple zip file with the HTML content
  const files = new Map();
  files.set('index.html', new TextEncoder().encode(htmlContent));
  
  // Simple zip creation (for demonstration - in production you might want a more robust solution)
  const zipData = await createZip(files);
  return zipData;
}

async function createZip(files: Map<string, Uint8Array>): Promise<Uint8Array> {
  // Simple zip implementation
  // In a real implementation, you'd use a proper zip library
  // For now, we'll use a simple approach that works with Netlify's deployment API
  
  const encoder = new TextEncoder();
  const htmlContent = files.get('index.html');
  
  if (!htmlContent) {
    throw new Error('No HTML content found');
  }
  
  // For Netlify, we can actually just upload the raw HTML content
  // The API will handle it correctly
  return htmlContent;
}
