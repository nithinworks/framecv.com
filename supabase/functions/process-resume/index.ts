
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

// Import PDF parsing library
import "https://deno.land/x/xhr@0.1.0/mod.ts"

// More robust PDF text extraction
async function extractTextFromPDF(pdfBuffer: ArrayBuffer): Promise<string> {
  try {
    console.log('Starting PDF text extraction...');
    
    // Convert ArrayBuffer to Uint8Array for processing
    const uint8Array = new Uint8Array(pdfBuffer);
    
    // Convert to string for pattern matching
    let pdfString = '';
    
    // Try different encoding approaches
    try {
      // First try UTF-8
      pdfString = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array);
    } catch {
      // Fallback to latin1 if UTF-8 fails
      pdfString = new TextDecoder('latin1').decode(uint8Array);
    }
    
    console.log('PDF string conversion completed, length:', pdfString.length);
    
    let extractedText = '';
    
    // Method 1: Extract text from parentheses (most common in PDFs)
    const parenthesesRegex = /\(([^)]+)\)/g;
    let match;
    const textParts = [];
    
    while ((match = parenthesesRegex.exec(pdfString)) !== null) {
      const text = match[1];
      // Filter out non-readable content
      if (text && text.length > 1 && /[a-zA-Z]/.test(text)) {
        // Clean up escape sequences and special characters
        const cleanText = text
          .replace(/\\[rnt]/g, ' ')
          .replace(/\\\(/g, '(')
          .replace(/\\\)/g, ')')
          .replace(/\\[0-9]{3}/g, '')
          .trim();
        
        if (cleanText.length > 1) {
          textParts.push(cleanText);
        }
      }
    }
    
    console.log('Extracted', textParts.length, 'text parts from parentheses');
    
    // Method 2: Look for text between BT and ET operators
    const btEtRegex = /BT\s+(.*?)\s+ET/gs;
    let btEtMatch;
    
    while ((btEtMatch = btEtRegex.exec(pdfString)) !== null) {
      const content = btEtMatch[1];
      // Extract text from Tj operations
      const tjRegex = /\(([^)]*)\)\s*Tj/g;
      let tjMatch;
      
      while ((tjMatch = tjRegex.exec(content)) !== null) {
        const text = tjMatch[1];
        if (text && text.length > 1 && /[a-zA-Z]/.test(text)) {
          textParts.push(text.trim());
        }
      }
    }
    
    console.log('Total text parts extracted:', textParts.length);
    
    // Method 3: Look for stream content with readable text
    const streamRegex = /stream\s+(.*?)\s+endstream/gs;
    let streamMatch;
    
    while ((streamMatch = streamRegex.exec(pdfString)) !== null) {
      const streamContent = streamMatch[1];
      // Look for readable sequences
      const readableRegex = /[A-Za-z][A-Za-z0-9\s\.,;:!?\-]{4,}/g;
      let readableMatch;
      
      while ((readableMatch = readableRegex.exec(streamContent)) !== null) {
        const text = readableMatch[0].trim();
        if (text.length > 4) {
          textParts.push(text);
        }
      }
    }
    
    // Combine all extracted text
    extractedText = textParts.join(' ');
    
    // Clean up the final text
    extractedText = extractedText
      .replace(/\s+/g, ' ')
      .replace(/[^\x20-\x7E\s]/g, '')
      .trim();
    
    console.log('PDF text extraction completed. Final length:', extractedText.length);
    console.log('Extract sample (first 500 chars):', extractedText.substring(0, 500));
    
    if (extractedText.length < 50) {
      console.log('Insufficient text extracted, trying fallback method...');
      
      // Fallback: Extract any readable sequences
      const fallbackRegex = /[A-Za-z][A-Za-z0-9\s\.,;:!?\-@#$%^&*()_+=\[\]{}|\\/"'`~]{10,}/g;
      const fallbackMatches = pdfString.match(fallbackRegex);
      
      if (fallbackMatches && fallbackMatches.length > 0) {
        extractedText = fallbackMatches
          .filter(text => text.length > 10)
          .join(' ')
          .substring(0, 10000);
        console.log('Used fallback extraction method, length:', extractedText.length);
      }
    }
    
    if (extractedText.length < 20) {
      throw new Error('Could not extract sufficient text from PDF. The PDF may be image-based or encrypted.');
    }
    
    return extractedText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF. Please ensure the file is a valid PDF with readable text content.');
  }
}

// Enhanced JSON extraction and parsing
function extractAndParseJSON(text: string): any {
  try {
    // First, try to find JSON within the text
    const jsonStartIndex = text.indexOf('{');
    const jsonEndIndex = text.lastIndexOf('}');
    
    if (jsonStartIndex === -1 || jsonEndIndex === -1) {
      throw new Error('No JSON object found in response');
    }
    
    // Extract just the JSON portion
    const jsonText = text.substring(jsonStartIndex, jsonEndIndex + 1);
    console.log('Extracted JSON length:', jsonText.length);
    console.log('JSON sample (first 200 chars):', jsonText.substring(0, 200));
    
    // Parse the JSON
    const parsed = JSON.parse(jsonText);
    
    // Validate structure
    if (!parsed.settings || !parsed.sections) {
      throw new Error('Invalid portfolio data structure - missing required sections');
    }
    
    console.log('JSON parsed successfully');
    console.log('Portfolio data validated - Settings:', parsed.settings?.name || 'Unknown');
    console.log('Available sections:', Object.keys(parsed.sections).join(', '));
    
    return parsed;
  } catch (error) {
    console.error('JSON extraction/parsing failed:', error.message);
    throw new Error(`Failed to parse portfolio data: ${error.message}`);
  }
}

// Call OpenRouter API with improved error handling
async function callOpenRouterWithRetry(
  content: string, 
  maxRetries: number = 3
): Promise<any> {
  const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
  
  if (!openRouterApiKey) {
    throw new Error('OPENROUTER_API_KEY not found in environment variables');
  }

  console.log('Starting OpenRouter API call with Mistral model...');
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`OpenRouter API attempt ${attempt}/${maxRetries}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);
      
      const prompt = `You are an AI portfolio builder. Extract information from this resume content and create a professional, personalized portfolio. Use your creativity to enhance the content while staying true to the person's background.

CRITICAL: Return ONLY a valid JSON object with no additional text, explanations, or formatting. The response must start with { and end with }.

IMPORTANT GUIDELINES:
- For location: Use only country name (e.g., "United States", "Canada", "India")
- For summary: Write 15-20 words describing their overall professional profile
- For about content: Write a detailed LinkedIn-style "About" section (3-4 sentences) that tells their professional story
- For project descriptions: Enhance descriptions to highlight impact and technologies, keep concise but compelling
- Choose a professional color scheme that complements their field
- Always include complete navigation menu and footer
- Add relevant CTA buttons based on their profession
- For profile image: Analyze the name/content to determine gender. If female, use "https://media.istockphoto.com/id/1398385392/photo/happy-young-millennial-indian-business-woman-head-shot-portrait.jpg?s=612x612&w=0&k=20&c=QSRWD4KI7JCRJGdMKAhfUBv3Fc2v-7Nvu04iRMAPhGU=", if male use "https://t4.ftcdn.net/jpg/04/31/64/75/360_F_431647519_usrbQ8Z983hTYe8zgA7t1XVc5fEtqcpa.jpg"

Return this EXACT JSON structure:
{
  "settings": {
    "name": "Full Name from resume",
    "title": "Professional Title/Current Position",
    "location": "Country only",
    "summary": "15-20 word professional summary",
    "profileImage": "Use appropriate gender-based URL from above",
    "primaryColor": "#0067c7"
  },
  "sections": {
    "hero": {
      "enabled": true,
      "ctaButtons": [
        {
          "text": "Contact Me",
          "url": "mailto:email@example.com",
          "isPrimary": true,
          "icon": "mail"
        },
        {
          "text": "Download Resume",
          "url": "#",
          "isPrimary": false,
          "icon": "download"
        }
      ]
    },
    "about": {
      "enabled": true,
      "title": "About Me",
      "content": "Write a compelling 3-4 sentence LinkedIn-style about section",
      "skills": {
        "enabled": true,
        "title": "Skills",
        "items": ["Extract and list all relevant technical and soft skills"]
      }
    },
    "experience": {
      "enabled": true,
      "title": "Experience",
      "items": [
        {
          "company": "Company Name",
          "position": "Position Title",
          "period": "MM/YYYY - MM/YYYY or Present",
          "description": "Enhanced description highlighting key achievements"
        }
      ]
    },
    "projects": {
      "enabled": true,
      "title": "Projects",
      "items": [
        {
          "title": "Project Name",
          "description": "Enhanced project description focusing on impact and technologies",
          "tags": ["List relevant technologies"],
          "previewUrl": "#"
        }
      ]
    },
    "education": {
      "enabled": true,
      "title": "Education",
      "items": [
        {
          "institution": "Institution Name",
          "degree": "Degree Title",
          "period": "MM/YYYY - MM/YYYY"
        }
      ]
    },
    "contact": {
      "enabled": true,
      "title": "Contact",
      "email": "Extract email from resume",
      "phone": "Extract phone if available",
      "location": "Country only"
    },
    "social": {
      "enabled": true,
      "items": [
        {
          "platform": "LinkedIn",
          "url": "Extract LinkedIn URL or use placeholder",
          "icon": "globe"
        }
      ]
    }
  },
  "navigation": {
    "items": [
      { "name": "Home", "url": "#hero" },
      { "name": "About", "url": "#about" },
      { "name": "Experience", "url": "#experience" },
      { "name": "Projects", "url": "#projects" },
      { "name": "Education", "url": "#education" },
      { "name": "Contact", "url": "#contact" }
    ]
  },
  "footer": {
    "enabled": true,
    "copyright": "© 2024 [Name]. All rights reserved."
  }
}

Resume content: ${content}`;
      
      console.log('Sending request to OpenRouter...');
      console.log('Content length being sent:', content.length);

      const requestBody = {
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 4000
      };

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://lovable.dev',
          'X-Title': 'Portfolio Builder'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`OpenRouter API success on attempt ${attempt}`);
        console.log('Response status:', response.status);
        console.log('Model used:', data.model || 'unknown');
        console.log('Token usage:', {
          prompt: data.usage?.prompt_tokens || 'unknown',
          completion: data.usage?.completion_tokens || 'unknown',
          total: data.usage?.total_tokens || 'unknown'
        });
        
        return data;
      }
      
      const errorText = await response.text();
      console.error(`Attempt ${attempt} failed: ${response.status} - ${errorText}`);
      
      if (response.status === 503 || response.status === 429) {
        lastError = new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
        
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        continue;
      }
      
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      
      if (error.name === 'AbortError') {
        lastError = new Error('Request timed out after 45 seconds');
      } else {
        lastError = error as Error;
      }
      
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('All retry attempts exhausted');
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('=== PROCESS RESUME FUNCTION STARTED ===');
    
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      console.error('No file provided in request');
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Enhanced file validation
    console.log('File details:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`
    });

    const allowedTypes = ['application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      console.error('Invalid file type:', file.type);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid file type', 
          details: 'Only PDF files are allowed' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.error('File too large:', file.size);
      return new Response(
        JSON.stringify({ 
          error: 'File too large', 
          details: `File size ${(file.size / (1024 * 1024)).toFixed(2)}MB exceeds 5MB limit` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log('✓ File validation passed');

    // Extract content from PDF
    console.log('Converting file to ArrayBuffer...');
    const arrayBuffer = await file.arrayBuffer()
    console.log(`✓ File converted to ArrayBuffer: ${arrayBuffer.byteLength} bytes`);
    
    console.log('Starting PDF text extraction...');
    const extractedContent = await extractTextFromPDF(arrayBuffer)
    console.log(`✓ PDF text extraction completed: ${extractedContent.length} characters extracted`);

    // Call OpenRouter API
    console.log('Calling OpenRouter API...');
    const openRouterData = await callOpenRouterWithRetry(extractedContent);
    console.log('✓ OpenRouter API call completed');

    // Extract and parse the response
    const generatedText = openRouterData.choices?.[0]?.message?.content;
    if (!generatedText) {
      throw new Error('No content generated by OpenRouter');
    }

    console.log('Generated response length:', generatedText.length);
    console.log('Response preview:', generatedText.substring(0, 100) + '...');

    // Parse the JSON with improved error handling
    const portfolioData = extractAndParseJSON(generatedText);
    console.log('✓ Portfolio data parsed and validated successfully');

    console.log('=== PROCESS RESUME FUNCTION COMPLETED SUCCESSFULLY ===');

    return new Response(
      JSON.stringify({ portfolioData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== PROCESS RESUME FUNCTION FAILED ===');
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    const errorResponse = {
      error: 'Failed to process resume',
      details: error.message,
      timestamp: new Date().toISOString()
    };
    
    let statusCode = 500;
    if (error.message.includes('No file provided') || 
        error.message.includes('Invalid file type') || 
        error.message.includes('File too large')) {
      statusCode = 400;
    } else if (error.message.includes('API key') || 
               error.message.includes('authentication')) {
      statusCode = 401;
    } else if (error.message.includes('overloaded') || 
               error.message.includes('rate limit')) {
      statusCode = 503;
    }
    
    return new Response(
      JSON.stringify(errorResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: statusCode 
      }
    );
  }
}

serve(handler)
