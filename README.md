<div align="center">

# 🧠 NeuralCards

### Master AI & Machine Learning with Interactive Flashcards

[![CI](https://github.com/vaibhavkmishra0327-hash/Neural-Cards/actions/workflows/ci.yml/badge.svg)](https://github.com/vaibhavkmishra0327-hash/Neural-Cards/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Netlify Status](https://api.netlify.com/api/v1/badges/693d0c97-fe56-46d2-9743-ffcd77135f35/deploy-status)](https://app.netlify.com/projects/neuralcards-app/deploys)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**NeuralCards** is a full-stack educational platform that helps you learn AI, Machine Learning, Deep Learning, and Data Science through interactive flashcards, structured learning paths, and spaced repetition — all powered by a modern React + Supabase stack.

[**🚀 Live Demo**](https://neuralcards-app.netlify.app) · [**✨ Features**](#-features) · [**🛠️ Tech Stack**](#%EF%B8%8F-tech-stack) · [**⚡ Quick Start**](#-quick-start)

</div>

---

## ✨ Features

### 🎴 Interactive Flashcards
- **Flip-to-reveal** cards with smooth animations
- **AI-generated** flashcard content via Groq API (proxied through secure Edge Functions)
- Topic-based practice covering **50+ AI/ML subjects**

### 🗺️ Structured Learning Paths
Seven curated paths take you from zero to interview-ready:

| # | Path | Topics |
|---|------|--------|
| 1 | **Math for Machine Learning** | Linear Algebra, Calculus, Probability & Statistics |
| 2 | **Python for AI** | NumPy, Pandas, Matplotlib, Scikit-learn |
| 3 | **Machine Learning Fundamentals** | Regression, Classification, Clustering, SVMs |
| 4 | **Deep Learning** | Neural Networks, CNNs, RNNs, Transformers |
| 5 | **Modern AI** | GPT, BERT, Diffusion Models, Reinforcement Learning |
| 6 | **MLOps & Deployment** | Docker, CI/CD, Model Serving, Monitoring |
| 7 | **Interview Preparation** | System Design, Coding Challenges, ML Case Studies |

### 🔁 Spaced Repetition
- **SM-2 algorithm** for optimal memory retention
- Intelligent card scheduling based on your performance
- Progress persistence across sessions

### 📊 Personal Dashboard
- Track cards studied, accuracy rates, and streaks
- View learning path completion percentages
- Session history and performance analytics

### 📝 AI/ML Blog
- Curated articles on trending AI topics
- In-depth technical posts on neural networks, transformers, and more

### 🔐 Authentication & Security
- OAuth login via **Google** and **GitHub** (Supabase Auth)
- Protected routes — guests can browse but Practice, Learning Paths, Blog, and Dashboard require login
- API keys secured via Supabase Edge Functions (never exposed to client)
- CORS-restricted API endpoints

### 🎨 Modern UI/UX
- **Dark / Light mode** with system preference detection
- Fully responsive (mobile, tablet, desktop)
- Smooth page transitions powered by Framer Motion
- Radix UI primitives + Tailwind CSS
- Built-in topic search

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript 5.6, Vite 6.4 |
| **Styling** | Tailwind CSS 4, Radix UI, Framer Motion |
| **Backend** | Supabase (PostgreSQL, Auth, Edge Functions) |
| **AI** | Groq API (via secure Edge Function proxy) |
| **Testing** | Vitest |
| **CI/CD** | GitHub Actions |
| **Deployment** | Netlify |

---

## 📁 Project Structure

```
neuralcards/
├── public/                  # Static assets & favicon
├── src/
│   ├── components/          # React components
│   │   ├── ui/              # Reusable UI primitives (Radix-based)
│   │   ├── HomePage.tsx     # Landing page with feature showcase
│   │   ├── PracticeHub.tsx  # Chapter selection for practice
│   │   ├── FlashcardPractice.tsx  # Flashcard flip & study
│   │   ├── LearningPathList.tsx   # All learning paths overview
│   │   ├── LearningPathView.tsx   # Single path with node map
│   │   ├── Dashboard.tsx    # User stats & progress tracking
│   │   ├── BlogList.tsx     # Blog articles listing
│   │   ├── AuthPage.tsx     # Login / Sign up (OAuth)
│   │   ├── Header.tsx       # Navigation with auth-aware items
│   │   └── ProtectedRoute.tsx # Route guard component
│   ├── context/             # React Context (Auth, Theme)
│   ├── data/                # API functions, course content, learning paths
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Helpers (cache, logger, spaced repetition)
│   │   └── supabase/        # Supabase client configuration
│   ├── supabase/functions/  # Edge Functions (Hono server, AI proxy)
│   └── App.tsx              # Root component with routing
├── .github/workflows/       # CI pipeline (lint, type-check, test, build)
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** 20+
- **npm** 10+
- A [Supabase](https://supabase.com) project (free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/vaibhavkmishra0327-hash/Neural-Cards.git
cd Neural-Cards
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ADMIN_EMAIL=your_admin_email@example.com
```

### 4. Start the development server

```bash
npm run dev
```

Open **http://localhost:5173** in your browser and start learning!

---

## 🧪 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run test:run` | Run all tests |
| `npm run type-check` | TypeScript type checking |
| `npm run format:check` | Prettier format verification |

---

## 🚀 Deployment

### Live Site

> **https://neuralcards-app.netlify.app**

### Deploy to Netlify (Recommended — Free)

1. Go to **[app.netlify.com](https://app.netlify.com)** and sign in with your GitHub account
2. Click **"Add new site"** → **"Import an existing project"** → Select the **Neural-Cards** repository
3. Netlify auto-detects Vite — configure:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy site**
6. Your app will be live at `https://your-site.netlify.app` ✅

> **Note:** After deploying, add your Netlify URL to Supabase → Authentication → URL Configuration → Redirect URLs so OAuth login works on the live site.

### Alternative Platforms

| Platform | How |
|----------|-----|
| **Vercel** | Connect repo → auto-detects Vite → add env vars → deploy |
| **GitHub Pages** | `npm run build` → deploy `dist/` with `gh-pages` |
| **Railway** | Connect repo → add env vars → auto-deploy |

---

## 🔒 Security

- **No API keys in client code** — Groq AI requests are proxied through Supabase Edge Functions
- **OAuth only** — no password storage; authentication handled by Google/GitHub via Supabase
- **CORS restricted** — API endpoints only accept requests from allowed origins
- **Protected routes** — content pages require authentication; unauthenticated users are redirected to login
- **Dev-only logging** — `console.log` calls stripped in production builds

---

## 📸 Preview

| | |
|---|---|
| 🏠 **Home** — Beautiful landing page with feature highlights and CTAs | 🎴 **Practice** — Flip through AI/ML flashcards with smooth animations |
| 🗺️ **Learning Paths** — Visual node-based maps tracking your progress | 📊 **Dashboard** — Personal stats, streaks, and completion tracking |
| 🌙 **Dark Mode** — Full dark theme with system preference detection | 📱 **Responsive** — Works perfectly on mobile, tablet, and desktop |

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a **Pull Request**

---

## 📄 License

This project is open source under the [MIT License](LICENSE).

---

## 👤 Author

**Vaibhav Mishra**
- GitHub: [@vaibhavkmishra0327-hash](https://github.com/vaibhavkmishra0327-hash)

---

<div align="center">

⭐ **Star this repo if you found it useful!** ⭐

Built with ❤️ for the AI/ML learning community

</div>


