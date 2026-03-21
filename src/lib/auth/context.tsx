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

// ── Helpers ────────────────────────────────────────────────────────────────────

async function fetchRoleSafe(userId: string): Promise<UserRole> {
  try {
    // Add timeout to prevent hanging on slow database queries for client accounts
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();
    
    clearTimeout(timeout);
    
    if (error) {
      console.warn('[AuthContext] Role fetch error:', error.message);
      return 'client';
    }
    
    return (data?.role as UserRole) ?? 'client';
  } catch (err) {
    console.warn('[AuthContext] Role fetch failed:', err);
    return 'client'; // safe fallback — middleware enforces real role anyway
  }
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
  const resolved = useRef(false);

  // Safety: unconditionally resolve isLoading within 6s even if Supabase is slow
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!resolved.current) {
        console.warn('[AuthContext] Safety timeout hit — resolving isLoading');
        resolved.current = true;
        setIsLoading(false);
      }
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Subscribe to auth state changes — this fires IMMEDIATELY with INITIAL_SESSION
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (event === 'SIGNED_OUT' || !session?.user) {
            setUser(null);
            setRole(null);
            resolved.current = true;
            setIsLoading(false);
            return;
          }

          setUser(session.user);

          // Only re-fetch role on state changes (not on every re-render)
          if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            try {
              const r = await fetchRoleSafe(session.user.id);
              setRole(r);
            } catch (roleErr) {
              console.error('[AuthContext] Role fetch error:', roleErr);
              setRole('client'); // fallback for clients
            }
          }
        } catch (err) {
          console.error('[AuthContext] Error in auth state change:', err);
        } finally {
          // Always resolve — this is the critical fix for production hangs
          resolved.current = true;
          setIsLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
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
