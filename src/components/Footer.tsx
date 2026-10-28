import { Github, Linkedin } from 'lucide-react';
import CopyEmailButton from './CopyEmailButton';
import type { Dictionary } from '@/content/types.ts';

interface FooterProps {
  email: string;
  github: string;
  linkedin: string;
  hero: Dictionary['hero'];
  common: Dictionary['common'];
  footer: Dictionary['footer'];
}

const linkClass =
  'press flex h-11 w-11 items-center justify-center rounded-xl border border-line text-bone hover:bg-bone hover:text-carbon';

const Footer = ({ email, github, linkedin, hero, common, footer }: FooterProps) => {
  const socialLinks = [
    { name: hero.github, url: github, icon: Github },
    { name: hero.linkedin, url: linkedin, icon: Linkedin },
  ];

  return (
    <footer className="mx-auto mt-16 w-full max-w-7xl border-t border-line px-4 py-10 sm:px-6 lg:px-10">
      <div className="flex flex-col items-start gap-6">
        <div className="flex items-center gap-3">
          {socialLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.name}
                className={linkClass}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </a>
            );
          })}
          <CopyEmailButton email={email} label={common.copyEmail} copiedText={common.emailCopied} />
        </div>

        <p className="font-mono text-xs uppercase tracking-[0.12em] text-bone-2">{footer.builtBy}</p>
      </div>
    </footer>
  );
};

export default Footer;
