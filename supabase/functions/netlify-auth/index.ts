
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
    // Get environment variables
    const clientId = Deno.env.get('NETLIFY_CLIENT_ID');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    
    console.log('Environment check:', {
      hasClientId: !!clientId,
      hasSupabaseUrl: !!supabaseUrl,
      clientIdPrefix: clientId ? clientId.substring(0, 8) + '...' : 'missing'
    });
    
    if (!clientId) {
      throw new Error('NETLIFY_CLIENT_ID environment variable is not set');
    }
    
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL environment variable is not set');
    }

    const redirectUri = `${supabaseUrl}/functions/v1/netlify-callback`;
    console.log('Using redirect URI:', redirectUri);

    // Generate state parameter for security
    const state = crypto.randomUUID();
    console.log('Generated state:', state);
    
    // Construct Netlify OAuth URL
    const authUrl = new URL('https://app.netlify.com/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('state', state);

    const finalAuthUrl = authUrl.toString();
    console.log('Generated OAuth URL:', finalAuthUrl);

    return new Response(
      JSON.stringify({
        success: true,
        authUrl: finalAuthUrl,
        state: state
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
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
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
