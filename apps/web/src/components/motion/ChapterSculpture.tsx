import TiltSurface from './TiltSurface';
export type ChapterKind =
  | 'history'
  | 'systems'
  | 'faculty'
  | 'community'
  | 'specialties'
  | 'news'
  | 'resources'
  | 'graduates';
export default function ChapterSculpture({ kind }: { kind: ChapterKind }) {
  return (
    <TiltSurface className={`chapter-sculpture chapter-${kind}`} strength={10}>
      <div className="chapter-object" aria-hidden="true">
        {kind === 'history' && (
          <div className="history-helix">
            {Array.from({ length: 11 }, (_, i) => (
              <span key={i} style={{ top: `${12 + i * 7}%`, transform: `rotateY(${i * 28}deg)` }}>
                <i />
                <b />
                <i />
              </span>
            ))}
          </div>
        )}
        {kind === 'systems' && (
          <div className="systems-layers">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} style={{ transform: `translateZ(${i * 28}px)` }}>
                <span>{['DATOS', 'REDES', 'HARDWARE', 'SOFTWARE', 'SISTEMAS'][i]}</span>
                <i />
                <i />
                <i />
              </div>
            ))}
          </div>
        )}
        {kind === 'faculty' && (
          <svg viewBox="0 0 300 300" className="faculty-constellation" fill="none">
            {[
              [150, 55],
              [60, 115],
              [240, 115],
              [90, 225],
              [210, 225],
              [150, 150],
            ].map(([x, y], i) => (
              <g key={i}>
                <path d={`M150 150L${x} ${y}`} stroke="currentColor" />
                <circle cx={x} cy={y} r={i === 5 ? 25 : 14} stroke="currentColor" />
                <circle cx={x} cy={y} r="4" fill="currentColor" />
              </g>
            ))}
            <circle cx="150" cy="150" r="110" stroke="currentColor" strokeDasharray="3 16" />
          </svg>
        )}
        {kind === 'community' && (
          <div className="community-rings">
            <i />
            <i />
            <i />
            <span />
            <span />
            <span />
          </div>
        )}
        {kind === 'specialties' && (
          <svg viewBox="0 0 300 300" className="specialty-branches" fill="none">
            <path
              d="M150 270V150M150 150L65 65M150 150L235 65M150 150V30"
              stroke="currentColor"
              strokeWidth="2"
            />
            {[
              [150, 270],
              [65, 65],
              [235, 65],
              [150, 30],
            ].map(([x, y]) => (
              <g key={x + '-' + y}>
                <rect x={x - 12} y={y - 12} width="24" height="24" stroke="currentColor" />
                <circle cx={x} cy={y} r="4" fill="currentColor" />
              </g>
            ))}
            <circle cx="150" cy="150" r="32" stroke="currentColor" />
          </svg>
        )}
        {kind === 'news' && (
          <div className="news-waves">
            <span />
            <span />
            <span />
            <span />
            <i />
          </div>
        )}
        {kind === 'resources' && (
          <div className="resource-sheets">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{ transform: `translate3d(${i * 22}px,${i * -18}px,${i * 20}px)` }}
              >
                <i />
                <i />
                <i />
                <span />
              </div>
            ))}
          </div>
        )}
        {kind === 'graduates' && (
          <div className="graduate-path">
            <svg viewBox="0 0 300 300" fill="none">
              <path d="M30 240H90V180H150V120H210V60H270" stroke="currentColor" strokeWidth="2" />
              {[
                [30, 240],
                [90, 180],
                [150, 120],
                [210, 60],
              ].map(([x, y]) => (
                <circle key={x} cx={x} cy={y} r="8" fill="currentColor" />
              ))}
              <path d="M240 30H270V60" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
        )}
      </div>
    </TiltSurface>
  );
}
export function chapterFor(eyebrow: string): ChapterKind {
  const text = eyebrow.toLocaleLowerCase('es');
  if (text.includes('conócenos') || text.includes('nosotros')) return 'history';
  if (text.includes('carrera') || text.includes('oferta')) return 'systems';
  if (text.includes('docente')) return 'faculty';
  if (text.includes('especial')) return 'specialties';
  if (text.includes('noticia')) return 'news';
  if (text.includes('normateca')) return 'resources';
  if (text.includes('egresado')) return 'graduates';
  return 'community';
}
