import { Cpu } from 'lucide-react';
import TiltSurface from './TiltSurface';

export default function TechSculpture({ compact = false }: { compact?: boolean }) {
  return (
    <TiltSurface className={`tech-sculpture ${compact ? 'sculpture-compact' : ''}`} strength={18}>
      <div className="sculpture-scene" aria-hidden="true">
        <div className="sculpture-orbit orbit-one" />
        <div className="sculpture-orbit orbit-two" />
        <div className="sculpture-orbit orbit-three" />
        <div className="sculpture-assembly">
          <div className="circuit-platform">
            <svg viewBox="0 0 300 300" fill="none">
              {[45, 85, 125, 175, 215, 255].map((n, i) => (
                <g key={n}>
                  <path
                    d={`M${n} 0 V${75 + i * 10} L150 150 L${300 - n} ${225 - i * 10} V300`}
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                  <circle cx={n} cy={75 + i * 10} r="3" fill="currentColor" />
                </g>
              ))}
            </svg>
          </div>
          <div className="chip-cube">
            {['front', 'back', 'right', 'left', 'top', 'bottom'].map((face) => (
              <div key={face} className={`chip-face chip-${face}`}>
                <Cpu size={48} strokeWidth={0.8} />
                <span>ISC</span>
              </div>
            ))}
          </div>
          <div className="circuit-platform platform-bottom" />
        </div>
        <span className="sculpture-node node-one" />
        <span className="sculpture-node node-two" />
        <span className="sculpture-node node-three" />
        <span className="sculpture-label">IDEAS EN EJECUCIÓN_</span>
      </div>
    </TiltSurface>
  );
}
