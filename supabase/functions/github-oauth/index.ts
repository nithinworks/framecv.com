
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { action, code, name, description, owner, repo, files } = await req.json();
    console.log('GitHub OAuth action:', action);

    const githubClientId = Deno.env.get('GITHUB_CLIENT_ID');
    const githubClientSecret = Deno.env.get('GITHUB_CLIENT_SECRET');

    if (!githubClientId || !githubClientSecret) {
      console.error('GitHub OAuth credentials not configured');
      return new Response(
        JSON.stringify({ error: 'GitHub OAuth not configured' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    switch (action) {
      case 'exchangeCode':
        // Exchange authorization code for access token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_id: githubClientId,
            client_secret: githubClientSecret,
            code: code,
          }),
        });

        if (!tokenResponse.ok) {
          throw new Error('Failed to exchange code for token');
        }

        const tokenData: GitHubTokenResponse = await tokenResponse.json();

        // Store the token for this user
        const { error: insertError } = await supabase
          .from('user_github_tokens')
          .upsert({
            user_id: user.id,
            access_token: tokenData.access_token,
            token_type: tokenData.token_type,
            scope: tokenData.scope,
          });

        if (insertError) {
          console.error('Error storing GitHub token:', insertError);
          throw new Error('Failed to store GitHub token');
        }

        return new Response(
          JSON.stringify({ success: true }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );

      case 'checkUserToken':
        const { data: tokenData, error: tokenError } = await supabase
          .from('user_github_tokens')
          .select('access_token')
          .eq('user_id', user.id)
          .single();

        return new Response(
          JSON.stringify({ hasToken: !tokenError && !!tokenData }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );

      case 'getUser':
      case 'createRepository':
      case 'uploadFiles':
        // Get user's stored token
        const { data: userToken, error: tokenFetchError } = await supabase
          .from('user_github_tokens')
          .select('access_token')
          .eq('user_id', user.id)
          .single();

        if (tokenFetchError || !userToken) {
          throw new Error('GitHub token not found. Please reconnect your account.');
        }

        const githubHeaders = {
          'Authorization': `token ${userToken.access_token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        };

        if (action === 'getUser') {
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
        }

        if (action === 'createRepository') {
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
        }

        if (action === 'uploadFiles') {
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
        }
        break;

      case 'disconnect':
        const { error: deleteError } = await supabase
          .from('user_github_tokens')
          .delete()
          .eq('user_id', user.id);

        if (deleteError) {
          throw new Error('Failed to disconnect account');
        }

        return new Response(
          JSON.stringify({ success: true }),
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
    console.error('GitHub OAuth error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
