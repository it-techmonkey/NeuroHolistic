// Plain server layout — middleware.ts handles all authentication and role-based
// redirects for /dashboard routes. No client-side auth check needed here.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
