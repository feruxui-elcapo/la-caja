import React from 'react';
import type { Jar } from '../types';
import { Minus, Coffee, Heart, Package } from 'lucide-react';
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

  // Chibi expression based on coins remaining
  let chibi = '◠‿◠';
  let chibiColor = 'text-amber-400 bg-amber-400/10 border-amber-400/30';
  if (pct < 20) {
    chibi = '> ﹏ <';
    chibiColor = 'text-red-400 bg-red-400/10 border-red-400/30';
  } else if (pct < 50) {
    chibi = '• ɷ •';
    chibiColor = 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

  const getIcon = () => {
    if (jar.name.toLowerCase().includes('salida')) return <Coffee size={14} className="text-amber-300" />;
    if (jar.name.toLowerCase().includes('salud')) return <Heart size={14} className="text-emerald-300" />;
    return <Package size={14} className="text-blue-300" />;
  };

  return (
    <div className="jar-outer-compact">
      {/* Chibi Expression Badge */}
      <div 
        className={`font-pixel text-[13px] font-bold px-3 py-1 rounded-full border mb-3 shadow-sm transition-all duration-300 ${chibiColor}`}
      >
        ({chibi})
      </div>

      {/* Glass Jar Container */}
      <div className="jar-lid-compact" />
      <div className="jar-neck-compact" />
      <div className="jar-body-compact">
        {/* Coins Fill */}
        <div className="jar-coins-fill" style={{ height: `${pct}%` }}>
          <div className="jar-coins-texture" />
          {pct > 8 && (
            <div 
              style={{
                position: 'absolute',
                top: '6px',
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'space-around',
                fontSize: '11px',
                pointerEvents: 'none',
                opacity: 0.9,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))'
              }}
            >
              🪙 🪙
            </div>
          )}
        </div>

        {/* Jar Content Overlay */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px',
            textAlign: 'center',
            pointerEvents: 'none'
          }}
        >
          <div className="flex items-center gap-1.5 mb-1 bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10">
            {getIcon()}
            <span 
              className="font-sans font-bold text-[11px] text-white tracking-wide uppercase"
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}
            >
              {jar.name}
            </span>
          </div>
          
          <span 
            className="font-sans font-extrabold text-base text-yellow-200 mt-1"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.95)' }}
          >
            {fmt(remaining)}
          </span>

          <span 
            className="font-sans text-[11px] text-white/70 mt-0.5"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
          >
            de {fmt(jar.allocatedBudget)}
          </span>
        </div>
      </div>

      {/* Deduct Button */}
      <button
        onClick={() => { soundFX.playClick(); onDeductClick(jar); }}
        className="w-full mt-4 py-3 px-3 rounded-2xl font-sans font-bold text-xs text-white bg-gradient-to-r from-red-500 via-rose-600 to-red-600 hover:from-red-400 hover:to-rose-500 shadow-[0_4px_16px_rgba(239,68,68,0.35)] transition-all scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5"
      >
        <Minus size={14} strokeWidth={3} />
        <span>- GASTO</span>
      </button>
    </div>
  );
};
