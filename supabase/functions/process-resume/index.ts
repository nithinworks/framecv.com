
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
  
  console.log(`📋 Found ${keys.length} Gemini API keys available for processing`);
  return keys;
}

// Enhanced retry mechanism with model selection
async function callGeminiWithRetry(apiKeys, requestBody, model = 'gemini-2.0-flash-001') {
  let lastError = null;
  
  console.log(`🚀 Starting Gemini API calls with model: ${model}`);
  console.log(`🔑 Attempting to use ${apiKeys.length} API keys`);
  
  for (let i = 0; i < apiKeys.length; i++) {
    const apiKey = apiKeys[i];
    const keyPrefix = apiKey.substring(0, 8) + '...';
    
    try {
      console.log(`🔄 Attempt ${i + 1}/${apiKeys.length} using API key: ${keyPrefix}`);
      
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      
      const startTime = Date.now();
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Supabase-Edge-Function/1.0'
        },
        body: JSON.stringify(requestBody),
      });
      
      const responseTime = Date.now() - startTime;
      console.log(`⏱️ API call completed in ${responseTime}ms with status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Successful response from API key: ${keyPrefix}`);
        console.log(`📊 Response size: ${JSON.stringify(data).length} characters`);
        return data;
      }
      
      const errorText = await response.text();
      console.log(`❌ API error from key ${keyPrefix}: ${response.status} - ${errorText}`);
      lastError = new Error(`API error: ${response.status} - ${errorText}`);
      
    } catch (error) {
      console.log(`💥 Exception with API key ${keyPrefix}:`, error.message);
      lastError = error;
    }
  }
  
  console.log(`🚫 All ${apiKeys.length} API keys exhausted`);
  throw lastError || new Error('All API keys exhausted');
}

// Enhanced PDF validation
function validatePDFStructure(buffer) {
  console.log(`🔍 Starting PDF structure validation`);
  console.log(`📄 PDF file size: ${buffer.byteLength} bytes`);
  
  const uint8Array = new Uint8Array(buffer);
  const text = new TextDecoder('latin1').decode(uint8Array);
  
  // Check PDF header
  if (!text.startsWith('%PDF-')) {
    console.log(`❌ Invalid PDF: Missing PDF header`);
    throw new Error('Invalid PDF file: Missing PDF header');
  }
  
  console.log(`✅ Valid PDF header detected`);
  
  // Count pages more accurately
  const pageMatches = text.match(/\/Type\s*\/Page[^s]/g);
  const pageCount = pageMatches ? pageMatches.length : 0;
  
  console.log(`📊 PDF page analysis: Found ${pageCount} page objects`);
  
  if (pageCount > 1) {
    console.log(`❌ Multi-page PDF rejected: ${pageCount} pages found`);
    throw new Error(`Multi-page PDF not supported. Found ${pageCount} pages, only single-page resumes are allowed.`);
  }
  
  if (pageCount === 0) {
    console.log(`⚠️ No page objects found, but proceeding with validation`);
  }
  
  console.log(`✅ PDF structure validation passed`);
  return true;
}

const handler = async (req) => {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`🆔 Processing request ${requestId}`);
  console.log(`🌐 Request method: ${req.method}`);
  console.log(`📍 Request URL: ${req.url}`);
  
  if (req.method === 'OPTIONS') {
    console.log(`✅ CORS preflight request handled for ${requestId}`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log(`📥 Starting file extraction for request ${requestId}`);
    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file) {
      console.log(`❌ No file provided in request ${requestId}`);
      return new Response(JSON.stringify({
        error: 'No file provided'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    console.log(`📋 File details for ${requestId}:`);
    console.log(`  - Name: ${file.name}`);
    console.log(`  - Type: ${file.type}`);
    console.log(`  - Size: ${file.size} bytes (${(file.size / (1024 * 1024)).toFixed(2)} MB)`);

    // Enhanced file validation
    const allowedTypes = ['application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      console.log(`❌ Invalid file type rejected: ${file.type} for request ${requestId}`);
      return new Response(JSON.stringify({
        error: 'Invalid file type. Only PDF files are allowed.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      console.log(`❌ File too large: ${file.size} bytes (max: ${maxSize}) for request ${requestId}`);
      return new Response(JSON.stringify({
        error: 'File too large. Maximum size is 2MB.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    console.log(`✅ File validation passed for request ${requestId}`);

    const geminiApiKeys = getGeminiApiKeys();
    if (geminiApiKeys.length === 0) {
      console.log(`❌ No API keys available for request ${requestId}`);
      throw new Error('No API keys available');
    }

    console.log(`🔄 Converting file to buffer for request ${requestId}`);
    const arrayBuffer = await file.arrayBuffer();
    
    // Validate PDF structure
    validatePDFStructure(arrayBuffer);
    
    console.log(`🔄 Converting to base64 for request ${requestId}`);
    const base64Data = arrayBufferToBase64(arrayBuffer);
    console.log(`✅ Base64 conversion completed: ${base64Data.length} characters for request ${requestId}`);

    // Document validation using Flash-Lite model
    console.log(`🔍 Starting document validation phase for request ${requestId}`);
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

    console.log(`🤖 Calling validation model for request ${requestId}`);
    const validationData = await callGeminiWithRetry(
      geminiApiKeys, 
      validationRequestBody, 
      'gemini-2.0-flash-lite'
    );
    
    const validationText = validationData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    console.log(`📝 Validation result for ${requestId}: "${validationText}"`);
    
    if (!validationText || validationText !== 'VALID_RESUME') {
      console.log(`❌ Document validation failed for request ${requestId}: Not a valid resume`);
      throw new Error('Not a valid resume');
    }

    console.log(`✅ Document validation passed for request ${requestId}`);

    // Portfolio generation using Flash model
    console.log(`🎨 Starting portfolio generation phase for request ${requestId}`);
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

    console.log(`🤖 Calling portfolio generation model for request ${requestId}`);
    const geminiData = await callGeminiWithRetry(
      geminiApiKeys, 
      portfolioRequestBody, 
      'gemini-2.0-flash-001'
    );

    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log(`📝 Generated text length for ${requestId}: ${generatedText?.length || 0} characters`);
    
    if (!generatedText) {
      console.log(`❌ No content generated for request ${requestId}`);
      throw new Error('No content generated');
    }

    // Parse and validate JSON
    console.log(`🔄 Parsing JSON response for request ${requestId}`);
    let portfolioData;
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.log(`❌ No JSON found in response for request ${requestId}`);
        throw new Error('No JSON found in response');
      }
      
      console.log(`📋 Extracted JSON length for ${requestId}: ${jsonMatch[0].length} characters`);
      portfolioData = JSON.parse(jsonMatch[0]);
      
      if (!portfolioData.settings || !portfolioData.sections) {
        console.log(`❌ Invalid portfolio structure for request ${requestId}`);
        throw new Error('Invalid portfolio structure');
      }
      
      console.log(`✅ Portfolio data validation passed for request ${requestId}`);
      console.log(`👤 Generated portfolio for: ${portfolioData.settings.name}`);
      
    } catch (parseError) {
      console.log(`❌ JSON parsing failed for request ${requestId}:`, parseError.message);
      throw new Error(`JSON parsing failed: ${parseError.message}`);
    }
    
    console.log(`🎉 Successfully processed request ${requestId}`);
    console.log(`📊 Final response size: ${JSON.stringify(portfolioData).length} characters`);
    
    return new Response(JSON.stringify({ portfolioData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.log(`💥 Error processing request ${requestId}:`, error.message);
    console.log(`📊 Error stack:`, error.stack);
    
    return new Response(JSON.stringify({
      error: 'Failed to process resume',
      details: error.message,
      requestId: requestId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
};

serve(handler);
