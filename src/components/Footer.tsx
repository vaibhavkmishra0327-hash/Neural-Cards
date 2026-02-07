import { Brain, Github, Linkedin, Mail, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  // Helper to handle internal navigation
  const handleNavClick = (e: React.MouseEvent, page: string) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(page);
      window.scrollTo(0, 0); // Footer se click karne par upar scroll karo
    }
  };

  // Data Structure for Links (Industry Standard: Configuration driven UI)
  const learningPaths = [
    { label: 'Math for ML', page: 'paths' },
    { label: 'Python for AI', page: 'paths' },
    { label: 'Machine Learning', page: 'paths' },
    { label: 'Deep Learning', page: 'paths' },
  ];

  const companyLinks = [
    { label: 'About Us', page: 'about' },
    { label: 'Topics', page: 'all-practice' },
    { label: 'Dashboard', page: 'dashboard' },
  ];

  return (
    <footer className="bg-white dark:bg-[#0a0a0a] border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* 1. Brand Section */}
          <div className="md:col-span-1 space-y-4">
            <div
              className="flex items-center gap-2 cursor-pointer group"
              onClick={(e) => handleNavClick(e, 'home')}
            >
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg group-hover:scale-110 transition-transform">
                <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                NeuralCards
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Master complex AI concepts faster using our science-backed spaced repetition
              algorithms. Built for serious learners.
            </p>

            {/* Social Links */}
            <div className="flex gap-4 pt-2">
              <SocialLink
                href="https://github.com/vaibhavkmishra0327-hash"
                icon={<Github className="h-5 w-5" />}
              />
              <SocialLink
                href="https://www.linkedin.com/in/vaibhav-kumar-mishra-084049357"
                icon={<Linkedin className="h-5 w-5" />}
              />
              <SocialLink
                href="mailto:vaibhavkmishra0327@gmail.com"
                icon={<Mail className="h-5 w-5" />}
              />
            </div>
          </div>

          {/* 2. Learning Paths */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Learning Paths</h3>
            <ul className="space-y-3 text-sm">
              {learningPaths.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={(e) => handleNavClick(e, link.page)}
                    className="text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Resources (Internal Nav) */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Resources</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <button
                  onClick={(e) => handleNavClick(e, 'blog')}
                  className="text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-left"
                >
                  AI Blog
                </button>
              </li>
              <li>
                <button
                  onClick={(e) => handleNavClick(e, 'all-practice')}
                  className="text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-left"
                >
                  Practice Hub
                </button>
              </li>
              <li>
                <a
                  href="https://github.com/vaibhavkmishra0327-hash/Neural-Cards"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  GitHub Repo
                </a>
              </li>
            </ul>
          </div>

          {/* 4. Company (Internal Nav) */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Platform</h3>
            <ul className="space-y-3 text-sm">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={(e) => handleNavClick(e, link.page)}
                    className="text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
          <div className="flex items-center gap-1">
            © {new Date().getFullYear()} NeuralCards. Made with{' '}
            <Heart className="h-3 w-3 text-red-500 fill-current" /> by Vaibhav.
          </div>
          <div className="flex gap-6">
            <button
              onClick={(e) => handleNavClick(e, 'about')}
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              About Us
            </button>
            <a
              href="mailto:vaibhavkmishra0327@gmail.com"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Small Helper Component for Social Icons to avoid repetition
function SocialLink({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300"
    >
      {icon}
    </a>
  );
}
