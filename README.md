# Christian AI Assistant

A scripture-grounded, denomination-aware Christian AI assistant with safe image generation, moderation, and hallucination prevention.

## What It Does

- Answers Christianity-related questions
- Generates Christian content
- Supports Christian-themed image requests
- Stays aligned with biblical context
- Avoids hallucinated scripture references
- Rejects offensive, hateful, or heretical prompts
- Preserves a warm, conversational tone

## Tech Stack

- React + Vite frontend
- Express backend proxy
- Gemini 2.5 Flash, Gemini 3.5 Flash, and Gemini 2.5 Flash Lite with failover
- Pollinations.ai for Christian image generation

## Local Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Environment Variables

- `GEMINI_API_KEY` - Gemini API key for live assistant calls
- `GEMINI_MODELS` - optional comma-separated failover order
- `VITE_API_BASE_URL` - backend base URL for the frontend in production
- `PORT` - backend port
- `USE_DEMO_FALLBACK` - keep a deterministic demo fallback enabled
- `EVAL_BACKEND_URL` - backend URL used by the eval runner

## Scripts

- `npm run dev` - start backend proxy and Vite together
- `npm run build` - build the frontend
- `npm run preview` - preview the production build
- `npm run eval` - run the local evaluation dataset against the backend

## Deployment

### Frontend

- Deploy the Vite client to Vercel.
- Set `VITE_API_BASE_URL` to the deployed backend URL.

### Backend Proxy

- Deploy `server/index.js` to Railway or Render.
- Set `GEMINI_API_KEY` in the backend environment.
- Optional: set `GEMINI_MODELS=gemini-2.5-flash,gemini-3.5-flash,gemini-2.5-flash-lite` to control failover order.

## Evaluation

The repo includes a small dataset for:

- hallucination tests
- adversarial prompts
- theological edge cases
- image safety cases

Run it with:

```bash
npm run eval
```

## Architecture Note

See [docs/architecture.md](./docs/architecture.md).

## Walkthrough

See [docs/walkthrough.md](./docs/walkthrough.md).
