'use client';

import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import type { Locale } from '@/lib/locale.ts';
import type { Dictionary, SectionId } from '@/content/types.ts';
import LocaleSwitch from './LocaleSwitch';

interface HeaderProps {
  locale: Locale;
  nav: Dictionary['nav'];
  brand: string;
  cvHref: string;
  sections: readonly SectionId[];
}

const linkClass =
  'inline-flex min-h-11 items-center rounded-full px-3 text-sm font-medium text-bento-graphite transition-colors duration-200 hover:text-bento-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bento-purple focus-visible:ring-offset-2 focus-visible:ring-offset-bento-container';

const cvClass =
  'inline-flex min-h-11 items-center rounded-full bg-bento-purple px-4 text-sm font-semibold text-bento-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bento-black focus-visible:ring-offset-2 focus-visible:ring-offset-bento-container';

const Header = ({ locale, nav, brand, cvHref, sections }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  const links = sections.filter((id) => id !== 'hero');
  const close = () => setOpen(false);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-black/5 backdrop-blur-md transition-colors duration-300 ${
        isScrolled ? 'bg-bento-container/95 shadow-sm' : 'bg-bento-container/80'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-10">
        <a
          href="#hero"
          className="min-w-0 truncate rounded-full font-display text-base font-extrabold tracking-tight text-bento-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bento-purple focus-visible:ring-offset-2 focus-visible:ring-offset-bento-container sm:text-lg"
        >
          {brand}
          <span className="text-bento-purple">.</span>
        </a>

        <nav aria-label={nav.menuLabel} className="hidden items-center gap-1 xl:flex">
          {links.map((id) => (
            <a key={id} href={`#${id}`} className={linkClass}>
              {nav.sections[id]}
            </a>
          ))}
          <a href={cvHref} target="_blank" rel="noopener noreferrer" className={cvClass}>
            {nav.cv}
          </a>
          <LocaleSwitch locale={locale} labels={nav.language} />
        </nav>

        <button
          ref={buttonRef}
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? nav.menuClose : nav.menuOpen}
          onClick={() => setOpen((value) => !value)}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-bento-page text-bento-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bento-purple focus-visible:ring-offset-2 focus-visible:ring-offset-bento-container xl:hidden"
        >
          {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      <nav
        id="mobile-menu"
        aria-label={nav.menuLabel}
        hidden={!open}
        className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-black/5 bg-bento-container px-4 py-3 sm:px-6 xl:hidden"
      >
        <ul className="flex flex-col gap-1">
          {links.map((id) => (
            <li key={id}>
              <a href={`#${id}`} onClick={close} className={`${linkClass} w-full`}>
                {nav.sections[id]}
              </a>
            </li>
          ))}
          <li>
            <a
              href={cvHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
              className={`${cvClass} w-full justify-center`}
            >
              {nav.cv}
            </a>
          </li>
          <li className="pt-1">
            <LocaleSwitch locale={locale} labels={nav.language} />
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
