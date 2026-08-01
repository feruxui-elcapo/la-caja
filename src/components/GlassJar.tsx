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

  // Chibi expression based on coins remaining
  let chibi = '◠‿◠';
  let chibiColor = '#F59E0B'; // Gold
  if (pct < 20) {
    chibi = '> ﹏ <';
    chibiColor = '#EF4444'; // Red
  } else if (pct < 50) {
    chibi = '• ɷ •';
    chibiColor = '#FBBF24'; // Yellow
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="jar-outer-compact">
      {/* Chibi Expression */}
      <div 
        style={{ 
          fontFamily: "'Press Start 2P', monospace", 
          fontSize: '13px', 
          color: chibiColor, 
          marginBottom: '8px',
          userSelect: 'none'
        }}
      >
        ({chibi})
      </div>

      {/* Glass Jar Body with Stacked Gold Coins */}
      <div className="jar-lid-compact" />
      <div className="jar-neck-compact" />
      <div className="jar-body-compact">
        {/* Stacked Gold Coins Fill */}
        <div className="jar-coins-fill" style={{ height: `${pct}%` }}>
          <div className="jar-coins-texture" />
          {/* Animated 8-bit Coin Particles */}
          {pct > 5 && (
            <div 
              style={{
                position: 'absolute',
                top: '4px',
                left: 0,
                right: 0,
                display: 'flex',
                justify.content: 'space-around',
                fontSize: '10px',
                pointerEvents: 'none',
                opacity: 0.9
              }}
            >
              🪙 🪙
            </div>
          )}
        </div>

        {/* Jar Label Text */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            textAlign: 'center',
            pointerEvents: 'none'
          }}
        >
          <span 
            style={{ 
              fontFamily: "'Press Start 2P', monospace", 
              fontSize: '9px', 
              color: '#FFFFFF', 
              textShadow: '0 2px 4px rgba(0,0,0,0.95)',
              textTransform: 'uppercase',
              marginBottom: '6px'
            }}
          >
            {jar.name}
          </span>
          
          <span 
            style={{ 
              fontFamily: "'Press Start 2P', monospace", 
              fontSize: '12px', 
              fontWeight: 900,
              color: '#FEF08A', 
              textShadow: '0 2px 6px rgba(0,0,0,0.95)'
            }}
          >
            {fmt(remaining)}
          </span>

          <span 
            style={{ 
              fontFamily: "'Pixelify Sans', 'VT323', monospace", 
              fontSize: '11px', 
              color: 'rgba(255,255,255,0.75)', 
              textShadow: '0 1px 3px rgba(0,0,0,0.9)',
              marginTop: '2px'
            }}
          >
            de {fmt(jar.allocatedBudget)}
          </span>
        </div>
      </div>

      {/* Deduct Button */}
      <button
        onClick={() => { soundFX.playClick(); onDeductClick(jar); }}
        className="btn-pixel"
        style={{
          backgroundColor: '#EF4444',
          color: '#FFFFFF',
          padding: '8px 14px',
          borderRadius: '10px',
          marginTop: '12px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '10px',
          width: '100%',
          justifyContent: 'center'
        }}
      >
        <Minus size={12} strokeWidth={3} />
        <span>GASTO</span>
      </button>
    </div>
  );
};
