
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Helper function for chunked base64 conversion to prevent stack overflow
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000; // 32KB chunks
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
  // Primary key
  const primaryKey = Deno.env.get('GEMINI_API_KEY');
  if (primaryKey) keys.push(primaryKey);
  
  // Secondary keys (GEMINI_API_KEY_2, GEMINI_API_KEY_3, etc.)
  for(let i = 2; i <= 5; i++){
    const key = Deno.env.get(`GEMINI_API_KEY_${i}`);
    if (key) keys.push(key);
  }
  return keys;
}

// Circuit breaker to prevent cascading failures
class CircuitBreaker {
  private failures = new Map<string, number>();
  private lastFailTime = new Map<string, number>();
  private readonly threshold = 3;
  private readonly timeout = 300000; // 5 minutes

  isOpen(apiKey: string): boolean {
    const keyPrefix = apiKey.substring(0, 10);
    const failures = this.failures.get(keyPrefix) || 0;
    const lastFail = this.lastFailTime.get(keyPrefix) || 0;
    
    if (failures >= this.threshold) {
      if (Date.now() - lastFail < this.timeout) {
        return true; // Circuit is open
      }
      // Reset after timeout
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

// Enhanced retry mechanism with better error handling
async function callGeminiWithRetry(apiKeys, requestBody, maxRetries = 2) {
  let lastError = null;
  const availableKeys = apiKeys.filter(key => !circuitBreaker.isOpen(key));
  
  if (availableKeys.length === 0) {
    throw new Error('All API keys are temporarily unavailable due to failures');
  }

  for (const apiKey of availableKeys) {
    console.log(`Trying with API key: ${apiKey.substring(0, 10)}...`);
    
    for(let attempt = 1; attempt <= maxRetries; attempt++){
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // Reduced to 30 seconds
      
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${apiKey}`, 
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
          console.log(`✅ Success with API key ${apiKey.substring(0, 10)}... on attempt ${attempt}`);
          circuitBreaker.recordSuccess(apiKey);
          return data;
        }
        
        const errorText = await response.text();
        console.error(`❌ Attempt ${attempt} failed for key ${apiKey.substring(0, 10)}...: ${response.status} - ${errorText}`);
        
        // Handle specific error codes
        if (response.status === 503) {
          lastError = new Error(`Gemini service overloaded: ${errorText}`);
          circuitBreaker.recordFailure(apiKey);
          
          // For 503, wait longer before retry
          if (attempt < maxRetries) {
            const delay = Math.min(2000 * Math.pow(2, attempt), 10000); // 2s, 4s, 8s, max 10s
            console.log(`⏳ Service overloaded, waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          continue;
        }
        
        if (response.status === 429) {
          lastError = new Error(`Rate limit exceeded: ${errorText}`);
          circuitBreaker.recordFailure(apiKey);
          
          // For rate limits, wait even longer
          if (attempt < maxRetries) {
            const delay = Math.min(5000 * Math.pow(2, attempt), 30000); // 5s, 10s, 20s, max 30s
            console.log(`⏳ Rate limited, waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          continue;
        }
        
        if (response.status === 400) {
          // Bad request - don't retry
          throw new Error(`Bad request: ${errorText}`);
        }
        
        if (response.status === 401 || response.status === 403) {
          // Auth error - try next key immediately
          throw new Error(`Authentication failed: ${errorText}`);
        }
        
        // For other errors, record failure and continue
        lastError = new Error(`Gemini API error: ${response.status} - ${errorText}`);
        circuitBreaker.recordFailure(apiKey);
        
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
      } catch (error) {
        clearTimeout(timeoutId);
        console.error(`💥 Attempt ${attempt} failed for key ${apiKey.substring(0, 10)}...:`, error.message);
        
        if (error.name === 'AbortError') {
          lastError = new Error('Request timed out after 30 seconds');
          circuitBreaker.recordFailure(apiKey);
        } else if (error.message.includes('Authentication failed')) {
          // Don't retry auth errors with same key
          break;
        } else {
          lastError = error;
          circuitBreaker.recordFailure(apiKey);
        }
        
        // Wait before retry for network errors
        if (attempt < maxRetries && !error.message.includes('Authentication failed')) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
          console.log(`⏳ Network error, waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    console.log(`🔄 All attempts failed for key ${apiKey.substring(0, 10)}..., trying next key if available`);
  }
  
  throw lastError || new Error('All API keys and retry attempts exhausted');
}

const handler = async (req) => {
  // Handle CORS preflight requests
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

    // Enhanced file validation
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

    // File size validation - 2MB limit  
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      return new Response(JSON.stringify({
        error: 'File too large',  
        details: `File size ${(file.size / (1024 * 1024)).toFixed(2)}MB exceeds 2MB limit`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    // Get available API keys
    const geminiApiKeys = getGeminiApiKeys();
    if (geminiApiKeys.length === 0) {
      throw new Error('No GEMINI_API_KEY found in environment variables');
    }
    
    console.log(`🔑 Found ${geminiApiKeys.length} Gemini API key(s)`);

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = arrayBufferToBase64(arrayBuffer);
    
    console.log(`📄 Processing PDF file: ${file.name} (${(file.size / 1024).toFixed(2)}KB)`);

    // First, validate if the document is actually a resume
    const validationPrompt = `
Analyze this PDF document and determine if it is a resume/CV or not.

A resume/CV typically contains:
- Personal/contact information (name, email, phone, etc.)
- Work experience or employment history
- Education background
- Skills section
- Professional summary or objective

Respond with ONLY one of these exact formats:
- If it IS a resume: "VALID_RESUME"
- If it is NOT a resume: "NOT_RESUME: [brief description of what the document actually is]"

Examples:
- "NOT_RESUME: This appears to be a financial report"
- "NOT_RESUME: This is a research paper about machine learning"
- "NOT_RESUME: This document contains terms and conditions"
- "VALID_RESUME"
`;

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
        maxOutputTokens: 100,
        topP: 0.9,
        topK: 40
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
      ]
    };

    console.log('🔍 Validating if document is a resume...');
    const validationData = await callGeminiWithRetry(geminiApiKeys, validationRequestBody);
    
    const validationText = validationData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!validationText) {
      throw new Error('No validation response from Gemini');
    }

    console.log('📋 Validation response:', validationText);

    // Check if it's not a resume
    if (!validationText.includes('VALID_RESUME')) {
      const errorMessage = validationText.startsWith('NOT_RESUME:') 
        ? validationText.replace('NOT_RESUME:', '').trim()
        : 'This document does not appear to be a resume';

      return new Response(JSON.stringify({
        error: 'Invalid document type',
        type: 'NOT_RESUME',
        details: `${errorMessage}. Please upload a valid resume/CV in PDF format.`,
        suggestion: 'Please upload a document that contains your work experience, education, and skills.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    console.log('✅ Document validated as a resume, proceeding with portfolio generation...');

    // Simplified and more focused prompt to reduce token usage
    const portfolioPrompt = `
Extract information from this resume PDF and create a professional portfolio JSON. Use creativity to enhance content while staying accurate.

GUIDELINES:
- Location: Country name only (e.g., "United States", "India")  
- Summary: 15-20 words describing professional profile
- About: 3-4 sentences LinkedIn-style professional story
- Profile image: For female names use "https://media.istockphoto.com/id/1398385392/photo/happy-young-millennial-indian-business-woman-head-shot-portrait.jpg?s=612x612&w=0&k=20&c=QSRWD4KI7JCRJGdMKAhfUBv3Fc2v-7Nvu04iRMAPhGU=", for male use "https://t4.ftcdn.net/jpg/04/31/64/75/360_F_431647519_usrbQ8Z983hTYe8zgA7t1XVc5fEtqcpa.jpg"

Return ONLY valid JSON with this structure:
{
  "settings": {
    "name": "Full Name",
    "title": "Professional Title", 
    "location": "Country only",
    "summary": "15-20 word summary",
    "profileImage": "Appropriate gender-based URL",
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
      "content": "Professional story 3-4 sentences",
      "skills": {"enabled": true, "title": "Skills", "items": ["skill1", "skill2"]}
    },
    "experience": {
      "enabled": true,
      "title": "Experience",
      "items": [{"company": "Company", "position": "Position", "period": "MM/YYYY - Present", "description": "Enhanced description"}]
    },
    "projects": {
      "enabled": true,
      "title": "Projects", 
      "items": [{"title": "Project", "description": "Description", "tags": ["tech1"], "previewUrl": "#"}]
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
      "items": [{"platform": "LinkedIn", "url": "url or #", "icon": "globe"}]
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
}
`;

    // Optimized request body with lower token limits
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
        topP: 0.9,
        topK: 40
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
      ]
    };

    console.log('🚀 Calling Gemini API for portfolio generation...');
    
    // Call Gemini API with retry mechanism for portfolio generation
    const geminiData = await callGeminiWithRetry(geminiApiKeys, portfolioRequestBody);
    
    console.log('✅ Gemini response received successfully');

    // Extract the generated text
    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText) {
      throw new Error('No content generated by Gemini');
    }

    // Parse JSON with better error handling
    let portfolioData;
    try {
      // Clean and extract JSON
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('❌ No JSON found in response:', generatedText);
        throw new Error('No JSON found in Gemini response');
      }
      
      portfolioData = JSON.parse(jsonMatch[0]);
      
      // Validate structure
      if (!portfolioData.settings || !portfolioData.sections) {
        throw new Error('Invalid portfolio data structure received from Gemini');
      }
      
    } catch (parseError) {
      console.error('❌ JSON parsing error:', parseError);
      console.error('Generated text sample:', generatedText.substring(0, 500));
      throw new Error(`Failed to parse JSON from Gemini response: ${parseError.message}`);
    }

    console.log('🎉 Portfolio data generated and validated successfully');
    
    return new Response(JSON.stringify({ portfolioData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 Error in process-resume function:', error);
    
    // Enhanced error categorization
    let statusCode = 500;
    let errorType = 'INTERNAL_ERROR';
    
    if (error.message.includes('No file provided') || 
        error.message.includes('Invalid file type') || 
        error.message.includes('File too large') ||
        error.message.includes('Invalid document type')) {
      statusCode = 400;
      errorType = 'VALIDATION_ERROR';
    } else if (error.message.includes('Authentication failed') || 
               error.message.includes('API key')) {
      statusCode = 401;  
      errorType = 'AUTH_ERROR';
    } else if (error.message.includes('overloaded') || 
               error.message.includes('service unavailable') ||
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
      timestamp: new Date().toISOString(),
      suggestion: statusCode === 503 ? 'Service temporarily overloaded. Please try again in a few minutes.' : 
                  statusCode === 429 ? 'Rate limit exceeded. Please wait before trying again.' :
                  'Please check your request and try again.'
    };

    return new Response(JSON.stringify(errorResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: statusCode
    });
  }
};

serve(handler);
