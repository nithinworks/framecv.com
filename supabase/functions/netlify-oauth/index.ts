
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
    console.log('Authorization code present:', !!code);

    if (!code) {
      console.error('No authorization code provided');
      return new Response(
        JSON.stringify({ error: 'No authorization code provided' }),
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
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Attempting token exchange with Netlify...');

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://api.netlify.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: NETLIFY_CLIENT_ID,
        client_secret: clientSecret,
        redirect_uri: 'https://framecv.com/auth/netlify/callback'
      }),
    });

    console.log('Token response status:', tokenResponse.status);

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to exchange authorization code',
          details: errorText 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const tokenData = await tokenResponse.json();
    console.log('Token exchange successful, token type:', tokenData.token_type);

    return new Response(
      JSON.stringify({ 
        access_token: tokenData.access_token,
        token_type: tokenData.token_type 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Netlify OAuth error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
