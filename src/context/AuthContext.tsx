import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../lib/adminFirebase';

type AuthContextValue = { user: User | null; loading: boolean };

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      if (!mounted) return;
      setUser(nextUser);
      setLoading(false);
    });

    const timeout = window.setTimeout(() => mounted && setLoading(false), 2500);
    return () => {
      mounted = false;
      unsubscribe();
      window.clearTimeout(timeout);
    };
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
};
