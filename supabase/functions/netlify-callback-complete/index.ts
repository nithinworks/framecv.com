
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Callback complete page accessed');
  
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: *;">
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
        console.log('Hash:', window.location.hash);
        
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

        console.log('Parsed params:', { 
          hasToken: !!accessToken, 
          tokenLength: accessToken ? accessToken.length : 0,
          state, 
          error
        });

        // Function to send message to parent
        function sendMessageToParent(data) {
          console.log('Sending message to parent:', data);
          
          try {
            // Try window.opener first (popup)
            if (window.opener && !window.opener.closed) {
              window.opener.postMessage(data, '*');
              console.log('Message sent to opener');
              return true;
            }
            
            // Try parent window (iframe)
            if (window.parent && window.parent !== window) {
              window.parent.postMessage(data, '*');
              console.log('Message sent to parent');
              return true;
            }
            
            // Try top window
            if (window.top && window.top !== window) {
              window.top.postMessage(data, '*');
              console.log('Message sent to top');
              return true;
            }
            
            console.log('No valid parent window found');
            return false;
          } catch (e) {
            console.error('Error sending message:', e);
            return false;
          }
        }

        // Send appropriate message
        let messageData;
        if (error) {
          messageData = {
            type: 'NETLIFY_AUTH_ERROR',
            error: error,
            timestamp: Date.now()
          };
        } else if (accessToken && accessToken.length > 0) {
          messageData = {
            type: 'NETLIFY_AUTH_SUCCESS',
            accessToken: accessToken,
            state: state || '',
            timestamp: Date.now()
          };
        } else {
          messageData = {
            type: 'NETLIFY_AUTH_ERROR',
            error: 'No access token received in callback',
            timestamp: Date.now()
          };
        }

        console.log('Final message data:', messageData);
        const messageSent = sendMessageToParent(messageData);
        
        if (!messageSent) {
          console.error('Failed to send message to any parent window');
        } else {
          console.log('Message sent successfully');
        }

        // Auto-close after a delay
        setTimeout(function() {
          try {
            console.log('Attempting to close window');
            if (window.opener) {
              window.close();
            }
          } catch (e) {
            console.log('Could not auto-close window:', e);
          }
        }, 3000);

      } catch (e) {
        console.error('Error in callback complete page:', e);
        
        // Try to send error message
        const errorData = {
          type: 'NETLIFY_AUTH_ERROR',
          error: 'Failed to process authorization: ' + e.message,
          timestamp: Date.now()
        };
        
        try {
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage(errorData, '*');
          } else if (window.parent && window.parent !== window) {
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
      'Content-Type': 'text/html; charset=UTF-8',
      ...corsHeaders
    }
  });
});
