
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
    console.log('=== GitHub OAuth Edge Function Start ===');
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    console.log('Headers:', Object.fromEntries(req.headers.entries()));
    
    // Get the authenticated user
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    console.log('Auth header format correct:', authHeader?.startsWith('Bearer '));
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Invalid or missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Invalid or missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('Supabase URL:', supabaseUrl);
    console.log('Service role key present:', !!supabaseKey);
    console.log('Service role key length:', supabaseKey?.length);
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration');
      return new Response(
        JSON.stringify({ error: 'Server configuration error - missing Supabase config' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    const token = authHeader.replace('Bearer ', '');
    console.log('Extracted token length:', token.length);
    console.log('Token prefix:', token.substring(0, 20) + '...');

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    console.log('Auth result - User found:', !!user);
    console.log('Auth result - User ID:', user?.id);
    console.log('Auth result - Error:', authError?.message);

    if (authError) {
      console.error('Supabase auth error:', authError);
      return new Response(
        JSON.stringify({ 
          error: 'Authentication failed', 
          details: authError.message,
          code: authError.name 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!user) {
      console.error('No user found after auth check');
      return new Response(
        JSON.stringify({ error: 'User not found - invalid token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('User authenticated successfully:', user.id);

    const requestBody = await req.json();
    const { action, code, name, description, owner, repo, files } = requestBody;
    console.log('Action requested:', action);
    console.log('Request body keys:', Object.keys(requestBody));

    const githubClientId = Deno.env.get('GITHUB_CLIENT_ID');
    const githubClientSecret = Deno.env.get('GITHUB_CLIENT_SECRET');

    console.log('GitHub Client ID:', githubClientId);
    console.log('GitHub Client Secret present:', !!githubClientSecret);
    console.log('GitHub Client Secret length:', githubClientSecret?.length);

    if (!githubClientId || !githubClientSecret) {
      console.error('GitHub OAuth credentials missing from Supabase secrets');
      console.error('Available env vars:', Object.keys(Deno.env.toObject()).filter(key => key.includes('GITHUB')));
      return new Response(
        JSON.stringify({ 
          error: 'GitHub OAuth credentials not configured in Supabase secrets',
          details: `Missing: ${!githubClientId ? 'GITHUB_CLIENT_ID ' : ''}${!githubClientSecret ? 'GITHUB_CLIENT_SECRET' : ''}`,
          availableSecrets: Object.keys(Deno.env.toObject()).filter(key => key.includes('GITHUB'))
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    switch (action) {
      case 'exchangeCode':
        console.log('=== Exchange Code Action ===');
        console.log('Code present:', !!code);
        console.log('Code length:', code?.length);
        
        if (!code) {
          throw new Error('No authorization code provided');
        }
        
        // Exchange authorization code for access token
        const tokenRequestBody = {
          client_id: githubClientId,
          client_secret: githubClientSecret,
          code: code,
        };

        console.log('Sending token request to GitHub...');
        console.log('Request body (redacted):', { 
          client_id: githubClientId, 
          client_secret: '[REDACTED]', 
          code: code.substring(0, 10) + '...' 
        });

        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'Portfolio-Creator-App/1.0',
          },
          body: JSON.stringify(tokenRequestBody),
        });

        console.log('GitHub token response status:', tokenResponse.status);
        console.log('GitHub token response ok:', tokenResponse.ok);

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          console.error('GitHub token exchange failed:', {
            status: tokenResponse.status,
            statusText: tokenResponse.statusText,
            body: errorText
          });
          throw new Error(`GitHub token exchange failed: ${tokenResponse.status} - ${errorText}`);
        }

        const responseText = await tokenResponse.text();
        console.log('GitHub raw response length:', responseText.length);
        console.log('GitHub raw response preview:', responseText.substring(0, 100));

        let githubTokenData: GitHubTokenResponse;
        try {
          githubTokenData = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse GitHub response:', parseError);
          console.error('Raw response:', responseText);
          throw new Error('Invalid JSON response from GitHub');
        }

        console.log('Parsed GitHub response:', { 
          hasAccessToken: !!githubTokenData.access_token,
          tokenType: githubTokenData.token_type,
          scope: githubTokenData.scope,
          error: githubTokenData.error 
        });

        if (githubTokenData.error) {
          console.error('GitHub OAuth error response:', {
            error: githubTokenData.error,
            description: githubTokenData.error_description
          });
          throw new Error(`GitHub OAuth error: ${githubTokenData.error} - ${githubTokenData.error_description || 'Unknown error'}`);
        }

        if (!githubTokenData.access_token) {
          console.error('No access token in GitHub response:', githubTokenData);
          throw new Error('No access token received from GitHub');
        }

        // Store the token for this user
        console.log('Storing GitHub token for user:', user.id);
        const { error: insertError } = await supabase
          .from('user_github_tokens')
          .upsert({
            user_id: user.id,
            access_token: githubTokenData.access_token,
            token_type: githubTokenData.token_type || 'bearer',
            scope: githubTokenData.scope || '',
          });

        if (insertError) {
          console.error('Error storing GitHub token in database:', insertError);
          throw new Error(`Failed to store GitHub token: ${insertError.message}`);
        }

        console.log('GitHub token stored successfully');
        return new Response(
          JSON.stringify({ success: true }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );

      case 'checkUserToken':
        console.log('=== Check User Token Action ===');
        const { data: tokenCheck, error: tokenError } = await supabase
          .from('user_github_tokens')
          .select('access_token')
          .eq('user_id', user.id)
          .single();

        console.log('Token check result:', { 
          hasToken: !tokenError && !!tokenCheck,
          error: tokenError?.message 
        });

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
        console.log(`=== ${action} Action ===`);
        // Get user's stored token
        const { data: userToken, error: tokenFetchError } = await supabase
          .from('user_github_tokens')
          .select('access_token')
          .eq('user_id', user.id)
          .single();

        if (tokenFetchError || !userToken) {
          console.error('GitHub token fetch error:', tokenFetchError);
          throw new Error('GitHub token not found. Please reconnect your account.');
        }

        console.log('Retrieved stored GitHub token for user:', user.id);

        const githubHeaders = {
          'Authorization': `token ${userToken.access_token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Portfolio-Creator-App/1.0',
        };

        if (action === 'getUser') {
          console.log('Fetching GitHub user info...');
          const userResponse = await fetch('https://api.github.com/user', {
            headers: githubHeaders,
          });

          if (!userResponse.ok) {
            const errorText = await userResponse.text();
            console.error('GitHub user fetch failed:', userResponse.status, errorText);
            throw new Error(`Failed to fetch GitHub user info: ${userResponse.status}`);
          }

          const userData = await userResponse.json();
          console.log('GitHub user fetched successfully:', userData.login);
          return new Response(
            JSON.stringify(userData),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        if (action === 'createRepository') {
          console.log('Creating GitHub repository:', name);
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
            console.error('GitHub repo creation failed:', createRepoResponse.status, errorData);
            throw new Error(`Failed to create repository: ${errorData.message || 'Unknown error'}`);
          }

          const repoData = await createRepoResponse.json();
          console.log('GitHub repository created successfully:', repoData.name);
          return new Response(
            JSON.stringify(repoData),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        if (action === 'uploadFiles') {
          console.log('Uploading files to repository:', repo, 'Files count:', files?.length);
          for (const file of files) {
            console.log('Uploading file:', file.path);
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
              console.error('File upload failed:', file.path, uploadResponse.status, errorData);
              throw new Error(`Failed to upload ${file.path}: ${errorData.message || 'Unknown error'}`);
            }
            console.log('File uploaded successfully:', file.path);
          }

          // Enable GitHub Pages after uploading files
          console.log('Setting up GitHub Pages...');
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
              console.warn('GitHub Pages setup failed but continuing:', pagesResponse.status);
            } else {
              console.log('GitHub Pages enabled successfully');
            }
          } catch (pagesError) {
            console.warn('GitHub Pages setup error (non-critical):', pagesError);
          }

          console.log('All files uploaded successfully');
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
        console.log('=== Disconnect Action ===');
        const { error: deleteError } = await supabase
          .from('user_github_tokens')
          .delete()
          .eq('user_id', user.id);

        if (deleteError) {
          console.error('Error disconnecting GitHub account:', deleteError);
          throw new Error(`Failed to disconnect account: ${deleteError.message}`);
        }

        console.log('GitHub account disconnected successfully');
        return new Response(
          JSON.stringify({ success: true }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );

      default:
        console.error('Invalid action requested:', action);
        return new Response(
          JSON.stringify({ error: `Invalid action: ${action}` }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }
  } catch (error) {
    console.error('=== GitHub OAuth Edge Function Error ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: 'Check Supabase Edge Function logs for detailed error information',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
