'use client';

import { LocaleProvider } from '@/lib/i18n/config';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <LocaleProvider>{children}</LocaleProvider>;
}
