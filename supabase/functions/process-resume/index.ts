
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
  }

  recordSuccess(apiKey: string) {
    const keyPrefix = apiKey.substring(0, 10);
    this.failures.set(keyPrefix, 0);
    this.lastFailTime.delete(keyPrefix);
  }
}

const circuitBreaker = new CircuitBreaker();

// Enhanced retry mechanism with model selection
async function callGeminiWithRetry(apiKeys, requestBody, model = 'gemini-2.0-flash-001', maxRetries = 2) {
  let lastError = null;
  const availableKeys = apiKeys.filter(key => !circuitBreaker.isOpen(key));
  
  if (availableKeys.length === 0) {
    throw new Error('All API keys are temporarily unavailable');
  }

  for (const apiKey of availableKeys) {
    for(let attempt = 1; attempt <= maxRetries; attempt++){
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, 
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'Supabase-Edge-Function/1.0'
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal
          }
        );
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          circuitBreaker.recordSuccess(apiKey);
          return data;
        }
        
        const errorText = await response.text();
        
        if (response.status === 503) {
          lastError = new Error(`Service overloaded: ${errorText}`);
          circuitBreaker.recordFailure(apiKey);
          
          if (attempt < maxRetries) {
            const delay = Math.min(2000 * Math.pow(2, attempt), 10000);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          continue;
        }
        
        if (response.status === 429) {
          lastError = new Error(`Rate limit exceeded: ${errorText}`);
          circuitBreaker.recordFailure(apiKey);
          
          if (attempt < maxRetries) {
            const delay = Math.min(5000 * Math.pow(2, attempt), 30000);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          continue;
        }
        
        if (response.status === 400) {
          throw new Error(`Bad request: ${errorText}`);
        }
        
        if (response.status === 401 || response.status === 403) {
          throw new Error(`Authentication failed: ${errorText}`);
        }
        
        lastError = new Error(`API error: ${response.status} - ${errorText}`);
        circuitBreaker.recordFailure(apiKey);
        
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
      } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
          lastError = new Error('Request timed out');
          circuitBreaker.recordFailure(apiKey);
        } else if (error.message.includes('Authentication failed')) {
          break;
        } else {
          lastError = error;
          circuitBreaker.recordFailure(apiKey);
        }
        
        if (attempt < maxRetries && !error.message.includes('Authentication failed')) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
  }
  
  throw lastError || new Error('All API keys exhausted');
}

const handler = async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file) {
      return new Response(JSON.stringify({
        error: 'No file provided'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    // File validation
    const allowedTypes = ['application/pdf'];
    if (!allowedTypes.includes(file.type)) {
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
      return new Response(JSON.stringify({
        error: 'File too large',  
        details: `File size exceeds 2MB limit`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    const geminiApiKeys = getGeminiApiKeys();
    if (geminiApiKeys.length === 0) {
      throw new Error('No API keys available');
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64Data = arrayBufferToBase64(arrayBuffer);

    // Document validation using Flash-Lite model
    const validationPrompt = `
Analyze this PDF and determine if it's a resume/CV.

A resume typically contains:
- Personal/contact information
- Work experience or employment history
- Education background
- Skills section

Respond with ONLY:
- "VALID_RESUME" if it IS a resume
- "NOT_RESUME: [brief description]" if it is NOT a resume`;

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
        temperature: 0.1,
        maxOutputTokens: 50,
        topP: 0.9
      }
    };

    const validationData = await callGeminiWithRetry(
      geminiApiKeys, 
      validationRequestBody, 
      'gemini-2.0-flash-lite'
    );
    
    const validationText = validationData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!validationText) {
      throw new Error('No validation response received');
    }

    // Check if document is not a resume
    if (!validationText.includes('VALID_RESUME')) {
      const errorMessage = validationText.startsWith('NOT_RESUME:') 
        ? validationText.replace('NOT_RESUME:', '').trim()
        : 'This document does not appear to be a resume';

      return new Response(JSON.stringify({
        error: 'Invalid document type',
        type: 'NOT_RESUME',
        details: `${errorMessage}. Please upload a valid resume/CV.`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

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
      throw new Error(`JSON parsing failed: ${parseError.message}`);
    }
    
    return new Response(JSON.stringify({ portfolioData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
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

    return new Response(JSON.stringify(errorResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: statusCode
    });
  }
};

serve(handler);
