# NeuralCards 🧠

> An AI/ML flashcard app I built to help people (and myself) actually learn machine learning properly.

**Live → [neural-cards.vercel.app](https://neural-cards.vercel.app)**

[![CI](https://github.com/vaibhavkmishra0327-hash/Neural-Cards/actions/workflows/ci.yml/badge.svg)](https://github.com/vaibhavkmishra0327-hash/Neural-Cards/actions)

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
- **Hosting:** Vercal

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

## Contributing

If you want to contribute, feel free to fork and open a PR. The usual flow:

```bash
npm ci
npm run validate:local
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

