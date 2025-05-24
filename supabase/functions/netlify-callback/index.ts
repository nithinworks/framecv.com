
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
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      return new Response(`
        <html>
          <body>
            <script>
              window.opener.postMessage({ 
                type: 'NETLIFY_AUTH_ERROR', 
                error: '${error}' 
              }, '*');
              window.close();
            </script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    if (!code) {
      throw new Error('No authorization code received');
    }

    const clientId = Deno.env.get('NETLIFY_CLIENT_ID');
    const clientSecret = Deno.env.get('NETLIFY_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new Error('Netlify credentials not configured');
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://api.netlify.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: `${Deno.env.get('SUPABASE_URL')}/functions/v1/netlify-callback`
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      throw new Error('Failed to exchange authorization code');
    }

    const tokenData = await tokenResponse.json();
    console.log('Token exchange successful');

    // Return success page that posts message to parent window
    return new Response(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ 
              type: 'NETLIFY_AUTH_SUCCESS', 
              accessToken: '${tokenData.access_token}',
              state: '${state}'
            }, '*');
            window.close();
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error) {
    console.error('Error in netlify-callback:', error);
    return new Response(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ 
              type: 'NETLIFY_AUTH_ERROR', 
              error: '${error.message}' 
            }, '*');
            window.close();
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
});
