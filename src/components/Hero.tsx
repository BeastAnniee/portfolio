import Link from 'next/link';
import { ArrowDown, ArrowUpRight, Github, Linkedin } from 'lucide-react';
import SignatureBadge from './SignatureBadge';
import CopyEmailButton from './CopyEmailButton';
import DuoImage from './DuoImage';
import { Checker, Parallax, Star4 } from './Ornaments';
import { badgeBox } from '@/lib/badge-geometry.ts';
import { splitLetters } from '@/lib/letters.ts';
import type { Dictionary } from '@/content/types.ts';

interface HeroProps {
  name: string;
  email: string;
  github: string;
  linkedin: string;
  hero: Dictionary['hero'];
  common: Dictionary['common'];
  /** Texto de la pegatina que enlaza a #contact. */
  sticker: string;
  /** Destino del CTA: la página de Trabajo del idioma actual. */
  ctaHref: string;
}

const socialClass =
  'press flex h-11 w-11 items-center justify-center rounded-xl border border-line text-bone hover:bg-bone hover:text-carbon';

const Hero = ({ name, email, github, linkedin, hero, common, sticker, ctaHref }: HeroProps) => {
  const socialLinks = [
    { name: hero.github, href: github, icon: Github },
    { name: hero.linkedin, href: linkedin, icon: Linkedin },
  ];
  const words = splitLetters(name);
  const lastWord = words.length - 1;
  // El sello cuelga a medias del borde de la foto: en móvil se reserva la mitad de su caja.
  const badge = badgeBox(Array.from(hero.badge).length);

  return (
    <section id="hero" className="hero-screen relative flex overflow-x-clip">
      <div className="mx-auto flex w-full max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="hero-grid w-full min-w-0">
          <p className="ha-greet self-center font-mono text-xs uppercase tracking-[0.12em] text-bone-2">
            {hero.greeting}
          </p>

          {/* Nombre a escala de cartel, una palabra por línea. Los lectores reciben el nombre una vez (sr-only);
              las letras visibles suben desde su máscara. */}
          <h1 className="hero-name ha-name font-display uppercase leading-[0.86] whitespace-nowrap text-bone">
            <span className="sr-only">{name}</span>
            <span aria-hidden="true">
              {words.map((letters, i) => (
                <span key={letters.map((l) => l.char).join('')} className="flex items-center">
                  <span className="mask block">
                    {letters.map((letter) => (
                      <span key={letter.index} className="rise" style={{ '--i': letter.index } as React.CSSProperties}>
                        {letter.char}
                      </span>
                    ))}
                  </span>
                  {i === lastWord && (
                    <span className="ml-[0.08em] block h-[0.5em] w-[0.5em] shrink-0 text-accent [&>svg]:h-full [&>svg]:w-full">
                      <Star4 size={48} />
                    </span>
                  )}
                </span>
              ))}
            </span>
          </h1>

          {/* Pegatina: enlace real a Contacto (va justo tras el h1 en el orden de foco); el envoltorio recibe la entrada */}
          <div data-enter className="ha-pin self-center justify-self-end">
            <a
              href="#contact"
              className="sticker inline-flex h-12 items-center gap-2 rounded-lg border border-transparent bg-accent px-4 font-mono text-xs uppercase tracking-[0.12em] text-carbon hover:bg-bone"
            >
              {sticker}
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <p data-enter className="ha-role text-xl font-semibold leading-snug text-accent">
            {hero.title} <span className="block min-[42rem]:inline">{hero.qualifier}</span>
          </p>

          <div data-enter className="ha-cta">
            <Link
              href={ctaHref}
              className="press inline-flex h-12 items-center gap-2 rounded-xl border border-transparent bg-accent px-6 font-semibold text-carbon hover:bg-bone"
            >
              {hero.cta}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div
            data-hero-photo
            className="ha-photo relative -mx-4 mb-[var(--badge-half)] min-h-[30svh] sm:-mx-6 min-[42rem]:mx-0 min-[42rem]:mb-0 min-[42rem]:min-h-0"
            style={{ '--badge-half': `${badge / 2}px` } as React.CSSProperties}
          >
            <div className="absolute inset-0">
              <DuoImage
                src="/profile.jpg"
                alt={hero.photoAlt}
                sizes="(min-width: 42rem) 42vw, 100vw"
                className="h-full w-full"
                objectPosition="50% 46%"
                priority
                dots
                fixed
              />
            </div>
            <div
              className="tex tex-dots-bone hidden min-[42rem]:block"
              style={{ right: 'auto', width: 32 }}
              aria-hidden="true"
            />
            <Parallax d={16} className="absolute left-3 top-3 text-bone min-[42rem]:left-12">
              <Checker size={72} />
            </Parallax>
            <div data-enter data-badge-wrap className="absolute right-2 bottom-[calc(var(--badge-half)*-1)] min-[42rem]:right-auto min-[42rem]:bottom-[12%] min-[42rem]:left-0 min-[42rem]:-translate-x-1/2">
              <SignatureBadge text={hero.badge} />
            </div>
          </div>

          <div data-enter className="ha-icons flex items-center gap-2">
            {socialLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.name}
                  className={socialClass}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </a>
              );
            })}
            <CopyEmailButton email={email} label={common.copyEmail} copiedText={common.emailCopied} />
          </div>

          <p data-enter className="ha-summary max-w-[65ch] text-base text-bone">
            {hero.summary}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
