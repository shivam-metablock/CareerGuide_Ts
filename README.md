# Backend API

Express + TypeScript + PostgreSQL + Prisma backend for the Career Guidance Platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/coaching_db?schema=public"
PORT=3001
NODE_ENV=development
GEMINI_API_KEY="your_gemini_api_key_here"
```

**⚠️ IMPORTANT:** You need a **Google AI Studio API key**, NOT a Google Cloud Console API key.

### Getting the Correct API Key

1. **Go to Google AI Studio**: https://aistudio.google.com/app/apikey
2. **Sign in** with your Google account
3. **Click "Create API Key"** or "Get API Key"
4. **Copy the API key** (it should start with `AIza...`)
5. **Add it to your `.env` file**: `GEMINI_API_KEY=AIza...`

**Note:** 
- ✅ **Google AI Studio** (aistudio.google.com) - Free, simple API keys - **USE THIS**
- ❌ **Google Cloud Console** (console.cloud.google.com) - Requires OAuth2, different service - **NOT THIS**

### Troubleshooting Gemini API

If you see an error like "API keys are not supported by this API":
1. **You're using the wrong type of API key** - Make sure you got it from [Google AI Studio](https://aistudio.google.com/app/apikey), NOT Google Cloud Console
2. Google AI Studio API keys usually start with `AIza...`
3. Google Cloud Console API keys start with `AQ.` or other formats - these won't work
4. Make sure your `.env` file is in the `backend` directory (same level as `package.json`)
5. Verify the API key is set correctly: `GEMINI_API_KEY=AIza...` (no quotes needed, but quotes are okay)
6. Restart your development server after adding the API key
7. Check that the API key is valid and active in Google AI Studio

3. Generate Prisma client:
```bash
npm run prisma:generate
```

4. Run migrations:
```bash
npm run prisma:migrate
```

5. Start development server:
```bash
npm run dev
```

## API Routes

- `/api/careers` - Career endpoints
- `/api/streams` - Stream endpoints
- `/api/coaching` - Coaching center endpoints
- `/api/budget` - Budget calculator endpoints
- `/api/ai` - AI guidance endpoints
- `/api/health` - Health check

