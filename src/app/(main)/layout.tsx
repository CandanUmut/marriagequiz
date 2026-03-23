import Providers from '../providers';
import AppShell from '@/components/layout/AppShell';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <AppShell>{children}</AppShell>
    </Providers>
  );
}
