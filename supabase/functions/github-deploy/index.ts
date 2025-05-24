
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
    const { accessToken, repoName, files } = await req.json();

    if (!accessToken || !repoName || !files) {
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
        'Authorization': `token ${accessToken}`,
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
        'Authorization': `token ${accessToken}`,
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
      const getRepoResponse = await fetch(`https://api.github.com/repos/${user.login}/${repoName}`, {
        headers: {
          'Authorization': `token ${accessToken}`,
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

    // Get the current commit SHA (for updating files)
    const branchResponse = await fetch(`https://api.github.com/repos/${user.login}/${repoName}/branches/main`, {
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Portfolio-Deploy'
      }
    });

    let currentSha = null;
    if (branchResponse.ok) {
      const branch = await branchResponse.json();
      currentSha = branch.commit.sha;
    }

    // Upload files to repository
    console.log('Uploading files to repository...');
    
    for (const file of files) {
      // Check if file already exists
      const fileResponse = await fetch(`https://api.github.com/repos/${user.login}/${repoName}/contents/${file.name}`, {
        headers: {
          'Authorization': `token ${accessToken}`,
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
        message: `Deploy portfolio: ${file.name}`,
        content: btoa(unescape(encodeURIComponent(file.content))), // Base64 encode with UTF-8 support
        ...(existingFileSha && { sha: existingFileSha })
      };

      const uploadResponse = await fetch(`https://api.github.com/repos/${user.login}/${repoName}/contents/${file.name}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Portfolio-Deploy'
        },
        body: JSON.stringify(fileData)
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error(`Failed to upload ${file.name}:`, errorText);
        return new Response(
          JSON.stringify({ error: `Failed to upload ${file.name}` }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      console.log(`Uploaded ${file.name} successfully`);
    }

    // Enable GitHub Pages
    console.log('Enabling GitHub Pages...');
    const pagesResponse = await fetch(`https://api.github.com/repos/${user.login}/${repoName}/pages`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${accessToken}`,
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
    const pagesInfoResponse = await fetch(`https://api.github.com/repos/${user.login}/${repoName}/pages`, {
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Portfolio-Deploy'
      }
    });

    let pagesUrl = `https://${user.login}.github.io/${repoName}`;
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
