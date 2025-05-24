
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

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    });
  }

  try {
    const { accessToken, portfolioData, siteName } = await req.json();

    if (!accessToken || !portfolioData) {
      throw new Error('Missing required parameters');
    }

    console.log('Starting deployment for:', siteName);

    // Generate HTML template
    const htmlContent = `<!DOCTYPE html>
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
  <body class="overflow-x-hidden font-Schibsted leading-8 bg-white text-primary">
    <div id="app">
      <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <header class="bg-white shadow-sm">
          <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
              <div class="flex-shrink-0">
                <h1 class="text-xl font-bold text-gray-900">${portfolioData.settings.name}</h1>
              </div>
            </div>
          </nav>
        </header>
        
        <main class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div class="text-center">
            <h1 class="text-4xl font-bold text-gray-900 mb-4">${portfolioData.settings.name}</h1>
            <p class="text-xl text-gray-600 mb-6">${portfolioData.settings.title}</p>
            <p class="text-lg text-gray-700 max-w-3xl mx-auto">${portfolioData.settings.summary}</p>
          </div>
          
          ${portfolioData.sections.about.enabled ? `
          <section class="mt-16">
            <div class="bg-white rounded-lg shadow-lg p-8">
              <h2 class="text-3xl font-bold text-gray-900 mb-4">${portfolioData.sections.about.title}</h2>
              <p class="text-gray-700 text-lg">${portfolioData.sections.about.content}</p>
            </div>
          </section>
          ` : ''}
          
          ${portfolioData.sections.experience.enabled ? `
          <section class="mt-16">
            <div class="bg-white rounded-lg shadow-lg p-8">
              <h2 class="text-3xl font-bold text-gray-900 mb-6">${portfolioData.sections.experience.title}</h2>
              <div class="space-y-6">
                ${portfolioData.sections.experience.items.map(item => `
                  <div class="border-l-4 border-blue-500 pl-4">
                    <h3 class="text-xl font-semibold text-gray-900">${item.position}</h3>
                    <p class="text-blue-600 font-medium">${item.company}</p>
                    <p class="text-gray-600">${item.period}</p>
                    <p class="text-gray-700 mt-2">${item.description}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          </section>
          ` : ''}
          
          ${portfolioData.sections.contact.enabled ? `
          <section class="mt-16">
            <div class="bg-white rounded-lg shadow-lg p-8 text-center">
              <h2 class="text-3xl font-bold text-gray-900 mb-6">${portfolioData.sections.contact.title}</h2>
              <div class="space-y-2">
                <p class="text-gray-700">Email: ${portfolioData.sections.contact.email}</p>
                <p class="text-gray-700">Phone: ${portfolioData.sections.contact.phone}</p>
                <p class="text-gray-700">Location: ${portfolioData.sections.contact.location}</p>
              </div>
            </div>
          </section>
          ` : ''}
        </main>
      </div>
    </div>
  </body>
</html>`;

    // Generate CSS
    const cssContent = `:root {
  --primary-color: ${portfolioData.settings.primaryColor || '#0067c7'};
}
.text-primary { color: var(--primary-color); }
.bg-primary { background-color: var(--primary-color); }
.border-primary { border-color: var(--primary-color); }`;

    // Generate Tailwind config
    const tailwindConfig = `tailwind.config = {
  theme: {
    extend: {
      colors: {
        primary: '${portfolioData.settings.primaryColor || '#0067c7'}',
      }
    }
  }
};`;

    // Create site on Netlify
    const siteResponse = await fetch('https://api.netlify.com/api/v1/sites', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: siteName || `portfolio-${Date.now()}`,
        custom_domain: null
      })
    });

    if (!siteResponse.ok) {
      const errorText = await siteResponse.text();
      console.error('Site creation failed:', errorText);
      throw new Error('Failed to create Netlify site');
    }

    const siteData = await siteResponse.json();
    console.log('Site created:', siteData.id);

    // Prepare files for deployment
    const files = {
      'index.html': htmlContent,
      'styles.css': cssContent,
      'tailwind.config.js': tailwindConfig
    };

    // Deploy to Netlify
    const deployResponse = await fetch(`https://api.netlify.com/api/v1/sites/${siteData.id}/deploys`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: files,
        draft: false,
        branch: 'main'
      })
    });

    if (!deployResponse.ok) {
      const errorText = await deployResponse.text();
      console.error('Deployment failed:', errorText);
      throw new Error('Failed to deploy to Netlify');
    }

    const deployData = await deployResponse.json();
    console.log('Deployment created:', deployData.id);

    // Return deployment info
    return new Response(
      JSON.stringify({
        success: true,
        siteId: siteData.id,
        deployId: deployData.id,
        url: siteData.url,
        adminUrl: siteData.admin_url,
        deployUrl: deployData.deploy_url || siteData.url
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
