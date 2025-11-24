import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

const aiGuidanceSchema = z.object({
  interests: z.array(z.string()),
  strengths: z.array(z.string()),
  goals: z.array(z.string()),
  budget: z.number().positive().optional(),
  location: z.string().optional(),
});

// Initialize Gemini AI client (lazy initialization)
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }
  return new GoogleGenerativeAI(apiKey);
};

export const getAIGuidance = async (req: Request, res: Response) => {
  try {
    const data = aiGuidanceSchema.parse(req.body);
    const { interests, strengths, goals, budget, location } = data;

    // Validate API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      return res.status(500).json({ 
        error: 'Gemini API key not configured',
        message: 'Please set GEMINI_API_KEY in your .env file. Get your API key from https://aistudio.google.com/app/apikey',
        note: '⚠️ IMPORTANT: Use Google AI Studio (NOT Google Cloud Console). Keys should start with "AIza..."'
      });
    }
    
    // Warn if using wrong type of key
    if (apiKey.trim().startsWith('AQ.')) {
      return res.status(500).json({ 
        error: 'Invalid API key type',
        message: 'Your API key appears to be from Google Cloud Console, but this package requires a Google AI Studio API key.',
        solution: 'Get the correct API key from https://aistudio.google.com/app/apikey (keys start with "AIza...")',
        note: 'Google Cloud Console keys require OAuth2 authentication and cannot be used with the @google/generative-ai package.'
      });
    }

    // Initialize Gemini client and get the model
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Create a comprehensive prompt for career guidance
    const prompt = `You are a career guidance counselor. Based on the following information, provide detailed career recommendations.

User Information:
- Interests: ${interests.join(', ')}
- Strengths: ${strengths.join(', ')}
- Goals: ${goals.join(', ')}
- Budget: ${budget ? `₹${budget.toLocaleString()}` : 'Not specified'}
- Location: ${location || 'Not specified'}

IMPORTANT: You must respond with ONLY valid JSON. Do not include any explanatory text before or after the JSON. Your response must start with { and end with }.

Return the response in this exact JSON format:
{
  "recommendedStream": "Science" | "Commerce" | "Arts",
  "streamReason": "Brief explanation for stream recommendation",
  "careers": [
    {
      "name": "Career name",
      "description": "Detailed description",
      "whyRecommended": "Why this career matches the user",
      "salaryInsights": [
        {
          "year": 0,
          "minSalary": 300000,
          "avgSalary": 500000,
          "maxSalary": 800000
        },
        {
          "year": 5,
          "minSalary": 600000,
          "avgSalary": 1000000,
          "maxSalary": 1500000
        },
        {
          "year": 10,
          "minSalary": 1200000,
          "avgSalary": 2000000,
          "maxSalary": 3000000
        }
      ]
    }
  ],
  "colleges": [
    {
      "name": "College name",
      "description": "Brief description",
      "city": "City name",
      "state": "State name",
      "fees": 500000,
      "courses": ["Course 1", "Course 2"],
      "website": "https://example.com"
    }
  ],
  "coaching": [
    {
      "name": "Coaching center name",
      "description": "Brief description",
      "city": "City name",
      "state": "State name",
      "phone": "Phone number",
      "website": "https://example.com"
    }
  ],
  "pgs": [
    {
      "name": "PG name",
      "description": "Brief description",
      "address": "Full address",
      "city": "City name",
      "monthlyRent": 15000,
      "ownerName": "Owner name",
      "ownerPhone": "Phone number",
      "amenities": ["WiFi", "AC", "Food"]
    }
  ],
  "recommendations": [
    {
      "college": {
        "name": "College name",
        "city": "City name",
        "state": "State name",
        "fees": 500000
      },
      "pg": {
        "name": "PG name",
        "monthlyRent": 15000
      },
      "totalCost": 680000
    }
  ]
}

Provide realistic and relevant recommendations based on the user's profile. Include at least 5 careers, 5 colleges, 5 coaching centers, and 5 PG options. Ensure all recommendations are relevant to the ${location || 'India'} location if specified, and within the budget if provided. Return ONLY the JSON object, no other text.`;

    let text = '';
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      text = response.text();

      // Parse the JSON response from Gemini
      // Sometimes Gemini wraps the JSON in markdown code blocks
      let jsonText = text.trim();
      
      // Remove markdown code blocks if present
      if (jsonText.includes('```json')) {
        const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonText = jsonMatch[1].trim();
        }
      } else if (jsonText.includes('```')) {
        const jsonMatch = jsonText.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonText = jsonMatch[1].trim();
        }
      }

      // Try to extract JSON if there's extra text
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      const guidance = JSON.parse(jsonText);

      // Validate and return the guidance
      res.json({
        recommendedStream: guidance.recommendedStream || 'Science',
        streamReason: guidance.streamReason || 'Based on your profile analysis',
        careers: Array.isArray(guidance.careers) ? guidance.careers : [],
        colleges: Array.isArray(guidance.colleges) ? guidance.colleges : [],
        coaching: Array.isArray(guidance.coaching) ? guidance.coaching : [],
        pgs: Array.isArray(guidance.pgs) ? guidance.pgs : [],
        recommendations: Array.isArray(guidance.recommendations) ? guidance.recommendations : [],
      });
    } catch (apiError: any) {
      console.error('Error calling Gemini API or parsing response:', apiError);
      
      // Handle specific Gemini API errors
      if (apiError.status === 401) {
        const apiKey = process.env.GEMINI_API_KEY || '';
        let errorMessage = 'Invalid API key. Please check your GEMINI_API_KEY in the .env file.';
        let solution = 'Get a valid API key from https://aistudio.google.com/app/apikey';
        
        if (apiKey.trim().startsWith('AQ.')) {
          errorMessage = 'You are using a Google Cloud Console API key, but this package requires a Google AI Studio API key.';
          solution = 'Get the correct API key from https://aistudio.google.com/app/apikey (keys start with "AIza..."). Google Cloud Console keys require OAuth2 and won\'t work.';
        }
        
        return res.status(500).json({ 
          error: 'Gemini API authentication failed',
          message: errorMessage,
          solution: solution,
          details: 'Make sure you have a valid Google AI Studio API key (starts with "AIza...")'
        });
      }
      if (apiError.status === 403) {
        return res.status(500).json({ 
          error: 'Gemini API access denied',
          message: 'API key does not have permission to access Gemini API.'
        });
      }
      
      // Handle JSON parsing errors
      if (apiError instanceof SyntaxError || apiError.name === 'SyntaxError') {
        if (text) {
          console.error('Response text (first 500 chars):', text.substring(0, 500));
        }
        return res.status(500).json({ 
          error: 'Failed to parse AI response. Please try again.',
          details: apiError.message 
        });
      }
      
      // Re-throw to be caught by outer catch if it's not a handled error
      throw apiError;
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    console.error('Error getting AI guidance:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Failed to get AI guidance',
      details: errorMessage 
    });
  }
};

export const getAISalaryInsights = async (req: Request, res: Response) => {
  try {
    const { careerId } = req.params;
    const { careerName } = req.query;

    // Validate API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      return res.status(500).json({ 
        error: 'Gemini API key not configured',
        message: 'Please set GEMINI_API_KEY in your .env file. Get your API key from https://aistudio.google.com/app/apikey'
      });
    }
    
    // Warn if using wrong type of key
    if (apiKey.trim().startsWith('AQ.')) {
      return res.status(500).json({ 
        error: 'Invalid API key type',
        message: 'Your API key appears to be from Google Cloud Console. Get a Google AI Studio API key from https://aistudio.google.com/app/apikey'
      });
    }

    // Initialize Gemini client and get the model
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Provide salary insights for the career: ${careerName || careerId} in India.

IMPORTANT: You must respond with ONLY valid JSON array. Do not include any explanatory text before or after the JSON. Your response must start with [ and end with ].

Return a JSON array with salary data for different years of experience:
[
  {
    "year": 0,
    "minSalary": 300000,
    "avgSalary": 500000,
    "maxSalary": 800000
  },
  {
    "year": 5,
    "minSalary": 600000,
    "avgSalary": 1000000,
    "maxSalary": 1500000
  },
  {
    "year": 10,
    "minSalary": 1200000,
    "avgSalary": 2000000,
    "maxSalary": 3000000
  },
  {
    "year": 15,
    "minSalary": 2000000,
    "avgSalary": 3500000,
    "maxSalary": 5000000
  },
  {
    "year": 20,
    "minSalary": 3000000,
    "avgSalary": 5000000,
    "maxSalary": 8000000
  }
]

Provide realistic salary data in INR (Indian Rupees) based on the current Indian job market. Return ONLY the JSON array, no other text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    let jsonText = text.trim();
    
    // Remove markdown code blocks if present
    if (jsonText.includes('```json')) {
      const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1].trim();
      }
    } else if (jsonText.includes('```')) {
      const jsonMatch = jsonText.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1].trim();
      }
    }

    // Try to extract JSON array if there's extra text
    const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    const salaryInsights = JSON.parse(jsonText);

    res.json(Array.isArray(salaryInsights) ? salaryInsights : []);
  } catch (error: any) {
    console.error('Error fetching salary insights:', error);
    if (error.status === 401) {
      const apiKey = process.env.GEMINI_API_KEY || '';
      let errorMessage = 'Invalid API key. Please check your GEMINI_API_KEY in the .env file.';
      let solution = 'Get a valid API key from https://aistudio.google.com/app/apikey';
      
      if (apiKey.trim().startsWith('AQ.')) {
        errorMessage = 'You are using a Google Cloud Console API key, but this package requires a Google AI Studio API key.';
        solution = 'Get the correct API key from https://aistudio.google.com/app/apikey (keys start with "AIza...")';
      }
      
      return res.status(500).json({ 
        error: 'Gemini API authentication failed',
        message: errorMessage,
        solution: solution
      });
    }
    res.status(500).json({ 
      error: 'Failed to fetch salary insights',
      details: error.message || 'Unknown error'
    });
  }
};

// Streaming endpoint for real-time responses
export const streamAIGuidance = async (req: Request, res: Response) => {
  try {
    const data = aiGuidanceSchema.parse(req.body);
    const { interests, strengths, goals, budget, location } = data;

    // Validate API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      return res.status(500).json({ 
        error: 'Gemini API key not configured',
        message: 'Please set GEMINI_API_KEY in your .env file. Get your API key from https://aistudio.google.com/app/apikey'
      });
    }
    
    // Warn if using wrong type of key
    if (apiKey.trim().startsWith('AQ.')) {
      return res.status(500).json({ 
        error: 'Invalid API key type',
        message: 'Your API key appears to be from Google Cloud Console. Get a Google AI Studio API key from https://aistudio.google.com/app/apikey'
      });
    }

    // Set up SSE (Server-Sent Events) headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Initialize Gemini client and get the model
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a career guidance counselor. Based on the following information, provide detailed career recommendations:

Interests: ${interests.join(', ')}
Strengths: ${strengths.join(', ')}
Goals: ${goals.join(', ')}
Budget: ${budget ? `₹${budget.toLocaleString()}` : 'Not specified'}
Location: ${location || 'Not specified'}

Provide a comprehensive career guidance response with:
1. Recommended stream (Science, Commerce, or Arts) with reasoning
2. List of recommended careers with descriptions and salary insights
3. List of recommended colleges
4. List of recommended coaching centers
5. List of recommended PG options
6. Complete package recommendations (college + PG combinations)

Format your response in a clear, structured way.`;

    try {
      const result = await model.generateContentStream(prompt);
      
      // Stream the response chunks
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        res.write(`data: ${JSON.stringify({ content: chunkText })}\n\n`);
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (streamError: any) {
      console.error('Error streaming response:', streamError);
      if (streamError.status === 401) {
        res.write(`data: ${JSON.stringify({ error: 'Gemini API authentication failed. Please check your API key.' })}\n\n`);
      } else {
        res.write(`data: ${JSON.stringify({ error: 'Failed to stream response', details: streamError.message })}\n\n`);
      }
      res.end();
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    console.error('Error streaming AI guidance:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Failed to stream AI guidance',
        details: errorMessage 
      });
    }
  }
};
