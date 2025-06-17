
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  // This function handles preflight requests for CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const redirectTo = url.searchParams.get("redirect_to");

  const GITHUB_OAUTH_CLIENT_ID = Deno.env.get("GITHUB_CLIENT_ID");
  const GITHUB_OAUTH_CLIENT_SECRET = Deno.env.get("GITHUB_CLIENT_SECRET");
  const SITE_URL = Deno.env.get("SITE_URL") || "https://framecv.com";
  
  const errorRedirectUrl = new URL(redirectTo || SITE_URL);
  errorRedirectUrl.searchParams.set("error", "github_oauth_failed");

  if (!code) {
    console.error("No authorization code received from GitHub");
    return Response.redirect(errorRedirectUrl.toString(), 302);
  }

  if (!GITHUB_OAUTH_CLIENT_ID || !GITHUB_OAUTH_CLIENT_SECRET) {
    console.error("GitHub OAuth credentials not configured");
    return Response.redirect(errorRedirectUrl.toString(), 302);
  }

  try {
    // Exchange the code for an access token
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: GITHUB_OAUTH_CLIENT_ID,
        client_secret: GITHUB_OAUTH_CLIENT_SECRET,
        code,
      }),
    });

    if (!response.ok) {
      console.error("Token exchange failed:", response.status, response.statusText);
      throw new Error("Token exchange failed");
    }

    const tokenData = await response.json();
    console.log("Token exchange response:", tokenData);

    if (!tokenData.access_token) {
      console.error("Access token not found in response:", tokenData);
      throw new Error("Access token not found in response");
    }

    // Redirect back to the frontend, passing the token in the URL hash
    const successRedirectUrl = new URL(redirectTo!);
    successRedirectUrl.hash = `github_token=${tokenData.access_token}`;
    
    return Response.redirect(successRedirectUrl.toString(), 302);

  } catch (error) {
    console.error("GitHub callback error:", error);
    return Response.redirect(errorRedirectUrl.toString(), 302);
  }
});
