
// Enhanced CORS configuration with specific allowed origins
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://portfolio-builder-ai.netlify.app',
  'https://portfoliopilot.app',
  'https://www.portfoliopilot.app'
];

// Determine if origin is allowed
function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin);
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Will be overridden per request
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400', // 24 hours
};

// Enhanced CORS headers function that validates origins
export function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin');
  
  // For production, use specific allowed origins
  if (origin && isOriginAllowed(origin)) {
    return {
      ...corsHeaders,
      'Access-Control-Allow-Origin': origin,
    };
  }
  
  // For development or localhost, allow more permissive access
  if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    return {
      ...corsHeaders,
      'Access-Control-Allow-Origin': origin,
    };
  }
  
  // Default restrictive headers for unknown origins
  return {
    ...corsHeaders,
    'Access-Control-Allow-Origin': 'https://portfoliopilot.app',
  };
}

// Security headers to add to all responses
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'",
};
