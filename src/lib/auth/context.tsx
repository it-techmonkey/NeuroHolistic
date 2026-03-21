'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

export type UserRole = 'client' | 'therapist' | 'founder' | null;

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  isLoading: true,
  isAuthenticated: false,
  refreshAuth: async () => {},
});

async function fetchRole(userId: string): Promise<UserRole> {
  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();
  return (data?.role as UserRole) ?? 'client';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Track if we're mid-fetch to avoid double-setting isLoading
  const initDone = useRef(false);

  const refreshAuth = async () => {
    try {
      // Always use getUser() (server-validated) not getSession() (client-only)
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        setUser(currentUser);
        const r = await fetchRole(currentUser.id);
        setRole(r);
      } else {
        setUser(null);
        setRole(null);
      }
    } catch {
      setUser(null);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial auth check
    refreshAuth();
    initDone.current = true;

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setRole(null);
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          // Fetch role for every meaningful auth event
          const r = await fetchRole(session.user.id);
          setRole(r);
        } else {
          setUser(null);
          setRole(null);
        }
        // Always resolve loading
        setIsLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoading,
        isAuthenticated: !!user,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
