'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import type { Locale } from '@/lib/locale.ts';
import type { Dictionary } from '@/content/types.ts';
import { pagePath } from '@/content/pages.ts';
import LocaleSwitch from './LocaleSwitch';

interface HeaderProps {
  locale: Locale;
  nav: Dictionary['nav'];
  brand: string;
  cvHref: string;
}

const linkClass =
  'inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg px-3 font-mono text-xs font-medium uppercase tracking-[0.12em] text-bone hover:bg-bone hover:text-carbon aria-[current=page]:bg-bone aria-[current=page]:text-carbon';

const cvClass =
  'inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-transparent bg-accent px-4 font-mono text-xs font-medium uppercase tracking-[0.12em] text-carbon hover:bg-bone';

const PAGE_LINKS = ['work', 'about'] as const;

const Header = ({ locale, nav, brand, cvHref }: HeaderProps) => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const current = pathname.replace(/\/+$/, '');
  const homePath = pagePath(locale, 'home');
  const onWork = current === pagePath(locale, 'work');

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const close = () => setOpen(false);
  const pageLinks = PAGE_LINKS.map((page) => ({ page, href: pagePath(locale, page), label: nav.pages[page] }));
  // Contacto es un destino, no una página: en Trabajo (sin bloque de contacto) cruza a Home.
  const contactLink = (className: string) =>
    onWork ? (
      <Link href={`${homePath}#contact`} onClick={close} className={className}>
        {nav.contact}
      </Link>
    ) : (
      <a href="#contact" onClick={close} className={className}>
        {nav.contact}
      </a>
    );

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-carbon">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-10">
        <Link
          href={homePath}
          aria-current={current === homePath ? 'page' : undefined}
          className="inline-flex min-h-11 min-w-0 items-center truncate rounded-lg font-display text-xl uppercase tracking-wide text-bone"
        >
          {brand}
          <span className="text-accent">.</span>
        </Link>

        <nav aria-label={nav.menuLabel} className="hidden items-center gap-1 md:flex">
          {pageLinks.map(({ page, href, label }) => (
            <Link key={page} href={href} aria-current={current === href ? 'page' : undefined} className={linkClass}>
              {label}
            </Link>
          ))}
          {contactLink(linkClass)}
          <a href={cvHref} target="_blank" rel="noopener noreferrer" className={cvClass}>
            {nav.cv}
          </a>
          <LocaleSwitch locale={locale} labels={nav.language} />
        </nav>

        <button
          ref={buttonRef}
          type="button"
          id="menu-button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? nav.menuClose : nav.menuOpen}
          onClick={() => setOpen((value) => !value)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-line text-bone hover:bg-bone hover:text-carbon md:hidden"
        >
          {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      <nav
        id="mobile-menu"
        aria-label={nav.menuLabel}
        className={`${open ? '' : 'hidden '}max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-carbon px-4 py-3 sm:px-6 md:hidden`}
      >
        <ul className="flex flex-col gap-1">
          {pageLinks.map(({ page, href, label }) => (
            <li key={page}>
              <Link
                href={href}
                onClick={close}
                aria-current={current === href ? 'page' : undefined}
                className={`${linkClass} w-full justify-start`}
              >
                {label}
              </Link>
            </li>
          ))}
          <li>{contactLink(`${linkClass} w-full justify-start`)}</li>
          <li>
            <a
              href={cvHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
              className={`${cvClass} w-full`}
            >
              {nav.cv}
            </a>
          </li>
          <li className="pt-1">
            <LocaleSwitch locale={locale} labels={nav.language} />
          </li>
        </ul>
      </nav>
      <noscript>
        <style>{'@media(max-width:767px){#mobile-menu{display:block}#menu-button{display:none}}'}</style>
      </noscript>
    </header>
  );
};

export default Header;
