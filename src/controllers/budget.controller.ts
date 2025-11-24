import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

const budgetCalculationSchema = z.object({
  budgetType: z.enum(['College', 'PG', 'Both']),
  totalBudget: z.number().positive(),
  city: z.string().optional(),
  state: z.string().optional(),
});

// Initialize Gemini AI client (lazy initialization)
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }
  return new GoogleGenerativeAI(apiKey);
};

export const calculateBudget = async (req: Request, res: Response) => {
  try {
    const data = budgetCalculationSchema.parse(req.body);
    const { budgetType, totalBudget, city, state } = data;

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

    // Create a comprehensive prompt for budget calculation
    const locationInfo = city && state ? `${city}, ${state}` : city || state || 'India';
    const budgetAllocation = budgetType === 'Both' 
      ? `College: 70% (₹${(totalBudget * 0.7).toLocaleString()}), PG: 30% (₹${(totalBudget * 0.3).toLocaleString()})`
      : `Full budget: ₹${totalBudget.toLocaleString()}`;

    const prompt = `You are a budget planning advisor for students. Based on the following budget requirements, provide detailed recommendations.

Budget Requirements:
- Budget Type: ${budgetType}
- Total Budget: ₹${totalBudget.toLocaleString()}
- Location: ${locationInfo}
- Budget Allocation: ${budgetAllocation}

IMPORTANT: You must respond with ONLY valid JSON. Do not include any explanatory text before or after the JSON. Your response must start with { and end with }.

Return the response in this exact JSON format:
{
  "colleges": [
    {
      "id": "unique-id-1",
      "name": "College name",
      "city": "City name",
      "state": "State name",
      "fees": 500000,
      "courses": ["Course 1", "Course 2"],
      "website": "https://example.com",
      "description": "Brief description"
    }
  ],
  "pgs": [
    {
      "id": "unique-id-1",
      "name": "PG name",
      "address": "Full address",
      "city": "City name",
      "monthlyRent": 15000,
      "ownerName": "Owner name",
      "ownerPhone": "Phone number",
      "amenities": ["WiFi", "AC", "Food"],
      "description": "Brief description"
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

Requirements:
${budgetType === 'College' || budgetType === 'Both' 
  ? `- Provide at least 10 colleges within budget (${budgetType === 'Both' ? '70% of total budget' : 'full budget'}) in ${locationInfo}`
  : ''}
${budgetType === 'PG' || budgetType === 'Both' 
  ? `- Provide at least 10 PG options within budget (${budgetType === 'Both' ? '30% of total budget annually' : 'full budget annually'}) in ${locationInfo}`
  : ''}
${budgetType === 'Both' 
  ? `- Provide at least 15 best college + PG combinations where total cost (college fees + annual PG rent) is within ₹${totalBudget.toLocaleString()}`
  : ''}
- All recommendations must be realistic and relevant to ${locationInfo}
- College fees should be annual fees
- PG monthly rent should be realistic for ${locationInfo}
- Sort recommendations by total cost (lowest first) if budgetType is "Both"
- Ensure all data is accurate and realistic

Return ONLY the JSON object, no other text.`;

    let text = '';
    try {
      const geminiResult = await model.generateContent(prompt);
      const response = await geminiResult.response;
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

      const budgetData = JSON.parse(jsonText);

      // Validate and filter results based on budget
      let colleges = Array.isArray(budgetData.colleges) ? budgetData.colleges : [];
      let pgs = Array.isArray(budgetData.pgs) ? budgetData.pgs : [];
      let recommendations = Array.isArray(budgetData.recommendations) ? budgetData.recommendations : [];

      // Ensure all items have IDs
      colleges = colleges.map((college: any, index: number) => ({
        ...college,
        id: college.id || `college-${index}-${Date.now()}`,
      }));
      pgs = pgs.map((pg: any, index: number) => ({
        ...pg,
        id: pg.id || `pg-${index}-${Date.now()}`,
      }));

      // Filter colleges by budget
      if (budgetType === 'College' || budgetType === 'Both') {
        const maxCollegeBudget = budgetType === 'Both' ? totalBudget * 0.7 : totalBudget;
        colleges = colleges.filter((college: any) => {
          return college.fees && college.fees <= maxCollegeBudget;
        });
      } else {
        colleges = [];
      }

      // Filter PGs by budget
      if (budgetType === 'PG' || budgetType === 'Both') {
        const maxPGBudget = budgetType === 'Both' ? totalBudget * 0.3 : totalBudget;
        pgs = pgs.filter((pg: any) => {
          const annualCost = (pg.monthlyRent || 0) * 12;
          return annualCost <= maxPGBudget;
        });
      } else {
        pgs = [];
      }

      // Filter and sort recommendations
      if (budgetType === 'Both') {
        recommendations = recommendations
          .filter((rec: any) => {
            const totalCost = (rec.college?.fees || 0) + ((rec.pg?.monthlyRent || 0) * 12);
            return totalCost <= totalBudget;
          })
          .map((rec: any) => {
            const collegeFees = rec.college?.fees || 0;
            const pgAnnual = (rec.pg?.monthlyRent || 0) * 12;
            return {
              ...rec,
              totalCost: collegeFees + pgAnnual,
            };
          })
          .sort((a: any, b: any) => a.totalCost - b.totalCost)
          .slice(0, 20);
      } else {
        recommendations = [];
      }

      // Return the result
      const result = {
        budgetType,
        totalBudget,
        colleges: budgetType === 'College' || budgetType === 'Both' ? colleges : [],
        pgs: budgetType === 'PG' || budgetType === 'Both' ? pgs : [],
        recommendations: budgetType === 'Both' ? recommendations : [],
      };

      res.json(result);
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
    console.error('Error calculating budget:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Failed to calculate budget',
      details: errorMessage 
    });
  }
};

export const getBudgetRecommendations = async (req: Request, res: Response) => {
  try {
    const data = budgetCalculationSchema.parse(req.body);
    return calculateBudget(req, res);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    console.error('Error getting recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
};

