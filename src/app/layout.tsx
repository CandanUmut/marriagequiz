import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hayirlisi - Research-Backed Marriage Compatibility',
  description:
    'A research-backed tool to help you understand yourself before one of life\'s most important decisions. Free, private, open-source.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
