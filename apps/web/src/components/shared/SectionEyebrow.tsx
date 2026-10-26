interface SectionEyebrowProps {
  children: string;
}

/** Etiqueta mono en mayúsculas — ver `.label-mono` en index.css. */
export default function SectionEyebrow({ children }: SectionEyebrowProps) {
  return <p className="label-mono">{children}</p>;
}
