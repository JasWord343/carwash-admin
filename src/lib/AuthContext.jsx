import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import { base44 } from "@/api/base44Client";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

const AuthContext = createContext(null);

function normalizeUser(user) {
  return user ?? null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState(null);

  const refreshUser = async () => {
    setIsLoadingAuth(true);

    try {
      const currentUser = await base44.auth.me();
      setUser(normalizeUser(currentUser));
      setAuthError(null);
    } catch (error) {
      setUser(null);
      setAuthError(error);
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return undefined;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      refreshUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoadingAuth,
      isLoadingPublicSettings: false,
      authError,
      appPublicSettings: { mode: isSupabaseConfigured ? "supabase" : "local" },
      authChecked,
      async signIn(credentials) {
        const nextUser = await base44.auth.login(credentials);
        setUser(normalizeUser(nextUser));
        setAuthChecked(true);
        setAuthError(null);
        return nextUser;
      },
      async logout() {
        await base44.auth.logout();
        setUser(null);
      },
      async navigateToLogin() {
        return null;
      },
      checkUserAuth: refreshUser,
      checkAppState: refreshUser,
    }),
    [authChecked, authError, isLoadingAuth, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
