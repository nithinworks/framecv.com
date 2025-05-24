
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
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
    const { accessToken, portfolioData, files } = await req.json();

    if (!accessToken || !portfolioData || !files) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create a new site on Netlify
    const siteName = portfolioData.settings.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const createSiteResponse = await fetch('https://api.netlify.com/api/v1/sites', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `${siteName}-portfolio-${Date.now()}`,
      }),
    });

    if (!createSiteResponse.ok) {
      const errorText = await createSiteResponse.text();
      console.error('Failed to create site:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to create Netlify site' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const site = await createSiteResponse.json();
    console.log('Site created:', site.id);

    // Prepare files for deployment
    const deployFiles: Record<string, string> = {};
    
    files.forEach((file: { name: string; content: string }) => {
      deployFiles[file.name] = file.content;
    });

    // Deploy the files
    const deployResponse = await fetch(`https://api.netlify.com/api/v1/sites/${site.id}/deploys`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: deployFiles,
      }),
    });

    if (!deployResponse.ok) {
      const errorText = await deployResponse.text();
      console.error('Deployment failed:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to deploy to Netlify' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const deployment = await deployResponse.json();
    console.log('Deployment successful:', deployment.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        siteId: site.id,
        deployId: deployment.id,
        url: site.url,
        deployUrl: deployment.deploy_url
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Netlify deploy error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
