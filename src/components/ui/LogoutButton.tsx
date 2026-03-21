'use client';

import { useRouter } from 'next/navigation';
import { logout } from '@/app/auth/actions';

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function LogoutButton({ className, children }: LogoutButtonProps) {
  const router = useRouter();

  async function handleLogout() {
    const result = await logout();
    router.push(result.redirectTo);
    router.refresh();
  }

  return (
    <button onClick={handleLogout} className={className}>
      {children ?? 'Logout'}
    </button>
  );
}
