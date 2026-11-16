import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { api } from '@/api/db';
import { queryClientInstance } from '@/lib/query-client';

const AuthContext = createContext();

// Tracks the Supabase session. Visitors without an account are signed in as a
// guest (anonymous user) so they land in a private demo workspace instead of
// a login wall. Pages read the profile through useMe().
export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [guestError, setGuestError] = useState(null);
  const guestRequest = useRef(null);

  useEffect(() => {
    let active = true;
    api.auth
      .getSession()
      .then((s) => active && setSession(s))
      .catch(() => active && setSession(null))
      .finally(() => active && setIsLoadingAuth(false));

    const sub = api.auth.onChange((event, s) => {
      setSession(s);
      // A different user (or none) means cached data belongs to someone else.
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') queryClientInstance.clear();
    });
    return () => {
      active = false;
      sub.unsubscribe();
    };
  }, []);

  // Starts a guest session once, even if several components ask at the same time.
  const ensureGuest = useCallback(() => {
    if (!guestRequest.current) {
      guestRequest.current = api.auth.signInAsGuest().catch((err) => {
        setGuestError(err.message || 'Could not start the demo');
        guestRequest.current = null;
      });
    }
    return guestRequest.current;
  }, []);

  const isGuest = Boolean(session?.user?.is_anonymous);

  const logout = async () => {
    await api.auth.logout();
    // Guests "sign out" into a fresh demo; real users go back to the login page.
    window.location.href = isGuest ? '/' : '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        isAuthenticated: Boolean(session),
        isGuest,
        isLoadingAuth,
        guestError,
        ensureGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
