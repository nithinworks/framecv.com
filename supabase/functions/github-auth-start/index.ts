
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (_req) => {
  // This function handles preflight requests for CORS
  if (_req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  const GITHUB_OAUTH_CLIENT_ID = Deno.env.get("GITHUB_CLIENT_ID");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SITE_URL = Deno.env.get("SITE_URL") || "https://framecv.com";

  if (!GITHUB_OAUTH_CLIENT_ID) {
    return new Response(
      JSON.stringify({ error: "GitHub OAuth Client ID not configured" }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }

  // The URL in your frontend that the user should be redirected back to.
  // The token will be added to this URL's hash.
  const redirectUri = `${SITE_URL}/builder`; 

  // Construct the callback URL to the other function
  const callbackUrl = `${SUPABASE_URL}/functions/v1/github-auth-callback?redirect_to=${encodeURIComponent(redirectUri)}`;

  // Redirect the user to the GitHub authorization page
  const authorizationUrl = new URL("https://github.com/login/oauth/authorize");
  authorizationUrl.searchParams.set("client_id", GITHUB_OAUTH_CLIENT_ID);
  authorizationUrl.searchParams.set("redirect_uri", callbackUrl);
  authorizationUrl.searchParams.set("scope", "repo,user"); // Request permissions
  authorizationUrl.searchParams.set("state", crypto.randomUUID()); // For security

  return Response.redirect(authorizationUrl.toString(), 302);
});
