import Link from 'next/link';
import NextImage from 'next/image';
import { Container } from '@/components/common/Container';
import { BrandMark } from '@/components/common/BrandMark';
import { ArrowUpRight } from '@/components/common/NavigationIcons';
import { footerNav, legalNav } from '@/config/navigation';
import { siteConfig } from '@/config/site';

function SocialIcon({ name }: { name: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      {name === 'Instagram' ? (
        <>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </>
      ) : name === 'LinkedIn' ? (
        <>
          <rect x="3" y="3" width="18" height="18" rx="1" />
          <path d="M7.5 10v7.5M11.5 17.5V10m0 3.5c0-4.5 5-4.5 5 0v4" />
          <circle cx="7.5" cy="7" r="1" fill="currentColor" stroke="none" />
        </>
      ) : name === 'YouTube' ? (
        <>
          <rect x="2" y="5" width="20" height="14" rx="4" />
          <path d="m10 9 5 3-5 3Z" fill="currentColor" stroke="none" />
        </>
      ) : (
        <>
          <path d="M3 5h5a3 3 0 0 1 0 6H3m0-6v14h5a4 4 0 0 0 0-8M16 6h5M14 14h8c0-6-8-6-8 0s6 6 8 3" />
        </>
      )}
    </svg>
  );
}

export function Footer() {
  const columns = [...footerNav, { title: 'Legal', links: legalNav }];
  return (
    <footer className="architecture-footer">
      <Container>
        <div className="footer-directory">
          <div className="footer-brand">
            <Link href="/" className="brand-lockup" aria-label="DICKALO homepage">
              <BrandMark />
              <strong>
                DICKALO<span className="brand-period">.</span>
              </strong>
            </Link>
            <p>
              Thoughtfully designed.
              <br />
              Beautifully built. Made for life.
            </p>
            <a className="footer-contact-link" href={`mailto:${siteConfig.contact.email}`}>
              {siteConfig.contact.email}
              <ArrowUpRight />
            </a>
            <a className="footer-phone" href={`tel:${siteConfig.contact.phoneRaw}`}>
              {siteConfig.contact.phone}
            </a>
            <div className="footer-socials" aria-label="Follow DICKALO">
              {siteConfig.socials.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${social.label} (opens in a new tab)`}
                  title={social.label}
                >
                  <SocialIcon name={social.name} />
                </a>
              ))}
            </div>
          </div>
          <nav aria-label="Footer" className="footer-nav">
            {columns.map((column) => (
              <div key={column.title}>
                <h3>{column.title}</h3>
                <ul>
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className="footer-colophon">
          <p>
            Lagos <span /> Abuja <span /> Port Harcourt
          </p>
          <p>© {new Date().getFullYear()} DICKALO</p>
        </div>
      </Container>
      <div className="footer-landscape">
        <NextImage
          className="footer-landscape-background"
          src="/images/generated/nigerian-garden-sky.webp"
          alt="Modern Nigerian garden-home concept with cream stone, shaded balconies, lush green lawns and flowering tropical plants beneath a bright blue sky"
          fill
          sizes="100vw"
          quality={90}
        />
        <div className="footer-landscape-fade" aria-hidden="true" />
        <div className="footer-wordmark" aria-hidden="true">
          DICKALO<span>.</span>
        </div>
        <NextImage
          className="footer-landscape-building"
          src="/images/generated/nigerian-garden-sky.webp"
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          quality={90}
        />
        <div className="footer-landscape-note">
          <p>
            Rooted in place.
            <br />
            Built for possibility.
          </p>
          <span className="micro-label">Architecture. Construction. Life.</span>
        </div>
      </div>
    </footer>
  );
}
