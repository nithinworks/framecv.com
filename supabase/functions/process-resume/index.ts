
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Simple in-memory store for rate limiting (resets on function restart)
const ipRequestCounts = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_PER_DAY = 5;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

// Enhanced logging function
function logRequest(ip: string, status: string, details: any = {}) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] IP: ${ip} | Status: ${status} | Details:`, JSON.stringify(details));
}

// IP-based rate limiting
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = ipRequestCounts.get(ip);
  
  if (!record || (now - record.lastReset) > DAY_IN_MS) {
    // Reset or create new record
    ipRequestCounts.set(ip, { count: 1, lastReset: now });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_PER_DAY) {
    return false;
  }
  
  record.count++;
  return true;
}

// Get client IP from headers
function getClientIP(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
         req.headers.get('x-real-ip') || 
         req.headers.get('cf-connecting-ip') || 
         'unknown';
}

// Check if resume processing is enabled via feature flags
async function checkFeatureFlag(supabase: any): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('feature_flags')
      .select('process_resume_status')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error checking feature flag:', error);
      return false; // Default to disabled if we can't check
    }

    return data?.process_resume_status || false;
  } catch (error) {
    console.error('Feature flag check error:', error);
    return false; // Default to disabled if we can't check
  }
}

// Improved PDF validation with efficient page counting
async function validatePDF(file: File, ip: string): Promise<{ valid: boolean; error?: string }> {
  try {
    // Basic file checks
    if (file.type !== "application/pdf") {
      logRequest(ip, "INVALID_FILE_TYPE", { fileType: file.type, fileName: file.name });
      return { valid: false, error: "File must be a PDF" };
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      logRequest(ip, "FILE_TOO_LARGE", { fileSize: file.size, fileName: file.name });
      return { valid: false, error: "File size must be under 2MB" };
    }

    if (file.size < 1000) { // Less than 1KB is suspicious
      logRequest(ip, "FILE_TOO_SMALL", { fileSize: file.size, fileName: file.name });
      return { valid: false, error: "File appears to be corrupted or empty" };
    }

    // Read file content for validation
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Check PDF header
    const pdfHeader = String.fromCharCode(...uint8Array.slice(0, 4));
    if (pdfHeader !== "%PDF") {
      logRequest(ip, "INVALID_PDF_HEADER", { fileName: file.name });
      return { valid: false, error: "Invalid PDF file format" };
    }

    // Efficient page counting using binary search for PDF objects
    let pageCount = 0;
    
    try {
      // Convert only necessary parts to string for analysis
      // Look for the most reliable page count indicators
      const searchLength = Math.min(uint8Array.length, 50000); // Only search first 50KB
      const headerContent = String.fromCharCode(...uint8Array.slice(0, searchLength));
      
      // Look for /Type /Catalog which contains page count
      const catalogMatch = headerContent.match(/\/Type\s*\/Catalog[^}]*\/Pages\s*\d+\s*\d+\s*R/);
      if (catalogMatch) {
        // Find the referenced pages object
        const pagesRefMatch = catalogMatch[0].match(/\/Pages\s*(\d+)\s*\d+\s*R/);
        if (pagesRefMatch) {
          const pagesObjNum = pagesRefMatch[1];
          // Look for the pages object definition
          const pagesObjRegex = new RegExp(`${pagesObjNum}\\s*\\d+\\s*obj[^]*?\\/Count\\s*(\\d+)`);
          const pagesObjMatch = headerContent.match(pagesObjRegex);
          if (pagesObjMatch) {
            pageCount = parseInt(pagesObjMatch[1]);
          }
        }
      }
      
      // Fallback: count page objects directly (but limit search)
      if (pageCount === 0) {
        const pageMatches = headerContent.match(/\/Type\s*\/Page[^s]/g);
        pageCount = pageMatches ? pageMatches.length : 0;
      }
      
      // Additional fallback: look for /Count entries
      if (pageCount === 0) {
        const countMatches = headerContent.match(/\/Count\s+(\d+)/g);
        if (countMatches && countMatches.length > 0) {
          // Get the highest count value found
          pageCount = Math.max(...countMatches.map(match => {
            const countMatch = match.match(/\/Count\s+(\d+)/);
            return countMatch ? parseInt(countMatch[1]) : 0;
          }));
        }
      }

    } catch (conversionError) {
      logRequest(ip, "PDF_PARSING_ERROR", { 
        error: conversionError.message, 
        fileName: file.name,
        fileSize: file.size 
      });
      // If we can't parse the PDF structure reliably, reject it as potentially problematic
      return { valid: false, error: "PDF structure could not be validated" };
    }

    // Log the analysis results
    if (pageCount === 0) {
      logRequest(ip, "PAGE_COUNT_UNDETERMINED", { 
        fileName: file.name, 
        fileSize: file.size,
        note: "Could not determine page count - will proceed with caution"
      });
      // For files where we can't determine page count, we'll allow processing
      // but the AI validation step will catch non-resume documents
    } else if (pageCount > 1) {
      logRequest(ip, "MULTI_PAGE_PDF_DETECTED", { 
        fileName: file.name, 
        pageCount,
        fileSize: file.size 
      });
      return { valid: false, error: "Only single-page PDF resumes are supported" };
    } else {
      logRequest(ip, "SINGLE_PAGE_PDF_VALIDATED", { 
        fileName: file.name, 
        pageCount,
        fileSize: file.size 
      });
    }

    logRequest(ip, "FILE_VALIDATED", { 
      fileName: file.name, 
      fileSize: file.size, 
      pageCount: pageCount || "undetermined" 
    });
    return { valid: true };

  } catch (error) {
    logRequest(ip, "VALIDATION_ERROR", { 
      error: error.message, 
      fileName: file.name,
      fileSize: file.size 
    });
    return { valid: false, error: "Failed to validate PDF file" };
  }
}

// Helper function for chunked base64 conversion
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let result = '';
  for(let i = 0; i < bytes.length; i += chunkSize){
    const chunk = bytes.slice(i, i + chunkSize);
    result += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(result);
}

// Get all available Gemini API keys
function getGeminiApiKeys(): string[] {
  const keys = [];
  const primaryKey = Deno.env.get('GEMINI_API_KEY');
  if (primaryKey) keys.push(primaryKey);
  
  for(let i = 2; i <= 5; i++){
    const key = Deno.env.get(`GEMINI_API_KEY_${i}`);
    if (key) keys.push(key);
  }
  
  return keys;
}

// Enhanced retry mechanism with model selection
async function callGeminiWithRetry(apiKeys: string[], requestBody: any, model = 'gemini-2.0-flash-001') {
  let lastError = null;
  
  for (const apiKey of apiKeys) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Supabase-Edge-Function/1.0'
        },
        body: JSON.stringify(requestBody),
      });
      
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      
      const errorText = await response.text();
      lastError = new Error(`API error: ${response.status} - ${errorText}`);
      
    } catch (error) {
      lastError = error;
    }
  }
  
  throw lastError || new Error('All API keys exhausted');
}

const handler = async (req: Request) => {
  // Get client IP
  const clientIP = getClientIP(req);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client for feature flag checking
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if resume processing feature is enabled
    const isFeatureEnabled = await checkFeatureFlag(supabase);
    if (!isFeatureEnabled) {
      logRequest(clientIP, "FEATURE_DISABLED");
      return new Response(JSON.stringify({
        error: 'Feature temporarily unavailable',
        message: 'Resume processing is currently disabled. Please try again later.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 503
      });
    }

    // Rate limiting check
    if (!checkRateLimit(clientIP)) {
      logRequest(clientIP, "RATE_LIMITED", { limit: RATE_LIMIT_PER_DAY });
      return new Response(JSON.stringify({
        error: 'Rate limit exceeded',
        message: `Maximum ${RATE_LIMIT_PER_DAY} requests per day allowed. Please try again tomorrow.`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 429
      });
    }

    logRequest(clientIP, "REQUEST_STARTED");

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      logRequest(clientIP, "NO_FILE_PROVIDED");
      return new Response(JSON.stringify({
        error: 'No file provided'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    // Enhanced file validation
    const validation = await validatePDF(file, clientIP);
    if (!validation.valid) {
      return new Response(JSON.stringify({
        error: validation.error
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    const geminiApiKeys = getGeminiApiKeys();
    if (geminiApiKeys.length === 0) {
      logRequest(clientIP, "NO_API_KEYS");
      throw new Error('No API keys available');
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64Data = arrayBufferToBase64(arrayBuffer);

    logRequest(clientIP, "STARTING_AI_VALIDATION");

    // Document validation using Flash-Lite model
    const validationPrompt = `
You are a document classifier. Analyze this PDF document and determine if it is a resume/CV.

A resume/CV typically contains:
- Personal information (name, contact details)
- Work experience or employment history
- Education background
- Skills section
- Professional summary or objective

Respond with EXACTLY one of these options:
1. "VALID_RESUME" - if this is clearly a resume or CV
2. "NOT_RESUME" - if this is any other type of document

Be very strict - only respond with "VALID_RESUME" if you are confident this is actually a resume/CV.`;

    const validationRequestBody = {
      contents: [{
        parts: [
          { text: validationPrompt },
          { 
            inline_data: {
              mime_type: file.type,
              data: base64Data
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 20,
        topP: 1.0
      }
    };

    const validationData = await callGeminiWithRetry(
      geminiApiKeys, 
      validationRequestBody, 
      'gemini-2.0-flash-lite'
    );
    
    const validationText = validationData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (!validationText || validationText !== 'VALID_RESUME') {
      logRequest(clientIP, "INVALID_DOCUMENT", { validationResult: validationText });
      throw new Error('Document is not a valid resume/CV');
    }

    logRequest(clientIP, "STARTING_PORTFOLIO_GENERATION");

    // Portfolio generation using Flash model
    const portfolioPrompt = `
Extract information from this resume PDF and create a professional portfolio JSON.

GUIDELINES:
- Location: Country name only
- Summary: 15-20 words describing professional profile
- About: 3-4 sentences professional story
- Profile image: Female names use "https://media.istockphoto.com/id/1398385392/photo/happy-young-millennial-indian-business-woman-head-shot-portrait.jpg?s=612x612&w=0&k=20&c=QSRWD4KI7JCRJGdMKAhfUBv3Fc2v-7Nvu04iRMAPhGU=", male use "https://t4.ftcdn.net/jpg/04/31/64/75/360_F_431647519_usrbQ8Z983hTYe8zgA7t1XVc5fEtqcpa.jpg"

Return ONLY valid JSON:
{
  "settings": {
    "name": "Full Name",
    "title": "Professional Title", 
    "location": "Country only",
    "summary": "15-20 word summary",
    "profileImage": "Gender-appropriate URL",
    "primaryColor": "#0067c7"
  },
  "sections": {
    "hero": {
      "enabled": true,
      "ctaButtons": [
        {"text": "Contact Me", "url": "mailto:email", "isPrimary": true, "icon": "mail"},
        {"text": "Download Resume", "url": "#", "isPrimary": false, "icon": "download"}
      ]
    },
    "about": {
      "enabled": true,
      "title": "About Me", 
      "content": "Professional story",
      "skills": {"enabled": true, "title": "Skills", "items": ["skill1", "skill2"]}
    },
    "experience": {
      "enabled": true,
      "title": "Experience",
      "items": [{"company": "Company", "position": "Position", "period": "MM/YYYY - Present", "description": "Description"}]
    },
    "projects": {
      "enabled": true,
      "title": "Projects", 
      "items": [{"title": "Project", "description": "Description", "tags": ["tech"], "previewUrl": "#"}]
    },
    "education": {
      "enabled": true, 
      "title": "Education",
      "items": [{"institution": "School", "degree": "Degree", "period": "YYYY - YYYY"}]
    },
    "contact": {
      "enabled": true,
      "title": "Contact",
      "email": "email@example.com",
      "phone": "phone if available", 
      "location": "Country only"
    },
    "social": {
      "enabled": true,
      "items": [{"platform": "LinkedIn", "url": "#", "icon": "globe"}]
    }
  },
  "navigation": {
    "items": [
      {"name": "Home", "url": "#hero"},
      {"name": "About", "url": "#about"}, 
      {"name": "Experience", "url": "#experience"},
      {"name": "Projects", "url": "#projects"},
      {"name": "Education", "url": "#education"},
      {"name": "Contact", "url": "#contact"}
    ]
  },
  "footer": {
    "enabled": true,
    "copyright": "© 2025 [Name]. All rights reserved."
  }
}`;

    const portfolioRequestBody = {
      contents: [{
        parts: [
          { text: portfolioPrompt },
          { 
            inline_data: {
              mime_type: file.type,
              data: base64Data
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 3000,
        topP: 0.9
      }
    };

    const geminiData = await callGeminiWithRetry(
      geminiApiKeys, 
      portfolioRequestBody, 
      'gemini-2.0-flash-001'
    );

    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('No content generated');
    }

    // Parse and validate JSON
    let portfolioData;
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      portfolioData = JSON.parse(jsonMatch[0]);
      
      if (!portfolioData.settings || !portfolioData.sections) {
        throw new Error('Invalid portfolio structure');
      }
      
    } catch (parseError) {
      logRequest(clientIP, "JSON_PARSE_ERROR", { error: parseError.message });
      throw new Error(`JSON parsing failed: ${parseError.message}`);
    }
    
    // Track successful resume portfolio creation
    try {
      await supabase.rpc('increment_portfolio_stat', { stat_type: 'resume' });
      logRequest(clientIP, "PORTFOLIO_STAT_TRACKED");
    } catch (statError) {
      // Don't fail the request if stat tracking fails
      logRequest(clientIP, "PORTFOLIO_STAT_ERROR", { error: statError.message });
    }
    
    logRequest(clientIP, "SUCCESS", { 
      fileName: file.name, 
      fileSize: file.size,
      processingTime: "completed"
    });
    
    return new Response(JSON.stringify({ portfolioData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    logRequest(clientIP, "ERROR", { error: error.message });
    return new Response(JSON.stringify({
      error: 'Failed to process resume',
      details: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
};

serve(handler);
