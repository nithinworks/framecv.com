
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

  // Return a simple HTML page that communicates with the parent window
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Authorization Complete</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .container {
      text-align: center;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      padding: 2rem;
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .spinner {
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top: 3px solid white;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <h2>Processing Authorization...</h2>
    <p>Please wait while we complete the authorization process.</p>
  </div>

  <script>
    (function() {
      try {
        // Get data from URL fragment
        const fragment = window.location.hash.substring(1);
        const params = new URLSearchParams(fragment);
        
        const accessToken = params.get('access_token');
        const state = params.get('state');
        const error = params.get('error');
        const errorDescription = params.get('error_description');

        console.log('Callback complete page loaded with:', { 
          hasToken: !!accessToken, 
          state, 
          error 
        });

        // Function to send message to parent
        function sendMessageToParent(data) {
          try {
            if (window.opener && !window.opener.closed) {
              window.opener.postMessage(data, '*');
              console.log('Message sent to opener:', data);
              return true;
            }
            
            // Fallback: try parent window
            if (window.parent && window.parent !== window) {
              window.parent.postMessage(data, '*');
              console.log('Message sent to parent:', data);
              return true;
            }
            
            console.error('No parent window available');
            return false;
          } catch (e) {
            console.error('Failed to send message:', e);
            return false;
          }
        }

        // Send appropriate message
        if (error) {
          sendMessageToParent({
            type: 'NETLIFY_AUTH_ERROR',
            error: error + (errorDescription ? ': ' + errorDescription : '')
          });
        } else if (accessToken) {
          sendMessageToParent({
            type: 'NETLIFY_AUTH_SUCCESS',
            accessToken: accessToken,
            state: state
          });
        } else {
          sendMessageToParent({
            type: 'NETLIFY_AUTH_ERROR',
            error: 'No access token received'
          });
        }

        // Auto-close after a delay
        setTimeout(function() {
          try {
            window.close();
          } catch (e) {
            console.log('Could not auto-close window');
          }
        }, 1000);

      } catch (e) {
        console.error('Error in callback complete page:', e);
        try {
          if (window.opener) {
            window.opener.postMessage({
              type: 'NETLIFY_AUTH_ERROR',
              error: 'Failed to process authorization: ' + e.message
            }, '*');
          }
        } catch (msgError) {
          console.error('Failed to send error message:', msgError);
        }
      }
    })();
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
      ...corsHeaders
    }
  });
});
