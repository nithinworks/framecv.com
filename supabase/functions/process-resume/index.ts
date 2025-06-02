
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

// Helper function for chunked base64 conversion to prevent stack overflow
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000; // 32KB chunks
  let result = '';
  
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, i + chunkSize);
    result += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(result);
}

// Get all available Gemini API keys
function getGeminiApiKeys(): string[] {
  const keys: string[] = [];
  
  // Primary key
  const primaryKey = Deno.env.get('GEMINI_API_KEY');
  if (primaryKey) keys.push(primaryKey);
  
  // Secondary keys (GEMINI_API_KEY_2, GEMINI_API_KEY_3, etc.)
  for (let i = 2; i <= 5; i++) {
    const key = Deno.env.get(`GEMINI_API_KEY_${i}`);
    if (key) keys.push(key);
  }
  
  return keys;
}

// Retry mechanism with exponential backoff
async function callGeminiWithRetry(
  apiKeys: string[], 
  requestBody: any, 
  maxRetries: number = 3
): Promise<any> {
  let lastError: Error | null = null;
  
  for (const apiKey of apiKeys) {
    console.log(`Trying with API key: ${apiKey.substring(0, 10)}...`);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout
        
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal
          }
        );
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`Success with API key ${apiKey.substring(0, 10)}... on attempt ${attempt}`);
          return data;
        }
        
        const errorText = await response.text();
        console.error(`Attempt ${attempt} failed for key ${apiKey.substring(0, 10)}...: ${response.status} - ${errorText}`);
        
        // If it's a 503 (overloaded) or 429 (rate limit), try next attempt or next key
        if (response.status === 503 || response.status === 429) {
          lastError = new Error(`Gemini API error: ${response.status} - ${errorText}`);
          
          // Wait before retry (exponential backoff)
          if (attempt < maxRetries) {
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Max 5 seconds
            console.log(`Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          continue;
        }
        
        // For other errors, don't retry with same key
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
        
      } catch (error) {
        clearTimeout(timeoutId);
        console.error(`Attempt ${attempt} failed for key ${apiKey.substring(0, 10)}...:`, error.message);
        
        if (error.name === 'AbortError') {
          lastError = new Error('Request timed out after 45 seconds');
        } else {
          lastError = error as Error;
        }
        
        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Max 5 seconds
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    console.log(`All attempts failed for key ${apiKey.substring(0, 10)}..., trying next key if available`);
  }
  
  throw lastError || new Error('All API keys and retry attempts exhausted');
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Enhanced file validation
    const allowedTypes = ['application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid file type', 
          details: 'Only PDF files are allowed' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // File size validation - 2MB limit
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({ 
          error: 'File too large', 
          details: `File size ${(file.size / (1024 * 1024)).toFixed(2)}MB exceeds 2MB limit` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Get available API keys
    const geminiApiKeys = getGeminiApiKeys();
    if (geminiApiKeys.length === 0) {
      throw new Error('No GEMINI_API_KEY found in environment variables')
    }
    
    console.log(`Found ${geminiApiKeys.length} Gemini API key(s)`);

    // Convert file to base64 using chunked processing
    const arrayBuffer = await file.arrayBuffer()
    const base64Data = arrayBufferToBase64(arrayBuffer)

    // Prepare the enhanced prompt for Gemini
    const prompt = `
    You are an AI portfolio builder. Extract information from this resume PDF and create a professional, personalized portfolio. Use your creativity to enhance the content while staying true to the person's background.

    IMPORTANT GUIDELINES:
    - For location: Use only country name (e.g., "United States", "Canada", "India")
    - For summary: Write 15-20 words describing their overall professional profile
    - For about content: Write a detailed LinkedIn-style "About" section (3-4 sentences) that tells their professional story
    - For project descriptions: Enhance descriptions to highlight impact and technologies, keep concise but compelling
    - Choose a professional color scheme that complements their field
    - Always include complete navigation menu and footer
    - Add relevant CTA buttons based on their profession
    - For profile image: Analyze the name/content to determine gender. If female, use "https://media.istockphoto.com/id/1398385392/photo/happy-young-millennial-indian-business-woman-head-shot-portrait.jpg?s=612x612&w=0&k=20&c=QSRWD4KI7JCRJGdMKAhfUBv3Fc2v-7Nvu04iRMAPhGU=", if male use "https://t4.ftcdn.net/jpg/04/31/64/75/360_F_431647519_usrbQ8Z983hTYe8zgA7t1XVc5fEtqcpa.jpg"

    Return ONLY a valid JSON object with this EXACT structure:
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
          "content": "Write a compelling 3-4 sentence LinkedIn-style about section that tells their professional story, highlighting key experiences and aspirations",
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
              "description": "Enhanced description highlighting key achievements and responsibilities"
            }
          ]
        },
        "projects": {
          "enabled": true,
          "title": "Projects",
          "items": [
            {
              "title": "Project Name",
              "description": "Enhanced project description focusing on impact, technologies used, and key outcomes",
              "tags": ["List relevant technologies and skills"],
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

    Extract all information from the resume and enhance it with your AI capabilities. Make it professional, engaging, and complete. Ensure ALL sections have meaningful content even if some information needs to be intelligently inferred or enhanced based on the available data.
    `

    console.log('Calling Gemini API with retry mechanism...')

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt
            },
            {
              inline_data: {
                mime_type: file.type,
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 4000,
        topP: 0.8,
        topK: 40
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    // Call Gemini API with retry mechanism
    const geminiData = await callGeminiWithRetry(geminiApiKeys, requestBody);
    console.log('Gemini response received successfully');

    // Extract the generated text
    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText) {
      throw new Error('No content generated by Gemini');
    }

    // Parse the JSON from Gemini's response with better error handling
    let portfolioData;
    try {
      // Clean the response to extract JSON
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON found in response:', generatedText);
        throw new Error('No JSON found in Gemini response');
      }
      portfolioData = JSON.parse(jsonMatch[0]);
      
      // Basic validation of portfolio data structure
      if (!portfolioData.settings || !portfolioData.sections) {
        throw new Error('Invalid portfolio data structure received from Gemini');
      }
      
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Generated text:', generatedText);
      throw new Error(`Failed to parse JSON from Gemini response: ${parseError.message}`);
    }

    console.log('Portfolio data generated and validated successfully');

    return new Response(
      JSON.stringify({ portfolioData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-resume function:', error);
    
    // Enhanced error reporting
    const errorResponse = {
      error: 'Failed to process resume',
      details: error.message,
      timestamp: new Date().toISOString()
    };
    
    // Return appropriate status codes
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
