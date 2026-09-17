'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Button } from '@/components/common/Button';
import { ChevronDown } from '@/components/common/NavigationIcons';
import { siteConfig } from '@/config/site';
import { mainNav, legalNav } from '@/config/navigation';
import { menuItem, menuPanel, overlayBackdrop } from '@/lib/animations/transitions';
import { SERVICES } from '@/lib/constants';
import { useSmoothScroll } from './SmoothScrollProvider';
import { cn } from '@/lib/utils';

export interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Full-screen mobile navigation.
 *
 * Accessibility work here is the point:
 *  - focus moves into the panel on open and back to the trigger on close
 *  - Tab is trapped inside the panel while it is open
 *  - Escape closes it
 *  - background scroll is locked, including Lenis
 *  - `aria-modal` and `role="dialog"` tell assistive tech the rest is inert
 */
export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [servicesOpen, setServicesOpen] = useState(pathname.startsWith('/services'));
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const { stop, start } = useSmoothScroll();

  // Close on route change — the panel would otherwise stay open over the new page.
  useEffect(() => {
    if (open) onClose();
    if (pathname.startsWith('/services')) setServicesOpen(true);
    // Intentionally keyed on pathname only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement;

    document.body.dataset.scrollLocked = 'true';
    stop();

    // Move focus into the panel so the next Tab lands on the first link.
    const focusTimer = window.setTimeout(() => {
      const first = panelRef.current?.querySelector<HTMLElement>('a[href], button:not([disabled])');
      first?.focus();
    }, 120);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      // Focus trap: wrap from last to first and back again.
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', onKeyDown);
      delete document.body.dataset.scrollLocked;
      start();
      previouslyFocused.current?.focus();
    };
  }, [open, onClose, stop, start]);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 901px)');
    const closeOnDesktop = () => {
      if (query.matches && open) onClose();
    };
    query.addEventListener('change', closeOnDesktop);
    return () => query.removeEventListener('change', closeOnDesktop);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            variants={overlayBackdrop}
            initial={reduce ? false : 'hidden'}
            animate="visible"
            exit={reduce ? undefined : 'exit'}
            className="fixed inset-0 z-menu bg-ink-950/45 backdrop-blur-sm lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            ref={panelRef}
            variants={menuPanel}
            initial={reduce ? false : 'hidden'}
            animate="visible"
            exit={reduce ? undefined : 'exit'}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="fixed inset-0 z-menu flex flex-col bg-surface-base lg:hidden"
          >
            <div className="flex items-center justify-between px-gutter py-5">
              <span className="font-display text-body-lg font-semibold tracking-[0.22em] text-content-accent">
                DICKALO
              </span>
              <button
                type="button"
                onClick={onClose}
                className="-mr-2 grid h-11 w-11 place-items-center rounded-sm text-content-primary transition-colors hover:text-content-accent"
              >
                <span className="sr-only">Close menu</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
            </div>

            <nav
              className="flex-1 overflow-y-auto px-gutter py-6"
              data-lenis-prevent
              aria-label="Main"
              onClick={(event) => {
                if ((event.target as HTMLElement).closest('a')) onClose();
              }}
            >
              <ul className="flex flex-col">
                <li className="border-b border-line">
                  <Link href="/" onClick={onClose} className="block py-5 text-display-sm">
                    Home
                  </Link>
                </li>
                {mainNav.map((link, index) => {
                  const active = pathname === link.href || pathname?.startsWith(`${link.href}/`);
                  const isServices = link.href === '/services';

                  return (
                    <motion.li
                      key={link.href}
                      custom={index}
                      variants={menuItem}
                      initial={reduce ? false : 'hidden'}
                      animate="visible"
                      exit={reduce ? undefined : 'exit'}
                      className="border-b border-line"
                    >
                      <div className="flex items-stretch gap-2">
                        <Link
                          href={link.href}
                          onClick={onClose}
                          className="group flex min-w-0 flex-1 items-baseline justify-between gap-4 py-5"
                          aria-current={active ? 'page' : undefined}
                        >
                          <span className="flex min-w-0 flex-col gap-1">
                            <span
                              className={cn(
                                'font-display text-display-sm transition-colors',
                                active
                                  ? 'text-content-accent'
                                  : 'text-content-primary group-hover:text-content-accent',
                              )}
                            >
                              {link.label}
                            </span>
                            {link.description ? (
                              <span className="text-body-sm text-content-muted">
                                {link.description}
                              </span>
                            ) : null}
                          </span>
                          {!isServices ? (
                            <span className="numeric shrink-0 pt-2 text-caption text-content-accent/60">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                          ) : null}
                        </Link>

                        {isServices ? (
                          <button
                            type="button"
                            className="grid w-12 shrink-0 place-items-center text-content-primary"
                            aria-label="Show service pages"
                            aria-expanded={servicesOpen}
                            aria-controls="mobile-service-links"
                            onClick={() => setServicesOpen((current) => !current)}
                          >
                            <span
                              className={cn(
                                'transition-transform duration-300 ease-expo',
                                servicesOpen && 'rotate-180',
                              )}
                            >
                              <ChevronDown />
                            </span>
                          </button>
                        ) : null}
                      </div>

                      {isServices ? (
                        <AnimatePresence initial={false}>
                          {servicesOpen ? (
                            <motion.div
                              id="mobile-service-links"
                              initial={reduce ? false : { height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={reduce ? undefined : { height: 0, opacity: 0 }}
                              transition={{ duration: reduce ? 0 : 0.32, ease: [0.16, 1, 0.3, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="grid gap-1 pb-5 pl-4">
                                <Link
                                  href="/services"
                                  onClick={onClose}
                                  className="py-2 text-body-sm font-medium text-content-accent"
                                >
                                  View all services
                                </Link>
                                {SERVICES.map((service) => (
                                  <Link
                                    key={service.slug}
                                    href={`/services/${service.slug}`}
                                    onClick={onClose}
                                    className="border-l border-line py-2 pl-4 text-body-sm text-content-secondary transition-colors hover:border-content-accent hover:text-content-accent"
                                  >
                                    {service.title}
                                  </Link>
                                ))}
                                <Link
                                  href="/contact"
                                  onClick={onClose}
                                  className="brand-button mt-3 flex min-h-11 items-center justify-between px-4 text-body-sm"
                                >
                                  Discuss your project
                                  <ArrowRight />
                                </Link>
                              </div>
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      ) : null}
                    </motion.li>
                  );
                })}
              </ul>

              <motion.div
                custom={mainNav.length}
                variants={menuItem}
                initial={reduce ? false : 'hidden'}
                animate="visible"
                exit={reduce ? undefined : 'exit'}
                className="pt-10"
              >
                <Button href="/contact" size="lg" fullWidth iconRight={<ArrowRight />}>
                  Start a project
                </Button>
              </motion.div>
            </nav>

            <motion.div
              custom={mainNav.length + 1}
              variants={menuItem}
              initial={reduce ? false : 'hidden'}
              animate="visible"
              exit={reduce ? undefined : 'exit'}
              className="border-t border-line px-gutter py-6"
            >
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="link-underline text-body-md text-content-primary"
              >
                {siteConfig.contact.email}
              </a>
              <a
                href={`tel:${siteConfig.contact.phoneRaw}`}
                className="mt-1 block text-body-md text-content-muted"
              >
                {siteConfig.contact.phone}
              </a>

              <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                {siteConfig.socials.map((social) => (
                  <li key={social.name}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-caption uppercase tracking-[0.14em] text-content-muted transition-colors hover:text-content-accent"
                    >
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>

              <ul className="mt-5 flex gap-5">
                {legalNav.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className="text-caption text-content-faint transition-colors hover:text-content-secondary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
