
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
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

    // Prepare the prompt for Gemini
    const prompt = `
    Extract information from this resume PDF and return ONLY a valid JSON object with this exact structure:
    {
      "settings": {
        "name": "Full Name",
        "title": "Professional Title/Position",
        "location": "City, Country",
        "summary": "Professional summary or objective",
        "profileImage": "https://via.placeholder.com/400x400.png?text=Profile",
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
          "content": "About section content from resume",
          "skills": {
            "enabled": true,
            "title": "Skills",
            "items": ["Skill1", "Skill2", "Skill3"]
          }
        },
        "experience": {
          "enabled": true,
          "title": "Experience",
          "items": [
            {
              "company": "Company Name",
              "position": "Position Title",
              "period": "MM/YYYY - MM/YYYY",
              "description": "Job description and responsibilities"
            }
          ]
        },
        "projects": {
          "enabled": true,
          "title": "Projects",
          "items": [
            {
              "title": "Project Name",
              "description": "Project description",
              "tags": ["Tech1", "Tech2"],
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
          "email": "email@example.com",
          "phone": "+1234567890",
          "location": "City, Country"
        },
        "social": {
          "enabled": true,
          "items": [
            {
              "platform": "LinkedIn",
              "url": "https://linkedin.com/in/username",
              "icon": "globe"
            }
          ]
        }
      }
    }

    Extract all relevant information from the resume. If any information is missing, use placeholder values. Make sure the JSON is valid and follows the exact structure above.
    `

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
            temperature: 0.1,
            maxOutputTokens: 2048,
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
    console.log('Gemini response:', geminiData)

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
})
