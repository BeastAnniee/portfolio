interface MarqueeProps {
  items: readonly string[];
  label: string;
}

// La cinta se detiene con el cursor encima o el foco dentro (el grupo es enfocable: el teclado la pausa con Tab) y no anima donde no hay hover (`hover: none`); sin JS ni estado.
const Marquee = ({ items, label }: MarqueeProps) => {
  const list = (copy: boolean) => (
    <ul
      className={`marquee-list flex shrink-0 items-center${copy ? ' marquee-copy' : ''}`}
      aria-hidden={copy ? true : undefined}
    >
      {items.map((item) => (
        <li
          key={item}
          className="flex items-center whitespace-nowrap font-mono text-xs uppercase tracking-[0.12em] text-bone"
        >
          {item}
          <span aria-hidden="true" className="px-4 text-bone-2">
            ·
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <div
        role="group"
        aria-label={label}
        tabIndex={0}
        className="marquee rule-x my-6 flex min-h-12 w-full items-center overflow-hidden"
      >
        <div className="marquee-track items-center">
          {list(false)}
          {list(true)}
        </div>
      </div>
      <noscript>
        <style>{'.marquee-track{animation:none;flex-wrap:wrap;width:auto}.marquee-list{flex-wrap:wrap;flex-shrink:1;min-width:0}.marquee-list li{white-space:normal}.marquee-copy{display:none}'}</style>
      </noscript>
    </>
  );
};

export default Marquee;
