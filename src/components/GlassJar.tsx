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
    <div className="jar-outer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '16px' }}>
      {/* Chibi face floating above lid */}
      <div 
        style={{ 
          color: fillColor, 
          fontFamily: "'Press Start 2P', monospace", 
          fontSize: '18px', 
          marginBottom: '12px',
          userSelect: 'none'
        }}
      >
        ({chibi})
      </div>

      {/* Physical Glass Jar */}
      <div className="jar-lid" />
      <div className="jar-neck" />
      <div className="jar-body">
        {/* Liquid fill inside glass */}
        <div className="jar-fill" style={{ height: `${pct}%`, backgroundColor: fillColor }}>
          <div className="jar-coins" />
        </div>

        {/* Text Label on the Glass Jar */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px',
            textAlign: 'center',
            pointerEvents: 'none'
          }}
        >
          <span 
            style={{ 
              fontFamily: "'Press Start 2P', monospace", 
              fontSize: '11px', 
              color: '#FFFFFF', 
              textShadow: '0 2px 4px rgba(0,0,0,0.95)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '8px'
            }}
          >
            {jar.name}
          </span>
          
          <span 
            style={{ 
              fontFamily: "'Press Start 2P', monospace", 
              fontSize: '15px', 
              fontWeight: 900,
              color: '#FFFFFF', 
              textShadow: '0 2px 6px rgba(0,0,0,0.95)'
            }}
          >
            {fmt(remaining)}
          </span>

          <span 
            style={{ 
              fontFamily: "'Pixelify Sans', 'VT323', monospace", 
              fontSize: '13px', 
              color: 'rgba(255,255,255,0.7)', 
              textShadow: '0 1px 3px rgba(0,0,0,0.9)',
              marginTop: '4px'
            }}
          >
            de {fmt(jar.allocatedBudget)}
          </span>
        </div>
      </div>

      {/* Button directly under the jar */}
      <button
        onClick={() => { soundFX.playClick(); onDeductClick(jar); }}
        className="btn-pixel"
        style={{
          backgroundColor: '#EF4444',
          color: '#FFFFFF',
          padding: '10px 20px',
          borderRadius: '12px',
          marginTop: '20px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11px'
        }}
      >
        <Minus size={14} strokeWidth={3} />
        <span>- ANOTAR GASTO</span>
      </button>
    </div>
  );
};
