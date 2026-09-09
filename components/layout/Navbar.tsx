'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BrandMark } from '@/components/common/BrandMark';
import { ChevronDown, ArrowUpRight } from '@/components/common/NavigationIcons';
import { mainNav } from '@/config/navigation';
import { SERVICES } from '@/lib/constants';
import { MobileMenu } from './MobileMenu';
import { ScrollProgress } from './ScrollProgress';

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);
  const header = useRef<HTMLElement>(null);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 48);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    setDropdown(null);
  }, [pathname]);
  useEffect(() => {
    if (!dropdown) return;
    const outside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setDropdown(null);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [dropdown]);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <header
        ref={header}
        className={`site-header ${pathname === '/' && !scrolled ? 'header-over-hero' : 'header-glass'}`}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && dropdown) {
            header.current
              ?.querySelector<HTMLButtonElement>(`[data-dropdown="${dropdown}"]`)
              ?.focus();
            setDropdown(null);
          }
        }}
      >
        <ScrollProgress />
        <div className="nav-inner">
          <Link href="/" className="brand-lockup" aria-label="DICKALO homepage">
            <BrandMark />
            <span>
              <strong>
                DICKALO<span className="brand-period">.</span>
              </strong>
              <small>Architecture & construction</small>
            </span>
          </Link>
          <nav className="desktop-nav" aria-label="Main">
            <Link href="/" aria-current={pathname === '/' ? 'page' : undefined}>
              Home
            </Link>
            {mainNav.map((link) => {
              const children =
                link.href === '/services'
                  ? SERVICES.map((service) => ({
                      label: service.title,
                      href: `/services#${service.slug}`,
                    }))
                  : link.children;
              return (
                <div
                  key={link.href}
                  className="nav-item"
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget))
                      setDropdown((current) => (current === link.label ? null : current));
                  }}
                >
                  <Link
                    href={link.href}
                    aria-current={
                      pathname === link.href || pathname.startsWith(`${link.href}/`)
                        ? 'page'
                        : undefined
                    }
                  >
                    {link.label === 'About' ? 'The studio' : link.label}
                  </Link>
                  {children && (
                    <>
                      <button
                        type="button"
                        className="nav-disclosure"
                        data-dropdown={link.label}
                        aria-label={`Show ${link.label.toLowerCase()} navigation`}
                        aria-expanded={dropdown === link.label}
                        aria-controls={`nav-${link.label}`}
                        onClick={() => setDropdown(dropdown === link.label ? null : link.label)}
                      >
                        <ChevronDown />
                      </button>
                      <div
                        id={`nav-${link.label}`}
                        className="nav-dropdown"
                        hidden={dropdown !== link.label}
                      >
                        <span className="micro-label">Explore {link.label.toLowerCase()}</span>
                        {children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setDropdown(null)}
                          >
                            {child.label}
                            <ArrowUpRight />
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </nav>
          <button
            type="button"
            className="mobile-menu-trigger"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-haspopup="dialog"
          >
            <span />
            <span />
          </button>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={closeMenu} />
    </>
  );
}
