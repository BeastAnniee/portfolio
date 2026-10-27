const SectionHeading = ({ id, children }: { id: string; children: React.ReactNode }) => (
  <h2
    id={id}
    className="mb-6 inline-flex items-center rounded-full bg-bento-page px-4 py-1.5 text-sm font-semibold text-bento-black"
  >
    {children}
  </h2>
);

export default SectionHeading;
