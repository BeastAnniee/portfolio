import { Github, Linkedin, ArrowUpRight } from 'lucide-react';
import SignatureBadge from './SignatureBadge';
import CopyEmailButton from './CopyEmailButton';
import DuoImage from './DuoImage';
import { badgeBox } from '@/lib/badge-geometry.ts';
import type { Dictionary } from '@/content/types.ts';

interface HeroProps {
  name: string;
  email: string;
  github: string;
  linkedin: string;
  hero: Dictionary['hero'];
  common: Dictionary['common'];
}

const socialClass =
  'press flex h-11 w-11 items-center justify-center rounded-xl border border-line text-bone hover:bg-bone hover:text-carbon';

const Hero = ({ name, email, github, linkedin, hero, common }: HeroProps) => {
  const socialLinks = [
    { name: hero.github, href: github, icon: Github },
    { name: hero.linkedin, href: linkedin, icon: Linkedin },
  ];
  const words = name.split(' ');
  // El sello cuelga a medias del borde inferior de la foto: se reserva la mitad de su caja.
  const badge = badgeBox(Array.from(hero.badge).length);

  return (
    <section id="hero" className="py-6">
      <div data-hero-frame className="@container overflow-x-clip rounded-2xl border border-line">
        <p className="px-4 pt-5 pb-2 font-mono text-xs uppercase tracking-[0.12em] text-bone-2 @2xl:px-6">
          {hero.greeting}
        </p>

        {/* Nombre a escala de cartel: cada palabra sube desde su máscara; `cqi` se mide contra el marco. */}
        <h1 className="px-[1cqi] font-display text-[38cqi] uppercase leading-[0.86] whitespace-nowrap text-bone @2xl:text-[13cqi]">
          {words.map((word, i) => (
            <span key={word}>
              {i > 0 && ' '}
              <span className="mask block @2xl:inline-block @2xl:align-top">
                <span className="rise" style={{ '--i': i } as React.CSSProperties}>
                  {word}
                </span>
              </span>
            </span>
          ))}
        </h1>

        <div className="rule-x h-px" aria-hidden="true" />

        <div className="grid grid-cols-1 gap-6 p-4 @2xl:grid-cols-12 @2xl:gap-8 @2xl:p-6">
          <div className="flex min-w-0 flex-col gap-6 @2xl:col-span-7 @2xl:row-start-1">
            <p className="text-xl font-semibold leading-snug text-accent">
              {hero.title} <span className="block @2xl:inline">{hero.qualifier}</span>
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#projects"
                className="press inline-flex h-12 items-center gap-2 rounded-xl border border-transparent bg-accent px-6 font-semibold text-carbon hover:bg-bone"
              >
                {hero.cta}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>

              <div className="flex items-center gap-2">
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
            </div>

            <p className="max-w-[65ch] text-base text-bone">{hero.summary}</p>
          </div>

          <div
            className="relative @2xl:col-span-5 @2xl:col-start-8 @2xl:row-start-1"
            style={{ marginBottom: badge / 2 }}
          >
            <DuoImage
              src="/profile.jpg"
              alt={hero.photoAlt}
              sizes="(min-width: 1024px) 480px, (min-width: 720px) 40vw, 100vw"
              className="aspect-[3/2] rounded-xl @2xl:aspect-[4/5]"
              objectPosition="50% 46%"
              priority
            />
            <div className="absolute" style={{ right: 8, bottom: -badge / 2 }}>
              <SignatureBadge text={hero.badge} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
