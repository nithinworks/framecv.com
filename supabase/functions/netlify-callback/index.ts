
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    console.log('Netlify callback received:', { 
      hasCode: !!code, 
      state, 
      error,
      fullUrl: req.url 
    });

    if (error) {
      console.error('OAuth error:', error);
      const redirectUrl = `${url.origin}/functions/v1/netlify-callback-complete#error=${encodeURIComponent(error)}`;
      return Response.redirect(redirectUrl, 302);
    }

    if (!code) {
      console.error('No authorization code received');
      const redirectUrl = `${url.origin}/functions/v1/netlify-callback-complete#error=${encodeURIComponent('No authorization code received')}`;
      return Response.redirect(redirectUrl, 302);
    }

    // Get environment variables
    const clientId = Deno.env.get('NETLIFY_CLIENT_ID');
    const clientSecret = Deno.env.get('NETLIFY_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      console.error('Missing environment variables');
      const redirectUrl = `${url.origin}/functions/v1/netlify-callback-complete#error=${encodeURIComponent('Missing configuration')}`;
      return Response.redirect(redirectUrl, 302);
    }

    const redirectUri = `${url.origin}/functions/v1/netlify-callback`;

    console.log('Exchanging authorization code for access token...');

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

    console.log('Token exchange response status:', tokenResponse.status);

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      const redirectUrl = `${url.origin}/functions/v1/netlify-callback-complete#error=${encodeURIComponent('Token exchange failed')}`;
      return Response.redirect(redirectUrl, 302);
    }

    const tokenData = await tokenResponse.json();
    console.log('Token exchange successful');

    if (!tokenData.access_token) {
      console.error('No access token in response');
      const redirectUrl = `${url.origin}/functions/v1/netlify-callback-complete#error=${encodeURIComponent('No access token received')}`;
      return Response.redirect(redirectUrl, 302);
    }

    // Redirect to success page with access token in hash
    const redirectUrl = `${url.origin}/functions/v1/netlify-callback-complete#access_token=${encodeURIComponent(tokenData.access_token)}&state=${encodeURIComponent(state || '')}`;
    console.log('Redirecting to success page');
    
    return Response.redirect(redirectUrl, 302);

  } catch (error) {
    console.error('Unexpected error in callback:', error);
    const url = new URL(req.url);
    const redirectUrl = `${url.origin}/functions/v1/netlify-callback-complete#error=${encodeURIComponent('Unexpected error occurred')}`;
    return Response.redirect(redirectUrl, 302);
  }
});
