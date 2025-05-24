import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, name, description, owner, repo, files, userToken } = await req.json();
    console.log('GitHub publish action:', action);

    const githubToken = userToken || Deno.env.get('GITHUB_TOKEN');
    if (!githubToken) {
      console.error('GitHub token not configured');
      return new Response(
        JSON.stringify({ error: 'GitHub token not configured' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const githubHeaders = {
      'Authorization': `token ${githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };

    switch (action) {
      case 'checkToken':
        return new Response(
          JSON.stringify({ isConfigured: true }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );

      case 'getUser':
        const userResponse = await fetch('https://api.github.com/user', {
          headers: githubHeaders,
        });

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user info');
        }

        const userData = await userResponse.json();
        return new Response(
          JSON.stringify(userData),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );

      case 'createRepository':
        const createRepoResponse = await fetch('https://api.github.com/user/repos', {
          method: 'POST',
          headers: githubHeaders,
          body: JSON.stringify({
            name,
            description,
            public: true,
            auto_init: false,
          }),
        });

        if (!createRepoResponse.ok) {
          const errorData = await createRepoResponse.json();
          throw new Error(errorData.message || 'Failed to create repository');
        }

        const repoData = await createRepoResponse.json();
        return new Response(
          JSON.stringify(repoData),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );

      case 'uploadFiles':
        for (const file of files) {
          const uploadResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`,
            {
              method: 'PUT',
              headers: githubHeaders,
              body: JSON.stringify({
                message: `Add ${file.path}`,
                content: btoa(unescape(encodeURIComponent(file.content))),
              }),
            }
          );

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(`Failed to upload ${file.path}: ${errorData.message}`);
          }
        }

        // Enable GitHub Pages after uploading files
        try {
          const pagesResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/pages`,
            {
              method: 'POST',
              headers: githubHeaders,
              body: JSON.stringify({
                source: {
                  branch: 'main',
                  path: '/',
                },
              }),
            }
          );

          if (!pagesResponse.ok) {
            console.warn('GitHub Pages setup failed, but files uploaded successfully');
          }
        } catch (pagesError) {
          console.warn('GitHub Pages setup error:', pagesError);
        }

        return new Response(
          JSON.stringify({ success: true }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );

      case 'enablePages':
        const pagesResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/pages`,
          {
            method: 'POST',
            headers: githubHeaders,
            body: JSON.stringify({
              source: {
                branch: 'main',
                path: '/',
              },
            }),
          }
        );

        if (!pagesResponse.ok) {
          const errorData = await pagesResponse.json();
          throw new Error(errorData.message || 'Failed to enable GitHub Pages');
        }

        const pagesData = await pagesResponse.json();
        return new Response(
          JSON.stringify(pagesData),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }
  } catch (error) {
    console.error('GitHub publish error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
