'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Locale } from '@/lib/locale.ts';
import { legacyTarget } from '@/content/pages.ts';

/**
 * Las anclas de la landing única (`/en#experience`) ya no existen en Home: el servidor no ve el fragmento,
 * así que solo el cliente puede llevar a la página y sección que ahora contienen ese contenido.
 * `replace` no deja una entrada extra en el historial y no pasa por el telón de página.
 */
const LegacyAnchors = ({ lang }: { lang: Locale }) => {
  const router = useRouter();

  useEffect(() => {
    const go = () => {
      const target = legacyTarget(lang, window.location.hash);
      if (target) router.replace(target);
    };
    go();
    window.addEventListener('hashchange', go);
    return () => window.removeEventListener('hashchange', go);
  }, [lang, router]);

  return null;
};

export default LegacyAnchors;
