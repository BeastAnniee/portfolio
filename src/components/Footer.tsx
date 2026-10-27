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
  'flex h-11 w-11 items-center justify-center rounded-full bg-bento-page text-bento-black transition-colors hover:bg-bento-mint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bento-purple focus-visible:ring-offset-2 focus-visible:ring-offset-bento-container';

const Footer = ({ email, github, linkedin, hero, common, footer }: FooterProps) => {
  const socialLinks = [
    { name: hero.github, url: github, icon: Github },
    { name: hero.linkedin, url: linkedin, icon: Linkedin },
  ];

  return (
    <footer className="px-4 py-10 sm:px-6 lg:px-10">
      <div className="flex flex-col items-center gap-6">
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
                <Icon className="h-4 w-4" aria-hidden="true" />
              </a>
            );
          })}
          <CopyEmailButton email={email} label={common.copyEmail} copiedText={common.emailCopied} />
        </div>

        <p className="text-sm text-bento-graphite">{footer.builtBy}</p>
      </div>
    </footer>
  );
};

export default Footer;
