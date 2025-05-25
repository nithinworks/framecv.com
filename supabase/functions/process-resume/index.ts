
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

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

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer()
    const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not found')
    }

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
    - For profile image: Analyze the name/content to determine gender. If female, use "https://media.istockphoto.com/id/1398385392/photo/happy-young-millennial-indian-business-woman-head-shot-portrait.jpg?s=612x612&w=0&k=20&c=QSRWD4KI7JCRJGdMKAhfUBv3Fc2v-7Nvu04iRMAPhGU=", if male use "https://media.istockphoto.com/id/1360063450/photo-headshot-profile-picture-young-businessman-sit-in-kitchen-webcam-view.jpg?s=612x612&w=0&k=20&c=6DoR9bff-RQ5N31LV_tQPsj_hT1HPxGAIn07mLkLxgc="

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
              "period": "MM/YYYY - MM/YYYY",
              "description": "Add relevant coursework, achievements, or GPA if notable"
            }
          ]
        },
        "achievements": {
          "enabled": true,
          "title": "Achievements & Certifications",
          "items": [
            {
              "title": "Achievement/Certification Title",
              "period": "MM/YYYY",
              "description": "Brief description of the achievement or certification"
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

    console.log('Calling Gemini API...')

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
            maxOutputTokens: 3000,
          }
        })
      }
    )

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error('Gemini API error:', errorText)
      throw new Error(`Gemini API error: ${geminiResponse.status}`)
    }

    const geminiData = await geminiResponse.json()
    console.log('Gemini response received successfully')

    // Extract the generated text
    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
    if (!generatedText) {
      throw new Error('No content generated by Gemini')
    }

    // Parse the JSON from Gemini's response
    let portfolioData
    try {
      // Clean the response to extract JSON
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in Gemini response')
      }
      portfolioData = JSON.parse(jsonMatch[0])
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      console.error('Generated text:', generatedText)
      throw new Error('Failed to parse JSON from Gemini response')
    }

    console.log('Portfolio data generated successfully')

    return new Response(
      JSON.stringify({ portfolioData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in process-resume function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process resume', 
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
}

serve(handler)
