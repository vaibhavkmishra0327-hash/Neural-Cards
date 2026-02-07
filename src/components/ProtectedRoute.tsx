import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { User } from '@supabase/supabase-js';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || '';

// Loading spinner while auth state resolves
const AuthLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
  </div>
);

interface ProtectedRouteProps {
  user: User | null;
  children: ReactNode;
  redirectTo?: string;
}

interface AdminRouteProps {
  user: User | null;
  children: ReactNode;
}

/**
 * ProtectedRoute - Requires authentication
 * Shows spinner while auth loads, then redirects if not logged in
 */
export function ProtectedRoute({ user, children, redirectTo = '/auth' }: ProtectedRouteProps) {
  const { isLoading } = useAuth();

  // Wait for auth to resolve before deciding
  if (isLoading) {
    return <AuthLoader />;
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }
  return <>{children}</>;
}

/**
 * AdminRoute - Requires authentication + admin email
 * Redirects to home with denied access if not an admin
 *
 * NOTE: This is a client-side guard for UX only.
 * Real authorization MUST be enforced server-side via:
 * - Supabase RLS policies
 * - Edge function middleware
 * - Database role checks
 */
export function AdminRoute({ user, children }: AdminRouteProps) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoader />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const isAdmin = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-center">
        <div>
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access this page.
          </p>
          <a
            href="/"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-block"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
