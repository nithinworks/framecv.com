
import { corsHeaders } from '../_shared/cors.ts';

const NETLIFY_CLIENT_ID = 'Opkk5yL1Gax2qMd5d5xXIuPoCCTRKsI3MZyp4vdW9LE';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');

    console.log('Netlify OAuth request received');
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    console.log('Authorization code present:', !!code);
    console.log('Code preview:', code ? code.substring(0, 10) + '...' : 'none');

    if (!code) {
      console.error('No authorization code provided in URL params');
      return new Response(
        JSON.stringify({ 
          error: 'No authorization code provided',
          received_params: Object.fromEntries(url.searchParams.entries())
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const clientSecret = Deno.env.get('NETLIFY_CLIENT_SECRET');
    if (!clientSecret) {
      console.error('NETLIFY_CLIENT_SECRET not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Missing client secret' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Attempting token exchange with Netlify...');
    console.log('Using redirect URI: https://framecv.com/auth/netlify/callback');

    // Exchange authorization code for access token
    const tokenRequestBody = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: NETLIFY_CLIENT_ID,
      client_secret: clientSecret,
      redirect_uri: 'https://framecv.com/auth/netlify/callback'
    });

    console.log('Token request body (without secrets):', {
      grant_type: 'authorization_code',
      code: code.substring(0, 10) + '...',
      client_id: NETLIFY_CLIENT_ID,
      redirect_uri: 'https://framecv.com/auth/netlify/callback'
    });

    const tokenResponse = await fetch('https://api.netlify.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: tokenRequestBody,
    });

    console.log('Token response status:', tokenResponse.status);
    console.log('Token response headers:', Object.fromEntries(tokenResponse.headers.entries()));

    const responseText = await tokenResponse.text();
    console.log('Token response body:', responseText);

    if (!tokenResponse.ok) {
      console.error('Token exchange failed with status:', tokenResponse.status);
      console.error('Error response:', responseText);
      
      let errorDetails;
      try {
        errorDetails = JSON.parse(responseText);
      } catch {
        errorDetails = { message: responseText };
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to exchange authorization code',
          status: tokenResponse.status,
          details: errorDetails
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    let tokenData;
    try {
      tokenData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse token response:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid response from Netlify',
          details: 'Failed to parse JSON response'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Token exchange successful!');
    console.log('Token type:', tokenData.token_type);
    console.log('Access token received:', !!tokenData.access_token);

    if (!tokenData.access_token) {
      console.error('No access token in response:', tokenData);
      return new Response(
        JSON.stringify({ 
          error: 'No access token received',
          received_data: tokenData
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        access_token: tokenData.access_token,
        token_type: tokenData.token_type || 'Bearer',
        success: true
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Netlify OAuth error:', error);
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        type: error.name
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
