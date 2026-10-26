import { dscPath, dscViewBox } from './dscMark';

export default function CareerLogo({
  className = '',
  decorative = false,
}: {
  className?: string;
  decorative?: boolean;
}) {
  return (
    <svg
      className={`career-logo ${className}`}
      viewBox={dscViewBox}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : 'Ingeniería en Sistemas Computacionales — logo DSC'}
      aria-hidden={decorative || undefined}
    >
      <path d={dscPath} fill="currentColor" fillRule="evenodd" />
      <path
        className="logo-trace"
        d={dscPath}
        fill="none"
        stroke="currentColor"
        strokeWidth=".9"
        strokeDasharray="18 180"
        strokeLinejoin="round"
      />
    </svg>
  );
}
