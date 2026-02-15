import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Wifi, Bell, Zap } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true); // eslint-disable-line react-hooks/set-state-in-effect
      return;
    }

    // Check if user dismissed recently
    const dismissedAt = localStorage.getItem('pwa-dismissed');
    if (dismissedAt) {
      const dismissedDate = new Date(dismissedAt);
      const daysSince = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) return; // Don't show for 7 days after dismissal
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show banner after a short delay (don't interrupt immediately)
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Detect if app was installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
    setShowBanner(false);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShowBanner(false);
    localStorage.setItem('pwa-dismissed', new Date().toISOString());
  }, []);

  if (isInstalled) return null;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-sm z-50"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Gradient top bar */}
            <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500" />

            <div className="p-4">
              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>

              {/* Content */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shrink-0">
                  <Smartphone className="h-6 w-6 text-white" />
                </div>
                <div className="pr-6">
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                    Install NeuralCards
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Get the full app experience on your device
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="flex flex-col items-center gap-1 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Wifi className="h-4 w-4 text-blue-500" />
                  <span className="text-[10px] text-gray-600 dark:text-gray-400">Offline</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Bell className="h-4 w-4 text-amber-500" />
                  <span className="text-[10px] text-gray-600 dark:text-gray-400">Reminders</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Zap className="h-4 w-4 text-green-500" />
                  <span className="text-[10px] text-gray-600 dark:text-gray-400">Fast</span>
                </div>
              </div>

              {/* Install Button */}
              <button
                onClick={handleInstall}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-sm hover:from-purple-700 hover:to-pink-700 transition flex items-center justify-center gap-2 shadow-lg"
              >
                <Download className="h-4 w-4" />
                Install App
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * iOS-specific install instructions (iOS doesn't support beforeinstallprompt)
 */
export function IOSInstallHint() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Detect iOS Safari without PWA
    const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isSafari =
      /safari/.test(navigator.userAgent.toLowerCase()) &&
      !/chrome/.test(navigator.userAgent.toLowerCase());

    if (isIOS && !isStandalone && isSafari) {
      const dismissed = localStorage.getItem('ios-hint-dismissed');
      if (!dismissed) {
        setTimeout(() => setShow(true), 5000);
      }
    }
  }, []);

  if (!show) return null;

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-4 left-4 right-4 z-50"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4">
        <button
          onClick={() => {
            setShow(false);
            localStorage.setItem('ios-hint-dismissed', 'true');
          }}
          title="Dismiss"
          aria-label="Dismiss install hint"
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center"
        >
          <X className="h-4 w-4 text-gray-400" />
        </button>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          📱 Install NeuralCards: Tap{' '}
          <span className="inline-block mx-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
            Share ↗
          </span>{' '}
          then <strong>&quot;Add to Home Screen&quot;</strong>
        </p>
      </div>
    </motion.div>
  );
}
