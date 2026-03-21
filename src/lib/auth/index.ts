/**
 * Auth exports - CLIENT-SIDE ONLY
 * 
 * For server-side utilities, import directly from:
 *   - @/lib/auth/server.ts (for server components/actions)
 *   - @/lib/auth/context.tsx (for auth context & hooks)
 */

// Client-side context and hooks
export { AuthProvider, useAuth, type UserRole } from './context';
