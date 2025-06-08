
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Helper function for chunked base64 conversion
function arrayBufferToBase64(buffer) {
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
function getGeminiApiKeys() {
  const keys = [];
  const primaryKey = Deno.env.get('GEMINI_API_KEY');
  if (primaryKey) keys.push(primaryKey);
  
  for(let i = 2; i <= 5; i++){
    const key = Deno.env.get(`GEMINI_API_KEY_${i}`);
    if (key) keys.push(key);
  }
  
  console.log(`Found ${keys.length} Gemini API keys`);
  return keys;
}

// Circuit breaker for API key management
class CircuitBreaker {
  private failures = new Map<string, number>();
  private lastFailTime = new Map<string, number>();
  private readonly threshold = 3;
  private readonly timeout = 300000;

  isOpen(apiKey: string): boolean {
    const keyPrefix = apiKey.substring(0, 10);
    const failures = this.failures.get(keyPrefix) || 0;
    const lastFail = this.lastFailTime.get(keyPrefix) || 0;
    
    if (failures >= this.threshold) {
      if (Date.now() - lastFail < this.timeout) {
        console.log(`Circuit breaker OPEN for key ${keyPrefix}`);
        return true;
      }
      this.failures.set(keyPrefix, 0);
      this.lastFailTime.delete(keyPrefix);
    }
    return false;
  }

  recordFailure(apiKey: string) {
    const keyPrefix = apiKey.substring(0, 10);
    const current = this.failures.get(keyPrefix) || 0;
    this.failures.set(keyPrefix, current + 1);
    this.lastFailTime.set(keyPrefix, Date.now());
    console.log(`Circuit breaker recorded failure for key ${keyPrefix}, total: ${current + 1}`);
  }

  recordSuccess(apiKey: string) {
    const keyPrefix = apiKey.substring(0, 10);
    this.failures.set(keyPrefix, 0);
    this.lastFailTime.delete(keyPrefix);
    console.log(`Circuit breaker recorded success for key ${keyPrefix}`);
  }
}

const circuitBreaker = new CircuitBreaker();

// Enhanced retry mechanism with model selection
async function callGeminiWithRetry(apiKeys, requestBody, model = 'gemini-2.0-flash-001', maxRetries = 2) {
  console.log(`=== CALLING GEMINI API ===`);
  console.log(`Model: ${model}`);
  console.log(`Available keys: ${apiKeys.length}`);
  console.log(`Request body size: ${JSON.stringify(requestBody).length} chars`);
  
  let lastError = null;
  const availableKeys = apiKeys.filter(key => !circuitBreaker.isOpen(key));
  
  console.log(`Available keys after circuit breaker filter: ${availableKeys.length}`);
  
  if (availableKeys.length === 0) {
    console.log('ERROR: All API keys are temporarily unavailable');
    throw new Error('All API keys are temporarily unavailable');
  }

  for (const apiKey of availableKeys) {
    const keyPrefix = apiKey.substring(0, 10);
    console.log(`Trying API key: ${keyPrefix}...`);
    
    for(let attempt = 1; attempt <= maxRetries; attempt++){
      console.log(`Attempt ${attempt}/${maxRetries} with key ${keyPrefix}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('Request timeout triggered');
        controller.abort();
      }, 30000);
      
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        console.log(`Making request to: ${url.replace(apiKey, '[HIDDEN]')}`);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Supabase-Edge-Function/1.0'
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log(`Response status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('SUCCESS: API call completed');
          console.log('Response candidates:', data.candidates?.length || 0);
          circuitBreaker.recordSuccess(apiKey);
          return data;
        }
        
        const errorText = await response.text();
        console.log(`API Error ${response.status}: ${errorText}`);
        
        if (response.status === 503) {
          lastError = new Error(`Service overloaded: ${errorText}`);
          circuitBreaker.recordFailure(apiKey);
          
          if (attempt < maxRetries) {
            const delay = Math.min(2000 * Math.pow(2, attempt), 10000);
            console.log(`Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          continue;
        }
        
        if (response.status === 429) {
          lastError = new Error(`Rate limit exceeded: ${errorText}`);
          circuitBreaker.recordFailure(apiKey);
          
          if (attempt < maxRetries) {
            const delay = Math.min(5000 * Math.pow(2, attempt), 30000);
            console.log(`Rate limited, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          continue;
        }
        
        if (response.status === 400) {
          console.log('Bad request error, not retrying');
          throw new Error(`Bad request: ${errorText}`);
        }
        
        if (response.status === 401 || response.status === 403) {
          console.log('Authentication error, not retrying');
          throw new Error(`Authentication failed: ${errorText}`);
        }
        
        lastError = new Error(`API error: ${response.status} - ${errorText}`);
        circuitBreaker.recordFailure(apiKey);
        
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
      } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
          console.log('Request timed out');
          lastError = new Error('Request timed out');
          circuitBreaker.recordFailure(apiKey);
        } else if (error.message.includes('Authentication failed')) {
          console.log('Authentication failed, breaking key loop');
          break;
        } else {
          console.log('Network or other error:', error.message);
          lastError = error;
          circuitBreaker.recordFailure(apiKey);
        }
        
        if (attempt < maxRetries && !error.message.includes('Authentication failed')) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
  }
  
  console.log('ERROR: All API keys exhausted');
  throw lastError || new Error('All API keys exhausted');
}

const handler = async (req) => {
  console.log('=== PROCESS-RESUME FUNCTION STARTED ===');
  console.log(`Request method: ${req.method}`);
  console.log(`Request URL: ${req.url}`);
  
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Parsing form data...');
    const formData = await req.formData();
    const file = formData.get('file');
    
    console.log('File info:', {
      exists: !!file,
      name: file?.name,
      size: file?.size,
      type: file?.type
    });
    
    if (!file) {
      console.log('ERROR: No file provided');
      return new Response(JSON.stringify({
        error: 'No file provided'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    // File validation
    console.log('Validating file...');
    const allowedTypes = ['application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      console.log(`ERROR: Invalid file type: ${file.type}`);
      return new Response(JSON.stringify({
        error: 'Invalid file type',
        details: 'Only PDF files are allowed'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      console.log(`ERROR: File too large: ${file.size} bytes`);
      return new Response(JSON.stringify({
        error: 'File too large',  
        details: `File size exceeds 2MB limit`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    console.log('Getting Gemini API keys...');
    const geminiApiKeys = getGeminiApiKeys();
    if (geminiApiKeys.length === 0) {
      console.log('ERROR: No API keys available');
      throw new Error('No API keys available');
    }

    console.log('Converting file to base64...');
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = arrayBufferToBase64(arrayBuffer);
    console.log(`Base64 data length: ${base64Data.length} chars`);

    // Document validation using Flash-Lite model with improved prompt
    console.log('=== STARTING DOCUMENT VALIDATION ===');
    const validationPrompt = `
You are a document classifier. Analyze this PDF document and determine if it is a resume/CV.

A resume/CV typically contains:
- Personal information (name, contact details)
- Work experience or employment history
- Education background
- Skills section
- Professional summary or objective

Other types of documents include:
- Forms (application forms, registration forms, bank forms)
- Reports (financial reports, project reports)
- Letters (cover letters, recommendation letters)
- Certificates or diplomas
- Invoices or receipts

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

    console.log('Calling Gemini for document validation...');
    const validationData = await callGeminiWithRetry(
      geminiApiKeys, 
      validationRequestBody, 
      'gemini-2.0-flash-lite'
    );
    
    const validationText = validationData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    console.log('Raw validation result:', validationText);
    
    if (!validationText) {
      console.log('ERROR: No validation response received');
      throw new Error('No validation response received');
    }

    // Check if document is not a resume
    if (validationText !== 'VALID_RESUME') {
      console.log('Document validation failed - not a resume');
      return new Response(JSON.stringify({
        error: 'Invalid document type',
        type: 'NOT_RESUME',
        details: 'This document does not appear to be a resume/CV. Please upload a valid resume in PDF format.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    console.log('Document validation passed, proceeding to portfolio generation');

    // Portfolio generation using Flash model
    console.log('=== STARTING PORTFOLIO GENERATION ===');
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
    "copyright": "© 2024 [Name]. All rights reserved."
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

    console.log('Calling Gemini for portfolio generation...');
    const geminiData = await callGeminiWithRetry(
      geminiApiKeys, 
      portfolioRequestBody, 
      'gemini-2.0-flash-001'
    );

    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('Portfolio generation completed');
    console.log('Generated text length:', generatedText?.length || 0);
    
    if (!generatedText) {
      console.log('ERROR: No content generated');
      throw new Error('No content generated');
    }

    // Parse and validate JSON
    console.log('Parsing generated JSON...');
    let portfolioData;
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.log('ERROR: No JSON found in response');
        throw new Error('No JSON found in response');
      }
      
      portfolioData = JSON.parse(jsonMatch[0]);
      
      if (!portfolioData.settings || !portfolioData.sections) {
        console.log('ERROR: Invalid portfolio structure');
        throw new Error('Invalid portfolio structure');
      }
      
      console.log('SUCCESS: Portfolio data parsed and validated');
      
    } catch (parseError) {
      console.log('JSON parsing error:', parseError.message);
      throw new Error(`JSON parsing failed: ${parseError.message}`);
    }
    
    console.log('=== FUNCTION COMPLETED SUCCESSFULLY ===');
    return new Response(JSON.stringify({ portfolioData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.log('=== FUNCTION ERROR ===');
    console.log('Error name:', error.name);
    console.log('Error message:', error.message);
    console.log('Error stack:', error.stack);
    
    let statusCode = 500;
    let errorType = 'INTERNAL_ERROR';
    
    if (error.message.includes('No file') || 
        error.message.includes('Invalid file') || 
        error.message.includes('File too large')) {
      statusCode = 400;
      errorType = 'VALIDATION_ERROR';
    } else if (error.message.includes('Authentication failed')) {
      statusCode = 401;  
      errorType = 'AUTH_ERROR';
    } else if (error.message.includes('overloaded') || 
               error.message.includes('503')) {
      statusCode = 503;
      errorType = 'SERVICE_OVERLOADED';
    } else if (error.message.includes('rate limit') || 
               error.message.includes('429')) {
      statusCode = 429;
      errorType = 'RATE_LIMITED';
    }

    const errorResponse = {
      error: 'Failed to process resume',
      type: errorType,
      details: error.message,
      timestamp: new Date().toISOString()
    };

    console.log('Returning error response:', errorResponse);
    
    return new Response(JSON.stringify(errorResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: statusCode
    });
  }
};

serve(handler);
