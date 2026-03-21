'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

export type UserRole = 'client' | 'therapist' | null;

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  isLoading: true,
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check current session
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          console.log('[AuthContext] Session found for user:', session.user.id);
          setUser(session.user);
          // Fetch user role from database
          const { data } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (data) {
            setRole(data.role as UserRole);
          }
        } else {
          console.log('[AuthContext] No session found on initial load');
        }
      } catch (error) {
        console.error('[AuthContext] Error checking auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthContext] Auth state changed:', event, session?.user?.id);
      
      if (session?.user) {
        setUser(session.user);

        // Fetch role on auth change
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const { data } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (data) {
            setRole(data.role as UserRole);
          }
        }
      } else {
        setUser(null);
        setRole(null);
      }
    });

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
