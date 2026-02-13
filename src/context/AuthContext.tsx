import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Client-side fallback for admin check (used until edge function is redeployed)
  // TODO: Remove this fallback once the edge function is deployed with isAdmin support
  const ADMIN_EMAIL_FALLBACK = (import.meta.env.VITE_ADMIN_EMAIL || '').trim().toLowerCase();

  // Fetch admin status from server, with client-side fallback
  const fetchAdminStatus = useCallback(async (accessToken: string, userEmail?: string) => {
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f02c4c3b/user/profile`,
        {
          headers: {
            apikey: publicAnonKey,
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (typeof data.isAdmin === 'boolean') {
          // Server returned isAdmin — use it (edge function is up to date)
          setIsAdmin(data.isAdmin);
        } else {
          // Server didn't return isAdmin — fallback to client-side check
          setIsAdmin(!!(userEmail && ADMIN_EMAIL_FALLBACK && userEmail.toLowerCase() === ADMIN_EMAIL_FALLBACK));
        }
      } else {
        // Request failed — fallback to client-side check
        setIsAdmin(!!(userEmail && ADMIN_EMAIL_FALLBACK && userEmail.toLowerCase() === ADMIN_EMAIL_FALLBACK));
      }
    } catch {
      // Network error — fallback to client-side check
      setIsAdmin(!!(userEmail && ADMIN_EMAIL_FALLBACK && userEmail.toLowerCase() === ADMIN_EMAIL_FALLBACK));
    }
  }, [ADMIN_EMAIL_FALLBACK]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.access_token) {
        fetchAdminStatus(session.access_token, session.user?.email);
      }
      setIsLoading(false);
    });

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.access_token) {
        fetchAdminStatus(session.access_token, session.user?.email);
      } else {
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchAdminStatus]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  }, []);

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth state from any component
 *
 * Usage:
 *   const { user, isAuthenticated, isAdmin, signOut } = useAuth();
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
