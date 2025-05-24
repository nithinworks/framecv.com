
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

    console.log('Callback received:', { 
      hasCode: !!code, 
      state, 
      error, 
      errorDescription,
      fullUrl: req.url 
    });

    // Handle OAuth error
    if (error) {
      console.error('OAuth error:', error, errorDescription);
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Authorization Error</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 50px; 
              background: #f5f5f5; 
            }
            .container { 
              background: white; 
              padding: 30px; 
              border-radius: 8px; 
              box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
              max-width: 400px; 
              margin: 0 auto; 
            }
            .error { color: #e74c3c; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2 class="error">❌ Authorization Failed</h2>
            <p>Error: ${error}</p>
            ${errorDescription ? `<p>${errorDescription}</p>` : ''}
            <p><small>This window will close automatically...</small></p>
          </div>
          <script>
            console.log('Sending error message to parent');
            try {
              if (window.opener && !window.opener.closed) {
                window.opener.postMessage({
                  type: 'NETLIFY_AUTH_ERROR',
                  error: '${error}',
                  description: '${errorDescription || ''}'
                }, '*');
                console.log('Error message sent to opener');
              } else if (window.parent && window.parent !== window) {
                window.parent.postMessage({
                  type: 'NETLIFY_AUTH_ERROR',
                  error: '${error}',
                  description: '${errorDescription || ''}'
                }, '*');
                console.log('Error message sent to parent');
              }
            } catch (e) {
              console.error('Failed to send message:', e);
            }
            
            setTimeout(() => {
              try {
                window.close();
              } catch (e) {
                console.log('Could not close window:', e);
              }
            }, 3000);
          </script>
        </body>
        </html>
      `, {
        headers: { 
          'Content-Type': 'text/html',
          ...corsHeaders 
        }
      });
    }

    // Check if authorization code is present
    if (!code) {
      console.error('No authorization code received');
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Authorization Error</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 50px; 
              background: #f5f5f5; 
            }
            .container { 
              background: white; 
              padding: 30px; 
              border-radius: 8px; 
              box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
              max-width: 400px; 
              margin: 0 auto; 
            }
            .error { color: #e74c3c; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2 class="error">❌ Authorization Failed</h2>
            <p>No authorization code received from Netlify</p>
            <p><small>This window will close automatically...</small></p>
          </div>
          <script>
            console.log('Sending no-code error to parent');
            try {
              if (window.opener && !window.opener.closed) {
                window.opener.postMessage({
                  type: 'NETLIFY_AUTH_ERROR',
                  error: 'No authorization code received'
                }, '*');
              } else if (window.parent && window.parent !== window) {
                window.parent.postMessage({
                  type: 'NETLIFY_AUTH_ERROR',
                  error: 'No authorization code received'
                }, '*');
              }
            } catch (e) {
              console.error('Failed to send message:', e);
            }
            
            setTimeout(() => {
              try {
                window.close();
              } catch (e) {
                console.log('Could not close window:', e);
              }
            }, 3000);
          </script>
        </body>
        </html>
      `, {
        headers: { 
          'Content-Type': 'text/html',
          ...corsHeaders 
        }
      });
    }

    console.log('Exchanging authorization code for access token...');

    // Get environment variables
    const clientId = Deno.env.get('NETLIFY_CLIENT_ID');
    const clientSecret = Deno.env.get('NETLIFY_CLIENT_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');

    if (!clientId || !clientSecret || !supabaseUrl) {
      console.error('Missing environment variables:', {
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret,
        hasSupabaseUrl: !!supabaseUrl
      });
      throw new Error('Missing required environment variables');
    }

    const redirectUri = `${supabaseUrl}/functions/v1/netlify-callback`;
    console.log('Using redirect URI:', redirectUri);

    // Exchange authorization code for access token
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
        redirect_uri: redirectUri
      }).toString()
    });

    console.log('Token response status:', tokenResponse.status);

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText
      });
      
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Authorization Error</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 50px; 
              background: #f5f5f5; 
            }
            .container { 
              background: white; 
              padding: 30px; 
              border-radius: 8px; 
              box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
              max-width: 400px; 
              margin: 0 auto; 
            }
            .error { color: #e74c3c; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2 class="error">❌ Token Exchange Failed</h2>
            <p>Failed to exchange authorization code for access token</p>
            <p><small>Status: ${tokenResponse.status}</small></p>
            <p><small>This window will close automatically...</small></p>
          </div>
          <script>
            console.log('Sending token exchange error to parent');
            try {
              if (window.opener && !window.opener.closed) {
                window.opener.postMessage({
                  type: 'NETLIFY_AUTH_ERROR',
                  error: 'Failed to exchange authorization code for access token'
                }, '*');
              } else if (window.parent && window.parent !== window) {
                window.parent.postMessage({
                  type: 'NETLIFY_AUTH_ERROR',
                  error: 'Failed to exchange authorization code for access token'
                }, '*');
              }
            } catch (e) {
              console.error('Failed to send message:', e);
            }
            
            setTimeout(() => {
              try {
                window.close();
              } catch (e) {
                console.log('Could not close window:', e);
              }
            }, 3000);
          </script>
        </body>
        </html>
      `, {
        headers: { 
          'Content-Type': 'text/html',
          ...corsHeaders 
        }
      });
    }

    const tokenData = await tokenResponse.json();
    console.log('Token exchange successful, received token data');

    if (!tokenData.access_token) {
      console.error('No access token in response:', Object.keys(tokenData));
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Authorization Error</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 50px; 
              background: #f5f5f5; 
            }
            .container { 
              background: white; 
              padding: 30px; 
              border-radius: 8px; 
              box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
              max-width: 400px; 
              margin: 0 auto; 
            }
            .error { color: #e74c3c; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2 class="error">❌ No Access Token</h2>
            <p>No access token received from Netlify</p>
            <p><small>This window will close automatically...</small></p>
          </div>
          <script>
            console.log('Sending no access token error to parent');
            try {
              if (window.opener && !window.opener.closed) {
                window.opener.postMessage({
                  type: 'NETLIFY_AUTH_ERROR',
                  error: 'No access token received from Netlify'
                }, '*');
              } else if (window.parent && window.parent !== window) {
                window.parent.postMessage({
                  type: 'NETLIFY_AUTH_ERROR',
                  error: 'No access token received from Netlify'
                }, '*');
              }
            } catch (e) {
              console.error('Failed to send message:', e);
            }
            
            setTimeout(() => {
              try {
                window.close();
              } catch (e) {
                console.log('Could not close window:', e);
              }
            }, 3000);
          </script>
        </body>
        </html>
      `, {
        headers: { 
          'Content-Type': 'text/html',
          ...corsHeaders 
        }
      });
    }

    console.log('Returning success page with access token');

    // Return success page that sends token to parent window
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authorization Success</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: #f5f5f5; 
          }
          .container { 
            background: white; 
            padding: 30px; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
            max-width: 400px; 
            margin: 0 auto; 
          }
          .success { color: #27ae60; }
          .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #27ae60;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2 class="success">✅ Authorization Successful!</h2>
          <div class="spinner"></div>
          <p>Processing your authorization...</p>
          <p><small>This window will close automatically...</small></p>
        </div>
        <script>
          console.log('OAuth success page loaded');
          console.log('Attempting to send success message to parent window');
          
          const accessToken = '${tokenData.access_token}';
          const messageData = {
            type: 'NETLIFY_AUTH_SUCCESS',
            accessToken: accessToken,
            state: '${state || ''}',
            timestamp: Date.now()
          };
          
          console.log('Prepared message data:', { 
            type: messageData.type, 
            hasToken: !!messageData.accessToken,
            tokenLength: messageData.accessToken.length,
            state: messageData.state 
          });
          
          let messageSent = false;
          
          function sendMessage() {
            try {
              // Try window.opener first (popup)
              if (window.opener && !window.opener.closed) {
                console.log('Sending message to window.opener');
                window.opener.postMessage(messageData, '*');
                messageSent = true;
                console.log('Message sent to opener successfully');
                return true;
              }
              
              // Try parent window (iframe)
              if (window.parent && window.parent !== window) {
                console.log('Sending message to window.parent');
                window.parent.postMessage(messageData, '*');
                messageSent = true;
                console.log('Message sent to parent successfully');
                return true;
              }
              
              // Try top window
              if (window.top && window.top !== window) {
                console.log('Sending message to window.top');
                window.top.postMessage(messageData, '*');
                messageSent = true;
                console.log('Message sent to top successfully');
                return true;
              }
              
              console.warn('No valid parent window found');
              return false;
            } catch (e) {
              console.error('Error sending message:', e);
              return false;
            }
          }
          
          // Send message immediately
          sendMessage();
          
          // Also try sending after a short delay in case the parent isn't ready
          setTimeout(() => {
            if (!messageSent) {
              console.log('Retrying message send after delay');
              sendMessage();
            }
          }, 500);
          
          // Close window after delay
          setTimeout(() => {
            console.log('Attempting to close window');
            try {
              window.close();
            } catch (e) {
              console.log('Could not close window automatically:', e);
            }
          }, 2000);
        </script>
      </body>
      </html>
    `, {
      headers: { 
        'Content-Type': 'text/html',
        ...corsHeaders 
      }
    });

  } catch (error) {
    console.error('Unexpected error in callback:', error);
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authorization Error</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: #f5f5f5; 
          }
          .container { 
            background: white; 
            padding: 30px; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
            max-width: 400px; 
            margin: 0 auto; 
          }
          .error { color: #e74c3c; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2 class="error">❌ Unexpected Error</h2>
          <p>An unexpected error occurred during authorization</p>
          <p><small>This window will close automatically...</small></p>
        </div>
        <script>
          console.log('Sending unexpected error to parent');
          try {
            const errorMessage = '${error instanceof Error ? error.message.replace(/'/g, "\\'") : 'Unknown error'}';
            if (window.opener && !window.opener.closed) {
              window.opener.postMessage({
                type: 'NETLIFY_AUTH_ERROR',
                error: errorMessage
              }, '*');
            } else if (window.parent && window.parent !== window) {
              window.parent.postMessage({
                type: 'NETLIFY_AUTH_ERROR',
                error: errorMessage
              }, '*');
            }
          } catch (e) {
            console.error('Failed to send error message:', e);
          }
          
          setTimeout(() => {
            try {
              window.close();
            } catch (e) {
              console.log('Could not close window:', e);
            }
          }, 3000);
        </script>
      </body>
      </html>
    `, {
      headers: { 
        'Content-Type': 'text/html',
        ...corsHeaders 
      }
    });
  }
});
