import { Brain, Menu, X, Sun, Moon, LayoutDashboard, LogIn, ShieldAlert, Search, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  currentPage?: string;
  isAuthenticated?: boolean;
  onNavigate?: (page: string, data?: any) => void; // 👈 Updated type to accept data
  userEmail?: string;
}

export function Header({ currentPage = 'home', isAuthenticated = false, onNavigate, userEmail }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  
  // Search states
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'all-practice', label: 'Practice', icon: BookOpen },
    { id: 'paths', label: 'Learning Paths' },
    { id: 'blog', label: 'Blog' },
    { id: 'about', label: 'About' }
  ];

  const handleNavClick = (pageId: string) => {
    if (onNavigate) onNavigate(pageId);
    setMobileMenuOpen(false);
  };

  // 👇 SEARCH LOGIC (The Magic) 🪄
  const handleSearchSubmit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      if (onNavigate) {
        // Logic: Input "Linear Algebra" -> Slug "linear-algebra" -> Go to Practice
        const slug = searchQuery.toLowerCase().trim().replace(/ /g, '-');
        
        // Seedha Practice Page par le jao
        onNavigate('practice', { slug: slug, title: searchQuery });
        
        // Cleanup
        setSearchOpen(false);
        setSearchQuery('');
        setMobileMenuOpen(false);
      }
    }
  };

  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || '';

  return (
    <motion.header 
      className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, type: "spring" }}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => handleNavClick('home')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            role="link"
            aria-label="NeuralCards - Go to Home"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleNavClick('home')}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              whileHover={{ scale: 1.2, rotate: 180, transition: { duration: 0.5 } }}
              className="bg-purple-600 p-1.5 rounded-lg text-white"
            >
              <Brain className="h-6 w-6" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent hidden sm:block">
              NeuralCards
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item, index) => (
              <motion.button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-sm font-medium transition-colors relative px-2 py-1 ${
                  currentPage === item.id
                    ? 'text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400'
                }`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -2 }}
              >
                {item.label}
                {currentPage === item.id && (
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-purple-600 dark:bg-purple-400 rounded-full"
                    layoutId="activeNav"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}

            {userEmail === ADMIN_EMAIL && (
                <motion.button
                    onClick={() => handleNavClick('admin')}
                    className={`text-sm font-bold flex items-center gap-1 transition-colors px-3 py-1 rounded-full border ${
                        currentPage === 'admin'
                            ? 'bg-red-500/10 text-red-600 border-red-500/50'
                            : 'text-red-500 border-transparent hover:bg-red-500/10'
                    }`}
                    whileHover={{ scale: 1.05 }}
                >
                    <ShieldAlert className="w-4 h-4" />
                    Admin
                </motion.button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            
            {/* 👇 SEARCH BAR (Desktop) */}
            <div className="relative hidden md:flex items-center">
              <AnimatePresence>
                {searchOpen && (
                  <motion.input
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 200, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchSubmit}
                    placeholder="Search topic..."
                    className="bg-secondary/50 border border-border rounded-full px-4 py-1.5 text-sm outline-none focus:ring-2 focus:ring-purple-500 mr-2"
                    autoFocus
                  />
                )}
              </AnimatePresence>
              <motion.button 
                onClick={() => setSearchOpen(!searchOpen)}
                className={`p-2 rounded-full transition-colors ${searchOpen ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' : 'text-muted-foreground hover:bg-muted'}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Search Topics"
              >
                <Search className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors"
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {isDarkMode ? (
                  <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Sun className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Moon className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {isAuthenticated ? (
              <motion.button
                onClick={() => handleNavClick('dashboard')}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-medium transition-all shadow-lg shadow-purple-500/20 text-sm"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </motion.button>
            ) : (
              <motion.button
                onClick={() => handleNavClick('auth')}
                className="hidden md:flex items-center gap-2 px-5 py-2 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition-all text-sm"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </motion.button>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-muted-foreground hover:bg-muted rounded-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              className="md:hidden border-t border-border py-4 overflow-hidden bg-background/95 backdrop-blur-xl absolute top-16 left-0 right-0 shadow-xl"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div className="flex flex-col gap-2 px-4 pb-4">
                
                {/* Mobile Search */}
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="Search topics..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchSubmit}
                    className="w-full bg-secondary/50 border border-border rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {navItems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`text-left px-4 py-3 rounded-xl transition-colors ${
                      currentPage === item.id ? 'bg-purple-500/10 text-purple-600 font-semibold' : 'text-muted-foreground hover:bg-muted'
                    }`}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {item.label}
                  </motion.button>
                ))}

                {userEmail === ADMIN_EMAIL && (
                    <motion.button onClick={() => handleNavClick('admin')} className="text-left px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4" /> Admin Panel
                    </motion.button>
                )}
                
                <motion.button onClick={() => handleNavClick(isAuthenticated ? 'dashboard' : 'auth')} className={`mt-2 w-full px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${isAuthenticated ? 'bg-purple-600 text-white' : 'bg-foreground text-background'}`}>
                  {isAuthenticated ? <LayoutDashboard className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                  {isAuthenticated ? 'Go to Dashboard' : 'Sign In'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}