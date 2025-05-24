
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
    const errorDescription = url.searchParams.get('error_description');

    console.log('Callback received with params:', { code: !!code, state, error, errorDescription });

    if (error) {
      console.error('OAuth error:', error, errorDescription);
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Authorization Error</title>
            <meta charset="UTF-8">
          </head>
          <body>
            <script>
              try {
                if (window.opener) {
                  window.opener.postMessage({ 
                    type: 'NETLIFY_AUTH_ERROR', 
                    error: '${error}: ${errorDescription || 'Unknown error'}' 
                  }, '*');
                }
              } catch (e) {
                console.error('Failed to send error message:', e);
              }
              window.close();
            </script>
            <div style="padding: 20px; font-family: Arial, sans-serif;">
              <h2>Authorization Error</h2>
              <p>Error: ${error}</p>
              <p>${errorDescription || 'Unknown error'}</p>
              <p>You can close this window.</p>
            </div>
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

    console.log('Exchanging code for token...');

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
      console.error('Token exchange failed:', tokenResponse.status, errorText);
      throw new Error(`Failed to exchange authorization code: ${tokenResponse.status} ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('Token exchange successful, access token received');

    // Return success page that posts message to parent window
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authorization Success</title>
          <meta charset="UTF-8">
        </head>
        <body>
          <script>
            try {
              console.log('Attempting to send success message to parent window');
              if (window.opener && !window.opener.closed) {
                window.opener.postMessage({ 
                  type: 'NETLIFY_AUTH_SUCCESS', 
                  accessToken: '${tokenData.access_token}',
                  state: '${state}'
                }, '*');
                console.log('Success message sent to parent window');
              } else {
                console.error('Parent window not available');
              }
            } catch (e) {
              console.error('Failed to send success message:', e);
            }
            
            // Auto-close after a short delay
            setTimeout(() => {
              try {
                window.close();
              } catch (e) {
                console.error('Failed to close window:', e);
              }
            }, 500);
          </script>
          <div style="padding: 20px; font-family: Arial, sans-serif; text-align: center;">
            <h2>✅ Authorization Successful!</h2>
            <p>Redirecting back to your application...</p>
            <p><small>If this window doesn't close automatically, you can close it manually.</small></p>
          </div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error) {
    console.error('Error in netlify-callback:', error);
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authorization Error</title>
          <meta charset="UTF-8">
        </head>
        <body>
          <script>
            try {
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'NETLIFY_AUTH_ERROR', 
                  error: '${error.message}' 
                }, '*');
              }
            } catch (e) {
              console.error('Failed to send error message:', e);
            }
            window.close();
          </script>
          <div style="padding: 20px; font-family: Arial, sans-serif;">
            <h2>Authorization Error</h2>
            <p>Error: ${error.message}</p>
            <p>You can close this window.</p>
          </div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
});
