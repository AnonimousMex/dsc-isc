interface SectionEyebrowProps {
  children: string;
  tone?: 'light' | 'dark';
}

export default function SectionEyebrow({ children, tone = 'dark' }: SectionEyebrowProps) {
  return (
    <p
      className={`font-mono text-xs font-medium uppercase tracking-[0.2em] ${
        tone === 'light' ? 'text-signal' : 'text-accent'
      }`}
    >
      {children}
    </p>
  );
}
