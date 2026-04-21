import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import { dataApi } from "@/api/localDataClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const refreshUser = async () => {
    setIsLoadingAuth(true);

    try {
      const currentUser = await dataApi.auth.me();
      setUser(currentUser);
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoadingAuth,
      isLoadingPublicSettings: false,
      authError: null,
      appPublicSettings: { mode: "local" },
      authChecked,
      async signIn() {
        const nextUser = await dataApi.auth.login();
        setUser(nextUser);
        setAuthChecked(true);
        return nextUser;
      },
      logout() {
        dataApi.auth.logout();
        setUser(null);
      },
      navigateToLogin() {
        return dataApi.auth.login().then((nextUser) => {
          setUser(nextUser);
          setAuthChecked(true);
          return nextUser;
        });
      },
      checkUserAuth: refreshUser,
      checkAppState: refreshUser,
    }),
    [authChecked, isLoadingAuth, user],
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
