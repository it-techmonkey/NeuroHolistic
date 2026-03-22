'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

// ── Types ──────────────────────────────────────────────────────────────────────

export type UserRole = 'client' | 'therapist' | 'founder' | null;

interface AuthContextValue {
  user: User | null;
  role: UserRole;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// ── Context ────────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue>({
  user: null,
  role: null,
  isLoading: true,
  isAuthenticated: false,
});

// ── Provider ───────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);
  const requestSeqRef = useRef(0);

  async function resolveAuthSnapshot() {
    const currentRequestSeq = ++requestSeqRef.current;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        cache: 'no-store',
        credentials: 'include',
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Auth snapshot failed with status ${response.status}`);
      }

      const payload = (await response.json()) as {
        authenticated: boolean;
        role: UserRole;
      };

      if (!isMountedRef.current || currentRequestSeq !== requestSeqRef.current) {
        return;
      }

      if (!payload.authenticated) {
        setUser(null);
        setRole(null);
        return;
      }

      setRole(payload.role ?? 'client');
    } catch (error) {
      if (!isMountedRef.current || currentRequestSeq !== requestSeqRef.current) {
        return;
      }

      // If role resolution fails, keep app usable and rely on middleware for enforcement.
      setRole((prevRole) => prevRole ?? 'client');
      console.error('[AuthContext] Failed to resolve server auth snapshot:', error);
    } finally {
      clearTimeout(timeoutId);

      if (!isMountedRef.current || currentRequestSeq !== requestSeqRef.current) {
        return;
      }

      setIsLoading(false);
    }
  }

  useEffect(() => {
    isMountedRef.current = true;

    const bootstrap = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!isMountedRef.current) return;

        setUser(session?.user ?? null);

        if (!session?.user) {
          setRole(null);
          setIsLoading(false);
          return;
        }

        await resolveAuthSnapshot();
      } catch (error) {
        if (!isMountedRef.current) return;
        setUser(null);
        setRole(null);
        setIsLoading(false);
        console.error('[AuthContext] Bootstrap failed:', error);
      }
    };

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMountedRef.current) return;

      setUser(session?.user ?? null);

      if (!session?.user) {
        setRole(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      await resolveAuthSnapshot();
    });

    return () => {
      isMountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, isLoading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
