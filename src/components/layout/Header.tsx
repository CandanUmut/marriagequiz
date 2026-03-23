'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from '@/lib/i18n/config';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import ThemeToggle from '@/components/layout/ThemeToggle';
import { Heart, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const navLinks = [
  { href: '/', labelKey: null, inlineLabel: 'Home' },
  { href: '/quiz', labelKey: 'startQuiz' as const },
  { href: '/results', labelKey: 'viewResults' as const },
  { href: '/compare', labelKey: 'compare' as const },
  { href: '/about', labelKey: 'about' as const },
] as const;

export default function Header() {
  const t = useTranslations();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Focus the first link when the menu opens
  useEffect(() => {
    if (mobileMenuOpen) {
      // Small delay to let the animation start and the element to mount
      requestAnimationFrame(() => {
        firstLinkRef.current?.focus();
      });
    }
  }, [mobileMenuOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMobileMenu();
        hamburgerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen, closeMobileMenu]);

  function handleLinkClick() {
    closeMobileMenu();
    // Return focus to hamburger after close
    hamburgerRef.current?.focus();
  }

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-sand-950/80 backdrop-blur-md border-b border-sand-100 dark:border-sand-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <Heart size={18} className="text-white fill-white" />
            </div>
            <span className="font-serif text-xl font-bold text-primary-800 dark:text-primary-300 group-hover:text-primary-600 transition-colors">
              {t.common.appName}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.slice(1).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  isActive(link.href)
                    ? 'text-primary-600 dark:text-primary-400 font-medium'
                    : 'text-sand-600 dark:text-sand-400 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
              >
                {link.labelKey ? t.common[link.labelKey] : ''}
              </Link>
            ))}
          </nav>

          {/* Controls - always visible */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />

            {/* Mobile hamburger button */}
            <button
              ref={hamburgerRef}
              type="button"
              className="md:hidden p-2 rounded-lg text-sand-600 dark:text-sand-400 hover:bg-sand-100 dark:hover:bg-sand-800 transition-colors"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer - rendered outside header to avoid backdrop-blur stacking context */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              className="fixed inset-0 z-50 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                closeMobileMenu();
                hamburgerRef.current?.focus();
              }}
              aria-hidden="true"
            />

            {/* Slide-in drawer */}
            <motion.div
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-white dark:bg-sand-950 shadow-2xl flex flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-4 h-16 border-b border-sand-100 dark:border-sand-800">
                <span className="font-serif text-lg font-bold text-primary-800 dark:text-primary-300">
                  {t.common.appName}
                </span>
                <button
                  type="button"
                  className="p-2 rounded-lg text-sand-600 dark:text-sand-400 hover:bg-sand-100 dark:hover:bg-sand-800 transition-colors"
                  onClick={() => {
                    closeMobileMenu();
                    hamburgerRef.current?.focus();
                  }}
                  aria-label={t.common.close}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex-1 overflow-y-auto py-4 px-2">
                {navLinks.map((link, index) => (
                  <Link
                    key={link.href}
                    ref={index === 0 ? firstLinkRef : undefined}
                    href={link.href}
                    onClick={handleLinkClick}
                    className={`block px-4 py-3 rounded-lg text-base transition-colors ${
                      isActive(link.href)
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                        : 'text-sand-700 dark:text-sand-300 hover:bg-sand-50 dark:hover:bg-sand-900'
                    }`}
                  >
                    {link.labelKey ? t.common[link.labelKey] : link.inlineLabel}
                  </Link>
                ))}
              </nav>

              {/* Controls at the bottom of drawer */}
              <div className="border-t border-sand-100 dark:border-sand-800 px-4 py-4 flex items-center gap-3">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
