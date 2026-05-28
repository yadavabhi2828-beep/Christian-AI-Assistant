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
- Anthropic Claude `claude-sonnet-4-20250514`
- Pollinations.ai for Christian image generation

## Local Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Environment Variables

- `ANTHROPIC_API_KEY` - Anthropic API key for live assistant calls
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
- Set `ANTHROPIC_API_KEY` in the backend environment.

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
