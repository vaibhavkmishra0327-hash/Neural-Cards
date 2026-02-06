# NeuralCards 🧠

> An AI/ML flashcard app I built to help people (and myself) actually learn machine learning properly.

**Live → [neuralcards-app.netlify.app](https://neuralcards-app.netlify.app)**

[![CI](https://github.com/vaibhavkmishra0327-hash/Neural-Cards/actions/workflows/ci.yml/badge.svg)](https://github.com/vaibhavkmishra0327-hash/Neural-Cards/actions)
[![Netlify Status](https://api.netlify.com/api/v1/badges/693d0c97-fe56-46d2-9743-ffcd77135f35/deploy-status)](https://app.netlify.com/projects/neuralcards-app/deploys)

---

## What is this?

I was studying AI/ML and realized there's no good flashcard app specifically for it. Anki is great but making cards is painful, and most learning platforms don't have active recall built in. So I built NeuralCards — it has interactive flashcards, structured learning paths, spaced repetition, and even AI-generated content through Groq.

It's a full-stack React app with Supabase on the backend. You can sign in with Google/GitHub, practice flashcards across 50+ topics, follow 7 curated learning paths from math basics to interview prep, and track your progress on a personal dashboard.

---

## Features

**Flashcards** — Flip-to-reveal cards with smooth animations. The AI can generate new cards on any topic using Groq API (proxied through Edge Functions so the API key stays safe).

**Learning Paths** — I put together 7 paths that cover everything:
1. Math for ML (linear algebra, calculus, stats)
2. Python for AI (numpy, pandas, sklearn)
3. ML Fundamentals (regression, classification, clustering)
4. Deep Learning (CNNs, RNNs, transformers)
5. Modern AI (GPT, BERT, diffusion models, RL)
6. MLOps & Deployment (Docker, CI/CD, monitoring)
7. Interview Prep (system design, coding, case studies)

**Spaced Repetition** — Uses the SM-2 algorithm to schedule cards based on how well you know them. Cards you struggle with show up more often.

**Dashboard** — Track your study streaks, accuracy, cards studied, and path completion.

**Blog** — Articles on AI topics like transformers, neural networks, etc.

**Dark/Light Mode** — Switches with your system preference or manually.

**Auth** — Google and GitHub OAuth through Supabase. Guests can browse around but need to sign in to actually practice or access the dashboard.

---

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS, Radix UI, Framer Motion
- **Backend:** Supabase (Postgres, Auth, Edge Functions)
- **AI:** Groq API via Edge Function proxy
- **Testing:** Vitest
- **CI/CD:** GitHub Actions
- **Hosting:** Netlify

---

## Project Structure

```
src/
├── components/
│   ├── ui/                  -- reusable UI components (radix-based)
│   ├── HomePage.tsx         -- landing page
│   ├── PracticeHub.tsx      -- topic/chapter selection
│   ├── FlashcardPractice.tsx -- the actual flashcard study screen
│   ├── LearningPathList.tsx -- all paths overview
│   ├── LearningPathView.tsx -- single path with progress nodes
│   ├── Dashboard.tsx        -- stats and progress tracking
│   ├── BlogList.tsx         -- blog listing
│   ├── AuthPage.tsx         -- login page (OAuth)
│   ├── Header.tsx           -- nav bar (auth-aware)
│   └── ProtectedRoute.tsx   -- redirects guests to login
├── context/                 -- Auth and Theme context providers
├── data/                    -- API calls, course content, learning paths
├── hooks/                   -- custom hooks
├── types/                   -- TypeScript types
├── utils/                   -- cache, logger, spaced repetition logic
│   └── supabase/            -- supabase client setup
├── supabase/functions/      -- edge functions (hono server, AI proxy)
└── App.tsx                  -- root component + routing
```

---

## Getting Started

You need **Node.js 20+** and a [Supabase](https://supabase.com) project (free tier is fine).

```bash
# clone it
git clone https://github.com/vaibhavkmishra0327-hash/Neural-Cards.git
cd Neural-Cards

# install deps
npm install

# create .env file
# VITE_SUPABASE_URL=your_url
# VITE_SUPABASE_ANON_KEY=your_key
# VITE_ADMIN_EMAIL=your_email

# run it
npm run dev
```

Should open at `http://localhost:5173`.

### Other Commands

```bash
npm run build         # production build
npm run preview       # preview the build locally
npm run test:run      # run tests
npm run type-check    # typescript check
npm run format:check  # prettier check
```

---

## Deployment

The app is currently live on Netlify: **https://neuralcards-app.netlify.app**

If you want to deploy your own:

1. Fork this repo
2. Go to [Netlify](https://app.netlify.com) → Add new site → Import from GitHub
3. Set build command to `npm run build` and publish directory to `dist`
4. Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as env variables
5. Deploy

It also works on Vercel, Railway, or any static hosting — just deploy the `dist` folder.

> **Important:** After deploying, add your site URL to Supabase → Auth → URL Configuration → Redirect URLs, otherwise OAuth won't work on the live site.

---

## Security Stuff

- API keys are never in the client bundle — Groq requests go through Supabase Edge Functions
- Auth is OAuth only (Google/GitHub) — I don't store any passwords
- CORS is locked down on API endpoints
- Protected routes redirect to login if you're not signed in
- Console logs are stripped in production builds

---

## Contributing

If you want to contribute, feel free to fork and open a PR. The usual flow:

```bash
git checkout -b feature/your-feature
git commit -m "add your feature"
git push origin feature/your-feature
```

Then open a pull request. I'll review it.

---

## License

MIT — do whatever you want with it.

---

**Made by [Vaibhav Mishra](https://github.com/vaibhavkmishra0327-hash)**

If you found this helpful, a ⭐ on the repo would mean a lot!


