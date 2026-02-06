import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import {
  Mail,
  Lock,
  Loader2,
  Github,
  ArrowRight,
  User,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { motion } from 'framer-motion';

// --- QUOTES DATA ---
const QUOTES = [
  {
    text: 'The beautiful thing about learning is that no one can take it away from you.',
    author: 'B.B. King',
  },
  {
    text: 'Live as if you were to die tomorrow. Learn as if you were to live forever.',
    author: 'Mahatma Gandhi',
  },
  {
    text: 'Education is the most powerful weapon which you can use to change the world.',
    author: 'Nelson Mandela',
  },
  { text: 'The expert in anything was once a beginner.', author: 'Helen Hayes' },
  {
    text: 'It is not knowledge, but the act of learning, not possession but the act of getting there, which grants the greatest enjoyment.',
    author: 'Carl Friedrich Gauss',
  },
];

interface AuthPageProps {
  onAuthenticated: (user: any, token: string) => void;
  onNavigate: (page: string) => void;
}

export function AuthPage({ onAuthenticated, onNavigate }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // State for Dynamic Quote
  const [quote, setQuote] = useState(QUOTES[0]);

  // Load Random Quote on Mount
  useEffect(() => {
    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setQuote(randomQuote);
  }, []);

  // 🔹 Social Login Handler
  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      setErrorMessage(error.message);
      setLoading(false);
    }
  };

  // 🔹 Email Auth Handler
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      if (isLogin) {
        // --- SIGN IN ---
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        if (data.session) {
          onAuthenticated(data.user, data.session.access_token);
        }
      } else {
        // --- SIGN UP ---
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });
        if (error) throw error;

        if (data.session) {
          onAuthenticated(data.user, data.session.access_token);
        } else {
          alert('Account created! Please check your email to confirm.');
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gray-50 dark:bg-black transition-colors duration-300">
      {/* Main Card Container (Light/Dark Compatible) */}
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-200 dark:border-slate-800 transition-colors duration-300">
        {/* Left Side: Artistic/Branding Section (Always Vibrant) */}
        <div className="md:w-1/2 bg-gradient-to-br from-purple-600 to-blue-600 p-12 flex flex-col justify-between relative overflow-hidden text-white">
          {/* Abstract Pattern Overlay */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>

          <div className="relative z-10">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </button>

            <h2 className="text-4xl font-bold mb-4 drop-shadow-md">
              {isLogin ? 'Welcome Back!' : 'Join the Revolution'}
            </h2>
            <p className="text-purple-100 text-lg leading-relaxed drop-shadow-sm">
              {isLogin
                ? 'Continue your learning streak. Your flashcards are waiting for you.'
                : 'Master AI concepts with interactive flashcards and personalized learning paths.'}
            </p>
          </div>

          <div className="relative z-10 mt-12">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 shadow-lg">
              <p className="italic text-lg">"{quote.text}"</p>
              <p className="text-purple-200 mt-3 text-sm font-bold tracking-wide uppercase">
                — {quote.author}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form (Light/Dark Mode Aware) */}
        <div className="md:w-1/2 p-8 md:p-12 bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <h3 className="text-2xl font-bold mb-2">
              {isLogin ? 'Sign in to your account' : 'Create an account'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrorMessage(null);
                }}
                className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-semibold transition-colors"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => handleSocialLogin('google')}
                className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </button>

              <button
                onClick={() => handleSocialLogin('github')}
                className="flex items-center justify-center gap-2 bg-gray-900 text-white py-2.5 rounded-lg hover:bg-gray-800 transition-colors font-medium border border-gray-900 dark:border-gray-700 shadow-sm"
              >
                <Github className="w-5 h-5" />
                GitHub
              </button>
            </div>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-black text-gray-500">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleAuth} className="space-y-4">
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/50 text-red-600 dark:text-red-500 p-3 rounded-lg text-sm flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errorMessage}
                </motion.div>
              )}

              {/* Full Name Field (Sign Up Only) */}
              {!isLogin && (
                <div className="space-y-2 animate-in slide-in-from-top-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder:text-gray-400"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder:text-gray-400"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder:text-gray-400"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mt-6 shadow-lg shadow-purple-500/30"
              >
                {loading ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
