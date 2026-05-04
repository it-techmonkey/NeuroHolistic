'use client';

import { supabase } from '@/lib/supabase/client';

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function LogoutButton({ className, children }: LogoutButtonProps) {
  async function handleLogout() {
    // Sign out on the client side (clears cookies + localStorage)
    await supabase.auth.signOut();
    // Replace so Back doesn't return to protected route → login redirect loop
    window.location.replace('/');
  }

  return (
    <button onClick={handleLogout} className={className}>
      {children ?? 'Logout'}
    </button>
  );
}
