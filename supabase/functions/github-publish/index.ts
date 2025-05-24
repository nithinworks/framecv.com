
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GitHubRepo {
  name: string;
  html_url: string;
  clone_url: string;
}

interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, userToken, ...payload } = await req.json();
    
    if (!userToken) {
      throw new Error('GitHub token required');
    }

    const baseHeaders = {
      'Authorization': `token ${userToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'Portfolio-Publisher'
    };

    console.log(`GitHub API action: ${action}`);

    switch (action) {
      case 'getUser': {
        const response = await fetch('https://api.github.com/user', {
          headers: baseHeaders,
        });

        if (!response.ok) {
          const error = await response.text();
          console.error('Failed to fetch user:', error);
          throw new Error('Failed to authenticate with GitHub');
        }

        const user: GitHubUser = await response.json();
        console.log(`Authenticated user: ${user.login}`);
        return new Response(JSON.stringify(user), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'createRepository': {
        const { name, description } = payload;
        console.log(`Creating repository: ${name}`);
        
        const response = await fetch('https://api.github.com/user/repos', {
          method: 'POST',
          headers: baseHeaders,
          body: JSON.stringify({
            name,
            description,
            private: false,
            auto_init: false,
            homepage: `https://${name}.github.io`
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('Failed to create repository:', error);
          throw new Error(error.message || 'Failed to create repository');
        }

        const repo: GitHubRepo = await response.json();
        console.log(`Repository created: ${repo.html_url}`);
        return new Response(JSON.stringify(repo), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'uploadFiles': {
        const { owner, repo, files } = payload;
        console.log(`Uploading ${files.length} files to ${owner}/${repo}`);
        
        // Upload files sequentially to avoid rate limiting
        for (const file of files) {
          console.log(`Uploading ${file.path}`);
          
          const uploadResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`, {
            method: 'PUT',
            headers: baseHeaders,
            body: JSON.stringify({
              message: `Add ${file.path}`,
              content: btoa(unescape(encodeURIComponent(file.content))),
            }),
          });

          if (!uploadResponse.ok) {
            const error = await uploadResponse.json();
            console.error(`Failed to upload ${file.path}:`, error);
            throw new Error(`Failed to upload ${file.path}: ${error.message}`);
          }

          // Small delay to avoid hitting rate limits
          await new Promise(resolve => setTimeout(resolve, 300));
        }

        console.log('All files uploaded successfully');
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'enablePages': {
        const { owner, repo } = payload;
        console.log(`Enabling GitHub Pages for ${owner}/${repo}`);
        
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pages`, {
          method: 'POST',
          headers: baseHeaders,
          body: JSON.stringify({
            source: {
              branch: 'main',
              path: '/'
            }
          }),
        });

        if (!response.ok && response.status !== 409) { // 409 means already enabled
          const error = await response.json();
          console.error('Failed to enable GitHub Pages:', error);
          // Don't throw error for pages setup failure
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('GitHub publish error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
