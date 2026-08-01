import React from 'react';
import type { Jar } from '../types';
import { Minus } from 'lucide-react';
import { soundFX } from '../utils/audio';

interface GlassJarProps {
  jar: Jar;
  spentAmount: number;
  onDeductClick: (jar: Jar) => void;
}

export const GlassJar: React.FC<GlassJarProps> = ({ jar, spentAmount, onDeductClick }) => {
  const remaining = Math.max(0, jar.allocatedBudget - spentAmount);
  const pct = jar.allocatedBudget > 0
    ? Math.max(0, Math.min(100, (remaining / jar.allocatedBudget) * 100))
    : 0;

  // Color based on how full the jar is
  let fillColor = '#10B981';
  let chibi = '◠‿◠';
  if (pct < 20) {
    fillColor = '#EF4444';
    chibi = '> ﹏ <';
  } else if (pct < 50) {
    fillColor = '#F59E0B';
    chibi = '• ɷ •';
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="jar-outer">
      {/* Chibi face */}
      <div className="mb-3 font-pixel text-lg select-none" style={{ color: fillColor }}>
        ({chibi})
      </div>

      {/* Physical Jar */}
      <div className="jar-lid" />
      <div className="jar-neck" />
      <div className="jar-body">
        {/* Liquid fill */}
        <div className="jar-fill" style={{ height: `${pct}%`, backgroundColor: fillColor }}>
          <div className="jar-coins" />
        </div>

        {/* Label centered on the jar */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-3 text-center pointer-events-none">
          <span className="font-pixel text-[0.55rem] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-wide uppercase mb-2">
            {jar.name}
          </span>
          <span className="font-pixel text-base text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] leading-tight">
            {fmt(remaining)}
          </span>
          <span className="font-body text-xs text-white/60 mt-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
            de {fmt(jar.allocatedBudget)}
          </span>
        </div>
      </div>

      {/* Deduct button directly below jar */}
      <button
        onClick={() => { soundFX.playClick(); onDeductClick(jar); }}
        className="btn-pixel bg-red-600 text-white px-5 py-2.5 rounded-xl mt-5 flex items-center gap-2"
      >
        <Minus size={14} strokeWidth={3} />
        <span>Gasto</span>
      </button>
    </div>
  );
};
