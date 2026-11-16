import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/api/db';
import { queryClientInstance } from '@/lib/query-client';

const AuthContext = createContext();

// Tracks the Supabase session. Pages read the profile through useMe(); this
// context only answers "is someone signed in?".
export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    let active = true;
    api.auth
      .getSession()
      .then((s) => active && setSession(s))
      .catch(() => active && setSession(null))
      .finally(() => active && setIsLoadingAuth(false));

    const sub = api.auth.onChange((event, s) => {
      setSession(s);
      if (event === 'PASSWORD_RECOVERY') setIsRecovery(true);
      // A different user (or none) means cached data belongs to someone else.
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') queryClientInstance.clear();
    });
    return () => {
      active = false;
      sub.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await api.auth.logout();
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        isAuthenticated: Boolean(session),
        isLoadingAuth,
        isRecovery,
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
