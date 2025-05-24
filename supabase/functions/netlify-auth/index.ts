
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
    const clientId = Deno.env.get('NETLIFY_CLIENT_ID');
    
    if (!clientId) {
      throw new Error('Netlify client ID not configured');
    }

    // Generate a random state for security
    const state = crypto.randomUUID();
    
    // Netlify OAuth URL
    const authUrl = new URL('https://app.netlify.com/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', `${Deno.env.get('SUPABASE_URL')}/functions/v1/netlify-callback`);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('scope', 'deploy');

    console.log('Generated OAuth URL:', authUrl.toString());

    return new Response(
      JSON.stringify({ 
        authUrl: authUrl.toString(),
        state 
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );

  } catch (error) {
    console.error('Error in netlify-auth:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});
