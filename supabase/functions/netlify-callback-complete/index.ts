
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
        console.log('Callback complete page loaded');
        console.log('Current URL:', window.location.href);
        
        // Get data from URL fragment
        const fragment = window.location.hash.substring(1);
        console.log('URL fragment:', fragment);
        
        if (!fragment) {
          throw new Error('No data in URL fragment');
        }
        
        const params = new URLSearchParams(fragment);
        const accessToken = params.get('access_token');
        const state = params.get('state');
        const error = params.get('error');
        const errorDescription = params.get('error_description');

        console.log('Parsed params:', { 
          hasToken: !!accessToken, 
          state, 
          error,
          errorDescription
        });

        // Function to send message to parent
        function sendMessageToParent(data) {
          console.log('Attempting to send message:', data);
          
          // Try multiple methods to reach the parent
          const origins = ['*'];
          let messageSent = false;
          
          // Method 1: Try window.opener
          if (window.opener && !window.opener.closed) {
            try {
              origins.forEach(origin => {
                window.opener.postMessage(data, origin);
              });
              console.log('Message sent to opener');
              messageSent = true;
            } catch (e) {
              console.error('Failed to send to opener:', e);
            }
          }
          
          // Method 2: Try parent window
          if (window.parent && window.parent !== window) {
            try {
              origins.forEach(origin => {
                window.parent.postMessage(data, origin);
              });
              console.log('Message sent to parent');
              messageSent = true;
            } catch (e) {
              console.error('Failed to send to parent:', e);
            }
          }
          
          // Method 3: Try top window
          if (window.top && window.top !== window) {
            try {
              origins.forEach(origin => {
                window.top.postMessage(data, origin);
              });
              console.log('Message sent to top');
              messageSent = true;
            } catch (e) {
              console.error('Failed to send to top:', e);
            }
          }
          
          return messageSent;
        }

        // Send appropriate message
        let messageData;
        if (error) {
          messageData = {
            type: 'NETLIFY_AUTH_ERROR',
            error: error + (errorDescription ? ': ' + errorDescription : ''),
            timestamp: Date.now()
          };
        } else if (accessToken) {
          messageData = {
            type: 'NETLIFY_AUTH_SUCCESS',
            accessToken: accessToken,
            state: state,
            timestamp: Date.now()
          };
        } else {
          messageData = {
            type: 'NETLIFY_AUTH_ERROR',
            error: 'No access token received',
            timestamp: Date.now()
          };
        }

        const messageSent = sendMessageToParent(messageData);
        
        if (!messageSent) {
          console.error('Failed to send message to any parent window');
        }

        // Auto-close after a delay
        setTimeout(function() {
          try {
            console.log('Attempting to close window');
            window.close();
          } catch (e) {
            console.log('Could not auto-close window:', e);
          }
        }, 2000);

      } catch (e) {
        console.error('Error in callback complete page:', e);
        
        // Try to send error message
        try {
          const errorData = {
            type: 'NETLIFY_AUTH_ERROR',
            error: 'Failed to process authorization: ' + e.message,
            timestamp: Date.now()
          };
          
          if (window.opener) {
            window.opener.postMessage(errorData, '*');
          }
          if (window.parent && window.parent !== window) {
            window.parent.postMessage(errorData, '*');
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
