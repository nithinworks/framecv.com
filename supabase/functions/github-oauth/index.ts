
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  error?: string;
  error_description?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('GitHub OAuth request received');
    
    // Get the authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    console.log('Supabase URL:', supabaseUrl);
    console.log('Auth header present:', !!authHeader);
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('User authenticated:', user.id);

    const { action, code, name, description, owner, repo, files } = await req.json();
    console.log('GitHub OAuth action:', action);

    const githubClientId = Deno.env.get('GITHUB_CLIENT_ID');
    const githubClientSecret = Deno.env.get('GITHUB_CLIENT_SECRET');

    console.log('GitHub Client ID:', githubClientId);
    console.log('GitHub Client Secret present:', !!githubClientSecret);

    if (!githubClientId || !githubClientSecret) {
      console.error('GitHub OAuth credentials missing');
      console.error('GITHUB_CLIENT_ID:', githubClientId);
      console.error('GITHUB_CLIENT_SECRET present:', !!githubClientSecret);
      return new Response(
        JSON.stringify({ error: 'GitHub OAuth credentials not configured in Supabase secrets' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    switch (action) {
      case 'exchangeCode':
        console.log('Exchanging code for token, code length:', code?.length);
        
        // Exchange authorization code for access token
        const tokenRequestBody = {
          client_id: githubClientId,
          client_secret: githubClientSecret,
          code: code,
        };

        console.log('Token request body:', { ...tokenRequestBody, client_secret: '[REDACTED]' });

        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'Portfolio-Creator-App',
          },
          body: JSON.stringify(tokenRequestBody),
        });

        console.log('GitHub token response status:', tokenResponse.status);

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          console.error('GitHub token exchange failed:', errorText);
          throw new Error(`Failed to exchange code for token: ${tokenResponse.status} - ${errorText}`);
        }

        const githubTokenData: GitHubTokenResponse = await tokenResponse.json();
        console.log('GitHub token response:', { ...githubTokenData, access_token: '[REDACTED]' });

        if (githubTokenData.error) {
          console.error('GitHub OAuth error:', githubTokenData.error, githubTokenData.error_description);
          throw new Error(`GitHub OAuth error: ${githubTokenData.error} - ${githubTokenData.error_description}`);
        }

        if (!githubTokenData.access_token) {
          console.error('No access token in response:', githubTokenData);
          throw new Error('No access token received from GitHub');
        }

        // Store the token for this user
        console.log('Storing token for user:', user.id);
        const { error: insertError } = await supabase
          .from('user_github_tokens')
          .upsert({
            user_id: user.id,
            access_token: githubTokenData.access_token,
            token_type: githubTokenData.token_type,
            scope: githubTokenData.scope,
          });

        if (insertError) {
          console.error('Error storing GitHub token:', insertError);
          throw new Error('Failed to store GitHub token');
        }

        console.log('Token stored successfully');
        return new Response(
          JSON.stringify({ success: true }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );

      case 'checkUserToken':
        const { data: tokenCheck, error: tokenError } = await supabase
          .from('user_github_tokens')
          .select('access_token')
          .eq('user_id', user.id)
          .single();

        return new Response(
          JSON.stringify({ hasToken: !tokenError && !!tokenCheck }),
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
          'User-Agent': 'Portfolio-Creator-App',
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
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check edge function logs for more information'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
