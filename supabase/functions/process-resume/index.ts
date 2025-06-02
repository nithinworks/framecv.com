
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

// Extract text from PDF using a more reliable method
async function extractTextFromPDF(pdfBuffer: ArrayBuffer): Promise<string> {
  try {
    // For now, we'll use a simple approach that works with most PDFs
    // This is a placeholder - in production you'd want to use a proper PDF parser
    const base64 = arrayBufferToBase64(pdfBuffer);
    console.log('PDF converted to base64, length:', base64.length);
    
    // Return the base64 representation for now
    // The AI will process the PDF content directly
    return base64;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

// Call OpenRouter API with retry mechanism
async function callOpenRouterWithRetry(
  content: string, 
  maxRetries: number = 3
): Promise<any> {
  const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
  
  if (!openRouterApiKey) {
    throw new Error('OPENROUTER_API_KEY not found in environment variables');
  }

  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`OpenRouter API attempt ${attempt}...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
      
      const prompt = `
      You are an AI portfolio builder. Extract information from this resume content and create a professional, personalized portfolio. Use your creativity to enhance the content while staying true to the person's background.

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

      Resume content: ${content}
      `;

      const requestBody = {
        model: "anthropic/claude-3.5-sonnet",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
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
        console.log(`Success with OpenRouter on attempt ${attempt}`);
        return data;
      }
      
      const errorText = await response.text();
      console.error(`Attempt ${attempt} failed: ${response.status} - ${errorText}`);
      
      // If it's a 503 (overloaded) or 429 (rate limit), try again
      if (response.status === 503 || response.status === 429) {
        lastError = new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
        
        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Max 5 seconds
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        continue;
      }
      
      // For other errors, don't retry
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      
      if (error.name === 'AbortError') {
        lastError = new Error('Request timed out after 60 seconds');
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
  
  throw lastError || new Error('All retry attempts exhausted');
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

    // File size validation - 5MB limit (increased for better compatibility)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({ 
          error: 'File too large', 
          details: `File size ${(file.size / (1024 * 1024)).toFixed(2)}MB exceeds 5MB limit` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log(`Processing PDF file: ${file.name}, size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);

    // Extract content from PDF
    const arrayBuffer = await file.arrayBuffer()
    const extractedContent = await extractTextFromPDF(arrayBuffer)

    console.log('Calling OpenRouter API with retry mechanism...')

    // Call OpenRouter API with retry mechanism
    const openRouterData = await callOpenRouterWithRetry(extractedContent);
    console.log('OpenRouter response received successfully');

    // Extract the generated text
    const generatedText = openRouterData.choices?.[0]?.message?.content;
    if (!generatedText) {
      throw new Error('No content generated by OpenRouter');
    }

    // Parse the JSON from OpenRouter's response with better error handling
    let portfolioData;
    try {
      // Clean the response to extract JSON
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON found in response:', generatedText);
        throw new Error('No JSON found in OpenRouter response');
      }
      portfolioData = JSON.parse(jsonMatch[0]);
      
      // Basic validation of portfolio data structure
      if (!portfolioData.settings || !portfolioData.sections) {
        throw new Error('Invalid portfolio data structure received from OpenRouter');
      }
      
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Generated text:', generatedText);
      throw new Error(`Failed to parse JSON from OpenRouter response: ${parseError.message}`);
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
