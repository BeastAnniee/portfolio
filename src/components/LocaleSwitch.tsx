'use client';

import type { Locale } from '@/lib/locale.ts';
import { LOCALES, switchLocaleHref } from '@/lib/locale.ts';
import type { Dictionary } from '@/content/types.ts';

interface LocaleSwitchProps {
  locale: Locale;
  labels: Dictionary['nav']['language'];
}

const optionClass =
  'inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border px-3 font-mono text-xs font-medium uppercase tracking-[0.12em]';

const LocaleSwitch = ({ locale, labels }: LocaleSwitchProps) => (
  <div role="group" aria-label={labels.label} className="flex items-center gap-1">
    {LOCALES.map((code) => {
      const name = labels[code];
      if (code === locale) {
        return (
          <span
            key={code}
            lang={code}
            aria-current="true"
            className={`${optionClass} border-accent bg-accent text-carbon underline underline-offset-4`}
          >
            <span aria-hidden="true">{code.toUpperCase()}</span>
            <span className="sr-only">{`${name} (${labels.current})`}</span>
          </span>
        );
      }
      return (
        <a
          key={code}
          href={`/${code}`}
          hrefLang={code}
          lang={code}
          aria-label={name}
          onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
            event.preventDefault();
            window.location.assign(switchLocaleHref(locale, window.location.hash));
          }}
          className={`${optionClass} border-line text-bone hover:bg-bone hover:text-carbon`}
        >
          {code.toUpperCase()}
        </a>
      );
    })}
  </div>
);

export default LocaleSwitch;
